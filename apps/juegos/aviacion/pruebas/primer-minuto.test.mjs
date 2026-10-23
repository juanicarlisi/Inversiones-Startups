// HN-30: el primer minuto y el capítulo 1 sin pozos. Algo que decidir cada 20 s, novedades cada minuto, las balizas recién cuando cae
// la primera noche y la primera clasificación del hub (una sola decisión, resuelta por el motor de la ronda) antes del minuto 3.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../js/modelo.js';
import * as RONDA from '../js/ronda.js';
import { MISIONES } from '../js/datos.js';
import { TEXTOS } from '../js/i18n.js';
import { correr } from '../herramientas/jugadores.mjs';

const corridas = [1, 2, 3].map((semilla) => ({ semilla, r: correr('novato', { semilla, minutos: 6 }) }));
const primera = (r, tipo) => r.novedades.find((n) => n.tipo === tipo)?.min ?? Infinity;
const pasos = (s, min) => { const ev = []; for (let i = 0; i < min / M.PASO; i++) ev.push(...M.paso(s)); return ev; };

test('primeros 60 s: el novato toma 3 decisiones o más y ve un cobro (semillas 1 a 3)', () => {
  for (const { semilla, r } of corridas) {
    assert.ok(r.acciones60 >= 3, `semilla ${semilla}: ${r.acciones60} decisiones`);
    assert.ok(r.primerCobro !== null && r.primerCobro <= 60, `semilla ${semilla}: primer cobro a los ${r.primerCobro} s`);
  }
});

test('m1_transbordo pide 25 sacas o menos y el novato la cumple en 60 s o menos desde que aparece', () => {
  assert.ok(MISIONES.find((m) => m.id === 'm1_transbordo').meta <= 25);
  for (const { semilla, r } of corridas) {
    const m = r.misiones.find((x) => x.id === 'm1_transbordo');
    assert.ok(m && m.duracion * 60 <= 60, `semilla ${semilla}: ${m ? (m.duracion * 60).toFixed(0) : '—'} s`);
  }
});

test('antes del minuto 3: el primer contrato, las primeras balizas, el primer despegue nocturno y la primera clasificación', () => {
  for (const { semilla, r } of corridas) {
    for (const tipo of ['contrato', 'primeraNoche', 'primerasBalizas', 'primerDespegueNoche', 'clasificacion'])
      assert.ok(primera(r, tipo) < 3, `semilla ${semilla}: ${tipo} a los ${primera(r, tipo)} min`);
    assert.ok(primera(r, 'primeraNoche') <= primera(r, 'primerasBalizas'), 'las balizas llegan después de la primera noche');
  }
});

test('nunca más de 20 s sin una decisión con efecto positivo en los primeros 3 min; ningún hueco sin novedad de más de 60 s en 5 min', () => {
  for (const { semilla, r } of corridas) {
    assert.ok(r.sinDecision3min <= 20, `semilla ${semilla}: ${r.sinDecision3min} s`);
    let antes = 0, hueco = 0;
    for (const n of r.novedades) { if (n.min > 5) break; hueco = Math.max(hueco, n.min - antes); antes = n.min; }
    hueco = Math.max(hueco, 5 - antes);
    assert.ok(hueco * 60 <= 60, `semilla ${semilla}: ${(hueco * 60).toFixed(0)} s sin novedad`);
  }
});

test('las balizas no se piden ni se sugieren antes de la primera noche con aviones en tierra', () => {
  const s = M.nuevoEstado(7);
  M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  M.abrirRuta(s, 'BUE', 'BHI'); M.comprarAvion(s, 'golondrina', 'BHI-BUE');
  s.dinero = 1e6; // con plata de sobra: lo único que lo frena es la regla
  let vioEspera = false;
  for (let i = 0; i < 14 * 60 / M.PASO; i++) {
    M.paso(s);
    if (M.esNoche(s)) break;
    assert.ok(!M.decisiones(s).some((d) => d.tipo === 'balizas'), `decisión de balizas a las ${M.hora(s).toFixed(1)} h`);
    assert.notEqual(M.sugerencia(s)?.tipo, 'balizas');
    const h = M.misionesActivas(s).find((o) => o.tipo === 'historia');
    if (h?.id === 'm1_noche') { assert.ok(h.espera && h.texto === 'm1_noche_espera' && !h.pista); vioEspera = true; }
  }
  assert.ok(vioEspera, 'la misión de la noche esperó');
  const ev = [...M.tomarEventos(s), ...pasos(s, 30)];
  const pn = ev.find((e) => e.tipo === 'primeraNoche') ?? (s.flags.primeraNoche ? { aviones: [1] } : null);
  assert.ok(pn && pn.aviones.length > 0, 'cae la noche con aviones en tierra');
  assert.ok(M.decisiones(s).some((d) => d.tipo === 'balizas'), 'después de la noche, las balizas aparecen');
  assert.ok(!M.misionesActivas(s)[0].espera);
});

