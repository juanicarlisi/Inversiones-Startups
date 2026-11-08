'use strict';
/* ============ Utilidades ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const clone = o => JSON.parse(JSON.stringify(o));
const sum = (a, f) => a.reduce((s, x) => s + (f ? f(x) : x), 0);
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } };
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MES3 = MESES.map(m => m.slice(0, 3));
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const pad = n => String(n).padStart(2, '0');
const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const ymNow = () => hoy().slice(0, 7);
const addM = (ym, k) => { let y = +ym.slice(0, 4), m = +ym.slice(5, 7) - 1 + k; y += Math.floor(m / 12); m = ((m % 12) + 12) % 12; return `${y}-${pad(m + 1)}`; };
const ymLabel = ym => `${MESES[+ym.slice(5, 7) - 1]} ${ym.slice(0, 4)}`;
const ymName = ym => MESES[+ym.slice(5, 7) - 1];
const ymShort = ym => MES3[+ym.slice(5, 7) - 1];
const daysIn = ym => new Date(+ym.slice(0, 4), +ym.slice(5, 7), 0).getDate();
const fechaCorta = f => { const d = new Date(f + 'T12:00:00'); return `${DIAS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MES3[d.getMonth()].toLowerCase()}`; };
const fechaLarga = f => { const d = new Date(f + 'T12:00:00'); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()].toLowerCase()}`; };
const miles = n => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const money = n => (n < 0 && Math.round(n) !== 0 ? '−' : '') + '$ ' + miles(n);
const moneyDec = n => { const a = Math.abs(n); const e = Math.floor(a), c = Math.round((a - e) * 100); return (n < 0 ? '−' : '') + '$ ' + miles(e) + (c ? ',' + pad(c) : ''); };
const compact = n => { const a = Math.abs(n), s = n < 0 ? '−' : ''; if (a >= 1e6) return s + '$ ' + (a / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace('.', ',').replace(/,?0+$/, '') + ' M'; if (a >= 1e3) return s + '$ ' + Math.round(a / 1e3) + ' mil'; return s + '$ ' + Math.round(a); };
const usd = n => 'USD ' + miles(n);
const pct = (a, b) => b > 0 ? Math.round(a / b * 100) : 0;
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
const keyOf = s => { let k = norm(s).replace(/\s/g, '_'); if (k.length > 5 && k.endsWith('s') && !k.endsWith('ss')) k = k.slice(0, -1); return k.slice(0, 40) || 'x'; };
function parseMonto(v) {
  if (typeof v === 'number') return v;
  let s = String(v ?? '').toLowerCase().replace(/[$\s]/g, '').replace(/mil$/, 'k');
  let mult = 1; if (s.endsWith('k')) { mult = 1000; s = s.slice(0, -1); }
  if (!s) return 0;
  const lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
  if (lc > -1 && ld > -1) { s = lc > ld ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, ''); }
  else if (lc > -1) { s = s.replace(/\./g, '').replace(',', '.'); }
  else if (ld > -1) { const parts = s.split('.'); if (parts.length > 2 || (parts[1].length === 3 && parts[0].length >= 1 && parts[0] !== '0')) s = s.replace(/\./g, ''); }
  const n = parseFloat(s); return isFinite(n) ? n * mult : 0;
}
const fmtInput = n => { if (!n) return ''; const a = Math.abs(n), e = Math.floor(a + 1e-9), c = Math.round((a - e) * 100); return (n < 0 ? '-' : '') + String(c === 100 ? e + 1 : e).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (c && c < 100 ? ',' + pad(c) : ''); };
const r2 = n => Math.round(n * 100) / 100;

/* ============ Valores por defecto (estructura, sin datos personales) ============ */
const CATS0 = [
  { id: 'alim', n: 'Alimentos', e: '🛒', c: '#2a78d6' },
  { id: 'comer', n: 'Comidas afuera', e: '🍽️', c: '#eb6834' },
  { id: 'limp', n: 'Limpieza e higiene', e: '🧴', c: '#1baf7a' },
  { id: 'salud', n: 'Salud', e: '💊', c: '#e87ba4' },
  { id: 'viv', n: 'Alquiler', e: '🏠', c: '#6250d6' },
  { id: 'exp', n: 'Expensas', e: '🏢', c: '#eda100' },
  { id: 'serv', n: 'Servicios (luz, gas, internet)', e: '💡', c: '#008300' },
  { id: 'cel', n: 'Celulares', e: '📱', c: '#e34948' },
  { id: 'trans', n: 'Transporte', e: '🚗', c: '#0e8fa8' },
  { id: 'diez', n: 'Diezmo y ofrendas', e: '🙏', c: '#9a6b3f' },
  { id: 'deuda', n: 'Tarjetas y deudas', e: '💳', c: '#a33b3b' },
  { id: 'hogar', n: 'Hogar y equipamiento', e: '🛋️', c: '#c47a1c' },
  { id: 'ropa', n: 'Ropa y calzado', e: '👕', c: '#b05fd1' },
  { id: 'ocio', n: 'Salidas y ocio', e: '🎬', c: '#e0457b' },
  { id: 'sus', n: 'Suscripciones', e: '🔁', c: '#3b6ea8' },
  { id: 'edu', n: 'Educación', e: '📚', c: '#5aa0a0' },
  { id: 'reg', n: 'Regalos', e: '🎁', c: '#d98a8a' },
  { id: 'otros', n: 'Otros / imprevistos', e: '🧩', c: '#8792a4' }
];
const INGCATS0 = [
  { id: 'sueldo', n: 'Sueldo', e: '💼', c: '#0F8A5F' },
  { id: 'alqprop', n: 'Alquiler de propiedad', e: '🏘️', c: '#2a78d6' },
  { id: 'rend', n: 'Rendimientos', e: '📈', c: '#6250d6' },
  { id: 'aguin', n: 'Aguinaldo', e: '🎄', c: '#eda100' },
  { id: 'oting', n: 'Otros ingresos', e: '➕', c: '#8792a4' }
];
function defCfg() {
  return {
    v: 1, inicio: ymNow(), usuarios: ['Juan', 'Ani'], tc: 1545, tasa: 7.5, rendMensual: 1.6, caja: 0,
    cats: clone(CATS0), ingCats: clone(INGCATS0),
    tarjetas: [{ id: 'ciudad', n: 'Ciudad', cierre: 0 }, { id: 'visa', n: 'BBVA Visa', cierre: 0 }, { id: 'master', n: 'BBVA Mastercard', cierre: 0 }],
    destinos: [
      { id: 'jub', n: 'Jubilación', e: '🌅', c: '#6250d6', modo: 'pct', pct: 0, aporte: 0, saldo0: 0, plazo: 444, meta: 0 },
      { id: 'casa', n: 'Casa / terreno / depto', e: '🏡', c: '#2a78d6', aporte: 0, saldo0: 0, plazo: 120, meta: 0 },
      { id: 'auto', n: 'Auto', e: '🚗', c: '#0e8fa8', aporte: 0, saldo0: 0, plazo: 12, meta: 0 },
      { id: 'exper', n: 'Experiencias', e: '✈️', c: '#e0457b', aporte: 0, saldo0: 0, plazo: 1, meta: 0 }
    ]
  };
}

