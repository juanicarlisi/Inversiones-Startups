#!/usr/bin/env python3
"""Arma «Informática desde cero» en un solo HTML.
Uso: python3 construir.py [salida.html] [--artefacto]
Lee plan/plan.json, dias/*.json y fuentes/fuentes.json (más fuentes_nuevas dentro de cada día).
Por defecto incrusta las tipografías (funciona sin conexión); con --artefacto las pide a Google Fonts (archivo liviano para publicar)."""
import base64, datetime, glob, json, os, re, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
ARTEFACTO = '--artefacto' in sys.argv
args = [a for a in sys.argv[1:] if not a.startswith('--')]
SALIDA = args[0] if args else os.path.join(AQUI, 'informatica-desde-cero.html')
J = lambda *p: os.path.join(AQUI, *p)

def fuentes_locales():
    css = open(J('app', 'tipografias', 'fuentes.css')).read(); out = []
    for sub, bloque in re.findall(r'/\* ([a-z-]+) \*/\s*(@font-face \{.*?\})', css, re.S):
        nombre = re.search(r'url\(([^)]+\.woff2)\)', bloque).group(1)
        datos = base64.b64encode(open(J('app', 'tipografias', nombre), 'rb').read()).decode()
        out.append(bloque.replace(nombre, 'data:font/woff2;base64,' + datos))
    return '<style>\n' + '\n'.join(out) + '\n</style>'

def main():
    plan = json.load(open(J('plan', 'plan.json')))
    dias, fuentes = {}, json.load(open(J('fuentes', 'fuentes.json'))) if os.path.exists(J('fuentes', 'fuentes.json')) else {}
    for f in sorted(glob.glob(J('dias', '*.json'))):
        d = json.load(open(f)); 
        for fn in d.pop('fuentes_nuevas', []):
            i = fn.pop('id'); fuentes.setdefault(i, fn)
        dias[d['id']] = d
    datos = {'meta': {'generado': datetime.date.today().isoformat(), 'artefacto': ARTEFACTO}, 'partes': plan['partes'], 'plan': plan['dias'], 'orden': plan['orden'], 'dias': dias, 'fuentes': fuentes}
    js = open(J('app', 'bloques.js')).read() + '\n' + open(J('app', 'widgets.js')).read() + '\n' + open(J('app', 'app.js')).read()
    tpl = open(J('app', 'plantilla.html')).read()
    cabeza = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zilla+Slab:ital,wght@0,500;0,600;0,700;1,500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..600&family=Public+Sans:wght@400..700&family=JetBrains+Mono:wght@400..700&display=swap">'
              if ARTEFACTO else fuentes_locales())
    crudo = json.dumps(datos, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    import gzip, base64   # los datos viajan comprimidos (gzip + base64) y el navegador los descomprime al abrir: el artefacto publicado pesa ~5x menos
    payload = 'window.__DZ="' + base64.b64encode(gzip.compress(crudo, 9, mtime=0)).decode('ascii') + '";'
    js = ('(function(){const arrancar=function(){\n' + js + '\n};\n'
          'const fallo=m=>{document.body.insertAdjacentHTML("afterbegin","<p style=\'padding:2rem;font:16px sans-serif\'>"+m+"</p>");};\n'
          'if(typeof DecompressionStream==="undefined"){fallo("Este navegador no puede abrir el estudio (falta DecompressionStream). Probá con una versión reciente de Chrome, Firefox o Safari.");return;}\n'
          'const b=Uint8Array.from(atob(window.__DZ),c=>c.charCodeAt(0));window.__DZ=null;\n'
          'new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream("gzip"))).text().then(t=>{window.DATOS=JSON.parse(t);arrancar();}).catch(e=>fallo("No se pudieron leer los datos del estudio: "+e));\n'
          '})();')
    out = tpl.replace('/*__FUENTES__*/', cabeza).replace('/*__ESTILOS__*/', open(J('app', 'estilos.css')).read()).replace('/*__DATOS__*/', payload).replace('/*__JS__*/', js.replace('</script', '<\\/script'))
    if ARTEFACTO:   # el publicador envuelve la página: sin doctype, html, head ni body; el visor pone charset y viewport
        out = re.sub(r'<!doctype html>\s*<html[^>]*>\s*<head>\s*', '', out, flags=re.I)
        out = re.sub(r'<meta charset[^>]*>\s*', '', out); out = re.sub(r'<meta name="viewport"[^>]*>\s*', '', out)
        out = out.replace('</head>\n<body>', '').replace('</body>\n</html>', '')
        out = out.replace('<title>', '<meta name="claude:viewport-fit-sides" content="cover">\n<title>', 1)
    open(SALIDA, 'w', encoding='utf-8').write(out)
    print(f'escrito {SALIDA} · {len(out)/1e6:.2f} MB · {len(dias)} días escritos de {len(plan["orden"])} · {len(fuentes)} fuentes')
main()
