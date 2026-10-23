// hub/pruebas/lazo.test.ts · P4 · L01 a L06 (corte-1.md §8): el sorter de bandejas contra la teoría.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TipoTramo, type Traza } from '../../contratos/traza.ts';
import { compilarConfig } from '../config.ts';
import { mod } from '../bloques/comun.ts';
import { chico, fija, lazoSaturado, noche, rampasSinTope, sinRuido } from './modelos.ts';

const HORA = 3_600_000, INICIO = 22 * HORA;
/** Ventana de régimen: de 22:30 a 23:30 (desde las 22:30 los tres andenes alimentan más que el lazo). */
const DESDE = INICIO + HORA / 2, HASTA = DESDE + HORA;

function contar(t: Traza, k: number, filtro: (i: number) => boolean = () => true): number {
  const T = t.tramos;
  let n = 0;
  for (let i = 0; i < T.n; i++) if (T.k[i] === k && T.t0[i] >= DESDE && T.t0[i] < HASTA && filtro(i)) n++;
  return n;
}

/** Índices de los tramos de cada paquete, en orden. */
function porPaquete(t: Traza): number[][] {
  const out: number[][] = Array.from({ length: t.paquetes.n }, () => []);
  const T = t.tramos;
  for (let i = 0; i < T.n; i++) if (T.k[i] >= TipoTramo.DESCARGA && T.k[i] <= TipoTramo.MANUAL) out[T.e[i]].push(i);
  return out;
}

test('L01 · lazo saturado: 12.000 colocaciones por hora en régimen (velocidad ÷ paso × 3.600, ± 1)', () => {
  const s = noche(lazoSaturado(), 0, 'completa');
  const n = contar(s.traza!, TipoTramo.BANDEJA, (i) => s.traza!.tramos.a[i] === 0);
  assert.ok(Math.abs(n - 12000) <= 1, `se esperaban 12.000 ± 1 colocaciones y hubo ${n}`);
  assert.deepEqual(s.resultado.alertas, []);
});

test('L02 · con NO-READ 2%: caídas en la rampa correcta en la primera pasada = 11.760 (± 3,29 ee binomial)', () => {
  const m = lazoSaturado(0.02);
  m.personas.excepcion.cantidad = 0; // sin reinducción: cada colocación es un intento 0
  const s = noche(m, 0, 'completa'), t = s.traza!, T = t.tramos, cfg = s.hub.cfg;
  const tramos = porPaquete(t);
  let n = 0;
  for (let i = 0; i < T.n; i++) {
    if (T.k[i] !== TipoTramo.RAMPA || T.t0[i] < DESDE || T.t0[i] >= HASTA) continue;
    const e = T.e[i], lista = tramos[e], j = lista.indexOf(i), previo = lista[j - 1];
    assert.equal(T.k[previo], TipoTramo.BANDEJA);
    assert.equal(T.a[previo], 0, 'primera pasada');
    const ruta = t.paquetes.ruta[e], rampas = Array.from(cfg.rutaRampas.subarray(cfg.rutaOff[ruta], cfg.rutaOff[ruta + 1]));
    assert.ok(rampas.includes(T.r[i]), `el paquete ${e} cayó en la rampa ${T.r[i]}, que no es de su ruta`);
    n++;
  }
  const esperado = 12000 * 0.98, ee = Math.sqrt(12000 * 0.02 * 0.98);
  assert.ok(Math.abs(n - esperado) <= 3.29 * ee, `se esperaban ${esperado} ± ${(3.29 * ee).toFixed(1)} y hubo ${n}`);
});

test('L03 · con 10% de paquetes de dos bandejas: 12.000 ÷ 1,10 = 10.909 paquetes por hora (± 3,29 ee)', (t) => {
  const s = noche(lazoSaturado(0, 0.1), 0, 'completa');
  const n = contar(s.traza!, TipoTramo.BANDEJA, (i) => s.traza!.tramos.a[i] === 0);
  // renovación: pasos por paquete 1 + Bernoulli(0,1) → Var(N) ≈ t·σ²/μ³ = 12.000 · 0,09 / 1,1³
  const esperado = 12000 / 1.1, ee = Math.sqrt((12000 * 0.09) / 1.1 ** 3);
  assert.ok(Math.abs(n - esperado) <= 3.29 * ee, `se esperaban ${esperado.toFixed(0)} ± ${(3.29 * ee).toFixed(0)} y hubo ${n}`);
  assert.deepEqual(s.resultado.alertas, [], 'cada paquete de dos bandejas ocupa dos y nunca se pisan');
  // L08 (informativa, no decide): F0 = velocidad ÷ paso × 3.600 ÷ Σ(fracción · bandejas) contra F3 saturado
  const f0 = (2 / 0.6) * 3600 / 1.1;
  t.diagnostic(`L08 (informativa): F0 ${f0.toFixed(1)} paquetes/h · F3 saturado ${n} · diferencia ${(100 * (n - f0) / f0).toFixed(2)}%. ` +
    'Coinciden porque el caso está saturado con inducción instantánea; en el hub real F0 no ve la espera de bandeja, la fila ni las pausas.');
});

