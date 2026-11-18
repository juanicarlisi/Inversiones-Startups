"""Revisión a ojo de los candidatos de la ronda 2 (18-11-2026): espectrogramas compactos de a 9 por imagen y dos medidas de
silbidos del decodificador, para decidir qué va a `excluir_ojo.json` (ronda2_elegir.py --excluir).

    TALLER_PY ronda2_revisar.py CURADO_R2.jsonl SELECCION_R2.json CARPETA_PNG

Imprime por clip:
  - banda 15,6 kHz: dB de la banda 15,4-16,0 kHz sobre sus vecinas (14,4-15,2 y 16,2-17,0) y su nivel contra el total. Con la
    forma TG (guía cfg 3) apareció en 3 de 8 clips, hasta 7,4 dB sobre las vecinas a -35 dB del total (se excluyó); en las otras
    formas, de -2,4 a +2,8 dB (23 clips).
  - líneas finas (> 7 kHz, resolución 2,9 Hz): prominencia sobre la mediana local y nivel contra el total. Por debajo de unos
    -55 dB del total no se oyen.
Qué mirar en la imagen: parciales agudos que ondulan por encima de los armónicos del instrumento (metálico), franjas oscuras o
escalones que no estaban en el crudo (procesamiento), cortes de silencio y cambios bruscos de textura (anotarlos: pueden ser
música). La decisión es a ojo y se escribe con su motivo.
"""
import json, sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal
from scipy.ndimage import median_filter
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402


def banda_156(m, sr):
    fr, P = signal.welch(m, sr, nperseg=8192)
    b = lambda a, c: P[(fr >= a) & (fr < c)].sum()  # noqa: E731
    n = lambda a, c: ((fr >= a) & (fr < c)).sum()  # noqa: E731
    banda = b(15400, 16000) / n(15400, 16000)
    vec = (b(14400, 15200) + b(16200, 17000)) / (n(14400, 15200) + n(16200, 17000))
    return round(10 * np.log10(banda / vec), 1), round(10 * np.log10(b(15400, 16000) / P.sum()), 1)


def lineas(m, sr, umbral=15):
    fr, P = signal.welch(m, sr, nperseg=16384)
    lp = 10 * np.log10(P + 1e-20)
    prom = lp - median_filter(lp, size=201, mode="nearest")
    pk, _ = signal.find_peaks(np.where(fr > 7000, prom, 0), height=umbral, distance=50)
    tot = 10 * np.log10(P.sum())
    return sorted([(round(fr[i]), round(float(prom[i]), 1), round(float(10 * np.log10(P[max(0, i - 3):i + 4].sum()) - tot), 1))
                   for i in pk], key=lambda t: -t[1])[:4]


def main(curado, seleccion, carpeta):
    cur = {json.loads(l)["id"]: json.loads(l) for l in open(curado)}
    ids = [c["id"] for c in json.load(open(seleccion))]
    out = Path(carpeta); out.mkdir(parents=True, exist_ok=True)
    for k in range(0, len(ids), 9):
        grupo = ids[k:k + 9]
        fig, ax = plt.subplots(len(grupo), 1, figsize=(13, 1.9 * len(grupo)))
        for a, i in zip(np.atleast_1d(ax), grupo):
            x, sr = sf.read(cur[i]["final"], always_2d=True); m = x.mean(1)
            a.specgram(m, NFFT=2048, Fs=sr, noverlap=1024, cmap="magma", vmin=-130, vmax=-20); a.set_ylim(0, 20000)
            a.set_yticks([5000, 10000, 15000]); a.set_yticklabels(["5k", "10k", "15k"], fontsize=6)
            a.tick_params(axis="x", labelsize=6); a.set_title(Path(cur[i]["final"]).name, fontsize=7, pad=2)
            sobre, nivel = banda_156(m, sr)
            print(f"{i:28} banda 15,6 kHz {sobre:+5.1f} dB sobre vecinas, {nivel:6.1f} dB del total; líneas {lineas(m, sr)}")
        plt.tight_layout(pad=0.3); plt.savefig(out / f"revision_{k // 9 + 1}.png", dpi=55); plt.close(fig)
    print(f"imágenes en {out}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
