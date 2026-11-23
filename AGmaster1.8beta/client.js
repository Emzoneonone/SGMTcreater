/**
 * Client half of the ComfyUI panel bundle.
 *
 * Registers the sidebar icon and the main panel: text-to-image and
 * image-to-image generation, LoRA stacking, style presets, a prompt helper, a
 * quality bar, generation history, saved images and server control. Every
 * operation talks to the Host half over the same-origin `/comfy-panel` routes,
 * so the process, folders, queue and saved state have one owner.
 */
window.__ModuleLoader__.load({
  id: '@local/comfy-panel',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'comfy-panel';
    const PANEL_ID = 'comfy';

    /** English copy. */
    const en = {
      tabWorkbench: 'Workbench',
      wbBase: 'Base image',
      wbBaseHint: 'Refines the newest generate result. Load it once, then tune and run.',
      wbUseBase: 'Use this image',
      wbPickBase: 'Pick a base',
      wbNeedBase: 'No generate result yet. Make one on the Generate tab first.',
      wbBaseLoaded: 'Base image loaded',
      wbProgress: 'Progress',
      wbIdle: 'No task running; the bar starts when you refine',
      wbSettings: 'Refine settings',
      wbPromptPlaceholder: 'Optional: describe the tweak, e.g. sharper lineart, warmer light',
      wbRun: 'Refine',
      wbResult: 'Refined result',
      wbUseAsBase: 'Use result as base',
      wbNeedBaseLoaded: 'Load a base image first',
      showMore: 'Show more',
      title: 'AGmaster1.8beta',
      subtitle: 'Local image generation: text to image, image to image, LoRA and style presets.',
      tabGenerate: 'Generate',
      tabInpaint: 'Inpaint',
      inpaintChoose: 'Choose image',
      inpaintLoaded: 'Image loaded',
      inpaintNeedSource: 'Choose an image, or click a thumbnail below',
      inpaintBrushMode: 'Brush',
      inpaintEraser: 'Eraser',
      inpaintTip: 'Paint the area to repaint. Switch to Eraser to undo part of the mask; changing the window size keeps the strokes in place.',
      inpaintEraseMode: 'Erase',
      inpaintBrush: 'Brush size',
      inpaintClearMask: 'Clear mask',
      inpaintSettings: 'Inpaint settings',
      promptPresets: 'Quick prompts',
      inpaintPromptPlaceholder: 'Describe only the area being repainted, e.g. perfect hands, five fingers',
      inpaintDenoise: 'Denoise',
      inpaintGrow: 'Mask grow',
      inpaintRun: 'Repaint area',
      inpaintRunning: 'Repainting…',
      inpaintHint: 'Paint the area to repaint, then run',
      inpaintRecent: 'Recent repairs',
      inpaintRecentManage: 'Manage',
      inpaintProgress: 'Inpaint progress',
      inpaintIdle: 'No inpaint task yet',
      inpaintDoneTag: 'Last run finished',
      inpaintElsewhereRunning: 'An inpaint task is running on the Inpaint tab',
      inpaintResult: 'Inpaint result',
      inpaintContinue: 'Continue editing',
      inpaintDone: 'Inpaint finished',
      inpaintChanged: 'Changed area',
      inpaintBefore: 'Before',
      inpaintAfter: 'After',
      inpaintDiff: 'Change map',
      inpaintNoDiff: 'Change map unavailable in this browser',
      inpaintFileMissing: 'The result file was removed; run the repair again',
      inpaintTinyChange: 'Almost no change: raise denoise or describe the target',
      inpaintNeedMask: 'Paint the area to repaint first',
      inpaintPresetHand: 'Hands',
      inpaintPresetFace: 'Face',
      inpaintPresetHair: 'Hair',
      inpaintPresetFeet: 'Feet',
      inpaintPresetCloth: 'Clothing',
      inpaintPresetFree: 'Free',
      tabPrompt: 'Prompts',
      tabStyles: 'Styles',
      styleManager: 'Style manager',
      styleWords: 'Style words',
      styleTruncated: 'Style too long for one prompt; the tail was cut.',
      chars: 'characters',
      styleTooLong: 'too long, cut before saving',
      selectAll: 'Select all',
      selectNone: 'Clear selection',
      builtinGroupHint: 'Built-in category: rename allowed, delete blocked',
      tabHistory: 'History',
      tabOutputs: 'Outputs',
      tabDiscover: 'Discover',
      tabModels: 'Models',
      tabHelp: 'Help',
      save: 'Save',
      bjNeedKey: 'Set the Bigjpg API key on the Service tab first.',
      bjSource: 'Source',
      bjLatest: 'Latest generation',
      bjStart: 'Upscale',
      bjNoSource: 'Generate an image first, or pick one under Outputs.',
      bjFormat: 'Format',
      bjQuality: 'JPEG quality',
      bjStyleArt: 'Anime / art',
      bjStylePhoto: 'Photo',
      bjBlock: 'Bigjpg result',
      bjStatus: 'Status',
      bjSize: 'Size',
      bjSave: 'Save to D:\\bigjpg',
      bjSavedTo: 'Saved to',
      bjNotSaved: 'Result is still on Bigjpg; not saved yet',
      bjClear: 'Clear',
      bjAgain: 'Run again',
      bjReady: 'Bigjpg finished — review and save it yourself',
      bjTitle: 'Bigjpg upscale',
      bjConfigured: 'Key configured',
      bjNotConfigured: 'No key',
      bjKeyPlaceholder: 'Bigjpg API key (X-API-KEY)',
      bjRemaining: 'Calls left',
      bjHint: 'API needs a paid Bigjpg account; each task returns the remaining count.',
      bjScale: 'Default scale',
      bjStyle: 'Style',
      bjNoise: 'Denoise',
      bjOffer: 'Upscale this one?',
      bjSkip: 'No thanks',
      bjWorking: 'Upscaling…',
      bjDone: 'Upscale finished, saved to outputs',
      bjTimeout: 'Bigjpg did not finish within 10 minutes',
      tabService: 'Service',
      running: 'Running',
      stopped: 'Stopped',
      starting: 'Starting…',
      start: 'Start',
      stop: 'Stop',
      open: 'Open web UI',
      folder: 'Open folder',
      device: 'Device',
      refresh: 'Refresh',
      loading: 'Loading…',
      offline: 'Cannot reach the plugin host routes.',
      modeT2i: 'Text to image',
      modeI2i: 'Image to image',
      checkpoint: 'Model',
      noModels: 'No checkpoint found. Add one under Models.',
      aspect: 'Aspect',
      resolution: 'Resolution',
      width: 'Width',
      height: 'Height',
      swap: 'Swap',
      lockRatio: 'Ratio locked',
      unlockRatio: 'Ratio unlocked',
      style: 'Style tags',
      referenceStyle: 'Reference style',
      referenceNone: 'None',
      referenceHint: 'Appends these style tags without replacing the current style.',
      styleNone: 'None',
      stylePresets: 'My styles',
      stylePresetHint: 'A style bundles model, LoRA, prompt and negative; applying one replaces the prompt.',
      styleGroups: 'Categories',
      tips: 'Tips',
      tipManage: 'Manage tips',
      tipDone: 'Done',
      tipAdd: 'New tip',
      tipEdit: 'Edit',
      tipTitle: 'Title',
      tipNamePlaceholder: 'Tip title',
      tipBodyPlaceholder: 'Write the tip body here…',
      tipText: 'Body',
      tipImageHint: 'Tip: on the Outputs tab, open any image and click “Add image” to attach it here.',
      tipGroup: 'Category',
      tipGroupPlaceholder: 'e.g. CFG / Prompt / LoRA',
      tipImages: 'Images',
      tipAddImage: 'Attach as tip image',
      tipAddFromOutputs: 'From outputs',
      tipRemoveImage: 'Remove',
      tipNoGroup: 'No category',
      tipNeedContent: 'Please fill in a title or body.',
      tipHidden: 'Hidden',
      tipShow: 'Show',
      tipHide: 'Hide',
      confirmDeleteTip: 'Delete this tip?',
      tipEmpty: 'No tips yet. Click New tip to write one.',
      tipSearch: 'Search tips…',
      tipNoMatch: 'No tips match your search.',
      quickTitle: 'Pinned cards',
      quickAdd: 'New card',
      quickTitlePlaceholder: 'Card title',
      quickStepsPlaceholder: 'One step per line',
      confirmDeleteQuick: 'Remove this pinned card?',
      searchResults: 'Search results',
      allGroups: 'All',
      groupBuiltin: 'Built-in',
      groupNone: 'Uncategorized',
      newGroup: 'New category',
      groupReserved: 'That category name is reserved.',
      addStyleWord: 'Add style',
      styleWordName: 'Style name',
      styleWordTags: 'Style tags',
      manageStyles: 'Manage',
      doneManage: 'Done',
      moveToGroup: 'Move to',
      confirmDeleteStyleWord: 'Delete this custom style?',
      confirmDeleteCategory: 'Delete this category? Its prompts move to Uncategorized.',
      categoryManageHint: 'Manage to rename or delete a category.',
      hideStyle: 'Hide',
      edit: 'Edit',
      saveEdit: 'Save',
      cancelEdit: 'Cancel',
      confirmYes: 'Confirm',
      resetStyles: 'Reset defaults',
      confirmResetStyles: 'Restore deleted built-in styles and discard edits?',
      showHidden: 'Hidden',
      restore: 'Restore',
      confirmDeleteGroup: 'Delete this category? Its styles move back to Built-in.',
      noGroups: 'No categories yet.',
      saveStyle: 'Save as style',
      styleNamePlaceholder: 'Style name',
      styleSaved: 'Style saved',
      styleNeedsName: 'Name the style first.',
      deleteStyle: 'Delete style',
      confirmDeleteStyle: 'Delete this style preset?',
      styleApplied: 'Style applied',
      lora: 'LoRA',
      loraEmpty: 'No LoRA installed. Put .safetensors files into models/loras, then refresh.',
      loraNone: 'No LoRA selected.',
      loraWeight: 'Weight',
      manageLoras: 'Manage LoRA',
      hideLoras: 'Hide LoRA',
      loraActive: 'Active',
      loraMissing: 'Some LoRA files are missing and were skipped.',
      quality: 'Quality',
      custom: 'Custom',
      advanced: 'More settings',
      hideAdvanced: 'Hide settings',
      steps: 'Steps',
      cfg: 'CFG',
      sampler: 'Sampler',
      scheduler: 'Scheduler',
      seed: 'Seed',
      seedRandom: 'Random',
      seedLock: 'Roll seed',
      seedAutoHint: 'Empty means a new random seed every run',
      batch: 'Images',
      hires: 'Hires fix',
      hiresScale: 'Upscale',
      hiresDenoise: 'Hires denoise',
      hiresSteps: 'Hires steps',
      hiresHint: 'Local latent upscale; denoise 0.35-0.45 keeps the face, higher re-draws it.',
      clipSkip: 'CLIP skip',
      clipSkipHint: '2 or 3 makes the prompt style-shifted; 1 is the default.',
      autoFavorite: 'Auto-favourite results',
      resetParams: 'Reset parameters',
      useRecommended: 'Recommended sampler',
      strength: 'Strength',
      prompt: 'Prompt',
      promptPlaceholder: '1girl, silver hair, blue eyes, kimono, cherry blossoms, cinematic lighting',
      negative: 'Negative prompt',
      negativePlaceholder: 'lowres, bad anatomy, worst quality, watermark',
      clear: 'Clear',
      favorite: 'Save prompt',
      favoriteToStyle: 'Also save to styles',
      favoriteToStyleHint: 'When on, the saved prompt is also added to the 我的画风词 category.',
      savedToStyle: 'Saved to favorites and styles',
      saved: 'Saved',
      favorites: 'Saved prompts',
      history: 'Recent',
      generationHistory: 'Generation history',
      historyHint: 'Each record keeps its prompt and settings; load them to iterate from a previous result.',
      clearHistory: 'Clear history',
      confirmClearHistory: 'Remove every generation record? Image files stay on disk.',
      confirmDeleteFile: 'Delete this image file from the output folder?',
      confirmDeleteRecord: 'Remove this record from history? The image file stays on disk.',
      chooseImage: 'Choose image',
      dropHint: 'Click to choose an image, or drop one here',
      fromOutputs: 'Pick from outputs',
      removeImage: 'Remove',
      generate: 'Generate',
      generating: 'Generating…',
      queued: 'Queued',
      canceled: 'Canceled.',
      cancel: 'Cancel',
      again: 'Generate again',
      reuseSeed: 'Use this seed',
      copyPrompt: 'Copy prompt',
      copied: 'Copied',
      useAsInit: 'Use for image to image',
      regenerateFrom: 'Redraw from this image',
      openImage: 'Open full size',
      download: 'Download',
      close: 'Close',
      needServer: 'ComfyUI is not running. Start it from the Service tab.',
      needPrompt: 'Write a prompt first.',
      needImage: 'Choose an input image first.',
      needModel: 'Choose a checkpoint first.',
      needUrl: 'Enter a full http(s) URL.',
      hintTitle: 'Prompt hints',
      hintCjk: 'Chinese detected. The model reads English tags:',
      hintQuality: 'No quality tags yet. Anime SDXL models respond well to them.',
      hintQualityAction: 'Add quality tags',
      hintLong: 'tags is long; every tag past 75 competes for attention.',
      hintStrength: 'Strength {v}: low keeps the original composition, high redraws more.',
      randomIdea: 'Random idea',
      addQuality: 'Add quality tags',
      tags: 'Tags',
      searchTags: 'Search tags…',
      styles: 'Style starters',
      negatives: 'Negative presets',
      emptyHistory: 'No generations yet.',
      outputsTitle: 'Outputs',
      emptyOutputs: 'No output images yet.',
      addModel: 'Add a model',
      urlPlaceholder: 'https://…/model.safetensors',
      namePlaceholder: 'filename (optional)',
      downloadModel: 'Download',
      downloading: 'Downloading',
      done: 'Done',
      failed: 'Failed',
      error: 'Error',
      serverTitle: 'Server',
      vram: 'VRAM',
      version: 'Version',
      resultTitle: 'Result',
      noResult: 'Nothing generated yet.',
      elapsed: 'Elapsed',
      runningHint: 'The first run also loads the model into VRAM, so it takes longer.',
      pickModel: 'Choose a model',
      qualityNoteDraft: 'Fastest, good for testing composition.',
      qualityNoteStandard: 'Balanced quality and speed.',
      qualityNoteHigh: 'Adds a hires pass for cleaner detail.',
      qualityNoteUltra: 'Slowest, highest detail.',
      summary: 'Summary',
      remove: 'Remove',
      usePrompt: 'Use prompt',
      load: 'Load',
      deleted: 'Removed',
      loadParams: 'Load settings',
      favoriteImage: 'Save image',
      unfavorite: 'Unsave',
      savedImages: 'Saved images',
      noSavedImages: 'No saved images yet.',
      noHistory: 'No generations yet.',
      saveToFolder: 'Save to folder',
      savedTo: 'Saved to',
      copyImage: 'Copy image',
      copiedImage: 'Image copied',
      unsupported: 'Not supported here',
      deleteFile: 'Delete file',
      deleteRecord: 'Delete record',
      progress: 'Progress',
      queue: 'Queue',
      serviceLog: 'Server log',
      refreshLog: 'Refresh log',
      logEmpty: 'No log output yet.',
      openSaveFolder: 'Open keep folder',
      lastExit: 'Last exit code',
      dynamicVramOff: 'DynamicVRAM is disabled: this build crashes on LoRA patches with it enabled.',
      savedImage: 'Image saved',
      removedImage: 'Image removed',
      discoverTitle: 'Find models and LoRA',
      discoverHint: 'Search a model mirror, then download straight into the right folder. LoRA files land in models/loras, checkpoints in models/checkpoints.',
      kindCheckpoint: 'Checkpoint',
      kindLora: 'LoRA',
      sourceLabel: 'Source',
      sourceHfMirror: 'HF mirror',
      sourceHf: 'HuggingFace',
      sourceCivitai: 'Civitai',
      baseLabel: 'Mirror address',
      searchPlaceholder: 'animagine, illustrious, style lora…',
      search: 'Search',
      searching: 'Searching…',
      noResults: 'No results. Try another keyword or source.',
      discoverFailed: 'Search failed',
      install: 'Download',
      downloadQueued: 'Download started',
      discoverTip: 'A finished download shows up under Models and in the checkpoint / LoRA lists after a refresh.',
      discoverFilterHint: 'Only SDXL-family results are listed; Flux, SD3, LTX and other architectures are filtered out.',
      downloadsCount: 'downloads',
      needQuery: 'Type a keyword first.',
      promptLibrary: 'Prompt library',
      promptSearchPlaceholder: 'Search tags, Chinese works too: 白发 / silver hair',
      allCategories: 'All',
      tagMatches: 'matches',
      noTagMatches: 'No matching tags. Try a shorter word.',
      templates: 'Prompt templates',
      applyTemplate: 'Use template',
      templateApplied: 'Template applied',
      tabExt: 'External',
      extTitle: 'External generation',
      extHint: 'Opens the site in this machine\u2019s browser, fills the prompt and presses send. Sign in once in that window; the profile keeps the session.',
      extOpen: 'Open browser',
      extClose: 'Close browser',
      extReload: 'Reload page',
      extPrompt: 'External prompt',
      extFromCurrent: 'Use current prompt',
      extWait: 'Wait',
      extGenerate: 'Generate there',
      extGenerating: 'Generating on site…',
      extNeedLogin: 'Sign-in required: complete the login in the browser window, then retry.',
      extRunning: 'Browser connected',
      extStopped: 'Browser not running',
      extShot: 'Page screenshot',
      extRefreshShot: 'Refresh screenshot',
      extSaveShot: 'Save screenshot',
      extSavedShot: 'Screenshot saved',
      extDebug: 'Page structure (debug)',
      extClickSelector: 'Selector',
      extClick: 'Click',
      extNotReady: 'Open the browser first and let the page load.',
      extOpened: 'Browser window opened',
      recipes: 'Recommended styles',
      recipeHint: 'Built from the checkpoints and LoRA on this machine: one click sets model, LoRA, size and prompts.',
      applyRecipe: 'Apply',
      recipeApplied: 'Style applied',
      recipeMissing: 'Some model or LoRA files are missing and were skipped',
      promptCategories: 'Categories',
      allPrompts: 'All',
      uncategorized: 'Uncategorized',
      newCategory: 'New category',
      savePrompt: 'Save current prompt',
      promptSaved: 'Saved to',
      moveTo: 'Move to',
      deletePrompt: 'Delete',
      confirmDeletePrompt: 'Delete this saved prompt?',
      loraStyle: 'Style',
      modelStyle: 'Model style',
      modelRecommend: 'Suggested',
      recommended: 'Recommended',
      mixer: 'Idea mixer',
      mixerHint: 'Pick groups, then roll fresh tag combinations.',
      mixCount: 'Combinations',
      rollCombos: 'Roll',
      applyCombo: 'Use',
      tidyPrompt: 'Tidy prompt',
      tidyDone: 'Prompt tidied',
      combosEmpty: 'Roll to get combinations.',
    };


    /** Simplified Chinese copy. */
    const zh = {
      tabWorkbench: '工作台',
      wbBase: '底图',
      wbBaseHint: '用于精细化调整最近一次生成页的结果。载入后调参并运行。',
      wbUseBase: '使用这张图',
      wbPickBase: '选择底图',
      wbNeedBase: '还没有生成结果，请先在生成页生成一张。',
      wbBaseLoaded: '底图已载入',
      wbProgress: '进度',
      wbIdle: '当前没有任务，点击「开始微调」后开始',
      wbSettings: '微调设置',
      wbPromptPlaceholder: '可选：描述要微调的方向，例如 sharper lineart, warmer light',
      wbRun: '开始微调',
      wbResult: '微调结果',
      wbUseAsBase: '把结果作为新底图',
      wbNeedBaseLoaded: '请先载入底图',
      showMore: '查看更多',
      title: 'AGmaster1.8beta',
      subtitle: '本机绘图：文生图、图生图、LoRA 与画风预设。',
      tabGenerate: '生成',
      tabInpaint: '局部修复',
      inpaintChoose: '选择图片',
      inpaintLoaded: '已载入图片',
      inpaintNeedSource: '选择一张图片，或点击下方缩略图',
      inpaintBrushMode: '涂抹',
      inpaintEraser: '橡皮擦',
      inpaintTip: '涂抹要重绘的区域；用橡皮擦可以局部撤销涂抹。缩放窗口后笔画仍会留在原位置。',
      inpaintEraseMode: '擦除',
      inpaintBrush: '笔刷大小',
      inpaintClearMask: '清空蒙版',
      inpaintSettings: '修复设置',
      promptPresets: '快捷提示词',
      inpaintPromptPlaceholder: '只描述要重绘的区域，例如 perfect hands, five fingers',
      inpaintDenoise: '重绘强度',
      inpaintGrow: '蒙版扩展',
      inpaintRun: '重绘所选区域',
      inpaintRunning: '正在重绘…',
      inpaintHint: '先涂抹要重绘的区域，再点开始',
      inpaintRecent: '最近修复',
      inpaintRecentManage: '管理',
      inpaintProgress: '修复进度',
      inpaintIdle: '还没有修复任务',
      inpaintDoneTag: '上次已完成',
      inpaintElsewhereRunning: '「局部修复」页有任务正在运行',
      inpaintResult: '修复结果',
      inpaintContinue: '继续编辑这张',
      inpaintDone: '局部修复完成',
      inpaintChanged: '变化区域',
      inpaintBefore: '修复前',
      inpaintAfter: '修复后',
      inpaintDiff: '变化分布',
      inpaintNoDiff: '当前浏览器无法生成变化示意图',
      inpaintFileMissing: '结果文件已被删除，请重新修复',
      inpaintTinyChange: '几乎没有变化：可提高重绘强度或写明目标内容',
      inpaintNeedMask: '请先涂抹要重绘的区域',
      inpaintPresetHand: '手部',
      inpaintPresetFace: '面部',
      inpaintPresetHair: '头发',
      inpaintPresetFeet: '脚部',
      inpaintPresetCloth: '衣物',
      inpaintPresetFree: '自由',
      tabPrompt: '提示词',
      tabStyles: '画风管理',
      styleManager: '画风管理',
      styleWords: '画风词',
      styleTruncated: '画风词过长，超出部分已截断。',
      chars: '字符',
      styleTooLong: '超出上限，保存时会截断',
      selectAll: '全选',
      selectNone: '取消选择',
      builtinGroupHint: '内置分类：可改名，不可删除',
      tabHistory: '历史',
      tabOutputs: '输出',
      tabDiscover: '发现',
      tabModels: '模型',
      tabHelp: '帮助',
      save: '保存',
      bjNeedKey: '请先到「服务」页配置 Bigjpg API Key。',
      bjSource: '源图',
      bjLatest: '最近生成的图',
      bjStart: '开始放大',
      bjNoSource: '先生成一张图，或在「输出」页选一张。',
      bjFormat: '格式',
      bjQuality: 'JPEG 质量',
      bjStyleArt: '插画',
      bjStylePhoto: '照片',
      bjBlock: 'Bigjpg 结果',
      bjStatus: '状态',
      bjSize: '尺寸',
      bjSave: '保存到 D:\\bigjpg',
      bjSavedTo: '已保存到',
      bjNotSaved: '结果还在 Bigjpg 服务器上，尚未保存',
      bjClear: '清除',
      bjAgain: '再放一次',
      bjReady: 'Bigjpg 放大完成，请自行确认并保存',
      bjTitle: 'Bigjpg 放大',
      bjConfigured: '已配置密钥',
      bjNotConfigured: '未配置',
      bjKeyPlaceholder: 'Bigjpg API Key（X-API-KEY）',
      bjRemaining: '剩余调用次数',
      bjHint: 'API 需要有效期内的付费账号；每次建任务会返回剩余次数。',
      bjScale: '默认倍率',
      bjStyle: '类型',
      bjNoise: '降噪',
      bjOffer: '要放大这张图吗？',
      bjSkip: '不用',
      bjWorking: '放大中…',
      bjDone: '放大完成，已保存到输出',
      bjTimeout: 'Bigjpg 超过 10 分钟仍未完成',
      tabService: '服务',
      running: '运行中',
      stopped: '未启动',
      starting: '启动中…',
      start: '启动',
      stop: '停止',
      open: '打开界面',
      folder: '打开文件夹',
      device: '设备',
      refresh: '刷新',
      loading: '加载中…',
      offline: '无法连接插件后台接口。',
      modeT2i: '文生图',
      modeI2i: '图生图',
      checkpoint: '模型',
      noModels: '没有找到模型，请先在「模型」里添加。',
      aspect: '画幅',
      resolution: '分辨率',
      width: '宽',
      height: '高',
      swap: '交换',
      lockRatio: '已锁定比例',
      unlockRatio: '比例未锁定',
      style: '画风词',
      referenceStyle: '参考画风',
      referenceNone: '不使用',
      referenceHint: '只叠加该画风的标签，不替换当前画风。',
      styleNone: '无',
      stylePresets: '我的画风',
      stylePresetHint: '画风预设包含底模、LoRA、提示词与负向；套用时会替换当前提示词。',
      styleGroups: '分类',
      tips: '提示',
      tipManage: '管理提示',
      tipDone: '完成',
      tipAdd: '新建提示',
      tipEdit: '编辑',
      tipTitle: '标题',
      tipNamePlaceholder: '提示标题',
      tipBodyPlaceholder: '在这里写提示正文…',
      tipText: '正文',
      tipImageHint: '提示：在「输出」页点开任意图片，点「加为提示配图」即可挂到这条提示上。',
      tipGroup: '分类',
      tipGroupPlaceholder: '如 CFG / 提示词 / LoRA',
      tipImages: '配图',
      tipAddImage: '加为提示配图',
      tipAddFromOutputs: '从输出中选择',
      tipRemoveImage: '移除',
      tipNoGroup: '未分类',
      tipNeedContent: '请填写标题或正文。',
      tipHidden: '已隐藏',
      tipShow: '显示',
      tipHide: '隐藏',
      confirmDeleteTip: '确定删除这条提示？',
      tipEmpty: '还没有提示，点「新建提示」写一条。',
      tipSearch: '搜索提示…',
      tipNoMatch: '没有匹配的提示。',
      quickTitle: '置顶卡片',
      quickAdd: '新建卡片',
      quickTitlePlaceholder: '卡片标题',
      quickStepsPlaceholder: '每行一个步骤',
      confirmDeleteQuick: '确定移除这张置顶卡片？',
      searchResults: '搜索结果',
      allGroups: '全部',
      groupBuiltin: '内置',
      groupNone: '未分类',
      newGroup: '新建分类',
      groupReserved: '该分类名已被系统占用。',
      addStyleWord: '添加画风词',
      styleWordName: '画风名称',
      styleWordTags: '风格标签',
      manageStyles: '管理',
      doneManage: '完成',
      moveToGroup: '移动到',
      confirmDeleteStyleWord: '确定删除这个自定义画风词？',
      confirmDeleteCategory: '删除这个分类？其下的提示词会回到「未分类」。',
      categoryManageHint: '「管理」里可重命名或删除分类。',
      hideStyle: '隐藏',
      edit: '编辑',
      saveEdit: '保存',
      cancelEdit: '取消',
      confirmYes: '确认删除',
      resetStyles: '恢复默认',
      confirmResetStyles: '恢复已删除的内置画风词并丢弃修改？',
      showHidden: '已隐藏',
      restore: '恢复',
      confirmDeleteGroup: '删除这个分类？其下的画风会回到「内置」。',
      noGroups: '还没有自定义分类。',
      saveStyle: '存为画风',
      styleNamePlaceholder: '画风名称',
      styleSaved: '画风已保存',
      styleNeedsName: '请先给画风起个名字。',
      deleteStyle: '删除画风',
      confirmDeleteStyle: '确定删除这个画风预设？',
      styleApplied: '已套用画风',
      lora: 'LoRA',
      loraEmpty: '还没有 LoRA。把 .safetensors 放进 models/loras 后点刷新。',
      loraNone: '未启用 LoRA。',
      loraWeight: '权重',
      manageLoras: '管理 LoRA',
      hideLoras: '收起 LoRA',
      loraActive: '已启用',
      loraMissing: '部分 LoRA 文件不存在，已自动跳过。',
      quality: '质量',
      custom: '自定义',
      advanced: '更多设置',
      hideAdvanced: '收起设置',
      steps: '步数',
      cfg: 'CFG',
      sampler: '采样器',
      scheduler: '调度器',
      seed: '种子',
      seedRandom: '随机',
      seedLock: '换一个种子',
      seedAutoHint: '留空表示每次生成都用新的随机种子',
      batch: '张数',
      hires: '高清修复',
      hiresScale: '放大倍数',
      hiresDenoise: '修复重绘',
      hiresSteps: '修复步数',
      hiresHint: '本地潜空间放大；重绘强度 0.35–0.45 保人物，越高越会重画五官。',
      clipSkip: 'CLIP 跳过层',
      clipSkipHint: '2–3 会让画风更发散；默认 1。',
      autoFavorite: '自动收藏结果',
      resetParams: '重置参数',
      useRecommended: '推荐采样器',
      strength: '重绘强度',
      prompt: '提示词',
      promptPlaceholder: '1girl, silver hair, blue eyes, kimono, cherry blossoms, cinematic lighting',
      negative: '负向提示词',
      negativePlaceholder: 'lowres, bad anatomy, worst quality, watermark',
      clear: '清空',
      favorite: '收藏提示词',
      favoriteToStyle: '同时加入画风',
      favoriteToStyleHint: '开启后，收藏的提示词会同时加入「我的画风词」分类。',
      savedToStyle: '已保存到收藏与画风',
      saved: '已收藏',
      favorites: '收藏的提示词',
      history: '最近生成',
      generationHistory: '生成记录',
      historyHint: '每条记录保留当次的提示词与参数，载入后可在此基础上继续调整。',
      clearHistory: '清空记录',
      confirmClearHistory: '确定清空所有生成记录？图片文件仍会保留在输出文件夹。',
      confirmDeleteFile: '确定从输出文件夹删除这张图片？',
      confirmDeleteRecord: '确定删除这条记录？图片文件仍会保留。',
      chooseImage: '选择图片',
      dropHint: '点击选择图片，或把图片拖到这里',
      fromOutputs: '从输出中选择',
      removeImage: '移除',
      generate: '生成',
      generating: '生成中…',
      queued: '排队中',
      canceled: '已取消。',
      cancel: '取消',
      again: '再来一张',
      reuseSeed: '复用此种子',
      copyPrompt: '复制提示词',
      copied: '已复制',
      useAsInit: '用于图生图',
      regenerateFrom: '以此图重画',
      openImage: '查看大图',
      download: '下载',
      close: '关闭',
      needServer: 'ComfyUI 未运行，请到「服务」里启动。',
      needPrompt: '请先填写提示词。',
      needImage: '请先选择输入图片。',
      needModel: '请先选择模型。',
      needUrl: '请填写完整的 http(s) 地址。',
      hintTitle: '提示词提示',
      hintCjk: '检测到中文，模型只认英文标签：',
      hintQuality: '还没有画质词，动画类 SDXL 模型对画质词很敏感。',
      hintQualityAction: '补全画质词',
      hintLong: '个标签偏多，超过 75 个后每个标签的权重都会被稀释。',
      hintStrength: '重绘强度 {v}：低数值保留原图构图，高数值改动更多。',
      randomIdea: '随机灵感',
      addQuality: '补全画质词',
      tags: '标签',
      searchTags: '搜索标签…',
      styles: '风格模板',
      negatives: '负向预设',
      emptyHistory: '还没有生成记录。',
      outputsTitle: '输出',
      emptyOutputs: '还没有输出图片。',
      addModel: '添加模型',
      urlPlaceholder: 'https://…/model.safetensors',
      namePlaceholder: '文件名（可选）',
      downloadModel: '下载',
      downloading: '下载中',
      done: '完成',
      failed: '失败',
      error: '错误',
      serverTitle: '服务',
      vram: '显存',
      version: '版本',
      resultTitle: '结果',
      noResult: '还没有生成结果。',
      elapsed: '耗时',
      runningHint: '首次生成还要把模型加载进显存，会比较慢。',
      pickModel: '选择模型',
      qualityNoteDraft: '最快，适合试探构图。',
      qualityNoteStandard: '质量与速度平衡。',
      qualityNoteHigh: '增加一次高清修复，细节更干净。',
      qualityNoteUltra: '最慢，细节最多。',
      summary: '当前设置',
      remove: '移除',
      usePrompt: '使用提示词',
      load: '载入',
      deleted: '已移除',
      loadParams: '载入参数',
      favoriteImage: '收藏图片',
      unfavorite: '取消收藏',
      savedImages: '收藏的图片',
      noSavedImages: '还没有收藏的图片。',
      noHistory: '还没有生成记录。',
      saveToFolder: '保存到文件夹',
      savedTo: '已保存到',
      copyImage: '复制图片',
      copiedImage: '图片已复制',
      unsupported: '当前环境不支持',
      deleteFile: '删除文件',
      deleteRecord: '删除记录',
      progress: '进度',
      queue: '队列',
      serviceLog: '服务日志',
      refreshLog: '刷新日志',
      logEmpty: '暂无日志输出。',
      openSaveFolder: '打开保存文件夹',
      lastExit: '上次退出码',
      dynamicVramOff: '已关闭 DynamicVRAM：本版本开启时应用 LoRA 会崩溃。',
      savedImage: '图片已收藏',
      removedImage: '已取消收藏',
      discoverTitle: '寻找底模与 LoRA',
      discoverHint: '在镜像源里搜索，直接下载到对应文件夹：LoRA 进 models/loras，底模进 models/checkpoints。',
      kindCheckpoint: '底模',
      kindLora: 'LoRA',
      sourceLabel: '来源',
      sourceHfMirror: 'HF 镜像',
      sourceHf: 'HuggingFace',
      sourceCivitai: 'Civitai',
      baseLabel: '镜像地址',
      searchPlaceholder: 'animagine、illustrious、style lora…',
      search: '搜索',
      searching: '搜索中…',
      noResults: '没有结果，换个关键词或来源试试。',
      discoverFailed: '搜索失败',
      install: '下载',
      downloadQueued: '已开始下载',
      discoverTip: '下载完成后，在「模型」页和底模 / LoRA 列表里刷新即可看到。',
      discoverFilterHint: '只显示 SDXL 系模型；Flux、SD3、LTX 等其他架构会被过滤掉。',
      downloadsCount: '次下载',
      needQuery: '请先输入关键词。',
      promptLibrary: '提示词库',
      promptSearchPlaceholder: '搜索标签，支持中文：白发 / silver hair',
      allCategories: '全部',
      tagMatches: '个匹配',
      noTagMatches: '没有匹配的标签，试试更短的关键词。',
      templates: '完整提示词范例',
      applyTemplate: '套用',
      templateApplied: '已套用范例',
      tabExt: '外站生成',
      extTitle: '外站生成（Krene）',
      extHint: '用本机浏览器打开外站，自动填入提示词并点击生成；首次需要在该窗口登录一次，之后会记住登录状态。',
      extOpen: '打开浏览器',
      extClose: '关闭浏览器',
      extReload: '重新加载页面',
      extPrompt: '外站提示词',
      extFromCurrent: '带入当前提示词',
      extWait: '等待',
      extGenerate: '外站生成',
      extGenerating: '正在外站生成…',
      extNeedLogin: '需要登录：请在打开的浏览器窗口里完成登录，然后重试。',
      extRunning: '浏览器已连接',
      extStopped: '浏览器未运行',
      extShot: '页面截图',
      extRefreshShot: '刷新截图',
      extSaveShot: '保存截图',
      extSavedShot: '截图已保存',
      extDebug: '页面结构（调试）',
      extClickSelector: '选择器',
      extClick: '点击',
      extNotReady: '请先打开浏览器并等待页面加载。',
      extOpened: '浏览器窗口已打开',
      recipes: '推荐画风',
      recipeHint: '根据本机已装的底模与 LoRA 配好：一键设置模型、LoRA、尺寸与提示词。',
      applyRecipe: '套用',
      recipeApplied: '已套用推荐画风',
      recipeMissing: '部分模型或 LoRA 未安装，已跳过',
      promptCategories: '分类',
      allPrompts: '全部',
      uncategorized: '未分类',
      newCategory: '新分类名',
      savePrompt: '收藏当前提示词',
      promptSaved: '已收藏到',
      moveTo: '移动到',
      deletePrompt: '删除',
      confirmDeletePrompt: '确定删除这条收藏？',
      loraStyle: '画风',
      modelStyle: '模型画风',
      modelRecommend: '建议参数',
      recommended: '推荐权重',
      mixer: '灵感组合',
      mixerHint: '勾选分类，随机组合出新的提示词。',
      mixCount: '组合数',
      rollCombos: '摇一批',
      applyCombo: '使用',
      tidyPrompt: '整理提示词',
      tidyDone: '提示词已整理',
      combosEmpty: '点「摇一批」生成组合。',
    };


    /** Quality presets: the settings bar that controls generation quality. */
    const QUALITY = [
      { id: 'draft', zh: '草稿', en: 'Draft', steps: 16, cfg: 4.5, hires: null, note: 'qualityNoteDraft' },
      { id: 'standard', zh: '标准', en: 'Standard', steps: 26, cfg: 5, hires: null, note: 'qualityNoteStandard' },
      {
        id: 'high', zh: '高清', en: 'High', steps: 32, cfg: 5.5,
        hires: { enabled: true, scale: 1.5, denoise: 0.45, steps: 14 }, note: 'qualityNoteHigh',
      },
      {
        id: 'ultra', zh: '极致', en: 'Ultra', steps: 40, cfg: 6,
        hires: { enabled: true, scale: 1.6, denoise: 0.5, steps: 18 }, note: 'qualityNoteUltra',
      },
    ];

    /** Aspect presets kept near SDXL's native pixel budget. */
    const ASPECTS = [
      { label: '1:1', width: 1024, height: 1024 },
      { label: '2:3', width: 832, height: 1216 },
      { label: '3:2', width: 1216, height: 832 },
      { label: '3:4', width: 896, height: 1152 },
      { label: '4:3', width: 1152, height: 896 },
      { label: '9:16', width: 768, height: 1344 },
      { label: '16:9', width: 1344, height: 768 },
    ];

    /** Default mirror addresses for the discover tab. */
    const DISCOVER_BASES = {
      'hf-mirror': 'https://hf-mirror.com',
      huggingface: 'https://huggingface.co',
      civitai: 'https://civitai.com',
    };

    const TABS = [
      { id: 'generate', key: 'tabGenerate' },
      { id: 'inpaint', key: 'tabInpaint' },
      { id: 'prompt', key: 'tabPrompt' },
      { id: 'styles', key: 'tabStyles' },
      { id: 'history', key: 'tabHistory' },
      { id: 'outputs', key: 'tabOutputs' },
      { id: 'discover', key: 'tabDiscover' },
      { id: 'workbench', key: 'tabWorkbench' },
      { id: 'models', key: 'tabModels' },
      { id: 'help', key: 'tabHelp' },
      { id: 'service', key: 'tabService' },
    ];

    const CFG_HELP_IMAGES = [
      { src: '/comfy-panel/image?path=' + encodeURIComponent('cfg-3.png'), caption: 'CFG 3：线条细软、颜色偏淡' },
      { src: '/comfy-panel/image?path=' + encodeURIComponent('cfg-5.png'), caption: 'CFG 5：细节更实，仍然柔和' },
      { src: '/comfy-panel/image?path=' + encodeURIComponent('cfg-7.png'), caption: 'CFG 7：结构清晰、对比变硬' },
      { src: '/comfy-panel/image?path=' + encodeURIComponent('cfg-10.png'), caption: 'CFG 10：颜色发闷、边缘发焦' },
    ];

    const OFF_HIRES = { enabled: false, scale: 1.5, denoise: 0.45, steps: 14 };
    const INPAINT_PRESETS = [
      { id: 'hand', key: 'inpaintPresetHand', prompt: 'perfect hands, detailed hands, correct hands, five fingers, well-drawn fingers, natural hand anatomy' },
      { id: 'face', key: 'inpaintPresetFace', prompt: 'detailed face, beautiful eyes, clean lineart, symmetrical eyes, natural skin shading' },
      { id: 'hair', key: 'inpaintPresetHair', prompt: 'detailed hair, sharp hair strands, clean hair edges, natural highlights' },
      { id: 'feet', key: 'inpaintPresetFeet', prompt: 'detailed feet, correct foot anatomy, five toes, clean lines' },
      { id: 'cloth', key: 'inpaintPresetCloth', prompt: 'clean clothing folds, crisp outlines, consistent fabric shading' },
      { id: 'free', key: 'inpaintPresetFree', prompt: '' },
    ];

    const BIGJPG_LABELS = { 1: '2x', 2: '4x', 3: '8x', 4: '16x' };

    const DEFAULT_FORM = {
      mode: 't2i',
      prompt: '',
      negative: 'lowres, bad anatomy, bad hands, text, error, missing finger, extra digits, fewer digits, cropped, worst quality, low quality, low score, bad score, average score, signature, watermark, username, blurry',
      checkpoint: '',
      width: 1024,
      height: 1024,
      steps: 26,
      cfg: 5,
      sampler: 'dpmpp_2m',
      scheduler: 'karras',
      seed: -1,
      batch: 1,
      hires: OFF_HIRES,
      strength: 0.6,
      clipSkip: 1,
      autoFavorite: false,
      style: '',
      recipe: '',
      referenceStyle: '',
      preset: '',
      loras: [],
      initImage: null,
    };

    const CSS = `
      .cp-root { display: flex; flex-direction: column; height: 100%; min-height: 0; box-sizing: border-box; overflow: auto; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); }
      .cp-head { position: sticky; top: 0; z-index: 3; display: flex; align-items: center; gap: 12px; padding: 14px 24px; background: var(--dsw-alias-bg-base); border-bottom: .5px solid var(--dsw-alias-border-l1); }
      .cp-heading { flex: 1; min-width: 0; }
      .cp-title { margin: 0; font-size: 16px; font-weight: 600; line-height: 1.35; letter-spacing: -.01em; }
      .cp-sub { margin: 2px 0 0; overflow: hidden; font-size: 12px; line-height: 1.4; color: var(--dsw-alias-label-secondary); white-space: nowrap; text-overflow: ellipsis; }
      .cp-pill { flex: none; display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 10px; border-radius: 999px; font-size: 12px; line-height: 1; border: .5px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary); max-width: 420px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .cp-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dsw-alias-state-idle-primary); flex: none; }
      .cp-pill[data-up='true'] { color: var(--dsw-alias-state-success-primary); border-color: var(--dsw-alias-state-success-primary); }
      .cp-pill[data-up='true'] .cp-dot { background: var(--dsw-alias-state-success-primary); }
      .cp-body { width: 100%; max-width: 1180px; margin: 0 auto; padding: 14px 24px 40px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px; }
      .cp-tabs { display: flex; gap: 4px; padding: 3px; border: .5px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); align-self: flex-start; flex-wrap: wrap; }
      .cp-tab { height: 28px; padding: 0 14px; border: 0; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; line-height: 1; cursor: pointer; }
      .cp-tab:hover { color: var(--dsw-alias-label-primary); }
      .cp-tab[data-active='true'] { background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); box-shadow: 0 0 0 .5px var(--dsw-alias-border-l1); }
      .cp-tab:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
      .cp-banner { display: flex; align-items: flex-start; gap: 10px; padding: 9px 12px; border: .5px solid var(--dsw-alias-border-l1); border-left: 2px solid var(--dsw-alias-state-error-primary); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); font-size: 12px; color: var(--dsw-alias-state-error-primary); }
      .cp-banner > span { flex: 1; min-width: 0; word-break: break-word; }
            .cp-inpaint-wrap { display: flex; flex-direction: column; gap: 8px; }
      .cp-inpaint-stage { position: relative; display: block; width: 100%; max-width: 100%; line-height: 0; }
      .cp-inpaint-img { display: block; width: 100%; max-width: 100%; height: auto; border-radius: 8px; user-select: none; }
      /* the canvas must occupy exactly the image box; it is stretched only by CSS */
      .cp-inpaint-mask { position: absolute; inset: 0; width: 100%; height: 100%; display: block; cursor: crosshair; touch-action: none; border-radius: 8px; pointer-events: auto; }
      .cp-inpaint-tools { position: absolute; top: 8px; left: 8px; z-index: 2; display: flex; gap: 6px; }
      .cp-inpaint-tools .cp-chip { backdrop-filter: blur(4px); }
      .cp-bottom-generate { display: flex; align-items: center; gap: 10px; padding: 8px 0 24px; }
      .cp-bottom-generate .cp-btn { min-width: 180px; }
      .cp-wb-base { display: block; width: 220px; height: auto; border-radius: 8px; border: .5px solid var(--dsw-alias-border-l1); }
      .cp-thumb-sm { width: 64px; height: 64px; }
      .cp-thumb-sm img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
      .cp-tab-view[data-active="false"] { display: none; }
      .cp-inpaint-compare { display: flex; gap: 10px; flex-wrap: wrap; }
      .cp-inpaint-figure { margin: 0; display: flex; flex-direction: column; gap: 4px; align-items: center; }
      .cp-inpaint-thumb-empty { display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; color: var(--dsw-alias-label-secondary); padding: 6px; box-sizing: border-box; }
      .cp-inpaint-thumb { display: block; width: 168px; height: 168px; object-fit: contain; background: var(--dsw-alias-bg-layer-2); border-radius: 8px; border: .5px solid var(--dsw-alias-border-l1); }
      .cp-inpaint-result { display: block; max-width: 100%; max-height: 70vh; width: auto; height: auto; object-fit: contain; border-radius: 8px; }
      .cp-textarea-sm { min-height: 48px; }
.cp-workspace { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 372px); gap: 14px; align-items: start; }
      @media (max-width: 1000px) { .cp-workspace { grid-template-columns: minmax(0, 1fr); } .cp-result { position: static; } }
      .cp-col { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
      .cp-card { border: .5px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); }
      .cp-card-head { display: flex; align-items: center; gap: 10px; padding: 11px 13px; border-bottom: .5px solid var(--dsw-alias-border-l1); flex-wrap: wrap; }
      .cp-card-title { flex: 1; margin: 0; font-size: 12.5px; font-weight: 600; }
      .cp-card-body { padding: 12px 13px; display: flex; flex-direction: column; gap: 10px; }
      .cp-rowline { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .cp-grow { flex: 1; min-width: 150px; }
      .cp-seg { display: inline-flex; padding: 2px; border: .5px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-base); flex: none; }
      .cp-seg-item { height: 26px; padding: 0 12px; border: 0; border-radius: 6px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; line-height: 1; cursor: pointer; }
      .cp-seg-item[data-active='true'] { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
      .cp-seg-item:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
      .cp-quality { border: .5px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); overflow: hidden; }
      .cp-quality-head { display: flex; align-items: center; gap: 10px; padding: 10px 12px 8px; flex-wrap: wrap; }
      .cp-qtitle { font-size: 12px; font-weight: 600; }
      .cp-qchips { display: flex; gap: 6px; flex: 1; flex-wrap: wrap; }
      .cp-qchip { height: 26px; padding: 0 12px; border: .5px solid var(--dsw-alias-border-l1); border-radius: 999px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; line-height: 1; cursor: pointer; }
      .cp-qchip:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }
      .cp-qchip[data-active='true'] { border-color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font-weight: 600; box-shadow: inset 0 0 0 1px var(--dsw-alias-brand-primary); }
      .cp-qchip[data-active='true']:hover { background: var(--dsw-alias-bg-layer-2); }
      .cp-qsummary { padding: 0 12px 10px; display: flex; gap: 10px; flex-wrap: wrap; font-size: 11.5px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
      .cp-qsummary b { font-weight: 500; color: var(--dsw-alias-label-primary); }
      .cp-adv { border-top: .5px solid var(--dsw-alias-border-l1); padding: 10px 12px 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px 18px; background: var(--dsw-alias-bg-layer-2); }
      .cp-prop { display: flex; flex-direction: column; gap: 5px; font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
      .cp-prop-head { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
      .cp-prop-value { color: var(--dsw-alias-label-primary); font-variant-numeric: tabular-nums; }
      .cp-range { width: 100%; accent-color: var(--dsw-alias-brand-primary); }
      .cp-input, .cp-select { height: 28px; box-sizing: border-box; padding: 0 9px; border: .5px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; }
      .cp-select option { background-color: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); }
      .cp-select option:checked { background-color: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
      .cp-input:focus, .cp-select:focus { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -1px; }
      .cp-input[data-grow='true'] { flex: 1; min-width: 160px; }
      .cp-input[data-name='true'] { width: 190px; }
      .cp-textarea { width: 100%; box-sizing: border-box; min-height: 92px; resize: vertical; padding: 10px 11px; border: .5px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font: inherit; font-size: 12.5px; line-height: 1.6; }
      .cp-textarea:focus { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -1px; }
      .cp-textarea[data-short='true'] { min-height: 62px; font-size: 12px; }
      .cp-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .cp-chip { height: 24px; padding: 0 9px; border: .5px solid var(--dsw-alias-border-l1); border-radius: 999px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 11.5px; line-height: 1; cursor: pointer; white-space: nowrap; max-width: 240px; overflow: hidden; text-overflow: ellipsis; }
      .cp-chip:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
      .cp-chip[data-active='true'] { border-color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font-weight: 600; box-shadow: inset 0 0 0 1px var(--dsw-alias-brand-primary); }
      .cp-chip[data-tone='preset'] { border-style: dashed; }
      .cp-hint { display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; border: .5px solid var(--dsw-alias-border-l1); border-left: 2px solid var(--dsw-alias-brand-primary); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); font-size: 11.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
      .cp-hint-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
      .cp-hint-tag { display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 8px; border: .5px solid var(--dsw-alias-border-l1); border-radius: 6px; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font-size: 11px; cursor: pointer; }
      .cp-hint-tag:hover { border-color: var(--dsw-alias-brand-primary); }
      .cp-warn { color: var(--dsw-alias-state-warn-primary); }
      .cp-btn { height: 28px; padding: 0 12px; border: .5px solid var(--dsw-alias-border-l1); border-radius: 8px; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; line-height: 1; cursor: pointer; transition: background .12s ease; white-space: nowrap; }
      .cp-btn:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2); }
      .cp-btn:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
      .cp-btn:disabled { color: var(--dsw-alias-state-idle-primary); cursor: default; }
      .cp-btn[data-primary='true'] { border-color: transparent; background: var(--dsw-alias-label-primary); color: var(--dsw-alias-bg-base); }
      .cp-btn[data-primary='true']:hover:not(:disabled) { filter: brightness(1.12); }
      .cp-btn[data-primary='true']:disabled { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-state-idle-primary); }
      .cp-btn[data-small='true'] { height: 24px; padding: 0 9px; font-size: 11.5px; }
      .cp-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .cp-actions-note { font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
      .cp-init { display: flex; gap: 10px; align-items: stretch; }
      .cp-init-img { width: 108px; height: 108px; flex: none; border: .5px dashed var(--dsw-alias-border-l2); border-radius: 10px; background: var(--dsw-alias-bg-base); overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--dsw-alias-label-secondary); font-size: 11px; text-align: center; padding: 6px; box-sizing: border-box; }
      .cp-init-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .cp-init-img[data-filled='true'] { border-style: solid; }
      .cp-init-side { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
      .cp-result { border: .5px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); overflow: hidden; position: sticky; top: 76px; }
      .cp-result-head { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-bottom: .5px solid var(--dsw-alias-border-l1); font-size: 12px; font-weight: 600; flex-wrap: wrap; }
      .cp-result-body { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
      .cp-result-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 8px; }
      .cp-result-img { width: 100%; border-radius: 8px; display: block; cursor: zoom-in; border: .5px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); }
      .cp-statusline { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 11.5px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
      .cp-spinner { width: 13px; height: 13px; flex: none; border-radius: 50%; border: 2px solid var(--dsw-alias-border-l2); border-top-color: var(--dsw-alias-brand-primary); animation: cp-spin .9s linear infinite; }
      @keyframes cp-spin { to { transform: rotate(360deg); } }
      .cp-progress { display: flex; flex-direction: column; gap: 6px; }
      .cp-progress-bar { position: relative; height: 6px; border-radius: 3px; background: var(--dsw-alias-bg-layer-2); overflow: hidden; }
      .cp-progress-bar > i { position: absolute; inset: 0 auto 0 0; border-radius: 3px; background: var(--dsw-alias-brand-primary); transition: width .3s ease; }
      .cp-progress-bar[data-idle='true'] > i { width: 0 !important; animation: none !important; }
      .cp-progress-bar[data-indeterminate='true'] > i { width: 34%; animation: cp-slide 1.2s ease-in-out infinite; }
      @keyframes cp-slide { 0% { left: -34%; } 100% { left: 100%; } }
      .cp-modal { position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(0, 0, 0, .62); }
      .cp-modal-inner { max-width: min(92vw, 1100px); max-height: 92vh; display: flex; flex-direction: column; gap: 10px; }
      .cp-modal-img { max-width: 100%; max-height: 76vh; object-fit: contain; border-radius: 10px; display: block; background: var(--dsw-alias-bg-layer-2); }
      .cp-modal-bar { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
      .cp-modal-bar .cp-btn { background: var(--dsw-alias-bg-overlay); text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
      .cp-modal-bar .cp-btn[data-primary='true'] { background: var(--dsw-alias-label-primary); color: var(--dsw-alias-bg-base); }
      .cp-confirm-backdrop { position: fixed; inset: 0; z-index: 70; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(0, 0, 0, .5); }
      .cp-confirm { width: min(92vw, 380px); display: flex; flex-direction: column; gap: 12px; padding: 18px; border-radius: 12px; background: var(--dsw-alias-bg-base); border: .5px solid var(--dsw-alias-border-l1); box-shadow: 0 18px 50px rgba(0, 0, 0, .35); }
      .cp-confirm-text { margin: 0; font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-primary); }
      .cp-tip-text { margin: 0; white-space: pre-wrap; font: inherit; font-size: 12.5px; line-height: 1.7; color: var(--dsw-alias-label-primary); }
      .cp-tip-images { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; padding: 0 13px 13px; }
      .cp-tip-figure { margin: 0; display: flex; flex-direction: column; gap: 4px; }
      .cp-tip-img { width: 100%; border-radius: 8px; border: .5px solid var(--dsw-alias-border-l1); cursor: zoom-in; display: block; background: var(--dsw-alias-bg-layer-2); }
      .cp-tip-caption { font-size: 11px; color: var(--dsw-alias-label-secondary); }
      .cp-linkbtn { border: 0; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; font-size: 12px; padding: 0 4px; }
      .cp-linkbtn:hover { color: var(--dsw-alias-label-primary); }
      .cp-tip-quick { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
      .cp-tip-quick-card { display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; border-radius: 10px; background: var(--dsw-alias-bg-layer-2); border: .5px solid var(--dsw-alias-border-l1); }
      .cp-tip-quick-title { font-size: 12.5px; font-weight: 600; color: var(--dsw-alias-label-primary); }
      .cp-tip-section { display: flex; flex-direction: column; gap: 8px; }
      .cp-tip-group { margin: 6px 0 0; font-size: 12px; font-weight: 600; letter-spacing: .02em; color: var(--dsw-alias-label-secondary); }
      .cp-tip-para { margin: 0 0 6px; font-size: 12.5px; line-height: 1.7; color: var(--dsw-alias-label-primary); white-space: pre-wrap; }
      .cp-tip-sub { margin: 10px 0 4px; font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-primary); }
      .cp-tip-list { margin: 2px 0 8px; padding-left: 18px; font-size: 12.5px; line-height: 1.7; color: var(--dsw-alias-label-secondary); }
      .cp-tip-list li { margin: 2px 0; }
      .cp-list { list-style: none; margin: 0; padding: 0; }
      .cp-item { display: flex; align-items: center; gap: 10px; padding: 9px 13px; font-size: 12px; border-top: .5px solid var(--dsw-alias-border-l1); }
      .cp-item:first-child { border-top: 0; }
      .cp-item-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .cp-size { color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; flex: none; }
      .cp-tag { padding: 1px 7px; border-radius: 999px; border: .5px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary); font-size: 11px; flex: none; }
      .cp-bar { position: relative; height: 4px; border-radius: 2px; background: var(--dsw-alias-bg-layer-2); overflow: hidden; margin-top: 6px; }
      .cp-bar > i { position: absolute; inset: 0 auto 0 0; background: var(--dsw-alias-brand-primary); transition: width .2s ease; }
      .cp-dl { padding: 9px 13px; border-top: .5px solid var(--dsw-alias-border-l1); font-size: 12px; }
      .cp-dl:first-child { border-top: 0; }
      .cp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(128px, 1fr)); gap: 10px; padding: 12px 13px; }
      .cp-thumb { position: relative; border: .5px solid var(--dsw-alias-border-l1); border-radius: 8px; overflow: hidden; background: var(--dsw-alias-bg-layer-2); aspect-ratio: 1 / 1; cursor: pointer; padding: 0; }
      .cp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .cp-thumb:hover { border-color: var(--dsw-alias-brand-primary); }
      .cp-empty { padding: 16px 13px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
      .cp-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
      .cp-fav { display: flex; gap: 10px; padding: 9px 13px; border-top: .5px solid var(--dsw-alias-border-l1); align-items: flex-start; }
      .cp-fav:first-child { border-top: 0; }
      .cp-fav-text { flex: 1; min-width: 0; font-size: 11.5px; line-height: 1.55; color: var(--dsw-alias-label-primary); word-break: break-word; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .cp-fav-meta { flex: none; display: flex; gap: 6px; }
      .cp-hist-card { display: flex; gap: 10px; padding: 10px 13px; border-top: .5px solid var(--dsw-alias-border-l1); align-items: flex-start; }
      .cp-hist-card:first-child { border-top: 0; }
      .cp-hist-thumbs { display: flex; gap: 4px; flex: none; }
      .cp-hist-thumb { width: 62px; height: 62px; border-radius: 6px; object-fit: cover; border: .5px solid var(--dsw-alias-border-l1); cursor: zoom-in; background: var(--dsw-alias-bg-layer-2); display: block; }
      .cp-hist-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
      .cp-hist-prompt { font-size: 11.5px; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; color: var(--dsw-alias-label-primary); word-break: break-word; }
      .cp-hist-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
      .cp-hist-meta { font-size: 11px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
      .cp-log { margin: 0; max-height: 240px; overflow: auto; padding: 9px 10px; border: .5px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-base); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11px; line-height: 1.55; white-space: pre-wrap; word-break: break-all; color: var(--dsw-alias-label-secondary); }
      .cp-kv { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; font-size: 11.5px; color: var(--dsw-alias-label-secondary); word-break: break-all; }
      .cp-lora-list { display: flex; flex-direction: column; gap: 8px; }
      .cp-lora-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .cp-lora-name { flex: 1; min-width: 120px; font-size: 11.5px; color: var(--dsw-alias-label-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .cp-lora-weight { width: 120px; accent-color: var(--dsw-alias-brand-primary); }
      .cp-lora-value { width: 34px; text-align: right; font-size: 11px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
      .cp-inline { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
      .cp-disc-item { display: flex; gap: 10px; padding: 10px 13px; border-top: .5px solid var(--dsw-alias-border-l1); align-items: flex-start; }
      .cp-disc-item:first-child { border-top: 0; }
      .cp-disc-thumb { width: 64px; height: 64px; flex: none; border-radius: 8px; object-fit: cover; background: var(--dsw-alias-bg-layer-2); border: .5px solid var(--dsw-alias-border-l1); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; color: var(--dsw-alias-label-secondary); }
      .cp-disc-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
      .cp-disc-title { font-size: 12px; font-weight: 600; word-break: break-word; }
      .cp-disc-meta { font-size: 11px; color: var(--dsw-alias-label-secondary); display: flex; gap: 10px; flex-wrap: wrap; font-variant-numeric: tabular-nums; }
      .cp-disc-file { display: flex; align-items: center; gap: 8px; padding-top: 4px; }
      .cp-disc-file .cp-item-name { font-size: 11px; color: var(--dsw-alias-label-secondary); }
      .cp-ext-shot { display: block; width: 100%; max-height: 520px; object-fit: contain; border-radius: 8px; border: .5px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); }
      .cp-ext-log { margin: 0; max-height: 200px; overflow: auto; padding: 9px 10px; border: .5px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-base); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11px; line-height: 1.5; white-space: pre-wrap; word-break: break-all; color: var(--dsw-alias-label-secondary); }
      .cp-note { font-size: 11.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
      .cp-section-title { font-size: 11px; font-weight: 600; letter-spacing: .02em; color: var(--dsw-alias-label-secondary); }
      .cp-num { width: 76px; text-align: center; font-variant-numeric: tabular-nums; }
    `;

    /** Icon presentation supplied by the global panel row. */
    function PanelIcon({ size = 18, active = false }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true,
        style: { display: 'block', color: active ? 'var(--dsw-alias-brand-primary)' : 'currentColor' },
      },
        h('circle', { cx: 12, cy: 12, r: 8.25, stroke: 'currentColor', strokeWidth: 1.5 }),
        h('path', { d: 'M12 3.75c2.2 2.4 3.3 5.1 3.3 8.25S14.2 17.85 12 20.25c-2.2-2.4-3.3-5.1-3.3-8.25S9.8 6.15 12 3.75Z', stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round' }),
        h('path', { d: 'M3.9 12h16.2', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
      );
    }

    function formatBytes(bytes) {
      if (!bytes || !Number.isFinite(bytes)) return '—';
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let value = bytes;
      let unit = 0;
      while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
      return `${value.toFixed(value >= 100 || unit === 0 ? 0 : 1)} ${units[unit]}`;
    }

    function formatElapsed(ms) {
      if (!ms || ms < 0) return '0s';
      const total = Math.round(ms / 1000);
      const minutes = Math.floor(total / 60);
      const seconds = total % 60;
      return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    }

    function formatTime(value) {
      if (!value) return '';
      try {
        return new Date(value).toLocaleString(undefined, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch { return ''; }
    }

    async function callJson(url, init) {
      const res = await fetch(url, init);
      let body = {};
      try { body = await res.json(); } catch { body = {}; }
      if (!res.ok || body.ok === false) throw new Error(body.error || `HTTP ${res.status}`);
      return body;
    }

    function postJson(url, value) {
      return callJson(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(value),
      });
    }

    async function imageExists(name) {
      if (!name) return false;
      try {
        const response = await fetch(imageUrl(name));
        const type = response.headers.get('content-type') || '';
        return response.ok && type.indexOf('image/') === 0;
      } catch {
        return false;
      }
    }

    function imageUrl(name) {
      return `/comfy-panel/image?path=${encodeURIComponent(name)}`;
    }

    /** Read a picked image, downscaling large photos before upload. */
    function readImageDataUrl(file, maxSide = 2048) {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
          try {
            const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
            if (scale >= 1 && file.size <= 1.5 * 1024 * 1024) {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => reject(new Error('cannot read the image'));
              reader.readAsDataURL(file);
              return;
            }
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(image.width * scale));
            canvas.height = Math.max(1, Math.round(image.height * scale));
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.92));
          } catch (cause) {
            reject(cause);
          } finally {
            URL.revokeObjectURL(url);
          }
        };
        image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('cannot read the image')); };
        image.src = url;
      });
    }

    /** Parse a CSS colour token into RGB, so we can judge the active theme. */
    function parseColor(value) {
      const text = String(value || '').trim();
      const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
      if (hex) {
        const raw = hex[1].length === 3
          ? hex[1].split('').map((char) => char + char).join('')
          : hex[1];
        const number = parseInt(raw, 16);
        return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
      }
      const rgb = /rgba?\(([^)]+)\)/i.exec(text);
      if (rgb) {
        const parts = rgb[1].split(',').map((part) => parseFloat(part));
        if (parts.length >= 3 && parts.slice(0, 3).every((part) => Number.isFinite(part))) return parts.slice(0, 3);
      }
      return null;
    }

    /**
     * Native dropdown popups follow `color-scheme`, not our tokens. Reading the
     * panel's own background decides which scheme keeps the option list legible.
     */
    function colorSchemeOf(element) {
      if (!element || typeof window.getComputedStyle !== 'function') return undefined;
      const rgb = parseColor(window.getComputedStyle(element).getPropertyValue('--dsw-alias-bg-base'));
      if (!rgb) return undefined;
      const luminance = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
      return luminance < 0.5 ? 'dark' : 'light';
    }

    /** Merge saved settings over defaults, keeping only well-typed values. */
    function mergeSettings(Base, saved, checkpoints) {
      const next = { ...Base };
      if (!saved || typeof saved !== 'object') {
        next.checkpoint = checkpoints[0] || '';
        return next;
      }
      const numbers = ['width', 'height', 'steps', 'cfg', 'seed', 'batch', 'strength', 'clipSkip'];
      numbers.forEach((key) => {
        if (Number.isFinite(Number(saved[key]))) next[key] = Number(saved[key]);
      });
      ['mode', 'prompt', 'negative', 'sampler', 'scheduler', 'style', 'preset', 'recipe', 'referenceStyle'].forEach((key) => {
        if (typeof saved[key] === 'string') next[key] = saved[key];
      });
      if (saved.mode === 'i2i' || saved.mode === 't2i') next.mode = saved.mode;
      if (typeof saved.autoFavorite === 'boolean') next.autoFavorite = saved.autoFavorite;
      if (saved.hires && typeof saved.hires === 'object') {
        next.hires = {
          enabled: Boolean(saved.hires.enabled),
          scale: Number(saved.hires.scale) || 1.5,
          denoise: Number(saved.hires.denoise) || 0.45,
          steps: Number(saved.hires.steps) || 14,
        };
      }
      if (Array.isArray(saved.loras)) {
        next.loras = saved.loras
          .filter((entry) => entry && typeof entry.name === 'string')
          .slice(0, 6)
          .map((entry) => ({
            name: entry.name,
            weight: Number.isFinite(Number(entry.weight)) ? Math.min(2, Math.max(0, Number(entry.weight))) : 0.8,
          }));
      }
      next.checkpoint = checkpoints.includes(saved.checkpoint) ? saved.checkpoint : (checkpoints[0] || saved.checkpoint || '');
      if (saved.initImageName) next.initImage = { name: saved.initImageName, preview: imageUrl(saved.initImageName) };
      return next;
    }

    function Chip({ active, children, onClick, title, tone }) {
      return h('button', {
        type: 'button', className: 'cp-chip',
        'data-active': active ? 'true' : 'false',
        'data-tone': tone || undefined,
        onClick, title: title || undefined,
      }, children);
    }

    function Button({ children, onClick, primary, disabled, small, title }) {
      return h('button', {
        type: 'button', className: 'cp-btn',
        'data-primary': primary ? 'true' : 'false',
        'data-small': small ? 'true' : 'false',
        onClick, disabled: Boolean(disabled), title: title || undefined,
      }, children);
    }

    function Prop({ label, value, children }) {
      return h('label', { className: 'cp-prop' },
        h('span', { className: 'cp-prop-head' },
          h('span', null, label),
          value ? h('span', { className: 'cp-prop-value' }, value) : null),
        children);
    }

    /** Add tags that are not present yet, keeping the prompt comma-separated. */
    function appendPromptText(prompt, extra) {
      const base = String(prompt || '').trim().replace(/,\s*$/, '');
      if (!base) return extra;
      const tags = base.split(/[,\n]/).map((tag) => tag.trim().toLowerCase());
      const missing = extra.split(',').map((tag) => tag.trim()).filter((tag) => tag && !tags.includes(tag.toLowerCase()));
      return missing.length ? `${base}, ${missing.join(', ')}` : base;
    }

    /**
     * The ComfyUI panel.
     * @param props - composed slot props; `t` is the panel locale seat.
     */
    function ComfyPanel(props) {
      const tr = props && typeof props.t === 'function'
        ? props.t
        : (key) => (en[key] !== undefined ? en[key] : key);
      const isZh = /[\u4e00-\u9fa5]/.test(tr('running'));
      const label = (entry) => (isZh ? entry.zh : entry.en);

      const [tab, setTab] = React.useState('generate');
      const [status, setStatus] = React.useState({ up: false, offline: false });
      const [error, setError] = React.useState('');
      const [notice, setNotice] = React.useState('');
      const [clock, setClock] = React.useState(Date.now());
      const [options, setOptions] = React.useState({ checkpoints: [], samplers: [], schedulers: [], loras: [] });
      const [library, setLibrary] = React.useState({ categories: [], negatives: [], styles: [], hints: [], templates: [], aliases: {}, recipes: [], loraNotes: {}, checkpointNotes: {}, builtinTips: [], quickStart: [] });
      const [saved, setSaved] = React.useState({
        favorites: [],
        images: [],
        styles: [],
        styleGroups: [],
        styleAssign: {},
        styleHidden: [],
        styleEdits: {},
        styleGroupLabels: {},
        customStyles: [],
        tips: [],
        quickCards: [],
        quickHidden: [],
        history: [],
      });
      const [form, setForm] = React.useState(DEFAULT_FORM);
      const [advanced, setAdvanced] = React.useState(false);
      const [showLoras, setShowLoras] = React.useState(false);
      const [styleName, setStyleName] = React.useState('');
      const [savingStyle, setSavingStyle] = React.useState(false);
      const [jobs, setJobs] = React.useState([]);
      const [activeId, setActiveId] = React.useState('');
      const [models, setModels] = React.useState({});
      const [downloads, setDownloads] = React.useState([]);
      const [outputs, setOutputs] = React.useState([]);
      const [outputsShown, setOutputsShown] = React.useState(15);
      const [url, setUrl] = React.useState('');
      const [name, setName] = React.useState('');
      const [kind, setKind] = React.useState('checkpoints');
      const [discoverKind, setDiscoverKind] = React.useState('checkpoint');
      const [discoverQuery, setDiscoverQuery] = React.useState('');
      const [discoverSource, setDiscoverSource] = React.useState('hf-mirror');
      const [discoverBase, setDiscoverBase] = React.useState(DISCOVER_BASES['hf-mirror']);
      const [discoverItems, setDiscoverItems] = React.useState([]);
      const [discoverLoading, setDiscoverLoading] = React.useState(false);
      const [discoverError, setDiscoverError] = React.useState('');
      const [wbBaseJob, setWbBaseJob] = React.useState('');
      const [wbPrompt, setWbPrompt] = React.useState('');
      const [wbNegative, setWbNegative] = React.useState('');
      const [wbStrength, setWbStrength] = React.useState(0.45);
      const [wbSteps, setWbSteps] = React.useState(24);
      const [wbCfg, setWbCfg] = React.useState(5.5);
      const [wbWidth, setWbWidth] = React.useState(1024);
      const [wbHeight, setWbHeight] = React.useState(1024);
      const [wbSeed, setWbSeed] = React.useState(-1);
      const [wbSampler, setWbSampler] = React.useState('dpmpp_2m');
      const [wbScheduler, setWbScheduler] = React.useState('karras');
      const [wbLoras, setWbLoras] = React.useState([]);
      const [wbLastJob, setWbLastJob] = React.useState('');
      const [extStatus, setExtStatus] = React.useState({ running: false });
      const [extPrompt, setExtPrompt] = React.useState('');
      const [extWait, setExtWait] = React.useState(30000);
      const [extBusy, setExtBusy] = React.useState('');
      const [extMessage, setExtMessage] = React.useState('');
      const [extNeedLogin, setExtNeedLogin] = React.useState(false);
      const [extDebugInfo, setExtDebugInfo] = React.useState(null);
      const [extSelector, setExtSelector] = React.useState('');
      const [preview, setPreview] = React.useState(null);
      const [query, setQuery] = React.useState('');
      const [promptCategory, setPromptCategory] = React.useState('');
      const [favCategory, setFavCategory] = React.useState(null);
      const [favToStyle, setFavToStyle] = React.useState(true);
      const [newCategory, setNewCategory] = React.useState('');
      const [editingFavId, setEditingFavId] = React.useState('');
      const [editFavText, setEditFavText] = React.useState('');
      const [editFavCategory, setEditFavCategory] = React.useState('');
      const [manageFavCats, setManageFavCats] = React.useState(false);
      const [editingFavCat, setEditingFavCat] = React.useState('');
      const [editFavCatName, setEditFavCatName] = React.useState('');
      const [tipGroup, setTipGroup] = React.useState(null);
      const [tipManage, setTipManage] = React.useState(false);
      const [editingTipId, setEditingTipId] = React.useState('');
      const [tipTitle, setTipTitle] = React.useState('');
      const [tipText, setTipText] = React.useState('');
      const [tipCategory, setTipCategory] = React.useState('');
      const [tipImages, setTipImages] = React.useState([]);
      const [tipFormOpen, setTipFormOpen] = React.useState(false);
      const [tipQuery, setTipQuery] = React.useState('');
      const [quickManage, setQuickManage] = React.useState(false);
      const [editingQuickId, setEditingQuickId] = React.useState('');
      const [quickTitle, setQuickTitle] = React.useState('');
      const [quickSteps, setQuickSteps] = React.useState('');
      const [quickFormOpen, setQuickFormOpen] = React.useState(false);
      const [bjConfigured, setBjConfigured] = React.useState(false);
      const [bjRemaining, setBjRemaining] = React.useState(null);
      const [bjKeyInput, setBjKeyInput] = React.useState('');
      const [bjScale, setBjScale] = React.useState(4);
      const [bjStyle, setBjStyle] = React.useState('art');
      const [bjNoise, setBjNoise] = React.useState('-1');
      const [bjBusy, setBjBusy] = React.useState('');
      const [bjOffer, setBjOffer] = React.useState(null);
      const [bjLog, setBjLog] = React.useState([]);
      const [bjTask, setBjTask] = React.useState(null);
      const [bjResult, setBjResult] = React.useState(null);
      const [bjSaving, setBjSaving] = React.useState(false);
      const [bjSavedPath, setBjSavedPath] = React.useState('');
      const [bjSource, setBjSource] = React.useState('latest');
      const [bjFormat, setBjFormat] = React.useState('png');
      const [bjQuality, setBjQuality] = React.useState(92);
      const [mixCategories, setMixCategories] = React.useState(['subject', 'character', 'clothing', 'scene', 'lighting', 'handdrawn', 'style']);
      const [mixCount, setMixCount] = React.useState(3);
      const [mixResults, setMixResults] = React.useState([]);
      const [styleFilter, setStyleFilter] = React.useState(null);
      const [styleManage, setStyleManage] = React.useState(false);
      const [newGroupName, setNewGroupName] = React.useState('');
      const [styleWordName, setStyleWordName] = React.useState('');
      const [styleWordTags, setStyleWordTags] = React.useState('');
      const [styleWordGroup, setStyleWordGroup] = React.useState('');
      const [editingStyleId, setEditingStyleId] = React.useState('');
      const [editName, setEditName] = React.useState('');
      const [editTags, setEditTags] = React.useState('');
      const [editingGroup, setEditingGroup] = React.useState(null);
      const [editingSpecialGroup, setEditingSpecialGroup] = React.useState(null);
      const [styleManageQuery, setStyleManageQuery] = React.useState('');
      const outputState = React.useRef({ outputs: [] });
      const [inpaintSource, setInpaintSource] = React.useState('');
      const [inpaintName, setInpaintName] = React.useState('');
      const [inpaintSize, setInpaintSize] = React.useState(null);
      const [inpaintTool, setInpaintTool] = React.useState('brush');
      const [inpaintBrush, setInpaintBrush] = React.useState(48);
      const [inpaintModel, setInpaintModel] = React.useState('');
      const [inpaintPresetId, setInpaintPresetId] = React.useState('hand');
      const [inpaintPrompt, setInpaintPrompt] = React.useState('');
      const [inpaintNegative, setInpaintNegative] = React.useState('lowres, bad anatomy, blurry, deformed, extra fingers, fused fingers');
      const [inpaintDenoise, setInpaintDenoise] = React.useState(0.6);
      const [inpaintGrow, setInpaintGrow] = React.useState(8);
      const [inpaintSteps, setInpaintSteps] = React.useState(24);
      const [inpaintCfg, setInpaintCfg] = React.useState(6.5);
      const [inpaintSeed, setInpaintSeed] = React.useState(-1);
      const [inpaintLoras, setInpaintLoras] = React.useState([]);
      const [inpaintBusy, setInpaintBusy] = React.useState(false);
      const [inpaintResult, setInpaintResult] = React.useState(null);
      const [inpaintDiff, setInpaintDiff] = React.useState(null);
      const jobsRef = React.useRef([]);
      const [inpaintRecords, setInpaintRecords] = React.useState([]);
      const [inpaintActiveJob, setInpaintActiveJob] = React.useState('');
      const [inpaintRecentManage, setInpaintRecentManage] = React.useState(false);
      const [inpaintRemoved, setInpaintRemoved] = React.useState([]);

      const [inpaintServerName, setInpaintServerName] = React.useState('');
      const [resultStamp, setResultStamp] = React.useState(() => Date.now());
      const inpaintCanvasRef = React.useRef(null);
      const inpaintFileRef = React.useRef(null);
      const maskDirty = React.useRef(false);
      const maskStrokes = React.useRef([]);
      const [maskVersion, setMaskVersion] = React.useState(0);
      const [hasMaskPaint, setHasMaskPaint] = React.useState(false);
      const resultUrl = (name) => (name ? `${imageUrl(name)}&r=${resultStamp}` : '');
      const INPAINT_DRAFT_KEY = 'comfy-panel:inpaint-draft';
      const INPAINT_LAST_KEY = 'comfy-panel:inpaint-last';

      /**
       * Inpaint result records, newest first. Each entry owns its job id, so a
       * later run cannot overwrite an earlier one. Registration happens in the
       * poll effect (not in a render hook), which keeps it deterministic.
       */
      const registerInpaintRecord = (job) => {
        if (!job || !job.images || !job.images[0]) return;
        if ((inpaintRemoved || []).includes(job.id)) return;
        const image = job.images[0];
        const record = {
          jobId: job.id,
          filename: image.filename,
          source: (job.initImage || '').toString(),
          at: job.finishedAt || Date.now(),
          seed: job.seed,
          denoise: job.strength,
          cfg: job.cfg,
        };
        let added = false;
        setInpaintRecords((prev) => {
          if (prev.some((entry) => entry.jobId === record.jobId)) return prev;
          added = true;
          const merged = [record, ...prev];
          merged.sort((a, b) => (b.at || 0) - (a.at || 0));
          return merged.slice(0, 5);
        });
        // Only select the record when it is genuinely new.
        if (added) setInpaintActiveJob(record.jobId);
      };

      /** The record the result card displays. */
      const activeRecord = (inpaintRecords || []).find((entry) => entry.jobId === inpaintActiveJob)
        || (inpaintRecords || [])[0]
        || null;

      // Keep the change map aligned with the active record only.
      React.useEffect(() => {
        if (!activeRecord) return;
        if (inpaintDiff && inpaintDiff.forName === activeRecord.filename) return;
        let cancelled = false;
        void buildInpaintDiff(inpaintSource, resultUrl(activeRecord.filename), activeRecord.source, activeRecord.filename).then((diff) => {
          if (cancelled) return;
          setInpaintDiff(diff ? { ...diff, forName: activeRecord.filename } : { map: '', percent: null, forName: activeRecord.filename });
        });
        return () => { cancelled = true; };
      }, [activeRecord ? activeRecord.jobId : '', inpaintSource]);



      const readInpaintDraft = () => {
        try {
          const raw = window.localStorage.getItem(INPAINT_DRAFT_KEY);
          if (!raw) return null;
          const value = JSON.parse(raw);
          return value && typeof value === 'object' ? value : null;
        } catch {
          return null;
        }
      };

      const saveInpaintDraft = () => {
        try {
          window.localStorage.setItem(INPAINT_DRAFT_KEY, JSON.stringify({
            source: inpaintSource,
            name: inpaintName,
            serverName: inpaintServerName,
            records: (inpaintRecords || []).slice(0, 5),
            removed: (inpaintRemoved || []).slice(-20),
            activeJob: inpaintActiveJob,
            prompt: inpaintPrompt,
            negative: inpaintNegative,
            model: inpaintModel,
            presetId: inpaintPresetId,
            denoise: inpaintDenoise,
            grow: inpaintGrow,
            steps: inpaintSteps,
            cfg: inpaintCfg,
            result: inpaintResult,
            diff: inpaintDiff,
            loras: inpaintLoras,
            strokes: maskStrokes.current || [],
            tool: inpaintTool,
          }));
        } catch {
          // Storage can reject large payloads; keep the lightweight parts.
          try {
            window.localStorage.setItem(INPAINT_DRAFT_KEY, JSON.stringify({
              prompt: inpaintPrompt,
              negative: inpaintNegative,
              denoise: inpaintDenoise,
              grow: inpaintGrow,
              steps: inpaintSteps,
              cfg: inpaintCfg,
              name: inpaintName,
              strokes: maskStrokes.current || [],
              tool: inpaintTool,
            }));
          } catch { /* give up quietly */ }
        }
      };

      const restoredDraft = React.useRef(null);
      // Survives component remounts and storage failures.
      if (!window.__comfyPanelCache) window.__comfyPanelCache = {};
      const inpaintCache = window.__comfyPanelCache;

      React.useEffect(() => {
        inpaintCache.result = inpaintResult;
        inpaintCache.diff = inpaintDiff;
        inpaintCache.source = inpaintSource;
      }, [inpaintResult, inpaintDiff, inpaintSource]);

      // Recover the last result when the tab mounts again.
      const recovered = React.useRef(false);
      React.useEffect(() => {
        if (recovered.current) return;
        recovered.current = true;
        if (inpaintSource) return;
        if (!inpaintResult && inpaintCache.result) setInpaintResult(inpaintCache.result);
        if (!inpaintDiff && inpaintCache.diff) setInpaintDiff(inpaintCache.diff);
        if (!inpaintSource && inpaintCache.source) setInpaintSource(inpaintCache.source);
      }, []);


      const [styleSelected, setStyleSelected] = React.useState([]);
      const [styleShowHidden, setStyleShowHidden] = React.useState(false);
      const [editGroupName, setEditGroupName] = React.useState('');
      const [confirmState, setConfirmState] = React.useState(null);
      const askConfirm = (message, action) => setConfirmState({ message, action });
      const [loaded, setLoaded] = React.useState(false);
      const [lockRatio, setLockRatio] = React.useState(true);
      const [log, setLog] = React.useState('');
      const [busy, setBusy] = React.useState('');
      const fileRef = React.useRef(null);
      const lastDoneRef = React.useRef('');
      const seenDownloads = React.useRef(new Set());
      const rootRef = React.useRef(null);
      const [scheme, setScheme] = React.useState(undefined);

      React.useEffect(() => {
        setScheme(colorSchemeOf(rootRef.current));
      }, []);

      const applySavedState = (body) => {
        setSaved((prev) => ({
          favorites: body.favorites || [],
          images: body.images || [],
          styles: body.styles || [],
          styleGroups: body.styleGroups || prev.styleGroups || [],
          styleAssign: body.styleAssign || prev.styleAssign || {},
          styleHidden: body.styleHidden || prev.styleHidden || [],
          styleEdits: body.styleEdits || prev.styleEdits || {},
          styleGroupLabels: body.styleGroupLabels || prev.styleGroupLabels || {},
          customStyles: body.customStyles || prev.customStyles || [],
          tips: body.tips || prev.tips || [],
          quickCards: body.quickCards || prev.quickCards || [],
          quickHidden: body.quickHidden || prev.quickHidden || [],
          history: body.history || [],
        }));
      };

      outputState.current.outputs = outputs;

      const refreshOutputs = async () => {
        try {
          const body = await callJson('/comfy-panel/outputs');
          setOutputs(body.outputs || []);
        } catch { /* keep the previous list */ }
      };

      const refreshModels = async () => {
        try {
          const body = await callJson('/comfy-panel/models');
          setModels(body.models || {});
        } catch { /* keep the previous list */ }
      };

      const refreshOptions = async () => {
        try {
          const body = await callJson('/comfy-panel/generate/options');
          setOptions(body);
        } catch { /* keep the previous list */ }
      };

      const refreshSaved = async () => {
        try {
          applySavedState(await callJson('/comfy-panel/state'));
        } catch { /* keep the previous state */ }
      };

      const refreshLog = async () => {
        try {
          const body = await callJson('/comfy-panel/log?lines=80');
          setLog(body.lines || '');
        } catch (cause) {
          setLog(String(cause.message ?? cause));
        }
      };

      const refreshDownloads = async () => {
        try {
          const body = await callJson('/comfy-panel/downloads');
          setDownloads(body.downloads || []);
        } catch { /* keep the previous list */ }
      };

      React.useEffect(() => {
        let alive = true;
        void (async () => {
          try {
            const [opts, lib, state] = await Promise.all([
              callJson('/comfy-panel/generate/options'),
              callJson('/comfy-panel/prompt-library'),
              callJson('/comfy-panel/state'),
            ]);
            if (!alive) return;
            setOptions(opts);
            setLibrary({
              categories: lib.categories || [],
              negatives: lib.negatives || [],
              styles: lib.styles || [],
              hints: lib.hints || [],
              templates: lib.templates || [],
              aliases: lib.aliases || {},
              recipes: lib.recipes || [],
              loraNotes: lib.loraNotes || {},
              checkpointNotes: lib.checkpointNotes || {},
              builtinTips: lib.builtinTips || [],
              quickStart: lib.quickStart || [],
            });
            applySavedState(state);
            setForm(mergeSettings(DEFAULT_FORM, state.settings, opts.checkpoints || []));
            setLoaded(true);
          } catch (cause) {
            if (!alive) return;
            setStatus({ up: false, offline: true });
            setError(String(cause.message ?? cause));
          }
        })();
        void refreshModels();
        void refreshOutputs();
        return () => { alive = false; };
      }, []);

      React.useEffect(() => {
        let alive = true;
        let timer = 0;
        const tick = async () => {
          try {
            const [live, jobBody] = await Promise.all([
              callJson('/comfy-panel/status'),
              callJson('/comfy-panel/generate/status'),
            ]);
            if (!alive) return;
            setStatus({ ...live, offline: false });
            const nextJobs = jobBody.jobs || [];
            setJobs(nextJobs);
            jobsRef.current = nextJobs;
            // Oldest first, so the newest finish ends up selected.
            const finishedInpaints = nextJobs
              .filter((job) => job.mode === 'inpaint' && job.state === 'done' && job.images && job.images[0])
              .sort((a, b) => (a.finishedAt || a.createdAt || 0) - (b.finishedAt || b.createdAt || 0));
            for (const finished of finishedInpaints) {
              registerInpaintRecord(finished);
            }
            const active = nextJobs.some((job) => job.state === 'queued' || job.state === 'running');
            timer = window.setTimeout(() => { void tick(); }, active ? 900 : 2500);
          } catch {
            if (!alive) return;
            setStatus((prev) => ({ ...prev, up: false, offline: true }));
            timer = window.setTimeout(() => { void tick(); }, 3000);
          }
        };
        void tick();
        return () => {
          alive = false;
          window.clearTimeout(timer);
        };
      }, []);

      React.useEffect(() => {
        const timer = window.setInterval(() => setClock(Date.now()), 1000);
        return () => window.clearInterval(timer);
      }, []);

      // Persist the settings bar, so quality, style and LoRA choices survive a reload.
      React.useEffect(() => {
        if (!loaded) return undefined;
        const timer = window.setTimeout(() => {
          const { initImage, ...rest } = form;
          void postJson('/comfy-panel/state', {
            settings: {
              ...rest,
              hires: { ...form.hires },
              loras: (form.loras || []).map((lora) => ({ name: lora.name, weight: lora.weight })),
              initImageName: initImage ? initImage.name : '',
            },
          }).catch(() => {});
        }, 700);
        return () => window.clearTimeout(timer);
      }, [form, loaded]);

      // Refresh the saved lists when a generation finishes.
      React.useEffect(() => {
        const job = jobs[0];
        if (!job || job.state !== 'done' || lastDoneRef.current === job.id) return;
        lastDoneRef.current = job.id;
        void refreshSaved();
        void refreshOutputs();
        if (bjConfigured && job.images && job.images[0]) setBjOffer(job.images[0].filename);
        if (form.autoFavorite && job.images && job.images[0]) {
          void toggleImage(job.images[0].filename, job.prompt);
        }
      }, [jobs, bjConfigured]);

      // An empty prompt means "no style": drop any remembered style/preset.
      React.useEffect(() => {
        if (form.prompt.trim()) return;
        if (form.style || form.preset || form.recipe || form.referenceStyle) {
          setForm((prev) => ({ ...prev, style: '', preset: '', recipe: '', referenceStyle: '' }));
        }
      }, [form.prompt, form.style, form.preset, form.recipe, form.referenceStyle]);

      // Restore the last inpaint draft once, so switching tabs or reloading the
      // panel does not lose the picture, the prompt or the strokes.
      React.useEffect(() => {
        if (restoredDraft.current) return;
        restoredDraft.current = true;
        const draft = readInpaintDraft();
        if (!draft) return;
        if (draft.source) setInpaintSource(draft.source);
        if (draft.name) setInpaintName(draft.name);
        if (draft.serverName) setInpaintServerName(draft.serverName);
        if (Array.isArray(draft.records) && draft.records.length) setInpaintRecords(draft.records.slice(0, 5));
        if (Array.isArray(draft.removed) && draft.removed.length) setInpaintRemoved(draft.removed.slice(-20));
        if (draft.activeJob) setInpaintActiveJob(draft.activeJob);
        if (typeof draft.prompt === 'string') setInpaintPrompt(draft.prompt);
        if (typeof draft.negative === 'string') setInpaintNegative(draft.negative);
        if (draft.model) setInpaintModel(draft.model);
        if (draft.presetId) setInpaintPresetId(draft.presetId);
        if (typeof draft.denoise === 'number') setInpaintDenoise(draft.denoise);
        if (typeof draft.grow === 'number') setInpaintGrow(draft.grow);
        if (typeof draft.steps === 'number') setInpaintSteps(draft.steps);
        if (typeof draft.cfg === 'number') setInpaintCfg(draft.cfg);
        if (draft.result) setInpaintResult(draft.result);
        if (draft.diff && draft.diff.map) setInpaintDiff(draft.diff);
        if (draft.tool === 'eraser' || draft.tool === 'brush') setInpaintTool(draft.tool);
        if (Array.isArray(draft.loras)) setInpaintLoras(draft.loras);
        if (Array.isArray(draft.strokes) && draft.strokes.length) {
          maskStrokes.current = draft.strokes;
          maskDirty.current = true;
        }
      }, []);

      // Persist the draft whenever it changes; strokes are saved on pointer up.
      React.useEffect(() => {
        if (!restoredDraft.current) return;
        saveInpaintDraft();
      }, [inpaintSource, inpaintName, inpaintServerName, inpaintActiveJob, inpaintRecords.length, inpaintRemoved.length, inpaintPrompt, inpaintNegative, inpaintModel, inpaintPresetId,
        inpaintDenoise, inpaintGrow, inpaintSteps, inpaintCfg, inpaintResult, inpaintDiff, inpaintLoras, tab]);

      // The canvas element is recreated when the tab is switched away and back,
      // so repaint the stored strokes every time the inpaint view appears.
      React.useEffect(() => {
        if (tab !== 'inpaint') return;
        const timer = setTimeout(() => { alignMaskCanvas(); }, 0);
        return () => clearTimeout(timer);
      }, [tab, inpaintSource, maskVersion]);

      // A resized window changes the image's on-screen box; repaint the mask
      // immediately so the strokes stay glued to the picture.
      React.useEffect(() => {
        let frame = 0;
        const onResize = () => {
          if (frame) cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => { alignMaskCanvas(); });
        };
        window.addEventListener('resize', onResize);
        return () => {
          window.removeEventListener('resize', onResize);
          if (frame) cancelAnimationFrame(frame);
        };
      }, [inpaintSource]);

      React.useEffect(() => {
        void loadBigjpgStatus();
      }, []);

      // Escape closes the image preview.
      React.useEffect(() => {
        if (!preview) return undefined;
        const onKey = (event) => { if (event.key === 'Escape') setPreview(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [preview]);

      // The server log is only interesting while the service tab is open.
      React.useEffect(() => {
        if (tab === 'service') void refreshLog();
      }, [tab]);

      // External browser state only while its tab is open.
      React.useEffect(() => {
        if (tab !== 'ext') return undefined;
        void refreshExt();
        const timer = window.setInterval(() => { void refreshExt(); }, 5000);
        return () => window.clearInterval(timer);
      }, [tab]);

      React.useEffect(() => {
        if (!notice) return undefined;
        const timer = window.setTimeout(() => setNotice(''), 2600);
        return () => window.clearTimeout(timer);
      }, [notice]);

      React.useEffect(() => {
        const timer = window.setInterval(() => { void refreshDownloads(); }, 4000);
        return () => window.clearInterval(timer);
      }, []);

      // A finished model download should appear in the pickers without a reload.
      React.useEffect(() => {
        let changed = false;
        for (const job of downloads) {
          if (job.state === 'done' && !seenDownloads.current.has(job.id)) {
            seenDownloads.current.add(job.id);
            changed = true;
          }
        }
        if (changed) {
          void refreshOptions();
          void refreshModels();
        }
      }, [downloads]);

      const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));
      const updateHires = (patch) => setForm((prev) => ({ ...prev, hires: { ...prev.hires, ...patch } }));

      const qualityMatch = QUALITY.find((preset) => (
        preset.steps === form.steps
        && Math.abs(preset.cfg - form.cfg) < 0.001
        && Boolean(preset.hires) === Boolean(form.hires.enabled)
      ));

      const applyQuality = (preset) => {
        setForm((prev) => ({
          ...prev,
          steps: preset.steps,
          cfg: preset.cfg,
          hires: preset.hires ? { ...preset.hires } : { ...OFF_HIRES },
        }));
      };

      const promptTags = form.prompt.split(/[,\n]/).map((tag) => tag.trim()).filter(Boolean);
      const analysis = React.useMemo(() => {
        const hints = (library.hints || []).filter((entry) => form.prompt.includes(entry.zh)).slice(0, 8);
        return {
          count: promptTags.length,
          hints,
          hasQuality: /(masterpiece|best quality|very aesthetic)/i.test(form.prompt),
          tooLong: promptTags.length > 75,
        };
      }, [form.prompt, library.hints]);

      const appendTag = (tag) => {
        if (!tag) return;
        if (promptTags.some((entry) => entry.toLowerCase() === tag.toLowerCase())) return;
        update({ prompt: promptTags.length ? `${promptTags.join(', ')}, ${tag}` : tag });
      };

      /**
       * Drop one style block's tags from a prompt, so switching styles does not
       * pile up tags from the previous one.
       */
      const stripTags = (prompt, tagsText) => {
        if (!tagsText) return String(prompt || '').trim();
        const drop = new Set(tagsText.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean));
        return String(prompt || '')
          .split(/[,\n]/)
          .map((tag) => tag.trim())
          .filter((tag) => tag && !drop.has(tag.toLowerCase()))
          .join(', ');
      };

      const styleEdits = saved.styleEdits || {};
      const builtInStyles = (library.styles || []).map((style) => {
        const edited = styleEdits[style.id] || {};
        const name = edited.name || style.zh;
        return { ...style, zh: name, en: edited.name || style.en, name, tags: edited.tags ?? style.tags };
      });
      const userStyles = saved.styles || [];
      const customStyles = (saved.customStyles || []).map((style) => {
        const edited = styleEdits[style.id] || {};
        const name = edited.name || style.name;
        return {
          ...style,
          name,
          tags: edited.tags ?? style.tags,
          zh: name,
          en: name,
          custom: true,
        };
      });
      const styleGroups = saved.styleGroups || [];
      const styleAssign = saved.styleAssign || {};
      // One flat list: built-in words, recipes and saved presets are all
      // "style entries" that live in a category of the same picker.
      const GROUP_BUILTIN = '';
      const GROUP_RECIPES = '__recipes';
      const GROUP_PRESETS = '__presets';
      const editedRecipe = (recipe) => {
        const edited = styleEdits[recipe.id] || {};
        const name = edited.name || recipe.zh;
        return {
          ...recipe,
          zh: name,
          en: edited.name || recipe.en,
          name,
          prompt: edited.tags ?? recipe.prompt,
        };
      };
      const editedPreset = (preset) => {
        const edited = styleEdits[preset.id] || {};
        return { ...preset, name: edited.name || preset.name, zh: edited.name || preset.zh, en: edited.name || preset.en, prompt: edited.tags ?? preset.prompt };
      };
      const styleEntries = []
        .concat(builtInStyles.map((style) => ({ ...style, kind: 'builtin' })))
        .concat((library.recipes || []).map((recipe) => ({ ...editedRecipe(recipe), kind: 'recipe' })))
        .concat(userStyles.map((preset) => ({ ...editedPreset(preset), kind: 'preset', tags: '' })))
        .concat(customStyles.map((style) => ({ ...style, kind: 'custom' })));
      const defaultGroupOf = (entry) => (entry.kind === 'recipe'
        ? GROUP_RECIPES
        : entry.kind === 'preset' ? GROUP_PRESETS : (entry.group || GROUP_BUILTIN));
      const styleGroupOf = (entry) => styleAssign[entry.id] ?? defaultGroupOf(entry);
      const allStyles = styleEntries;
      const styleHidden = new Set(saved.styleHidden || []);
      const styleEntriesVisible = styleEntries.filter((entry) => !styleHidden.has(entry.id));
      const styleEntriesHidden = styleEntries.filter((entry) => styleHidden.has(entry.id));
      // Reference style: only style words carry tags, so recipes and saved
      // presets are not offered here.
      const referenceOptions = styleEntries.filter((entry) => (entry.kind === 'builtin' || entry.kind === 'custom') && entry.tags);
      const referenceEntry = referenceOptions.find((entry) => entry.id === form.referenceStyle) || null;
      const styleGroupLabels = saved.styleGroupLabels || {};
      const labelKeyOf = (key) => (key === '' ? 'builtin' : key === '__recipes' ? 'recipes' : key === '__presets' ? 'presets' : key);
      const styleGroupsAll = [
        { key: GROUP_BUILTIN, label: styleGroupLabels.builtin || tr('groupBuiltin'), special: true },
        { key: GROUP_RECIPES, label: styleGroupLabels.recipes || tr('recipes'), special: true },
        { key: GROUP_PRESETS, label: styleGroupLabels.presets || tr('stylePresets'), special: true },
      ].concat(styleGroups.map((group) => ({ key: group.name, label: group.name })));
      const applyStyleEntry = (entry) => {
        if (entry.kind === 'recipe') applyRecipe(entry);
        else if (entry.kind === 'preset') applyPreset(entry);
        else applyStyle(entry);
      };

      const applyStyle = (style) => {
        const previous = allStyles.find((entry) => entry.id === form.style);
        const base = stripTags(form.prompt, previous ? previous.tags : '');
        const room = Math.max(0, 8000 - base.length - 2 - (referenceEntry ? referenceEntry.tags.length + 1 : 0));
        const added = String(style.tags || '').slice(0, room);
        update({
          prompt: base ? `${base}, ${added}` : added,
          style: style.id,
          preset: '',
          recipe: '',
        });
        if (added.length < String(style.tags || '').length) setNotice(tr('styleTruncated'));
      };

      const clearStyle = () => {
        const previous = allStyles.find((entry) => entry.id === form.style);
        const preset = (saved.styles || []).find((entry) => entry.id === form.preset);
        const recipe = (library.recipes || []).find((entry) => entry.id === form.recipe);
        // Presets and recipes replace the whole prompt, so "none" clears it;
        // style words only add tags, so keep whatever the user typed.
        let prompt = form.prompt;
        if (preset || recipe) prompt = '';
        else if (previous) prompt = stripTags(prompt, previous.tags);
        update({ prompt, style: '', preset: '', recipe: '' });
      };

      /** Apply a saved recipe: model, LoRA stack, prompt and negative together. */
      const applyPreset = (preset) => {
        const checkpointAvailable = (options.checkpoints || []).includes(preset.checkpoint);
        update({
          checkpoint: checkpointAvailable ? preset.checkpoint : form.checkpoint,
          loras: (preset.loras || []).slice(0, 6).map((lora) => ({ name: lora.name, weight: lora.weight })),
          prompt: preset.prompt || '',
          negative: typeof preset.negative === 'string' ? preset.negative : form.negative,
          style: '',
          preset: preset.id,
        });
        setNotice(tr('styleApplied'));
      };

      const saveStylePreset = async () => {
        const nameValue = styleName.trim();
        if (!nameValue) {
          setError(tr('styleNeedsName'));
          return;
        }
        try {
          const body = await postJson('/comfy-panel/styles/save', {
            name: nameValue,
            checkpoint: form.checkpoint,
            loras: form.loras,
            prompt: form.prompt,
            negative: form.negative,
          });
          applySavedState(body);
          if (body.preset && body.preset.id) update({ preset: body.preset.id, style: '' });
          setStyleName('');
          setSavingStyle(false);
          setNotice(tr('styleSaved'));
          setError('');
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const deleteStylePreset = (id) => askConfirm(tr('confirmDeleteStyle'), async () => {
        try {
          const body = await postJson('/comfy-panel/styles/delete', { id });
          applySavedState(body);
          if (form.preset === id) update({ preset: '' });
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      });

      const saveStyleGroup = async () => {
        const name = newGroupName.trim();
        if (!name) return;
        const reserved = ['__recipes', '__presets', tr('groupBuiltin'), tr('recipes'), tr('stylePresets')];
        if (reserved.includes(name)) {
          setError(tr('groupReserved'));
          return;
        }
        try {
          applySavedState(await postJson('/comfy-panel/styles/group/save', { name }));
          setNewGroupName('');
          setNotice(tr('saved'));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const deleteStyleGroup = (name) => askConfirm(tr('confirmDeleteGroup'), async () => {
        try {
          applySavedState(await postJson('/comfy-panel/styles/group/delete', { name }));
          if (styleFilter === name) setStyleFilter(null);
          if (editingGroup === name) setEditingGroup(null);
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      });

      const saveSpecialGroupLabel = async (key) => {
        const label = editGroupName.trim();
        try {
          applySavedState(await postJson('/comfy-panel/styles/group/label', { key: labelKeyOf(key), label }));
          setEditingSpecialGroup(null);
          setNotice(tr('saved'));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const startRenameSpecialGroup = (group) => {
        setEditingSpecialGroup(group.key);
        setEditGroupName(group.label);
      };

      const startRenameGroup = (name) => {
        setEditingGroup(name);
        setEditGroupName(name);
      };

      const saveRenameGroup = async (name) => {
        const newName = editGroupName.trim();
        if (!newName) return;
        try {
          applySavedState(await postJson('/comfy-panel/styles/group/rename', { name, newName }));
          if (styleFilter === name) setStyleFilter(newName);
          setEditingGroup(null);
          setNotice(tr('saved'));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const assignStyle = async (styleId, group) => {
        try {
          applySavedState(await postJson('/comfy-panel/styles/assign', { styleId, group }));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const saveCustomStyle = async () => {
        const name = styleWordName.trim();
        const tags = styleWordTags.trim().slice(0, STYLE_APPLY_LIMIT);
        if (!name || !tags) return;
        try {
          applySavedState(await postJson('/comfy-panel/styles/custom/save', { name, tags, group: styleWordGroup }));
          setStyleWordName('');
          setStyleWordTags('');
          setNotice(tr('saved'));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const deleteCustomStyle = (id) => askConfirm(tr('confirmDeleteStyleWord'), async () => {
        try {
          applySavedState(await postJson('/comfy-panel/styles/custom/delete', { id }));
          if (form.style === id) update({ style: '' });
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      });

      const hideStyle = async (styleId, hidden) => {
        try {
          applySavedState(await postJson('/comfy-panel/styles/hide', { styleId, hidden }));
          if (hidden && form.style === styleId) update({ style: '' });
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const startEditStyle = (entry) => {
        setEditingStyleId(entry.id);
        setEditName(entry.name || entry.zh || entry.en || '');
        setEditTags(entry.tags || entry.prompt || '');
      };

      const saveStyleEdit = async (entry) => {
        try {
          const payload = { styleId: entry.id, tags: editTags, name: editName };
          applySavedState(await postJson('/comfy-panel/styles/edit', payload));
          setEditingStyleId('');
          setNotice(tr('saved'));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const resetStyles = () => askConfirm(tr('confirmResetStyles'), async () => {
        try {
          applySavedState(await postJson('/comfy-panel/styles/reset', {}));
          setEditingStyleId('');
          setNotice(tr('saved'));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      });

      const loraEnabled = (nameValue) => (form.loras || []).some((lora) => lora.name === nameValue);

      const toggleLora = (nameValue) => {
        const current = form.loras || [];
        if (current.some((lora) => lora.name === nameValue)) {
          update({ loras: current.filter((lora) => lora.name !== nameValue) });
        } else {
          update({ loras: current.concat([{ name: nameValue, weight: 0.8 }]).slice(0, 6) });
        }
      };

      const setLoraWeight = (nameValue, value) => {
        const weight = Math.min(2, Math.max(0, Number(value) || 0));
        update({ loras: (form.loras || []).map((lora) => (lora.name === nameValue ? { name: lora.name, weight } : lora)) });
      };

      const changeWidth = (value) => {
        const width = Math.min(2048, Math.max(256, Math.round((Number(value) || form.width) / 8) * 8));
        const height = lockRatio && form.width > 0
          ? Math.min(2048, Math.max(256, Math.round((width / (form.width / form.height)) / 8) * 8))
          : form.height;
        update({ width, height });
      };

      const changeHeight = (value) => {
        const height = Math.min(2048, Math.max(256, Math.round((Number(value) || form.height) / 8) * 8));
        const width = lockRatio && form.height > 0
          ? Math.min(2048, Math.max(256, Math.round((height * (form.width / form.height)) / 8) * 8))
          : form.width;
        update({ width, height });
      };

      const applyHint = (hint) => {
        update({ prompt: form.prompt.split(hint.zh).join(hint.en) });
      };

      const randomIdea = () => {
        const pick = (id) => {
          const category = (library.categories || []).find((entry) => entry.id === id);
          if (!category || category.tags.length === 0) return '';
          return category.tags[Math.floor(Math.random() * category.tags.length)];
        };
        const parts = ['masterpiece', 'best quality', pick('character'), pick('expression'), pick('scene'), pick('light'), pick('style'), pick('camera')].filter(Boolean);
        update({ prompt: parts.join(', ') });
      };

      const toggleMixCategory = (id) => {
        setMixCategories((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : prev.concat([id])));
      };

      /** Roll fresh tag combinations from the selected groups. */
      const rollCombos = () => {
        const groups = (library.categories || []).filter((category) => mixCategories.includes(category.id) && category.tags.length > 0);
        if (groups.length === 0) return;
        const pick = (tags) => tags[Math.floor(Math.random() * tags.length)];
        const results = [];
        for (let index = 0; index < mixCount; index += 1) {
          const parts = ['masterpiece', 'best quality', 'very aesthetic'];
          groups.forEach((category) => parts.push(pick(category.tags)));
          results.push([...new Set(parts)].join(', '));
        }
        setMixResults(results);
      };

      /** De-duplicate tags and move the quality tags to the front. */
      const tidyPrompt = () => {
        const quality = new Set(['masterpiece', 'best quality', 'very aesthetic', 'absurdres', 'highres']);
        const seen = new Set();
        const tags = [];
        form.prompt.split(/[,\n]/).map((tag) => tag.trim()).filter(Boolean).forEach((tag) => {
          const key = tag.toLowerCase();
          if (seen.has(key)) return;
          seen.add(key);
          tags.push(tag);
        });
        tags.sort((a, b) => (quality.has(b.toLowerCase()) ? 1 : 0) - (quality.has(a.toLowerCase()) ? 1 : 0));
        update({ prompt: tags.slice(0, 75).join(', ') });
        setNotice(tr('tidyDone'));
      };

      const styleNameFromPrompt = (text) => {
        const tags = String(text || '').split(/[,\n]/).map((tag) => tag.trim()).filter(Boolean)
          .filter((tag) => !/^(masterpiece|best quality|very aesthetic|highres|absurdres)$/i.test(tag));
        const name = tags.slice(0, 3).join(' ').slice(0, 24);
        return name || `收藏 ${new Date().toLocaleTimeString()}`;
      };

      const saveFavorite = async (category) => {
        const text = form.prompt.trim();
        if (!text) return;
        const group = '我的画风词';
        try {
          const body = await postJson('/comfy-panel/prompts/save', {
            text,
            negative: form.negative,
            category: typeof category === 'string' ? category : '',
          });
          applySavedState(body);
          if (favToStyle) {
            await postJson('/comfy-panel/styles/group/save', { name: group });
            const styled = await postJson('/comfy-panel/styles/custom/save', {
              name: styleNameFromPrompt(text),
              tags: text,
              group,
            });
            applySavedState(styled);
            setNotice(tr('savedToStyle'));
          } else {
            setNotice(tr('saved'));
          }
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const removeFavorite = async (id) => {
        try {
          const body = await postJson('/comfy-panel/prompts/delete', { id });
          applySavedState(body);
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const moveFavorite = async (id, category) => {
        try {
          const body = await postJson('/comfy-panel/prompts/category', { id, category });
          applySavedState(body);
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const startEditFavorite = (entry) => {
        setEditingFavId(entry.id);
        setEditFavText(entry.text || '');
        setEditFavCategory(entry.category || '');
      };

      const renameFavCategory = async (from, to) => {
        const target = String(to || '').trim();
        if (!target || target === from) {
          setEditingFavCat('');
          return;
        }
        try {
          applySavedState(await postJson('/comfy-panel/prompts/category/rename', { from, to: target }));
          if (favCategory === from) setFavCategory(target);
          setEditingFavCat('');
          setNotice(tr('saved'));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const deleteFavCategory = (name) => askConfirm(tr('confirmDeleteCategory'), async () => {
        try {
          applySavedState(await postJson('/comfy-panel/prompts/category/delete', { name }));
          if (favCategory === name) setFavCategory(null);
          if (editingFavCat === name) setEditingFavCat('');
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      });

      const savedTips = (saved.tips || []).filter((tip) => !tip.hiddenBuiltin).map((tip) => ({ ...tip, user: true }));
      const builtinTips = (library.builtinTips || []).map((tip) => ({
        ...tip,
        images: (tip.images || []).map((image) => ({ src: `/comfy-panel/image?path=${encodeURIComponent(image.file)}`, caption: image.caption })),
      })).filter((tip) => !savedTips.some((entry) => entry.id === tip.id));
      const allTips = builtinTips.concat(savedTips);
      const tipGroups = [...new Set(allTips.map((tip) => tip.group || tr('tipNoGroup')))];
      const visibleTips = allTips.filter((tip) => (!tip.hidden || tipManage)
        && (tipGroup === null || (tip.group || tr('tipNoGroup')) === tipGroup));

      // Quick-start cards: built-ins from the host plus user cards from state.
      const quickHidden = new Set(saved.quickHidden || []);
      const quickUserCards = (saved.quickCards || []).map((card) => ({ ...card, user: true }));
      const quickBuiltinCards = (library.quickStart || [])
        .map((card) => ({ ...card, builtin: true }))
        .filter((card) => !quickUserCards.some((entry) => entry.id === card.id));
      const quickAll = quickBuiltinCards.concat(quickUserCards);
      const quickVisible = quickAll.filter((card) => !quickHidden.has(card.id));
      const quickCardIsEdited = (card) => quickUserCards.some((entry) => entry.id === card.id);

      const openQuickForm = (card) => {
        setQuickFormOpen(true);
        setEditingQuickId(card ? card.id : '');
        setQuickTitle(card ? card.title : '');
        setQuickSteps(card ? (card.steps || []).join('\n') : '');
      };

      const saveQuickCard = async (card) => {
        try {
          const body = await postJson('/comfy-panel/tips/quick/save', {
            id: (card && card.id) || editingQuickId,
            title: quickTitle,
            steps: quickSteps,
          });
          applySavedState(body);
          setQuickFormOpen(false);
          setEditingQuickId('');
          setNotice(tr('saved'));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const deleteQuickCard = (card) => askConfirm(tr('confirmDeleteQuick'), async () => {
        try {
          if (card.builtin || card.user) {
            applySavedState(await postJson('/comfy-panel/tips/quick/hide', { id: card.id, hidden: true }));
          }
          if (card.user) {
            applySavedState(await postJson('/comfy-panel/tips/quick/delete', { id: card.id }));
          }
          if (editingQuickId === card.id) setQuickFormOpen(false);
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      });

      const loadBigjpgStatus = async () => {
        try {
          const body = await callJson('/comfy-panel/bigjpg/status');
          setBjConfigured(Boolean(body.configured));
          setBjRemaining(Number.isFinite(Number(body.remaining)) ? Number(body.remaining) : null);
        } catch { /* panel offline */ }
      };

      const saveBigjpgKey = async () => {
        try {
          const body = await postJson('/comfy-panel/bigjpg/key', { key: bjKeyInput.trim() });
          setBjConfigured(Boolean(body.configured));
          setBjKeyInput('');
          setNotice(tr('saved'));
          await loadBigjpgStatus();
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const upscaleWithBigjpg = async (filename, scale) => {
        if (!filename) return;
        setBjBusy(filename);
        setError('');
        setBjResult(null);
        const label = BIGJPG_LABELS[scale];
        setBjTask({ filename, scale, label, status: 'uploading', startedAt: Date.now(), remoteUrl: '', size: '' });
        try {
          const started = await postJson('/comfy-panel/bigjpg/upscale', {
            name: filename,
            scale,
            style: bjStyle,
            noise: bjNoise,
          });
          if (!started.ok) throw new Error(started.error || 'bigjpg refused');
          if (Number.isFinite(Number(started.remaining))) setBjRemaining(Number(started.remaining));
          const tid = started.tid;
          setBjTask((prev) => (prev ? { ...prev, status: 'queued', tid, minute: started.minute } : prev));
          const deadline = Date.now() + 10 * 60 * 1000;
          let result = null;
          while (Date.now() < deadline) {
            await new Promise((resolve) => setTimeout(resolve, 4000));
            const poll = await callJson(`/comfy-panel/bigjpg/task?tid=${encodeURIComponent(tid)}`);
            setBjTask((prev) => (prev ? { ...prev, status: poll.status || 'process', size: poll.size || prev.size } : prev));
            if (poll.status === 'success' && poll.url) { result = poll; break; }
            if (poll.status === 'error') throw new Error('bigjpg task failed');
          }
          if (!result) throw new Error(tr('bjTimeout'));
          setBjTask((prev) => (prev ? { ...prev, status: 'success', remoteUrl: result.url, size: result.size } : prev));
          setBjResult({ remoteUrl: result.url, size: result.size, filename, label });
          setBjLog((prev) => [{ at: Date.now(), text: `${filename} ${label} 完成（未保存）` }, ...prev].slice(0, 8));
          setNotice(tr('bjReady'));
        } catch (cause) {
          setError(String(cause.message ?? cause));
          setBjTask((prev) => (prev ? { ...prev, status: 'error', error: String(cause.message ?? cause) } : prev));
          setBjLog((prev) => [{ at: Date.now(), text: String(cause.message ?? cause) }, ...prev].slice(0, 8));
        } finally {
          setBjBusy('');
        }
      };

      const convertToDataUrl = async (src, format, quality) => {
        const response = await fetch(src);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext('2d');
        context.drawImage(bitmap, 0, 0);
        const type = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
        return { dataUrl: canvas.toDataURL(type, quality / 100), width: bitmap.width, height: bitmap.height };
      };

      const saveBigjpgResult = async () => {
        if (!bjResult || !bjResult.remoteUrl) return;
        setBjSaving(true);
        try {
          const source = `/comfy-panel/bigjpg/preview?url=${encodeURIComponent(bjResult.remoteUrl)}`;
          const converted = await convertToDataUrl(source, bjFormat, bjQuality);
          const stamp = new Date().toISOString().slice(0, 10);
          const body = await postJson('/comfy-panel/bigjpg/write', {
            dataUrl: converted.dataUrl,
            format: bjFormat,
            name: `bigjpg_${bjResult.label}_${converted.width}x${converted.height}_${stamp}`,
          });
          if (!body.ok) throw new Error(body.error || 'save failed');
          setBjSavedPath(body.path);
          setNotice(`${tr('bjSavedTo')} ${body.path}`);
        } catch (cause) {
          setError(String(cause.message ?? cause));
        } finally {
          setBjSaving(false);
        }
      };

      // Inpaint jobs belong to the inpaint tab; never surface them as the
      // generate result, otherwise the two pages disagree.
      const generateJobs = jobs.filter((job) => job.mode !== 'inpaint');
      const shownJob = (activeId && generateJobs.find((job) => job.id === activeId)) || generateJobs[0] || null;
      jobsRef.current = jobs;
      const runningJob = generateJobs.find((job) => job.state === 'queued' || job.state === 'running');
      /** The inpaint run currently queued or running, from the shared job poll. */
      const inpaintRunning = jobs.find((job) => job.mode === 'inpaint' && (job.state === 'queued' || job.state === 'running')) || null;
      const inpaintLastDone = jobs.find((job) => job.mode === 'inpaint' && job.state === 'done' && job.images && job.images[0]) || null;


      const running = runningJob;

      const entryLabel = (entry) => (entry.kind === 'preset' ? entry.name : label(entry));
      const entryTitle = (entry) => (entry.kind === 'recipe'
        ? (isZh ? entry.noteZh : entry.noteEn)
        : entry.kind === 'preset' ? entry.prompt : entry.tags);

      const refreshStatus = async () => {
        try {
          const body = await callJson('/comfy-panel/status');
          setStatus(body);
        } catch {
          setStatus({ up: false, offline: true });
        }
      };

      const startServer = async () => {
        setBusy('start');
        setError('');
        try {
          await postJson('/comfy-panel/start', {});
          await refreshStatus();
        } catch (cause) {
          setError(String(cause.message ?? cause));
        } finally {
          setBusy('');
        }
      };

      const stopServer = async () => {
        setBusy('stop');
        setError('');
        try {
          await postJson('/comfy-panel/stop', {});
          await refreshStatus();
        } catch (cause) {
          setError(String(cause.message ?? cause));
        } finally {
          setBusy('');
        }
      };

      const loadExtStatus = async () => {
        try {
          const body = await callJson('/comfy-panel/ext/status');
          setExtStatus(body);
        } catch { /* keep the previous status */ }
      };
      const refreshExt = loadExtStatus;

      const openExt = async () => {
        setExtBusy('open');
        setError('');
        try {
          const body = await postJson('/comfy-panel/ext/open', { url: extStatus.pageUrl || undefined });
          setExtStatus((prev) => ({ ...prev, ...body, running: true }));
          setExtMessage('');
        } catch (cause) {
          setError(String(cause.message ?? cause));
        } finally {
          setExtBusy('');
        }
      };

      const closeExt = async () => {
        setExtBusy('close');
        try {
          await postJson('/comfy-panel/ext/close', {});
          await loadExtStatus();
        } catch (cause) {
          setError(String(cause.message ?? cause));
        } finally {
          setExtBusy('');
        }
      };

      const reloadExt = async () => {
        try {
          await postJson('/comfy-panel/ext/reload', {});
          await loadExtStatus();
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const loadExtDebug = async () => {
        try {
          const body = await callJson('/comfy-panel/ext/debug');
          setExtDebugInfo(body);
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const runExt = async () => {
        if (!extPrompt.trim()) {
          setError(tr('needPrompt'));
          return;
        }
        setExtBusy('generate');
        setExtMessage('');
        setError('');
        try {
          const body = await postJson('/comfy-panel/ext/generate', { prompt: extPrompt, waitMs: extWait });
          setExtNeedLogin(Boolean(body.needLogin));
          setExtMessage(body.message ? String(body.message) : '');
          await loadExtStatus();
        } catch (cause) {
          setError(String(cause.message ?? cause));
        } finally {
          setExtBusy('');
        }
      };

      const saveExtShot = async () => {
        try {
          const body = await postJson('/comfy-panel/ext/save-shot', {});
          setNotice(`${tr('savedTo')} ${body.path || ''}`);
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const clickExtSelector = async () => {
        if (!extSelector.trim()) return;
        try {
          const body = await postJson('/comfy-panel/ext/click', { selector: extSelector.trim() });
          setExtMessage(body.message ? String(body.message) : '');
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const searchDiscover = async () => {
        setDiscoverLoading(true);
        setDiscoverError('');
        try {
          const query = new URLSearchParams({
            q: discoverQuery,
            kind: discoverKind,
            source: discoverSource,
          });
          const body = await callJson(`/comfy-panel/discover/search?${query.toString()}`);
          setDiscoverItems(body.items || []);
          if (body.error) setDiscoverError(body.error);
        } catch (cause) {
          setDiscoverItems([]);
          setDiscoverError(String(cause.message ?? cause));
        } finally {
          setDiscoverLoading(false);
        }
      };

      const chooseDiscoverSource = (source) => {
        setDiscoverSource(source);
        setDiscoverBase(DISCOVER_BASES[source] || '');
      };

      const installDiscovered = async (item) => {
        if (!item) return;
        setBusy('download');
        try {
          await postJson('/comfy-panel/download', {
            url: item.url || item.downloadUrl,
            filename: item.filename || '',
            kind: discoverKind === 'lora' ? 'loras' : 'checkpoints',
          });
          setNotice(tr('downloadQueued'));
          await refreshDownloads();
        } catch (cause) {
          setError(String(cause.message ?? cause));
        } finally {
          setBusy('');
        }
      };

      const submitDownload = async () => {
        const trimmed = url.trim();
        if (!/^https?:\/\//i.test(trimmed)) {
          setError(tr('needUrl'));
          return;
        }
        setBusy('download');
        setError('');
        try {
          await postJson('/comfy-panel/download', { url: trimmed, filename: name.trim(), kind });
          setUrl('');
          setName('');
          await refreshDownloads();
        } catch (cause) {
          setError(String(cause.message ?? cause));
        } finally {
          setBusy('');
        }
      };

      const applyTemplate = (template) => {
        update({ prompt: template.prompt || '', negative: template.negative || form.negative });
        setTab('generate');
      };

      const applyRecipe = (recipe) => {
        if (!recipe) return;
        update({
          checkpoint: (options.checkpoints || []).includes(recipe.checkpoint) ? recipe.checkpoint : form.checkpoint,
          width: recipe.width || form.width,
          height: recipe.height || form.height,
          steps: recipe.steps || form.steps,
          cfg: Number.isFinite(Number(recipe.cfg)) ? Number(recipe.cfg) : form.cfg,
          sampler: recipe.sampler || form.sampler,
          scheduler: recipe.scheduler || form.scheduler,
          hires: recipe.hires ? { ...recipe.hires } : { ...OFF_HIRES },
          loras: (recipe.loras || []).slice(0, 6).map((lora) => ({ name: lora.name, weight: lora.weight })),
          prompt: recipe.prompt || form.prompt,
          negative: recipe.negative || form.negative,
          style: '',
          preset: '',
          recipe: recipe.id,
          referenceStyle: '',
        });
        setNotice(tr('recipeApplied'));
      };

      const startGeneration = async () => {
        if (!status.up) { setError(tr('needServer')); return; }
        if (!form.prompt.trim()) { setError(tr('needPrompt')); return; }
        if (!form.checkpoint) { setError(tr('needModel')); return; }
        if (form.mode === 'i2i' && !form.initImage) { setError(tr('needImage')); return; }
        setError('');
        setBusy('generate');
        try {
          const body = await postJson('/comfy-panel/generate', {
            mode: form.mode,
            prompt: form.prompt,
            negative: form.negative,
            checkpoint: form.checkpoint,
            width: form.width,
            height: form.height,
            steps: form.steps,
            cfg: form.cfg,
            sampler: form.sampler,
            scheduler: form.scheduler,
            seed: form.seed,
            batch: form.batch,
            hires: form.hires,
            strength: form.strength,
            initImage: form.initImage ? form.initImage.name : '',
            referenceTags: referenceEntry ? referenceEntry.tags : '',
            clipSkip: form.clipSkip || 1,
            style: form.preset || form.style || '',
            loras: form.loras,
            quality: qualityMatch ? qualityMatch.id : 'custom',
          });
          if (body.job) {
            setJobs((prev) => [body.job, ...prev.filter((job) => job.id !== body.job.id)]);
            setActiveId(body.job.id);
            if ((body.job.loras || []).length < (form.loras || []).length) setNotice(tr('loraMissing'));
          }
        } catch (cause) {
          setError(String(cause.message ?? cause));
        } finally {
          setBusy('');
        }
      };

      const cancelGeneration = async (id) => {
        try {
          await postJson('/comfy-panel/generate/cancel', { id });
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const uploadFile = async (file) => {
        if (!file || !/^image\//.test(file.type)) {
          setError(tr('needImage'));
          return;
        }
        setBusy('upload');
        setError('');
        try {
          const dataUrl = await readImageDataUrl(file);
          const body = await postJson('/comfy-panel/upload', { dataUrl });
          if (!body.image) throw new Error(body.error || 'upload failed');
          setInpaintServerName(body.image);
          update({ mode: 'i2i', initImage: { name: body.image, preview: dataUrl } });
          setNotice(tr('savedImage'));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        } finally {
          setBusy('');
        }
      };

      const chooseFile = () => {
        if (fileRef.current) fileRef.current.click();
      };

      const useOutputForInit = async (filename) => {
        if (!filename) return;
        setPreview(null);
        setBusy('upload');
        try {
          const body = await postJson('/comfy-panel/upload', { source: 'output', name: filename });
          update({ mode: 'i2i', initImage: { name: body.image, preview: imageUrl(body.image) } });
          setTab('generate');
        } catch (cause) {
          setError(String(cause.message ?? cause));
        } finally {
          setBusy('');
        }
      };

      const useRecordForInit = async (record) => {
        const first = record && record.images && record.images[0];
        if (!first) return;
        await useOutputForInit(first.filename);
      };

      const saveImage = async (filename) => {
        if (!filename) return;
        try {
          const body = await postJson('/comfy-panel/outputs/save', { name: filename });
          setNotice(`${tr('savedTo')} ${body.path}`);
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const toggleImage = async (filename, prompt) => {
        if (!filename) return;
        try {
          applySavedState(await postJson('/comfy-panel/images/toggle', { name: filename, prompt: prompt || '' }));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const copyImage = async (filename) => {
        if (!filename) return;
        try {
          if (typeof window.ClipboardItem !== 'function' || !navigator.clipboard?.write) throw new Error(tr('unsupported'));
          const response = await fetch(imageUrl(filename));
          const blob = await response.blob();
          await navigator.clipboard.write([new window.ClipboardItem({ [blob.type || 'image/png']: blob })]);
          setNotice(tr('copiedImage'));
        } catch (cause) {
          setError(`${tr('unsupported')}: ${String(cause.message ?? cause)}`);
        }
      };

      const copyText = async (text) => {
        try {
          if (!navigator.clipboard?.writeText) throw new Error(tr('unsupported'));
          await navigator.clipboard.writeText(String(text ?? ''));
          setNotice(tr('copied'));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const reveal = async (target) => {
        try {
          await postJson('/comfy-panel/reveal', { target });
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const deleteOutput = (filename) => askConfirm(tr('confirmDeleteFile'), async () => {
        if (!filename) return;
        try {
          await postJson('/comfy-panel/outputs/delete', { name: filename });
          setPreview(null);
          await refreshOutputs();
          await refreshSaved();
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      });

      const deleteHistory = (id) => askConfirm(tr('confirmDeleteRecord'), async () => {
        try {
          applySavedState(await postJson('/comfy-panel/history/delete', { id }));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      });

      const clearHistory = () => askConfirm(tr('confirmClearHistory'), async () => {
        try {
          applySavedState(await postJson('/comfy-panel/history/clear', {}));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      });

      const saveFavoriteEdit = async (id) => {
        try {
          applySavedState(await postJson('/comfy-panel/prompts/update', {
            id,
            text: editFavText,
            category: editFavCategory,
          }));
          setEditingFavId('');
          setNotice(tr('saved'));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const loadFavorite = (entry) => {
        update({ prompt: entry.text, negative: entry.negative || '' });
        setTab('generate');
      };

      const loadHistory = async (entry) => {
        const next = {
          mode: entry.mode === 'i2i' ? 'i2i' : 't2i',
          prompt: entry.prompt || '',
          negative: entry.negative || '',
          width: entry.width || form.width,
          height: entry.height || form.height,
          steps: entry.steps || form.steps,
          cfg: Number.isFinite(entry.cfg) ? entry.cfg : form.cfg,
          seed: Number.isFinite(entry.seed) ? entry.seed : form.seed,
          sampler: entry.sampler || form.sampler,
          scheduler: entry.scheduler || form.scheduler,
          batch: entry.batch || form.batch,
          strength: Number.isFinite(entry.strength) ? entry.strength : form.strength,
          loras: (entry.loras || []).slice(0, 6).map((lora) => ({ name: lora.name, weight: lora.weight })),
          style: '',
          preset: '',
          referenceStyle: (styleEntries.find((item) => item.tags && item.tags === entry.referenceTags) || {}).id || '',
        };
        if (entry.checkpoint && (options.checkpoints || []).includes(entry.checkpoint)) next.checkpoint = entry.checkpoint;
        if (entry.hires && typeof entry.hires === 'object') next.hires = { ...OFF_HIRES, ...entry.hires };
        if (entry.mode === 'i2i' && entry.images && entry.images[0]) {
          try {
            const body = await postJson('/comfy-panel/upload', { source: 'output', name: entry.images[0].filename });
            next.initImage = { name: body.image, preview: imageUrl(body.image) };
          } catch { /* keep the current init image */ }
        }
        update(next);
        setTab('generate');
      };

      const openTipForm = (tip) => {
        setTipFormOpen(true);
        setEditingTipId(tip ? tip.id : '');
        setTipTitle(tip ? tip.title : '');
        setTipText(tip ? tip.text : '');
        setTipCategory(tip ? tip.group || '' : (tipGroup && tipGroup !== tr('tipNoGroup') ? tipGroup : ''));
        setTipImages(tip ? (tip.images || []).slice() : []);
      };

      const addTipImage = (filename) => {
        if (!filename) return;
        const src = `/comfy-panel/image?path=${encodeURIComponent(filename)}`;
        setTipImages((prev) => (prev.some((image) => image.src === src) ? prev : prev.concat([{ src, caption: '' }]).slice(0, 8)));
        setNotice(filename);
      };

      const saveTip = async () => {
        if (!tipTitle.trim() && !tipText.trim()) {
          setError(tr('tipNeedContent'));
          return;
        }
        try {
          const editingTip = allTips.find((item) => item.id === editingTipId);
          const body = await postJson('/comfy-panel/tips/save', {
            id: editingTip && editingTip.builtin ? '' : editingTipId,
            title: tipTitle,
            text: tipText,
            group: tipCategory,
            images: tipImages,
          });
          applySavedState(body);
          if (editingTip && editingTip.builtin) {
            applySavedState(await postJson('/comfy-panel/tips/hide', { id: editingTip.id, hidden: true }));
          }
          setTipFormOpen(false);
          setEditingTipId('');
          setNotice(tr('saved'));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const deleteTip = (tipOrId) => askConfirm(tr('confirmDeleteTip'), async () => {
        try {
          const id = typeof tipOrId === 'string' ? tipOrId : tipOrId.id;
          const tip = allTips.find((item) => item.id === id);
          if (tip && tip.builtin) {
            applySavedState(await postJson('/comfy-panel/tips/hide', { id, hidden: true }));
          } else {
            applySavedState(await postJson('/comfy-panel/tips/delete', { id }));
          }
          if (editingTipId === id) setTipFormOpen(false);
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      });

      const toggleTipVisible = async (tip) => {
        try {
          applySavedState(await postJson('/comfy-panel/tips/hide', { id: tip.id, hidden: !tip.hidden }));
          if (!tip.hidden) setEditingTipId('');
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      const restoreQuickCard = async (id) => {
        try {
          applySavedState(await postJson('/comfy-panel/tips/quick/hide', { id, hidden: false }));
        } catch (cause) {
          setError(String(cause.message ?? cause));
        }
      };

      /** Tags a style adds after the user's own prompt must still fit the 8000 char graph limit. */
      const STYLE_APPLY_LIMIT = 6000;
      const styleFits = (tags, entries) => {
        const extra = String(tags || '').length;
        const own = (entries || []).reduce((sum, entry) => sum + String(entry.tags || entry.prompt || '').length, 0);
        return own + extra <= STYLE_APPLY_LIMIT;
      };

      const renderAdvancedCard = () => {
        const stepPresets = [16, 24, 30, 40];
        const cfgPresets = [4, 5, 6, 7, 8];
        const summary = `${tr('steps')} ${form.steps} · CFG ${form.cfg.toFixed(1)} · ${form.sampler}/${form.scheduler}`;
        return h('div', { className: 'cp-card' },
          h('div', { className: 'cp-card-head' },
            h('h2', { className: 'cp-card-title' }, tr('advanced')),
            h('div', { className: 'cp-grow' }),
            h('span', { className: 'cp-size' }, qualityMatch ? label(qualityMatch) : tr('custom'))),
          h('div', { className: 'cp-card-body' },
            h('div', { className: 'cp-rowline' },
              h('span', { className: 'cp-section-title' }, tr('steps')),
              stepPresets.map((value) => h(Chip, {
                key: `step-${value}`,
                active: form.steps === value,
                onClick: () => update({ steps: value }),
              }, String(value)))),
            h('div', { className: 'cp-rowline' },
              h('input', {
                className: 'cp-input cp-num', type: 'number', min: 4, max: 80, step: 1,
                value: form.steps, 'aria-label': tr('steps'),
                onChange: (event) => update({ steps: Math.min(80, Math.max(4, Math.round(Number(event.target.value) || form.steps))) }),
              }),
              h('input', {
                type: 'range', className: 'cp-range', min: 4, max: 60, step: 1, value: Math.min(60, form.steps),
                style: { flex: 1 },
                onChange: (event) => update({ steps: Number(event.target.value) }),
              })),
            h('div', { className: 'cp-rowline' },
              h('span', { className: 'cp-section-title' }, tr('cfg')),
              cfgPresets.map((value) => h(Chip, {
                key: `cfg-${value}`,
                active: Math.abs(form.cfg - value) < 0.001,
                onClick: () => update({ cfg: value }),
              }, String(value)))),
            h('div', { className: 'cp-rowline' },
              h('input', {
                className: 'cp-input cp-num', type: 'number', min: 0.5, max: 15, step: 0.1,
                value: form.cfg, 'aria-label': tr('cfg'),
                onChange: (event) => update({ cfg: Math.min(15, Math.max(0.5, Number(event.target.value) || form.cfg)) }),
              }),
              h('input', {
                type: 'range', className: 'cp-range', min: 1, max: 12, step: 0.1, value: Math.min(12, form.cfg),
                style: { flex: 1 },
                onChange: (event) => update({ cfg: Number(event.target.value) }),
              })),
            h('div', { className: 'cp-rowline' },
              h('span', { className: 'cp-section-title' }, tr('sampler')),
              h('select', {
                className: 'cp-select', value: form.sampler, style: { colorScheme: scheme },
                onChange: (event) => update({ sampler: event.target.value }),
              }, (options.samplers || []).map((entry) => h('option', { key: entry, value: entry }, entry))),
              h('span', { className: 'cp-section-title' }, tr('scheduler')),
              h('select', {
                className: 'cp-select', value: form.scheduler, style: { colorScheme: scheme },
                onChange: (event) => update({ scheduler: event.target.value }),
              }, (options.schedulers || []).map((entry) => h('option', { key: entry, value: entry }, entry))),
              h(Button, {
                small: true,
                onClick: () => update({ sampler: 'dpmpp_2m', scheduler: 'karras' }),
              }, tr('useRecommended'))),
            h('div', { className: 'cp-rowline' },
              h('span', { className: 'cp-section-title' }, tr('batch')),
              h('select', {
                className: 'cp-select', value: form.batch, style: { colorScheme: scheme, width: 76 },
                onChange: (event) => update({ batch: Number(event.target.value) }),
              }, [1, 2, 3, 4].map((entry) => h('option', { key: entry, value: entry }, String(entry)))),
              h('span', { className: 'cp-section-title' }, tr('clipSkip')),
              h('select', {
                className: 'cp-select', value: form.clipSkip, style: { colorScheme: scheme, width: 80 },
                onChange: (event) => update({ clipSkip: Number(event.target.value) }),
              }, [1, 2, 3].map((value) => h('option', { key: value, value }, String(value)))),
              h('span', { className: 'cp-note' }, tr('clipSkipHint'))),
            h('div', { className: 'cp-rowline' },
              h('span', { className: 'cp-section-title' }, tr('seed')),
              h('input', {
                className: 'cp-input cp-grow', type: 'number', min: -1, step: 1,
                value: form.seed < 0 ? '' : form.seed,
                placeholder: tr('seedRandom'),
                onChange: (event) => {
                  const raw = event.target.value;
                  if (raw === '' || raw === '-') { update({ seed: -1 }); return; }
                  const parsed = Number(raw);
                  if (!Number.isFinite(parsed)) { update({ seed: -1 }); return; }
                  update({ seed: Math.max(-1, Math.min(4294967295, Math.round(parsed))) });
                },
              }),
              h(Button, { small: true, onClick: () => update({ seed: -1 }) }, tr('seedRandom')),
              h(Button, { small: true, onClick: () => update({ seed: Math.floor(Math.random() * 4294967295) }) }, tr('seedLock')),
              form.seed < 0 ? h('span', { className: 'cp-note' }, tr('seedAutoHint')) : null),
            h('div', { className: 'cp-rowline' },
              h('span', { className: 'cp-section-title' }, tr('hires')),
              h(Chip, {
                active: form.hires.enabled,
                onClick: () => updateHires({ enabled: !form.hires.enabled }),
              }, tr('hires')),
              form.hires.enabled
                ? h('select', {
                    className: 'cp-select', value: [1.2, 1.5, 1.8, 2].includes(form.hires.scale) ? form.hires.scale : 'custom',
                    style: { colorScheme: scheme, width: 92 },
                    onChange: (event) => {
                      if (event.target.value === 'custom') {
                        updateHires({ scale: Number(form.hires.scale) || 1.5 });
                        return;
                      }
                      updateHires({ scale: Number(event.target.value) });
                    },
                  }, [1.2, 1.5, 1.8, 2].map((value) => h('option', { key: value, value }, `${value}x`))
                    .concat([h('option', { key: 'custom', value: 'custom' }, tr('custom'))]))
                : null,
              form.hires.enabled
                ? h('input', {
                    className: 'cp-input cp-num', type: 'number', min: 1.1, max: 2.5, step: 0.05,
                    value: form.hires.scale, 'aria-label': tr('hiresScale'),
                    onChange: (event) => {
                      const value = Number(event.target.value);
                      if (!Number.isFinite(value)) return;
                      updateHires({ scale: Math.min(2.5, Math.max(1.1, Math.round(value * 100) / 100)) });
                    },
                  })
                : null,
              form.hires.enabled
                ? h('span', { className: 'cp-note' },
                    `${tr('hiresDenoise')} ${form.hires.denoise} · ${tr('hiresSteps')} ${form.hires.steps} · ≈ ${Math.round((form.width * form.hires.scale) / 8) * 8}×${Math.round((form.height * form.hires.scale) / 8) * 8}`)
                : h('span', { className: 'cp-note' }, tr('hiresHint'))),
            form.hires.enabled
              ? h('div', { className: 'cp-rowline' },
                  h('span', { className: 'cp-section-title' }, tr('hiresDenoise')),
                  h('input', {
                    type: 'range', className: 'cp-range', min: 0.2, max: 0.9, step: 0.05, value: form.hires.denoise,
                    style: { flex: 1 }, 'aria-label': tr('hiresDenoise'),
                    onChange: (event) => updateHires({ denoise: Number(event.target.value) }),
                  }),
                  h('input', {
                    className: 'cp-input cp-num', type: 'number', min: 0.2, max: 0.9, step: 0.05, value: form.hires.denoise,
                    onChange: (event) => {
                      const value = Number(event.target.value);
                      if (!Number.isFinite(value)) return;
                      updateHires({ denoise: Math.min(0.9, Math.max(0.2, Math.round(value * 100) / 100)) });
                    },
                  }),
                  h('span', { className: 'cp-section-title' }, tr('hiresSteps')),
                  h('input', {
                    type: 'range', className: 'cp-range', min: 4, max: 40, step: 1, value: form.hires.steps,
                    style: { flex: 1 }, 'aria-label': tr('hiresSteps'),
                    onChange: (event) => updateHires({ steps: Number(event.target.value) }),
                  }),
                  h('input', {
                    className: 'cp-input cp-num', type: 'number', min: 4, max: 40, step: 1, value: form.hires.steps,
                    onChange: (event) => updateHires({ steps: Math.min(40, Math.max(4, Math.round(Number(event.target.value) || form.hires.steps))) }),
                  }))
              : null,
            h('div', { className: 'cp-rowline' },
              h(Chip, {
                active: Boolean(form.autoFavorite),
                onClick: () => update({ autoFavorite: !form.autoFavorite }),
              }, tr('autoFavorite')),
              h(Button, {
                small: true,
                onClick: () => update({
                  steps: 26,
                  cfg: 5,
                  sampler: 'dpmpp_2m',
                  scheduler: 'karras',
                  batch: 1,
                  seed: -1,
                  clipSkip: 1,
                  hires: { ...OFF_HIRES },
                }),
              }, tr('resetParams'))),
            h('div', { className: 'cp-note' }, summary)));
      };

      const renderQualityBar = () => h('div', { className: 'cp-card' },
        h('div', { className: 'cp-card-head' },
          h('h2', { className: 'cp-card-title' }, tr('quality')),
          h('div', { className: 'cp-grow' }),
          h('span', { className: 'cp-size' }, qualityMatch ? label(qualityMatch) : tr('custom'))),
        h('div', { className: 'cp-card-body' },
          h('div', { className: 'cp-chips' }, QUALITY.map((preset) => h(Chip, {
            key: preset.id,
            active: qualityMatch && qualityMatch.id === preset.id,
            onClick: () => applyQuality(preset),
          }, label(preset)))),
          h('div', { className: 'cp-note' }, tr(qualityMatch ? qualityMatch.note : 'qualityNoteDraft'))));

      const renderStyles = () => {
        const presetChips = (saved.styles || []).map((preset) => h(Chip, {
          key: preset.id,
          active: form.preset === preset.id,
          tone: 'preset',
          title: preset.prompt,
          onClick: () => applyPreset(preset),
        }, `★ ${preset.name}`));
        const visible = styleEntriesVisible.filter((entry) => (styleFilter === null ? true : styleGroupOf(entry) === styleFilter));
        const groupSelect = (value, onChange) => h('select', {
          className: 'cp-select', value, style: { colorScheme: scheme, width: 130 },
          onChange: (event) => onChange(event.target.value),
        }, styleGroupsAll.map((group) => h('option', { key: group.key, value: group.key }, group.label)));
        return h('div', { className: 'cp-card' },
          h('div', { className: 'cp-card-head' },
            h('h2', { className: 'cp-card-title' }, tr('style')),
            h(Button, { small: true, onClick: () => setSavingStyle((value) => !value) }, tr('saveStyle')),
            h(Button, { small: true, onClick: () => setStyleManage((value) => !value) }, styleManage ? tr('doneManage') : tr('manageStyles'))),
          h('div', { className: 'cp-card-body' },
            h('div', { className: 'cp-rowline' },
              h('span', { className: 'cp-section-title' }, tr('styleGroups')),
              h(Chip, { active: styleFilter === null, onClick: () => setStyleFilter(null) }, tr('allGroups')),
              styleGroupsAll.map((group) => h(Chip, {
                key: group.key,
                active: styleFilter === group.key,
                onClick: () => setStyleFilter(styleFilter === group.key ? null : group.key),
              }, group.label))),
            h('div', { className: 'cp-chips' },
              h(Chip, { active: !form.style && !form.preset && !form.recipe, onClick: clearStyle }, tr('styleNone')),
              visible.map((entry) => h(Chip, {
                key: `${entry.kind}-${entry.id}`,
                active: entry.kind === 'preset' ? form.preset === entry.id : entry.kind === 'recipe' ? form.recipe === entry.id : form.style === entry.id,
                tone: entry.kind === 'preset' ? 'preset' : undefined,
                title: entryTitle(entry),
                onClick: () => applyStyleEntry(entry),
              }, entry.kind === 'preset' ? `★ ${entry.name}` : entryLabel(entry)))),
            h('div', { className: 'cp-rowline' },
              h('span', { className: 'cp-section-title' }, tr('referenceStyle')),
              h('select', {
                className: 'cp-select', value: form.referenceStyle || '', style: { colorScheme: scheme },
                onChange: (event) => update({ referenceStyle: event.target.value }),
              },
                h('option', { value: '' }, tr('referenceNone')),
                referenceOptions.map((entry) => h('option', { key: entry.id, value: entry.id }, entryLabel(entry)))),
              referenceEntry
                ? h('span', { className: 'cp-note' }, entryTitle(referenceEntry))
                : h('span', { className: 'cp-note' }, tr('referenceHint'))),
            styleManage
              ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
                  h('div', { className: 'cp-rowline' },
                    h('input', {
                      className: 'cp-input', 'data-grow': 'true', value: newGroupName,
                      placeholder: tr('newGroup'),
                      onChange: (event) => setNewGroupName(event.target.value),
                    }),
                    h(Button, { small: true, onClick: () => { void saveStyleGroup(); }, disabled: !newGroupName.trim() }, tr('newGroup'))),
                  (saved.styleGroups || []).length === 0
                    ? h('div', { className: 'cp-note' }, tr('noGroups'))
                    : h('div', { className: 'cp-lora-list' }, (saved.styleGroups || []).map((group) => {
                        const count = styleEntriesVisible.filter((entry) => styleGroupOf(entry) === group.name).length;
                        if (editingGroup === group.name) {
                          return h('div', { className: 'cp-lora-row', key: `group-edit-${group.id}` },
                            h('input', {
                              className: 'cp-input', 'data-grow': 'true', value: editGroupName,
                              onChange: (event) => setEditGroupName(event.target.value),
                            }),
                            h(Button, { small: true, primary: true, onClick: () => { void saveRenameGroup(group.name); } }, tr('saveEdit')),
                            h(Button, { small: true, onClick: () => setEditingGroup(null) }, tr('cancelEdit')));
                        }
                        return h('div', { className: 'cp-lora-row', key: `group-${group.id}` },
                          h('span', { className: 'cp-lora-name' }, group.name),
                          h('span', { className: 'cp-size' }, `${count}`),
                          h(Button, { small: true, onClick: () => startRenameGroup(group.name) }, tr('edit')),
                          h(Button, { small: true, onClick: () => { void deleteStyleGroup(group.name); } }, tr('remove')));
                      })),
                  h('div', { className: 'cp-rowline' },
                    h('input', {
                      className: 'cp-input', style: { width: 130 }, value: styleWordName,
                      placeholder: tr('styleWordName'),
                      onChange: (event) => setStyleWordName(event.target.value),
                    }),
                    h('input', {
                      className: 'cp-input', 'data-grow': 'true', value: styleWordTags,
                      placeholder: tr('styleWordTags'),
                      onChange: (event) => setStyleWordTags(event.target.value),
                    }),
                    groupSelect(styleWordGroup, setStyleWordGroup),
                    h(Button, {
                      small: true, primary: true,
                      onClick: () => { void saveCustomStyle(); },
                      disabled: !styleWordName.trim() || !styleWordTags.trim(),
                    }, tr('addStyleWord'))),
                  h('div', { className: 'cp-lora-list' },
                    styleEntriesVisible.map((entry) => (editingStyleId === entry.id
                      ? h('div', { className: 'cp-lora-row', key: `edit-${entry.id}` },
                          h('input', {
                            className: 'cp-input', style: { width: 110 }, value: editName,
                            placeholder: tr('styleWordName'),
                            onChange: (event) => setEditName(event.target.value),
                          }),
                          h('input', {
                            className: 'cp-input', 'data-grow': 'true', value: editTags,
                            placeholder: tr('styleWordTags'),
                            onChange: (event) => setEditTags(event.target.value),
                          }),
                          h(Button, { small: true, primary: true, onClick: () => { void saveStyleEdit(entry); } }, tr('saveEdit')),
                          h(Button, { small: true, onClick: () => setEditingStyleId('') }, tr('cancelEdit')))
                      : h('div', { className: 'cp-lora-row', key: `manage-${entry.kind}-${entry.id}` },
                          h('span', { className: 'cp-lora-name', title: entryTitle(entry) }, entryLabel(entry)),
                          groupSelect(styleGroupOf(entry), (value) => { void assignStyle(entry.id, value); }),
                          h(Button, { small: true, onClick: () => startEditStyle(entry) }, tr('edit')),
                          entry.kind === 'custom'
                            ? h(Button, { small: true, onClick: () => { void deleteCustomStyle(entry.id); } }, tr('remove'))
                            : entry.kind === 'preset'
                              ? h(Button, { small: true, onClick: () => { void deleteStylePreset(entry.id); } }, tr('remove'))
                              : h(Button, { small: true, onClick: () => { void hideStyle(entry.id, true); } }, tr('remove')))))),
                  h('div', { className: 'cp-rowline' },
                    h(Button, { small: true, onClick: () => { void resetStyles(); } }, tr('resetStyles'))))
              : null,
            savingStyle
              ? h('div', { className: 'cp-inline' },
                  h('input', {
                    className: 'cp-input', 'data-grow': 'true', value: styleName,
                    placeholder: tr('styleNamePlaceholder'),
                    onChange: (event) => setStyleName(event.target.value),
                    onKeyDown: (event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void saveStylePreset();
                      }
                    },
                  }),
                  h(Button, { small: true, primary: true, onClick: () => { void saveStylePreset(); } }, tr('saveStyle')))
              : null));
      };

      const renderLoras = () => {
        const installed = options.loras || [];
        const active = form.loras || [];
        const notes = library.loraNotes || {};
        const activeChips = active.map((lora) => {
          const meta = notes[lora.name];
          return h('span', { className: 'cp-tag', key: lora.name, title: lora.name },
            meta ? `${label(meta)} ${lora.weight}` : `${lora.name} ${lora.weight}`);
        });
        return h('div', { className: 'cp-card' },
          h('div', { className: 'cp-card-head' },
            h('h2', { className: 'cp-card-title' }, tr('lora')),
            active.length ? h('span', { className: 'cp-size' }, `${active.length}`) : null,
            h(Button, { small: true, onClick: () => { void refreshOptions(); } }, tr('refresh')),
            h(Button, { small: true, onClick: () => setShowLoras((value) => !value) }, showLoras ? tr('hideLoras') : tr('manageLoras'))),
          h('div', { className: 'cp-card-body' },
            installed.length === 0
              ? h('div', { className: 'cp-note' }, tr('loraEmpty'))
              : (active.length > 0 ? h('div', { className: 'cp-chips' }, activeChips) : h('div', { className: 'cp-note' }, tr('loraNone'))),
            showLoras && installed.length > 0
              ? h('div', { className: 'cp-lora-list' }, installed.map((loraName) => {
                  const entry = active.find((lora) => lora.name === loraName);
                  const meta = notes[loraName];
                  return h('div', { className: 'cp-lora-row', key: loraName },
                    h(Chip, { active: Boolean(entry), onClick: () => toggleLora(loraName) }, entry ? '✓' : '+'),
                    h('div', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 } },
                      h('span', { className: 'cp-lora-name', title: loraName }, loraName),
                      meta
                        ? h('span', { className: 'cp-note' },
                            `${tr('loraStyle')}: ${label(meta)} · ${tr('recommended')} ${meta.weight} · ${isZh ? meta.noteZh : meta.noteEn}`)
                        : null),
                    entry
                      ? h('input', {
                          type: 'range', className: 'cp-lora-weight', min: 0, max: 1.6, step: 0.05,
                          value: entry.weight,
                          onChange: (event) => setLoraWeight(loraName, event.target.value),
                        })
                      : null,
                    entry ? h('span', { className: 'cp-lora-value' }, entry.weight.toFixed(2)) : null);
                }))
              : null));
      };

      const renderInit = () => {
        if (form.mode !== 'i2i') return null;
        const filled = Boolean(form.initImage);
        return h('div', { className: 'cp-card' },
          h('div', { className: 'cp-card-head' }, h('h2', { className: 'cp-card-title' }, tr('modeI2i'))),
          h('div', { className: 'cp-card-body' },
            h('div', { className: 'cp-init' },
              h('div', {
                className: 'cp-init-img',
                'data-filled': filled ? 'true' : 'false',
                role: 'button',
                tabIndex: 0,
                onClick: chooseFile,
                onKeyDown: (event) => { if (event.key === 'Enter' || event.key === ' ') chooseFile(); },
                onDragOver: (event) => { event.preventDefault(); },
                onDrop: (event) => {
                  event.preventDefault();
                  const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
                  void uploadFile(file);
                },
              }, filled
                ? h('img', { src: form.initImage.preview, alt: '' })
                : h('span', null, tr('dropHint'))),
              h('div', { className: 'cp-init-side' },
                h('div', { className: 'cp-rowline' },
                  h(Button, { small: true, onClick: chooseFile, disabled: busy === 'upload' }, tr('chooseImage')),
                  h(Button, { small: true, onClick: () => setTab('outputs') }, tr('fromOutputs')),
                  filled ? h(Button, { small: true, onClick: () => update({ initImage: null }) }, tr('removeImage')) : null),
                h(Prop, { label: tr('strength'), value: form.strength.toFixed(2) },
                  h('input', {
                    type: 'range', className: 'cp-range', min: 0.1, max: 0.95, step: 0.05, value: form.strength,
                    onChange: (event) => update({ strength: Number(event.target.value) }),
                  })))),
            h('input', {
              ref: fileRef, type: 'file', accept: 'image/*', style: { display: 'none' },
              onChange: (event) => {
                const file = event.target.files && event.target.files[0];
                event.target.value = '';
                void uploadFile(file);
              },
            })));
      };

      const renderPromptEditor = (rows) => h('div', { className: 'cp-editor' },
        h('textarea', {
          className: 'cp-textarea',
          rows: rows || 4,
          value: form.prompt,
          placeholder: tr('promptPlaceholder'),
          onChange: (event) => update({ prompt: event.target.value }),
          onKeyDown: (event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              void startGeneration();
            }
          },
        }),
        (analysis.hints || []).length
          ? h('div', { className: 'cp-chips' }, analysis.hints.map((hint) => h(Chip, {
              key: hint.zh,
              title: hint.en,
              onClick: () => applyHint(hint),
            }, hint.zh)))
          : null,
        h('div', { className: 'cp-rowline' },
          h(Button, { small: true, onClick: randomIdea }, tr('randomIdea')),
          h(Button, { small: true, onClick: tidyPrompt }, tr('tidyPrompt')),
          h(Button, { small: true, onClick: () => { void saveFavorite(favCategory === null ? '' : favCategory); }, disabled: !form.prompt.trim() }, tr('favorite')),
          h(Chip, { active: favToStyle, onClick: () => setFavToStyle((value) => !value), title: tr('favoriteToStyleHint') }, `＋${tr('style')}`),
          h(Button, { small: true, onClick: () => update({ prompt: '' }) }, tr('clear'))));

      const renderResult = () => {
        const job = shownJob;
        const isRunning = job && (job.state === 'queued' || job.state === 'running');
        let body = null;
        if (!job) {
          body = h('div', { className: 'cp-empty' }, tr('noResult'));
        } else if (isRunning) {
          const progress = job.progress && job.progress.max ? Math.min(1, job.progress.value / job.progress.max) : null;
          body = h('div', { className: 'cp-progress' },
            h('div', {
              className: 'cp-progress-bar',
              'data-indeterminate': progress === null ? 'true' : 'false',
            }, h('i', { style: progress === null ? undefined : { width: `${Math.round(progress * 100)}%` } })),
            h('div', { className: 'cp-statusline' },
              h('span', { className: 'cp-spinner' }),
              h('span', null, job.state === 'queued' ? tr('queued') : tr('generating')),
              progress === null ? null : h('span', null, `${Math.round(progress * 100)}%`),
              h('span', null, `${tr('elapsed')} ${formatElapsed(clock - (job.startedAt || Date.now()))}`)),
            h('div', { className: 'cp-note' }, tr('runningHint')));
        } else if (job.state === 'failed' || job.state === 'canceled') {
          body = h('div', null,
            h('div', { className: 'cp-empty', style: { color: 'var(--dsw-alias-state-error-primary)' } }, job.error || tr('failed')),
            h('div', { className: 'cp-rowline' },
              h(Button, { small: true, onClick: () => { void startGeneration(); } }, tr('again')),
              h(Button, { small: true, onClick: () => { void cancelGeneration(job.id); } }, tr('cancel'))));
        } else {
          const meta = [
            job.outWidth && job.outWidth !== job.width
              ? `${job.width}×${job.height} → ${job.outWidth}×${job.outHeight}`
              : `${job.width}×${job.height}`,
            `${job.steps} ${tr('steps')}`,
            `seed ${job.seed}`,
            formatElapsed((job.finishedAt || Date.now()) - (job.startedAt || Date.now())),
          ];
          if ((job.loras || []).length) meta.push(`LoRA ${job.loras.length}`);
          body = h('div', null,
            h('div', { className: 'cp-grid' }, (job.images || []).map((image) => h('button', {
              key: image.filename,
              type: 'button',
              className: 'cp-thumb',
              title: image.filename,
              onClick: () => setPreview({ src: image.url, title: image.filename, name: image.filename, prompt: job.prompt }),
            }, h('img', { src: image.url, alt: image.filename, loading: 'lazy' })))),
            h('div', { className: 'cp-statusline', style: { marginTop: 8 } },
              meta.map((part) => h('span', { key: part }, part))),
            h('div', { className: 'cp-rowline', style: { marginTop: 8 } },
              h(Button, { small: true, onClick: () => { void startGeneration(); } }, tr('again')),
              h(Button, { small: true, onClick: () => update({ seed: job.seed }) }, tr('reuseSeed')),
              h(Button, { small: true, onClick: () => { void copyText(job.prompt); } }, tr('copyPrompt')),
              h(Button, { small: true, onClick: () => { void toggleImage(job.images[0].filename, job.prompt); } }, tr('favoriteImage')),
              h(Button, { small: true, onClick: () => { void saveImage(job.images[0].filename); } }, tr('saveToFolder'))),
            bjConfigured && bjOffer === (job.images && job.images[0] ? job.images[0].filename : null)
              ? h('div', { className: 'cp-rowline', style: { marginTop: 6 } },
                  h('span', { className: 'cp-section-title' }, tr('bjOffer')),
                  [1, 2, 3, 4].map((scale) => h(Button, {
                    key: scale, small: true,
                    disabled: Boolean(bjBusy),
                    onClick: () => { void upscaleWithBigjpg(job.images[0].filename, scale); },
                  }, BIGJPG_LABELS[scale])),
                  bjBusy ? h('span', { className: 'cp-note' }, tr('bjWorking')) : null,
                  h(Button, { small: true, onClick: () => setBjOffer(null) }, tr('bjSkip')))
              : null);
        }
        const activeCount = jobs.filter((entry) => entry.state === 'queued' || entry.state === 'running').length;
        return h('div', { className: 'cp-result' },
          h('div', { className: 'cp-result-head' },
            h('span', null, tr('resultTitle')),
            h('span', { className: 'cp-grow' }),
            activeCount > 1 ? h('span', { className: 'cp-tag' }, `${tr('queue')} ${activeCount}`) : null,
            job && job.quality && job.quality !== 'custom' ? h('span', { className: 'cp-tag' }, job.quality) : null),
          h('div', { className: 'cp-result-body' }, body));
      };

      const renderTipBody = (tip) => {
        const lines = String(tip.text || '').split('\n');
        const blocks = [];
        let list = [];
        const flush = () => {
          if (list.length) {
            blocks.push(h('ul', { className: 'cp-tip-list', key: `ul-${blocks.length}` },
              list.map((item, index) => h('li', { key: index }, item))));
            list = [];
          }
        };
        lines.forEach((line) => {
          const text = line.trimEnd();
          if (!text.trim()) { flush(); return; }
          if (/^[•·\-]\s+/.test(text.trim()) || /^\d+[.、]\s+/.test(text.trim())) {
            list.push(text.trim().replace(/^[•·\-]\s+/, ''));
            return;
          }
          flush();
          const heading = /^(.+?)[：:]$/.exec(text.trim());
          if (heading && heading[1].length <= 24) {
            blocks.push(h('h3', { className: 'cp-tip-sub', key: `h-${blocks.length}` }, heading[1]));
            return;
          }
          blocks.push(h('p', { className: 'cp-tip-para', key: `p-${blocks.length}` }, text));
        });
        flush();
        return blocks;
      };

      function renderQuickForm(card) {
        return h('div', { className: 'cp-tip-quick-card' },
          h('strong', { className: 'cp-tip-quick-title' }, card ? tr('tipEdit') : tr('quickAdd')),
          h('input', {
            className: 'cp-input', value: quickTitle, placeholder: tr('quickTitlePlaceholder'),
            onChange: (event) => setQuickTitle(event.target.value),
          }),
          h('textarea', {
            className: 'cp-textarea', 'data-short': 'true', rows: 4, value: quickSteps,
            placeholder: tr('quickStepsPlaceholder'),
            onChange: (event) => setQuickSteps(event.target.value),
          }),
          h('div', { className: 'cp-rowline' },
            h(Button, { small: true, primary: true, onClick: () => { void saveQuickCard(card); } }, tr('saveEdit')),
            h(Button, { small: true, onClick: () => { setQuickFormOpen(false); setEditingQuickId(''); } }, tr('cancelEdit'))));
      }

      function renderTipForm(tip) {
        return h('div', { className: 'cp-card' },
          h('div', { className: 'cp-card-head' },
            h('h2', { className: 'cp-card-title' }, tip ? tr('tipEdit') : tr('tipAdd')),
            h('div', { className: 'cp-grow' }),
            h(Button, { small: true, primary: true, onClick: () => { void saveTip(); } }, tr('saveEdit')),
            h(Button, { small: true, onClick: () => { setTipFormOpen(false); setEditingTipId(''); } }, tr('cancelEdit'))),
          h('div', { className: 'cp-card-body' },
            h('div', { className: 'cp-rowline' },
              h('input', {
                className: 'cp-input', 'data-grow': 'true', value: tipTitle, placeholder: tr('tipNamePlaceholder'),
                onChange: (event) => setTipTitle(event.target.value),
              }),
              h('input', {
                className: 'cp-input', style: { width: 150 }, value: tipCategory, placeholder: tr('tipGroupPlaceholder'),
                onChange: (event) => setTipCategory(event.target.value),
              })),
            h('textarea', {
              className: 'cp-textarea', rows: 6, value: tipText, placeholder: tr('tipBodyPlaceholder'),
              onChange: (event) => setTipText(event.target.value),
            }),
            h('div', { className: 'cp-rowline' },
              h('span', { className: 'cp-section-title' }, tr('tipImages')),
              tipImages.length
                ? tipImages.map((image, index) => h('span', { className: 'cp-tag', key: `img-${index}` },
                    `图${index + 1}`,
                    h('button', {
                      type: 'button', className: 'cp-linkbtn',
                      onClick: () => setTipImages((prev) => prev.filter((_, i) => i !== index)),
                    }, ' ×')))
                : h('span', { className: 'cp-note' }, tr('tipAddFromOutputs'))),
            h('div', { className: 'cp-rowline' },
              h(Button, { small: true, onClick: () => setTab('outputs') }, tr('tipAddFromOutputs')),
              h(Button, { small: true, primary: true, onClick: () => { void saveTip(); } }, tr('saved')))));
      }

      const renderHelpTab = () => {
        const sourceTips = tipManage ? allTips : allTips.filter((tip) => !tip.hidden);
        const searched = sourceTips.filter((tip) => {
          if (!tipQuery.trim()) return true;
          const needle = tipQuery.trim().toLowerCase();
          return `${tip.title || ''}\n${tip.text || ''}\n${tip.group || ''}`.toLowerCase().includes(needle);
        });
        const countOf = (group) => searched.filter((tip) => (tip.group || tr('tipNoGroup')) === group).length;
        const groups = tipGroups;
        const matched = searched.filter((tip) => tipGroup === null || (tip.group || tr('tipNoGroup')) === tipGroup);
        const grouped = tipQuery.trim()
          ? [{ name: tr('searchResults'), tips: matched }]
          : groups.map((name) => ({ name, tips: matched.filter((tip) => (tip.group || tr('tipNoGroup')) === name) }));

        const quickCardsData = quickManage ? quickAll : quickVisible;
        const quickForm = quickFormOpen && !editingQuickId ? renderQuickForm(null) : null;
        const quickCards = tipQuery.trim() || quickCardsData.length === 0
          ? (quickForm || null)
          : h('div', { className: 'cp-tip-quick' },
              quickForm,
              quickCardsData.map((card) => (editingQuickId === card.id && quickFormOpen
                ? renderQuickForm(card)
                : h('div', { className: 'cp-tip-quick-card', key: card.id },
                    h('strong', { className: 'cp-tip-quick-title' }, card.title),
                    h('ol', { className: 'cp-tip-list' }, card.steps.map((step, index) => h('li', { key: index }, step))),
                    quickManage
                      ? h('div', { className: 'cp-rowline' },
                          h(Button, { small: true, onClick: () => openQuickForm(card) }, tr('tipEdit')),
                          quickHidden.has(card.id)
                            ? h(Button, { small: true, onClick: () => { void restoreQuickCard(card.id); } }, tr('tipShow'))
                            : h(Button, { small: true, onClick: () => { void deleteQuickCard(card); } }, tr('remove')))
                      : null))));

        const sections = grouped.map((section) => (section.tips.length === 0 ? null : h('div', { className: 'cp-tip-section', key: section.name },
          h('h3', { className: 'cp-tip-group' }, `${section.name}`),
          section.tips.map((tip) => {
            if (editingTipId === tip.id && tipFormOpen) return renderTipForm(tip);
            const tipImages = (tip.images || []).length
              ? h('div', { className: 'cp-tip-images' }, tip.images.map((image, index) => h('figure', { className: 'cp-tip-figure', key: `${tip.id}-${index}` },
                  h('img', {
                    className: 'cp-tip-img',
                    src: image.src,
                    alt: image.caption || '',
                    loading: 'lazy',
                    onClick: () => setPreview({ src: image.src, title: image.caption || tip.title, name: '', prompt: '', addToTip: true }),
                  }),
                  image.caption ? h('figcaption', { className: 'cp-tip-caption' }, image.caption) : null)))
              : null;
            return h('div', { className: 'cp-card', key: tip.id },
              h('div', { className: 'cp-card-head' },
                h('h2', { className: 'cp-card-title' }, tip.title || tr('tips')),
                tip.hidden ? h('span', { className: 'cp-size' }, tr('tipHidden')) : null,
                h('div', { className: 'cp-grow' }),
                tip.images && tip.images.length
                  ? h(Button, { small: true, onClick: () => copyText(tip.text) }, tr('copyPrompt'))
                  : null,
                h(Button, { small: true, onClick: () => openTipForm(tip) }, tr('tipEdit')),
                h(Button, { small: true, onClick: () => { void toggleTipVisible(tip); } }, tip.hidden ? tr('tipShow') : tr('tipHide')),
                h(Button, { small: true, onClick: () => { void deleteTip(tip); } }, tr('remove'))),
              h('div', { className: 'cp-card-body' }, renderTipBody(tip)),
              tipImages);
          }))));

        return h('div', { className: 'cp-col' },
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('tabHelp')),
              h('input', {
                className: 'cp-input', style: { width: 220 }, value: tipQuery,
                placeholder: tr('tipSearch'),
                onChange: (event) => setTipQuery(event.target.value),
              }),
              h('div', { className: 'cp-grow' }),
              h(Button, { small: true, onClick: () => { setTipManage((value) => !value); setQuickManage((value) => !value); } },
                tipManage ? tr('tipDone') : tr('tipManage')),
              h(Button, { small: true, primary: true, onClick: () => openTipForm(null) }, tr('tipAdd'))),
            quickManage
              ? h('div', { className: 'cp-card-body' },
                  h('div', { className: 'cp-rowline' },
                    h('span', { className: 'cp-section-title' }, tr('quickTitle')),
                    h(Button, { small: true, primary: true, onClick: () => openQuickForm(null) }, tr('quickAdd'))))
              : null,
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-chips' },
                h(Chip, { active: tipGroup === null, onClick: () => setTipGroup(null) }, tr('allGroups')),
                groups.map((group) => h(Chip, {
                  key: group,
                  active: tipGroup === group,
                  onClick: () => setTipGroup(tipGroup === group ? null : group),
                }, `${group} ${countOf(group)}`))),
              tipFormOpen && !editingTipId ? renderTipForm(null) : null)),
          quickCards,
          matched.length === 0 ? h('div', { className: 'cp-empty' }, tr('tipNoMatch')) : null,
          sections);
      };

      const bigjpgSourceName = bjSource && bjSource !== 'latest'
        ? bjSource
        : (shownJob && shownJob.images && shownJob.images[0] ? shownJob.images[0].filename : '');

      const renderBigjpgBlock = () => {
        const task = bjTask;
        const running = Boolean(bjBusy);
        const elapsed = task ? Math.max(0, Math.round((clock - task.startedAt) / 1000)) : 0;
        const sourceOptions = (outputs || []).slice(0, 24).map((file) => file.name);
        const previewSrc = bjResult
          ? `/comfy-panel/bigjpg/preview?url=${encodeURIComponent(bjResult.remoteUrl)}`
          : '';
        return h('div', { className: 'cp-card', key: 'bigjpg-block' },
          h('div', { className: 'cp-card-head' },
            h('h2', { className: 'cp-card-title' }, tr('bjBlock')),
            h('div', { className: 'cp-grow' }),
            bjRemaining !== null ? h('span', { className: 'cp-size' }, `${tr('bjRemaining')} ${bjRemaining}`) : null,
            h(Button, { small: true, onClick: () => { setBjTask(null); setBjResult(null); setBjSavedPath(''); } }, tr('bjClear'))),
          h('div', { className: 'cp-card-body' },
            !bjConfigured
              ? h('div', { className: 'cp-note' }, tr('bjNeedKey'))
              : null,
            h('div', { className: 'cp-rowline' },
              h('span', { className: 'cp-section-title' }, tr('bjSource')),
              h('select', {
                className: 'cp-select', style: { colorScheme: scheme, maxWidth: 220 },
                value: bjSource || 'latest',
                onChange: (event) => setBjSource(event.target.value),
              },
                h('option', { value: 'latest' }, tr('bjLatest')),
                sourceOptions.map((name) => h('option', { key: name, value: name }, name)))),
            h('div', { className: 'cp-rowline' },
              h('span', { className: 'cp-section-title' }, tr('bjScale')),
              [1, 2, 3, 4].map((value) => h(Chip, {
                key: value,
                active: bjScale === value,
                onClick: () => setBjScale(value),
              }, BIGJPG_LABELS[value]))),
            h('div', { className: 'cp-rowline' },
              h('span', { className: 'cp-section-title' }, tr('bjStyle')),
              h(Chip, { active: bjStyle === 'art', onClick: () => setBjStyle('art') }, tr('bjStyleArt')),
              h(Chip, { active: bjStyle === 'photo', onClick: () => setBjStyle('photo') }, tr('bjStylePhoto')),
              h('span', { className: 'cp-section-title' }, tr('bjNoise')),
              h('select', {
                className: 'cp-select', value: bjNoise, style: { colorScheme: scheme, width: 92 },
                onChange: (event) => setBjNoise(event.target.value),
              }, ['-1', '0', '1', '2', '3'].map((value) => h('option', { key: value, value }, value)))),
            h('div', { className: 'cp-rowline' },
              h('span', { className: 'cp-section-title' }, tr('bjFormat')),
              ['png', 'jpg', 'webp'].map((value) => h(Chip, {
                key: value,
                active: bjFormat === value,
                onClick: () => setBjFormat(value),
              }, value.toUpperCase())),
              bjFormat === 'png' ? null : h('span', { className: 'cp-note' }, `${tr('bjQuality')} ${bjQuality}`),
              bjFormat === 'png' ? null : h('input', {
                type: 'range', className: 'cp-range', min: 60, max: 100, step: 1, value: bjQuality,
                style: { width: 120 },
                onChange: (event) => setBjQuality(Number(event.target.value)),
              })),
            h('div', { className: 'cp-rowline' },
              h(Button, {
                primary: true, small: true,
                disabled: running || !bjConfigured || !bigjpgSourceName,
                onClick: () => { void upscaleWithBigjpg(bigjpgSourceName, bjScale); },
              }, running ? tr('bjWorking') : tr('bjStart')),
              bigjpgSourceName ? h('span', { className: 'cp-note' }, bigjpgSourceName) : h('span', { className: 'cp-note' }, tr('bjNoSource'))),
            task
              ? h('div', { className: 'cp-statusline', style: { marginTop: 6 } },
                  running ? h('span', { className: 'cp-spinner' }) : null,
                  h('span', null, `${tr('bjStatus')}: ${task.status}`),
                  h('span', null, `${tr('elapsed')} ${elapsed}s`),
                  task.size ? h('span', null, `${tr('bjSize')} ${task.size}`) : null)
              : null,
            running ? h('div', { className: 'cp-bar' }, h('i', { style: { width: '60%' } })) : null,
            previewSrc
              ? h('div', { className: 'cp-rowline', style: { marginTop: 8 } },
                  h('img', {
                    src: previewSrc,
                    alt: 'bigjpg result',
                    style: { maxWidth: '100%', maxHeight: '420px', borderRadius: '10px', border: '.5px solid var(--dsw-alias-border-l1)', display: 'block' },
                  }))
              : null,
            bjResult
              ? h('div', { className: 'cp-rowline', style: { marginTop: 8 } },
                  h(Button, { small: true, primary: true, onClick: () => { void saveBigjpgResult(); }, disabled: bjSaving }, `${tr('bjSave')} .${bjFormat}`),
                  h(Button, { small: true, onClick: () => window.open(bjResult.remoteUrl, '_blank', 'noopener') }, tr('openImage')),
                  h(Button, { small: true, onClick: () => { void upscaleWithBigjpg(bjResult.filename, task ? task.scale : bjScale); } }, tr('bjAgain')),
                  bjSavedPath ? h('span', { className: 'cp-note' }, `${tr('bjSavedTo')} ${bjSavedPath}`) : h('span', { className: 'cp-note' }, tr('bjNotSaved')))
              : null));
      };
      const renderGenerateTab = () => {
        const checkpointNote = (library.checkpointNotes || {})[form.checkpoint];
        return [h('div', { className: 'cp-workspace' },
        h('div', { className: 'cp-col' },
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-rowline' },
                h('div', { className: 'cp-seg' },
                  h('button', {
                    type: 'button', className: 'cp-seg-item', 'data-active': form.mode === 't2i' ? 'true' : 'false',
                    onClick: () => update({ mode: 't2i' }),
                  }, tr('modeT2i')),
                  h('button', {
                    type: 'button', className: 'cp-seg-item', 'data-active': form.mode === 'i2i' ? 'true' : 'false',
                    onClick: () => update({ mode: 'i2i' }),
                  }, tr('modeI2i')))),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('checkpoint')),
                h('select', {
                  className: 'cp-select cp-grow', value: form.checkpoint, style: { colorScheme: scheme },
                  onChange: (event) => update({ checkpoint: event.target.value }),
                }, (options.checkpoints || []).length === 0
                  ? h('option', { value: '' }, tr('noModels'))
                  : (options.checkpoints || []).map((entry) => h('option', { key: entry, value: entry }, entry)))),
              checkpointNote
                ? h('div', { className: 'cp-note' },
                    `${tr('modelStyle')}: ${label(checkpointNote)} · ${tr('modelRecommend')} ${checkpointNote.width}×${checkpointNote.height} / ${checkpointNote.steps} ${tr('steps')} / CFG ${checkpointNote.cfg} · ${isZh ? checkpointNote.noteZh : checkpointNote.noteEn}`)
                : null,
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('aspect')),
                ASPECTS.map((aspect) => h(Chip, {
                  key: aspect.label,
                  active: form.width === aspect.width && form.height === aspect.height,
                  onClick: () => update({ width: aspect.width, height: aspect.height }),
                }, aspect.label))),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('resolution')),
                h('input', {
                  className: 'cp-input cp-num', type: 'number', min: 256, max: 2048, step: 8,
                  value: form.width, 'aria-label': tr('width'),
                  onChange: (event) => changeWidth(event.target.value),
                }),
                h('span', { className: 'cp-size' }, '×'),
                h('input', {
                  className: 'cp-input cp-num', type: 'number', min: 256, max: 2048, step: 8,
                  value: form.height, 'aria-label': tr('height'),
                  onChange: (event) => changeHeight(event.target.value),
                }),
                h(Button, { small: true, onClick: () => update({ width: form.height, height: form.width }) }, tr('swap')),
                h(Chip, {
                  active: lockRatio,
                  onClick: () => setLockRatio((value) => !value),
                  title: lockRatio ? tr('lockRatio') : tr('unlockRatio'),
                }, lockRatio ? tr('lockRatio') : tr('unlockRatio'))))),
          renderAdvancedCard(),
          renderQualityBar(),
          renderStyles(),
          renderLoras(),
          renderInit(),
          h('div', { className: 'cp-card' }, renderPromptEditor(4)),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('negative')),
                h('div', { className: 'cp-grow' }),
                (library.negatives || []).map((preset) => h(Chip, {
                  key: preset.id,
                  onClick: () => update({ negative: preset.text }),
                }, label(preset)))),
              h('textarea', {
                className: 'cp-textarea', 'data-short': 'true', rows: 2,
                value: form.negative,
                placeholder: tr('negativePlaceholder'),
                onChange: (event) => update({ negative: event.target.value }),
              })))),
        h('div', { className: 'cp-col' },
          renderResult(),
          h('div', { className: 'cp-actions' },
            h(Button, {
              primary: true,
              onClick: () => { void startGeneration(); },
              disabled: Boolean(busy) || Boolean(running) || !status.up,
            }, running ? tr('generating') : tr('generate')),
            running ? h(Button, { onClick: () => { void cancelGeneration(running.id); } }, tr('cancel')) : null,
            !running && inpaintRunning
              ? h('span', { className: 'cp-actions-note' }, tr('inpaintElsewhereRunning'))
              : null,
            !status.up
              ? h('span', { className: 'cp-actions-note' }, tr('needServer'))
              : h('span', { className: 'cp-actions-note' }, 'Ctrl + Enter')),
          renderBigjpgBlock())),
        h('div', { className: 'cp-bottom-generate' },
          h(Button, {
            primary: true,
            onClick: () => { void startGeneration(); },
            disabled: Boolean(busy) || Boolean(running) || !status.up,
          }, running ? tr('generating') : tr('generate')),
          h('span', { className: 'cp-actions-note' }, 'Ctrl + Enter'))];
      };

      /**
       * Strokes are stored as points in the source image's own pixel space, so
       * resizing the window (or the panel) can never shift them. Every redraw
       * repaints the whole mask from this list onto the canvas grid.
       */
      const stampDot = (context, x, y, radius, erase) => {
        if (!(radius > 0)) return;
        if (erase) {
          context.save();
          context.globalCompositeOperation = 'destination-out';
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
          context.restore();
          return;
        }
        context.save();
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = 'rgba(255, 48, 84, 1)';
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      };

      const repaintMask = () => {
        const canvas = inpaintCanvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        const strokes = maskStrokes.current || [];
        for (const stroke of strokes) {
          stampDot(context, stroke.x, stroke.y, stroke.radius, stroke.erase);
        }
      };

      /** Clear both the stored strokes and the visible canvas. */
      const clearMask = () => {
        maskStrokes.current = [];
        maskDirty.current = false;
        setHasMaskPaint(false);
        repaintMask();
      };

      /** Red brush strokes are the only marks on the canvas, so look for red. */
      const isBrushPixel = (r, g, b, a) => a > 40 && r > 150 && g < 140 && b < 160;

      const maskHasPaint = () => {
        const strokes = maskStrokes.current || [];
        return strokes.some((stroke) => !stroke.erase);
      };

      /**
       * Give the mask canvas the source image's own pixel grid and repaint the
       * stored strokes. Called whenever the layout may have changed.
       */
      const syncMaskCanvas = (canvas) => {
        const target = canvas || inpaintCanvasRef.current;
        if (!target) return;
        const size = inpaintSize;
        if (!size || !size.width || !size.height) return;
        const width = Math.max(1, Math.round(size.width));
        const height = Math.max(1, Math.round(size.height));
        if (target.width !== width || target.height !== height) {
          target.width = width;
          target.height = height;
        }
        repaintMask();
      };

      /** Keep the canvas element exactly over the rendered image. */
      const alignMaskCanvas = () => {
        const canvas = inpaintCanvasRef.current;
        if (!canvas) return;
        const stage = canvas.parentElement;
        const image = stage ? stage.querySelector('.cp-inpaint-img') : null;
        if (image && image.clientWidth) {
          canvas.style.width = `${image.clientWidth}px`;
          canvas.style.height = `${image.clientHeight}px`;
          canvas.style.left = `${image.offsetLeft}px`;
          canvas.style.top = `${image.offsetTop}px`;
        }
        syncMaskCanvas(canvas);
      };

      /** Map a pointer event to the mask canvas pixel grid. */
      const eventToMaskPoint = (canvas, event) => {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
          x: (event.clientX - rect.left) * scaleX,
          y: (event.clientY - rect.top) * scaleY,
          radius: Math.max(2, (inpaintBrush / 2) * ((scaleX + scaleY) / 2)),
        };
      };

      const addMaskPoint = (canvas, event) => {
        const point = eventToMaskPoint(canvas, event);
        if (!point) return;
        const strokes = maskStrokes.current || [];
        strokes.push({ x: point.x, y: point.y, radius: point.radius, erase: inpaintTool === 'eraser' });
        maskStrokes.current = strokes;
        maskDirty.current = true;
        setHasMaskPaint(strokes.some((stroke) => !stroke.erase));
        const context = canvas.getContext('2d');
        stampDot(context, point.x, point.y, point.radius, inpaintTool === 'eraser');
        setMaskVersion((value) => value + 1);
      };

      const beginMaskStroke = (event) => {
        const canvas = inpaintCanvasRef.current;
        if (!canvas) return;
        if (!inpaintSize) return;
        alignMaskCanvas();
        addMaskPoint(canvas, event);
        try { canvas.setPointerCapture?.(event.pointerId); } catch { /* older engines */ }
      };

      const moveMaskStroke = (event) => {
        if (event.pointerType === 'mouse' && event.buttons === 0) return;
        const canvas = inpaintCanvasRef.current;
        if (!canvas) return;
        addMaskPoint(canvas, event);
      };

      /** Build the black/white mask ComfyUI expects (white = repaint). */
      /** Load an image element from a URL for pixel comparison. */
      const loadImageElement = (url) => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('image load failed'));
        image.src = url;
      });

      /** Compare the result with the source and pack a change map for the UI. */
      const buildInpaintDiff = async (sourceUrl, resultUrl, sourceName, resultName) => {
        if (!resultUrl) return null;
        // Preferred: let the host compare the files with Pillow, which never
        // hits the browser's canvas restrictions.
        if (sourceName && resultName) {
          try {
            const remote = await postJson('/comfy-panel/inpaint/diff', { before: sourceName, after: resultName });
            if (remote && typeof remote.percent === 'number') {
              return { map: remote.map || '', percent: remote.percent };
            }
          } catch { /* fall through to the canvas path */ }
        }
        try {
          const before = sourceUrl ? await loadImageElement(sourceUrl).catch(() => null) : null;
          const after = await loadImageElement(resultUrl);
          if (!before) return { map: '', percent: null };
          const width = Math.min(before.naturalWidth || before.width, after.naturalWidth || after.width);
          const height = Math.min(before.naturalHeight || before.height, after.naturalHeight || after.height);
          if (!width || !height) return null;
          const ratio = Math.min(1, 320 / Math.max(width, height));
          const workW = Math.max(1, Math.round(width * ratio));
          const workH = Math.max(1, Math.round(height * ratio));

          const canvasA = document.createElement('canvas');
          canvasA.width = workW;
          canvasA.height = workH;
          canvasA.getContext('2d').drawImage(before, 0, 0, workW, workH);

          const canvasB = document.createElement('canvas');
          canvasB.width = workW;
          canvasB.height = workH;
          const ctxB = canvasB.getContext('2d');
          ctxB.drawImage(after, 0, 0, workW, workH);

          let dataA;
          let dataB;
          try {
            dataA = canvasA.getContext('2d').getImageData(0, 0, workW, workH).data;
            dataB = ctxB.getImageData(0, 0, workW, workH).data;
          } catch {
            // Tainted canvas: report a coarse sample instead of failing.
            return { map: '', percent: null };
          }

          let changed = 0;
          let overlay = null;
          try { overlay = ctxB.createImageData(workW, workH) } catch { overlay = null }
          for (let index = 0; index < dataA.length; index += 4) {
            const delta = (Math.abs(dataA[index] - dataB[index])
              + Math.abs(dataA[index + 1] - dataB[index + 1])
              + Math.abs(dataA[index + 2] - dataB[index + 2])) / 3;
            const hit = delta > 16;
            if (hit) changed += 1;
            if (overlay) {
              overlay.data[index] = hit ? 255 : dataB[index];
              overlay.data[index + 1] = hit ? 60 : dataB[index + 1];
              overlay.data[index + 2] = hit ? 90 : dataB[index + 2];
              overlay.data[index + 3] = 255;
            }
          }
          const percent = changed / (workW * workH) * 100;
          let map = '';
          if (overlay) {
            try {
              const overlayCanvas = document.createElement('canvas');
              overlayCanvas.width = workW;
              overlayCanvas.height = workH;
              overlayCanvas.getContext('2d').putImageData(overlay, 0, 0);
              map = overlayCanvas.toDataURL('image/png');
            } catch { map = '' }
          }
          return { map, percent };
        } catch {
          return null;
        }
      };

      const exportMask = () => new Promise((resolve, reject) => {
        const size = inpaintSize;
        if (!size) {
          setError(tr('inpaintNeedSource'));
          reject(new Error('no image'));
          return;
        }
        if (!maskHasPaint()) {
          setError(tr('inpaintNeedMask'));
          reject(new Error('empty mask'));
          return;
        }
        const out = document.createElement('canvas');
        out.width = size.width;
        out.height = size.height;
        const context = out.getContext('2d');
        context.fillStyle = '#000';
        context.fillRect(0, 0, out.width, out.height);
        // Rebuild the mask from the stored image-space strokes, so the exported
        // file never depends on the element's current size.
        for (const stroke of maskStrokes.current || []) {
          if (!stroke.erase) stampDot(context, stroke.x, stroke.y, stroke.radius, false);
        }
        let pixels;
        try {
          pixels = context.getImageData(0, 0, out.width, out.height);
        } catch {
          setError(tr('inpaintNeedMask'));
          reject(new Error('mask unreadable'));
          return;
        }
        const data = pixels.data;
        let painted = 0;
        for (let index = 0; index < data.length; index += 4) {
          const hit = data[index + 3] > 40 && data[index] > 120;
          const value = hit ? 255 : 0;
          if (hit) painted += 1;
          data[index] = value;
          data[index + 1] = value;
          data[index + 2] = value;
          data[index + 3] = 255;
        }
        if (painted / (out.width * out.height) <= 0.00005) {
          setError(tr('inpaintNeedMask'));
          reject(new Error('empty mask'));
          return;
        }
        context.putImageData(pixels, 0, 0);
        resolve(out.toDataURL('image/png'));
      });

      const runInpaint = async () => {
        if (!inpaintSource) { setError(tr('inpaintNeedSource')); return; }
        if (!status.up) { setError(tr('needServer')); return; }
        const preset = INPAINT_PRESETS.find((item) => item.id === inpaintPresetId);
        const prompt = inpaintPrompt.trim() || (preset ? preset.prompt : '');
        if (!prompt) { setError(tr('needPrompt')); return; }
        if (!maskHasPaint()) {
          setError(tr('inpaintNeedMask'));
          return;
        }
        setError('');
        setInpaintBusy(true);
        try {
          const mask = await exportMask();
          const body = await postJson('/comfy-panel/inpaint', {
            image: inpaintSource,
            mask,
            prompt,
            negative: inpaintNegative,
            checkpoint: inpaintModel || form.checkpoint,
            width: inpaintSize.width,
            height: inpaintSize.height,
            steps: inpaintSteps,
            cfg: inpaintCfg,
            sampler: form.sampler,
            scheduler: form.scheduler,
            denoise: inpaintDenoise,
            maskGrow: inpaintGrow,
            seed: inpaintSeed,
            loras: inpaintLoras,
          });
          if (!body.job) throw new Error(body.error || 'inpaint failed');
          const serverInput = body.inputImage || inpaintServerName;
          const deadline = Date.now() + 5 * 60 * 1000;
          let current = body.job.state;
          let job = body.job;
          while (Date.now() < deadline && (current === 'queued' || current === 'running')) {
            await new Promise((wait) => setTimeout(wait, 2500));
            const status2 = await callJson('/comfy-panel/generate/status');
            job = (status2.jobs || []).find((entry) => entry.id === body.job.id) || job;
            current = job.state;
          }
          if (current === 'done' && job.images && job.images[0]) {
            const finished = { filename: job.images[0].filename, url: job.images[0].url };
            // Reset the card first so a stale image can never linger.
            setInpaintResult(null);
            setInpaintDiff(null);
            const present = await imageExists(finished.filename);
            if (present) {
              setInpaintResult(finished);
              setInpaintDiff(null);
              registerInpaintRecord({ ...job, initImage: serverInput || inpaintServerName });
              setInpaintActiveJob(job.id);
              const sourceForDiff = inpaintSource;
              void buildInpaintDiff(sourceForDiff, resultUrl(finished.filename), serverInput, finished.filename).then((diff) => {
                setInpaintDiff(diff ? { ...diff, forName: finished.filename } : { map: '', percent: null, forName: finished.filename });
              });
            } else {
              try {
                const cached = window.localStorage.getItem(INPAINT_LAST_KEY);
                if (cached) {
                  setInpaintResult({ filename: '本地缓存', url: cached });
                  setNotice(tr('inpaintDone'));
                } else {
                  setError(tr('inpaintFileMissing'));
                }
              } catch {
                setError(tr('inpaintFileMissing'));
              }
            }
            setNotice(tr('inpaintDone'));
            await refreshOutputs();
            await refreshSaved();
          } else {
            setError(job.error || tr('failed'));
          }
        } catch (cause) {
          setError(String(cause.message ?? cause));
        } finally {
          setInpaintBusy(false);
        }
      };


      const renderInpaintTab = () => {
        const pickSource = async (file) => {
          if (!file) return;
          try {
            const dataUrl = await readImageDataUrl(file);
            setInpaintSource(dataUrl);
            setInpaintName(file.name || '');
            setInpaintResult(null);
                        setInpaintTool('brush');
            maskDirty.current = false;
            maskStrokes.current = [];
          } catch (cause) {
            setError(String(cause.message ?? cause));
          }
        };

        const loadFromOutput = async (filename) => {
          if (!filename) return;
          try {
            const response = await fetch(imageUrl(filename));
            const blob = await response.blob();
            const dataUrl = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => reject(new Error('read failed'));
              reader.readAsDataURL(blob);
            });
            setInpaintSource(dataUrl);
            setInpaintName(filename);
            setInpaintResult(null);
                        maskDirty.current = false;
            maskStrokes.current = [];
            setNotice(tr('inpaintLoaded'));
          } catch (cause) {
            setError(String(cause.message ?? cause));
          }
        };

        const alignMaskCanvas = () => {
        const canvas = inpaintCanvasRef.current;
        if (!canvas) return;
        syncMaskCanvas(canvas);
        const img = canvas.parentElement && canvas.parentElement.querySelector('.cp-inpaint-img');
        if (img && img.clientWidth) {
          canvas.style.width = `${img.clientWidth}px`;
          canvas.style.height = `${img.clientHeight}px`;
        }
      };

      const stage = inpaintSource
          ? h('div', { className: 'cp-inpaint-wrap' },
              h('div', { className: 'cp-inpaint-stage' },
                h('img', {
                  className: 'cp-inpaint-img',
                  src: inpaintSource,
                  alt: '',
                  draggable: false,
                  onLoad: (event) => {
                    const image = event.currentTarget;
                    if (image.naturalWidth && image.naturalHeight) {
                      setInpaintSize({ width: image.naturalWidth, height: image.naturalHeight });
                      maskDirty.current = false;
                      maskStrokes.current = [];
                      setTimeout(alignMaskCanvas, 0);
                      setTimeout(alignMaskCanvas, 120);
                    }
                  },
                }),
                h('canvas', {
                  ref: inpaintCanvasRef,
                  className: 'cp-inpaint-mask',
                  'data-on': inpaintTool === 'eraser' ? 'true' : 'false',
                  onPointerDown: beginMaskStroke,
                  onPointerMove: moveMaskStroke,
                }),
                h('div', { className: 'cp-inpaint-tools' },
                  h(Chip, { active: inpaintTool === 'brush', onClick: () => setInpaintTool('brush') }, tr('inpaintBrushMode')),
                  h(Chip, { active: inpaintTool === 'eraser', onClick: () => setInpaintTool('eraser') }, tr('inpaintEraser')))),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('inpaintBrush')),
                h('input', {
                  type: 'range', className: 'cp-range', min: 8, max: 160, step: 4, value: inpaintBrush,
                  style: { width: 180 },
                  onChange: (event) => setInpaintBrush(Number(event.target.value)),
                }),
                h('span', { className: 'cp-size' }, `${inpaintBrush}px`),
                h(Button, { small: true, onClick: clearMask }, tr('inpaintClearMask'))),
              h('div', { className: 'cp-note' }, tr('inpaintTip')))
          : h('div', {
              className: 'cp-empty',
              style: { padding: '48px 16px', cursor: 'pointer', border: '1px dashed var(--dsw-alias-border-l1)', borderRadius: 10 },
              onClick: () => inpaintFileRef.current && inpaintFileRef.current.click(),
              onDragOver: (event) => { event.preventDefault(); },
              onDrop: (event) => { event.preventDefault(); void pickSource(event.dataTransfer?.files?.[0]); },
            }, tr('inpaintNeedSource'));

        const recentOutputs = (outputState.outputs || []).slice(0, 24);
        const selected = (inpaintRecords || []).find((entry) => entry.jobId === inpaintActiveJob) || null;
        const result = selected
          ? { filename: selected.filename, url: imageUrl(selected.filename) }
          : (activeRecord
            ? { filename: activeRecord.filename, url: imageUrl(activeRecord.filename) }
            : (inpaintResult || null));

        return h('div', { className: 'cp-col' },
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('tabInpaint')),
              h('div', { className: 'cp-grow' }),
              h(Button, { small: true, onClick: () => inpaintFileRef.current && inpaintFileRef.current.click() }, tr('inpaintChoose')),
              h(Button, { small: true, onClick: () => { void refreshOutputs(); } }, tr('refresh'))),
            h('div', { className: 'cp-card-body' }, stage),
            h('input', {
              ref: inpaintFileRef, type: 'file', accept: 'image/*', style: { display: 'none' },
              onChange: (event) => {
                const file = event.target.files && event.target.files[0];
                event.target.value = '';
                void pickSource(file);
              },
            })),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' }, h('h2', { className: 'cp-card-title' }, tr('fromOutputs'))),
            h('div', { className: 'cp-card-body' },
              recentOutputs.length === 0
                ? h('div', { className: 'cp-note' }, tr('emptyOutputs'))
                : h('div', { className: 'cp-grid' }, recentOutputs.map((file) => h('button', {
                    key: file.name,
                    type: 'button',
                    className: 'cp-thumb',
                    title: file.name,
                    onClick: () => { void loadFromOutput(file.name); },
                  }, h('img', { src: imageUrl(file.name), alt: file.name, loading: 'lazy' })))))),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('inpaintProgress')),
              h('div', { className: 'cp-grow' }),
              inpaintRunning
                ? h('span', { className: 'cp-pill' }, tr('inpaintRunning'))
                : inpaintLastDone
                  ? h('span', { className: 'cp-pill' }, tr('inpaintDoneTag'))
                  : h('span', { className: 'cp-note' }, tr('inpaintIdle'))),
            h('div', { className: 'cp-card-body' },
              (() => {
                const job = inpaintRunning || inpaintLastDone;
                if (!job) return h('div', { className: 'cp-empty' }, tr('inpaintIdle'));
                const progress = job.progress && job.progress.max ? Math.min(1, job.progress.value / job.progress.max) : null;
                return h('div', { className: 'cp-progress' },
                  h('div', {
                    className: 'cp-progress-bar',
                    'data-indeterminate': progress === null ? 'true' : 'false',
                  }, h('i', { style: progress === null ? undefined : { width: `${Math.round(progress * 100)}%` } })),
                  h('div', { className: 'cp-statusline' },
                    job.state === 'running' ? h('span', { className: 'cp-spinner' }) : null,
                    h('span', null, job.state === 'queued' ? tr('queued') : job.state === 'running' ? tr('generating') : tr('done')),
                    progress === null ? null : h('span', null, `${Math.round(progress * 100)}%`),
                    h('span', null, `${job.steps || '?'} ${tr('steps')} · CFG ${job.cfg ?? '-'}`),
                    h('span', null, `${tr('elapsed')} ${formatElapsed(clock - (job.startedAt || Date.now()))}`)),
                  job.state === 'running' || job.state === 'queued'
                    ? h('div', { className: 'cp-rowline' },
                        h(Button, { small: true, onClick: () => { void cancelGeneration(job.id); } }, tr('cancel')))
                    : null);
              })())),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' }, h('h2', { className: 'cp-card-title' }, tr('inpaintSettings'))),
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('checkpoint')),
                h('select', {
                  className: 'cp-select cp-grow', value: inpaintModel, style: { colorScheme: scheme },
                  onChange: (event) => setInpaintModel(event.target.value),
                }, (options.checkpoints || []).map((entry) => h('option', { key: entry, value: entry }, entry)))),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('promptPresets')),
                INPAINT_PRESETS.map((item) => h(Chip, {
                  key: item.id,
                  active: inpaintPrompt === item.prompt && inpaintPresetId === item.id,
                  onClick: () => {
                    setInpaintPresetId(item.id);
                    setInpaintPrompt(item.prompt);
                  },
                }, tr(item.key)))),
              h('textarea', {
                className: 'cp-textarea', rows: 3, value: inpaintPrompt,
                placeholder: tr('inpaintPromptPlaceholder'),
                onChange: (event) => setInpaintPrompt(event.target.value),
              }),
              h('textarea', {
                className: 'cp-textarea cp-textarea-sm', rows: 2, value: inpaintNegative,
                placeholder: tr('negative'),
                onChange: (event) => setInpaintNegative(event.target.value),
              }),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('inpaintDenoise')),
                h('input', {
                  type: 'range', className: 'cp-range', min: 0.2, max: 0.95, step: 0.05, value: inpaintDenoise,
                  style: { flex: 1 },
                  onChange: (event) => setInpaintDenoise(Number(event.target.value)),
                }),
                h('span', { className: 'cp-size' }, inpaintDenoise.toFixed(2))),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('inpaintGrow')),
                h('input', {
                  type: 'range', className: 'cp-range', min: 0, max: 48, step: 2, value: inpaintGrow,
                  style: { flex: 1 },
                  onChange: (event) => setInpaintGrow(Number(event.target.value)),
                }),
                h('span', { className: 'cp-size' }, `${inpaintGrow}px`)),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('steps')),
                h('input', {
                  className: 'cp-input cp-num', type: 'number', min: 4, max: 80, step: 1, value: inpaintSteps,
                  onChange: (event) => setInpaintSteps(Math.min(80, Math.max(4, Math.round(Number(event.target.value) || inpaintSteps)))),
                }),
                h('span', { className: 'cp-section-title' }, tr('cfg')),
                h('input', {
                  className: 'cp-input cp-num', type: 'number', min: 0.5, max: 15, step: 0.1, value: inpaintCfg,
                  onChange: (event) => setInpaintCfg(Math.min(15, Math.max(0.5, Number(event.target.value) || inpaintCfg))),
                }),
                h('span', { className: 'cp-section-title' }, tr('seed')),
                h('input', {
                  className: 'cp-input', type: 'number', min: -1, step: 1,
                  value: inpaintSeed < 0 ? '' : inpaintSeed,
                  placeholder: tr('seedRandom'),
                  style: { width: 150 },
                  onChange: (event) => {
                    const raw = event.target.value;
                    const value = Number(raw);
                    setInpaintSeed(raw === '' || !Number.isFinite(value) ? -1 : Math.max(-1, Math.round(value)));
                  },
                })),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('lora')),
                h('div', { className: 'cp-chips' },
                  (options.loras || []).map((loraName) => {
                    const active = (inpaintLoras || []).find((entry) => entry.name === loraName);
                    return h(Chip, {
                      key: loraName,
                      active: Boolean(active),
                      title: loraName,
                      onClick: () => setInpaintLoras((prev) => (prev.some((entry) => entry.name === loraName)
                        ? prev.filter((entry) => entry.name !== loraName)
                        : prev.concat([{ name: loraName, weight: 0.55 }]))),
                    }, loraName.replace(/\.safetensors$/, ''));
                  }))),
              (inpaintLoras || []).length
                ? h('div', { className: 'cp-lora-list' }, (inpaintLoras || []).map((entry) => h('div', { className: 'cp-lora-row', key: entry.name },
                    h('span', { className: 'cp-lora-name', title: entry.name }, entry.name.replace(/\.safetensors$/, '')),
                    h('input', {
                      type: 'range', className: 'cp-lora-weight', min: 0, max: 1.6, step: 0.05, value: entry.weight,
                      onChange: (event) => {
                        const weight = Number(event.target.value);
                        setInpaintLoras((prev) => prev.map((item) => (item.name === entry.name ? { ...item, weight } : item)));
                      },
                    }),
                    h('span', { className: 'cp-lora-value' }, entry.weight.toFixed(2)))))
                : null,
              h('div', { className: 'cp-actions' },
                h(Button, {
                  primary: true,
                  onClick: () => { void runInpaint(); },
                  disabled: !inpaintSource || inpaintBusy || Boolean(running) || !status.up || !hasMaskPaint,
                }, inpaintBusy ? tr('inpaintRunning') : tr('inpaintRun')),
                !status.up ? h('span', { className: 'cp-actions-note' }, tr('needServer')) : null,
                h('span', { className: 'cp-actions-note' }, tr('inpaintHint'))))),
          result
            ? h('div', { className: 'cp-card' },
                h('div', { className: 'cp-card-head' },
                  h('h2', { className: 'cp-card-title' }, tr('inpaintResult')),
                  h('div', { className: 'cp-grow' }),
                  h(Button, { small: true, onClick: () => { setInpaintSource(imageUrl(result.filename)); setInpaintName(result.filename); setInpaintResult(null); setInpaintTool('brush'); } }, tr('inpaintContinue')),
                  h(Button, { small: true, onClick: () => { void saveImage(result.filename); } }, tr('saveToFolder'))),
                (inpaintRecords || []).length
                  ? h('div', { className: 'cp-card-body' },
                      h('div', { className: 'cp-rowline' },
                        h('span', { className: 'cp-section-title' }, tr('inpaintRecent')),
                        h('span', { className: 'cp-size' }, String((inpaintRecords || []).length)),
                        h('div', { className: 'cp-grow' }),
                        h(Button, {
                          small: true,
                          onClick: () => setInpaintRecentManage((value) => !value),
                        }, inpaintRecentManage ? tr('doneManage') : tr('inpaintRecentManage'))),
                      h('div', { className: 'cp-inpaint-compare' }, (inpaintRecords || []).map((entry) => h('div', {
                        key: entry.jobId,
                        className: 'cp-inpaint-figure',
                        style: {
                          outline: entry.jobId === inpaintActiveJob ? '2px solid var(--dsw-alias-brand-primary)' : 'none',
                          borderRadius: 8,
                          padding: 2,
                        },
                      },
                        h('img', {
                          className: 'cp-inpaint-thumb',
                          src: resultUrl(entry.filename),
                          alt: '',
                          title: new Date(entry.at).toLocaleTimeString(),
                          style: { cursor: 'pointer' },
                          onClick: () => {
                            setInpaintActiveJob(entry.jobId);
                            setInpaintResult(null);
                            setInpaintDiff(null);
                          },
                        }),
                        inpaintRecentManage
                          ? h('div', { className: 'cp-rowline', style: { gap: 4 } },
                              h(Button, {
                                small: true,
                                onClick: () => {
                                  setInpaintRemoved((prev) => (prev.includes(entry.jobId) ? prev : prev.concat([entry.jobId])));
                                  setInpaintRecords((prev) => prev.filter((item) => item.jobId !== entry.jobId));
                                  if (inpaintActiveJob === entry.jobId) {
                                    setInpaintActiveJob('');
                                    setInpaintResult(null);
                                    setInpaintDiff(null);
                                  }
                                },
                              }, tr('remove')))
                          : h('figcaption', { className: 'cp-tip-caption' }, new Date(entry.at).toLocaleTimeString())))))
                  : null,
                h('div', { className: 'cp-card-body' },
                  h('img', {
                    key: `result-${result.filename}-${resultStamp}`,
                    className: 'cp-inpaint-result',
                    src: resultUrl(result.filename),
                    alt: '',
                    onError: (event) => {
                      event.currentTarget.style.display = 'none';
                      setInpaintResult(null);
                      setInpaintDiff(null);
                      setError(tr('inpaintFileMissing'));
                    },
                  })),
                h('div', { className: 'cp-card-body' },
                      h('div', { className: 'cp-rowline' },
                        h('span', { className: 'cp-section-title' }, tr('inpaintChanged')),
                        inpaintDiff && inpaintDiff.percent !== null && inpaintDiff.percent !== undefined
                          ? h('span', { className: 'cp-size' }, `${inpaintDiff.percent.toFixed(2)}%`)
                          : h('span', { className: 'cp-note' }, tr('inpaintNoDiff')),
                        inpaintDiff && inpaintDiff.percent !== null && inpaintDiff.percent < 0.05
                          ? h('span', { className: 'cp-note' }, tr('inpaintTinyChange'))
                          : null),
                      h('div', { className: 'cp-inpaint-compare' },
                        h('figure', { className: 'cp-inpaint-figure' },
                          h('img', { className: 'cp-inpaint-thumb', src: inpaintSource, alt: '' }),
                          h('figcaption', { className: 'cp-tip-caption' }, tr('inpaintBefore'))),
                        h('figure', { className: 'cp-inpaint-figure' },
                          h('img', {
                            key: `thumb-${result.filename}-${resultStamp}`,
                            className: 'cp-inpaint-thumb',
                            src: resultUrl(result.filename),
                            alt: '',
                            onError: (event) => { event.currentTarget.style.visibility = 'hidden'; },
                          }),
                          h('figcaption', { className: 'cp-tip-caption' }, tr('inpaintAfter'))),
                        inpaintDiff && inpaintDiff.map
                          ? h('figure', { className: 'cp-inpaint-figure' },
                              h('img', { className: 'cp-inpaint-thumb', src: inpaintDiff.map, alt: '' }),
                              h('figcaption', { className: 'cp-tip-caption' }, tr('inpaintDiff')))
                          : h('figure', { className: 'cp-inpaint-figure' },
                              h('div', { className: 'cp-inpaint-thumb cp-inpaint-thumb-empty' }, tr('inpaintNoDiff')),
                              h('figcaption', { className: 'cp-tip-caption' }, tr('inpaintDiff')))))
                )
            : null);
      };

      const renderStyleManagerTab = () => {
        const groups = styleGroupsAll;
        const needle = styleManageQuery.trim().toLowerCase();
        const sourceEntries = styleShowHidden ? styleEntries : styleEntriesVisible;
        const rows = sourceEntries.filter((entry) => {
          if (styleFilter !== null && styleGroupOf(entry) !== styleFilter) return false;
          if (!needle) return true;
          return `${entryLabel(entry)}\n${entryTitle(entry) || ''}\n${styleGroupOf(entry)}`.toLowerCase().includes(needle);
        });
        const selected = new Set(styleSelected);
        const groupSelectFor = (value, onChange) => h('select', {
          className: 'cp-select', value, style: { colorScheme: scheme, width: 140 },
          onChange: (event) => onChange(event.target.value),
        }, groups.map((group) => h('option', { key: group.key, value: group.key }, group.label)));
        const countOf = (key) => styleEntries.filter((entry) => styleGroupOf(entry) === key).length;

        const categoryRows = h('div', { className: 'cp-lora-list' }, groups.map((group) => ((editingSpecialGroup !== null && editingSpecialGroup === group.key) || (editingGroup !== null && editingGroup === group.key))
          ? h('div', { className: 'cp-lora-row', key: `gm-${group.key}` },
              h('input', {
                className: 'cp-input', 'data-grow': 'true', value: editGroupName,
                onChange: (event) => setEditGroupName(event.target.value),
              }),
              h(Button, {
                small: true, primary: true,
                onClick: () => {
                  if (group.special) void saveSpecialGroupLabel(group.key);
                  else void saveRenameGroup(group.key);
                },
              }, tr('saveEdit')),
              h(Button, { small: true, onClick: () => { setEditingGroup(null); setEditingSpecialGroup(null); } }, tr('cancelEdit')))
          : h('div', { className: 'cp-lora-row', key: `g-${group.key}` },
              h('span', { className: 'cp-lora-name' }, group.label),
              h('span', { className: 'cp-size' }, String(countOf(group.key))),
              h(Button, {
                small: true,
                onClick: () => {
                  if (group.special) startRenameSpecialGroup(group);
                  else startRenameGroup(group.key);
                },
              }, tr('edit')),
              group.special
                ? h('span', { className: 'cp-note' }, tr('builtinGroupHint'))
                : h(Button, { small: true, onClick: () => { void deleteStyleGroup(group.key); } }, tr('remove')))));

        const entryRows = rows.length === 0
          ? h('div', { className: 'cp-empty' }, tr('tipNoMatch'))
          : h('div', { className: 'cp-lora-list' }, rows.map((entry) => h('div', { className: 'cp-lora-row', key: `${entry.kind}-${entry.id}` },
              h('input', {
                type: 'checkbox', checked: selected.has(entry.id),
                onChange: () => setStyleSelected((prev) => (prev.includes(entry.id) ? prev.filter((id) => id !== entry.id) : prev.concat([entry.id]))),
              }),
              h('div', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 } },
                h('span', { className: 'cp-lora-name', title: entryTitle(entry) }, entryLabel(entry)),
                h('span', { className: 'cp-note' }, `${entry.kind} · ${(entry.tags || entry.prompt || '').slice(0, 60)}`)),
              groupSelectFor(styleGroupOf(entry), (value) => { void assignStyle(entry.id, value); }),
              h(Button, {
                small: true,
                onClick: () => {
                  startEditStyle(entry);
                  setTab('generate');
                  setTimeout(() => setStyleManage(true), 50);
                },
              }, tr('tipEdit')),
              styleHidden.has(entry.id)
                ? h(Button, { small: true, onClick: () => { void hideStyle(entry.id, false); } }, tr('tipShow'))
                : entry.kind === 'custom'
                  ? h(Button, { small: true, onClick: () => { void deleteCustomStyle(entry.id); } }, tr('remove'))
                  : h(Button, { small: true, onClick: () => { void hideStyle(entry.id, true); } }, tr('remove')))));

        return h('div', { className: 'cp-col' },
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('styleManager')),
              h('div', { className: 'cp-grow' }),
              h(Button, { small: true, onClick: () => { void resetStyles(); } }, tr('resetStyles'))),
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-rowline' },
                h('input', {
                  className: 'cp-input', 'data-grow': 'true', value: newGroupName,
                  placeholder: tr('newGroup'),
                  onChange: (event) => setNewGroupName(event.target.value),
                }),
                h(Button, {
                  small: true, primary: true,
                  onClick: () => { void saveStyleGroup(); },
                  disabled: !newGroupName.trim(),
                }, tr('newGroup'))),
              categoryRows)),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('styleWords')),
              h('div', { className: 'cp-grow' }),
              h('input', {
                className: 'cp-input', style: { width: 200 }, value: styleManageQuery,
                placeholder: tr('tipSearch'),
                onChange: (event) => setStyleManageQuery(event.target.value),
              })),
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-rowline' },
                h(Chip, { active: styleFilter === null, onClick: () => setStyleFilter(null) }, tr('allGroups')),
                styleHidden.size > 0
                  ? h(Chip, {
                      active: styleShowHidden,
                      onClick: () => setStyleShowHidden((value) => !value),
                    }, `${tr('showHidden')} ${styleHidden.size}`)
                  : null,
                groups.map((group) => h(Chip, {
                  key: `f-${group.key}`,
                  active: styleFilter === group.key,
                  onClick: () => setStyleFilter(styleFilter === group.key ? null : group.key),
                }, `${group.label} ${countOf(group.key)}`))),
              h('div', { className: 'cp-rowline' },
                h(Button, {
                  small: true,
                  onClick: () => setStyleSelected(rows.map((entry) => entry.id)),
                  disabled: rows.length === 0,
                }, tr('selectAll')),
                h(Button, {
                  small: true,
                  onClick: () => setStyleSelected([]),
                  disabled: styleSelected.length === 0,
                }, tr('selectNone')),
                groupSelectFor('', (value) => {
                  if (!value) return;
                  void (async () => {
                    let last = null;
                    for (const id of styleSelected) last = await postJson('/comfy-panel/styles/assign', { styleId: id, group: value });
                    if (last) applySavedState(last);
                    setStyleSelected([]);
                    setNotice(tr('saved'));
                  })();
                }),
                h(Button, {
                  small: true,
                  onClick: () => {
                    void (async () => {
                      for (const id of styleSelected) {
                        const entry = styleEntries.find((item) => item.id === id);
                        if (!entry) continue;
                        if (entry.kind === 'custom') await postJson('/comfy-panel/styles/custom/delete', { id });
                        else await postJson('/comfy-panel/styles/hide', { styleId: id, hidden: true });
                      }
                      applySavedState(await callJson('/comfy-panel/state'));
                      setStyleSelected([]);
                    })();
                  },
                  disabled: styleSelected.length === 0,
                }, tr('remove'))),
              entryRows)),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' }, h('h2', { className: 'cp-card-title' }, tr('addStyleWord'))),
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-rowline' },
                h('input', {
                  className: 'cp-input', style: { width: 140 }, value: styleWordName,
                  placeholder: tr('styleWordName'),
                  onChange: (event) => setStyleWordName(event.target.value),
                }),
                h('input', {
                  className: 'cp-input', 'data-grow': 'true', value: styleWordTags,
                  placeholder: tr('styleWordTags'),
                  onChange: (event) => setStyleWordTags(event.target.value),
                }),
                groupSelectFor(styleWordGroup || GROUP_RECIPES, setStyleWordGroup),
                h(Button, {
                  small: true, primary: true,
                  onClick: () => { void saveCustomStyle(); },
                  disabled: !styleWordName.trim() || !styleWordTags.trim(),
                }, tr('addStyleWord'))),
              h('div', { className: 'cp-note' },
                `${styleWordTags.trim().length} / ${STYLE_APPLY_LIMIT} ${tr('chars')}` + (styleWordTags.trim().length > STYLE_APPLY_LIMIT ? ` · ${tr('styleTooLong')}` : '')))));
      };

      const renderPromptTab = () => {
        const categories = library.categories || [];
        const aliases = library.aliases || {};
        const needle = query.trim().toLowerCase();
        const activeCategory = promptCategory;

        // A tag matches its English text, its Chinese alias, or its group labels,
        // so 白发 / white hair / hair all find the same chip.
        const matches = (tag, category) => {
          if (!needle) return true;
          const alias = String(aliases[tag] || '').toLowerCase();
          return tag.toLowerCase().includes(needle)
            || alias.includes(needle)
            || String(category.zh).includes(needle)
            || String(category.en).toLowerCase().includes(needle);
        };

        const found = [];
        categories.forEach((category) => {
          if (activeCategory && category.id !== activeCategory) return;
          category.tags.forEach((tag) => { if (matches(tag, category)) found.push({ tag, category }); });
        });

        const tagChip = (tag, category) => h(Chip, {
          key: `${category.id}-${tag}`,
          onClick: () => appendTag(tag),
          title: aliases[tag] || label(category),
        }, tag);

        const tagBlock = (needle || activeCategory)
          ? (found.length === 0
              ? h('div', { className: 'cp-empty' }, tr('noTagMatches'))
              : h('div', { className: 'cp-chips' }, found.slice(0, 160).map((entry) => tagChip(entry.tag, entry.category))))
          : categories.map((category) => h('div', {
              key: category.id,
              style: { display: 'flex', flexDirection: 'column', gap: 6 },
            },
              h('span', { className: 'cp-section-title' }, label(category)),
              h('div', { className: 'cp-chips' }, category.tags.map((tag) => tagChip(tag, category)))));

        const recipeRows = (library.recipes || []).map((recipe) => {
          const checkpointNote = (library.checkpointNotes || {})[recipe.checkpoint];
          const checkpointLabel = checkpointNote ? label(checkpointNote) : recipe.checkpoint;
          return h('div', { className: 'cp-hist-card', key: recipe.id },
            h('div', { className: 'cp-hist-main' },
              h('div', { className: 'cp-rowline' },
                h('strong', { style: { fontSize: 12 } }, label(recipe)),
                h('span', { className: 'cp-note' }, isZh ? recipe.noteZh : recipe.noteEn)),
              h('div', { className: 'cp-hist-meta' },
                `${checkpointLabel} · ${(recipe.loras || []).map((lora) => `${lora.name.replace('.safetensors', '')} ${lora.weight}`).join(' + ') || 'no LoRA'} · ${recipe.width}×${recipe.height} · ${recipe.steps} steps`)),
            h(Button, { small: true, onClick: () => applyRecipe(recipe) }, tr('applyRecipe')));
        });

        const templateRows = (library.templates || []).filter((template) => !needle
          || `${template.zh} ${template.en} ${template.prompt}`.toLowerCase().includes(needle)).map((template) => h('div', { className: 'cp-hist-card', key: template.id },
          h('div', { className: 'cp-hist-main' },
            h('div', { className: 'cp-rowline' },
              h('strong', { style: { fontSize: 12 } }, label(template)),
              h('span', { className: 'cp-note' }, isZh ? template.noteZh : template.noteEn)),
            h('div', { className: 'cp-hist-prompt', title: template.prompt }, template.prompt)),
          h(Button, { small: true, onClick: () => applyTemplate(template) }, tr('applyTemplate'))));

        // Saved prompts, grouped by user category.
        const promptCategories = [...new Set((saved.favorites || [])
          .map((entry) => String(entry.category || ''))
          .filter(Boolean))];
        const visibleFavorites = (saved.favorites || []).filter((entry) => {
          if (favCategory === null) return true;
          return String(entry.category || '') === favCategory;
        });
      const favorites = visibleFavorites.length === 0
        ? h('div', { className: 'cp-empty' }, tr('emptyHistory'))
        : h('div', null, visibleFavorites.map((entry) => (editingFavId === entry.id
            ? h('div', { className: 'cp-fav', key: entry.id },
                h('textarea', {
                  className: 'cp-textarea', rows: 3, value: editFavText,
                  onChange: (event) => setEditFavText(event.target.value),
                }),
                h('div', { className: 'cp-inline' },
                  h('input', {
                    className: 'cp-input', 'data-grow': 'true', value: editFavCategory,
                    placeholder: tr('promptCategories'),
                    onChange: (event) => setEditFavCategory(event.target.value),
                  }),
                  h(Button, { small: true, primary: true, onClick: () => { void saveFavoriteEdit(entry.id); } }, tr('saveEdit')),
                  h(Button, { small: true, onClick: () => setEditingFavId('') }, tr('cancelEdit'))))
            : h('div', { className: 'cp-fav', key: entry.id },
              h('div', { className: 'cp-hist-main' },
                h('span', { className: 'cp-fav-text', title: entry.text }, entry.text),
                h('div', { className: 'cp-rowline' },
                  h('span', { className: 'cp-tag' }, entry.category || tr('uncategorized')))),
              h('div', { className: 'cp-fav-meta' },
                h('select', {
                  className: 'cp-select', value: entry.category || '', style: { colorScheme: scheme, width: 110 },
                  onChange: (event) => {
                    if (event.target.value === '__new__') {
                      const name = typeof window.prompt === 'function' ? window.prompt(tr('newCategory')) : '';
                      if (name && name.trim()) void moveFavorite(entry.id, name.trim());
                      return;
                    }
                    void moveFavorite(entry.id, event.target.value);
                  },
                },
                  h('option', { value: '' }, tr('uncategorized')),
                  promptCategories.map((category) => h('option', { key: category, value: category }, category)),
                  h('option', { value: '__new__' }, `＋ ${tr('newCategory')}`)),
                h(Button, { small: true, onClick: () => startEditFavorite(entry) }, tr('edit')),
                h(Button, { small: true, onClick: () => loadFavorite(entry) }, tr('load')),
                h(Button, { small: true, onClick: () => { void removeFavorite(entry.id); } }, tr('remove')))))));

        const recent = (saved.history || []).length === 0
          ? h('div', { className: 'cp-empty' }, tr('emptyHistory'))
          : h('div', null, (saved.history || []).slice(0, 12).map((entry) => {
              const thumb = entry.images && entry.images[0] ? entry.images[0].url : null;
              return h('div', { className: 'cp-hist-card', key: entry.id },
                thumb ? h('img', { className: 'cp-hist-thumb', src: thumb, alt: '', loading: 'lazy', onError: (event) => { event.currentTarget.style.visibility = 'hidden'; } }) : h('span', { className: 'cp-hist-thumb' }),
                h('div', { className: 'cp-hist-main' },
                  h('span', { className: 'cp-hist-prompt', title: entry.prompt }, entry.prompt),
                  h('span', { className: 'cp-hist-meta' }, `${formatTime(entry.at)} · ${entry.width}×${entry.height} · seed ${entry.seed}`)),
                h(Button, { small: true, onClick: () => { void loadHistory(entry); } }, tr('usePrompt')));
            }));

        return h('div', { className: 'cp-col' },
          h('div', { className: 'cp-card' }, renderPromptEditor(5)),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('promptLibrary')),
              h('input', {
                className: 'cp-input', style: { width: 260 }, value: query,
                placeholder: tr('promptSearchPlaceholder'),
                onChange: (event) => setQuery(event.target.value),
              }),
              h('span', { className: 'cp-size' }, `${found.length} ${tr('tagMatches')}`)),
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-chips' },
                h(Chip, { active: !activeCategory, onClick: () => setPromptCategory('') }, tr('allCategories')),
                categories.map((category) => h(Chip, {
                  key: category.id,
                  active: activeCategory === category.id,
                  onClick: () => setPromptCategory(activeCategory === category.id ? '' : category.id),
                }, label(category)))),
              tagBlock,
              h('div', { className: 'cp-rowline' },
                h(Button, { small: true, onClick: randomIdea }, tr('randomIdea'))))),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('mixer')),
              h('span', { className: 'cp-size' }, tr('mixerHint'))),
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-chips' }, categories.map((category) => h(Chip, {
                key: category.id,
                active: mixCategories.includes(category.id),
                onClick: () => toggleMixCategory(category.id),
              }, label(category)))),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('mixCount')),
                h('select', {
                  className: 'cp-select', value: mixCount, style: { colorScheme: scheme },
                  onChange: (event) => setMixCount(Number(event.target.value)),
                }, [1, 3, 5, 8].map((value) => h('option', { key: value, value }, String(value)))),
                h(Button, { small: true, primary: true, onClick: rollCombos }, tr('rollCombos'))),
              mixResults.length
                ? h('div', null, mixResults.map((text, index) => h('div', { className: 'cp-hist-card', key: `${index}-${text.slice(0, 12)}` },
                    h('div', { className: 'cp-hist-main' },
                      h('div', { className: 'cp-hist-prompt', title: text }, text)),
                    h(Button, {
                      small: true,
                      onClick: () => {
                        update({ prompt: text });
                        setNotice(tr('styleApplied'));
                      },
                    }, tr('applyCombo')))))
                : h('div', { className: 'cp-note' }, tr('combosEmpty')))),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('recipes')),
              h('span', { className: 'cp-size' }, String(recipeRows.length))),
            recipeRows.length ? h('div', null, recipeRows) : h('div', { className: 'cp-empty' }, tr('emptyHistory'))),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('templates')),
              h('span', { className: 'cp-size' }, String(templateRows.length))),
            templateRows.length ? h('div', null, templateRows) : h('div', { className: 'cp-empty' }, tr('emptyHistory'))),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' }, h('h2', { className: 'cp-card-title' }, tr('styles'))),
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-chips' }, builtInStyles.map((style) => h(Chip, {
                key: style.id,
                active: form.style === style.id,
                onClick: () => applyStyle(style),
                title: style.tags,
              }, label(style)))))),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('favorites')),
              h('span', { className: 'cp-size' }, `${visibleFavorites.length}/${(saved.favorites || []).length}`),
              h(Button, {
                small: true,
                onClick: () => { void saveFavorite(favCategory === null ? '' : favCategory); },
                disabled: !form.prompt.trim(),
              }, tr('savePrompt'))),
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-chips' },
                h(Chip, { active: favCategory === null, onClick: () => setFavCategory(null) }, tr('allPrompts')),
                h(Chip, { active: favCategory === '', onClick: () => setFavCategory('') }, tr('uncategorized')),
                promptCategories.map((category) => h(Chip, {
                  key: category,
                  active: favCategory === category,
                  onClick: () => setFavCategory(favCategory === category ? null : category),
                }, category))),
              h('div', { className: 'cp-rowline' },
                h('input', {
                  className: 'cp-input', 'data-grow': 'true', value: newCategory,
                  placeholder: tr('newCategory'),
                  onChange: (event) => setNewCategory(event.target.value),
                }),
                h(Button, {
                  small: true,
                  onClick: () => {
                    const category = newCategory.trim();
                    if (!category) return;
                    setFavCategory(category);
                    setNewCategory('');
                    void saveFavorite(category);
                  },
                  disabled: !newCategory.trim() || !form.prompt.trim(),
                }, tr('savePrompt')))),
                promptCategories.length
                  ? h('div', { className: 'cp-rowline' },
                      h(Button, { small: true, onClick: () => setManageFavCats((value) => !value) },
                        manageFavCats ? tr('doneManage') : tr('manageStyles')),
                      manageFavCats ? null : h('span', { className: 'cp-note' }, tr('categoryManageHint')))
                  : null,
                manageFavCats && promptCategories.length
                  ? h('div', { className: 'cp-lora-list' }, promptCategories.map((category) => (editingFavCat === category
                      ? h('div', { className: 'cp-lora-row', key: `fc-edit-${category}` },
                          h('input', {
                            className: 'cp-input', 'data-grow': 'true', value: editFavCatName,
                            onChange: (event) => setEditFavCatName(event.target.value),
                          }),
                          h(Button, { small: true, primary: true, onClick: () => { void renameFavCategory(category, editFavCatName); } }, tr('saveEdit')),
                          h(Button, { small: true, onClick: () => setEditingFavCat('') }, tr('cancelEdit')))
                      : h('div', { className: 'cp-lora-row', key: `fc-${category}` },
                          h('span', { className: 'cp-lora-name' }, category),
                          h(Button, {
                            small: true,
                            onClick: () => {
                              setEditingFavCat(category);
                              setEditFavCatName(category);
                            },
                          }, tr('edit')),
                          h(Button, { small: true, onClick: () => { void deleteFavCategory(category); } }, tr('remove'))))))
                  : null,
            favorites),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('history')),
              h('span', { className: 'cp-size' }, String((saved.history || []).length))),
            recent));
      };

      const renderHistoryTab = () => {
        const records = saved.history || [];
        const images = saved.images || [];

        const rows = records.length === 0
          ? h('div', { className: 'cp-empty' }, tr('noHistory'))
          : h('div', null, records.map((record) => {
              const thumbs = (record.images || []).slice(0, 4);
              return h('div', { className: 'cp-hist-card', key: record.id },
                h('div', { className: 'cp-hist-thumbs' }, thumbs.map((image) => h('img', {
                  key: image.filename,
                  className: 'cp-hist-thumb',
                  src: image.url,
                  alt: '',
                  loading: 'lazy',
                  onError: (event) => { event.currentTarget.style.visibility = 'hidden'; },
                  onClick: () => setPreview({ src: image.url, title: image.filename, name: image.filename, prompt: record.prompt }),
                }))),
                h('div', { className: 'cp-hist-main' },
                  h('div', { className: 'cp-hist-prompt', title: record.prompt }, record.prompt),
                  h('div', { className: 'cp-hist-meta' },
                    `${formatTime(record.at)} · ${record.width}×${record.height}${record.outWidth && record.outWidth !== record.width ? ` → ${record.outWidth}×${record.outHeight}` : ''} · ${record.steps || '?'} ${tr('steps')} · seed ${record.seed}`),
                  h('div', { className: 'cp-hist-actions' },
                    h(Button, { small: true, onClick: () => { void loadHistory(record); } }, tr('loadParams')),
                    h(Button, { small: true, onClick: () => { void useRecordForInit(record); } }, tr('regenerateFrom')),
                    h(Button, { small: true, onClick: () => { void toggleImage(thumbs[0]?.filename, record.prompt); } }, tr('favoriteImage')),
                    h(Button, { small: true, onClick: () => { void deleteHistory(record.id); } }, tr('deleteRecord')))));
            }));

        const album = images.length === 0
          ? h('div', { className: 'cp-empty' }, tr('noSavedImages'))
          : h('div', { className: 'cp-grid' }, images.map((image) => h('button', {
              key: image.id,
              type: 'button',
              className: 'cp-thumb',
              title: image.prompt || image.name,
              onClick: () => setPreview({
                src: imageUrl(image.name),
                title: image.name,
                name: image.name,
                prompt: image.prompt || '',
              }),
            }, h('img', { src: imageUrl(image.name), alt: '', loading: 'lazy' }))));

        return h('div', { className: 'cp-col' },
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('generationHistory')),
              h('span', { className: 'cp-size' }, String(records.length)),
              h(Button, { small: true, onClick: () => { void refreshSaved(); } }, tr('refresh')),
              h(Button, { small: true, onClick: () => { void clearHistory(); }, disabled: records.length === 0 }, tr('clearHistory'))),
            h('div', { className: 'cp-note', style: { padding: '10px 13px 0' } }, tr('historyHint')),
            rows),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('savedImages')),
              h('span', { className: 'cp-size' }, String(images.length))),
            album));
      };

      const renderOutputsTab = () => {
        const visible = outputs.slice(0, outputsShown);
        const rest = Math.max(0, outputs.length - visible.length);
        return h('div', { className: 'cp-card' },
          h('div', { className: 'cp-card-head' },
            h('h2', { className: 'cp-card-title' }, tr('outputsTitle')),
            h('span', { className: 'cp-size' }, String(outputs.length)),
            h(Button, { small: true, onClick: () => { void refreshOutputs(); } }, tr('refresh')),
            h(Button, { small: true, onClick: () => { void reveal('outputs'); } }, tr('folder'))),
          outputs.length === 0
            ? h('div', { className: 'cp-empty' }, tr('emptyOutputs'))
            : h('div', null,
                h('div', { className: 'cp-grid' }, visible.map((file) => h('button', {
                  type: 'button', className: 'cp-thumb', key: file.name, title: file.name,
                  onClick: () => setPreview({ src: imageUrl(file.name), title: file.name, name: file.name, prompt: '' }),
                }, h('img', { src: imageUrl(file.name), alt: file.name, loading: 'lazy' })))),
                rest > 0
                  ? h('div', { className: 'cp-rowline', style: { padding: '10px 13px 13px' } },
                      h(Button, {
                        small: true,
                        onClick: () => setOutputsShown((value) => value + 15),
                      }, `${tr('showMore')} (${rest})`))
                  : null));
      };

      const renderDiscoverTab = () => {
        const sources = [
          { id: 'hf-mirror', label: tr('sourceHfMirror') },
          { id: 'huggingface', label: tr('sourceHf') },
          { id: 'civitai', label: tr('sourceCivitai') },
        ];
        const items = discoverItems || [];

        const resultRows = discoverLoading
          ? h('div', { className: 'cp-empty' }, tr('searching'))
          : discoverError
            ? h('div', { className: 'cp-empty', style: { color: 'var(--dsw-alias-state-error-primary)' } },
                `${tr('discoverFailed')}: ${discoverError}`)
            : items.length === 0
              ? h('div', { className: 'cp-empty' }, tr('noResults'))
              : h('div', null, items.map((item) => h('div', { className: 'cp-disc-item', key: item.id },
                  item.thumbnail
                    ? h('img', { className: 'cp-disc-thumb', src: item.thumbnail, alt: '', loading: 'lazy' })
                    : h('span', { className: 'cp-disc-thumb' }, String(item.name || '?').slice(0, 1).toUpperCase()),
                  h('div', { className: 'cp-disc-main' },
                    h('span', { className: 'cp-disc-title' }, item.name),
                    h('span', { className: 'cp-disc-meta' },
                      item.author ? h('span', null, item.author) : null,
                      item.baseModel ? h('span', { className: 'cp-tag' }, item.baseModel) : null,
                      h('span', null, `${Number(item.downloads || 0).toLocaleString()} ${tr('downloadsCount')}`)),
                    (item.files || []).map((file) => h('div', { className: 'cp-disc-file', key: file.url },
                      h('span', { className: 'cp-item-name', title: file.name }, file.name),
                      h('span', { className: 'cp-size' }, formatBytes(file.bytes)),
                      h(Button, { small: true, disabled: busy === 'install', onClick: () => { void installDiscovered(file); } }, tr('install'))))))));

        const downloadRows = (downloads || []).length === 0 ? null : h('ul', { className: 'cp-list' }, (downloads || []).slice(-6).map((job) => {
          const ratio = job.total ? Math.min(1, job.received / job.total) : 0;
          const stateLabel = job.state === 'done' ? tr('done')
            : job.state === 'failed' ? `${tr('failed')}: ${job.error || ''}`
              : `${tr('downloading')} ${job.total ? `${Math.round(ratio * 100)}%` : formatBytes(job.received)}`;
          return h('li', { className: 'cp-dl', key: job.id },
            h('div', { className: 'cp-item' },
              h('span', { className: 'cp-tag' }, job.kind),
              h('span', { className: 'cp-item-name', title: job.filename }, job.filename),
              h('span', { className: 'cp-size' }, stateLabel)),
            job.state === 'running'
              ? h('div', { className: 'cp-bar' }, h('i', { style: { width: `${Math.round(ratio * 100)}%` } }))
              : null);
        }));

        return h('div', { className: 'cp-col' },
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('discoverTitle')),
              h('span', { className: 'cp-grow' }),
              h(Button, { small: true, onClick: () => { void refreshOptions(); void refreshModels(); } }, tr('refresh'))),
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-rowline' },
                h('div', { className: 'cp-seg' },
                  h('button', {
                    type: 'button', className: 'cp-seg-item', 'data-active': discoverKind === 'checkpoint' ? 'true' : 'false',
                    onClick: () => setDiscoverKind('checkpoint'),
                  }, tr('kindCheckpoint')),
                  h('button', {
                    type: 'button', className: 'cp-seg-item', 'data-active': discoverKind === 'lora' ? 'true' : 'false',
                    onClick: () => setDiscoverKind('lora'),
                  }, tr('kindLora'))),
                h('input', {
                  className: 'cp-input cp-grow', value: discoverQuery,
                  placeholder: tr('searchPlaceholder'),
                  onChange: (event) => setDiscoverQuery(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void searchDiscover();
                    }
                  },
                }),
                h(Button, { primary: true, onClick: () => { void searchDiscover(); }, disabled: discoverLoading }, tr('search'))),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('sourceLabel')),
                sources.map((source) => h(Chip, {
                  key: source.id,
                  active: discoverSource === source.id,
                  onClick: () => chooseDiscoverSource(source.id),
                }, source.label))),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('baseLabel')),
                h('input', {
                  className: 'cp-input cp-grow', value: discoverBase,
                  onChange: (event) => setDiscoverBase(event.target.value),
                })),
              h('div', { className: 'cp-note' }, tr('discoverHint')),
              h('div', { className: 'cp-note' }, tr('discoverFilterHint')))),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, discoverKind === 'lora' ? tr('kindLora') : tr('kindCheckpoint')),
              h('span', { className: 'cp-size' }, String(items.length))),
            resultRows),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' }, h('h2', { className: 'cp-card-title' }, tr('downloadsCount'))),
            downloadRows || h('div', { className: 'cp-note', style: { padding: '10px 13px' } }, tr('discoverTip'))),
        );
      };

      const renderWorkbenchTab = () => {
        // The base picture is the newest *generate* result, never an inpaint run.
        const generateDone = (jobs || []).filter((job) => job.mode !== 'inpaint' && job.state === 'done' && job.images && job.images[0]);
        const baseJob = (wbBaseJob && generateDone.find((job) => job.id === wbBaseJob))
          || generateDone[0]
          || null;
        const baseImage = baseJob && baseJob.images && baseJob.images[0] ? baseJob.images[0] : null;
        const runningJob = (jobs || []).find((job) => (job.state === 'queued' || job.state === 'running') && job.mode !== 'inpaint');

        const wbApplyBase = async () => {
          if (!baseImage) { setError(tr('wbNeedBase')); return; }
          try {
            const body = await postJson('/comfy-panel/upload', { source: 'output', name: baseImage.filename });
            update({ mode: 'i2i', initImage: { name: body.image, preview: imageUrl(baseImage.filename) } });
            setNotice(tr('wbBaseLoaded'));
          } catch (cause) {
            setError(String(cause.message ?? cause));
          }
        };

        const wbRun = async () => {
          if (!status.up) { setError(tr('needServer')); return; }
          if (!form.initImage) { setError(tr('needImage')); return; }
          if (!form.checkpoint) { setError(tr('needModel')); return; }
          setError('');
          setBusy('generate');
          try {
            const body = await postJson('/comfy-panel/generate', {
              mode: 'i2i',
              prompt: wbPrompt || form.prompt,
              negative: wbNegative || form.negative,
              checkpoint: form.checkpoint,
              width: form.width,
              height: form.height,
              steps: wbSteps,
              cfg: wbCfg,
              sampler: wbSampler,
              scheduler: wbScheduler,
              seed: wbSeed,
              batch: 1,
              hires: { enabled: false },
              strength: wbStrength,
              initImage: form.initImage.name,
              referenceTags: '',
              clipSkip: form.clipSkip || 1,
              style: '',
              loras: wbLoras,
              quality: 'workbench',
            });
            if (body.job) {
              setJobs((prev) => [body.job, ...prev.filter((job) => job.id !== body.job.id)]);
              setActiveId(body.job.id);
              setWbLastJob(body.job.id);
            }
          } catch (cause) {
            setError(String(cause.message ?? cause));
          } finally {
            setBusy('');
          }
        };

        const wbResult = wbLastJob ? (jobs || []).find((job) => job.id === wbLastJob) : null;
        const progressJob = runningJob;
        const progress = progressJob && progressJob.progress && progressJob.progress.max
          ? Math.min(1, progressJob.progress.value / progressJob.progress.max)
          : null;

        return h('div', { className: 'cp-col' },
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('wbBase')),
              h('span', { className: 'cp-size' }, baseImage ? baseImage.filename : '—'),
              h('div', { className: 'cp-grow' }),
              h(Button, { small: true, onClick: () => { void wbApplyBase(); }, disabled: !baseImage }, tr('wbUseBase')),
              h(Button, { small: true, onClick: () => { void refreshOutputs(); } }, tr('refresh'))),
            h('div', { className: 'cp-card-body' },
              baseImage
                ? h('div', { className: 'cp-rowline' },
                    h('img', { className: 'cp-wb-base', src: imageUrl(baseImage.filename), alt: '' }),
                    h('div', { className: 'cp-note' }, tr('wbBaseHint')))
                : h('div', { className: 'cp-empty' }, tr('wbNeedBase')),
              generateDone.length > 1
                ? h('div', { className: 'cp-rowline' },
                    h('span', { className: 'cp-section-title' }, tr('wbPickBase')),
                    generateDone.slice(0, 6).map((job) => h('button', {
                      key: job.id,
                      type: 'button',
                      className: 'cp-thumb cp-thumb-sm',
                      onClick: () => setWbBaseJob(job.id),
                    }, h('img', { src: imageUrl(job.images[0].filename), alt: '', loading: 'lazy' }))))
                : null)),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('wbProgress')),
              h('div', { className: 'cp-grow' }),
              progressJob
                ? h('span', { className: 'cp-pill' }, tr('generating'))
                : h('span', { className: 'cp-note' }, tr('inpaintIdle'))),
            h('div', { className: 'cp-card-body' },
              h('div', {
                className: 'cp-progress-bar',
                'data-indeterminate': progressJob && progress === null ? 'true' : 'false',
                'data-idle': progressJob ? 'false' : 'true',
              }, h('i', {
                style: progressJob
                  ? (progress === null ? undefined : { width: `${Math.round(progress * 100)}%` })
                  : { width: '0%', transition: 'none' },
              })),
              h('div', { className: 'cp-statusline' },
                progressJob && progress !== null ? h('span', null, `${Math.round(progress * 100)}%`) : null,
                progressJob
                  ? h('span', null, `${wbSteps} ${tr('steps')} · CFG ${wbCfg} · ${tr('inpaintDenoise')} ${wbStrength}`)
                  : h('span', null, tr('wbIdle'))),
              progressJob
                ? h(Button, { small: true, onClick: () => { void cancelGeneration(progressJob.id); } }, tr('cancel'))
                : null)),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' }, h('h2', { className: 'cp-card-title' }, tr('wbSettings'))),
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('prompt'))),
              h('textarea', {
                className: 'cp-textarea', rows: 5, value: wbPrompt,
                placeholder: tr('wbPromptPlaceholder'),
                onChange: (event) => setWbPrompt(event.target.value),
              }),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('negative')),
                h('div', { className: 'cp-grow' }),
                (library.negatives || []).map((preset) => h(Chip, {
                  key: preset.id,
                  onClick: () => setWbNegative(preset.text),
                }, label(preset)))),
              h('textarea', {
                className: 'cp-textarea', rows: 3, value: wbNegative,
                placeholder: tr('negativePlaceholder'),
                onChange: (event) => setWbNegative(event.target.value),
              }),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('checkpoint')),
                h('select', {
                  className: 'cp-select cp-grow', value: form.checkpoint, style: { colorScheme: scheme },
                  onChange: (event) => update({ checkpoint: event.target.value }),
                }, (options.checkpoints || []).map((entry) => h('option', { key: entry, value: entry }, entry)))),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('inpaintDenoise')),
                h('input', {
                  type: 'range', className: 'cp-range', min: 0.1, max: 0.9, step: 0.05, value: wbStrength,
                  style: { flex: 1 },
                  onChange: (event) => setWbStrength(Number(event.target.value)),
                }),
                h('input', {
                  className: 'cp-input cp-num', type: 'number', min: 0.1, max: 0.9, step: 0.05, value: wbStrength,
                  onChange: (event) => {
                    const value = Number(event.target.value);
                    if (Number.isFinite(value)) setWbStrength(Math.min(0.9, Math.max(0.1, Math.round(value * 100) / 100)));
                  },
                }),
                h('span', { className: 'cp-size' }, wbStrength.toFixed(2))),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('steps')),
                h('input', {
                  type: 'range', className: 'cp-range', min: 8, max: 60, step: 1, value: wbSteps,
                  style: { flex: 1 },
                  onChange: (event) => setWbSteps(Number(event.target.value)),
                }),
                h('input', {
                  className: 'cp-input cp-num', type: 'number', min: 8, max: 60, step: 1, value: wbSteps,
                  onChange: (event) => setWbSteps(Math.min(60, Math.max(8, Math.round(Number(event.target.value) || wbSteps)))),
                })),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('cfg')),
                h('input', {
                  type: 'range', className: 'cp-range', min: 1, max: 12, step: 0.1, value: wbCfg,
                  style: { flex: 1 },
                  onChange: (event) => setWbCfg(Number(event.target.value)),
                }),
                h('input', {
                  className: 'cp-input cp-num', type: 'number', min: 0.5, max: 15, step: 0.1, value: wbCfg,
                  onChange: (event) => {
                    const value = Number(event.target.value);
                    if (Number.isFinite(value)) setWbCfg(Math.min(15, Math.max(0.5, value)));
                  },
                })),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('resolution')),
                h('input', {
                  className: 'cp-input cp-num', type: 'number', min: 512, max: 2048, step: 8, value: wbWidth,
                  onChange: (event) => setWbWidth(Math.min(2048, Math.max(512, Math.round(Number(event.target.value) || wbWidth)))),
                }),
                h('span', { className: 'cp-size' }, '×'),
                h('input', {
                  className: 'cp-input cp-num', type: 'number', min: 512, max: 2048, step: 8, value: wbHeight,
                  onChange: (event) => setWbHeight(Math.min(2048, Math.max(512, Math.round(Number(event.target.value) || wbHeight)))),
                }),
                h(Button, { small: true, onClick: () => { setWbWidth(wbHeight); setWbHeight(wbWidth); } }, tr('swap'))),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('seed')),
                h('input', {
                  className: 'cp-input', type: 'number', min: -1, step: 1,
                  value: wbSeed < 0 ? '' : wbSeed,
                  placeholder: tr('seedRandom'),
                  style: { width: 170 },
                  onChange: (event) => {
                    const raw = event.target.value;
                    const value = Number(raw);
                    setWbSeed(raw === '' || !Number.isFinite(value) ? -1 : Math.max(-1, Math.round(value)));
                  },
                }),
                h(Button, { small: true, onClick: () => setWbSeed(-1) }, tr('seedRandom')),
                h(Button, { small: true, onClick: () => setWbSeed(Math.floor(Math.random() * 4294967295)) }, tr('seedLock'))),
              h('div', { className: 'cp-rowline' },
                h('span', { className: 'cp-section-title' }, tr('lora')),
                h('div', { className: 'cp-chips' }, (options.loras || []).map((loraName) => {
                  const active = (wbLoras || []).some((entry) => entry.name === loraName);
                  return h(Chip, {
                    key: loraName,
                    active,
                    title: loraName,
                    onClick: () => setWbLoras((prev) => (prev.some((entry) => entry.name === loraName)
                      ? prev.filter((entry) => entry.name !== loraName)
                      : prev.concat([{ name: loraName, weight: 0.55 }]))),
                  }, loraName.replace(/\.safetensors$/, ''));
                }))),
              (wbLoras || []).length
                ? h('div', { className: 'cp-lora-list' }, (wbLoras || []).map((entry) => {
                    const setWeight = (value) => {
                      const weight = Math.min(1.6, Math.max(0, Math.round(value * 100) / 100));
                      setWbLoras((prev) => prev.map((item) => (item.name === entry.name ? { ...item, weight } : item)));
                    };
                    return h('div', { className: 'cp-lora-row', key: entry.name },
                      h('span', { className: 'cp-lora-name', title: entry.name }, entry.name.replace(/\.safetensors$/, '')),
                      h('input', {
                        type: 'range', className: 'cp-lora-weight', min: 0, max: 1.6, step: 0.05, value: entry.weight,
                        'aria-label': entry.name,
                        onChange: (event) => setWeight(Number(event.target.value)),
                      }),
                      h('input', {
                        className: 'cp-input cp-num', type: 'number', min: 0, max: 1.6, step: 0.05, value: entry.weight,
                        onChange: (event) => {
                          const value = Number(event.target.value);
                          if (Number.isFinite(value)) setWeight(value);
                        },
                      }),
                      h(Button, {
                        small: true,
                        onClick: () => setWbLoras((prev) => prev.filter((item) => item.name !== entry.name)),
                      }, tr('remove')));
                  }))
                : null,
              h('div', { className: 'cp-actions' },
                h(Button, {
                  primary: true,
                  onClick: () => { void wbRun(); },
                  disabled: Boolean(busy) || Boolean(runningJob) || !status.up || !form.initImage,
                }, busy === 'generate' ? tr('generating') : tr('wbRun')),
                !form.initImage ? h('span', { className: 'cp-actions-note' }, tr('wbNeedBaseLoaded')) : null,
                !status.up ? h('span', { className: 'cp-actions-note' }, tr('needServer')) : null))),
          wbResult && wbResult.images && wbResult.images[0]
            ? h('div', { className: 'cp-card' },
                h('div', { className: 'cp-card-head' },
                  h('h2', { className: 'cp-card-title' }, tr('wbResult')),
                  h('div', { className: 'cp-grow' }),
                  h(Button, { small: true, onClick: () => { void wbApplyBase(); } }, tr('wbUseAsBase'))),
                h('div', { className: 'cp-card-body' },
                  h('img', { className: 'cp-inpaint-result', src: imageUrl(wbResult.images[0].filename), alt: '' })))
            : null);
      };

      const renderModelsTab = () => {
        const list = [];
        Object.keys(models).forEach((group) => {
          (models[group] || []).forEach((file) => list.push({ group, name: file.name, bytes: file.bytes }));
        });
        const groups = Object.keys(models).length > 0 ? Object.keys(models) : ['checkpoints', 'controlnet', 'loras', 'vae', 'upscale_models'];

        const inventory = list.length === 0
          ? h('div', { className: 'cp-empty' }, tr('noModels'))
          : h('ul', { className: 'cp-list' }, list.map((file) => {
              const note = file.group === 'checkpoints' ? (library.checkpointNotes || {})[file.name] : null;
              return h('li', {
                className: 'cp-item',
                key: `${file.group}/${file.name}`,
              },
                h('span', { className: 'cp-tag' }, file.group),
                h('div', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 } },
                  h('span', { className: 'cp-item-name', title: file.name }, file.name),
                  note
                    ? h('span', { className: 'cp-note' }, `${label(note)} · ${note.arch} · ${isZh ? note.noteZh : note.noteEn}`)
                    : null),
                h('span', { className: 'cp-size' }, formatBytes(file.bytes)));
            }));

        const downloadLines = downloads.length === 0 ? null : h('ul', { className: 'cp-list' }, downloads.map((job) => {
          const ratio = job.total ? Math.min(1, job.received / job.total) : 0;
          const stateLabel = job.state === 'done' ? tr('done')
            : job.state === 'failed' ? `${tr('failed')}: ${job.error || ''}`
              : `${tr('downloading')} ${job.total ? `${Math.round(ratio * 100)}%` : formatBytes(job.received)}`;
          return h('li', { className: 'cp-dl', key: job.id },
            h('div', { className: 'cp-item' },
              h('span', { className: 'cp-tag' }, job.kind),
              h('span', { className: 'cp-item-name', title: job.filename }, job.filename),
              h('span', { className: 'cp-size' }, stateLabel)),
            job.state === 'running'
              ? h('div', { className: 'cp-bar' }, h('i', { style: { width: `${Math.round(ratio * 100)}%` } }))
              : null);
        }));

        return h('div', { className: 'cp-col' },
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' },
              h('h2', { className: 'cp-card-title' }, tr('tabModels')),
              h(Button, { small: true, onClick: () => { void refreshModels(); }, }, tr('refresh')),
              h(Button, { small: true, onClick: () => { void reveal('models'); } }, tr('folder'))),
            inventory),
          h('div', { className: 'cp-card' },
            h('div', { className: 'cp-card-head' }, h('h2', { className: 'cp-card-title' }, tr('addModel'))),
            h('div', { className: 'cp-card-body' },
              h('div', { className: 'cp-rowline' },
                h('input', {
                  className: 'cp-input', 'data-grow': 'true', value: url,
                  placeholder: tr('urlPlaceholder'),
                  onChange: (event) => setUrl(event.target.value),
                }),
                h('input', {
                  className: 'cp-input', 'data-name': 'true', value: name,
                  placeholder: tr('namePlaceholder'),
                  onChange: (event) => setName(event.target.value),
                }),
                h('select', {
                  className: 'cp-select', value: kind, style: { colorScheme: scheme },
                  onChange: (event) => setKind(event.target.value),
                }, groups.map((group) => h('option', { key: group, value: group }, group))),
                h(Button, { onClick: () => { void submitDownload(); }, disabled: Boolean(busy) }, tr('downloadModel'))),
              downloadLines)));
      };

      const renderServiceTab = () => h('div', { className: 'cp-col' },
        h('div', { className: 'cp-card' },
          h('div', { className: 'cp-card-head' },
            h('h2', { className: 'cp-card-title' }, tr('bjTitle')),
            h('div', { className: 'cp-grow' }),
            h('span', { className: 'cp-pill' }, bjConfigured ? tr('bjConfigured') : tr('bjNotConfigured'))),
          h('div', { className: 'cp-card-body' },
            h('div', { className: 'cp-rowline' },
              h('input', {
                className: 'cp-input cp-grow', type: 'password', value: bjKeyInput,
                placeholder: tr('bjKeyPlaceholder'),
                onChange: (event) => setBjKeyInput(event.target.value),
              }),
              h(Button, { small: true, primary: true, onClick: () => { void saveBigjpgKey(); }, disabled: !bjKeyInput.trim() }, tr('save'))),
            h('div', { className: 'cp-meta' },
              h('span', null, `${tr('bjRemaining')}: ${bjRemaining === null ? '—' : bjRemaining}`),
              h('span', null, tr('bjHint'))))),
        h('div', { className: 'cp-card' },
          h('div', { className: 'cp-card-head' },
            h('h2', { className: 'cp-card-title' }, tr('serverTitle')),
            h('span', { className: 'cp-pill', 'data-up': status.up ? 'true' : 'false' },
              h('span', { className: 'cp-dot' }),
              busy === 'start' ? tr('starting') : status.up ? tr('running') : tr('stopped'))),
          h('div', { className: 'cp-card-body' },
            h('div', { className: 'cp-rowline' },
              h(Button, { primary: true, onClick: () => { void startServer(); }, disabled: Boolean(busy) || status.up }, tr('start')),
              h(Button, { onClick: () => { void stopServer(); }, disabled: Boolean(busy) || !status.up }, tr('stop')),
              h(Button, {
                onClick: () => window.open(status.url || 'http://127.0.0.1:8188', '_blank', 'noopener'),
                disabled: !status.up,
              }, tr('open')),
              h(Button, { onClick: () => { void reveal('models'); } }, tr('folder'))),
            h('div', { className: 'cp-meta' },
              status.device ? h('span', null, `${tr('device')}: ${status.device}`) : null,
              status.vram ? h('span', null, `VRAM ${status.vram}`) : null,
              status.version ? h('span', null, `ComfyUI ${status.version}`) : null,
              status.up && status.dynamicVram === false ? h('span', null, tr('dynamicVramOff')) : null,
              status.offline ? h('span', null, tr('offline')) : null),
            h('div', { className: 'cp-rowline' },
              h(Button, { small: true, onClick: () => { void reveal('outputs'); } }, tr('openSaveFolder'))))),
        h('div', { className: 'cp-card' },
          h('div', { className: 'cp-card-head' },
            h('h2', { className: 'cp-card-title' }, tr('serviceLog')),
            h('Button', { small: true, onClick: () => { void refreshLog(); } }, tr('refreshLog'))),
          h('div', { className: 'cp-card-body' },
            log ? h('pre', { className: 'cp-ext-log' }, log) : h('div', { className: 'cp-empty' }, tr('logEmpty')))));

      const renderPreview = () => {
        if (!preview) return null;
        const nameValue = preview.name || '';
        const savedImage = (saved.images || []).some((image) => image.name === nameValue);
        return h('div', { className: 'cp-modal', onClick: () => setPreview(null), role: 'dialog', 'aria-modal': 'true' },
          h('div', { className: 'cp-modal-inner', onClick: (event) => event.stopPropagation() },
            h('img', { className: 'cp-modal-img', src: preview.src, alt: preview.title }),
            h('div', { className: 'cp-modal-bar' },
              nameValue ? h(Button, { primary: true, onClick: () => { void useOutputForInit(nameValue); } }, tr('regenerateFrom')) : null,
              nameValue ? h(Button, { onClick: () => { void copyImage(nameValue); } }, tr('copyImage')) : null,
              nameValue ? h(Button, { onClick: () => { void saveImage(nameValue); } }, tr('saveToFolder')) : null,
              h('a', { className: 'cp-btn', href: preview.src, download: preview.title }, tr('download')),
              nameValue
                ? h(Button, { onClick: () => { void toggleImage(nameValue, preview.prompt); } }, savedImage ? tr('unfavorite') : tr('favoriteImage'))
                : null,
              nameValue ? h(Button, { onClick: () => { void deleteOutput(nameValue); } }, tr('deleteFile')) : null,
              nameValue && bjConfigured
                ? h(Button, {
                    primary: true,
                    disabled: Boolean(bjBusy),
                    onClick: () => { void upscaleWithBigjpg(nameValue, bjScale); },
                  }, `${tr('bjTitle')} ${BIGJPG_LABELS[bjScale]}`)
                : null,
              nameValue ? h(Button, { primary: true, onClick: () => { addTipImage(nameValue); setPreview(null); } }, tr('tipAddImage')) : null,
              h(Button, { onClick: () => window.open(preview.src, '_blank', 'noopener') }, tr('openImage')),
              preview.prompt ? h(Button, { onClick: () => { void copyText(preview.prompt); } }, tr('copyPrompt')) : null,
              h(Button, { onClick: () => setPreview(null) }, tr('close')))));
      };

      const content = tab === 'generate' ? renderGenerateTab()
        : tab === 'inpaint' ? renderInpaintTab()
          : tab === 'prompt' ? renderPromptTab()
          : tab === 'styles' ? renderStyleManagerTab()
          : tab === 'help' ? renderHelpTab()
          : tab === 'history' ? renderHistoryTab()
            : tab === 'outputs' ? renderOutputsTab()
              : tab === 'discover' ? renderDiscoverTab()
                : tab === 'workbench' ? renderWorkbenchTab()
                  : tab === 'models' ? renderModelsTab()
                    : renderServiceTab();

      return h('section', { className: 'cp-root', ref: rootRef },
        h('style', null, CSS),
        h('header', { className: 'cp-head' },
          h(PanelIcon, { size: 20, active: true }),
          h('div', { className: 'cp-heading' },
            h('h1', { className: 'cp-title' }, tr('title')),
            h('p', { className: 'cp-sub' }, tr('subtitle'))),
          notice ? h('span', { className: 'cp-pill' }, notice) : null,
          h('span', { className: 'cp-pill', 'data-up': status.up ? 'true' : 'false' },
            h('span', { className: 'cp-dot' }),
            status.up ? tr('running') : tr('stopped'))),
        h('div', { className: 'cp-body' },
          h('div', { className: 'cp-tabs' }, TABS.map((entry) => h('button', {
            key: entry.id, type: 'button', className: 'cp-tab',
            'data-active': tab === entry.id ? 'true' : 'false',
            onClick: () => setTab(entry.id),
          }, tr(entry.key)))),
          error
            ? h('div', { className: 'cp-banner' },
                h('span', null, error),
                h('button', {
                  type: 'button', className: 'cp-btn', 'data-small': 'true',
                  onClick: () => setError(''),
                }, '×'))
            : null,
          content,
          renderPreview(),
          confirmState
            ? h('div', { className: 'cp-confirm-backdrop', onClick: () => setConfirmState(null) },
                h('div', { className: 'cp-confirm', onClick: (event) => event.stopPropagation() },
                  h('p', { className: 'cp-confirm-text' }, confirmState.message),
                  h('div', { className: 'cp-rowline' },
                    h(Button, {
                      small: true, primary: true,
                      onClick: () => {
                        const action = confirmState.action;
                        setConfirmState(null);
                        if (action) void action();
                      },
                    }, tr('confirmYes')),
                    h(Button, { small: true, onClick: () => setConfirmState(null) }, tr('cancel')))))
            : null));
    }

    /** Render failures as text instead of blanking the whole slot entry. */
    function SafePanel(props) {
      try {
        return ComfyPanel(props);
      } catch (error) {
        return h('div', { style: { padding: 24, fontSize: 13, color: 'var(--dsw-alias-state-error-primary)' } },
          `comfy-panel: ${String(error && error.message ? error.message : error)}`);
      }
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', en), 'comfy-panel: en dictionary');
        ctx.effect(() => ctx.locale.register(NS, 'zh', zh), 'comfy-panel: zh dictionary');
        const t = ctx.locale.bind(NS);

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 30,
          locale: NS,
          label: () => t('title'),
        }, PanelIcon));

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
        }, SafePanel));
      },
    };
  },
});
