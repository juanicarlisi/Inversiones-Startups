// escena/momentos.ts · Andén simulador, corte 1 · P6 (escena).
// Marcas de la línea de tiempo (contratos/vistas.ts, DetectarMomentos): los momentos que el hub escribió en la traza (corte-1.md §6.8)
// más dos derivados de los tramos y del resumen por paquete:
//   - PRIMER_ATRASADO: nace el primer paquete (por hora de creación) que no llega al corte (listo > corte o −1); r = id del paquete;
//   - FILA_MAXIMA: el primer instante en que la fila de la acumulación llega a su máximo de la noche; v = paquetes en la fila.
// Cada marca tiene importancia (1 detalle … 5 clave) para que la interfaz filtre por zoom, una clave i18n 'escena.momento.<nombre>' y
// sus variables (ids del catálogo, minutos redondeados). Orden: t ascendente, importancia descendente, tipo y recurso ascendentes.
import { TipoMomento, TipoTramo, type Traza } from '../contratos/traza.ts';
import type { DetectarMomentos, MomentoEscena } from '../contratos/vistas.ts';
import { segAHora } from '../contratos/tipos-base.ts';

/** Tipos derivados (fuera del rango de TipoMomento del contrato; ver NOTAS-CONTRATO.md §6). */
export const MomentoDerivado = { PRIMER_ATRASADO: 100, FILA_MAXIMA: 101 } as const;

/** Nombre (sufijo de la clave i18n) e importancia de cada tipo. */
export const DEF_MOMENTO: Readonly<Record<number, { nombre: string; importancia: number }>> = {
  [TipoMomento.CAMION_LLEGA]: { nombre: 'camionLlega', importancia: 1 },
  [TipoMomento.CAMION_ATRASADO]: { nombre: 'camionAtrasado', importancia: 3 },
  [TipoMomento.ATRASO_COMUN]: { nombre: 'atrasoComun', importancia: 4 },
  [TipoMomento.RAMPA_LLENA]: { nombre: 'rampaLlena', importancia: 3 },
  [TipoMomento.RAMPA_LIBERA]: { nombre: 'rampaLibera', importancia: 1 },
  [TipoMomento.LAZO_PARA]: { nombre: 'lazoPara', importancia: 4 },
  [TipoMomento.LAZO_ARRANCA]: { nombre: 'lazoArranca', importancia: 2 },
  [TipoMomento.PAUSA_INICIO]: { nombre: 'pausaInicio', importancia: 1 },
  [TipoMomento.PAUSA_FIN]: { nombre: 'pausaFin', importancia: 1 },
  [TipoMomento.AUSENCIA]: { nombre: 'ausencia', importancia: 3 },
  [TipoMomento.REEMPLAZO]: { nombre: 'reemplazo', importancia: 2 },
  [TipoMomento.JAULA_CERRADA]: { nombre: 'jaulaCerrada', importancia: 1 },
  [TipoMomento.CORTE]: { nombre: 'corte', importancia: 5 },
  [TipoMomento.PRIMER_PAQUETE]: { nombre: 'primerPaquete', importancia: 2 },
  [TipoMomento.ULTIMO_CLASIFICADO]: { nombre: 'ultimoClasificado', importancia: 4 },
  [TipoMomento.ACUMULACION_LLENA]: { nombre: 'acumulacionLlena', importancia: 3 },
  [TipoMomento.ACUMULACION_LIBERA]: { nombre: 'acumulacionLibera', importancia: 1 },
  [MomentoDerivado.PRIMER_ATRASADO]: { nombre: 'primerAtrasado', importancia: 5 },
  [MomentoDerivado.FILA_MAXIMA]: { nombre: 'filaMaxima', importancia: 4 },
};

/** Clave i18n de un tipo de momento (o 'escena.momento.otro' si el tipo no se conoce). */
export function claveMomento(tipo: number): string {
  const d = DEF_MOMENTO[tipo];
  return `escena.momento.${d ? d.nombre : 'otro'}`;
}

const minutos = (ms: number) => Math.round(ms / 60_000);
const hora = (ms: number) => segAHora(Math.floor(ms / 1000));

