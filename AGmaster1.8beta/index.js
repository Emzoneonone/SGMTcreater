/**
 * Host half of the ComfyUI panel bundle.
 *
 * Owns the ComfyUI process, the model folders, the downloads that fill them,
 * and every generation job. The Client half only renders; every mutation goes
 * through these routes so the panel and the agent see the same state.
 */
import { execFile, spawn } from 'node:child_process'
import { createReadStream, createWriteStream, existsSync } from 'node:fs'
import { copyFile, mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BUILTIN_TIPS, QUICK_START } from './help.js'
import { ALIASES, CATEGORIES, CHECKPOINT_NOTES, HANDDRAWN_RECIPES, LORA_NOTES, MOE_RECIPES, MOE_STYLE_RECIPES, NEGATIVES, PASTEL_RECIPES, RECIPES, STYLES, TEMPLATES, ZH_HINTS } from './prompts.js'

// This panel lives beside the ComfyUI install it manages, so resolve the root
// from the package location instead of pinning an absolute workspace path.
const DEFAULTS = {
  comfyRoot: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'comfy'),
  saveDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'comfy_out'),
  port: 8188,
  host: '127.0.0.1',
  jobTimeoutMs: 20 * 60 * 1000,
  // This ComfyUI build's DynamicVRAM (aimdo) path crashes with an access
  // violation as soon as a LoRA patch is applied, so the managed server runs
  // with estimate-based loading. Set false in the row config to re-enable it.
  disableDynamicVram: true,
  // External-generation bridge: a local Chromium driven over CDP.
  extUrl: 'https://www.krene.com/design/dashboard/home',
  extPort: 9333,
  extWaitMs: 30000,
}

/** Model folders the panel lists and fills, keyed by kind. */
const MODEL_KINDS = {
  checkpoints: { dir: 'checkpoints', label: 'checkpoints' },
  controlnet: { dir: 'controlnet', label: 'controlnet' },
  loras: { dir: 'loras', label: 'loras' },
  vae: { dir: 'vae', label: 'vae' },
  upscale_models: { dir: 'upscale_models', label: 'upscale_models' },
}

/** Live downloads, keyed by id: { id, url, kind, filename, received, total, state, error }. */
const downloads = new Map()
let downloadSeq = 0

/** Generation jobs, newest first, keyed by id. */
const jobs = new Map()
let jobSeq = 0

/** The one managed ComfyUI process this plugin owns. */
let child = null
let lastSpawnAt = 0

/** Parsed panel state; null until loaded from disk. */
let panelState = null

/** Append-only log of the server this plugin spawned, and how it last exited. */
let serverLog = null
let lastExit = null

/** ComfyUI progress websocket, connected lazily on the first generation. */
let socket = null
let socketTarget = ''

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.psd': 'image/vnd.adobe.photoshop',
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(body)
}

async function readBody(req, limit = 1 << 20) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw new Error('body too large')
    chunks.push(chunk)
  }
  if (size === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/** Resolve and confine a client-supplied path under one allowed root. */
function within(root, candidate) {
  const resolved = path.resolve(root, candidate)
  const base = path.resolve(root)
  if (resolved !== base && !resolved.startsWith(base + path.sep)) return null
  return resolved
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function clampInt(value, min, max, fallback) {
  const number = Math.round(Number(value))
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, number))
}

function clampFloat(value, min, max, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, number))
}

function stateFile(settings) {
  return path.join(settings.comfyRoot, '.comfy-panel', 'state.json')
}

async function loadState(settings) {
  if (panelState) return panelState
  let saved = {}
  try {
    saved = JSON.parse(await readFile(stateFile(settings), 'utf8'))
  } catch {
    saved = {}
  }
  panelState = {
    settings: saved && typeof saved.settings === 'object' && saved.settings ? saved.settings : {},
    favorites: Array.isArray(saved?.favorites) ? saved.favorites.slice(0, 200) : [],
    images: Array.isArray(saved?.images) ? saved.images.slice(0, 200) : [],
    styles: Array.isArray(saved?.styles) ? saved.styles.slice(0, 100) : [],
    styleGroups: Array.isArray(saved?.styleGroups) ? saved.styleGroups.slice(0, 60) : [],
    styleAssign: saved && typeof saved.styleAssign === 'object' && saved.styleAssign ? saved.styleAssign : {},
    styleHidden: Array.isArray(saved?.styleHidden) ? saved.styleHidden.slice(0, 200) : [],
    styleEdits: saved && typeof saved.styleEdits === 'object' && saved.styleEdits ? saved.styleEdits : {},
    styleGroupLabels: saved && typeof saved.styleGroupLabels === 'object' && saved.styleGroupLabels ? saved.styleGroupLabels : {},
    customStyles: Array.isArray(saved?.customStyles) ? saved.customStyles.slice(0, 200) : [],
    tips: Array.isArray(saved?.tips) ? saved.tips.slice(0, 300) : [],
    quickCards: Array.isArray(saved?.quickCards) ? saved.quickCards.slice(0, 60) : [],
    quickHidden: Array.isArray(saved?.quickHidden) ? saved.quickHidden.slice(0, 100) : [],
    presets: Array.isArray(saved?.presets) ? saved.presets.slice(0, 200) : [],
    presetHidden: Array.isArray(saved?.presetHidden) ? saved.presetHidden.slice(0, 200) : [],
    bigjpg: saved && typeof saved.bigjpg === 'object' && saved.bigjpg ? saved.bigjpg : {},
    history: Array.isArray(saved?.history) ? saved.history.slice(0, 40) : [],
  }
  return panelState
}

async function saveState(settings) {
  const file = stateFile(settings)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(panelState, null, 2), 'utf8')
}

async function probe(port, host) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 1500)
  try {
    const res = await fetch(`http://${host}:${port}/system_stats`, { signal: controller.signal })
    if (!res.ok) return { up: false }
    const stats = await res.json()
    const device = stats?.devices?.[0] ?? {}
    return {
      up: true,
      version: stats?.system?.comfyui_version ?? null,
      python: stats?.system?.python_version ?? null,
      device: device.name ?? null,
      vramTotal: device.vram_total ?? null,
      vramFree: device.vram_free ?? null,
    }
  } catch {
    return { up: false }
  } finally {
    clearTimeout(timer)
  }
}

/** One JSON/text call against the live ComfyUI server. */
async function comfy(settings, route, init = {}, timeout = 30000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(`http://${settings.host}:${settings.port}${route}`, {
      ...init,
      signal: controller.signal,
    })
    const text = await res.text()
    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text
    }
    if (!res.ok) {
      const detail = data && typeof data === 'object' ? data.error?.message || data.error || '' : String(data).slice(0, 300)
      throw new Error(`ComfyUI ${route} → HTTP ${res.status}${detail ? `: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}` : ''}`)
    }
    return data
  } finally {
    clearTimeout(timer)
  }
}

/** The panel job currently bound to one ComfyUI prompt id. */
function jobByPromptId(promptId) {
  for (const job of jobs.values()) {
    if (job.promptId === promptId) return job
  }
  return null
}

/**
 * Follow ComfyUI's progress channel so the panel can draw a real progress bar.
 * Binary preview frames and unknown message types are ignored; when the runtime
 * has no WebSocket the panel simply falls back to the elapsed-time display.
 */
function ensureSocket(settings) {
  const target = `ws://${settings.host}:${settings.port}/ws?clientId=dsh-comfy-panel`
  if (socket && socket.readyState === 1 && socketTarget === target) return socket
  if (typeof WebSocket === 'undefined') return null
  try {
    if (socket) socket.close()
  } catch { /* already closed */ }
  try {
    socket = new WebSocket(target)
  } catch {
    socket = null
    return null
  }
  socketTarget = target
  socket.onmessage = (event) => {
    if (typeof event.data !== 'string') return
    let message = null
    try {
      message = JSON.parse(event.data)
    } catch {
      return
    }
    const promptId = message?.data?.prompt_id
    const job = promptId ? jobByPromptId(promptId) : [...jobs.values()].find((entry) => entry.state === 'running')
    if (!job) return
    if (message.type === 'progress') {
      job.progress = { value: Number(message.data.value) || 0, max: Number(message.data.max) || 0 }
    } else if (message.type === 'executing' && message.data.node === null) {
      job.progress = { value: 1, max: 1 }
    }
  }
  socket.onclose = () => {
    socket = null
    socketTarget = ''
  }
  socket.onerror = () => {
    try {
      socket?.close()
    } catch { /* already closed */ }
  }
  return socket
}

async function listFolder(root) {
  try {
    const names = await readdir(root, { withFileTypes: true })
    const files = []
    for (const entry of names) {
      if (!entry.isFile()) continue
      if (entry.name.startsWith('put_')) continue
      const info = await stat(path.join(root, entry.name))
      files.push({ name: entry.name, bytes: info.size, mtime: info.mtimeMs })
    }
    return files.sort((a, b) => b.mtime - a.mtime)
  } catch {
    return []
  }
}

/** PIDs listening on a TCP port, via netstat, for servers this plugin did not spawn. */
async function pidsOnPort(port) {
  return new Promise((resolve) => {
    execFile('netstat.exe', ['-ano', '-p', 'tcp'], { windowsHide: true }, (error, stdout) => {
      if (error) return resolve([])
      const pids = new Set()
      for (const line of stdout.split(/\r?\n/)) {
        if (!line.includes(`:${port}`) || !/LISTENING/i.test(line)) continue
        const pid = Number(line.trim().split(/\s+/).pop())
        if (Number.isInteger(pid) && pid > 0) pids.add(pid)
      }
      resolve([...pids])
    })
  })
}

async function startServer(settings) {
  if (child && !child.killed) return { ok: true, already: true }
  const live = await probe(settings.port, settings.host)
  if (live.up) return { ok: true, already: true, external: true }
  const python = path.join(settings.comfyRoot, 'py', 'python.exe')
  const main = path.join(settings.comfyRoot, 'ComfyUI', 'main.py')
  const cwd = path.join(settings.comfyRoot, 'ComfyUI')
  try {
    await stat(python)
    await stat(main)
  } catch {
    return { ok: false, error: `ComfyUI not found under ${settings.comfyRoot}` }
  }

  // Keep the server's own output: a crash after startup is otherwise invisible,
  // and start-up failures are the most common reason the panel cannot generate.
  const logFile = path.join(settings.comfyRoot, '.comfy-panel', 'comfyui.log')
  await mkdir(path.dirname(logFile), { recursive: true })
  serverLog = createWriteStream(logFile, { flags: 'a' })
  serverLog.write(`\n=== start ${new Date().toISOString()} ===\n`)

  const args = [main, '--listen', settings.host, '--port', String(settings.port), '--preview-method', 'none', '--disable-auto-launch']
  if (settings.disableDynamicVram) args.push('--disable-dynamic-vram')

  child = spawn(
    python,
    args,
    { cwd, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, detached: false },
  )
  child.stdout?.pipe(serverLog, { end: false })
  child.stderr?.pipe(serverLog, { end: false })
  lastSpawnAt = Date.now()
  lastExit = null
  child.on('exit', (code, signal) => {
    lastExit = { code, signal, at: Date.now() }
    if (serverLog) {
      serverLog.write(`=== exit code=${code} signal=${signal} at ${new Date().toISOString()} ===\n`)
      serverLog.end()
      serverLog = null
    }
    child = null
  })
  child.on('error', (error) => {
    lastExit = { code: null, signal: null, at: Date.now(), error: String(error?.message ?? error) }
    child = null
  })
  return { ok: true, pid: child.pid }
}

