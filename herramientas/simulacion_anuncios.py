#!/usr/bin/env python3
"""Anuncios y vidas de Senda: cuánto deja cada esquema y cuántas personas cuesta (19-11-2026).

ESTIMACIÓN, no medición. Modelo analítico (sin azar) por cada 1.000 activos por día. Informe con el método, las fuentes y la
discusión: conocimiento/2026-11-19-senda-anuncios-y-vidas.md. Cuando haya datos reales (AdMob por país y formato, eventos de
la app, retención por grupo), se reemplazan los supuestos de arriba y se vuelve a correr.

Uso:
    python3 herramientas/simulacion_anuncios.py                  # tablas con la elasticidad base (-0,10)
    python3 herramientas/simulacion_anuncios.py --elasticidad -0.2

Cómo cuenta:
- Tres tipos de persona (casual, regular, intensa) con sesiones por día y actividades por sesión (juego o lección); las
  actividades de una sesión (y de un día) siguen una Poisson.
- Intersticiales: solo después de las 2 actividades libres. Hoy el contador vive en memoria y vuelve a cero cuando el sistema
  cierra la app (escenario A); arreglado, cuenta por día. Cada actividad elegible deja k intersticiales: k resume el reloj de
  4 minutos y el anuncio en el turno de Lany (lección 0,8; juego corto 0,6; Espadeo de ~12 min 3 -> k = 1,30).
- Duelos con personas: hoy ningún anuncio hasta que termina el duelo; B y C, uno al mandar cada 2 turnos (0,5 por turno).
- Vidas: 1 por actividad en promedio. Una sesión choca con el tope si pide más vidas de las que tiene. En cada choque se piden
  1,5 vidas: 40 % mira un video por vida, 20 % lee un capítulo (+1) y se va, 40 % se va.
- Ingreso = parte que ve anuncios x relleno x (intersticiales x eCPM + videos x eCPM) / 1.000.
- Personas: la carga de anuncios por hora de uso cambia los activos según una elasticidad (y 3 vidas restan un 3 % aparte);
  el efecto entra en línea recta en 60 días.
"""
import argparse
import math

# --- Supuestos (HIPÓTESIS salvo que se diga otra cosa) -------------------------------------------------------------------
LIBRES_POR_DIA = 2            # HECHO: src/util/pausaAnuncio.ts
FRACCION_EN_FRIO = 0.7        # parte de las sesiones (después de la primera del día) que arrancan con la app cerrada
VIDAS_POR_CHOQUE = 1.5        # vidas que la persona quería usar cuando se quedó sin
P_VIDEO, P_LEER = 0.40, 0.20  # en el choque: mira videos / lee un capítulo; el resto se va
MIN_ACTIVIDAD = 5.75          # minutos promedio: 50 % lecciones de ~4, 25 % juegos de ~3, 25 % Espadeo de ~12
MIN_TURNO_DUELO = 2.0
PARTE_CON_ANUNCIOS = 0.93     # sin menores de 13 ni planes pagos (al lanzar no hay planes pagos)
RELLENO = 0.85                # veces que AdMob tiene un anuncio G sin personalizar para mostrar
# eCPM (USD cada 1.000 anuncios) sin personalizar, clasificación G, solo AdMob: benchmark x 0,55; 82 % Android en LatAm
ECPM = {"latam": {"inter": 0.85, "video": 1.00}, "eeuu": {"inter": 6.00, "video": 7.50}}
VALOR_PREMIUM_DAU_MES = 0.105  # USD por activo diario y por mes cuando haya Premium (docs/SUSCRIPCIONES.md, DAU/MAU 0,3)
CASTIGO_3_VIDAS = -0.03       # activos que se pierden aparte por trabarse a mitad de lección con 3 vidas
ELASTICIDAD = -0.10           # cambio en activos por cada 100 % más de anuncios por hora

SEGMENTOS = {
    # parte de los activos, sesiones por día, actividades por sesión, turnos de duelo por día,
    # videos de Talentos por día hoy y con «duplicar al ganar» (escenario C)
    "casual": {"parte": 0.50, "sesiones": 1.5, "act_sesion": 1.4, "turnos_duelo": 0.5, "videos_talentos": 0.10, "videos_talentos_c": 0.20},
    "regular": {"parte": 0.35, "sesiones": 2.0, "act_sesion": 2.2, "turnos_duelo": 1.5, "videos_talentos": 0.25, "videos_talentos_c": 0.45},
    "intenso": {"parte": 0.15, "sesiones": 3.0, "act_sesion": 3.0, "turnos_duelo": 3.0, "videos_talentos": 0.50, "videos_talentos_c": 0.80},
}

MULT_C = 0.95 * 0.97  # C: día de instalación sin intersticiales (-5 %) y el video con premio reinicia el reloj (-3 %)

