# ============================================================
#  AGmaster1.8beta · 一键安装 / 一键还原
#  AGmaster1.8beta一键安装.cmd   → 安装到插件目录
#  AGmaster1.8beta一键还原.cmd   → 用本备份覆盖回插件目录
# ============================================================
[CmdletBinding()]
param(
    [ValidateSet('install', 'restore')]
    [string]$Mode = 'install',
    [string]$Source = '',
    [string]$Target = 'D:\aiLOCAL\comfy-panel',
    [switch]$IncludeState,
    [switch]$Quiet
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($Source)) {
    $Source = $PSScriptRoot
    if ([string]::IsNullOrWhiteSpace($Source)) {
        $Source = Split-Path -Parent $MyInvocation.MyCommand.Path
    }
}

function Write-Step($text) { Write-Host $text -ForegroundColor Cyan }
function Write-Ok($text) { Write-Host $text -ForegroundColor Green }
function Write-Warn($text) { Write-Host $text -ForegroundColor Yellow }

$label = if ($Mode -eq 'install') { '安装' } else { '还原' }
Write-Host ''
Write-Host '==============================================' -ForegroundColor DarkGray
Write-Host "  AGmaster1.8beta · 一键$label" -ForegroundColor White
Write-Host '==============================================' -ForegroundColor DarkGray
Write-Host ''

if (-not (Test-Path -LiteralPath $Source)) { throw "找不到备份目录：$Source" }

$excludeNames = @(
    'user-state.snapshot.json',
    'BACKUP_INFO.json',
    'README.md',
    'AGmaster1.8beta安装.ps1',
    'AGmaster1.8beta一键安装.cmd',
    'AGmaster1.8beta一键还原.cmd'
)

$targetExists = Test-Path -LiteralPath $Target
if (-not $targetExists) {
    Write-Warn "目标目录不存在，将新建：$Target"
    New-Item -ItemType Directory -Force -Path $Target | Out-Null
}

if ($targetExists) {
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $pre = Join-Path 'D:\aiLOCAL\backup' "pre-$Mode-$stamp"
    Write-Step "[1/4] 备份现有版本 -> $pre"
    New-Item -ItemType Directory -Force -Path $pre | Out-Null
    Get-ChildItem -LiteralPath $Target -Force | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $pre -Recurse -Force
    }
    $count = (Get-ChildItem $pre -Recurse -File | Measure-Object).Count
    Write-Ok "      完成（$count 个文件）"
} else {
    Write-Step '[1/4] 全新安装，无需备份现有版本'
}

Write-Step "[2/4] $label AGmaster1.8beta -> $Target"
$files = Get-ChildItem -LiteralPath $Source -Recurse -File | Where-Object { $excludeNames -notcontains $_.Name }
foreach ($file in $files) {
    $relative = $file.FullName.Substring($Source.Length).TrimStart('\')
    $destination = Join-Path $Target $relative
    $folder = Split-Path -Parent $destination
    if ($folder -and -not (Test-Path -LiteralPath $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
    }
    Copy-Item -LiteralPath $file.FullName -Destination $destination -Force
}
Write-Ok "      已写入 $($files.Count) 个文件"

Write-Step '[3/4] 校验文件'
$mismatched = @()
foreach ($file in $files) {
    $relative = $file.FullName.Substring($Source.Length).TrimStart('\')
    $destination = Join-Path $Target $relative
    if (-not (Test-Path -LiteralPath $destination)) { $mismatched += $relative; continue }
    $a = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    $b = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash
    if ($a -ne $b) { $mismatched += $relative }
}
if ($mismatched.Count -eq 0) {
    Write-Ok "      SHA256 全部一致（$($files.Count) 个文件）"
} else {
    Write-Warn "      以下文件不一致：$($mismatched -join ', ')"
}

$nodeExe = $null
$candidate = 'C:\Users\LENOVO\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe'
if (Test-Path -LiteralPath $candidate) { $nodeExe = $candidate }
if (-not $nodeExe) {
    $cmd = Get-Command node -ErrorAction SilentlyContinue
    if ($cmd) { $nodeExe = $cmd.Source }
}
if ($nodeExe) {
    foreach ($name in @('index.js', 'client.js', 'prompts.js', 'help.js')) {
        $path = Join-Path $Target $name
        if (Test-Path -LiteralPath $path) {
            & $nodeExe --check $path 2>$null
            if ($LASTEXITCODE -ne 0) { Write-Warn "      $name 语法检查未通过" }
        }
    }
    Write-Ok '      语法检查完成'
} else {
    Write-Warn '      未找到 Node，跳过语法检查'
}

Write-Step '[4/4] 用户数据'
$snapshot = Join-Path $Source 'user-state.snapshot.json'
$stateTarget = 'D:\aiLOCAL\comfy\.comfy-panel\state.json'
if ($IncludeState) {
    if (Test-Path -LiteralPath $snapshot) {
        if (Test-Path -LiteralPath $stateTarget) {
            Copy-Item -LiteralPath $stateTarget -Destination "$stateTarget.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')" -Force
        }
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $stateTarget) | Out-Null
        Copy-Item -LiteralPath $snapshot -Destination $stateTarget -Force
        Write-Ok '      已按 -IncludeState 回滚 state.json（旧文件已另存 .bak）'
    } else {
        Write-Warn '      备份里没有 user-state.snapshot.json，跳过'
    }
} else {
    Write-Host '      保留现有收藏、历史、画风分类与提示（未改动 state.json）' -ForegroundColor DarkGray
}

Write-Host ''
Write-Ok "$label 完成，插件显示名称为 AGmaster1.8beta。"
Write-Host ''
Write-Host '还需两步让新版本生效：' -ForegroundColor White
Write-Host '  1) 在 DSH 插件管理里关闭 comfy-panel，再重新开启'
Write-Host '  2) 回到面板页面按 Ctrl + Shift + R 强制刷新'
Write-Host ''

if (-not $Quiet) {
    Write-Host ''
    Read-Host '按回车键关闭'
}
