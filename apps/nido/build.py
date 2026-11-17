"""Arma la web instalable de Nido en web/ a partir de src/. Uso: python3 build.py

- index.html: un solo archivo con el CSS y el JS (como la app de la familia), más idb en su propio <script>.
- manifest.webmanifest y sw.js: con el nombre de src/marca.json y la versión calculada del contenido.
- La versión (hash del contenido) cambia solo si cambia algo: así el service worker detecta la actualización.
Los íconos PNG se generan aparte con `node arte/render.cjs` (solo cuando cambia el dibujo).
"""
import hashlib, json, pathlib

RAIZ = pathlib.Path(__file__).parent
SRC, WEB = RAIZ / 'src', RAIZ / 'web'
JS = ['p1_core.js', 'p1b_catalogo.js', 'p1c_datos.js', 'p1d_store.js', 'p2_views.js', 'p3_forms.js', 'p3b_nido.js', 'p4_app.js']
ESTATICOS = sorted(p.relative_to(WEB).as_posix() for p in list((WEB / 'fuentes').glob('*.woff2')) + list((WEB / 'iconos').glob('*.*')))

marca = {k: v for k, v in json.loads((SRC / 'marca.json').read_text()).items() if not k.startswith('_')}
icono = (WEB / 'iconos' / 'icono.svg').read_text().strip()
css = (SRC / 'style.css').read_text()
idb = (SRC / 'vendor' / 'idb-8.0.4.umd.js').read_text().strip()
js_src = ''.join((SRC / f).read_text() + '\n' for f in JS)

h = hashlib.sha256()
for parte in [css, idb, js_src, json.dumps(marca, sort_keys=True), (SRC / 'shell.html').read_text(), (SRC / 'sw.js').read_text()]:
    h.update(parte.encode())
for rel in ESTATICOS:
    h.update((WEB / rel).read_bytes())
version = h.hexdigest()[:10]
build = f'corte 0 · {version[:7]}'

p0 = ("'use strict';\n/* Generado por build.py: marca y versión. */\n"
      f"const MARCA = {json.dumps(marca, ensure_ascii=False)};\n"
      f"const NIDO_BUILD = {json.dumps(build)};\n"
      f"const ICONO_SVG = {json.dumps(icono.replace(' role=\"img\" aria-label=\"Nido\"', ' aria-hidden=\"true\"'), ensure_ascii=False)};\n")
js = p0 + js_src.replace("'use strict';\n", '', 1)

def poner(t):
    return (t.replace('{{NOMBRE}}', marca['nombre']).replace('{{NOMBRE_CORTO}}', marca['nombreCorto'])
             .replace('{{DESCRIPCION}}', marca['descripcion']).replace('{{COLOR_CLARO}}', marca['colorClaro'])
             .replace('{{COLOR_OSCURO}}', marca['colorOscuro']))

html = poner((SRC / 'shell.html').read_text()).replace('/*CSS*/', css).replace('/*IDB*/', idb).replace('/*JS*/', js)
(WEB / 'index.html').write_text(html)

manifest = {
    'id': './', 'name': marca['nombre'], 'short_name': marca['nombreCorto'], 'description': marca['descripcion'],
    'lang': 'es-AR', 'dir': 'ltr', 'start_url': './?origen=app', 'scope': './', 'display': 'standalone',
    'background_color': marca['colorClaro'], 'theme_color': marca['colorClaro'], 'categories': ['finance', 'productivity'],
    'icons': [
        {'src': 'iconos/icono-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
        {'src': 'iconos/icono-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
        {'src': 'iconos/icono-maskable-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'maskable'},
        {'src': 'iconos/icono-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
        {'src': 'iconos/icono.svg', 'sizes': 'any', 'type': 'image/svg+xml', 'purpose': 'any'},
    ],
    'shortcuts': [{'name': 'Cargar un gasto', 'short_name': 'Gasto', 'url': './?accion=gasto',
                   'icons': [{'src': 'iconos/icono-192.png', 'sizes': '192x192', 'type': 'image/png'}]}],
}
(WEB / 'manifest.webmanifest').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')

archivos = ['./', './index.html', './manifest.webmanifest'] + ['./' + r for r in ESTATICOS]
sw = poner((SRC / 'sw.js').read_text()).replace('{{VERSION}}', version).replace('{{ARCHIVOS}}', json.dumps(archivos, indent=2))
(WEB / 'sw.js').write_text(sw)
print(f'{marca["nombre"]} {build}: web/index.html ({len(html) // 1024} kB), sw.js con {len(archivos)} archivos')
