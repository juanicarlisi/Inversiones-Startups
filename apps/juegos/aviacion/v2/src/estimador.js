// Estimador verdadero de Hub Nocturno v2: cuánto cuesta una decisión, cuánto deja por día y en cuántos días se paga.
//
// Método (elegido midiendo, ver pruebas/estimador.test.mjs y el README): no es una fórmula. Se hace un gemelo exacto del estado
// (structuredClone, como la ronda nocturna del modelo: «lo que se promete y lo que pasa salen del mismo motor») y se corre el modelo
// de verdad hacia adelante DIAS días de juego, una vez sin la decisión y otra con ella. «Deja por día» es la diferencia del
// resultado de operar (lo cobrado menos lo gastado en volar y en tierra) entre las dos corridas, dividida por los días. Los premios
// de misión y de encargo no cuentan: no se repiten todos los días.
//
// El número que se muestra sale del gemelo exacto: es lo que pasa si después no se toca nada más. Además, el mismo par de corridas
// se repite con otros dos climas posibles (otra semilla): si con otro clima el resultado cambia mucho, la decisión es frágil y la
// tarjeta muestra el rango en vez de un número solo.
//
// No usa DOM: corre igual en el navegador (por tandas, ver Tandas) y en node (pruebas y herramientas).
import * as M from '../../js/modelo.js';

export const DIAS = 3;                 // horizonte: los mismos 3 días a los que llega la nota «resultado contra lo prometido»
const MIN_DIA = 1440;
const SEMILLAS = 3;                    // corridas por estimación: la exacta y dos climas distintos (menos si el estado es pesado)
const UMBRAL_RANGO = 0.25;             // si el peor y el mejor clima difieren más que esto del promedio, se muestra el rango
const PISO_RANGO = 300;                // …y más que esto en plata por día
export const CASI_NADA = 100;          // menos que esto por día (en valor absoluto) es «casi no cambia»

// ───────────── decisiones ─────────────
// { tipo: 'ruta', a, b }            abrir la ruta a⇄b (se estima con el avión más barato que llega: sola no deja nada)
// { tipo: 'avion', id, ruta }       comprar un avión de tipo «id» para la ruta
// { tipo: 'faros', ruta }           poner luces en la ruta
// { tipo: 'correo', ap }            agrandar el correo de esa ciudad
export const claveDecision = (d) => (d.tipo === 'ruta' ? `ruta|${M.idRuta(d.a, d.b)}` : d.tipo === 'avion' ? `avion|${d.id}|${d.ruta}` : d.tipo === 'faros' ? `faros|${d.ruta}` : `correo|${d.ap}`);

// Un número dicho en redondo, con dos cifras que pesan: 14.365 → 14.000; 2.521 → 2.500; 754 → 750. Así se dice en un consejo lo
// que la tarjeta muestra al peso (nunca se aparta más de un 5%).
export function redondo(n) { const a = Math.abs(n); if (a < 100) return Math.round(n / 10) * 10; const p = 10 ** (Math.floor(Math.log10(a)) - 1); return Math.round(n / p) * p; }

// El avión más barato en venta que llega a esa distancia (null si ninguno llega).
export function avionMasBarato(s, km) {
  return M.avionesDisponibles(s).filter((t) => t.alcance >= km).sort((x, y) => x.precio - y.precio)[0] ?? null;
}

// Lo que cuesta la decisión hoy, por partes. No mira si alcanza la plata.
export function costoDecision(s, d) {
  if (d.tipo === 'ruta') {
    const km = M.km(d.a, d.b), t = avionMasBarato(s, km);
    const partes = [{ que: 'ruta', costo: M.costoRuta(d.a, d.b) }];
    if (t) partes.push({ que: 'avion', costo: t.precio, avion: t.id });
    return { costo: partes.reduce((a, p) => a + p.costo, 0), partes, avion: t?.id ?? null };
  }
  if (d.tipo === 'avion') { const t = M.AV[d.id]; return t ? { costo: t.precio, partes: [{ que: 'avion', costo: t.precio, avion: t.id }] } : null; }
  if (d.tipo === 'faros') { const r = s.rutas.find((x) => x.id === d.ruta); return r && !r.balizas ? { costo: M.costoBalizas(r, s), partes: [{ que: 'faros', costo: M.costoBalizas(r, s) }] } : null; }
  if (d.tipo === 'correo') { const c = M.costoTransbordo(s, d.ap); return c == null ? null : { costo: c, partes: [{ que: 'correo', costo: c }] }; }
  return null;
}