/* ============ Estado ============ */
const S = {
  cfg: defCfg(), plan: { items: [] }, metas: { items: [] }, apr: {}, cierres: {}, movs: [],
  cache: { mov: false, cfg: false }, t0: Date.now(), mes: ymNow(), vista: 'inicio', base: 'pago', user: null, mode: 'local', ready: false, loaded: { mov: false, cfg: false },
  cap: { sample: null, images: false, downloads: null }, ui: { movVista: 'compras', movFiltro: 'todo', q: '', anTab: 'rubros', abiertos: {}, itemQ: '', itemSort: 'monto', fondoSel: null }
};
const APP_BUILD = 'v30 · 8 nov 2026';
const cfg = () => S.cfg;
const medios = () => [{ id: 'ef', n: 'Efectivo', k: 'cash' }, { id: 'deb', n: 'Débito', k: 'cash' }, { id: 'tr', n: 'Transferencia', k: 'cash' }, ...cfg().tarjetas.map(t => ({ id: t.id, n: t.n, k: 'card', cierre: t.cierre || 0 }))];
const medioOf = id => medios().find(m => m.id === id) || { id, n: id, k: 'cash' };
const esTarjeta = id => medioOf(id).k === 'card';
const SIN = { id: 'sin', n: 'Sin rubro', e: '🧩', c: '#8792a4' };
const catOf = id => cfg().cats.find(c => c.id === id) || (id === 'otros' ? CATS0[CATS0.length - 1] : SIN);
const ingCatOf = id => cfg().ingCats.find(c => c.id === id) || INGCATS0[4];
/* Presupuesto mensual de un rubro en un mes (puede empezar desde cierto mes) */
const presDe = (c, ym) => (c.pres > 0 && (!c.presDesde || ym >= c.presDesde)) ? c.pres : 0;
/* Presupuestos que juntan varios rubros (ej: supermercado = alimentos + limpieza e higiene) */
const bolsasDe = ym => (cfg().bolsas || []).filter(b => b.monto > 0 && ym >= cfg().inicio && (!b.desde || ym >= b.desde));
function bolsaUso(b, ym) {
  const L = lineasDe(movsEn(ym, 'pago')).filter(l => (b.cats || []).includes(l.cat) && !l.m.planId);
  const gastado = sum(L, l => l.monto);
  return { gastado, queda: Math.max(0, b.monto - gastado), pasado: Math.max(0, gastado - b.monto) };
}
const destOf = id => cfg().destinos.find(d => d.id === id);
const userName = () => S.user || cfg().usuarios[0];

function imputar(fecha, medio) {
  const ym = fecha.slice(0, 7), m = medioOf(medio);
  if (m.k !== 'card') return ym;
  const d = +fecha.slice(8, 10);
  return addM(ym, m.cierre && d > m.cierre ? 2 : 1);
}

