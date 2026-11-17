"""Mezcla y master de «Junto a aguas de reposo».

Uso: python mezclar_aguas.py <render_crudo.wav> <ir.wav> <salida_base> [lufs]
"""
import json
import sys

import numpy as np
import pyloudnorm as pyln
from pedalboard import Compressor, HighpassFilter, HighShelfFilter, LowShelfFilter, PeakFilter, Pedalboard

import mezcla as M

NIVEL_REVERB = -14.0  # energía del retorno respecto del seco (dB)


def recortar_cola(x, sr, umbral_db=-75, fade_s=2.5):
    env = np.max(np.abs(x), axis=1)
    idx = np.where(env > 10 ** (umbral_db / 20))[0]
    fin = min(len(x), idx[-1] + int(0.5 * sr)) if len(idx) else len(x)
    x = x[:fin].copy()
    n = int(fade_s * sr)
    x[-n:] *= (np.cos(np.linspace(0, np.pi / 2, n)) ** 2)[:, None]
    return x


def main(crudo, ruta_ir, base, lufs=-14.0):
    sr = M.SR
    x = M.leer(crudo)
    # 1) nivel de trabajo (-20 LUFS) para que los umbrales signifiquen algo
    m = pyln.Meter(sr)
    x = x * 10 ** ((-20 - m.integrated_loudness(x)) / 20)
    # 2) imagen: el par AB de Salamander está muy abierto (correlación ~0,13); se cierra un poco
    x = M.ancho(x, 0.7)
    # 3) EQ del piano: limpia sub y pedal, saca un poco de caja, suma aire
    eq_seco = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=32),
        LowShelfFilter(cutoff_frequency_hz=120, gain_db=-2.0, q=0.7),
        PeakFilter(cutoff_frequency_hz=280, gain_db=-1.5, q=0.9),
        PeakFilter(cutoff_frequency_hz=3200, gain_db=1.0, q=0.7),
        HighShelfFilter(cutoff_frequency_hz=9000, gain_db=2.0, q=0.6),
    ])
    seco = eq_seco(x, sr)
    # 4) reverb de iglesia en envío (predelay 24 ms, retorno filtrado 180 Hz - 6,5 kHz)
    ir = M.ir_preparada(ruta_ir, base + "_ir48k.wav", predelay_ms=24, hp=180, lp=6500)
    cola = np.zeros((int(6 * sr), 2), dtype=np.float32)
    seco = np.concatenate([seco, cola])
    hum = M.reverb(seco, ir, nivel_db=NIVEL_REVERB)
    mix = (seco + hum[: len(seco)]).astype(np.float32)
    mix = recortar_cola(mix, sr)
    # 5) bus: compresión lenta y suave, después loudness y limitador de pico real
    comp = Compressor(threshold_db=-24, ratio=1.4, attack_ms=60, release_ms=600)
    datos = {}
    z, _ = M.master(mix, lufs_obj=lufs, comp=comp, informe=datos)
    datos["seco_vs_reverb_db"] = round(float(10 * np.log10(np.sum(seco ** 2) / np.sum(hum ** 2))), 1)
    wav, mp3 = M.exportar(z, base)
    print(json.dumps(datos), wav, mp3)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]) if len(sys.argv) > 4 else -14.0)
