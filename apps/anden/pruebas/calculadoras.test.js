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
    if (tabla.svg) { partes.push(tabla.titulo, tabla.nota, tabla.svg); return; }
    partes.push(tabla.titulo, ...tabla.columnas);
    if (tabla.nota) { partes.push(tabla.nota); }
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

test('6. aforo del transportista en kg por m³: 300 kg/m³ = divisor 3.333,3', () => {
  const cfg = CALCS.porId.volumetrico;
  const v = { ...CALCS.valoresIniciales(cfg), divisor: -1, aforoOtro: 300, tc };
  const r = cfg.calcular(v);
  assert.ok(Math.abs(r.divisor - 3333.333) < 0.001, `divisor ${r.divisor}`);
  // 1,8 m³ × 300 kg/m³ = 540 kg volumétricos
  assert.ok(Math.abs(r.pv.pesoVolEnvio - 540) < 1e-6, `volumétrico ${r.pv.pesoVolEnvio}`);
  revisar('volumetrico/aforo', cfg, v);
  // Ninguna opción de divisor llama «habitual» a un valor sin fuente
  CALCS.campos(cfg).find(c => c.id === 'divisor').opciones.forEach(o => assert.doesNotMatch(o.texto, /habitual/));
});

test('4. con personal que rota y ventanas, los textos se ven bien', () => {
  const cfg = CALCS.porId.hub;
  revisar('hub/rota', cfg, { ...CALCS.valoresIniciales(cfg), polivalente: true, ventanaCarga: 2, estructuraMes: 2000000 });
  revisar('hub/ventanas', cfg, { ...CALCS.valoresIniciales(cfg), ventanaInduccion: 2, ventanaClasificacion: 3, ventanaCarga: 2 });
});

test('cada ejemplo de una calculadora define las mismas claves (al cambiar de ejemplo no queda nada del anterior)', () => {
  CALCS.lista.filter(cfg => cfg.presets).forEach(cfg => {
    const claves = JSON.stringify(Object.keys(cfg.presets[0].valores).sort());
    cfg.presets.forEach(p => assert.equal(JSON.stringify(Object.keys(p.valores).sort()), claves, `${cfg.id}/${p.id}`));
  });
  // Del repartidor sin chofer al utilitario, el chofer vuelve a su costo de convenio
  const rec = CALCS.porId.recorrido;
  assert.equal(rec.presets.find(p => p.id === 'flexero').valores.choferHora, 0);
  assert.equal(rec.presets.find(p => p.id === 'utilitario').valores.choferHora, CALCS.HORA_CONDUCTOR);
});

test('2. el repartidor Flex con su vehículo: sin chofer y con la cuota del monotributo', () => {
  const cfg = CALCS.porId.recorrido;
  const p = cfg.presets.find(x => x.id === 'flexero');
  const v = { ...CALCS.valoresIniciales(cfg), ...p.valores, preset: p.id, tc };
  const r = cfg.calcular(v);
  assert.equal(r.partes.personal, 0);
  assert.equal(v.otrosFijosMes, 40000 + REFERENCIAS.monotributo_servicios.valor);
  // Llevado a la calculadora 1: cobra 57 × 2.200 = 125.400 y le queda la diferencia con su costo del día
  const t = C.tarifaTransportista({ ...CALCS.valoresIniciales(CALCS.porId.tarifa), costoTransportistaDia: Math.round(r.total / 100) * 100 });
  assert.ok(t.gananciaTransportistaDia > 0 && t.gananciaTransportistaDia < 125400);
});

test('los costos hora por defecto salen de la calculadora 3', () => {
  // Conductor de 1ª con comida: ~ $12.500 por hora productiva con las referencias de octubre de 2026
  assert.ok(CALCS.HORA_CONDUCTOR > 5000 && CALCS.HORA_CONDUCTOR < 40000);
  assert.ok(CALCS.HORA_PEON > 5000 && CALCS.HORA_PEON < CALCS.HORA_CONDUCTOR);
});

