@echo off
title Tournament Organizer - Dev Server
echo ==========================================
echo  Tournament Organizer Dev Server
echo  http://localhost:3000
echo ==========================================
echo.
echo Starting... DO NOT CLOSE THIS WINDOW!
echo.
cd /d "%~dp0"
npm run dev
pause
