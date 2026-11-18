"""Curaduría de la ronda 2 (17-11-2026): de todo lo generado, los finalistas por estilo, su mejor tramo de 45 s, la
postproducción que sube el puntaje (o ninguna) y el espectrograma para revisar artefactos a ojo.

    AESVENV/bin/python ronda2_curar.py puntajes.jsonl --top 4 --salida $R2_DIR/curado

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


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("puntajes"); ap.add_argument("--top", type=int, default=4); ap.add_argument("--salida", required=True)
    ap.add_argument("--solo", default="")
    a = ap.parse_args()
    sal = Path(a.salida); (sal / "png").mkdir(parents=True, exist_ok=True); (sal / "wav").mkdir(exist_ok=True)
    filas = [json.loads(l) for l in open(a.puntajes)]
    hechos = set()
    reg = sal / "curado.jsonl"
    if reg.exists():
        hechos = {json.loads(l)["id"] for l in open(reg)}
    oido = Oido()
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
