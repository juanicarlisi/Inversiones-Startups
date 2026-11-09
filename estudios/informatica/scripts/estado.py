#!/usr/bin/env python3
"""Estado del estudio: días escritos por parte y próximos pendientes. Uso: python3 scripts/estado.py"""
import glob, json, os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = json.load(open(os.path.join(R, 'plan', 'plan.json')))
esc = {os.path.basename(f)[:-5] for f in glob.glob(os.path.join(R, 'dias', '*.json'))}
tot = len(P['orden']); print(f'{len(esc)}/{tot} días escritos ({100*len(esc)//tot} %)')
for p in P['partes']:
    n = sum(d in esc for d in p['dias']); pend = [d for d in p['dias'] if d not in esc]
    print(f'  Parte {p["num"]:>2} {p["nombre"][:46]:46} {n:>3}/{len(p["dias"]):<3}' + (f'  próximo: {pend[0]}' if pend and n else ''))
sig = next((d for d in P['orden'] if d not in esc), None)
print('Próximo día sin escribir:', sig, '-', P['dias'][sig]['titulo'] if sig else '')
