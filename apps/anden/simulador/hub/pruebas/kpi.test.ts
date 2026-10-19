// hub/pruebas/kpi.test.ts · P4 · KPI sanos en 50 noches del hub chico (corte-1.md §9, P4) y definiciones de §6.9 y costos.
// §9 pide, en las 50 noches, todo clasificado, sin alertas y el fin entre 120 y 300 min. Con hub-chico@1.0.0 eso no se puede al pie
// de la letra (NOTAS-CONTRATO §13: una noche con dos de tres inductores ausentes necesita más de 300 min solo de inducción), así que:
//  1. la prueba principal exige sobre 1.0.0 lo más fuerte que es cierto: todo clasificado y sin alertas en las 50, y cada noche fuera
//     del rango con un golpe discreto (faltas o atraso común) que la explica, confirmado por el contrafactual con números comunes (la
//     misma noche sin el golpe cae en el rango);
//  2. el certificado de imposibilidad, calculado SIN correr el hub (solo la plantilla y las direcciones de §6.3): con la semilla de la
//     plantilla hay al menos una noche en la que los inductores presentes no llegan a inducir todo en 300 min, con cualquier mecanismo;
//  3. el criterio literal sobre 1.0.0 corre como prueba PENDIENTE (`todo`): falla, lo dice en la salida y no rompe la suite, hasta que la
//     integración decida (publicar hub-chico@1.1.0 o corregir §9);
//  4. el criterio literal sobre la propuesta hub-chico@1.1.0 (plantillas/hub-chico-1.1.0.json, registro.ts › PROPUESTAS) tiene que pasar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Direccion } from '../../contratos/azar.ts';
import type { Modelo } from '../../contratos/modelo.ts';
import { KPIS } from '../../contratos/resultados.ts';
import { distribucion, numero } from '../../contratos/referencias.ts';
import { claveDe, crearFuenteAzarReferencia } from '../../contratos/referencia/motor-referencia.ts';
import { costoNoche, costoPorPaquete, horasPersonaPagadas } from '../costos.ts';
import { percentil } from '../kpi.ts';
import type { Hub } from '../bloques/comun.ts';
import { SEMILLA, chico, noche, propuestaChico110 } from './modelos.ts';

const NOCHES = 50;
/** Rango del fin de la clasificación que pide §9 (min desde el inicio del turno). */
const FIN_MIN = 120, FIN_MAX = 300;
const dentro = (min: number): boolean => min >= FIN_MIN && min <= FIN_MAX;

/** Lo que mira el criterio literal de §9 en una noche. */
interface Literal { fin: number; clasificados: number; paquetes: number; alertas: readonly string[] }
const literalDe = (k: { finClasificacionMin: number; clasificados: number; paquetes: number }, alertas: readonly string[]): Literal =>
  ({ fin: k.finClasificacionMin, clasificados: k.clasificados, paquetes: k.paquetes, alertas });
/** Faltas al criterio literal de §9 (vacío si la noche lo cumple). */
function faltasLiterales(n: Literal, donde: string): string[] {
  const f: string[] = [];
  if (n.alertas.length > 0) f.push(`${donde}: alertas ${n.alertas.join(', ')}`);
  if (n.clasificados !== n.paquetes) f.push(`${donde}: ${n.clasificados} clasificados de ${n.paquetes} paquetes`);
  if (!dentro(n.fin)) f.push(`${donde}: fin ${n.fin.toFixed(1)} min fuera de [${FIN_MIN}, ${FIN_MAX}]`);
  return f;
}
/** Las 50 noches de 1.0.0 se corren una vez: la prueba principal guarda lo que mira la pendiente. */
const literal100 = new Map<number, Literal>();
function literalChico100(r: number): Literal {
  let x = literal100.get(r);
  if (!x) {
    const s = noche(chico(), r);
    x = literalDe(s.resultado.kpi, s.resultado.alertas);
    literal100.set(r, x);
  }
  return x;
}

function contarNoTransportables(h: Hub): number {
  const P = h.P.S;
  let n = 0;
  for (let e = 0; e < P.nacidos; e++) if (!h.cfg.claseTransportable[P.clase[e]]) n++;
  return n;
}

