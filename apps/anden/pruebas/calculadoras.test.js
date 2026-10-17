/*
 * Prueba de humo de la interfaz: cada calculadora, con sus valores de referencia y con cada
 * ejemplo (preset), produce resultados finitos y textos sin «NaN» ni «undefined».
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const CALCS = require('../js/calculadoras.js');
const C = require('../js/calculos.js');
const { REFERENCIAS, ref } = require('../js/referencias.js');

const tc = ref('tc_usd');
const h = CALCS.ayudantes(tc);

function textos(cfg, v) {
  const r = cfg.calcular(v);
  const partes = [];
  const pr = cfg.principal(r, v, h);
  partes.push(pr.etiqueta, pr.valor, pr.sub);
  cfg.tarjetas(r, v, h).forEach(t => partes.push(t.etiqueta, t.valor, t.nota));
  cfg.desglose(r, v, h).forEach(tabla => {
    partes.push(tabla.titulo, ...tabla.columnas);
    tabla.filas.forEach(f => partes.push(...f));
    if (tabla.pie) { partes.push(...tabla.pie); }
  });
  if (typeof cfg.sensibilidad === 'function') {
    const t = cfg.sensibilidad(r, v, h);
    t.filas.forEach(f => partes.push(...f));
  } else {
    cfg.sensibilidad.columnas.forEach(col => {
      const camposCol = col.campos || [typeof col.campo === 'function' ? col.campo(v) : col.campo];
      C.FACTORES.forEach(k => {
        const copia = { ...v };
        camposCol.forEach(c => { copia[c] = v[c] * k; });
        partes.push(col.entrada(copia[camposCol[0]], h), col.salida(cfg.calcular(copia), h));
      });
    });
  }
  cfg.pasos(r, v, h).forEach(p => partes.push(p));
  return { r, partes, pr };
}

function revisar(nombre, cfg, v) {
  const { partes } = textos(cfg, { ...v, tc });
  partes.forEach(p => {
    assert.ok(p !== undefined && p !== null, `${nombre}: texto vacío`);
    assert.doesNotMatch(String(p), /NaN|undefined|Infinity/, `${nombre}: «${p}»`);
  });
}

for (const cfg of CALCS.lista) {
  test(`${cfg.numero}. ${cfg.corto}: valores de referencia sin errores`, () => {
    revisar(cfg.id, cfg, CALCS.valoresIniciales(cfg));
  });
  if (cfg.presets) {
    for (const p of cfg.presets) {
      test(`${cfg.numero}. ${cfg.corto}: ejemplo «${p.nombre}»`, () => {
        revisar(`${cfg.id}/${p.id}`, cfg, { ...CALCS.valoresIniciales(cfg), ...p.valores, preset: p.id });
      });
    }
  }
  test(`${cfg.numero}. ${cfg.corto}: cada campo con referencia apunta a una referencia existente`, () => {
    CALCS.campos(cfg).forEach(c => {
      if (c.ref) { assert.ok(REFERENCIAS[c.ref], `${cfg.id}.${c.id} → ${c.ref}`); }
      assert.ok(c.defecto !== undefined, `${cfg.id}.${c.id} sin valor por defecto`);
    });
    (cfg.refsExtra || []).forEach(k => assert.ok(REFERENCIAS[k], `${cfg.id} refsExtra ${k}`));
  });
}

test('1. con las modalidades jornada, km y hora también se ven bien los textos', () => {
  const cfg = CALCS.porId.tarifa;
  for (const modalidad of ['jornada', 'km', 'hora']) {
    revisar(`tarifa/${modalidad}`, cfg, { ...CALCS.valoresIniciales(cfg), modalidad, costoTransportistaDia: 200000 });
  }
});

test('6. con divisor y pallet propios', () => {
  const cfg = CALCS.porId.volumetrico;
  revisar('volumetrico/otro', cfg, { ...CALCS.valoresIniciales(cfg), divisor: 0, divisorOtro: 4000, pallet: 'otro', espacio: 'otro', apilable: true, cualquierLado: true });
});

test('los costos hora por defecto salen de la calculadora 3', () => {
  // Conductor de 1ª con comida: ~ $12.500 por hora productiva con las referencias de octubre de 2026
  assert.ok(CALCS.HORA_CONDUCTOR > 5000 && CALCS.HORA_CONDUCTOR < 40000);
  assert.ok(CALCS.HORA_PEON > 5000 && CALCS.HORA_PEON < CALCS.HORA_CONDUCTOR);
});
