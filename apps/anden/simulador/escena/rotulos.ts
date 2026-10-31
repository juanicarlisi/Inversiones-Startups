// escena/rotulos.ts · Andén simulador, corte 1 · P6 (escena).
// Rótulos de las rampas, en una pasada final encima de todo (hallazgos EXP-03 y EXP-08 de la revisión del 30-10-2026). Antes iban en el
// fondo y solo con zoom (≥ 8 px de letra): en la escena principal no se leía ninguna rampa a 1280 × 800 ni a 360 × 740, y el guion de
// diseno-maestro §5.3 es «mirá cómo se traba la rampa R07»; y acercado, la carga de la capa móvil (jaulas, paquetes) tapaba los de
// adelante. Ahora:
//  · las rampas que importan (la seleccionada, las llenas, las casi llenas y, en el mapa de las cien noches, las de riesgo) llevan
//    SIEMPRE su rótulo, en una pastilla con fondo, de al menos 10 px, aunque el zoom sea bajo;
//  · acercado (letra de 8 px o más), todas, en una pastilla suave;
//  · nunca se enciman: van por prioridad y un rótulo que choca con otro ya puesto no se dibuja (salvo el de la seleccionada);
//  · lo que queda fuera del lienzo no se compone.
// Como los demás textos de la escena, es un DATO del modelo (el id de la rampa), nunca un texto de interfaz.
import type { Estilo, EstadoRecursos, MapaRiesgo } from '../contratos/vistas.ts';
import { ClaseEntidad } from '../contratos/traza.ts';
import type { Disposicion } from './disposicion.ts';
import { color } from './estilo.ts';
import { enMarco, type Marco, type Primitiva, type Proyector } from './primitivas.ts';

/** Ocupación (fracción de la capacidad) desde la que una rampa «casi llena» lleva rótulo aunque el zoom sea bajo. */
export const OCUPACION_ROTULO = 0.8;
/** Probabilidad de llenarse (mapa de las cien noches) desde la que una rampa lleva rótulo con el zoom bajo. */
export const RIESGO_ROTULO = 0.25;
/** Letra mínima de un rótulo con pastilla (px). */
export const TAM_MIN_ROTULO = 10;

export interface EntradaRotulos {
  estilo: Estilo;
  marco: Marco;
  /** Tamaño de letra que da el zoom (tamanos(zoom).rotulo): 8 o más = se rotulan todas. */
  tamZoom: number;
  rec: EstadoRecursos;
  riesgo: MapaRiesgo | null;
  seleccion: { clase: ClaseEntidad; id: number } | null;
  /** Punto de anclaje de cada rampa en el mundo: [x, y, z]. */
  ancla: (r: number) => [number, number, number];
}

/**
 * Agrega a `prims` los rótulos de las rampas. `prof` da la profundidad de cada uno: en la isométrica −Infinity (encima de todo), en la
 * planta el contador de la lista (allí el orden es el de la lista).
 */
export function rotulosDeRampas(p: Proyector, D: Disposicion, en: EntradaRotulos, prims: Primitiva[], prof: () => number): number {
  const e = en.estilo, todas = en.tamZoom >= 8;
  const sel = en.seleccion && en.seleccion.clase === ClaseEntidad.RAMPA ? en.seleccion.id : -1;
  // prioridad: 0 seleccionada, 1 llena (o de mucho riesgo), 2 casi llena, 3 el resto (solo acercado)
  const cand: { r: number; pri: number }[] = [];
  for (let r = 0; r < D.rampas.length; r++) {
    const R = D.rampas[r];
    let pri = 3;
    if (r === sel) pri = 0;
    else if (en.riesgo && r < en.riesgo.rampaProbLlena.length) {
      const q = en.riesgo.rampaProbLlena[r];
      pri = q >= 0.5 ? 1 : q >= RIESGO_ROTULO ? 2 : 3;
    } else if (en.rec.rampaLlena[r] === 1) pri = 1;
    else if (R.capacidad > 0 && en.rec.rampaOcupacion[r] / R.capacidad >= OCUPACION_ROTULO) pri = 2;
    if (pri < 3 || todas) cand.push({ r, pri });
  }
  cand.sort((a, b) => a.pri - b.pri || a.r - b.r);
  const puestos: number[] = [];   // rectángulos ya ocupados: x0, y0, x1, y1
  const o = [0, 0];
  let n = 0;
  for (const { r: k, pri } of cand) {
    const [x, y, z] = en.ancla(k);
    p.aPantalla(x, y, z, o);
    if (pri !== 0 && !enMarco(en.marco, o[0], o[1], 0)) continue;
    const r = D.rampas[k], largo = Math.min(8, r.id.length);
    const tam = Math.max(TAM_MIN_ROTULO, Math.min(13, en.tamZoom));
    // ancho estimado (la composición es pura: no mide texto); el pintor ajusta la pastilla al ancho real
    const w = 0.62 * tam * largo + 8, h = tam + 6;
    const x0 = o[0] - w / 2, y0 = o[1] - h / 2, x1 = o[0] + w / 2, y1 = o[1] + h / 2;
    let choca = false;
    for (let k = 0; k < puestos.length && !choca; k += 4) choca = x0 < puestos[k + 2] && x1 > puestos[k] && y0 < puestos[k + 3] && y1 > puestos[k + 1];
    if (choca && pri !== 0) continue;
    puestos.push(x0, y0, x1, y1);
    const fuerte = pri <= 1;
    prims.push({
      tipo: 'texto', x: o[0], y: o[1], texto: r.id.slice(0, 8), tam, alinear: 'center', prof: prof(),
      color: color(e, fuerte ? 'etiquetaTexto' : 'rotulo'),
      fondo: color(e, fuerte ? 'etiquetaFondo' : 'fondo'),
      bordeFondo: pri === 1 ? color(e, en.riesgo ? 'riesgo4' : 'rampaLlena') : pri === 0 ? color(e, 'seleccion') : color(e, 'grilla'),
    });
    n++;
  }
  return n;
}
