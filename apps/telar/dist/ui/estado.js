// Estado compartido de la pantalla. El plan vive acá; cada cambio pasa por A.mutar (deshacer + guardar).

import { planVacio, indexar } from '../modelo/plan.js';
import { hoyLocal } from '../modelo/fechas.js';

const CLAVE_UI = 'telar-ui-v1';

export const E = {
  plan: planVacio(),
  idx: new Map(),
  hoy: hoyLocal(),
  ui: {
    view: 'gantt', // 'gantt' | 'board'
    group: 'estado', // columnas del tablero
    barea: '', // tablero de un área
    per: 'todo', // período del tablero
    bday: '', // día de referencia del tablero ('' = hoy)
    zoom: 'mes', // 'pan' | 'mes' | 'sem' | 'dia'
    level: 'proyectos', // 'areas' | 'proyectos' | 'tareas'
    exp: new Set(), // áreas y proyectos abiertos
    sel: null, // id elegido
    detalle: true, // en el celular: false = barra elegida con la píldora; true = hoja de detalle abierta
    q: '',
    fst: 'all',
    foco: false,
  },
  /** Datos del documento guardado que no son el plan (última copia en archivo, etc.). */
  meta: {},
};

/** Acciones que registra app.js (así los módulos no se importan en círculo). */
export const A = {
  mutar: (_fn, _clave) => false,
  render: () => {},
  renderPanel: (_foco) => {},
  seleccionar: (_id) => {},
  toast: (_msg, _accion) => {},
  agregarTarea: (_proyId, _estado) => {},
  agregarProyecto: (_areaId) => {},
  importar: () => {},
  crearPrimerProyecto: (_datos) => {},
  verEjemplo: () => {},
};

/** Para cancelar un cambio a mitad de camino sin mostrar error ni dejar una foto en el historial. */
export class Silencio extends Error {}

export const reindexar = () => {
  E.idx = indexar(E.plan);
};

export function cargarUI() {
  try {
    const u = JSON.parse(localStorage.getItem(CLAVE_UI) || 'null');
    if (!u) return false;
    for (const k of ['view', 'group', 'barea', 'per', 'bday', 'zoom', 'level']) if (typeof u[k] === 'string') E.ui[k] = u[k];
    if (Array.isArray(u.exp)) E.ui.exp = new Set(u.exp);
    return true;
  } catch {
    return false;
  }
}

export function guardarUI() {
  const u = E.ui;
  try {
    localStorage.setItem(CLAVE_UI, JSON.stringify({ view: u.view, group: u.group, barea: u.barea, per: u.per, bday: u.bday, zoom: u.zoom, level: u.level, exp: [...u.exp] }));
  } catch {
    /* sin almacenamiento: la vista vuelve a la de fábrica, los datos no se tocan */
  }
}

/** Abre áreas y proyectos según el nivel elegido. */
export function ponerNivel(v) {
  E.ui.level = v;
  E.ui.exp = new Set();
  if (v !== 'areas') E.plan.areas.forEach((a) => E.ui.exp.add(a.id));
  if (v === 'tareas') E.plan.projects.forEach((p) => E.ui.exp.add(p.id));
  guardarUI();
}