test('L04 · una ruta con su rampa de capacidad 0 y maxVueltas = 3: vueltasExtra = N_ruta × 4, exacto', () => {
  const m = rampasSinTope(chico());
  m.hub.sorter.lector = { ...m.hub.sorter.lector, noLeido: 0 };
  m.personas.excepcion.cantidad = 0; // lo que va a excepción se queda ahí: cada paquete cuenta una sola vez
  m.hub.rampas.find((r) => r.id === 'R12')!.capacidad = 0; // R12 es la única rampa de la Ruta 10
  const s = noche(m, 0, 'no'), P = s.hub.P.S, cfg = s.hub.cfg;
  let nRuta = 0;
  for (let e = 0; e < P.nacidos; e++) if (P.ruta[e] === 9 && cfg.claseTransportable[P.clase[e]]) nRuta++;
  assert.ok(nRuta > 300, `la Ruta 10 tiene que tener paquetes (tiene ${nRuta})`);
  assert.equal(s.resultado.kpi.vueltasExtra, 4 * nRuta, `vueltasExtra = 4 × ${nRuta}`);
  assert.equal(s.resultado.porRecurso.rampaVueltas[11], 4 * nRuta, 'todas las vueltas son de R12');
});

test('L05 · rueda: un paquete colocado en el paso k desde la ranura σₑ cae en el paso k + ((σᵣ − σₑ) mod T)', () => {
  const m = chico();
  m.hub.sorter.paradas = { ...m.hub.sorter.paradas, activas: false }; // sin paradas, el paso k ocurre en inicio + k·tick
  const s = noche(m, 1, 'completa'), t = s.traza!, T = t.tramos, cfg = compilarConfig(m, 'F3');
  const k = (x: number) => {
    const q = (x - INICIO) / cfg.tick;
    assert.ok(Number.isInteger(q), `el instante ${x} no está en la grilla de pasos`);
    return q;
  };
  let caidas = 0, vueltas = 0;
  for (const lista of porPaquete(t)) {
    for (let j = 0; j < lista.length; j++) {
      const i = lista[j];
      if (T.k[i] !== TipoTramo.BANDEJA) continue;
      const sig = lista[j + 1];
      if (T.a[i] === 0) {
        const esp = lista[j - 1];
        assert.equal(T.k[esp], TipoTramo.ESPERA_BANDEJA);
        const sigmaE = cfg.slotEstacion[T.r[esp]];
        if (T.k[sig] === TipoTramo.RAMPA) {
          assert.equal(k(T.t1[i]) - k(T.t0[i]), mod(cfg.slotRampa[T.r[sig]] - sigmaE, cfg.T) || cfg.T);
          caidas++;
        }
      } else {
        // una vuelta extra dura exactamente T pasos (salvo la que va a excepción)
        const prev = lista[j - 1];
        if (T.k[prev] === TipoTramo.BANDEJA && T.a[prev] > 0) assert.equal(k(T.t1[prev]) - k(T.t0[prev]), cfg.T);
        vueltas++;
      }
    }
  }
  assert.ok(caidas > 5000, `se controlaron ${caidas} caídas`);
  assert.ok(vueltas > 0, 'hubo vueltas extra para controlar');
});

test('L06 · parada forzada en el paso kₚ con reinicio en t′: el paso kₚ + i ocurre en t′ + i·tick y cada caída en tránsito se atrasa lo mismo', () => {
  const base = rampasSinTope(sinRuido(chico()));
  const conParada = structuredClone(base);
  conParada.hub.sorter.paradas = { activas: true, entre: fija(3600.15), duracion: fija(600) };
  const a = noche(base, 0, 'completa'), b = noche(conParada, 0, 'completa');
  const cfg = compilarConfig(base, 'F3'), tick = cfg.tick;
  const ts = INICIO + 3_600_150, tReinicio = ts + 600_000;
  const kp = Math.floor((ts - INICIO + tick - 1) / tick); // primer paso en o después de la parada
  const delta = tReinicio - (INICIO + kp * tick);
  assert.equal(kp, 12001);
  // tramos del lazo: marcha [inicio, ts] desde el paso 0, detenido [ts, t′] en kₚ, marcha desde t′ en kₚ
  const T = b.traza!.tramos, lazo: number[] = [];
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.LAZO_MARCHA || T.k[i] === TipoTramo.LAZO_DETENIDO) lazo.push(i);
  const [m0, d0, m1] = lazo;
  assert.deepEqual([T.k[m0], T.t0[m0], T.t1[m0], T.a[m0]], [TipoTramo.LAZO_MARCHA, INICIO, ts, 0]);
  assert.deepEqual([T.k[d0], T.t0[d0], T.t1[d0], T.a[d0], T.c[d0]], [TipoTramo.LAZO_DETENIDO, ts, tReinicio, kp, 7]);
  assert.deepEqual([T.k[m1], T.t0[m1], T.a[m1]], [TipoTramo.LAZO_MARCHA, tReinicio, kp]);
  // las caídas de lo que estaba en bandejas al parar se atrasan todas lo mismo
  const A = a.traza!.tramos;
  const finBandejaB = new Map<number, number>();
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.BANDEJA && T.t0[i] < ts) finBandejaB.set(T.e[i], T.t1[i]);
  let enTransito = 0;
  for (let i = 0; i < A.n; i++) {
    if (A.k[i] !== TipoTramo.BANDEJA || !(A.t0[i] < ts && A.t1[i] > ts)) continue;
    const e = A.e[i], kCaida = (A.t1[i] - INICIO) / tick;
    assert.equal(finBandejaB.get(e), A.t1[i] + delta, `el paquete ${e} se tenía que atrasar ${delta} ms`);
    assert.equal(finBandejaB.get(e), tReinicio + (kCaida - kp) * tick, `el paso ${kCaida} tiene que ocurrir en t′ + (k − kₚ)·tick`);
    enTransito++;
  }
  assert.ok(enTransito >= 5, `tiene que haber paquetes en tránsito al parar (hubo ${enTransito})`);
  assert.equal(b.resultado.kpi.paradasLazo >= 1, true);
  assert.ok(Math.abs(b.resultado.kpi.minutosLazoDetenido - 10 * b.resultado.kpi.paradasLazo) < 1e-9, 'cada parada dura 10 min');
});
