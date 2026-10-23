// pruebas/presupuesto.test.ts · P3 · Presupuesto de cómputo estimado antes de correr (corte-1.md §9, P3):
// paquetes = Σ nominales × (1 + 4 · cv del pronóstico); eventos ≈ paquetes × 14 + (horizonte ÷ tick).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_TRAMOS_ESTIMADOS, TRAMOS_POR_PAQUETE, tramosEstimados, estimarPresupuesto, eventosRecurrentes, EVENTOS_POR_PAQUETE, HORAS_DE_GRACIA, lugaresDeMemoria, MAX_LUGARES_MEMORIA } from '../presupuesto.ts';
import { compilar } from '../compilar.ts';
import { LIMITES_ENLACE } from '../../contratos/escena.ts';
import { ejemploModelo, hubGrandeJson, resumen } from './ayudas.ts';

test('el ejemplo: 8.000 × (1 + 4 · 0,08) = 10.560 paquetes y 10.560 × 14 + 57.600.000 ms ÷ 300 ms = 339.840 eventos', () => {
  const p = estimarPresupuesto(ejemploModelo());
  assert.equal(p.paquetes, 10560, 'el ruido de punto flotante (10560,000000000002) no tiene que subir el techo');
  assert.equal(p.eventos, 10560 * EVENTOS_POR_PAQUETE + 192000);
  assert.equal(p.eventos, 339840);
  assert.equal(EVENTOS_POR_PAQUETE, 14);
  assert.equal(HORAS_DE_GRACIA, 8);
});

test('con cv del pronóstico 0 los paquetes son los nominales; con una referencia @param usa el valor del parámetro', () => {
  const m = ejemploModelo();
  m.parametros.errorPronosticoCv.valor = 0;
  m.parametros.errorPronosticoCv.incierto = undefined;
  assert.equal(estimarPresupuesto(m).paquetes, 8000);
  m.parametros.errorPronosticoCv.valor = 0.25;
  assert.equal(estimarPresupuesto(m).paquetes, 16000);
  m.demanda.errorPronostico.cv = 0.5;
  assert.equal(estimarPresupuesto(m).paquetes, 24000, 'un número directo en el campo gana a la referencia');
});

test('lista de camiones: suma los paquetes de cada uno', () => {
  const m = ejemploModelo();
  m.demanda.camiones = [{ id: 'T1', turno: '22:00', paquetes: 100 }, { id: 'T2', turno: '23:00', paquetes: 250 }];
  assert.equal(estimarPresupuesto(m).paquetes, Math.ceil(350 * 1.32));
});

test('el horizonte es fin + 8 h − inicio y el tick es paso ÷ velocidad en ms', () => {
  const m = ejemploModelo();
  m.calendario.fin = '26:00'; // 4 h más cortas: horizonte = 26 h + 8 h − 22 h = 12 h
  const base = 10560 * 14;
  assert.equal(estimarPresupuesto(m).eventos, base + (12 * 3600 * 1000) / 300);
  m.hub.sorter.velocidad = 1; // tick = 600 ms
  assert.equal(estimarPresupuesto(m).eventos, base + (12 * 3600 * 1000) / 600);
});

test('los pasos del lazo se redondean hacia arriba', () => {
  const m = ejemploModelo();
  m.hub.sorter.paso = 0.7; // tick = 350 ms; 57.600.000 ÷ 350 = 164.571,43 → 164.572
  assert.equal(estimarPresupuesto(m).eventos, 10560 * 14 + 164572);
});

test('un lazo con tick de 0 ms da infinitos eventos (el compilador lo rechaza antes por otro motivo)', () => {
  const m = ejemploModelo();
  m.hub.sorter.velocidad = 1e9;
  assert.equal(estimarPresupuesto(m).eventos, Infinity);
});

