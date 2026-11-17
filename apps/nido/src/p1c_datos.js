/* ============ Plantillas, ejemplo, respaldo (exportar / importar) y métricas locales ============
   Todo lo de este archivo es lógica pura sobre objetos: no toca la pantalla (lo usan las pruebas). */

/* ---------- Primer uso: configuración de la casa ---------- */
function cfgInicial(o = {}) {
  const c = defCfg();
  const nombres = (o.nombres || []).map(s => String(s || '').trim().slice(0, 24)).filter(Boolean);
  c.usuarios = nombres.length ? [...new Set(nombres)] : ['Yo'];
  const ids = o.tarjetas || [];
  c.tarjetas = ids.map(id => TARJETAS0.find(t => t.id === id) || { id: 't' + keyOf(id).slice(0, 12), n: String(id).slice(0, 30) }).map(t => ({ id: t.id, n: t.n, cierre: 0 }));
  c.onboarding = { fecha: new Date().toISOString(), ejemplo: !!o.ejemplo };
  return c;
}

/* ---------- Datos de ejemplo (se borran con un toque; todos llevan ejemplo: true) ---------- */
function datosEjemplo(c, ym) {
  ym = ym || ymNow();
  const dia = d => `${ym}-${pad(Math.min(d, ym === ymNow() ? Math.max(1, +hoy().slice(8, 10)) : daysIn(ym)))}`;
  const quien = c.usuarios[0], otro = c.usuarios[1] || c.usuarios[0];
  const t = (c.tarjetas[0] || null), creado = new Date().toISOString();
  const base = (o) => ({ creado, src: 'ejemplo', ejemplo: true, com: '', nota: '', ...o });
  const movs = [
    base({ tipo: 'ingreso', cat: 'sueldo', fecha: dia(1), mes: ym, medio: 'tr', por: quien, total: 1250000, items: [{ n: 'Sueldo', cat: 'sueldo', monto: 1250000, cant: 1 }] }),
    base({ tipo: 'gasto', fecha: dia(2), mes: ym, medio: 'deb', por: otro, com: 'Súper del barrio', items: [{ n: 'Leche', cat: 'alim', monto: 2800, cant: 2 }, { n: 'Pan', cat: 'alim', monto: 3200, cant: 1 }, { n: 'Yerba mate', cat: 'alim', monto: 4500, cant: 1 }, { n: 'Detergente', cat: 'limp', monto: 2900, cant: 1 }], total: 13400 }),
    base({ tipo: 'gasto', fecha: dia(3), mes: ym, medio: 'deb', por: quien, com: 'Colectivo', items: [{ n: 'Colectivo', cat: 'trans', monto: 1400, cant: 1 }], total: 1400 }),
    base({ tipo: 'aporte', fondo: (c.destinos[0] || {}).id || 'emerg', fecha: dia(4), mes: ym, por: quien, items: [], total: 50000 })
  ];
  if (t) {
    const m1 = imputarCon(dia(3), t);
    movs.push(base({ tipo: 'gasto', fecha: dia(3), mes: m1, medio: t.id, por: quien, com: 'Netflix', items: [{ n: 'Netflix', cat: 'sus', monto: 9000, cant: 1 }], total: 9000 }));
    const g = 'ej' + uid();
    for (let i = 0; i < 3; i++) movs.push(base({ tipo: 'gasto', fecha: dia(4), mes: addM(m1, i), medio: t.id, por: otro, com: 'Zapatillas', items: [{ n: 'Zapatillas', cat: 'ropa', monto: 40000, cant: 1 }], total: 40000, grupo: g, cuota: { i: i + 1, n: 3 } }));
  }
  const plan = [
    { id: 'pej-alq', tipo: 'gasto', n: 'Alquiler', cat: 'viv', base: 450000, desde: ym, ejemplo: true },
    { id: 'pej-exp', tipo: 'gasto', n: 'Expensas', cat: 'exp', base: 85000, desde: ym, ejemplo: true }
  ];
  return { movs, plan };
}
/* Imputación con una tarjeta que todavía no está guardada en la configuración (para armar el ejemplo). */
function imputarCon(fecha, t) { const ym = fecha.slice(0, 7), d = +fecha.slice(8, 10); return addM(ym, t.cierre && d > t.cierre ? 2 : 1); }
const hayEjemplo = () => S.movs.some(m => m.ejemplo) || S.plan.items.some(i => i.ejemplo);

