#!/usr/bin/env python3
"""Compila plan/curriculo-*.txt a plan/plan.json y controla la consistencia.
Salida: plan/plan.json con {partes:[{id,num,nombre,resumen,dias:[ids]}], dias:{id:{n,id,parte,tipo,titulo,introduce:[...]}}}
El número de día (n) es la posición global; el id es estable (el progreso se guarda por id)."""
import glob, json, os, re, sys
AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.join(AQUI, '..')
TIPOS = set('CLHSR')
partes, dias, errores = [], {}, []
orden = []
for f in sorted(glob.glob(os.path.join(RAIZ, 'plan', 'curriculo-*.txt'))):
    for nl, linea in enumerate(open(f, encoding='utf-8'), 1):
        linea = linea.rstrip('\n')
        if not linea.strip() or linea.startswith('#') and not linea.startswith('##'):
            continue
        if linea.startswith('## '):
            p = [x.strip() for x in linea[3:].split('|')]
            if len(p) != 3: errores.append(f'{f}:{nl} parte mal formada'); continue
            partes.append({'id': p[0], 'num': int(p[0]), 'nombre': p[1], 'resumen': p[2], 'dias': []}); continue
        p = [x.strip() for x in linea.split('|')]
        if len(p) != 4: errores.append(f'{f}:{nl} día mal formado: {linea[:60]}'); continue
        did, tipo, titulo, intro = p
        if not re.fullmatch(r'\d\d-\d\d[a-z]?', did): errores.append(f'{f}:{nl} id inválido {did}')
        if tipo not in TIPOS: errores.append(f'{f}:{nl} tipo inválido {tipo}')
        if did in dias: errores.append(f'{f}:{nl} id repetido {did}')
        if not did.startswith(partes[-1]['id'] + '-'): errores.append(f'{f}:{nl} {did} no pertenece a la parte {partes[-1]["id"]}')
        terms = [t.strip() for t in intro.split(';') if t.strip()]
        dias[did] = {'id': did, 'parte': partes[-1]['id'], 'tipo': tipo, 'titulo': titulo, 'introduce': terms}
        partes[-1]['dias'].append(did); orden.append(did)
for i, did in enumerate(orden, 1):
    dias[did]['n'] = i
# términos presentados dos veces (solo aviso: a veces es a propósito)
vistos = {}
for did in orden:
    for t in dias[did]['introduce']:
        k = t.lower()
        if k in vistos: print(f'aviso: «{t}» se presenta en {vistos[k]} y en {did}')
        else: vistos[k] = did
if errores:
    print('\n'.join(errores)); sys.exit(1)
json.dump({'partes': partes, 'dias': dias, 'orden': orden}, open(os.path.join(RAIZ, 'plan', 'plan.json'), 'w'), ensure_ascii=False, indent=1)
print(f'plan.json: {len(partes)} partes, {len(orden)} días, {len(vistos)} términos')
