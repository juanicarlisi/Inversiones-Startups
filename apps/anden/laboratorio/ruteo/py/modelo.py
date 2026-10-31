"""Instancia CABA + evaluador INDEPENDIENTE de soluciones (factibilidad y costo) para comparar solucionadores en igualdad de condiciones.

Unidades: tiempo en segundos desde las 00:00; distancia en metros; costo en milesimas de USD (mUSD). Todos los costos son SUPUESTOS del laboratorio.
El costo de un arco depende del perfil del vehiculo: costo = round(km * por_km_mUSD); el costo de la ruta suma el fijo de la jornada.
Cualquier solucion (de PyVRP, OR-Tools, VROOM, JS, WASM) se reduce a una lista de (tipo, [ids de clientes]) y se evalua con `evaluar`.
"""
import json, os
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
DATOS = os.path.join(RAIZ, "datos")


class Instancia:
    def __init__(self, n=200, clientes_ids=None, tw_override=None, flota=None, deposito_ventana=None, fijo_factor=1.0):
        C = json.load(open(os.path.join(DATOS, "caba_clientes.json")))
        M = np.load(os.path.join(DATOS, "caba_matrices.npz"))
        self.flota = flota if flota is not None else json.load(open(os.path.join(DATOS, "flota.json")))
        if fijo_factor != 1.0:   # variante 'ruta': costo fijo por jornada reducido para que pese el ruteo (km) y no solo la cantidad de vehiculos
            self.flota = [dict(t, fijo_mUSD=int(round(t["fijo_mUSD"] * fijo_factor))) for t in self.flota]
        self.deposito = dict(C["deposito"])
        if deposito_ventana: self.deposito["abre"], self.deposito["cierra"] = deposito_ventana
        sel = list(range(1, n + 1)) if clientes_ids is None else list(clientes_ids)   # ids 1..400 de caba_clientes.json
        self.ids = sel                                                              # posicion k+1 <-> id sel[k]
        self.clientes = [dict(C["clientes"][i - 1]) for i in sel]
        for k, cl in enumerate(self.clientes):          # tw_override: {id_cliente: (ini, fin)}, p. ej. reprogramaciones de re-entregas
            if tw_override and cl["id"] in tw_override: cl["tw_ini"], cl["tw_fin"] = tw_override[cl["id"]]
        idx = [0] + sel
        self.n = len(sel)
        base_t = M["dur_s"][np.ix_(idx, idx)].astype(np.int64)
        base_d = M["dist_m"][np.ix_(idx, idx)].astype(np.int64)
        self.dist = base_d
        self.tipos = [t["tipo"] for t in self.flota]
        self.dur = {t["tipo"]: np.rint(base_t * t["factor_tiempo"]).astype(np.int64) for t in self.flota}
        self.costo = {t["tipo"]: np.rint(base_d / 1000.0 * t["por_km_mUSD"]).astype(np.int64) for t in self.flota}
        self.demanda = np.array([0] + [c["demanda"] for c in self.clientes], dtype=np.int64)
        self.servicio = np.array([0] + [c["servicio_s"] for c in self.clientes], dtype=np.int64)
        self.tw_ini = np.array([self.deposito["abre"]] + [c["tw_ini"] for c in self.clientes], dtype=np.int64)
        self.tw_fin = np.array([self.deposito["cierra"]] + [c["tw_fin"] for c in self.clientes], dtype=np.int64)
        self.tipo_de = {t["tipo"]: t for t in self.flota}

    # --- serializacion compacta (para el navegador, VROOM, JS, WASM): enteros planos ---
    def a_dict(self):
        return {"n": self.n, "deposito": self.deposito, "clientes": self.clientes, "flota": self.flota,
                "dist": self.dist.ravel().tolist(),
                "dur": {t: self.dur[t].ravel().tolist() for t in self.tipos},
                "costo": {t: self.costo[t].ravel().tolist() for t in self.tipos}}

    @classmethod
    def desde_dict(cls, d):
        o = cls.__new__(cls)
        o.flota = d["flota"]; o.deposito = d["deposito"]; o.clientes = d["clientes"]; o.n = d["n"]
        o.ids = [c["id"] for c in o.clientes]; m = o.n + 1
        o.dist = np.array(d["dist"], dtype=np.int64).reshape(m, m)
        o.tipos = [t["tipo"] for t in o.flota]
        o.dur = {t: np.array(d["dur"][t], dtype=np.int64).reshape(m, m) for t in o.tipos}
        o.costo = {t: np.array(d["costo"][t], dtype=np.int64).reshape(m, m) for t in o.tipos}
        o.demanda = np.array([0] + [c["demanda"] for c in o.clientes], dtype=np.int64)
        o.servicio = np.array([0] + [c["servicio_s"] for c in o.clientes], dtype=np.int64)
        o.tw_ini = np.array([o.deposito["abre"]] + [c["tw_ini"] for c in o.clientes], dtype=np.int64)
        o.tw_fin = np.array([o.deposito["cierra"]] + [c["tw_fin"] for c in o.clientes], dtype=np.int64)
        o.tipo_de = {t["tipo"]: t for t in o.flota}
        return o

    def total_demanda(self):
        return int(self.demanda.sum())


