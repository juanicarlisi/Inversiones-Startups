// app/ui/camara.ts · Andén simulador, corte 1 · P8 (interfaz; lo sumó la integración, I-3).
// Acercar, alejar y mover la cámara de una vista (como en cualquier simulador de escritorio: rueda para el zoom, arrastrar para mover,
// pellizcar en el teléfono, doble clic para volver a ver todo el hub). Puro: solo usa `aMundo` y `camara` de la vista (contratos/vistas.ts),
// así sirve igual en planta (2D) y en 2,5D, con la cámara girada o no. Lo que se dibuja sigue saliendo de la traza: esto solo mira.
import type { Camara, Vista } from '../../contratos/vistas.ts';

/** Paso de la rueda: cada muesca acerca o aleja un 25%. Con pasos fijos los sprites horneados del 2,5D se reutilizan. */
export const PASO_ZOOM = 1.25;
/** Cuánto se puede acercar (× el encuadre completo) y alejar. */
export const ZOOM_MAX = 16;
export const ZOOM_MIN = 0.8;

type VistaCamara = Pick<Vista, 'aMundo'> & { camara: Camara };

/** Acerca (factor > 1) o aleja la vista dejando quieto el punto de la pantalla (px, py). El zoom queda entre los topes del encuadre. */
export function zoomEnPunto(v: VistaCamara, px: number, py: number, factor: number, encuadre: Camara): void {
  const [x0, y0] = v.aMundo(px, py);
  const z = Math.min(encuadre.zoom * ZOOM_MAX, Math.max(encuadre.zoom * ZOOM_MIN, v.camara.zoom * factor));
  v.camara = { ...v.camara, zoom: z };
  const [x1, y1] = v.aMundo(px, py);
  v.camara = { ...v.camara, cx: v.camara.cx + x0 - x1, cy: v.camara.cy + y0 - y1 };
}

/** Mueve la vista para que lo que estaba en (px0, py0) quede en (px1, py1). */
export function desplazar(v: VistaCamara, px0: number, py0: number, px1: number, py1: number): void {
  const [a, b] = v.aMundo(px0, py0), [c, d] = v.aMundo(px1, py1);
  v.camara = { ...v.camara, cx: v.camara.cx + a - c, cy: v.camara.cy + b - d };
}

/** El factor de un pellizco, redondeado a pasos de PASO_ZOOM (los sprites del 2,5D se hornean por zoom). */
export function pasoDePellizco(proporcion: number): number {
  if (!(proporcion > 0)) return 1;
  const k = Math.round(Math.log(proporcion) / Math.log(PASO_ZOOM));
  return k === 0 ? 1 : PASO_ZOOM ** k;
}
