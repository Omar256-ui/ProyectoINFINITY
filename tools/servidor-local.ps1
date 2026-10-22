# Servidor local de vista previa para sitio/ (para equipos sin Python). No se publica.
# Uso: powershell -ExecutionPolicy Bypass -File tools/servidor-local.ps1   ->  http://localhost:8770/
param([string]$Root = (Join-Path $PSScriptRoot "..\sitio"), [int]$Port = 8770)
$Root = (Resolve-Path $Root).Path
$mime = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".js"="application/javascript; charset=utf-8";
  ".json"="application/json"; ".webp"="image/webp"; ".png"="image/png"; ".jpg"="image/jpeg"; ".svg"="image/svg+xml";
  ".mp4"="video/mp4"; ".txt"="text/plain; charset=utf-8"; ".xml"="application/xml" }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/"); $l.Start()
Write-Host "Sirviendo $Root en http://localhost:$Port/"
while ($l.IsListening) {
  $ctx = $l.GetContext(); $res = $ctx.Response
  try {
    $p = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($p -eq '' -or $p.EndsWith('/')) { $p += 'index.html' }
    $f = Join-Path $Root $p
    if (-not (Test-Path $f -PathType Leaf)) { $res.StatusCode = 404; $f = Join-Path $Root '404.html' }
    $ext = [IO.Path]::GetExtension($f).ToLower()
    $res.ContentType = $(if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' })
    $res.Headers.Add('Cache-Control', 'no-cache')
    $b = [IO.File]::ReadAllBytes($f); $res.ContentLength64 = $b.Length
    $res.OutputStream.Write($b, 0, $b.Length)
  } catch { } finally { $res.Close() }
}
