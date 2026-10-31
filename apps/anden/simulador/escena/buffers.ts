// escena/buffers.ts · Andén simulador, corte 1 · P6 (escena).
// Memoria reutilizable de las composiciones (posiciones, recursos, jaulas) por reproductor, para no asignar arreglos en cada cuadro.
// Es un detalle interno: las funciones de composición siguen siendo puras (la salida depende solo de la entrada).
import type { EstadoRecursos, Posiciones, Reproductor } from '../contratos/vistas.ts';
import { crearDisposicion, type Disposicion } from './disposicion.ts';
import { esReproductorEscena } from './reproductor.ts';

export interface Buffers {
  pos: Posiciones & { z?: Float32Array; tapado?: Uint8Array; celda?: Float32Array };
  rec: EstadoRecursos;
  nivelJaula: Float32Array;
  numeroJaula: Int32Array;
  disposicion: Disposicion;
}

const cache = new WeakMap<Reproductor, Buffers>();

export function buffersDe(rep: Reproductor): Buffers {
  let b = cache.get(rep);
  if (!b) {
    const nR = rep.traza.geometria.rampas.length;
    const nExc = rep.traza.catalogo.personas.filter((p) => p.rol === 'excepcion').length;
    b = {
      pos: rep.crearPosiciones(), rec: rep.crearEstadoRecursos(),
      nivelJaula: new Float32Array(nR), numeroJaula: new Int32Array(nR),
      disposicion: esReproductorEscena(rep) ? rep.disposicion : crearDisposicion(rep.traza.geometria, nExc),
    };
    cache.set(rep, b);
  }
  return b;
}

/** Calcula posiciones, recursos y jaulas del instante t en los buffers del reproductor y los devuelve. */
export function calcular(rep: Reproductor, t: number): Buffers {
  const b = buffersDe(rep);
  rep.posiciones(t, b.pos);
  rep.recursos(t, b.rec);
  if (esReproductorEscena(rep)) rep.jaulas(t, b.nivelJaula, b.numeroJaula);
  else b.nivelJaula.fill(0);
  return b;
}
