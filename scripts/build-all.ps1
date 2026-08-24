Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "      Building Contextπ Application Monorepo" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Building NexaSupply Target Server..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\nexasupply"
npm run build

Write-Host "`n[2/3] Building Contextπ Backend Engine..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\contextpi"
npm run build

Write-Host "`n[3/3] Building Contextπ Client Web Bundle..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\contextpi\client"
npm run build

Set-Location "$PSScriptRoot\.."
Write-Host "`n====================================================" -ForegroundColor Green
Write-Host "   All monorepo builds completed successfully! 🚀" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