/* ---------- Respaldo ---------- */
const RESPALDO_FORMATO = 'nido-respaldo';
const RESPALDO_VERSION = 1;
const TIPOS_MOV = ['gasto', 'ingreso', 'aporte', 'retiro', 'rendimiento'];
function armarRespaldo(datos) {
  return { formato: RESPALDO_FORMATO, version: RESPALDO_VERSION, app: (typeof MARCA !== 'undefined' ? MARCA.nombre : 'Nido'), build: APP_BUILD, exportado: new Date().toISOString(), datos: { mov: clone(datos.mov || {}), cfg: clone(datos.cfg || {}) } };
}
const nombreRespaldo = () => `${(typeof MARCA !== 'undefined' ? MARCA.archivo : 'nido')}-respaldo-${hoy()}.json`;

/* Una colección puede venir como {id: doc} (así la guardan Nido y la app anterior) o como lista [{id, ...}]. */
function aMapa(col) {
  if (!col) return {};
  if (Array.isArray(col)) { const o = {}; col.forEach(d => { if (d && d.id != null) { const { id, ...r } = d; o[String(id)] = r; } }); return o; }
  if (typeof col === 'object') return col;
  return {};
}
const esFecha = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const esMes = s => typeof s === 'string' && /^\d{4}-\d{2}$/.test(s);
/* Revisa documento por documento: lo que no tiene forma de movimiento no entra (y se cuenta). */
function normalizarDatos(d) {
  const avisos = []; let malos = 0, fotos = 0;
  const mov = {};
  for (const [id, m0] of Object.entries(aMapa(d.mov))) {
    if (!m0 || typeof m0 !== 'object') { malos++; continue; }
    const m = clone(m0); delete m.id;
    if (!TIPOS_MOV.includes(m.tipo) || !esFecha(m.fecha)) { malos++; continue; }
    if (!esMes(m.mes)) m.mes = m.fecha.slice(0, 7);
    m.total = +m.total; if (!isFinite(m.total)) { malos++; continue; }
    if (!Array.isArray(m.items)) m.items = [];
    m.items = m.items.filter(i => i && typeof i === 'object').map(i => ({ ...i, monto: isFinite(+i.monto) ? +i.monto : 0 }));
    if (m.img) { delete m.img; fotos++; } // las fotos del artefacto viven en claude.ai: no se pueden traer
    mov[String(id)] = m;
  }
  const cfg = {};
  for (const [id, c] of Object.entries(aMapa(d.cfg))) if (c && typeof c === 'object') cfg[String(id)] = clone(c);
  if (cfg.main) {
    for (const k of ['cats', 'ingCats', 'tarjetas', 'destinos', 'usuarios', 'bolsas', 'itemsPropios']) if (cfg.main[k] != null && !Array.isArray(cfg.main[k])) delete cfg.main[k];
    if (Array.isArray(cfg.main.cats) && cfg.main.cats.some(c => c && c.id === 'diez') && cfg.main.mayordomia == null) cfg.main.mayordomia = true; // quien ya usaba el diezmo lo sigue viendo
  }
  for (const k of ['plan', 'metas']) if (cfg[k] && !Array.isArray(cfg[k].items)) cfg[k].items = [];
  if (malos) avisos.push(`${malos} ${malos === 1 ? 'registro no tenía' : 'registros no tenían'} forma de movimiento y no ${malos === 1 ? 'entró' : 'entraron'}.`);
  if (fotos) avisos.push(`${fotos} ${fotos === 1 ? 'foto de ticket queda' : 'fotos de tickets quedan'} en la app anterior (los movimientos sí entran).`);
  return { datos: { mov, cfg }, avisos };
}
function resumenDatos(datos) {
  const c = datos.cfg || {}, main = c.main || {};
  return {
    movs: Object.keys(datos.mov || {}).length,
    plan: ((c.plan || {}).items || []).length,
    metas: ((c.metas || {}).items || []).length,
    cierres: Object.keys(c).filter(k => k.startsWith('cierre_')).length,
    fondos: (main.destinos || []).length, tarjetas: (main.tarjetas || []).length, rubros: (main.cats || []).length
  };
}
/* Lee lo que la persona eligió importar: un respaldo de Nido, la copia de la app anterior (JSON) o su CSV de movimientos. */
function leerRespaldo(texto, nombre) {
  texto = String(texto || '').replace(/^﻿/, '');
  if (!texto.trim()) throw new Error('El archivo está vacío.');
  const t0 = texto.trimStart();
  if (!(t0.startsWith('{') || t0.startsWith('['))) {
    if (/^"?fecha"?\s*,/i.test(t0)) return csvAnterior(texto);
    throw new Error('No reconozco este archivo. Elegí un respaldo de Nido (.json) o la exportación de la app anterior (.json o .csv).');
  }
  let o; try { o = JSON.parse(texto); } catch (e) { throw new Error('El archivo parece JSON pero está roto o incompleto.'); }
  let origen, crudo;
  if (o && o.formato === RESPALDO_FORMATO) {
    if (+o.version > RESPALDO_VERSION) throw new Error('Este respaldo es de una versión más nueva de la app. Actualizá la app y probá de nuevo.');
    origen = 'nido'; crudo = o.datos || {};
  } else if (o && o.formato === 'economia-familiar-respaldo') { origen = 'app-anterior'; crudo = o.datos || o; }
  else if (o && (o.mov || o.cfg)) { origen = 'app-anterior'; crudo = o; }
  else throw new Error('El JSON no tiene movimientos ni configuración que reconozca.');
  const { datos, avisos } = normalizarDatos(crudo);
  if (origen === 'app-anterior') {
    datos.cfg.main = datos.cfg.main || {};
    if (!datos.cfg.main.onboarding) datos.cfg.main.onboarding = { fecha: new Date().toISOString(), importado: 'app-anterior' };
  }
  if (!resumenDatos(datos).movs && !datos.cfg.main) throw new Error('El archivo no trae movimientos ni configuración.');
  return { origen, datos, resumen: resumenDatos(datos), avisos };
}

