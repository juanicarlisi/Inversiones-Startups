// verificacion/casos/comun.ts · Andén simulador, corte 1, P2.
// Tipos de la batería y los criterios de aprobación de corte-1.md §8:
// - estocásticas: |error| ≤ 3,29 errores estándar y error relativo ≤ 3% (≤ 2% en probabilidades), con un diseño que dé un
//   semiancho del 95% ≤ 2% del valor (≤ 1% en probabilidades); si el valor esperado es 0, solo el criterio de 3,29 ee;
// - deterministas: exactas (error relativo ≤ 1e-9, o la tolerancia que fija la prueba);
// - casos publicados: la media cae dentro del intervalo publicado.
import type { CrearMotor } from '../../contratos/motor.ts';
import type { MatematicaDeterminista } from '../../contratos/matematica.ts';
import type { ConfigRed, MedidasRed } from '../flujo/red.ts';
import { correrRed } from '../flujo/red.ts';
import { cuantilT, intervaloMedia } from '../formulas/estadistica.ts';

export type Suite = 'rapida' | 'completa';
export type TipoPrueba = 'exigible' | 'informativa' | 'debe-fallar';
export type EstadoPrueba = 'pasa' | 'falla' | 'informativa' | 'debe-fallar-ok';
export type Familia = 'V' | 'C' | 'D' | 'M' | 'R' | 'S' | 'K' | 'L' | 'P';
/** Dueño de la prueba (§8): las de P2 viven en casos/; las demás las suma la integración con `casosExtra` (K, L, P02, R04–R07, S…). */
export type Dueno = 'P1' | 'P2' | 'P4' | 'P5' | 'I';

/** Umbral de z de la batería (99,9% bilateral). */
export const Z_MAX = 3.29;

/**
 * Umbral del cociente error ÷ ee cuando el ee sale de las propias réplicas (hallazgo H4 de la revisión del 19-10-2026): ese cociente es
 * una t de Student con n − 1 grados, no una normal. Con 20 réplicas, |t₁₉| > 3,29 pasa el 0,39% de las veces (no el 0,1%): se usa el
 * cuantil t(0,9995; n − 1), que con muchas réplicas es 3,29. Así la falsa alarma de cada prueba es la que dice §8.
 */
export function umbralT(n: number, mat: MatematicaDeterminista): number {
  if (!(n >= 2)) return Z_MAX;
  return Math.max(Z_MAX, cuantilT(0.9995, n - 1, mat));
}
/** Z_MAX escrito en español (coma decimal), para textos y motivos. */
const Z_TXT = '3,29';
export const TOL_REL = 0.03;
export const TOL_REL_PROB = 0.02;
export const SEMIANCHO_MAX = 0.02;
export const SEMIANCHO_MAX_PROB = 0.01;

export type Criterio =
  /** Media de réplicas contra un valor teórico. `probabilidad` endurece las tolerancias; esperado 0 → solo z. */
  | { tipo: 'estadistico'; probabilidad: boolean }
  /** z con un error estándar propio (p. ej. varianza/media de un Poisson). */
  | { tipo: 'z'; }
  /** Error relativo máximo (deterministas o con tolerancia fija). */
  | { tipo: 'relativo'; tolRel: number }
  /** La media tiene que caer en [min, max] (casos publicados). */
  | { tipo: 'intervalo' }
  /** Igualdad exacta (huellas, llegadas, servicios) o ninguna violación. */
  | { tipo: 'identico' }
  /** Demostración que tiene que fallar: la cobertura tiene que quedar por debajo del umbral. */
  | { tipo: 'cobertura-baja'; umbral: number }
  /** Se reporta, no decide. */
  | { tipo: 'informativo' };

export type Esperado = number | { min: number; max: number } | Record<string, number> | string;
export type Simulado = number | Record<string, number> | string | null;

export interface DeclaracionPrueba {
  id: string;
  nombre: string;
  familia: Familia;
  tipo: TipoPrueba;
  esperado: Esperado;
  criterio: Criterio;
}

export interface ResultadoPrueba {
  id: string;
  nombre: string;
  familia: Familia;
  suite: Suite;
  tipo: TipoPrueba;
  dueno: Dueno;
  caso: string;
  criterio: string;
  esperado: Esperado;
  simulado: Simulado;
  semiancho: number | null;
  semianchoRelativo: number | null;
  z: number | null;
  errorRelativo: number | null;
  n: number;
  replicas: number;
  semilla: number;
  estado: EstadoPrueba;
  /** Por qué no pasó (o por qué una demostración no falló). */
  motivo?: string;
  /** Si falló la primera vez y se re-corrió con otra semilla y 4 veces más réplicas (§8). */
  reintento?: { semilla: number; replicas: number; primerIntento: { simulado: Simulado; z: number | null; errorRelativo: number | null; motivo?: string } };
}

