// Wilson, estado de una configuración y las pruebas S12 y S13 de la batería (corte-1.md §7 y §8).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estadoPorWilson, nochesQueFaltan, wilson } from '../estadistica/wilson.ts';
import { estadoConfiguracion, proporcion } from '../estadistica/resumen.ts';
import { matNativa } from '../../contratos/referencia/motor-referencia.ts';
import { generadorUniformes, resultadoFalso } from './ayudas.ts';

const cerca = (real: number, esperado: number, tol: number, que: string) =>
  assert.ok(Math.abs(real - esperado) <= tol, `${que}: se esperaba ${esperado} (±${tol}) y salió ${real}`);

test('controles de §7: 19 de 20 → [0,7639; 0,9911] y 97 de 100 → [0,9155; 0,9897]', () => {
  const [a, b] = wilson(19, 20, 0.95);
  cerca(a, 0.7639, 5e-5, 'Wilson 19/20 inferior'); cerca(b, 0.9911, 5e-5, 'Wilson 19/20 superior');
  const [c, d] = wilson(97, 100, 0.95);
  cerca(c, 0.9155, 5e-5, 'Wilson 97/100 inferior'); cerca(d, 0.9897, 5e-5, 'Wilson 97/100 superior');
});

test('casos borde: 0 de n tiene piso exacto 0, n de n tiene techo exacto 1, y siempre dentro de [0, 1] y contiene a p̂', () => {
  for (const n of [1, 2, 20, 400]) {
    assert.equal(wilson(0, n, 0.95)[0], 0, `0 de ${n}: el inferior es exactamente 0`);
    assert.equal(wilson(n, n, 0.95)[1], 1, `${n} de ${n}: el superior es exactamente 1`);
    for (let k = 0; k <= n; k += Math.max(1, Math.floor(n / 10))) {
      for (const c of [0.9, 0.95, 0.99]) {
        const [lo, hi] = wilson(k, n, c);
        assert.ok(0 <= lo && lo <= k / n && k / n <= hi && hi <= 1, `Wilson(${k}, ${n}, ${c}) = [${lo}, ${hi}] tiene que contener a ${k / n} dentro de [0, 1]`);
      }
    }
  }
});

test('más confianza → intervalo más ancho; más datos → intervalo más angosto', () => {
  const ancho = (k: number, n: number, c: number) => { const [a, b] = wilson(k, n, c); return b - a; };
  assert.ok(ancho(18, 20, 0.9) < ancho(18, 20, 0.95) && ancho(18, 20, 0.95) < ancho(18, 20, 0.99));
  assert.ok(ancho(90, 100, 0.95) < ancho(18, 20, 0.95) && ancho(900, 1000, 0.95) < ancho(90, 100, 0.95));
});

test('entradas inválidas lanzan error con lo esperado y lo recibido', () => {
  assert.throws(() => wilson(5, 0, 0.95), /n tiene que ser un entero ≥ 1 y llegó 0/);
  assert.throws(() => wilson(21, 20, 0.95), /entre 0 y n=20 y llegaron 21/);
  assert.throws(() => wilson(-1, 20, 0.95), /llegaron -1/);
  assert.throws(() => wilson(1.5, 20, 0.95), /llegaron 1.5/);
  assert.throws(() => wilson(5, 20, 0.8), /confianza no admitida/);
});

function resultadosConExitos(exitos: number, n: number) {
  return Array.from({ length: n }, (_, i) => resultadoFalso({ replica: i, kpi: { pendientesAlCorte: i < exitos ? 0 : 2 } }));
}

test('S13: decisión con datos fijos: 19/20 con meta 0,9 → en-duda; 97/100 → cumple; 336/400 → no-cumple', () => {
  const casos: [number, number, string][] = [[19, 20, 'en-duda'], [97, 100, 'cumple'], [336, 400, 'no-cumple']];
  for (const [k, n, esperado] of casos) {
    const prop = proporcion(resultadosConExitos(k, n), 'pendientesAlCorte', '<=', 0, 0.95);
    assert.equal(prop.exitos, k); assert.equal(prop.n, n); assert.equal(prop.metodo, 'wilson');
    assert.equal(estadoConfiguracion(prop, 0.9), esperado, `${k}/${n} con meta 0,9: se esperaba «${esperado}»; Wilson dio [${prop.ic}]`);
  }
});

