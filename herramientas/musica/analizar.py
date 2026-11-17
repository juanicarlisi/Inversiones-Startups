"""Mide un audio: loudness (LUFS), pico real, clips, piso de ruido, rango dinámico, centroide,
balance de bandas, correlación estéreo y espectrograma.

Uso: python analizar.py archivo.wav [--png espectrograma.png]
"""
import argparse
import json

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import signal


def true_peak_db(x, sr):
    up = signal.resample_poly(x, 4, 1, axis=0)
    return 20 * np.log10(np.max(np.abs(up)) + 1e-12)


def medir(ruta, png=None, titulo=None):
    x, sr = sf.read(ruta, always_2d=True)
    x = x.astype(np.float64)
    mono = x.mean(axis=1)
    m = pyln.Meter(sr)
    lufs = m.integrated_loudness(x)
    pico = 20 * np.log10(np.max(np.abs(x)) + 1e-12)
    tp = true_peak_db(x, sr)
    clips = int(np.sum(np.abs(x) >= 0.999))
    # ventanas de 400 ms para rango de sonoridad (aprox. LRA) y piso de ruido
    w = int(0.4 * sr)
    hop = w // 4
    rms = []
    for i in range(0, len(mono) - w, hop):
        seg = mono[i:i + w]
        rms.append(20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-12))
    rms = np.array(rms)
    activo = rms[rms > np.max(rms) - 60]
    lra = float(np.percentile(activo, 95) - np.percentile(activo, 10))
    piso = float(np.percentile(rms, 1))
    # bandas de energía
    f, P = signal.welch(mono, sr, nperseg=8192)
    def banda(a, b):
        sel = (f >= a) & (f < b)
        return 10 * np.log10(np.sum(P[sel]) + 1e-20)
    total = 10 * np.log10(np.sum(P) + 1e-20)
    bandas = {k: round(banda(a, b) - total, 1) for k, (a, b) in {
        "sub<40": (0, 40), "graves 40-250": (40, 250), "medios 250-2k": (250, 2000),
        "presencia 2-6k": (2000, 6000), "aire 6-16k": (6000, 16000), ">16k": (16000, sr / 2)}.items()}
    centroide = float(np.sum(f * P) / np.sum(P))
    mono_l = m.integrated_loudness(np.stack([mono, mono], axis=1))
    perdida_mono = lufs - mono_l
    corr = float(np.corrcoef(x[:, 0], x[:, 1])[0, 1]) if x.shape[1] == 2 else 1.0
    # saltos de muestra a muestra grandes. En piano solo, >0 indica clics. Con escobillas o percusión cuenta
    # transitorios legítimos (en la bossa da ~840 y no son clics): para buscar clics, medir cada pista cruda.
    d = np.abs(np.diff(mono))
    umbral = 12 * np.median(d[d > 0]) if np.any(d > 0) else 1
    clicks = int(np.sum(d > max(umbral, 0.2)))
    res = dict(archivo=ruta, sr=sr, dur_s=round(len(mono) / sr, 1), lufs=round(lufs, 2), pico_dbfs=round(pico, 2),
               true_peak_dbtp=round(tp, 2), clips=clips, rango_sonoridad_db=round(lra, 1),
               piso_ruido_dbfs=round(piso, 1), centroide_hz=round(centroide), correlacion_LR=round(corr, 3), perdida_al_sumar_mono_db=round(float(perdida_mono), 2),
               bandas_db_rel=bandas, saltos_bruscos=clicks)
    if png:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        fig, ax = plt.subplots(2, 1, figsize=(14, 7), gridspec_kw={"height_ratios": [3, 1]})
        ff, tt, S = signal.spectrogram(mono, sr, nperseg=4096, noverlap=3072)
        ax[0].pcolormesh(tt, ff, 10 * np.log10(S + 1e-14), shading="auto", vmin=-140, vmax=-40, cmap="magma")
        ax[0].set_yscale("symlog", linthresh=200)
        ax[0].set_ylim(30, sr / 2)
        ax[0].set_ylabel("Hz")
        ax[0].set_title(titulo or ruta)
        tr = np.arange(len(rms)) * hop / sr
        ax[1].plot(tr, rms, lw=0.6)
        ax[1].set_ylabel("RMS 400 ms (dBFS)")
        ax[1].set_xlabel("s")
        ax[1].set_ylim(-80, 0)
        fig.tight_layout()
        fig.savefig(png, dpi=90)
        plt.close(fig)
    return res


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("archivos", nargs="+")
    ap.add_argument("--png", action="store_true")
    a = ap.parse_args()
    for r in a.archivos:
        print(json.dumps(medir(r, r.rsplit(".", 1)[0] + "_espectro.png" if a.png else None), ensure_ascii=False))