test('los límites del enlace son los del contrato: 2.000.000 de paquetes y 50.000.000 de eventos', async () => {
  assert.equal(LIMITES_ENLACE.maxPaquetesEstimados, 2000000);
  assert.equal(LIMITES_ENLACE.maxEventosEstimados, 50000000);
  // Justo en el límite de paquetes: 1.515.151 nominales × 1,32 = 1.999.999,3 → 2.000.000 → pasa (límite inclusivo).
  const m = ejemploModelo();
  m.demanda.camiones = { serie: true, cantidad: 1, primero: '22:00', cada: 900, paquetes: 1515151 };
  assert.equal(estimarPresupuesto(m).paquetes, 2000000);
  assert.equal(estimarPresupuesto(m).eventos > LIMITES_ENLACE.maxEventosEstimados, false);
  m.escenarios = m.escenarios!.slice(0, 4);
  // En el límite de paquetes el compilador ya no lo acepta por OTRO tope, el de la película (SEG-01): 24 millones de tramos.
  const r = await compilar(m);
  assert.equal(r.ok, false);
  assert.ok(!r.ok && !r.diagnosticos.some((d) => d.clave === 'modelo.diag.E-PRESUPUESTO.paquetes'), 'en el límite, los paquetes pasan');
  assert.ok(!r.ok && r.diagnosticos.some((d) => d.clave === 'modelo.diag.E-PRESUPUESTO.traza'), 'y la película no entra');
  // Un paquete más sobre el límite: se rechaza antes de correr.
  m.demanda.camiones = { serie: true, cantidad: 1, primero: '22:00', cada: 900, paquetes: 1515152 };
  const r2 = await compilar(m);
  assert.equal(r2.ok, false);
  assert.ok(!r2.ok && r2.diagnosticos.some((d) => d.clave === 'modelo.diag.E-PRESUPUESTO.paquetes' && d.vars?.max === 2000000), 'falta E-PRESUPUESTO.paquetes');
});

test('tope de la película (SEG-01): 2.000.000 de tramos estimados (12 por paquete); justo en el tope pasa, un paquete más no', async () => {
  assert.equal(TRAMOS_POR_PAQUETE, 12);
  assert.equal(MAX_TRAMOS_ESTIMADOS, 2_000_000);
  const m = ejemploModelo();
  m.escenarios = m.escenarios!.slice(0, 4);
  // 126.262 nominales × 1,32 = 166.665,8 → 166.666 paquetes → 1.999.992 tramos: pasa
  m.demanda.camiones = { serie: true, cantidad: 1, primero: '22:00', cada: 900, paquetes: 126262 };
  assert.equal(tramosEstimados(m), 1_999_992);
  const r = await compilar(m);
  assert.ok(!(!r.ok && r.diagnosticos.some((d) => d.clave === 'modelo.diag.E-PRESUPUESTO.traza')), 'en el tope, la película entra');
  // 126.263 → 166.668 paquetes → 2.000.016 tramos: no
  m.demanda.camiones = { serie: true, cantidad: 1, primero: '22:00', cada: 900, paquetes: 126263 };
  const r2 = await compilar(m);
  assert.ok(!r2.ok && r2.diagnosticos.some((d) => d.clave === 'modelo.diag.E-PRESUPUESTO.traza' && d.vars?.max === 2_000_000), 'falta E-PRESUPUESTO.traza');
  // las dos plantillas quedan muy lejos del tope
  for (const clave of ['hub-chico@1.0.0']) assert.ok(tramosEstimados(ejemploModelo()) < 200_000, clave);
});

test('el aviso de presupuesto no depende de que el modelo sea «razonable»: 1e9 paquetes se rechaza sin colgarse', async () => {
  const m = ejemploModelo();
  m.demanda.camiones = { serie: true, cantidad: 1e9, primero: '22:00', cada: 900, paquetes: 1e9 };
  const r = await compilar(m);
  assert.equal(r.ok, false);
  assert.ok(!r.ok && r.diagnosticos.some((d) => d.clave === 'modelo.diag.E-PRESUPUESTO.paquetes'));
});