async function stopServer(settings) {
  if (child && !child.killed) {
    try {
      child.kill()
    } catch (error) {
      return { ok: false, error: String(error?.message ?? error) }
    }
    child = null
    return { ok: true }
  }
  // The server may have been started elsewhere; own it by its listening port.
  const pids = await pidsOnPort(settings.port)
  if (pids.length === 0) return { ok: true, already: true }
  for (const pid of pids) {
    await new Promise((resolve) => {
      execFile('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { windowsHide: true }, () => resolve())
    })
  }
  return { ok: true, killed: pids }
}

async function startDownload(settings, { url, kind, filename }) {
  const entry = MODEL_KINDS[kind]
  if (!entry) return { ok: false, error: `unknown model kind: ${kind}` }
  let target = ''
  try {
    target = decodeURIComponent(new URL(url).pathname).split('/').pop() ?? ''
  } catch {
    return { ok: false, error: 'invalid URL' }
  }
  const name = (filename && filename.trim()) || target
  if (!/\.(safetensors|ckpt|pt|pth|bin|gguf)$/i.test(name)) {
    return { ok: false, error: 'filename must end in .safetensors/.ckpt/.pt/.pth/.bin/.gguf' }
  }
  const dir = path.join(settings.comfyRoot, 'ComfyUI', 'models', entry.dir)
  await mkdir(dir, { recursive: true })
  const dest = within(dir, name)
  if (!dest) return { ok: false, error: 'refusing to write outside the model folder' }

  const id = `dl-${++downloadSeq}`
  const job = { id, url, kind, filename: name, received: 0, total: 0, state: 'running', error: null }
  downloads.set(id, job)

  void (async () => {
    try {
      const res = await fetch(url, { redirect: 'follow' })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
      job.total = Number(res.headers.get('content-length') ?? 0)
      const sink = createWriteStream(dest)
      for await (const chunk of res.body) {
        job.received += chunk.length
        if (!sink.write(chunk)) {
          await new Promise((resolve) => sink.once('drain', resolve))
        }
      }
      await new Promise((resolve, reject) => {
        sink.end(() => resolve())
        sink.on('error', reject)
      })
      job.state = 'done'
      job.total = job.total || job.received
    } catch (error) {
      job.state = 'failed'
      job.error = String(error?.message ?? error)
      await unlink(dest).catch(() => {})
    }
  })()

  return { ok: true, id }
}

/** Sources the discover tab can search, with the default base of each. */
const DISCOVER_SOURCES = {
  'hf-mirror': 'https://hf-mirror.com',
  huggingface: 'https://huggingface.co',
  civitai: 'https://civitai.com',
}

const DISCOVER_TTL = 5 * 60 * 1000

/** Recent discover responses, keyed by source, base, kind and query. */
const discoverCache = new Map()

/** Fetch JSON with a timeout and a plain user agent; some mirrors reject bare requests. */
async function fetchJson(requestUrl, timeout = 20000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(requestUrl, {
      signal: controller.signal,
      headers: { accept: 'application/json', 'user-agent': 'dsh-comfy-panel/2.3' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

/** Accept only an http(s) origin, so a search cannot be pointed at a local file. */
function safeBase(value, fallback) {
  try {
    const parsed = new URL(String(value || fallback))
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return fallback
    return parsed.origin
  } catch {
    return fallback
  }
}

/**
 * Search a HuggingFace-compatible mirror. The search endpoint omits file
 * sizes, so each candidate repo gets one detail call; repos without a usable
 * single file are dropped rather than shown with a zero-byte download.
 */
async function searchHuggingFace(base, query, kind) {
  const search = new URLSearchParams({ search: query, limit: '16', sort: 'downloads', direction: '-1' })
  const list = await fetchJson(`${base}/api/models?${search}`)
  const repos = (Array.isArray(list) ? list : []).slice(0, 12)

  // The mirror throttles parallel calls, so fetch details in small batches and
  // retry once; a dropped detail would silently hide a usable result.
  const fetchDetail = async (repo) => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await fetchJson(`${base}/api/models/${repo.id}?blobs=true`, 15000)
      } catch {
        await delay(500)
      }
    }
    return null
  }
  const details = []
  for (let index = 0; index < repos.length; index += 4) {
    const chunk = await Promise.all(repos.slice(index, index + 4).map((repo) => fetchDetail(repo)))
    details.push(...chunk)
  }

  const items = []
  for (const detail of details) {
    if (!detail || !detail.id) continue

    // Only surface repositories whose declared base is an SDXL-family model:
    // Flux/LTX/Z-Image LoRAs would load but change nothing in this stack.
    const baseText = []
      .concat((detail.tags || []).map((tag) => String(tag).toLowerCase()).filter((tag) => tag.startsWith('base_model:')))
      .concat(detail.cardData?.base_model ? [String(detail.cardData.base_model).toLowerCase()] : [])
      .join(' ')
    const haystack = `${String(detail.id).toLowerCase()} ${baseText}`
    // A repo that also targets Flux/Z-Image/Chroma ships weights this stack
    // cannot patch safely; mixing architectures has crashed the server before.
    if (/(flux|z-image|z_image|chroma|ltx|wan[-_]?\d|qwen|sd3|stable-diffusion-3|hunyuan|cosmos|mochi|pixart|kolors|hidream|lumina|sana)/.test(haystack)) continue
    if (!/sdxl|stable-diffusion-xl|illustrious|noobai|animagine|pony|juggernaut|realvis/.test(haystack)) continue

    const files = (detail.siblings || [])
      .map((file) => ({
        path: String(file.rfilename || ''),
        name: path.basename(String(file.rfilename || '')),
        bytes: Number(file.size) || 0,
      }))
      .filter((file) => /\.safetensors$/i.test(file.path) && file.bytes > 0)
      .filter((file) => !/diffusion_pytorch_model\.safetensors$/i.test(file.path))
      .filter((file) => (kind === 'lora'
        ? file.bytes >= 3 * 1024 * 1024 && file.bytes <= 900 * 1024 * 1024 && !file.path.includes('/')
        // A checkpoint must be a root-level single file; diffusers subfolders
        // hold unet/text-encoder fragments that ComfyUI cannot load as one.
        : file.bytes >= 1.2 * 1024 ** 3 && !file.path.includes('/')))
      .slice(0, 3)
    if (files.length === 0) continue
    items.push({
      id: `hf:${detail.id}`,
      source: 'hf',
      name: String(detail.id),
      author: String(detail.id).split('/')[0],
      baseModel: baseText.replace('base_model:', '').split(' ')[0] || '',
      downloads: Number(detail.downloads) || 0,
      pageUrl: `${base}/${detail.id}`,
      thumbnail: '',
      files: files.map((file) => ({
        name: file.name,
        bytes: file.bytes,
        url: `${base}/${detail.id}/resolve/main/${file.path}`,
      })),
    })
  }
  return items.sort((a, b) => b.downloads - a.downloads)
}

/** Search Civitai and keep the SDXL-family results the local stack can run. */
async function searchCivitai(base, query, kind) {
  const type = kind === 'lora' ? 'LORA' : 'Checkpoint'
  const search = new URLSearchParams({ query, types: type, limit: '24', nsfw: 'false' })
  const data = await fetchJson(`${base}/api/v1/models?${search}`)
  const items = []
  for (const model of data.items || []) {
    const version = model.modelVersions?.[0]
    if (!version) continue
    const files = (version.files || [])
      .filter((file) => /\.(safetensors|ckpt)$/i.test(String(file.name || '')) && file.downloadUrl)
      .map((file) => ({
        name: path.basename(String(file.name)),
        bytes: Math.round((Number(file.sizeKB) || 0) * 1024),
        url: String(file.downloadUrl),
      }))
      .slice(0, 2)
    if (files.length === 0) continue
    items.push({
      id: `civitai:${model.id}`,
      source: 'civitai',
      name: String(model.name || ''),
      author: model.creator?.username ? String(model.creator.username) : '',
      baseModel: String(version.baseModel || ''),
      downloads: Number(model.stats?.downloadCount) || 0,
      pageUrl: `${base}/models/${model.id}`,
      thumbnail: version.images?.[0]?.url ? String(version.images[0].url) : '',
      files,
    })
  }
  const preferred = items.filter((item) => /SDXL|Illustrious|NoobAI|Pony/i.test(item.baseModel))
  return (preferred.length ? preferred : items).slice(0, 20)
}

/** Read the sampler and scheduler names the live server actually accepts. */async function samplerOptions(settings) {
  const fallback = {
    samplers: ['euler', 'euler_ancestral', 'dpmpp_2m', 'dpmpp_2m_sde', 'dpmpp_3m_sde', 'dpmpp_sde', 'deis', 'uni_pc'],
    schedulers: ['normal', 'karras', 'exponential', 'sgm_uniform', 'simple', 'ddim_uniform', 'beta'],
  }
  try {
    const info = await comfy(settings, '/object_info/KSampler', {}, 5000)
    const required = info?.KSampler?.input?.required ?? {}
    return {
      samplers: Array.isArray(required.sampler_name?.[0]) ? required.sampler_name[0] : fallback.samplers,
      schedulers: Array.isArray(required.scheduler?.[0]) ? required.scheduler[0] : fallback.schedulers,
    }
  } catch {
    return fallback
  }
}

/** Normalize one generation request into the values the graph builder reads. */
/** Max characters of tags a single style entry may hold. */
const STYLE_TEXT_LIMIT = 8000

/** Extra negatives applied to every inpaint request that targets hands. */
const HAND_NEGATIVE = 'extra fingers, six fingers, seven fingers, fused fingers, missing fingers, fewer fingers, extra digits, mutated hands, deformed hand, poorly drawn hands, bad hands, extra hand, third hand, malformed hand, tangled fingers, claws'

/** Add finger/limb negatives whenever the request targets hands. */
function withHandNegative(negative, prompt) {
  const wantsHands = /hand|finger|palm|wrist|knuckle/i.test(prompt)
  const base = String(negative ?? '').slice(0, 4000)
  if (!wantsHands) return base
  return (base ? `${base}, ${HAND_NEGATIVE}` : HAND_NEGATIVE).slice(0, 4000)
}

/**
 * Pixel diff for inpaint results, computed on the host with Pillow so the
 * browser's canvas restrictions never matter.
 */
const DIFF_SCRIPT = `
import base64, io, json, sys
from PIL import Image, ImageChops

before_path, after_path = sys.argv[1], sys.argv[2]
before = Image.open(before_path).convert('RGB')
after = Image.open(after_path).convert('RGB')
w = min(before.width, after.width)
h = min(before.height, after.height)
if before.size != (w, h):
    before = before.crop((0, 0, w, h))
if after.size != (w, h):
    after = after.crop((0, 0, w, h))

diff = ImageChops.difference(before, after).convert('L')
hist = diff.histogram()
total = w * h
changed = sum(hist[17:])
ratio = changed / total * 100 if total else 0.0

# red overlay on the after image, scaled down for the UI
mask = diff.point(lambda v: 255 if v > 16 else 0)
after_small = after.copy()
warn = Image.new('RGB', after_small.size, (255, 60, 90))
after_small.paste(warn, mask=mask)
scale = min(1.0, 320 / max(w, h))
out = after_small.resize((max(1, int(w * scale)), max(1, int(h * scale))))
buf = io.BytesIO()
out.save(buf, 'PNG')
print(json.dumps({
  'percent': ratio,
  'width': w,
  'height': h,
  'map': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(),
}))
`

/** Locate the bundled Python that already ships with the local ComfyUI setup. */
function findPython(settings) {
  const candidates = [
    path.join(settings.comfyRoot, 'py', 'python.exe'),
    path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'py', 'python.exe'),
    'python',
  ]
  for (const candidate of candidates) {
    if (candidate === 'python') return candidate
    if (existsSync(candidate)) return candidate
  }
  return 'python'
}

async function inpaintDiff(settings, beforeName, afterName) {
  const before = within(path.join(settings.comfyRoot, 'ComfyUI', 'input'), String(beforeName ?? ''))
  const after = within(path.join(settings.comfyRoot, 'ComfyUI', 'output'), String(afterName ?? ''))
  if (!before || !after) throw new Error('before and after are required')
  if (!existsSync(before) || !existsSync(after)) throw new Error('image missing on disk')
  const python = findPython(settings)
  const stdout = await new Promise((resolve, reject) => {
    execFile(python, ['-c', DIFF_SCRIPT, before, after], { windowsHide: true, maxBuffer: 1 << 26 }, (error, out, err) => {
      if (error) reject(new Error(String(err || error.message).slice(0, 400)))
      else resolve(String(out))
    })
  })
  const parsed = JSON.parse(stdout.trim())
  return parsed
}

function normalizeInput(body) {
  const mode = body.mode === 'i2i' ? 'i2i' : 't2i'
  const hires = body.hires && body.hires.enabled
    ? {
        enabled: true,
        scale: clampFloat(body.hires.scale, 1.1, 2.5, 1.5),
        denoise: clampFloat(body.hires.denoise, 0.2, 0.9, 0.45),
        steps: clampInt(body.hires.steps, 4, 60, 14),
      }
    : { enabled: false }
  return {
    mode,
    prompt: String(body.prompt ?? '').slice(0, 8000),
    negative: String(body.negative ?? '').slice(0, 4000),
    checkpoint: String(body.checkpoint ?? ''),
    width: Math.round(clampInt(body.width, 256, 2048, 1024) / 8) * 8,
    height: Math.round(clampInt(body.height, 256, 2048, 1024) / 8) * 8,
    steps: clampInt(body.steps, 1, 80, 26),
    cfg: clampFloat(body.cfg, 0.5, 15, 5),
    sampler: String(body.sampler ?? 'dpmpp_2m'),
    scheduler: String(body.scheduler ?? 'karras'),
    seed: clampInt(body.seed, -1, 2 ** 32 - 1, -1),
    clipSkip: clampInt(body.clipSkip, 1, 3, 1),
    batch: clampInt(body.batch, 1, 4, 1),
    hires,
    strength: clampFloat(body.strength, 0.05, 1, 0.6),
    initImage: String(body.initImage ?? ''),
    referenceTags: String(body.referenceTags ?? '').slice(0, 600),
    style: String(body.style ?? ''),
    loras: normalizeLoras(body.loras),
    quality: String(body.quality ?? ''),
  }
}

/** Keep a LoRA stack in a shape the graph builder and history can trust. */
function normalizeLoras(value) {
  if (!Array.isArray(value)) return []
  const seen = new Set()
  const out = []
  for (const entry of value.slice(0, 6)) {
    const name = String(entry?.name ?? '').slice(0, 260)
    if (!name || seen.has(name)) continue
    seen.add(name)
    out.push({ name, weight: Number(clampFloat(entry?.weight, 0, 2, 0.8).toFixed(2)) })
  }
  return out
}

/** Build the API-format graph for one text-to-image or image-to-image run. */
function buildWorkflow(input, seed, filenamePrefix) {
  const graph = {
    1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: input.checkpoint } },
  }

  // Chain LoraLoader nodes between the checkpoint and everything that reads
  // the model or the text encoder, so stacked LoRAs apply to both.
  let modelRef = ['1', 0]
  let clipRef = ['1', 1]
  input.loras.forEach((lora, index) => {
    const id = String(50 + index)
    graph[id] = {
      class_type: 'LoraLoader',
      inputs: {
        model: modelRef,
        clip: clipRef,
        lora_name: lora.name,
        strength_model: lora.weight,
        strength_clip: lora.weight,
      },
    }
    modelRef = [id, 0]
    clipRef = [id, 1]
  })

  const promptText = input.referenceTags
    ? `${input.prompt}, ${input.referenceTags}`.replace(/\s*,\s*/g, ', ').slice(0, 8000)
    : input.prompt
  if ((input.clipSkip ?? 1) > 1) {
    // Use an id that never collides with the decoder (40) or the saver (41).
    graph[60] = {
      class_type: 'CLIPSetLastLayer',
      inputs: { clip: clipRef, stop_at_clip_layer: -Math.abs(input.clipSkip) },
    }
    clipRef = ['60', 0]
  }

  graph[2] = { class_type: 'CLIPTextEncode', inputs: { text: promptText, clip: clipRef } }
  graph[3] = { class_type: 'CLIPTextEncode', inputs: { text: input.negative, clip: clipRef } }

  let latent
  if (input.mode === 'i2i') {
    graph[10] = { class_type: 'LoadImage', inputs: { image: input.initImage } }
    graph[11] = {
      class_type: 'ImageScale',
      inputs: {
        image: ['10', 0],
        upscale_method: 'lanczos',
        width: input.width,
        height: input.height,
        crop: 'center',
      },
    }
    graph[12] = { class_type: 'VAEEncode', inputs: { pixels: ['11', 0], vae: ['1', 2] } }
    latent = ['12', 0]
  } else {
    graph[10] = {
      class_type: 'EmptyLatentImage',
      inputs: { width: input.width, height: input.height, batch_size: input.batch },
    }
    latent = ['10', 0]
  }

  graph[20] = {
    class_type: 'KSampler',
    inputs: {
      model: modelRef,
      positive: ['2', 0],
      negative: ['3', 0],
      latent_image: latent,
      seed,
      steps: input.steps,
      cfg: input.cfg,
      sampler_name: input.sampler,
      scheduler: input.scheduler,
      denoise: input.mode === 'i2i' ? input.strength : 1,
    },
  }
  let samples = ['20', 0]

  if (input.hires.enabled) {
    graph[30] = {
      class_type: 'LatentUpscaleBy',
      inputs: { samples: ['20', 0], upscale_method: 'bislerp', scale_by: input.hires.scale },
    }
    graph[31] = {
      class_type: 'KSampler',
      inputs: {
        model: modelRef,
        positive: ['2', 0],
        negative: ['3', 0],
        latent_image: ['30', 0],
        seed: (seed + 1) % 2 ** 32,
        steps: input.hires.steps,
        cfg: input.cfg,
        sampler_name: input.sampler,
        scheduler: input.scheduler,
        denoise: input.hires.denoise,
      },
    }
    samples = ['31', 0]
  }

  graph[40] = { class_type: 'VAEDecode', inputs: { samples, vae: ['1', 2] } }
  graph[41] = { class_type: 'SaveImage', inputs: { images: ['40', 0], filename_prefix: filenamePrefix } }
  return graph
}

