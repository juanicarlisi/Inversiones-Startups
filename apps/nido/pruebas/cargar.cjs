// Carga el código de Nido (o de la app anterior, solo para leerlo) en un contexto de Node, sin navegador.
// La fecha queda fija para que las cuentas no dependan del día en que se corren las pruebas.
const vm = require('vm'), fs = require('fs'), path = require('path');
const fidb = require('fake-indexeddb');
const SRC = path.join(__dirname, '..', 'src');
const VIEJA = path.join(__dirname, '..', '..', 'economia-familiar', 'src');
const HOY = '2026-11-17T12:00:00';

function fechaFija(iso) {
  const fijo = new Date(iso).getTime();
  return class FechaFija extends Date { constructor(...a) { if (a.length) super(...a); else super(fijo); } static now() { return fijo; } };
}
function contexto(extra = {}) {
  const ls = new Map();
  const ctx = {
    console, setTimeout, clearTimeout, structuredClone, Promise, URLSearchParams,
    Date: fechaFija(extra.hoy || HOY),
    localStorage: { getItem: k => (ls.has(k) ? ls.get(k) : null), setItem: (k, v) => ls.set(k, String(v)), removeItem: k => ls.delete(k) },
    navigator: {}, toast: () => { }, render: () => { }, onData: () => { }, closeSheet: () => { }, celebrar: () => null, cpRefresh: () => { }, SHEETS: [],
    MARCA: { nombre: 'Nido', archivo: 'nido' }, NIDO_BUILD: 'prueba',
    indexedDB: extra.indexedDB || new fidb.IDBFactory()
  };
  for (const k of ['IDBCursor', 'IDBCursorWithValue', 'IDBDatabase', 'IDBFactory', 'IDBIndex', 'IDBKeyRange', 'IDBObjectStore', 'IDBOpenDBRequest', 'IDBRequest', 'IDBTransaction', 'IDBVersionChangeEvent']) ctx[k] = fidb[k];
  ctx.globalThis = ctx; ctx.window = ctx; ctx.self = ctx;
  return vm.createContext(ctx);
}
const EXPORTAR = ['S', 'Store', 'cfg', 'defCfg', 'applyCfgDocs', 'imputar', 'resumenMes', 'movsEn', 'esperado', 'acumulado', 'saldoFondo', 'cajaHasta', 'patrimonio', 'tarjetasMes', 'checklist',
  'aportePlan', 'sobraEsp', 'primerMesSinCerrar', 'clasificar', 'parseMonto', 'addM', 'ymNow', 'hoy', 'uid', 'catOf', 'CATS0'];
const EXPORTAR_NIDO = ['cierreNuevo', 'cierreArmar', 'wCalc', 'wSave', 'leerRapido', 'cfgInicial', 'datosEjemplo', 'leerRespaldo', 'armarRespaldo', 'csvAnterior', 'parseCSV', 'movimientosCSV', 'metricaPatch', 'metrica', 'nuevoCP', 'cpSave', 'movDesdePlan', 'normalizarDatos'];

/* Nido: núcleo, catálogo, datos, almacenamiento y formularios (sin las pantallas). */
function cargarNido(extra = {}) {
  const ctx = contexto(extra);
  vm.runInContext(fs.readFileSync(path.join(SRC, 'vendor', 'idb-8.0.4.umd.js'), 'utf8'), ctx, { filename: 'idb.umd.js' });
  const archivos = ['p1_core.js', 'p1b_catalogo.js', 'p1c_datos.js', 'p1d_store.js', 'p3_forms.js'];
  const codigo = archivos.map(f => fs.readFileSync(path.join(SRC, f), 'utf8')).join('\n') +
    `\n;globalThis.N = { ${[...EXPORTAR, ...EXPORTAR_NIDO].join(', ')}, setCP: v => { CP = v; }, getCP: () => CP, setW: v => { W = v; } };`;
  vm.runInContext(codigo, ctx, { filename: 'nido.js' });
  return ctx.N;
}
/* La app de la familia (versión 32), solo para leer su lógica y su exportación CSV. No se modifica nada de su carpeta. */
function cargarVieja(extra = {}) {
  const ctx = contexto(extra);
  const p4 = fs.readFileSync(path.join(VIEJA, 'p4_app.js'), 'utf8');
  const a = p4.indexOf('async function exportCSV()'), b = p4.indexOf('function abrirEditarMov');
  if (a < 0 || b < 0) throw new Error('No encontré exportCSV en la app anterior');
  const codigo = ['p1_core.js', 'p1b_catalogo.js'].map(f => fs.readFileSync(path.join(VIEJA, f), 'utf8')).join('\n') + '\n' + p4.slice(a, b) +
    `\n;globalThis.V = { ${EXPORTAR.join(', ')}, exportCSV };`;
  vm.runInContext(codigo, ctx, { filename: 'vieja.js' });
  return ctx.V;
}
module.exports = { cargarNido, cargarVieja, fidb, HOY };