/* ============ Clasificación automática (reglas + lo que aprendimos) ============ */
const REGLAS = [
  ['diez', /diezmo|ofrenda|donacion|iglesia/],
  ['viv', /alquiler/], ['exp', /expensa/],
  ['deuda', /tarjeta|caucion|prestamo|zap\b|resumen visa|resumen master|financiacion/],
  ['trans', /uber|cabify|didi|\bsube\b|colectivo|subte|tren\b|nafta|combustible|\bypf\b|shell|axion|peaje|estacionamiento|cochera|taxi|lavadero|patente|bicicleta|monopatin/],
  ['sus', /netflix|spotify|disney|hbo|youtube|icloud|google one|chatgpt|claude|openai|prime video|amazon prime|paramount|apple music|dropbox|suscripcion|membresia|\bmax\b/],
  ['cel', /celular|claro|tuenti|recarga|linea movil|movistar celular|personal flow/],
  ['serv', /\bluz\b|edesur|edenor|\bgas\b|metrogas|naturgy|\bagua\b|aysa|internet|fibertel|telecentro|fibra|\babl\b|inmobiliario|cable|\bflow\b|\bwifi\b/],
  ['salud', /farmacia|ibuprofeno|paracetamol|medicament|remedio|dentista|odontolog|ferula|kinesi|medico|consulta|analisis clinic|obra social|prepaga|vitamina|ortodoncia|keep smiling|psicolog|oculista|anteojos|optica|farmacity|\bosde\b|swiss medical|galeno/],
  ['limp', /detergente|lavandina|limpia|esponja|trapo|rejilla|bolsa de residuo|bolsas residuo|suavizante|jabon|desinfectante|aerosol|insecticida|papel higienico|servilleta|rollo de cocina|papel de cocina|film |aluminio|escoba|trapeador|lustra|\bcif\b|ayudin|cloro|shampoo|acondicionador|pasta dental|dentifrico|cepillo|desodorante|algodon|toallita|protector solar|crema|afeitar|perfume|hisopo|panal|toalla femenina|tampon|shampú|enjuague|hilo dental|papel tissue|pañuelo|alcohol en gel|alcohol/],
  ['comer', /restaurante|restaurant|\bresto\b|cafeteria|starbucks|mcdonald|burger|pedidosya|pedidos ya|rappi|delivery|sushi|parrilla|cerveceria|\bbar\b|cafe martinez|havanna|mostaza|kfc|subway|grido|heladeria|pizzeria|empanadas|almuerzo|cena\b|desayuno afuera/],
  ['ropa', /remera|pantalon|zapatilla|campera|camisa|vestido|medias|\bropa\b|calzado|zara|h m|jean|buzo|short|bermuda|pollera|zapato|ojotas|cinturon|gorra|calzoncillo|corpiño|pijama/],
  ['hogar', /sillon|\bmesa\b|silla|mueble|lampara|alfombra|cuadro|microondas|tostadora|licuadora|electro|ferreteria|easy|sodimac|bombita|cortina|almohada|sabana|ikea|parrilla electrica|biblioteca|espejo|estante|colchon|vajilla|olla|sarten|cubiertos|vaso|plato|taza|decoracion|cesped sintetico|guitarra|piano/],
  ['ocio', /cine|teatro|recital|entrada|boliche|steam|playstation|bowling|salida|juego|paseo|museo|excursion|show|concierto|escape room/],
  ['edu', /curso|libro|libreria|udemy|colegio|clase|capacitacion|universidad|taller|escuela|cuaderno/],
  ['reg', /regalo|cumple|presente para/],
  ['alim', /leche|queso|yogur|manteca|huevo|\bpan\b|carne|milanesa|pollo|pechuga|cerdo|asado|picada|jamon|fiambre|salchicha|pescado|atun|merluza|verdura|fruta|papa\b|papas|cebolla|tomate|lechuga|zanahoria|banana|manzana|naranja|limon|palta|zapallo|arroz|fideo|pasta|harina|aceite|vinagre|\bsal\b|azucar|yerba|cafe\b|\bte\b|\bmate\b|galletit|snack|cereal|avena|lenteja|garbanzo|legumbre|pure|salsa|conserva|arveja|choclo|mayonesa|mostaza|ketchup|dulce|mermelada|miel|gaseosa|jugo|cerveza|vino|fernet|soda|helado|chocolate|alfajor|bizcocho|tostada|pizza|empanada|tapa de|carniceria|verduleria|supermercado|super\b|carrefour|coto|jumbo|disco|dia\b|chino|almacen|panaderia|fiambreria|dietetica|nuez|almendra|pasas|mani|aceituna|pepino|brocoli|espinaca|acelga|pera|uva|frutilla|durazno|sandia|melon|ajo|perejil|morron|berenjena|calabaza|batata|polenta|ravioles|noquis|hamburguesa|pan rallado|levadura|esencia|gelatina|flan|postre|crema de leche|ricota|muzzarella|mozzarella|cremoso|dulce de leche/]
];
function clasificar(nombre, comercio) {
  const k = keyOf(nombre);
  if (S.apr[k]) return S.apr[k];
  const ce = canonEntry(nombre); if (ce && cfg().cats.some(x => x.id === ce.cat)) return ce.cat;
  const t = norm(nombre + ' ' + (comercio || ''));
  for (const [cat, re] of REGLAS) if (re.test(t)) return cat;
  const t2 = norm(nombre);
  return null;
}