def _simular(inst, tipo, ruta, salida):
    """Recorre la ruta saliendo del deposito a `salida`; devuelve (fin, ok). Espera si llega antes de la ventana."""
    d = inst.dur[tipo]; t = salida; prev = 0
    for c in ruta:
        t += d[prev, c]
        if t < inst.tw_ini[c]: t = inst.tw_ini[c]
        if t > inst.tw_fin[c]: return None
        t += inst.servicio[c]; prev = c
    t += d[prev, 0]
    return t


def duracion_minima(inst, tipo, ruta):
    """Duracion minima exacta (fin - salida) de una ruta con salida flexible dentro de la ventana del deposito.
    end(s) es no decreciente y 1-Lipschitz en la salida s, asi que duration(s) = end(s) - s es no creciente: el optimo es la SALIDA MAS TARDIA factible,
    que sale de una pasada hacia atras (limites superiores de inicio de servicio). Devuelve (duracion, salida, fin) o None si es infactible."""
    d = inst.dur[tipo]; seq = [0] + list(ruta)
    # pasada hacia atras: tope[k] = ultimo instante en que puede empezar el servicio del cliente seq[k] para cumplir todo lo que sigue
    tope = inst.tw_fin[0]                       # llegada al deposito a mas tardar al cierre
    nxt = 0
    for c in reversed(seq[1:]):
        tope = min(inst.tw_fin[c], tope - d[c, nxt] - inst.servicio[c]); nxt = c
    s_max = tope - d[0, nxt]                    # salida del deposito
    if s_max < inst.tw_ini[0]: return None
    fin = _simular(inst, tipo, ruta, s_max)
    if fin is None or fin > inst.tw_fin[0]: return None
    return (int(fin - s_max), int(s_max), int(fin))


def evaluar(inst, rutas, verbose=False):
    """rutas: lista de (tipo, [posiciones de cliente 1..n]). Devuelve dict con factible, costo_mUSD, km, vehiculos, errores."""
    errores = []; costo = 0; km = 0.0; vistos = []; por_tipo = {}
    usados = {}
    for tipo, ruta in rutas:
        if not ruta: continue
        T = inst.tipo_de[tipo]
        usados[tipo] = usados.get(tipo, 0) + 1
        vistos += list(ruta)
        carga = int(inst.demanda[list(ruta)].sum())
        if carga > T["capacidad"]: errores.append(f"capacidad {tipo}: {carga} > {T['capacidad']}")
        res = duracion_minima(inst, tipo, ruta)
        if res is None: errores.append(f"ventanas: ruta {tipo} {ruta[:4]}... no tiene salida factible"); dur = 0
        else:
            dur = res[0]
            if dur > T["jornada_max_s"]: errores.append(f"jornada {tipo}: {dur/3600:.2f} h > {T['jornada_max_s']/3600:.0f} h")
        seq = [0] + list(ruta) + [0]
        costo += T["fijo_mUSD"] + int(sum(inst.costo[tipo][a, b] for a, b in zip(seq[:-1], seq[1:])))
        km += sum(inst.dist[a, b] for a, b in zip(seq[:-1], seq[1:])) / 1000.0
    for tipo, k in usados.items():
        if k > inst.tipo_de[tipo]["cantidad"]: errores.append(f"flota: {k} {tipo} > {inst.tipo_de[tipo]['cantidad']}")
    if sorted(vistos) != list(range(1, inst.n + 1)): errores.append(f"cobertura: {len(vistos)} visitas, {len(set(vistos))} distintas de {inst.n}")
    return {"factible": not errores, "costo_USD": costo / 1000.0, "costo_mUSD": costo, "km": round(km, 1), "vehiculos": sum(usados.values()),
            "por_tipo": usados, "errores": errores[:5]}