/* ---------- CSV ---------- */
function parseCSV(texto) {
  const filas = []; let fila = [], campo = '', q = false;
  texto = String(texto).replace(/^﻿/, '');
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (q) { if (ch === '"') { if (texto[i + 1] === '"') { campo += '"'; i++; } else q = false; } else campo += ch; continue; }
    if (ch === '"') q = true; else if (ch === ',') { fila.push(campo); campo = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && texto[i + 1] === '\n') i++; fila.push(campo); campo = ''; if (fila.some(x => x !== '')) filas.push(fila); fila = []; }
    else campo += ch;
  }
  fila.push(campo); if (fila.some(x => x !== '')) filas.push(fila);
  return filas;
}
const csvCampo = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
/* El CSV de movimientos (mismas columnas que la app anterior, así una planilla sirve para las dos). */
function movimientosCSV() {
  const rows = [['fecha', 'mes_de_pago', 'tipo', 'comercio', 'item', 'rubro', 'monto', 'medio', 'cargo', 'cuota']];
  S.movs.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).forEach(m => {
    const cu = m.cuota ? `${m.cuota.i}/${m.cuota.n}` : '';
    if (m.tipo === 'gasto') (m.items || []).forEach(i => rows.push([m.fecha, m.mes, 'gasto', m.com || '', i.n, catOf(i.cat).n, i.monto, medioOf(m.medio).n + (m.pagoFondo ? ' (fondo)' : ''), m.por || '', cu]));
    else rows.push([m.fecha, m.mes, m.tipo, m.com || (destOf(m.fondo) || {}).n || '', m.tipo === 'ingreso' ? ingCatOf(m.cat).n : '', '', m.total, '', m.por || '', '']);
  });
  return '﻿' + rows.map(r => r.map(csvCampo).join(',')).join('\n');
}
/* Convierte el CSV de la app anterior. Trae solo movimientos: el plan, los cierres, las metas y los saldos iniciales no están en ese archivo. */
function csvAnterior(texto) {
  const filas = parseCSV(texto); if (filas.length < 2) throw new Error('El CSV no tiene movimientos.');
  const cab = filas[0].map(h => norm(h).replace(/ /g, '_')), col = n => cab.indexOf(n);
  for (const n of ['fecha', 'tipo', 'monto']) if (col(n) < 0) throw new Error('Al CSV le falta la columna «' + n + '».');
  const get = (f, n) => col(n) < 0 ? '' : String(f[col(n)] ?? '').trim();
  const main = defCfg(); main.usuarios = []; main.tarjetas = []; main.destinos = [];
  main.onboarding = { fecha: new Date().toISOString(), importado: 'csv-anterior' };
  const CASH = { efectivo: 'ef', debito: 'deb', transferencia: 'tr' };
  const rubro = n => {
    if (!n) return 'otros'; const k = norm(n);
    let c = main.cats.find(x => norm(x.n) === k) || (norm(CAT_DIEZ.n) === k ? CAT_DIEZ : null);
    if (c && !main.cats.includes(c)) { main.cats.push(clone(c)); main.mayordomia = true; }
    if (!c) { c = { id: 'c' + keyOf(n).slice(0, 14), n: n.slice(0, 40), e: '🏷️', c: '#8792a4' }; main.cats.push(c); }
    return c.id;
  };
  const ingCat = n => { const k = norm(n); let c = main.ingCats.find(x => norm(x.n) === k); if (!c) { c = { id: 'i' + keyOf(n || 'otros').slice(0, 14), n: (n || 'Otros ingresos').slice(0, 40), e: '➕', c: '#8792a4' }; main.ingCats.push(c); } return c.id; };
  const medio = n => { const k = norm(n); if (!k) return 'ef'; if (CASH[k]) return CASH[k]; let t = main.tarjetas.find(x => norm(x.n) === k); if (!t) { t = { id: 't' + keyOf(n).slice(0, 14), n: n.slice(0, 30), cierre: 0 }; main.tarjetas.push(t); } return t.id; };
  let sinFondo = false;
  const fondo = n => {
    const k = norm(n); if (!k || k === 'ajuste de cierre') { sinFondo = true; n = 'Fondo sin identificar'; }
    let d = main.destinos.find(x => norm(x.n) === norm(n));
    if (!d) { d = { id: 'f' + keyOf(n).slice(0, 14), n: n.slice(0, 40), e: '💰', c: PALETA_IMPORT[main.destinos.length % PALETA_IMPORT.length], aporte: 0, saldo0: 0, plazo: 12, meta: 0 }; main.destinos.push(d); }
    return d.id;
  };
  const mov = {}; let malos = 0, ant = null, antKey = '';
  const grupos = new Map(); const creado = new Date().toISOString();
  for (const f of filas.slice(1)) {
    const fecha = get(f, 'fecha'), tipo = norm(get(f, 'tipo')), monto = Number(get(f, 'monto').replace(',', '.'));
    if (!esFecha(fecha) || !TIPOS_MOV.includes(tipo) || !isFinite(monto)) { malos++; continue; }
    const mes = esMes(get(f, 'mes_de_pago')) ? get(f, 'mes_de_pago') : fecha.slice(0, 7);
    const por = get(f, 'cargo'); if (por && !main.usuarios.includes(por)) main.usuarios.push(por);
    const com = get(f, 'comercio');
    if (tipo === 'gasto') {
      let med = get(f, 'medio'), pf = null; if (/\(fondo\)\s*$/.test(med)) { med = med.replace(/\s*\(fondo\)\s*$/, ''); pf = fondo(''); }
      const cuota = get(f, 'cuota'), key = [fecha, mes, com, med, por, cuota, pf].join('|');
      const item = { n: get(f, 'item') || 'Gasto', cat: rubro(get(f, 'rubro')), monto: r2(monto), cant: 1 };
      if (ant && antKey === key) { ant.items.push(item); ant.total = r2(ant.total + item.monto); continue; }
      const m = { tipo: 'gasto', fecha, mes, medio: medio(med), com, nota: '', por, items: [item], total: r2(monto), src: 'importado', creado };
      if (pf) m.pagoFondo = pf;
      const cu = cuota.match(/^(\d+)\s*\/\s*(\d+)$/);
      if (cu && +cu[2] > 1) {
        m.cuota = { i: +cu[1], n: +cu[2] };
        const gk = [fecha, com, med, por, cu[2]].join('|'); if (!grupos.has(gk)) grupos.set(gk, 'g' + uid()); m.grupo = grupos.get(gk);
      }
      const id = uid() + Object.keys(mov).length; mov[id] = m; ant = m; antKey = key; continue;
    }
    ant = null; antKey = '';
    const m = { tipo, fecha, mes, por, total: r2(monto), items: [], com: '', src: 'importado', creado };
    if (tipo === 'ingreso') { m.cat = ingCat(get(f, 'item')); m.com = com; m.medio = 'tr'; m.items = [{ n: com || ingCatOf(m.cat).n, cat: m.cat, monto: r2(monto), cant: 1 }]; if (!com) m.items[0].n = (main.ingCats.find(x => x.id === m.cat) || {}).n || 'Ingreso'; }
    else { m.fondo = fondo(com); if (norm(com) === 'ajuste de cierre') m.com = com; }
    mov[uid() + Object.keys(mov).length] = m;
  }
  if (!main.usuarios.length) main.usuarios = ['Yo'];
  if (!main.destinos.length) main.destinos = clone(DESTINOS0);
  const fechas = Object.values(mov).map(m => m.mes).sort(); if (fechas.length) main.inicio = fechas[0];
  const datos = { mov, cfg: { main } };
  const avisos = ['El CSV de la app anterior trae solo los movimientos: el plan mensual, los cierres de mes, las metas, los presupuestos y los saldos iniciales de los fondos no están en ese archivo. Para traer todo, usá la copia completa (JSON).'];
  if (malos) avisos.push(`${malos} ${malos === 1 ? 'fila no se pudo leer' : 'filas no se pudieron leer'} y ${malos === 1 ? 'quedó' : 'quedaron'} afuera.`);
  if (sinFondo) avisos.push('Algunos movimientos de fondos (ajustes de cierre o compras pagadas con un fondo) no dicen de qué fondo eran: quedaron en «Fondo sin identificar».');
  return { origen: 'csv-anterior', datos, resumen: resumenDatos(datos), avisos };
}
const PALETA_IMPORT = ['#2a78d6', '#6250d6', '#0e8fa8', '#1baf7a', '#eda100', '#eb6834', '#e0457b', '#9a6b3f'];