ESCENARIOS = {
    "A": {"nombre": "Hoy (código actual)", "vidas": 5, "contador": "apertura", "k": 1.30, "duelo": 0.0, "mult": 1.0, "videos": "hoy", "castigo": 0.0},
    "A2": {"nombre": "Hoy + contador por día", "vidas": 5, "contador": "dia", "k": 1.30, "duelo": 0.0, "mult": 1.0, "videos": "hoy", "castigo": 0.0},
    "A3": {"nombre": "Solo bajar a 3 vidas", "vidas": 3, "contador": "dia", "k": 1.30, "duelo": 0.0, "mult": 1.0, "videos": "hoy", "castigo": CASTIGO_3_VIDAS},
    "B": {"nombre": "Propuesta del fundador", "vidas": 3, "contador": "dia", "k": 1.75, "duelo": 0.5, "mult": 1.0, "videos": "hoy", "castigo": CASTIGO_3_VIDAS},
    "C": {"nombre": "Recomendada", "vidas": 5, "contador": "dia", "k": 1.30, "duelo": 0.5, "mult": MULT_C, "videos": "c", "castigo": 0.0},
}


# --- Cuentas --------------------------------------------------------------------------------------------------------------
def poisson(m, x):
    return math.exp(-m) * m ** x / math.factorial(x)


def cola(m, desde):
    """P(X >= desde) con X ~ Poisson(m)."""
    return 1.0 - sum(poisson(m, x) for x in range(desde))


def excedente(m, libres=LIBRES_POR_DIA):
    """E[max(0, X - libres)] con X ~ Poisson(m): actividades que pasan las libres."""
    return m - libres + sum((libres - x) * poisson(m, x) for x in range(libres))


def elegibles(s, contador):
    a, ses = s["act_sesion"], s["sesiones"]
    if contador == "dia":
        return excedente(ses * a)
    e = excedente(a)  # cada sesión en frío vuelve a regalar 2; en caliente cuentan todas
    return e + (ses - 1) * (FRACCION_EN_FRIO * e + (1 - FRACCION_EN_FRIO) * a)


def segmento(s, esc, p_video=P_VIDEO, p_leer=P_LEER):
    p_irse = 1.0 - p_video - p_leer
    w = s["sesiones"] * s["act_sesion"]
    choques = s["sesiones"] * cola(s["act_sesion"], esc["vidas"] + 1)
    perdidas = choques * (p_irse * VIDAS_POR_CHOQUE + p_leer * (VIDAS_POR_CHOQUE - 1))
    actividad = (elegibles(s, esc["contador"]) - perdidas) * esc["k"] * esc["mult"]
    duelo = s["turnos_duelo"] * (excedente(w) / w) * esc["duelo"] * esc["mult"]
    clave = "videos_talentos_c" if esc["videos"] == "c" else "videos_talentos"
    videos = choques * p_video * VIDAS_POR_CHOQUE + s[clave]
    minutos = w * MIN_ACTIVIDAD + s["turnos_duelo"] * MIN_TURNO_DUELO
    return {"inter": actividad + duelo, "videos": videos, "minutos": minutos, "choques": choques, "actividades": w}


def promedio(esc, **kw):
    tot = {"inter": 0.0, "videos": 0.0, "minutos": 0.0, "choques": 0.0, "actividades": 0.0}
    for s in SEGMENTOS.values():
        r = segmento(s, esc, **kw)
        for k in tot:
            tot[k] += s["parte"] * r[k]
    return tot


def unidades(r, region):
    e = ECPM[region]
    return r["inter"] * e["inter"] + r["videos"] * e["video"]


def arpdau(r, region):
    return PARTE_CON_ANUNCIOS * RELLENO * unidades(r, region) / 1000


def multiplicador(r, base, esc, elasticidad):
    carga = r["inter"] / r["minutos"]
    carga_base = base["inter"] / base["minutos"]
    return 1 + elasticidad * (carga / carga_base - 1) + esc["castigo"]


def m90(m):
    """Promedio de 90 días si el efecto entra en línea recta en 60 días."""
    return 1 / 3 + 2 * m / 3


def ingreso90(clave, region, elasticidad):
    base = promedio(ESCENARIOS["A"])
    r = promedio(ESCENARIOS[clave])
    m = multiplicador(r, base, ESCENARIOS[clave], elasticidad)
    return arpdau(r, region) * 1000 * 90 * m90(m)


def mes_estable(clave, elasticidad, premium=True):
    base = promedio(ESCENARIOS["A"])
    r = promedio(ESCENARIOS[clave])
    m = multiplicador(r, base, ESCENARIOS[clave], elasticidad)
    return arpdau(r, "latam") * 1000 * 30 * m + (VALOR_PREMIUM_DAU_MES * 1000 * m if premium else 0.0)


def equilibrio(f, a=-2.0, b=0.0, n=80):
    """Elasticidad en la que f cambia de signo (bisección); None si no cambia en [a, b]."""
    fa, fb = f(a), f(b)
    if fa * fb > 0:
        return None
    for _ in range(n):
        c = (a + b) / 2
        if f(a) * f(c) <= 0:
            b = c
        else:
            a = c
    return (a + b) / 2


