"""Cobertura del inventario bíblico de Senda (prueba 10).

Lee oportunidades/proyectos/senda/inventario_biblico.yaml (personajes e historias, con dónde están en la Biblia) y el contenido de la
app (repositorio juanicarlisi/senda-app: Travesía, Espadeo, Antes o después y Trivia de la iglesia) y cuenta, para cada uno, cuántas
preguntas o hechos de la app caen en sus capítulos. Escribe oportunidades/proyectos/senda/inventario_cobertura.md (generado: no editar).

Uso: python3 herramientas/inventario_senda.py [ruta/a/senda-app]   (por defecto ../senda-app, al lado de este repositorio)
"""
import json
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parent.parent
APP = Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ.parent / "senda-app"
SENDA = RAIZ / "oportunidades/proyectos/senda"


def norm(t: str) -> str:
    t = unicodedata.normalize("NFD", t.lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn")


ts = (APP / "src/datos/biblia.ts").read_text()
NOMBRES = {m.group(1): m.group(2) for m in re.finditer(r'"?([0-9A-Z]{3})"?: "([^"]+)"', re.search(r"export const NOMBRES[^=]*= \{(.*?)\};", ts, re.S).group(1))}
ORDEN = list(NOMBRES)
LIBROS = sorted(((i, norm(n)) for i, n in [*NOMBRES.items(), ("PSA", "Salmo")]), key=lambda x: -len(x[1]))
BIBLIA = {l["id"]: l for l in json.loads((APP / "assets/biblia/rv1909.bib").read_text())["libros"]}


def libro_de(texto: str):
    n = norm(texto.strip())
    for i, nom in LIBROS:
        if n.startswith(nom + " ") or n == nom:
            return i, texto.strip()[len(nom):].strip()
    return None, texto


def capitulos(txt: str) -> set[tuple[str, int]]:
    """Los capítulos que nombra una cita: «Génesis 12–25; Hebreos 11:8-19», «Éxodo 2 – Deuteronomio 34», «Mateo, Marcos…»."""
    out: set[tuple[str, int]] = set()
    limpio = re.sub(r"\([^)]*\)", " ", txt).replace("—", "-")
    actual = ""
    for parte in [x.strip() for x in re.split(r";|,|\s+y\s+", limpio) if x.strip()]:
        # tramo entre libros: «Éxodo 2 – Deuteronomio 34»
        if m := re.fullmatch(r"(.+?)\s+(\d+)\s*[–-]\s*(.+?)\s+(\d+)", parte):
            a, _ = libro_de(m[1])
            b, _ = libro_de(m[3])
            if a and b and a != b:
                ia, ib = ORDEN.index(a), ORDEN.index(b)
                for k in range(ia, ib + 1):
                    lib = ORDEN[k]
                    ini = int(m[2]) if k == ia else 1
                    fin = int(m[4]) if k == ib else len(BIBLIA[lib]["caps"])
                    out.update((lib, c) for c in range(ini, fin + 1))
                actual = b
                continue
        lib, resto = libro_de(parte)
        if lib:
            actual = lib
            if not resto:  # el libro entero («Mateo», «Filemón»)
                out.update((lib, c) for c in range(1, len(BIBLIA[lib]["caps"]) + 1))
                continue
        if not actual:
            continue
        resto = resto.replace("–", "-")
        if m := re.fullmatch(r"(\d+):\d+\s*-\s*(\d+):\d+", resto):
            out.update((actual, c) for c in range(int(m[1]), int(m[2]) + 1))
        elif m := re.fullmatch(r"(\d+)(?::[\d\s-]+)?", resto):
            out.add((actual, int(m[1])))
        elif m := re.fullmatch(r"(\d+)\s*-\s*(\d+)", resto):
            out.update((actual, c) for c in range(int(m[1]), int(m[2]) + 1))
    return out


# lo que hay en la app, por capítulo
tr = json.loads((APP / "contenido/travesia.json").read_text())
esp = json.loads((APP / "contenido/espadeo.json").read_text())
lt = json.loads((APP / "contenido/linea_tiempo.json").read_text())
ti = json.loads((APP / "contenido/trivia_iglesia.json").read_text())

piezas: list[tuple[str, set]] = []
for lid, lec in tr["lecciones"].items():
    for q in lec["preguntas"]:
        if q.get("cita"):
            piezas.append(("travesia", capitulos(q["cita"]["txt"]) or {(q["cita"]["libro"], q["cita"]["cap"])}))
for q in esp["preguntas"]:
    l, c, _ = q["ref"].split(".")
    piezas.append(("espadeo", {(l, int(c))}))
for h in lt["hechos"]:
    piezas.append(("antes", capitulos(h["cita"]["txt"])))
for p in ti["paquetes"]:
    for q in p["preguntas"]:
        if q.get("cita"):
            piezas.append(("trivia", {(q["cita"]["libro"], q["cita"]["cap"])}))


def cobertura(donde: str) -> dict[str, int]:
    caps = capitulos(donde)
    cuenta = {"travesia": 0, "espadeo": 0, "antes": 0, "trivia": 0}
    for tipo, cs in piezas:
        if cs & caps:
            cuenta[tipo] += 1
    return cuenta


def estado(c: dict[str, int]) -> str:
    total = sum(c.values())
    return "con contenido" if c["travesia"] >= 4 else "empezado" if total else "sin contenido"


inv = yaml.safe_load((SENDA / "inventario_biblico.yaml").read_text())
filas_p, filas_h, resumen = [], [], {"personajes": {}, "historias": {}}
for grupo, campo, filas in (("personajes", "nombre", filas_p), ("historias", "titulo", filas_h)):
    for x in inv[grupo]:
        c = cobertura(x["donde"])
        e = estado(c)
        resumen[grupo][e] = resumen[grupo].get(e, 0) + 1
        filas.append(f"| {x[campo]} | {x['donde']} | {c['travesia']} | {c['espadeo']} | {c['antes']} | {c['trivia']} | {e} | {x['prioridad']} |")

cab = "| Nombre | Dónde | Travesía | Espadeo | Antes o después | Trivia | Estado | Prioridad |\n|---|---|---|---|---|---|---|---|"
txt = f"""# Cobertura del inventario bíblico en la app

> **Generado** por `python3 herramientas/inventario_senda.py` el {date.today().isoformat()}. No editar a mano: la fuente es
> `inventario_biblico.yaml`. Cuenta las preguntas (Travesía, Espadeo, Trivia) y los hechos (Antes o después) que caen en los capítulos
> de cada personaje o historia. «Con contenido» = al menos 4 preguntas de la Travesía; «empezado» = algo; «sin contenido» = nada todavía.

**Personajes ({len(inv['personajes'])}):** {", ".join(f"{v} {k}" for k, v in sorted(resumen['personajes'].items()))}.
**Historias ({len(inv['historias'])}):** {", ".join(f"{v} {k}" for k, v in sorted(resumen['historias'].items()))}.

## Personajes

{cab}
{chr(10).join(filas_p)}

## Historias

{cab}
{chr(10).join(filas_h)}
"""
(SENDA / "inventario_cobertura.md").write_text(txt)
print(f"personajes {resumen['personajes']} · historias {resumen['historias']}")
