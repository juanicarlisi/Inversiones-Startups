// app/ui/tablero.ts · Andén simulador, corte 1 · P8 (interfaz; lo sumó la integración, I-3).
// El tablero en vivo sobre la película: la hora y lo que pasa en ese instante (cuántos paquetes ya están en una jaula, cuántos siguen
// adentro, la fila de la acumulación, las rampas llenas, las personas en pausa, el lazo detenido y, pasado el corte, cuántos no llegaron).
// Lo que muestra sale de la traza (el reproductor y las columnas de paquetes): lo mismo que se dibuja, nunca una cuenta aparte del motor.
// Se actualiza en cada cuadro sin asignar memoria: las horas de llegada y de salida se ordenan una vez por noche y se cuentan con
// búsqueda binaria; el DOM solo se toca si cambió el texto.
import type { Contexto } from '../contexto.ts';
import type { EstadoRecursos, Reproductor } from '../../contratos/vistas.ts';
import { TipoTramo } from '../../contratos/traza.ts';
import { el } from './dom.ts';

/** Desde cuántos paquetes en la cola del puesto manual el dato se marca como alerta (y se muestra también en el teléfono). */
export const ALERTA_COLA_MANUAL = 100;

/** Cuántos valores de `xs` (ordenado ascendente) son ≤ t. */
export function contarHasta(xs: Float64Array, t: number): number {
  let lo = 0, hi = xs.length;
  while (lo < hi) { const m = (lo + hi) >>> 1; if (xs[m] <= t) lo = m + 1; else hi = m; }
  return lo;
}

/** Lo que el tablero necesita de una noche, calculado una sola vez. */
export interface DatosNoche {
  creados: Float64Array;   // hora de nacimiento de cada paquete, ordenada
  listos: Float64Array;    // hora en que cada paquete entró a una jaula (solo los que entraron), ordenada
  total: number;
  corte: number;
  /** Paquetes que no estaban en una jaula a la hora del corte (los «pendientes al corte» de §6.9). */
  pendientesAlCorte: number;
  /** Entradas y salidas de la cola del puesto manual (tramos COLA_MANUAL), ordenadas: cuántos esperan ahí en t, sin recorrer la traza. */
  manualDesde: Float64Array;
  manualHasta: Float64Array;
}

export function datosDeNoche(r: Reproductor): DatosNoche {
  const P = r.traza.paquetes, corte = r.traza.corte;
  let n = 0, l = 0, pend = 0;
  for (let e = 0; e < P.n; e++) if (P.creado[e] >= 0) { n++; if (P.listo[e] >= 0) l++; }
  const creados = new Float64Array(n), listos = new Float64Array(l);
  n = 0; l = 0;
  for (let e = 0; e < P.n; e++) {
    if (P.creado[e] < 0) continue;
    creados[n++] = P.creado[e];
    if (P.listo[e] >= 0) listos[l++] = P.listo[e];
    if (P.listo[e] < 0 || P.listo[e] > corte) pend++;
  }
  creados.sort(); listos.sort();
  // la cola del puesto manual: la pila que se ve junto a la mesa de excepción (la escena la amontona; acá se cuenta)
  const T = r.traza.tramos;
  let m = 0;
  if (T) for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.COLA_MANUAL) m++;
  const manualDesde = new Float64Array(m), manualHasta = new Float64Array(m);
  m = 0;
  if (T) for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.COLA_MANUAL) { manualDesde[m] = T.t0[i]; manualHasta[m] = T.t1[i]; m++; }
  manualDesde.sort(); manualHasta.sort();
  return { creados, listos, total: creados.length, corte, pendientesAlCorte: pend, manualDesde, manualHasta };
}

/** Las cuentas del instante t (puras, para probarlas en Node). */
export interface Instante {
  enJaula: number; adentro: number; fila: number; rampasLlenas: number; enPausa: number; lazoDetenido: boolean;
  /** Paquetes esperando el puesto manual en t (entraron a la cola y todavía no salieron). */
  colaManual: number;
  /** null antes del corte; después, cuántos no llegaron. */
  noLlegaron: number | null;
}
export function instanteDe(d: DatosNoche, rec: EstadoRecursos, t: number): Instante {
  const enJaula = contarHasta(d.listos, t), nacidos = contarHasta(d.creados, t);
  let rampasLlenas = 0, enPausa = 0;
  for (let i = 0; i < rec.rampaLlena.length; i++) rampasLlenas += rec.rampaLlena[i] ? 1 : 0;
  for (let i = 0; i < rec.personaEstado.length; i++) enPausa += rec.personaEstado[i] === 2 ? 1 : 0;
  return {
    enJaula, adentro: Math.max(0, nacidos - enJaula), fila: rec.filaAcumulacion, rampasLlenas, enPausa, lazoDetenido: rec.lazoDetenido,
    // un tramo [t0, t1) está en la cola en t si t0 ≤ t < t1
    colaManual: Math.max(0, contarHasta(d.manualDesde, t) - contarHasta(d.manualHasta, t)),
    noLlegaron: t >= d.corte ? d.pendientesAlCorte : null,
  };
}

