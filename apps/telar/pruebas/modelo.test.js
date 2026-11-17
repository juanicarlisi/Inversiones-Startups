// Pruebas del modelo (node --test). Todos los datos son inventados.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { dn, isoDe, esISO, inicioSemana, inicioMes, finMes, fechaCorta, hoyLocal, diaSemana } from '../src/modelo/fechas.js';
import {
  planVacio, crearArea, crearProyecto, crearTarea, eliminar, duplicarTarea, moverPaso, alTope, moverA,
  posicionDeSoltar, fechasArrastradas, desplazar, ponerFechas, cambiarInicio, cambiarTipo, moverTarjeta,
  seCorrio, rango, ventanaDePeriodo, indexar,
} from '../src/modelo/plan.js';
import { filas, columnas, numeros, normalizar } from '../src/modelo/vista.js';
import { crearHistorial } from '../src/modelo/historial.js';
import { leerCopia, aJSON, aCSV, ErrorDeCopia, FORMATO, sanear } from '../src/modelo/formato.js';
import { planEjemplo, anioDelEjemplo } from '../src/modelo/ejemplo.js';

const HOY = dn('2026-11-17'); // martes

/** Plan chico: un área con dos proyectos y cinco tareas. */
function planBase() {
  const p = planVacio();
  crearArea(p, { id: 'a1', n: 'Casa', color: '#2f6fed' });
  crearArea(p, { id: 'a2', n: 'Estudio', color: '#7c4dff' });
  crearProyecto(p, 'a1', { id: 'p1', n: 'Mudanza' });
  crearProyecto(p, 'a1', { id: 'p2', n: 'Pintar' });
  crearProyecto(p, 'a2', { id: 'p3', n: 'Final' });
  crearTarea(p, 'p1', { id: 't1', n: 'Buscar depto', s: '2026-11-10', e: '2026-11-20' });
  crearTarea(p, 'p1', { id: 't2', n: 'Flete', s: '2026-11-21', e: '2026-11-25' });
  crearTarea(p, 'p1', { id: 't3', n: 'Mudarse', s: '2026-12-01', ty: 'hito' });
  crearTarea(p, 'p2', { id: 't4', n: 'Comprar pintura', s: '2026-12-05', e: '2026-12-06' });
  crearTarea(p, 'p3', { id: 't5', n: 'Repasar', s: '2026-11-01', e: '2026-11-10' });
  return p;
}
const ids = (arr) => arr.map((x) => x.id);

/* ───────── fechas ───────── */

test('fechas: ida y vuelta, validez y semanas', () => {
  assert.equal(isoDe(dn('2027-03-05')), '2027-03-05');
  assert.equal(dn('1970-01-02'), 1);
  assert.ok(esISO('2028-02-29'));
  assert.ok(!esISO('2027-02-29'));
  assert.ok(!esISO('2027-2-3'));
  assert.ok(!esISO(null));
  assert.equal(diaSemana(HOY), 2);
  assert.equal(isoDe(inicioSemana(HOY)), '2026-11-16'); // lunes
  assert.equal(isoDe(inicioSemana(dn('2026-11-22'))), '2026-11-16'); // domingo → lunes anterior
  assert.equal(isoDe(inicioMes(HOY)), '2026-11-01');
  assert.equal(isoDe(finMes(dn('2027-02-10'))), '2027-02-28');
  assert.equal(fechaCorta(dn('2026-12-03')), '3 dic');
  // Hoy usa la fecha local del dispositivo, no la UTC.
  assert.equal(isoDe(hoyLocal(new Date(2026, 10, 17, 23, 59))), '2026-11-17');
});

/* ───────── altas, bajas y orden ───────── */

