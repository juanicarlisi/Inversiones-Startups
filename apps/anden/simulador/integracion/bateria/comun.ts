// integracion/bateria/comun.ts · Andén simulador, corte 1 · Integración (corte-1.md §8 y §10.6).
// Ayudas para las 26 exigibles que no son de P2 y que la integración suma a la batería con `casosExtra`: el dueño de cada prueba, un
// armado de resultados para criterios con varias condiciones y la estadística mínima (sin Math.* trascendentes: §1.4).
import type {
  Caso, Contexto, DeclaracionPrueba, Dueno, EstadoPrueba, ResultadoPrueba, Simulado,
} from '../../verificacion/casos/comun.ts';
import { textoCriterio } from '../../verificacion/casos/comun.ts';

/** El mismo resultado con su dueño real (los evaluadores de P2 ponen 'P2'). */
export function conDueno(r: ResultadoPrueba, dueno: Dueno): ResultadoPrueba {
  return { ...r, dueno };
}

export interface CamposResultado {
  simulado: Simulado;
  /** Condiciones que no se cumplieron (vacío = pasa). */
  fallas: string[];
  n: number;
  replicas?: number;
  semiancho?: number | null;
  z?: number | null;
  errorRelativo?: number | null;
  /** Texto del criterio, si no es el que sale de la declaración. */
  criterio?: string;
}

/** Resultado armado a mano, para las pruebas cuyo criterio junta varias condiciones (L07, S08, R04…). */
export function resultado(caso: Caso, d: DeclaracionPrueba, ctx: Contexto, dueno: Dueno, c: CamposResultado): ResultadoPrueba {
  const esp = typeof d.esperado === 'number' ? d.esperado : null;
  const estado: EstadoPrueba = d.tipo === 'informativa' ? 'informativa' : c.fallas.length ? 'falla' : 'pasa';
  const r: ResultadoPrueba = {
    id: d.id, nombre: d.nombre, familia: d.familia, suite: caso.suite, tipo: d.tipo, dueno, caso: caso.id,
    criterio: c.criterio ?? textoCriterio(d), esperado: d.esperado, simulado: c.simulado,
    semiancho: c.semiancho ?? null,
    semianchoRelativo: c.semiancho !== undefined && c.semiancho !== null && esp ? c.semiancho / Math.abs(esp) : null,
    z: c.z ?? null, errorRelativo: c.errorRelativo ?? null, n: c.n, replicas: c.replicas ?? c.n, semilla: ctx.semilla, estado,
  };
  if (c.fallas.length) r.motivo = c.fallas.join('; ');
  return r;
}

export function media(xs: ArrayLike<number>): number {
  let s = 0;
  for (let i = 0; i < xs.length; i++) s += xs[i];
  return s / xs.length;
}

/** Varianza muestral (n − 1). */
export function varianza(xs: ArrayLike<number>): number {
  const m = media(xs);
  let s = 0;
  for (let i = 0; i < xs.length; i++) { const d = xs[i] - m; s += d * d; }
  return s / (xs.length - 1);
}

/** Número con coma decimal para los motivos (es-AR), sin depender de Intl. */
export function coma(x: number, decimales = 2): string {
  return x.toFixed(decimales).replace('.', ',');
}
