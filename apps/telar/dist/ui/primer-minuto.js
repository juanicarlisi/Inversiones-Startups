// El primer minuto: nunca se abre en blanco.
// - La primera vez se ve el plan de ejemplo «Tu 2027», con un aviso para borrarlo de un toque.
// - Sin nada en el plan, el cronograma muestra «Armá tu primer proyecto»: qué querés lograr, en qué parte de tu vida
//   y para cuándo (opcional). Con eso se crean el área, el proyecto y la fecha clave, y se abre para sumar tareas.

import { E, A } from './estado.js';
import { $, esc } from './util.js';
import { anioDelEjemplo } from '../modelo/ejemplo.js';
import { isoDe } from '../modelo/fechas.js';

export const AREAS_SUGERIDAS = [
  ['Trabajo', '#2f6fed'],
  ['Estudio', '#7c4dff'],
  ['Casa', '#e8860c'],
  ['Salud y vida', '#12a37f'],
  ['Proyecto propio', '#0e9aa7'],
];

export function htmlPrimerProyecto() {
  const chips = AREAS_SUGERIDAS.map(
    ([n, c], i) => `<label class="chipr" style="--c:${c}"><input type="radio" name="pp-area" value="${i}"${i === 0 ? ' checked' : ''}><span><i></i>${esc(n)}</span></label>`,
  ).join('');
  return `<form class="primero" id="formPrimero" novalidate>
    <h2>Armá tu primer proyecto</h2>
    <p>Tres datos y ya lo ves en el cronograma. Después le sumás tareas.</p>
    <label class="l" for="pp-nombre">¿Qué querés lograr?</label>
    <input class="field" id="pp-nombre" placeholder="Ej.: Mudarme antes de marzo" autocomplete="off" maxlength="120" required enterkeyhint="next">
    <span class="l" id="pp-l-area" style="display:block;font-size:12px;font-weight:600;color:var(--muted);margin:14px 0 6px">¿En qué parte de tu vida?</span>
    <div class="chips" role="radiogroup" aria-labelledby="pp-l-area">${chips}</div>
    <label class="l" for="pp-fecha">¿Para cuándo? <span style="font-weight:400">(opcional)</span></label>
    <input class="field" id="pp-fecha" type="date" min="${isoDe(E.hoy)}" style="width:auto">
    <div class="fila-acc"><button class="btn primary" type="submit">Crear proyecto</button>
      <button class="enlace" type="button" data-m2="ejemplo">Ver un ejemplo</button>
      <button class="enlace" type="button" data-m2="importar">Restaurar una copia</button></div>
  </form>`;
}

export function renderAviso() {
  const av = $('#aviso');
  if (!E.plan.ejemplo) {
    av.hidden = true;
    av.innerHTML = '';
    return;
  }
  av.hidden = false;
  av.innerHTML = `<div class="tx"><b>Este es un plan de ejemplo: «Tu ${anioDelEjemplo(E.hoy)}».</b> <span class="hint">Tocá, arrastrá las barras y probá el tablero.</span></div>
    <div class="acc"><button class="btn primary" id="borrarEjemplo">Borrar el ejemplo y empezar el mío</button><button class="btn" id="quedarEjemplo" title="Lo dejo como mi plan y lo cambio">Quedármelo</button></div>`;
}

export function montar() {
  $('#aviso').addEventListener('click', (e) => {
    if (e.target.closest('#borrarEjemplo')) A.borrarEjemplo();
    else if (e.target.closest('#quedarEjemplo')) {
      A.mutar(() => {
        delete E.plan.ejemplo;
      });
      A.toast('Listo: el plan es tuyo. Cambiá lo que quieras.');
    }
  });
  document.addEventListener('submit', (e) => {
    if (e.target.id !== 'formPrimero') return;
    e.preventDefault();
    const nombre = $('#pp-nombre').value.trim();
    if (!nombre) {
      $('#pp-nombre').focus();
      A.toast('Escribí qué querés lograr');
      return;
    }
    const i = +(document.querySelector('input[name="pp-area"]:checked')?.value ?? 0);
    const fecha = $('#pp-fecha').value || null;
    A.crearPrimerProyecto({ nombre, area: AREAS_SUGERIDAS[i][0], color: AREAS_SUGERIDAS[i][1], fecha });
  });
}
