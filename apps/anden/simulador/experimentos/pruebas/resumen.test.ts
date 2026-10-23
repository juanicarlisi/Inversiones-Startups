// resumir, proporcion y R07 (el resumen no depende del orden de llegada ni de cuántos trabajadores corrieron).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ordenarPorReplica, proporcion, resumir } from '../estadistica/resumen.ts';
import { cuantilT } from '../estadistica/t-student.ts';
import { crearPlanificador } from '../planificador.ts';
import { trabajadorEnProceso } from '../en-proceso.ts';
import { barajar, exponencial, generadorUniformes, resultadoFalso, validadoEjemplo } from './ayudas.ts';
import type { Simulador } from '../../contratos/experimentos.ts';
import type { ResultadoReplica } from '../../contratos/resultados.ts';

const cerca = (real: number, esperado: number, tol: number, que: string) =>
  assert.ok(Math.abs(real - esperado) <= tol, `${que}: se esperaba ${esperado} (±${tol}) y salió ${real}`);

const conValores = (valores: number[], kpi: 'esperaP90Min' | 'costoNoche' = 'esperaP90Min') =>
  valores.map((v, i) => resultadoFalso({ replica: i, kpi: { [kpi]: v } }));

test('resumir: media, desvío, IC de t, P50, P90, mínimo y máximo con una muestra armada a mano', () => {
  const r = resumir(conValores([2, 4, 4, 4, 5, 5, 7, 9]), 'esperaP90Min', 0.95);
  assert.equal(r.kpi, 'esperaP90Min'); assert.equal(r.n, 8); assert.equal(r.media, 5);
  cerca(r.desvio, Math.sqrt(32 / 7), 1e-12, 'desvío muestral (n − 1)');
  const semi = cuantilT(0.95, 7) * Math.sqrt(32 / 7) / Math.sqrt(8);
  cerca(r.semiancho, semi, 1e-12, 'semiancho = t(0,975; 7) · s / √n');
  cerca(r.ic[0], 5 - semi, 1e-12, 'IC inferior'); cerca(r.ic[1], 5 + semi, 1e-12, 'IC superior');
  assert.equal(r.confianza, 0.95);
  assert.equal(r.p50, 5, 'P50 de 8 datos: índice ⌊4⌋ = 4 → 5'); assert.equal(r.p90, 9, 'P90 de 8 datos: índice ⌊7,2⌋ = 7 → 9');
  assert.equal(r.min, 2); assert.equal(r.max, 9);
  assert.equal(r.icP90, null, 'con 8 datos no hay IC del P90');
});

test('resumir con n suficiente trae el IC del P90; con una sola corrida lanza error (nunca un intervalo de una corrida)', () => {
  const r = resumir(conValores(Array.from({ length: 60 }, (_, i) => i)), 'esperaP90Min', 0.9);
  assert.ok(r.icP90 !== null && r.icP90[0] <= r.p90 && r.p90 <= r.icP90[1]);
  assert.throws(() => resumir(conValores([3]), 'esperaP90Min', 0.95), /al menos 2 réplicas independientes y llegaron 1: con una sola corrida no hay intervalo/);
  assert.throws(() => resumir([], 'esperaP90Min', 0.95), /al menos 2 réplicas/);
});

test('un KPI constante da desvío y semiancho 0; un KPI desconocido, una confianza no admitida y un NaN lanzan error', () => {
  const r = resumir(conValores([5, 5, 5, 5], 'costoNoche'), 'costoNoche', 0.99);
  assert.equal(r.desvio, 0); assert.equal(r.semiancho, 0); assert.deepEqual(r.ic, [5, 5]);
  assert.throws(() => resumir(conValores([1, 2]), 'inventado' as never, 0.95), /KPI desconocido: «inventado»/);
  assert.throws(() => resumir(conValores([1, 2]), 'esperaP90Min', 0.8), /confianza no admitida/);
  assert.throws(() => resumir(conValores([1, Number.NaN, 3]), 'esperaP90Min', 0.95), /réplica 1 no trae un valor finito para «esperaP90Min»/);
});

test('una réplica repetida o réplicas de modelos distintos lanzan error (no se cuenta dos veces ni se mezclan modelos)', () => {
  const a = conValores([1, 2, 3]);
  assert.throws(() => resumir([...a, a[1]], 'esperaP90Min', 0.95), /réplica 1 \(semilla 1\) aparece más de una vez/);
  const b = [a[0], resultadoFalso({ replica: 1, modelo: 'abcdabcdabcdabcd', kpi: { esperaP90Min: 2 } })];
  assert.throws(() => resumir(b, 'esperaP90Min', 0.95), /mezclan modelos distintos/);
  assert.doesNotThrow(() => resumir([a[0], resultadoFalso({ semilla: 2, replica: 0, kpi: { esperaP90Min: 4 } })], 'esperaP90Min', 0.95),
    'la misma réplica con otra semilla son dos réplicas distintas');
});

