// modelo/esquema.ts · P3 · Entrada no confiable y validador escrito a mano (sin dependencias) de todo anden.modelo/1.
// Dos capas:
//   1. copiaSegura: recorre cualquier valor con tope de profundidad y de nodos y devuelve una copia limpia (solo null, booleanos,
//      números finitos, textos, listas y objetos planos); rechaza claves prohibidas, textos largos o con caracteres de control.
//   2. validarEsquema: tipos, requeridos, campos desconocidos, opciones y rangos locales de cada campo, con su JSON Pointer.
// Los chequeos que cruzan campos (referencias, ids, ranuras, capacidades) están en chequeos.ts.
import type { Diagnostico } from '../contratos/modelo.ts';
import { LIMITES_ENLACE } from '../contratos/escena.ts';
import { KPIS } from '../contratos/resultados.ts';
import { CLAVES_PROHIBIDAS, esPunteroValido, escaparToken } from './parches.ts';
import { escalarDeParametro } from './f0.ts';

// ---------------------------------------------------------------------------------------------------------------------------
// Diagnósticos
// ---------------------------------------------------------------------------------------------------------------------------

/** Tope de diagnósticos por compilación: una entrada hostil con miles de errores no llena la memoria ni la pantalla. */
export const MAX_DIAGNOSTICOS = 100;
type Vars = Record<string, string | number>;

export interface Colector {
  readonly lista: Diagnostico[];
  errores: number;
  avisos: number;
  error(codigo: string, ruta: string, caso?: string, vars?: Vars): void;
  aviso(codigo: string, ruta: string, caso?: string, vars?: Vars): void;
  info(codigo: string, ruta: string, caso?: string, vars?: Vars): void;
}

/** Clave i18n de un diagnóstico: `modelo.diag.<código>` o `modelo.diag.<código>.<caso>`. */
export function claveDiag(codigo: string, caso?: string): string {
  return caso ? `modelo.diag.${codigo}.${caso}` : `modelo.diag.${codigo}`;
}

export function crearColector(): Colector {
  const lista: Diagnostico[] = [];
  let lleno = false;
  const c: Colector = {
    lista, errores: 0, avisos: 0,
    error: (codigo, ruta, caso, vars) => agregar('error', codigo, ruta, caso, vars),
    aviso: (codigo, ruta, caso, vars) => agregar('aviso', codigo, ruta, caso, vars),
    info: (codigo, ruta, caso, vars) => agregar('info', codigo, ruta, caso, vars),
  };
  function agregar(nivel: Diagnostico['nivel'], codigo: string, ruta: string, caso?: string, vars?: Vars): void {
    if (nivel === 'error') c.errores++;
    if (nivel === 'aviso') c.avisos++;
    if (lleno) return;
    if (lista.length >= MAX_DIAGNOSTICOS - 1 && nivel !== 'info') {
      lleno = true;
      lista.push({ codigo: 'E-ESQUEMA', nivel: 'error', ruta: '', clave: claveDiag('E-ESQUEMA', 'demasiados'), vars: { max: MAX_DIAGNOSTICOS } });
      return;
    }
    const d: Diagnostico = { codigo, nivel, ruta, clave: claveDiag(codigo, caso) };
    if (vars) d.vars = vars;
    lista.push(d);
  }
  return c;
}

/** Redondeo para mostrar un número dentro de un diagnóstico (determinista, sin depender del idioma). */
export function cifra(x: number, decimales = 6): number | string {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : 'NaN';
  const f = [1, 10, 100, 1000, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9][decimales] ?? 1e6;
  return Math.round(x * f) / f;
}

// ---------------------------------------------------------------------------------------------------------------------------
// Copia segura de entradas no confiables
// ---------------------------------------------------------------------------------------------------------------------------

export interface LimitesEntrada {
  maxProfundidadJson: number;
  maxNodosJson: number;
  maxLargoTexto: number;
}

export type CasoFallo = 'profundidad' | 'nodos' | 'clave-prohibida' | 'no-finito' | 'texto-largo' | 'texto-control' | 'no-plano' | 'tipo-no-json';
export interface FalloEntrada { caso: CasoFallo; ruta: string; vars?: Vars }

/**
 * Caracteres que no puede tener ningún texto: controles C0 y C1, separadores de línea y de párrafo, marcas de dirección que permiten
 * disfrazar un texto (U+202A–U+202E, U+2066–U+2069) y sustitutos sueltos (UTF-16 inválido: dos textos distintos darían la misma huella).
 */
const RE_CONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/;

/** null si el texto es aceptable; si no, por qué no. */
export function revisarTexto(s: string, maxLargo: number = LIMITES_ENLACE.maxLargoTexto): { caso: 'texto-largo' | 'texto-control'; vars: Vars } | null {
  if (s.length > maxLargo) return { caso: 'texto-largo', vars: { largo: s.length, max: maxLargo } };
  const m = RE_CONTROL.exec(s);
  if (m) return { caso: 'texto-control', vars: { posicion: m.index, codigo: 'U+' + s.charCodeAt(m.index).toString(16).toUpperCase().padStart(4, '0') } };
  return null;
}

