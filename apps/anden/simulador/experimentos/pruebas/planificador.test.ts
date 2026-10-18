// Planificador: prioridades, trozos, entrega inmediata, cancelación inmediata, reemplazo de trabajadores y errores.
// Con un puerto falso controlado a mano (cada mensaje lo decide la prueba) y con el trabajador en proceso real.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearPlanificador, correrYAgregar, tamanoDeTrozo } from '../planificador.ts';
import { trabajadorEnProceso } from '../en-proceso.ts';
import { Prioridad } from '../../contratos/experimentos.ts';
import type { CrearPlanificador, PuertoTrabajador, Simulador, Trabajo } from '../../contratos/experimentos.ts';
import type { MensajeAlTrabajador, MensajeDelTrabajador } from '../../contratos/mensajes-worker.ts';
import type { ResultadoReplica } from '../../contratos/resultados.ts';
import { esperar, esperarHasta, resultadoFalso, validadoEjemplo } from './ayudas.ts';

type Correr = Extract<MensajeAlTrabajador, { tipo: 'correr' }>;

// ---------- puerto falso ----------
interface PuertoFalso {
  puerto: PuertoTrabajador;
  enviados: MensajeAlTrabajador[];
  terminado: () => boolean;
  decir: (m: MensajeDelTrabajador) => void;
  correr: () => Correr[];
}
function crearPuertoFalso(): PuertoFalso {
  const enviados: MensajeAlTrabajador[] = [];
  let terminado = false;
  let receptor: ((m: MensajeDelTrabajador) => void) | null = null;
  return {
    enviados,
    terminado: () => terminado,
    decir: (m) => receptor?.(m),                 // un puerto terminado puede seguir «hablando»: el planificador tiene que ignorarlo
    correr: () => enviados.filter((m): m is Correr => m.tipo === 'correr'),
    puerto: {
      enviar(m) { enviados.push(m); },
      alRecibir(f) { receptor = f; },
      terminar() { terminado = true; },
    },
  };
}
function entorno(trabajadores: number, opciones = {}) {
  const puertos: PuertoFalso[] = [];
  const plan = crearPlanificador(() => { const p = crearPuertoFalso(); puertos.push(p); return p.puerto; }, trabajadores, opciones);
  return { plan, puertos };
}
const mv = validadoEjemplo();
const trabajo = (id: string, prioridad: Prioridad, desde: number, hasta: number): Trabajo =>
  ({ id, prioridad, mv, semilla: 11, replicas: [desde, hasta], traza: 'no' });
const res = (replica: number) => resultadoFalso({ replica, semilla: 11 });
/** El trabajador contesta un trozo completo: todos los resultados y el fin. */
function completar(p: PuertoFalso, m: Correr): void {
  for (let r = m.desde; r < m.hasta; r++) p.decir({ tipo: 'resultado', id: m.id, resultado: res(r) });
  p.decir({ tipo: 'fin', id: m.id, completadas: m.hasta - m.desde });
}
const jobDe = (m: Correr) => m.id.split('#')[0];

// ---------- prioridades y trozos ----------

test('trozos: 1 réplica para la vista previa y la confirmación, 5 para noches, decisión y tamizado', () => {
  assert.deepEqual([Prioridad.VISTA_PREVIA, Prioridad.CONFIRMACION, Prioridad.NOCHES, Prioridad.DECISION, Prioridad.TAMIZADO].map(tamanoDeTrozo), [1, 1, 5, 5, 5]);
  const { plan, puertos } = entorno(1);
  void plan.enviar(trabajo('n', Prioridad.NOCHES, 0, 12), () => {});
  assert.deepEqual(puertos[0].correr().map((m) => [m.desde, m.hasta]), [[0, 5]], 'un trabajador recibe de a un trozo');
  completar(puertos[0], puertos[0].correr()[0]);
  completar(puertos[0], puertos[0].correr()[1]);
  assert.deepEqual(puertos[0].correr().map((m) => [m.desde, m.hasta]), [[0, 5], [5, 10], [10, 12]]);
  const v = entorno(1);
  void v.plan.enviar(trabajo('v', Prioridad.VISTA_PREVIA, 3, 6), () => {});
  completar(v.puertos[0], v.puertos[0].correr()[0]); completar(v.puertos[0], v.puertos[0].correr()[1]);
  assert.deepEqual(v.puertos[0].correr().map((m) => [m.desde, m.hasta]), [[3, 4], [4, 5], [5, 6]]);
});

