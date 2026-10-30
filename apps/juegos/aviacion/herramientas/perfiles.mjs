// Los cuatro perfiles de jugador automático. Este archivo es la «cabeza» de cada jugador: decide qué tocar mirando solo lo que ve
// una persona (la API de la interfaz y los campos visibles del estado). Una prueba (pruebas/jugadores.test.mjs) falla si este
// archivo importa modelo.js, usa una función fuera de API_INTERFAZ o lee una parte interna del estado.
import { I } from './interfaz.mjs';

// Segundos reales entre una acción y la siguiente (lo que tarda una persona en tocar, leer y decidir).
export const REACCION = { literal: 1, novato: 2, listo: 1.5, compraTodo: 1, soloChip: 1.5 };
export const NOVEDADES = new Set(['mision', 'capituloNuevo', 'avionNuevo', 'ciudadesNuevas', 'contrato', 'bancoListo', 'resultadoNoche', 'primeraNoche', 'finHistoria',
  'primerasBalizas', 'primerDespegueNoche', 'clasificacion', 'clasificacionHecha']);

// ───────── lo que ve el jugador ─────────
const conAvion = (s, r) => s.aviones.some((a) => a.ruta === r.id);
const rutaDe = (s, a, b) => s.rutas.find((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a));
const esperan = (s, r) => I.enEspera(s, r.a) + I.enEspera(s, r.b);
function masBarato(s, r, filtro = () => true) {
  return I.avionesDisponibles(s).filter((t) => t.alcance >= r.km && filtro(t)).sort((a, b) => a.precio - b.precio)[0] ?? null;
}
function masGrande(s, r) {
  const cap = (t) => Object.values(t.lleva).reduce((a, b) => a + b, 0);
  return I.avionesDisponibles(s).filter((t) => t.alcance >= r.km && I.puedeComprar(s, t.id, r.id).ok).sort((a, b) => cap(b) - cap(a))[0] ?? null;
}
const comprar = (s, t, r) => (t && I.puedeComprar(s, t.id, r.id).ok ? { tipo: 'avion', id: t.id, ruta: r.id } : null);
// Ruta sin avión: comprarle el más barato que llega (lo que pide «abrí la ruta y poné un avión»).
function avionParaRutasVacias(s) {
  for (const r of s.rutas) if (!conAvion(s, r)) { const a = comprar(s, masBarato(s, r), r); if (a) return a; }
  return null;
}
// Conectar una ciudad que todavía no recibe vuelos: abrir la ruta más corta hacia ella desde la red, por ciudades intermedias si
// ningún avión llega directo (lo que haría alguien mirando el mapa).
function conectar(s, ciudad) {
  if (I.servido(s, ciudad)) return null;
  const vacia = avionParaRutasVacias(s);
  if (vacia) return vacia;
  if (I.enRed(s, ciudad)) return null;
  const alcance = Math.max(...I.avionesDisponibles(s).map((t) => t.alcance));
  const red = I.nodosRed(s);
  let mejor = null;
  for (const n of red) {
    const d = I.km(n, ciudad);
    if (d <= alcance) { const p = I.puedeAbrirRuta(s, n, ciudad); if (p.ok && (!mejor || d < mejor.v)) mejor = { tipo: 'ruta', a: n, b: ciudad, v: d }; }
  }
  if (mejor) return mejor;
  for (const n of red) for (const id of Object.keys(I.AP)) {
    if (I.enRed(s, id) || !I.ciudadDisponible(s, id)) continue;
    const d = I.km(n, id), resto = I.km(id, ciudad);
    if (d > alcance || resto >= I.km(n, ciudad)) continue;
    const p = I.puedeAbrirRuta(s, n, id);
    if (p.ok && (!mejor || resto * 3 + d < mejor.v)) mejor = { tipo: 'ruta', a: n, b: id, v: resto * 3 + d };
  }
  return mejor;
}
// Un avión más donde se ve carga esperando para esa ruta (el panel de la ruta muestra lo que espera salir por cada sentido y el
// estado de cada avión). Con «minimo» > 0 solo compra si lo que espera pasa esa cantidad de aviones llenos y ningún avión de la
// ruta está parado juntando carga (si hay uno esperando carga, otro avión no hace falta: eso también se ve).
function avionDondeEspera(s, elegir = masBarato, minimo = 0, ctx = null) {
  const info = s.rutas.filter((r) => conAvion(s, r)).map((r) => {
    const x = I.resumenRuta(s, r.id);
    return { r, neto: x.neto, espera: Math.max(x.esperan.ida, x.esperan.vuelta), juntando: x.aviones.some((a) => a.espera === 'carga' || a.espera === 'vacio'), deNoche: x.aviones.some((a) => a.espera === 'noche') };
  }).sort((a, b) => b.espera - a.espera);
  for (const { r, espera, juntando, neto, deNoche } of info) {
    const t = elegir === masGrande ? masGrande(s, r) : masBarato(s, r, (x) => I.puedeComprar(s, x.id, r.id).ok);
    if (!t) continue;
    const cap = Object.values(t.lleva).reduce((a, b) => a + b, 0);
    if (minimo > 0 && (espera < minimo * cap || juntando)) continue;
    // una persona prudente no suma aviones a una ruta en rojo y mira un rato el efecto de cada compra antes de la siguiente
    // ni a una ruta cuyos aviones están parados esperando el día (eso se arregla con balizas, no con más aviones)
    const deNocheSinLuz = I.esNoche(s) && !I.iluminada(s, r) && !I.AV[t.id].nocturno;
    if (ctx && (neto < 0 || deNoche || deNocheSinLuz || (ctx.compra?.[r.id] ?? -1e9) > s.t - 600)) continue;
    const a = comprar(s, t, r);
    if (a) { if (ctx) (ctx.compra ??= {})[r.id] = s.t; return a; }
  }
  return null;
}
// ¿La historia pide un avión que todavía no alcanza? (una ruta suya sin avión): entonces se junta la plata para ese.
function historiaEspera(s) { return s.rutas.some((r) => !conAvion(s, r)); }