// Aplica la decisión en un gemelo. La plata no frena la cuenta (se estima también lo que hoy no alcanza): se compra con la caja
// llena y después se deja la caja como habría quedado.
function aplicar(g, d) {
  const caja = g.dinero;
  g.dinero = 1e12;
  let r = null, rutaId = null, avion = null;
  try {
    if (d.tipo === 'ruta') {
      const x = M.abrirRuta(g, d.a, d.b);
      if (!x.ok) return { ok: false, error: x.error };
      rutaId = x.ruta.id;
      const t = avionMasBarato(g, x.ruta.km);
      if (t) { const y = M.comprarAvion(g, t.id, rutaId); if (y.ok) avion = y.avion.id; }
      r = { ok: true };
    } else if (d.tipo === 'avion') {
      const y = M.comprarAvion(g, d.id, d.ruta);
      if (!y.ok) return { ok: false, error: y.error };
      rutaId = d.ruta; avion = y.avion.id; r = { ok: true };
    } else if (d.tipo === 'faros') {
      const y = M.ponerBalizas(g, d.ruta);
      if (!y.ok) return { ok: false, error: y.error ?? 'invalida' };
      rutaId = d.ruta; r = { ok: true };
    } else if (d.tipo === 'correo') {
      const y = M.mejorarTransbordo(g, d.ap);
      if (!y.ok) return { ok: false, error: y.error };
      r = { ok: true };
    } else return { ok: false, error: 'invalida' };
  } finally {
    const gastado = 1e12 - g.dinero;
    g.dinero = caja - gastado;
  }
  M.tomarEventos(g);
  return { ...r, rutaId, avion };
}

// ───────────── las corridas ─────────────
const opNeto = (g) => g.stats.ingresos - g.stats.gastos;
const netoRuta = (g, id) => { const r = id && g.rutas.find((x) => x.id === id); return r ? r.ingresos - r.costos : 0; };
function gemelo(s, semilla, colchon) {
  const g = structuredClone(s);
  g.gemelo = true;                         // un gemelo no arma otros gemelos (los pronósticos de la ronda)
  g.semilla = semilla >>> 0;               // otro clima posible (la demanda no cambia: sale de sem0)
  g.dinero += colchon;                     // lo que hoy no alcanza no dispara la venta forzada en la cuenta
  M.tomarEventos(g);
  return g;
}
// k = 0 es el gemelo exacto (la semilla de la partida); los demás, otros climas posibles
const semillaDe = (s, k) => (k === 0 ? s.semilla : ((s.semilla ^ Math.imul(k + 1, 0x9e3779b9)) + 0x7f4a7c15 * (k + 1)) >>> 0);

