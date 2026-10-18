// Comparación pareada con números comunes (corte-1.md §7).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comparar, tieneSentido } from '../estadistica/pareada.ts';
import { cuantilT } from '../estadistica/t-student.ts';
import { barajar, generadorUniformes, normalEstandar, resultadoFalso } from './ayudas.ts';
import type { KpiId } from '../../contratos/resultados.ts';

const cerca = (real: number, esperado: number, tol: number, que: string) =>
  assert.ok(Math.abs(real - esperado) <= tol, `${que}: se esperaba ${esperado} (±${tol}) y salió ${real}`);

/** A y B con ruido común (la misma suerte) y una diferencia verdadera `delta` (B − A). */
function parejas(kpi: KpiId, n: number, delta: number, sdComun = 10, sdPropio = 0.5, semilla = 41) {
  const u = generadorUniformes(semilla, 3);
  const a = [], b = [];
  for (let i = 0; i < n; i++) {
    const comun = 100 + sdComun * normalEstandar(u);
    a.push(resultadoFalso({ semilla: 7, replica: i, kpi: { [kpi]: comun + sdPropio * normalEstandar(u) } }));
    b.push(resultadoFalso({ semilla: 7, replica: i, kpi: { [kpi]: comun + delta + sdPropio * normalEstandar(u) } }));
  }
  return { a, b };
}

test('diferencia conocida (+3) con ruido común enorme: la pareada la ve y el IC la contiene', () => {
  const { a, b } = parejas('clasificados', 30, 3);
  const c = comparar(a, b, 'clasificados', 0.95);
  assert.equal(c.n, 30); assert.equal(c.pareada, true); assert.equal(c.kpi, 'clasificados');
  assert.ok(c.ic[0] <= 3 && 3 <= c.ic[1], `el IC [${c.ic}] tiene que contener la diferencia verdadera 3`);
  assert.ok(c.ic[1] - c.ic[0] < 1, `con ruido común el IC pareado tiene que ser angosto y salió [${c.ic}]`);
  assert.equal(c.veredicto, 'b-mejor', 'clasificados: más es mejor y B − A > 0');
  assert.equal(c.replicasSugeridas, null, 'si se distingue no hacen falta réplicas extra');
});

test('el sentido del KPI decide quién es mejor: con la misma diferencia +3, «más es mejor» da b-mejor y «menos es mejor» da a-mejor', () => {
  const mas = parejas('clasificados', 30, 3), menos = parejas('pendientesAlCorte', 30, 3);
  assert.equal(comparar(mas.a, mas.b, 'clasificados', 0.95).veredicto, 'b-mejor');
  assert.equal(comparar(menos.a, menos.b, 'pendientesAlCorte', 0.95).veredicto, 'a-mejor');
  const baja = parejas('esperaP90Min', 30, -3);
  assert.equal(comparar(baja.a, baja.b, 'esperaP90Min', 0.95).veredicto, 'b-mejor', 'menos espera en B → B mejor');
  const bajaMas = parejas('pctAlCorte', 30, -3);
  assert.equal(comparar(bajaMas.a, bajaMas.b, 'pctAlCorte', 0.95).veredicto, 'a-mejor', 'menos % al corte en B → A mejor');
});

test('sin diferencia verdadera no se distingue y se estima cuántas réplicas harían falta (fórmula de §7)', () => {
  const { a, b } = parejas('esperaP90Min', 20, 0.05, 10, 2, 99);
  const c = comparar(a, b, 'esperaP90Min', 0.95);
  assert.equal(c.veredicto, 'no-se-distingue');
  assert.ok(c.ic[0] <= 0 && 0 <= c.ic[1]);
  const semiancho = (c.ic[1] - c.ic[0]) / 2;
  const razon = semiancho / (Math.abs(c.media) / 2);
  const esperado = Math.ceil(20 * razon * razon);
  assert.ok(c.replicasSugeridas !== null && Math.abs(c.replicasSugeridas - esperado) <= 1, `replicasSugeridas = ${c.replicasSugeridas}: se esperaba ⌈n·(semiancho ÷ (|media|/2))²⌉ = ${esperado}`);
  assert.ok(c.replicasSugeridas! >= 4 * 20, 'si el IC cruza el cero, el semiancho ≥ |media|, así que hacen falta al menos 4 veces las réplicas');
});

