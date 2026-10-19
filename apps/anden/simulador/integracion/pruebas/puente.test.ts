// integracion/pruebas/puente.test.ts · Andén simulador, corte 1 · Integración (corte-1.md §10.1 y §10.3): los Servicios reales.
// Se arman con crearServicios (el mismo código que corre en el navegador) sobre dos hilos de worker_threads que hacen de Web Workers
// (hilo-trabajador.ts: matemática congelada y motor de producción). Se controla que cada servicio llega bien de punta a punta:
// noches con traza transferida, cien noches en orden con progreso, cancelación, comprobante, enlace con las plantillas publicadas,
// contrafactual y causas pidiendo las noches a los Workers, evaluación de la decisión y tamizado. Más el puerto del Web Worker con un
// Worker falso (caídas, reemplazo y Worker roto) y la cantidad de trabajadores por máquina.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { Prioridad } from '../../contratos/experimentos.ts';
import type { MensajeAlTrabajador, MensajeDelTrabajador } from '../../contratos/mensajes-worker.ts';
import type { ModeloValidado } from '../../contratos/modelo.ts';
import { esCancelacion, huellaAgregada } from '../../experimentos/indice.ts';
import { huellaModelo } from '../../modelo/indice.ts';
import { ensamblar } from '../ensamblar.ts';
import { crearServicios, MAX_FALLAS_SEGUIDAS, MOTOR_SIN_VERIFICAR, puertoDeWorker, trabajadoresPara } from '../puente.ts';
import { fabricaDeHilos } from './hilos.ts';

const E = ensamblar();
const hilos = fabricaDeHilos();
const S = crearServicios({ fabrica: hilos.fabrica, trabajadores: 2, replicasMaxTamizado: 10 });
after(async () => { S.cerrar(); await hilos.terminarTodos(); });

async function chico(): Promise<ModeloValidado> {
  const c = await S.compilar(S.plantillas['hub-chico@1.0.0']);
  if (!c.ok) throw new Error('hub-chico@1.0.0 no compila');
  return c.mv;
}

test('puente · trabajadores por máquina: núcleos − 1, entre 1 y 7', () => {
  assert.deepEqual([undefined, 0, 1, 2, 4, 8, 16, 64].map((n) => trabajadoresPara(n)), [1, 1, 1, 1, 3, 7, 7, 7]);
});

test('puente · plantillas y enlace: la plantilla chica es el ejemplo de §5 (huella dorada) y el enlace la abre con la versión del motor', async () => {
  const mv = await chico();
  assert.equal(await huellaModelo(S.plantillas['hub-chico@1.0.0']), '0491977a06fedf2a', 'hub-chico@1.0.0 tiene que ser el ejemplo de §5 (modelo/NOTAS §5)');
  assert.equal(mv.huella, '0491977a06fedf2a');
  const g = await S.compilar(S.plantillas['hub-lazo-noche@1.0.0']);
  assert.ok(g.ok && g.mv.diagnosticos.every((d) => d.nivel !== 'error'), 'la plantilla grande tiene que compilar sin errores');
  const frag = await S.codec.codificar({ tipo: 'plantilla', plantilla: { id: 'hub-chico', version: '1.0.0' }, parche: [],
    receta: { v: 1, modelo: mv.huella, motor: S.versionMotor, semilla: 20261017, replicas: 100, noche: 3 } });
  const d = await S.codec.decodificar(frag);
  assert.ok(d.ok && d.enlace.tipo === 'plantilla' && d.enlace.receta?.noche === 3, `el enlace tiene que volver igual: ${JSON.stringify(d)}`);
  const otro = await S.codec.decodificar(await E.codec.codificar({ tipo: 'receta', receta: { v: 1, modelo: mv.huella, motor: '2.0.0', semilla: 1, replicas: 1 } }));
  assert.deepEqual(otro.ok ? null : otro.error, 'version-motor', 'una receta de otra versión mayor del motor se rechaza');
  assert.equal((await S.codec.decodificar('t=hub-chico@9.9.9')).ok, false, 'una plantilla que no existe no abre');
});

test('puente · una noche con traza (transferida desde el hilo) es la misma que la del hilo principal', async () => {
  const mv = await chico();
  const s = await S.noche(mv, 20261017, 4, Prioridad.VISTA_PREVIA);
  const aca = E.simularNoche(mv, 20261017, 4, { traza: 'completa' });
  assert.equal(s.resultado.huella, aca.resultado.huella);
  assert.ok(s.traza && s.traza.tramos.n === aca.traza!.tramos.n && s.traza.tramos.t1 instanceof Float64Array);
  assert.deepEqual(Array.from(s.traza.paquetes.listo.subarray(0, 50)), Array.from(aca.traza!.paquetes.listo.subarray(0, 50)));
});

