$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root 'hamarsride-backend'
$userFrontendDir = Join-Path $root 'hamarsride-user\HamarsRide'
$adminFrontendDir = Join-Path $root 'hamarsride-admin\hamarsride-admin-frontend'

if (-not (Test-Path $backendDir)) {
  throw "Backend directory not found: $backendDir"
}

if (-not (Test-Path $userFrontendDir)) {
  throw "User frontend directory not found: $userFrontendDir"
}

if (-not (Test-Path $adminFrontendDir)) {
  throw "Admin frontend directory not found: $adminFrontendDir"
}

$backendCommand = "Set-Location '$backendDir'; npm.cmd run dev"
$userFrontendCommand = "Set-Location '$userFrontendDir'; npm.cmd run dev"
$adminFrontendCommand = "Set-Location '$adminFrontendDir'; npm.cmd run dev"

Start-Process -FilePath 'powershell.exe' -ArgumentList @(
  '-NoExit',
  '-NoProfile',
  '-ExecutionPolicy', 'Bypass',
  '-Command', $backendCommand
) | Out-Null

Start-Process -FilePath 'powershell.exe' -ArgumentList @(
  '-NoExit',
  '-NoProfile',
  '-ExecutionPolicy', 'Bypass',
  '-Command', $userFrontendCommand
) | Out-Null

Start-Process -FilePath 'powershell.exe' -ArgumentList @(
  '-NoExit',
  '-NoProfile',
  '-ExecutionPolicy', 'Bypass',
  '-Command', $adminFrontendCommand
) | Out-Null

Write-Host 'Started shared backend, user frontend, and admin frontend in separate terminals.'