// Corre un gemelo «dias» días. mirar: { rutaId, avion, ap }: qué medir en el camino. Cede el control cada tanto (yield).
function* correr(g, dias, mirar = {}) {
  const pasos = Math.round(dias * MIN_DIA / M.PASO);
  const op0 = opNeto(g), ruta0 = netoRuta(g, mirar.rutaId), t0 = g.t;
  const netos0 = new Map(g.rutas.map((r) => [r.id, r.ingresos - r.costos]));
  // rutas: por ruta, [cartas que salieron, lugares que salieron] (para saber qué tan llenos vuelan los aviones)
  const m = { vuelos: 0, cartas: 0, capacidad: 0, rutas: {}, tormenta: false, colaMax: 0, perdTb: 0 };
  const capDe = new Map();
  const perd0 = mirar.ap ? (g.diario.hoy[mirar.ap]?.perdTb ?? 0) : 0;
  let perdAcum = 0, perdHoy = perd0, dia = g.dia;
  let ms = 0, reloj = performance.now();       // tiempo de cuenta de verdad (sin lo que espera entre tandas)
  for (let i = 0; i < pasos; i++) {
    for (const e of M.paso(g)) {
      if (e.tipo === 'despegue') {
        let cap = capDe.get(e.avion);
        if (cap === undefined) { const av = g.aviones.find((a) => a.id === e.avion); cap = av ? M.capTotal(M.AV[av.tipo]) : 0; capDe.set(e.avion, cap); }
        if (e.avion === mirar.avion) { m.vuelos++; m.cartas += e.carga; m.capacidad += cap; }
        const x = (m.rutas[e.ruta] ??= [0, 0]); x[0] += e.carga; x[1] += cap;
      } else if (e.tipo === 'tormenta') m.tormenta = true;
    }
    if (mirar.ap) {
      m.colaMax = Math.max(m.colaMax, M.enTransbordo(g, mirar.ap) / M.capacidadTransbordo(g, mirar.ap));
      if (g.dia !== dia) { perdAcum += perdHoy; perdHoy = 0; dia = g.dia; } else perdHoy = g.diario.hoy[mirar.ap]?.perdTb ?? 0;
    }
    if (i % 36 === 35) { ms += performance.now() - reloj; yield; reloj = performance.now(); }
  }
  ms += performance.now() - reloj;
  m.perdTb = perdAcum + perdHoy - perd0;
  const d = (g.t - t0) / MIN_DIA;
  const porRuta = {};
  for (const r of g.rutas) porRuta[r.id] = (r.ingresos - r.costos - (netos0.get(r.id) ?? 0)) / d;
  return { opDia: (opNeto(g) - op0) / d, rutaDia: (netoRuta(g, mirar.rutaId) - ruta0) / d, m, porRuta, ms,
    propioDia: mirar.avion != null ? (() => { const av = g.aviones.find((a) => a.id === mirar.avion); return av ? (av.ing - av.cos) / d : null; })() : null };
}

// Las corridas «sin la decisión» de un mismo estado sirven para todas sus tarjetas: se guardan acá mientras el estado no cambie.
export function firmaEstado(s) {
  return `${s.t}|${s.verRed}|${Math.round(s.dinero)}|${Math.round(s.stats.gastos)}|${s.rutas.map((r) => `${r.balizas ? 1 : 0}${r.minCarga}`).join('')}|${JSON.stringify(s.niveles)}|${s.contratos.activos.length}`;
}
export class Base {
  constructor(s) { this.firma = firmaEstado(s); this.sin = new Map(); this.msCorrida = null; }
  vale(s) { return this.firma === firmaEstado(s); }
}

