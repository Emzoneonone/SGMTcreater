@echo off
chcp 65001 >nul
setlocal
set "SCRIPT=%~dp0AGmaster1.8beta安装.ps1"
if not exist "%SCRIPT%" (
  echo [ERROR] 找不到 AGmaster1.8beta安装.ps1
  pause
  exit /b 1
)
echo.
echo   AGmaster1.8beta 一键安装
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%" -Mode install %*
if errorlevel 1 (
  echo.
  echo [ERROR] 安装过程中出现问题，请看上方输出。
  pause
)
endlocal