/**
 * Golpes discretos de la noche (los parámetros con `golpeDiscreto` que pegan una vez por noche: ausentismo y atraso común; las
 * micro-paradas pasan todas las noches) y el cambio que los saca. Con direcciones semánticas (§6.3) sacar un golpe no cambia ningún
 * otro sorteo: es la misma noche sin ese golpe.
 */
const SIN_GOLPE: Record<string, (m: Modelo) => void> = {
  ausencias: (m) => { m.personas.induccion.ausentismo = 0; m.personas.rampa.ausentismo = 0; },
  'atraso común': (m) => { m.demanda.atrasoComun = { ...m.demanda.atrasoComun, probabilidad: 0 }; },
};
function golpesDe(h: Hub): string[] {
  const g: string[] = [];
  if (h.personas.S.ausentes > 0) g.push('ausencias');
  if (h.demanda.S.atraso === 1) g.push('atraso común');
  return g;
}

/**
 * Cota inferior del fin (min) que pone la inducción: la primera inducción de cada transportable dura al menos su tiempo base
 * (fatiga ≥ 1, eficiencia ≤ 1) y la hacen `presentes` personas en paralelo desde el inicio, así que el último paquete no puede estar
 * listo antes de Σ base ÷ presentes. Solo depende de los sorteos (paquetes, clases, tiempos base y faltas: direcciones fijas), no
 * del mecanismo: si pasa los 300 min, ningún hub que cumpla §6.7 termina esa noche en 300 min.
 */
function cotaInduccionMin(h: Hub, presentes: number): number {
  const P = h.P.S;
  let ms = 0;
  for (let e = 0; e < P.nacidos; e++) if (h.cfg.claseTransportable[P.clase[e]]) ms += Math.round(P.base0[e] * 1000);
  return presentes > 0 ? ms / presentes / 60_000 : Infinity;
}
const INICIO = 22 * 3_600_000, FIN = 30 * 3_600_000;

/** Lo que el certificado sortea de una noche sin correr el hub. */
interface CotaSinHub { cota: number; presentes: number; transportables: number; paquetes: number }

/**
 * La misma cota de la inducción, pero calculada SIN el hub: solo la plantilla y las direcciones de §6.3, sorteadas con la fuente de
 * referencia de `contratos/` (factor del día, clase y tiempo base de cada (camión, índice), faltas de inducción y del retén). Ningún
 * código de `hub/` interviene, así que si pasa los 300 min ninguna implementación de §6.7 con esas direcciones termina la noche a
 * tiempo: un transportable no llega a su jaula sin una primera inducción (reglas 5 y 6), y nadie más induce que los puestos activos
 * con su persona o con el retén (regla 2). La cota se queda corta a propósito (no suma pausas, descarga ni cinta).
 */
function cotaSinHub(m: Modelo, semilla: number, replica: number): CotaSinHub {
  const cam = m.demanda.camiones;
  if (!('serie' in cam)) throw new Error('cotaSinHub: se esperaba una serie de camiones (la plantilla chica) y llegó una lista');
  const az = crearFuenteAzarReferencia(semilla, replica);
  const d = (ruta: string, proposito: string, a = 0, b = 0, c = 0): Direccion => ({ clave: claveDe(ruta, proposito), a, b, c });
  const pi = m.personas.induccion, p = numero(m, pi.ausentismo);
  const falta = (rol: string, i: number) => az.sortear({ tipo: 'bernoulli', p }, d(`personas.${rol}`, 'ausencia', i)) === 1;
  let ausentes = 0, retenes = 0;
  for (let i = 0; i < pi.puestosActivos; i++) if (falta('induccion', i)) ausentes++;
  for (let i = 0; i < pi.reten; i++) if (!falta('reten', i)) retenes++; // el retén falta con el ausentismo de inducción (NOTAS §1)
  const presentes = pi.puestosActivos - Math.max(0, ausentes - retenes);
  const cv = numero(m, m.demanda.errorPronostico.cv);
  const factor = cv > 0 ? az.sortear({ tipo: 'lognormal', media: 1, cv }, d('demanda', 'errorPronostico')) : 1;
  const porCamion = Math.round(cam.paquetes * factor);
  const clases = m.hub.perfilPaquete.clases;
  const distClase = { tipo: 'discreta' as const, valores: clases.map((_, j) => j), pesos: clases.map((c) => c.fraccion) };
  const base = distribucion(m, m.hub.induccion.tiempo);
  let ms = 0, transportables = 0;
  for (let c = 0; c < cam.cantidad; c++) {
    for (let i = 0; i < porCamion; i++) {
      if (!clases[az.sortear(distClase, d('hub.perfilPaquete', 'clase', c, i))].transportable) continue;
      transportables++;
      ms += Math.round(az.sortear(base, d('hub.induccion', 'tiempo', c, i, 0)) * 1000);
    }
  }
  return { cota: presentes > 0 ? ms / presentes / 60_000 : Infinity, presentes, transportables, paquetes: porCamion * cam.cantidad };
}