test('el mensaje al trabajador lleva el modelo, la semilla, el rango del trozo y el nivel de traza del trabajo', () => {
  const { plan, puertos } = entorno(1);
  void plan.enviar({ id: 'x', prioridad: Prioridad.NOCHES, mv, semilla: 777, replicas: [10, 13], traza: 'completa' }, () => {});
  const m = puertos[0].correr()[0];
  assert.equal(m.mv, mv); assert.equal(m.semilla, 777); assert.equal(m.desde, 10); assert.equal(m.hasta, 13); assert.equal(m.traza, 'completa');
  assert.match(m.id, /^x#\d+$/);
});

test('prioridades respetadas: lo de menor número sale antes aunque haya llegado después; lo que corre no se interrumpe', () => {
  const { plan, puertos } = entorno(1);
  const A = plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 10), () => {});        // dos trozos
  void plan.enviar(trabajo('B', Prioridad.TAMIZADO, 0, 5), () => {});
  void plan.enviar(trabajo('C', Prioridad.VISTA_PREVIA, 0, 1), () => {});
  void plan.enviar(trabajo('D', Prioridad.DECISION, 0, 5), () => {});
  void plan.enviar(trabajo('E', Prioridad.CONFIRMACION, 0, 1), () => {});
  const p = puertos[0];
  assert.deepEqual(p.correr().map(jobDe), ['A'], 'A ya estaba corriendo cuando llegaron los demás: no se interrumpe');
  const orden: string[] = [];
  while (p.correr().length > orden.length + 1 || p.correr().length === orden.length + 1) {
    const m = p.correr()[orden.length];
    orden.push(jobDe(m));
    completar(p, m);
    if (p.correr().length === orden.length) break;
  }
  assert.deepEqual(orden, ['A', 'C', 'E', 'A', 'D', 'B'], 'vista previa, confirmación, lo que quedaba de las noches, decisión y tamizado');
  void A;
});

test('FIFO dentro de la misma prioridad: el primer trabajo agota sus trozos antes que el segundo empiece', () => {
  const { plan, puertos } = entorno(1);
  void plan.enviar(trabajo('primero', Prioridad.NOCHES, 0, 10), () => {});
  void plan.enviar(trabajo('segundo', Prioridad.NOCHES, 0, 5), () => {});
  const p = puertos[0];
  const orden: string[] = [];
  for (let i = 0; i < 3; i++) { const m = p.correr()[i]; orden.push(`${jobDe(m)}:${m.desde}`); completar(p, m); }
  assert.deepEqual(orden, ['primero:0', 'primero:5', 'segundo:0']);
});

test('con varios trabajadores los trozos se reparten y cada resultado se entrega apenas llega (antes de que termine el trozo)', async () => {
  const { plan, puertos } = entorno(3);
  const llegaron: number[] = [];
  const fin = plan.enviar(trabajo('x', Prioridad.NOCHES, 0, 15), (r) => llegaron.push(r.replica));
  assert.deepEqual(puertos.map((p) => p.correr().length), [1, 1, 1], 'los tres trabajadores arrancaron cada uno con su trozo');
  const [m0, m1, m2] = puertos.map((p) => p.correr()[0]);
  puertos[1].decir({ tipo: 'resultado', id: m1.id, resultado: res(5) });
  assert.deepEqual(llegaron, [5], 'el resultado llega en el acto, sin esperar el resto del trozo ni el orden de réplica');
  puertos[0].decir({ tipo: 'resultado', id: m0.id, resultado: res(0) });
  assert.deepEqual(llegaron, [5, 0]);
  for (const [p, m] of [[puertos[0], m0], [puertos[1], m1], [puertos[2], m2]] as const) {
    for (let r = m.desde; r < m.hasta; r++) if (!llegaron.includes(r)) p.decir({ tipo: 'resultado', id: m.id, resultado: res(r) });
    p.decir({ tipo: 'fin', id: m.id, completadas: m.hasta - m.desde });
  }
  assert.equal(llegaron.length, 15);
  assert.deepEqual([...llegaron].sort((a, b) => a - b), Array.from({ length: 15 }, (_, i) => i), 'cada réplica exactamente una vez');
  assert.deepEqual(await fin, { completadas: 15, cancelado: false });
});