/** Hasta tres nombres de las rampas llenas, en el orden del modelo («R01, R07, R09…»). */
export function nombresLlenas(r: Pick<Reproductor, 'traza'>, rec: Pick<EstadoRecursos, 'rampaLlena'>, max = 3): string {
  const ids = r.traza.geometria.rampas, nombres: string[] = [];
  let total = 0;
  for (let i = 0; i < rec.rampaLlena.length; i++) {
    if (!rec.rampaLlena[i]) continue;
    total++;
    if (nombres.length < max) nombres.push(ids[i]?.id ?? `#${i + 1}`);
  }
  return nombres.join(', ') + (total > max ? '…' : '');
}

export interface Tablero { nodo: HTMLElement; actualizar(t: number): void }

/** `compacto`: sin «en el hub» ni la fila (las mitades de la pantalla dividida son angostas). */
export function crearTablero(ctx: Contexto, reproductor: () => Reproductor | null, compacto = false): Tablero {
  const hora = el('span', { class: 'tablero__hora' });
  const jaula = el('span', { class: 'tablero__dato', 'data-tablero': 'jaula' });
  const adentro = el('span', { class: 'tablero__dato', 'data-tablero': 'adentro' });
  const fila = el('span', { class: 'tablero__dato', 'data-tablero': 'fila' });
  const rampas = el('span', { class: 'tablero__dato tablero__dato--alerta', 'data-tablero': 'rampas' });
  const pausa = el('span', { class: 'tablero__dato', 'data-tablero': 'pausa' });
  const lazo = el('span', { class: 'tablero__dato tablero__dato--alerta', 'data-tablero': 'lazo' });
  const manual = el('span', { class: 'tablero__dato', 'data-tablero': 'manual' });
  const corte = el('span', { class: 'tablero__dato', 'data-tablero': 'corte' });
  const nodo = el('div', { class: `tablero${compacto ? ' tablero--compacto' : ''}`, 'aria-hidden': 'true', 'data-tablero-vivo': '' },
    hora, jaula, ...(compacto ? [] : [adentro, fila]), rampas, pausa, manual, lazo, corte);
  nodo.hidden = true;
  let de: Reproductor | null = null, datos: DatosNoche | null = null, rec: EstadoRecursos | null = null;
  const poner = (n: HTMLElement, texto: string | null) => {
    const ocultar = texto === null;
    if (n.hidden !== ocultar) n.hidden = ocultar;
    if (texto !== null && n.textContent !== texto) n.textContent = texto;
  };
  const num = (x: number) => ctx.f.numero(x, 0);
  const actualizar = (t: number) => {
    const r = reproductor();
    if (!r) { nodo.hidden = true; return; }
    if (r !== de) { de = r; datos = datosDeNoche(r); rec = r.crearEstadoRecursos(); }
    r.recursos(t, rec!);
    const x = instanteDe(datos!, rec!, t);
    nodo.hidden = false;
    poner(hora, ctx.f.hora(t));
    poner(jaula, ctx.t('app.tablero.enJaula', { n: num(x.enJaula), total: num(datos!.total) }));
    poner(adentro, ctx.t('app.tablero.adentro', { n: num(x.adentro) }));
    poner(fila, ctx.t('app.tablero.fila', { n: num(x.fila) }));
    // con el nombre de las rampas llenas (hallazgo EXP-03): «R09 llena», «3 rampas llenas: R01, R07, R09»
    poner(rampas, x.rampasLlenas ? ctx.t(x.rampasLlenas === 1 ? 'app.tablero.rampaLlenaNombre' : 'app.tablero.rampasLlenasNombres',
      { n: x.rampasLlenas, rampas: nombresLlenas(r, rec!) }) : null);
    poner(pausa, x.enPausa ? ctx.t(x.enPausa === 1 ? 'app.tablero.unaEnPausa' : 'app.tablero.enPausa', { n: x.enPausa }) : null);
    poner(lazo, x.lazoDetenido ? ctx.t('app.tablero.lazoDetenido') : null);
    poner(manual, x.colaManual ? ctx.t(x.colaManual === 1 ? 'app.tablero.unoEnManual' : 'app.tablero.enManual', { n: num(x.colaManual) }) : null);
    manual.classList.toggle('tablero__dato--alerta', x.colaManual >= ALERTA_COLA_MANUAL);
    if (x.noLlegaron === null) poner(corte, null);
    else {
      poner(corte, x.noLlegaron ? ctx.t('app.tablero.noLlegaron', { n: num(x.noLlegaron) }) : ctx.t('app.tablero.todoAlCorte'));
      corte.classList.toggle('tablero__dato--alerta', x.noLlegaron > 0);
      corte.classList.toggle('tablero__dato--bien', x.noLlegaron === 0);
    }
  };
  return { nodo, actualizar };
}