/* ============ Almacenamiento (nube compartida o local) ============ */
const Store = {
  mode: 'local', db: null, listeners: {},
  async init() {
    let db = null;
    try { if (window.claude && window.claude.use) db = await window.claude.use('db'); } catch (e) { db = null; }
    try { if (window.claude && window.claude.use) { S.cap.downloads = await window.claude.use('downloads'); S.cap.assets = await window.claude.use('assets'); S.cap.sample = await window.claude.use('sample'); } } catch (e) { }
    try { const u = window.claude && window.claude.use ? await window.claude.use('user') : null; if (u && u.can) { const w = u.can('data.write'); S.canWrite = (w && w.then) ? await w : w; } } catch (e) { S.canWrite = null; }
    try { if (S.cap.sample && S.cap.sample.limits) { const l = await S.cap.sample.limits(); S.cap.images = !!l.images; S.cap.imgLimits = l.images || null; } } catch (e) { S.cap.images = false; }
    S.cap.diag = { db: !!db, sample: !!S.cap.sample, assets: !!S.cap.assets, downloads: !!S.cap.downloads, claude: !!(window.claude && window.claude.use) };
    if (db) {
      this.mode = 'cloud'; this.db = db; S.mode = 'cloud';
      let t = setTimeout(() => { if (!S.loaded.mov) toast('Sin conexión con la base: puede que veas datos viejos.', null, true); }, 10000);
      db.collection('mov').onSnapshot(snap => { S.cache.mov = !!(snap.metadata && snap.metadata.fromCache); S.movs = snap.docs.map(d => ({ id: d.id, ...d.data() })); S.loaded.mov = true; clearTimeout(t); onData(); }, e => { console.warn('mov', e); });
      db.collection('cfg').onSnapshot(snap => {
        S.cache.cfg = !!(snap.metadata && snap.metadata.fromCache); const o = {}; snap.docs.forEach(d => o[d.id] = d.data());
        applyCfgDocs(o); S.loaded.cfg = true; onData();
      }, e => { console.warn('cfg', e); });
    } else {
      this.mode = 'local'; S.mode = 'local';
      let st = {}; try { st = JSON.parse(lsGet('ef_local', '{}')) || {}; } catch (e) { st = {}; }
      this.local = { mov: st.mov || {}, cfg: st.cfg || {} };
      S.movs = Object.entries(this.local.mov).map(([id, d]) => ({ id, ...d }));
      applyCfgDocs(this.local.cfg); S.loaded.mov = S.loaded.cfg = true; onData();
    }
  },
  persistLocal() { lsSet('ef_local', JSON.stringify(this.local)); },
  async set(col, id, data) {
    data = clone(data); delete data.id;
    if (this.mode === 'cloud') { await this.db.doc(`${col}/${id}`).set(data); return; }
    this.local[col][id] = data; this.persistLocal();
    if (col === 'mov') { const i = S.movs.findIndex(m => m.id === id); const m = { id, ...data }; if (i > -1) S.movs[i] = m; else S.movs.push(m); } else applyCfgDocs(this.local.cfg);
    onData();
  },
  async merge(col, id, data) {
    if (this.mode === 'cloud') { const ref = this.db.doc(`${col}/${id}`); const s = await ref.get(); if (s.exists) await ref.update(data); else await ref.set(data); return; }
    this.local[col][id] = { ...(this.local[col][id] || {}), ...data }; this.persistLocal(); applyCfgDocs(this.local.cfg); onData();
  },
  async del(col, id) {
    if (this.mode === 'cloud') { await this.db.doc(`${col}/${id}`).delete(); return; }
    delete this.local[col][id]; this.persistLocal();
    if (col === 'mov') S.movs = S.movs.filter(m => m.id !== id);
    onData();
  }
};
function applyCfgDocs(o) {
  const base = defCfg();
  const m = o.main ? clone(o.main) : {};
  S.cfg = { ...base, ...m };
  for (const k of ['cats', 'ingCats', 'tarjetas', 'destinos', 'usuarios']) if (!Array.isArray(S.cfg[k]) || !S.cfg[k].length) S.cfg[k] = base[k];
  S.plan = o.plan ? clone(o.plan) : { items: [] }; if (!S.plan.items) S.plan.items = [];
  S.metas = o.metas ? clone(o.metas) : { items: [] }; if (!S.metas.items) S.metas.items = [];
  S.apr = o.aprendido ? clone(o.aprendido) : {};
  S.cierres = {}; Object.keys(o).forEach(k => { if (k.startsWith('cierre_')) S.cierres[k.slice(7)] = clone(o[k]); });
  if (!S.user) { const u = lsGet('ef_user', null); S.user = u && S.cfg.usuarios.includes(u) ? u : S.cfg.usuarios[0]; }
}
async function guardar(fn, okMsg) {
  try { await fn(); if (okMsg) toast(okMsg); return true; }
  catch (e) {
    console.error(e); const c = e && e.code;
    if (c === 'invalid_argument' || c === 'revoked' || c === 'not_granted' || S.canWrite === false) { S.canWrite = false; render(); toast('Tu cuenta solo puede mirar, no cargar. Pedile a Juan que te invite como Editor.', null, true); }
    else if (c === 'quota_exceeded') toast('La base compartida llegó a su límite de espacio.', null, true);
    else toast('No se pudo guardar (' + (c || 'sin conexión') + '). Probá de nuevo en un momento.', null, true);
    return false;
  }
}
const saveCfg = () => Store.set('cfg', 'main', S.cfg);
const savePlan = () => Store.set('cfg', 'plan', S.plan);
const saveMetas = () => Store.set('cfg', 'metas', S.metas);