test('crear: proyectos y tareas quedan al final de su grupo, no al final de todo', () => {
  const p = planBase();
  crearProyecto(p, 'a1', { id: 'p9', n: 'Nuevo' });
  assert.deepEqual(ids(p.projects), ['p1', 'p2', 'p9', 'p3']);
  crearTarea(p, 'p1', { id: 't9', n: 'X', s: '2026-11-17', e: '2026-11-18' });
  assert.deepEqual(ids(p.tasks), ['t1', 't2', 't3', 't9', 't4', 't5']);
  // Una fecha clave dura un día; un fin anterior al inicio se corrige.
  assert.equal(p.tasks.find((t) => t.id === 't3').e, '2026-12-01');
  crearTarea(p, 'p1', { id: 't10', s: '2026-11-20', e: '2026-11-01' });
  assert.equal(p.tasks.find((t) => t.id === 't10').e, '2026-11-20');
  assert.throws(() => crearTarea(p, 'nope', { s: '2026-11-20' }));
});

test('eliminar: se lleva lo que cuelga', () => {
  const p = planBase();
  assert.equal(eliminar(p, 't1'), 1);
  assert.equal(eliminar(p, 'p1'), 2);
  assert.equal(eliminar(p, 'a2'), 1);
  assert.deepEqual(ids(p.areas), ['a1']);
  assert.deepEqual(ids(p.projects), ['p2']);
  assert.deepEqual(ids(p.tasks), ['t4']);
  assert.equal(eliminar(p, 'no-existe'), -1);
});

test('duplicar: la copia va justo debajo', () => {
  const p = planBase();
  duplicarTarea(p, 't1', 'c1');
  assert.deepEqual(ids(p.tasks).slice(0, 3), ['t1', 'c1', 't2']);
  assert.equal(p.tasks[1].n, 'Buscar depto (copia)');
});

test('reordenar: subir, bajar y al tope, solo entre hermanos', () => {
  const p = planBase();
  assert.equal(moverPaso(p, 't1', -1), 'primero');
  assert.equal(moverPaso(p, 't3', 1), 'ultimo'); // t4 es de otro proyecto: no cuenta
  assert.equal(moverPaso(p, 't2', -1), 'ok');
  assert.deepEqual(ids(p.tasks).slice(0, 3), ['t2', 't1', 't3']);
  assert.equal(alTope(p, 't3'), 'ok');
  assert.deepEqual(ids(p.tasks).slice(0, 3), ['t3', 't2', 't1']);
  assert.equal(moverPaso(p, 'p2', -1), 'ok');
  assert.deepEqual(ids(p.projects), ['p2', 'p1', 'p3']);
  assert.equal(moverPaso(p, 'a2', -1), 'ok');
  assert.deepEqual(ids(p.areas), ['a2', 'a1']);
});

test('mover arrastrando: dónde se puede soltar', () => {
  assert.equal(posicionDeSoltar('task', 'task', 0.2), 'before');
  assert.equal(posicionDeSoltar('task', 'task', 0.7), 'after');
  assert.equal(posicionDeSoltar('task', 'proj', 0.7), 'into');
  assert.equal(posicionDeSoltar('task', 'area', 0.5), null);
  assert.equal(posicionDeSoltar('proj', 'area', 0.1), 'into');
  assert.equal(posicionDeSoltar('area', 'proj', 0.1), null);
});

test('mover arrastrando: entre tareas, a otro proyecto y dentro de un proyecto', () => {
  const p = planBase();
  // t5 (Final) antes de t2 (Mudanza): cambia de proyecto.
  assert.deepEqual(moverA(p, 't5', 't2', 'before'), []);
  assert.deepEqual(ids(p.tasks), ['t1', 't5', 't2', 't3', 't4']);
  assert.equal(p.tasks[1].p, 'p1');
  // t1 dentro de p2 (al final) y con alPrincipio (primera).
  assert.deepEqual(moverA(p, 't1', 'p2', 'into'), ['p2', 'a1']);
  assert.deepEqual(ids(p.tasks.filter((t) => t.p === 'p2')), ['t4', 't1']);
  moverA(p, 't2', 'p2', 'into', { alPrincipio: true });
  assert.deepEqual(ids(p.tasks.filter((t) => t.p === 'p2')), ['t2', 't4', 't1']);
  // Un proyecto a otra área.
  assert.deepEqual(moverA(p, 'p1', 'a2', 'into'), ['a2']);
  assert.equal(p.projects.find((x) => x.id === 'p1').a, 'a2');
  // Lo que no se puede: tarea dentro de un área, área antes de una tarea, sobre sí misma.
  assert.equal(moverA(p, 't4', 'a1', 'into'), null);
  assert.equal(moverA(p, 'a1', 't4', 'before'), null);
  assert.equal(moverA(p, 't4', 't4', 'after'), null);
  assert.equal(moverA(p, 't4', 'p1', 'before'), null);
});

