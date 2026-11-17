// Copia de seguridad en archivo: exportar, importar y mudar desde Plan Maestro.
//
// Archivo de Telar (formato 1):
//   { "app": "telar", "formato": 1, "exportado": "2026-11-17T12:00:00.000Z", "plan": { areas, projects, tasks, ejemplo? } }
// Plan Maestro guarda { areas, projects, tasks } suelto (y en su base, además rev, by y savedAt): también se acepta.
// Todo lo que entra se revisa (sanear): ids repetidos, fechas imposibles, colores, enlaces que no son web.

import { esISO, dn, isoDe, hoyLocal } from './fechas.js';
import { ESTADOS, TIPOS, PALETA, nuevoId } from './plan.js';

export const APP = 'telar';
export const FORMATO = 1;

export class ErrorDeCopia extends Error {}

/** Documento listo para guardar en archivo. */
export function documentoDeCopia(plan, ahora = new Date()) {
  return { app: APP, formato: FORMATO, exportado: ahora.toISOString(), plan: limpiarParaGuardar(plan) };
}

export const aJSON = (plan, ahora) => JSON.stringify(documentoDeCopia(plan, ahora), null, 1);

/** Solo los campos conocidos, en un orden estable. */
function limpiarParaGuardar(plan) {
  const out = {
    areas: plan.areas.map(({ id, n, color }) => ({ id, n, color })),
    projects: plan.projects.map(({ id, a, n, dept }) => (dept ? { id, a, n, dept } : { id, a, n })),
    tasks: plan.tasks.map((t) => {
      const x = { id: t.id, p: t.p, n: t.n, s: t.s, e: t.e, ty: t.ty, st: t.st, star: !!t.star };
      if (t.note) x.note = t.note;
      if (t.links && t.links.length) x.links = t.links.map(({ t: tt, u }) => ({ t: tt, u }));
      return x;
    }),
  };
  if (plan.ejemplo) out.ejemplo = true;
  return out;
}

/**
 * Lee una copia (texto u objeto). Devuelve { plan, origen: 'telar'|'plan-maestro', avisos: [texto] }.
 * Si no es una copia válida, lanza ErrorDeCopia con un mensaje para la persona.
 */
export function leerCopia(entrada, { hoy = hoyLocal() } = {}) {
  let d = entrada;
  if (typeof entrada === 'string') {
    try {
      d = JSON.parse(entrada.replace(/^﻿/, ''));
    } catch {
      throw new ErrorDeCopia('El archivo no es una copia del plan (no se pudo leer como JSON).');
    }
  }
  if (!d || typeof d !== 'object') throw new ErrorDeCopia('El archivo no es una copia del plan.');
  let crudo;
  let origen;
  if (d.app === APP) {
    if (typeof d.formato !== 'number' || d.formato < 1) throw new ErrorDeCopia('La copia no dice su versión de formato.');
    if (d.formato > FORMATO) throw new ErrorDeCopia('Esta copia es de una versión más nueva de Telar. Actualizá la app y volvé a probar.');
    crudo = migrar(d.plan, d.formato);
    origen = 'telar';
  } else if (Array.isArray(d.areas) && Array.isArray(d.projects) && Array.isArray(d.tasks)) {
    crudo = d; // Plan Maestro (archivo descargado o lo que guardaba su base)
    origen = 'plan-maestro';
  } else {
    throw new ErrorDeCopia('El archivo no parece una copia de Telar ni de Plan Maestro.');
  }
  if (!crudo || !Array.isArray(crudo.areas) || !Array.isArray(crudo.projects) || !Array.isArray(crudo.tasks)) {
    throw new ErrorDeCopia('A la copia le faltan las áreas, los proyectos o las tareas.');
  }
  const { plan, avisos } = sanear(crudo, { hoy });
  return { plan, origen, avisos };
}

/**
 * Pasos entre formatos. Hoy hay uno solo; cuando llegue el 2 (por ejemplo, horas por tarea en el corte 1) se suma
 * acá un paso «1 → 2» y FORMATO pasa a 2. Una copia vieja siempre se puede abrir en una app nueva.
 */
const PASOS = {
  // 1: (plan) => ({ ...plan, tasks: plan.tasks.map((t) => ({ ...t, h: null })) }),
};
function migrar(plan, desde) {
  let p = plan;
  for (let v = desde; v < FORMATO; v++) p = PASOS[v](p);
  return p;
}

const texto = (v, porDefecto) => {
  const s = typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '';
  return s ? s.slice(0, 500) : porDefecto;
};
const esColor = (c) => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const tieneId = (v) => (typeof v === 'string' && v.trim() !== '') || typeof v === 'number';
const esWeb = (u) => typeof u === 'string' && /^https?:\/\/[^\s]+$/i.test(u.trim());

