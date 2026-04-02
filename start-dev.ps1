$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$userScript = Join-Path $root 'hamarsride-user\start-dev.ps1'
$adminScript = Join-Path $root 'hamarsride-admin\start-dev.ps1'

if (-not (Test-Path $userScript)) {
  throw "User dev script not found: $userScript"
}

if (-not (Test-Path $adminScript)) {
  throw "Admin dev script not found: $adminScript"
}

Start-Process -FilePath 'powershell.exe' -ArgumentList @(
  '-NoExit',
  '-NoProfile',
  '-ExecutionPolicy', 'Bypass',
  '-File', $userScript
) | Out-Null

Start-Process -FilePath 'powershell.exe' -ArgumentList @(
  '-NoExit',
  '-NoProfile',
  '-ExecutionPolicy', 'Bypass',
  '-File', $adminScript
) | Out-Null

Write-Host 'Started user and admin app stacks in separate terminals.'