test('ninguna insignia HECHO queda sobre un número distinto de su referencia (valores iniciales y cada ejemplo)', () => {
  CALCS.lista.forEach(cfg => {
    const escenarios = [CALCS.valoresIniciales(cfg)];
    (cfg.presets || []).forEach(p => escenarios.push(Object.assign(CALCS.valoresIniciales(cfg), p.valores, { preset: p.id })));
    escenarios.forEach(v => CALCS.campos(cfg).forEach(c => {
      const e = CALCS.insignia(cfg, c, v, NaN);
      if (c.calculado && v[c.id] !== 0) { assert.equal(e.clase, 'calculado', cfg.id + '.' + c.id); }
      if (!e || !e.clave || e.clase === 'tu-dato') { return; }
      const r = REFERENCIAS[e.clave];
      if (r.unidad !== '—' && typeof v[c.id] === 'number') {
        assert.ok(Math.abs(v[c.id] - r.valor) < 1e-6, cfg.id + ' (' + (v.preset || 'inicial') + ').' + c.id + ': ' + v[c.id] + ' con insignia de ' + e.clave + ' = ' + r.valor);
      }
    }));
  });
});

test('la insignia sigue al valor: editado, traído, cero de un ejemplo y dato atrasado', () => {
  const lab = CALCS.porId.laboral, rec = CALCS.porId.recorrido;
  const campo = (cfg, id) => CALCS.campos(cfg).find(c => c.id === id);
  const v = CALCS.valoresIniciales(lab);
  assert.equal(CALCS.insignia(lab, campo(lab, 'basico'), v, NaN).texto, 'HECHO · oct-2026');
  const editado = CALCS.insignia(lab, campo(lab, 'basico'), Object.assign({}, v, { basico: 900000 }), NaN);
  assert.equal(editado.clase, 'tu-dato');
  assert.equal(editado.volverA, REFERENCIAS.cct40_conductor_1.valor);
  assert.equal(CALCS.insignia(lab, campo(lab, 'presentismoPct'), v, NaN), null);            // 0 en Camioneros: no aplica
  assert.equal(CALCS.insignia(lab, campo(lab, 'viaticoDia'), v, NaN).texto, 'HECHO · oct-2026');
  assert.equal(CALCS.insignia(lab, campo(lab, 'horasSemana'), v, NaN).clase, 'estimacion');  // 48 h es un supuesto, no la jornada de todos
  const m = Object.assign(CALCS.valoresIniciales(lab), lab.presets.find(p => p.id === 'c130_maestranza').valores, { preset: 'c130_maestranza' });
  assert.equal(CALCS.insignia(lab, campo(lab, 'viaticoDia'), m, NaN), null);
  assert.equal(CALCS.insignia(lab, campo(lab, 'basico'), m, NaN).clave, 'cct130_maestranza_a');
  const r = CALCS.valoresIniciales(rec);
  assert.equal(CALCS.insignia(rec, campo(rec, 'choferHora'), r, NaN).texto, 'CALCULADO · calc. 3');
  assert.equal(CALCS.insignia(rec, campo(rec, 'choferHora'), Object.assign({}, r, { choferHora: 12480 }), 12480).clase, 'calculado');
  // Un dato marcado como atrasado lleva la cuenta de meses contra la fecha de actualización
  const comida = REFERENCIAS.cct40_comida;
  const antes = { valor: comida.valor, fecha: comida.fecha };
  try {
    Object.assign(comida, { atrasado: true, fecha: '2026-07' });
    assert.equal(CALCS.insignia(lab, campo(lab, 'viaticoDia'), v, NaN).texto, 'HECHO · jul-2026 · 3 meses de atraso');
  } finally { delete comida.atrasado; Object.assign(comida, antes); }
});

test('la calculadora 6 no muestra pesos ni dólar', () => {
  assert.equal(CALCS.porId.volumetrico.sinPesos, true);
});