/* ============ Cálculos ============ */
const mesDe = (m, base) => (base || S.base) === 'pago' ? m.mes : m.fecha.slice(0, 7);
function escalar(m, k) { const c = clone(m); c.total = m.total * k; c.items = (m.items || []).map(i => ({ ...i, monto: i.monto * k })); return c; }
function movsEn(ym, base) {
  base = base || S.base; const out = [];
  for (const m of S.movs) {
    if (base === 'compra' && m.cuota && m.cuota.n > 1) { if (m.cuota.i === 1 && m.fecha.slice(0, 7) === ym) out.push(escalar(m, m.cuota.n)); continue; }
    if (mesDe(m, base) === ym) out.push(m);
  }
  return out;
}
const esConsumo = m => m.tipo === 'gasto' && !m.pagoFondo;
function resumenMes(ym, base) {
  const L = movsEn(ym, base);
  const ing = sum(L.filter(m => m.tipo === 'ingreso'), m => m.total);
  const cons = sum(L.filter(esConsumo), m => m.total);
  const conFondo = sum(L.filter(m => m.tipo === 'gasto' && m.pagoFondo), m => m.total);
  const apor = sum(L.filter(m => m.tipo === 'aporte'), m => m.total);
  const ret = sum(L.filter(m => m.tipo === 'retiro'), m => m.total);
  return { L, ing, cons, conFondo, apor, ret, res: ing - cons, sin: ing - cons - apor + ret };
}
function lineasDe(list) { // líneas de gasto (consumo), con el movimiento de origen
  const out = [];
  for (const m of list) if (esConsumo(m) && !m.omitido) for (const it of (m.items || [])) out.push({ ...it, m, fecha: m.fecha, mes: m.mes });
  return out;
}
function porRubro(list) {
  const map = new Map();
  for (const l of lineasDe(list)) {
    const c = l.cat || 'otros'; if (!map.has(c)) map.set(c, { cat: c, total: 0, items: new Map() });
    const r = map.get(c); r.total += l.monto;
    const k = itemKey(l.n || catOf(c).n); if (!r.items.has(k)) r.items.set(k, { key: k, n: itemName(l.n || catOf(c).n), total: 0, veces: 0, cant: 0 });
    const it = r.items.get(k); it.total += l.monto; it.veces++; it.cant += +l.cant || 1;
  }
  return [...map.values()].sort((a, b) => b.total - a.total).map(r => ({ ...r, items: [...r.items.values()].sort((a, b) => b.total - a.total) }));
}

