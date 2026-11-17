"""Genera la grilla de la ronda 2 con Stable Audio 3 medium + SAME-L en CPU (17-11-2026).

    python ronda2_generar.py --etapa 1                 # todas las formas x 2 semillas (T, N, C con cfg 1; TG con cfg 3 y negativo)
    python ronda2_generar.py --etapa 2 --mejores m.json  # más semillas de la mejor forma de cada estilo (m.json: {estilo: forma})
    python ronda2_generar.py --solo bossa,tango        # filtra estilos

Variables: SA3_DIR (carpeta optimized/tflite de stable-audio-3), R2_DIR (salidas; por defecto el scratchpad).
Deja cada clip en $R2_DIR/gen/<estilo>__<forma>__s<semilla>.wav y una línea por clip en $R2_DIR/gen/manifiesto.jsonl.
No vuelve a generar lo que ya existe (se puede cortar y retomar).
"""
import argparse, json, os, subprocess, sys, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from ronda2_prompts import ESTILOS  # noqa: E402

SA3 = Path(os.environ.get("SA3_DIR", "/tmp/claude-0/-home-user/918eaeee-0db4-56e9-bb55-8ead9bee57c1/scratchpad/sa3/repo/optimized/tflite"))
R2 = Path(os.environ.get("R2_DIR", "/tmp/claude-0/-home-user/918eaeee-0db4-56e9-bb55-8ead9bee57c1/scratchpad/r2"))
GEN = R2 / "gen"
SEGUNDOS = 75
CFG_GUIA = 3.0


def tareas(etapa, solo, mejores):
    out = []
    for est, d in ESTILOS.items():
        if solo and est not in solo:
            continue
        if etapa == 1:
            for forma in ("T", "N", "C", "TG"):
                for seed in (101, 202):
                    out.append((est, forma, seed))
        else:
            forma = mejores[est]
            for seed in (303, 404, 505, 606, 707, 808):
                out.append((est, forma, seed))
    return out


def correr(est, forma, seed):
    d = ESTILOS[est]
    prompt = d["T" if forma == "TG" else forma]
    cfg = CFG_GUIA if forma.endswith("G") else 1.0
    dest = GEN / f"{est}__{forma}__s{seed}.wav"
    if dest.exists():
        return None
    cmd = [str(SA3 / "sa3"), "--prompt", prompt, "--dit", "medium", "--decoder", "same-l", "--seconds", str(SEGUNDOS),
           "--seed", str(seed), "--cfg", str(cfg), "--threads", "4", "--out", str(dest)]
    if cfg != 1.0:
        cmd += ["--negative-prompt", d["neg"]]
    t0 = time.time()
    r = subprocess.run(cmd, capture_output=True, text=True)
    dt = round(time.time() - t0, 1)
    fila = {"id": dest.stem, "estilo": est, "grupo": d["grupo"], "forma": forma, "seed": seed, "cfg": cfg,
            "prompt": prompt, "neg": d["neg"] if cfg != 1.0 else None, "segundos": SEGUNDOS, "wav": str(dest),
            "tiempo_s": dt, "ok": r.returncode == 0 and dest.exists()}
    if not fila["ok"]:
        fila["error"] = (r.stdout + r.stderr)[-800:]
    with open(GEN / "manifiesto.jsonl", "a") as f:
        f.write(json.dumps(fila, ensure_ascii=False) + "\n")
    return fila


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--etapa", type=int, default=1)
    ap.add_argument("--solo", default="")
    ap.add_argument("--mejores")
    a = ap.parse_args()
    GEN.mkdir(parents=True, exist_ok=True)
    mejores = json.load(open(a.mejores)) if a.mejores else {}
    lista = tareas(a.etapa, set(filter(None, a.solo.split(","))), mejores)
    for i, (est, forma, seed) in enumerate(lista, 1):
        f = correr(est, forma, seed)
        if f:
            print(f"[{i}/{len(lista)}] {f['id']} {f['tiempo_s']} s {'ok' if f['ok'] else 'ERROR'}", flush=True)
