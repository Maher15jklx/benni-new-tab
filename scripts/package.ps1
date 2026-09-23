Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $repositoryRoot "manifest.json"
$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
$outputDirectory = Join-Path $repositoryRoot "dist"
$archivePath = Join-Path $outputDirectory "startpane-edge-v$($manifest.version).zip"

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
  "NOTICE.md",
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

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
try {
  $entryNames = @($archive.Entries | ForEach-Object { $_.FullName.Replace("\", "/") })
  if ($entryNames -notcontains "manifest.json") {
    throw "manifest.json fehlt im Stamm des ZIP-Archivs."
  }
  if ($entryNames | Where-Object { $_ -match "(^|/)(node_modules|dist|store-assets|scripts|\.git)(/|$)" }) {
    throw "Das ZIP-Archiv enthält Entwicklungs- oder Store-Arbeitsdateien."
  }
  if ($entryNames | Where-Object { $_ -match "\.(map|crx|pem|zip)$" }) {
    throw "Das ZIP-Archiv enthält nicht freizugebende Artefakte."
  }
} finally {
  $archive.Dispose()
}

Write-Output "Microsoft-Edge-Add-ons-Paket erstellt: $archivePath"
