// Telar · punto de entrada. Une el modelo (código puro), la capa de datos (dispositivo) y la pantalla.

import { E, A, reindexar, cargarUI, guardarUI, ponerNivel, Silencio } from './ui/estado.js';
import { $, $$, esc, toast, dialogo, descargar, haceCuanto } from './ui/util.js';
import { ic } from './ui/iconos.js';
import * as cronograma from './ui/cronograma.js';
import * as tablero from './ui/tablero.js';
import * as panel from './ui/panel.js';
import * as primer from './ui/primer-minuto.js';
import { registrarSW } from './ui/registro-sw.js';
import { crearAlmacenIndexedDB, crearAlmacenMemoria } from './datos/almacen.js';
import { crearRepositorio } from './datos/repositorio.js';
import { crearHistorial } from './modelo/historial.js';
import { planVacio, crearArea, crearProyecto, crearTarea, proyectoDe, moverPaso, desplazar } from './modelo/plan.js';
import { planEjemplo } from './modelo/ejemplo.js';
import { leerCopia, aJSON, aCSV, ErrorDeCopia } from './modelo/formato.js';
import { numeros } from './modelo/vista.js';
import { isoDe, hoyLocal, dn } from './modelo/fechas.js';
import { VERSION } from './version.js';

const historial = crearHistorial({ tope: 200 });
let repo = null;
let tipoAlmacen = 'indexeddb';
let pedidoPersistir = false;
let promptInstalar = null;

/* ───────── cambios, deshacer y guardado ───────── */

function mutar(fn, clave = null) {
  const foto = JSON.stringify(E.plan);
  try {
    fn();
  } catch (e) {
    E.plan = JSON.parse(foto);
    reindexar();
    if (!(e instanceof Silencio)) {
      console.error(e);
      toast('No se pudo hacer el cambio: ' + (e && e.message ? e.message : e));
    }
    return false;
  }
  historial.antes(foto, clave);
  reindexar();
  cambio();
  pedirPersistencia();
  return true;
}

function cambio(conPanel = false) {
  render();
  if (conPanel) panel.render();
  guardar();
}

function guardar() {
  if (repo) repo.guardar(E.plan, E.meta);
}

function deshacer() {
  const p = historial.deshacer(E.plan);
  if (!p) return;
  E.plan = p;
  reindexar();
  if (E.ui.sel && !E.idx.has(E.ui.sel)) E.ui.sel = null;
  cambio(true);
  toast('Cambio deshecho');
}
function rehacer() {
  const p = historial.rehacer(E.plan);
  if (!p) return;
  E.plan = p;
  reindexar();
  if (E.ui.sel && !E.idx.has(E.ui.sel)) E.ui.sel = null;
  cambio(true);
  toast('Cambio rehecho');
}

/** Pide al navegador que no borre los datos si falta espacio (MDN: Storage API). Una vez, tras el primer cambio. */
function pedirPersistencia() {
  if (pedidoPersistir || !navigator.storage || !navigator.storage.persist) return;
  pedidoPersistir = true;
  navigator.storage.persist().catch(() => {});
}

/* ───────── dibujo ───────── */

function render() {
  if (E.ui.view === 'board') tablero.render();
  else cronograma.render();
  sincronizarControles();
  numerosArriba();
  primer.renderAviso();
  puntoDelMenu();
  document.body.classList.toggle('plan-vacio', !E.plan.areas.length);
}

