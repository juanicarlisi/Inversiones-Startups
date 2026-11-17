"""«Tarde en Colegiales» — bossa nova corta para Sobremesa (piano, contrabajo, guitarra de nylon, escobillas).

Composición original en código. Re mayor, 4/4, negra = 128. Forma: intro (4) · A (16) · A' (16) · tag final (4).
Armonía propia (no sigue la progresión de ningún estándar): Dmaj7 - Bm9 - Em9 - A13 - Dmaj7 - B7b9 - Em9 - Gm6 (iv menor)
- F#m7 - B7alt - Em9 - A13sus/A13 - Dmaj9.
Guitarra con la clave de bossa y anticipaciones, contrabajo 1-5 con notas de paso, escobillas con barrido y aro.

Uso: python componer_bossa.py <carpeta_salida>   (escribe piano.mid, bajo.mid, guitarra.mid, bateria.mid)
"""
import os
import random
import sys

from humano import MapaTempo, Nota, escribir_midi, humanizar

BPM = 128

# voicings de guitarra sin fundamental (la fundamental la toca el contrabajo)
GUIT = {
    "Dmaj7": [54, 57, 61, 64], "Dmaj9": [54, 57, 61, 64], "Bm9": [50, 54, 57, 64], "Em9": [50, 55, 59, 62],  # Bm11 y Em7: la 9na la canta la melodía
    "A13": [55, 59, 61, 66], "A13sus": [55, 59, 62, 66], "B7b9": [51, 57, 60, 66], "Gm6": [55, 58, 62, 64],
    "F#m7": [52, 57, 61, 64], "B7alt": [51, 57, 60, 67],
}
RAIZ = {"Dmaj7": 38, "Dmaj9": 38, "Bm9": 35, "Em9": 40, "A13": 33, "A13sus": 33, "B7b9": 35, "Gm6": 43,
        "F#m7": 42, "B7alt": 35}
QUINTA = {"Dmaj7": 33, "Dmaj9": 33, "Bm9": 42, "Em9": 35, "A13": 40, "A13sus": 40, "B7b9": 42, "Gm6": 38,
          "F#m7": 37, "B7alt": 33}  # en B7alt la 5ta justa chocaría con la b13 de la guitarra

A = [["Dmaj7"], ["Dmaj7"], ["Bm9"], ["Bm9"], ["Em9"], ["A13"], ["Dmaj7"], ["B7b9"],
     ["Em9"], ["Gm6"], ["F#m7"], ["B7alt"], ["Em9"], ["A13sus", "A13"], ["Dmaj9"], ["Dmaj9"]]
INTRO = [["Dmaj9"], ["Bm9"], ["Em9"], ["A13sus", "A13"]]
TAG = [["Em9"], ["A13"], ["Dmaj9"], ["Dmaj9"]]
FORMA = INTRO + A + A + TAG          # 40 compases