/** Revisa y repara un plan que viene de afuera. Nunca tira error por un dato suelto: lo arregla y avisa. */
export function sanear(crudo, { hoy = hoyLocal() } = {}) {
  const avisos = [];
  const usados = new Set();
  const idUnico = (v, prefijo) => {
    let id = typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '';
    if (!id || usados.has(id)) id = nuevoId(prefijo);
    usados.add(id);
    return id;
  };
  let reparados = 0;

  const areas = [];
  const mapaArea = new Map(); // id original → id final (si se repitió, el segundo recibe uno nuevo)
  for (const a of crudo.areas) {
    if (!a || typeof a !== 'object') continue;
    const id = idUnico(a.id, 'a');
    if (tieneId(a.id) && !mapaArea.has(String(a.id))) mapaArea.set(String(a.id), id);
    areas.push({ id, n: texto(a.n, 'Área sin nombre'), color: esColor(a.color) ? a.color.toLowerCase() : PALETA[areas.length % PALETA.length] });
  }

  let areaHuerfana = null;
  const areaParaHuerfanos = () => {
    if (!areaHuerfana) {
      areaHuerfana = { id: idUnico(null, 'a'), n: 'Sin área', color: '#6b7a8f' };
      areas.push(areaHuerfana);
    }
    return areaHuerfana.id;
  };

  const projects = [];
  const mapaProy = new Map();
  let proyectosSinArea = 0;
  for (const p of crudo.projects) {
    if (!p || typeof p !== 'object') continue;
    const id = idUnico(p.id, 'p');
    if (tieneId(p.id) && !mapaProy.has(String(p.id))) mapaProy.set(String(p.id), id);
    let a = mapaArea.get(String(p.a));
    if (!a) {
      a = areaParaHuerfanos();
      proyectosSinArea++;
    }
    const x = { id, a, n: texto(p.n, 'Proyecto sin nombre') };
    const dept = texto(p.dept, '');
    if (dept) x.dept = dept;
    projects.push(x);
  }

  let proyHuerfano = null;
  const proyectoParaHuerfanas = () => {
    if (!proyHuerfano) {
      proyHuerfano = { id: idUnico(null, 'p'), a: areaParaHuerfanos(), n: 'Sin proyecto' };
      projects.push(proyHuerfano);
    }
    return proyHuerfano.id;
  };

  const tasks = [];
  let tareasSinProyecto = 0;
  let enlacesQuitados = 0;
  for (const t of crudo.tasks) {
    if (!t || typeof t !== 'object') continue;
    const id = idUnico(t.id, 'k');
    let p = mapaProy.get(String(t.p));
    if (!p) {
      p = proyectoParaHuerfanas();
      tareasSinProyecto++;
    }
    const ty = TIPOS.includes(t.ty) ? t.ty : 'tarea';
    const st = ESTADOS.includes(t.st) ? t.st : 'todo';
    let s = esISO(t.s) ? t.s : null;
    let e = esISO(t.e) ? t.e : null;
    if (!s || !e) reparados++;
    if (!s && !e) s = e = isoDe(hoy);
    else if (!s) s = e;
    else if (!e) e = s;
    if (dn(e) < dn(s)) {
      [s, e] = [e, s];
      reparados++;
    }
    if (ty === 'hito') e = s;
    const x = { id, p, n: texto(t.n, 'Tarea sin nombre'), s, e, ty, st, star: !!t.star };
    const nota = typeof t.note === 'string' ? t.note.slice(0, 20000) : '';
    if (nota) x.note = nota;
    if (Array.isArray(t.links)) {
      const ls = [];
      for (const l of t.links) {
        if (l && esWeb(l.u)) ls.push({ t: texto(l.t, l.u.trim()).slice(0, 120), u: l.u.trim() });
        else enlacesQuitados++;
      }
      if (ls.length) x.links = ls;
    }
    tasks.push(x);
  }

  if (proyectosSinArea) avisos.push(`${proyectosSinArea} ${proyectosSinArea === 1 ? 'proyecto no tenía área: quedó' : 'proyectos no tenían área: quedaron'} en «Sin área».`);
  if (tareasSinProyecto) avisos.push(`${tareasSinProyecto} ${tareasSinProyecto === 1 ? 'tarea no tenía proyecto: quedó' : 'tareas no tenían proyecto: quedaron'} en «Sin proyecto».`);
  if (reparados) avisos.push(`Se arreglaron fechas en ${reparados} ${reparados === 1 ? 'tarea' : 'tareas'}.`);
  if (enlacesQuitados) avisos.push(`Se quitaron ${enlacesQuitados} ${enlacesQuitados === 1 ? 'enlace que no era' : 'enlaces que no eran'} una dirección web.`);

  const plan = { areas, projects, tasks };
  if (crudo.ejemplo === true) plan.ejemplo = true;
  return { plan, avisos };
}

/** Planilla para Excel o Google Sheets (con BOM para que Excel lea bien las tildes). */
export function aCSV(plan) {
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const TIPO = { tarea: 'Tarea', hito: 'Fecha clave', habito: 'Hábito' };
  const EST = { todo: 'Pendiente', doing: 'En curso', done: 'Hecha' };
  const filas = [['Prioridad', 'Área', 'Proyecto', 'Tarea', 'Tipo', 'Estado', 'Inicio', 'Fin', 'Foco', 'Notas', 'Enlaces']];
  let i = 0;
  for (const a of plan.areas)
    for (const p of plan.projects.filter((x) => x.a === a.id))
      for (const t of plan.tasks.filter((x) => x.p === p.id))
        filas.push([++i, a.n, p.n, t.n, TIPO[t.ty] || t.ty, EST[t.st] || t.st, t.s, t.e, t.star ? 'sí' : '', t.note || '', (t.links || []).map((l) => l.u).join(' ')]);
  return '﻿' + filas.map((r) => r.map(q).join(',')).join('\r\n');
}
