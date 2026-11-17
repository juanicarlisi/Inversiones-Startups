// Pruebas del modelo: sin doble conteo, imputación de tarjetas, cuotas, cierre de mes y carga rápida. Correr: node --test pruebas/
const test = require('node:test'), assert = require('node:assert/strict');
const { cargarNido } = require('./cargar.cjs');

/* Arma una casa con configuración y movimientos en memoria (sin base). */
function casa(movs = [], extra = {}) {
  const N = cargarNido();
  const main = { ...N.defCfg(), inicio: '2026-09', caja: 500000, usuarios: ['Persona A', 'Persona B'], tarjetas: [{ id: 'visa', n: 'Visa', cierre: 0 }, { id: 'master', n: 'Mastercard', cierre: 20 }], ...(extra.main || {}) };
  N.Store.local = { mov: {}, cfg: { main, ...(extra.cfg || {}) } };
  movs.forEach((m, i) => { N.Store.local.mov['x' + i] = { items: [], com: '', ...m }; });
  N.S.movs = Object.entries(N.Store.local.mov).map(([id, d]) => ({ id, ...d }));
  N.applyCfgDocs(N.Store.local.cfg);
  return N;
}
const ae = (a, b, m) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b, m); // los objetos vienen de otro contexto (vm)
const casi = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.01, `${msg || ''} esperaba ${b} y dio ${a}`);

test('imputación: efectivo en el mes; tarjeta al mes siguiente; con cierre, lo posterior al cierre al segundo mes', () => {
  const N = casa();
  assert.equal(N.imputar('2026-11-10', 'ef'), '2026-11');
  assert.equal(N.imputar('2026-11-10', 'deb'), '2026-11');
  assert.equal(N.imputar('2026-11-10', 'visa'), '2026-12');
  assert.equal(N.imputar('2026-11-20', 'master'), '2026-12', 'el día del cierre entra en el resumen que cierra');
  assert.equal(N.imputar('2026-11-21', 'master'), '2027-01', 'después del cierre pasa al segundo mes');
  assert.equal(N.imputar('2026-12-31', 'visa'), '2027-01', 'cambio de año');
});

test('sin doble conteo: el aporte a un fondo no es gasto y se cuenta una sola vez', () => {
  const N = casa([
    { tipo: 'ingreso', cat: 'sueldo', fecha: '2026-09-05', mes: '2026-09', total: 1000000, items: [{ n: 'Sueldo', cat: 'sueldo', monto: 1000000 }] },
    { tipo: 'gasto', medio: 'ef', fecha: '2026-09-06', mes: '2026-09', total: 300000, items: [{ n: 'Súper', cat: 'alim', monto: 300000 }] },
    { tipo: 'aporte', fondo: 'emerg', fecha: '2026-09-07', mes: '2026-09', total: 200000 }
  ]);
  const sep = N.resumenMes('2026-09', 'pago'), oct = N.resumenMes('2026-10', 'pago');
  assert.equal(sep.ing, 1000000); assert.equal(sep.cons, 300000); assert.equal(sep.res, 700000, 'resultado = ingresos − consumo');
  assert.equal(sep.apor, 200000); assert.equal(sep.sin, 500000, 'queda disponible = resultado − aportes');
  assert.equal(oct.cons, 0); assert.equal(oct.apor, 0, 'el mes siguiente el fondo no vuelve a restar');
  assert.equal(N.cajaHasta('2026-10'), 500000 + 1000000 - 300000 - 200000);
  assert.equal(N.saldoFondo(N.S.cfg.destinos[0], '2026-10'), 200000);
  assert.equal(N.patrimonio('2026-10'), 500000 + 700000, 'patrimonio = disponible + fondos');
});

test('compra pagada con un fondo: baja el fondo y no entra al consumo; un retiro no cambia el patrimonio', () => {
  const N = casa([
    { tipo: 'aporte', fondo: 'vacas', fecha: '2026-09-07', mes: '2026-09', total: 200000 },
    { tipo: 'gasto', medio: 'tr', pagoFondo: 'vacas', fecha: '2026-10-03', mes: '2026-10', total: 50000, items: [{ n: 'Pasaje', cat: 'trans', monto: 50000 }] },
    { tipo: 'retiro', fondo: 'vacas', fecha: '2026-10-04', mes: '2026-10', total: 20000 }
  ]);
  const vacas = N.S.cfg.destinos.find(d => d.id === 'vacas');
  assert.equal(N.resumenMes('2026-10', 'pago').cons, 0);
  assert.equal(N.saldoFondo(vacas, '2026-10'), 130000);
  assert.equal(N.cajaHasta('2026-10'), 500000 - 200000 + 20000);
  assert.equal(N.patrimonio('2026-10'), 500000 - 50000, 'solo baja por lo que se gastó');
});

