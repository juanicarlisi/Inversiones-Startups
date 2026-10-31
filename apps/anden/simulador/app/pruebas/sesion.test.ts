// app/pruebas/sesion.test.ts · P8 · el flujo de datos de la interfaz con los servicios falsos, en Node y con semilla fija: abrir un modelo,
// la película, las cien noches con su resumen, semáforo y comprobante, «¿y si…?» con la confirmación pareada, decidir y el formulario
// hasta «Ya está», el enlace (plantilla + parche o modelo anonimizado) y el sello «reproducida en este dispositivo».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearServiciosFalsos } from '../servicios-falsos.ts';
import { crearAlmacen, estadoInicial, PERILLAS_VACIAS } from '../estado.ts';
import { Sesion, NOCHES_CONFIRMACION, KPI_COMPARACION, MAX_NOCHES_ESCENA, instanteDeArranque, ANTES_DEL_PRIMER_CAMION_MS } from '../sesion.ts';
import { esperarA } from './ayudas.ts';
import { ClaseEntidad, TipoMomento } from '../../contratos/traza.ts';
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

test('la película de un modelo recién abierto arranca un minuto antes del primer camión, no con el hub vacío (hallazgo EXP-04)', () => {
  const INICIO = 79_200_000, FIN = 108_000_000;
  const traza = (momentos: [number, number][], creados: number[]) => ({
    inicio: INICIO, fin: FIN,
    momentos: { n: momentos.length, t: Float64Array.from(momentos.map((m) => m[0])), tipo: Uint8Array.from(momentos.map((m) => m[1])),
      r: new Int32Array(momentos.length), v: new Float64Array(momentos.length) },
    paquetes: { n: creados.length, creado: Float64Array.from(creados) },
  }) as unknown as Parameters<typeof instanteDeArranque>[0];
  const llega = INICIO + 25 * 60_000;
  // la primera llegada manda, aunque la traza traiga momentos anteriores de otro tipo y llegadas posteriores
  assert.equal(instanteDeArranque(traza([[INICIO + 5_000, TipoMomento.PAUSA_INICIO], [llega + 600_000, TipoMomento.CAMION_LLEGA], [llega, TipoMomento.CAMION_LLEGA]], [])),
    llega - ANTES_DEL_PRIMER_CAMION_MS);
  // sin llegadas, el primer paquete; sin nada, el inicio; y nunca antes del inicio
  assert.equal(instanteDeArranque(traza([], [llega + 120_000, llega + 60_000])), llega);
  assert.equal(instanteDeArranque(traza([], [])), INICIO);
  assert.equal(instanteDeArranque(traza([[INICIO + 10_000, TipoMomento.CAMION_LLEGA]], [])), INICIO);
});