/* Plan mensual (ingresos y pagos previstos) */
function ovHas(it, ym) { return it.ov && Object.prototype.hasOwnProperty.call(it.ov, ym); }
function realPlan(id, ym) {
  const L = S.movs.filter(m => m.planId === id && (m.planMes || m.mes) === ym);
  return L.length ? { total: sum(L, m => m.total), movs: L } : null;
}
/* Diezmo: 10% de todos los ingresos del mes, menos el plazo fijo (rubro "Rendimientos"). Suma lo confirmado, lo cargado a mano y lo previsto que falta. */
function ingresoDiezmable(ym, puro) {
  let s = 0;
  if (!puro) s += sum(S.movs.filter(m => m.tipo === 'ingreso' && m.mes === ym && m.cat !== 'rend'), m => m.total);
  for (const it of S.plan.items) if (it.tipo === 'ingreso' && it.cat !== 'rend') { if (puro || !realPlan(it.id, ym)) s += planBase(it, ym, puro); }
  return s;
}
function planBase(it, ym, puro) {
  if (ovHas(it, ym)) return +it.ov[ym] || 0;
  if (it.desde && ym < it.desde) return 0;
  if (it.hasta && ym > it.hasta) return 0;
  if (it.pct) return r2(ingresoDiezmable(ym, puro) * it.pct / 100);
  return +it.base || 0;
}
/* Aporte previsto a un fondo en un mes: monto fijo, o % de lo que sobra ese mes (se ajusta solo con lo confirmado) */
function aportePlan(d, ym) {
  if (d.desde && ym < d.desde) return 0;
  if (d.modo === 'pct') { const s = sobraEsp(ym); return Math.max(0, Math.round(s * (+d.pct || 0) / 100 / 100) * 100); }
  return +d.aporte || 0;
}
function sobraEsp(ym) { const e = esperado(ym, true); return e.ingEsp - e.consEsp; }
function planItemsAll(ym, sinAportes) {
  const items = S.plan.items.map(it => ({ ...it }));
  if (!sinAportes) for (const d of cfg().destinos) { const a = aportePlan(d, ym); if (a > 0) items.push({ id: 'dest:' + d.id, tipo: 'aporte', n: 'Aporte a ' + d.n, fondo: d.id, base: a, e: d.e }); }
  return items;
}
function checklist(ym, sinAportes) {
  if (ym < cfg().inicio) return [];
  const rows = [];
  for (const it of planItemsAll(ym, sinAportes)) {
    const plan = it.tipo === 'aporte' ? it.base : planBase(it, ym);
    const real = realPlan(it.id, ym);
    if (plan > 0 || real || it.recordar) rows.push({ it, plan, real, recordatorio: !real && !(plan > 0) });
  }
  return rows;
}
function esperado(ym, sinAportes) {
  const r = resumenMes(ym, 'pago'); let ingP = 0, fijoP = 0, presP = 0, aporP = 0;
  for (const row of checklist(ym, sinAportes)) if (!row.real) { if (row.it.tipo === 'ingreso') ingP += row.plan; else if (row.it.tipo === 'gasto') fijoP += row.plan; else if (row.it.tipo === 'aporte') aporP += row.plan; }
  const L = lineasDe(r.L).filter(l => !l.m.planId);
  for (const b of bolsasDe(ym)) presP += Math.max(0, b.monto - sum(L.filter(l => (b.cats || []).includes(l.cat)), l => l.monto));
  for (const c of cfg().cats) if (presDe(c, ym) > 0 && ym >= cfg().inicio) presP += Math.max(0, presDe(c, ym) - sum(L.filter(l => l.cat === c.id), l => l.monto));
  return { ...r, ingP, fijoP, presP, aporP, aporEsp: r.apor + aporP, ingEsp: r.ing + ingP, consEsp: r.cons + fijoP + presP };
}
/* Lo que se planeó originalmente para el mes (sin ajustes por lo ya confirmado) */
function planOriginal(ym) {
  if (ym < cfg().inicio) return null; let ing = 0, cons = 0;
  for (const it of S.plan.items) { const v = planBase(it, ym, true); if (it.tipo === 'ingreso') ing += v; else cons += v; }
  for (const c of cfg().cats) cons += presDe(c, ym);
  for (const b of bolsasDe(ym)) cons += b.monto;
  cons += sum(S.movs.filter(m => m.src === 'backlog' && m.mes === ym), m => m.total);
  return { ing, cons };
}
/* Acumulado desde el inicio hasta un mes: lo ya confirmado + lo previsto que falta (meses de hoy en adelante) */
const rendMes = () => { const v = cfg().rendMensual; return (v === undefined || v === null || isNaN(+v) ? 1.6 : +v) / 100; };
/* Acumulado desde el inicio: lo confirmado + lo previsto. Cada fondo suma su rendimiento estimado del mes (tasa mensual sobre el saldo con que
   arranca el mes, así se compone mes a mes). Un mes cerrado usa el valor real que se cargó en el cierre; un mes con rendimiento real cargado usa ese. */
