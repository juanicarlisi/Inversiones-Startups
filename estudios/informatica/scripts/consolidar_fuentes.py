#!/usr/bin/env python3
"""Junta las fuentes_nuevas de todos los días en fuentes/fuentes.json (sin pisar las existentes) y avisa de conflictos de URL.
Los días conservan su fuentes_nuevas (inofensivo: el armador deduplica por id)."""
import glob, json, os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'); F = os.path.join(R, 'fuentes', 'fuentes.json')
reg = json.load(open(F)); nuevas = conflictos = 0
for p in sorted(glob.glob(os.path.join(R, 'dias', '*.json'))):
    for f in json.load(open(p)).get('fuentes_nuevas', []):
        i = f['id']; e = {k: v for k, v in f.items() if k != 'id'}
        if i in reg:
            if reg[i].get('url') != e.get('url'): conflictos += 1; print('CONFLICTO', i, os.path.basename(p), reg[i].get('url'), '!=', e.get('url'))
        else: reg[i] = e; nuevas += 1
json.dump(reg, open(F, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'{nuevas} fuentes sumadas; total {len(reg)}; conflictos {conflictos}')
