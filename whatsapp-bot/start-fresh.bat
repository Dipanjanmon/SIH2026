@echo off
echo ============================================
echo  PashuRaksha WhatsApp Bot - Fresh Session
echo ============================================
echo.
echo  STEP 1: Deleting old session (so a clean QR appears)
cd /d C:\Users\Aniketh\Desktop\SIH2026\wa-js
if exist wa-session (
  rmdir /s /q wa-session
  echo  Old session deleted.
) else (
  echo  No old session found - clean already.
)
echo.
echo  STEP 2: Starting bot. It will print a NEW QR code.
echo  Scan it with your phone: WhatsApp - Settings - Linked Devices - Link a Device
echo  (Leave this window OPEN - session will auto-save, no re-login next time)
echo.
pause
node bot.js
