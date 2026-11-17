"""Mezcla y master con pedalboard (Spotify) + pyloudnorm.

- reverb por convolución con una respuesta al impulso (IR) remuestreada a la frecuencia del proyecto
- EQ suave, compresión lenta de bus y limitador de pico real (sobremuestreo x4)
- loudness integrado objetivo (por defecto -14 LUFS, lo que normaliza YouTube) con pico real <= -1 dBTP
"""
from __future__ import annotations

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from pedalboard import Pedalboard
from scipy import signal

SR = 48000


def leer(ruta, sr=SR):
    x, s = sf.read(ruta, always_2d=True, dtype="float32")
    if s != sr:
        x = signal.resample_poly(x, sr, s, axis=0).astype(np.float32)
    if x.shape[1] == 1:
        x = np.repeat(x, 2, axis=1)
    return x


def ancho(x, lado=0.75):
    """Estrecha (lado<1) o ensancha la imagen estéreo con medio/lado."""
    m = (x[:, 0] + x[:, 1]) / 2
    s = (x[:, 0] - x[:, 1]) / 2 * lado
    return np.stack([m + s, m - s], axis=1).astype(np.float32)


def panear(x, pan):
    """pan -1 (izq) .. 1 (der), ley de potencia constante sobre la mezcla mono-compatible."""
    a = (pan + 1) * np.pi / 4
    m = x.mean(axis=1)
    return np.stack([m * np.cos(a), m * np.sin(a)], axis=1).astype(np.float32) * np.sqrt(2)


def ir_preparada(ruta_ir, destino, sr=SR, predelay_ms=0.0, cola_s=None, hp=150, lp=7000):
    ir = leer(ruta_ir, sr)
    if cola_s:
        n = int(cola_s * sr)
        ir = ir[:n]
        fade = int(0.3 * sr)
        ir[-fade:] *= np.linspace(1, 0, fade)[:, None]
    # filtrado del retorno: sin barro ni brillo metálico
    sos_hp = signal.butter(2, hp, "hp", fs=sr, output="sos")
    sos_lp = signal.butter(2, lp, "lp", fs=sr, output="sos")
    ir = signal.sosfilt(sos_lp, signal.sosfilt(sos_hp, ir, axis=0), axis=0)
    if predelay_ms:
        ir = np.concatenate([np.zeros((int(predelay_ms / 1000 * sr), 2)), ir])
    ir = ir / np.sqrt(np.sum(ir ** 2) / 2)  # energía unitaria por canal
    sf.write(destino, ir.astype(np.float32), sr, subtype="FLOAT")
    return destino


def reverb(x, ruta_ir, nivel_db, sr=SR):
    """Convolución estéreo verdadera (L->L, R->R de la IR) con scipy; la IR ya viene con energía unitaria."""
    ir, s = sf.read(ruta_ir, always_2d=True, dtype="float32")
    assert s == sr
    wet = np.stack([signal.oaconvolve(x[:, c], ir[:, c % ir.shape[1]])[: len(x)] for c in range(2)], axis=1)
    return (wet * 10 ** (nivel_db / 20)).astype(np.float32)


def limitar_true_peak(x, techo_db=-1.0, release_ms=150, lookahead_ms=2.0, hold_ms=30, sr=SR):
    """Limitador de pared con anticipación. Detecta picos sobre la señal sobremuestreada x4
    (pico real, ITU-R BS.1770) y aplica una ganancia suave que nunca supera la necesaria."""
    from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d
    c = 10 ** (techo_db / 20)
    up = signal.resample_poly(x, 4, 1, axis=0)
    det = np.max(np.abs(up), axis=1)
    n = len(x)
    det = det[: n * 4].reshape(n, 4).max(axis=1)
    req = np.minimum(1.0, c / np.maximum(det, 1e-12))
    L = max(1, int(lookahead_ms / 1000 * sr))
    a = minimum_filter1d(req, size=2 * L + 1, mode="nearest")
    g = uniform_filter1d(a, size=L + 1, mode="nearest")          # g <= req en cada muestra
    gr = maximum_filter1d(1 - g, size=int(hold_ms / 1000 * sr), mode="nearest")
    p = np.exp(-1 / (release_ms / 1000 * sr))
    gr = signal.lfilter([1 - p], [1, -p], gr)
    g = np.minimum(g, 1 - gr)
    y = (x * g[:, None]).astype(np.float32)
    tp = np.max(np.abs(signal.resample_poly(y, 4, 1, axis=0)))
    if tp > c:                                                   # resto de interpolación
        y *= c / tp
    return y


def true_peak(x):
    return 20 * np.log10(np.max(np.abs(signal.resample_poly(x, 4, 1, axis=0))) + 1e-12)


def master(x, lufs_obj=-14.0, techo_db=-1.2, sr=SR, comp=None, eq=None, informe=None):
    """Lleva x a lufs_obj integrados con pico real <= techo. Devuelve (audio, datos)."""
    cadena = Pedalboard((eq or []) + ([comp] if comp else []))
    y = cadena(x, sr) if len(cadena) else x.copy()
    m = pyln.Meter(sr)
    g = 0.0
    for _ in range(8):
        z = (y * 10 ** (g / 20)).astype(np.float32)
        antes = 20 * np.log10(np.max(np.abs(z)) + 1e-12)
        z = limitar_true_peak(z, techo_db, sr=sr)
        l = m.integrated_loudness(z)
        if abs(l - lufs_obj) < 0.05:
            break
        g += lufs_obj - l
    tp = true_peak(z)
    pre = (y * 10 ** (g / 20))
    w = int(0.01 * sr)
    n = (len(z) // w) * w
    pk_pre = np.abs(pre[:n]).max(1).reshape(-1, w).max(1)
    pk_post = np.abs(z[:n]).max(1).reshape(-1, w).max(1)
    gr = 20 * np.log10((pk_pre + 1e-9) / (pk_post + 1e-9))
    datos_gr = {"tiempo_con_limitacion_>1dB_%": round(float(np.mean(gr > 1) * 100), 2),
                "tiempo_con_limitacion_>3dB_%": round(float(np.mean(gr > 3) * 100), 2)}
    datos = {**datos_gr, "ganancia_db": round(float(g), 2), "pico_antes_limitador_dbfs": round(float(antes), 2),
             "reduccion_max_limitador_db": round(float(antes - techo_db), 2), "lufs": round(float(l), 2), "true_peak": round(float(tp), 2)}
    if informe is not None:
        informe.update(datos)
    return z, datos


def exportar(z, base, sr=SR):
    # WAV 24 bits con dither TPDF y MP3 320 kbps (ffmpeg / LAME)
    import subprocess
    lsb = 1 / (2 ** 23)
    d = (np.random.default_rng(0).random(z.shape) - np.random.default_rng(1).random(z.shape)) * lsb
    sf.write(base + ".wav", np.clip(z + d, -1, 1), sr, subtype="PCM_24")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", base + ".wav", "-codec:a", "libmp3lame",
                    "-b:a", "320k", "-ar", "48000", base + ".mp3"], check=True)
    return base + ".wav", base + ".mp3"