def binomial_al_menos(n, p, k):
    return 1.0 - sum(math.comb(n, x) * p ** x * (1 - p) ** (n - x) for x in range(k))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--elasticidad", type=float, default=ELASTICIDAD)
    e = ap.parse_args().elasticidad

    base = promedio(ESCENARIOS["A"])
    print(f"Promedio por activo: {base['actividades']:.2f} actividades y {base['minutos']:.1f} minutos por día\n")
    print(f"Elasticidad: {e:+.2f}\n")
    cab = f"{'Escenario':<28}{'Inter/día':>10}{'Video/día':>10}{'Inter/h':>9}{'LatAm $/d':>11}{'EEUU $/d':>10}{'Activos90':>10}{'90d LatAm':>11}{'90d EEUU':>10}{'Mes+Prem':>10}"
    print("Por cada 1.000 activos por día (USD)")
    print(cab)
    for clave, esc in ESCENARIOS.items():
        r = promedio(esc)
        m = multiplicador(r, base, esc, e)
        print(
            f"{clave + ' ' + esc['nombre']:<28}{r['inter']:>10.2f}{r['videos']:>10.2f}{r['inter'] / r['minutos'] * 60:>9.1f}"
            f"{arpdau(r, 'latam') * 1000:>11.2f}{arpdau(r, 'eeuu') * 1000:>10.2f}{1000 * m:>10.0f}"
            f"{ingreso90(clave, 'latam', e):>11.0f}{ingreso90(clave, 'eeuu', e):>10.0f}{mes_estable(clave, e):>10.0f}"
        )

    print("\nSensibilidad a la elasticidad (ingreso de anuncios a 90 días, LatAm, USD por 1.000 activos)")
    for el in (-0.03, -0.10, -0.20, -0.30):
        fila = "  ".join(f"{c}: {ingreso90(c, 'latam', el):6.0f}" for c in ("A2", "B", "C"))
        print(f"  {el:+.2f}  {fila}")
    e90 = equilibrio(lambda el: ingreso90("B", "latam", el) - ingreso90("C", "latam", el))
    e_ss = equilibrio(lambda el: mes_estable("B", el, premium=False) - mes_estable("C", el, premium=False))
    e_pr = equilibrio(lambda el: mes_estable("B", el) - mes_estable("C", el))
    print(f"  B deja menos que C si la elasticidad es peor que: 90 días {e90:+.2f} | mes estable, solo anuncios {e_ss:+.2f}"
          f" | mes estable con Premium {e_pr:+.2f}")

    print("\nSensibilidad de C a lo que paga la publicidad (LatAm, USD por día cada 1.000 activos)")
    rc = promedio(ESCENARIOS["C"])
    for ei in (0.40, 0.85, 1.60):
        u = rc["inter"] * ei + rc["videos"] * ECPM["latam"]["video"]
        print(f"  intersticial {ei:.2f}: {PARTE_CON_ANUNCIOS * RELLENO * u:.2f}")
    for ev in (0.50, 1.00, 1.80):
        u = rc["inter"] * ECPM["latam"]["inter"] + rc["videos"] * ev
        print(f"  video {ev:.2f}: {PARTE_CON_ANUNCIOS * RELLENO * u:.2f}")
    for rel in (0.70, 0.85, 0.95):
        print(f"  relleno {rel:.2f}: {PARTE_CON_ANUNCIOS * rel * unidades(rc, 'latam'):.2f}")
    for us in (0.0, 0.15, 0.30):
        mezcla = (1 - us) * arpdau(rc, "latam") + us * arpdau(rc, "eeuu")
        print(f"  {us:.0%} de los activos en EE. UU.: {mezcla * 1000:.2f} (EE. UU. pone el {us * arpdau(rc, 'eeuu') / mezcla:.0%})")

    print("\nSolo bajar a 3 vidas (A3 contra A2), antes de contar a los que se van: cambio en la plata de anuncios")
    for pv in (0.2, 0.4, 0.6):
        a2 = unidades(promedio(ESCENARIOS["A2"], p_video=pv, p_leer=0.2), "latam")
        a3 = unidades(promedio(ESCENARIOS["A3"], p_video=pv, p_leer=0.2), "latam")
        print(f"  {pv:.0%} mira el video al quedarse sin vidas: {a3 / a2 - 1:+.1%}")

    print("\nLección de 7 ejercicios empezada con todas las vidas: probabilidad de trabarse a la mitad (cada error = 1 vida)")
    for p in (0.15, 0.20):
        fila = "  ".join(f"{v} vidas: {binomial_al_menos(7, p, v):5.1%}" for v in (3, 4, 5))
        print(f"  {p:.0%} de errores  {fila}")


if __name__ == "__main__":
    main()
