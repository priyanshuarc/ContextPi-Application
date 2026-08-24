Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "      Contextπ Application Monorepo Setup" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Installing Contextπ Backend Dependencies..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\contextpi"
npm install

Write-Host "`n[2/3] Installing Contextπ Client Dependencies..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\contextpi\client"
npm install

Write-Host "`n[3/3] Installing NexaSupply Target Dependencies..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\nexasupply"
npm install

Set-Location "$PSScriptRoot\.."
Write-Host "`n====================================================" -ForegroundColor Green
Write-Host "   All dependencies installed successfully! 🎉" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
