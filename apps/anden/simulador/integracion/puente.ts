// integracion/puente.ts · Andén simulador, corte 1 · Integración (corte-1.md §10.3).
// Arma los `Servicios` reales (contratos/servicios.ts), la única puerta de la interfaz (app/) hacia el resto:
//   - las noches corren en Workers (worker.ts) a través del planificador de experimentos/ (prioridades, cancelación, trozos);
//   - el modelo (compilar, variante, enlace) corre en el hilo de la interfaz: es rápido y no simula;
//   - el contrafactual, las causas, la decisión y el tamizado piden sus noches al mismo planificador, así nunca simulan en el hilo de la
//     interfaz (explicacion/NOTAS-CONTRATO.md §1: un `Simulador` que devuelve una promesa sirve);
//   - suma los dos extras que la interfaz sabe usar (app/extras.ts): los estilos de la escena y el semáforo de un conjunto de noches.
//
// `crearServicios` no sabe de dónde salen los trabajadores (la fábrica se inyecta): en el navegador son Web Workers
// (`crearServiciosNavegador`); en las pruebas de Node, hilos de worker_threads o trabajadores en el mismo hilo.
import type { Servicios } from '../contratos/servicios.ts';
import type {
  Comprobante, FabricaTrabajador, Planificador, PuertoTrabajador, SalidaSimulacion, Simulador,
} from '../contratos/experimentos.ts';
import { Prioridad } from '../contratos/experimentos.ts';
import type { ModeloValidado } from '../contratos/modelo.ts';
import type { MensajeAlTrabajador, MensajeDelTrabajador } from '../contratos/mensajes-worker.ts';
import type { Contrafactual } from '../contratos/explicacion.ts';
import type { ExtrasServicios } from '../app/extras.ts';
import { anonimizar } from '../modelo/indice.ts';
import { geometria, planBalanceado } from '../hub/indice.ts';
import {
  armarComprobante, comparar, correrYAgregar, crearPlanificador, ErrorCancelado, evaluarDecisionCon, icPercentil, proporcion, resumir, semaforoDe,
  wilson,
} from '../experimentos/indice.ts';
import {
  agregarRiesgo, crearReproductor, crearVista, detectarMomentos, elegirPiso, estilos,
} from '../escena/indice.ts';
import {
  armarBiografia, armarFormulario, causasConfirmadas, crearContrafactual, supuestosDe, tamizar, verificarFrases,
} from '../explicacion/indice.ts';
import { ensamblarModelo, plantillas, VERSION_MOTOR } from './ensamblar.ts';

/** Pruebas exigibles de la batería en todo el corte (corte-1.md §8). */
export const PRUEBAS_EXIGIBLES = 85;

/**
 * Lo que dice el comprobante del motor cuando la construcción no encontró una corrida de la batería con el motor de producción
 * (integracion/salida/bateria-nucleo.json, que escribe la corrida completa de §10.6). Honesto: 0 de 85 y sin fecha.
 */
export const MOTOR_SIN_VERIFICAR: Comprobante['motor'] = { version: VERSION_MOTOR, pruebasExigibles: PRUEBAS_EXIGIBLES, pasaron: 0, fecha: '—' };

/** Réplicas máximas por valor en cada evaluación del tamizado (explicacion/NOTAS-CONTRATO.md §11: el tamizado solo necesita saber si la
 * decisión cambia; con 400 tardaba 311 s en un trabajador). ESTIMACIÓN: lo confirma el banco (§11, ≤ 60 s con 3 Workers). */
export const REPLICAS_MAX_TAMIZADO = 100;
/** Tamaño de cada tanda de la evaluación secuencial (corte-1.md §7). */
export const TANDA_DECISION = 20;

export interface OpcionesPuente {
  /** Crea un trabajador (Web Worker, hilo de Node o en proceso). */
  fabrica: FabricaTrabajador;
  /** Cuántos trabajadores a la vez (1 a 7 en el navegador: `trabajadoresPara`). */
  trabajadores: number;
  /** Resultado de la batería con el motor de producción, para el comprobante. Por defecto, `MOTOR_SIN_VERIFICAR`. */
  motor?: Comprobante['motor'];
  /** Ver `REPLICAS_MAX_TAMIZADO`. */
  replicasMaxTamizado?: number;
}

export interface ServiciosIntegracion extends Servicios, ExtrasServicios {
  /** El planificador de las noches (para las pruebas y el banco). */
  readonly planificador: Planificador;
  /** El simulador asíncrono que usan el contrafactual y las causas (pide la noche al planificador con prioridad CONFIRMACION). */
  readonly simuladorAsincrono: Simulador;
  /** Termina los trabajadores (al cerrar la página o al terminar una prueba). */
  cerrar(): void;
}

