// Qué se ve: filas del cronograma, columnas del tablero y números de la barra de arriba. Puro: sin DOM.

import { dn } from './fechas.js';
import { seCorrio, proyectoDe, areaDe, ventanaDePeriodo, GRIS } from './plan.js';

/** filtro = { q: texto, estado: 'all'|'todo'|'doing'|'done'|'late', foco: bool } */
export const filtrando = (f) => !!(f.q || f.foco || (f.estado && f.estado !== 'all'));

export function coincide(t, f, hoy) {
  if (f.foco && !t.star) return false;
  if (f.estado === 'late') {
    if (!seCorrio(t, hoy)) return false;
  } else if (f.estado && f.estado !== 'all' && t.st !== f.estado) return false;
  if (f.q) {
    const q = normalizar(f.q);
    if (!normalizar(t.n).includes(q) && !normalizar(t.note || '').includes(q)) return false;
  }
  return true;
}

/** Minúsculas y sin tildes: «mudanza» encuentra «Mudanza» y «reunion» encuentra «reunión». */
export const normalizar = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Filas del cronograma en orden: área, sus proyectos y sus tareas.
 * abiertos: Set con los ids de áreas y proyectos expandidos. Con filtro, todo se abre y se ocultan las ramas vacías.
 */
export function filas(plan, abiertos, filtro, hoy) {
  const f = filtrando(filtro);
  const res = [];
  for (const a of plan.areas) {
    const ps = plan.projects
      .filter((p) => p.a === a.id)
      .map((p) => {
        const todas = plan.tasks.filter((t) => t.p === p.id);
        return { p, todas, vistas: f ? todas.filter((t) => coincide(t, filtro, hoy)) : todas };
      });
    const visibles = f ? ps.filter((x) => x.vistas.length) : ps;
    if (f && !visibles.length) continue;
    const abierta = f || abiertos.has(a.id);
    res.push({ k: 'area', o: a, todas: ps.flatMap((x) => x.todas), abierta, d: 0, c: a.color });
    if (!abierta) continue;
    for (const x of visibles) {
      const pa = f || abiertos.has(x.p.id);
      res.push({ k: 'proj', o: x.p, todas: x.todas, abierta: pa, d: 1, c: a.color });
      if (pa) for (const t of x.vistas) res.push({ k: 'task', o: t, d: 2, c: a.color });
    }
  }
  return res;
}

/** Columnas del tablero. vista = { grupo: 'estado'|'area'|'proyecto', area: id o '', periodo, ref } */
export const COLUMNAS_ESTADO = [
  ['todo', 'Pendiente'],
  ['doing', 'En curso'],
  ['done', 'Hecha'],
];

export function columnas(plan, vista, filtro, hoy) {
  const ventana = ventanaDePeriodo(vista.periodo, vista.ref ?? hoy);
  const enPeriodo = (t) => !ventana || (dn(t.s) <= ventana[1] && dn(t.e) >= ventana[0]);
  const f = filtrando(filtro);
  const soloConTareas = f || (vista.periodo && vista.periodo !== 'todo');
  const ba = vista.area || '';
  const queda = (t) => {
    if (!enPeriodo(t)) return false;
    if (f && !coincide(t, filtro, hoy)) return false;
    if (ba) {
      const p = proyectoDe(plan, t);
      return !!p && p.a === ba;
    }
    return true;
  };
  if (vista.grupo === 'estado') {
    return COLUMNAS_ESTADO.map(([clave, n]) => ({ clave, n, c: clave === 'todo' ? GRIS : null, tareas: plan.tasks.filter((t) => t.st === clave && queda(t)) }));
  }
  if (vista.grupo === 'area') {
    return plan.areas
      .filter((a) => !ba || a.id === ba)
      .map((a) => ({
        clave: a.id,
        n: a.n,
        c: a.color,
        abrible: true,
        tareas: plan.tasks.filter((t) => {
          const p = proyectoDe(plan, t);
          return p && p.a === a.id && queda(t);
        }),
      }))
      .filter((c) => !soloConTareas || c.tareas.length);
  }
  return plan.projects
    .filter((p) => !ba || p.a === ba)
    .map((p) => {
      const a = areaDe(plan, p);
      return { clave: p.id, n: p.n, sub: ba ? p.dept || '' : a ? a.n : '', c: a ? a.color : GRIS, tareas: plan.tasks.filter((t) => t.p === p.id && queda(t)) };
    })
    .filter((c) => !soloConTareas || c.tareas.length);
}

export function numeros(plan, hoy) {
  const t = plan.tasks;
  const hechas = t.filter((x) => x.st === 'done').length;
  return {
    total: t.length,
    hechas,
    enCurso: t.filter((x) => x.st === 'doing').length,
    corridas: t.filter((x) => seCorrio(x, hoy)).length,
    pct: t.length ? Math.round((hechas / t.length) * 100) : 0,
  };
}
