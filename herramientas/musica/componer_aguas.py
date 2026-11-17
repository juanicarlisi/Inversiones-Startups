"""«Junto a aguas de reposo» — piano solo para orar (Remanso / Aguas de Reposo).

Composición original escrita en código. Re bemol mayor, 4/4, negra ~58 con rubato.
Forma: Introducción (4) · A (8+8) · B desarrollo (12) · A' regreso (12) · Coda (4) = 48 compases.

Técnicas: acordes de séptima y novena en voicings abiertos, bajo que camina por grados
conjuntos (Db - C - Bb - Gb - Eb), intercambio modal (iv menor: Gbm6, el «amén» de la pieza),
dominante secundaria (F7 -> Bbm), cadencia rota (Ab7sus -> Bbm9) antes de la coda y cadencia
plagal menor al final. Melodía cantable por grados con pocos saltos, frases de 4 compases.

Uso:  python componer_aguas.py salida.mid
"""
import math
import sys

from humano import MapaTempo, Nota, escribir_midi, humanizar

# ---------------------------------------------------------------- acordes (voicing mano izquierda)
# Primer número = bajo. Alturas MIDI (C4 = 60). Clases de altura para las voces internas.
ACORDES = {
    "Db9":        ([37, 44, 48, 51, 56], {1, 5, 8, 0, 3}),   # 7ma mayor abajo: nunca novena menor contra la tónica
    "Ab/C":       ([36, 44, 51, 56, 60], {8, 0, 3}),
    "Bbm9":       ([34, 41, 48, 53, 56], {10, 1, 5, 8, 0}),
    "Gbmaj7":     ([42, 49, 53, 58, 61], {6, 10, 1, 5}),
    "Gbmaj9":     ([42, 49, 53, 56, 58], {6, 10, 1, 5, 8}),
    "Ebm9":       ([39, 46, 49, 54, 58], {3, 6, 10, 1, 5}),   # la 9na la canta la melodía
    "Ab7sus":     ([32, 44, 51, 54, 61], {8, 1, 3, 6}),
    "Ab7":        ([32, 44, 51, 54, 60], {8, 0, 3, 6}),
    "Ab13sus":    ([32, 44, 54, 61, 65], {8, 1, 3, 6, 5}),
    "Ab13":       ([32, 44, 54, 60, 65], {8, 0, 3, 6, 5}),
    "Db/F":       ([41, 49, 56, 60], {1, 5, 8, 0}),
    "Absus":      ([44, 51, 56, 61], {8, 1, 3}),
    "Ab":         ([44, 51, 56, 60], {8, 0, 3}),
    "Gbm6":       ([42, 49, 51, 57], {6, 9, 1, 3}),
    "F7sus":      ([41, 48, 51, 58], {5, 10, 0, 3}),
    "F7":         ([41, 48, 51, 57], {5, 9, 0, 3}),
    "Bbm/Ab":     ([44, 49, 53, 58], {8, 10, 1, 5}),
    "Fm7":        ([41, 48, 51, 56], {5, 8, 0, 3}),
    "Bbm7":       ([34, 41, 49, 56], {10, 1, 5, 8}),
    "Gbmaj9/Db":  ([37, 46, 53, 54, 56], {6, 10, 1, 5, 8}),
    "Gbm6/Db":    ([37, 45, 49, 51, 54], {6, 9, 1, 3}),
    "Gbmaj9alto": ([30, 42, 49, 53, 56, 58], {6, 10, 1, 5, 8}),
}

Db4, Eb4, F4, Gb4, Ab4, A4, Bb4, C5 = 61, 63, 65, 66, 68, 69, 70, 72
Db5, Eb5, F5, Gb5, Ab5, A5, Bb5, C6, Db6 = 73, 75, 77, 78, 80, 81, 82, 84, 85
R = None  # silencio

