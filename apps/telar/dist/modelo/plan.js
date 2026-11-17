// El plan: áreas → proyectos → tareas. Código puro (sin pantalla ni almacenamiento) para poder probarlo.
//
// Forma (formato 1, la misma que Plan Maestro para mudar los datos sin traducir):
//   plan = { areas: [Área], projects: [Proyecto], tasks: [Tarea], ejemplo?: true }
//   Área     = { id, n: nombre, color: '#rrggbb' }
//   Proyecto = { id, a: id del área, n, dept?: subtítulo }
//   Tarea    = { id, p: id del proyecto, n, s: inicio ISO, e: fin ISO, ty: 'tarea'|'hito'|'habito',
//                st: 'todo'|'doing'|'done', star?: bool, note?: texto, links?: [{ t, u }] }
// La prioridad es el orden dentro de cada lista: arriba = más importante.

import { dn, isoDe, inicioMes, finMes, inicioSemana } from './fechas.js';

export const ESTADOS = ['todo', 'doing', 'done'];
export const TIPOS = ['tarea', 'hito', 'habito'];
export const PALETA = ['#2f6fed', '#7c4dff', '#12a37f', '#e8860c', '#0e9aa7', '#b5539f', '#e0527a', '#b08a00', '#6b7a8f', '#c2410c'];
export const GRIS = '#667085';

export const planVacio = () => ({ areas: [], projects: [], tasks: [] });

let contador = 0;
/** Id corto y único: prefijo + tiempo + azar (a = área, p = proyecto, k = tarea). */
export const nuevoId = (prefijo) =>
  prefijo + Date.now().toString(36) + (contador++ % 1296).toString(36).padStart(2, '0') + Math.random().toString(36).slice(2, 5);

/** Índice id → { k: 'area'|'proj'|'task', o: objeto }. */
export function indexar(plan) {
  const idx = new Map();
  for (const o of plan.areas) idx.set(o.id, { k: 'area', o });
  for (const o of plan.projects) idx.set(o.id, { k: 'proj', o });
  for (const o of plan.tasks) idx.set(o.id, { k: 'task', o });
  return idx;
}

export const areaDe = (plan, proyecto) => plan.areas.find((a) => a.id === proyecto.a) || null;
export const proyectoDe = (plan, tarea) => plan.projects.find((p) => p.id === tarea.p) || null;
export const colorDeTarea = (plan, tarea) => {
  const p = proyectoDe(plan, tarea);
  const a = p && areaDe(plan, p);
  return a ? a.color : GRIS;
};

/** «Se corrió»: no es hábito, no está hecha y su fin ya pasó (antes se decía «vencida»; principio 8: nunca culpa). */
export const seCorrio = (t, hoy) => t.ty !== 'habito' && t.st !== 'done' && dn(t.e) < hoy;

const listaDe = (plan, k) => (k === 'task' ? plan.tasks : k === 'proj' ? plan.projects : plan.areas);

/* ───────── altas y bajas ───────── */

export function crearArea(plan, { id = nuevoId('a'), n = 'Nueva área', color } = {}) {
  plan.areas.push({ id, n, color: color || PALETA[plan.areas.length % PALETA.length] });
  return id;
}

export function crearProyecto(plan, areaId, { id = nuevoId('p'), n = 'Nuevo proyecto', dept } = {}) {
  if (!plan.areas.some((a) => a.id === areaId)) throw new Error('El área no existe');
  const p = { id, a: areaId, n };
  if (dept) p.dept = dept;
  // Va al final de los proyectos de su área (no al final de todo), para que el orden se lea igual que en pantalla.
  const ult = ultimoIndice(plan.projects, (x) => x.a === areaId);
  plan.projects.splice(ult < 0 ? plan.projects.length : ult + 1, 0, p);
  return id;
}

export function crearTarea(plan, proyectoId, { id = nuevoId('k'), n = 'Nueva tarea', s, e, ty = 'tarea', st = 'todo', star = false } = {}) {
  if (!plan.projects.some((p) => p.id === proyectoId)) throw new Error('El proyecto no existe');
  if (!s) throw new Error('Falta la fecha de inicio');
  const t = { id, p: proyectoId, n, s, e: ty === 'hito' ? s : e || s, ty, st, star: !!star };
  if (dn(t.e) < dn(t.s)) t.e = t.s;
  const ult = ultimoIndice(plan.tasks, (x) => x.p === proyectoId);
  plan.tasks.splice(ult < 0 ? plan.tasks.length : ult + 1, 0, t);
  return id;
}

function ultimoIndice(arr, f) {
  for (let i = arr.length - 1; i >= 0; i--) if (f(arr[i])) return i;
  return -1;
}

