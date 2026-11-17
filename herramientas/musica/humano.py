"""Utilidades comunes: mapa de tempo con rubato, humanizacion y escritura de MIDI.

Todo se escribe en segundos absolutos (pretty_midi), asi el rubato queda "horneado"
en el MIDI y cualquier sintetizador (sfizz, FluidSynth) lo reproduce igual.
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field

import pretty_midi


@dataclass
class Nota:
    beat: float          # inicio en negras desde el comienzo
    dur: float           # duracion en negras
    pitch: int
    vel: float           # 0-127 (antes de humanizar)
    voz: str = "acomp"   # melodia | interna | acomp | bajo
    adelanto_ms: float = 0.0  # desplazamiento deliberado (melodia adelantada, arpegiado)


@dataclass
class MapaTempo:
    """Tempo variable por tramos: lista de (beat, bpm). Interpola linealmente entre puntos."""
    puntos: list[tuple[float, float]]
    _cache: list[float] = field(default_factory=list)
    paso: float = 1.0 / 32

    def __post_init__(self):
        self.puntos.sort()
        # integra beat -> segundos con paso fino
        self._cache = [0.0]
        fin = self.puntos[-1][0] + 64
        b = 0.0
        t = 0.0
        while b < fin:
            bpm = self.bpm(b + self.paso / 2)
            t += self.paso * 60.0 / bpm
            b += self.paso
            self._cache.append(t)

    def bpm(self, b: float) -> float:
        p = self.puntos
        if b <= p[0][0]:
            return p[0][1]
        for (b0, v0), (b1, v1) in zip(p, p[1:]):
            if b0 <= b <= b1:
                x = (b - b0) / (b1 - b0) if b1 > b0 else 0
                # interpolacion suave (coseno): el rubato no tiene esquinas
                x = (1 - math.cos(math.pi * x)) / 2
                return v0 + (v1 - v0) * x
        return p[-1][1]

    def seg(self, b: float) -> float:
        i = b / self.paso
        i0 = int(math.floor(i))
        f = i - i0
        i0 = max(0, min(i0, len(self._cache) - 2))
        return self._cache[i0] * (1 - f) + self._cache[i0 + 1] * f


def humanizar(notas: list[Nota], tempo: MapaTempo, semilla: int = 7,
              jitter_ms: dict | None = None, vel_sd: dict | None = None,
              legato_ms: dict | None = None) -> list[tuple[float, float, int, int, str]]:
    """Devuelve (inicio_s, fin_s, pitch, vel, voz) con tiempos y velocidades que respiran."""
    rnd = random.Random(semilla)
    jitter_ms = jitter_ms or {"melodia": 7, "interna": 10, "acomp": 9, "bajo": 6}
    vel_sd = vel_sd or {"melodia": 2.5, "interna": 3, "acomp": 3.5, "bajo": 2.5}
    legato_ms = legato_ms or {"melodia": 35, "interna": 20, "acomp": 0, "bajo": 0}
    out = []
    for n in notas:
        t0 = tempo.seg(n.beat) + n.adelanto_ms / 1000 + rnd.gauss(0, jitter_ms.get(n.voz, 8)) / 1000
        t1 = tempo.seg(n.beat + n.dur) + legato_ms.get(n.voz, 0) / 1000
        t0 = max(0.0, t0)
        t1 = max(t0 + 0.05, t1)
        v = int(round(max(1, min(127, n.vel + rnd.gauss(0, vel_sd.get(n.voz, 3))))))
        out.append((t0, t1, n.pitch, v, n.voz))
    return out


def escribir_midi(eventos, pedal: list[tuple[float, int]], ruta: str, programa: int = 0,
                  nombre: str = "Piano", es_bateria: bool = False):
    pm = pretty_midi.PrettyMIDI(resolution=960, initial_tempo=120)
    inst = pretty_midi.Instrument(program=programa, is_drum=es_bateria, name=nombre)
    for t0, t1, p, v, _ in eventos:
        inst.notes.append(pretty_midi.Note(velocity=v, pitch=p, start=t0, end=t1))
    for t, val in pedal:
        inst.control_changes.append(pretty_midi.ControlChange(number=64, value=val, time=max(0.0, t)))
    inst.notes.sort(key=lambda n: n.start)
    inst.control_changes.sort(key=lambda c: c.time)
    pm.instruments.append(inst)
    pm.write(ruta)
    return pm