# ---------------------------------------------------------------- la pieza, compás por compás
# (sección, [(acorde, negras)], [(negras, altura)], estilo de acompañamiento)
P = [
    # Introducción: la mano izquierda sola, después un eco del tema en el agudo
    ("intro", [("Db9", 4)],                     [(4, R)],                                 "lento"),
    ("intro", [("Gbmaj9/Db", 4)],               [(2, R), (1, Bb5), (1, Ab5)],             "lento"),
    ("intro", [("Bbm9", 4)],                    [(3, F5), (1, R)],                        "lento"),
    ("intro", [("Ab13sus", 4)],                 [(4, Eb5)],                               "lento"),
    # A: el tema (pregunta)
    ("A", [("Db9", 4)],                         [(2, F5), (1, Eb5), (1, Db5)],            "ola"),
    ("A", [("Ab/C", 4)],                        [(1.5, C5), (0.5, Db5), (2, Eb5)],        "ola"),
    ("A", [("Bbm9", 4)],                        [(1, Db5), (1, C5), (1, Bb4), (1, C5)],   "ola"),
    ("A", [("Gbmaj7", 4)],                      [(3, Bb4), (1, Ab4)],                     "ola"),
    ("A", [("Ebm9", 4)],                        [(1, Gb4), (1, Bb4), (1.5, Eb5), (0.5, Db5)], "ola"),
    ("A", [("Ab7sus", 2), ("Ab7", 2)],          [(2, Db5), (2, C5)],                      "ola"),
    ("A", [("Db/F", 2), ("Gbmaj7", 2)],         [(1, Ab4), (1, Bb4), (1, Db5), (1, F5)],  "ola"),
    ("A", [("Absus", 2), ("Ab", 2)],            [(3, Eb5), (1, R)],                       "ola"),
    # A: el tema (respuesta, con el iv menor)
    ("A2", [("Db9", 4)],                        [(2, F5), (1, Eb5), (1, Db5)],            "ola2"),
    ("A2", [("Ab/C", 4)],                       [(1.5, C5), (0.5, Db5), (1, Eb5), (1, Ab5)], "ola2"),
    ("A2", [("Bbm9", 4)],                       [(1.5, Ab5), (0.5, Gb5), (1, F5), (1, Db5)], "ola2"),
    ("A2", [("Gbmaj7", 4)],                     [(2, F5), (1, Eb5), (1, Db5)],            "ola2"),
    ("A2", [("Gbm6", 4)],                       [(1, Eb5), (1, Db5), (2, A4)],            "ola2"),
    ("A2", [("Db/F", 4)],                       [(2, Ab4), (1, Bb4), (1, C5)],            "ola2"),
    ("A2", [("Ebm9", 2), ("Ab7sus", 2)],        [(1, Gb5), (1, F5), (1.5, Eb5), (0.5, Db5)], "ola2"),
    ("A2", [("Db9", 4)],                        [(3, Db5), (1, R)],                       "ola2"),
    # B: desarrollo, hacia el relativo menor y la cima
    ("B", [("Bbm9", 4)],                        [(1, F4), (1, Ab4), (2, C5)],             "ancho"),
    ("B", [("Gbmaj9", 4)],                      [(1, Bb4), (1, Ab4), (2, F4)],            "ancho"),
    ("B", [("Ebm9", 4)],                        [(1, Gb4), (1, Bb4), (1, Db5), (1, F5)],  "ancho"),
    ("B", [("F7sus", 2), ("F7", 2)],            [(2, Eb5), (1, C5), (1, A4)],             "ancho"),
    ("B", [("Bbm9", 2), ("Bbm/Ab", 2)],         [(1, Bb4), (1, C5), (1, Db5), (1, F5)],   "ancho"),
    ("B", [("Gbmaj7", 4)],                      [(2, Bb5), (1, Ab5), (1, F5)],            "ancho"),
    ("B", [("Fm7", 2), ("Bbm7", 2)],            [(1.5, Ab5), (0.5, Gb5), (1, F5), (1, Db5)], "ancho"),
    ("B", [("Ebm9", 2), ("Ab13", 2)],           [(2, Gb5), (2, F5)],                      "ancho"),
    ("cima", [("Gbmaj9alto", 4)],               [(1, Bb5), (1, C6), (2, Db6)],            "bloque"),
    ("cima", [("Fm7", 2), ("Bbm9", 2)],         [(1.5, C6), (0.5, Bb5), (2, Ab5)],        "bloque"),
    ("B", [("Gbm6", 4)],                        [(2, A5), (1, Gb5), (1, Eb5)],            "ancho"),
    ("B", [("Ab13sus", 2), ("Ab7", 2)],         [(2, F5), (1, Eb5), (1, C5)],             "ancho"),
    # A': regreso, más quieto, con voz interna
    ("A3", [("Db9", 4)],                        [(2, F5), (1, Eb5), (1, Db5)],            "ola3"),
    ("A3", [("Ab/C", 4)],                       [(1.5, C5), (0.5, Db5), (2, Eb5)],        "ola3"),
    ("A3", [("Bbm9", 4)],                       [(1, Db5), (1, C5), (1, Bb4), (1, C5)],   "ola3"),
    ("A3", [("Gbmaj7", 4)],                     [(3, Bb4), (1, Ab4)],                     "ola3"),
    ("A3", [("Ebm9", 4)],                       [(1, Gb4), (1, Bb4), (1.5, Eb5), (0.5, Db5)], "ola3"),
    ("A3", [("Ab7sus", 2), ("Ab7", 2)],         [(2, Db5), (2, C5)],                      "ola3"),
    ("A3", [("Db/F", 2), ("Gbmaj7", 2)],        [(1, Ab4), (1, Bb4), (1, Db5), (1, F5)],  "ola3"),
    ("A3", [("Gbm6", 4)],                       [(2, Eb5), (1, Db5), (1, A4)],            "ola3"),
    ("A3", [("Db/F", 2), ("Bbm9", 2)],          [(2, Ab4), (1, Bb4), (1, C5)],            "ola3"),
    ("A3", [("Ebm9", 2), ("Ab7sus", 2)],        [(1, Gb5), (1, F5), (1.5, Eb5), (0.5, Db5)], "ola3"),
    ("A3", [("Bbm9", 4)],                       [(4, Db5)],                               "ola3"),   # cadencia rota
    ("A3", [("Gbmaj9", 4)],                     [(1, Bb4), (1, Db5), (2, F5)],            "ola3"),
    # Coda: plagal mayor -> plagal menor -> tónica
    ("coda", [("Gbmaj9/Db", 4)],                [(2, Bb4), (2, Ab4)],                     "rodado"),
    ("coda", [("Gbm6/Db", 4)],                  [(2, A4), (2, Ab4)],                      "rodado"),
    ("coda", [("Db9", 4)],                      [(4, Db5)],                               "rodado"),
    ("coda", [("Db9", 4)],                      [(0.5, R), (0.5, F5), (0.5, Ab5), (0.5, C6), (2, 87)], "final"),
]

