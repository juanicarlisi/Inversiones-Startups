// Engancha la oficina al juego por el puente (src/puente-oficina.js). Con importar este archivo desde main.js alcanza:
//
//   import './oficina/conectar.js';
//
// El juego ya llama a Puente.abrirOficina() y atiende las acciones; acá se crea el contenedor, se arma la oficina con los
// datos y las acciones del puente y se la anota con conectarOficina({ abrir, cerrar }). Si main.js quiere fijar de dónde
// salen la calidad o el sonido, puede llamar a ajustarOficina({ calidad: () => …, sonido: (nombre, valor) => … }).
import { conectarOficina, datosOficina, accionOficina } from '../puente-oficina.js';
import { lengua } from '../ui/textos.js';
import { crearOficina } from './oficina.js';

const CLAVE = 'hubnocturno.v2.oficina';
// Los sonidos de la oficina, dichos con los que el juego ya tiene (audio/audio.js). Lo que no está en la lista no suena.
const SONIDOS = { abrir: 'abrir', cerrar: 'cerrar', salir: 'cerrar', toque: 'clic', papel: 'paso', puerta: 'paso', placa: 'momento' };
const opciones = {
  // el nivel de gráficos y la resolución que el juego está usando en este momento
  calidad: () => { const m = window.__hn?.mundo; return m?.calidad ? { ...m.calidad, escala: m.escalaRes ?? 1 } : 'medio'; },
  sonido: (nombre, valor) => { const s = SONIDOS[nombre]; if (s) window.__hn?.A?.sonar?.(s, valor); },
  idioma: () => lengua(),
};
export function ajustarOficina(o) { Object.assign(opciones, o); }

function contenedor() {
  let c = document.querySelector('#oficina');
  if (!c) { c = document.createElement('div'); c.id = 'oficina'; c.style.cssText = 'position:fixed;inset:0;z-index:80;pointer-events:none'; document.body.appendChild(c); }
  return c;
}
// ¿Es la primera vez que se entra a la oficina en esta partida? El contrato de datos todavía no lo dice (el nombre llega
// siempre con su valor por defecto), así que se anota acá: se estrena una vez, y de nuevo si la partida arrancó de cero
// (el día de la partida volvió para atrás). Si el juego manda empresa.estrenada (true o false), manda eso.
function esPrimera(d) {
  if (typeof d?.empresa?.estrenada === 'boolean') return !d.empresa.estrenada;
  let g = null;
  try { g = JSON.parse(localStorage.getItem(CLAVE) ?? 'null'); } catch { /* sin almacenamiento */ }
  const dia = d?.hoy?.dia ?? 1, primera = !g || dia < (g.dia ?? 0);
  try { localStorage.setItem(CLAVE, JSON.stringify({ dia })); } catch { /* sin almacenamiento: se estrena cada vez */ }
  return primera;
}

let oficina = null;
export function oficinaDelJuego() {
  oficina ??= crearOficina({ contenedor: contenedor(), datos: datosOficina, accion: accionOficina, sonido: (n, v) => opciones.sonido?.(n, v) });
  window.__oficina = oficina;      // para pruebas, como window.__hn
  return oficina;
}
conectarOficina({
  abrir() { const d = datosOficina(); return oficinaDelJuego().abrir({ idioma: opciones.idioma(), calidad: opciones.calidad(), primera: esPrimera(d) }); },
  cerrar() { oficina?.cerrar(); },
});
