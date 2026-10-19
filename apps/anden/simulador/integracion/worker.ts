// integracion/worker.ts · Andén simulador, corte 1 · Integración (corte-1.md §10.2). Punto de entrada del Web Worker de simulación.
// Se construye como dist/worker.js (módulo ESM) y lo crea puente.ts con `new Worker(url, { type: 'module' })`, uno por núcleo menos uno.
//
// Al arrancar congela Math.random y la matemática nativa (trabajador.ts: congelarMatematica), arma el hub con el motor de producción
// (ensamblar.ts) y atiende el protocolo de contratos/mensajes-worker.ts. Las columnas de la traza viajan transferidas.
import type { MensajeAlTrabajador, MensajeDelTrabajador } from '../contratos/mensajes-worker.ts';
import { crearMotorProduccion, ensamblarSimulador, VERSION_MOTOR } from './ensamblar.ts';
import { congelarMatematica, crearTrabajador, motorVigilado } from './trabajador.ts';

interface AmbitoWorker {
  postMessage(m: MensajeDelTrabajador, transferir: Transferable[]): void;
  onmessage: ((ev: MessageEvent<MensajeAlTrabajador>) => void) | null;
}

congelarMatematica(Math);

const ambito = globalThis as unknown as AmbitoWorker;
const { simularNoche: simular } = ensamblarSimulador(motorVigilado(crearMotorProduccion));
const reloj = typeof performance !== 'undefined' ? () => performance.now() : undefined;
const atender = crearTrabajador({
  simular,
  version: VERSION_MOTOR,
  enviar: (m, transferir) => ambito.postMessage(m, transferir),
  reloj,
});
ambito.onmessage = (ev) => atender(ev.data);