export interface RedCorta {
  etiqueta: string;
  config: ConfigRed;
  /** Sin azar: otra réplica da la misma huella (no entra en R03). */
  determinista?: boolean;
}

export interface Contexto {
  crearMotor: CrearMotor;
  mat: MatematicaDeterminista;
  semilla: number;
  /** Multiplica las réplicas del diseño (1 normalmente; 4 en el reintento). */
  factorReplicas: number;
  suite: Suite;
  /** Todos los casos de la batería (lo usan R01, R03, M01 y M02). */
  casos(): Caso[];
  /** Cada corrida pasa por acá: M02 junta las violaciones de conservación de toda la batería. */
  alCorrer(caso: string, medidas: MedidasRed): void;
  /** Violaciones de conservación vistas hasta ahora (para M02). */
  conservacion(): { corridas: number; violaciones: string[] };
}

/**
 * Una corrida de otro paquete que también entra en R01 (misma semilla y réplica → misma huella) y R03 (otra réplica → otra huella):
 * por ejemplo, el hub chico de P4, que la integración suma con `casosExtra` (§8: «cada caso de la batería y el hub chico»).
 */
export interface Reproducible {
  etiqueta: string;
  /** Corre con el motor dado y devuelve la huella y lo que tiene que repetirse exacto (serializable con JSON). */
  correr(crearMotor: CrearMotor, semilla: number, replica: number): { huella: string; medidas: unknown };
}

export interface Caso {
  id: string;
  titulo: string;
  archivo: string;
  suite: Suite;
  /** Réplicas, horizonte y calentamiento del diseño (en unidades del modelo; informativos para el informe). */
  replicas: number;
  horizonte: number;
  calentamiento: number;
  pruebas: DeclaracionPrueba[];
  /** Versiones cortas (pocos miles de eventos) para R01, R03, M02 y las doradas. */
  cortas: RedCorta[];
  /** Corridas que no son redes de colas y también entran en R01 y R03 (opcional; ver `Reproducible`). */
  reproducibles?: Reproducible[];
  /** Se corre después de todos los demás (M02 necesita ver todas las corridas). */
  alFinal?: boolean;
  correr(ctx: Contexto): ResultadoPrueba[];
}

// ---------------------------------------------------------------------------------------------------------------------
// Ayudas para correr
// ---------------------------------------------------------------------------------------------------------------------

export function replicasDe(ctx: Contexto, base: number): number {
  return Math.max(1, Math.round(base * ctx.factorReplicas));
}

/** Corre n réplicas (0…n−1) de una red con la semilla del contexto y devuelve sus medidas. */
export function replicar(ctx: Contexto, caso: string, config: ConfigRed, n: number): MedidasRed[] {
  const out: MedidasRed[] = [];
  for (let r = 0; r < n; r++) {
    const me = correrRed(ctx.crearMotor, config, ctx.semilla, r);
    ctx.alCorrer(caso, me);
    out.push(me);
  }
  return out;
}

