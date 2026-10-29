@echo off
title ScholarMatch — Next.js & Supabase Full-Stack Application
echo ========================================================
echo        ScholarMatch Full-Stack Web Application
echo ========================================================
echo.

cd /d "%~dp0"

echo [INFO] Starting ScholarMatch Next.js server (http://localhost:3000)...
start http://localhost:3000
call npm run dev

pause