test('percentil: P_q = x₍min(n−1, ⌊q·n⌋)₎ con x ordenado', () => {
  const x = Float64Array.from({ length: 10 }, (_, i) => i + 1);
  assert.equal(percentil(x, 0.5), 6);
  assert.equal(percentil(x, 0.9), 10);
  assert.equal(percentil(x, 0.99), 10);
  assert.equal(percentil(x, 0), 1);
  assert.ok(Number.isNaN(percentil(new Float64Array(0), 0.5)));
});

test('costos: horas pagadas, costo de la noche y costo por paquete (regla 1 de §6.7 y §6.9)', () => {
  assert.equal(horasPersonaPagadas(16, INICIO, FIN, -1), 128, 'sin paquetes, la jornada es el turno');
  assert.equal(horasPersonaPagadas(16, INICIO, FIN, FIN - 1), 128);
  assert.equal(horasPersonaPagadas(10, INICIO, FIN, FIN + 1_800_000), 85, 'si el último paquete sale después del fin, se paga hasta ahí');
  assert.equal(costoNoche(128, 7085, 496000), 128 * 7085 + 496000);
  assert.equal(costoPorPaquete(1000, 0), 1000, 'max(1, clasificados)');
  assert.equal(costoPorPaquete(1000, 4), 250);
});

