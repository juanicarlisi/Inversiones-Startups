// hub/pruebas/personas.test.ts · P4 · Personas con estado y reglas explícitas (corte-1.md §6.7 reglas 2 y 6): retén, temporarios,
// fatiga y pausas, leídos en la traza contra el sorteo de cada paquete.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aMs, horaASeg } from '../../contratos/tipos-base.ts';
import { matNativa } from '../../contratos/referencia/motor-referencia.ts';
import { TipoMomento, TipoTramo, type Traza } from '../../contratos/traza.ts';
import { instantesDePausa } from '../config.ts';
import { chico, noche } from './modelos.ts';

const INICIO = aMs(horaASeg('22:00'));

/** Duración de inducción esperada (ms): base × fatiga ÷ eficiencia, convertida con aMs al agendar. */
const duracion = (base: number, fatiga: number, eficiencia: number) => aMs((base * fatiga) / eficiencia);

/** Primer tramo INDUCCION de cada paquete (su intento 0). */
function primerasInducciones(t: Traza): number[] {
  const visto = new Uint8Array(t.paquetes.n), out: number[] = [];
  for (let i = 0; i < t.tramos.n; i++) if (t.tramos.k[i] === TipoTramo.INDUCCION && !visto[t.tramos.e[i]]) { visto[t.tramos.e[i]] = 1; out.push(i); }
  return out;
}

test('retén: cubre primero los puestos de inducción ausentes (de menor a mayor) y después las personas de rampa', () => {
  const m = chico();
  m.personas.induccion.reten = 2;
  m.parametros.ausentismo = { ...m.parametros.ausentismo, valor: 0.25 };
  let cubrioInduccion = 0, cubrioRampa = 0;
  for (let r = 0; r < 30; r++) {
    const s = noche(m, r, 'completa'), h = s.hub, cfg = h.cfg, P = h.personas.S;
    // lo esperado, calculado aparte a partir de quién faltó
    const ausentesInd = [...Array(cfg.activos).keys()].filter((i) => !P.presente[cfg.offInd + i]);
    const ausentesRam = [...Array(cfg.nW).keys()].filter((i) => !P.presente[cfg.offRam + i]);
    const retenes = [...Array(cfg.nRet).keys()].filter((j) => P.presente[cfg.offRet + j]).map((j) => cfg.offRet + j);
    const huecos = [...ausentesInd.map((i) => ['ind', i] as const), ...ausentesRam.map((i) => ['ram', i] as const)];
    const reemplazos: [number, number][] = [];
    huecos.slice(0, retenes.length).forEach(([rol, i], j) => {
      reemplazos.push([retenes[j], rol === 'ind' ? cfg.offInd + i : cfg.offRam + i]);
      if (rol === 'ind') { assert.equal(P.trabajadorInd[i], retenes[j], `réplica ${r}: el puesto ${i} lo cubre el retén ${retenes[j]}`); cubrioInduccion++; }
      else { assert.equal(P.trabajadorRam[i], retenes[j]); cubrioRampa++; }
    });
    for (const [rol, i] of huecos.slice(retenes.length)) assert.equal(rol === 'ind' ? P.trabajadorInd[i] : P.trabajadorRam[i], -1, 'sin retén, el hueco queda');
    const M = s.traza!.momentos, vistos: [number, number][] = [];
    for (let i = 0; i < M.n; i++) if (M.tipo[i] === TipoMomento.REEMPLAZO) vistos.push([M.r[i], M.v[i]]);
    assert.deepEqual(vistos, reemplazos, `réplica ${r}: momentos REEMPLAZO (r = retén, v = persona cubierta)`);
    // un retén que cubre inducción rinde como planta
    for (const [, i] of huecos.slice(0, retenes.length).filter(([rol]) => rol === 'ind')) assert.equal(h.ind.S.eficiencia[i], 1);
    assert.equal(s.resultado.kpi.inductoresPresentes, cfg.activos - Math.max(0, ausentesInd.length - retenes.length));
    // descarga y excepción no tienen ausentismo en el esquema: nunca faltan
    for (let g = cfg.offDes; g < cfg.nPersonas; g++) assert.equal(P.presente[g], 1);
  }
  assert.ok(cubrioInduccion > 0 && cubrioRampa > 0, `hubo coberturas de inducción (${cubrioInduccion}) y de rampa (${cubrioRampa})`);
});