// ---------- cancelación ----------

test('cancelar: ningún resultado llega después de cancelar (ni uno ya calculado), el trabajador se termina y se reemplaza con la fábrica', async () => {
  const { plan, puertos } = entorno(1);
  const llegaron: number[] = [];
  const fin = plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 10), (r) => llegaron.push(r.replica));
  const m = puertos[0].correr()[0];
  puertos[0].decir({ tipo: 'resultado', id: m.id, resultado: res(0) });
  puertos[0].decir({ tipo: 'resultado', id: m.id, resultado: res(1) });
  plan.cancelar('A');
  assert.equal(puertos[0].terminado(), true, 'el trabajador que estaba en medio del trozo cancelado se termina');
  assert.equal(puertos.length, 2, 'y la fábrica crea otro');
  // Tarde: el viejo todavía «dice» cosas.
  puertos[0].decir({ tipo: 'resultado', id: m.id, resultado: res(2) });
  puertos[0].decir({ tipo: 'fin', id: m.id, completadas: 5 });
  assert.deepEqual(llegaron, [0, 1], 'nada después de cancelar');
  assert.deepEqual(await fin, { completadas: 2, cancelado: true });
  assert.equal(puertos[1].correr().length, 0, 'el segundo trozo de A, que estaba en cola, no se manda a nadie');
});

test('el trabajador de reemplazo queda libre y toma el trabajo siguiente', async () => {
  const { plan, puertos } = entorno(1);
  const fin = plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 10), () => {});
  const llegaronB: number[] = [];
  const finB = plan.enviar(trabajo('B', Prioridad.VISTA_PREVIA, 0, 1), (r) => llegaronB.push(r.replica));
  plan.cancelar('A');
  await fin;
  const mB = puertos[1].correr()[0];
  assert.equal(jobDe(mB), 'B', 'B, que estaba esperando, sale en el trabajador nuevo apenas se cancela A');
  completar(puertos[1], mB);
  assert.deepEqual(await finB, { completadas: 1, cancelado: false });
  assert.deepEqual(llegaronB, [0]);
});

test('cancelar un trabajo que solo estaba en cola no termina a ningún trabajador', async () => {
  const { plan, puertos } = entorno(1);
  void plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 5), () => {});
  const fin = plan.enviar(trabajo('B', Prioridad.NOCHES, 0, 5), () => {});
  plan.cancelar('B');
  assert.deepEqual(await fin, { completadas: 0, cancelado: true });
  assert.equal(puertos.length, 1); assert.equal(puertos[0].terminado(), false);
});

test('cancelar un id que no existe o que ya terminó no hace nada', async () => {
  const { plan, puertos } = entorno(1);
  const fin = plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 5), () => {});
  completar(puertos[0], puertos[0].correr()[0]);
  assert.deepEqual(await fin, { completadas: 5, cancelado: false });
  plan.cancelar('A'); plan.cancelar('no-existe');
  assert.equal(puertos.length, 1);
});

test('cancelarDesde(p) cancela todo lo de prioridad ≥ p y deja lo demás', async () => {
  const { plan, puertos } = entorno(2);
  const fines = {
    vp: plan.enviar(trabajo('vp', Prioridad.VISTA_PREVIA, 0, 1), () => {}),
    no: plan.enviar(trabajo('no', Prioridad.NOCHES, 0, 5), () => {}),
    de: plan.enviar(trabajo('de', Prioridad.DECISION, 0, 5), () => {}),
    ta: plan.enviar(trabajo('ta', Prioridad.TAMIZADO, 0, 5), () => {}),
  };
  plan.cancelarDesde(Prioridad.DECISION);
  assert.deepEqual(await fines.de, { completadas: 0, cancelado: true });
  assert.deepEqual(await fines.ta, { completadas: 0, cancelado: true });
  completar(puertos[0], puertos[0].correr()[0]);                       // vp
  assert.deepEqual(await fines.vp, { completadas: 1, cancelado: false });
  completar(puertos[1], puertos[1].correr()[0]);                       // no
  assert.deepEqual(await fines.no, { completadas: 5, cancelado: false });
});

