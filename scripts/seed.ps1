Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "      Seeding NexaSupply Database" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\..\nexasupply"
npm run seed

Set-Location "$PSScriptRoot\.."
Write-Host "`nNexaSupply database seeded successfully." -ForegroundColor Green
