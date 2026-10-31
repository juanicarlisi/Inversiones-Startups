"""Oráculo SimPy del hub de Andén (laboratorio, 30-10-2026).

Una segunda implementación del hub de clasificación de última milla de `corte-1.md` §6.7, escrita desde la especificación (README
del hub, §6.7 y §6.9) y, para lo que la especificación deja abierto (persistencia en la rampa, relevo en las pausas, caminata por
distancia, desempates), leyendo los bloques del hub del motor 1.1.0. Es independiente en el CÓDIGO y en el PARADIGMA (procesos y
eventos de SimPy 4.1.2 en vez del calendario propio), no en la lectura de las reglas: un error de diseño que las dos compartan no
se vería. Lee el MISMO JSON de modelo (`anden.modelo/1`).

Qué modela (fidelidad F2 del motor: el lazo es una demora fija estación → rampa):
  camiones (turno, desvío, factor del día, atraso común), playa FIFO, andenes con personas, cintas (tránsito y espaciado),
  contrapresión de la acumulación, acumulación FIFO con desvío de no transportables, puestos de inducción (ausencias, pausas,
  eficiencia), lectura NO-READ, ruta → rampa (la-menos-llena / alternar), rampas con personas (plan por-volumen / contiguas, regla
  la-mas-llena / en-orden / la-que-se-llena-antes, caminata, jaulas con cierre, pausas con relevo), puesto manual y los 24 KPI de §6.9
  que existen en F2.
Modos del lazo:  «F2» (por defecto: demora fija estación -> rampa, sin tope en las rampas; coincide al milisegundo con el motor F2) y
«F3-lite» (suma la grilla de pasos del lazo, las micro-paradas con su congelamiento de lo que va en bandejas y la recirculación con
vueltas máximas cuando la rampa está llena; NO modela qué bandeja está ocupada: sin competencia por bandejas).
Qué NO modela (simplificaciones declaradas): ocupación de bandejas individuales (falta de bandeja, paquetes de dos bandejas), fatiga,
temporarios, retén de más de una persona con reglas finas, plan de rampas en lista explícita, trazas y fotos.

Tiempo en milisegundos enteros, redondeo igual al del motor (Math.round: mitades hacia arriba), para poder comparar corridas
deterministas al milisegundo. Azar: numpy PCG64 con SeedSequence([semilla, réplica]) (NO el Philox por dirección del motor: el azar
es distinto a propósito; se compara la distribución, no la corrida).

Uso:  python3 -I oraculo/hub_simpy.py --modelo M.json --n 300 --semilla 20261030 --jobs 3 --out resultados/simpy.json
"""
from __future__ import annotations

import argparse
import json
import math
import time
from bisect import bisect_left
from collections import deque
from concurrent.futures import ProcessPoolExecutor
from dataclasses import dataclass
from itertools import accumulate

import numpy as np
import simpy
from simpy.core import URGENT

VERSION_ORACULO = "0.1.0"
VELOCIDAD_CAMINAR_MPS = 1.2          # regla del motor 1.1.0 (hub/config.ts)
HORIZONTE_EXTRA_S = 8 * 3600         # §6.7 regla 1
KPIS = [
    "paquetes", "clasificados", "pendientesAlCorte", "pctAlCorte", "todoAntesDelCorte", "finClasificacionMin",
    "recirculacionPct", "vueltasExtra", "noLeidosPct", "aExcepcion", "esperaMediaMin", "esperaP50Min", "esperaP90Min",
    "utilInduccionPct", "inductoresPresentes", "ausentes", "horasRampaLlena", "rampasQueSeLlenaron", "paradasLazo",
    "minutosLazoDetenido", "esperaPlayaMediaMin", "horasPersonaPagadas", "costoNoche", "costoPorPaquete",
]


def ms(x: float) -> int:
    """Segundos -> milisegundos enteros con el redondeo del motor (Math.round: .5 hacia arriba)."""
    return int(math.floor(x * 1000.0 + 0.5))


def hora_a_seg(h: str) -> float:
    hh, mm = h.split(":")
    return int(hh) * 3600 + int(mm) * 60


# ---------------------------------------------------------------------------------------------------------------------
# Modelo -> configuración (resuelve las referencias «@parametro»)
# ---------------------------------------------------------------------------------------------------------------------
def _ref(m: dict, x):
    if isinstance(x, str) and x.startswith("@"):
        return m["parametros"][x[1:]]["valor"]
    return x


def _dist(m: dict, x):
    return _ref(m, x)


def _num(m: dict, x) -> float:
    v = _ref(m, x)
    if isinstance(v, dict):
        if v.get("tipo") == "fija":
            return float(v["valor"])
        raise ValueError(f"se esperaba un número y vino {v}")
    return float(v)


def _prob(m: dict, x) -> float:
    v = _ref(m, x)
    if isinstance(v, dict):
        return float(v["p"] if v["tipo"] == "bernoulli" else v["valor"])
    return float(v)


def muestrear(d, rng: np.random.Generator) -> float:
    """Una muestra de una distribución del esquema (corte-1.md §6.6), con las parametrizaciones del motor."""
    if isinstance(d, (int, float)):
        return float(d)
    t = d["tipo"]
    if t == "fija":
        return float(d["valor"])
    if t == "uniforme":
        return float(rng.uniform(d["min"], d["max"]))
    if t == "exponencial":
        return float(rng.exponential(d["media"]))
    if t == "lognormal":
        s2 = math.log(1 + d["cv"] ** 2)
        return float(rng.lognormal(math.log(d["media"]) - s2 / 2, math.sqrt(s2)))
    if t == "normal":
        x = rng.normal(d["media"], d["desvio"])
        return float(min(max(x, d.get("min", -math.inf)), d.get("max", math.inf)))
    if t == "triangular":
        return float(rng.triangular(d["min"], d["moda"], d["max"]))
    if t == "erlang":
        return float(rng.gamma(d["k"], d["media"] / d["k"]))
    if t == "weibull":
        return float(d["escala"] * rng.weibull(d["forma"]))
    if t == "bernoulli":
        return 1.0 if rng.random() < d["p"] else 0.0
    raise ValueError(f"distribución no soportada por el oráculo: {t}")