// La estimación, como generador (para correrla por tandas sin trabar la pantalla). Devuelve el resultado con «return».
export function* estimarGen(s, d, { dias = DIAS, semillas = null, base = null } = {}) {
  const precio = costoDecision(s, d);
  if (!precio) return { clave: claveDecision(d), imposible: 'invalida' };
  base ??= new Base(s);
  const colchon = Math.max(0, precio.costo - s.dinero) + 1;
  // una ruta sola (sin ningún avión que llegue) o una decisión que no se puede aplicar
  const prueba = aplicar(gemelo(s, s.semilla, colchon), d);
  if (!prueba.ok) return { clave: claveDecision(d), ...precio, imposible: prueba.error ?? 'invalida' };
  const mirarSin = { rutaId: prueba.rutaId, ap: d.ap ?? null };
  const filas = [];
  let K = semillas ?? SEMILLAS;
  for (let k = 0; k < K; k++) {
    const sem = semillaDe(s, k);
    // sin la decisión (compartida entre tarjetas)
    let sin = base.sin.get(`${k}|${mirarSin.rutaId ?? ''}|${mirarSin.ap ?? ''}`);
    if (!sin) {
      sin = yield* correr(gemelo(s, sem, colchon), dias, mirarSin);
      base.sin.set(`${k}|${mirarSin.rutaId ?? ''}|${mirarSin.ap ?? ''}`, sin);
      base.msCorrida ??= sin.ms;
    }
    // con la decisión
    const g = gemelo(s, sem, colchon);
    const ap = aplicar(g, d);
    const con = yield* correr(g, dias, { rutaId: ap.rutaId, avion: ap.avion, ap: d.ap ?? null });
    filas.push({ sin, con, delta: con.opDia - sin.opDia });
    // presupuesto: con un estado pesado (capítulos avanzados) se usan menos climas para no hacer esperar
    if (semillas == null && base.msCorrida != null) { if (base.msCorrida > 400) K = Math.min(K, 1); else if (base.msCorrida > 120) K = Math.min(K, 2); }
  }
  // el número es el del gemelo exacto (filas[0]); los otros climas dan el rango
  const n = filas.length, ex = filas[0];
  const deltas = filas.map((x) => x.delta);
  const dejaDia = Math.round(ex.delta), min = Math.round(Math.min(...deltas)), max = Math.round(Math.max(...deltas));
  const incierto = n > 1 && max - min > Math.max(PISO_RANGO, UMBRAL_RANGO * Math.abs(dejaDia));
  const llenado = d.tipo === 'ruta' || d.tipo === 'avion' ? (ex.con.m.capacidad ? ex.con.m.cartas / ex.con.m.capacidad : 0) : null;
  const res = {
    clave: claveDecision(d), tipo: d.tipo, ...precio, dias, semillas: n,
    dejaDia, min, max, incierto,
    casiNada: Math.abs(dejaDia) < CASI_NADA && !incierto,
    pierde: dejaDia <= -CASI_NADA,
    recuperoDias: dejaDia >= CASI_NADA ? precio.costo / dejaDia : null,
    llenado,
    // lo esperado, para comparar a los 3 días (la nota «resultado contra lo prometido»)
    esp: { rutaId: prueba.rutaId ?? null, rutaDia: Math.round(ex.con.rutaDia), sinRutaDia: Math.round(ex.sin.rutaDia),
      empresaDia: Math.round(ex.con.opDia), sinEmpresaDia: Math.round(ex.sin.opDia),
      propioDia: ex.con.propioDia == null ? null : Math.round(ex.con.propioDia) },
    // lo que la decisión le cambia por día a cada ruta de la red (las que cambian algo): una compra en una ruta mueve las cartas de otras
    efectos: (() => { const o = {}; for (const id in ex.con.porRuta) { const v = Math.round(ex.con.porRuta[id] - (ex.sin.porRuta[id] ?? 0)); if (Math.abs(v) >= 50) o[id] = v; } return o; })(),
    motivo: null, ms: Math.round(filas.reduce((a, x) => a + x.con.ms, 0) + filas[0].sin.ms),
  };
  res.motivo = motivoDe(s, d, res, ex);
  return res;
}

// Por qué una decisión no deja nada o pierde plata, en una clave de texto (los textos viven en ui/textos.js). Sale de lo que pasó
// en las dos corridas del gemelo exacto (qué tan llenos vuelan los aviones, si la ruta sola da plata, si el correo tiene cola), no
// de una regla fija. Medido el 16-11-2026: lo que más hace perder es sumar cartas en conexión a aviones que ya salen llenos (pagan
// menos por tramo y les sacan el lugar a las que pagan más).
const llenadoDe = (m, ids) => { let c = 0, k = 0; for (const id of ids) { const x = m.rutas[id]; if (x) { c += x[0]; k += x[1]; } } return k ? c / k : null; };
function motivoDe(s, d, res, ex) {
  const flojo = res.pierde || res.casiNada;
  if (d.tipo === 'ruta') {
    if (!res.avion) return { clave: 'pq_nadieLlega' };
    if (!flojo) return null;
    if (res.esp.rutaDia > CASI_NADA) return { clave: 'pq_redLlena' };            // la ruta sola da plata: lo que pierde está en el resto de la red
    return res.llenado < 0.5 ? { clave: 'pq_rutaVacia' } : { clave: 'pq_rutaCara' };
  }
  if (d.tipo === 'avion') {
    if (!flojo) return null;
    const habia = s.aviones.some((a) => a.ruta === d.ruta);
    if (!habia) return res.esp.rutaDia > CASI_NADA ? { clave: 'pq_redLlena' } : res.llenado < 0.5 ? { clave: 'pq_rutaVacia' } : { clave: 'pq_rutaCara' };
    const antes = ex.sin.m.rutas[d.ruta]?.[0] ?? 0, ahora = ex.con.m.rutas[d.ruta]?.[0] ?? 0;
    if (ahora <= antes * 1.15) return { clave: 'pq_avionSobra' };                 // la ruta lleva casi las mismas cartas con un avión más
    return res.esp.rutaDia - res.esp.sinRutaDia > CASI_NADA ? { clave: 'pq_redLlena' } : { clave: 'pq_avionCaro' };
  }
  if (d.tipo === 'faros') {
    const avs = s.aviones.filter((a) => a.ruta === d.ruta);
    if (!avs.length) return { clave: 'pq_farosSinAvion' };
    if (avs.every((a) => M.AV[a.tipo].nocturno)) return { clave: 'pq_farosNoHacenFalta' };
    if (!flojo) return null;
    return res.esp.rutaDia - res.esp.sinRutaDia > CASI_NADA ? { clave: 'pq_redLlena' } : { clave: 'pq_farosPocaNoche' };
  }
  if (d.tipo === 'correo') {
    if (!flojo) return null;
    if (ex.sin.m.colaMax < 1 && ex.sin.m.perdTb <= 0) return { clave: 'pq_correoSobra' };   // hoy no hay cola: da abasto
    const desdeAca = s.rutas.filter((r) => r.a === d.ap || r.b === d.ap).map((r) => r.id);
    return (llenadoDe(ex.sin.m, desdeAca) ?? 0) >= 0.8 ? { clave: 'pq_correoAvionesLlenos' } : { clave: 'pq_correoPoco' };
  }
  return null;
}

