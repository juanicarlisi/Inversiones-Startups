// Vista «Cronograma»: árbol de áreas, proyectos y tareas a la izquierda (fijo al desplazar) y barras en el tiempo.

import { E, A, guardarUI, Silencio } from './estado.js';
import { $, esc } from './util.js';
import { ic } from './iconos.js';
import { hacerArrastrable, crearFantasma, moverFantasma } from './arrastre.js';
import { dn, isoDe, diaSemana, diaDelMes, mesAnio, mesCorto, mesDe, anioDe, fechaCorta, dias, dia } from '../modelo/fechas.js';
import { seCorrio, rango, posicionDeSoltar, moverA, moverPaso, fechasArrastradas, ponerFechas } from '../modelo/plan.js';
import { filas } from '../modelo/vista.js';
import { htmlPrimerProyecto } from './primer-minuto.js';

export const ZOOM = { pan: 2.4, mes: 6, sem: 16, dia: 34 };

let gantt, canvas, tipEl;
let R = { s: 0, e: 0 };
let PPD = 6;
let ultimoInicio = null;

export const pxDia = () => PPD;
const lwPx = () => {
  const el = canvas && canvas.querySelector('.corner');
  return el ? el.offsetWidth : 360;
};

/* ───────── dibujo ───────── */

function cabecera(anchoTL) {
  let m = '';
  let w = '';
  let cur = R.s;
  while (cur <= R.e) {
    const sig = dia(anioDe(cur), mesDe(cur) + 1, 1);
    const x = (cur - R.s) * PPD;
    const ancho = (Math.min(sig, R.e + 1) - cur) * PPD;
    let rot;
    if (ancho >= 130) rot = mesAnio(cur).replace(' de ', ' ');
    else {
      rot = mesCorto(cur);
      if (mesDe(cur) === 0 || cur === R.s) rot += ' ' + String(anioDe(cur)).slice(2);
    }
    m += `<div class="m" style="left:${x}px;width:${ancho}px">${esc(rot)}</div>`;
    cur = sig;
  }
  if (E.ui.zoom === 'dia') {
    for (let n = R.s; n <= R.e; n++) {
      const ds = diaSemana(n);
      w += `<div class="w${ds === 0 || ds === 6 ? ' we' : ''}" style="left:${(n - R.s) * PPD}px;width:${PPD}px;padding-left:0;text-align:center">${diaDelMes(n)}</div>`;
    }
  } else if (E.ui.zoom !== 'pan') {
    for (let n = R.s; n <= R.e; n++) if (diaSemana(n) === 1) w += `<div class="w" style="left:${(n - R.s) * PPD}px;width:${7 * PPD}px">${diaDelMes(n)}</div>`;
  }
  const tx = (E.hoy - R.s) * PPD + PPD / 2;
  const td = E.hoy >= R.s && E.hoy <= R.e ? `<div class="td" style="left:${tx}px">Hoy</div>` : '';
  return `<div class="th" style="width:${anchoTL}px">${m}${w}${td}</div>`;
}

function grilla(anchoTL) {
  let g = '';
  for (let n = R.s; n <= R.e; n++) {
    if (diaDelMes(n) === 1) g += `<i class="m" style="left:${(n - R.s) * PPD}px"></i>`;
    else if (E.ui.zoom === 'dia') g += `<i style="left:${(n - R.s) * PPD}px"></i>`;
    else if (E.ui.zoom !== 'pan' && diaSemana(n) === 1) g += `<i style="left:${(n - R.s) * PPD}px"></i>`;
  }
  if (E.hoy >= R.s && E.hoy <= R.e) g += `<i class="t" style="left:${(E.hoy - R.s) * PPD + PPD / 2}px"></i>`;
  return `<div class="grid" style="width:${anchoTL}px">${g}</div>`;
}

const ESTADO_TXT = { todo: 'pendiente', doing: 'en curso', done: 'hecha' };
function descripcion(t) {
  const s = dn(t.s);
  const e = dn(t.e);
  const cuando = t.ty === 'hito' ? `fecha clave, ${fechaCorta(s)}` : `${fechaCorta(s)} a ${fechaCorta(e)}, ${dias(e - s + 1)}`;
  return `${t.n}. ${cuando}. ${t.ty === 'habito' ? 'Hábito' : ESTADO_TXT[t.st]}${seCorrio(t, E.hoy) ? ', se corrió' : ''}${t.star ? ', en foco' : ''}.`;
}

