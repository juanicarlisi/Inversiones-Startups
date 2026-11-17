"""Genera un SFZ para el contrabajo pizzicato de VSCO 2 CE (CC0).

Nombres de archivo: BKCtbss_Pizz_<nota><octava>_v<1|3>_rr<1|2>.wav, con la octava corrida
(E0 = MIDI 28, el Mi grave del contrabajo; verificado midiendo la frecuencia).
Uso: python sfz_contrabajo.py <carpeta_muestras_pizz> <salida.sfz>
"""
import os
import re
import sys

import numpy as np
import soundfile as sf

PC = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def nivel(ruta, objetivo_db=-20.0):
    """Ganancia para llevar el RMS de los primeros 400 ms de la muestra a un nivel común."""
    x, sr = sf.read(ruta, always_2d=True)
    seg = x[: int(0.4 * sr)].mean(axis=1)
    rms = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-12)
    return float(np.clip(objetivo_db - rms, -12, 30))


def main(carpeta, salida):
    muestras = {}
    for f in sorted(os.listdir(carpeta)):
        m = re.match(r"BKCtbss_Pizz_([A-G]#?)(\d)_v(\d)_rr(\d)\.wav$", f)
        if not m:
            continue
        nota, octava, v, rr = m.group(1), int(m.group(2)), int(m.group(3)), int(m.group(4))
        midi = 12 * (octava + 2) + PC[nota]
        muestras.setdefault(midi, {}).setdefault(v, {})[rr] = f
    claves = sorted(muestras)
    lineas = [f"// Contrabajo pizzicato, VSCO 2 Community Edition (CC0). Mapeo generado por sfz_contrabajo.py",
              f'<control> default_path={os.path.abspath(carpeta)}/',
              "<global> amp_veltrack=70 ampeg_attack=0.003 ampeg_release=0.25"]
    for i, k in enumerate(claves):
        lo = 21 if i == 0 else (claves[i - 1] + k) // 2 + 1
        hi = 60 if i == len(claves) - 1 else (k + claves[i + 1]) // 2
        capas = muestras[k]
        # en el grave la capa suave (v1) está ~30 dB abajo y trae ruido: se usa la fuerte (v3), mejor señal-ruido
        tramos = [(1, 127, capas[1])] if 3 not in capas else [(1, 127, capas[3])]
        for lv, hv, rrs in tramos:
            n = len(rrs)
            for pos, r in enumerate(sorted(rrs), 1):
                lineas.append(f"<region> sample={rrs[r]} lokey={lo} hikey={hi} pitch_keycenter={k} "
                              f"lovel={lv} hivel={hv} seq_length={n} seq_position={pos}"
                              + f" volume={nivel(os.path.join(carpeta, rrs[r])):.1f}")
    open(salida, "w").write("\n".join(lineas) + "\n")
    print(f"{len(claves)} notas muestreadas: {claves}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