test('proporcion: cuenta con <= y >=, trae Wilson y no depende del orden', () => {
  const rs = conValores([0, 0, 0, 1, 2, 5, 0, 0, 3, 0], 'costoNoche');
  const p = proporcion(rs, 'costoNoche', '<=', 0, 0.95);
  assert.equal(p.exitos, 6); assert.equal(p.n, 10); assert.equal(p.p, 0.6); assert.equal(p.metodo, 'wilson'); assert.equal(p.confianza, 0.95);
  assert.ok(p.ic[0] < 0.6 && 0.6 < p.ic[1]);
  assert.equal(proporcion(rs, 'costoNoche', '>=', 2, 0.95).exitos, 3, 'valores ≥ 2: 2, 5 y 3');
  assert.deepEqual(proporcion(barajar(rs, 3), 'costoNoche', '<=', 0, 0.95), p);
  assert.throws(() => proporcion([], 'costoNoche', '<=', 0, 0.95), /al menos una réplica/);
  assert.throws(() => proporcion(rs, 'costoNoche', '<' as never, 0, 0.95), /comparador no admitido/);
  assert.throws(() => proporcion(rs, 'costoNoche', '<=', Number.NaN, 0.95), /umbral tiene que ser un número finito/);
});

test('ordenarPorReplica ordena por réplica y no toca la lista original', () => {
  const orig = [2, 0, 1].map((r) => resultadoFalso({ replica: r }));
  const orden = ordenarPorReplica(orig);
  assert.deepEqual(orden.map((r) => r.replica), [0, 1, 2]);
  assert.deepEqual(orig.map((r) => r.replica), [2, 0, 1]);
});

// ---------- R07 ----------

/** Un simulador falso con valores de magnitudes muy distintas: la suma en punto flotante depende del orden, así que cualquier
 *  agregación «por llegada» se delataría. */
function simuladorRuidoso(): Simulador {
  return (mv, semilla, replica) => {
    const u = generadorUniformes(semilla * 1000 + replica, 3);
    const grande = u() < 0.2 ? 1e12 * u() : u();
    return { resultado: resultadoFalso({ semilla, replica, modelo: mv.huella, kpi: { esperaP90Min: grande + exponencial(u, 1e-3), costoNoche: exponencial(u, 5e5) } }) };
  };
}

async function correrCon(trabajadores: number, sim: Simulador, n: number): Promise<ResultadoReplica[]> {
  const p = crearPlanificador(trabajadorEnProceso(sim, 'prueba'), trabajadores);
  const llegada: ResultadoReplica[] = [];
  const mv = validadoEjemplo();
  const fin = await p.enviar({ id: 'r07', prioridad: 2, mv, semilla: 20261018, replicas: [0, n], traza: 'no' }, (r) => llegada.push(r));
  p.cerrar();
  assert.equal(fin.completadas, n); assert.equal(fin.cancelado, false);
  return llegada;
}

test('R07: el resumen es idéntico bit a bit con 1 o con 3 trabajadores y llegadas desordenadas', async () => {
  const sim = simuladorRuidoso();
  const con1 = await correrCon(1, sim, 60);
  const con3 = await correrCon(3, sim, 60);
  assert.deepEqual(con1.map((r) => r.replica), Array.from({ length: 60 }, (_, i) => i), 'con 1 trabajador las réplicas llegan en orden');
  assert.notDeepEqual(con3.map((r) => r.replica), con1.map((r) => r.replica), 'con 3 trabajadores las réplicas llegan mezcladas (si no, la prueba no prueba nada)');
  for (const kpi of ['esperaP90Min', 'costoNoche'] as const) {
    const a = resumir(con1, kpi, 0.95), b = resumir(con3, kpi, 0.95);
    assert.deepEqual(a, b, `resumen de «${kpi}» con 1 y con 3 trabajadores`);
    assert.equal(JSON.stringify(a), JSON.stringify(b), 'y bit a bit en su serialización');
    for (const sem of [5, 6, 7]) assert.deepEqual(resumir(barajar(con3, sem), kpi, 0.95), a, `y con las réplicas barajadas (${sem})`);
  }
  assert.deepEqual(proporcion(con1, 'costoNoche', '<=', 5e5, 0.95), proporcion(barajar(con3, 9), 'costoNoche', '<=', 5e5, 0.95));
});

test('sumar en orden de llegada cambiaría el resultado: el control de que R07 mide algo', () => {
  const con = (xs: number[]) => { let s = 0; for (const x of xs) s += x; return s / xs.length; };
  const xs = [1e16, 1, -1e16, 1, 1, 1, 1, 1];
  assert.notEqual(con(xs), con([...xs].reverse()), 'la suma en punto flotante depende del orden');
});