# Dinámica base de cada sección (velocidad MIDI de la melodía)
DIN = {"intro": 38, "A": 45, "A2": 52, "B": 58, "cima": 82, "A3": 43, "coda": 35}
ACOMP_REL = {"intro": 0.80, "A": 0.70, "A2": 0.72, "B": 0.74, "cima": 0.72, "A3": 0.66, "coda": 0.75}

# Permutaciones de arpegio (índices sobre el voicing): se alternan para no sonar a máquina
PERM = {
    "ola":  [[0, 1, 2, 3, 4, 3, 2, 1], [0, 1, 2, 3, 4, 2, 3, 1]],
    "ola2": [[0, 2, 1, 3, 2, 4, 3, 1], [0, 1, 2, 3, 4, 3, 2, 1]],
    "ola3": [[0, 1, 2, 3, 4, 3, 2, 1], [0, 2, 1, 3, 4, 3, 1, 2]],
    "ancho": [[0, 1, 2, 3, 4, 5, 4, 2], [0, 2, 3, 4, 5, 4, 3, 1]],
}


def arpegio(voicing, estilo, n_compas):
    """Voicing ampliado: en 'ancho' se suma una octava arriba de la segunda nota."""
    v = list(voicing)
    if estilo == "ancho":
        extra = v[2] + 12
        v = v + [extra] if extra not in v else v + [v[-1] + 12]
        v = sorted(v)
    return v


