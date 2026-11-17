"""Mezcla y master de «Tarde en Colegiales» (bossa nova, 4 pistas).

Uso: python mezclar_bossa.py <carpeta_pistas_crudas> <ir.wav> <salida_base>
"""
import json
import sys

import numpy as np
import pyloudnorm as pyln
from pedalboard import (Compressor, HighpassFilter, HighShelfFilter, LowpassFilter, LowShelfFilter, PeakFilter,
                        Pedalboard)

import mezcla as M

# nivel de cada pista (LUFS antes del bus), paneo, envío a reverb (dB) y EQ
PISTAS = {
    # piano: un solo micrófono del par AB (el par está en contrafase en el agudo y se cancela en mono)
    "piano":    dict(lufs=-20.5, canal=1, pan=-0.15, rev=-13, eq=[
        HighpassFilter(70), PeakFilter(300, -2.0, 1.0), PeakFilter(2500, 1.5, 0.8), HighShelfFilter(9000, 1.5, 0.6)]),
    "guitarra": dict(lufs=-23.5, pan=0.45, rev=-15, eq=[
        HighpassFilter(95), PeakFilter(220, -2.5, 1.0), PeakFilter(3500, 2.0, 0.9), HighShelfFilter(8000, 1.0, 0.7)]),
    "bajo":     dict(lufs=-25.0, pan=0.0, rev=-26, eq=[
        HighpassFilter(38), PeakFilter(90, 1.5, 0.9), PeakFilter(400, -2.0, 1.0), LowpassFilter(4500)]),
    "bateria":  dict(lufs=-30.0, pan=-0.32, rev=-14, eq=[
        HighpassFilter(110), PeakFilter(500, -2.0, 0.9), HighShelfFilter(7000, 2.0, 0.7)]),
}


def main(carpeta, ruta_ir, base):
    sr = M.SR
    m = pyln.Meter(sr)
    ir = M.ir_preparada(ruta_ir, base + "_ir48k.wav", predelay_ms=12, hp=200, lp=7500)
    pistas = {k: M.leer(f"{carpeta}/raw_{k}.wav") for k in PISTAS}
    n = max(len(x) for x in pistas.values()) + int(3 * sr)
    seco = np.zeros((n, 2), np.float32)
    envio = np.zeros((n, 2), np.float32)
    info = {}
    for k, cfg in PISTAS.items():
        x = pistas[k]
        if "canal" in cfg:
            x = np.repeat(x[:, cfg["canal"]:cfg["canal"] + 1], 2, axis=1)
        x = x * 10 ** ((cfg["lufs"] - m.integrated_loudness(x)) / 20)
        x = Pedalboard(cfg["eq"])(x.astype(np.float32), sr)
        x = M.panear(x, cfg["pan"])
        seco[: len(x)] += x
        envio[: len(x)] += x * 10 ** (cfg["rev"] / 20)
        info[k] = round(float(m.integrated_loudness(x)), 1)
    hum = M.reverb(envio, ir, nivel_db=0.0)
    mix = seco + hum
    # recorte de cola con fundido
    env = np.max(np.abs(mix), axis=1)
    fin = min(len(mix), np.where(env > env.max() * 10 ** (-70 / 20))[0][-1] + int(0.3 * sr))
    mix = mix[:fin]
    f = int(1.5 * sr)
    mix[-f:] *= (np.cos(np.linspace(0, np.pi / 2, f)) ** 2)[:, None]
    comp = Compressor(threshold_db=-24, ratio=2.0, attack_ms=25, release_ms=220)
    datos = {"lufs_por_pista": info}
    z, _ = M.master(mix.astype(np.float32), lufs_obj=-14.0, comp=comp, informe=datos)
    wav, mp3 = M.exportar(z, base)
    print(json.dumps(datos, ensure_ascii=False), wav, mp3)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3])
