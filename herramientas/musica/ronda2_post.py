"""Postproducción de los clips elegidos de la ronda 2 (17-11-2026). Corre con el venv del taller (pedalboard, pyloudnorm, scipy,
noisereduce).

    python ronda2_post.py ENTRADA.wav ESTILO SALIDA_BASE --inicio 0 --dur 45

Deja tres versiones del mismo tramo, todas a -14 LUFS y pico real <= -1 dBTP, para que el oído medible decida:
  SALIDA_BASE__v0.wav  solo recorte, fundidos y master (la línea de base justa: mismo volumen)
  SALIDA_BASE__v1.wav  + limpieza: pasa-altos 28 Hz, notch de silbidos finos en el agudo (> 7 kHz) y reducción del soplido
                       del agudo (solo > 5 kHz, división de fase lineal)
  SALIDA_BASE__v2.wav  + EQ suave del estilo e imagen estéreo corregida (graves en mono, lados según la correlación L/R)
  SALIDA_BASE__v3.wav  + v2 con compresión paralela leve (café y española) y reverb por convolución acorde al estilo
La postproducción se usa solo si sube el puntaje (lo decide ronda2_curar.py).
"""
import argparse, json, os, sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

sys.path.insert(0, str(Path(__file__).parent))
import mezcla  # noqa: E402
from pedalboard import Compressor, HighShelfFilter, LowShelfFilter, PeakFilter, Pedalboard  # noqa: E402

SR = mezcla.SR
IR_DIR = Path(os.environ.get("IR_DIR", "/tmp/claude-0/-home-user/918eaeee-0db4-56e9-bb55-8ead9bee57c1/scratchpad/taller-musica/muestras/ir"))
TMP = Path(os.environ.get("R2_DIR", "/tmp/claude-0/-home-user/918eaeee-0db4-56e9-bb55-8ead9bee57c1/scratchpad/r2")) / "ir48"

# familia -> (EQ, compresión paralela (mezcla 0..1), IR, nivel de la reverb en dB, predelay ms)
FAMILIA = {
    "piano": ([PeakFilter(320, -1.5, 0.9), PeakFilter(3200, 0.8, 0.8), HighShelfFilter(9000, 0.5, 0.7)],
              0.0, "St Nicolaes Church.wav", -21.0, 18),
    "dormir": ([PeakFilter(250, -1.0, 0.8), HighShelfFilter(7000, -2.0, 0.7)],
               0.0, "Large Long Echo Hall.wav", -20.0, 30),
    "cafe": ([PeakFilter(260, -1.2, 0.9), PeakFilter(2800, 0.6, 0.9), HighShelfFilter(10000, 1.0, 0.7)],
             0.25, "French 18th Century Salon.wav", -24.0, 10),
}
ESTILO_FAMILIA = {"piano_orar": "piano", "piano_cuerdas": "piano", "dormir": "dormir", "bossa": "cafe", "jazz_cafe": "cafe",
                  "flamenco": "cafe", "guitarra_sola": "cafe", "rumba": "cafe", "tango": "cafe"}


def recorte(x, inicio, dur, fin_in=0.4, fin_out=2.5):
    a = int(inicio * SR); y = x[a:a + int(dur * SR)].copy()
    i = int(fin_in * SR); o = int(fin_out * SR)
    y[:i] *= np.sin(np.linspace(0, np.pi / 2, i))[:, None] ** 2
    y[-o:] *= np.cos(np.linspace(0, np.pi / 2, o))[:, None] ** 2
    return y


def pasa_altos(x, f=28):
    sos = signal.butter(2, f, "hp", fs=SR, output="sos")
    return signal.sosfiltfilt(sos, x, axis=0).astype(np.float32)


def limpiar_agudo(x, corte=5000, prop=0.7):
    """Reduce el soplido estacionario solo por encima de `corte` (noisereduce, modo estacionario), con división de fase
    lineal que suma exacto: bajo = FIR(x); alto = x - bajo."""
    import noisereduce as nr
    taps = signal.firwin(1023, corte, fs=SR)
    bajo = signal.fftconvolve(x, taps[:, None], mode="same", axes=0)
    alto = x - bajo
    limpio = np.stack([nr.reduce_noise(y=alto[:, c], sr=SR, stationary=True, prop_decrease=prop, n_std_thresh_stationary=1.5)
                       for c in range(2)], axis=1)
    return (bajo + limpio).astype(np.float32)


