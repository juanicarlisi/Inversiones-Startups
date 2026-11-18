"""Arma la página de escucha a ciegas de la ronda 2 (18-11-2026). No publica nada.

    TALLER_PY ronda2_pagina.py CURADO_R2.jsonl SELECCION_R2.json DESTINO

- CURADO_R2.jsonl (ronda2_curar.py --seleccion): el WAV final de cada candidato y su postproducción.
- SELECCION_R2.json (ronda2_elegir.py): forma de pedir, semilla y prompt de cada uno (para la correspondencia).
- Suma, sin decirlo, el mejor clip de la ronda 1 en piano (p3, nota 5) y en café (c2, nota 6) para medir si subimos.

La página copia la de la ronda 1 (informes/escucha-musica/index.html): cinco grupos, orden barajado con semilla fija dentro de
cada grupo, letras barajadas que no repiten las de la ronda 1 (A-F) ni siguen el orden de los estilos, MP3 CBR 224 kbps (29
clips de 45 s ~ 36 MB; la ronda 1 usó 192) verificados a -14 LUFS (±0,3). Guarda los votos en la colección `votos2` (la ronda 1
sigue en `votos`). La correspondencia queda en DESTINO/correspondencia.json: no subirla con la página.
"""
import json, os, random, subprocess, sys
from pathlib import Path

R1 = Path(os.environ.get("R2_DIR", "/tmp/claude-0/-home-user/918eaeee-0db4-56e9-bb55-8ead9bee57c1/scratchpad/r2")) / "ref"
GRUPOS = [("piano", "Piano para orar", "Para «Aguas de Reposo», de Remanso: piano solo o con cuerdas suaves. 45 segundos cada uno."),
          ("dormir", "Dormir", "Para la serie de música para dormir de Remanso. 45 segundos cada uno."),
          ("cafe", "Café: bossa y jazz", "Para Sobremesa. 45 segundos cada uno."),
          ("espanola", "Española: flamenco, guitarra y rumba", "Para la serie «Española» de Sobremesa. 45 segundos cada uno."),
          ("tango", "Tango lounge", "Para Sobremesa. 45 segundos cada uno.")]
GRUPO_DE = {"piano_orar": "piano", "piano_cuerdas": "piano", "dormir": "dormir", "bossa": "cafe", "jazz_cafe": "cafe",
            "flamenco": "espanola", "guitarra_sola": "espanola", "rumba": "espanola", "tango": "tango"}
NOMBRE = {"piano_orar": "piano solo para orar", "piano_cuerdas": "piano con cuerdas suaves", "dormir": "ambiente para dormir",
          "bossa": "bossa nova", "jazz_cafe": "jazz de café", "flamenco": "flamenco tranquilo",
          "guitarra_sola": "guitarra española sola", "rumba": "rumba suave", "tango": "tango lounge"}
FORMA = {"T": "pedido con etiquetas de catálogo", "N": "pedido narrativo largo", "C": "pedido corto",
         "TG": "pedido con etiquetas, más guía y lista de lo que no tiene que sonar"}
POST = {"v0": "sin postproducción (solo volumen)", "v4": "con la imagen estéreo corregida (sonaba hueca en un parlante)"}
REFS = [{"id": "ronda1_p3", "estilo": "piano_orar", "grupo": "piano", "wav": str(R1 / "ronda1_p3.wav"),
         "origen": "El piano C de la primera ronda (le pusiste 5): Stable Audio 3, mismo decodificador de calidad. Quedó de "
                   "referencia para ver si esta vuelta sube."},
        {"id": "ronda1_c2", "estilo": "bossa", "grupo": "cafe", "wav": str(R1 / "ronda1_c2.wav"),
         "origen": "La bossa E de la primera ronda (le pusiste 6): Stable Audio 3. Quedó de referencia para ver si esta vuelta "
                   "sube."}]
LETRAS = list("GHJKLMNPQRSTUVWXYZ")
KBPS = "224k"