/** Borra un elemento y todo lo que cuelga de él. Devuelve cuántas tareas se fueron. */
export function eliminar(plan, id) {
  const antes = plan.tasks.length;
  if (plan.tasks.some((t) => t.id === id)) {
    plan.tasks = plan.tasks.filter((t) => t.id !== id);
  } else if (plan.projects.some((p) => p.id === id)) {
    plan.tasks = plan.tasks.filter((t) => t.p !== id);
    plan.projects = plan.projects.filter((p) => p.id !== id);
  } else if (plan.areas.some((a) => a.id === id)) {
    const ps = new Set(plan.projects.filter((p) => p.a === id).map((p) => p.id));
    plan.tasks = plan.tasks.filter((t) => !ps.has(t.p));
    plan.projects = plan.projects.filter((p) => p.a !== id);
    plan.areas = plan.areas.filter((a) => a.id !== id);
  } else return -1;
  return antes - plan.tasks.length;
}

export function duplicarTarea(plan, id, nid = nuevoId('k')) {
  const t = plan.tasks.find((x) => x.id === id);
  if (!t) return null;
  const c = structuredClone(t);
  c.id = nid;
  c.n = t.n + ' (copia)';
  plan.tasks.splice(plan.tasks.indexOf(t) + 1, 0, c);
  return nid;
}

/* ───────── prioridad (orden) ───────── */

/** Hermanos: las tareas del mismo proyecto, los proyectos de la misma área o todas las áreas. */
export function hermanos(plan, id) {
  const it = indexar(plan).get(id);
  if (!it) return [];
  const arr = listaDe(plan, it.k);
  if (it.k === 'task') return arr.filter((t) => t.p === it.o.p);
  if (it.k === 'proj') return arr.filter((p) => p.a === it.o.a);
  return arr.slice();
}

/** Sube (dir = -1) o baja (dir = 1) un lugar entre sus hermanos. Devuelve 'ok', 'primero' o 'ultimo'. */
export function moverPaso(plan, id, dir) {
  const it = indexar(plan).get(id);
  if (!it) return null;
  const sb = hermanos(plan, id);
  const i = sb.indexOf(it.o);
  const j = i + dir;
  if (j < 0) return 'primero';
  if (j >= sb.length) return 'ultimo';
  const arr = listaDe(plan, it.k);
  arr.splice(arr.indexOf(it.o), 1);
  const ti = arr.indexOf(sb[j]);
  arr.splice(dir < 0 ? ti : ti + 1, 0, it.o);
  return 'ok';
}

export function alTope(plan, id) {
  const it = indexar(plan).get(id);
  if (!it) return null;
  const sb = hermanos(plan, id);
  if (sb[0] === it.o) return 'primero';
  const arr = listaDe(plan, it.k);
  arr.splice(arr.indexOf(it.o), 1);
  arr.splice(arr.indexOf(sb[0]), 0, it.o);
  return 'ok';
}

/**
 * Dónde cae lo que se arrastra sobre una fila del cronograma.
 * fy = posición vertical del puntero dentro de la fila (0 arriba, 1 abajo).
 * Una tarea cae antes o después de otra tarea, o dentro de un proyecto; un proyecto, junto a otro o dentro de un área.
 */
export function posicionDeSoltar(kArrastrado, kDestino, fy) {
  const lado = fy < 0.5 ? 'before' : 'after';
  if (kArrastrado === 'task') return kDestino === 'task' ? lado : kDestino === 'proj' ? 'into' : null;
  if (kArrastrado === 'proj') return kDestino === 'proj' ? lado : kDestino === 'area' ? 'into' : null;
  if (kArrastrado === 'area') return kDestino === 'area' ? lado : null;
  return null;
}

/**
 * Mueve un elemento antes, después o dentro de otro. Si cambia de proyecto o de área, se lo lleva.
 * alPrincipio: al soltar dentro de un proyecto abierto, la tarea va primera (como se ve); si no, última.
 * Devuelve la lista de ids que conviene expandir para ver dónde quedó, o null si no se pudo.
 */
export function moverA(plan, id, destinoId, pos, { alPrincipio = false } = {}) {
  if (id === destinoId) return null;
  const idx = indexar(plan);
  const it = idx.get(id);
  const tg = idx.get(destinoId);
  if (!it || !tg) return null;
  // Antes o después: solo entre iguales (tarea con tarea…). Dentro: solo en el contenedor de su nivel.
  const permitido = posicionDeSoltar(it.k, tg.k, 0);
  if (pos === 'into' ? permitido !== 'into' : permitido !== 'before') return null;
  const arr = listaDe(plan, it.k);
  const o = it.o;
  arr.splice(arr.indexOf(o), 1);
  const expandir = [];
  if (pos === 'before' || pos === 'after') {
    const ti = arr.indexOf(tg.o);
    arr.splice(pos === 'before' ? ti : ti + 1, 0, o);
    if (it.k === 'task') o.p = tg.o.p;
    if (it.k === 'proj') o.a = tg.o.a;
  } else if (it.k === 'task') {
    const mem = arr.filter((t) => t.p === destinoId);
    if (alPrincipio && mem.length) arr.splice(arr.indexOf(mem[0]), 0, o);
    else if (mem.length) arr.splice(arr.indexOf(mem[mem.length - 1]) + 1, 0, o);
    else arr.push(o);
    o.p = destinoId;
    expandir.push(destinoId, tg.o.a);
  } else {
    const mem = arr.filter((p) => p.a === destinoId);
    if (mem.length) arr.splice(arr.indexOf(mem[mem.length - 1]) + 1, 0, o);
    else arr.push(o);
    o.a = destinoId;
    expandir.push(destinoId);
  }
  return expandir;
}