test('puente · noches en orden de réplica, con progreso, y su comprobante con la huella agregada', async () => {
  const mv = await chico();
  const llegadas: number[] = [];
  const rs = await S.noches(mv, 20261017, 0, 12, Prioridad.NOCHES, (r) => llegadas.push(r.replica));
  assert.deepEqual(rs.map((r) => r.replica), [...Array(12).keys()], 'las noches vuelven ordenadas por réplica');
  assert.equal(llegadas.length, 12, 'el progreso recibe cada noche apenas llega');
  for (const r of [0, 7]) assert.equal(rs[r].huella, E.simularNoche(mv, 20261017, r, { traza: 'no' }).resultado.huella, `réplica ${r}`);
  const sem = S.semaforoDe!(mv, rs);
  assert.deepEqual([sem.color, sem.motivo], ['amarillo', 'pocas-replicas'], 'con 12 noches el semáforo avisa que son pocas');
  const c = await S.comprobante(mv, rs, sem);
  assert.equal(c.huellaAgregada, huellaAgregada(rs.map((r) => r.huella)));
  assert.deepEqual(c.motor, MOTOR_SIN_VERIFICAR, 'sin corrida de la batería con el núcleo, el comprobante lo dice (0 de 85, sin fecha)');
  assert.deepEqual(c.receta, { v: 1, modelo: mv.huella, motor: S.versionMotor, semilla: 20261017, replicas: 12 });
  assert.equal(c.validacion.estado, 'sin-validar');
  const ic = mv.diagnosticos.find((d) => d.codigo === 'I-CONTROLES')!;
  assert.deepEqual(c.modelo, { controles: ic.vars!.controles, pasaron: ic.vars!.controles, avisos: 0 },
    'el comprobante cuenta los mismos controles que el compilador (I-CONTROLES)');
  assert.ok(S.estilos?.claro && S.estilos?.oscuro, 'los servicios traen los estilos de la escena (app/NOTAS-CONTRATO §3)');
});

test('puente · cancelar: las noches se rechazan con ErrorCancelado y los trabajadores siguen sirviendo', async () => {
  const mv = await chico();
  const p = S.noches(mv, 20261017, 0, 60, Prioridad.NOCHES);
  await new Promise((r) => setTimeout(r, 150));
  S.cancelarDesde(Prioridad.NOCHES);
  await assert.rejects(p, (e: unknown) => esCancelacion(e), 'unas noches canceladas tienen que rechazarse con ErrorCancelado');
  const s = await S.noche(mv, 20261017, 0, Prioridad.VISTA_PREVIA);
  assert.ok(s.traza, 'después de cancelar, una noche nueva anda');
  assert.ok(hilos.creados() > 2, 'el trabajador que corría lo cancelado se reemplaza por uno nuevo');
});

test('puente · contrafactual y causas pidiendo las noches a los Workers (prioridad CONFIRMACION)', async () => {
  const mv = await chico();
  const { traza: t } = await S.noche(mv, 20261017, 0, Prioridad.VISTA_PREVIA);
  assert.ok(t);
  let e = -1;
  for (let i = t.paquetes.n - 1; i >= 0; i--) if (t.paquetes.listo[i] > t.corte) { e = i; break; }
  assert.ok(e >= 0, 'en la noche 0 del hub chico algún paquete pierde el corte');
  const { causas, contrafactuales } = await S.causas(t, mv, t.paquetes.camion[e], t.paquetes.indice[e]);
  assert.ok(contrafactuales.length > 0, 'el paquete tiene candidatas y se probaron');
  for (const f of causas) assert.match(f.clave, /^explicacion\.causa\./);
  const cf = await S.contrafactual(mv, 20261017, 0, t.paquetes.camion[e], t.paquetes.indice[e],
    { clave: 'explicacion.cambio.pausa', vars: {}, parche: [{ op: 'replace', path: '/personas/rampa/pausas/duracion', value: 0 }] });
  assert.equal(cf.antes.listo, t.paquetes.listo[e], 'el contrafactual encuentra el mismo paquete en la noche base');
  const v = E.simularNoche(await E.variante(mv, cf.cambio.parche), 20261017, 0, { traza: 'completa' }).traza!;
  let listo = null;
  for (let i = 0; i < v.paquetes.n; i++) if (v.paquetes.camion[i] === cf.camion && v.paquetes.indice[i] === cf.indice) listo = v.paquetes.listo[i];
  assert.equal(cf.despues.listo, listo, 'y la variante es la misma que corrida en el hilo principal');
});

