// Puente entre el juego y la escena de la oficina. El juego (main.js) produce los datos y atiende las acciones; la escena
// (src/oficina/) los dibuja. Ninguno de los dos importa al otro: los dos importan este archivo.
//
//   import { datosOficina, accionOficina, conectarOficina } from '../puente-oficina.js';
//
//   conectarOficina({ abrir({ datos, accion }), cerrar() })   la escena se anota (una vez, al cargarse)
//   datosOficina()            → el objeto del contrato (diseno-carrera.md §5); null si el juego todavía no arrancó
//   accionOficina(a)          → { ok, … }: { tipo: 'nombre', nombre, color } · { tipo: 'ir', a: 'ruta' | 'avion', id } ·
//                               { tipo: 'bandeja', id, accion } · { tipo: 'leido', id } · { tipo: 'salir' }
//   abrirOficina()            → true si la escena estaba y se abrió (frena el reloj); false si todavía no hay escena
//   hayOficina()              → si hay escena anotada (si no, el juego no muestra el botón «Ir a la oficina»)
//
// También queda en window.HubNocturno (mismas funciones), por si la escena se carga aparte.
let juego = null, escena = null, abierta = false;

// main.js: { datos(), accion(a), alAbrir(), alCerrar() }
export function conectarJuego(j) { juego = j; }
export function conectarOficina(e) { escena = e && typeof e.abrir === 'function' ? e : null; juego?.alConectar?.(); return !!escena; }
export const hayOficina = () => !!escena;
export const oficinaAbierta = () => abierta;
export function datosOficina() { return juego ? juego.datos() : null; }
export function accionOficina(a) {
  if (!juego || !a || typeof a !== 'object') return { ok: false };
  if (a.tipo === 'salir') { cerrarOficina(); return { ok: true }; }
  const r = juego.accion(a) ?? { ok: false };
  if (r.salir) cerrarOficina();          // «ir a una ruta» o «ir a un avión» salen de la oficina
  return r;
}
export function abrirOficina() {
  if (!juego || !escena || abierta) return false;
  abierta = true;
  juego.alAbrir?.();
  try { escena.abrir({ datos: datosOficina(), accion: accionOficina }); } catch (e) { abierta = false; juego.alCerrar?.(); console.warn('Hub Nocturno: la oficina no abrió', e); return false; }
  return true;
}
export function cerrarOficina() {
  if (!abierta) return;
  abierta = false;
  try { escena?.cerrar?.(); } catch (e) { console.warn('Hub Nocturno: la oficina no cerró bien', e); }
  juego?.alCerrar?.();
}

if (typeof window !== 'undefined') window.HubNocturno = { datosOficina, accionOficina, abrirOficina, cerrarOficina, conectarOficina, hayOficina };
