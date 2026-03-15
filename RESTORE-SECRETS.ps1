$root = Split-Path -Parent $PSScriptRoot
$backup = Join-Path $root "_secrets_backup"
$backend = Join-Path $root "hamarsride-backend"

$items = @(
  @{ Source = Join-Path $backup ".env"; Destination = Join-Path $backend ".env" },
  @{ Source = Join-Path $backup "serviceAccountKey.json"; Destination = Join-Path $backend "serviceAccountKey.json" }
)

foreach ($item in $items) {
  if (Test-Path $item.Source) {
    Copy-Item -Path $item.Source -Destination $item.Destination -Force
    Write-Host "Restored $($item.Destination)"
  } else {
    Write-Host "Missing backup: $($item.Source)"
  }
}
