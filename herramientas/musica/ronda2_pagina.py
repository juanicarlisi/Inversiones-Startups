"""Arma la página de escucha a ciegas de la ronda 2 (17-11-2026).

    python ronda2_pagina.py seleccion.json DESTINO

seleccion.json: lista de {"grupo": ..., "wav": ..., "origen": "texto que se revela al final", "id": ...}. La página copia la de la
ronda 1 (informes/escucha-musica/index.html), mezcla el orden dentro de cada grupo con una semilla fija, pone letras nuevas
(G en adelante, barajadas para que el orden no delate nada), pasa cada clip a MP3 320 kbps y verifica -14 LUFS (±0,3).
La correspondencia queda en DESTINO/../escucha2_correspondencia.json (fuera de la carpeta que se publica).
No publica nada.
"""
import json, random, subprocess, sys
from pathlib import Path

GRUPOS = [("piano", "Piano para orar", "Para «Aguas de Reposo», de Remanso. 45 segundos cada uno."),
          ("dormir", "Dormir", "Para la serie de música para dormir de Remanso. 45 segundos cada uno."),
          ("cafe", "Café: bossa y jazz", "Para Sobremesa. 45 segundos cada uno."),
          ("espanola", "Española y flamenco", "Para Sobremesa: flamenco tranquilo, guitarra española y rumba. 45 segundos cada uno."),
          ("tango", "Tango lounge", "Para Sobremesa. 45 segundos cada uno.")]
LETRAS = list("GHJKLMNPQRSTUVWXYZ")


def lufs(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    tramo = r[r.rfind("Summary:"):]
    i = float(tramo.split("I:")[1].split("LUFS")[0])
    pk = float(tramo.split("Peak:")[1].split("dBFS")[0])
    return i, pk


def main(sel_path, destino):
    sel = json.load(open(sel_path))
    dest = Path(destino); (dest / "audio").mkdir(parents=True, exist_ok=True)
    rnd = random.Random(20261117)
    letras = LETRAS[:]; rnd.shuffle(letras)
    grupos_js, origen_js, corr = [], {}, []
    k = 0
    for gid, titulo, que in GRUPOS:
        clips = [c for c in sel if c["grupo"] == gid]
        rnd.shuffle(clips)
        lista = []
        for c in clips:
            letra = letras[k]; k += 1
            cid = f"{gid[:2]}{k:02d}"
            mp3 = dest / "audio" / f"{cid}.mp3"
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", c["wav"], "-codec:a", "libmp3lame", "-b:a", "320k",
                            "-ar", "48000", str(mp3)], check=True)
            i, pk = lufs(mp3)
            assert abs(i + 14) <= 0.3, (c["wav"], i)
            lista.append([cid, letra])
            origen_js[cid] = c["origen"]
            corr.append({"letra": letra, "archivo": f"audio/{cid}.mp3", "grupo": titulo, "id": c["id"], "wav": c["wav"],
                         "origen": c["origen"], "lufs_mp3": i, "pico_mp3_dbfs": pk, **{x: c[x] for x in c if x.startswith("aes_")}})
        grupos_js.append({"id": gid, "titulo": titulo, "que": que, "clips": lista})
    base = Path(__file__).resolve().parents[2] / "informes" / "escucha-musica" / "index.html"
    html = base.read_text()
    a = html.index("  const GRUPOS = ["); b = html.index("  const votos = {}")
    nuevo = ("  const GRUPOS = " + json.dumps(grupos_js, ensure_ascii=False, indent=1) + ";\n"
             "  const ORIGEN = " + json.dumps(origen_js, ensure_ascii=False, indent=1) + ";\n")
    html = html[:a] + nuevo + html[b:]
    # extras de la ronda 1 (pieza entera, video, dormir) fuera: esta ronda es solo comparar clips
    a = html.index("    const extras = `<section><h2>Para escuchar entero</h2>")
    b = html.index('      <div><p class="chico tenue" style="margin-bottom:6px">')
    html = html[:a] + "    const extras = `<section><h2>Para cerrar</h2>\n" + html[b:]
    html = html.replace("<title>Escuchá las pruebas</title>", "<title>Escuchá las pruebas · ronda 2</title>")
    html = html.replace("<h1>Escuchá las pruebas</h1>", "<h1>Escuchá las pruebas · ronda 2</h1>")
    html = html.replace("""Música para Remanso y Sobremesa hecha hoy por Claude, por dos caminos distintos. Los clips de cada grupo están
    mezclados y con el mismo volumen, sin decir de dónde sale cada uno. Escuchalos con auriculares si podés.""",
                        """Segunda vuelta de música para Remanso y Sobremesa. En cada grupo los clips están mezclados y con el mismo
    volumen, sin decir de dónde sale cada uno. Escuchalos con auriculares si podés. La meta es que lo bueno pase de 7.""")
    (dest / "index.html").write_text(html)
    json.dump(corr, open(dest.parent / "escucha2_correspondencia.json", "w"), ensure_ascii=False, indent=1)
    print(f"{len(corr)} clips; página en {dest / 'index.html'}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