let secuencia = 0;
const nuevoId = (prefijo: string) => `${prefijo}:${++secuencia}`;

export function crearServicios(o: OpcionesPuente): ServiciosIntegracion {
  const { compilar, variante, codec } = ensamblarModelo();
  const planificador = crearPlanificador(o.fabrica, o.trabajadores);
  const motor = o.motor ?? MOTOR_SIN_VERIFICAR;
  const replicasMaxTamizado = o.replicasMaxTamizado ?? REPLICAS_MAX_TAMIZADO;

  /** Una noche con traza completa. Si se cancela (otra pantalla pidió algo más urgente), se rechaza con ErrorCancelado. */
  async function noche(mv: ModeloValidado, semilla: number, replica: number, prioridad: Prioridad): Promise<SalidaSimulacion> {
    const caja: { salida?: SalidaSimulacion } = {};
    const fin = await planificador.enviar(
      { id: nuevoId('noche'), prioridad, mv, semilla, replicas: [replica, replica + 1], traza: 'completa' },
      (resultado, traza) => { caja.salida = traza ? { resultado, traza } : { resultado }; },
    );
    if (fin.cancelado || !caja.salida) throw new ErrorCancelado(`la noche ${replica} (semilla ${semilla}) se canceló antes de terminar`);
    return caja.salida;
  }

  /** El contrato de `Simulador` es síncrono; el contrafactual de P7 espera el resultado, así que una promesa sirve (NOTAS-CONTRATO §1). */
  const simuladorAsincrono = ((mv: ModeloValidado, semilla: number, replica: number) =>
    noche(mv, semilla, replica, Prioridad.CONFIRMACION)) as unknown as Simulador;
  const cf = crearContrafactual(simuladorAsincrono);
  const contrafactual = (mv: ModeloValidado, semilla: number, replica: number, camion: number, indice: number,
    cambio: Contrafactual['cambio']) => cf(simuladorAsincrono, mv, semilla, replica, camion, indice, cambio, variante);

  const opcionesDecision = (mv: ModeloValidado) => {
    const iniciales = Math.max(2, mv.modelo.experimento.replicasMin);
    return { replicasIniciales: iniciales, tanda: TANDA_DECISION, replicasMax: Math.max(iniciales, mv.modelo.experimento.replicasMax) };
  };

  const servicios: ServiciosIntegracion = {
    versionMotor: VERSION_MOTOR,
    trabajadores: planificador.trabajadores,
    plantillas,
    compilar,
    variante,
    codec,
    anonimizar,
    geometria,
    planBalanceado,
    noche,
    async noches(mv, semilla, desde, hasta, prioridad, alProgreso) {
      const r = await correrYAgregar(planificador, { id: nuevoId('noches'), prioridad, mv, semilla, replicas: [desde, hasta], traza: 'no' },
        alProgreso ? (resultado) => alProgreso(resultado) : undefined);
      if (r.cancelado) throw new ErrorCancelado(`las noches ${desde} a ${hasta - 1} se cancelaron (llegaron ${r.completadas})`);
      return r.resultados;
    },
    cancelarDesde: (p) => planificador.cancelarDesde(p),
    resumir,
    proporcion,
    comparar,
    evaluarDecision: (mv, alProgreso) =>
      evaluarDecisionCon(mv, planificador, variante, { ...opcionesDecision(mv), alProgreso, prioridad: Prioridad.DECISION, etiqueta: 'decision' }),
    tamizar(mv, alProgreso) {
      const base = opcionesDecision(mv);
      const replicasMax = Math.max(base.replicasIniciales, Math.min(replicasMaxTamizado, base.replicasMax));
      const evaluar = (m: ModeloValidado) =>
        evaluarDecisionCon(m, planificador, variante, { ...base, replicasMax, prioridad: Prioridad.TAMIZADO, etiqueta: 'tamizado' });
      return tamizar(mv, supuestosDe(mv), evaluar, variante, { alProgreso });
    },
    formulario: armarFormulario,
    agregarRiesgo,
    detectarMomentos,
    crearReproductor,
    crearVista,
    elegirPiso,
    biografia: armarBiografia,
    contrafactual,
    causas: (t, mv, camion, indice) => causasConfirmadas(t, mv, t.semilla, t.replica, camion, indice,
      (cambio) => contrafactual(mv, t.semilla, t.replica, camion, indice, cambio)),
    verificar: verificarFrases,
    comprobante: (mv, rs, semaforo) => armarComprobante(mv, rs, semaforo, motor,
      { semilla: rs[0]?.semilla ?? mv.modelo.experimento.semilla, replicas: rs.length }),
    // extras que la interfaz sabe usar (app/extras.ts; app/NOTAS-CONTRATO.md §3 y §4)
    estilos,
    semaforoDe: (mv, rs) => semaforoDe(mv, rs),
    motorVerificado: motor,
    intervalos: { wilson, icPercentil: (xs, q, conf) => icPercentil(xs as number[], q, conf) },
    planificador,
    simuladorAsincrono,
    cerrar: () => planificador.cerrar(),
  };
  return servicios;
}