function barra(t, c) {
  const s = dn(t.s);
  const e = dn(t.e);
  const x = (s - R.s) * PPD;
  const w = Math.max((e - s + 1) * PPD, 6);
  const cls = ['bar', t.ty === 'hito' ? 'hito' : '', t.ty === 'habito' ? 'habito' : '', t.st, seCorrio(t, E.hoy) ? 'late' : '', E.ui.sel === t.id ? 'sel' : ''].filter(Boolean).join(' ');
  const izq = t.ty === 'hito' ? x + PPD / 2 : x;
  const asas = t.ty === 'hito' ? '' : '<span class="h l" data-h="l"></span><span class="h r" data-h="r"></span>';
  const rotulo = t.ty === 'tarea' && w >= 64 ? `<span class="bl">${esc(t.n)}</span>` : '';
  const tip = t.ty === 'hito' ? `${t.n} · ${fechaCorta(s)}` : `${t.n} · ${fechaCorta(s)} → ${fechaCorta(e)} (${dias(e - s + 1)})`;
  return `<div class="${cls}" data-id="${t.id}" style="left:${izq}px;width:${w}px;--c:${c}" title="${esc(tip)}">${rotulo}${asas}</div>`;
}

const botonesOrden = () => `<button data-act="up" title="Subir (más prioridad)" aria-label="Subir">${ic.up}</button><button data-act="down" title="Bajar" aria-label="Bajar">${ic.down}</button>`;

function fila(r, anchoTL) {
  const o = r.o;
  const c = r.c;
  const sel = E.ui.sel === o.id ? ' sel' : '';
  if (r.k === 'task') {
    const late = seCorrio(o, E.hoy);
    return `<div class="row task d2${o.st === 'done' ? ' is-done' : ''}${sel}" data-id="${o.id}" data-k="task" style="--c:${c}">
      <div class="lc"><span class="grip" title="Arrastrar para cambiar la prioridad" aria-hidden="true">${ic.grip}</span>
        <button class="sbtn ${o.st}" data-act="tick" aria-label="${o.st === 'done' ? 'Marcar como pendiente' : 'Marcar como hecha'}: ${esc(o.n)}" title="${o.st === 'done' ? 'Hecha (tocá para volver a pendiente)' : 'Marcar como hecha'}">${ic.check}</button>
        <button class="nm" data-act="sel" title="${esc(o.n)}" aria-label="${esc(descripcion(o))}">${esc(o.n)}</button>${late ? '<span class="late-dot" title="Se corrió"></span>' : ''}${o.star ? ic.star : ''}
        <span class="acts">${botonesOrden()}</span></div>
      <div class="tc" style="width:${anchoTL}px">${barra(o, c)}</div></div>`;
  }
  const hechas = r.todas.filter((t) => t.st === 'done').length;
  const tot = r.todas.length;
  let sum = '';
  if (tot) {
    let mn = Infinity;
    let mx = -Infinity;
    for (const t of r.todas) {
      mn = Math.min(mn, dn(t.s));
      mx = Math.max(mx, dn(t.e));
    }
    sum = `<div class="sum" style="left:${(mn - R.s) * PPD}px;width:${Math.max((mx - mn + 1) * PPD, 6)}px;--c:${c}" title="${esc(o.n)} · ${fechaCorta(mn)} → ${fechaCorta(mx)} · ${hechas} de ${tot} hechas"><i style="width:${(hechas / tot) * 100}%"></i></div>`;
  }
  const dept = r.k === 'proj' && o.dept ? `<span class="dept">${esc(o.dept)}</span>` : '';
  const que = r.k === 'area' ? 'área' : 'proyecto';
  return `<div class="row ${r.k} d${r.d}${sel}" data-id="${o.id}" data-k="${r.k}" style="--c:${c}">
    <div class="lc"><span class="grip" title="Arrastrar para reordenar" aria-hidden="true">${ic.grip}</span>
      <button class="chev" data-act="tog" aria-expanded="${r.abierta}" aria-label="${r.abierta ? 'Cerrar' : 'Abrir'} ${que} ${esc(o.n)}">${ic.chev}</button>
      <button class="nm" data-act="sel" title="${esc(o.n)}">${esc(o.n)}${dept}</button><span class="cnt" title="Hechas de ${tot}">${hechas}/${tot}</span>
      <span class="acts"><button data-act="add" title="${r.k === 'area' ? 'Agregar proyecto' : 'Agregar tarea'}" aria-label="${r.k === 'area' ? 'Agregar proyecto' : 'Agregar tarea'}">${ic.plus}</button>${botonesOrden()}</span></div>
    <div class="tc" style="width:${anchoTL}px">${sum}</div></div>`;
}