/** The human-readable reason a finished prompt carries an error. */
/** Inpaint workflow: the source and its mask enter through ImageScale + VAEEncode. */
function buildInpaintWorkflow(input, seed, filenamePrefix) {
  const graph = {
    1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: input.checkpoint } },
  }

  let modelRef = ['1', 0]
  let clipRef = ['1', 1]
  input.loras.forEach((lora, index) => {
    const id = String(50 + index)
    graph[id] = {
      class_type: 'LoraLoader',
      inputs: {
        model: modelRef,
        clip: clipRef,
        lora_name: lora.name,
        strength_model: lora.weight,
        strength_clip: lora.weight,
      },
    }
    modelRef = [id, 0]
    clipRef = [id, 1]
  })

  const promptText = input.referenceTags
    ? `${input.prompt}, ${input.referenceTags}`.replace(/\s*,\s*/g, ', ').slice(0, 8000)
    : input.prompt
  if ((input.clipSkip ?? 1) > 1) {
    graph[60] = {
      class_type: 'CLIPSetLastLayer',
      inputs: { clip: clipRef, stop_at_clip_layer: -Math.abs(input.clipSkip) },
    }
    clipRef = ['60', 0]
  }

  graph[2] = { class_type: 'CLIPTextEncode', inputs: { text: promptText, clip: clipRef } }
  graph[3] = { class_type: 'CLIPTextEncode', inputs: { text: input.negative, clip: clipRef } }

  graph[10] = { class_type: 'LoadImage', inputs: { image: input.initImage } }
  graph[11] = { class_type: 'ImageScale', inputs: { image: ['10', 0], upscale_method: 'lanczos', width: input.width, height: input.height, crop: 'disabled' } }
  // The mask is a white-on-black PNG: white is the area the sampler may repaint.
  graph[12] = { class_type: 'LoadImage', inputs: { image: input.maskImage } }
  // LoadImage returns IMAGE; VAEEncodeForInpaint needs a MASK.
  graph[14] = { class_type: 'ImageToMask', inputs: { image: ['12', 0], channel: 'red' } }
  // VAEEncodeForInpaint zeroes the masked pixels, which leaves a grey smear when
  // denoise is below 1. Encoding the untouched image and attaching a noise mask
  // keeps the original pixels around the strokes.
  graph[15] = { class_type: 'GrowMask', inputs: { mask: ['14', 0], expand: input.maskGrow, tapered_corners: true } }
  graph[16] = { class_type: 'VAEEncode', inputs: { pixels: ['11', 0], vae: ['1', 2] } }
  graph[13] = { class_type: 'SetLatentNoiseMask', inputs: { samples: ['16', 0], mask: ['15', 0] } }

  graph[20] = {
    class_type: 'KSampler',
    inputs: {
      model: modelRef,
      positive: ['2', 0],
      negative: ['3', 0],
      latent_image: ['13', 0],
      seed,
      steps: input.steps,
      cfg: input.cfg,
      sampler_name: input.sampler,
      scheduler: input.scheduler,
      denoise: input.strength,
    },
  }

  graph[40] = { class_type: 'VAEDecode', inputs: { samples: ['20', 0], vae: ['1', 2] } }
  graph[41] = { class_type: 'SaveImage', inputs: { images: ['40', 0], filename_prefix: filenamePrefix } }
  return graph
}

function historyError(entry) {
  const messages = Array.isArray(entry?.status?.messages) ? entry.status.messages : []
  for (const message of messages) {
    if (!Array.isArray(message)) continue
    const [kind, detail] = message
    if (kind === 'execution_error') {
      return detail?.exception_message || `${detail?.node_type ?? 'node'} failed`
    }
    if (kind === 'execution_interrupted') return 'interrupted'
  }
  return 'generation failed'
}

/** Output images of one history entry, with the panel's own image route. */
function collectImages(entry) {
  const images = []
  for (const [node, value] of Object.entries(entry?.outputs ?? {})) {
    for (const image of value?.images ?? []) {
      if (image?.type !== 'output') continue
      const relative = image.subfolder ? `${image.subfolder}/${image.filename}` : image.filename
      images.push({
        filename: image.filename,
        subfolder: image.subfolder ?? '',
        node,
        url: `/comfy-panel/image?path=${encodeURIComponent(relative)}`,
      })
    }
  }
  return images
}

/** Final pixel size after the hires pass (LatentUpscaleBy rounds to /8). */
function outputSize(params) {
  if (!params.hires || !params.hires.enabled) return { width: params.width, height: params.height }
  const round8 = (value) => Math.max(8, Math.round((value * params.hires.scale) / 8) * 8)
  return { width: round8(params.width), height: round8(params.height) }
}

