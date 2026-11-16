import re, sys, glob, os
raiz = sys.argv[1]
defs = {}   # nombre -> (archivo, linea_ini, lineas)
sueltos = []
for f in sorted(glob.glob(os.path.join(raiz, "supabase/migrations/*.sql"))):
    L = open(f, encoding="utf8").read().split("\n")
    i = 0
    while i < len(L):
        m = re.match(r"\s*create (?:or replace )?function\s+(?:public\.)?(\w+)\s*\(", L[i], re.I)
        if m:
            nombre = m.group(1)
            # delimitador
            j = i
            delim = None
            while j < len(L):
                d = re.search(r"\bas\s+(\$\w*\$)", L[j])
                if d:
                    delim = d.group(1); break
                j += 1
            k = j
            # buscar cierre
            first = True
            while k < len(L):
                cnt = L[k].count(delim)
                if (k == j and cnt >= 2) or (k > j and cnt >= 1):
                    break
                k += 1
            defs[nombre] = (os.path.basename(f), i + 1, L[i:k + 1])
            i = k + 1
            continue
        if re.search(r"insert into public\.avisos", L[i]):
            sueltos.append((os.path.basename(f), i + 1, L[i:i+4]))
        i += 1
for nombre, (f, ini, cuerpo) in defs.items():
    for n, l in enumerate(cuerpo):
        if "insert into public.avisos" in l:
            print(f"=== {nombre}  [{f}:{ini + n}]")
            for x in cuerpo[n:n + 7]:
                print("   ", x.rstrip()[:400])
                if ";" in x: break
print("--- fuera de funciones:", sueltos)
