$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root 'hamarsride-backend'
$frontendDir = Join-Path $root 'HamarsRide'

if (-not (Test-Path $backendDir)) {
  $alternateBackendDir = Join-Path $root 'Hamarsride-Backend'
  if (Test-Path $alternateBackendDir) {
    $backendDir = $alternateBackendDir
  } else {
    throw "Backend directory not found: $backendDir"
  }
}

if (-not (Test-Path $frontendDir)) {
  throw "Frontend directory not found: $frontendDir"
}

$backendCommand = "Set-Location '$backendDir'; npm.cmd run dev"
$frontendCommand = "Set-Location '$frontendDir'; npm.cmd run dev"

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
  '-Command', $frontendCommand
) | Out-Null

Write-Host 'Started user backend and frontend in separate terminals.'