test('cuotas: guardar desde el formulario reparte la compra en un movimiento por mes, en el resumen que corresponde', async () => {
  const N = casa();
  await N.Store.init(); // base de prueba vacía
  Object.assign(N.Store.local.cfg, {}); N.Store.local.cfg.main = { ...N.defCfg(), inicio: '2026-09', usuarios: ['Persona A'], tarjetas: [{ id: 'visa', n: 'Visa', cierre: 0 }, { id: 'master', n: 'Mastercard', cierre: 20 }] }; N.applyCfgDocs(N.Store.local.cfg);
  N.setCP(N.nuevoCP('gasto', { monto: 90000, com: 'Zapatillas', cat: 'ropa', medio: 'master', cuotas: 3, fecha: '2026-11-25' }));
  await N.cpSave();
  const cs = N.S.movs.filter(m => m.com === 'Zapatillas').sort((a, b) => a.mes.localeCompare(b.mes));
  assert.equal(cs.length, 3);
  ae(cs.map(m => m.mes), ['2027-01', '2027-02', '2027-03'], 'compra del 25 con cierre 20: primera cuota en el segundo mes');
  ae(cs.map(m => m.cuota.i), [1, 2, 3]);
  assert.ok(cs.every(m => m.cuota.n === 3 && m.total === 30000 && m.grupo && m.grupo === cs[0].grupo));
  assert.equal(N.resumenMes('2027-02', 'pago').cons, 30000, 'mes de pago: una cuota');
  assert.equal(N.resumenMes('2026-11', 'compra').cons, 90000, 'fecha de compra: la compra entera');
  assert.equal(N.tarjetasMes('2027-01').find(t => t.t.id === 'master').total, 30000);
  await N.metrica('noop'); // espera la fila de métricas
  assert.equal(N.S.met.gastos, 1, 'la métrica cuenta una compra, no tres cuotas');
});

test('cuotas que no dividen exacto: cada cuota se redondea a centavos (diferencia de centavos, anotada en el README)', async () => {
  const N = casa(); await N.Store.init();
  N.Store.local.cfg.main = { ...N.defCfg(), usuarios: ['Persona A'] }; N.applyCfgDocs(N.Store.local.cfg);
  N.setCP(N.nuevoCP('gasto', { monto: 100000, com: 'Heladera', cat: 'hogar', medio: 'visa', cuotas: 3, fecha: '2026-11-10' }));
  await N.cpSave();
  const cs = N.S.movs.filter(m => m.com === 'Heladera');
  casi(cs[0].total, 33333.33); assert.ok(Math.abs(cs.reduce((s, m) => s + m.total, 0) - 100000) < 0.05);
});

test('cierre de mes: confirma lo previsto, aporta según el % de lo que sobró y registra el rendimiento real', async () => {
  const N = casa([
    { tipo: 'gasto', medio: 'ef', fecha: '2026-10-12', mes: '2026-10', total: 100000, items: [{ n: 'Súper', cat: 'alim', monto: 100000 }] }
  ], {
    main: { inicio: '2026-10', caja: 0, destinos: [{ id: 'emerg', n: 'Emergencias', e: '🛟', c: '#2a78d6', modo: 'pct', pct: 50, aporte: 0, saldo0: 0, plazo: 12, meta: 0 }] },
    cfg: { plan: { items: [{ id: 'p1', tipo: 'ingreso', n: 'Sueldo', cat: 'sueldo', base: 1000000, desde: '2026-10' }, { id: 'p2', tipo: 'gasto', n: 'Alquiler', cat: 'viv', base: 400000, desde: '2026-10' }] } }
  });
  // base de prueba con lo mismo que hay en memoria
  const local = N.Store.local; await N.Store.init(); await N.Store.reemplazar(local);
  assert.equal(N.primerMesSinCerrar(), '2026-10');
  const w = N.cierreNuevo('2026-10');
  const c = N.wCalc(w);
  assert.equal(c.ing, 1000000); assert.equal(c.cons, 500000); assert.equal(c.sobra, 500000);
  assert.equal(w.ap.emerg.sug, 250000, '50% de lo que sobró');
  w.val.emerg.v = '260.000'; w.val.emerg.touched = true; // la familia mira el saldo real del fondo
  const r = N.cierreArmar(w);
  assert.equal(r.doc.sobra, 500000);
  assert.equal(r.movs.filter(m => m.planId === 'p1' || m.planId === 'p2').length, 2, 'confirma cobros y pagos pendientes');
  const ap = r.movs.find(m => m.tipo === 'aporte'), rend = r.movs.find(m => m.tipo === 'rendimiento');
  assert.equal(ap.total, 250000); assert.equal(rend.total, 10000, 'rendimiento = valor real − (saldo + aporte)');
  N.setW(w); await N.wSave(null); await N.metrica('noop');
  assert.ok(N.S.cierres['2026-10'], 'el cierre queda guardado');
  assert.equal(N.saldoFondo(N.S.cfg.destinos[0], '2026-10'), 260000);
  assert.equal(N.resumenMes('2026-10', 'pago').res, 500000);
  assert.equal(N.primerMesSinCerrar(), null);
  assert.equal(N.acumulado('2026-10').fondos.emerg, 260000, 'un mes cerrado usa el valor real');
  ae([...N.S.met.mesesCerrados], ['2026-10']);
});