def _polilinea(pts) -> float:
    return sum(math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) for i in range(1, len(pts)))


def _particion_pareja(pesos, b):
    """Partición lineal de `pesos` en `b` bloques contiguos que minimiza la carga del bloque más cargado (programación dinámica)."""
    R = len(pesos)
    if b <= 0:
        return [0]
    if R <= b:
        return [min(k, R) for k in range(b + 1)]
    pre = [0.0]
    for p in pesos:
        pre.append(pre[-1] + p)
    INF = float("inf")
    mejor = [[INF] * (R + 1) for _ in range(b + 1)]
    desde = [[0] * (R + 1) for _ in range(b + 1)]
    mejor[0][0] = 0.0
    for k in range(1, b + 1):
        for i in range(k, R - (b - k) + 1):
            for j in range(k - 1, i):
                v = max(mejor[k - 1][j], pre[i] - pre[j])
                if v < mejor[k][i]:
                    mejor[k][i] = v
                    desde[k][i] = j
    cortes = [0] * (b + 1)
    cortes[b] = R
    i = R
    for k in range(b, 0, -1):
        i = desde[k][i]
        cortes[k - 1] = i
    return cortes


@dataclass
class Cfg:
    inicio: int; fin: int; corte: int; horizonte: int
    nCam: int; turno_s: list; nominal: list
    desvio: object; cv_pron: float; p_atraso: float; demora_atraso: object; papeleo: int
    nA: int; and_personas: list; transito: list; espaciado: list; ritmo: object; acum_cap: int
    NI: int; activos: int; tiempo_ind: object; pausas_ind: dict; aus_ind: float; n_ret: int
    T: int; tick: int; slot_est: list; slot_rampa: list; max_vueltas: int; p_nl: float
    nRutas: int; ruta_pesos: list; ruta_rampas: list; multi_menos_llena: bool
    NR: int; rampa_cap: list; rampa_peso: list; rampa_s: list; largo_lazo: float
    clase_fracc: list; clase_transp: list
    jaula_cap: int; cierre: int
    nW: int; asignacion: object; regla: str; manejo: object; caminar: int; pausas_ram: dict; aus_ram: float
    nX: int; t_manual: object
    hora_persona: float; fijo_noche: float
    n_personas: int
    paradas_activas: bool = False
    parada_entre: object = None
    parada_dur: object = None


def compilar(m: dict) -> Cfg:
    h, pe, cal = m["hub"], m["personas"], m["calendario"]
    inicio_s, fin_s, corte_s = hora_a_seg(cal["inicio"]), hora_a_seg(cal["fin"]), hora_a_seg(cal["corte"])
    cam = m["demanda"]["camiones"]
    if isinstance(cam, list):
        turnos = [hora_a_seg(c["turno"]) for c in cam]
        nominal = [c["paquetes"] for c in cam]
    else:
        turnos = [hora_a_seg(cam["primero"]) + i * cam["cada"] for i in range(cam["cantidad"])]
        nominal = [cam["paquetes"]] * cam["cantidad"]
    sorter = h["sorter"]
    largo = 2 * sorter["recta"] + 2 * math.pi * sorter["radio"]
    T = round_js(largo / sorter["paso"])
    tick = ms(sorter["paso"] / sorter["velocidad"])

    def ranura(pos):
        return (round_js(pos / sorter["paso"]) % T + T) % T

    idx_rampa = {r["id"]: i for i, r in enumerate(h["rampas"])}
    rutas = h["planClasificacion"]["rutas"]
    ruta_rampas, rampa_peso = [], [0.0] * len(h["rampas"])
    visto = set()
    for ru in rutas:
        lst = [idx_rampa[i] for i in ru["rampas"]]
        ruta_rampas.append(lst)
        for r in lst:
            if r not in visto:
                visto.add(r)
                rampa_peso[r] = ru["peso"] / len(lst)
    cintas = {c["desde"]: c for c in h["cintas"]}
    pi = pe["induccion"]
    if pe.get("fatiga", {}).get("activa") or pi.get("temporarios", 0) > 0:
        raise ValueError("el oráculo no modela fatiga ni temporarios")
    activos = min(pi["puestosActivos"], len(h["induccion"]["puestos"]))
    nW, nX = pe["rampa"]["cantidad"], pe["excepcion"]["cantidad"]
    n_des = sum(a["personas"] for a in h["andenes"])
    return Cfg(
        inicio=ms(inicio_s), fin=ms(fin_s), corte=ms(corte_s), horizonte=ms(fin_s + HORIZONTE_EXTRA_S),
        nCam=len(turnos), turno_s=turnos, nominal=nominal,
        desvio=_dist(m, m["demanda"]["desvio"]), cv_pron=_num(m, m["demanda"]["errorPronostico"]["cv"]),
        p_atraso=_prob(m, m["demanda"]["atrasoComun"]["probabilidad"]), demora_atraso=_dist(m, m["demanda"]["atrasoComun"]["demora"]),
        papeleo=ms(_num(m, m["demanda"]["papeleo"])),
        nA=len(h["andenes"]), and_personas=[a["personas"] for a in h["andenes"]],
        transito=[ms(_polilinea(cintas[a["id"]]["puntos"]) / cintas[a["id"]]["velocidad"]) for a in h["andenes"]],
        espaciado=[ms(cintas[a["id"]]["paso"] / cintas[a["id"]]["velocidad"]) for a in h["andenes"]],
        ritmo=_dist(m, pe["descarga"]["ritmo"]), acum_cap=int(math.floor(h["acumulacion"]["largo"] / h["acumulacion"]["paso"] + 1e-9)),
        NI=len(h["induccion"]["puestos"]), activos=activos, tiempo_ind=_dist(m, h["induccion"]["tiempo"]),
        pausas_ind=pi["pausas"], aus_ind=_prob(m, pi["ausentismo"]), n_ret=pi["reten"],
        T=T, tick=tick, slot_est=[ranura(p["s"]) for p in h["induccion"]["puestos"]],
        slot_rampa=[ranura(r["s"]) for r in h["rampas"]] + [ranura(h["excepcion"]["s"])],
        max_vueltas=sorter["maxVueltas"], p_nl=_prob(m, sorter["lector"]["noLeido"]),
        nRutas=len(rutas), ruta_pesos=[r["peso"] for r in rutas], ruta_rampas=ruta_rampas,
        multi_menos_llena=h["planClasificacion"]["multiRampa"] != "alternar",
        NR=len(h["rampas"]), rampa_cap=[r["capacidad"] for r in h["rampas"]], rampa_peso=rampa_peso,
        rampa_s=[((r["s"] % largo) + largo) % largo for r in h["rampas"]], largo_lazo=largo,
        clase_fracc=[c["fraccion"] for c in h["perfilPaquete"]["clases"]],
        clase_transp=[bool(c["transportable"]) for c in h["perfilPaquete"]["clases"]],
        jaula_cap=h["jaulas"]["capacidad"], cierre=ms(_num(m, h["jaulas"]["cierre"])),
        nW=nW, asignacion=pe["rampa"]["asignacion"], regla=pe["rampa"]["regla"], manejo=_dist(m, pe["rampa"]["manejo"]),
        caminar=ms(_num(m, pe["rampa"]["caminar"])), pausas_ram=pe["rampa"]["pausas"], aus_ram=_prob(m, pe["rampa"]["ausentismo"]),
        nX=nX, t_manual=_dist(m, pe["excepcion"]["tiempo"]),
        hora_persona=_num(m, m["costos"]["horaPersona"]), fijo_noche=_num(m, m["costos"]["fijoNoche"]),
        n_personas=activos + pi["reten"] + nW + n_des + nX,
        paradas_activas=sorter["paradas"]["activas"] is True,
        parada_entre=_dist(m, sorter["paradas"]["entre"]), parada_dur=_dist(m, sorter["paradas"]["duracion"]),
    )