test('temporarios: los últimos `temporarios` puestos activos rinden `eficienciaTemporario` (0,7); los de planta, 1', () => {
  const m = chico();
  m.personas.induccion.temporarios = 1;
  m.personas.induccion.ausentismo = 0;
  const s = noche(m, 0, 'completa'), t = s.traza!, T = t.tramos, base0 = s.hub.P.S.base0;
  const porPuesto = [0, 0, 0];
  for (const i of primerasInducciones(t)) {
    const p = T.r[i], efic = p === 2 ? 0.7 : 1;
    assert.equal(T.t1[i] - T.t0[i], duracion(base0[T.e[i]], 1, efic), `puesto ${p}, paquete ${T.e[i]}`);
    porPuesto[p]++;
  }
  assert.ok(porPuesto.every((n) => n > 500), `los tres puestos inducen (${porPuesto.join(', ')})`);
});

test('fatiga activa: tiempo = base × (1 + máximo · (1 − exp(−(t − fin de la última pausa) ÷ τ)))', () => {
  const m = chico();
  m.personas.fatiga = { ...m.personas.fatiga, activa: true };
  m.personas.induccion.ausentismo = 0;
  const s = noche(m, 0, 'completa'), t = s.traza!, T = t.tramos, base0 = s.hub.P.S.base0;
  const finPausas = new Map<number, number[]>();
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.PERSONA_PAUSA) { if (!finPausas.has(T.e[i])) finPausas.set(T.e[i], []); finPausas.get(T.e[i])!.push(T.t1[i]); }
  let controladas = 0, conFatiga = 0;
  for (const i of primerasInducciones(t)) {
    const w = T.a[i], t0 = T.t0[i];
    const ultima = Math.max(INICIO, ...(finPausas.get(w) ?? []).filter((x) => x <= t0));
    const fatiga = 1 + 0.15 * (1 - matNativa.exp(-(t0 - ultima) / aMs(5400)));
    assert.equal(T.t1[i] - T.t0[i], duracion(base0[T.e[i]], fatiga, 1), `paquete ${T.e[i]} a las ${t0}`);
    controladas++;
    if (fatiga > 1.1) conFatiga++;
  }
  assert.ok(controladas > 7000 && conFatiga > 500, `se controlaron ${controladas} inducciones (${conFatiga} con fatiga > 10%)`);
});

test('pausas: cada persona las toma en inicio + primera + i·escalón + m·cada (o al terminar su tarea) y duran lo mismo', () => {
  const m = chico();
  m.personas.induccion.ausentismo = 0;
  m.personas.rampa.ausentismo = 0;
  const s = noche(m, 2, 'completa'), t = s.traza!, T = t.tramos, cfg = s.hub.cfg;
  const pausas = new Map<number, [number, number][]>();
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.PERSONA_PAUSA) { if (!pausas.has(T.e[i])) pausas.set(T.e[i], []); pausas.get(T.e[i])!.push([T.t0[i], T.t1[i]]); }
  const roles: [number, number, typeof cfg.pausasInduccion][] = [
    ...Array.from({ length: cfg.activos }, (_, i) => [cfg.offInd + i, i, cfg.pausasInduccion] as [number, number, typeof cfg.pausasInduccion]),
    ...Array.from({ length: cfg.nW }, (_, i) => [cfg.offRam + i, i, cfg.pausasRampa] as [number, number, typeof cfg.pausasRampa]),
  ];
  for (const [g, i, p] of roles) {
    const nominales = instantesDePausa(cfg, p, i), reales = (pausas.get(g) ?? []).sort((a, b) => a[0] - b[0]);
    assert.equal(reales.length, nominales.length, `persona ${g}: ${nominales.length} pausas antes del fin del turno`);
    reales.forEach(([t0, t1], j) => {
      assert.ok(t0 >= nominales[j] && t0 - nominales[j] <= 60_000, `persona ${g}: la pausa ${j} empieza ${t0 - nominales[j]} ms tarde (espera solo la tarea en curso)`);
      assert.equal(t1 - t0, aMs(p.duracion), 'y dura lo mismo');
    });
  }
  // inducción: la persona 0 a las 00:00 y cada una 10 min después que la anterior (la 1: 00:10 y 02:10)
  assert.deepEqual(instantesDePausa(cfg, cfg.pausasInduccion, 1).slice(0, 2), [aMs(horaASeg('24:10')), aMs(horaASeg('26:10'))]);
});
