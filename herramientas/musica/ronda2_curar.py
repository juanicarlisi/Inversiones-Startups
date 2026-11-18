"""Curaduría de la ronda 2: postproducción y espectrograma de los candidatos, para revisar artefactos a ojo.

    AESVENV/bin/python ronda2_curar.py puntajes.jsonl --seleccion seleccion_r2.json --salida $R2_DIR/curado   # (18-11-2026)
    AESVENV/bin/python ronda2_curar.py puntajes.jsonl --top 4 --salida $R2_DIR/curado    # modo del 17-11 (por puntaje; ya no)

Con --seleccion (lo vigente): toma los 3 por estilo y el tramo que eligió ronda2_elegir.py y decide la postproducción con
elegir_version() (solo si corrige un defecto medido). Deja $salida/curado_r2.jsonl. El modo --top del 17-11 elegía por puntaje
del evaluador y queda solo como registro: la calibración contra el oído del fundador mostró que el puntaje no predice su nota.

Corre en el venv del oído (torch + audiobox) y llama a ronda2_post.py con el venv del taller (TALLER_PY).
Deja $salida/curado.jsonl (una fila por candidato, con el puntaje de cada versión) y $salida/png/<id>.png.
"""
import argparse, json, os, subprocess, sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from ronda2_puntuar import Oido, cargar, medir  # noqa: E402

AQUI = Path(__file__).parent
TALLER_PY = os.environ.get("TALLER_PY", "/tmp/claude-0/-home-user/918eaeee-0db4-56e9-bb55-8ead9bee57c1/scratchpad/taller-musica/venv/bin/python")
DUR = 45.0
INICIOS = [0, 10, 20, 30]


def ventanas(oido, wav):
    """CE+PQ por ventana de 10 s (misma pasada que el puntaje)."""
    return oido.estetica(cargar(wav, 16000).mean(0), ventanas=True)["_ventanas"]


def mejor_inicio(vs):
    def media(ini):
        dentro = [v for t, v in vs if t >= ini and t + 10 <= ini + DUR]
        return sum(dentro) / len(dentro)
    base = media(0)
    mejor = max(INICIOS, key=media)
    return (mejor if media(mejor) > base + 0.15 else 0), round(media(mejor) - base, 3)


def espectrograma(wav, png, titulo):
    py = f"""
import numpy as np, soundfile as sf, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
x, sr = sf.read({str(wav)!r}, always_2d=True); m = x.mean(1)
fig, ax = plt.subplots(2, 1, figsize=(14, 6), gridspec_kw={{'height_ratios': [3, 1]}})
ax[0].specgram(m, NFFT=2048, Fs=sr, noverlap=1536, cmap='magma', vmin=-130, vmax=-20); ax[0].set_ylim(0, 20000)
ax[0].set_title({titulo!r}); ax[0].set_ylabel('Hz')
t = np.arange(len(m)) / sr; ax[1].plot(t[::50], x[::50, 0], lw=.3); ax[1].plot(t[::50], x[::50, 1], lw=.3, alpha=.6)
ax[1].set_xlim(0, t[-1]); ax[1].set_ylim(-1, 1); plt.tight_layout(); plt.savefig({str(png)!r}, dpi=70)
"""
    subprocess.run([TALLER_PY, "-c", py], check=True)


def elegir_version(med, master):
    """Regla del 18-11-2026 (el evaluador no predice el oído del fundador; ver ronda2_elegir.py): la postproducción entra solo
    si corrige un defecto MEDIDO y no agrega artefactos; si no, el crudo con solo recorte, fundidos y nivelación (v0).
      v1, v2 y v3: nunca. La limpieza de v1 (base de v2 y v3) agrega artefactos visibles en el espectrograma (escalón en 5 kHz,
      franjas oscuras en 11-21 kHz) y la sala de v3 se suma a la que ya trae el generador (ver ronda2_post.py).
      v4 (solo imagen estéreo sobre el crudo): si la correlación L/R es negativa (suena hueco y se cae en mono), v4 la sube y
      no agrega artefactos por señal (no suben los chasquidos más de 15 % + 5, no aparecen huecos) ni rompe un tramo para el
      evaluador (la peor ventana no baja más de 0,2: con 0,05 el ruido propio del evaluador vetaba un cambio que no agrega nada)."""
    a, b = med["v4"], med["v0"]
    if (b["corr_lr"] < 0 and a["corr_lr"] > b["corr_lr"] and a["chasquidos"] <= b["chasquidos"] * 1.15 + 5
            and a["huecos"] <= b["huecos"] and a["PQ_peor10s"] >= b["PQ_peor10s"] - 0.2):
        return "v4", "imagen estéreo corregida (corr L/R %.2f -> %.2f; pérdida en mono %.1f -> %.1f dB)" % (
            b["corr_lr"], a["corr_lr"], b["perdida_mono_db"], a["perdida_mono_db"])
    return "v0", "crudo (solo recorte, fundidos y nivelación)"


CLAVES = ("puntaje", "PQ", "CE", "CU", "PC", "PQ_peor10s", "clap_rango", "clap_top", "planitud_agudo", "corr_lr",
          "perdida_mono_db", "chasquidos", "huecos", "tono_agudo_db")