class FalloCopia extends Error {
  readonly fallo: FalloEntrada;
  constructor(fallo: FalloEntrada) { super(fallo.caso); this.fallo = fallo; }
}

/**
 * Copia limpia de un valor no confiable. Sin recursión ilimitada: corta en `maxProfundidadJson` niveles de contenedores y en
 * `maxNodosJson` nodos. Un objeto cuyo prototipo no es Object.prototype (o null), un getter que lanza o un Proxy cuentan como
 * «no-plano». Las propiedades con valor undefined se omiten; −0 pasa a 0.
 */
export function copiaSegura(x: unknown, lim: LimitesEntrada = LIMITES_ENLACE): { ok: true; valor: unknown; nodos: number } | { ok: false; fallo: FalloEntrada } {
  let nodos = 0;
  const copiar = (v: unknown, ruta: string, prof: number): unknown => {
    if (++nodos > lim.maxNodosJson) throw new FalloCopia({ caso: 'nodos', ruta, vars: { max: lim.maxNodosJson } });
    switch (typeof v) {
      case 'string': {
        const r = revisarTexto(v, lim.maxLargoTexto);
        if (r) throw new FalloCopia({ caso: r.caso, ruta, vars: r.vars });
        return v;
      }
      case 'number':
        if (!Number.isFinite(v)) throw new FalloCopia({ caso: 'no-finito', ruta });
        return v === 0 ? 0 : v;
      case 'boolean':
        return v;
      case 'object': {
        if (v === null) return null;
        if (prof >= lim.maxProfundidadJson) throw new FalloCopia({ caso: 'profundidad', ruta, vars: { max: lim.maxProfundidadJson } });
        if (Array.isArray(v)) {
          if (Object.getPrototypeOf(v) !== Array.prototype) throw new FalloCopia({ caso: 'no-plano', ruta });
          const n = v.length, out: unknown[] = [];
          for (let i = 0; i < n; i++) {
            const e = v[i];
            if (e === undefined) throw new FalloCopia({ caso: 'tipo-no-json', ruta: `${ruta}/${i}`, vars: { recibido: 'undefined' } });
            out.push(copiar(e, `${ruta}/${i}`, prof + 1));
          }
          return out;
        }
        const proto = Object.getPrototypeOf(v);
        if (proto !== Object.prototype && proto !== null) throw new FalloCopia({ caso: 'no-plano', ruta });
        const out: Record<string, unknown> = {};
        for (const k of Object.keys(v)) {
          const rk = `${ruta}/${escaparToken(k)}`;
          if (CLAVES_PROHIBIDAS.has(k)) throw new FalloCopia({ caso: 'clave-prohibida', ruta: rk, vars: { clave: k } });
          const r = revisarTexto(k, lim.maxLargoTexto);
          if (r) throw new FalloCopia({ caso: r.caso, ruta: rk, vars: r.vars });
          const e = (v as Record<string, unknown>)[k];
          if (e === undefined) continue;
          out[k] = copiar(e, rk, prof + 1);
        }
        return out;
      }
      default:
        throw new FalloCopia({ caso: 'tipo-no-json', ruta, vars: { recibido: typeof v } });
    }
  };
  try {
    const valor = copiar(x, '', 0);
    return { ok: true, valor, nodos };
  } catch (e) {
    if (e instanceof FalloCopia) return { ok: false, fallo: e.fallo };
    if (e instanceof RangeError) return { ok: false, fallo: { caso: 'profundidad', ruta: '', vars: { max: lim.maxProfundidadJson } } };
    return { ok: false, fallo: { caso: 'no-plano', ruta: '' } };
  }
}

/** Profundidad de anidamiento de un texto JSON sin parsearlo (corta apenas pasa del tope). -1 si lo pasa. */
export function profundidadTextoJson(texto: string, max: number): number {
  let prof = 0, maxVisto = 0, enTexto = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto.charCodeAt(i);
    if (enTexto) {
      if (ch === 92) i++; // «\»: salta el carácter escapado
      else if (ch === 34) enTexto = false;
    } else if (ch === 34) enTexto = true;
    else if (ch === 91 || ch === 123) { if (++prof > max) return -1; if (prof > maxVisto) maxVisto = prof; }
    else if (ch === 93 || ch === 125) prof--;
  }
  return maxVisto;
}

export type ErrorJson = 'json-profundo' | 'json-invalido' | 'esquema';
/**
 * Parseo con tope de profundidad (antes de JSON.parse, sobre el texto) y de nodos, claves prohibidas, números no finitos y textos
 * (después, con la copia segura). Sirve para el enlace y para el JSON que se escribe en el modo ingeniero.
 */