/* ---------- Métricas locales (nunca salen del dispositivo; viajan solo dentro del respaldo) ----------
   Miden lo que el corte 0 tiene que probar: de cero a un primer gasto en menos de un minuto, cuántos gastos se cargan
   y cuántos meses se cierran (la métrica norte del producto). */
function metricaPatch(tipo, extra, met, ahora) {
  met = met || {}; ahora = ahora || new Date(); const p = {}; const dia = hoy();
  if (!met.primerUso) p.primerUso = ahora.toISOString();
  if (tipo === 'inicio-bienvenida' && !met.bienvenidaT0) p.bienvenidaT0 = ahora.getTime();
  if (tipo === 'gasto') {
    p.gastos = (met.gastos || 0) + 1;
    if (!met.primerGasto) { p.primerGasto = ahora.toISOString(); if (met.bienvenidaT0) p.segundosHastaPrimerGasto = Math.round((ahora.getTime() - met.bienvenidaT0) / 1000); }
  }
  if (tipo === 'cierre') { const l = new Set(met.mesesCerrados || []); l.add(extra); p.mesesCerrados = [...l].sort(); }
  if (tipo === 'importacion') p.importaciones = (met.importaciones || 0) + 1;
  if (met.ultimoDia !== dia) { p.ultimoDia = dia; p.diasActivos = (met.diasActivos || 0) + 1; }
  return p;
}
let COLA_MET = Promise.resolve();
function metrica(tipo, extra) { // en fila: cada cuenta parte de la anterior ya guardada
  COLA_MET = COLA_MET.then(() => { const p = metricaPatch(tipo, extra, S.met); return Object.keys(p).length ? Store.merge('cfg', 'metricas', p) : null; }).catch(() => { });
  return COLA_MET;
}
