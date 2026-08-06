$version = Read-Host "Enter new version (e.g. 2.5.2)"
(Get-Content "index.html") -replace "var APP_VERSION\s*=\s*'[^']*'", "var APP_VERSION = '$version'" | Set-Content "index.html"
(Get-Content "index.html") -replace "key\.startsWith\('mel-v[^']*'\)", "key.startsWith('mel-v$version')" | Set-Content "index.html"
(Get-Content "sw.js") -replace "var CACHE = 'mel-v[^']*'", "var CACHE = 'mel-v$version'" | Set-Content "sw.js"
Write-Host "Version bumped to $version" -ForegroundColor Green
