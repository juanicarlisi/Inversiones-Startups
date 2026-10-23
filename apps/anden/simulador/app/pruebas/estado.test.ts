// app/pruebas/estado.test.ts · P8 · transiciones puras de la interfaz (pantallas, reproducción, selección, perillas, actos).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTOS, MAX_HISTORIAL, PANTALLAS, VELOCIDADES, crearAlmacen, estadoInicial, hayCambios, muestraPelicula, reducir, velocidadValida, type Accion,
  type Estado,
} from '../estado.ts';
import { ClaseEntidad } from '../../contratos/traza.ts';

const aplicar = (e: Estado, ...as: Accion[]) => as.reduce(reducir, e);
const conNoche = () => aplicar(estadoInicial(), { tipo: 'cargarNoche', inicio: 79_200_000, fin: 108_000_000 });

test('estado inicial: inicio, sin historial, ×600, anonimizar activado', () => {
  const e = estadoInicial();
  assert.equal(e.pantalla, 'inicio');
  assert.deepEqual(e.historial, []);
  assert.equal(e.velocidad, 600);
  assert.equal(e.anonimizar, true, 'anonimizar tiene que venir activado por defecto (§9 P8.8)');
  assert.equal(PANTALLAS.length, 10);
});

test('ir y volver: la pila recuerda el camino y «volver» lo desanda', () => {
  const e = aplicar(estadoInicial(), { tipo: 'ir', pantalla: 'escena' }, { tipo: 'ir', pantalla: 'noches' }, { tipo: 'ir', pantalla: 'comprobante' });
  assert.equal(e.pantalla, 'comprobante');
  assert.deepEqual(e.historial, ['inicio', 'escena', 'noches']);
  const v1 = reducir(e, { tipo: 'volver' });
  assert.equal(v1.pantalla, 'noches');
  const v2 = aplicar(v1, { tipo: 'volver' }, { tipo: 'volver' });
  assert.equal(v2.pantalla, 'inicio');
  assert.equal(reducir(v2, { tipo: 'volver' }), v2, 'volver en el inicio no cambia nada (mismo objeto)');
});

test('ir a la misma pantalla devuelve el mismo objeto; ir al inicio vacía la pila y pausa', () => {
  const e = aplicar(conNoche(), { tipo: 'ir', pantalla: 'escena' }, { tipo: 'reproducir' });
  assert.equal(reducir(e, { tipo: 'ir', pantalla: 'escena' }), e);
  const i = reducir(e, { tipo: 'ir', pantalla: 'inicio' });
  assert.deepEqual(i.historial, []);
  assert.equal(i.reproduciendo, false);
});

test('una pantalla que no existe se ignora', () => {
  const e = estadoInicial();
  assert.equal(reducir(e, { tipo: 'ir', pantalla: 'nada' as never }), e);
});

test(`la pila de volver no pasa de ${MAX_HISTORIAL}`, () => {
  let e = estadoInicial();
  for (let i = 0; i < 60; i++) e = reducir(e, { tipo: 'ir', pantalla: i % 2 ? 'escena' : 'noches' });
  assert.equal(e.historial.length, MAX_HISTORIAL);
});

test('volver sin historial desde otra pantalla lleva al inicio', () => {
  const e = { ...estadoInicial(), pantalla: 'escena' as const };
  assert.equal(reducir(e, { tipo: 'volver' }).pantalla, 'inicio');
});

test('seleccionar con abrir: guarda la entidad, pausa y abre la biografía', () => {
  const e = aplicar(conNoche(), { tipo: 'ir', pantalla: 'escena' }, { tipo: 'reproducir' },
    { tipo: 'seleccionar', seleccion: { clase: ClaseEntidad.PAQUETE, id: 42 }, abrir: true });
  assert.equal(e.pantalla, 'biografia');
  assert.deepEqual(e.seleccion, { clase: ClaseEntidad.PAQUETE, id: 42 });
  assert.equal(e.reproduciendo, false);
  assert.equal(reducir(e, { tipo: 'volver' }).pantalla, 'escena');
  const igual = reducir(e, { tipo: 'seleccionar', seleccion: { clase: ClaseEntidad.PAQUETE, id: 42 } });
  assert.equal(igual, e, 'seleccionar lo mismo sin abrir no cambia nada');
  assert.equal(reducir(e, { tipo: 'seleccionar', seleccion: null }).seleccion, null);
});

test('cabezal: se acota a la noche y redondea a ms enteros', () => {
  const e = conNoche();
  assert.equal(e.t, 79_200_000, 'al cargar la primera noche el cabezal va al inicio');
  assert.equal(reducir(e, { tipo: 'cabezal', t: 1e12 }).t, 108_000_000);
  assert.equal(reducir(e, { tipo: 'cabezal', t: -5 }).t, 79_200_000);
  assert.equal(reducir(e, { tipo: 'cabezal', t: 80_000_000.4 }).t, 80_000_000);
  assert.equal(reducir(e, { tipo: 'cabezal', t: Number.NaN }).t, 79_200_000);
  assert.equal(reducir(e, { tipo: 'saltar', ms: 60_000 }).t, 79_260_000);
});