test(`KPI sanos en ${NOCHES} noches del hub chico: todo clasificado, sin alertas, fin entre ${FIN_MIN} y ${FIN_MAX} min o explicado, y §6.9`, (t) => {
  const fines: number[] = [];
  const fuera: string[] = [];
  let nominales = 0, enRango = 0, imposibles = 0;
  for (let r = 0; r < NOCHES; r++) {
    const s = noche(chico(), r);
    const k = s.resultado.kpi, h = s.hub, donde = `réplica ${r}`;
    literal100.set(r, literalDe(k, s.resultado.alertas));
    assert.deepEqual(s.resultado.alertas, [], `${donde}: sin alertas`);
    for (const id of KPIS) assert.ok(Number.isFinite(k[id]), `${donde}: el KPI ${id} tiene que ser finito y es ${k[id]}`);
    assert.equal(k.clasificados, k.paquetes, `${donde}: todo paquete clasificado al horizonte`);
    fines.push(k.finClasificacionMin);
    // Cota de la inducción: ninguna noche termina antes de que los inductores presentes hagan su trabajo (control del mecanismo).
    const cota = cotaInduccionMin(h, k.inductoresPresentes);
    assert.ok(k.finClasificacionMin >= cota, `${donde}: fin ${k.finClasificacionMin} min antes de la cota de la inducción (${cota} min)`);
    const golpes = golpesDe(h);
    if (golpes.length === 0) nominales++;
    if (dentro(k.finClasificacionMin)) enRango++;
    else {
      // §9 pide el fin entre 120 y 300 min. Una noche fuera tiene que tener un golpe discreto que la explique, confirmado por el
      // contrafactual con números comunes (misma semilla y réplica, sin el golpe): primero de a uno y, si ninguno solo alcanza, juntos.
      assert.ok(golpes.length > 0, `${donde}: fin ${k.finClasificacionMin} min fuera de [${FIN_MIN}, ${FIN_MAX}] en una noche sin faltas ni atraso común`);
      let explica = '', juntos = false, finSin = Number.NaN;
      for (const g of [...golpes.map((x) => [x]), ...(golpes.length > 1 ? [golpes] : [])]) {
        const m = chico();
        for (const x of g) SIN_GOLPE[x](m);
        finSin = noche(m, r).resultado.kpi.finClasificacionMin;
        if (dentro(finSin)) { explica = g.join(' y '); juntos = g.length > 1; break; }
      }
      assert.ok(explica !== '', `${donde}: fin ${k.finClasificacionMin} min y sin ${golpes.join(' ni ')} da ${finSin} min: el golpe no explica la noche`);
      let imposible = '';
      if (cota > FIN_MAX) {
        imposibles++;
        const quien = k.inductoresPresentes === 1 ? 'el único inductor presente necesita' : `los ${k.inductoresPresentes} inductores presentes necesitan`;
        imposible = `; imposible por §6.7: ${quien} ${cota.toFixed(0)} min solo para inducir`;
      }
      fuera.push(`r${r} ${k.finClasificacionMin.toFixed(0)} min (${explica}: ${finSin.toFixed(0)} min sin ${juntos ? 'los dos' : 'ese golpe'}${imposible})`);
    }
    // definiciones
    assert.equal(k.pctAlCorte, (100 * (k.paquetes - k.pendientesAlCorte)) / k.paquetes);
    assert.equal(k.todoAntesDelCorte, k.pendientesAlCorte === 0 ? 1 : 0);
    assert.ok(k.esperaP50Min <= k.esperaP90Min && k.esperaMediaMin > 0);
    assert.ok(k.utilInduccionPct > 0 && k.utilInduccionPct <= 100);
    assert.ok(k.inductoresPresentes <= 3 && k.inductoresPresentes >= 0);
    assert.equal(k.recirculacionPct, (100 * k.vueltasExtra) / h.sorter.S.colocaciones);
    assert.equal(k.noLeidosPct, (100 * h.sorter.S.noLeidos) / h.sorter.S.colocaciones);
    const presentes = h.personas.presentes();
    assert.equal(presentes, 16 - k.ausentes);
    assert.equal(k.horasPersonaPagadas, (presentes * Math.max(8 * 60, k.finClasificacionMin)) / 60);
    assert.equal(k.costoNoche, k.horasPersonaPagadas * 7085 + 496000);
    assert.equal(k.costoPorPaquete, k.costoNoche / k.clasificados);
    // recursos y series
    const pr = s.resultado.porRecurso;
    assert.equal(pr.rampaRecibidos.length, 12);
    assert.equal(pr.personaOcupadaPct.length, 16);
    assert.equal(pr.puestoInducidos.length, 5);
    assert.equal(pr.puestoInducidos.reduce((a, b) => a + b, 0), h.sorter.S.colocaciones, 'cada inducción termina en una colocación');
    assert.equal(pr.rampaVueltas.reduce((a, b) => a + b, 0), k.vueltasExtra);
    assert.ok(Math.abs(pr.rampaMinutosLlena.reduce((a, b) => a + b, 0) / 60 - k.horasRampaLlena) < 1e-9);
    assert.equal(pr.puestoInducidos[3] + pr.puestoInducidos[4], 0, 'los puestos sin persona no inducen');
    assert.ok(pr.personaOcupadaPct.every((x) => x >= 0 && x <= 100 * (480 + 480) / 480));
    const series = s.resultado.series;
    assert.ok(series.clasificados.length >= 32, 'al menos los 32 cuartos de hora del turno');
    assert.equal(series.clasificados.length, series.filaInduccionMax.length);
    assert.equal(series.clasificados.reduce((a, b) => a + b, 0), k.clasificados, 'la serie de clasificados suma todos los clasificados');
    // la contrapresión frena a los andenes, no a los reingresos del puesto manual (regla 12): la fila puede pasar los 120 lugares
    // solo por paquetes que vuelven del manual (NOTAS-CONTRATO §4; el control exacto está en invariantes.test.ts)
    const reingresos = s.resultado.porRecurso.puestoInducidos.reduce((a, b) => a + b, 0) - (k.paquetes - contarNoTransportables(h));
    assert.ok(Math.max(...series.filaInduccionMax) <= 120 + reingresos, 'la fila supera los lugares solo por reingresos del manual');
  }
  fines.sort((a, b) => a - b);
  const mediana = fines[NOCHES >> 1];
  assert.ok(dentro(mediana), `la mediana del fin (${mediana} min) tiene que estar entre ${FIN_MIN} y ${FIN_MAX}`);
  assert.ok(nominales >= 15, `hubo ${nominales} noches sin golpes para controlar`);
  // El criterio literal no se puede cumplir con esta plantilla y esta semilla, y la prueba lo deja asentado: si un día deja de ser
  // así (otra plantilla, otras direcciones), esta línea avisa que §9 ya se puede pedir al pie de la letra.
  assert.ok(imposibles >= 1, `se esperaba al menos una noche imposible de terminar en ${FIN_MAX} min por la inducción sola y hubo ${imposibles}`);
  // Lo que §9 pide al pie de la letra, a la vista en la salida de la prueba (NOTAS-CONTRATO §13: con hub-chico@1.0.0 no se puede).
  t.diagnostic(`§9 al pie de la letra: ${enRango} de ${NOCHES} noches con el fin entre ${FIN_MIN} y ${FIN_MAX} min. ` +
    `Fuera, cada una con su golpe confirmado por contrafactual: ${fuera.join('; ') || 'ninguna'}.`);
});