def round_js(x: float) -> int:
    return int(math.floor(x + 0.5))


# ---------------------------------------------------------------------------------------------------------------------
# Una noche
# ---------------------------------------------------------------------------------------------------------------------
LIBRE, OCUPADA, PAUSA, AUSENTE = "libre", "ocupada", "pausa", "ausente"


class Noche:
    # Mutantes: cada uno rompe A PROPÓSITO una regla del oráculo, para medir si las pruebas exactas lo detectan (sensibilidad).
    MUTANTES = ("sin_relevo", "caminata_fija", "sin_contrapresion", "sin_desvio_no_transportables", "pausa_perdida", "sin_espaciado_cinta")

    def __init__(self, cfg: Cfg, semilla: int, replica: int, mutante: str | None = None, lazo: str = "F2"):
        if lazo not in ("F2", "F3-lite"):
            raise ValueError(lazo)
        self.lazo = lazo
        self.mut = mutante
        if mutante is not None and mutante not in self.MUTANTES:
            raise ValueError(mutante)
        self.c = cfg
        self.env = simpy.Environment(initial_time=0)
        self.rng = np.random.Generator(np.random.PCG64(np.random.SeedSequence([semilla, replica])))
        c = self.c
        # --- demanda del día (se sortea al armar la noche) ---
        factor = 1.0
        if c.cv_pron > 0:
            factor = muestrear({"tipo": "lognormal", "media": 1, "cv": c.cv_pron}, self.rng)
        atraso = c.p_atraso > 0 and self.rng.random() < c.p_atraso
        demora = muestrear(c.demora_atraso, self.rng) if atraso else 0.0
        self.llegada = [max(0, ms(c.turno_s[i] + muestrear(c.desvio, self.rng) + demora)) for i in range(c.nCam)]
        self.paquetes_camion = [max(0, round_js(c.nominal[i] * factor)) for i in range(c.nCam)]
        self.acum_cap = 10**9 if mutante == "sin_contrapresion" else c.acum_cap
        self.cum_ruta = list(accumulate(c.ruta_pesos)); self.cum_clase = list(accumulate(c.clase_fracc))
        # --- paquetes (listas paralelas) ---
        self.creado: list[int] = []; self.listo: list[int] = []; self.ruta: list[int] = []; self.clase: list[int] = []
        self.manejo: list[int] = []; self.intento: list[int] = []; self.a_exc: list[bool] = []; self.destino: list[int] = []
        # --- andenes ---
        self.abierto = False
        self.playa: deque[int] = deque()
        self.anden_camion = [-1] * c.nA
        self.asignado = [-1] * c.nCam
        self.ultima_entrada = [-1] * c.nA
        self.en_cinta = 0; self.en_descarga = 0
        self.bloqueados: dict[int, simpy.Event] = {}
        self.descargados = 0
        self.n_en_jaula = 0
        # --- acumulación e inducción ---
        self.fila: deque[int] = deque()
        self.st_ind = [LIBRE] * c.NI
        self.pend_ind = [0] * c.NI
        self.item_ind: list[int] = [-1] * c.NI
        self.ms_induciendo = 0
        self.inducidos = [0] * c.NI
        # --- sorter F2 ---
        self.en_camino = [0] * (c.NR + 1)
        self.alternar = [0] * c.nRutas
        self.colocaciones = 0; self.no_leidos = 0
        self.vuelo: dict[int, list] = {}          # paquetes en bandejas: e -> [instante de llegada a su destino, proceso]
        self.anchor = c.inicio                    # origen de la grilla de pasos del lazo (cambia al arrancar tras una parada)
        self.parado = False; self.n_paradas = 0; self.ms_detenido = 0; self.ev_fin_parada = None
        self.vueltas: list[int] = []; self.vueltas_extra = 0
        # --- rampas ---
        self.fila_r = [deque() for _ in range(c.NR)]
        self.llena_desde = [-1] * c.NR; self.ms_llena = [0] * c.NR; self.se_lleno = [False] * c.NR
        self.lleno = [0] * c.NR; self.pendiente = [0] * c.NR
        self.asignada = [-1] * c.NR; self.duenia = [-1] * c.NR
        self.st_w = [LIBRE] * c.nW; self.ultima = [-1] * c.nW; self.pend_w = [0] * c.nW
        self.wake: list[simpy.Event | None] = [None] * c.nW
        self.pos_orden = [-1] * c.nW
        # --- excepción ---
        self.cola_x: deque[int] = deque()
        self.ocupado_x = [False] * c.nX
        # --- personas ---
        self.presente_ind = [True] * c.activos
        self.presente_ram = [True] * c.nW
        self.ausentes = 0

    # ----------------------------------------------------------------------------------------------- utilidades de tiempo
    def urgente(self, delay: int) -> simpy.Event:
        """Evento que se procesa ANTES que los normales del mismo instante (fase URGENTE del motor)."""
        ev = self.env.event()
        ev._ok = True  # noqa: SLF001  (API pública: Environment.schedule(event, priority, delay))
        ev._value = None  # noqa: SLF001
        self.env.schedule(ev, URGENT, delay)
        return ev

    def terminado(self) -> bool:
        return self.descargados == self.c.nCam and self.n_en_jaula == len(self.creado)

    # ----------------------------------------------------------------------------------------------------- arranque
    def arrancar(self):
        c, env = self.c, self.env
        env.process(self.inicio_turno())
        for i in range(c.nCam):
            env.process(self.camion(i))
        if self.lazo == "F3-lite" and c.paradas_activas:
            env.process(self.paradas())
        for s in range(c.activos):
            env.process(self.pausas_inductor(s))
        for w in range(c.nW):
            env.process(self.pausas_rampa(w))
            env.process(self.persona_rampa(w))

    def inicio_turno(self):
        """En `inicio` (URGENTE): ausencias, retén, plan de rampas, puestos y personas listas, apertura de andenes."""
        c = self.c
        yield self.urgente(c.inicio - self.env.now)
        for s in range(c.activos):
            if c.aus_ind > 0 and self.rng.random() < c.aus_ind:
                self.presente_ind[s] = False; self.ausentes += 1
        ret_presentes = 0
        for _ in range(c.n_ret):
            if c.aus_ind > 0 and self.rng.random() < c.aus_ind:
                self.ausentes += 1
            else:
                ret_presentes += 1
        for w in range(c.nW):
            if c.aus_ram > 0 and self.rng.random() < c.aus_ram:
                self.presente_ram[w] = False; self.ausentes += 1
        # el retén cubre primero los puestos de inducción ausentes y después las personas de rampa ausentes
        cubre_ind = [False] * c.activos
        for s in range(c.activos):
            if not self.presente_ind[s] and ret_presentes > 0:
                ret_presentes -= 1; cubre_ind[s] = True
        cubre_ram = [False] * c.nW
        for w in range(c.nW):
            if not self.presente_ram[w] and ret_presentes > 0:
                ret_presentes -= 1; cubre_ram[w] = True
        self.trabaja_ind = [self.presente_ind[s] or cubre_ind[s] for s in range(c.activos)]
        self.trabaja_ram = [self.presente_ram[w] or cubre_ram[w] for w in range(c.nW)]
        for s in range(c.NI):
            self.st_ind[s] = LIBRE if (s < c.activos and self.trabaja_ind[s]) else AUSENTE
        for w in range(c.nW):
            self.st_w[w] = LIBRE if self.trabaja_ram[w] else AUSENTE
        self.plan_rampas()
        self.duenia = list(self.asignada)
        for r in range(c.NR - 1, -1, -1):
            if self.asignada[r] >= 0:
                self.ultima[self.asignada[r]] = r
        for r in range(c.NR):
            self.marcar(r)
        self.dispatch_ind()
        # apertura de andenes (NORMAL, después del inicio): los camiones que ya estaban en la playa toman andén en orden
        yield self.env.timeout(0)
        self.abierto = True
        self.asignar_andenes()

    # ------------------------------------------------------------------------------------------------------ plan de rampas
    def plan_rampas(self):
        c = self.c
        pres = [1 if x else 0 for x in self.trabaja_ram]
        asig = [-1] * c.NR
        if c.nW == 0 or sum(pres) == 0:
            self.asignada = asig; return

        def siguiente(w):
            for j in range(c.nW):
                x = (w + j) % c.nW
                if pres[x]:
                    return x
            return -1

        a = c.asignacion
        if a == "por-volumen":
            orden = sorted(range(c.NR), key=lambda r: (c.rampa_s[r], r))
            gente = [w for w in range(c.nW) if pres[w]]
            cortes = _particion_pareja([c.rampa_peso[r] for r in orden], len(gente))
            for k, w in enumerate(gente):
                for i in range(cortes[k], cortes[k + 1]):
                    asig[orden[i]] = w
        elif a == "contiguas":
            for r in range(c.NR):
                asig[r] = siguiente((r * c.nW) // c.NR)
        else:
            raise ValueError("el oráculo no implementa el plan de rampas en lista explícita")
        self.asignada = asig

    # ------------------------------------------------------------------------------------------------- camiones y andenes
    def camion(self, i: int):
        yield self.env.timeout(self.llegada[i] - self.env.now)
        if self.abierto and self.asignar_uno(i):
            return
        self.playa.append(i)

    def anden_libre(self) -> int:
        for d in range(self.c.nA):
            if self.anden_camion[d] < 0 and self.c.and_personas[d] > 0:
                return d
        return -1

    def asignar_uno(self, cam: int) -> bool:
        d = self.anden_libre()
        if d < 0:
            return False
        self.anden_camion[d] = cam
        self.asignado[cam] = self.env.now
        self.env.process(self.descarga(d, cam))
        return True

    def asignar_andenes(self):
        while self.playa and self.anden_libre() >= 0:
            self.asignar_uno(self.playa.popleft())

    def en_camino_total(self) -> int:
        return len(self.fila) + self.en_cinta + self.en_descarga

    def descarga(self, d: int, cam: int):
        c, env = self.c, self.env
        n, p = self.paquetes_camion[cam], c.and_personas[d]
        t_listo = env.now
        fue_bloq = False
        entrada = env.now
        for i in range(n):
            if self.en_camino_total() >= self.acum_cap:      # contrapresión: el andén para hasta que la inducción saque uno
                ev = env.event()
                self.bloqueados[d] = ev
                fue_bloq = True
                yield ev                                  # al despertar, quien lo reanudó ya reservó el lugar (en_descarga)
            else:
                self.en_descarga += 1
            dur = ms(muestrear(c.ritmo, self.rng) / p)
            yield env.timeout(dur)
            self.en_descarga -= 1
            t = env.now
            e = self.nacer(t_listo)
            entrada = t if (self.ultima_entrada[d] < 0 or self.mut == "sin_espaciado_cinta") else max(t, self.ultima_entrada[d] + c.espaciado[d])
            self.ultima_entrada[d] = entrada
            self.en_cinta += 1
            env.process(self.cinta(e, entrada + c.transito[d] - t))
            t_listo = entrada
            if entrada > t and i < n - 1:                 # espera su turno de entrada a la cinta (espaciado)
                yield env.timeout(entrada - t)
        self.descargados += 1
        yield env.timeout(max(0, entrada - env.now) + c.papeleo)   # papeleo desde que entró el último a la cinta
        self.anden_camion[d] = -1
        if self.playa:
            self.asignar_uno(self.playa.popleft())

    def nacer(self, creado: int) -> int:
        c, rng = self.c, self.rng
        r = bisect_left(self.cum_ruta, rng.random() * self.cum_ruta[-1])
        k = bisect_left(self.cum_clase, rng.random() * self.cum_clase[-1])
        e = len(self.creado)
        self.creado.append(creado); self.listo.append(-1); self.ruta.append(r); self.clase.append(k)
        self.manejo.append(ms(muestrear(c.manejo, rng))); self.vueltas.append(0); self.intento.append(0); self.a_exc.append(False); self.destino.append(-1)
        return e

    def cinta(self, e: int, demora: int):
        yield self.env.timeout(demora)
        self.en_cinta -= 1
        self.acum_entrar(e)

    # ---------------------------------------------------------------------------------------------------- acumulación
    def acum_entrar(self, e: int):
        self.fila.append(e)
        self.desviar_cabeza()
        self.dispatch_ind()

    def desviar_cabeza(self):
        while self.mut != "sin_desvio_no_transportables" and self.fila and not self.c.clase_transp[self.clase[self.fila[0]]]:
            e = self.fila.popleft()
            self.exc_recibir(e)
            self.al_salir()

    def al_salir(self):
        """La acumulación sacó un paquete: los andenes parados vuelven, en orden de andén, mientras haya lugar."""
        for d in sorted(self.bloqueados):
            if self.en_camino_total() < self.acum_cap:
                ev = self.bloqueados.pop(d)
                self.en_descarga += 1                       # reserva
                ev.succeed()

    def tomar(self) -> int:
        e = self.fila.popleft()
        self.desviar_cabeza()
        self.al_salir()
        return e

    # ------------------------------------------------------------------------------------------------------- inducción
    def dispatch_ind(self):
        for s in range(self.c.NI):
            if not self.fila:
                return
            if self.st_ind[s] == LIBRE:
                self.inducir(s, self.tomar())

    def inducir(self, s: int, e: int):
        dur = ms(muestrear(self.c.tiempo_ind, self.rng))
        self.st_ind[s] = OCUPADA
        self.item_ind[s] = e
        self.ms_induciendo += dur
        self.inducidos[s] += 1
        self.env.process(self.fin_induccion(s, dur))

    def fin_induccion(self, s: int, dur: int):
        yield self.env.timeout(dur)
        if self.lazo == "F3-lite":
            # el paquete espera el próximo paso de la grilla del lazo; si el lazo está parado, espera a que arranque
            while True:
                if self.parado:
                    yield self.ev_fin_parada
                    continue
                n0, t = self.n_paradas, self.env.now
                tp = self.anchor + -(-(t - self.anchor) // self.c.tick) * self.c.tick
                yield self.env.timeout(tp - t)
                if self.n_paradas == n0 and not self.parado:
                    break
        self.colocar(s)

    def colocar(self, s: int):
        """F2: lectura, rampa y demora fija (distancia en ranuras × tick) hasta ella; el puesto queda libre ya."""
        c = self.c
        e = self.item_ind[s]
        nl = self.intento[e] == 0 and c.p_nl > 0 and self.rng.random() < c.p_nl
        dest = c.NR if nl else self.elegir_rampa(self.ruta[e])
        self.colocaciones += 1
        self.no_leidos += 1 if nl else 0
        self.destino[e] = dest
        self.en_camino[dest] += 1
        d = (c.slot_rampa[dest] - c.slot_est[s]) % c.T or c.T
        self.programar_llegada(e, self.env.now + d * c.tick)
        self.item_ind[s] = -1
        if self.pend_ind[s] > 0:
            self.pend_ind[s] -= 1
            self.empezar_pausa_ind(s)
        else:
            self.st_ind[s] = LIBRE
        self.dispatch_ind()

    def elegir_rampa(self, ruta: int) -> int:
        c = self.c
        lst = c.ruta_rampas[ruta]
        if len(lst) == 1:
            return lst[0]
        if not c.multi_menos_llena:
            i = self.alternar[ruta]
            self.alternar[ruta] = (i + 1) % len(lst)
            return lst[i]
        mejor, carga = lst[0], len(self.fila_r[lst[0]]) + self.en_camino[lst[0]]
        for r in lst[1:]:
            k = len(self.fila_r[r]) + self.en_camino[r]
            if k < carga:
                mejor, carga = r, k
        return mejor

    def programar_llegada(self, e: int, t_llegada: int):
        self.vuelo[e] = [t_llegada, self.env.process(self.llega_rampa(e))]

    def llega_rampa(self, e: int):
        c = self.c
        while True:
            try:
                yield self.env.timeout(self.vuelo[e][0] - self.env.now)
            except simpy.Interrupt:
                continue                                  # una parada del lazo corrió su llegada: vuelve a esperar
            r = self.destino[e]
            if self.lazo == "F3-lite" and r != c.NR and self.llena(r):
                # rampa llena: otra vuelta (o, pasadas las vueltas máximas, a la excepción)
                self.vueltas_extra += 1
                self.vueltas[e] += 1
                if self.vueltas[e] > c.max_vueltas:
                    self.en_camino[r] -= 1; self.en_camino[c.NR] += 1; self.destino[e] = c.NR
                    d = (c.slot_rampa[c.NR] - c.slot_rampa[r]) % c.T or c.T
                    self.vuelo[e][0] = self.env.now + d * c.tick
                else:
                    self.vuelo[e][0] = self.env.now + c.T * c.tick
                continue
            break
        del self.vuelo[e]
        self.en_camino[r] -= 1
        if r == c.NR:
            self.exc_recibir(e)
        else:
            self.rampa_recibe(e, r)

    def paradas(self):
        """Micro-paradas del lazo (regla 13): la n empieza `entre` después del fin de la anterior; lo que va en bandejas se atrasa."""
        c, env = self.c, self.env
        desde = c.inicio
        while True:
            ts = desde + ms(muestrear(c.parada_entre, self.rng))
            if ts > c.horizonte:
                return
            yield self.urgente(max(0, ts - env.now))
            if self.terminado():
                return
            dur = ms(muestrear(c.parada_dur, self.rng))
            t_kp = self.anchor + -(-(ts - self.anchor) // c.tick) * c.tick     # primer paso que no se alcanzó a dar
            t_r = ts + dur
            self.parado = True; self.n_paradas += 1; self.ms_detenido += dur
            self.ev_fin_parada = env.event()
            for e, par in list(self.vuelo.items()):
                if par[0] >= t_kp:
                    par[0] += t_r - t_kp
                    par[1].interrupt()
            yield self.urgente(dur)
            self.parado = False
            self.anchor = t_r
            self.ev_fin_parada.succeed()
            desde = t_r

    # pausas de los puestos de inducción
    def pausas_inductor(self, s: int):
        c, p = self.c, self.c.pausas_ind
        k = 0
        while True:
            t = ms(c.inicio / 1000 + p["primera"] + s * p["escalon"] + k * p["cada"])
            if t >= c.horizonte:
                return
            k += 1
            yield self.urgente(max(0, t - self.env.now))
            if t >= c.fin and self.terminado():
                return
            if self.st_ind[s] == AUSENTE:
                continue
            if self.st_ind[s] == LIBRE:
                self.empezar_pausa_ind(s)
            elif self.mut != "pausa_perdida":
                self.pend_ind[s] += 1
            if not p["cada"] > 0:
                return

    def empezar_pausa_ind(self, s: int):
        self.st_ind[s] = PAUSA
        self.env.process(self.fin_pausa_ind(s))

    def fin_pausa_ind(self, s: int):
        yield self.env.timeout(ms(self.c.pausas_ind["duracion"]))
        if self.pend_ind[s] > 0:
            self.pend_ind[s] -= 1
            self.empezar_pausa_ind(s)
            return
        self.st_ind[s] = LIBRE
        self.dispatch_ind()

    # ------------------------------------------------------------------------------------------------------- excepción
    def exc_recibir(self, e: int):
        self.a_exc[e] = True
        self.cola_x.append(e)
        self.atender_x()

    def atender_x(self):
        c = self.c
        for p in range(c.nX):
            if not self.cola_x:
                return
            if self.ocupado_x[p]:
                continue
            e = self.cola_x.popleft()
            self.ocupado_x[p] = True
            self.env.process(self.manual(p, e, ms(muestrear(c.t_manual, self.rng))))

    def manual(self, p: int, e: int, dur: int):
        yield self.env.timeout(dur)
        self.ocupado_x[p] = False
        if self.c.clase_transp[self.clase[e]]:
            self.intento[e] += 1
            self.acum_entrar(e)
        else:
            r = self.c.ruta_rampas[self.ruta[e]][0]
            self.a_jaula(e, r)
            w = self.asignada[r]
            if w >= 0:
                self.despertar(w)
        self.atender_x()

    # --------------------------------------------------------------------------------------------------------- rampas
    def llena(self, r: int) -> bool:
        return len(self.fila_r[r]) >= self.c.rampa_cap[r]

    def marcar(self, r: int):
        t = self.env.now
        llena = self.llena(r)
        if llena and self.llena_desde[r] < 0:
            self.llena_desde[r] = t; self.se_lleno[r] = True
        elif not llena and self.llena_desde[r] >= 0:
            self.ms_llena[r] += t - self.llena_desde[r]; self.llena_desde[r] = -1

    def rampa_recibe(self, e: int, r: int):
        self.fila_r[r].append(e)
        self.marcar(r)
        w = self.asignada[r]
        if w >= 0:
            self.despertar(w)

    def despertar(self, w: int):
        ev = self.wake[w]
        if ev is not None and not ev.triggered:
            ev.succeed()

    def a_jaula(self, e: int, r: int):
        self.listo[e] = self.env.now
        self.n_en_jaula += 1
        self.lleno[r] += 1
        if self.lleno[r] >= self.c.jaula_cap:
            self.lleno[r] = 0
            self.pendiente[r] += 1

    def distancia(self, a: int, b: int) -> float:
        d = abs(self.c.rampa_s[a] - self.c.rampa_s[b])
        return min(d, self.c.largo_lazo - d)

    def caminata(self, de: int, a: int) -> int:
        if de < 0 or de == a:
            return 0
        if self.mut == "caminata_fija":
            return self.c.caminar
        return max(self.c.caminar, ms(self.distancia(de, a) / VELOCIDAD_CAMINAR_MPS))

    def elegir_tomar(self, w: int) -> int:
        c = self.c
        if c.regla == "en-orden":
            for j in range(1, c.NR + 1):
                r = (self.pos_orden[w] + j) % c.NR
                if self.asignada[r] == w and self.fila_r[r]:
                    return r
            return -1
        aca = self.ultima[w]
        hay_llena = any(r != aca and self.asignada[r] == w and self.llena(r) for r in range(c.NR))
        if aca >= 0 and self.asignada[aca] == w and self.fila_r[aca] and (not hay_llena or self.llena(aca)):
            return aca
        mejor, valor, dist = -1, 0.0, 0.0
        for r in range(c.NR):
            if self.asignada[r] != w or not self.fila_r[r]:
                continue
            oc = len(self.fila_r[r])
            if c.regla == "la-mas-llena":
                v = -oc
            else:
                peso = c.rampa_peso[r]
                v = (c.rampa_cap[r] - oc) / peso if peso > 0 else math.inf
            d = -1.0 if (aca < 0 or r == aca) else self.distancia(aca, r)
            if mejor < 0 or v < valor or (v == valor and d < dist):
                mejor, valor, dist = r, v, d
        return mejor

    def elegir_tarea(self, w: int):
        c = self.c
        aca = self.ultima[w]
        if aca >= 0 and self.asignada[aca] == w and self.pendiente[aca] > 0:
            return ("cerrar", aca)
        for r in range(c.NR):
            if self.asignada[r] == w and self.pendiente[r] > 0:
                return ("cerrar", r)
        r = self.elegir_tomar(w)
        return ("tomar", r) if r >= 0 else None

    def persona_rampa(self, w: int):
        """Proceso de una persona de rampa: elige tarea, camina, maneja o cierra jaula; pausas cuando termina la tarea."""
        env, c = self.env, self.c
        yield env.timeout(0)
        while True:
            if self.st_w[w] == AUSENTE:
                return
            if self.pend_w[w] > 0:
                self.pend_w[w] -= 1
                yield from self.pausa_rampa(w)
                continue
            tarea = self.elegir_tarea(w)
            if tarea is None:
                self.st_w[w] = LIBRE
                self.wake[w] = env.event()
                yield self.wake[w]
                continue
            tipo, r = tarea
            self.st_w[w] = OCUPADA
            cam = self.caminata(self.ultima[w], r)
            if cam > 0:
                yield env.timeout(cam)
            self.ultima[w] = r
            if tipo == "cerrar":
                if self.pendiente[r] <= 0:
                    self.st_w[w] = LIBRE
                    continue
                self.pendiente[r] -= 1
                yield env.timeout(c.cierre)
            else:
                if not self.fila_r[r]:
                    self.st_w[w] = LIBRE
                    continue
                e = self.fila_r[r].popleft()
                self.marcar(r)
                self.pos_orden[w] = r
                yield env.timeout(self.manejo[e])
                self.a_jaula(e, r)
                x = self.asignada[r]
                if x >= 0 and x != w:
                    self.despertar(x)
            self.st_w[w] = LIBRE

    def pausas_rampa(self, w: int):
        c, p = self.c, self.c.pausas_ram
        k = 0
        while True:
            t = ms(c.inicio / 1000 + p["primera"] + w * p["escalon"] + k * p["cada"])
            if t >= c.horizonte:
                return
            k += 1
            yield self.urgente(max(0, t - self.env.now))
            if t >= c.fin and self.terminado():
                return
            if self.st_w[w] == AUSENTE:
                continue
            self.pend_w[w] += 1
            self.despertar(w)                              # si está libre, que empiece la pausa ya
            if not p["cada"] > 0:
                return

    def pausa_rampa(self, w: int):
        c, env = self.c, self.env
        self.st_w[w] = PAUSA
        # relevo: la siguiente persona presente y fuera de pausa toma sus rampas
        v = -1
        for j in range(1, c.nW):
            x = (w + j) % c.nW
            if self.st_w[x] not in (AUSENTE, PAUSA):
                v = x; break
        if v >= 0 and self.mut != "sin_relevo":
            paso = False
            for r in range(c.NR):
                if self.asignada[r] == w:
                    self.asignada[r] = v; paso = True
            if paso:
                self.despertar(v)
        yield env.timeout(ms(c.pausas_ram["duracion"]))
        for r in range(c.NR):
            if self.duenia[r] == w:
                self.asignada[r] = w
            elif self.asignada[r] >= 0 and self.asignada[r] != w and self.st_w[self.asignada[r]] == PAUSA:
                self.asignada[r] = w
        self.st_w[w] = LIBRE

    # ---------------------------------------------------------------------------------------------------- KPI (§6.9)
    def correr(self) -> dict:
        self.arrancar()
        self.env.run(until=self.c.horizonte + 1)
        return self.kpi()

    def kpi(self) -> dict:
        c = self.c
        n = len(self.creado)
        listos = [(l, e) for e, l in enumerate(self.listo) if l >= 0]
        clasif = len(listos)
        al_corte = sum(1 for l, _ in listos if l <= c.corte)
        max_listo = max((l for l, _ in listos), default=-1)
        esp = sorted((l - self.creado[e]) / 60000.0 for l, e in listos)

        def pct(q):
            return esp[min(len(esp) - 1, int(math.floor(q * len(esp))))] if esp else 0.0

        t_final = max(c.fin, max_listo)
        ms_llena = 0
        for r in range(c.NR):
            ms_llena += self.ms_llena[r] + (max(0, t_final - self.llena_desde[r]) if self.llena_desde[r] >= 0 else 0)
        asig = [(self.asignado[i], self.llegada[i]) for i in range(c.nCam) if self.asignado[i] >= 0]
        espera_playa = (sum(a - l for a, l in asig) / len(asig) / 60000.0) if asig else 0.0
        inductores = sum(1 for s in range(c.activos) if self.trabaja_ind[s])
        presentes = c.n_personas - self.ausentes
        jornada = max(c.fin - c.inicio, (max_listo - c.inicio) if max_listo >= 0 else 0)
        horas = presentes * jornada / 3600000.0
        costo = horas * c.hora_persona + c.fijo_noche
        pend = n - al_corte
        return {
            "paquetes": n, "clasificados": clasif, "pendientesAlCorte": pend,
            "pctAlCorte": 100.0 * (n - pend) / n if n > 0 else 100.0, "todoAntesDelCorte": 1 if pend == 0 else 0,
            "finClasificacionMin": (max_listo - c.inicio) / 60000.0 if max_listo >= 0 else 0.0,
            "recirculacionPct": 100.0 * self.vueltas_extra / max(1, self.colocaciones), "vueltasExtra": self.vueltas_extra,
            "noLeidosPct": 100.0 * self.no_leidos / max(1, self.colocaciones), "aExcepcion": sum(self.a_exc),
            "esperaMediaMin": (sum(esp) / clasif) if clasif else 0.0, "esperaP50Min": pct(0.5), "esperaP90Min": pct(0.9),
            "utilInduccionPct": (100.0 * self.ms_induciendo / (inductores * jornada)) if inductores > 0 else 0.0,
            "inductoresPresentes": inductores, "ausentes": self.ausentes,
            "horasRampaLlena": ms_llena / 3600000.0, "rampasQueSeLlenaron": sum(1 for x in self.se_lleno if x),
            "paradasLazo": self.n_paradas, "minutosLazoDetenido": self.ms_detenido / 60000.0, "esperaPlayaMediaMin": espera_playa,
            "horasPersonaPagadas": horas, "costoNoche": costo, "costoPorPaquete": costo / max(1, clasif),
        }


def una_noche(args) -> dict:
    modelo, semilla, replica, *resto = args
    lazo = resto[0] if resto else "F2"
    cfg = compilar(modelo)
    t0 = time.perf_counter()
    k = Noche(cfg, semilla, replica, lazo=lazo).correr()
    return {"replica": replica, "kpi": k, "ms": round((time.perf_counter() - t0) * 1000)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--modelo", required=True)
    ap.add_argument("--n", type=int, default=100)
    ap.add_argument("--semilla", type=int, default=20261030)
    ap.add_argument("--jobs", type=int, default=2)
    ap.add_argument("--lazo", default="F2", choices=["F2", "F3-lite"])
    ap.add_argument("--out")
    a = ap.parse_args()
    modelo = json.load(open(a.modelo, encoding="utf8"))
    t0 = time.perf_counter()
    trabajos = [(modelo, a.semilla, r, a.lazo) for r in range(a.n)]
    if a.jobs > 1:
        with ProcessPoolExecutor(max_workers=a.jobs) as ex:
            reps = list(ex.map(una_noche, trabajos, chunksize=4))
    else:
        reps = [una_noche(t) for t in trabajos]
    total = time.perf_counter() - t0
    out = {
        "oraculo": {"version": VERSION_ORACULO, "simpy": simpy.__version__, "numpy": np.__version__, "semilla": a.semilla,
                    "n": a.n, "lazo": a.lazo, "jobs": a.jobs, "s_total": round(total, 1), "ms_por_noche": round(sum(r["ms"] for r in reps) / a.n)},
        "modelo": a.modelo, "replicas": reps,
    }
    if a.out:
        with open(a.out, "w", encoding="utf8") as f:
            json.dump(out, f)
    print(json.dumps(out["oraculo"]))


if __name__ == "__main__":
    main()
