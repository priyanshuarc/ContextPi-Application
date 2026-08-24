Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "      Launching Contextπ Concurrent Monorepo" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "1. NexaSupply Target Server:  http://localhost:3000" -ForegroundColor Green
Write-Host "2. Contextπ Backend Engine:   http://localhost:3001" -ForegroundColor Green
Write-Host "3. Contextπ Client UI:        http://localhost:5173" -ForegroundColor Green
Write-Host "====================================================`n" -ForegroundColor Cyan

$root = Resolve-Path "$PSScriptRoot\.."

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\nexasupply'; npm run start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\contextpi'; npm run start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\contextpi\client'; npm run dev"

Write-Host "All 3 services launched in separate process windows! 🎉" -ForegroundColor Green