test('primeraNoche nunca sale con 0 aviones parados (si todo está iluminado, la noche cae sin aviso)', () => {
  const s = M.nuevoEstado(8);
  M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  s.dinero = 1e6; M.ponerBalizas(s, 'BUE-MVD');
  const ev = pasos(s, 16 * 60);
  assert.ok(!ev.some((e) => e.tipo === 'primeraNoche' || e.tipo === 'avisoNoche'));
  assert.ok(s.flags.primeraNoche, 'igual se marca que cayó la noche');
});

// La primera clasificación en un estado fijo: capítulo 1, m1_transbordo cumplida, ya pasó la primera noche.
function conClasificacion(semilla = 3) {
  const s = M.nuevoEstado(semilla);
  M.tomarEventos(s);
  s.misiones = ['m1_primera', 'm1_segunda', 'm1_transbordo']; s.colas = {}; s.dinero = 50000;
  M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  M.abrirRuta(s, 'BUE', 'BHI'); M.comprarAvion(s, 'golondrina', 'BHI-BUE');
  let ev = [];
  for (let i = 0; i < 2 * 1440 / M.PASO && !M.clasificacionActual(s); i++) ev = M.paso(s);
  return { s, ev };
}

test('primera clasificación: una sola pregunta, por orden de llegada ~50% y eligiendo bien 100%, paga $4.000 o más en 30 s o menos', () => {
  const { s, ev } = conClasificacion();
  const c = M.clasificacionActual(s);
  assert.equal(c.estado, 'oferta');
  assert.ok(ev.some((e) => e.tipo === 'clasificacion'));
  assert.deepEqual(c.opciones.map((o) => o.id).sort(), ['BHI', 'MVD']);
  const d = M.decisiones(s).find((x) => x.tipo === 'clasificar');
  assert.ok(d && d.id === 'BHI' && d.efectoDia > 0 && d.costo === 0, 'decisión gratis con efecto: Bahía Blanca primero');
  const e = s.clasif.escena;
  const auto = RONDA.resolverClasificacion(e, null), mal = RONDA.resolverClasificacion(e, 'MVD'), bien = RONDA.resolverClasificacion(e, 'BHI');
  assert.ok(auto.pct >= 0.4 && auto.pct <= 0.6, `por orden de llegada ${auto.pct}`);
  assert.equal(mal.pct, auto.pct, 'el corto primero es lo mismo que el orden de llegada');
  assert.equal(bien.pct, 1);
  assert.ok(bien.ingreso >= 4000, `paga ${bien.ingreso}`);
  assert.ok(bien.duracion <= 300, `dura ${bien.duracion} min de juego (${bien.duracion / M.MIN_POR_SEG} s a ×1)`);
  // elegir y cobrar
  const d0 = s.dinero;
  assert.ok(M.elegirClasificacion(s, 'BHI').ok);
  assert.equal(M.elegirClasificacion(s, 'MVD').ok, false, 'una sola decisión');
  const fin = pasos(s, bien.duracion + M.PASO);
  const hecha = fin.find((x) => x.tipo === 'clasificacionHecha');
  assert.ok(hecha && hecha.pct === 1 && hecha.ingreso === bien.ingreso);
  assert.ok(s.dinero >= d0 + bien.ingreso - 5000, 'el premio entra a la caja');
  assert.equal(M.clasificacionActual(s).estado, 'hecha');
});

test('primera clasificación: se puede saltear, corre sola si nadie contesta y no depende de CONFIG.ronda', () => {
  const a = conClasificacion(4).s;
  assert.ok(M.elegirClasificacion(a, null).ok);
  const ra = pasos(a, 320).find((x) => x.tipo === 'clasificacionHecha');
  assert.ok(ra && ra.pct < 0.7 && ra.primero === null);
  const antes = M.CONFIG.ronda;
  M.CONFIG.ronda = false;
  try {
    const { s } = conClasificacion(4);
    assert.equal(M.clasificacionActual(s)?.estado, 'oferta', 'con la ronda apagada también aparece');
    const ev = pasos(s, M.CLASIF.esperaMax + 320);
    assert.ok(ev.some((x) => x.tipo === 'clasificacionHecha' && x.sola), 'corrió sola');
  } finally { M.CONFIG.ronda = antes; }
});

test('primera clasificación: sobrevive al guardado y tiene textos en español e inglés', () => {
  const { s } = conClasificacion(5);
  M.elegirClasificacion(s, 'BHI');
  pasos(s, 60);
  const r = M.restaurar(M.guardar(s));
  assert.ok(!r.error);
  assert.deepEqual(M.clasificacionActual(r), M.clasificacionActual(s));
  for (const k of ['m1_noche_espera', 'clasifTitulo', 'clasifPregunta', 'clasifTexto', 'clasifPrimero', 'clasifSaltear', 'clasifCorre', 'clasifCorreAuto', 'clasifRes', 'clasifMejor', 'clasifBien', 'clasifAviso', 'clasifHechaAviso', 'sug_clasificar', 'primerasBalizas', 'primerDespegueNoche'])
    for (const l of ['es', 'en']) assert.ok(TEXTOS[l][k], `${l}: ${k}`);
});