/** La misma red con otro horizonte (y el calentamiento y las observaciones que entren). Para las versiones cortas. */
export function acortar(c: ConfigRed, horizonte: number): ConfigRed {
  const cal = c.calentamiento === undefined ? undefined : Math.min(c.calentamiento, horizonte / 10);
  const out: ConfigRed = { ...c, horizonte };
  if (cal !== undefined) out.calentamiento = cal;
  if (c.observar) out.observar = c.observar.filter((t) => t <= horizonte);
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------
// Criterios
// ---------------------------------------------------------------------------------------------------------------------

function base(caso: Caso, d: DeclaracionPrueba, ctx: Contexto, replicas: number): Omit<ResultadoPrueba, 'simulado' | 'semiancho' | 'semianchoRelativo' | 'z' | 'errorRelativo' | 'n' | 'estado'> {
  return { id: d.id, nombre: d.nombre, familia: d.familia, suite: caso.suite, tipo: d.tipo, dueno: 'P2', caso: caso.id,
    criterio: textoCriterio(d), esperado: d.esperado, replicas, semilla: ctx.semilla };
}

export function textoCriterio(d: DeclaracionPrueba): string {
  const c = d.criterio;
  switch (c.tipo) {
    case 'estadistico':
      // el ee sale de las réplicas: el umbral es t(0,9995; n − 1), que con muchas réplicas es 3,29 (umbralT)
      if (d.esperado === 0) return `|error| ≤ t(0,9995; n − 1) errores estándar (${Z_TXT} con muchas réplicas)`;
      return c.probabilidad
        ? `|error| ≤ t(0,9995; n − 1) ee (${Z_TXT} con muchas réplicas) y error relativo ≤ 2%, con semiancho del 95% ≤ 1% del valor`
        : `|error| ≤ t(0,9995; n − 1) ee (${Z_TXT} con muchas réplicas) y error relativo ≤ 3%, con semiancho del 95% ≤ 2% del valor`;
    case 'z': return `|error| ≤ ${Z_TXT} errores estándar`;
    case 'relativo': return c.tolRel <= 1e-9 ? 'exacto (error relativo ≤ 1e-9)' : `error relativo ≤ ${formatoPct(c.tolRel)}`;
    case 'intervalo': return 'la media cae dentro del intervalo publicado';
    case 'identico': return 'idénticos';
    case 'cobertura-baja': return `tiene que fallar: cobertura < ${formatoPct(c.umbral)}`;
    case 'informativo': return 'informativa (se reporta, no decide)';
  }
}

/** Coma decimal para los textos en español. */
function coma(s: string): string { return s.replace('.', ','); }

function formatoPct(x: number): string {
  const v = Math.round(x * 100 * 1e6) / 1e6;
  return `${String(v).replace('.', ',')}%`;
}

/** Evalúa una prueba estocástica sobre los valores por réplica. */
export function evaluarEstadistico(caso: Caso, d: DeclaracionPrueba, ctx: Contexto, xs: number[]): ResultadoPrueba {
  if (typeof d.esperado !== 'number') throw new Error(`${d.id}: una prueba estadística necesita un esperado numérico y tiene ${JSON.stringify(d.esperado)}`);
  const esp = d.esperado;
  const iv = intervaloMedia(xs, ctx.mat, 0.95);
  const err = iv.media - esp;
  const z = iv.ee > 0 ? err / iv.ee : (err === 0 ? 0 : Infinity);
  const rel = esp !== 0 ? err / esp : null;
  const semRel = esp !== 0 ? iv.semiancho / Math.abs(esp) : null;
  const r: ResultadoPrueba = { ...base(caso, d, ctx, xs.length), simulado: iv.media, semiancho: iv.semiancho, semianchoRelativo: semRel,
    z, errorRelativo: rel, n: iv.n, estado: 'pasa' };
  if (d.tipo === 'informativa' || d.criterio.tipo === 'informativo') { r.estado = 'informativa'; return r; }
  const prob = d.criterio.tipo === 'estadistico' && d.criterio.probabilidad;
  const motivos: string[] = [];
  const umbral = umbralT(iv.n, ctx.mat);
  if (!(Math.abs(z) <= umbral)) motivos.push(`|z| = ${coma(Math.abs(z).toFixed(2))} > ${coma(umbral.toFixed(2))} (t(0,9995; ${iv.n - 1})) (se esperaba ${esp} y salió ${iv.media})`);
  if (rel !== null && d.criterio.tipo === 'estadistico') {
    const tol = prob ? TOL_REL_PROB : TOL_REL;
    if (!(Math.abs(rel) <= tol)) motivos.push(`error relativo ${coma((100 * rel).toFixed(2))}% fuera de ±${100 * tol}%`);
    const smax = prob ? SEMIANCHO_MAX_PROB : SEMIANCHO_MAX;
    if (semRel !== null && !(semRel <= smax)) motivos.push(`precisión insuficiente: semiancho ${coma((100 * semRel).toFixed(2))}% > ${100 * smax}% del valor`);
  }
  if (motivos.length) { r.estado = 'falla'; r.motivo = motivos.join('; '); }
  return r;
}

/** z con error estándar dado (p. ej. la razón varianza/media de un Poisson). */
export function evaluarZ(caso: Caso, d: DeclaracionPrueba, ctx: Contexto, valor: number, ee: number, n: number): ResultadoPrueba {
  const esp = d.esperado as number;
  const err = valor - esp;
  const z = ee > 0 ? err / ee : (err === 0 ? 0 : Infinity);
  const r: ResultadoPrueba = { ...base(caso, d, ctx, n), simulado: valor, semiancho: 1.959963984540054 * ee,
    semianchoRelativo: esp !== 0 ? (1.959963984540054 * ee) / Math.abs(esp) : null, z, errorRelativo: esp !== 0 ? err / esp : null, n, estado: 'pasa' };
  if (!(Math.abs(z) <= Z_MAX)) { r.estado = 'falla'; r.motivo = `|z| = ${coma(Math.abs(z).toFixed(2))} > ${Z_TXT} (se esperaba ${esp} y salió ${valor})`; }
  return r;
}

/** La media de los valores por réplica tiene que caer en el intervalo publicado. */
export function evaluarIntervalo(caso: Caso, d: DeclaracionPrueba, ctx: Contexto, xs: number[]): ResultadoPrueba {
  const iv = intervaloMedia(xs, ctx.mat, 0.95);
  const e = d.esperado as { min: number; max: number };
  const r: ResultadoPrueba = { ...base(caso, d, ctx, xs.length), simulado: iv.media, semiancho: iv.semiancho,
    semianchoRelativo: iv.media !== 0 ? iv.semiancho / Math.abs(iv.media) : null, z: null, errorRelativo: null, n: iv.n, estado: 'pasa' };
  if (d.tipo === 'informativa') { r.estado = 'informativa'; return r; }
  if (!(iv.media >= e.min && iv.media <= e.max)) { r.estado = 'falla'; r.motivo = `la media ${iv.media} quedó fuera de [${e.min}; ${e.max}]`; }
  return r;
}

/** Error relativo contra uno o varios valores exactos (Penny Fab, D01). */
export function evaluarRelativo(caso: Caso, d: DeclaracionPrueba, ctx: Contexto, simulado: number | Record<string, number>, n: number): ResultadoPrueba {
  const tol = d.criterio.tipo === 'relativo' ? d.criterio.tolRel : 1e-9;
  const esp = d.esperado;
  let peor = 0;
  const motivos: string[] = [];
  const comparar = (nombre: string, e: number, s: number) => {
    const rel = e !== 0 ? (s - e) / e : s - e;
    if (Math.abs(rel) > Math.abs(peor) || Number.isNaN(rel)) peor = rel;
    if (!(Math.abs(rel) <= tol)) motivos.push(`${nombre}: se esperaba ${e} y salió ${s} (error relativo ${rel.toExponential(2)} > ${tol})`);
  };
  if (typeof esp === 'number' && typeof simulado === 'number') comparar(d.id, esp, simulado);
  else if (typeof esp === 'object' && typeof simulado === 'object' && !('min' in esp)) {
    for (const [k, e] of Object.entries(esp as Record<string, number>)) comparar(k, e, (simulado as Record<string, number>)[k]);
  } else throw new Error(`${d.id}: esperado y simulado no son comparables (${JSON.stringify(esp)} contra ${JSON.stringify(simulado)})`);
  const r: ResultadoPrueba = { ...base(caso, d, ctx, n), simulado, semiancho: null, semianchoRelativo: null, z: null, errorRelativo: peor, n, estado: 'pasa' };
  if (motivos.length) { r.estado = 'falla'; r.motivo = motivos.join('; '); }
  return r;
}

/** Resultado de una prueba de igualdad (huellas, llegadas) o de ausencia de violaciones. */
export function evaluarIdentico(caso: Caso, d: DeclaracionPrueba, ctx: Contexto, n: number, diferencias: string[], simulado: Simulado): ResultadoPrueba {
  const r: ResultadoPrueba = { ...base(caso, d, ctx, n), simulado, semiancho: null, semianchoRelativo: null, z: null,
    errorRelativo: null, n, estado: diferencias.length === 0 ? 'pasa' : 'falla' };
  if (diferencias.length) r.motivo = `${diferencias.length} diferencia(s); la primera: ${diferencias[0]}`;
  return r;
}

/** Demostración de cobertura: tiene que quedar por debajo del umbral (si queda por encima, la demostración «no falló»). */
export function evaluarCoberturaBaja(caso: Caso, d: DeclaracionPrueba, ctx: Contexto, cubiertos: number, n: number): ResultadoPrueba {
  const umbral = d.criterio.tipo === 'cobertura-baja' ? d.criterio.umbral : 0.9;
  const p = cubiertos / n;
  const ee = Math.sqrt((p * (1 - p)) / n);
  const r: ResultadoPrueba = { ...base(caso, d, ctx, n), simulado: p, semiancho: 1.959963984540054 * ee,
    semianchoRelativo: p > 0 ? (1.959963984540054 * ee) / p : null, z: null, errorRelativo: null, n, estado: 'debe-fallar-ok' };
  if (!(p < umbral)) { r.estado = 'falla'; r.motivo = `la demostración tenía que fallar (cobertura < ${umbral}) y dio ${p}`; }
  return r;
}

/** Busca una declaración por id (error claro si el caso no la declara). */
export function decl(caso: { id: string; pruebas: DeclaracionPrueba[] }, id: string): DeclaracionPrueba {
  const d = caso.pruebas.find((p) => p.id === id);
  if (!d) throw new Error(`el caso ${caso.id} no declara la prueba ${id} (declara: ${caso.pruebas.map((p) => p.id).join(', ')})`);
  return d;
}

// Distribuciones de uso frecuente.
export const exp = (media: number) => ({ tipo: 'exponencial', media }) as const;
export const fija = (valor: number) => ({ tipo: 'fija', valor }) as const;