test('barras: mover, estirar y nunca dar vuelta', () => {
  const s = dn('2026-11-10');
  const e = dn('2026-11-20');
  assert.deepEqual(fechasArrastradas(s, e, 'm', 3), { s: s + 3, e: e + 3 });
  assert.deepEqual(fechasArrastradas(s, e, 'l', -2), { s: s - 2, e });
  assert.deepEqual(fechasArrastradas(s, e, 'l', 40), { s: e, e }); // el inicio no pasa al fin
  assert.deepEqual(fechasArrastradas(s, e, 'r', -40), { s, e: s });
  const t = { s: '2026-11-10', e: '2026-11-20', ty: 'tarea' };
  desplazar(t, 7);
  assert.deepEqual([t.s, t.e], ['2026-11-17', '2026-11-27']);
  cambiarInicio(t, '2026-12-30');
  assert.deepEqual([t.s, t.e], ['2026-12-30', '2027-01-09']); // conserva 10 días y cruza el año
  ponerFechas(t, '2027-01-10', '2027-01-01');
  assert.equal(t.e, '2027-01-10');
  cambiarTipo(t, 'hito');
  assert.equal(t.e, t.s);
  cambiarTipo(t, 'tarea');
  assert.equal(t.e, '2027-01-16');
});

test('«se corrió»: solo lo no hecho, no hábito, con fin pasado', () => {
  assert.ok(seCorrio({ ty: 'tarea', st: 'todo', e: '2026-11-16' }, HOY));
  assert.ok(!seCorrio({ ty: 'tarea', st: 'todo', e: '2026-11-17' }, HOY));
  assert.ok(!seCorrio({ ty: 'tarea', st: 'done', e: '2026-11-01' }, HOY));
  assert.ok(!seCorrio({ ty: 'habito', st: 'todo', e: '2026-11-01' }, HOY));
});

test('rango y períodos', () => {
  const p = planBase();
  const r = rango(p, HOY);
  assert.equal(isoDe(r.s), '2026-10-01'); // hoy − 21 cae en octubre
  assert.equal(isoDe(r.e), '2027-03-31'); // hoy + 120 + 14 cae en marzo
  assert.deepEqual(ventanaDePeriodo('sem', HOY).map(isoDe), ['2026-11-16', '2026-11-22']);
  assert.deepEqual(ventanaDePeriodo('mes', HOY).map(isoDe), ['2026-11-01', '2026-11-30']);
  assert.equal(ventanaDePeriodo('todo', HOY), null);
});

/* ───────── tablero ───────── */

test('tablero: mover tarjetas cambia estado, proyecto o área', () => {
  const p = planBase();
  assert.ok(moverTarjeta(p, 't1', 'estado', 'doing').ok);
  assert.equal(p.tasks.find((t) => t.id === 't1').st, 'doing');
  assert.ok(moverTarjeta(p, 't1', 'proyecto', 'p3', 't5', 'before').ok);
  assert.deepEqual(ids(p.tasks.filter((t) => t.p === 'p3')), ['t1', 't5']);
  assert.ok(moverTarjeta(p, 't5', 'area', 'a1').ok);
  assert.equal(p.tasks.find((t) => t.id === 't5').p, 'p1'); // primer proyecto del área
  const p2 = planBase();
  crearArea(p2, { id: 'a3', n: 'Vacía' });
  assert.deepEqual(moverTarjeta(p2, 't1', 'area', 'a3'), { ok: false, aviso: 'Esta área todavía no tiene proyectos' });
  assert.equal(moverTarjeta(p2, 't1', 'estado', 'cualquiera').ok, false);
});

