"""Genera vista-previa.html: todo el sitio en un solo archivo (para compartir o publicar como artefacto).
Uso: python tools/vista-previa.py"""
import base64, json, os
import pathlib
RAIZ=pathlib.Path(__file__).resolve().parent.parent
S=str(RAIZ/'sitio')
css=open(f'{S}/assets/css/estilos.css').read()
cfg=open(f'{S}/config.js').read()
js=open(f'{S}/assets/js/app.js').read()
assets={}
import glob
for f in sorted(glob.glob(f'{S}/assets/img/emblema-*.webp') + glob.glob(f'{S}/assets/img/fondo-*.webp') + glob.glob(f'{S}/assets/sedes/*/*.webp')):
    rel=f.replace(S+'/','')
    assets[rel]='data:image/webp;base64,'+base64.b64encode(open(f,'rb').read()).decode()
print(len(assets),'imágenes')
for chunk in (cfg, js):
    assert '</script' not in chunk.lower()
FONTS='https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Hanken+Grotesk:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap'
html=f'''<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Infinity Gym | La Liga de gimnasios en Hidalgo</title>
<meta name="description" content="Vista previa del sitio de Infinity Gym: sedes, planes, horarios y agenda de visitas.">
<meta name="theme-color" content="#100D0A">
<meta name="color-scheme" content="dark">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<style>
{css}
</style>
<script>document.documentElement.classList.add("js")</script>
</head>
<body data-page="inicio" data-sede="">
<div class="atmosfera" aria-hidden="true"></div>
<div class="luz-tenue" aria-hidden="true"></div>
<div id="app"></div>
<script>window.__BUNDLE__ = true; window.__ASSETS__ = {json.dumps(assets)};</script>
<script>
{cfg}
</script>
<script>
{js}
</script>
</body>
</html>
'''
out=str(RAIZ/'vista-previa.html')
open(out,'w').write(html)
print(os.path.getsize(out)//1024,'KB')