function acumulado(hasta) {
  const now = ymNow(), ini = cfg().inicio; let libre = +cfg().caja || 0; const fondos = {}, rendEst = {}, r = rendMes();
  cfg().destinos.forEach(d => { fondos[d.id] = +d.saldo0 || 0; rendEst[d.id] = 0; });
  for (let m = ini, n = 0; m <= hasta && n < 72; m = addM(m, 1), n++) {
    const e = esperado(m), fut = m >= now, L = e.L, cierre = S.cierres[m];
    libre += (fut ? e.ingEsp : e.ing) - (fut ? e.consEsp : e.cons);
    for (const d of cfg().destinos) {
      const real = sum(L.filter(x => x.tipo === 'aporte' && x.fondo === d.id), x => x.total);
      const falta = fut && !realPlan('dest:' + d.id, m) ? aportePlan(d, m) : 0;
      const ret = sum(L.filter(x => x.tipo === 'retiro' && x.fondo === d.id), x => x.total);
      const rend = sum(L.filter(x => x.tipo === 'rendimiento' && x.fondo === d.id), x => x.total);
      const usado = sum(L.filter(x => x.tipo === 'gasto' && x.pagoFondo === d.id), x => x.total);
      libre -= real + falta; libre += ret;
      const cf = cierre && cierre.fondos && cierre.fondos[d.id];
      if (cf && cf.valor != null) { fondos[d.id] = +cf.valor; continue; }
      const est = rend === 0 ? r * Math.max(0, fondos[d.id]) : 0;
      rendEst[d.id] += est;
      fondos[d.id] += real + falta + rend - ret - usado + est;
    }
  }
  const totalFondos = sum(Object.values(fondos), v => v);
  return { libre, fondos, rendEst, totalRendEst: sum(Object.values(rendEst), v => v), totalFondos, total: libre + totalFondos };
}
function saldoFondo(d, hastaYm) {
  let s = +d.saldo0 || 0;
  for (const m of S.movs) {
    if (hastaYm && m.mes > hastaYm) continue;
    if (m.fondo === d.id) { if (m.tipo === 'aporte' || m.tipo === 'rendimiento') s += m.total; else if (m.tipo === 'retiro') s -= m.total; }
    if (m.tipo === 'gasto' && m.pagoFondo === d.id) s -= m.total;
  }
  return s;
}
function cajaHasta(ym) {
  let s = +cfg().caja || 0;
  for (const m of S.movs) {
    if (m.mes > ym) continue;
    if (m.tipo === 'ingreso') s += m.total; else if (esConsumo(m)) s -= m.total; else if (m.tipo === 'aporte') s -= m.total; else if (m.tipo === 'retiro') s += m.total;
  }
  return s;
}
const patrimonio = ym => cajaHasta(ym) + sum(cfg().destinos, d => saldoFondo(d, ym));
function tarjetasMes(ym) {
  return cfg().tarjetas.map(t => {
    const L = S.movs.filter(m => m.tipo === 'gasto' && m.medio === t.id && m.mes === ym && !m.pagoFondo);
    const rows = checklist(ym, true).filter(r => r.it.tarjeta === t.id);
    const previo = sum(L.filter(m => m.src === 'backlog'), m => m.total) + sum(rows, r => r.real ? r.real.total : r.plan);
    const pagado = rows.length > 0 && rows.every(r => r.real);
    return { t, total: sum(L, m => m.total) + sum(rows, r => r.real ? r.real.total : r.plan), previo, pagado };
  });
}
function rmFondo(d, tasaPct, meses, saldoARS, aporteARS, tc) {
  const r = Math.pow(1 + tasaPct / 100, 1 / 12) - 1; let v = saldoARS / tc, ap = saldoARS / tc; const serie = [{ v, ap }];
  for (let i = 1; i <= meses; i++) { v = v * (1 + r) + aporteARS / tc; ap += aporteARS / tc; serie.push({ v, ap }); }
  return serie;
}
function aporteNecesario(meta, saldoARS, meses, tasaPct, tc) {
  const r = Math.pow(1 + tasaPct / 100, 1 / 12) - 1, n = meses; if (n < 1) return 0;
  const g = Math.pow(1 + r, n), T = meta / tc, s0 = saldoARS / tc;
  const m = (T - s0 * g) * r / (g - 1); return Math.max(0, m * tc);
}

/* Estadística por ítem (por fecha de compra, ignora saldos de tarjetas anteriores) */
function statsItems(desde, hasta) {
  const map = new Map();
  for (const m of S.movs) {
    if (!esConsumo(m) || m.src === 'backlog' || m.omitido) continue;
    if (m.cuota && m.cuota.n > 1 && m.cuota.i !== 1) continue;
    const k0 = m.cuota && m.cuota.n > 1 ? m.cuota.n : 1;
    if (desde && m.fecha < desde) continue; if (hasta && m.fecha > hasta) continue;
    for (const it of (m.items || [])) {
      const key = itemKey(it.n || catOf(it.cat).n);
      if (!map.has(key)) map.set(key, { key, n: itemName(it.n || catOf(it.cat).n), cat: it.cat, total: 0, veces: 0, cant: 0, first: m.fecha, last: m.fecha, hist: [] });
      const o = map.get(key); o.total += it.monto * k0; o.veces++; o.cant += +it.cant || 1;
      if (m.fecha < o.first) o.first = m.fecha; if (m.fecha > o.last) o.last = m.fecha;
      o.hist.push({ f: m.fecha, monto: it.monto * k0, cant: +it.cant || 1, com: m.com });
    }
  }
  return [...map.values()];
}
const diasEntre = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
function proyItem(o) {
  const ini = o.first < cfg().inicio + '-01' ? cfg().inicio + '-01' : o.first;
  const span = Math.max(30, diasEntre(ini, hoy()) + 1);
  const confianza = o.veces >= 4 && span >= 45 ? 'media' : 'baja';
  return { anual: o.total / span * 365, mensual: o.total / span * 30.4, confianza, span };
}
/* Proyección anual por rubro */
function ritmoCat(catId) {
  const now = ymNow(); const ms = []; for (let i = 1; i <= 3; i++) { const ym = addM(now, -i); if (ym >= cfg().inicio) ms.push(ym); }
  if (ms.length) {
    const vals = ms.map(ym => sum(lineasDe(movsEn(ym, 'pago')).filter(l => l.cat === catId && !l.m.planId && l.m.src !== 'backlog'), l => l.monto));
    return { v: sum(vals) / ms.length, conf: 'media' };
  }
  const L = lineasDe(movsEn(now, 'pago')).filter(l => l.cat === catId && !l.m.planId && l.m.src !== 'backlog');
  const frac = Math.max(0.3, +hoy().slice(8, 10) / daysIn(now));
  return { v: sum(L, l => l.monto) / frac, conf: 'baja' };
}
function proyAnio(year) {
  const now = ymNow(); const cats = cfg().cats; const meses = []; for (let i = 1; i <= 12; i++) meses.push(`${year}-${pad(i)}`);
  const ritmo = {}; for (const c of cats) ritmo[c.id] = ritmoCat(c.id);
  const out = cats.map(c => ({ cat: c.id, m: [], ytd: 0, rest: 0, total: 0, conf: ritmo[c.id].conf, tienePlan: false }));
  const byCat = Object.fromEntries(out.map(o => [o.cat, o]));
  for (const ym of meses) {
    const R = movsEn(ym, 'pago'); const L = lineasDe(R);
    const chk = checklist(ym);
    for (const o of out) {
      const real = sum(L.filter(l => l.cat === o.cat), l => l.monto);
      let v = real;
      if (ym >= now && ym >= cfg().inicio) {
        const fijos = sum(chk.filter(r => !r.real && r.it.tipo === 'gasto' && r.it.cat === o.cat), r => r.plan);
        const c = catOf(o.cat); const var0 = sum(L.filter(l => l.cat === o.cat && !l.m.planId), l => l.monto);
        const pres = presDe(c, ym) > 0 ? Math.max(0, presDe(c, ym) - var0) : 0;
        v += fijos + pres;
        const bs = bolsasDe(ym); bs.forEach(b => { if ((b.cats || [])[0] === o.cat) v += bolsaUso(b, ym).queda; });
        const planCat = fijos > 0 || presDe(c, ym) > 0 || bs.some(b => (b.cats || []).includes(o.cat)) || chk.some(r => r.it.tipo === 'gasto' && r.it.cat === o.cat);
        if (planCat) o.tienePlan = true;
        if (ym > now && !planCat) v += ritmo[o.cat].v;
        if (ym === now && !planCat && false) v += 0;
      }
      o.m.push(v); if (ym <= now) o.ytd += v; else o.rest += v;
    }
  }
  for (const o of out) o.total = o.ytd + o.rest;
  return out.filter(o => o.total > 0).sort((a, b) => b.total - a.total);
}