// Lo que dice el texto de la misión de historia (y su pista, cuando aparece: una acción por pista y por minuto, como alguien que
// hace lo que le sugieren y mira qué pasa).
function seguirHistoria(s, conPista = true, ctx = {}) {
  const obj = I.misionesActivas(s).find((o) => o.tipo === 'historia');
  if (!obj) return null;
  if (obj.espera) return avionParaRutasVacias(s); // «se viene la primera noche»: la misión todavía no pide nada
  const m = obj.mision;
  // una ruta abierta por la historia y todavía sin avión es algo a medio hacer: primero, su avión
  const aMedias = avionParaRutasVacias(s);
  if (aMedias) return aMedias;
  // «mejorá el centro para la próxima ronda»: mientras la pista esté a la vista, junta la plata para eso (no gasta en otra cosa)
  if (conPista && obj.pista === 'pista_ronda_centro') {
    const c = I.costoTransbordo(s, I.HUB);
    return c != null && s.dinero >= c ? { tipo: 'transbordo', id: I.HUB } : { tipo: 'esperar' };
  }
  if (obj.pista && (!conPista || (ctx.pistaHasta ?? -1) > s.t)) obj.pista = null;
  else if (obj.pista) ctx.pistaHasta = s.t + 600;
  if (obj.pista === 'pista_noche') { // la pista de la noche: iluminar la ruta más barata con avión
    const r = s.rutas.filter((x) => conAvion(s, x) && !x.balizas).sort((a, b) => I.costoBalizas(a, s) - I.costoBalizas(b, s))[0];
    return r && s.dinero >= I.costoBalizas(r, s) ? { tipo: 'balizas', id: r.id } : null;
  }
  switch (m.tipo) {
    case 'ruta': {
      const r = rutaDe(s, m.a, m.b);
      if (!r) {
        const p = I.puedeAbrirRuta(s, m.a, m.b);
        if (p.ok) return { tipo: 'ruta', a: m.a, b: m.b };
        // «Cruzá la cordillera: Mendoza ⇄ Santiago» con Mendoza fuera de la red: primero llegar a Mendoza (lo dice la pista)
        if (p.error === 'desconectada') return conectar(s, I.km(I.HUB, m.a) < I.km(I.HUB, m.b) ? m.a : m.b);
        return null;
      }
      return conAvion(s, r) ? null : comprar(s, masBarato(s, r), r);
    }
    case 'despeguesNoche': {
      if (s.rutas.some((r) => r.balizas && conAvion(s, r))) return null;
      const r = s.rutas.filter((x) => conAvion(s, x) && !x.balizas).sort((a, b) => I.costoBalizas(a, s) - I.costoBalizas(b, s))[0];
      return r && s.dinero >= I.costoBalizas(r, s) ? { tipo: 'balizas', id: r.id } : null;
    }
    case 'entregasEn': return conectar(s, m.ciudad) ?? (conPista && obj.pista ? avionDondeEspera(s, masBarato, 1) : null);
    case 'entregasEnTodas': { for (const c of m.ciudades) { const a = conectar(s, c); if (a) return a; } return conPista && obj.pista ? avionDondeEspera(s, masBarato, 1) : null; }
    case 'ciudadesActivas': {
      const vacia = avionParaRutasVacias(s);
      if (vacia) return vacia;
      const libres = Object.keys(I.AP).filter((id) => I.ciudadDisponible(s, id) && !I.enRed(s, id));
      const red = I.nodosRed(s);
      let mejor = null;
      // el texto dice «conectá ciudades»: abre la más cercana a la red (desde Buenos Aires si llega, como sugiere la pista del hub)
      for (const id of libres) for (const n of red) { const p = I.puedeAbrirRuta(s, n, id); const v = n === I.HUB ? p.km * 0.5 : p.km * 1.5; if (p.ok && (!mejor || v < mejor.v)) mejor = { tipo: 'ruta', a: n, b: id, v }; }
      return mejor;
    }
    case 'enServicio': {
      if (s.aviones.some((a) => a.tipo === m.avion)) return null;
      const r = [...s.rutas].filter((x) => I.AV[m.avion].alcance >= x.km).sort((a, b) => b.km - a.km)[0];
      return r ? comprar(s, I.AV[m.avion], r) : null;
    }
    case 'entregas': {
      if (!conPista || !obj.pista) return null;
      // la pista nombra un avión (el Chajá para pasajeros, el Cormorán para carga): ese, donde más espera
      const t = m.avionPista ? I.AV[m.avionPista] : null;
      if (m.carga === 'pasajeros') { // «abrí la ruta a Rosario o a Córdoba desde Buenos Aires»
        const nueva = ['ROS', 'COR'].find((c) => !I.enRed(s, c) && I.puedeAbrirRuta(s, I.HUB, c).ok);
        if (nueva) return { tipo: 'ruta', a: I.HUB, b: nueva };
        const vacia = avionParaRutasVacias(s); if (vacia) return vacia;
      }
      const r = s.rutas.filter((x) => conAvion(s, x) && (!t || t.alcance >= x.km)).sort((a, b) => esperan(s, b) - esperan(s, a))[0];
      if (!r) return null;
      if (t && I.puedeComprar(s, t.id, r.id).ok) return { tipo: 'avion', id: t.id, ruta: r.id };
      return comprar(s, masBarato(s, r, (x) => x.lleva[m.carga] && I.puedeComprar(s, x.id, r.id).ok), r);
    }
    case 'transbordos': {
      if (!conPista || !obj.pista) return null;
      // «abrí rutas desde ahí» (el segundo hub): si la ciudad tiene menos de 6 rutas con avión, una ruta más desde ella hacia la
      // ciudad más cercana que todavía no está conectada con ella (primero las que no están en la red)
      const desde = s.rutas.filter((r) => (r.a === m.ciudad || r.b === m.ciudad) && conAvion(s, r));
      if (m.ciudad !== I.HUB && desde.length < 6) {
        const ya = new Set(desde.flatMap((r) => [r.a, r.b]));
        const cand = Object.keys(I.AP).filter((id) => id !== m.ciudad && !ya.has(id) && I.ciudadDisponible(s, id) && I.puedeAbrirRuta(s, m.ciudad, id).ok)
          .sort((a, b) => (I.enRed(s, a) - I.enRed(s, b)) || I.km(m.ciudad, a) - I.km(m.ciudad, b));
        if (cand.length) return { tipo: 'ruta', a: m.ciudad, b: cand[0] };
      }
      // «mejoralo y conecta más»: subir el centro del hub si alcanza; si no, más vuelos
      const nivel = (s.niveles[m.ciudad] ?? 0);
      if (nivel < 3 && s.dinero >= I.costoTransbordo(s, m.ciudad) * 1.5) return { tipo: 'transbordo', id: m.ciudad };
      return avionDondeEspera(s, masBarato, 1);
    }
    case 'contratos': { // «cumplí N contratos»: aceptar uno entre ciudades que ya tienen vuelos
      const objs = I.misionesActivas(s);
      if (objs.filter((o) => o.tipo === 'contrato' && !o.oferta).length >= 2) return null;
      const oferta = objs.find((o) => o.tipo === 'contrato' && o.oferta && I.servido(s, o.o) && I.servido(s, o.d));
      return oferta ? { tipo: 'contrato', id: oferta.contrato } : null;
    }
    case 'mejorDia': {
      if (!conPista || !obj.pista) return null;
      // la pista dice «seguí la mejor próxima acción»: la que muestra la estrella (abrir ciudades, sumar o vender aviones, balizas)
      const sug = I.sugerencia(s);
      if (sug && sug.tipo !== 'contrato') return accionDe(sug);
      const vacia = avionParaRutasVacias(s); if (vacia) return vacia;
      const nueva = Object.values(I.AP).filter((a) => I.ciudadDisponible(s, a.id) && !I.enRed(s, a.id) && I.puedeAbrirRuta(s, I.HUB, a.id).ok).sort((a, b) => b.peso - a.peso)[0];
      if (nueva) return { tipo: 'ruta', a: I.HUB, b: nueva.id };
      return avionDondeEspera(s, masBarato, 1);
    }
    default: return null;
  }
}