test('cerrar(): cancela lo pendiente, termina a todos los trabajadores y no acepta trabajos nuevos', async () => {
  const { plan, puertos } = entorno(2);
  const fin = plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 20), () => {});
  plan.cerrar();
  assert.deepEqual(await fin, { completadas: 0, cancelado: true });
  assert.ok(puertos.every((p) => p.terminado()), 'todos terminados');
  assert.equal(puertos.length, 2, 'cerrar no crea reemplazos');
  await assert.rejects(plan.enviar(trabajo('B', Prioridad.NOCHES, 0, 1), () => {}), /planificador está cerrado/);
  plan.cerrar();                                                     // idempotente
});

// ---------- errores y robustez ----------

test('un error del simulador rechaza el trabajo con el mensaje original y no toca a los demás trabajos', async () => {
  const { plan, puertos } = entorno(2);
  const fallo = plan.enviar(trabajo('malo', Prioridad.NOCHES, 0, 5), () => {});
  const bien = plan.enviar(trabajo('bueno', Prioridad.NOCHES, 0, 5), () => {});
  const caso = assert.rejects(fallo, /el simulador falló en el trabajo «malo» \(réplicas 0 a 4\): boom: puestos negativos/);
  puertos[0].decir({ tipo: 'error', id: puertos[0].correr()[0].id, mensaje: 'boom: puestos negativos' });
  await caso;
  assert.equal(puertos[0].terminado(), false, 'el trabajador que avisó el error sigue sano: no se reemplaza');
  assert.equal(puertos[1].terminado(), false, 'el otro trabajador corría «bueno» y sigue vivo');
  completar(puertos[1], puertos[1].correr()[0]);
  assert.deepEqual(await bien, { completadas: 5, cancelado: false });
  assert.equal(puertos.length, 2);
});

test('un error en un trozo cancela el resto del mismo trabajo: el trozo hermano que corría en otro trabajador se termina y se reemplaza, y no llega nada más de ese trabajo', async () => {
  const { plan, puertos } = entorno(2);
  const llegaron: number[] = [];
  const fallo = plan.enviar(trabajo('malo', Prioridad.NOCHES, 0, 15), (r) => llegaron.push(r.replica));   // 3 trozos: 2 corren, 1 en cola
  const caso = assert.rejects(fallo, /boom/);
  const [m0, m1] = [puertos[0].correr()[0], puertos[1].correr()[0]];
  puertos[0].decir({ tipo: 'error', id: m0.id, mensaje: 'boom' });
  await caso;
  assert.equal(puertos[1].terminado(), true, 'el trabajador del trozo hermano se termina');
  assert.equal(puertos.length, 3, 'y se reemplaza');
  puertos[1].decir({ tipo: 'resultado', id: m1.id, resultado: res(5) });
  assert.deepEqual(llegaron, [], 'nada de «malo» llega después del error');
  assert.equal(puertos[2].correr().length, 0, 'el tercer trozo de «malo» no se manda a nadie');
});

test('si el receptor de resultados lanza un error, el trabajo se rechaza con ese mensaje y el planificador sigue andando', async () => {
  const { plan, puertos } = entorno(1);
  const fin = plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 5), () => { throw new Error('mi receptor se rompió'); });
  const caso = assert.rejects(fin, /receptor de resultados del trabajo «A» lanzó un error: mi receptor se rompió/);
  puertos[0].decir({ tipo: 'resultado', id: puertos[0].correr()[0].id, resultado: res(0) });
  await caso;
  const otro = plan.enviar(trabajo('B', Prioridad.NOCHES, 0, 1), () => {});
  completar(puertos[1], puertos[1].correr()[0]);
  assert.deepEqual(await otro, { completadas: 1, cancelado: false });
});