/* ============ Reparto: si todos los fondos van por %, siempre suman exactamente 100 ============ */
const r1 = n => Math.round(n * 10) / 10;
const todosPct = () => cfg().destinos.length > 0 && cfg().destinos.every(x => x.modo === 'pct');
function cerrarA100(lista, ancla) { // ajusta el redondeo en el fondo más grande (que no sea el ancla)
  const dif = r1(100 - sum(lista, x => +x.pct || 0)); if (!dif) return;
  const cand = lista.filter(x => x !== ancla); const big = (cand.length ? cand : lista).slice().sort((a, b) => (+b.pct || 0) - (+a.pct || 0))[0]; big.pct = r1((+big.pct || 0) + dif);
}
/* El reparto puede sumar 100% o menos, nunca más: un fondo no puede pasar de lo que dejan libre los otros */
function aplicarReparto(id, v) {
  const ds = cfg().destinos, d = ds.find(x => x.id === id); if (!d) return;
  const otros = sum(ds.filter(x => x.id !== id && x.modo === 'pct'), x => +x.pct || 0);
  d.pct = Math.max(0, Math.min(r1(+v || 0), r1(100 - otros)));
}
function normalizarPct() { // solo si pasa de 100: baja todo en proporción
  const ds = cfg().destinos.filter(x => x.modo === 'pct'), tot = sum(ds, x => +x.pct || 0); if (tot <= 100) return;
  ds.forEach(x => { x.pct = Math.floor((+x.pct || 0) * 100 / tot * 10) / 10; });
}
/* ============ Cierre de mes y rendimiento ============ */
const finDeMes = ym => ym < ymNow() ? `${ym}-${pad(daysIn(ym))}` : hoy();
function primerMesSinCerrar() {
  const now = ymNow(); for (let m = cfg().inicio, n = 0; m < now && n < 60; m = addM(m, 1), n++) if (!S.cierres[m]) return m; return null;
}
function aportadoNeto(d, hasta) { let s = +d.saldo0 || 0; for (const m of S.movs) { if (hasta && m.mes > hasta) continue; if (m.fondo === d.id) { if (m.tipo === 'aporte') s += m.total; else if (m.tipo === 'retiro') s -= m.total; } if (m.tipo === 'gasto' && m.pagoFondo === d.id) s -= m.total; } return s; }
function gananciaFondo(d, hasta) { let s = 0; for (const m of S.movs) { if (hasta && m.mes > hasta) continue; if (m.fondo === d.id && m.tipo === 'rendimiento') s += m.total; } return s; }
function histRows(fid) {
  const ds = cfg().destinos.filter(d => !fid || d.id === fid); const out = [];
  for (const ym of Object.keys(S.cierres).sort()) {
    const c = S.cierres[ym]; let apor = 0, rend = 0, valor = 0, prev = 0;
    for (const d of ds) { const f = (c.fondos || {})[d.id]; if (!f) continue; apor += f.aporte || 0; rend += f.rend || 0; valor += f.valor || 0; prev += f.saldoPrev || 0; }
    const base = prev + apor / 2; out.push({ ym, sobra: c.sobra, apor, rend, valor, prev, pct: base > 0 ? rend / base * 100 : null, aportado: sum(ds, d => aportadoNeto(d, ym)) });
  }
  return out;
}
