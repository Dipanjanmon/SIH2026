@echo off
title SmartBot Server
cd /d "%~dp0"
set SSL_CERT_FILE=%APPDATA%\Python\Python314\site-packages\certifi\cacert.pem
python server.py
pause