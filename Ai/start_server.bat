@echo off
REM Start the combined PashuSahaya SmartBot backend (AI + doctor chat + voice) on http://127.0.0.1:5000
cd /d "%~dp0"
echo [PashuSahaya AI] Starting server on http://127.0.0.1:5000 ...
python server.py
pause