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

test('sin diferencia verdadera no se distingue y se estima cuántas noches harían falta (prueba del signo con 80% de poder)', () => {
  const { a, b } = parejas('esperaP90Min', 20, 0.05, 10, 2, 99);
  const c = comparar(a, b, 'esperaP90Min', 0.95);
  assert.equal(c.veredicto, 'no-se-distingue');
  assert.ok(c.pValor > 0.05, `p = ${c.pValor}`);
  assert.equal(c.bMenor + c.bMayor + c.empates, 20);
  if (c.bMenor === c.bMayor) { assert.equal(c.replicasSugeridas, null); return; }
  const q = Math.max(c.bMenor, c.bMayor) / (c.bMenor + c.bMayor);
  const r = (1.959963984540054 * 0.5 + 0.8416212335729143 * Math.sqrt(q * (1 - q))) / (q - 0.5);
  const esperado = Math.max(21, Math.ceil(r * r / ((c.bMenor + c.bMayor) / 20)));
  assert.ok(c.replicasSugeridas !== null && Math.abs(c.replicasSugeridas - esperado) <= 1, `replicasSugeridas = ${c.replicasSugeridas}; se esperaba ${esperado}`);
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
  // la media y su IC de t quedan como dato; el veredicto es la prueba del signo: 5 de 5 noches con B más caro da p = 2/32 = 0,0625
  cerca(c.pValor, 0.0625, 1e-12, 'p del signo con 5 de 5');
  assert.equal(c.veredicto, 'no-se-distingue', 'con 5 noches la prueba del signo no alcanza el 5% aunque todas vayan para el mismo lado');
  const a6 = [...a, resultadoFalso({ replica: 5, kpi: { costoNoche: 10 } })], b6 = [...b, resultadoFalso({ replica: 5, kpi: { costoNoche: 16 } })];
  const c6 = comparar(a6, b6, 'costoNoche', 0.95);
  cerca(c6.pValor, 0.03125, 1e-12, 'p del signo con 6 de 6');
  assert.equal(c6.veredicto, 'a-mejor', 'costoNoche: menos es mejor y B cuesta más en las 6 noches');
});

/** Diferencias con la anatomía MEDIDA en hub-chico (puestos 3 → 4, espera P90; hallazgo EST-02): casi todas las noches B baja un poco,
 *  y una de cada 40, B sube de 100 a 250 min. Mediana real −1,24; media real ≈ −1,21 + 0,025 · 175 ≈ +3,2 (otro signo). */
function colaPesada(u: () => number): number {
  return u() < 0.025 ? 100 + 150 * u() : -1.24 + normalEstandar(u);
}

test('EST-02 · colas pesadas: el veredicto habla de la mayoría de las noches (signo), cuenta las atípicas y no se deja llevar por la media', () => {
  const u = generadorUniformes(2026, 9);
  const a = [], b = [];
  for (let i = 0; i < 40; i++) {
    const z = i === 7 || i === 23 ? 180 + i : -1.24 + normalEstandar(u);   // dos noches con B mucho peor
    a.push(resultadoFalso({ semilla: 7, replica: i, kpi: { esperaP90Min: 30 } }));
    b.push(resultadoFalso({ semilla: 7, replica: i, kpi: { esperaP90Min: 30 + z } }));
  }
  const c = comparar(a, b, 'esperaP90Min', 0.95);
  assert.ok(c.media > 0, `la media (${c.media}) la arrastran las dos noches malas`);
  assert.ok(c.mediana < 0, `la noche típica (${c.mediana}) es mejor con B`);
  assert.equal(c.veredicto, 'b-mejor', 'en la mayoría de las noches B espera menos');
  assert.equal(c.atipicos.peorB, 2, 'las dos noches malas se cuentan aparte');
  assert.ok(c.atipicos.maxPeor >= 180, `la peor diferencia (${c.atipicos.maxPeor}) se informa`);
  assert.ok(c.asimetria > 2, `asimetría ${c.asimetria}`);
  assert.ok(c.icMediana !== null && c.icMediana[1] < 0, `el IC de la mediana [${c.icMediana}] queda del lado de B`);
});

test('EST-02 · cobertura con colas pesadas (2.000 confirmaciones de 40 noches, semilla fija): el IC de la mediana cubre ≥ 93%; el de t no cubre la media', () => {
  const u = generadorUniformes(20261118, 4);
  const N = 2000, n = 40, medianaReal = -1.24 + 0.0251;   // la mediana de la mezcla (el 2,5% de arriba corre el cuantil 0,5 un poquito)
  // la mediana y la media reales, con un millón de muestras de la misma mezcla
  const grande = Float64Array.from({ length: 1_000_000 }, () => colaPesada(u)).sort();
  const med = grande[500_000];
  let mediaReal = 0;
  for (let i = 0; i < grande.length; i++) mediaReal += grande[i];
  mediaReal /= grande.length;
  assert.ok(Math.abs(med - medianaReal) < 0.05, `mediana de la mezcla ${med}`);
  let cubreMediana = 0, cubreMedia = 0, signoContrario = 0;
  for (let k = 0; k < N; k++) {
    const a = [], b = [];
    for (let i = 0; i < n; i++) {
      a.push(resultadoFalso({ semilla: 1, replica: i, kpi: { esperaP90Min: 50 } }));
      b.push(resultadoFalso({ semilla: 1, replica: i, kpi: { esperaP90Min: 50 + colaPesada(u) } }));
    }
    const c = comparar(a, b, 'esperaP90Min', 0.95);
    if (c.icMediana && c.icMediana[0] <= med && med <= c.icMediana[1]) cubreMediana++;
    if (c.ic[0] <= mediaReal && mediaReal <= c.ic[1]) cubreMedia++;
    // «A es mejor» cuando en la mayoría de las noches B es mejor: el error que importa
    if (c.veredicto === 'a-mejor') signoContrario++;
  }
  assert.ok(cubreMediana / N >= 0.93, `el IC de la mediana cubrió ${(100 * cubreMediana / N).toFixed(1)}%`);
  assert.ok(cubreMedia / N < 0.9, `el IC de t cubrió la media ${(100 * cubreMedia / N).toFixed(1)}%: por eso ya no decide`);
  assert.equal(signoContrario, 0, 'nunca «A es mejor» cuando B es mejor en casi todas las noches');
});

test('EST-02 · sin diferencia en la noche típica (mediana 0) pero con cola: la prueba del signo no inventa un veredicto (≤ 5% + 3 ee)', () => {
  const u = generadorUniformes(77, 2);
  // mitad de las noches B baja hasta 1 y la otra mitad sube hasta 20: mediana 0 (P(Z < 0) = P(Z > 0) = ½) y media +4,75
  let falsos = 0;
  const N = 2000;
  for (let k = 0; k < N; k++) {
    const a = [], b = [];
    for (let i = 0; i < 40; i++) {
      const z = u() < 0.5 ? -u() : 20 * u();
      a.push(resultadoFalso({ semilla: 3, replica: i, kpi: { costoNoche: 100 } }));
      b.push(resultadoFalso({ semilla: 3, replica: i, kpi: { costoNoche: 100 + z } }));
    }
    if (comparar(a, b, 'costoNoche', 0.95).veredicto !== 'no-se-distingue') falsos++;
  }
  const tasa = falsos / N, ee = Math.sqrt(0.05 * 0.95 / N);
  assert.ok(tasa <= 0.05 + 3 * ee, `veredicto falso en ${(100 * tasa).toFixed(2)}% (máximo 5% + 3 ee)`);
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
