#!/usr/bin/env python3
"""Comprueba que cada URL de fuentes/fuentes.json (y de los días) responda. Guarda fuentes/enlaces.json con estado y fecha.
Uso: python3 scripts/verificar_enlaces.py [--dias]  (con --dias revisa también los enlaces https de dias/*.json)"""
import concurrent.futures as cf, datetime, glob, json, os, re, sys, urllib.request, urllib.error
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
urls = {}
for i, f in json.load(open(os.path.join(R, 'fuentes', 'fuentes.json'))).items(): urls[f['url']] = i
for p in sorted(glob.glob(os.path.join(R, 'dias', '*.json'))):
    d = json.load(open(p)); txt = open(p).read()
    for f in d.get('fuentes_nuevas', []): urls.setdefault(f['url'], f['id'])
    if '--dias' in sys.argv:
        for u in re.findall(r'\]\((https://[^)\s]+)\)', txt) + [r['url'] for r in d.get('para_profundizar', []) if r.get('url')]: urls.setdefault(u, os.path.basename(p))
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
def probar(u):
    for metodo in ('HEAD', 'GET'):
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, method=metodo, headers={'User-Agent': UA}), timeout=25)
            return u, r.status, r.geturl()
        except urllib.error.HTTPError as e:
            if e.code in (403, 405, 429, 999) and metodo == 'HEAD': continue
            return u, e.code, ''
        except Exception as e:
            if metodo == 'HEAD': continue
            return u, 0, str(e)[:80]
    return u, 0, ''
with cf.ThreadPoolExecutor(12) as ex: res = list(ex.map(probar, urls))
malos = [(u, c, x) for u, c, x in res if not (200 <= c < 400)]
json.dump({'fecha': datetime.date.today().isoformat(), 'estado': {u: c for u, c, _ in res}}, open(os.path.join(R, 'fuentes', 'enlaces.json'), 'w'), indent=1)
for u, c, x in malos: print(f'  {c or "ERR"}  {urls[u]:28} {u}  {x}')
print(f'{len(res) - len(malos)}/{len(res)} enlaces responden')
