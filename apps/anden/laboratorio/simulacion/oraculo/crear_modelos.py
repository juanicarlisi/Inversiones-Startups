"""Deriva, de la plantilla hub-chico@1.0.0, los modelos con que se compara el oráculo SimPy contra el motor de Andén.

  A1..A5  EXACTOS: todo tiempo fijo, una sola clase y una sola ruta (2 rampas) -> la noche no tiene azar y las dos
          implementaciones tienen que dar los mismos KPI (se compara al milisegundo).
  B1      CASI-DETERMINISTA: tiempos fijos pero con las 10 rutas y las 4 clases (queda solo el azar categórico).
  C1      ESTOCÁSTICO: la plantilla tal cual (todas las distribuciones, ausencias, atraso común).
Uso: python3 -I oraculo/crear_modelos.py   (escribe oraculo/modelos/*.json)
"""
import copy, json, os

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(AQUI, "..", "..", "..", "simulador", "contratos", "ejemplos", "hub-chico.json")
OUT = os.path.join(AQUI, "modelos")
os.makedirs(OUT, exist_ok=True)
base = json.load(open(BASE, encoding="utf8"))


def media(d):
    t = d["tipo"]
    if t in ("lognormal", "exponencial", "erlang", "normal"):
        return d["media"]
    if t == "uniforme":
        return (d["min"] + d["max"]) / 2
    if t == "fija":
        return d["valor"]
    raise ValueError(t)


def fijar(m, desvio=0.0, atraso_p=0.0, atraso_demora=1800.0):
    """Todo tiempo pasa a su media (fija); sin ausencias, sin error de pronóstico, sin lectura fallida, sin paradas."""
    P = m["parametros"]
    for k, p in P.items():
        v = p["valor"]
        if isinstance(v, dict) and v["tipo"] in ("lognormal", "exponencial", "erlang", "normal", "uniforme"):
            p["valor"] = {"tipo": "fija", "valor": media(v)}
    P["desvioCamion"]["valor"] = {"tipo": "fija", "valor": desvio}
    P["ausentismo"]["valor"] = 0
    P["errorPronosticoCv"]["valor"] = 0
    P["noLeido"]["valor"] = {"tipo": "bernoulli", "p": 0}
    P["probAtrasoComun"]["valor"] = atraso_p
    P["demoraAtrasoComun"] = P.pop("demoraAtrasoComun") if "demoraAtrasoComun" in P else P["demoraAtraso"]
    P["demoraAtrasoComun"]["valor"] = {"tipo": "fija", "valor": atraso_demora}
    m["hub"]["sorter"]["paradas"]["activas"] = False
    return m


def una_ruta(m):
    m["hub"]["planClasificacion"]["rutas"] = [{"id": "Ruta 01", "peso": 1, "rampas": ["R01", "R07"]}]
    m["hub"]["perfilPaquete"]["clases"] = [{"id": "chico", "fraccion": 1, "bandejas": 1, "transportable": True}]
    return m


def sin_pausas(m):
    for rol in ("induccion", "rampa"):
        m["personas"][rol]["pausas"]["primera"] = 1e6
    return m


def poner(nombre, m, titulo):
    m = copy.deepcopy(m)
    m["id"] = nombre
    m["titulo"] = titulo
    json.dump(m, open(os.path.join(OUT, nombre + ".json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)


# A1: base exacta, sin pausas
a1 = sin_pausas(una_ruta(fijar(copy.deepcopy(base))))
poner("A1-exacto-base", a1, "A1 exacto: tiempos fijos, 1 ruta, sin pausas")
# A2: con pausas, desvío fijo +120 s y atraso común seguro de 30 min
a2 = una_ruta(fijar(copy.deepcopy(base), desvio=120.0, atraso_p=1.0, atraso_demora=1800.0))
poner("A2-exacto-pausas-atraso", a2, "A2 exacto: pausas, desvío +120 s y atraso común de 30 min")
# A3: estrés: 2 puestos de inducción (cuello), pausas, contrapresión y playa
a3 = una_ruta(fijar(copy.deepcopy(base)))
a3["personas"]["induccion"]["puestosActivos"] = 2
poner("A3-exacto-estres", a3, "A3 exacto: 2 puestos de inducción (cuello): contrapresión, playa, pausas")
# A4: plan contiguas + regla en-orden, 4 personas de rampa
a4 = sin_pausas(una_ruta(fijar(copy.deepcopy(base))))
a4["personas"]["rampa"].update({"asignacion": "contiguas", "regla": "en-orden", "cantidad": 4})
poner("A4-exacto-contiguas-en-orden", a4, "A4 exacto: rampas contiguas, regla en-orden, 4 personas de rampa")
# A5: descarga más rápida que el espaciado de la cinta (0,5 s < 0,6 s) y contrapresión fuerte
a5 = sin_pausas(una_ruta(fijar(copy.deepcopy(base))))
a5["parametros"]["ritmoDescarga"]["valor"] = {"tipo": "fija", "valor": 1.0}
poner("A5-exacto-cinta-limita", a5, "A5 exacto: descarga 0,5 s por paquete (< espaciado de la cinta 0,6 s) y contrapresión")
# B1: casi determinista, completo (10 rutas, 4 clases, no transportables): queda solo el azar categórico
b1 = fijar(copy.deepcopy(base), desvio=0.0)
poner("B1-casi-determinista", b1, "B1: tiempos fijos, rutas y clases al azar")
# C1: estocástico, la plantilla tal cual
poner("C1-estocastico", base, "C1: hub-chico@1.0.0 tal cual")
# C2: dentro del dominio de validez de F2 (rho de inducción <= 0,5 y sin rampas llenas): medio volumen
c2 = copy.deepcopy(base)
c2["demanda"]["camiones"]["paquetes"] = 400
poner("C2-dominio-F2", c2, "C2: hub-chico con 400 paquetes por camión (rho de inducción ~0,36)")
print(sorted(os.listdir(OUT)))