test('media exactamente 0 y sin variación: no se distingue y replicasSugeridas es null', () => {
  const a = [0, 1, 2, 3].map((i) => resultadoFalso({ replica: i, kpi: { costoNoche: 100 } }));
  const c = comparar(a, a.map((r) => ({ ...r })), 'costoNoche', 0.95);
  assert.equal(c.media, 0); assert.equal(c.veredicto, 'no-se-distingue'); assert.equal(c.replicasSugeridas, null);
  assert.deepEqual(c.ic, [0, 0]);
});

test('IC de t sobre las diferencias: valores armados a mano (Z = 1, 2, 3, 4, 5 → media 3, s = √2,5)', () => {
  const a = [0, 1, 2, 3, 4].map((i) => resultadoFalso({ replica: i, kpi: { costoNoche: 10 } }));
  const b = [0, 1, 2, 3, 4].map((i) => resultadoFalso({ replica: i, kpi: { costoNoche: 10 + i + 1 } }));
  const c = comparar(a, b, 'costoNoche', 0.95);
  const semi = cuantilT(0.95, 4) * Math.sqrt(2.5) / Math.sqrt(5);
  cerca(c.media, 3, 1e-12, 'media de B − A'); cerca(c.ic[0], 3 - semi, 1e-12, 'IC inferior'); cerca(c.ic[1], 3 + semi, 1e-12, 'IC superior');
  assert.equal(c.veredicto, 'a-mejor', 'costoNoche: menos es mejor y B cuesta más');
});

test('llegadas desordenadas: se parea por réplica, no por posición', () => {
  const { a, b } = parejas('clasificados', 30, 3);
  assert.deepEqual(comparar(barajar(a, 1), barajar(b, 2), 'clasificados', 0.95), comparar(a, b, 'clasificados', 0.95));
});

test('lanza si no es la misma semilla y réplica (con qué pareja y qué llegó), si faltan réplicas o si hay menos de 2', () => {
  const { a, b } = parejas('clasificados', 5, 1);
  const otraSemilla = b.map((r, i) => (i === 3 ? { ...r, semilla: 8 } : r));
  assert.throws(() => comparar(a, otraSemilla, 'clasificados', 0.95), /la pareja 3 no coincide: A es \(semilla 7, réplica 3\) y B es \(semilla 8, réplica 3\)/);
  assert.throws(() => comparar(a, b.slice(0, 4), 'clasificados', 0.95), /A tiene 5 réplicas y B tiene 4/);
  const desplazadas = b.map((r) => ({ ...r, replica: r.replica + 1 }));
  assert.throws(() => comparar(a, desplazadas, 'clasificados', 0.95), /no coincide/);
  assert.throws(() => comparar(a.slice(0, 1), b.slice(0, 1), 'clasificados', 0.95), /al menos 2 réplicas pareadas y llegaron 1/);
});

test('un KPI neutro (sin «mejor» ni «peor») lanza error en vez de inventar un veredicto', () => {
  const { a, b } = parejas('paquetes', 5, 1);
  assert.throws(() => comparar(a, b, 'paquetes', 0.95), /«paquetes» es neutro/);
  assert.equal(tieneSentido('paquetes'), false); assert.equal(tieneSentido('utilInduccionPct'), false);
  assert.equal(tieneSentido('costoNoche'), true); assert.equal(tieneSentido('clasificados'), true);
});

test('con la misma suerte la diferencia se ve con muchas menos noches que con suerte distinta (el sentido de la pareada)', () => {
  const { a, b } = parejas('clasificados', 20, 2, 20, 0.5, 5);
  const pareada = comparar(a, b, 'clasificados', 0.95);
  // Mismas listas pero «des-pareadas»: B con suerte de otras réplicas. El IC del desfasaje es mucho más ancho.
  const desfasado = b.map((r, i) => ({ ...r, kpi: { ...r.kpi, clasificados: b[(i + 7) % b.length].kpi.clasificados } }));
  const independiente = comparar(a, desfasado, 'clasificados', 0.95);
  assert.ok((pareada.ic[1] - pareada.ic[0]) * 5 < independiente.ic[1] - independiente.ic[0],
    `IC pareado [${pareada.ic}] contra IC sin números comunes [${independiente.ic}]: se esperaba al menos 5 veces más angosto`);
});
