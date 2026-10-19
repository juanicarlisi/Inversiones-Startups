// app/pruebas/sesion.test.ts · P8 · el flujo de datos de la interfaz con los servicios falsos, en Node y con semilla fija: abrir un modelo,
// la película, las cien noches con su resumen, semáforo y comprobante, «¿y si…?» con la confirmación pareada, decidir y el formulario
// hasta «Ya está», el enlace (plantilla + parche o modelo anonimizado) y el sello «reproducida en este dispositivo».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearServiciosFalsos } from '../servicios-falsos.ts';
import { crearAlmacen, estadoInicial, PERILLAS_VACIAS } from '../estado.ts';
import { Sesion, NOCHES_CONFIRMACION } from '../sesion.ts';
import { esperarA } from './ayudas.ts';
import { ClaseEntidad } from '../../contratos/traza.ts';
import type { ModeloValidado } from '../../contratos/modelo.ts';

async function abrirChica(retardo = 0) {
  const servicios = crearServiciosFalsos({ retardo });
  const almacen = crearAlmacen(estadoInicial());
  const sesion = new Sesion(servicios, almacen);
  const c = await servicios.compilar(servicios.plantillas['hub-chico@1.0.0']);
  assert.ok(c.ok);
  const mv = (c as { ok: true; mv: ModeloValidado }).mv;
  sesion.abrir(mv, { tipo: 'plantilla', clave: 'hub-chico@1.0.0', plantilla: { id: 'hub-chico', version: '1.0.0' }, parche: [] });
  return { servicios, almacen, sesion, mv };
}

test('abrir: la película (noche provisoria), las 100 noches, su resumen con IC, el semáforo, el comprobante y la noche mediana', async () => {
  const { almacen, sesion, mv } = await abrirChica();
  assert.equal(sesion.N, 100);
  assert.equal(sesion.semilla, mv.modelo.experimento.semilla);
  await esperarA(() => sesion.nochesListas && sesion.comprobante !== null && sesion.cualNoche === 'mediana' && !sesion.cargandoNoche, 'noches listas y noche mediana');
  assert.equal(sesion.llegadas, 100);
  assert.deepEqual(sesion.nochesLlegadas.map((r) => r.replica), Array.from({ length: 100 }, (_, i) => i), 'las noches se guardan por índice de réplica');
  assert.equal(sesion.resumenCosto?.n, 100);
  assert.ok(sesion.resumenCosto!.semiancho > 0, 'el costo lleva su ±');
  assert.equal(sesion.propCorte?.n, 100);
  assert.equal(sesion.semaforo?.color, 'verde');
  assert.equal(sesion.comprobante?.receta.replicas, 100);
  assert.equal(sesion.noche?.replica, sesion.mapa?.nocheMediana);
  assert.equal(almacen.estado.inicio, sesion.noche?.traza.inicio);
  assert.equal(almacen.estado.fin, sesion.noche?.traza.fin);
  assert.equal(sesion.selloReproducida(), 'sin-receta');
});

test('elegir la peor y la mejor noche cambia la película y su etiqueta', async () => {
  const { sesion } = await abrirChica();
  await esperarA(() => sesion.nochesListas && sesion.cualNoche === 'mediana' && !sesion.cargandoNoche, 'noche mediana');
  await sesion.mostrarNoche('peor');
  assert.equal(sesion.cualNoche, 'peor');
  assert.equal(sesion.noche?.replica, sesion.mapa?.nochePeor);
  await sesion.mostrarNoche('mejor');
  assert.equal(sesion.cualNoche, 'mejor');
  const fin = (r: number) => sesion.resultados[r]!.kpi.finClasificacionMin;
  assert.ok(sesion.nochesLlegadas.every((r) => fin(sesion.noche!.replica) <= r.kpi.finClasificacionMin), 'la mejor es la que termina primero');
});

test('¿y si…?: vista previa de una noche con la misma réplica y confirmación pareada de 40 noches', async () => {
  const { sesion } = await abrirChica();
  await esperarA(() => sesion.nochesListas && !sesion.cargandoNoche && sesion.cualNoche === 'mediana', 'noches');
  const replicaA = sesion.noche!.replica;
  await sesion.previsualizar({ ...PERILLAS_VACIAS, puestos: 4, reten: 1 });
  assert.equal(sesion.ysi.fase, 'confirmada');
  assert.deepEqual(sesion.ysi.parche, [
    { op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 }, { op: 'replace', path: '/personas/induccion/reten', value: 1 },
  ]);
  assert.equal(sesion.ysi.nocheB?.replica, replicaA, 'B se ve con la misma noche (misma suerte) que A');
  assert.equal(sesion.ysi.mvB?.modelo.personas.induccion.puestosActivos, 4);
  assert.equal(sesion.ysi.comparaciones.length, 4);
  for (const c of sesion.ysi.comparaciones) { assert.equal(c.pareada, true); assert.equal(c.n, NOCHES_CONFIRMACION); }
  // volver a «como está» borra B
  await sesion.previsualizar({ ...PERILLAS_VACIAS });
  assert.equal(sesion.ysi.fase, 'nada');
  assert.equal(sesion.ysi.mvB, null);
});

test('«balancear el plan» usa el parche de planBalanceado; «quedarme con B» lo suma al origen', async () => {
  const { sesion } = await abrirChica();
  await esperarA(() => sesion.nochesListas && !sesion.cargandoNoche, 'noches');
  assert.deepEqual(sesion.parcheDe({ ...PERILLAS_VACIAS, balanceado: true, plan: 'contiguas' }), [{ op: 'replace', path: '/personas/rampa/asignacion', value: 'por-volumen' }]);
  await sesion.previsualizar({ ...PERILLAS_VACIAS, plan: 'contiguas' });
  sesion.quedarseConB();
  assert.equal(sesion.mv?.modelo.personas.rampa.asignacion, 'contiguas');
  assert.ok(sesion.origen.tipo === 'plantilla' && sesion.origen.parche.length === 1);
});