export const detectarMomentos: DetectarMomentos = (tr: Traza): MomentoEscena[] => {
  const M = tr.momentos, c = tr.catalogo, out: MomentoEscena[] = [];
  const id = (lista: { id: string }[] | string[], i: number): string => {
    if (i < 0 || i >= lista.length) return String(i);
    const x = lista[i];
    return typeof x === 'string' ? x : x.id;
  };
  const rutaDeRampa = (r: number) => (r >= 0 && r < tr.geometria.rampas.length ? tr.geometria.rampas[r].ruta : '');
  // Paquetes que pierden el corte (para la variable «pendientes» del CORTE y el derivado PRIMER_ATRASADO).
  const Pq = tr.paquetes;
  let pendientes = 0, primero = -1;
  for (let e = 0; e < Pq.n; e++) {
    const listo = Pq.listo[e];
    if (listo >= 0 && listo <= tr.corte) continue;
    pendientes++;
    if (primero < 0 || Pq.creado[e] < Pq.creado[primero]) primero = e;
  }

  for (let q = 0; q < M.n; q++) {
    const t = M.t[q], tipo = M.tipo[q], r = M.r[q], v = M.v[q];
    const def = DEF_MOMENTO[tipo];
    let vars: Record<string, string | number> = {};
    switch (tipo) {
      case TipoMomento.CAMION_LLEGA: case TipoMomento.CAMION_ATRASADO:
        vars = { camion: id(c.camiones, r), minutos: Math.round(v) };
        break;
      case TipoMomento.ATRASO_COMUN:
        vars = { minutos: Math.round(v) };
        break;
      case TipoMomento.RAMPA_LLENA: case TipoMomento.RAMPA_LIBERA:
        vars = { rampa: id(c.rampas, r), ruta: rutaDeRampa(r), paquetes: Math.round(v) };
        break;
      case TipoMomento.LAZO_PARA: case TipoMomento.LAZO_ARRANCA:
        vars = { numero: Math.round(v) + 1 };
        break;
      case TipoMomento.PAUSA_INICIO: case TipoMomento.PAUSA_FIN: case TipoMomento.AUSENCIA:
        vars = { persona: id(c.personas, r) };
        break;
      case TipoMomento.REEMPLAZO:
        vars = { reten: id(c.personas, r), persona: id(c.personas, Math.round(v)) };
        break;
      case TipoMomento.JAULA_CERRADA:
        vars = { rampa: id(c.rampas, r), jaula: Math.round(v) + 1 };
        break;
      case TipoMomento.CORTE:
        vars = { hora: hora(t), pendientes };
        break;
      case TipoMomento.ULTIMO_CLASIFICADO:
        vars = { hora: hora(t) };
        break;
      case TipoMomento.ACUMULACION_LLENA: case TipoMomento.ACUMULACION_LIBERA:
        vars = { paquetes: Math.round(v) };
        break;
      default:
        vars = {};
    }
    out.push({ t, tipo, r, importancia: def ? def.importancia : 1, clave: claveMomento(tipo), vars });
  }

  if (primero >= 0) {
    const ruta = Pq.ruta[primero];
    out.push({
      t: Pq.creado[primero], tipo: MomentoDerivado.PRIMER_ATRASADO, r: primero, importancia: DEF_MOMENTO[MomentoDerivado.PRIMER_ATRASADO].importancia,
      clave: claveMomento(MomentoDerivado.PRIMER_ATRASADO),
      vars: { camion: id(c.camiones, Pq.camion[primero]), ruta: ruta >= 0 && ruta < c.rutas.length ? c.rutas[ruta] : String(ruta), pendientes },
    });
  }

  const fila = filaMaxima(tr);
  if (fila) {
    out.push({
      t: fila.t, tipo: MomentoDerivado.FILA_MAXIMA, r: 0, importancia: DEF_MOMENTO[MomentoDerivado.FILA_MAXIMA].importancia,
      clave: claveMomento(MomentoDerivado.FILA_MAXIMA), vars: { paquetes: fila.paquetes, minutos: minutos(fila.t - tr.inicio) },
    });
  }
  out.sort((a, b) => a.t - b.t || b.importancia - a.importancia || a.tipo - b.tipo || a.r - b.r);
  return out;
};

/** Primer instante en que la fila de la acumulación alcanza su máximo (null si nunca hubo fila). */
export function filaMaxima(tr: Traza): { t: number; paquetes: number } | null {
  const T = tr.tramos, ent: number[] = [], sal: number[] = [];
  for (let i = 0; i < T.n; i++) {
    if (T.k[i] !== TipoTramo.ACUMULACION || !(T.t1[i] > T.t0[i])) continue;
    ent.push(T.t0[i]);
    sal.push(T.t1[i]);
  }
  if (ent.length === 0) return null;
  const a = Float64Array.from(ent).sort(), b = Float64Array.from(sal).sort();
  // barrido: en el mismo instante, primero salen y después entran (activo = t0 ≤ t < t1)
  let i = 0, j = 0, en = 0, max = 0, tMax = a[0];
  while (i < a.length) {
    if (j < b.length && b[j] <= a[i]) { en--; j++; continue; }
    en++;
    if (en > max) { max = en; tMax = a[i]; }
    i++;
  }
  return { t: tMax, paquetes: max };
}
