@echo off
echo ============================================
echo   PashuRaksha Professional AI Bot - START
echo ============================================
cd /d C:\Users\Aniketh\Desktop\SIH2026\wa-js

echo.
echo [1/2] Starting AI server (port 5000)...
start "PashuRaksha AI Server" /min cmd /c "C:\Python314\python.exe server.py"
echo       wait ~15 sec for models to load...

timeout /t 12 /nobreak >nul

echo [2/2] Starting WhatsApp bot...
echo   Session is SAVED - you should NOT need to scan again.
echo   (If it shows a QR, scan once - then it remembers forever.)
node bot.js
pause