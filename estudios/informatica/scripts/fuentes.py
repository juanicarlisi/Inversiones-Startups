#!/usr/bin/env python3
"""Baja de Google Fonts las tipografías del estudio (solo subconjuntos latin y latin-ext) a app/tipografias/.
Guarda fuentes.css con las reglas @font-face apuntando a archivos locales (nombre = hash de la URL)."""
import os, re, subprocess, hashlib, urllib.request
AQUI = os.path.dirname(os.path.abspath(__file__)); DEST = os.path.join(AQUI, '..', 'app', 'tipografias')
FAMILIAS = ['Zilla+Slab:ital,wght@0,500;0,600;0,700;1,500',
            'Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..600',
            'Public+Sans:wght@400..700',
            'JetBrains+Mono:wght@400..700']
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30).read()
css_total = []
for fam in FAMILIAS:
    css = get(f'https://fonts.googleapis.com/css2?family={fam}&display=swap').decode()
    for sub, bloque in re.findall(r'/\* ([a-z-]+) \*/\s*(@font-face \{.*?\})', css, re.S):
        if sub not in ('latin', 'latin-ext'): continue
        url = re.search(r'url\((https://[^)]+)\)', bloque).group(1)
        nombre = hashlib.md5(url.encode()).hexdigest()[:16] + '.woff2'
        ruta = os.path.join(DEST, nombre)
        if not os.path.exists(ruta):
            open(ruta, 'wb').write(get(url))
        css_total.append(f'/* {sub} */\n' + bloque.replace(url, nombre))
open(os.path.join(DEST, 'fuentes.css'), 'w').write('\n'.join(css_total))
print(len(css_total), 'caras;', sum(os.path.getsize(os.path.join(DEST, f)) for f in os.listdir(DEST) if f.endswith('.woff2')) // 1024, 'KB')
