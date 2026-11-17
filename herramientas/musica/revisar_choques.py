"""Busca choques de segunda menor/novena menor entre la melodía y lo que suena debajo en el mismo momento."""
import sys
import pretty_midi
sys.path.insert(0, '.')
import componer_aguas as C
notas, cambios, total = C.construir()
mel = [n for n in notas if n.voz == 'melodia']
otras = [n for n in notas if n.voz != 'melodia']
probs = []
for m in mel:
    for o in otras:
        if o.beat <= m.beat < o.beat + min(o.dur, 1.0) or m.beat <= o.beat < m.beat + min(m.dur, 1.0):
            iv = abs(m.pitch - o.pitch)
            if iv in (1, 11, 13) or (iv == 2 and abs(m.pitch - o.pitch) == 2 and m.pitch < 70):
                probs.append((m.beat // 4, m.beat % 4, pretty_midi.note_number_to_name(m.pitch), pretty_midi.note_number_to_name(o.pitch), o.voz, iv))
for p in sorted(set(probs)):
    print(p)
print(len(set(probs)), "choques")