def lufs(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    tramo = r[r.rfind("Summary:"):]
    return float(tramo.split("I:")[1].split("LUFS")[0]), float(tramo.split("Peak:")[1].split("dBFS")[0])


def main(curado, seleccion, destino):
    sel = {c["id"]: c for c in json.load(open(seleccion))}
    cur = {json.loads(l)["id"]: json.loads(l) for l in open(curado)}   # el curado puede tener filas de candidatos que salieron
    clips = []
    for cid0, s in sel.items():
        c = cur[cid0]
        clips.append({"id": c["id"], "estilo": c["estilo"], "grupo": GRUPO_DE[c["estilo"]], "wav": c["final"],
                      "origen": f"Stable Audio 3 en la máquina de Claude, {NOMBRE[c['estilo']]}: {FORMA[s['forma']]}, "
                                f"semilla {s['seed']}, desde el segundo {c['inicio']}, {POST[c['elegida']]}. Gratis.",
                      "forma": s["forma"], "seed": s["seed"], "inicio": c["inicio"], "post": c["elegida"],
                      "post_porque": c["porque"], "prompt": s["prompt"], "cfg": s["cfg"], "sim_ref": s["sim_ref"],
                      "aes_puntaje": s["aes_puntaje"]})
    clips += REFS
    dest = Path(destino); (dest / "audio").mkdir(parents=True, exist_ok=True)
    rnd = random.Random(20261118)
    grupos_js, origen_js, corr = [], {}, []
    for gid, titulo, que in GRUPOS:
        g = [c for c in clips if c["grupo"] == gid]
        rnd.shuffle(g)
        letras = rnd.sample(LETRAS, len(g))
        lista = []
        for k, (c, letra) in enumerate(zip(g, letras), 1):
            cid = f"{gid[:2]}{k}"
            mp3 = dest / "audio" / f"{cid}.mp3"
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", c["wav"], "-t", "45", "-codec:a", "libmp3lame",
                            "-b:a", KBPS, "-ar", "48000", "-map_metadata", "-1", str(mp3)], check=True)
            i, pk = lufs(mp3)
            assert abs(i + 14) <= 0.3, (c["wav"], i)
            lista.append([cid, letra])
            origen_js[cid] = c["origen"]
            corr.append({"grupo": titulo, "letra": letra, "archivo": f"audio/{cid}.mp3", "lufs_mp3": i, "pico_mp3_dbfs": pk,
                         "bytes": mp3.stat().st_size, **{k2: v for k2, v in c.items() if k2 != "grupo"}})
        grupos_js.append({"id": gid, "titulo": titulo, "que": que, "clips": lista})
    base = Path(__file__).resolve().parents[2] / "informes" / "escucha-musica" / "index.html"
    html = base.read_text()
    a = html.index("  const GRUPOS = ["); b = html.index("  const votos = {}")
    html = html[:a] + ("  const GRUPOS = " + json.dumps(grupos_js, ensure_ascii=False, indent=1) + ";\n"
                       "  const ORIGEN = " + json.dumps(origen_js, ensure_ascii=False, indent=1) + ";\n") + html[b:]
    # los extras de la ronda 1 (pieza entera, video, dormir) salen: esta ronda es solo comparar clips
    a = html.index("    const extras = `<section><h2>Para escuchar entero</h2>")
    b = html.index('      <div><p class="chico tenue" style="margin-bottom:6px">')
    html = html[:a] + "    const extras = `<section><h2>Para cerrar</h2>\n" + html[b:]
    reemplazos = [
        ("<title>Escuchá las pruebas</title>", "<title>Escuchá las pruebas · segunda vuelta</title>"),
        ("<h1>Escuchá las pruebas</h1>", "<h1>Escuchá las pruebas · segunda vuelta</h1>"),
        ("""Música para Remanso y Sobremesa hecha hoy por Claude, por dos caminos distintos. Los clips de cada grupo están
    mezclados y con el mismo volumen, sin decir de dónde sale cada uno. Escuchalos con auriculares si podés.""",
         """Segunda vuelta de música para Remanso y Sobremesa. En cada grupo los clips están mezclados y con el mismo
    volumen, sin decir de dónde sale cada uno. Escuchalos con auriculares si podés; si tenés poco tiempo, empezá por los
    grupos que más te importan."""),
        ("db.doc(`votos/${id}`)", "db.doc(`votos2/${id}`)"),
        ("base.collection('votos')", "base.collection('votos2')"),
        ("¿Algo más que quieras decir? (qué te gustó, qué no, qué te imaginás)",
         "¿Algo más que quieras decir? (qué te gustó, qué no; nombrá el grupo y la letra)"),
    ]
    for viejo, nuevo in reemplazos:
        assert viejo in html, viejo[:40]
        html = html.replace(viejo, nuevo)
    (dest / "index.html").write_text(html)
    json.dump(corr, open(dest / "correspondencia.json", "w"), ensure_ascii=False, indent=1)
    total = sum(c["bytes"] for c in corr)
    print(f"{len(corr)} clips; audios {total / 1e6:.1f} MB; página en {dest / 'index.html'}")
    assert total < 40e6, "los audios pasan de 40 MB"


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3])