def construir():
    notas: list[Nota] = []
    cambios: list[float] = []   # beats donde cambia la armonía (pedal)
    beat0 = 0.0
    ultimo_melodia = None
    for i, (sec, acordes, mel, estilo) in enumerate(P):
        base = DIN[sec]
        rel = ACOMP_REL[sec]
        frase_x = (i % 4) / 4.0  # posición en la frase de 4 compases

        # ---------------- acompañamiento
        b = beat0
        for k, (nom, dur) in enumerate(acordes):
            voicing, _ = ACORDES[nom]
            cambios.append(b)
            va = base * rel
            if estilo in ("lento",):
                # arpegio subiendo en corcheas, la última nota queda
                for j, p in enumerate(voicing):
                    vel = va + (6 if j == 0 else -j * 1.5)
                    notas.append(Nota(b + j * 0.5, dur - j * 0.5, p, vel, "bajo" if j == 0 else "acomp"))
            elif estilo == "ola3":
                # regreso: negras, el bajo queda y la mano izquierda respira
                figura = [[0], [2], [3, 4], [1]] if dur == 4 else [[0], [2, 3]]
                for j, grupo in enumerate(figura):
                    for g in grupo:
                        p = voicing[g % len(voicing)]
                        vel = va + (6 if j == 0 else -2 - 1.5 * (j == 3))
                        notas.append(Nota(b + j, dur if j == 0 else dur - j, p, vel,
                                          "bajo" if j == 0 else "acomp", adelanto_ms=14 * (g - grupo[0])))
            elif estilo in ("ola", "ola2", "ancho"):
                v = arpegio(voicing, estilo, i)
                perm = PERM[estilo][(i + k) % 2]
                pasos = int(dur * 2)
                for j in range(pasos):
                    idx = perm[j % len(perm)] % len(v)
                    p = v[idx]
                    # forma dentro del compás: el bajo apoya, la ola sube y baja
                    forma = 4 * math.sin(math.pi * (j + 0.5) / pasos)
                    vel = va + (4 if j == 0 else forma - 3)
                    durn = dur if j == 0 else min(0.5 + (pasos - j) * 0.25, dur - j * 0.5)
                    notas.append(Nota(b + j * 0.5, durn, p, vel, "bajo" if j == 0 else "acomp"))
            elif estilo == "bloque":
                # cima: bajo en octavas, acorde rodado y pulso de corcheas en el centro
                bajo = voicing[0]
                notas.append(Nota(b, dur, bajo, va + 10, "bajo"))
                notas.append(Nota(b, dur, bajo + 12, va + 4, "bajo"))
                for j, p in enumerate(voicing[1:]):
                    notas.append(Nota(b, dur, p + 12 if p < 50 else p, va - 2, "acomp", adelanto_ms=18 * j))
                for j in range(2, int(dur * 2)):
                    p = voicing[2 + (j % (len(voicing) - 2))]
                    notas.append(Nota(b + j * 0.5, 0.5, p, va - 6, "acomp"))
            elif estilo in ("rodado", "final"):
                for j, p in enumerate(voicing):
                    notas.append(Nota(b, dur + (8 if estilo == "final" else 0), p, va - j * 1.2,
                                      "bajo" if j == 0 else "acomp", adelanto_ms=-60 + 32 * j))
            b += dur

        # ---------------- melodía (y voz interna en A2, B, A3)
        b = beat0
        for d, p in mel:
            if p is not None:
                # arco de frase + altura + apoyos
                arco = 7 * math.sin(math.pi * min(1.0, frase_x + (b - beat0) / 16 + 0.08))
                vel = base + arco + 0.35 * (p - 75) + (2 if (b % 2) == 0 else -1)
                if estilo == "final":
                    vel = base - 6
                durm = d + (8 if estilo == "final" else 0)
                notas.append(Nota(b, durm, p, vel, "melodia", adelanto_ms=-14))
                # voz interna: tercera o sexta debajo, con nota del acorde vigente
                if sec in ("A2", "B", "cima", "A3") and d >= 2:
                    pcs = acorde_en(acordes, b - beat0)
                    cand = [q for q in range(p - 9, p - 2) if q % 12 in pcs and q >= 58]
                    if cand:
                        q = max(cand)
                        notas.append(Nota(b + (0.5 if sec == "A3" else 0), d - (0.5 if sec == "A3" else 0),
                                          q, vel * 0.6, "interna"))
                ultimo_melodia = p
            b += d
        beat0 += sum(d for _, d in acordes)
    return notas, cambios, beat0


def acorde_en(acordes, off):
    t = 0
    for nom, d in acordes:
        if t <= off < t + d:
            return ACORDES[nom][1]
        t += d
    return ACORDES[acordes[-1][0]][1]


def mapa_tempo(total_beats):
    pts = []
    base_sec = {"intro": 54, "A": 58, "A2": 59, "B": 60, "cima": 61, "A3": 56, "coda": 52}
    for i, (sec, *_rest) in enumerate(P):
        b = i * 4
        base = base_sec[sec]
        x = i % 4
        # cada frase de 4 compases se mueve un poco hacia el centro y respira al final
        if x == 0:
            pts.append((b, base * 0.97))
        elif x == 2:
            pts.append((b, base * 1.025))
        elif x == 3:
            pts.append((b + 2, base * 1.0))
            pts.append((b + 3.6, base * 0.93))
    # ritardandi de sección
    pts += [(15.9, 49), (47.85, 52), (79.85, 52), (127.85, 46), (171.85, 47), (184, 47), (188, 43), (192, 36)]
    pts = sorted({round(b, 3): v for b, v in pts}.items())
    return MapaTempo(pts)


def pedal(cambios, tempo, fin_beats):
    ev = [(0.0, 0)]
    for c in cambios:
        t = tempo.seg(c)
        ev.append((t + 0.03, 0))     # se suelta justo después del nuevo ataque (pedal legato)
        ev.append((t + 0.11, 127))   # y se vuelve a pisar
    ev.append((tempo.seg(fin_beats) + 7.0, 0))
    return ev


def main(ruta):
    notas, cambios, total = construir()
    tempo = mapa_tempo(total)
    eventos = humanizar(notas, tempo, semilla=23)
    # nada fuera del registro del piano (A0 = 21, C8 = 108)
    assert all(21 <= e[2] <= 108 for e in eventos)
    pm = escribir_midi(eventos, pedal(cambios, tempo, total), ruta, nombre="Piano")
    dur = tempo.seg(total)
    print(f"compases={len(P)}  notas={len(eventos)}  duración tocada={dur:.1f}s  con cola={pm.get_end_time():.1f}s")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "aguas.mid")
