#!/usr/bin/env python3
"""Imprime el contexto de un día para quien lo va a escribir: python3 scripts/contexto.py 01-10"""
import json, os, sys
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = json.load(open(os.path.join(R, 'plan', 'plan.json'))); O = P['orden']; D = P['dias']
i = sys.argv[1]; assert i in D, 'día inexistente'
k = O.index(i); d = D[i]; parte = next(p for p in P['partes'] if p['id'] == d['parte'])
def dia(x): return json.load(open(os.path.join(R, 'dias', x + '.json'))) if os.path.exists(os.path.join(R, 'dias', x + '.json')) else None
print(f'=== DÍA {i} (n.º {d["n"]} de {len(O)}) · tipo {d["tipo"]} · Parte {parte["num"]}: {parte["nombre"]}')
print(f'TÍTULO (no cambiar): {d["titulo"]}')
print(f'TÉRMINOS QUE DEBE PRESENTAR (los cinco campos «terminos» deben incluirlos con definición): {"; ".join(d["introduce"])}')
print(f'RESUMEN DE LA PARTE: {parte["resumen"]}\n')
print('--- DÍAS ANTERIORES (lo que el estudiante ya vio; podés usar [[término]] de estos y de hoy) ---')
for x in O[max(0, k - 8):k]:
    e = dia(x); marca = '(escrito)' if e else '(plan)'
    print(f'{x} [n.º {D[x]["n"]}] {D[x]["titulo"]} {marca}\n     presentó: {"; ".join(D[x]["introduce"])}')
    if e and x == O[k - 1]: print(f'     RECAP del día anterior: ' + ' | '.join(e['recap'])); print(f'     Su «siguiente»: {e["siguiente"]}')
print('\n--- DÍAS SIGUIENTES (no uses sus términos con [[ ]]; podés adelantarlos en texto plano con una frase) ---')
for x in O[k + 1:k + 6]:
    print(f'{x} [n.º {D[x]["n"]}] {D[x]["titulo"]}\n     presentará: {"; ".join(D[x]["introduce"])}')
print('\n--- OTROS DÍAS DE LA PARTE ---')
print(' · '.join(f'{x}:{D[x]["titulo"][:38]}' for x in parte['dias']))
allowed = sorted({t for x in O[:k + 1] for t in D[x]['introduce']}, key=str.lower)
print(f'\n--- TÉRMINOS DISPONIBLES PARA [[ ]] ({len(allowed)}; los de hoy incluidos) ---')
print('; '.join(allowed) if len(allowed) < 400 else '; '.join(t for x in O[max(0, k - 40):k + 1] for t in D[x]['introduce']) + '  … (más los de días anteriores: lista completa en plan/plan.json)')
print('\n--- FUENTES YA REGISTRADAS (ids para [#id] y para_profundizar; ver fuentes/fuentes.json) ---')
f = json.load(open(os.path.join(R, 'fuentes', 'fuentes.json')))
print(', '.join(sorted(f)))
