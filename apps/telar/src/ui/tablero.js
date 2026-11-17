// Vista «Tablero»: las mismas tareas en columnas por estado, área o proyecto. Las tarjetas se arrastran.

import { E, A, guardarUI, Silencio } from './estado.js';
import { $, esc } from './util.js';
import { ic } from './iconos.js';
import { hacerArrastrable, crearFantasma, moverFantasma } from './arrastre.js';
import { dn, fechaCorta, isoDe } from '../modelo/fechas.js';
import { seCorrio, proyectoDe, areaDe, moverTarjeta, ventanaDePeriodo, GRIS } from '../modelo/plan.js';
import { columnas } from '../modelo/vista.js';

let board;

const refDia = () => (E.ui.bday ? dn(E.ui.bday) : E.hoy);
export const diaDeReferencia = refDia;

function tarjeta(t) {
  const p = proyectoDe(E.plan, t);
  const a = p ? areaDe(E.plan, p) : null;
  const color = a ? a.color : GRIS;
  const g = E.ui.group;
  const miga = g === 'estado' ? `${esc(a ? a.n : '')} › ${esc(p ? p.n : '')}` : g === 'area' ? esc(p ? p.n : '') : '';
  const s = dn(t.s);
  const e = dn(t.e);
  const late = seCorrio(t, E.hoy);
  const cuando = t.ty === 'hito' ? fechaCorta(s) : `${fechaCorta(s)} → ${fechaCorta(e)}`;
  const tipo = t.ty === 'hito' ? 'Fecha clave' : t.ty === 'habito' ? 'Hábito' : '';
  return `<div class="card${t.st === 'done' ? ' is-done' : ''}${E.ui.sel === t.id ? ' sel' : ''}" data-id="${t.id}" style="--c:${color}" role="button" tabindex="0" aria-label="${esc(t.n)}, ${esc(cuando)}">
   ${miga ? `<div class="cr">${miga}</div>` : ''}
   <div class="ct"><button class="sbtn ${t.st}" data-tick aria-label="${t.st === 'done' ? 'Marcar como pendiente' : 'Marcar como hecha'}" title="Marcar como hecha" style="--c:${color}">${ic.check}</button><span class="cn">${esc(t.n)}</span>${t.star ? ic.star : ''}</div>
   <div class="cm"><span class="when${late ? ' late' : ''}">${cuando}${late ? ' · se corrió' : ''}</span>${tipo ? `<span class="tag">${tipo}</span>` : ''}${t.links && t.links.length ? `<span class="tag" title="Enlaces">↗ ${t.links.length}</span>` : ''}${t.note ? '<span class="tag" title="Tiene notas">≡</span>' : ''}</div></div>`;
}

export function render() {
  if (E.ui.barea && !E.idx.has(E.ui.barea)) E.ui.barea = '';
  const sel = $('#bArea');
  sel.innerHTML = '<option value="">Todas las áreas</option>' + E.plan.areas.map((a) => `<option value="${a.id}"${a.id === E.ui.barea ? ' selected' : ''}>${esc(a.n)}</option>`).join('');
  const sx = board.scrollLeft;
  const sy = {};
  board.querySelectorAll('.col').forEach((c) => (sy[c.dataset.key] = c.querySelector('.colb').scrollTop));
  const cols = columnas(E.plan, { grupo: E.ui.group, area: E.ui.barea, periodo: E.ui.per, ref: refDia() }, { q: E.ui.q, estado: E.ui.fst, foco: E.ui.foco }, E.hoy);
  const w = ventanaDePeriodo(E.ui.per, refDia());
  const n = new Set(cols.flatMap((c) => c.tareas.map((t) => t.id))).size;
  $('#perNote').textContent = w
    ? `${E.ui.per === 'dia' ? (refDia() === E.hoy ? 'Hoy, ' + fechaCorta(w[0]) : 'El ' + fechaCorta(w[0])) : `${fechaCorta(w[0])} → ${fechaCorta(w[1])}`} · ${n} ${n === 1 ? 'tarea' : 'tareas'}`
    : '';
  const colorEstado = { todo: 'var(--muted)', doing: 'var(--doing)', done: 'var(--ok)' };
  let h = cols
    .map((c) => {
      const color = E.ui.group === 'estado' ? colorEstado[c.clave] : c.c;
      const titulo = c.abrible && !E.ui.barea ? `<button class="tit" data-abrir="${c.clave}" title="Ver el tablero de ${esc(c.n)} por proyecto"><b>${esc(c.n)}</b></button>` : `<b title="${esc(c.n)}">${esc(c.n)}</b>`;
      return `<section class="col" data-key="${c.clave}" style="--c:${color}" aria-label="${esc(c.n)}">
    <div class="colh"><div class="tt">${titulo}${c.sub ? `<small>${esc(c.sub)}</small>` : ''}</div><span class="cnt">${c.tareas.length}</span><button class="plus" data-badd="${c.clave}" aria-label="Agregar tarea en ${esc(c.n)}" title="Agregar tarea">${ic.plus}</button></div>
    <div class="colb">${c.tareas.map(tarjeta).join('') || '<div class="none">Sin tareas. Arrastrá una acá.</div>'}</div>
    <button class="addc" data-badd="${c.clave}">${ic.plus} Agregar tarea</button></section>`;
    })
    .join('');
  if (!E.plan.areas.length)
    h = `<div class="empty" style="position:static;flex:1;border:1px solid var(--line);border-radius:12px"><div><h2>Todavía no hay nada en el plan</h2><div>Pasá al cronograma para armar tu primer proyecto.</div><div class="sbx"><button class="btn primary" data-vista="gantt">Ir al cronograma</button></div></div></div>`;
  else if (!cols.length)
    h = `<div class="empty" style="position:static;flex:1;border:1px solid var(--line);border-radius:12px"><div><h2>Nada en este período</h2><div>Probá con otro período u otra búsqueda.</div></div></div>`;
  board.innerHTML = h;
  board.scrollLeft = sx;
  board.querySelectorAll('.col').forEach((c) => {
    const v = sy[c.dataset.key];
    if (v) c.querySelector('.colb').scrollTop = v;
  });
}