/* ───────── fechas de una tarea ───────── */

/**
 * Arrastrar una barra: modo 'm' mueve, 'l' estira desde el inicio, 'r' desde el fin. dd = días.
 * Devuelve las fechas nuevas como números de día; nunca deja el fin antes del inicio.
 */
export function fechasArrastradas(s, e, modo, dd) {
  if (modo === 'm') return { s: s + dd, e: e + dd };
  if (modo === 'l') return { s: Math.min(s + dd, e), e };
  return { s, e: Math.max(e + dd, s) };
}

/** Corre la tarea k días conservando su duración. */
export function desplazar(t, k) {
  t.s = isoDe(dn(t.s) + k);
  t.e = isoDe(dn(t.e) + k);
}

/** Pone fechas nuevas; una fecha clave dura un día y el fin nunca queda antes del inicio. */
export function ponerFechas(t, s, e) {
  t.s = s;
  t.e = t.ty === 'hito' ? s : dn(e) < dn(s) ? s : e;
}

/** Cambia el inicio conservando la duración. */
export function cambiarInicio(t, s) {
  const dur = dn(t.e) - dn(t.s);
  t.s = s;
  t.e = t.ty === 'hito' ? s : isoDe(dn(s) + dur);
}

export function cambiarTipo(t, ty) {
  const antes = t.ty;
  t.ty = ty;
  if (ty === 'hito') t.e = t.s;
  else if (antes === 'hito' && t.e === t.s) t.e = isoDe(dn(t.s) + 6);
}

/* ───────── tablero ───────── */

/**
 * Mueve una tarjeta del tablero a una columna (y, si se da, antes o después de otra tarjeta).
 * grupo: 'estado' | 'area' | 'proyecto'; clave: el estado, el id del área o el del proyecto de la columna.
 */
export function moverTarjeta(plan, id, grupo, clave, destinoId = null, pos = 'after') {
  const t = plan.tasks.find((x) => x.id === id);
  if (!t) return { ok: false, aviso: 'No encontré la tarea' };
  let np = t.p;
  let nst = t.st;
  if (grupo === 'estado') {
    if (!ESTADOS.includes(clave)) return { ok: false };
    nst = clave;
  } else if (grupo === 'proyecto') {
    if (!plan.projects.some((p) => p.id === clave)) return { ok: false };
    np = clave;
  } else {
    const actual = proyectoDe(plan, t);
    if (!actual || actual.a !== clave) {
      const p = plan.projects.find((x) => x.a === clave);
      if (!p) return { ok: false, aviso: 'Esta área todavía no tiene proyectos' };
      np = p.id;
    }
  }
  const enCol = (x) => {
    if (grupo === 'estado') return x.st === clave;
    if (grupo === 'proyecto') return x.p === clave;
    const p = proyectoDe(plan, x);
    return !!p && p.a === clave;
  };
  plan.tasks.splice(plan.tasks.indexOf(t), 1);
  t.p = np;
  t.st = nst;
  const destino = destinoId && destinoId !== id ? plan.tasks.find((x) => x.id === destinoId) : null;
  if (destino) {
    const ti = plan.tasks.indexOf(destino);
    plan.tasks.splice(pos === 'before' ? ti : ti + 1, 0, t);
  } else {
    const ult = ultimoIndice(plan.tasks, enCol);
    if (ult < 0) plan.tasks.push(t);
    else plan.tasks.splice(ult + 1, 0, t);
  }
  return { ok: true };
}

/* ───────── rango del cronograma ───────── */

/** Desde el primer día del mes de lo más viejo (o 3 semanas antes de hoy) hasta fin del mes de lo último (+ 4 meses). */
export function rango(plan, hoy) {
  let mn = hoy - 21;
  let mx = hoy + 120;
  for (const t of plan.tasks) {
    mn = Math.min(mn, dn(t.s));
    mx = Math.max(mx, dn(t.e));
  }
  return { s: inicioMes(mn), e: finMes(mx + 14) };
}

/** Ventana del período del tablero: día, semana (lunes a domingo) o mes del día de referencia. */
export function ventanaDePeriodo(periodo, ref) {
  if (periodo === 'dia') return [ref, ref];
  if (periodo === 'sem') {
    const l = inicioSemana(ref);
    return [l, l + 6];
  }
  if (periodo === 'mes') return [inicioMes(ref), finMes(ref)];
  return null;
}
