# Requiere mkcert instalado: https://github.com/FiloSottile/mkcert/releases
# Ejecutar en PowerShell como Administrador

$domain = "taller.local"
$ip = "192.168.18.12"
$certDir = Join-Path $PSScriptRoot "certs"

if (!(Test-Path $certDir)) { New-Item -ItemType Directory -Path $certDir | Out-Null }

# 1) Instala la CA local (si no existe)
mkcert -install

# 2) Genera el certificado para dominio e IP
Push-Location $certDir
mkcert $domain $ip
Pop-Location

# 3) Renombra a nombres esperados por Caddyfile
$latestCert = Get-ChildItem $certDir -Filter "*_+$($ip).pem" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$latestKey  = Get-ChildItem $certDir -Filter "*_+$($ip)-key.pem" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($null -eq $latestCert -or $null -eq $latestKey) {
  Write-Error "No se encontraron los ficheros generados por mkcert. Verifica la instalación."
  exit 1
}

Copy-Item $latestCert.FullName (Join-Path $certDir "taller.local.pem") -Force
Copy-Item $latestKey.FullName  (Join-Path $certDir "taller.local-key.pem") -Force

Write-Host "Certificados listos en $certDir. Reinicia Docker para aplicar." -ForegroundColor Green