# melodía: (compás relativo, inicio en negras, duración, altura)
MEL_A = [
    (0, .5, .5, 69), (0, 1, 1, 73), (0, 2, 1.5, 76), (0, 3.5, .5, 78),
    (1, 0, 2.5, 78), (1, 2.5, .5, 76), (1, 3, 1, 73),
    (2, 0, 1.5, 74), (2, 1.5, .5, 73), (2, 2, 1, 69), (2, 3, 1, 66),
    (3, 0, 3, 73), (3, 3.5, .5, 71),
    (4, 0, 1, 78), (4, 1, .5, 76), (4, 1.5, 1, 74), (4, 2.5, 1.5, 71),
    (5, 0, 1.5, 73), (5, 1.5, .5, 71), (5, 2, 2, 78),
    (6, 0, 3, 76), (6, 3.5, .5, 69),
    (7, 0, 2, 72), (7, 2, 1, 71), (7, 3, 1, 69),
    (8, 0, 2.5, 67), (8, 2.5, .5, 71), (8, 3, 1, 74),
    (9, 0, 1.5, 76), (9, 1.5, .5, 74), (9, 2, 2, 70),
    (10, 0, 1, 69), (10, 1, 1, 73), (10, 2, 1.5, 76), (10, 3.5, .5, 73),
    (11, 0, 2, 75), (11, 2, 1, 72), (11, 3, 1, 67),
    (12, 0, 1.5, 66), (12, 1.5, .5, 67), (12, 2, 2, 71),
    (13, 0, 1, 74), (13, 1, 1, 71), (13, 2, 1.5, 73), (13, 3.5, .5, 69),
    (14, 0, 1.5, 73), (14, 1.5, 2.5, 69),
]
# segunda vuelta: igual hasta el compás 8, después una variación propia
MEL_A2 = [n for n in MEL_A if n[0] < 8] + [
    (8, 0, 1, 71), (8, 1, 1, 74), (8, 2, 1.5, 78), (8, 3.5, .5, 76),
    (9, 0, 1, 76), (9, 1, 1, 74), (9, 2, 1, 70), (9, 3, 1, 67),
    (10, 0, 1.5, 69), (10, 1.5, .5, 73), (10, 2, 1, 76), (10, 3, 1, 81),
    (11, 0, 1.5, 79), (11, 1.5, .5, 75), (11, 2, 2, 72),
    (12, 0, 1, 71), (12, 1, 1, 76), (12, 2, 2, 78),
    (13, 0, 1, 76), (13, 1, 1, 74), (13, 2, 1, 73), (13, 3, 1, 71),
    (14, 0, 1, 73), (14, 1, 3, 69),
]
MEL_TAG = [(0, 0, 1, 71), (0, 1, 1, 74), (0, 2, 2, 78), (1, 0, 1, 76), (1, 1, 1, 73), (1, 2, 2, 78),
           (2, 0, 6, 76)]

# clave de guitarra en corcheas, ciclo de 2 compases; la última corchea anticipa el acorde siguiente
CLAVE_GUIT = [(0, [0, 3, 5]), (1, [2, 5, 7])]
CLAVE_ARO = [0, 3, 6, 10, 13]  # clave de bossa en 16 corcheas (2 compases)


def acorde_en(compas, beat):
    acs = FORMA[compas]
    return acs[0] if len(acs) == 1 or beat < 2 else acs[1]