export function parsearJsonSeguro(texto: string, lim: LimitesEntrada = LIMITES_ENLACE):
  { ok: true; valor: unknown } | { ok: false; error: ErrorJson; detalle: string; fallo?: FalloEntrada } {
  if (profundidadTextoJson(texto, lim.maxProfundidadJson) < 0) {
    return { ok: false, error: 'json-profundo', detalle: `profundidad: más de ${lim.maxProfundidadJson} niveles` };
  }
  let crudo: unknown;
  try {
    crudo = JSON.parse(texto);
  } catch (e) {
    return { ok: false, error: 'json-invalido', detalle: (e as Error).message };
  }
  const c = copiaSegura(crudo, lim);
  if (!c.ok) {
    const error: ErrorJson = c.fallo.caso === 'profundidad' || c.fallo.caso === 'nodos' ? 'json-profundo' : 'esquema';
    return { ok: false, error, detalle: `${c.fallo.caso} en ${c.fallo.ruta || '(raíz)'}`, fallo: c.fallo };
  }
  return { ok: true, valor: c.valor };
}

// ---------------------------------------------------------------------------------------------------------------------------
// Mini-lenguaje de reglas
// ---------------------------------------------------------------------------------------------------------------------------

type Opcional = { opcional?: boolean };
export type Regla =
  | (Opcional & { t: 'texto'; patron?: RegExp; caso?: string })
  | (Opcional & { t: 'numero'; min?: number; max?: number; mayorQue?: number; entero?: boolean })
  | (Opcional & { t: 'bool' })
  | (Opcional & { t: 'opcion'; valores: readonly (string | number | boolean)[]; codigo?: string; caso?: string })
  | (Opcional & { t: 'obj'; campos: Readonly<Record<string, Regla>> })
  | (Opcional & { t: 'lista'; de: Regla; min?: number; max?: number })
  | (Opcional & { t: 'dicc'; de: Regla; clave: RegExp; caso: string })
  | (Opcional & { t: 'num' })
  | (Opcional & { t: 'dist' })
  | (Opcional & { t: 'hora' })
  | (Opcional & { t: 'a-medida'; f: (v: unknown, ruta: string, c: Colector) => void });

export const RE_NOMBRE_PARAMETRO = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
export const RE_REF = /^@[A-Za-z][A-Za-z0-9_]{0,63}$/;
export const RE_ID_PLANTILLA = /^[a-z0-9][a-z0-9-]{0,63}$/;
export const RE_VERSION = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;
const RE_ID = /^(?=.*\S)[^]{1,64}$/u;
const RE_FECHA = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const RE_URL = /^https?:\/\/\S+$/i;
const RE_NO_VACIO = /\S/;
const RE_HORA = /^(\d{2}):(\d{2})$/;

export const ETIQUETAS = ['HECHO', 'MEDIDO', 'ESTIMACION', 'HIPOTESIS', 'SUPUESTO', 'DATO_USUARIO'] as const;
export const CONFIANZAS = [0.9, 0.95, 0.99] as const;

export function tipoJson(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'lista';
  switch (typeof v) {
    case 'string': return 'texto';
    case 'number': return 'numero';
    case 'boolean': return 'booleano';
    case 'object': return 'objeto';
    default: return typeof v;
  }
}

