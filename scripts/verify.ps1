Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   Contextπ Application Monorepo Readiness Check" -ForegroundColor Cyan
Write-Host "====================================================`n" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\.."
node scripts/verify.js