test('un trozo que termina con menos resultados de los esperados rechaza el trabajo', async () => {
  const { plan, puertos } = entorno(1);
  const fin = plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 5), () => {});
  const caso = assert.rejects(fin, /terminó el trozo \[0, 5\) del trabajo «A» con 2 resultados y se esperaban 5/);
  const m = puertos[0].correr()[0];
  puertos[0].decir({ tipo: 'resultado', id: m.id, resultado: res(0) });
  puertos[0].decir({ tipo: 'resultado', id: m.id, resultado: res(1) });
  puertos[0].decir({ tipo: 'fin', id: m.id, completadas: 2 });
  await caso;
});

test('se ignoran los mensajes con un id que no es del trozo en curso y los «listo»', async () => {
  const { plan, puertos } = entorno(1);
  const llegaron: number[] = [];
  const fin = plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 2), (r) => llegaron.push(r.replica));
  const m = puertos[0].correr()[0];
  puertos[0].decir({ tipo: 'listo', motor: '1.0.0' });
  puertos[0].decir({ tipo: 'resultado', id: 'otro#99', resultado: res(7) });
  puertos[0].decir({ tipo: 'fin', id: 'otro#99', completadas: 1 });
  assert.deepEqual(llegaron, []);
  completar(puertos[0], m);
  assert.deepEqual(await fin, { completadas: 2, cancelado: false });
});

test('un puerto que responde en el mismo instante en que se le envía no rompe el reparto', async () => {
  const llegaron: number[] = [];
  const plan = crearPlanificador(() => {
    let receptor: ((m: MensajeDelTrabajador) => void) | null = null;
    return {
      enviar(m) {
        if (m.tipo !== 'correr') return;
        for (let r = m.desde; r < m.hasta; r++) receptor?.({ tipo: 'resultado', id: m.id, resultado: res(r) });
        receptor?.({ tipo: 'fin', id: m.id, completadas: m.hasta - m.desde });
      },
      alRecibir(f) { receptor = f; },
      terminar() {},
    };
  }, 2);
  const fin = await plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 23), (r) => llegaron.push(r.replica));
  assert.deepEqual(fin, { completadas: 23, cancelado: false });
  assert.deepEqual([...llegaron].sort((a, b) => a - b), Array.from({ length: 23 }, (_, i) => i));
});

test('validaciones de entrada: id repetido en curso, rango inválido, prioridad desconocida, trabajadores inválidos; rango vacío termina en el acto', async () => {
  const { plan, puertos } = entorno(1);
  void plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 5), () => {});
  await assert.rejects(plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 5), () => {}), /ya hay un trabajo en curso con el id «A»/);
  await assert.rejects(plan.enviar(trabajo('B', Prioridad.NOCHES, 5, 3), () => {}), /rango de réplicas inválido para «B».*\[5, 3\)/);
  await assert.rejects(plan.enviar(trabajo('C', Prioridad.NOCHES, 0.5, 3), () => {}), /rango de réplicas inválido/);
  await assert.rejects(plan.enviar(trabajo('D', 9 as Prioridad, 0, 3), () => {}), /prioridad desconocida: 9/);
  assert.deepEqual(await plan.enviar(trabajo('E', Prioridad.NOCHES, 4, 4), () => {}), { completadas: 0, cancelado: false });
  assert.equal(puertos[0].correr().length, 1, 'ninguno de los inválidos mandó nada');
  assert.throws(() => crearPlanificador(() => crearPuertoFalso().puerto, 0), /entero ≥ 1 y llegó 0/);
  assert.throws(() => crearPlanificador(() => crearPuertoFalso().puerto, 2.5), /entero ≥ 1 y llegó 2.5/);
  assert.equal(crearPlanificador(() => crearPuertoFalso().puerto, 3).trabajadores, 3);
});

test('un puerto que lanza al enviar rechaza ese trabajo (y el planificador sigue)', async () => {
  let n = 0;
  const plan = crearPlanificador(() => {
    const roto = n++ === 0;
    return { enviar() { if (roto) throw new Error('DataCloneError'); }, alRecibir() {}, terminar() {} };
  }, 1);
  await assert.rejects(plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 5), () => {}), /no se pudo enviar el trabajo «A» al trabajador: DataCloneError/);
});