test('abrir sin instante en la receta pone el cabezal en el arranque de la acción (EXP-04)', async () => {
  const { almacen, sesion } = await abrirChica();
  await esperarA(() => sesion.noche !== null && !sesion.cargandoNoche, 'la primera noche');
  assert.equal(almacen.estado.t, instanteDeArranque(sesion.noche!.traza));
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

test('¿y si…?: vista previa de una noche con la misma réplica y confirmación pareada con las mismas noches que A (NOCHES_CONFIRMACION)', async () => {
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
  assert.equal(sesion.ysi.comparaciones.length, KPI_COMPARACION.length, 'un indicador por fila de la pantalla dividida (KPI_COMPARACION)');
  for (const c of sesion.ysi.comparaciones) { assert.equal(c.pareada, true); assert.equal(c.n, NOCHES_CONFIRMACION); }
  // volver a «como está» borra B
  await sesion.previsualizar({ ...PERILLAS_VACIAS });
  assert.equal(sesion.ysi.fase, 'nada');
  assert.equal(sesion.ysi.mvB, null);
  // un cambio que deja el modelo igual (balancear un plan que ya va por volumen): fase «igual», sin película B ni noches de confirmación (I-3)
  assert.equal(sesion.mv!.modelo.personas.rampa.asignacion, 'por-volumen');
  await sesion.previsualizar({ ...PERILLAS_VACIAS, balanceado: true });
  assert.equal(sesion.ysi.fase, 'igual', `se esperaba «igual» y salió «${sesion.ysi.fase}»`);
  assert.equal(sesion.ysi.nocheB, null); assert.equal(sesion.ysi.comparaciones.length, 0);
  await sesion.previsualizar({ ...PERILLAS_VACIAS });
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

test('cuando ninguna cumple, «probar con más opciones» cambia la decisión con un parche y vuelve a decidir (hallazgo UX-03)', async () => {
  const { sesion, mv } = await abrirChica();
  const max = mv.modelo.decision!.variable.max;
  await sesion.cambiarDecision([{ op: 'replace', path: '/decision/variable/max', value: max + 1 }]);
  assert.equal(sesion.mv?.modelo.decision?.variable.max, max + 1, `se esperaba el máximo ${max + 1} y quedó ${sesion.mv?.modelo.decision?.variable.max}`);
  assert.deepEqual(sesion.origen.tipo === 'plantilla' ? sesion.origen.parche : null, [{ op: 'replace', path: '/decision/variable/max', value: max + 1 }],
    'el cambio queda en el parche del origen (y por lo tanto en el enlace)');
  await esperarA(() => sesion.decision.fase === 'listo', 'la decisión de nuevo');
  assert.equal(sesion.decision.evaluacion?.configuraciones.length, max + 1 - mv.modelo.decision!.variable.min + 1, 'una opción más en la tabla');
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

test('sello «reproducida en este dispositivo»: compara la huella agregada de las noches con la del autor (hallazgo H1)', async () => {
  const servicios = crearServiciosFalsos({ retardo: 0 });
  const c = await servicios.compilar(servicios.plantillas['hub-chico@1.0.0']);
  assert.ok(c.ok); if (!c.ok) return;
  // el autor: abre la plantilla, espera las noches y su comprobante, y arma la receta (con la huella agregada `h`)
  const autor = new Sesion(servicios, crearAlmacen(estadoInicial()));
  autor.abrir(c.mv, { tipo: 'modelo' }, { v: 1, modelo: c.mv.huella, motor: '1.0.0', semilla: 5, replicas: 20 });
  await esperarA(() => autor.nochesListas && !!autor.comprobante && !autor.cargandoNoche, 'noches del autor');
  const receta = autor.recetaActual()!;
  assert.equal(receta.h, autor.comprobante!.huellaAgregada, 'la receta lleva la huella agregada de las noches del autor');
  // quien abre el enlace: mientras calcula, «calculando»; con las mismas noches, «reproducida»
  const otro = new Sesion(servicios, crearAlmacen(estadoInicial()));
  otro.abrir(c.mv, { tipo: 'modelo' }, { ...receta, noche: 3 });
  assert.equal(otro.selloReproducida(), 'calculando');
  assert.equal(otro.N, 20);
  await esperarA(() => otro.nochesListas && !!otro.comprobante && !otro.cargandoNoche, 'noches');
  assert.equal(otro.selloReproducida(), 'reproducida');
  assert.equal(otro.noche?.replica, 3, 'se ve la noche que dice la receta');
  assert.equal(otro.cualNoche, 'receta');
  // un enlace con la huella alterada: este dispositivo calculó OTRA cosa → «no-coincide» (nunca «reproducida»)
  const alterada = new Sesion(servicios, crearAlmacen(estadoInicial()));
  alterada.abrir(c.mv, { tipo: 'modelo' }, { ...receta, h: receta.h!.replace(/^./, (x) => (x === '0' ? '1' : '0')) });
  await esperarA(() => alterada.nochesListas && !!alterada.comprobante, 'noches');
  assert.equal(alterada.selloReproducida(), 'no-coincide');
  // una receta sin `h` (modelo anonimizado o enlace anterior): no hay con qué comparar
  const sinH = new Sesion(servicios, crearAlmacen(estadoInicial()));
  sinH.abrir(c.mv, { tipo: 'modelo' }, { v: 1, modelo: c.mv.huella, motor: '1.0.0', semilla: 5, replicas: 20 });
  assert.equal(sinH.selloReproducida(), 'sin-huella');
  // otra versión del motor
  sinH.abrir(c.mv, { tipo: 'modelo' }, { v: 1, modelo: c.mv.huella, motor: '2.0.0', semilla: 5, replicas: 20 });
  assert.equal(sinH.selloReproducida(), 'otro-motor');
});

test('una receta que pide más noches que el tope corre el tope y lo dice (hallazgo SEG-03)', async () => {
  const servicios = crearServiciosFalsos({ retardo: 0 });
  const c = await servicios.compilar(servicios.plantillas['hub-chico@1.0.0']);
  assert.ok(c.ok); if (!c.ok) return;
  const sesion = new Sesion(servicios, crearAlmacen(estadoInicial()));
  sesion.abrir(c.mv, { tipo: 'modelo' }, { v: 1, modelo: c.mv.huella, motor: '1.0.0', semilla: 5, replicas: 1000 });
  assert.equal(sesion.N, MAX_NOCHES_ESCENA);
  assert.equal(sesion.nochesPedidas, 1000);
  sesion.abrir(c.mv, { tipo: 'modelo' }, null);
  assert.equal(sesion.nochesPedidas, null);
});

test('«¿y si…?» antes de que lleguen las 40 noches de A: pide las que faltan en lugar de comparar con huecos (hallazgo SEG-02)', async () => {
  const { sesion } = await abrirChica(5);
  await esperarA(() => !!sesion.noche && !sesion.cargandoNoche, 'noche');
  assert.ok(sesion.llegadas < NOCHES_CONFIRMACION, `todavía no tenían que estar las ${NOCHES_CONFIRMACION} noches (llegaron ${sesion.llegadas})`);
  await sesion.previsualizar({ ...PERILLAS_VACIAS, puestos: 4 });
  await esperarA(() => sesion.ysi.fase === 'confirmada' || sesion.ultimoError !== null, 'confirmación');
  assert.equal(sesion.ultimoError, null, `no tenía que fallar: ${JSON.stringify(sesion.ultimoError)}`);
  assert.equal(sesion.ysi.fase, 'confirmada');
  assert.ok(sesion.ysi.comparaciones.every((x) => x.n === NOCHES_CONFIRMACION));
});

test('«¿y si…?» con la noche provisoria: cuando A pasa a la mediana, B se rehace con la misma noche (misma suerte en pantalla)', async () => {
  const { sesion } = await abrirChica(5);
  await esperarA(() => !!sesion.noche && !sesion.cargandoNoche, 'noche provisoria');
  assert.equal(sesion.cualNoche, 'provisoria');
  const provisoria = sesion.noche!.replica;
  await sesion.previsualizar({ ...PERILLAS_VACIAS, puestos: 4 });
  await esperarA(() => sesion.ysi.fase === 'confirmada', 'confirmación');
  // llegan las cien noches: A cambia sola a la mediana (en los servicios falsos, otra réplica que la provisoria)
  await esperarA(() => sesion.nochesListas && sesion.cualNoche === 'mediana' && !sesion.cargandoNoche, 'noche mediana');
  const mediana = sesion.noche!.replica;
  assert.notEqual(mediana, provisoria, 'la prueba necesita que la mediana sea otra noche que la provisoria');
  await esperarA(() => sesion.ysi.nocheB?.replica === mediana,
    `B en la noche ${mediana + 1} como A (estaba en la ${(sesion.ysi.nocheB?.replica ?? -2) + 1})`);
  assert.equal(sesion.ysi.fase, 'confirmada', 'rehacer la película de B no toca la comparación de las 40 noches');
  assert.equal(sesion.ysi.nocheB!.salida.resultado.modelo, sesion.ysi.mvB!.huella, 'la noche de B es del modelo B');
  assert.equal(sesion.ultimoError, null);
  // mirar la peor también lleva B a la peor
  await sesion.mostrarNoche('peor');
  await esperarA(() => sesion.ysi.nocheB?.replica === sesion.noche!.replica, 'B en la peor noche como A');
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