test('el estado respeta los bordes: lo exactamente igual a la meta cumple; un pelo abajo está en duda', () => {
  assert.equal(estadoPorWilson([0.9, 0.99], 0.9), 'cumple');
  assert.equal(estadoPorWilson([0.8999999, 0.99], 0.9), 'en-duda');
  assert.equal(estadoPorWilson([0.7, 0.8999999], 0.9), 'no-cumple');
  assert.equal(estadoPorWilson([0.7, 0.9], 0.9), 'en-duda');
});

test('S12 (exacto): la cobertura del Wilson 95% para p = 0,9 y n = 100 sumando la binomial está entre 93% y 97%', () => {
  const { log, exp } = matNativa;
  const lnC = (n: number, k: number) => { let s = 0; for (let i = 1; i <= k; i++) s += log((n - k + i) / i); return s; };
  let cobertura = 0;
  for (let k = 0; k <= 100; k++) {
    const [lo, hi] = wilson(k, 100, 0.95);
    if (lo <= 0.9 && 0.9 <= hi) cobertura += exp(lnC(100, k) + k * log(0.9) + (100 - k) * log(0.1));
  }
  assert.ok(cobertura >= 0.93 && cobertura <= 0.97, `cobertura exacta ${(cobertura * 100).toFixed(2)}%: se esperaba entre 93% y 97%`);
});

/** Una pasada de S12: `reps` repeticiones de 100 pruebas Bernoulli(0,9); cobertura del Wilson. */
function coberturaWilson(semilla: number, reps: number): number {
  const u = generadorUniformes(semilla, 21);
  let cubre = 0;
  for (let r = 0; r < reps; r++) {
    let k = 0;
    for (let i = 0; i < 100; i++) if (u() < 0.9) k++;
    const [lo, hi] = wilson(k, 100, 0.95);
    if (lo <= 0.9 && 0.9 <= hi) cubre++;
  }
  return cubre / reps;
}

test('S12: cobertura del IC de Wilson al 95% para p = 0,9 y n = 100 en 2.000 repeticiones: entre 93% y 97%', () => {
  let cobertura = coberturaWilson(20261018, 2000);
  let nota = '';
  if (!(cobertura >= 0.93 && cobertura <= 0.97)) {
    // Política de falsa alarma de §8: se re-corre sola con otra semilla y 4 veces más repeticiones.
    nota = ` (primera pasada ${(cobertura * 100).toFixed(2)}%, re-corrida con otra semilla y 4× repeticiones)`;
    cobertura = coberturaWilson(20261019, 8000);
  }
  assert.ok(cobertura >= 0.93 && cobertura <= 0.97, `cobertura simulada ${(cobertura * 100).toFixed(2)}%${nota}: se esperaba entre 93% y 97%`);
});

test('nochesQueFaltan: estimación de cuántas noches más sacan la duda (19/20 con meta 0,9 → 119; ya resuelto → 0; p̂ = meta → null)', () => {
  assert.equal(nochesQueFaltan(19, 20, 0.9, 0.95), 119);
  assert.equal(nochesQueFaltan(97, 100, 0.9, 0.95), 0);          // ya cumple
  assert.equal(nochesQueFaltan(336, 400, 0.9, 0.95), 0);         // ya no cumple
  assert.equal(nochesQueFaltan(18, 20, 0.9, 0.95), null);        // p̂ = 0,9 = meta: nunca se resuelve
  // Con ese número de noches más, el Wilson de la misma proporción ya no cruza la meta (y con una menos, todavía sí).
  const f = nochesQueFaltan(19, 20, 0.9, 0.95)!;
  const estadoCon = (m: number) => estadoPorWilson(wilson(Math.round((19 / 20) * m), m, 0.95), 0.9);
  assert.notEqual(estadoCon(20 + f + 1), 'en-duda');   // el redondeo de los éxitos mueve ±1: se verifica un pelo más arriba
  assert.equal(nochesQueFaltan(1, 2, 0.9, 0.95), 1, '1 de 2 contra 0,9: con una noche más (p̂ = 1/3) el Wilson ya no llega a la meta');
  assert.equal(nochesQueFaltan(9001, 10000, 0.9, 0.95), null, 'p̂ = 0,9001 contra 0,9 necesitaría ~34 millones de noches: más que el tope, null');
});