def curar_uno(oido, c, est, ini, sal):
    base = (sal / "wav" / c["id"]).resolve()   # ruta absoluta: la página se arma desde otra carpeta
    r = subprocess.run([TALLER_PY, str(AQUI / "ronda2_post.py"), c["wav"], est, str(base), "--inicio", str(ini),
                        "--dur", str(DUR)], capture_output=True, text=True, check=True)
    post = json.loads(r.stdout.strip().splitlines()[-1])
    versiones = {v: medir(oido, f"{base}__{v}.wav", est) for v in ("v0", "v4")}  # v1-v3 no se usan: no se miden
    elegida, porque = elegir_version(versiones, post)
    fin = f"{base}__{elegida}.wav"
    espectrograma(fin, sal / "png" / f"{c['id']}.png", f"{c['id']} {elegida} desde {ini} s")
    return {"id": c["id"], "estilo": est, "forma": c["forma"], "seed": c["seed"], "inicio": ini, "elegida": elegida,
            "porque": porque, "final": fin,
            "versiones": {v: {k: versiones[v].get(k) for k in CLAVES} for v in versiones}, "master": post}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("puntajes"); ap.add_argument("--top", type=int, default=4); ap.add_argument("--salida", required=True)
    ap.add_argument("--solo", default="")
    ap.add_argument("--seleccion", help="seleccion_r2.json de ronda2_elegir.py (ids e inicio); reemplaza --top")
    ap.add_argument("--redecidir", action="store_true", help="vuelve a aplicar elegir_version() a curado_r2.jsonl sin medir")
    a = ap.parse_args()
    if a.redecidir:
        sal = Path(a.salida); reg = sal / "curado_r2.jsonl"
        filas = [json.loads(l) for l in open(reg)]
        for f in filas:
            elegida, porque = elegir_version(f["versiones"], f["master"])
            if elegida != f["elegida"]:
                f["elegida"], f["porque"] = elegida, porque
                f["final"] = f["final"].rsplit("__", 1)[0] + f"__{elegida}.wav"
                espectrograma(f["final"], sal / "png" / f"{f['id']}.png", f"{f['id']} {elegida} desde {f['inicio']} s")
                print(f"{f['id']}: ahora {elegida} ({porque})")
        reg.write_text("".join(json.dumps(f, ensure_ascii=False) + "\n" for f in filas))
        sys.exit()
    sal = Path(a.salida); (sal / "png").mkdir(parents=True, exist_ok=True); (sal / "wav").mkdir(exist_ok=True)
    filas = [json.loads(l) for l in open(a.puntajes)]
    oido = Oido()
    if a.seleccion:
        reg = sal / "curado_r2.jsonl"
        hechos = {json.loads(l)["id"] for l in open(reg)} if reg.exists() else set()
        for c in json.load(open(a.seleccion)):
            if c["id"] in hechos:
                continue
            fila = curar_uno(oido, c, c["estilo"], c["inicio"], sal)
            with open(reg, "a") as f:
                f.write(json.dumps(fila, ensure_ascii=False) + "\n")
            print(f"{c['id']}: tramo {c['inicio']}s, {fila['elegida']} ({fila['porque']})", flush=True)
        sys.exit()
    hechos = set()
    reg = sal / "curado.jsonl"
    if reg.exists():
        hechos = {json.loads(l)["id"] for l in open(reg)}
    solo = set(filter(None, a.solo.split(",")))
    for est in dict.fromkeys(f["estilo"] for f in filas):
        if solo and est not in solo:
            continue
        cands = sorted([f for f in filas if f["estilo"] == est], key=lambda f: -f["puntaje"])[:a.top]
        for c in cands:
            if c["id"] in hechos:
                continue
            ini, gana = mejor_inicio(ventanas(oido, c["wav"]))
            base = sal / "wav" / c["id"]
            r = subprocess.run([TALLER_PY, str(AQUI / "ronda2_post.py"), c["wav"], est, str(base), "--inicio", str(ini),
                                "--dur", str(DUR)], capture_output=True, text=True, check=True)
            post = json.loads(r.stdout.strip().splitlines()[-1])
            versiones = {}
            for v in ("v0", "v1", "v2", "v3"):
                versiones[v] = medir(oido, f"{base}__{v}.wav", est)
            elegida = "v0"
            for v in ("v1", "v2", "v3"):  # la postproducción entra solo si sube el puntaje y no baja la calidad de producción
                if (versiones[v]["puntaje"] > versiones[elegida]["puntaje"]
                        and versiones[v]["PQ"] >= versiones["v0"]["PQ"]):
                    elegida = v
            fin = f"{base}__{elegida}.wav"
            espectrograma(fin, sal / "png" / f"{c['id']}.png", f"{c['id']} {elegida} desde {ini} s")
            fila = {"id": c["id"], "estilo": est, "forma": c["forma"], "seed": c["seed"], "crudo_puntaje": c["puntaje"],
                    "inicio": ini, "gana_tramo": gana, "elegida": elegida, "final": fin,
                    "versiones": {v: {k: versiones[v][k] for k in ("puntaje", "PQ", "CE", "CU", "PC", "PQ_peor10s",
                                                                    "clap_rango", "clap_top", "planitud_agudo", "corr_lr",
                                                                    "perdida_mono_db")} for v in versiones},
                    "master": post}
            with open(reg, "a") as f:
                f.write(json.dumps(fila, ensure_ascii=False) + "\n")
            print(f"{c['id']}: tramo {ini}s, {elegida}, " + " ".join(f"{v}={versiones[v]['puntaje']:.3f}" for v in versiones),
                  flush=True)
