// Pruebas de datos: base local (IndexedDB), respaldo, importación desde la app anterior (JSON y CSV) y limpieza de datos personales.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const { cargarNido, cargarVieja, fidb } = require('./cargar.cjs');
const COPIA = JSON.parse(fs.readFileSync(path.join(__dirname, 'datos', 'app-anterior-copia.json'), 'utf8'));
const J = o => JSON.parse(JSON.stringify(o)); // los objetos vienen de otro contexto (vm)
const MESES = ['2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02'];

/* La misma copia leída por la app anterior: es la vara contra la que se compara lo importado. */
function vieja() {
  const V = cargarVieja();
  V.S.movs = Object.entries(COPIA.mov).map(([id, d]) => ({ id, ...d })).filter(m => m.tipo !== 'transferencia rara');
  V.applyCfgDocs(COPIA.cfg);
  return V;
}

test('base local: lo guardado sigue ahí al volver a abrir la app (misma base IndexedDB)', async () => {
  const idb = new fidb.IDBFactory();
  const A = cargarNido({ indexedDB: idb }); await A.Store.init();
  await A.Store.set('cfg', 'main', { ...A.defCfg(), usuarios: ['Persona A'] });
  await A.Store.set('mov', 'g1', { tipo: 'gasto', fecha: '2026-11-02', mes: '2026-11', medio: 'ef', total: 1500, items: [{ n: 'Verduras', cat: 'alim', monto: 1500 }] });
  await A.Store.merge('cfg', 'aprendido', { verdu: 'alim' });
  await A.Store.set('mov', 'g2', { tipo: 'gasto', fecha: '2026-11-03', mes: '2026-11', medio: 'ef', total: 10, items: [] });
  await A.Store.del('mov', 'g2');
  const B = cargarNido({ indexedDB: idb }); await B.Store.init(); // «recargar la página»
  assert.deepEqual(J(B.S.movs.map(m => m.id)), ['g1']);
  assert.equal(B.S.cfg.usuarios[0], 'Persona A');
  assert.equal(B.S.apr.verdu, 'alim');
  assert.equal(B.resumenMes('2026-11', 'pago').cons, 1500);
});

test('respaldo de Nido: exportar e importar devuelve exactamente lo mismo', async () => {
  const A = cargarNido(); await A.Store.init();
  const r0 = A.leerRespaldo(JSON.stringify(COPIA));
  await A.Store.reemplazar(r0.datos);
  const texto = JSON.stringify(A.armarRespaldo(A.Store.todo()));
  const obj = JSON.parse(texto);
  assert.equal(obj.formato, 'nido-respaldo'); assert.equal(obj.version, 1);
  const B = cargarNido(); await B.Store.init();
  const r = B.leerRespaldo(texto, 'nido-respaldo.json');
  assert.equal(r.origen, 'nido');
  await B.Store.reemplazar(r.datos);
  assert.deepEqual(J(B.Store.todo()), J(A.Store.todo()));
  for (const ym of MESES) assert.equal(B.resumenMes(ym, 'pago').cons, A.resumenMes(ym, 'pago').cons, ym);
});

test('copia completa de la app anterior: entra todo lo que tiene forma de movimiento y las cuentas dan igual', async () => {
  const N = cargarNido(); await N.Store.init();
  const r = N.leerRespaldo(JSON.stringify(COPIA), 'copia.json');
  assert.equal(r.origen, 'app-anterior');
  assert.equal(r.resumen.movs, Object.keys(COPIA.mov).length - 1, 'el registro roto queda afuera');
  assert.equal(r.resumen.plan, 3); assert.equal(r.resumen.cierres, 1); assert.equal(r.resumen.fondos, 2);
  assert.ok(r.avisos.some(a => /no tenía forma/.test(a)) && r.avisos.some(a => /foto/.test(a)));
  assert.ok(!('img' in r.datos.mov.conFoto), 'la foto del artefacto no viaja');
  assert.equal(r.datos.cfg.main.mayordomia, true, 'quien ya usaba el diezmo lo sigue viendo');
  assert.ok(r.datos.cfg.main.onboarding, 'no se le muestra el primer uso');
  await N.Store.reemplazar(r.datos);
  const V = vieja();
  for (const ym of MESES) {
    const a = N.resumenMes(ym, 'pago'), b = V.resumenMes(ym, 'pago');
    for (const k of ['ing', 'cons', 'apor', 'ret', 'res']) assert.equal(a[k], b[k], `${ym} ${k}`);
    assert.equal(N.esperado(ym).consEsp, V.esperado(ym).consEsp, `${ym} gasto esperado`);
    assert.equal(N.patrimonio(ym), V.patrimonio(ym), `${ym} patrimonio`);
  }
  assert.deepEqual(J(N.tarjetasMes('2026-10').map(t => t.total)), J(V.tarjetasMes('2026-10').map(t => t.total)));
  assert.equal(N.acumulado('2026-12').total, V.acumulado('2026-12').total, 'patrimonio proyectado con rendimiento estimado');
  assert.equal(N.clasificar('Atún', ''), 'alim', 'lo aprendido viaja');
});