test('decidir: evaluación, tamizado y formulario; contestar las preguntas lleva a «Ya está»', async () => {
  const { sesion } = await abrirChica();
  await sesion.decidir();
  assert.equal(sesion.decision.fase, 'listo');
  assert.equal(sesion.decision.evaluacion?.recomendacion, 4);
  const preguntas = sesion.decision.preguntas!;
  assert.ok(preguntas.length >= 1, 'hay preguntas que cambian la respuesta');
  for (let i = 0; i < 4 && sesion.decision.preguntas?.length; i++) {
    const p = sesion.decision.preguntas[0];
    await sesion.responder(p.parametro, p.referencia.valor);
    await esperarA(() => sesion.decision.fase === 'listo', 'decisión de nuevo');
    assert.equal(sesion.mv?.modelo.parametros[p.parametro].etiqueta, 'DATO_USUARIO');
    assert.equal(sesion.mv?.modelo.parametros[p.parametro].incierto, undefined, 'contestado, deja de ser un supuesto tamizable');
  }
  assert.deepEqual(sesion.decision.preguntas, []);
  assert.deepEqual(Object.keys(sesion.decision.respuestas).sort(), preguntas.map((p) => p.parametro).sort());
});

test('decidir se puede cancelar y no deja nada a medias', async () => {
  const { sesion } = await abrirChica(3);
  const d = sesion.decidir();
  await esperarA(() => sesion.decision.fase === 'evaluando', 'evaluando');
  sesion.cancelarDecision();
  await d;
  assert.equal(sesion.decision.fase, 'cancelado');
  assert.equal(sesion.decision.preguntas, null);
});

test('enlace: plantilla + parche si no hay datos propios; modelo anonimizado (otra huella) si los hay', async () => {
  const { servicios, sesion } = await abrirChica();
  await esperarA(() => sesion.nochesListas && sesion.comprobante !== null && !sesion.cargandoNoche, 'noches');
  const e1 = await sesion.enlace(true);
  assert.equal(e1.plantilla, true);
  assert.match(e1.fragmento, /^t=hub-chico@1\.0\.0&r=/);
  const d = await servicios.codec.decodificar(e1.fragmento);
  assert.ok(d.ok && d.enlace.tipo === 'plantilla' && d.enlace.receta?.noche === sesion.noche?.replica);
  await sesion.responder('induccionBase', 2.6);
  await esperarA(() => sesion.nochesListas && sesion.comprobante !== null, 'noches del modelo nuevo');
  const anon = await sesion.enlace(true);
  assert.equal(anon.anonimizado, true);
  assert.match(anon.fragmento, /^m=/);
  assert.ok(anon.enlace.tipo === 'modelo' && anon.enlace.receta && anon.enlace.receta.modelo !== sesion.mv!.huella,
    'la receta del enlace anonimizado es la del modelo anonimizado');
  const tal = await sesion.enlace(false);
  assert.match(tal.fragmento, /^t=hub-chico@1\.0\.0&p=/, 'sin anonimizar viaja la plantilla con el parche de los datos propios');
});

test('sello «reproducida en este dispositivo»: con la receta del enlace y el mismo motor', async () => {
  const servicios = crearServiciosFalsos({ retardo: 0 });
  const sesion = new Sesion(servicios, crearAlmacen(estadoInicial()));
  const c = await servicios.compilar(servicios.plantillas['hub-chico@1.0.0']);
  assert.ok(c.ok); if (!c.ok) return;
  sesion.abrir(c.mv, { tipo: 'modelo' }, { v: 1, modelo: c.mv.huella, motor: '1.0.0', semilla: 5, replicas: 20, noche: 3 });
  assert.equal(sesion.selloReproducida(), 'calculando');
  assert.equal(sesion.N, 20);
  await esperarA(() => sesion.nochesListas && !sesion.cargandoNoche, 'noches');
  assert.equal(sesion.selloReproducida(), 'reproducida');
  assert.equal(sesion.noche?.replica, 3, 'se ve la noche que dice la receta');
  assert.equal(sesion.cualNoche, 'receta');
  sesion.abrir(c.mv, { tipo: 'modelo' }, { v: 1, modelo: c.mv.huella, motor: '2.0.0', semilla: 5, replicas: 20 });
  assert.equal(sesion.selloReproducida(), 'otro-motor');
});

test('biografía y causas: un paquete de la noche, con pasos verificados', async () => {
  const { sesion } = await abrirChica();
  await esperarA(() => !!sesion.noche && !sesion.cargandoNoche, 'noche');
  const P = sesion.noche!.traza.paquetes;
  let e = 0; while (e < P.n && !(P.listo[e] > sesion.noche!.traza.corte)) e++;
  const bio = sesion.biografia(ClaseEntidad.PAQUETE, e);
  assert.ok(bio && bio.pasos.length >= 3);
  assert.ok(sesion.verificar([bio!.titulo, ...bio!.pasos.map((p) => p.frase)]).every(Boolean), 'todas las frases pasan el verificador');
  const c = await sesion.causas(e);
  assert.ok(c);
  for (const cf of c!.contrafactuales) assert.equal(cf.semilla, sesion.noche!.traza.semilla, 'el contrafactual usa la misma semilla');
});
