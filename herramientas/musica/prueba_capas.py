"""Barrido de velocidad (Do4, 8..127) para ver las costuras entre capas de muestras.
Mide por golpe: nivel pico y centroide espectral de los primeros 300 ms."""
import sys, json, numpy as np, soundfile as sf, pretty_midi
from scipy import signal
if sys.argv[1] == "midi":
    pm = pretty_midi.PrettyMIDI(); ins = pretty_midi.Instrument(0)
    for i, v in enumerate(range(8, 128, 4)):
        ins.notes.append(pretty_midi.Note(velocity=v, pitch=60, start=i * 1.5, end=i * 1.5 + 1.2))
    pm.instruments.append(ins); pm.write(sys.argv[2]); sys.exit()
x, sr = sf.read(sys.argv[2], always_2d=True); m = x.mean(1)
niv, cen = [], []
for i, v in enumerate(range(8, 128, 4)):
    s = m[int(i * 1.5 * sr): int((i * 1.5 + 0.3) * sr)]
    niv.append(20 * np.log10(np.max(np.abs(s)) + 1e-9))
    f, P = signal.welch(s, sr, nperseg=4096); cen.append(np.sum(f * P) / np.sum(P))
niv, cen = np.array(niv), np.array(cen)
rango = niv.max() - niv.min()
saltos_c = np.abs(np.diff(np.log2(cen))) * 12  # en semitonos de centroide
saltos_n = np.abs(np.diff(niv))
print(json.dumps({"lib": sys.argv[3], "rango_dinamico_db": round(rango, 1),
  "mayor_salto_nivel_db": round(saltos_n.max(), 1), "mayor_salto_centroide_st": round(saltos_c.max(), 2),
  "centroide_pp_ff_hz": [round(cen[0]), round(cen[-1])], "monotono_nivel": bool(np.all(np.diff(niv) > -0.5))}))
