"""Arma Telar en dist/ a partir de src/ (sin empaquetador: el navegador carga los módulos tal cual).

Uso: python3 build.py

Qué hace:
1. Copia src/ a dist/ (menos herramientas de desarrollo).
2. Calcula la versión con el contenido de todos los archivos: si nada cambió, la versión es la misma (armado reproducible).
3. Escribe dist/version.js y dist/sw.js con la versión y la lista de archivos que se guardan para usar sin internet.
4. Revisa que cada «import» apunte a un archivo que existe y que no haya direcciones de terceros (http/https) en el código.
"""
import hashlib
import json
import pathlib
import re
import shutil
import sys

RAIZ = pathlib.Path(__file__).resolve().parent
SRC = RAIZ / 'src'
DIST = RAIZ / 'dist'
PLANTILLAS = {'sw.js', 'version.js'}  # se generan, no se copian tal cual
NO_PRECACHE = {'sw.js', 'iconos/telar-maskable.svg'}


def archivos_fuente():
    return sorted(p for p in SRC.rglob('*') if p.is_file() and not p.name.startswith('.'))


def revisar(archivos):
    errores = []
    patron_import = re.compile(r"""(?:import|export)[^'"]*?from\s+['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)""")
    terceros = re.compile(r"""['"(]https?://(?!localhost|…|['"])""")
    for p in archivos:
        if p.suffix not in {'.js', '.html', '.css', '.webmanifest'}:
            continue
        txt = p.read_text(encoding='utf-8')
        if p.suffix == '.js':
            for m in patron_import.finditer(txt):
                ruta = m.group(1) or m.group(2)
                if not (p.parent / ruta).resolve().is_file():
                    errores.append(f'{p.relative_to(RAIZ)}: no existe el módulo {ruta}')
        # Solo se permiten direcciones de terceros dentro de comentarios o como ejemplo de texto («https://…»).
        sin_comentarios = re.sub(r'/\*.*?\*/|<!--.*?-->|(^|\s)//[^\n]*', '', txt, flags=re.S | re.M)
        for m in terceros.finditer(sin_comentarios):
            errores.append(f'{p.relative_to(RAIZ)}: dirección externa en el código ({sin_comentarios[m.start():m.start()+40]!r})')
    return errores


def main():
    fuentes = archivos_fuente()
    errores = revisar(fuentes)
    if errores:
        print('No se armó:\n  ' + '\n  '.join(errores))
        sys.exit(1)

    h = hashlib.sha256()
    for p in fuentes:
        h.update(str(p.relative_to(SRC)).encode())
        h.update(p.read_bytes())
    version = h.hexdigest()[:10]

    if DIST.exists():
        shutil.rmtree(DIST)
    for p in fuentes:
        rel = p.relative_to(SRC)
        if str(rel) in PLANTILLAS:
            continue
        destino = DIST / rel
        destino.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, destino)

    (DIST / 'version.js').write_text(f"// Generado por build.py\nexport const VERSION = '{version}';\n", encoding='utf-8')

    lista = ['./'] + sorted(
        str(p.relative_to(DIST)).replace('\\', '/')
        for p in DIST.rglob('*')
        if p.is_file() and str(p.relative_to(DIST)) not in NO_PRECACHE and not p.name.startswith('OFL-')
    )
    sw = (SRC / 'sw.js').read_text(encoding='utf-8')
    sw = sw.replace("'__VERSION__'", repr(version)).replace('__ARCHIVOS__', json.dumps(lista, ensure_ascii=False, indent=2))
    (DIST / 'sw.js').write_text(sw, encoding='utf-8')

    peso = sum(p.stat().st_size for p in DIST.rglob('*') if p.is_file())
    print(f'Telar {version} armado en {DIST.relative_to(RAIZ.parent.parent)}/ · {len(lista)} archivos para usar sin internet · {peso / 1024:.0f} KB en total')


if __name__ == '__main__':
    main()