test('la copia también se acepta con colecciones en forma de lista y con el envoltorio sugerido para la versión 33', () => {
  const N = cargarNido();
  const lista = { mov: Object.entries(COPIA.mov).map(([id, d]) => ({ id, ...d })), cfg: Object.entries(COPIA.cfg).map(([id, d]) => ({ id, ...d })) };
  const a = N.leerRespaldo(JSON.stringify(lista));
  const b = N.leerRespaldo(JSON.stringify({ formato: 'economia-familiar-respaldo', version: 32, datos: COPIA }));
  assert.equal(a.resumen.movs, 38); assert.equal(b.resumen.movs, 38); assert.equal(a.resumen.cierres, 1);
});

test('CSV que exporta hoy la app anterior (su propio código): se reconstruyen los movimientos y los totales por mes', async () => {
  const V = vieja(); let csv = null;
  V.S.cap.downloads = { save: async o => { csv = o.data; } };
  await V.exportCSV();
  assert.ok(csv && csv.startsWith('﻿"fecha"'), 'el CSV salió de la app anterior');
  const N = cargarNido(); await N.Store.init();
  const r = N.leerRespaldo(csv, 'economia-familiar-2026-11-17.csv');
  assert.equal(r.origen, 'csv-anterior');
  assert.ok(r.avisos[0].includes('solo los movimientos'));
  await N.Store.reemplazar(r.datos);
  for (const ym of MESES) {
    const a = N.resumenMes(ym, 'pago'), b = V.resumenMes(ym, 'pago');
    for (const k of ['ing', 'cons', 'apor', 'ret']) assert.equal(a[k], b[k], `${ym} ${k}`);
  }
  const cuotas = N.S.movs.filter(m => m.com === 'Casa de electro');
  assert.equal(cuotas.length, 6); assert.equal(new Set(cuotas.map(m => m.grupo)).size, 1, 'las seis cuotas quedan agrupadas');
  const super_ = N.S.movs.filter(m => m.com === 'Súper del barrio');
  assert.equal(super_.length, 3); assert.equal(super_[0].items.length, 3, 'un ticket con varios ítems vuelve a ser una compra');
  assert.ok(N.S.cfg.tarjetas.some(t => t.n === 'Visa Banco Uno'));
  assert.ok(N.S.cfg.destinos.some(d => d.n === 'Viaje') && N.S.cfg.destinos.some(d => d.n === 'Fondo sin identificar'));
  assert.equal(N.S.cfg.inicio, '2026-08');
  // y Nido exporta el mismo CSV (mismas columnas): ida y vuelta estable
  const ida = N.movimientosCSV(); const N2 = cargarNido(); await N2.Store.init();
  await N2.Store.reemplazar(N2.leerRespaldo(ida).datos);
  for (const ym of MESES) assert.equal(N2.resumenMes(ym, 'pago').cons, N.resumenMes(ym, 'pago').cons);
});

test('archivos que no sirven: mensajes claros y nada se rompe', () => {
  const N = cargarNido();
  assert.throws(() => N.leerRespaldo(''), /vacío/);
  assert.throws(() => N.leerRespaldo('hola'), /No reconozco/);
  assert.throws(() => N.leerRespaldo('{"mov":'), /roto/);
  assert.throws(() => N.leerRespaldo('{"a":1}'), /no tiene movimientos/);
  assert.throws(() => N.leerRespaldo(JSON.stringify({ formato: 'nido-respaldo', version: 99, datos: {} })), /más nueva/);
  assert.equal(N.parseCSV('"a","b ""c"""\r\n1,2\n').length, 2);
});

test('el código de Nido no trae nombres, bancos ni enlaces de la familia', () => {
  const web = path.join(__dirname, '..', 'web', 'index.html');
  const fuentes = ['p1_core.js', 'p1b_catalogo.js', 'p1c_datos.js', 'p1d_store.js', 'p2_views.js', 'p3_forms.js', 'p3b_nido.js', 'p4_app.js'].map(f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8'));
  const todo = fuentes.join('\n') + (fs.existsSync(web) ? fs.readFileSync(web, 'utf8') : '');
  for (const re of [/\bJuan\b/, /\bAni\b/i, /BBVA/i, /bciudad|banco ciudad/i, /\bMarcos\b/i, /claude\.ai\/artifact/, /keep smiling/i, /\bzap\b/i, /fonts\.googleapis|fonts\.gstatic/])
    assert.ok(!re.test(todo), 'apareció ' + re);
});