// La primera clasificación del hub (una pregunta en el panel): el novato contesta a la suerte (la mitad acierta); el listo razona
// que lo que vuela más lejos tiene que salir antes. Ninguno de los dos mira el resultado previsto (el panel no lo muestra antes).
function contestarClasificacion(s, ctx, razona) {
  const c = I.clasificacionActual(s);
  if (c?.estado !== 'oferta') return null;
  const op = c.opciones;
  const id = razona ? [...op].sort((a, b) => b.vuelo - a.vuelo)[0].id : op[Math.floor((ctx.azar?.() ?? 0) * op.length)].id;
  return { tipo: 'clasificar', id };
}

export const PERFILES = {
  literal(s, ctx) { return rondaSiLaPide(s, ctx) ?? seguirHistoria(s, true, ctx); },
  novato(s, ctx) {
    const h = rondaSiLaPide(s, ctx) ?? seguirHistoria(s, true, ctx);
    if (h) return h;
    const cl = contestarClasificacion(s, ctx, false);
    if (cl) return cl;
    const objs = I.misionesActivas(s);
    const oferta = objs.find((o) => o.tipo === 'contrato' && o.oferta);
    if (oferta && objs.filter((o) => o.tipo === 'contrato' && !o.oferta).length < 2) return { tipo: 'contrato', id: oferta.contrato };
    const vacia = avionParaRutasVacias(s);
    if (vacia) return vacia;
    if (historiaEspera(s)) return null;
    return avionDondeEspera(s, masBarato, 1.5, ctx);
  },
  listo(s, ctx) {
    if (ctx.rondaDisponible) return { tipo: 'ronda' }; // juega la ronda con el plan sugerido
    const cl = contestarClasificacion(s, ctx, true);
    if (cl) return cl;
    const objs = I.misionesActivas(s);
    const activos = objs.filter((o) => o.tipo === 'contrato' && !o.oferta).length;
    const oferta = objs.find((o) => o.tipo === 'contrato' && o.oferta && I.servido(s, o.o) && I.servido(s, o.d));
    if (oferta && activos < 2) return { tipo: 'contrato', id: oferta.contrato };
    // el chip para los objetivos (misión, seguridad, cuello de botella); después las pistas; y, pensando por su cuenta, la mejor
    // decisión económica que muestran los botones del panel (se paga en 2 días), sin el tope de un consejo por día del chip
    const sug = I.sugerencia(s);
    if (sug && sug.tipo !== 'ahorrar' && sug.tipo !== 'acelerar') return accionDe(sug);
    const h = seguirHistoria(s, true, ctx);
    if (h) return h;
    // además de lo que propone el chip, piensa sus propias compras: como mucho una más cada medio día de juego
    if ((ctx.ultimaEco ?? -1e9) > s.t - LISTO_ECO_MIN) return null;
    const d = mejorDecision(s);
    if (d) ctx.ultimaEco = s.t;
    return d ? accionDe(d) : null; // elige su propia velocidad: juega a ×1
  },
  // Toca solo el chip de la mejor próxima acción, cada 1,5 s, y hace lo que marca (también «×3 hasta juntar»). Es el jugador de portal
  // que no lee nada más: el chip tiene que jugar bien para él sin quitarle lugar a quien piensa.
  soloChip(s) {
    const sug = I.sugerencia(s);
    return sug ? accionDe(sug) : null;
  },
  compraTodo(s, ctx) {
    const h = seguirHistoria(s, true, ctx);
    if (h) return h;
    const vacia = avionParaRutasVacias(s);
    if (vacia) return vacia;
    if (historiaEspera(s)) return null;
    return avionDondeEspera(s, masGrande, 0);
  },
};
export const LISTO_ECO_MIN = 720;
// La mejor decisión económica por su cuenta: la que más rinde por peso de las que se pagan en 2 días de juego.
const ECONOMICAS = new Set(['avion', 'ruta', 'balizas', 'transbordo', 'cargaMin', 'vender']);
function mejorDecision(s) {
  const caja = s.dinero, gd = Math.max(5000, Math.abs(I.gananciaDia(s)) / 2);
  const ok = I.decisiones(s).filter((d) => ECONOMICAS.has(d.tipo) && d.efectoDia > 0 && (d.costo <= 0 || (d.costo <= 2 * d.efectoDia && caja - d.costo > 0)));
  return ok.sort((a, b) => b.efectoDia / Math.max(gd / 4, b.costo + gd) - a.efectoDia / Math.max(gd / 4, a.costo + gd))[0] ?? null;
}
// Si la misión de historia es la de la ronda, se juega la ronda (con el plan sugerido, como dice la pista).
function rondaSiLaPide(s, ctx) {
  return ctx.rondaDisponible && I.misionActual(s)?.tipo === 'rondaPct' ? { tipo: 'ronda' } : null;
}
const accionDe = (d) => (d.tipo === 'ruta' ? { tipo: 'ruta', a: d.a, b: d.b } : d.tipo === 'avion' ? { tipo: 'avion', id: d.id, ruta: d.ruta }
  : d.tipo === 'cargaMin' ? { tipo: 'cargaMin', id: d.id, v: d.v } : d.tipo === 'acelerar' ? { tipo: 'acelerar', meta: d.meta ?? null, hasta: d.hasta ?? null }
  : d.tipo === 'vender' ? { tipo: 'vender', id: d.id, sobra: !!d.sobra, seguridad: !!d.seguridad } : { tipo: d.tipo, id: d.id });

export function aplicar(s, a) {
  switch (a.tipo) {
    case 'ruta': return I.abrirRuta(s, a.a, a.b);
    case 'avion': return I.comprarAvion(s, a.id, a.ruta);
    case 'balizas': return I.ponerBalizas(s, a.id);
    case 'transbordo': return I.mejorarTransbordo(s, a.id);
    case 'vender': return I.venderAvion(s, a.id);
    case 'contrato': return I.aceptarContrato(s, a.id);
    case 'cargaMin': return I.fijarCargaMinima(s, a.id, a.v);
    case 'ronda': return I.aplicarPlan(s, I.planSugerido(s, I.HUB));
    case 'clasificar': return I.elegirClasificacion(s, a.id);
    case 'esperar': case 'ahorrar': return { ok: false }; // junta plata para lo que pide la pista o la mejor próxima acción
    case 'acelerar': return { ok: true, acelerar: { meta: a.meta, hasta: a.hasta } }; // «×3 hasta juntar $X»: la velocidad la maneja quien corre la partida
    default: return { ok: false };
  }
}