export function render() {
  PPD = ZOOM[E.ui.zoom] || 6;
  R = rango(E.plan, E.hoy);
  const anchoTL = (R.e - R.s + 1) * PPD;
  if (ultimoInicio !== null && ultimoInicio !== R.s) gantt.scrollLeft += (ultimoInicio - R.s) * PPD;
  ultimoInicio = R.s;
  const rs = filas(E.plan, E.ui.exp, { q: E.ui.q, estado: E.ui.fst, foco: E.ui.foco }, E.hoy);
  const sy = gantt.scrollTop;
  let h = `<div class="head"><div class="corner"><b>Prioridad</b><span class="long">de arriba a abajo</span></div>${cabecera(anchoTL)}</div>`;
  h += grilla(anchoTL);
  h += rs.map((r) => fila(r, anchoTL)).join('');
  if (!E.plan.areas.length) h += `<div class="empty">${htmlPrimerProyecto()}</div>`;
  else if (!rs.length)
    h += `<div class="empty"><div><h2>Nada coincide con lo que buscás</h2><div>Probá con otra palabra o mostrá todas las tareas.</div><div class="sbx"><button class="btn" data-m2="limpiar">Quitar filtros</button></div></div></div>`;
  canvas.style.width = `calc(var(--lw) + ${anchoTL}px)`;
  canvas.innerHTML = h;
  gantt.scrollTop = sy;
}

/* ───────── navegación ───────── */

export function irAHoy(suave = true) {
  gantt.scrollTo({ left: Math.max(0, (E.hoy - R.s) * PPD - (gantt.clientWidth - lwPx()) * 0.18), behavior: suave ? 'smooth' : 'auto' });
}

export function ponerZoom(v) {
  const cx = gantt.scrollLeft + (gantt.clientWidth - lwPx()) / 2;
  const centro = R.s + cx / PPD;
  E.ui.zoom = v;
  guardarUI();
  A.render();
  gantt.scrollLeft = Math.max(0, (centro - R.s) * PPD - (gantt.clientWidth - lwPx()) / 2);
}

export function mostrarFila(id) {
  const row = canvas.querySelector(`.row[data-id="${CSS.escape(id)}"]`);
  if (row) row.scrollIntoView({ block: 'nearest' });
}

/* ───────── arranque ───────── */

export function montar() {
  gantt = $('#gantt');
  canvas = $('#canvas');
  tipEl = document.createElement('div');
  tipEl.className = 'tip';
  tipEl.hidden = true;
  document.body.appendChild(tipEl);

  canvas.addEventListener('click', (e) => {
    const m2 = e.target.closest('[data-m2]');
    if (m2) {
      const v = m2.dataset.m2;
      if (v === 'limpiar') {
        E.ui.q = '';
        E.ui.fst = 'all';
        E.ui.foco = false;
        $('#q').value = '';
        $('#fst').value = 'all';
        A.render();
      } else if (v === 'importar') A.importar();
      else if (v === 'ejemplo') A.verEjemplo();
      return;
    }
    if (e.target.closest('.empty')) return;
    const bar = e.target.closest('.bar');
    const row = e.target.closest('.row');
    if (!row) return;
    const id = row.dataset.id;
    const k = row.dataset.k;
    if (bar) {
      A.seleccionar(bar.dataset.id);
      return;
    }
    const act = e.target.closest('[data-act]');
    if (act) {
      const a = act.dataset.act;
      if (a === 'tog') {
        if (E.ui.exp.has(id)) E.ui.exp.delete(id);
        else E.ui.exp.add(id);
        guardarUI();
        A.render();
        return;
      }
      if (a === 'tick') {
        const t = E.idx.get(id).o;
        A.mutar(() => {
          t.st = t.st === 'done' ? 'todo' : 'done';
        });
        if (E.ui.sel === id) A.renderPanel();
        return;
      }
      if (a === 'add') {
        if (k === 'area') A.agregarProyecto(id);
        else A.agregarTarea(id);
        return;
      }
      if (a === 'up' || a === 'down') {
        pasoOrden(id, a === 'up' ? -1 : 1);
        return;
      }
    }
    A.seleccionar(id);
  });
  canvas.addEventListener('dblclick', (e) => {
    const row = e.target.closest('.row');
    if (!row || e.target.closest('[data-act]:not([data-act="sel"])') || e.target.closest('.bar')) return;
    if (row.dataset.k !== 'task') {
      const id = row.dataset.id;
      if (E.ui.exp.has(id)) E.ui.exp.delete(id);
      else E.ui.exp.add(id);
      guardarUI();
      A.render();
    }
  });

  arrastrarFilas();
  arrastrarBarras();
}

export function pasoOrden(id, dir) {
  let r = null;
  A.mutar(() => {
    r = moverPaso(E.plan, id, dir);
    if (r !== 'ok') throw new Silencio();
  });
  if (r === 'primero') A.toast('Ya está primera');
  else if (r === 'ultimo') A.toast('Ya está última');
  else mostrarFila(id);
}

/* ───────── arrastrar filas para cambiar la prioridad ───────── */