def construir(semilla=5):
    rnd = random.Random(semilla)
    piano, bajo, guit, bat = [], [], [], []
    n_c = len(FORMA)
    for c in range(n_c):
        b0 = c * 4.0
        intro = c < 4
        final = c >= n_c - 2
        # ---------------- contrabajo: 1 y 3 con notas de paso
        r = RAIZ[acorde_en(c, 0)]
        q = QUINTA[acorde_en(c, 2)] if len(FORMA[c]) == 1 else RAIZ[acorde_en(c, 2)]
        if final and c == n_c - 1:
            bajo.append(Nota(b0, 4, RAIZ["Dmaj9"], 70, "bajo"))
        else:
            bajo.append(Nota(b0, 1.4, r, 84 + rnd.randint(-3, 3), "bajo", adelanto_ms=-20))
            bajo.append(Nota(b0 + 1.5, 0.45, r, 62, "bajo", adelanto_ms=-20))
            bajo.append(Nota(b0 + 2, 1.4, q, 76 + rnd.randint(-3, 3), "bajo", adelanto_ms=-20))
            if c + 1 < n_c:
                sig = RAIZ[acorde_en(c + 1, 0)]
                paso = sig + (1 if rnd.random() < 0.5 else -1)   # aproximación cromática
                if c % 2 == 1:
                    bajo.append(Nota(b0 + 3.5, 0.45, paso, 60, "bajo", adelanto_ms=-20))
        # ---------------- guitarra
        if not (c == n_c - 1):
            for k in CLAVE_GUIT[c % 2][1]:
                beat = k * 0.5
                cc, bb = (c + 1, 0) if (k == 7 and c + 1 < n_c) else (c, beat)
                voic = GUIT[acorde_en(cc, bb)]
                siguiente = [x * 0.5 for x in CLAVE_GUIT[c % 2][1] if x > k]
                dur = min((siguiente[0] - beat) if siguiente else 4 - beat + 0.5, 1.2) - 0.08
                if len(FORMA[c]) == 2 and beat < 2:
                    dur = min(dur, 2 - beat - 0.05)   # no se pisa el cambio de acorde
                acento = 6 if k in (0, 3) else 0
                for j, p in enumerate(voic):
                    guit.append(Nota(b0 + beat, dur, p, 50 + acento - j + rnd.randint(-3, 3), "acomp",
                                     adelanto_ms=-6 + 9 * j))
        else:
            for j, p in enumerate([38, 45] + GUIT["Dmaj9"] + [69]):
                guit.append(Nota(b0, 6, p, 52 - j, "acomp", adelanto_ms=28 * j))
        # ---------------- escobillas
        if c < n_c - 1:
            for e in range(8):
                acc = [44, 26, 34, 28, 40, 26, 36, 30][e]
                if intro and c < 2:
                    acc -= 8
                bat.append(Nota(b0 + e * 0.5, 0.25, 38, acc + rnd.randint(-4, 4), "acomp"))
            for e in (0, 2):
                bat.append(Nota(b0 + e, 1.0, 40, 30 + rnd.randint(-3, 3), "acomp"))
            for pos in CLAVE_ARO:
                if pos // 8 == c % 2 and not (intro and c < 2):
                    bat.append(Nota(b0 + (pos % 8) * 0.5, 0.2, 37, 46 + rnd.randint(-4, 4), "acomp"))
            for e, v in ((0, 42), (1.5, 30), (2, 36), (3.5, 28)):
                bat.append(Nota(b0 + e, 0.3, 36, v + rnd.randint(-3, 3), "bajo"))
            for e in (1, 3):
                bat.append(Nota(b0 + e, 0.2, 44, 34 + rnd.randint(-3, 3), "acomp"))
        else:
            bat.append(Nota(b0, 2, 40, 34, "acomp"))
    # ---------------- piano: melodía (con terceras o sextas en notas largas de la segunda vuelta)
    def poner(mel, desde, segunda=False):
        for (cr, bi, d, p) in mel:
            c = desde + cr
            vel = 64 + (p - 72) * 0.6 + (4 if bi % 1 == 0.5 else 0) + rnd.uniform(-3, 3)  # síncopas un poco acentuadas
            piano.append(Nota(c * 4 + bi, d * 0.92, p, vel, "melodia", adelanto_ms=8))
            if segunda and d >= 1.5:
                voic = GUIT[acorde_en(c, bi)]
                pcs = {x % 12 for x in voic} | {RAIZ[acorde_en(c, bi)] % 12}
                cand = [x for x in range(p - 9, p - 2) if x % 12 in pcs]
                if cand:
                    piano.append(Nota(c * 4 + bi, d * 0.9, max(cand), vel * 0.68, "interna", adelanto_ms=12))
    poner(MEL_A, 4)
    poner(MEL_A2, 20, segunda=True)
    poner(MEL_TAG, 36)
    return piano, bajo, guit, bat, n_c * 4


def main(carpeta):
    os.makedirs(carpeta, exist_ok=True)
    piano, bajo, guit, bat, total = construir()
    pts = [(0, BPM), (total - 8, BPM), (total - 4, BPM * 0.9), (total, BPM * 0.75)]
    tempo = MapaTempo(pts)
    jit = {"melodia": 9, "interna": 9, "acomp": 6, "bajo": 5}
    partes = {"piano": (piano, 0, False), "bajo": (bajo, 32, False), "guitarra": (guit, 24, False),
              "bateria": (bat, 40, True)}
    for i, (nombre, (notas, prog, drum)) in enumerate(partes.items()):
        ev = humanizar(notas, tempo, semilla=11 + i, jitter_ms=jit)
        assert all(21 <= e[2] <= 108 for e in ev)
        pedal = []
        if nombre == "piano":
            # pedal corto por compás (bossa: piano más seco que en la pieza de oración)
            for c in range(total // 4):
                t = tempo.seg(c * 4)
                pedal += [(t + 0.02, 0), (t + 0.08, 127)]
            pedal.append((tempo.seg(total) + 4, 0))
        escribir_midi(ev, pedal, os.path.join(carpeta, f"{nombre}.mid"), programa=prog, nombre=nombre, es_bateria=drum)
    print(f"compases={total // 4} duración={tempo.seg(total):.1f}s")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "bossa")
