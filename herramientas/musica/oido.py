"""Oído medible: puntúa audios con Audiobox Aesthetics (Meta, CC BY 4.0) en CPU.

Ejes (escala 1-10 aprox.): PQ calidad de producción, PC complejidad de producción, CE disfrute del contenido,
CU utilidad del contenido. Uso interno para curar; no es una nota de público.

    python oido.py a.wav b.mp3 ...            # tabla
    python oido.py --json salida.json *.wav   # además guarda JSON

Carga el audio con ffmpeg (sirve cualquier formato), lo pasa a mono 16 kHz y puntúa ventanas de 10 s (promedio ponderado,
igual que el CLI oficial). Opcional --por-ventana: muestra la ventana peor (sirve para cazar un tramo roto).
"""
import argparse, json, subprocess, sys
import numpy as np
import torch

torch.set_num_threads(4)


def cargar(path, sr=16000):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return torch.from_numpy(np.frombuffer(pcm, dtype=np.float32).copy()).unsqueeze(0)


def predictor():
    from audiobox_aesthetics.infer import initialize_predictor
    return initialize_predictor()


def puntuar(pred, paths, por_ventana=False):
    filas = []
    for p in paths:
        wav = cargar(p)
        r = pred.forward([{"path": wav, "sample_rate": 16000}])[0]
        r = json.loads(r) if isinstance(r, str) else r
        fila = {"archivo": p, **{k: round(float(v), 3) for k, v in r.items()}}
        if por_ventana:
            peor = None
            for i in range(0, wav.shape[-1] - 16000 * 5, 16000 * 10):
                seg = wav[:, i:i + 160000]
                rr = pred.forward([{"path": seg, "sample_rate": 16000}])[0]
                rr = json.loads(rr) if isinstance(rr, str) else rr
                if peor is None or rr["PQ"] < peor[1]:
                    peor = (i // 16000, round(float(rr["PQ"]), 2))
            fila["peor_ventana_PQ"] = peor
        filas.append(fila)
    return filas


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("audios", nargs="+")
    ap.add_argument("--json")
    ap.add_argument("--por-ventana", action="store_true")
    a = ap.parse_args()
    pred = predictor()
    filas = puntuar(pred, a.audios, a.por_ventana)
    for f in filas:
        extra = f"  peor10s={f['peor_ventana_PQ']}" if "peor_ventana_PQ" in f else ""
        print(f"PQ {f['PQ']:.2f}  CE {f['CE']:.2f}  CU {f['CU']:.2f}  PC {f['PC']:.2f}  {f['archivo']}{extra}")
    if a.json:
        json.dump(filas, open(a.json, "w"), indent=1, ensure_ascii=False)