test('el tamaño de trozo se puede cambiar por opción', () => {
  const { plan, puertos } = entorno(1, { tamanoTrozo: () => 2 });
  void plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 5), () => {});
  assert.deepEqual(puertos[0].correr().map((m) => [m.desde, m.hasta]), [[0, 2]]);
});

test('la firma es la del contrato (CrearPlanificador)', () => {
  const f: CrearPlanificador = crearPlanificador;
  assert.equal(typeof f, 'function');
});

// ---------- con el trabajador en proceso (el camino real) ----------

const simContando = (llamadas: { n: number }): Simulador => (m, semilla, replica) => {
  llamadas.n++;
  return { resultado: resultadoFalso({ semilla, replica, modelo: m.huella }) };
};

test('en proceso, 3 trabajadores: 40 réplicas, cada una exactamente una vez, y correrYAgregar las devuelve ordenadas por índice', async () => {
  const llamadas = { n: 0 };
  const plan = crearPlanificador(trabajadorEnProceso(simContando(llamadas), 'prueba'), 3);
  const { resultados, completadas, cancelado } = await correrYAgregar(plan, trabajo('x', Prioridad.NOCHES, 0, 40));
  assert.equal(completadas, 40); assert.equal(cancelado, false); assert.equal(llamadas.n, 40);
  assert.deepEqual(resultados.map((r) => r.replica), Array.from({ length: 40 }, (_, i) => i));
  plan.cerrar();
});

test('en proceso: la vista previa pasa por delante de las noches que están en cola', async () => {
  const llamadas = { n: 0 };
  const plan = crearPlanificador(trabajadorEnProceso(simContando(llamadas), 'prueba'), 1);
  const orden: string[] = [];
  const noches = plan.enviar(trabajo('noches', Prioridad.NOCHES, 0, 50), () => orden.push('n'));
  await esperarHasta(() => orden.length >= 1, 'llegue la primera noche');
  const previa = plan.enviar(trabajo('previa', Prioridad.VISTA_PREVIA, 100, 101), () => orden.push('P'));
  await Promise.all([noches, previa]);
  const posicion = orden.indexOf('P');
  assert.ok(posicion > 0 && posicion <= 6, `la vista previa llegó en el lugar ${posicion} de ${orden.length}: tenía que salir al terminar el trozo en curso (como mucho el lugar 6)`);
  plan.cerrar();
});

test('en proceso: cancelar en medio de un trozo frena la simulación en el acto y no llega nada más', async () => {
  const llamadas = { n: 0 };
  let fabricados = 0;
  const base = trabajadorEnProceso(simContando(llamadas), 'prueba');
  const plan = crearPlanificador(() => { fabricados++; return base(); }, 2);
  const llegaron: ResultadoReplica[] = [];
  const fin = plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 200), (r) => llegaron.push(r));
  await esperarHasta(() => llegaron.length >= 3, 'lleguen 3 resultados');
  plan.cancelar('A');
  const alCancelar = llegaron.length, llamadasAlCancelar = llamadas.n;
  assert.deepEqual(await fin, { completadas: alCancelar, cancelado: true });
  await esperar(40);
  assert.equal(llegaron.length, alCancelar, 'ningún resultado después de cancelar');
  assert.equal(llamadas.n, llamadasAlCancelar, 'el simulador ya no se llama: los trabajadores se terminaron');
  assert.equal(fabricados, 4, 'los 2 trabajadores que corrían se reemplazaron: 2 originales + 2 nuevos');
  const otro = await correrYAgregar(plan, trabajo('B', Prioridad.NOCHES, 0, 10));
  assert.equal(otro.resultados.length, 10, 'los reemplazos funcionan');
  plan.cerrar();
});

test('en proceso: un simulador que lanza rechaza el trabajo con su mensaje', async () => {
  const sim: Simulador = (m, semilla, replica) => {
    if (replica === 3) throw new Error('puestosActivos negativo');
    return { resultado: resultadoFalso({ semilla, replica, modelo: m.huella }) };
  };
  const plan = crearPlanificador(trabajadorEnProceso(sim, 'prueba'), 2);
  await assert.rejects(plan.enviar(trabajo('A', Prioridad.NOCHES, 0, 10), () => {}), /réplicas 0 a 4\): puestosActivos negativo/);
  plan.cerrar();
});
