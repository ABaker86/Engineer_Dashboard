@echo off
set "PATH=C:\Users\adamb\AppData\Local\Programs\Git\cmd;C:\Users\adamb\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64;%PATH%"
cd /d "%~dp0"
echo Starting development server with Electron...
npm run dev
