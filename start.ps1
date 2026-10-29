# ScholarMatch — PowerShell Launcher
$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $baseDir

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "     ScholarMatch Full-Stack Next.js & Supabase         " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[INFO] Starting Next.js server on http://localhost:3000..." -ForegroundColor Green
Start-Process "http://localhost:3000"
npm run dev
