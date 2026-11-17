// Panel de detalle (a la derecha en la computadora; hoja desde abajo en el celular).

import { E, A, guardarUI } from './estado.js';
import { $, esc } from './util.js';
import { ic } from './iconos.js';
import { dn, isoDe, fechaCorta, dias, esISO } from '../modelo/fechas.js';
import { seCorrio, proyectoDe, areaDe, PALETA, GRIS, desplazar, cambiarInicio, ponerFechas, cambiarTipo, alTope, duplicarTarea, eliminar } from '../modelo/plan.js';
import { pasoOrden, mostrarFila } from './cronograma.js';

let panel;
let armT;

const opcionesProyecto = (sel) =>
  E.plan.areas
    .map((a) => `<optgroup label="${esc(a.n)}">${E.plan.projects.filter((p) => p.a === a.id).map((p) => `<option value="${p.id}"${p.id === sel ? ' selected' : ''}>${esc(p.n)}</option>`).join('')}</optgroup>`)
    .join('');
const opcionesArea = (sel) => E.plan.areas.map((a) => `<option value="${a.id}"${a.id === sel ? ' selected' : ''}>${esc(a.n)}</option>`).join('');

const ordenHTML = () =>
  `<div class="row2"><button class="btn" data-act="up">${ic.up}Subir</button><button class="btn" data-act="down">${ic.down}Bajar</button><button class="btn" data-act="top">${ic.top}Al tope</button></div>`;

const angosto = window.matchMedia('(max-width: 760px)');
let pildora;

/** Celular con una barra elegida: una píldora abajo (nombre, fechas, Detalle, Hecha, cerrar) en vez de la hoja. */
function renderPildora(it) {
  if (!it || it.k !== 'task' || !angosto.matches || E.ui.detalle) {
    pildora.hidden = true;
    pildora.innerHTML = '';
    return false;
  }
  const t = it.o;
  const p = proyectoDe(E.plan, t);
  const a = p ? areaDe(E.plan, p) : null;
  const s = dn(t.s);
  const e = dn(t.e);
  pildora.style.setProperty('--c', a ? a.color : GRIS);
  pildora.innerHTML = `<div class="tx"><b>${esc(t.n)}</b><small>${t.ty === 'hito' ? 'Fecha clave · ' + fechaCorta(s) : `${fechaCorta(s)} → ${fechaCorta(e)} · ${dias(e - s + 1)}`}</small></div>
    <button class="btn" data-pil="detalle">Detalle</button>
    <button class="btn icono" data-pil="hecha" aria-pressed="${t.st === 'done'}" aria-label="${t.st === 'done' ? 'Marcar como pendiente' : 'Marcar como hecha'}" title="Hecha">${ic.check}</button>
    <button class="btn icono" data-pil="cerrar" aria-label="Dejar de elegir">${ic.x}</button>`;
  pildora.setAttribute('aria-label', `Tarea elegida: ${t.n}. Arrastrá la barra para moverla o sus puntas para estirarla.`);
  pildora.hidden = false;
  return true;
}