test('tablero: columnas por estado, por período y con filtro', () => {
  const p = planBase();
  p.tasks[0].st = 'doing';
  const sinFiltro = { q: '', estado: 'all', foco: false };
  const c = columnas(p, { grupo: 'estado', periodo: 'todo' }, sinFiltro, HOY);
  assert.deepEqual(c.map((x) => x.tareas.length), [4, 1, 0]);
  const sem = columnas(p, { grupo: 'estado', periodo: 'sem', ref: HOY }, sinFiltro, HOY);
  assert.deepEqual(sem.map((x) => ids(x.tareas)), [['t2'], ['t1'], []]); // t2 (21 al 25) toca la semana
  const porProy = columnas(p, { grupo: 'proyecto', periodo: 'todo', area: 'a1' }, sinFiltro, HOY);
  assert.deepEqual(porProy.map((x) => x.clave), ['p1', 'p2']);
  const busca = columnas(p, { grupo: 'area', periodo: 'todo' }, { q: 'PINTURA', estado: 'all' }, HOY);
  assert.deepEqual(busca.map((x) => ids(x.tareas)), [['t4']]);
});

/* ───────── vista del cronograma ───────── */

test('filas: niveles, filtros y búsqueda sin tildes', () => {
  const p = planBase();
  const sin = { q: '', estado: 'all', foco: false };
  assert.deepEqual(filas(p, new Set(), sin, HOY).map((r) => r.o.id), ['a1', 'a2']);
  assert.deepEqual(filas(p, new Set(['a1']), sin, HOY).map((r) => r.o.id), ['a1', 'p1', 'p2', 'a2']);
  assert.equal(filas(p, new Set(['a1', 'p1', 'a2', 'p2', 'p3']), sin, HOY).length, 10);
  // Se corrieron: t1? no (termina el 20); t5 sí (terminó el 10).
  assert.deepEqual(filas(p, new Set(), { estado: 'late' }, HOY).map((r) => r.o.id), ['a2', 'p3', 't5']);
  p.tasks[1].note = 'Pedir presupuesto a la mañana';
  assert.deepEqual(filas(p, new Set(), { q: 'mañana' }, HOY).filter((r) => r.k === 'task').map((r) => r.o.id), ['t2']);
  assert.equal(normalizar('Reunión'), 'reunion');
  const n = numeros(p, HOY);
  assert.deepEqual(n, { total: 5, hechas: 0, enCurso: 0, corridas: 1, pct: 0 });
});

/* ───────── deshacer ───────── */

test('historial: deshacer, rehacer y juntar escritura seguida', () => {
  let t = 0;
  const h = crearHistorial({ reloj: () => t });
  let plan = { n: 'a' };
  h.antes(plan, 'nombre');
  plan = { n: 'ab' };
  t = 500;
  h.antes(plan, 'nombre');
  plan = { n: 'abc' };
  t = 5000;
  h.antes(plan, null);
  plan = { n: 'abc!' };
  plan = h.deshacer(plan);
  assert.equal(plan.n, 'abc');
  plan = h.deshacer(plan);
  assert.equal(plan.n, 'a'); // «ab» se juntó con «a»
  assert.equal(h.deshacer(plan), null);
  plan = h.rehacer(plan);
  assert.equal(plan.n, 'abc');
  h.antes(plan, null); // un cambio nuevo borra lo que se podía rehacer
  assert.equal(h.puedeRehacer, false);
  const corto = crearHistorial({ tope: 3 });
  for (let i = 0; i < 10; i++) corto.antes({ i }, null);
  let x = { i: 10 };
  let n = 0;
  while ((x = corto.deshacer(x))) n++;
  assert.equal(n, 3);
});

/* ───────── copia de seguridad ───────── */