def tonos_agudos(x, desde=7000, umbral_db=9.0, tramo_s=5.0):
    """Busca silbidos: líneas finas y quietas en el agudo (artefacto del decodificador; p. ej. 7,9 y 15,8 kHz aparecen en
    muchos clips). Mira tramos de 5 s y exige que la línea siga en dos tramos seguidos (10 s): un pico de un tramo es ruido
    de la estimación."""
    from scipy.ndimage import median_filter
    m = x.mean(1); n = int(tramo_s * SR)
    proms = []
    for i in range(0, max(1, len(m) - n + 1), n):
        f, P = signal.welch(m[i:i + n], SR, nperseg=8192)
        lp = 10 * np.log10(P + 1e-20)
        proms.append(lp - median_filter(lp, size=41, mode="nearest"))
    proms = np.array(proms)
    seguido = np.minimum(proms[:-1], proms[1:]) if len(proms) > 1 else proms   # prominencia sostenida en 10 s
    pm = seguido.max(0)
    picos, _ = signal.find_peaks(pm, height=umbral_db, distance=8)
    return [(float(f[i]), float(pm[i])) for i in picos if f[i] > desde]


def quitar_tonos(x):
    tonos = sorted([t for t in tonos_agudos(x) if t[1] >= 12.0], key=lambda t: -t[1])[:6]  # solo los claros, como mucho 6
    if not tonos:
        return x, []
    y = Pedalboard([PeakFilter(fr, -min(18.0, pr), 25.0) for fr, pr in tonos])(x, SR)
    return y.astype(np.float32), [(round(fr), round(pr, 1)) for fr, pr in tonos]


def imagen(x, corte_mono=140):
    """Graves en mono; lados ajustados según la correlación L/R (muy descorrelacionado suena hueco y pierde en mono)."""
    l, r = x[:, 0], x[:, 1]
    corr = float(np.corrcoef(l, r)[0, 1])
    m = (l + r) / 2; s = (l - r) / 2
    sos = signal.butter(2, corte_mono, "hp", fs=SR, output="sos")
    s = signal.sosfiltfilt(sos, s)
    k = 0.75 if corr < 0.15 else (0.9 if corr < 0.35 else (1.15 if corr > 0.75 else 1.0))
    s *= k
    return np.stack([m + s, m - s], axis=1).astype(np.float32), corr, k


def mezclar(x, estilo, sala=True):
    eq, par, ir, nivel, pre = FAMILIA[ESTILO_FAMILIA[estilo]]
    y = Pedalboard(eq)(x, SR)
    if not sala:
        y, corr, k = imagen(y)
        return y, {"corr_antes": round(corr, 3), "lados": k}
    if par:
        c = Pedalboard([Compressor(threshold_db=-28, ratio=4, attack_ms=8, release_ms=140)])(y, SR)
        y = (y + par * c).astype(np.float32)
    TMP.mkdir(parents=True, exist_ok=True)
    irp = TMP / f"{Path(ir).stem}_{pre}.wav"
    if not irp.exists():
        mezcla.ir_preparada(str(IR_DIR / ir), str(irp), predelay_ms=pre, cola_s=3.5, hp=180, lp=6500)
    y = y + mezcla.reverb(y, str(irp), nivel)
    y, corr, k = imagen(y)
    return y, {"corr_antes": round(corr, 3), "lados": k}


def master(x):
    z, d = mezcla.master(x, lufs_obj=-14.0, techo_db=-1.0)
    return z, d


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada"); ap.add_argument("estilo"); ap.add_argument("salida")
    ap.add_argument("--inicio", type=float, default=0.0); ap.add_argument("--dur", type=float, default=45.0)
    ap.add_argument("--prop", type=float, default=0.6)
    a = ap.parse_args()
    x = mezcla.leer(a.entrada)
    info = {}
    # el procesamiento se hace sobre el clip entero (las colas de reverb y el ruido se estiman mejor) y después se recorta
    v1, info["tonos_quitados"] = quitar_tonos(pasa_altos(x))
    v1 = limpiar_agudo(v1, prop=a.prop)
    v2, info["imagen"] = mezclar(v1, a.estilo, sala=False)
    v3, _ = mezclar(v1, a.estilo, sala=True)
    for nombre, señal in (("v0", x), ("v1", v1), ("v2", v2), ("v3", v3)):
        z, d = master(recorte(señal, a.inicio, a.dur))
        sf.write(f"{a.salida}__{nombre}.wav", z, SR, subtype="PCM_24")
        info[nombre] = d
    print(json.dumps(info, ensure_ascii=False))
