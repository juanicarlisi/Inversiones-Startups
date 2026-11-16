// Página de demostración: la oficina sin el juego, con un juego de mentira que responde a las acciones.
//   ?hora=18.8   hora del juego (0 a 24)      ?lang=es|en      ?primera=1   la primera entrada (puerta, nombre, recorrido)
//   ?calidad=alto|medio|bajo                 ?hoja=mapa|libro|flota|bandeja|cuaderno|placa   abre esa hoja al entrar
//   ?manual=1    el reloj de la escena se avanza a mano con __oficina.depurar.paso(dt) (para sacar ráfagas de capturas)
//   ?ejemplo=propio   ignora src/oficina-datos-ejemplo.json aunque exista
import './demo.css';
import { crearOficina } from '../oficina.js';
import { juegoDeEjemplo } from '../ejemplo.js';

const q = new URLSearchParams(location.search);
const idioma = q.get('lang') === 'en' ? 'en' : 'es', primera = q.get('primera') === '1', hora = q.has('hora') ? +q.get('hora') : 9.5;
const juego = juegoDeEjemplo(idioma, { primera, hora });
let real = null;
if (q.get('ejemplo') !== 'propio') { try { const r = await fetch('oficina-datos-ejemplo.json'); if (r.ok) real = await r.json(); } catch { /* no está: se usa el ejemplo propio */ } }
if (real) { if (primera) real.empresa = { ...real.empresa, nombre: '', color: '' }; if (q.has('hora')) real.hoy = { ...real.hoy, hora }; }
const datos = () => {
  if (!real) return juego.datos();
  return real;
};
const cartel = document.querySelector('#juego code'), boton = document.querySelector('#juego button');
function accion(a) {
  juego.accion(a);
  if (real) {
    if (a.tipo === 'nombre') real = { ...real, empresa: { ...real.empresa, nombre: a.nombre, color: a.color } };
    if (a.tipo === 'leido' || a.tipo === 'bandeja') real = { ...real, bandeja: real.bandeja.map((n) => (n.id === a.id ? { ...n, leido: true, acciones: a.tipo === 'bandeja' ? [] : n.acciones } : n)) };
  }
  cartel.textContent = `accion(${JSON.stringify(a)})`;
  console.log('[demo] accion', JSON.stringify(a));
}
// ?calidad= fija el nivel (como en el juego); sin el parámetro, nivel medio con la resolución que se ajusta sola
const oficina = crearOficina({ contenedor: document.querySelector('#oficina'), idioma, calidad: q.get('calidad') ? { nombre: q.get('calidad'), fijo: true } : 'medio', datos, accion });
window.__oficina = oficina; window.__juego = juego;
if (q.get('manual') === '1') oficina.depurar.manual(true);
boton.addEventListener('click', () => oficina.abrir());
await oficina.abrir({ primera });
if (q.get('manual') === '1') oficina.depurar.manual(true);
if (q.get('hoja')) setTimeout(() => oficina.depurar.abrirHoja(q.get('hoja')), 1400);
window.__lista = true;
