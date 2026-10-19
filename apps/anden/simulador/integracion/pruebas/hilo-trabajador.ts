// integracion/pruebas/hilo-trabajador.ts · Andén simulador, corte 1 · Integración. El Worker de simulación en un hilo de Node
// (worker_threads), para probar en `npm test` lo mismo que hace integracion/worker.ts en el navegador: congela la matemática nativa del
// hilo, arma el hub con el núcleo de producción y atiende el protocolo de contratos/mensajes-worker.ts con las columnas transferidas.
// Agrega un único mensaje propio de las pruebas: { tipo: 'probar-congelado' } contesta qué funciones de Math lanzan en este hilo.
import { parentPort } from 'node:worker_threads';
import type { MensajeAlTrabajador } from '../../contratos/mensajes-worker.ts';
import { crearMotorProduccion, ensamblarSimulador, VERSION_MOTOR } from '../ensamblar.ts';
import { congelarMatematica, crearTrabajador, motorVigilado, PROHIBIDAS_EN_EL_MOTOR, PROHIBIDAS_SIEMPRE, vigilar } from '../trabajador.ts';

if (!parentPort) throw new Error('hilo-trabajador.ts se carga como hilo de worker_threads');
const puerto = parentPort;

congelarMatematica(Math);
const { simularNoche } = ensamblarSimulador(motorVigilado(crearMotorProduccion));
const atender = crearTrabajador({ simular: simularNoche, version: VERSION_MOTOR, enviar: (m, transferir) => puerto.postMessage(m, transferir) });

const lanza = (f: () => unknown) => { try { f(); return false; } catch { return true; } };
puerto.on('message', (m: MensajeAlTrabajador | { tipo: 'probar-congelado' }) => {
  if (m.tipo === 'probar-congelado') {
    const M = Math as unknown as Record<string, (...a: number[]) => number>;
    puerto.postMessage({
      tipo: 'congelado',
      siempre: PROHIBIDAS_SIEMPRE.filter((n) => lanza(() => M[n](0.5, 0.5))),
      afuera: PROHIBIDAS_EN_EL_MOTOR.filter((n) => lanza(() => M[n](0.5))),
      adentro: PROHIBIDAS_EN_EL_MOTOR.filter((n) => vigilar(() => lanza(() => M[n](0.5)))),
      exactas: ['sqrt', 'floor', 'round', 'imul', 'abs'].filter((n) => !lanza(() => M[n](2, 3))),
    });
    return;
  }
  atender(m);
});
