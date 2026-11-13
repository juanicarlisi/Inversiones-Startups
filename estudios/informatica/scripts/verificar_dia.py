#!/usr/bin/env python3
"""Verifica uno o más días: python3 scripts/verificar_dia.py [id ...]  (sin argumentos: todos los de dias/).
ERRORES = hay que corregir. AVISOS = revisar. Código de salida 1 si hay errores.
Controla: estructura, términos usados antes de presentarse, largo de lectura, preguntas, frases de «voz de IA», fuentes, rutas de Senda."""
import glob, json, os, re, sys, unicodedata
AQUI = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(AQUI, '..')
SENDA = os.environ.get('SENDA', '/home/user/senda-app')
PLAN = json.load(open(os.path.join(R, 'plan', 'plan.json')))
ORDEN = PLAN['orden']; POS = {i: n for n, i in enumerate(ORDEN)}
FUENTES = json.load(open(os.path.join(R, 'fuentes', 'fuentes.json'))) if os.path.exists(os.path.join(R, 'fuentes', 'fuentes.json')) else {}
norm = lambda s: re.sub(r'\s+', ' ', ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')).strip()
BLOQUES = {'h': ['x'], 'h3': ['x'], 'p': ['x'], 'lista': ['items'], 'nota': ['k', 'x'], 'pensa': ['x', 'resp'], 'tabla': ['cab', 'filas'], 'codigo': ['x'],
           'terminal': ['lineas'], 'diagrama': ['tipo'], 'pasos': ['pasos'], 'cita': ['x', 'fuente'], 'ejercicio': ['x'], 'widget': ['n'], 'senda': ['x', 'archivos']}
NOTAS = {'analogia', 'idea', 'ojo', 'mito', 'dato', 'historia', 'vigencia'}
DIAGRAMAS = {'capas': ['capas'], 'flujo': ['filas'], 'celdas': ['filas'], 'arbol': ['raiz'], 'linea-tiempo': ['eventos'], 'comparar': ['izq', 'der'], 'svg': ['x'], 'secuencia': ['actores', 'mensajes'], 'grafo': ['nodos']}
WIDGETS = {'bits', 'utf8', 'ieee', 'color', 'compuertas', 'sumador', 'microcpu', 'bigo', 'cidr', 'hash', 'contraste'}
FRASES = ['no es solo', 'no es solamente', 'no se trata solo', 'no se trata solamente', 'en el mundo actual', 'en la era digital', 'en la era de la', 'cabe destacar', 'es importante destacar', 'vale la pena destacar', 'vale la pena mencionar',
          'sin lugar a dudas', 'fascinante', 'revolucionari', 'sumergirnos', 'adentrarnos', 'en el vertiginoso', 'panorama en constante', 'en conclusión', 'tapiz', 'sinfonía de', 'desbloquear el potencial', 'desbloquea el poder', 'potenciar', 'en un mundo cada vez']

def palabras(s): return len(re.findall(r'\w+', re.sub(r'\[\[([^\]|]+)\|?[^\]]*\]\]', r'\1', s)))
def textos(d):
    """Todos los textos de lectura (sin código) del día, para contar palabras y buscar frases."""
    out = []
    def a(x):
        if isinstance(x, str): out.append(x)
        elif isinstance(x, list): [a(i) for i in x]
    a(d.get('gancho', '')); a(d.get('recap', []))
    for b in d.get('bloques', []):
        t = b.get('t')
        if t in ('codigo', 'terminal', 'widget'): a(b.get('cap', '')); continue
        for k in ('x', 'items', 'resp', 'lista', 'solucion', 'pista', 'titulo'):
            if k in b and t != 'diagrama': a(b[k])
        if t == 'tabla': a(b['cab']); [a(f) for f in b['filas']]
        if t == 'pasos': [a([p.get('t', ''), p.get('x', '')]) for p in b['pasos']]
        if t == 'diagrama': a(b.get('cap', '')); [a(m.get('d', '')) for m in b.get('mensajes', [])]
    return out

def verificar(id_, d, tot_fuentes):
    E, W = [], []
    e = lambda m: E.append(m); w = lambda m: W.append(m)
    p = PLAN['dias'].get(id_)
    if not p: return [f'{id_}: no existe en el plan'], []
    if d.get('id') != id_: e(f'id del archivo ({d.get("id")}) distinto de {id_}')
    for k in ('titulo', 'bajada', 'minutos', 'vigencia', 'revisado', 'objetivos', 'gancho', 'bloques', 'recap', 'repaso', 'feynman', 'para_profundizar', 'terminos', 'siguiente'):
        if not d.get(k): e(f'falta «{k}»')
    if E: return E, W
    if d['titulo'] != p['titulo']: w(f'el título difiere del plan: «{p["titulo"]}»')
    if not (20 <= d['minutos'] <= 30): e('minutos debe estar entre 20 y 30')
    if d['vigencia'] not in ('principio', 'mixto', 'herramienta'): e('vigencia inválida')
    if not (3 <= len(d['objetivos']) <= 5): e('objetivos: entre 3 y 5')
    if not (4 <= len(d['recap']) <= 7): e('recap: entre 4 y 7 puntos')
    if len(d['para_profundizar']) < 2: e('para_profundizar: al menos 2')
    # términos
    intro = {norm(t) for i in ORDEN[:POS[id_] + 1] for t in PLAN['dias'][i]['introduce']}
    propios = {norm(t['t']) for t in d['terminos']}
    for t in p['introduce']:
        if norm(t) not in propios: e(f'falta definir el término del plan: «{t}»')
    for t in d['terminos']:
        if not t.get('d') or len(t['d']) < 20: e(f'definición pobre de «{t["t"]}»')
    def _cadenas(x, out):
        if isinstance(x, str): out.append(x)
        elif isinstance(x, list): [_cadenas(i, out) for i in x]
        elif isinstance(x, dict): [_cadenas(i, out) for i in x.values()]
        return out
    alltxt = '\n'.join(_cadenas({k: v for k, v in d.items() if k != 'fuentes_nuevas'}, []))
    for m in re.finditer(r'\[\[([^\]|]+)(?:\|([^\]]+))?\]\]', alltxt):
        k = norm(m.group(2) or m.group(1))
        if k not in intro and k not in propios: e(f'[[{m.group(0)[2:-2]}]] se usa antes de presentarse (no está en el plan hasta este día)')
    # estructura de bloques
    cuenta = {}; tn = 0
    for i, b in enumerate(d['bloques']):
        t = b.get('t'); cuenta[t] = cuenta.get(t, 0) + 1
        if t not in BLOQUES: e(f'bloque {i}: tipo desconocido «{t}»'); continue
        for k in BLOQUES[t]:
            if k not in b: e(f'bloque {i} ({t}): falta «{k}»')
        if t == 'nota' and b.get('k') not in NOTAS: e(f'bloque {i}: nota de tipo «{b.get("k")}» inválido')
        if t == 'diagrama':
            if b.get('tipo') not in DIAGRAMAS: e(f'bloque {i}: diagrama «{b.get("tipo")}» desconocido')
            else:
                for k in DIAGRAMAS[b['tipo']]:
                    if k not in b: e(f'bloque {i} (diagrama {b["tipo"]}): falta «{k}»')
            if b.get('tipo') == 'secuencia':
                A = [a['n'] if isinstance(a, dict) else a for a in b.get('actores', [])]
                for m in b.get('mensajes', []):
                    if not (0 <= m.get('de', -1) < len(A) and 0 <= m.get('a', -1) < len(A)): e(f'bloque {i}: mensaje con actor fuera de rango')
                    if len(m.get('t', '')) > 44: e(f'bloque {i}: etiqueta de mensaje larga (>44): «{m["t"][:30]}…»')
                if len(A) > 5: e(f'bloque {i}: secuencia con más de 5 actores')
            if b.get('tipo') == 'grafo':
                ids = {n['id'] for n in b.get('nodos', [])}
                for a in b.get('aristas', []):
                    if a['de'] not in ids or a['a'] not in ids: e(f'bloque {i}: arista a un nodo inexistente')
        if t == 'widget' and b.get('n') not in WIDGETS: e(f'bloque {i}: widget «{b.get("n")}» no existe (hay: {", ".join(sorted(WIDGETS))})')
        if t == 'cita' and palabras(b.get('x', '')) > 30: e(f'bloque {i}: cita de más de 30 palabras')
        if t == 'cita' and b.get('fuente') not in FUENTES and b.get('fuente') not in {f['id'] for f in d.get('fuentes_nuevas', [])}: e(f'bloque {i}: cita con fuente desconocida')
        if t == 'senda':
            ar = b.get('archivos', [])
            if not ar: e(f'bloque {i}: senda sin archivos')
            for a in ar:
                if os.path.isdir(SENDA) and not os.path.exists(os.path.join(SENDA, a.rstrip('/'))): e(f'bloque {i}: ruta de Senda inexistente «{a}»')
    if cuenta.get('h', 0) < 4: w('menos de 4 subtítulos (h)')
    if cuenta.get('pensa', 0) < 2: w('menos de 2 bloques «pensa» (frená y pensá)')
    if sum(cuenta.get(k, 0) for k in ('diagrama', 'widget', 'tabla')) < 2: w('pocos recursos visuales (diagrama/widget/tabla): al menos 2')
    if not any(b.get('t') == 'nota' and b.get('k') == 'analogia' for b in d['bloques']): w('sin analogía')
    if not any(b.get('t') == 'nota' and b.get('k') in ('ojo', 'mito') for b in d['bloques']): w('sin «ojo» ni «mito» (error común)')
    if p['tipo'] == 'S' and cuenta.get('senda', 0) < 2: e('día de Senda: necesita al menos 2 bloques «senda» con archivos reales')
    if p['tipo'] == 'S' and sum(len(b.get('archivos', [])) for b in d['bloques'] if b.get('t') == 'senda') < 4: e('día de Senda: citá al menos 4 archivos en total')
    if p['tipo'] == 'L' and cuenta.get('ejercicio', 0) < 2 and not any(b.get('ejecutable') for b in d['bloques']): e('laboratorio: necesita al menos 2 ejercicios o código ejecutable')
    # largo
    tx = textos(d); n = sum(palabras(s) for s in tx)
    if n < 2200: e(f'muy corto: {n} palabras de lectura (mínimo 2200; objetivo 2800 a 3800)')
    elif n < 2600: w(f'corto: {n} palabras (objetivo 2800 a 3800)')
    if n > 4600: e(f'muy largo: {n} palabras (máximo 4600)')
    elif n > 4000: w(f'largo: {n} palabras (objetivo 2800 a 3800)')
    # preguntas
    Q = d['repaso']; lo, hi = (8, 12) if p['tipo'] == 'R' else (5, 7)
    if not (lo <= len(Q) <= hi): e(f'repaso: {len(Q)} preguntas (deben ser {lo} a {hi})')
    larga = 0
    for i, q in enumerate(Q):
        if not all(k in q for k in ('p', 'o', 'c', 'e')): e(f'pregunta {i + 1}: faltan campos'); continue
        if not (3 <= len(q['o']) <= 4): e(f'pregunta {i + 1}: 3 o 4 opciones')
        if not (0 <= q['c'] < len(q['o'])): e(f'pregunta {i + 1}: «c» fuera de rango'); continue
        if len({norm(o) for o in q['o']}) != len(q['o']): e(f'pregunta {i + 1}: opciones repetidas')
        if len(q['e']) < 40: e(f'pregunta {i + 1}: explicación muy corta')
        ls = [len(o) for o in q['o']]
        if len(q['o']) > 1 and ls[q['c']] == max(ls) and sorted(ls)[-1] > sorted(ls)[-2] + 8: larga += 1
    if len(Q) >= 5 and larga / len(Q) > .5: e(f'{larga} de {len(Q)} correctas son claramente las más largas: igualá el largo de las opciones')
    if len(Q) >= 5 and len({q['c'] for q in Q if 'c' in q}) < 2: e('la respuesta correcta está siempre en la misma posición')
    # estilo
    low = norm(' '.join(tx))
    for f in FRASES:
        if f in low: e(f'frase de «voz de IA»: «{f}»')
    if len(re.findall(r'—', ' '.join(tx))) > max(6, n // 120): w('demasiadas rayas largas (—): usá comas o puntos')
    if any(re.sub(r'`[^`]*`', '', s).count('**') % 2 for s in tx): w('hay un ** sin cerrar')
    import re as _re
    for s in tx:
        m = _re.search(r'\b[Dd]ías? \d+\b', s)
        if m: w(f'número de día escrito a mano («{m.group(0)}»): usá [@id]'); break
    if re.search(r'<[a-z/][^>]*>', re.sub(r'`[^`]*`', '', ' '.join(tx))): e('hay etiquetas HTML en los textos (usá solo el marcado permitido; lo que es código va entre comillas invertidas)')
    # fuentes
    nuevas = {f['id']: f for f in d.get('fuentes_nuevas', [])}
    usadas = set(re.findall(r'\[#([a-z0-9_.-]+)\]', alltxt)) | {r.get('fuente') for r in d['para_profundizar'] if r.get('fuente')}
    for u in usadas:
        if u not in FUENTES and u not in nuevas: e(f'fuente «{u}» no está en fuentes/fuentes.json ni en fuentes_nuevas')
    for r in d['para_profundizar']:
        if not r.get('fuente') and not r.get('url'): e('para_profundizar: cada ítem necesita «fuente» o «url»')
        if r.get('url') and not r['url'].startswith('https://'): e('para_profundizar: solo enlaces https')
    for i, f in nuevas.items():
        for k in ('t', 'tipo', 'url'):
            if not f.get(k): e(f'fuente nueva «{i}»: falta «{k}»')
        if i in FUENTES and FUENTES[i].get('url') != f.get('url'): e(f'fuente nueva «{i}» ya existe con otra URL')
    for m in re.finditer(r'\]\((http[^)]*)\)', alltxt):
        if not m.group(1).startswith('https://'): e(f'enlace no https: {m.group(1)}')
    for m in re.findall(r'\[@(\d\d-\d\d[a-z]?)\]', alltxt):
        if m not in PLAN['dias']: e(f'referencia [@{m}] a un día que no existe')
    # se_apoya_en
    for x in d.get('se_apoya_en', []):
        if x not in PLAN['dias']: e(f'se_apoya_en: «{x}» no existe')
        elif POS[x] >= POS[id_]: e(f'se_apoya_en: «{x}» es posterior a este día')
    tot_fuentes.update(nuevas)
    return E, W

if __name__ == '__main__':
    ids = sys.argv[1:] or [os.path.basename(f)[:-5] for f in sorted(glob.glob(os.path.join(R, 'dias', '*.json')))]
    malos = 0; reg = {}
    for i in ids:
        f = os.path.join(R, 'dias', i + '.json')
        if not os.path.exists(f): print(f'{i}: no existe el archivo'); malos += 1; continue
        try: d = json.load(open(f, encoding='utf-8'))
        except Exception as ex: print(f'{i}: JSON inválido: {ex}'); malos += 1; continue
        E, W = verificar(i, d, reg)
        n = sum(palabras(s) for s in textos(d)) if not E or d.get('bloques') else 0
        print(f'{"✗" if E else "✓"} {i} {d.get("titulo", "")[:40]} · {n} palabras · {len(E)} errores · {len(W)} avisos')
        for m in E: print('    ERROR:', m)
        for m in W: print('    aviso:', m)
        malos += bool(E)
    print(f'\n{len(ids) - malos}/{len(ids)} días sin errores')
    sys.exit(1 if malos else 0)