test('copia: exportar e importar da el mismo plan', () => {
  const p = planBase();
  p.tasks[0].note = 'Nota con "comillas" y\nsalto';
  p.tasks[0].links = [{ t: 'Portal', u: 'https://ejemplo.com/deptos' }];
  p.tasks[1].star = true;
  const txt = aJSON(p, new Date('2026-11-17T12:00:00Z'));
  const doc = JSON.parse(txt);
  assert.equal(doc.app, 'telar');
  assert.equal(doc.formato, FORMATO);
  const { plan, origen, avisos } = leerCopia(txt, { hoy: HOY });
  assert.equal(origen, 'telar');
  assert.deepEqual(avisos, []);
  assert.deepEqual(plan, JSON.parse(JSON.stringify(doc.plan)));
  assert.deepEqual(ids(plan.tasks), ids(p.tasks));
});

test('copia: mudanza desde Plan Maestro (archivo descargado y lo que guardaba su base)', () => {
  // Así descarga Plan Maestro: { areas, projects, tasks } suelto, con BOM opcional.
  const pm = {
    areas: [{ id: 'a1x', n: 'Facultad', color: '#2F6FED' }, { id: 'a2x', n: 'Trabajo', color: 'rojo' }],
    projects: [{ id: 'p1x', a: 'a1x', n: 'Tesis', dept: 'Posgrado' }, { id: 'p2x', a: 'a9x', n: 'Huérfano' }],
    tasks: [
      { id: 'k1', p: 'p1x', n: 'Marco teórico', s: '2026-11-01', e: '2026-11-30', ty: 'tarea', st: 'doing', star: true, note: 'Leer 5 papers', links: [{ t: 'Drive', u: 'https://drive.example/x' }, { t: 'malo', u: 'javascript:alert(1)' }] },
      { id: 'k2', p: 'p1x', n: 'Entrega', s: '2026-12-15', e: '2026-12-20', ty: 'hito', st: 'todo', star: false },
      { id: 'k3', p: 'pXX', n: 'Sin proyecto', s: '2026-13-01', e: '2026-11-05', ty: 'raro', st: 'raro' },
      { id: 'k1', p: 'p1x', n: 'Id repetido', s: '2026-11-20', e: '2026-11-10', ty: 'tarea', st: 'todo' },
    ],
  };
  const { plan, origen, avisos } = leerCopia('﻿' + JSON.stringify(pm, null, 1), { hoy: HOY });
  assert.equal(origen, 'plan-maestro');
  assert.equal(plan.areas[0].color, '#2f6fed');
  assert.match(plan.areas[1].color, /^#[0-9a-f]{6}$/);
  // El proyecto sin área y la tarea sin proyecto quedan visibles, no se pierden.
  const sinArea = plan.areas.find((a) => a.n === 'Sin área');
  assert.ok(sinArea);
  assert.equal(plan.projects.find((p) => p.n === 'Huérfano').a, sinArea.id);
  const k3 = plan.tasks.find((t) => t.n === 'Sin proyecto');
  assert.equal(plan.projects.find((p) => p.id === k3.p).n, 'Sin proyecto');
  assert.equal(k3.s, '2026-11-05'); // fecha imposible → se usa la otra
  assert.equal(k3.ty, 'tarea');
  assert.equal(k3.st, 'todo');
  // El hito dura un día; el id repetido recibe uno nuevo y el fin anterior al inicio se da vuelta.
  assert.equal(plan.tasks[1].e, plan.tasks[1].s);
  const rep = plan.tasks.find((t) => t.n === 'Id repetido');
  assert.notEqual(rep.id, 'k1');
  assert.deepEqual([rep.s, rep.e], ['2026-11-10', '2026-11-20']);
  // El enlace «javascript:» no entra.
  assert.deepEqual(plan.tasks[0].links, [{ t: 'Drive', u: 'https://drive.example/x' }]);
  assert.equal(plan.projects[0].dept, 'Posgrado');
  assert.equal(avisos.length, 4);
  // Lo que guardaba la base del artefacto (con rev, by y savedAt) también entra.
  const deBase = leerCopia({ ...pm, rev: 12, by: 'abc', savedAt: 1763380000000 }, { hoy: HOY });
  assert.equal(deBase.origen, 'plan-maestro');
  assert.equal(deBase.plan.tasks.length, 4);
});

test('copia: errores claros', () => {
  assert.throws(() => leerCopia('no es json'), ErrorDeCopia);
  assert.throws(() => leerCopia('{"hola":1}'), /no parece una copia/);
  assert.throws(() => leerCopia({ app: 'telar', formato: 99, plan: planVacio() }), /más nueva/);
  assert.throws(() => leerCopia({ app: 'telar', formato: 1, plan: { areas: [] } }), /faltan/);
});

test('copia: planilla CSV con prioridad, tipos en castellano y comillas', () => {
  const p = planBase();
  p.tasks[0].n = 'Buscar "depto", ya';
  const csv = aCSV(p);
  assert.ok(csv.startsWith('﻿"Prioridad"'));
  const lineas = csv.split('\r\n');
  assert.equal(lineas.length, 6);
  assert.ok(lineas[1].includes('"Buscar ""depto"", ya"'));
  assert.ok(lineas[3].includes('"Fecha clave"'));
});

test('sanear no tira error con basura', () => {
  const { plan } = sanear({ areas: [null, 3, { n: 5 }], projects: [{}], tasks: [{}, 'x'] }, { hoy: HOY });
  assert.equal(plan.areas.length, 2); // el área con nombre «5» y la de «Sin área»
  assert.equal(plan.tasks.length, 1);
  assert.equal(plan.tasks[0].s, '2026-11-17');
});

/* ───────── ejemplo ───────── */

test('ejemplo «Tu 2027»: válido, alrededor de hoy y con todo tipo de cosas', () => {
  assert.equal(anioDelEjemplo(HOY), 2027);
  assert.equal(anioDelEjemplo(dn('2027-03-01')), 2027);
  const p = planEjemplo(HOY);
  assert.equal(p.ejemplo, true);
  const { plan, avisos } = sanear(p, { hoy: HOY });
  assert.deepEqual(avisos, []);
  assert.equal(plan.tasks.length, p.tasks.length);
  const idx = indexar(p);
  for (const t of p.tasks) assert.equal(idx.get(t.p).k, 'proj');
  const tipos = new Set(p.tasks.map((t) => t.ty));
  assert.deepEqual([...tipos].sort(), ['habito', 'hito', 'tarea']);
  assert.ok(p.tasks.some((t) => t.st === 'done'));
  assert.ok(p.tasks.some((t) => t.st === 'doing' && dn(t.s) <= HOY && dn(t.e) >= HOY));
  assert.ok(p.tasks.some((t) => seCorrio(t, HOY)));
  assert.ok(p.tasks.filter((t) => t.star).length >= 2);
});

/* ───────── uso (métrica norte, en el dispositivo) ───────── */

import { registrarDia, semanasVivas } from '../src/modelo/uso.js';

test('uso: días sin repetir y «semanas con plan vivo»', () => {
  let d = [];
  d = registrarDia(d, HOY);
  d = registrarDia(d, HOY);
  assert.deepEqual(d, ['2026-11-17']);
  // Semana del 16-11 (actual): lunes, martes → 2 días. Semana del 9-11: 3 días. Semana del 2-11: 4 días. 26-10: 1.
  const usados = ['2026-11-16', '2026-11-17', '2026-11-09', '2026-11-11', '2026-11-15', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-08', '2026-10-27'];
  assert.deepEqual(semanasVivas(usados, HOY), { vivas: 2, de: 4, seguidas: 2 });
  // Con un día más esta semana, la actual cuenta y la racha llega a 3.
  assert.deepEqual(semanasVivas([...usados, '2026-11-18'], dn('2026-11-18')), { vivas: 3, de: 4, seguidas: 3 });
  // Solo guarda los últimos 120 días.
  let muchos = [];
  for (let i = 0; i < 200; i++) muchos = registrarDia(muchos, HOY - i);
  assert.equal(muchos.length, 120);
  assert.equal(muchos.at(-1), '2026-11-17');
});