function sincronizarControles() {
  const u = E.ui;
  const marcar = (sel, v) => $$(sel + ' button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
  marcar('#segLevel', u.level);
  marcar('#segView', u.view);
  marcar('#segGroup', u.group);
  marcar('#segPer', u.per);
  marcar('#segZoom', u.zoom);
  const bd = u.view === 'board';
  $('#gantt').hidden = bd;
  $('#board').hidden = !bd;
  for (const id of ['#grpLevel', '#grpZoom', '#today']) $(id).hidden = bd;
  for (const id of ['#grpGroup', '#grpArea', '#grpPer']) $(id).hidden = !bd;
  $('#bDay').hidden = u.per === 'todo';
  $('#bDay').value = isoDe(tablero.diaDeReferencia());
  $('#foco').setAttribute('aria-pressed', String(u.foco));
  $('#undo').disabled = !historial.puedeDeshacer;
  $('#redo').disabled = !historial.puedeRehacer;
  const buscando = document.body.classList.contains('buscando') || !!u.q || u.fst !== 'all';
  document.body.classList.toggle('buscando', buscando);
  $('#btnBuscar').setAttribute('aria-expanded', String(buscando));
}

function numerosArriba() {
  const n = numeros(E.plan, E.hoy);
  $('#stats').innerHTML = n.total
    ? `<span><b>${n.total}</b> ${n.total === 1 ? 'tarea' : 'tareas'}</span><span class="nh"><b>${n.enCurso}</b> en curso</span><span class="nh"><b>${n.hechas}</b> ${n.hechas === 1 ? 'hecha' : 'hechas'} (${n.pct}%)</span>${n.corridas ? `<span class="late"><b>${n.corridas}</b> ${n.corridas === 1 ? 'se corrió' : 'se corrieron'}</span>` : ''}`
    : '<span>Tu año de un vistazo</span>';
}

const ESTADO_GUARDADO = {
  load: 'Abriendo…',
  pendiente: 'Guardando…',
  guardando: 'Guardando…',
  guardado: 'Guardado en este dispositivo',
  error: 'No se pudo guardar: descargá una copia',
  memoria: 'Sin almacenamiento: descargá una copia antes de cerrar',
};
function estadoGuardado(s) {
  const st = tipoAlmacen === 'memoria' && s === 'guardado' ? 'memoria' : s;
  const el = $('#save');
  el.dataset.s = st;
  $('#saveTxt').textContent = ESTADO_GUARDADO[st] || '';
  el.title = ESTADO_GUARDADO[st] || '';
  el.setAttribute('aria-label', ESTADO_GUARDADO[st] || '');
}

function necesitaCopia() {
  if (E.plan.ejemplo || E.plan.tasks.length < 3) return false;
  const u = E.meta.ultimaCopia;
  return !u || E.hoy - dn(u.slice(0, 10)) > 14;
}
function puntoDelMenu() {
  $('#menuPunto').hidden = !necesitaCopia();
}

/* ───────── altas ───────── */

function seleccionar(id, { detalle = true } = {}) {
  E.ui.sel = id;
  E.ui.detalle = detalle;
  render();
  panel.render(false);
}

function proyectoDeContexto() {
  const it = E.ui.sel && E.idx.get(E.ui.sel);
  if (!it) return null;
  if (it.k === 'task') return proyectoDe(E.plan, it.o);
  if (it.k === 'proj') return it.o;
  return E.plan.projects.find((p) => p.a === it.o.id) || null;
}

function agregarTarea(proyId = null, estado = null, inicio = null) {
  const p = (proyId && E.idx.get(proyId)?.o) || proyectoDeContexto() || E.plan.projects[0];
  if (!p) {
    if (E.ui.view !== 'gantt') {
      E.ui.view = 'gantt';
      guardarUI();
      render();
    }
    toast('Primero armá un proyecto');
    const n = $('#pp-nombre');
    if (n) n.focus();
    return;
  }
  const s = inicio ? dn(inicio) : E.hoy;
  let id;
  mutar(() => {
    id = crearTarea(E.plan, p.id, { s: isoDe(s), e: isoDe(s + 6), st: estado || 'todo' });
    E.ui.exp.add(p.id);
    E.ui.exp.add(p.a);
  });
  E.ui.sel = id;
  E.ui.detalle = true;
  guardarUI();
  render();
  panel.render(true);
  cronograma.mostrarFila(id);
}

function agregarProyecto(areaId = null) {
  const it = E.ui.sel && E.idx.get(E.ui.sel);
  const a = areaId || (it && (it.k === 'area' ? it.o.id : it.k === 'proj' ? it.o.a : proyectoDe(E.plan, it.o)?.a)) || E.plan.areas[0]?.id;
  if (!a) {
    agregarArea();
    return;
  }
  let id;
  mutar(() => {
    id = crearProyecto(E.plan, a);
    E.ui.exp.add(a);
  });
  E.ui.sel = id;
  E.ui.detalle = true;
  guardarUI();
  render();
  panel.render(true);
  cronograma.mostrarFila(id);
}

function agregarArea() {
  let id;
  mutar(() => {
    id = crearArea(E.plan);
    E.ui.exp.add(id);
  });
  E.ui.sel = id;
  E.ui.detalle = true;
  if (E.ui.view !== 'gantt') E.ui.view = 'gantt';
  guardarUI();
  render();
  panel.render(true);
  cronograma.mostrarFila(id);
}

function crearPrimerProyecto({ nombre, area, color, fecha }) {
  let pid;
  mutar(() => {
    delete E.plan.ejemplo;
    const aid = crearArea(E.plan, { n: area, color });
    pid = crearProyecto(E.plan, aid, { n: nombre });
    if (fecha) crearTarea(E.plan, pid, { n: 'Fecha meta', s: fecha, ty: 'hito', star: true });
    E.ui.exp.add(aid);
    E.ui.exp.add(pid);
  });
  E.ui.view = 'gantt';
  E.ui.sel = pid;
  E.ui.detalle = true;
  guardarUI();
  render();
  panel.render(false);
  toast('Proyecto creado. Ahora sumale tareas.');
  const b = $('#panel [data-act="add"]');
  if (b) b.focus();
}

function borrarEjemplo() {
  mutar(() => {
    E.plan = planVacio();
  });
  E.ui.sel = null;
  E.ui.view = 'gantt';
  guardarUI();
  render();
  panel.render();
  toast('Ejemplo borrado', { texto: 'Deshacer', fn: deshacer });
  const n = $('#pp-nombre');
  if (n) n.focus({ preventScroll: true });
}

function verEjemplo() {
  mutar(() => {
    E.plan = planEjemplo(E.hoy);
  });
  ponerNivel('proyectos');
  E.ui.exp.add('ej-p1');
  guardarUI();
  render();
  requestAnimationFrame(() => cronograma.irAHoy(false));
}

/* ───────── copias de seguridad ───────── */

async function exportar() {
  if (repo) await repo.ahora();
  descargar(`telar-${isoDe(E.hoy)}.json`, aJSON(E.plan), 'application/json');
  E.meta.ultimaCopia = new Date().toISOString();
  guardar();
  puntoDelMenu();
  toast('Copia descargada. Guardala donde guardes tus archivos.');
}

function exportarCSV() {
  descargar(`telar-${isoDe(E.hoy)}.csv`, aCSV(E.plan), 'text/csv;charset=utf-8');
  toast('Planilla descargada');
}

async function leerArchivo(f) {
  let res;
  try {
    res = leerCopia(await f.text(), { hoy: E.hoy });
  } catch (e) {
    await dialogo('No se pudo restaurar', `<p>${esc(e instanceof ErrorDeCopia ? e.message : 'No se pudo leer el archivo.')}</p>`);
    return;
  }
  const { plan, origen, avisos } = res;
  const de = origen === 'plan-maestro' ? 'una copia de Plan Maestro' : 'una copia de Telar';
  const cuerpo = `<p>Es ${de} con ${plan.areas.length} ${plan.areas.length === 1 ? 'área' : 'áreas'}, ${plan.projects.length} ${plan.projects.length === 1 ? 'proyecto' : 'proyectos'} y ${plan.tasks.length} ${plan.tasks.length === 1 ? 'tarea' : 'tareas'}. Va a reemplazar lo que hay ahora en Telar; si te arrepentís, tocá «Deshacer».</p>${avisos.length ? `<ul>${avisos.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}`;
  const ok = await dialogo('Restaurar copia', cuerpo, [
    { texto: 'Cancelar', valor: false },
    { texto: 'Reemplazar', valor: true, primario: true },
  ]);
  if (!ok) return;
  mutar(() => {
    E.plan = plan;
  });
  E.ui.sel = null;
  ponerNivel(E.ui.level === 'areas' ? 'proyectos' : E.ui.level);
  render();
  panel.render();
  toast(origen === 'plan-maestro' ? 'Listo: tus datos de Plan Maestro ya están en Telar' : 'Copia restaurada', { texto: 'Deshacer', fn: deshacer });
  requestAnimationFrame(() => cronograma.irAHoy(false));
}

async function copiasDelDispositivo() {
  const copias = repo ? await repo.listarCopias() : [];
  if (!copias.length) {
    await dialogo('Copias de este dispositivo', '<p>Telar guarda sola una copia por día de las últimas 7 jornadas en que la abriste. Todavía no hay ninguna: aparece mañana.</p>');
    return;
  }
  const filasT = copias
    .map((c, i) => `<tr><td>${esc(new Date(c.dia + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }))}</td><td>${c.plan.tasks.length} tareas</td><td><button class="btn" data-copia="${i}">Volver a esta</button></td></tr>`)
    .join('');
  const elegida = await dialogo(
    'Copias de este dispositivo',
    `<p>Una por día, las últimas 7. Volver a una reemplaza el plan actual (se puede deshacer).</p><table>${filasT}</table>`,
    [{ texto: 'Cerrar', valor: null }],
    (m, cerrar) =>
      m.addEventListener('click', (e) => {
        const b = e.target.closest('[data-copia]');
        if (b) cerrar(+b.dataset.copia);
      }),
  );
  if (elegida === null || elegida === undefined) return;
  const c = copias[elegida];
  mutar(() => {
    E.plan = leerCopia({ app: 'telar', formato: c.formato || 1, plan: c.plan }).plan;
  });
  E.ui.sel = null;
  render();
  panel.render();
  toast('Volviste a la copia del ' + c.dia.split('-').reverse().join('/'), { texto: 'Deshacer', fn: deshacer });
}

/* ───────── menú ───────── */

const TEMAS = { auto: 'Automático', light: 'Claro', dark: 'Oscuro' };
function temaActual() {
  try {
    return localStorage.getItem('telar-tema') || 'auto';
  } catch {
    return 'auto';
  }
}
function ponerTema(t) {
  try {
    if (t === 'auto') localStorage.removeItem('telar-tema');
    else localStorage.setItem('telar-tema', t);
  } catch {
    /* sin almacenamiento: dura hasta cerrar */
  }
  if (t === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
}

function armarMenu() {
  const ult = haceCuanto(E.meta.ultimaCopia, E.hoy);
  const alerta = necesitaCopia();
  const t = temaActual();
  $('#pop').innerHTML = `
    <button data-m="area" role="menuitem">${ic.area}Nueva área</button>
    <button data-m="proyecto" role="menuitem">${ic.plus}Nuevo proyecto</button>
    <hr>
    <button data-m="json" role="menuitem">${ic.instalar}Descargar copia de seguridad</button>
    <div class="nota${alerta ? ' alerta' : ''}">${ult ? `Última copia en archivo: ${ult}.` : 'Todavía no descargaste ninguna copia.'}</div>
    <button data-m="importar" role="menuitem">${ic.subir}Restaurar desde un archivo…</button>
    <div class="nota">Acepta copias de Telar y de Plan Maestro.</div>
    <button data-m="copias" role="menuitem">${ic.copias}Copias de este dispositivo…</button>
    <button data-m="csv" role="menuitem">${ic.tabla}Descargar para Excel (CSV)</button>
    <hr>
    <button data-m="tema" role="menuitem">${ic.sol}Tema: ${TEMAS[t]}</button>
    <button data-m="atajos" role="menuitem">${ic.teclado}Atajos de teclado</button>
    ${promptInstalar ? `<button data-m="instalar" role="menuitem">${ic.instalar}Instalar Telar</button>` : ''}
    <hr>
    <div class="nota">Tus datos quedan en este dispositivo. Versión ${esc(VERSION)}.</div>`;
}

async function accionMenu(m) {
  if (m === 'area') agregarArea();
  else if (m === 'proyecto') agregarProyecto();
  else if (m === 'json') exportar();
  else if (m === 'csv') exportarCSV();
  else if (m === 'importar') $('#file').click();
  else if (m === 'copias') copiasDelDispositivo();
  else if (m === 'tema') {
    const orden = ['auto', 'light', 'dark'];
    const sig = orden[(orden.indexOf(temaActual()) + 1) % 3];
    ponerTema(sig);
    toast('Tema: ' + TEMAS[sig]);
  } else if (m === 'atajos') atajos();
  else if (m === 'instalar' && promptInstalar) {
    promptInstalar.prompt();
    promptInstalar = null;
  }
}

function atajos() {
  const f = (k, d) => `<tr><td>${k}</td><td>${d}</td></tr>`;
  dialogo(
    'Atajos de teclado',
    `<table>${[
      f('<kbd>N</kbd>', 'Nueva tarea'),
      f('<kbd>/</kbd>', 'Buscar'),
      f('<kbd>Ctrl</kbd> <kbd>Z</kbd>', 'Deshacer'),
      f('<kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Z</kbd>', 'Rehacer'),
      f('<kbd>Alt</kbd> <kbd>↑</kbd> <kbd>↓</kbd>', 'Subir o bajar lo elegido (prioridad)'),
      f('<kbd>Alt</kbd> <kbd>←</kbd> <kbd>→</kbd>', 'Correr la tarea un día (con <kbd>Shift</kbd>, una semana)'),
      f('<kbd>T</kbd>', 'Ir a hoy'),
      f('<kbd>Esc</kbd>', 'Cerrar el detalle'),
    ].join('')}</table>`,
  );
}

/* ───────── controles de arriba ───────── */

function montarControles() {
  $('#segView').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    E.ui.view = b.dataset.v;
    guardarUI();
    render();
    if (E.ui.view === 'gantt') requestAnimationFrame(() => cronograma.irAHoy(false));
  });
  $('#segLevel').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    ponerNivel(b.dataset.v);
    render();
  });
  $('#segZoom').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) cronograma.ponerZoom(b.dataset.v);
  });
  $('#segGroup').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    E.ui.group = b.dataset.v;
    guardarUI();
    render();
  });
  $('#segPer').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    E.ui.per = b.dataset.v;
    guardarUI();
    render();
  });
  $('#bDay').addEventListener('change', (e) => {
    const v = e.target.value;
    if (!v) return;
    E.ui.bday = v === isoDe(E.hoy) ? '' : v;
    guardarUI();
    render();
  });
  $('#bArea').addEventListener('change', (e) => {
    E.ui.barea = e.target.value;
    if (E.ui.barea && E.ui.group === 'area') E.ui.group = 'proyecto';
    guardarUI();
    render();
  });
  $('#today').addEventListener('click', () => cronograma.irAHoy());
  $('#undo').addEventListener('click', deshacer);
  $('#redo').addEventListener('click', rehacer);
  $('#addTask').addEventListener('click', () => agregarTarea());
  $('#fab').addEventListener('click', () => agregarTarea());
  let qT;
  $('#q').addEventListener('input', (e) => {
    clearTimeout(qT);
    qT = setTimeout(() => {
      E.ui.q = e.target.value.trim();
      render();
    }, 120);
  });
  $('#fst').addEventListener('change', (e) => {
    E.ui.fst = e.target.value;
    render();
  });
  $('#foco').addEventListener('click', () => {
    E.ui.foco = !E.ui.foco;
    render();
  });
  $('#btnBuscar').addEventListener('click', () => {
    const abierto = document.body.classList.toggle('buscando');
    if (!abierto) {
      E.ui.q = '';
      E.ui.fst = 'all';
      $('#q').value = '';
      $('#fst').value = 'all';
      render();
    } else {
      sincronizarControles();
      $('#q').focus();
    }
  });
  const pop = $('#pop');
  const menuBtn = $('#menuBtn');
  const cerrarMenu = () => {
    pop.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
  };
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (pop.hidden) {
      armarMenu();
      pop.hidden = false;
      menuBtn.setAttribute('aria-expanded', 'true');
      pop.querySelector('button').focus();
    } else cerrarMenu();
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu')) cerrarMenu();
  });
  pop.addEventListener('click', (e) => {
    const b = e.target.closest('[data-m]');
    if (!b) return;
    cerrarMenu();
    accionMenu(b.dataset.m);
  });
  pop.addEventListener('keydown', (e) => {
    const bs = $$('#pop button');
    const i = bs.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      bs[(i + 1) % bs.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      bs[(i - 1 + bs.length) % bs.length].focus();
    } else if (e.key === 'Escape') {
      cerrarMenu();
      menuBtn.focus();
    }
  });
  $('#file').addEventListener('change', (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (f) leerArchivo(f);
  });
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    promptInstalar = e;
  });
}

function teclado(e) {
  const escribiendo = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName || '') || e.target.isContentEditable;
  if ($('.modal')) return;
  if (e.key === 'Escape') {
    if (!$('#pop').hidden) return;
    if (E.ui.sel) {
      E.ui.sel = null;
      render();
      panel.render();
    }
    return;
  }
  const mod = e.ctrlKey || e.metaKey;
  if (mod && !escribiendo && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    if (e.shiftKey) rehacer();
    else deshacer();
    return;
  }
  if (mod && !escribiendo && e.key.toLowerCase() === 'y') {
    e.preventDefault();
    rehacer();
    return;
  }
  if (escribiendo || mod) return;
  if (e.altKey && E.ui.sel && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    const it = E.idx.get(E.ui.sel);
    if (!it) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const dir = e.key === 'ArrowUp' ? -1 : 1;
      let r;
      mutar(() => {
        r = moverPaso(E.plan, it.o.id, dir);
        if (r !== 'ok') throw new Silencio();
      });
      if (r !== 'ok') toast(r === 'primero' ? 'Ya está primera' : 'Ya está última');
      cronograma.mostrarFila(it.o.id);
    } else if (it.k === 'task') {
      const k = (e.key === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 7 : 1);
      mutar(() => desplazar(it.o, k), 'tecla' + it.o.id);
      panel.render();
    }
    return;
  }
  if (e.altKey) return;
  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    agregarTarea();
  } else if (e.key === '/') {
    e.preventDefault();
    document.body.classList.add('buscando');
    sincronizarControles();
    $('#q').focus();
  } else if ((e.key === 't' || e.key === 'T') && E.ui.view === 'gantt') {
    cronograma.irAHoy();
  } else if (e.key === '?') atajos();
}

/* ───────── arranque ───────── */

async function abrirDatos() {
  let almacen = crearAlmacenIndexedDB();
  try {
    await almacen.leer();
  } catch {
    almacen = crearAlmacenMemoria();
    tipoAlmacen = 'memoria';
  }
  repo = crearRepositorio({
    almacen,
    alEstado: estadoGuardado,
    alCambioExterno: (doc) => {
      E.plan = doc.plan;
      E.meta = doc.meta || {};
      reindexar();
      historial.limpiar();
      if (E.ui.sel && !E.idx.has(E.ui.sel)) E.ui.sel = null;
      render();
      panel.render();
      toast('Se actualizó con lo que cambiaste en otra ventana');
    },
  });
  let doc = null;
  try {
    doc = await repo.cargar();
  } catch {
    doc = null;
  }
  return doc;
}

async function arrancar() {
  const habiaUI = cargarUI();
  Object.assign(A, {
    mutar,
    render,
    renderPanel: (foco) => panel.render(foco),
    seleccionar,
    toast,
    agregarTarea,
    agregarProyecto,
    importar: () => $('#file').click(),
    crearPrimerProyecto,
    verEjemplo,
    borrarEjemplo,
    deshacer,
    cortarHistorial: () => historial.cortar(),
  });
  cronograma.montar();
  tablero.montar();
  panel.montar();
  primer.montar();
  montarControles();
  document.addEventListener('keydown', teclado);
  estadoGuardado('load');

  const doc = await abrirDatos();
  if (doc && doc.plan) {
    // Lo guardado se revisa igual que una copia: un dato roto nunca deja la app en blanco.
    try {
      E.plan = leerCopia({ app: 'telar', formato: doc.formato || 1, plan: doc.plan }, { hoy: E.hoy }).plan;
    } catch {
      E.plan = planVacio();
    }
    E.meta = doc.meta || {};
    reindexar();
    if (!habiaUI) ponerNivel('proyectos');
    estadoGuardado('guardado');
  } else {
    // Primera vez: el ejemplo «Tu 2027», guardado enseguida para que recargar no lo cambie.
    E.plan = planEjemplo(E.hoy);
    reindexar();
    ponerNivel('proyectos');
    E.ui.exp.add('ej-p1');
    E.ui.view = 'gantt';
    guardarUI();
    guardar();
  }
  render();
  requestAnimationFrame(() => cronograma.irAHoy(false));

  const params = new URLSearchParams(location.search);
  if (params.has('nueva')) {
    history.replaceState(null, '', location.pathname);
    agregarTarea();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (repo) repo.ahora();
    } else {
      const h = hoyLocal();
      if (h !== E.hoy) {
        E.hoy = h;
        render();
      }
    }
  });
  window.addEventListener('pagehide', () => repo && repo.ahora());

  registrarSW({
    alHaberNueva: (activar) =>
      toast(
        'Hay una versión nueva de Telar',
        {
          texto: 'Actualizar',
          fn: async () => {
            if (repo) await repo.ahora();
            activar();
          },
        },
        10 * 60 * 1000,
      ),
  });
}

arrancar();

// Para las pruebas automáticas (sin datos personales: es el mismo plan que se ve en pantalla).
window.__telar = { E, repo: () => repo, historial };