function esObjeto(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function tipoMal(c: Colector, ruta: string, esperado: string, v: unknown): void {
  c.error('E-ESQUEMA', ruta, `tipo-${esperado}`, { recibido: tipoJson(v) });
}

/** Aplica una regla y deja los diagnósticos en el colector. */
export function validar(r: Regla, v: unknown, ruta: string, c: Colector): void {
  switch (r.t) {
    case 'texto':
      if (typeof v !== 'string') return tipoMal(c, ruta, 'texto', v);
      if (r.patron && !r.patron.test(v)) c.error('E-ESQUEMA', ruta, r.caso ?? 'formato');
      return;
    case 'numero':
      if (typeof v !== 'number') return tipoMal(c, ruta, 'numero', v);
      revisarNumero(r, v, ruta, c);
      return;
    case 'bool':
      if (typeof v !== 'boolean') tipoMal(c, ruta, 'booleano', v);
      return;
    case 'opcion':
      if (!r.valores.includes(v as string | number | boolean)) {
        c.error(r.codigo ?? 'E-ESQUEMA', ruta, r.caso ?? 'opcion', { valor: typeof v === 'string' || typeof v === 'number' ? v : tipoJson(v), opciones: r.valores.join(' | ') });
      }
      return;
    case 'obj': {
      if (!esObjeto(v)) return tipoMal(c, ruta, 'objeto', v);
      for (const k of Object.keys(r.campos)) {
        const sub = r.campos[k];
        if (!Object.hasOwn(v, k)) { if (!sub.opcional) c.error('E-ESQUEMA', `${ruta}/${escaparToken(k)}`, 'requerido', { campo: k }); continue; }
        validar(sub, v[k], `${ruta}/${escaparToken(k)}`, c);
      }
      for (const k of Object.keys(v)) {
        if (!Object.hasOwn(r.campos, k)) c.error('E-ESQUEMA', `${ruta}/${escaparToken(k)}`, 'campo-desconocido', { campo: k });
      }
      return;
    }
    case 'lista': {
      if (!Array.isArray(v)) return tipoMal(c, ruta, 'lista', v);
      if (r.min !== undefined && v.length < r.min) c.error('E-ESQUEMA', ruta, 'lista-corta', { min: r.min, largo: v.length });
      if (r.max !== undefined && v.length > r.max) c.error('E-ESQUEMA', ruta, 'lista-larga', { max: r.max, largo: v.length });
      for (let i = 0; i < v.length; i++) validar(r.de, v[i], `${ruta}/${i}`, c);
      return;
    }
    case 'dicc': {
      if (!esObjeto(v)) return tipoMal(c, ruta, 'objeto', v);
      for (const k of Object.keys(v)) {
        const rk = `${ruta}/${escaparToken(k)}`;
        if (!r.clave.test(k)) { c.error('E-ESQUEMA', rk, r.caso, { nombre: k }); continue; }
        validar(r.de, v[k], rk, c);
      }
      return;
    }
    case 'num':
      if (typeof v === 'number') return;
      if (typeof v === 'string' && RE_REF.test(v)) return;
      return tipoMal(c, ruta, 'num', v);
    case 'dist':
      if (typeof v === 'string' && RE_REF.test(v)) return;
      if (esObjeto(v)) return validarDistribucion(v, ruta, c);
      return tipoMal(c, ruta, 'dist', v);
    case 'hora': {
      if (typeof v !== 'string') return tipoMal(c, ruta, 'texto', v);
      const m = RE_HORA.exec(v);
      if (!m || Number(m[1]) > 47 || Number(m[2]) > 59) c.error('E-HORAS', ruta, 'formato', { valor: v.length > 16 ? v.slice(0, 16) + '…' : v });
      return;
    }
    case 'a-medida':
      r.f(v, ruta, c);
      return;
  }
}

function revisarNumero(r: { min?: number; max?: number; mayorQue?: number; entero?: boolean }, v: number, ruta: string, c: Colector): void {
  if (r.entero && !Number.isInteger(v)) c.error('E-RANGO', ruta, 'entero', { valor: v });
  if (r.mayorQue !== undefined && !(v > r.mayorQue)) c.error('E-RANGO', ruta, 'mayor-que', { valor: v, min: r.mayorQue });
  if (r.min !== undefined && v < r.min) c.error('E-RANGO', ruta, 'minimo', { valor: v, min: r.min });
  if (r.max !== undefined && v > r.max) c.error('E-RANGO', ruta, 'maximo', { valor: v, max: r.max });
}

// ---------------------------------------------------------------------------------------------------------------------------
// Distribuciones (contratos/azar.ts) y parámetros
// ---------------------------------------------------------------------------------------------------------------------------

const N: Regla = { t: 'numero' };
const N_OPC: Regla = { t: 'numero', opcional: true };
const LISTA_N: Regla = { t: 'lista', de: N, min: 1 };
const CAMPOS_DIST: Record<string, Record<string, Regla>> = {
  fija: { valor: N },
  uniforme: { min: N, max: N },
  exponencial: { media: N },
  triangular: { min: N, moda: N, max: N },
  lognormal: { media: N, cv: N },
  normal: { media: N, desvio: N, min: N_OPC, max: N_OPC },
  erlang: { k: N, media: N },
  weibull: { forma: N, escala: N },
  bernoulli: { p: N },
  discreta: { valores: LISTA_N, pesos: LISTA_N },
  empirica: { valores: LISTA_N },
};
export const TIPOS_DISTRIBUCION = Object.keys(CAMPOS_DIST);
/** Máximo de fases de una Erlang: cada una consume un uniforme y una dirección tiene 512 (256 bloques Philox de 2). */
export const MAX_K_ERLANG = 512;

function orden(c: Colector, ruta: string, a: string, va: number, b: string, vb: number, estricto = false): void {
  if (estricto ? !(va < vb) : !(va <= vb)) c.error('E-RANGO', ruta, estricto ? 'orden-estricto' : 'orden', { a, b, valorA: va, valorB: vb });
}

/** Valida una distribución: tipo conocido, campos exactos y parámetros válidos para la fórmula de §6.6. */
export function validarDistribucion(v: Record<string, unknown>, ruta: string, c: Colector): void {
  const tipo = v.tipo;
  if (typeof tipo !== 'string' || !Object.hasOwn(CAMPOS_DIST, tipo)) {
    c.error('E-ESQUEMA', `${ruta}/tipo`, 'opcion', { valor: typeof tipo === 'string' ? tipo : tipoJson(tipo), opciones: TIPOS_DISTRIBUCION.join(' | ') });
    return;
  }
  const antes = c.errores;
  validar({ t: 'obj', campos: { tipo: { t: 'texto' }, ...CAMPOS_DIST[tipo] } }, v, ruta, c);
  if (c.errores > antes) return;
  const n = v as Record<string, number>;
  switch (tipo) {
    case 'uniforme': orden(c, ruta, 'min', n.min, 'max', n.max); break;
    case 'exponencial': revisarNumero({ mayorQue: 0 }, n.media, `${ruta}/media`, c); break;
    case 'triangular':
      orden(c, ruta, 'min', n.min, 'moda', n.moda); orden(c, ruta, 'moda', n.moda, 'max', n.max); orden(c, ruta, 'min', n.min, 'max', n.max, true);
      break;
    case 'lognormal': revisarNumero({ mayorQue: 0 }, n.media, `${ruta}/media`, c); revisarNumero({ min: 0 }, n.cv, `${ruta}/cv`, c); break;
    case 'normal':
      revisarNumero({ min: 0 }, n.desvio, `${ruta}/desvio`, c);
      if (typeof n.min === 'number' && typeof n.max === 'number') orden(c, ruta, 'min', n.min, 'max', n.max);
      break;
    case 'erlang': revisarNumero({ entero: true, min: 1, max: MAX_K_ERLANG }, n.k, `${ruta}/k`, c); revisarNumero({ mayorQue: 0 }, n.media, `${ruta}/media`, c); break;
    case 'weibull': revisarNumero({ mayorQue: 0 }, n.forma, `${ruta}/forma`, c); revisarNumero({ mayorQue: 0 }, n.escala, `${ruta}/escala`, c); break;
    case 'bernoulli': revisarNumero({ min: 0, max: 1 }, n.p, `${ruta}/p`, c); break;
    case 'discreta': {
      const valores = v.valores as number[], pesos = v.pesos as number[];
      if (valores.length !== pesos.length) { c.error('E-RANGO', `${ruta}/pesos`, 'largos-distintos', { valores: valores.length, pesos: pesos.length }); break; }
      let s = 0;
      for (let i = 0; i < pesos.length; i++) { revisarNumero({ min: 0 }, pesos[i], `${ruta}/pesos/${i}`, c); s += pesos[i]; }
      if (!(s > 0)) c.error('E-RANGO', `${ruta}/pesos`, 'pesos-cero');
      break;
    }
    case 'empirica': {
      const valores = v.valores as number[];
      for (let i = 1; i < valores.length; i++) if (valores[i] < valores[i - 1]) { c.error('E-RANGO', `${ruta}/valores/${i}`, 'empirica-orden'); break; }
      break;
    }
  }
}

const REGLA_PARAMETRO_CAMPOS: Record<string, Regla> = {
  valor: { t: 'a-medida', f: (v, ruta, c) => {
    if (typeof v === 'number') return;
    if (esObjeto(v)) return validarDistribucion(v, ruta, c);
    tipoMal(c, ruta, 'valor', v);
  } },
  unidad: { t: 'texto' },
  etiqueta: { t: 'opcion', valores: ETIQUETAS },
  fuente: { t: 'texto' },
  url: { t: 'texto', opcional: true, patron: RE_URL, caso: 'url' },
  fecha: { t: 'texto', patron: RE_FECHA, caso: 'fecha' },
  nota: { t: 'texto', opcional: true },
  rango: { t: 'lista', de: N, min: 2, max: 2, opcional: true },
  incierto: { t: 'obj', opcional: true, campos: {
    bajo: N, medio: N, alto: N,
    pesos: { t: 'lista', de: { t: 'numero', min: 0 }, min: 3, max: 3, opcional: true },
  } },
  pregunta: { t: 'texto', opcional: true },
  golpeDiscreto: { t: 'bool', opcional: true },
};

/** Tolerancia relativa para comparar el valor del parámetro con su `incierto.medio`. */
const TOL = 1e-9;

function validarParametro(v: unknown, ruta: string, c: Colector): void {
  const antes = c.errores;
  validar({ t: 'obj', campos: REGLA_PARAMETRO_CAMPOS }, v, ruta, c);
  if (c.errores > antes) return;
  const p = v as { valor: number | { tipo: string }; rango?: [number, number]; incierto?: { bajo: number; medio: number; alto: number; pesos?: number[] } };
  const x = escalarDeParametro(p as Parameters<typeof escalarDeParametro>[0]);
  if (p.rango) {
    const [lo, hi] = p.rango;
    if (!(lo <= hi)) c.error('E-RANGO', `${ruta}/rango`, 'orden', { a: 'rango[0]', b: 'rango[1]', valorA: lo, valorB: hi });
    else if (!(x >= lo && x <= hi)) c.error('E-RANGO', `${ruta}/valor`, 'fuera-de-rango', { valor: cifra(x), min: lo, max: hi });
  }
  const inc = p.incierto;
  if (inc) {
    orden(c, `${ruta}/incierto`, 'bajo', inc.bajo, 'medio', inc.medio);
    orden(c, `${ruta}/incierto`, 'medio', inc.medio, 'alto', inc.alto);
    if (inc.pesos) {
      const s = inc.pesos[0] + inc.pesos[1] + inc.pesos[2];
      if (Math.abs(s - 1) > TOL) c.error('E-RANGO', `${ruta}/incierto/pesos`, 'pesos-incierto', { suma: cifra(s) });
    }
    if (p.rango && p.rango[0] <= p.rango[1]) {
      for (const k of ['bajo', 'medio', 'alto'] as const) {
        if (!(inc[k] >= p.rango[0] && inc[k] <= p.rango[1])) {
          c.error('E-RANGO', `${ruta}/incierto/${k}`, 'incierto-fuera', { valor: inc[k], min: p.rango[0], max: p.rango[1] });
        }
      }
    }
    if (Math.abs(inc.medio - x) > TOL * Math.max(1, Math.abs(x))) {
      c.aviso('A-INCIERTO', `${ruta}/incierto/medio`, undefined, { medio: inc.medio, valor: cifra(x) });
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// El esquema anden.modelo/1 (contratos/modelo.ts)
// ---------------------------------------------------------------------------------------------------------------------------

const ID: Regla = { t: 'texto', patron: RE_ID, caso: 'id' };
const TEXTO: Regla = { t: 'texto' };
const TEXTO_OPC: Regla = { t: 'texto', opcional: true };
const NO_VACIO: Regla = { t: 'texto', patron: RE_NO_VACIO, caso: 'texto-vacio' };
const PUNTO: Regla = { t: 'lista', de: N, min: 2, max: 2 };
const POSITIVO: Regla = { t: 'numero', mayorQue: 0 };
const NO_NEGATIVO: Regla = { t: 'numero', min: 0 };
const ENTERO_NO_NEG: Regla = { t: 'numero', entero: true, min: 0 };
const KPI: Regla = { t: 'opcion', valores: KPIS };
const CONFIANZA: Regla = { t: 'opcion', valores: CONFIANZAS, codigo: 'E-RANGO', caso: 'confianza' };
const PUNTERO: Regla = { t: 'a-medida', f: (v, ruta, c) => {
  if (typeof v !== 'string') return tipoMal(c, ruta, 'texto', v);
  if (!esPunteroValido(v)) c.error('E-ESQUEMA', ruta, 'puntero');
} };
const PAUSAS: Regla = { t: 'obj', campos: { duracion: NO_NEGATIVO, cada: POSITIVO, primera: NO_NEGATIVO, escalon: NO_NEGATIVO } };

/** Máximo de escenarios por modelo: cada uno se compila al compilar el modelo (chequeos.ts). */
export const MAX_ESCENARIOS = 50;
/** Máximo de operaciones de un parche (escenario o enlace). */
export const MAX_OPERACIONES_PARCHE = 200;

const OPERACION: Regla = { t: 'a-medida', f: (v, ruta, c) => {
  if (!esObjeto(v)) return tipoMal(c, ruta, 'objeto', v);
  const antes = c.errores;
  validar({ t: 'opcion', valores: ['add', 'remove', 'replace', 'test'] }, v.op, `${ruta}/op`, c);
  if (c.errores > antes) return;
  const conValor = v.op !== 'remove';
  validar({ t: 'obj', campos: { op: TEXTO, path: PUNTERO, ...(conValor ? { value: { t: 'a-medida', f: () => {} } } : {}) } }, v, ruta, c);
} };
export const REGLA_PARCHE: Regla = { t: 'lista', de: OPERACION, max: MAX_OPERACIONES_PARCHE };

const CAMIONES: Regla = { t: 'a-medida', f: (v, ruta, c) => {
  if (Array.isArray(v)) {
    validar({ t: 'lista', min: 1, de: { t: 'obj', campos: { id: ID, turno: { t: 'hora' }, paquetes: ENTERO_NO_NEG } } }, v, ruta, c);
    return;
  }
  if (!esObjeto(v)) return tipoMal(c, ruta, 'camiones', v);
  validar({ t: 'obj', campos: {
    serie: { t: 'opcion', valores: [true] },
    cantidad: { t: 'numero', entero: true, min: 1 },
    primero: { t: 'hora' },
    cada: NO_NEGATIVO,
    paquetes: ENTERO_NO_NEG,
  } }, v, ruta, c);
} };

const ASIGNACION: Regla = { t: 'a-medida', f: (v, ruta, c) => {
  if (typeof v === 'string') return validar({ t: 'opcion', valores: ['por-volumen', 'contiguas'] }, v, ruta, c);
  if (Array.isArray(v)) return validar({ t: 'lista', de: { t: 'lista', de: ID } }, v, ruta, c);
  tipoMal(c, ruta, 'asignacion', v);
} };

const NOCHE_MOSTRADA: Regla = { t: 'a-medida', f: (v, ruta, c) => {
  if (typeof v === 'number') return revisarNumero({ entero: true, min: 0 }, v, ruta, c);
  validar({ t: 'opcion', valores: ['mediana', 'peor'] }, v, ruta, c);
} };

export const REGLA_MODELO: Regla = { t: 'obj', campos: {
  esquema: { t: 'opcion', valores: ['anden.modelo/1'], caso: 'esquema-desconocido' },
  familia: { t: 'opcion', valores: ['hub-lazo'], caso: 'familia-desconocida' },
  id: ID,
  titulo: NO_VACIO,
  descripcion: TEXTO_OPC,
  autor: TEXTO_OPC,
  licencia: TEXTO_OPC,
  creado: { t: 'texto', opcional: true, patron: RE_FECHA, caso: 'fecha' },
  plantilla: { t: 'obj', opcional: true, campos: {
    id: { t: 'texto', patron: RE_ID_PLANTILLA, caso: 'plantilla-id' },
    version: { t: 'texto', patron: RE_VERSION, caso: 'plantilla-version' },
  } },
  unidades: { t: 'obj', campos: {
    tiempo: { t: 'opcion', valores: ['s'] },
    largo: { t: 'opcion', valores: ['m'] },
    moneda: { t: 'opcion', valores: ['ARS', 'USD'] },
  } },
  parametros: { t: 'dicc', de: { t: 'a-medida', f: validarParametro }, clave: RE_NOMBRE_PARAMETRO, caso: 'nombre-parametro' },
  procedencia: { t: 'dicc', opcional: true, clave: /^\/(?:[^~]|~[01])*$/, caso: 'puntero', de: { t: 'obj', campos: {
    etiqueta: { t: 'opcion', valores: ETIQUETAS }, fuente: TEXTO, fecha: { t: 'texto', opcional: true, patron: RE_FECHA, caso: 'fecha' },
  } } },
  calendario: { t: 'obj', campos: { inicio: { t: 'hora' }, fin: { t: 'hora' }, corte: { t: 'hora' } } },
  demanda: { t: 'obj', campos: {
    camiones: CAMIONES,
    desvio: { t: 'dist' },
    errorPronostico: { t: 'obj', campos: { cv: { t: 'num' } } },
    atrasoComun: { t: 'obj', campos: { probabilidad: { t: 'num' }, demora: { t: 'dist' } } },
    papeleo: { t: 'num' },
  } },
  hub: { t: 'obj', campos: {
    andenes: { t: 'lista', min: 1, de: { t: 'obj', campos: { id: ID, x: N, y: N, personas: { t: 'numero', entero: true, min: 1 } } } },
    playa: { t: 'obj', campos: { capacidad: ENTERO_NO_NEG } },
    cintas: { t: 'lista', min: 1, de: { t: 'obj', campos: {
      id: ID, desde: ID, velocidad: POSITIVO, paso: POSITIVO, puntos: { t: 'lista', de: PUNTO, min: 2 },
    } } },
    acumulacion: { t: 'obj', campos: { largo: POSITIVO, paso: POSITIVO, x: N, y: N } },
    sorter: { t: 'obj', campos: {
      id: ID,
      tipo: { t: 'opcion', valores: ['bandeja-basculante', 'banda-cruzada'] },
      forma: { t: 'opcion', valores: ['estadio'] },
      recta: NO_NEGATIVO,
      radio: POSITIVO,
      origen: PUNTO,
      paso: POSITIVO,
      velocidad: POSITIVO,
      maxVueltas: { t: 'numero', entero: true, min: 0, max: 1000 },
      lector: { t: 'obj', campos: { s: NO_NEGATIVO, noLeido: { t: 'num' } } },
      paradas: { t: 'obj', campos: { activas: { t: 'bool' }, entre: { t: 'dist' }, duracion: { t: 'dist' } } },
    } },
    induccion: { t: 'obj', campos: {
      puestos: { t: 'lista', min: 1, de: { t: 'obj', campos: { id: ID, s: NO_NEGATIVO } } },
      tiempo: { t: 'dist' },
    } },
    rampas: { t: 'lista', min: 1, de: { t: 'obj', campos: {
      id: ID, s: NO_NEGATIVO, lado: { t: 'opcion', valores: [-1, 1] }, capacidad: ENTERO_NO_NEG,
    } } },
    excepcion: { t: 'obj', campos: { id: ID, s: NO_NEGATIVO } },
    planClasificacion: { t: 'obj', campos: {
      rutas: { t: 'lista', min: 1, de: { t: 'obj', campos: { id: ID, peso: NO_NEGATIVO, rampas: { t: 'lista', de: ID } } } },
      multiRampa: { t: 'opcion', valores: ['alternar', 'la-menos-llena'] },
    } },
    perfilPaquete: { t: 'obj', campos: {
      clases: { t: 'lista', min: 1, de: { t: 'obj', campos: {
        id: ID, fraccion: { t: 'numero', min: 0, max: 1 }, bandejas: { t: 'opcion', valores: [1, 2] }, transportable: { t: 'bool' },
      } } },
    } },
    jaulas: { t: 'obj', campos: { capacidad: { t: 'numero', entero: true, min: 1 }, cierre: { t: 'num' } } },
  } },
  personas: { t: 'obj', campos: {
    induccion: { t: 'obj', campos: {
      puestosActivos: ENTERO_NO_NEG, temporarios: ENTERO_NO_NEG, reten: ENTERO_NO_NEG, antiguedadSemanas: NO_NEGATIVO,
      ausentismo: { t: 'num' }, eficienciaTemporario: { t: 'num' }, pausas: PAUSAS,
    } },
    descarga: { t: 'obj', campos: { ritmo: { t: 'dist' } } },
    rampa: { t: 'obj', campos: {
      cantidad: ENTERO_NO_NEG,
      asignacion: ASIGNACION,
      regla: { t: 'opcion', valores: ['la-mas-llena', 'la-que-se-llena-antes', 'en-orden'] },
      manejo: { t: 'dist' }, caminar: { t: 'num' }, pausas: PAUSAS, ausentismo: { t: 'num' },
    } },
    excepcion: { t: 'obj', campos: { cantidad: { t: 'numero', entero: true, min: 1 }, tiempo: { t: 'dist' } } },
    fatiga: { t: 'obj', campos: { activa: { t: 'bool' }, maximo: { t: 'num' }, tau: { t: 'num' } } },
  } },
  costos: { t: 'obj', campos: { horaPersona: { t: 'num' }, fijoNoche: { t: 'num' }, moneda: { t: 'opcion', valores: ['ARS', 'USD'] } } },
  decision: { t: 'obj', opcional: true, campos: {
    id: ID,
    pregunta: NO_VACIO,
    tipo: { t: 'opcion', valores: ['dotacion'] },
    variable: { t: 'obj', campos: { ruta: PUNTERO, min: { t: 'numero', entero: true }, max: { t: 'numero', entero: true } } },
    restriccion: { t: 'obj', campos: {
      kpi: KPI, comparador: { t: 'opcion', valores: ['<=', '>='] }, umbral: N,
      probabilidadMinima: { t: 'numero', mayorQue: 0, max: 1 }, dichoComo: TEXTO,
    } },
    objetivo: { t: 'obj', campos: { minimizar: KPI } },
    indiferencia: { t: 'obj', campos: { kpi: KPI, valor: NO_NEGATIVO } },
    confianza: CONFIANZA,
  } },
  escenarios: { t: 'lista', opcional: true, max: MAX_ESCENARIOS, de: { t: 'obj', campos: { id: ID, titulo: NO_VACIO, parche: REGLA_PARCHE } } },
  experimento: { t: 'obj', campos: {
    semilla: { t: 'numero', entero: true, min: 0, max: 4294967295 },
    replicasMin: { t: 'numero', entero: true, min: 1, max: 10000 },
    replicasMax: { t: 'numero', entero: true, min: 1, max: 10000 },
    confianza: CONFIANZA,
    precision: { t: 'obj', opcional: true, campos: { kpi: KPI, relativa: { t: 'numero', mayorQue: 0, max: 1 } } },
    nochesEscena: { t: 'numero', entero: true, min: 1, max: 10000 },
    nocheMostrada: NOCHE_MOSTRADA,
    kpiNoche: KPI,
  } },
} };

/** Valida la forma completa de un modelo ya copiado con copiaSegura. Devuelve true si no hubo errores. */
export function validarEsquema(v: unknown, c: Colector): boolean {
  const antes = c.errores;
  if (esObjeto(v) && Object.hasOwn(v, 'esquema') && v.esquema !== 'anden.modelo/1') {
    // Con otro esquema no tiene sentido revisar campo por campo: un solo diagnóstico claro.
    c.error('E-ESQUEMA', '/esquema', 'esquema-desconocido', { valor: typeof v.esquema === 'string' ? v.esquema : tipoJson(v.esquema), opciones: 'anden.modelo/1' });
    return false;
  }
  validar(REGLA_MODELO, v, '', c);
  return c.errores === antes;
}
