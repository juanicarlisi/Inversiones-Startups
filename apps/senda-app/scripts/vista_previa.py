#!/usr/bin/env python3
"""Arma la vista previa web publicable (carpeta vista-previa/) a partir de `npx expo export --platform web`.

Las rutas absolutas del export (/_expo/..., /assets/...) se vuelven relativas y planas, para que la app funcione
servida desde cualquier carpeta (por ejemplo, como página privada en claude.ai para probarla desde el celular).
Uso: EXPO_OFFLINE=1 npx expo export --platform web --output-dir dist && python3 scripts/vista_previa.py
"""
import json
import re
import shutil
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DIST = RAIZ / "dist"
SALIDA = RAIZ / "vista-previa"

PAGINA = """<title>Senda App</title>
<meta name="theme-color" content="#1C1446">
<style>
  /* Vista previa de la app: una sola columna con el ancho de un teléfono, siempre en el modo oscuro de la Arena. */
  :root { --fondo: #140E33; --app: #1C1446; --texto: #FFFFFF; color-scheme: dark; }
  html, body { height: 100%; background: var(--fondo); color: var(--texto); }
  body { overflow: hidden; }
  #root { display: flex; flex: 1; height: 100%; max-width: 480px; margin-inline: auto; background: var(--app);
    box-shadow: 0 0 60px rgba(0, 0, 0, 0.45); }
</style>
<div id="root"></div>
{scripts}
"""


def main():
    if SALIDA.exists():
        shutil.rmtree(SALIDA)
    (SALIDA / "js").mkdir(parents=True)
    (SALIDA / "a").mkdir()
    html = (DIST / "index.html").read_text(encoding="utf-8")
    bundles = re.findall(r'src="/(_expo/static/js/web/[^"]+\.js)"', html)
    mapa = {}
    for f in (DIST / "assets").rglob("*"):
        if f.is_file():
            rel = "/" + f.relative_to(DIST).as_posix()
            mapa[rel] = "a/" + f.name
            shutil.copy2(f, SALIDA / "a" / f.name)
    for f in (DIST / "_expo" / "static" / "js" / "web").glob("*.js"):
        mapa["/" + f.relative_to(DIST).as_posix()] = "js/" + f.name
    for f in (DIST / "_expo" / "static" / "js" / "web").glob("*.js"):
        js = f.read_text(encoding="utf-8")
        for absoluta, relativa in sorted(mapa.items(), key=lambda kv: -len(kv[0])):
            js = js.replace(f'"{absoluta}"', f'"{relativa}"')
        (SALIDA / "js" / f.name).write_text(js, encoding="utf-8")
    scripts = [f'<script src="js/{Path(b).name}" defer></script>' for b in bundles]
    restantes = re.findall(r'"/(?:assets|_expo)/[^"]+"', "".join(f.read_text() for f in (SALIDA / "js").glob("*.js")))
    (SALIDA / "index.html").write_text(PAGINA.replace("{scripts}", "\n".join(scripts)), encoding="utf-8")
    archivos = sorted(p.relative_to(SALIDA).as_posix() for p in SALIDA.rglob("*") if p.is_file())
    (RAIZ / "scripts" / ".vista-previa-archivos.json").write_text(json.dumps(archivos, indent=1), encoding="utf-8")
    peso = sum((SALIDA / a).stat().st_size for a in archivos)
    print(f"{len(archivos)} archivos, {peso / 1e6:.1f} MB; rutas absolutas sin convertir: {len(restantes)}")


if __name__ == "__main__":
    main()