test(`§9 al pie de la letra es imposible en ${NOCHES} noches de hub-chico@1.0.0 con su semilla: certificado sin correr el hub`, (t) => {
  const m = chico();
  assert.equal(m.experimento.semilla, SEMILLA, 'las 50 noches son las de la semilla de la plantilla (experimento.semilla)');
  const imposibles: { r: number; c: CotaSinHub }[] = [];
  for (let r = 0; r < NOCHES; r++) {
    const c = cotaSinHub(m, SEMILLA, r);
    if (c.cota > FIN_MAX) imposibles.push({ r, c });
  }
  assert.ok(imposibles.length >= 1,
    `se esperaba al menos una noche en la que la inducción sola pase los ${FIN_MAX} min y no hubo ninguna: §9 ya se podría pedir al pie de la letra`);
  // Control cruzado con el hub en esas noches: sorteó lo mismo (paquetes, transportables, inductores y la misma suma de tiempos base) y
  // su fin no queda antes de la cota. Si el hub sorteara con otras direcciones, esto lo diría.
  for (const { r, c } of imposibles) {
    const s = noche(chico(), r), k = s.resultado.kpi, donde = `réplica ${r}`;
    assert.equal(k.paquetes, c.paquetes, `${donde}: paquetes del hub contra los de las direcciones de §6.3`);
    assert.equal(k.paquetes - contarNoTransportables(s.hub), c.transportables, `${donde}: transportables del hub contra los de §6.3`);
    assert.equal(k.inductoresPresentes, c.presentes, `${donde}: inductores presentes del hub contra las faltas de §6.3`);
    assert.equal(cotaInduccionMin(s.hub, k.inductoresPresentes), c.cota, `${donde}: Σ de tiempos base del hub contra la de §6.3`);
    assert.ok(k.finClasificacionMin >= c.cota, `${donde}: el hub termina en ${k.finClasificacionMin} min, antes de la cota ${c.cota} min`);
  }
  t.diagnostic(`Imposibles por §6.7 con la semilla ${SEMILLA}: ` + imposibles.map(({ r, c }) =>
    `r${r} (${c.presentes} de ${m.personas.induccion.puestosActivos} inductores, retén ${m.personas.induccion.reten}, ` +
    `${c.transportables} transportables: ${c.cota.toFixed(1)} min solo de inducción)`).join('; ') + '.');
});

test(`§9 al pie de la letra en ${NOCHES} noches de hub-chico@1.0.0 (PENDIENTE de la integración)`, {
  todo: 'imposible con hub-chico@1.0.0 y su semilla (certificado arriba, sin correr el hub; NOTAS-CONTRATO §13): la integración decide si publica hub-chico@1.1.0 o corrige §9',
}, () => {
  const faltas: string[] = [];
  for (let r = 0; r < NOCHES; r++) faltas.push(...faltasLiterales(literalChico100(r), `réplica ${r}`));
  assert.deepEqual(faltas, [], `§9 literal con hub-chico@1.0.0: ${faltas.length} faltas en ${NOCHES} noches`);
});

test(`KPI sanos al pie de la letra (§9) en ${NOCHES} noches de la propuesta hub-chico@1.1.0 (NOTAS-CONTRATO §13)`, () => {
  const faltas: string[] = [];
  for (let r = 0; r < NOCHES; r++) {
    const s = noche(propuestaChico110(), r);
    faltas.push(...faltasLiterales(literalDe(s.resultado.kpi, s.resultado.alertas), `propuesta 1.1.0, réplica ${r}`));
  }
  assert.deepEqual(faltas, [], `§9 literal con la propuesta hub-chico@1.1.0: ${faltas.length} faltas en ${NOCHES} noches`);
});
