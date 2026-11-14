
# EP2 ContentFlow - Forma A
# Archivo: 07_importacion_datos.ps1
#
# Procedimiento de importacion de datos.
# Los archivos originales se importaron mediante
# MongoDB Compass a la base ContentFlowDB.
#
# Este script NO importa ni modifica documentos.
# Solo verifica los archivos JSON disponibles.

$carpetaDatos = Join-Path $PSScriptRoot "..\datos_originales"

Write-Host "VERIFICACION DE ARCHIVOS CONTENTFLOW"

if (-not (Test-Path $carpetaDatos)) {
    Write-Host "No se encontro la carpeta datos_originales"
    exit 1
}

$archivos = Get-ChildItem $carpetaDatos -Filter "*.json" -File |
    Where-Object { $_.Name -notlike "._*" }

$archivos | Select-Object Name, Length

Write-Host ""
Write-Host "Total de archivos JSON:" $archivos.Count

Write-Host ""
Write-Host "PROCEDIMIENTO ORIGINAL:"
Write-Host "1. Conectar MongoDB Compass a MongoDB Atlas."
Write-Host "2. Seleccionar la base ContentFlowDB."
Write-Host "3. Crear las cinco colecciones."
Write-Host "4. Importar los JSON mediante Add Data > Import JSON."
Write-Host "5. Verificar 500 documentos por coleccion."
Write-Host "6. Convertir los campos de fecha a BSON Date."
Write-Host ""
Write-Host "IMPORTANTE: No se realizo ninguna importacion."