function arrastrarFilas() {
  let marcada = null;
  const limpiar = () => {
    if (marcada) marcada.classList.remove('dz-before', 'dz-after', 'dz-into');
    marcada = null;
  };
  hacerArrastrable(canvas, {
    asa: '.grip',
    espera: () => 0,
    umbral: 4,
    desplazables: () => [gantt],
    margenIzq: () => 0,
    iniciar(el, e) {
      const row = el.closest('.row');
      if (!row) return null;
      const lc = row.querySelector('.lc');
      const fan = crearFantasma(lc, 'fila');
      fan.el.querySelectorAll('.acts').forEach((x) => x.remove());
      const r = lc.getBoundingClientRect();
      fan.dx = e.clientX - r.left;
      fan.dy = e.clientY - r.top;
      row.classList.add('dragging');
      return { id: row.dataset.id, k: row.dataset.k, row, fan, destino: null };
    },
    mover(s, p) {
      moverFantasma(s.fan, p.x, p.y);
      limpiar();
      s.destino = null;
      const bajo = document.elementFromPoint(p.x, p.y);
      const row = bajo && bajo.closest && bajo.closest('#canvas .row');
      if (!row || row.dataset.id === s.id) return;
      const r = row.getBoundingClientRect();
      const pos = posicionDeSoltar(s.k, row.dataset.k, (p.y - r.top) / r.height);
      if (!pos) return;
      row.classList.add('dz-' + pos);
      marcada = row;
      s.destino = { id: row.dataset.id, pos };
    },
    soltar(s) {
      limpiar();
      s.fan.el.remove();
      s.row.classList.remove('dragging');
      if (!s.destino) return;
      let abrir = null;
      const ok = A.mutar(() => {
        abrir = moverA(E.plan, s.id, s.destino.id, s.destino.pos, { alPrincipio: E.ui.exp.has(s.destino.id) });
        if (!abrir) throw new Silencio();
      });
      if (!ok) return;
      abrir.forEach((x) => E.ui.exp.add(x));
      guardarUI();
      A.render();
      A.toast('Movida');
      if (E.ui.sel === s.id) A.renderPanel();
    },
    cancelar(s) {
      limpiar();
      s.fan.el.remove();
      s.row.classList.remove('dragging');
    },
  });
}

/* ───────── arrastrar barras: mover o estirar ───────── */

function arrastrarBarras() {
  const xContenido = (x) => x - canvas.getBoundingClientRect().left;
  hacerArrastrable(canvas, {
    asa: '.bar',
    // Con el dedo: la barra elegida se mueve enseguida; las demás, con pulsación larga (así deslizar desplaza).
    espera: (el, e) => (e.pointerType === 'touch' && !el.classList.contains('sel') ? 380 : 0),
    umbral: 4,
    desplazables: () => [gantt],
    margenIzq: () => lwPx(),
    iniciar(el, e) {
      const t = E.idx.get(el.dataset.id)?.o;
      if (!t) return null;
      const h = e.target.closest('.h');
      const tactilSinElegir = e.pointerType === 'touch' && !el.classList.contains('sel');
      const modo = h && !tactilSinElegir ? h.dataset.h : 'm';
      el.classList.add('drag');
      return { t, el, modo, x0: xContenido(e.clientX), s: dn(t.s), e: dn(t.e), ns: dn(t.s), ne: dn(t.e) };
    },
    mover(s, p) {
      const dd = Math.round((xContenido(p.x) - s.x0) / PPD);
      const hito = s.t.ty === 'hito';
      const r = fechasArrastradas(s.s, s.e, hito ? 'm' : s.modo, dd);
      s.ns = r.s;
      s.ne = hito ? r.s : r.e;
      s.el.style.left = (s.ns - R.s) * PPD + (hito ? PPD / 2 : 0) + 'px';
      if (!hito) s.el.style.width = Math.max((s.ne - s.ns + 1) * PPD, 6) + 'px';
      tipEl.hidden = false;
      tipEl.textContent = hito ? fechaCorta(s.ns) : `${fechaCorta(s.ns)} → ${fechaCorta(s.ne)} · ${dias(s.ne - s.ns + 1)}`;
      const tw = tipEl.offsetWidth;
      tipEl.style.left = Math.max(8, Math.min(p.x - tw / 2, innerWidth - tw - 8)) + 'px';
      tipEl.style.top = Math.max(8, p.y - 52) + 'px';
    },
    soltar(s) {
      tipEl.hidden = true;
      s.el.classList.remove('drag');
      if (s.ns === s.s && s.ne === s.e) {
        A.render();
        return;
      }
      A.mutar(() => ponerFechas(s.t, isoDe(s.ns), isoDe(s.ne)), null);
      if (E.ui.sel === s.t.id) A.renderPanel();
    },
    cancelar() {
      tipEl.hidden = true;
      A.render();
    },
  });
}

