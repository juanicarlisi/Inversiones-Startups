// hub/pruebas/invariantes.test.ts · P4 · I01–I06 (corte-1.md §6.7 regla 16 y §8): 0 alertas en 20 noches de cada plantilla.
// Cada invariante se controla dos veces: con las alertas que levanta el propio simulador y con una lectura independiente de la traza.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TipoTramo, type Traza } from '../../contratos/traza.ts';
import { compilarConfig } from '../config.ts';
import { chico, grande, noche } from './modelos.ts';
import type { Modelo } from '../../contratos/modelo.ts';

const NOCHES = 20;

/** Máximo de intervalos [t0, t1) abiertos a la vez, por recurso (las salidas en el mismo instante van antes que las entradas). */
function maximoSimultaneo(intervalos: { r: number; t0: number; t1: number }[]): Map<number, number> {
  const ev = intervalos.flatMap((x) => [{ r: x.r, t: x.t0, d: 1 }, { r: x.r, t: x.t1, d: -1 }]);
  ev.sort((a, b) => a.r - b.r || a.t - b.t || a.d - b.d);
  const max = new Map<number, number>();
  let r = Number.NaN, n = 0;
  for (const e of ev) {
    if (e.r !== r) { r = e.r; n = 0; }
    n += e.d;
    if (n > (max.get(r) ?? 0)) max.set(r, n);
  }
  return max;
}

function verificarTraza(t: Traza, m: Modelo, donde: string): void {
  const T = t.tramos, cfg = compilarConfig(m, 'F3');
  // I04 · tiempo: t1 ≥ t0 siempre y los tramos de cada paquete encadenados, del inicio de su descarga a su jaula
  const ultimo = new Float64Array(t.paquetes.n).fill(Number.NaN), ultimoTipo = new Uint8Array(t.paquetes.n);
  for (let i = 0; i < T.n; i++) {
    assert.ok(T.t1[i] >= T.t0[i], `${donde}: el tramo ${i} termina antes de empezar`);
    if (T.k[i] < TipoTramo.DESCARGA || T.k[i] > TipoTramo.MANUAL) continue;
    const e = T.e[i];
    const esperado = Number.isNaN(ultimo[e]) ? t.paquetes.creado[e] : ultimo[e];
    assert.equal(T.t0[i], esperado, `${donde}: hueco en la biografía del paquete ${e} (tramo ${i})`);
    ultimo[e] = T.t1[i];
    ultimoTipo[e] = T.k[i];
  }
  // I01 e I06 · conservación y fin: todo paquete nacido termina en una jaula antes del horizonte
  for (let e = 0; e < t.paquetes.n; e++) {
    assert.equal(ultimoTipo[e], TipoTramo.JAULA, `${donde}: el paquete ${e} no terminó en una jaula`);
    assert.ok(t.paquetes.listo[e] >= 0, `${donde}: el paquete ${e} no tiene listo`);
  }
  // contrapresión: lo que entró por las cintas nunca ocupa más que los lugares de la acumulación (los reingresos del manual no frenan)
  const desdeCinta: { r: number; t0: number; t1: number }[] = [];
  const previo = new Int32Array(t.paquetes.n).fill(-1);
  for (let i = 0; i < T.n; i++) {
    if (T.k[i] < TipoTramo.DESCARGA || T.k[i] > TipoTramo.MANUAL) continue;
    if (T.k[i] === TipoTramo.ACUMULACION && previo[T.e[i]] >= 0 && T.k[previo[T.e[i]]] === TipoTramo.CINTA) {
      desdeCinta.push({ r: 0, t0: T.t0[i], t1: T.t1[i] });
    }
    previo[T.e[i]] = i;
  }
  const lugares = cfg.acumCap;
  for (const [, n] of maximoSimultaneo(desdeCinta)) assert.ok(n <= lugares, `${donde}: por las cintas entraron ${n} paquetes a la vez (lugares ${lugares})`);
  // I02 · ninguna rampa con más paquetes que su capacidad
  const enRampa: { r: number; t0: number; t1: number }[] = [];
  const enBandeja: { r: number; t0: number; t1: number }[] = [];
  const pausas = new Map<number, [number, number][]>(), trabajos = new Map<number, [number, number][]>();
  for (let i = 0; i < T.n; i++) {
    const k = T.k[i];
    if (k === TipoTramo.RAMPA) enRampa.push({ r: T.r[i], t0: T.t0[i], t1: T.t1[i] });
    else if (k === TipoTramo.BANDEJA) {
      enBandeja.push({ r: T.r[i], t0: T.t0[i], t1: T.t1[i] });
      if (cfg.claseBandejas[t.paquetes.clase[T.e[i]]] === 2) enBandeja.push({ r: (T.r[i] - 1 + cfg.T) % cfg.T, t0: T.t0[i], t1: T.t1[i] });
    } else if (k === TipoTramo.PERSONA_PAUSA) {
      if (!pausas.has(T.e[i])) pausas.set(T.e[i], []);
      pausas.get(T.e[i])!.push([T.t0[i], T.t1[i]]);
    } else if (k === TipoTramo.PERSONA_TRABAJA || k === TipoTramo.PERSONA_CAMINA || k === TipoTramo.PERSONA_CIERRA_JAULA) {
      if (!trabajos.has(T.e[i])) trabajos.set(T.e[i], []);
      trabajos.get(T.e[i])!.push([T.t0[i], T.t1[i]]);
    }
  }
  for (const [r, n] of maximoSimultaneo(enRampa)) assert.ok(n <= cfg.rampaCap[r], `${donde}: la rampa ${r} llegó a ${n} paquetes (capacidad ${cfg.rampaCap[r]})`);
  // I03 · una bandeja lleva a lo sumo un paquete (los de dos bandejas ocupan también la de atrás)
  for (const [j, n] of maximoSimultaneo(enBandeja)) assert.ok(n <= 1, `${donde}: la bandeja ${j} tuvo ${n} paquetes a la vez`);
  // I05 · nadie trabaja en pausa
  let controladas = 0;
  for (const [w, ps] of pausas) {
    for (const [p0, p1] of ps) {
      for (const [w0, w1] of trabajos.get(w) ?? []) {
        assert.ok(w1 <= p0 || w0 >= p1, `${donde}: la persona ${w} trabajó [${w0}, ${w1}] durante su pausa [${p0}, ${p1}]`);
      }
      controladas++;
    }
  }
  assert.ok(controladas > 0, `${donde}: hubo pausas para controlar`);
}