// De una vez (node, pruebas, herramientas).
export function estimar(s, d, opciones = {}) {
  const it = estimarGen(s, d, opciones);
  for (;;) { const r = it.next(); if (r.done) return r.value; }
}

// ───────────── por tandas (navegador) ─────────────
// Una fila de estimaciones que avanza de a ratitos (presupuesto en milisegundos por tanda), con memoria por estado: mientras el
// reloj está frenado el estado no cambia y cada tarjeta se calcula una sola vez. pedir() devuelve el resultado si ya está, o null y
// lo deja en la fila.
export class Tandas {
  constructor({ ahora = () => performance.now(), programar = (f) => setTimeout(f, 0) } = {}) {
    this.ahora = ahora; this.programar = programar;
    this.base = null; this.hechos = new Map(); this.fila = []; this.activo = null; this.andando = false;
    this.presupuesto = 10; this.alTerminar = null;
  }
  // foto: se trabaja sobre una copia del estado (el juego puede seguir mientras se calcula)
  pedir(s, d, { urgente = false, llave = null } = {}) {
    const firma = firmaEstado(s), k = `${llave ?? firma}#${claveDecision(d)}`;
    const h = this.hechos.get(k);
    if (h) return h;
    if (this.activo?.k === k || this.fila.some((x) => x.k === k)) return null;
    if (!this.base || this.base.firma !== firma) { this.base = new Base(s); this.foto = structuredClone(s); }
    const tarea = { k, d, base: this.base, foto: this.foto, it: null };
    if (urgente) this.fila.unshift(tarea); else this.fila.push(tarea);
    this.arrancar();
    return null;
  }
  listo(s, d, llave = null) { return this.hechos.get(`${llave ?? firmaEstado(s)}#${claveDecision(d)}`) ?? null; }
  pendientes() { return this.fila.length + (this.activo ? 1 : 0); }
  arrancar() { if (!this.andando) { this.andando = true; this.programar(() => this.tanda()); } }
  tanda() {
    const fin = this.ahora() + this.presupuesto;
    try {
      while (this.ahora() < fin) {
        if (!this.activo) { this.activo = this.fila.shift() ?? null; if (!this.activo) break; this.activo.it = estimarGen(this.activo.foto, this.activo.d, { base: this.activo.base }); }
        const r = this.activo.it.next();
        if (r.done) { this.guardar(this.activo.k, r.value); this.activo = null; }
      }
    } catch (e) { if (this.activo) this.guardar(this.activo.k, { clave: claveDecision(this.activo.d), imposible: 'error' }); this.activo = null; console.warn('estimador', e); }
    if (this.activo || this.fila.length) this.programar(() => this.tanda()); else this.andando = false;
  }
  guardar(k, v) {
    this.hechos.set(k, v);
    if (this.hechos.size > 80) this.hechos.delete(this.hechos.keys().next().value);
    this.alTerminar?.(k, v);
  }
  // de una vez, para cuando el resultado hace falta ya (al confirmar una compra antes de que termine la cuenta)
  ya(s, d) {
    const h = this.listo(s, d);
    if (h) return h;
    const v = estimar(s, d, { base: this.base?.vale(s) ? this.base : null });
    this.hechos.set(`${firmaEstado(s)}#${claveDecision(d)}`, v);
    return v;
  }
}