test('cargar otra noche conserva el cabezal si cae adentro, o lo pone donde dice la receta', () => {
  const e = reducir(conNoche(), { tipo: 'cabezal', t: 90_000_000 });
  assert.equal(reducir(e, { tipo: 'cargarNoche', inicio: 79_000_000, fin: 100_000_000 }).t, 90_000_000);
  assert.equal(reducir(e, { tipo: 'cargarNoche', inicio: 79_000_000, fin: 85_000_000 }).t, 85_000_000);
  assert.equal(reducir(e, { tipo: 'cargarNoche', inicio: 79_000_000, fin: 100_000_000, t: 95_000_000 }).t, 95_000_000);
});

test('reproducir, avanzar con la velocidad y pararse al final', () => {
  let e = aplicar(conNoche(), { tipo: 'velocidad', velocidad: 600 }, { tipo: 'reproducir' });
  e = reducir(e, { tipo: 'avanzar', msReales: 1000 });
  assert.equal(e.t, 79_200_000 + 600_000, '1 s real a ×600 son 10 minutos de la noche');
  e = reducir(e, { tipo: 'avanzar', msReales: 1e9 });
  assert.equal(e.t, 108_000_000);
  assert.equal(e.reproduciendo, false, 'al llegar al final se pausa');
  const otra = reducir(e, { tipo: 'reproducir' });
  assert.equal(otra.t, 79_200_000, 'reproducir al final vuelve a empezar');
  assert.equal(reducir(reducir(e, { tipo: 'pausar' }), { tipo: 'avanzar', msReales: 500 }).t, e.t, 'en pausa no avanza');
  assert.equal(reducir(estadoInicial(), { tipo: 'reproducir' }).reproduciendo, false, 'sin noche no hay nada que reproducir');
});

test('alternar reproducción y rebobinar', () => {
  const e = aplicar(conNoche(), { tipo: 'alternarReproduccion' });
  assert.equal(e.reproduciendo, true);
  assert.equal(reducir(e, { tipo: 'alternarReproduccion' }).reproduciendo, false);
  const lejos = reducir(e, { tipo: 'cabezal', t: 100_000_000 });
  assert.equal(reducir(lejos, { tipo: 'rebobinar' }).t, 79_200_000);
});

test('velocidades: solo ×1, ×10, ×60, ×600 y ×3.600; la más cercana y las vecinas', () => {
  assert.deepEqual([...VELOCIDADES], [1, 10, 60, 600, 3600]);
  assert.equal(velocidadValida(500), 600);
  assert.equal(velocidadValida(2000), 3600);
  assert.equal(velocidadValida(0.1), 1);
  let e = estadoInicial();
  e = reducir(e, { tipo: 'velocidadSiguiente', sentido: 1 });
  assert.equal(e.velocidad, 3600);
  assert.equal(reducir(e, { tipo: 'velocidadSiguiente', sentido: 1 }).velocidad, 3600, 'no pasa de la última');
  assert.equal(reducir(e, { tipo: 'velocidadSiguiente', sentido: -1 }).velocidad, 600);
});

test('perillas: números enteros ≥ 0, plan válido; elegir un plan apaga «balancear»', () => {
  let e = estadoInicial();
  assert.equal(hayCambios(e.perillas), false);
  e = reducir(e, { tipo: 'perilla', nombre: 'puestos', valor: 4 });
  assert.equal(e.perillas.puestos, 4);
  assert.equal(hayCambios(e.perillas), true);
  assert.equal(reducir(e, { tipo: 'perilla', nombre: 'puestos', valor: -1 }), e, 'negativo: se ignora');
  assert.equal(reducir(e, { tipo: 'perilla', nombre: 'reten', valor: 1.5 }), e, 'no entero: se ignora');
  assert.equal(reducir(e, { tipo: 'perilla', nombre: 'plan', valor: 'cualquiera' as never }), e, 'plan desconocido: se ignora');
  e = reducir(e, { tipo: 'balancear', activo: true });
  assert.equal(e.perillas.balanceado, true);
  e = reducir(e, { tipo: 'perilla', nombre: 'plan', valor: 'contiguas' });
  assert.equal(e.perillas.balanceado, false);
  assert.equal(e.perillas.plan, 'contiguas');
  e = reducir(e, { tipo: 'balancear', activo: true });
  assert.equal(e.perillas.plan, null, 'balancear deja de lado el plan elegido a mano');
  const r = reducir({ ...e, lado: 'B' }, { tipo: 'reiniciarPerillas' });
  assert.equal(hayCambios(r.perillas), false);
  assert.equal(r.lado, 'A');
});