test('carga rápida: entiende montos y medios como se dicen acá', () => {
  const N = casa([], { main: { tarjetas: [{ id: 'visa', n: 'Visa', cierre: 0 }, { id: 'naranja', n: 'Naranja X', cierre: 0 }] } });
  const r = t => { const x = N.leerRapido(t); return [x.monto, x.com, x.medio]; };
  ae(r('1500 verdu'), [1500, 'Verdu', null]);
  ae(r('15 lucas super visa'), [15000, 'Super', 'visa']);
  ae(r('gasté 2 mil en la farmacia con débito'), [2000, 'Farmacia', 'deb']);
  ae(r('un palo tele'), [1000000, 'Tele', null]);
  ae(r('15k uber'), [15000, 'Uber', null]);
  ae(r('1.234,50 kiosco efectivo'), [1234.5, 'Kiosco', 'ef']);
  ae(r('500 naranja'), [500, 'Naranja', null], 'si no queda otra cosa, «naranja» es lo comprado');
  ae(r('pan de campo 3200'), [3200, 'Pan de campo', null], 'el «de» del medio se respeta');
  assert.equal(N.clasificar('Verdu', ''), 'alim');
});

test('mayordomía: el diezmo no se sugiere si el módulo está apagado', () => {
  const N = casa();
  assert.notEqual(N.clasificar('Ofrenda', ''), 'diez');
  assert.ok(!N.S.cfg.cats.some(c => c.id === 'diez'), 'la plantilla no trae el rubro');
  const M = casa([], { main: { mayordomia: true, cats: [...casa().S.cfg.cats, { id: 'diez', n: 'Diezmo y ofrendas', e: '🙏', c: '#9a6b3f' }] } });
  assert.equal(M.clasificar('Ofrenda', ''), 'diez');
});

test('primer uso: la plantilla es genérica y respeta lo que se eligió', () => {
  const N = casa();
  const c0 = N.cfgInicial({});
  ae([...c0.usuarios], ['Yo']); assert.equal(c0.tarjetas.length, 0); assert.equal(c0.tc, 0);
  const c = N.cfgInicial({ nombres: ['Sol', ' Tomi '], tarjetas: ['visa', 'Tarjeta del club'], ejemplo: true });
  ae([...c.usuarios], ['Sol', 'Tomi']);
  ae(c.tarjetas.map(t => t.n), ['Visa', 'Tarjeta del club']);
  const ej = N.datosEjemplo(c, '2026-11');
  assert.ok(ej.movs.every(m => m.ejemplo) && ej.plan.every(p => p.ejemplo));
  assert.equal(ej.movs.filter(m => m.cuota).length, 3);
});

test('métrica local: segundos desde la bienvenida hasta el primer gasto', () => {
  const N = casa();
  const t0 = new Date('2026-11-17T12:00:00').getTime();
  const p = N.metricaPatch('gasto', null, { bienvenidaT0: t0, primerUso: 'x', ultimoDia: '2026-11-17' }, new Date(t0 + 42000));
  assert.equal(p.segundosHastaPrimerGasto, 42); assert.equal(p.gastos, 1);
  ae(Object.keys(N.metricaPatch('gasto', null, { primerGasto: 'x', gastos: 3, primerUso: 'x', ultimoDia: '2026-11-17' })), ['gastos']);
});