export function render(foco = false) {
  const it = E.ui.sel && E.idx.get(E.ui.sel);
  const conPildora = renderPildora(it);
  document.body.classList.toggle('con-hoja', !!it && !conPildora && angosto.matches);
  if (!it || conPildora) {
    panel.hidden = true;
    panel.innerHTML = '';
    return;
  }
  panel.hidden = false;
  const o = it.o;
  let c;
  let miga;
  let cuerpo = `<div><label class="l" for="f-name">Nombre</label><input class="field name" id="f-name" value="${esc(o.n)}" autocomplete="off" enterkeyhint="done"></div>`;
  if (it.k === 'task') {
    const p = proyectoDe(E.plan, o);
    const a = p ? areaDe(E.plan, p) : null;
    c = a ? a.color : GRIS;
    miga = `<b style="--c:${c}"></b>${esc(a ? a.n : '')} › ${esc(p ? p.n : '')}`;
    const s = dn(o.s);
    const e = dn(o.e);
    const late = seCorrio(o, E.hoy);
    cuerpo += `
    <div><span class="l" id="l-st">Estado</span><div class="seg" id="p-st" role="group" aria-labelledby="l-st">
      ${[['todo', 'Pendiente'], ['doing', 'En curso'], ['done', 'Hecha']].map(([v, l]) => `<button data-v="${v}" aria-pressed="${o.st === v}">${l}</button>`).join('')}</div></div>
    <div><span class="l" id="l-ty">Tipo</span><div class="seg" id="p-ty" role="group" aria-labelledby="l-ty">
      ${[['tarea', 'Tarea'], ['hito', 'Fecha clave'], ['habito', 'Hábito']].map(([v, l]) => `<button data-v="${v}" aria-pressed="${o.ty === v}">${l}</button>`).join('')}</div>
      <div class="hint" style="margin-top:5px">${o.ty === 'hito' ? 'Un día puntual: una entrega, un examen, un vencimiento.' : o.ty === 'habito' ? 'Algo que se repite en el tiempo (se ve rayado).' : 'Trabajo con inicio y fin.'}</div></div>
    <div><span class="l">Fechas</span>
      <div class="two"><input class="field" type="date" id="f-s" value="${o.s}" aria-label="${o.ty === 'hito' ? 'Día' : 'Inicio'}">
      ${o.ty === 'hito' ? '<div></div>' : `<input class="field" type="date" id="f-e" value="${o.e}" aria-label="Fin">`}</div>
      <div class="row2" style="margin-top:6px"><button class="btn" data-act="shift" data-d="-7">◀ 1 semana</button><button class="btn" data-act="shift" data-d="7">1 semana ▶</button><button class="btn" data-act="start-today">Empezar hoy</button></div>
      <div class="dur${late ? ' late' : ''}">${o.ty === 'hito' ? fechaCorta(s) : `${dias(e - s + 1)} · ${fechaCorta(s)} → ${fechaCorta(e)}`}${late ? ' · se corrió: movela o marcala hecha' : ''}</div></div>
    <div><span class="l">Prioridad</span>
      <div class="row2"><button class="btn" data-act="star" aria-pressed="${!!o.star}">${o.star ? ic.star + 'En foco' : ic.starLinea + 'Poner en foco'}</button></div>
      <div style="margin-top:6px">${ordenHTML()}</div></div>
    <div><label class="l" for="f-proj">Proyecto</label><select class="field" id="f-proj" style="width:100%">${opcionesProyecto(o.p)}</select></div>
    <div><label class="l" for="f-note">Notas</label><textarea class="field" id="f-note" placeholder="Detalles, contexto, próximos pasos…">${esc(o.note || '')}</textarea></div>
    <div><span class="l">Enlaces</span>
      <div class="lchips">${(o.links || []).map((l, i) => `<span class="chip"><a href="${esc(l.u)}" target="_blank" rel="noopener noreferrer">${esc(l.t || l.u)}</a><button data-act="rmlink" data-i="${i}" aria-label="Quitar enlace ${esc(l.t || l.u)}">${ic.x}</button></span>`).join('') || '<span class="hint">Sin enlaces</span>'}</div>
      <div class="two" style="margin-top:8px;grid-template-columns:1fr 1.4fr auto"><input class="field" id="l-t" placeholder="Título" aria-label="Título del enlace"><input class="field" id="l-u" placeholder="https://…" inputmode="url" aria-label="Dirección del enlace"><button class="btn" data-act="addlink" aria-label="Agregar enlace">${ic.plus}</button></div></div>
    <div class="row2"><button class="btn primary" data-act="otra">${ic.plus}Otra tarea en este proyecto</button></div>
    <div class="row2"><button class="btn" data-act="dup">Duplicar</button><button class="btn danger" data-act="del">Eliminar</button></div>`;
  } else if (it.k === 'proj') {
    const a = areaDe(E.plan, o);
    c = a ? a.color : GRIS;
    miga = `<b style="--c:${c}"></b>${esc(a ? a.n : '')} › Proyecto`;
    const n = E.plan.tasks.filter((t) => t.p === o.id).length;
    cuerpo += `
    <div><label class="l" for="f-dept">Subtítulo (opcional)</label><input class="field" id="f-dept" value="${esc(o.dept || '')}" placeholder="Ej.: con mi socia, para la facultad"></div>
    <div><label class="l" for="f-area">Área</label><select class="field" id="f-area" style="width:100%">${opcionesArea(o.a)}</select></div>
    <div><span class="l">Orden</span>${ordenHTML()}</div>
    <div class="row2"><button class="btn primary" data-act="add">${ic.plus}Agregar tarea</button><button class="btn danger" data-act="del">Eliminar (${n} ${n === 1 ? 'tarea' : 'tareas'})</button></div>`;
  } else {
    c = o.color;
    miga = `<b style="--c:${c}"></b>Área`;
    const n = E.plan.projects.filter((p) => p.a === o.id).length;
    cuerpo += `
    <div><span class="l">Color</span><div class="row2" style="align-items:center">
      ${PALETA.map((p) => `<button class="swatch" data-act="pal" data-c="${p}" style="--sw:${p}" aria-pressed="${p === o.color}" aria-label="Color ${p}"></button>`).join('')}
      <input type="color" id="f-color" value="${esc(o.color)}" aria-label="Otro color" style="width:44px;height:32px;border:1px solid var(--line);border-radius:8px;background:var(--surface);padding:2px"></div></div>
    <div><span class="l">Orden</span>${ordenHTML()}</div>
    <div class="row2"><button class="btn primary" data-act="add">${ic.plus}Agregar proyecto</button><button class="btn danger" data-act="del">Eliminar (${n} ${n === 1 ? 'proyecto' : 'proyectos'})</button></div>`;
  }
  panel.style.setProperty('--c', c);
  panel.innerHTML = `<div class="ph"><div class="crumb">${miga}</div><button class="btn icono" data-act="close" aria-label="Cerrar el detalle" title="Cerrar (Esc)">${ic.x}</button></div><div class="pb">${cuerpo}</div>`;
  if (foco) {
    const n = $('#f-name');
    if (n) {
      n.focus();
      n.select();
    }
  }
}