/** Un modelo chico para decidir y tamizar en segundos: dos valores, 10 noches y un solo supuesto con `incierto`. */
async function paraDecidir(): Promise<ModeloValidado> {
  const mv = await chico();
  const sinIncierto = Object.keys(mv.modelo.parametros).filter((k) => mv.modelo.parametros[k].incierto && k !== 'induccionBase')
    .map((k) => ({ op: 'remove' as const, path: `/parametros/${k}/incierto` }));
  return S.variante(mv, [
    ...sinIncierto,
    { op: 'replace', path: '/experimento/replicasMin', value: 10 },
    { op: 'replace', path: '/experimento/replicasMax', value: 10 },
    { op: 'replace', path: '/decision/variable/min', value: 3 },
    { op: 'replace', path: '/decision/variable/max', value: 4 },
  ]);
}

test('puente · evaluar la decisión y tamizar sus supuestos con los Workers', async () => {
  const mv = await paraDecidir();
  let progreso = 0;
  const ev = await S.evaluarDecision(mv, (h) => { progreso = h; });
  assert.deepEqual(ev.configuraciones.map((c) => [c.valor, c.prop.n]), [[3, 10], [4, 10]], 'dos valores con 10 noches cada uno');
  assert.equal(ev.replicasUsadas, 20);
  assert.equal(progreso, 20, 'el progreso cuenta cada noche simulada');
  let pasos = 0;
  const ranking = await S.tamizar(mv, () => { pasos++; });
  assert.deepEqual(ranking.map((r) => r.parametro), ['induccionBase'], 'se tamiza el único supuesto con `incierto`');
  assert.equal(pasos, 3, 'el tamizado evalúa el modelo y las dos variantes (bajo y alto)');
  assert.ok(Array.isArray(S.formulario(mv, ranking)), 'el formulario se arma con el ranking');
});

// ------------------------------------------------------------------------------------------------ el puerto del Web Worker

/** Un Worker falso con la forma del de los navegadores, que se puede hacer caer. */
class WorkerFalso {
  static creados: WorkerFalso[] = [];
  onmessage: ((ev: MessageEvent<MensajeDelTrabajador>) => void) | null = null;
  onerror: ((ev: ErrorEvent) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  recibidos: MensajeAlTrabajador[] = [];
  terminado = false;
  constructor() { WorkerFalso.creados.push(this); }
  postMessage(m: MensajeAlTrabajador) { this.recibidos.push(m); }
  terminate() { this.terminado = true; }
  responder(m: MensajeDelTrabajador) { this.onmessage?.({ data: m } as MessageEvent<MensajeDelTrabajador>); }
  caer(mensaje: string) { this.onerror?.({ message: mensaje } as ErrorEvent); }
}

test('puente · puerto del Web Worker: una caída contesta error por cada trabajo en curso y lo reemplaza; si no levanta, queda roto', async () => {
  WorkerFalso.creados = [];
  const puerto = puertoDeWorker(() => new WorkerFalso() as unknown as Worker);
  const llegan: MensajeDelTrabajador[] = [];
  puerto.alRecibir((m) => llegan.push(m));
  const correr = (id: string): MensajeAlTrabajador => ({ tipo: 'correr', id, mv: {} as never, semilla: 1, desde: 0, hasta: 1, traza: 'no' });
  puerto.enviar(correr('a'));
  puerto.enviar(correr('b'));
  WorkerFalso.creados[0].responder({ tipo: 'fin', id: 'a', completadas: 1 });
  WorkerFalso.creados[0].caer('sin memoria');
  assert.deepEqual(llegan.map((m) => `${m.tipo}:${'id' in m ? m.id : ''}`), ['fin:a', 'error:b'], 'solo el trabajo que seguía en curso recibe el error');
  assert.match((llegan[1] as { mensaje: string }).mensaje, /se cayó: sin memoria/);
  assert.equal(WorkerFalso.creados.length, 2, 'el Worker caído se reemplaza por uno nuevo');
  assert.ok(WorkerFalso.creados[0].terminado);
  puerto.enviar(correr('c'));
  assert.equal(WorkerFalso.creados[1].recibidos.length, 1, 'el reemplazo recibe lo nuevo');
  for (let i = 1; i < MAX_FALLAS_SEGUIDAS; i++) WorkerFalso.creados.at(-1)!.caer('no carga');
  const antes = WorkerFalso.creados.length;
  puerto.enviar(correr('d'));
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(WorkerFalso.creados.length, antes, `después de ${MAX_FALLAS_SEGUIDAS} caídas seguidas no se crean más Workers`);
  const ultimo = llegan.at(-1) as Extract<MensajeDelTrabajador, { tipo: 'error' }>;
  assert.equal(ultimo.tipo, 'error');
  assert.equal(ultimo.id, 'd', 'con el Worker roto, cada trabajo nuevo recibe un error en vez de quedar colgado');
  puerto.terminar();
});