function publicJob(job) {
  return {
    id: job.id,
    state: job.state,
    mode: job.mode,
    prompt: job.params.prompt,
    negative: job.params.negative,
    checkpoint: job.params.checkpoint,
    width: job.params.width,
    height: job.params.height,
    outWidth: job.outWidth ?? job.params.width,
    outHeight: job.outHeight ?? job.params.height,
    steps: job.params.steps,
    cfg: job.params.cfg,
    sampler: job.params.sampler,
    scheduler: job.params.scheduler,
    seed: job.seed,
    batch: job.params.batch,
    hires: job.params.hires,
    strength: job.params.strength,
    clipSkip: job.params.clipSkip ?? 1,
    initImage: job.params.initImage,
    referenceTags: job.params.referenceTags ?? '',
    loras: job.params.loras ?? [],
    style: job.params.style ?? '',
    quality: job.params.quality,
    progress: job.progress ?? null,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    promptId: job.promptId,
    images: job.images,
    error: job.error,
  }
}

function pruneJobs() {
  const ordered = [...jobs.values()].sort((a, b) => b.createdAt - a.createdAt)
  for (const job of ordered.slice(24)) jobs.delete(job.id)
}

/** Submit the graph, then follow the prompt until ComfyUI reports a result. */
async function runJob(settings, job, input) {
  job.state = 'running'
  job.startedAt = Date.now()
  job.progress = { value: 0, max: 0 }
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  const prefix = `comfypanel_${input.mode}_${stamp}`
  const graph = buildWorkflow(input, job.seed, prefix)
  const submitted = await comfy(
    settings,
    '/prompt',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: graph, client_id: 'dsh-comfy-panel' }),
    },
    60000,
  )
  if (!submitted?.prompt_id) throw new Error('ComfyUI rejected the prompt')
  job.promptId = submitted.prompt_id

  const deadline = Date.now() + (settings.jobTimeoutMs ?? DEFAULTS.jobTimeoutMs)
  while (Date.now() < deadline) {
    if (job.canceled) throw new Error('canceled')
    await delay(900)
    let history = null
    try {
      history = await comfy(settings, `/history/${encodeURIComponent(job.promptId)}`, {}, 20000)
    } catch {
      // A fetch failure is either a busy server or a dead one; a dead server
      // would otherwise leave the job "running" until the timeout.
      const live = await probe(settings.port, settings.host)
      if (!live.up) throw new Error('ComfyUI stopped while generating (an incompatible LoRA or model can crash it)')
      continue
    }
    const entry = history?.[job.promptId]
    if (!entry) continue
    const status = entry.status?.status_str ?? (entry.outputs ? 'success' : null)
    if (status === 'error') throw new Error(historyError(entry))
    const images = collectImages(entry)
    if (images.length === 0 && status !== 'success') continue
    if (images.length === 0) throw new Error('ComfyUI finished without an output image')
    job.images = images
    job.state = 'done'
    job.progress = { value: 1, max: 1 }
    job.finishedAt = Date.now()
    await recordHistory(settings, job)
    return
  }
  throw new Error('timed out waiting for ComfyUI')
}

/** Keep the last generations, so the panel can offer prompt reuse after reload. */
async function recordHistory(settings, job) {
  const state = await loadState(settings)
  state.history.unshift({
    id: job.promptId || job.id,
    at: job.finishedAt,
    mode: job.params.mode,
    prompt: job.params.prompt,
    negative: job.params.negative,
    checkpoint: job.params.checkpoint,
    width: job.params.width,
    height: job.params.height,
    outWidth: job.outWidth ?? job.params.width,
    outHeight: job.outHeight ?? job.params.height,
    steps: job.params.steps,
    cfg: job.params.cfg,
    sampler: job.params.sampler,
    scheduler: job.params.scheduler,
    seed: job.seed,
    batch: job.params.batch,
    hires: job.params.hires,
    strength: job.params.strength,
    clipSkip: job.params.clipSkip ?? 1,
    referenceTags: job.params.referenceTags ?? '',
    loras: job.params.loras ?? [],
    style: job.params.style ?? '',
    quality: job.params.quality,
    images: job.images,
  })
  state.history = state.history.slice(0, 40)
  await saveState(settings)
}

/** Remove one output file and every saved reference to it. */
async function removeOutput(settings, name) {
  const dir = path.join(settings.comfyRoot, 'ComfyUI', 'output')
  const file = within(dir, String(name))
  if (!file) return { ok: false, error: 'refusing to delete outside the output folder' }
  try {
    await unlink(file)
  } catch {
    return { ok: false, error: 'file not found' }
  }
  const state = await loadState(settings)
  for (const record of state.history) {
    record.images = (record.images || []).filter((image) => image.filename !== name)
  }
  state.history = state.history.filter((record) => (record.images || []).length > 0)
  state.images = (state.images || []).filter((image) => image.name !== name)
  await saveState(settings)
  for (const job of jobs.values()) {
    job.images = (job.images || []).filter((image) => image.filename !== name)
  }
  return { ok: true }
}

/** Copy one output into the panel's keep folder, which the service tab can open. */
async function saveOutput(settings, name) {
  const dir = path.join(settings.comfyRoot, 'ComfyUI', 'output')
  const source = within(dir, String(name))
  if (!source) return { ok: false, error: 'refusing to read outside the output folder' }
  await mkdir(settings.saveDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  const target = path.join(settings.saveDir, `${stamp}_${path.basename(source)}`)
  await copyFile(source, target)
  return { ok: true, path: target, dir: settings.saveDir }
}

async function startJob(settings, input) {
  if (!input.checkpoint) return { ok: false, error: 'no checkpoint selected' }
  if (!input.prompt.trim()) return { ok: false, error: 'prompt is empty' }
  if (input.mode === 'i2i' && !input.initImage) return { ok: false, error: 'no input image selected' }
  const live = await probe(settings.port, settings.host)
  if (!live.up) return { ok: false, error: 'ComfyUI is not running; start the service first' }

  // Only reference LoRA files that still exist: a preset may outlive a file.
  if (input.loras.length) {
    const installed = new Set(
      (await listFolder(path.join(settings.comfyRoot, 'ComfyUI', 'models', 'loras'))).map((file) => file.name),
    )
    input.loras = input.loras.filter((lora) => installed.has(lora.name))
  }
  ensureSocket(settings)

  const size = outputSize(input)
  const job = {
    id: `gen-${++jobSeq}`,
    outWidth: size.width,
    outHeight: size.height,
    state: 'queued',
    mode: input.mode,
    params: input,
    seed: input.seed >= 0 ? input.seed : Math.floor(Math.random() * 2 ** 32),
    promptId: null,
    progress: null,
    images: [],
    error: null,
    canceled: false,
    createdAt: Date.now(),
    startedAt: 0,
    finishedAt: 0,
  }
  jobs.set(job.id, job)
  pruneJobs()

  void (async () => {
    try {
      await runJob(settings, job, input)
    } catch (error) {
      job.state = job.canceled || String(error?.message) === 'canceled' ? 'canceled' : 'failed'
      job.error = String(error?.message ?? error)
      job.finishedAt = Date.now()
    }
  })()

  return { ok: true, job: publicJob(job) }
}

async function cancelJob(settings, id) {
  const job = jobs.get(id)
  if (!job) return { ok: false, error: 'unknown job' }
  job.canceled = true
  if (job.state === 'running' || job.state === 'queued') {
    if (job.promptId) {
      try {
        await comfy(settings, '/interrupt', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ prompt_id: job.promptId }),
        }, 10000)
      } catch { /* the prompt may already have finished */ }
      try {
        await comfy(settings, '/queue', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ delete: [job.promptId] }),
        }, 10000)
      } catch { /* queue removal is best effort */ }
    }
    job.state = 'canceled'
    job.finishedAt = Date.now()
  }
  return { ok: true, job: publicJob(job) }
}

/**
 * Copy or upload one init image into ComfyUI's input folder, which is where
 * LoadImage reads from. Data URLs come from the browser's file picker or a
 * dropped file; `source: 'output'` reuses an image the panel already shows.
 */
async function storeInitImage(settings, body) {
  const inputDir = path.join(settings.comfyRoot, 'ComfyUI', 'input')
  await mkdir(inputDir, { recursive: true })

  if (body.source === 'output' && body.name) {
    const source = within(path.join(settings.comfyRoot, 'ComfyUI', 'output'), String(body.name))
    if (!source) return { ok: false, error: 'refusing to read outside the output folder' }
    const name = `panel_${Date.now()}_${path.basename(source)}`
    await copyFile(source, path.join(inputDir, name))
    return { ok: true, image: name }
  }

  const match = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/s.exec(String(body.dataUrl ?? ''))
  if (!match) return { ok: false, error: 'expected an image data URL' }
  const extension = match[1] === 'jpeg' ? 'jpg' : match[1]
  const name = `panel_${Date.now()}.${extension}`
  await writeFile(path.join(inputDir, name), Buffer.from(match[2], 'base64'))
  return { ok: true, image: name }
}

/** Bigjpg enlarger: upload the local render, create a task and poll it. */
const BIGJPG_API = 'https://bigjpg.com'
const BIGJPG_SCALES = { 1: 2, 2: 4, 3: 8, 4: 16 }

async function bigjpgUpload(key, filePath, fileName) {
  const ext = path.extname(fileName).toLowerCase()
  const filetype = ext === '.jpg' || ext === '.jpeg'
    ? 'image/jpeg'
    : ext === '.webp' ? 'image/webp' : 'image/png'
  const metaRes = await fetch(`${BIGJPG_API}/api/img_upload`, {
    method: 'POST',
    headers: { 'X-API-KEY': key, 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ filename: fileName, filetype }).toString(),
  })
  const meta = await metaRes.json().catch(() => ({}))
  if (!meta || !meta.url || !meta.fileurl) {
    throw new Error(meta && meta.status ? `bigjpg: ${meta.status}` : 'bigjpg: upload address refused')
  }
  const buffer = await readFile(filePath)
  const put = await fetch(meta.url, { method: 'PUT', headers: { 'content-type': filetype }, body: buffer })
  if (!put.ok) throw new Error(`bigjpg: upload failed (${put.status})`)
  return meta.fileurl
}

async function bigjpgCreateTask(key, fileUrl, fileName, scale, style, noise) {
  const res = await fetch(`${BIGJPG_API}/api/task/`, {
    method: 'POST',
    headers: { 'X-API-KEY': key, 'content-type': 'application/json' },
    body: JSON.stringify({
      style: style === 'photo' ? 'photo' : 'art',
      noise: String(noise),
      x2: String(scale),
      input: fileUrl,
      file_name: fileName,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!data || !data.tid) throw new Error(data && data.status ? `bigjpg: ${data.status}` : 'bigjpg: task refused')
  return {
    tid: String(data.tid),
    minute: Number(data.minute) || 0,
    remaining: Number.isFinite(Number(data.remaining_api_calls)) ? Number(data.remaining_api_calls) : null,
  }
}

/** State of the external-browser bridge: one Chromium window, one page. */
const ext = {
  child: null,
  ws: null,
  targetId: '',
  seq: 0,
  pending: new Map(),
  shotAt: 0,
  lastError: '',
}

/** Locate a Chromium browser this machine can drive over CDP. */
function findBrowserExecutable() {
  const candidates = [
    process.env.KRENE_BROWSER,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean)
  return candidates.find((candidate) => existsSync(candidate)) || null
}

function extSend(method, params = {}, timeout = 20000) {
  const socket = ext.ws
  if (!socket || socket.readyState !== 1) return Promise.reject(new Error('browser is not attached'))
  const id = ++ext.seq
  return new Promise((resolve, reject) => {
    ext.pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
    setTimeout(() => {
      if (ext.pending.has(id)) {
        ext.pending.delete(id)
        reject(new Error(`CDP timeout: ${method}`))
      }
    }, timeout)
  })
}

function extHandleMessage(event) {
  if (typeof event.data !== 'string') return
  let message = null
  try {
    message = JSON.parse(event.data)
  } catch {
    return
  }
  if (!message.id) return
  const entry = ext.pending.get(message.id)
  if (!entry) return
  ext.pending.delete(message.id)
  if (message.error) entry.reject(new Error(message.error.message))
  else entry.resolve(message.result)
}

async function extProbe(settings) {
  try {
    const version = await fetchJson(`http://127.0.0.1:${settings.extPort}/json/version`, 3000)
    return { running: true, browser: version.Browser || '' }
  } catch {
    return { running: false }
  }
}

/** Attach to the site's tab, reusing the socket when it is still alive. */
async function extAttach(settings) {
  const pages = await fetchJson(`http://127.0.0.1:${settings.extPort}/json/list`, 5000).catch(() => [])
  const list = Array.isArray(pages) ? pages : []
  const page = list.find((target) => target.type === 'page' && /krene\.com/.test(target.url))
    || list.find((target) => target.type === 'page')
  if (!page) return null
  if (ext.ws && ext.targetId === page.id && ext.ws.readyState === 1) return ext
  try {
    ext.ws?.close()
  } catch { /* already closed */ }
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('CDP connect timeout')), 10000)
    ws.onopen = () => { clearTimeout(timer); resolve() }
    ws.onerror = () => { clearTimeout(timer); reject(new Error('CDP connect failed')) }
  })
  ws.onmessage = extHandleMessage
  ws.onclose = () => {
    if (ext.ws === ws) {
      ext.ws = null
      ext.targetId = ''
    }
  }
  ext.ws = ws
  ext.targetId = page.id
  await extSend('Page.enable')
  await extSend('Runtime.enable')
  return ext
}