function campo(prop, valor) {
  const it = E.idx.get(E.ui.sel);
  if (!it) return;
  A.mutar(() => {
    it.o[prop] = valor;
  }, 'f' + E.ui.sel + prop);
}

export function montar() {
  panel = $('#panel');
  pildora = $('#pildora');
  angosto.addEventListener('change', () => render());
  pildora.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pil]');
    const it = E.ui.sel && E.idx.get(E.ui.sel);
    if (!b || !it) return;
    if (b.dataset.pil === 'detalle') {
      E.ui.detalle = true;
      render(false);
    } else if (b.dataset.pil === 'hecha') {
      A.mutar(() => {
        it.o.st = it.o.st === 'done' ? 'todo' : 'done';
      });
      render();
    } else {
      E.ui.sel = null;
      A.render();
      render();
    }
  });
  panel.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'f-name') campo('n', t.value.trim() ? t.value : 'Sin nombre');
    else if (t.id === 'f-note') campo('note', t.value);
    else if (t.id === 'f-dept') campo('dept', t.value);
    else if (t.id === 'f-color') campo('color', t.value);
  });
  panel.addEventListener('change', (e) => {
    const it = E.ui.sel && E.idx.get(E.ui.sel);
    if (!it) return;
    const t = e.target;
    const o = it.o;
    if (t.id === 'f-s' && esISO(t.value)) {
      A.mutar(() => cambiarInicio(o, t.value));
      render();
    } else if (t.id === 'f-e' && esISO(t.value)) {
      A.mutar(() => ponerFechas(o, o.s, t.value));
      render();
    } else if (t.id === 'f-proj') {
      A.mutar(() => {
        o.p = t.value;
        const p = E.idx.get(t.value).o;
        E.ui.exp.add(p.id);
        E.ui.exp.add(p.a);
      });
      guardarUI();
      render();
    } else if (t.id === 'f-area') {
      A.mutar(() => {
        o.a = t.value;
        E.ui.exp.add(t.value);
      });
      guardarUI();
      render();
    } else if (t.id === 'f-color') render();
  });
  panel.addEventListener('focusout', () => {
    // Al salir de un campo de texto, el próximo cambio es otro paso para deshacer.
    A.cortarHistorial && A.cortarHistorial();
  });
  panel.addEventListener('click', (e) => {
    const it = E.ui.sel && E.idx.get(E.ui.sel);
    const seg = e.target.closest('#p-st button,#p-ty button');
    if (seg && it) {
      const o = it.o;
      const v = seg.dataset.v;
      if (seg.parentElement.id === 'p-st')
        A.mutar(() => {
          o.st = v;
        });
      else A.mutar(() => cambiarTipo(o, v));
      render();
      return;
    }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const a = b.dataset.act;
    if (a === 'close') {
      E.ui.sel = null;
      A.render();
      render();
      return;
    }
    if (!it) return;
    const o = it.o;
    if (a === 'shift') {
      A.mutar(() => desplazar(o, +b.dataset.d));
      render();
    } else if (a === 'start-today') {
      A.mutar(() => cambiarInicio(o, isoDe(E.hoy)));
      render();
    } else if (a === 'star') {
      A.mutar(() => {
        o.star = !o.star;
      });
      render();
    } else if (a === 'up' || a === 'down') {
      pasoOrden(o.id, a === 'up' ? -1 : 1);
    } else if (a === 'top') {
      let r;
      A.mutar(() => {
        r = alTope(E.plan, o.id);
      });
      A.toast(r === 'primero' ? 'Ya está primera' : 'Quedó primera');
      mostrarFila(o.id);
    } else if (a === 'add') {
      if (it.k === 'area') A.agregarProyecto(o.id);
      else A.agregarTarea(o.id);
    } else if (a === 'otra') {
      A.agregarTarea(o.p);
    } else if (a === 'dup') {
      let nid;
      A.mutar(() => {
        nid = duplicarTarea(E.plan, o.id);
      });
      A.seleccionar(nid);
    } else if (a === 'pal') {
      A.mutar(() => {
        o.color = b.dataset.c;
      });
      render();
    } else if (a === 'rmlink') {
      A.mutar(() => {
        o.links.splice(+b.dataset.i, 1);
      });
      render();
    } else if (a === 'addlink') {
      const u = $('#l-u').value.trim();
      const tt = $('#l-t').value.trim();
      if (!u) {
        $('#l-u').focus();
        return;
      }
      const url = /^https?:\/\//i.test(u) ? u : 'https://' + u;
      if (/\s/.test(url)) {
        A.toast('La dirección no puede tener espacios');
        return;
      }
      A.mutar(() => {
        (o.links = o.links || []).push({ t: tt || url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40), u: url });
      });
      render();
    } else if (a === 'del') {
      if (b.classList.contains('arm')) {
        const nombre = o.n;
        A.mutar(() => eliminar(E.plan, o.id));
        E.ui.sel = null;
        A.render();
        render();
        A.toast(`Se eliminó «${nombre}»`, { texto: 'Deshacer', fn: () => A.deshacer() });
      } else {
        b.classList.add('arm');
        b.textContent = '¿Seguro? Tocá de nuevo';
        clearTimeout(armT);
        armT = setTimeout(() => render(), 3500);
      }
    }
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.target.id === 'l-u' || e.target.id === 'l-t')) {
      e.preventDefault();
      panel.querySelector('[data-act="addlink"]').click();
    }
    if (e.key === 'Enter' && e.target.id === 'f-name') {
      e.preventDefault();
      e.target.blur();
    }
  });
}
