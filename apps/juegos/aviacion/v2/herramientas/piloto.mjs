// Una partida jugada sola, sin navegador, con las mismas piezas que usa el juego: el modelo (../../js), el estimador verdadero
// (src/estimador.js) y el libro de la empresa (src/libro.js). El jugador es uno de los perfiles automáticos de la v1
// (../../herramientas/perfiles.mjs): acá solo se le anota cada compra con lo que la tarjeta le habría prometido.
// Lo usan herramientas/ejemplo-oficina.mjs (el archivo de ejemplo para la oficina) y pruebas/estimador.test.mjs.
import * as M from '../../js/modelo.js';
import { PERFILES } from '../../herramientas/perfiles.mjs';
import { estimar } from '../src/estimador.js';
import * as Libro from '../src/libro.js';

// Aplica una acción del perfil como lo haría la interfaz: estima antes, compra, y anota la compra con su promesa.
export function hacer(s, L, a, { conPromesa = true, alEstimar = null } = {}) {
  const promesa = (d, comprar, info) => {
    const est = conPromesa ? estimar(s, d) : null;
    const caja = s.dinero;
    const r = comprar();
    if (!r?.ok) return r;
    const p = Libro.anotarCompra(L, s, d, est, { costo: caja - s.dinero, ...info(r) });
    alEstimar?.(d, est, p);
    return r;
  };
  switch (a.tipo) {
    case 'ruta': { const caja = s.dinero, r = M.abrirRuta(s, a.a, a.b); if (r.ok) Libro.anotarCompra(L, s, { tipo: 'ruta', a: a.a, b: a.b }, null, { costo: caja - s.dinero, ruta: r.ruta.id }); return r; }
    case 'avion': return promesa({ tipo: 'avion', id: a.id, ruta: a.ruta }, () => M.comprarAvion(s, a.id, a.ruta), (r) => ({ ruta: a.ruta, avion: r.avion.id, tipoAvion: a.id }));
    case 'balizas': return promesa({ tipo: 'faros', ruta: a.id }, () => M.ponerBalizas(s, a.id), () => ({ ruta: a.id }));
    case 'transbordo': return promesa({ tipo: 'correo', ap: a.id }, () => M.mejorarTransbordo(s, a.id), () => ({ ap: a.id }));
    case 'vender': { const av = s.aviones.find((x) => x.id === a.id), r = M.venderAvion(s, a.id); if (r.ok) Libro.anotarVenta(L, s, r.monto, av?.ruta ?? null); return r; }
    case 'contrato': return M.aceptarContrato(s, a.id);
    case 'cargaMin': { const r = M.fijarCargaMinima(s, a.id, a.v); if (r.ok) Libro.anotarCambio(L, s, 'salida', a.id); return r; }
    case 'ronda': return M.aplicarPlan(s, M.planSugerido(s, M.HUB));
    case 'clasificar': return M.elegirClasificacion(s, a.id);
    default: return { ok: false };
  }
}

// Juega «dias» días de juego. cada: cada cuántos pasos mira el perfil (6 pasos = 30 minutos de juego). El capítulo no avanza
// (la partida se queda en 1929, como quien elige «Quedarme un rato más»).
export function partida({ semilla = 3, dias = 6, perfil = 'listo', cada = 6, conPromesa = true, alPaso = null, alEstimar = null } = {}) {
  const s = M.nuevoEstado(semilla), L = Libro.nuevo(s), ctx = {};
  const partes = [], notas = [];
  const pasos = Math.round(dias * 1440 / M.PASO);
  for (let i = 0; i < pasos; i++) {
    if (i % cada === 0) { const a = PERFILES[perfil](s, ctx); if (a) hacer(s, L, a, { conPromesa, alEstimar }); }
    const ev = M.paso(s);
    for (const e of ev) { if (e.tipo === 'rondaDisponible') ctx.rondaDisponible = true; if (e.tipo === 'rondaCorte') ctx.rondaDisponible = false; }
    const c = Libro.alPaso(L, s, ev);
    if (c?.cerro != null) partes.push(Libro.parte(L, s, c.cerro));
    for (const n of Libro.revisarPromesas(L, s)) notas.push(n);
    alPaso?.(s, L, ev, i);
  }
  return { s, L, partes, notas };
}