// ------------------------------------------------------------------------------------------------ navegador

/** Trabajadores para la máquina: núcleos − 1, entre 1 y 7 (corte-1.md §10.3). */
export function trabajadoresPara(nucleos: number | undefined): number {
  const n = Number.isFinite(nucleos) ? Math.floor((nucleos as number) - 1) : 1;
  return Math.min(7, Math.max(1, n));
}

/** Fallas seguidas (sin ningún mensaje en el medio) a partir de las cuales el puerto deja de recrear el Worker. */
export const MAX_FALLAS_SEGUIDAS = 3;

/**
 * Un Web Worker como `PuertoTrabajador`. El contrato no tiene forma de avisar que un Worker se cayó (experimentos/NOTAS-CONTRATO.md
 * §5), así que el puerto lo traduce al protocolo: si el Worker dispara 'error' o 'messageerror', contesta 'error' por cada trabajo que
 * tenía en curso (el planificador lo rechaza con ese motivo) y lo reemplaza por uno nuevo. Si falla una y otra vez sin contestar nunca
 * (por ejemplo, no se pudo cargar el archivo), deja de recrearlo y contesta 'error' a todo lo que se le pida.
 */
export function puertoDeWorker(crear: () => Worker): PuertoTrabajador {
  let receptor: ((m: MensajeDelTrabajador) => void) | null = null;
  let worker: Worker | null = null;
  let terminado = false;
  let roto = '';
  let fallasSeguidas = 0;
  const enCurso = new Set<string>();

  const decir = (m: MensajeDelTrabajador) => { if (!terminado) receptor?.(m); };
  const fallar = (motivo: string) => {
    const ids = [...enCurso];
    enCurso.clear();
    for (const id of ids) decir({ tipo: 'error', id, mensaje: motivo });
  };
  const levantar = () => {
    const w = crear();
    w.onmessage = (ev: MessageEvent<MensajeDelTrabajador>) => {
      if (w !== worker) return;
      fallasSeguidas = 0;
      const m = ev.data;
      if (m.tipo === 'fin' || m.tipo === 'error') enCurso.delete(m.id);
      decir(m);
    };
    w.onerror = (ev: ErrorEvent) => {
      if (w !== worker) return;
      const motivo = `el Worker de simulación se cayó${ev.message ? `: ${ev.message}` : ''}`;
      w.terminate();
      fallasSeguidas++;
      if (fallasSeguidas >= MAX_FALLAS_SEGUIDAS) { roto = motivo; worker = null; } else worker = levantar();
      fallar(motivo);
    };
    w.onmessageerror = () => { if (w === worker) fallar('el Worker de simulación mandó un mensaje que no se pudo leer'); };
    return w;
  };
  worker = levantar();

  return {
    enviar(m: MensajeAlTrabajador, transferir?: Transferable[]) {
      if (terminado) return;
      if (m.tipo === 'correr') {
        if (!worker) { queueMicrotask(() => decir({ tipo: 'error', id: m.id, mensaje: roto || 'no hay Worker de simulación' })); return; }
        enCurso.add(m.id);
      }
      worker?.postMessage(m, transferir ?? []);
    },
    alRecibir(f) { receptor = f; },
    terminar() {
      terminado = true;
      enCurso.clear();
      worker?.terminate();
      worker = null;
    },
  };
}

/** Los servicios reales en el navegador: un Web Worker de módulo por trabajador, con el archivo construido `worker.js`. */
export function crearServiciosNavegador(urlWorker: URL, motor?: Comprobante['motor']): ServiciosIntegracion {
  const nucleos = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined;
  return crearServicios({
    fabrica: () => puertoDeWorker(() => new Worker(urlWorker, { type: 'module', name: 'anden-simulacion' })),
    trabajadores: trabajadoresPara(nucleos),
    motor,
  });
}
