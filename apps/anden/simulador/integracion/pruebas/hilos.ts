// integracion/pruebas/hilos.ts · Andén simulador, corte 1 · Integración. Un hilo de worker_threads como PuertoTrabajador (el mismo papel
// que un Web Worker en el navegador), para armar los Servicios reales de puente.ts en las pruebas de Node.
import { Worker } from 'node:worker_threads';
import type { FabricaTrabajador, PuertoTrabajador } from '../../contratos/experimentos.ts';
import type { MensajeDelTrabajador } from '../../contratos/mensajes-worker.ts';

export const HILO = new URL('./hilo-trabajador.ts', import.meta.url);

export function puertoDeHilo(url: URL = HILO): PuertoTrabajador & { hilo: Worker } {
  const hilo = new Worker(url);
  let receptor: ((m: MensajeDelTrabajador) => void) | null = null;
  const enCurso = new Set<string>();
  hilo.on('message', (m: MensajeDelTrabajador) => {
    if (m.tipo === 'fin' || m.tipo === 'error') enCurso.delete(m.id);
    receptor?.(m);
  });
  // Como el puerto del navegador (puente.ts: puertoDeWorker): un hilo que se cae contesta 'error' por cada trabajo que tenía.
  hilo.on('error', (e) => { for (const id of [...enCurso]) receptor?.({ tipo: 'error', id, mensaje: `el hilo de simulación se cayó: ${e.message}` }); enCurso.clear(); });
  return {
    hilo,
    enviar: (m, transferir) => { if (m.tipo === 'correr') enCurso.add(m.id); hilo.postMessage(m, (transferir ?? []) as ArrayBuffer[]); },
    alRecibir: (f) => { receptor = f; },
    terminar: () => { void hilo.terminate(); },
  };
}

/** Fábrica de hilos que recuerda los que creó (para terminarlos al final de la prueba). */
export function fabricaDeHilos(): { fabrica: FabricaTrabajador; creados: () => number; terminarTodos: () => Promise<void> } {
  const hilos: Worker[] = [];
  return {
    fabrica: () => { const p = puertoDeHilo(); hilos.push(p.hilo); return p; },
    creados: () => hilos.length,
    terminarTodos: async () => { await Promise.all(hilos.map((h) => h.terminate())); },
  };
}
