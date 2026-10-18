// Las 11 distribuciones (corte-1.md §6.6): media y varianza dentro de 3,29 errores estándar en 10^6 sorteos, consumo fijo de
// uniformes (CONSUMO) contando índices y bloques Philox, igualdad bit a bit con la referencia y errores claros.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearFuenteAzar } from '../azar/fuente.ts';
import { crearSorteador } from '../azar/distribuciones.ts';
import { claveDe } from '../azar/clave.ts';
import { det } from '../matematica/det.ts';
import { CONSUMO, type Direccion, type Distribucion } from '../../contratos/azar.ts';
import { crearFuenteAzarReferencia } from '../../contratos/referencia/motor-referencia.ts';
import { DISTRIBUCIONES_DE_PRUEBA } from './modelos-sinteticos.ts';

const Z = 3.29;
const N = 1_000_000;

interface Caso { dist: Distribucion; media: number; varianza: number }
const RAIZ_PI = Math.sqrt(Math.PI);
const CASOS: Caso[] = [
  { dist: { tipo: 'fija', valor: 3.5 }, media: 3.5, varianza: 0 },
  { dist: { tipo: 'uniforme', min: -300, max: 600 }, media: 150, varianza: (900 * 900) / 12 },
  { dist: { tipo: 'exponencial', media: 2700 }, media: 2700, varianza: 2700 * 2700 },
  { dist: { tipo: 'triangular', min: 1, moda: 2, max: 6 }, media: 3, varianza: (1 + 4 + 36 - 2 - 6 - 12) / 18 },
  { dist: { tipo: 'normal', media: 10, desvio: 2 }, media: 10, varianza: 4 },
  { dist: { tipo: 'lognormal', media: 2.4, cv: 0.35 }, media: 2.4, varianza: (0.35 * 2.4) * (0.35 * 2.4) },
  { dist: { tipo: 'erlang', k: 3, media: 6 }, media: 6, varianza: 36 / 3 },
  // Weibull de forma 2: media = escala·Γ(1,5) = escala·√π/2; varianza = escala²·(1 − π/4).
  { dist: { tipo: 'weibull', forma: 2, escala: 3 }, media: 3 * RAIZ_PI / 2, varianza: 9 * (1 - Math.PI / 4) },
  { dist: { tipo: 'bernoulli', p: 0.015 }, media: 0.015, varianza: 0.015 * 0.985 },
  // Discreta 0…4 con pesos 5:4:3:2:1 (no normalizados a propósito): E = 20/15, E[X²] = 50/15.
  { dist: { tipo: 'discreta', valores: [0, 1, 2, 3, 4], pesos: [5, 4, 3, 2, 1] }, media: 20 / 15, varianza: 50 / 15 - (20 / 15) * (20 / 15) },
  // Empírica con interpolación lineal sobre 1, 2, 4, 8, 16: cuatro tramos uniformes equiprobables.
  { dist: { tipo: 'empirica', valores: [1, 2, 4, 8, 16] }, media: 22.5 / 4, varianza: 595 / 12 - (22.5 / 4) * (22.5 / 4) },
];

test('las 11 distribuciones: media y varianza dentro de 3,29 ee en 1.000.000 de sorteos', () => {
  assert.equal(CASOS.length, 11);
  assert.deepEqual(new Set(CASOS.map((c) => c.dist.tipo)), new Set(Object.keys(CONSUMO)), 'tienen que estar los 11 tipos del contrato');
  const f = crearFuenteAzar(20261017, 0);
  for (const caso of CASOS) {
    const d: Direccion = { clave: claveDe('prueba.distribuciones', caso.dist.tipo), a: 0, b: 0, c: 0 };
    // Momentos con el método de Welford (estable) hasta el cuarto momento central.
    let n = 0, media = 0, m2 = 0, m3 = 0, m4 = 0;
    for (let i = 0; i < N; i++) {
      d.a = i;
      const x = f.sortear(caso.dist, d);
      const n1 = n; n++;
      const delta = x - media, dn = delta / n, dn2 = dn * dn, t1 = delta * dn * n1;
      media += dn;
      m4 += t1 * dn2 * (n * n - 3 * n + 3) + 6 * dn2 * m2 - 4 * dn * m3;
      m3 += t1 * dn * (n - 2) - 3 * dn * m2;
      m2 += t1;
    }
    const s2 = m2 / (n - 1), mu4 = m4 / n;
    if (caso.varianza === 0) {
      assert.equal(media, caso.media, `${caso.dist.tipo}: media`);
      assert.equal(s2, 0, `${caso.dist.tipo}: varianza`);
      continue;
    }
    const eeMedia = Math.sqrt(caso.varianza / n);
    const zMedia = (media - caso.media) / eeMedia;
    assert.ok(Math.abs(zMedia) <= Z, `${caso.dist.tipo}: media esperada ${caso.media}, simulada ${media} (z = ${zMedia.toFixed(2)}, tope ±${Z})`);
    // Error estándar de la varianza muestral: √((μ4 − σ⁴) / n), con μ4 estimado de la muestra.
    const eeVar = Math.sqrt(Math.max(mu4 - s2 * s2, 0) / n);
    const zVar = (s2 - caso.varianza) / eeVar;
    assert.ok(Math.abs(zVar) <= Z, `${caso.dist.tipo}: varianza esperada ${caso.varianza}, simulada ${s2} (z = ${zVar.toFixed(2)}, tope ±${Z})`);
  }
});

