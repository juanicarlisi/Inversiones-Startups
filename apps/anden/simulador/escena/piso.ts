// escena/piso.ts · Andén simulador, corte 1 · P6 (escena).
// Elección del piso de dibujo (contratos/vistas.ts, ElegirPiso): se mide el cuadro 2,5D durante el primer segundo y se elige 'iso' si la
// mediana tarda ≤ 10 ms; si no, la planta '2d', que anda en cualquier equipo. El 3D (corte 2) se suma con su propia regla.
// La primera medida se descarta: el primer lienzo de una página paga un cambio de modo del navegador (medición de la visión
// «Experiencia»: ~34 ms el primer cuadro y 0,9 ms después). Una medida que falla o no es un número elige '2d'.
import type { Ms } from '../contratos/tipos-base.ts';
import type { ElegirPiso, Piso, Vista } from '../contratos/vistas.ts';

/** Mediana máxima del cuadro 2,5D para elegirlo (ms). */
export const UMBRAL_ISO_MS = 10;
/** Tope de medidas (la primera no cuenta). */
export const MUESTRAS_PISO = 7;
/** Tiempo total de medición: el primer segundo. */
export const VENTANA_PISO_MS = 1000;

export const elegirPiso: ElegirPiso = (medirCuadroIsoMs: () => number): Piso => {
  const muestras: number[] = [];
  let total = 0;
  for (let i = 0; i < MUESTRAS_PISO && total < VENTANA_PISO_MS; i++) {
    let ms: number;
    try {
      ms = medirCuadroIsoMs();
    } catch {
      return '2d';
    }
    if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) return '2d';
    total += ms;
    if (i > 0) muestras.push(ms);
  }
  if (muestras.length === 0) return '2d';
  muestras.sort((a, b) => a - b);
  const mediana = muestras[Math.min(muestras.length - 1, Math.floor(muestras.length / 2))];
  return mediana <= UMBRAL_ISO_MS ? 'iso' : '2d';
};

/** Medidor para elegirPiso: cuánto tarda la vista en dibujar el instante t (con el reloj dado, por defecto performance.now). */
export function medidorDeCuadro(v: Vista, t: Ms, reloj: () => number = () => globalThis.performance.now()): () => number {
  return () => {
    const a = reloj();
    v.dibujar(t);
    return reloj() - a;
  };
}