test('pantalla dividida en 360 px: alternar A y B', () => {
  const e = estadoInicial();
  assert.equal(reducir(e, { tipo: 'lado' }).lado, 'B');
  assert.equal(reducir(reducir(e, { tipo: 'lado' }), { tipo: 'lado' }).lado, 'A');
  assert.equal(reducir(e, { tipo: 'lado', lado: 'A' }), e);
});

test(`presentar: ${ACTOS} actos, empieza en el primero y no se sale de rango`, () => {
  let e = aplicar(estadoInicial(), { tipo: 'acto', acto: 2 });
  e = reducir(e, { tipo: 'ir', pantalla: 'presentar' });
  assert.equal(e.acto, 0, 'entrar a presentar arranca en «Así es una noche»');
  e = aplicar(e, { tipo: 'actoRelativo', delta: 1 }, { tipo: 'actoRelativo', delta: 1 }, { tipo: 'actoRelativo', delta: 1 }, { tipo: 'actoRelativo', delta: 1 });
  assert.equal(e.acto, ACTOS - 1);
  assert.equal(reducir(e, { tipo: 'acto', acto: -3 }).acto, 0);
});

test('tema, idioma, piso, ingeniero, anonimizar y avisos', () => {
  let e = estadoInicial();
  e = aplicar(e, { tipo: 'tema', tema: 'oscuro' }, { tipo: 'idioma', idioma: 'en' }, { tipo: 'piso', piso: 'iso' }, { tipo: 'ingeniero' },
    { tipo: 'anonimizar', activo: false }, { tipo: 'aviso', aviso: { clave: 'app.compartir.copiado', vars: {}, nivel: 'info' } });
  assert.deepEqual([e.tema, e.idioma, e.piso, e.ingeniero, e.anonimizar], ['oscuro', 'en', 'iso', true, false]);
  assert.equal(e.aviso?.clave, 'app.compartir.copiado');
  assert.equal(reducir(e, { tipo: 'ingeniero', activo: true }), e);
  assert.equal(reducir(e, { tipo: 'aviso', aviso: null }).aviso, null);
});

test('reducir es puro: no modifica el estado anterior', () => {
  const e = conNoche();
  const copia = structuredClone(e);
  aplicar(e, { tipo: 'ir', pantalla: 'escena' }, { tipo: 'perilla', nombre: 'puestos', valor: 3 }, { tipo: 'reproducir' }, { tipo: 'avanzar', msReales: 10 });
  assert.deepEqual(e, copia);
});

test('almacén: avisa solo cuando algo cambia, con el estado nuevo, el anterior y la acción', () => {
  const a = crearAlmacen(estadoInicial());
  const vistos: string[] = [];
  const dejar = a.suscribir((n, v, acc) => vistos.push(`${acc.tipo}:${v.pantalla}→${n.pantalla}`));
  a.despachar({ tipo: 'ir', pantalla: 'escena' });
  a.despachar({ tipo: 'ir', pantalla: 'escena' });
  a.despachar({ tipo: 'volver' });
  dejar();
  a.despachar({ tipo: 'ir', pantalla: 'noches' });
  assert.deepEqual(vistos, ['ir:inicio→escena', 'volver:escena→inicio']);
  assert.equal(a.estado.pantalla, 'noches');
});

test('al cambiar de pantalla se va el aviso informativo; el de error se queda', () => {
  const info = { clave: 'app.compartir.copiado', vars: {}, nivel: 'info' as const };
  const error = { clave: 'app.enlace.invalido', vars: { detalle: 'x' }, nivel: 'error' as const };
  const e = aplicar(conNoche(), { tipo: 'ir', pantalla: 'escena' }, { tipo: 'aviso', aviso: info });
  assert.equal(e.aviso, info);
  assert.equal(reducir(e, { tipo: 'ir', pantalla: 'decidir' }).aviso, null, 'ir a otra pantalla saca el aviso informativo');
  assert.equal(reducir(e, { tipo: 'volver' }).aviso, null, 'volver también');
  assert.equal(reducir(e, { tipo: 'seleccionar', seleccion: { clase: ClaseEntidad.PAQUETE, id: 1 }, abrir: true }).aviso, null,
    'abrir una biografía también');
  assert.equal(reducir(e, { tipo: 'cabezal', t: 80_000_000 }).aviso, info, 'sin cambiar de pantalla el aviso sigue');
  const conError = reducir(e, { tipo: 'aviso', aviso: error });
  assert.equal(reducir(conError, { tipo: 'ir', pantalla: 'inicio' }).aviso, error, 'un aviso de error sigue a la vista después de ir al inicio');
});

test('pantallas con película: escena, cien noches, «¿y si…?» y presentar (ahí se avisa si la película cambia de noche)', () => {
  assert.deepEqual(PANTALLAS.filter(muestraPelicula), ['escena', 'noches', 'ysi', 'presentar']);
  assert.equal(muestraPelicula('biografia'), false, 'la biografía queda atada a su noche');
});