async function extEvaluate(expression) {
  const result = await extSend('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'page evaluation failed')
  return result.result?.value
}

/** Launch the browser windowed: the user may need to sign in once. */
async function extLaunch(settings) {
  const live = await extProbe(settings)
  if (live.running) return { ok: true, already: true, browser: live.browser }
  const executable = findBrowserExecutable()
  if (!executable) return { ok: false, error: 'No Edge or Chrome found on this machine' }
  const profile = path.join(settings.comfyRoot, '.ext-browser')
  await mkdir(profile, { recursive: true })
  ext.child = spawn(executable, [
    `--remote-debugging-port=${settings.extPort}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,900',
    settings.extUrl,
  ], { stdio: 'ignore', windowsHide: false, detached: false })
  ext.child.on('exit', () => { ext.child = null })
  for (let i = 0; i < 30; i += 1) {
    await delay(500)
    const probe = await extProbe(settings)
    if (probe.running) {
      await delay(1500)
      return { ok: true, browser: probe.browser, port: settings.extPort }
    }
  }
  return { ok: false, error: 'browser did not expose the debug port' }
}

async function extClose(settings) {
  try {
    ext.ws?.close()
  } catch { /* already closed */ }
  ext.ws = null
  ext.targetId = ''
  if (ext.child && !ext.child.killed) {
    try {
      ext.child.kill()
    } catch { /* ignore */ }
    ext.child = null
    return { ok: true }
  }
  const pids = await pidsOnPort(settings.extPort)
  for (const pid of pids) {
    await new Promise((resolve) => {
      execFile('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { windowsHide: true }, () => resolve())
    })
  }
  return { ok: true, killed: pids }
}

async function extStatus(settings) {
  const probe = await extProbe(settings)
  const status = {
    ok: true,
    running: probe.running,
    browser: probe.browser || '',
    port: settings.extPort,
    url: settings.extUrl,
    shotAt: ext.shotAt,
    error: ext.lastError,
  }
  if (!probe.running) return status
  try {
    await extAttach(settings)
    if (ext.ws) {
      status.attached = true
      status.title = await extEvaluate('document.title')
      status.pageUrl = await extEvaluate('location.href')
      status.hasPromptBox = await extEvaluate("Boolean([...document.querySelectorAll('textarea')].find((el) => el.getBoundingClientRect().width > 200))")
      status.loginRequired = await extEvaluate("Boolean([...document.querySelectorAll('[role=dialog]')].some((dialog) => /登录|注册/.test(dialog.innerText || '')))")
    }
  } catch (error) {
    status.error = String(error?.message ?? error)
  }
  return status
}

/** Capture the page into the profile folder and remember when it was taken. */
async function extShot(settings) {
  const shot = await extSend('Page.captureScreenshot', { format: 'png' }, 20000)
  const buffer = Buffer.from(shot.data, 'base64')
  const file = path.join(settings.comfyRoot, '.ext-browser', 'shot.png')
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, buffer)
  ext.shotAt = Date.now()
  return file
}

/**
 * Type the prompt into the site's composer and press its send control.
 * Selectors come from the page structure probed on krene.com: the composer is
 * the widest textarea and the send control carries a styles_sendBottom class.
 */
async function extGenerate(settings, prompt, waitMs) {
  try {
    await extAttach(settings)
  } catch (error) {
    ext.lastError = String(error?.message ?? error)
  }
  if (!ext.ws) return { ok: false, error: '浏览器未连接，请先点「打开浏览器」' }
  const filled = await extEvaluate(`(() => {
    const area = [...document.querySelectorAll('textarea')].find((el) => {
      const rect = el.getBoundingClientRect()
      return rect.width > 200 && rect.height > 20
    })
    if (!area) return 'no-textarea'
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
    setter.call(area, ${JSON.stringify(String(prompt ?? ''))})
    area.dispatchEvent(new Event('input', { bubbles: true }))
    area.focus()
    return 'ok'
  })()`)
  if (filled !== 'ok') return { ok: false, error: '页面上没有找到提示词输入框' }

  const clicked = await extEvaluate(`(() => {
    const byClass = [...document.querySelectorAll('[class*="styles_sendBottom"], [class*="sendBottom"]')]
      .find((el) => el.getBoundingClientRect().width > 0)
    if (byClass) { byClass.click(); return 'class' }
    const byText = [...document.querySelectorAll('button')]
      .find((el) => /生成|创作|发送/.test(el.innerText || '') && el.getBoundingClientRect().width > 0)
    if (byText) { byText.click(); return 'text' }
    return 'no-button'
  })()`)
  if (clicked === 'no-button') return { ok: false, error: '没有找到页面上的提交按钮' }

  await delay(1500)
  const login = await extEvaluate("(() => { const text = [...document.querySelectorAll('[role=dialog]')].map((dialog) => dialog.innerText || '').join(' '); return /登录|注册/.test(text) })()")
  await extShot(settings).catch(() => {})
  if (login) {
    return {
      ok: false,
      needLogin: true,
      shotAt: ext.shotAt,
      error: '需要先在浏览器窗口里登录一次；登录状态会保存在专用浏览器配置里，之后可直接生成',
    }
  }

  const deadline = Date.now() + Math.max(5000, Math.min(180000, Number(waitMs) || settings.extWaitMs))
  while (Date.now() < deadline) {
    await delay(2500)
    await extShot(settings).catch(() => {})
  }
  const title = await extEvaluate('document.title').catch(() => '')
  const images = await extEvaluate("document.querySelectorAll('img').length").catch(() => 0)
  return { ok: true, title, images, shotAt: ext.shotAt, waitMs }
}

/** Structural snapshot of the page, so a broken selector can be repaired. */
async function extDebug(settings) {
  await extAttach(settings)
  if (!ext.ws) return { ok: false, error: 'browser is not attached' }
  const dump = await extEvaluate(`JSON.stringify({
    url: location.href,
    title: document.title,
    textareas: [...document.querySelectorAll('textarea')].map((el) => {
      const rect = el.getBoundingClientRect()
      return { placeholder: (el.placeholder || '').slice(0, 30), w: Math.round(rect.width), h: Math.round(rect.height) }
    }),
    buttons: [...document.querySelectorAll('button,[role=button],[class*="sendBottom"]')].slice(0, 20).map((el) => {
      const rect = el.getBoundingClientRect()
      return { text: (el.innerText || '').trim().slice(0, 18), cls: String(el.className).slice(0, 40), w: Math.round(rect.width), h: Math.round(rect.height) }
    }),
    dialogs: [...document.querySelectorAll('[role=dialog]')].map((dialog) => (dialog.innerText || '').slice(0, 80))
  })`)
  return { ok: true, page: JSON.parse(dump) }
}

/** The HTTP carrier must exist before this plugin can publish its panel routes. */
export const inject = ['webServer']

/**
 * @param ctx - plugin context.
 * @param config - row config, merged over DEFAULTS.
 */
export function apply(ctx, config = {}) {
  const settings = { ...DEFAULTS, ...config }
  const webServer = ctx.webServer

  const handler = async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://local')
    const route = url.pathname.slice('/comfy-panel'.length) || '/'
    try {
      if (route === '/status' && req.method === 'GET') {
        const live = await probe(settings.port, settings.host)
        return sendJson(res, 200, {
          ok: true,
          url: `http://${settings.host}:${settings.port}`,
          root: settings.comfyRoot,
          saveDir: settings.saveDir,
          logFile: path.join(settings.comfyRoot, '.comfy-panel', 'comfyui.log'),
          managed: child !== null,
          dynamicVram: !settings.disableDynamicVram,
          spawnedAt: lastSpawnAt,
          lastExit,
          ...live,
        })
      }

      if (route === '/start' && req.method === 'POST') {
        const result = await startServer(settings)
        return sendJson(res, result.ok ? 200 : 500, result)
      }

      if (route === '/stop' && req.method === 'POST') {
        const result = await stopServer(settings)
        return sendJson(res, result.ok ? 200 : 500, result)
      }

      if (route === '/models' && req.method === 'GET') {
        const out = {}
        for (const [kind, entry] of Object.entries(MODEL_KINDS)) {
          const dir = path.join(settings.comfyRoot, 'ComfyUI', 'models', entry.dir)
          out[kind] = await listFolder(dir)
        }
        return sendJson(res, 200, { ok: true, models: out })
      }

      if (route === '/downloads' && req.method === 'GET') {
        return sendJson(res, 200, { ok: true, downloads: [...downloads.values()].slice(-12) })
      }

      if (route === '/download' && req.method === 'POST') {
        const body = await readBody(req)
        const result = await startDownload(settings, body)
        return sendJson(res, result.ok ? 200 : 400, result)
      }

      if (route === '/outputs' && req.method === 'GET') {
        const dir = path.join(settings.comfyRoot, 'ComfyUI', 'output')
        const files = (await listFolder(dir)).filter((file) => MIME[path.extname(file.name).toLowerCase()])
        return sendJson(res, 200, { ok: true, outputs: files.slice(0, 60) })
      }

      if (route === '/image' && req.method === 'GET') {
        const requested = url.searchParams.get('path') ?? ''
        const roots = [
          path.join(path.dirname(fileURLToPath(import.meta.url)), 'help-images'),
          path.join(settings.comfyRoot, 'ComfyUI', 'output'),
          path.join(settings.comfyRoot, 'ComfyUI', 'input'),
        ]
        let file = null
        for (const root of roots) {
          const candidate = within(root, requested)
          if (!candidate) continue
          try {
            const info = await stat(candidate)
            if (info.isFile()) { file = candidate; break }
          } catch { /* try the next root */ }
        }
        if (!file) return sendJson(res, 404, { ok: false, error: 'not found' })
        res.writeHead(200, {
          'content-type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
          'cache-control': 'no-store',
        })
        createReadStream(file).pipe(res)
        return undefined
      }

      if (route === '/reveal' && req.method === 'POST') {
        const body = await readBody(req)
        const target = body.target === 'models' ? 'ComfyUI/models' : body.target === 'saved' ? settings.saveDir : 'ComfyUI/output'
        const dir = path.isAbsolute(target) ? target : path.join(settings.comfyRoot, target)
        try {
          await mkdir(dir, { recursive: true })
          spawn('explorer.exe', [dir], { detached: true, stdio: 'ignore' }).unref()
          return sendJson(res, 200, { ok: true, dir })
        } catch (error) {
          return sendJson(res, 500, { ok: false, error: String(error?.message ?? error) })
        }
      }

      if (route === '/ext/status' && req.method === 'GET') {
        return sendJson(res, 200, await extStatus(settings))
      }

      if (route === '/ext/open' && req.method === 'POST') {
        const result = await extLaunch(settings)
        return sendJson(res, result.ok ? 200 : 500, result)
      }

      if (route === '/ext/close' && req.method === 'POST') {
        return sendJson(res, 200, await extClose(settings))
      }

      if (route === '/ext/generate' && req.method === 'POST') {
        const body = await readBody(req, 1 << 20)
        const prompt = String(body.prompt ?? '').slice(0, 8000)
        if (!prompt.trim()) return sendJson(res, 400, { ok: false, error: '提示词为空' })
        const result = await extGenerate(settings, prompt, body.waitMs)
        return sendJson(res, 200, result)
      }

      if (route === '/ext/shot' && req.method === 'GET') {
        const file = path.join(settings.comfyRoot, '.ext-browser', 'shot.png')
        try {
          const info = await stat(file)
          if (!info.isFile()) throw new Error('missing')
          res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'no-store' })
          createReadStream(file).pipe(res)
          return undefined
        } catch {
          return sendJson(res, 404, { ok: false, error: '还没有截图' })
        }
      }

      if (route === '/ext/save-shot' && req.method === 'POST') {
        const file = path.join(settings.comfyRoot, '.ext-browser', 'shot.png')
        try {
          await mkdir(settings.saveDir, { recursive: true })
          const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
          const target = path.join(settings.saveDir, `krene_${stamp}.png`)
          await copyFile(file, target)
          return sendJson(res, 200, { ok: true, path: target })
        } catch (error) {
          return sendJson(res, 500, { ok: false, error: String(error?.message ?? error) })
        }
      }

      if (route === '/ext/debug' && req.method === 'GET') {
        return sendJson(res, 200, await extDebug(settings))
      }

      if (route === '/ext/click' && req.method === 'POST') {
        const body = await readBody(req)
        const selector = String(body.selector ?? '').slice(0, 200)
        if (!selector) return sendJson(res, 400, { ok: false, error: 'selector is required' })
        await extAttach(settings)
        if (!ext.ws) return sendJson(res, 400, { ok: false, error: 'browser is not attached' })
        const hit = await extEvaluate(`(() => {
          try {
            const el = document.querySelector(${JSON.stringify(selector)})
            if (!el) return false
            el.click()
            return true
          } catch { return false }
        })()`)
        await extShot(settings).catch(() => {})
        return sendJson(res, 200, { ok: Boolean(hit), shotAt: ext.shotAt })
      }

      if (route === '/ext/reload' && req.method === 'POST') {
        await extAttach(settings)
        if (!ext.ws) return sendJson(res, 400, { ok: false, error: 'browser is not attached' })
        await extSend('Page.reload', { ignoreCache: false })
        await delay(2500)
        await extShot(settings).catch(() => {})
        return sendJson(res, 200, { ok: true, shotAt: ext.shotAt })
      }

      if (route === '/log' && req.method === 'GET') {
        const lines = clampInt(url.searchParams.get('lines'), 10, 400, 60)
        const file = path.join(settings.comfyRoot, '.comfy-panel', 'comfyui.log')
        let text = ''
        try {
          text = await readFile(file, 'utf8')
        } catch {
          text = ''
        }
        const tail = text.split(/\r?\n/).slice(-lines).join('\n')
        return sendJson(res, 200, { ok: true, file, lines: tail })
      }

      if (route === '/outputs/delete' && req.method === 'POST') {
        const body = await readBody(req)
        const result = await removeOutput(settings, String(body.name ?? ''))
        return sendJson(res, result.ok ? 200 : 400, result)
      }

      if (route === '/outputs/save' && req.method === 'POST') {
        const body = await readBody(req)
        const result = await saveOutput(settings, String(body.name ?? ''))
        return sendJson(res, result.ok ? 200 : 400, result)
      }

      if (route === '/history/delete' && req.method === 'POST') {
        const body = await readBody(req)
        const state = await loadState(settings)
        state.history = state.history.filter((record) => record.id !== String(body.id ?? ''))
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/history/clear' && req.method === 'POST') {
        const state = await loadState(settings)
        state.history = []
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/images/toggle' && req.method === 'POST') {
        const body = await readBody(req)
        const name = String(body.name ?? '')
        if (!name) return sendJson(res, 400, { ok: false, error: 'missing image name' })
        const state = await loadState(settings)
        const existing = state.images.findIndex((image) => image.name === name)
        if (existing >= 0) {
          state.images.splice(existing, 1)
        } else {
          state.images.unshift({
            id: `img-${Date.now()}`,
            name,
            at: Date.now(),
            prompt: String(body.prompt ?? '').slice(0, 4000),
          })
          state.images = state.images.slice(0, 200)
        }
        await saveState(settings)
        return sendJson(res, 200, { ok: true, saved: existing < 0, ...state })
      }

      if (route === '/styles/group/save' && req.method === 'POST') {
        const body = await readBody(req)
        const name = String(body.name ?? '').trim().slice(0, 40)
        if (!name) return sendJson(res, 400, { ok: false, error: 'group name is required' })
        const state = await loadState(settings)
        if (!state.styleGroups.some((group) => group.name === name)) {
          state.styleGroups.push({ id: `sg-${Date.now()}`, name })
          await saveState(settings)
        }
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/styles/group/delete' && req.method === 'POST') {
        const body = await readBody(req)
        const name = String(body.name ?? '').trim()
        const state = await loadState(settings)
        state.styleGroups = state.styleGroups.filter((group) => group.name !== name)
        for (const key of Object.keys(state.styleAssign)) {
          if (state.styleAssign[key] === name) delete state.styleAssign[key]
        }
        state.customStyles = state.customStyles.map((style) => (style.group === name ? { ...style, group: '' } : style))
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/styles/group/label' && req.method === 'POST') {
        const body = await readBody(req)
        const key = String(body.key ?? '').slice(0, 40)
        const label = String(body.label ?? '').trim().slice(0, 24)
        const state = await loadState(settings)
        if (label) state.styleGroupLabels[key] = label
        else delete state.styleGroupLabels[key]
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/styles/group/rename' && req.method === 'POST') {
        const body = await readBody(req)
        const name = String(body.name ?? '').trim()
        const newName = String(body.newName ?? '').trim().slice(0, 40)
        if (!name || !newName) return sendJson(res, 400, { ok: false, error: 'name and newName are required' })
        if (name === newName) return sendJson(res, 200, { ok: true, ...(await loadState(settings)) })
        const state = await loadState(settings)
        if (state.styleGroups.some((group) => group.name === newName)) {
          return sendJson(res, 409, { ok: false, error: 'category already exists' })
        }
        state.styleGroups = state.styleGroups.map((group) => (group.name === name ? { ...group, name: newName } : group))
        for (const key of Object.keys(state.styleAssign)) {
          if (state.styleAssign[key] === name) state.styleAssign[key] = newName
        }
        state.customStyles = state.customStyles.map((style) => (style.group === name ? { ...style, group: newName } : style))
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/styles/assign' && req.method === 'POST') {
        const body = await readBody(req)
        const styleId = String(body.styleId ?? '').trim()
        if (!styleId) return sendJson(res, 400, { ok: false, error: 'styleId is required' })
        const group = String(body.group ?? '').trim().slice(0, 40)
        const state = await loadState(settings)
        // An empty group is a real target (the built-in bucket), not a reset.
        if (body.reset === true) delete state.styleAssign[styleId]
        else state.styleAssign[styleId] = group
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/styles/edit' && req.method === 'POST') {
        const body = await readBody(req, 1 << 20)
        const styleId = String(body.styleId ?? '').trim()
        if (!styleId) return sendJson(res, 400, { ok: false, error: 'styleId is required' })
        const state = await loadState(settings)
        const patch = {}
        if (typeof body.tags === 'string') patch.tags = body.tags.trim().slice(0, STYLE_TEXT_LIMIT)
        if (typeof body.name === 'string') patch.name = body.name.trim().slice(0, 40)
        const merged = { ...(state.styleEdits[styleId] || {}), ...patch }
        if (!merged.tags && !merged.name) delete state.styleEdits[styleId]
        else state.styleEdits[styleId] = merged
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/styles/reset' && req.method === 'POST') {
        const state = await loadState(settings)
        state.styleHidden = []
        state.styleEdits = {}
        state.styleGroupLabels = {}
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/styles/hide' && req.method === 'POST') {
        const body = await readBody(req)
        const styleId = String(body.styleId ?? '').trim()
        if (!styleId) return sendJson(res, 400, { ok: false, error: 'styleId is required' })
        const state = await loadState(settings)
        const hidden = new Set(state.styleHidden)
        if (body.hidden === false) hidden.delete(styleId)
        else hidden.add(styleId)
        state.styleHidden = [...hidden]
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/styles/custom/save' && req.method === 'POST') {
        const body = await readBody(req, 1 << 20)
        const name = String(body.name ?? '').trim().slice(0, 40)
        const tags = String(body.tags ?? '').trim().slice(0, STYLE_TEXT_LIMIT)
        if (!name || !tags) return sendJson(res, 400, { ok: false, error: 'name and tags are required' })
        const group = String(body.group ?? '').trim().slice(0, 40)
        const state = await loadState(settings)
        const id = String(body.id ?? '').trim()
        const existing = id ? state.customStyles.find((style) => style.id === id) : null
        if (existing) {
          existing.name = name
          existing.tags = tags
          existing.group = group
        } else {
          state.customStyles.push({ id: `st-${Date.now()}`, name, tags, group })
        }
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/styles/custom/delete' && req.method === 'POST') {
        const body = await readBody(req)
        const state = await loadState(settings)
        state.customStyles = state.customStyles.filter((style) => style.id !== String(body.id ?? ''))
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/tips/quick/save' && req.method === 'POST') {
        const body = await readBody(req, 1 << 20)
        const state = await loadState(settings)
        const title = String(body.title ?? '').trim().slice(0, 120)
        const steps = (Array.isArray(body.steps) ? body.steps : String(body.steps ?? '').split('\n'))
          .map((step) => String(step).trim().slice(0, 300))
          .filter(Boolean)
          .slice(0, 12)
        if (!title || steps.length === 0) return sendJson(res, 400, { ok: false, error: 'title and steps are required' })
        const id = String(body.id ?? '').trim()
        const existing = id ? state.quickCards.find((card) => card.id === id) : null
        if (existing) {
          existing.title = title
          existing.steps = steps
          existing.updatedAt = Date.now()
        } else {
          state.quickCards.unshift({ id: `qc-${Date.now()}`, title, steps, createdAt: Date.now(), updatedAt: Date.now() })
        }
        state.quickCards = state.quickCards.slice(0, 60)
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/tips/quick/delete' && req.method === 'POST') {
        const body = await readBody(req)
        const state = await loadState(settings)
        state.quickCards = state.quickCards.filter((card) => card.id !== String(body.id ?? ''))
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/tips/quick/hide' && req.method === 'POST') {
        const body = await readBody(req)
        const id = String(body.id ?? '').trim()
        if (!id) return sendJson(res, 400, { ok: false, error: 'id is required' })
        const state = await loadState(settings)
        const hidden = new Set(state.quickHidden)
        if (body.hidden === false) hidden.delete(id)
        else hidden.add(id)
        state.quickHidden = [...hidden]
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/tips/save' && req.method === 'POST') {
        const body = await readBody(req, 1 << 20)
        const state = await loadState(settings)
        const title = String(body.title ?? '').trim().slice(0, 120)
        const text = String(body.text ?? '').trim().slice(0, 20000)
        if (!title && !text) return sendJson(res, 400, { ok: false, error: 'title or text is required' })
        const group = String(body.group ?? '').trim().slice(0, 60)
        const images = (Array.isArray(body.images) ? body.images : [])
          .map((entry) => ({
            src: String(entry?.src ?? ''),
            caption: String(entry?.caption ?? '').slice(0, 200),
          }))
          .filter((entry) => entry.src.startsWith('/comfy-panel/image?path='))
          .slice(0, 8)
        const id = String(body.id ?? '').trim()
        const existing = id ? state.tips.find((tip) => tip.id === id) : null
        if (existing) {
          existing.title = title
          existing.text = text
          existing.group = group
          existing.images = images
          existing.updatedAt = Date.now()
        } else {
          state.tips.unshift({
            id: `tip-${Date.now()}`,
            title,
            text,
            group,
            images,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        }
        state.tips = state.tips.slice(0, 300)
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/tips/delete' && req.method === 'POST') {
        const body = await readBody(req)
        const state = await loadState(settings)
        state.tips = state.tips.filter((tip) => tip.id !== String(body.id ?? ''))
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/tips/hide' && req.method === 'POST') {
        const body = await readBody(req)
        const id = String(body.id ?? '')
        const state = await loadState(settings)
        let tip = state.tips.find((item) => item.id === id)
        if (!tip) {
          if (body.hidden === false) return sendJson(res, 404, { ok: false, error: 'tip not found' })
          // Built-in tips live in code; a hidden stub record suppresses them.
          tip = { id, title: '', text: '', group: '', images: [], hiddenBuiltin: true, createdAt: Date.now(), updatedAt: Date.now() }
          state.tips.push(tip)
        }
        tip.hidden = body.hidden !== false
        if (body.hidden === false && tip.hiddenBuiltin && !String(tip.title ?? '').trim()) {
          state.tips = state.tips.filter((item) => item !== tip)
        }
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/prompts/save' && req.method === 'POST') {
        const body = await readBody(req, 1 << 20)
        const text = String(body.text ?? '').trim().slice(0, 8000)
        if (!text) return sendJson(res, 400, { ok: false, error: 'prompt is empty' })
        const category = String(body.category ?? '').trim().slice(0, 40)
        const state = await loadState(settings)
        const existing = state.favorites.find((entry) => entry.text === text)
        if (existing) {
          existing.category = category
          existing.negative = String(body.negative ?? '').slice(0, 4000)
        } else {
          state.favorites.unshift({
            id: `f-${Date.now()}`,
            text,
            negative: String(body.negative ?? '').slice(0, 4000),
            category,
            at: Date.now(),
          })
        }
        state.favorites = state.favorites.slice(0, 300)
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/prompts/category/rename' && req.method === 'POST') {
        const body = await readBody(req)
        const from = String(body.from ?? '').trim()
        const to = String(body.to ?? '').trim().slice(0, 40)
        if (!from) return sendJson(res, 400, { ok: false, error: 'from is required' })
        const state = await loadState(settings)
        state.favorites = state.favorites.map((entry) => (String(entry.category || '') === from
          ? { ...entry, category: to }
          : entry))
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/prompts/category/delete' && req.method === 'POST') {
        const body = await readBody(req)
        const name = String(body.name ?? '').trim()
        const state = await loadState(settings)
        state.favorites = state.favorites.map((entry) => (String(entry.category || '') === name
          ? { ...entry, category: '' }
          : entry))
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/prompts/update' && req.method === 'POST') {
        const body = await readBody(req, 1 << 20)
        const state = await loadState(settings)
        const entry = state.favorites.find((item) => item.id === String(body.id ?? ''))
        if (!entry) return sendJson(res, 404, { ok: false, error: 'prompt not found' })
        if (typeof body.text === 'string' && body.text.trim()) entry.text = body.text.trim().slice(0, 8000)
        if (typeof body.negative === 'string') entry.negative = body.negative.slice(0, 4000)
        if (typeof body.category === 'string') entry.category = body.category.trim().slice(0, 40)
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/prompts/delete' && req.method === 'POST') {
        const body = await readBody(req)
        const state = await loadState(settings)
        state.favorites = state.favorites.filter((entry) => entry.id !== String(body.id ?? ''))
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/prompts/category' && req.method === 'POST') {
        const body = await readBody(req)
        const state = await loadState(settings)
        const entry = state.favorites.find((item) => item.id === String(body.id ?? ''))
        if (!entry) return sendJson(res, 404, { ok: false, error: 'prompt not found' })
        entry.category = String(body.category ?? '').trim().slice(0, 40)
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/styles/save' && req.method === 'POST') {
        const body = await readBody(req, 1 << 20)
        const name = String(body.name ?? '').trim().slice(0, 60)
        if (!name) return sendJson(res, 400, { ok: false, error: 'preset name is required' })
        const state = await loadState(settings)
        const preset = {
          id: `st-${Date.now()}`,
          name,
          at: Date.now(),
          checkpoint: String(body.checkpoint ?? ''),
          loras: normalizeLoras(body.loras),
          prompt: String(body.prompt ?? '').slice(0, 8000),
          negative: String(body.negative ?? '').slice(0, 4000),
        }
        const existing = state.styles.findIndex((entry) => entry.name === name)
        if (existing >= 0) {
          preset.id = state.styles[existing].id
          state.styles[existing] = preset
        } else {
          state.styles.unshift(preset)
        }
        state.styles = state.styles.slice(0, 100)
        await saveState(settings)
        return sendJson(res, 200, { ok: true, preset, ...state })
      }

      if (route === '/styles/delete' && req.method === 'POST') {
        const body = await readBody(req)
        const state = await loadState(settings)
        state.styles = state.styles.filter((entry) => entry.id !== String(body.id ?? ''))
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/discover/search' && req.method === 'GET') {
        const query = String(url.searchParams.get('q') ?? '').trim().slice(0, 120)
        if (!query) return sendJson(res, 400, { ok: false, error: 'query is required' })
        const kind = url.searchParams.get('kind') === 'lora' ? 'lora' : 'checkpoint'
        const requested = String(url.searchParams.get('source') ?? '')
        const source = DISCOVER_SOURCES[requested] ? requested : 'hf-mirror'
        const base = safeBase(url.searchParams.get('base'), DISCOVER_SOURCES[source])
        const key = `${source}|${base}|${kind}|${query.toLowerCase()}`
        const hit = discoverCache.get(key)
        if (hit && Date.now() - hit.at < DISCOVER_TTL) {
          return sendJson(res, 200, { ok: true, source, kind, cached: true, items: hit.items })
        }
        try {
          const items = source === 'civitai'
            ? await searchCivitai(base, query, kind)
            : await searchHuggingFace(base, query, kind)
          discoverCache.set(key, { at: Date.now(), items })
          if (discoverCache.size > 40) discoverCache.delete([...discoverCache.keys()][0])
          return sendJson(res, 200, { ok: true, source, kind, cached: false, items })
        } catch (error) {
          // A blocked source is a normal outcome here, so the panel renders the
          // reason inline instead of failing the whole request.
          return sendJson(res, 200, {
            ok: true,
            source,
            kind,
            items: [],
            error: String(error?.message ?? error),
          })
        }
      }

      if (route === '/prompt-library' && req.method === 'GET') {
        return sendJson(res, 200, {
          ok: true,
          categories: CATEGORIES,
          negatives: NEGATIVES,
          styles: STYLES,
          hints: ZH_HINTS,
          templates: TEMPLATES,
          aliases: ALIASES,
          recipes: RECIPES.concat(MOE_RECIPES, PASTEL_RECIPES, HANDDRAWN_RECIPES, MOE_STYLE_RECIPES),
          loraNotes: LORA_NOTES,
          checkpointNotes: CHECKPOINT_NOTES,
          builtinTips: BUILTIN_TIPS,
          quickStart: QUICK_START,
        })
      }

      if (route === '/bigjpg/key' && req.method === 'POST') {
        const body = await readBody(req, 1 << 16)
        const state = await loadState(settings)
        const key = String(body.key ?? '').trim().slice(0, 200)
        state.bigjpg = { ...(state.bigjpg || {}), key, updatedAt: Date.now() }
        await saveState(settings)
        return sendJson(res, 200, { ok: true, configured: Boolean(key) })
      }

      if (route === '/bigjpg/status' && req.method === 'GET') {
        const state = await loadState(settings)
        const key = String(state.bigjpg?.key ?? '')
        return sendJson(res, 200, {
          ok: true,
          configured: key.length > 0,
          remaining: Number.isFinite(Number(state.bigjpg?.remaining)) ? Number(state.bigjpg.remaining) : null,
          updatedAt: state.bigjpg?.updatedAt ?? null,
        })
      }

      if (route === '/bigjpg/upscale' && req.method === 'POST') {
        const body = await readBody(req, 1 << 16)
        const state = await loadState(settings)
        const key = String(state.bigjpg?.key ?? '')
        if (!key) return sendJson(res, 400, { ok: false, error: 'bigjpg key is not configured' })
        const name = String(body.name ?? '')
        const scale = Math.min(4, Math.max(1, Number(body.scale) || 2))
        const source = within(path.join(settings.comfyRoot, 'ComfyUI', 'output'), name)
        if (!source) return sendJson(res, 400, { ok: false, error: 'refusing to read outside the output folder' })
        try {
          const info = await stat(source)
          if (!info.isFile()) return sendJson(res, 404, { ok: false, error: 'image not found' })
          if (info.size > 10 * 1024 * 1024) return sendJson(res, 400, { ok: false, error: 'bigjpg accepts images up to 10MB' })
          const fileUrl = await bigjpgUpload(key, source, path.basename(source))
          const task = await bigjpgCreateTask(
            key,
            fileUrl,
            path.basename(source),
            scale,
            String(body.style ?? 'art'),
            String(body.noise ?? '0'),
          )
          if (task.remaining !== null) {
            state.bigjpg.remaining = task.remaining
            await saveState(settings)
          }
          return sendJson(res, 200, { ok: true, tid: task.tid, minute: task.minute, remaining: task.remaining, multiple: BIGJPG_SCALES[scale] })
        } catch (error) {
          return sendJson(res, 502, { ok: false, error: String(error?.message ?? error) })
        }
      }

      if (route === '/bigjpg/write' && req.method === 'POST') {
        const body = await readBody(req, 64 * 1024 * 1024)
        const match = /^data:image\/(png|jpeg|webp);base64,(.+)$/s.exec(String(body.dataUrl ?? ''))
        if (!match) return sendJson(res, 400, { ok: false, error: 'expected an image data URL' })
        const format = String(body.format ?? match[1]).toLowerCase() === 'jpeg' ? 'jpg' : String(body.format ?? match[1]).toLowerCase()
        if (!['png', 'jpg', 'webp'].includes(format)) return sendJson(res, 400, { ok: false, error: 'unsupported format' })
        const buffer = Buffer.from(match[2], 'base64')
        if (buffer.length < 64) return sendJson(res, 400, { ok: false, error: 'image is empty' })
        const dir = 'D:\\bigjpg'
        const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        const raw = String(body.name ?? '').trim().replace(/[^\w.-]/g, '_') || `bigjpg_${stamp}`
        const base = raw.replace(/\.(png|jpe?g|webp)$/i, '')
        const file = `${base}.${format}`
        await mkdir(dir, { recursive: true })
        const full = path.join(dir, file)
        await writeFile(full, buffer)
        return sendJson(res, 200, { ok: true, path: full, bytes: buffer.length, format })
      }

      if (route === '/bigjpg/preview' && req.method === 'GET') {
        const target = String(url.searchParams.get('url') ?? '').trim()
        if (!/^https?:\/\//i.test(target)) return sendJson(res, 400, { ok: false, error: 'invalid url' })
        try {
          const remote = await fetch(target)
          if (!remote.ok) return sendJson(res, 502, { ok: false, error: `preview failed (${remote.status})` })
          const type = remote.headers.get('content-type') || 'image/png'
          if (!/^image\//i.test(type)) return sendJson(res, 415, { ok: false, error: 'not an image' })
          const buffer = Buffer.from(await remote.arrayBuffer())
          res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' })
          res.end(buffer)
          return undefined
        } catch (error) {
          return sendJson(res, 502, { ok: false, error: String(error?.message ?? error) })
        }
      }

      if (route === '/bigjpg/save' && req.method === 'POST') {
        const body = await readBody(req, 1 << 16)
        const target = String(body.url ?? '').trim()
        if (!/^https?:\/\//i.test(target)) return sendJson(res, 400, { ok: false, error: 'invalid url' })
        const dir = 'D:\\bigjpg'
        try {
          const remote = await fetch(target)
          if (!remote.ok) throw new Error(`download failed (${remote.status})`)
          const buffer = Buffer.from(await remote.arrayBuffer())
          const isPng = buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
          const isJpeg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8
          const isWebp = buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'
          if (!isPng && !isJpeg && !isWebp) throw new Error('downloaded file is not an image')
          const ext = path.extname(String(target).split('?')[0]) || '.png'
          const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
          const raw = String(body.name ?? '').trim().replace(/[^\w.-]/g, '_') || `bigjpg_${stamp}`
          const file = raw.toLowerCase().endsWith(ext.toLowerCase()) ? raw : `${raw}${ext}`
          await mkdir(dir, { recursive: true })
          const full = path.join(dir, file)
          await writeFile(full, buffer)
          return sendJson(res, 200, { ok: true, path: full, bytes: buffer.length })
        } catch (error) {
          return sendJson(res, 502, { ok: false, error: String(error?.message ?? error) })
        }
      }

      if (route === '/bigjpg/task' && req.method === 'GET') {
        const state = await loadState(settings)
        const key = String(state.bigjpg?.key ?? '')
        if (!key) return sendJson(res, 400, { ok: false, error: 'bigjpg key is not configured' })
        const tid = String(url.searchParams.get('tid') ?? '').trim()
        if (!tid) return sendJson(res, 400, { ok: false, error: 'tid is required' })
        try {
          const remote = await fetch(`${BIGJPG_API}/api/task/${encodeURIComponent(tid)}`)
          const data = await remote.json().catch(() => ({}))
          const task = data && data[tid] ? data[tid] : null
          if (!task) return sendJson(res, 200, { ok: true, status: 'new', url: '', size: '' })
          if (task.status === 'success' && task.url) {
            // Keep the result on Bigjpg's CDN until the user decides to save it.
            return sendJson(res, 200, {
              ok: true,
              status: 'success',
              url: String(task.url),
              size: String(task.size ?? ''),
              filename: '',
            })
          }
          return sendJson(res, 200, { ok: true, status: String(task.status ?? 'new'), url: '', size: String(task.size ?? '') })
        } catch (error) {
          return sendJson(res, 502, { ok: false, error: String(error?.message ?? error) })
        }
      }

      if (route === '/state' && req.method === 'GET') {
        const state = await loadState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/state' && req.method === 'POST') {
        const body = await readBody(req, 1 << 21)
        const state = await loadState(settings)
        if (body.settings && typeof body.settings === 'object') state.settings = body.settings
        if (Array.isArray(body.favorites)) state.favorites = body.favorites.slice(0, 200)
        if (Array.isArray(body.images)) state.images = body.images.slice(0, 200)
        if (Array.isArray(body.styles)) state.styles = body.styles.slice(0, 100)
        if (Array.isArray(body.history)) state.history = body.history.slice(0, 40)
        await saveState(settings)
        return sendJson(res, 200, { ok: true, ...state })
      }

      if (route === '/generate/options' && req.method === 'GET') {
        const live = await probe(settings.port, settings.host)
        const checkpoints = (await listFolder(path.join(settings.comfyRoot, 'ComfyUI', 'models', 'checkpoints')))
          .filter((file) => /\.(safetensors|ckpt)$/i.test(file.name))
          .map((file) => file.name)
        const loras = (await listFolder(path.join(settings.comfyRoot, 'ComfyUI', 'models', 'loras')))
          .filter((file) => /\.(safetensors|ckpt|pt)$/i.test(file.name))
          .map((file) => file.name)
        const names = live.up ? await samplerOptions(settings) : null
        return sendJson(res, 200, {
          ok: true,
          up: Boolean(live.up),
          checkpoints,
          loras,
          samplers: names?.samplers ?? ['euler', 'dpmpp_2m', 'dpmpp_2m_sde', 'dpmpp_3m_sde', 'dpmpp_sde', 'uni_pc'],
          schedulers: names?.schedulers ?? ['normal', 'karras', 'exponential', 'sgm_uniform', 'simple', 'ddim_uniform'],
        })
      }

      if (route === '/generate' && req.method === 'POST') {
        const body = await readBody(req, 1 << 21)
        const input = normalizeInput(body)
        const result = await startJob(settings, input)
        return sendJson(res, result.ok ? 200 : 400, result)
      }

      if (route === '/generate/status' && req.method === 'GET') {
        const ordered = [...jobs.values()].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12)
        return sendJson(res, 200, { ok: true, jobs: ordered.map(publicJob) })
      }

      if (route === '/generate/cancel' && req.method === 'POST') {
        const body = await readBody(req)
        const result = await cancelJob(settings, String(body.id ?? ''))
        return sendJson(res, result.ok ? 200 : 400, result)
      }

      if (route === '/inpaint' && req.method === 'POST') {
        const body = await readBody(req, 60 * 1024 * 1024)
        const stored = await storeInitImage(settings, { dataUrl: body.image })
        if (!stored.ok) return sendJson(res, 400, { ok: false, error: stored.error || 'bad source image' })
        const mask = await storeInitImage(settings, { dataUrl: body.mask })
        if (!mask.ok) return sendJson(res, 400, { ok: false, error: mask.error || 'bad mask' })

        const loras = Array.isArray(body.loras)
          ? body.loras.slice(0, 6).map((entry) => ({
              name: String(entry?.name ?? '').slice(0, 260),
              weight: clampFloat(entry?.weight, 0, 2, 0.7),
            })).filter((entry) => entry.name)
          : []

        const input = {
          mode: 'inpaint',
          prompt: String(body.prompt ?? '').slice(0, 8000),
          negative: withHandNegative(String(body.negative ?? ''), String(body.prompt ?? '')),
          checkpoint: String(body.checkpoint ?? ''),
          width: Math.round(clampInt(body.width, 64, 2048, 1024) / 8) * 8,
          height: Math.round(clampInt(body.height, 64, 2048, 1024) / 8) * 8,
          steps: clampInt(body.steps, 1, 80, 24),
          cfg: clampFloat(body.cfg, 0.5, 15, 6),
          sampler: String(body.sampler ?? 'dpmpp_2m'),
          scheduler: String(body.scheduler ?? 'karras'),
          seed: clampInt(body.seed, -1, 2 ** 32 - 1, -1),
          clipSkip: clampInt(body.clipSkip, 1, 3, 1),
          batch: 1,
          hires: { enabled: false },
          strength: clampFloat(body.denoise, 0.05, 1, 0.6),
          maskGrow: clampInt(body.maskGrow, 0, 64, 6),
          initImage: stored.image,
          maskImage: mask.image,
          referenceTags: '',
          style: '',
          loras,
          quality: 'inpaint',
        }

        const jobId = `gen-${++jobSeq}`
        const size = { width: input.width, height: input.height }
        const job = {
          id: jobId,
          outWidth: size.width,
          outHeight: size.height,
          state: 'queued',
          mode: 'inpaint',
          params: input,
          seed: input.seed >= 0 ? input.seed : Math.floor(Math.random() * 2 ** 32),
          promptId: null,
          progress: null,
          images: [],
          error: null,
          canceled: false,
          createdAt: Date.now(),
          startedAt: 0,
          finishedAt: 0,
        }
        jobs.set(job.id, job)
        pruneJobs()
        void (async () => {
          try {
            job.state = 'running'
            job.startedAt = Date.now()
            job.progress = { value: 0, max: 0 }
            const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
            const graph = buildInpaintWorkflow(input, job.seed, `comfypanel_inpaint_${stamp}`)
            const submitted = await comfy(
              settings,
              '/prompt',
              {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ prompt: graph, client_id: 'dsh-comfy-panel' }),
              },
              60000,
            )
            if (!submitted?.prompt_id) throw new Error('ComfyUI rejected the prompt')
            job.promptId = submitted.prompt_id
            const deadline = Date.now() + (settings.jobTimeoutMs ?? DEFAULTS.jobTimeoutMs)
            while (Date.now() < deadline) {
              if (job.canceled) throw new Error('canceled')
              await delay(900)
              let history = null
              try {
                history = await comfy(settings, `/history/${encodeURIComponent(job.promptId)}`, {}, 20000)
              } catch {
                const live = await probe(settings.port, settings.host)
                if (!live.up) throw new Error('ComfyUI stopped while generating')
                continue
              }
              const entry = history?.[job.promptId]
              if (!entry) continue
              const status = entry.status?.status_str ?? (entry.outputs ? 'success' : null)
              if (status === 'error') throw new Error(historyError(entry))
              const images = collectImages(entry)
              if (images.length === 0 && status !== 'success') continue
              if (images.length === 0) throw new Error('ComfyUI finished without an output image')
              job.images = images
              job.state = 'done'
              job.progress = { value: 1, max: 1 }
              job.finishedAt = Date.now()
              await recordHistory(settings, job)
              return
            }
            throw new Error('timed out waiting for ComfyUI')
          } catch (error) {
            job.state = job.canceled || String(error?.message) === 'canceled' ? 'canceled' : 'failed'
            job.error = String(error?.message ?? error)
            job.finishedAt = Date.now()
          }
        })()
        return sendJson(res, 200, { ok: true, job: publicJob(job), inputImage: input.initImage })
      }

      if (route === '/inpaint/diff' && req.method === 'POST') {
        const body = await readBody(req, 1 << 20)
        try {
          const result = await inpaintDiff(settings, body.before, body.after)
          return sendJson(res, 200, { ok: true, ...result })
        } catch (error) {
          return sendJson(res, 400, { ok: false, error: String(error?.message ?? error) })
        }
      }

      if (route === '/upload' && req.method === 'POST') {
        const body = await readBody(req, 40 * 1024 * 1024)
        const result = await storeInitImage(settings, body)
        return sendJson(res, result.ok ? 200 : 400, result)
      }

      return sendJson(res, 404, { ok: false, error: `no route ${route}` })
    } catch (error) {
      return sendJson(res, 500, { ok: false, error: String(error?.message ?? error) })
    }
  }

  ctx.effect(() => webServer.register({ kind: 'prefix', path: '/comfy-panel', handler }), 'comfy-panel: http routes')
  ctx.effect(() => () => {
    if (child && !child.killed) {
      try { child.kill() } catch { /* already gone */ }
      child = null
    }
  }, 'comfy-panel: stop the process this plugin spawned on unload')
}