for (const [nombre, modelo] of [['hub-chico', chico], ['hub-lazo-noche', grande]] as const) {
  test(`I01–I06 · ${nombre}: 0 alertas en ${NOCHES} noches y las invariantes valen también leídas en la traza`, () => {
    const m = modelo();
    let paquetes = 0, ausentes = 0, paradas = 0, vueltas = 0;
    for (let r = 0; r < NOCHES; r++) {
      const s = noche(m, r, 'completa');
      assert.deepEqual(s.resultado.alertas, [], `${nombre}, réplica ${r}: se esperaban 0 alertas`);
      verificarTraza(s.traza!, m, `${nombre}, réplica ${r}`);
      paquetes += s.resultado.kpi.paquetes;
      ausentes += s.resultado.kpi.ausentes;
      paradas += s.resultado.kpi.paradasLazo;
      vueltas += s.resultado.kpi.vueltasExtra;
    }
    // las noches ejercitaron lo que las invariantes cuidan: faltas, paradas y rampas llenas
    assert.ok(paquetes > NOCHES * 7000, 'noches con paquetes');
    assert.ok(ausentes > 0, `hubo faltas en ${NOCHES} noches`);
    assert.ok(paradas > 0, 'hubo micro-paradas');
    // En la grande, desde el motor 1.1.0 (persistencia y relevo) las rampas ya no se llenan: el tope de rampa se ejercita en la chica.
    if (nombre === 'hub-chico') assert.ok(vueltas > 0, 'hubo rampas llenas y vueltas extra');
  });
}