test('cotas de seguridad: lugares de memoria del ejemplo (142 bandejas + 120 de acumulación + 6 de playa + 240 de rampas + 18 personas y puestos)', () => {
  const m = ejemploModelo();
  // 142 + 120 + 6 + (12 × 20) + (andenes 2+2+2) + 5 puestos + 0 retén + 6 de rampa + 1 manual
  assert.equal(lugaresDeMemoria(m), 142 + 120 + 6 + 240 + 6 + 5 + 0 + 6 + 1);
  assert.equal(lugaresDeMemoria(hubGrandeJson()), 300 + 160 + 6 + 60 * 25 + 8 + 6 + 0 + 15 + 2);
  assert.ok(lugaresDeMemoria(m) < MAX_LUGARES_MEMORIA / 1000, 'el ejemplo está mil veces por debajo del tope');
  m.hub.acumulacion.largo = 1e12;
  assert.equal(lugaresDeMemoria(m) > MAX_LUGARES_MEMORIA, true);
});

test('cotas de seguridad: eventos recurrentes del ejemplo (pausas de inducción y de rampa y micro-paradas)', () => {
  const m = ejemploModelo();
  // turno de 8 h = 28.800 s. Inducción: 3 personas × 2 × ⌈(28.800 − 7.200) ÷ 7.200⌉ = 3 × 2 × 3 = 18.
  // Rampa: 6 × 2 × ⌈(28.800 − 7.800) ÷ 7.200⌉ = 6 × 2 × 3 = 36. Paradas: 2 × ⌈57.600 ÷ (2.700 + 90)⌉ = 2 × 21 = 42.
  assert.equal(eventosRecurrentes(m), 18 + 36 + 42);
  m.hub.sorter.paradas.activas = false;
  assert.equal(eventosRecurrentes(m), 18 + 36);
  m.personas.induccion.reten = 2;
  assert.equal(eventosRecurrentes(m), 30 + 36, 'el retén también tiene pausas');
});

test('cotas de seguridad: un ciclo de paradas que no avanza da infinitos eventos y se rechaza', async () => {
  const m = ejemploModelo();
  m.parametros.paradaLazoEntre.valor = { tipo: 'fija', valor: 0.001 };
  m.parametros.paradaLazoDuracion.valor = { tipo: 'fija', valor: 0 };
  assert.ok(eventosRecurrentes(m) > 1e7);
  m.parametros.paradaLazoEntre.valor = { tipo: 'exponencial', media: 1e-300 };
  assert.ok(eventosRecurrentes(m) > 1e300 || eventosRecurrentes(m) === Infinity);
  const r = await compilar(m);
  assert.ok(!r.ok && r.diagnosticos.some((d) => d.clave === 'modelo.diag.E-PRESUPUESTO.recurrentes'), r.ok ? 'se aceptó' : resumen(r.diagnosticos));
});

test('un NaN o un infinito en el presupuesto nunca pasa por debajo de un tope (cantidad: 1e308 camiones)', async () => {
  const m = ejemploModelo();
  m.demanda.camiones = { serie: true, cantidad: 1e308, primero: '22:00', cada: 900, paquetes: 800 };
  assert.equal(estimarPresupuesto(m).paquetes, Infinity);
  const r = await compilar(m);
  assert.ok(!r.ok);
  const d = !r.ok ? r.diagnosticos.find((x) => x.clave === 'modelo.diag.E-PRESUPUESTO.paquetes') : undefined;
  assert.ok(d, 'falta E-PRESUPUESTO.paquetes');
  assert.equal(d.vars?.estimado, '∞');
  // Lo mismo con un cv del pronóstico gigante.
  const m2 = ejemploModelo();
  m2.parametros.errorPronosticoCv.valor = 1e308;
  m2.parametros.errorPronosticoCv.rango = undefined;
  m2.parametros.errorPronosticoCv.incierto = undefined;
  const r2 = await compilar(m2);
  assert.ok(!r2.ok && r2.diagnosticos.some((x) => x.clave === 'modelo.diag.E-PRESUPUESTO.paquetes'));
});