test('normal recortada: nunca sale de [min, max] y la masa en los bordes es la de la normal', () => {
  const f = crearFuenteAzar(3, 0);
  const dist: Distribucion = { tipo: 'normal', media: 0, desvio: 1, min: -1, max: 2 };
  const d: Direccion = { clave: 9, a: 0, b: 0, c: 0 };
  let enMin = 0, enMax = 0, fuera = 0;
  const n = 200_000;
  for (let i = 0; i < n; i++) {
    d.a = i;
    const x = f.sortear(dist, d);
    if (x < -1 || x > 2) fuera++;
    if (x === -1) enMin++;
    if (x === 2) enMax++;
  }
  assert.equal(fuera, 0);
  // P(Z < −1) = 0,158655; P(Z > 2) = 0,0227501.
  for (const [obs, p, nombre] of [[enMin, 0.158655, 'mín'], [enMax, 0.0227501, 'máx']] as [number, number, string][]) {
    const z = (obs / n - p) / Math.sqrt(p * (1 - p) / n);
    assert.ok(Math.abs(z) <= Z, `masa en el ${nombre}: esperada ${p}, observada ${obs / n} (z = ${z.toFixed(2)})`);
  }
});

test('consumo de uniformes igual a CONSUMO: índices 0…consumo−1 y ⌈consumo/2⌉ bloques Philox por sorteo', () => {
  const casos: Distribucion[] = [...DISTRIBUCIONES_DE_PRUEBA, { tipo: 'erlang', k: 1, media: 1 }, { tipo: 'erlang', k: 8, media: 1 },
    { tipo: 'erlang', k: 512, media: 1 }];
  for (const dist of casos) {
    const consumo = CONSUMO[dist.tipo] === 'k' ? (dist as { k: number }).k : (CONSUMO[dist.tipo] as number);
    // (a) Índices pedidos, contados con una fuente de uniformes instrumentada.
    for (let rep = 0; rep < 50; rep++) {
      const pedidos: number[] = [];
      const fuente = crearFuenteAzar(11, rep);
      const sortear = crearSorteador((d, i) => { pedidos.push(i); return fuente.uniforme(d, i); }, det);
      sortear(dist, { clave: 5, a: rep, b: 0, c: 0 });
      const distintos = [...new Set(pedidos)].sort((x, y) => x - y);
      assert.deepEqual(distintos, Array.from({ length: consumo }, (_, i) => i),
        `${dist.tipo}: se esperaban los uniformes 0…${consumo - 1} y se pidieron ${JSON.stringify(distintos)}`);
    }
    // (b) Bloques Philox efectivamente calculados por la fuente del núcleo, con direcciones distintas en cada sorteo.
    const f = crearFuenteAzar(11, 0);
    const antes = f.bloquesCalculados;
    for (let i = 0; i < 100; i++) f.sortear(dist, { clave: 5, a: i, b: 0, c: 0 });
    const porSorteo = (f.bloquesCalculados - antes) / 100;
    assert.equal(porSorteo, Math.ceil(consumo / 2), `${dist.tipo}: se esperaban ${Math.ceil(consumo / 2)} bloques Philox por sorteo y salieron ${porSorteo}`);
  }
});

test('sortear coincide bit a bit con la referencia en 50.000 sorteos por distribución, intercalados', () => {
  const f = crearFuenteAzar(20261017, 7), g = crearFuenteAzarReferencia(20261017, 7);
  const todas: Distribucion[] = [...CASOS.map((c) => c.dist), ...DISTRIBUCIONES_DE_PRUEBA,
    { tipo: 'lognormal', media: 90, cv: 0.8 }, { tipo: 'lognormal', media: 5, cv: 0.5 }, { tipo: 'normal', media: 1, desvio: 5, max: 3 }];
  const d: Direccion = { clave: claveDe('prueba', 'diferencial'), a: 0, b: 0, c: 0 };
  let distintos = 0, primero = '';
  for (let i = 0; i < 50_000; i++) {
    for (let j = 0; j < todas.length; j++) {
      d.a = i; d.b = j; d.c = i % 4;
      const x = f.sortear(todas[j], d), y = g.sortear(todas[j], d);
      if (!Object.is(x, y)) { distintos++; if (!primero) primero = `${todas[j].tipo} en a=${i}: núcleo ${x} · referencia ${y}`; }
    }
  }
  assert.equal(distintos, 0, `se esperaban 0 diferencias con la referencia y hubo ${distintos} (primera: ${primero})`);
});

test('errores claros en distribuciones mal formadas', () => {
  const f = crearFuenteAzar(1, 1), d: Direccion = { clave: 1, a: 0, b: 0, c: 0 };
  assert.throws(() => f.sortear({ tipo: 'erlang', k: 0, media: 1 }, d), /erlang: se esperaba k entero entre 1 y 512 y se recibió 0/);
  assert.throws(() => f.sortear({ tipo: 'erlang', k: 2.5, media: 1 }, d), RangeError);
  assert.throws(() => f.sortear({ tipo: 'erlang', k: 513, media: 1 }, d), RangeError);
  assert.throws(() => f.sortear({ tipo: 'discreta', valores: [1, 2], pesos: [1] }, d), /discreta: se esperaban valores y pesos del mismo largo/);
  assert.throws(() => f.sortear({ tipo: 'discreta', valores: [], pesos: [] }, d), RangeError);
  assert.throws(() => f.sortear({ tipo: 'empirica', valores: [] }, d), /empirica: se esperaba al menos un valor/);
  assert.throws(() => f.sortear({ tipo: 'gamma' } as unknown as Distribucion, d), /distribución desconocida: .*«gamma»/);
});
