Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $repositoryRoot "manifest.json"
$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
$outputDirectory = Join-Path $repositoryRoot "dist"
$archivePath = Join-Path $outputDirectory "benni-new-tab-chrome-v$($manifest.version).zip"

& node (Join-Path $PSScriptRoot "validate.mjs")
if ($LASTEXITCODE -ne 0) {
  throw "Die Validierung ist fehlgeschlagen. Es wurde kein Paket erstellt."
}

New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

$packageItems = @(
  "_locales",
  "backgrounds",
  "css",
  "icons",
  "js",
  "LICENSE",
  "PRIVACY.md",
  "manifest.json",
  "newtab.html"
)

Push-Location $repositoryRoot
try {
  Compress-Archive -Path $packageItems -DestinationPath $archivePath -CompressionLevel Optimal -Force
} finally {
  Pop-Location
}

Write-Output "Chrome-Web-Store-Paket erstellt: $archivePath"
