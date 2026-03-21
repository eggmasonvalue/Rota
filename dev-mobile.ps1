## Mobile Dev Setup
$ADB_PATH = "D:\Misc2\00_tools\platform-tools\adb.exe"

# 1. Forward the port from the phone's loopback to the machine's loopback
Write-Host "`n[MOBILE] Setting up USB Port Forwarding (3000 -> 3000)..." -ForegroundColor Cyan
& $ADB_PATH reverse tcp:3000 tcp:3000

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] You can now visit http://localhost:3000 in your phone's browser.`n" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to setup ADB reverse. Is your phone connected with USB debugging on?`n" -ForegroundColor Yellow
}

# 2. Start the development server
Write-Host "[START] Starting Next.js Dev Server...`n" -ForegroundColor White
npm run dev