function agregarEnColumna(clave) {
  const g = E.ui.group;
  let pid = null;
  let st;
  if (g === 'proyecto') pid = clave;
  else if (g === 'area') {
    const p = E.plan.projects.find((x) => x.a === clave);
    if (!p) {
      A.toast('Esta área todavía no tiene proyectos');
      return;
    }
    pid = p.id;
  } else {
    st = clave;
    const it = E.ui.sel && E.idx.get(E.ui.sel);
    let p = it ? (it.k === 'task' ? proyectoDe(E.plan, it.o) : it.k === 'proj' ? it.o : null) : null;
    if (E.ui.barea && (!p || p.a !== E.ui.barea)) p = E.plan.projects.find((x) => x.a === E.ui.barea);
    p = p || E.plan.projects[0];
    pid = p && p.id;
  }
  A.agregarTarea(pid, st, E.ui.per !== 'todo' ? isoDe(refDia()) : null);
}

export function montar() {
  board = $('#board');
  board.addEventListener('click', (e) => {
    const vista = e.target.closest('[data-vista]');
    if (vista) {
      E.ui.view = vista.dataset.vista;
      guardarUI();
      A.render();
      return;
    }
    const ab = e.target.closest('[data-abrir]');
    if (ab) {
      E.ui.barea = ab.dataset.abrir;
      E.ui.group = 'proyecto';
      guardarUI();
      A.render();
      board.scrollLeft = 0;
      return;
    }
    const add = e.target.closest('[data-badd]');
    if (add) {
      agregarEnColumna(add.dataset.badd);
      return;
    }
    const card = e.target.closest('.card');
    if (!card) return;
    if (e.target.closest('[data-tick]')) {
      const t = E.idx.get(card.dataset.id).o;
      A.mutar(() => {
        t.st = t.st === 'done' ? 'todo' : 'done';
      });
      if (E.ui.sel === t.id) A.renderPanel();
      return;
    }
    A.seleccionar(card.dataset.id);
  });
  board.addEventListener('keydown', (e) => {
    const card = e.target.closest('.card');
    if (card && (e.key === 'Enter' || e.key === ' ') && e.target === card) {
      e.preventDefault();
      A.seleccionar(card.dataset.id);
    }
  });

  let marcada = null;
  const limpiar = () => {
    board.querySelectorAll('.dz-before,.dz-after,.dz-col').forEach((x) => x.classList.remove('dz-before', 'dz-after', 'dz-col'));
    marcada = null;
  };
  hacerArrastrable(board, {
    asa: '.card',
    ignorar: '[data-tick]',
    espera: (_el, e) => (e.pointerType === 'touch' ? 320 : 0),
    umbral: 5,
    desplazables: () => {
      const bajo = marcada && marcada.closest('.col');
      return [board, bajo ? bajo.querySelector('.colb') : null];
    },
    iniciar(el, e) {
      const fan = crearFantasma(el, 'tarjeta');
      const r = el.getBoundingClientRect();
      fan.dx = e.clientX - r.left;
      fan.dy = e.clientY - r.top;
      el.classList.add('dragging');
      return { id: el.dataset.id, el, fan, destino: null };
    },
    mover(s, p) {
      moverFantasma(s.fan, p.x, p.y, ' rotate(1.5deg)');
      limpiar();
      s.destino = null;
      const bajo = document.elementFromPoint(p.x, p.y);
      const col = bajo && bajo.closest && bajo.closest('#board .col');
      if (!col) return;
      const card = bajo.closest('.card');
      if (card && card.dataset.id !== s.id) {
        const r = card.getBoundingClientRect();
        const pos = (p.y - r.top) / r.height < 0.5 ? 'before' : 'after';
        card.classList.add('dz-' + pos);
        s.destino = { clave: col.dataset.key, id: card.dataset.id, pos };
      } else {
        col.classList.add('dz-col');
        s.destino = { clave: col.dataset.key, id: null, pos: 'after' };
      }
      marcada = col;
    },
    soltar(s) {
      limpiar();
      s.fan.el.remove();
      s.el.classList.remove('dragging');
      if (!s.destino) return;
      let r = null;
      A.mutar(() => {
        r = moverTarjeta(E.plan, s.id, E.ui.group, s.destino.clave, s.destino.id, s.destino.pos);
        if (!r.ok) throw new Silencio();
      });
      if (r && !r.ok && r.aviso) A.toast(r.aviso);
      if (E.ui.sel === s.id) A.renderPanel();
    },
    cancelar(s) {
      limpiar();
      s.fan.el.remove();
      s.el.classList.remove('dragging');
    },
  });
}
