// modelo/enlace.ts · P3 · El enlace endurecido: la escena viaja en el fragmento (#), nunca llega a un servidor, y ningún enlace
// hostil puede colgar el teléfono de quien lo abre.
//
// Formato del fragmento (sin «#»; contratos/escena.ts):
//   m=<modelo>[&r=<receta>]            modelo completo
//   t=<id>@<versión>[&p=<parche>][&r=<receta>]   plantilla publicada + parche RFC 6902
//   r=<receta>                          solo la receta
// <modelo> y <parche>: JSON canónico → deflate-raw (CompressionStream) → base64url.
// <receta>: binario compacto v1 → base64url (≈ 40 caracteres; diseño en NOTAS-CONTRATO.md §5).
//
// Al decodificar, en este orden: largo del fragmento (maxCaracteres) → claves y alfabeto base64url → descompresión con contador de
// bytes que corta en maxBytesDescomprimidos → UTF-8 estricto → profundidad sobre el texto → JSON.parse → nodos, claves prohibidas,
// números y textos (copia segura) → compilación (esquema, chequeos) → presupuesto. Nunca lanza: devuelve el error del contrato.
import type { Enlace, ErrorEnlace, CodecEnlace, CrearCodec, ResolverPlantilla } from '../contratos/escena.ts';
import { LIMITES_ENLACE } from '../contratos/escena.ts';
import type { Receta } from '../contratos/experimentos.ts';
import type { Diagnostico, Modelo, OpParche } from '../contratos/modelo.ts';
import { jsonCanonico } from './canonico.ts';
import { compilar } from './compilar.ts';
import { crearColector, parsearJsonSeguro, REGLA_PARCHE, RE_ID_PLANTILLA, RE_VERSION, revisarTexto, validar } from './esquema.ts';
import { aplicarParche } from './parches.ts';

// ---------------------------------------------------------------------------------------------------------------------------
// base64url (RFC 4648 §5, sin relleno)
// ---------------------------------------------------------------------------------------------------------------------------

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const VALOR = new Int16Array(128).fill(-1);
for (let i = 0; i < 64; i++) VALOR[ALFABETO.charCodeAt(i)] = i;
export const RE_BASE64URL = /^[A-Za-z0-9_-]+$/;

export function aBase64url(b: Uint8Array): string {
  let s = '';
  let i = 0;
  for (; i + 2 < b.length; i += 3) {
    const n = (b[i] << 16) | (b[i + 1] << 8) | b[i + 2];
    s += ALFABETO[n >> 18] + ALFABETO[(n >> 12) & 63] + ALFABETO[(n >> 6) & 63] + ALFABETO[n & 63];
  }
  if (i + 1 === b.length) {
    const n = b[i] << 16;
    s += ALFABETO[n >> 18] + ALFABETO[(n >> 12) & 63];
  } else if (i + 2 === b.length) {
    const n = (b[i] << 16) | (b[i + 1] << 8);
    s += ALFABETO[n >> 18] + ALFABETO[(n >> 12) & 63] + ALFABETO[(n >> 6) & 63];
  }
  return s;
}

/**
 * null si hay un carácter fuera del alfabeto, el largo es imposible (resto 1 al dividir por 4) o los bits sobrantes del último carácter
 * no son cero. Esto último hace que cada secuencia de bytes tenga UN solo texto (si no, el último carácter admitiría 4 o 16 variantes
 * que decodifican igual y un mismo enlace tendría varias direcciones): el codificador siempre rellena con ceros.
 */
export function deBase64url(s: string): Uint8Array<ArrayBuffer> | null {
  if (s.length % 4 === 1) return null;
  const out = new Uint8Array((s.length * 3) >> 2);
  let o = 0, acc = 0, bits = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    const v = c < 128 ? VALOR[c] : -1;
    if (v < 0) return null;
    acc = (acc << 6) | v;
    bits += 6;
    if (bits >= 8) { bits -= 8; out[o++] = (acc >> bits) & 255; }
  }
  if (bits > 0 && (acc & ((1 << bits) - 1)) !== 0) return null;
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------
// deflate-raw con CompressionStream y descompresión con tope
// ---------------------------------------------------------------------------------------------------------------------------

function juntar(partes: readonly Uint8Array[], total: number): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of partes) { out.set(p, o); o += p.length; }
  return out;
}

function flujoDe(bytes: Uint8Array): ReadableStream<Uint8Array<ArrayBuffer>> {
  const copia = new Uint8Array(bytes.length);
  copia.set(bytes);
  return new Blob([copia]).stream();
}

export async function comprimir(bytes: Uint8Array): Promise<Uint8Array<ArrayBuffer>> {
  const lector = flujoDe(bytes).pipeThrough(new CompressionStream('deflate-raw')).getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { value, done } = await lector.read();
    if (done) break;
    partes.push(value);
    total += value.length;
  }
  return juntar(partes, total);
}

/**
 * Descomprime contando bytes: apenas el total pasa de `max`, cancela el flujo y devuelve 'bomba' (una bomba de deflate de 12 KB
 * que se infla a 12 MB se corta en los primeros 256 KB). Un flujo mal formado da 'formato'.
 */
export async function descomprimirConTope(bytes: Uint8Array, max: number):
  Promise<{ ok: true; bytes: Uint8Array<ArrayBuffer> } | { ok: false; error: 'bomba' | 'formato'; detalle: string }> {
  const lector = flujoDe(bytes).pipeThrough(new DecompressionStream('deflate-raw')).getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { value, done } = await lector.read();
      if (done) break;
      total += value.length;
      if (total > max) {
        lector.cancel().catch(() => {});
        return { ok: false, error: 'bomba', detalle: `más de ${max} bytes descomprimidos` };
      }
      partes.push(value);
    }
  } catch (e) {
    return { ok: false, error: 'formato', detalle: `deflate inválido${(e as Error)?.message ? ': ' + (e as Error).message : ''}` };
  }
  return { ok: true, bytes: juntar(partes, total) };
}

// ---------------------------------------------------------------------------------------------------------------------------
// Receta binaria v1
// ---------------------------------------------------------------------------------------------------------------------------
// byte 0: versión del formato (1 = Receta.v 1) · bytes 1–8: huella del modelo (16 hex) · varint mayor, menor y parche del motor ·
// varint semilla · varint réplicas · byte de banderas (bit 0 noche · 1 t · 2 vel · 3 vel en float64 · 4 esc · 5 h) · los opcionales en
// ese orden: varint noche · varint t · vel (varint si es entero, si no float64 little-endian) · varint cantidad de escenarios y, por
// cada uno, varint largo + UTF-8 · h: 8 bytes. Nada después del último campo.
//
// `h` (bit 5, agregado el 20-10-2026 por el hallazgo H1/E-01 de la revisión) es la HUELLA AGREGADA de las noches del autor (16 hex,
// la del comprobante): con ella quien abre el enlace compara SUS números con los del autor y el sello «reproducida» deja de ser
// verdadero por construcción. El contrato `Receta` (congelado) no la tiene: viaja como campo extra opcional (RecetaConHuella), anotado
// en integracion/CAMBIOS-CONTRATO.md §1. Una receta sin `h` (vieja, o de un modelo anonimizado) sigue siendo válida.

const RE_HUELLA = /^[0-9a-f]{16}$/;
/** Receta con la huella agregada de las noches del autor (extensión de `Receta`; ver arriba). */
export type RecetaConHuella = Receta & { h?: string };
/**
 * Máximo de noches que puede pedir una receta (hallazgo SEG-03): un enlace de 43 caracteres pedía 100.000 noches y la app las corría
 * sin preguntar (≈ 1 h de 3 núcleos al 100% con la plantilla chica). 1.000 es 10 veces las cien noches de la escena.
 */
export const MAX_REPLICAS_RECETA = 1000;
const RE_MOTOR = /^(\d{1,4})\.(\d{1,4})\.(\d{1,4})$/;
export const MAX_ESCENARIOS_RECETA = 8;
const UTF8 = new TextEncoder();
const UTF8_ESTRICTO = new TextDecoder('utf-8', { fatal: true });

function varint(out: number[], x: number): void {
  while (x >= 128) { out.push((x % 128) + 128); x = Math.floor(x / 128); }
  out.push(x);
}

class Lector {
  readonly b: Uint8Array;
  i = 0;
  constructor(b: Uint8Array) { this.b = b; }
  byte(): number {
    if (this.i >= this.b.length) throw new Error('receta truncada');
    return this.b[this.i++];
  }
  varint(): number {
    let x = 0, f = 1;
    for (let k = 0; k < 8; k++) {
      const v = this.byte();
      x += (v & 127) * f;
      if (v < 128) {
        if (!Number.isSafeInteger(x)) throw new Error('entero de la receta fuera de rango');
        if (k > 0 && v === 0) throw new Error('entero de la receta no canónico');
        return x;
      }
      f *= 128;
    }
    throw new Error('entero de la receta demasiado largo');
  }
  bytes(n: number): Uint8Array {
    if (this.i + n > this.b.length) throw new Error('receta truncada');
    const s = this.b.subarray(this.i, this.i + n);
    this.i += n;
    return s;
  }
}

/** null si la receta es válida; si no, qué campo está mal. */
export function problemaReceta(r: Receta): string | null {
  if (r === null || typeof r !== 'object') return 'la receta no es un objeto';
  if (r.v !== 1) return `v: se esperaba 1 y llegó ${String(r.v)}`;
  if (typeof r.modelo !== 'string' || !RE_HUELLA.test(r.modelo)) return 'modelo: se esperaban 16 caracteres hex en minúscula';
  if (typeof r.motor !== 'string' || !RE_MOTOR.test(r.motor)) return 'motor: se esperaba una versión «x.y.z»';
  if (!Number.isInteger(r.semilla) || r.semilla < 0 || r.semilla > 4294967295) return 'semilla: se esperaba un entero de 32 bits sin signo';
  if (!Number.isInteger(r.replicas) || r.replicas < 1 || r.replicas > MAX_REPLICAS_RECETA) return `replicas: se esperaba un entero entre 1 y ${MAX_REPLICAS_RECETA}`;
  if (r.noche !== undefined && (!Number.isInteger(r.noche) || r.noche < 0 || r.noche >= MAX_REPLICAS_RECETA)) return `noche: se esperaba un entero entre 0 y ${MAX_REPLICAS_RECETA - 1}`;
  if (r.t !== undefined && (!Number.isSafeInteger(r.t) || r.t < 0)) return 't: se esperaban ms enteros no negativos';
  if (r.vel !== undefined && (typeof r.vel !== 'number' || !Number.isFinite(r.vel) || !(r.vel > 0) || r.vel > 1e6)) return 'vel: se esperaba un número mayor que 0 y hasta 1.000.000';
  if (r.esc !== undefined) {
    if (!Array.isArray(r.esc) || r.esc.length > MAX_ESCENARIOS_RECETA) return `esc: se esperaba una lista de hasta ${MAX_ESCENARIOS_RECETA} ids`;
    for (const e of r.esc) {
      if (typeof e !== 'string' || e.length === 0 || e.length > 64 || revisarTexto(e)) return 'esc: cada id es un texto de 1 a 64 caracteres sin caracteres de control';
    }
  }
  const h = (r as RecetaConHuella).h;
  if (h !== undefined && (typeof h !== 'string' || !RE_HUELLA.test(h))) return 'h: se esperaba la huella agregada, 16 caracteres hex en minúscula';
  const extra = Object.keys(r).filter((k) => !['v', 'modelo', 'motor', 'semilla', 'replicas', 'noche', 't', 'vel', 'esc', 'h'].includes(k) && (r as unknown as Record<string, unknown>)[k] !== undefined);
  if (extra.length) return `campo desconocido en la receta: ${extra[0]}`;
  return null;
}

export function codificarReceta(r: Receta): string {
  const p = problemaReceta(r);
  if (p) throw new Error(`receta inválida: ${p}`);
  const out: number[] = [1];
  for (let i = 0; i < 16; i += 2) out.push(parseInt(r.modelo.slice(i, i + 2), 16));
  const [, ma, me, pa] = RE_MOTOR.exec(r.motor)!;
  varint(out, Number(ma)); varint(out, Number(me)); varint(out, Number(pa));
  varint(out, r.semilla);
  varint(out, r.replicas);
  const velFloat = r.vel !== undefined && !Number.isSafeInteger(r.vel);
  const h = (r as RecetaConHuella).h;
  const banderas = (r.noche !== undefined ? 1 : 0) | (r.t !== undefined ? 2 : 0) | (r.vel !== undefined ? 4 : 0) | (velFloat ? 8 : 0) | (r.esc !== undefined ? 16 : 0)
    | (h !== undefined ? 32 : 0);
  out.push(banderas);
  if (r.noche !== undefined) varint(out, r.noche);
  if (r.t !== undefined) varint(out, r.t);
  if (r.vel !== undefined) {
    if (velFloat) {
      const f = new DataView(new ArrayBuffer(8));
      f.setFloat64(0, r.vel, true);
      for (let i = 0; i < 8; i++) out.push(f.getUint8(i));
    } else varint(out, r.vel);
  }
  if (r.esc !== undefined) {
    varint(out, r.esc.length);
    for (const e of r.esc) { const b = UTF8.encode(e); varint(out, b.length); for (const x of b) out.push(x); }
  }
  if (h !== undefined) for (let i = 0; i < 16; i += 2) out.push(parseInt(h.slice(i, i + 2), 16));
  return aBase64url(new Uint8Array(out));
}

export function decodificarReceta(s: string): { ok: true; receta: Receta } | { ok: false; error: ErrorEnlace; detalle: string } {
  const b = deBase64url(s);
  if (!b) return { ok: false, error: 'formato', detalle: 'r: base64url inválido' };
  try {
    const l = new Lector(b);
    const v = l.byte();
    if (v !== 1) return { ok: false, error: 'formato', detalle: `r: formato de receta ${v} desconocido (se esperaba 1)` };
    let modelo = '';
    for (const x of l.bytes(8)) modelo += x.toString(16).padStart(2, '0');
    const motor = `${l.varint()}.${l.varint()}.${l.varint()}`;
    const semilla = l.varint();
    const replicas = l.varint();
    const banderas = l.byte();
    if (banderas & ~63) throw new Error('banderas desconocidas en la receta');
    if ((banderas & 8) && !(banderas & 4)) throw new Error('bandera de vel en float64 sin vel');
    const r: Receta = { v: 1, modelo, motor, semilla, replicas };
    if (banderas & 1) r.noche = l.varint();
    if (banderas & 2) r.t = l.varint();
    if (banderas & 4) {
      if (banderas & 8) {
        const f = new DataView(new ArrayBuffer(8));
        const raw = l.bytes(8);
        for (let i = 0; i < 8; i++) f.setUint8(i, raw[i]);
        r.vel = f.getFloat64(0, true);
        // Un entero va siempre como entero (varint): con float64 habría dos textos para la misma receta.
        if (Number.isSafeInteger(r.vel)) throw new Error('vel no canónico: un entero se escribe como entero, no como float64');
      } else r.vel = l.varint();
    }
    if (banderas & 16) {
      const n = l.varint();
      if (n > MAX_ESCENARIOS_RECETA) throw new Error('demasiados escenarios en la receta');
      const esc: string[] = [];
      for (let i = 0; i < n; i++) esc.push(UTF8_ESTRICTO.decode(l.bytes(l.varint())));
      r.esc = esc;
    }
    if (banderas & 32) {
      let h = '';
      for (const x of l.bytes(8)) h += x.toString(16).padStart(2, '0');
      (r as RecetaConHuella).h = h;
    }
    if (l.i !== b.length) throw new Error('bytes de más al final de la receta');
    const p = problemaReceta(r);
    if (p) return { ok: false, error: 'esquema', detalle: `r: ${p}` };
    return { ok: true, receta: r };
  } catch (e) {
    return { ok: false, error: 'formato', detalle: `r: ${(e as Error).message}` };
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// El códec
// ---------------------------------------------------------------------------------------------------------------------------

export const RE_PLANTILLA_EN_ENLACE = /^([a-z0-9][a-z0-9-]{0,63})@(\d{1,4}\.\d{1,4}\.\d{1,4})$/;
const CLAVES_FRAGMENTO = new Set(['m', 't', 'p', 'r']);

export interface OpcionesCodec {
  /**
   * Versión del motor de esta app («x.y.z»). Si se da, una receta hecha con otra versión mayor se rechaza con 'version-motor'
   * (su película no se reproduciría bit a bit). Sin esta opción el error nunca aparece.
   */
  versionMotor?: string;
}

type Resultado = { ok: true; enlace: Enlace } | { ok: false; error: ErrorEnlace; detalle?: string };
const fallo = (error: ErrorEnlace, detalle?: string): Resultado => (detalle ? { ok: false, error, detalle } : { ok: false, error });

async function jsonComprimido(x: unknown): Promise<string> {
  return aBase64url(await comprimir(UTF8.encode(jsonCanonico(x))));
}

async function leerJsonComprimido(clave: string, s: string): Promise<{ ok: true; valor: unknown } | { ok: false; error: ErrorEnlace; detalle: string }> {
  const bytes = deBase64url(s);
  if (!bytes) return { ok: false, error: 'formato', detalle: `${clave}: base64url inválido` };
  const d = await descomprimirConTope(bytes, LIMITES_ENLACE.maxBytesDescomprimidos);
  if (!d.ok) return { ok: false, error: d.error, detalle: `${clave}: ${d.detalle}` };
  let texto: string;
  try { texto = UTF8_ESTRICTO.decode(d.bytes); } catch { return { ok: false, error: 'json-invalido', detalle: `${clave}: UTF-8 inválido` }; }
  const j = parsearJsonSeguro(texto);
  if (!j.ok) return { ok: false, error: j.error, detalle: `${clave}: ${j.detalle}` };
  return { ok: true, valor: j.valor };
}

function falloDeCompilacion(ds: readonly Diagnostico[]): Resultado {
  if (ds.some((d) => d.codigo === 'E-PRESUPUESTO')) {
    const d = ds.find((x) => x.codigo === 'E-PRESUPUESTO')!;
    return fallo('presupuesto', `${d.clave} ${JSON.stringify(d.vars ?? {})}`);
  }
  const d = ds.find((x) => x.nivel === 'error');
  return fallo('esquema', d ? `${d.codigo} en ${d.ruta || '/'} (${d.clave})` : 'modelo inválido');
}

function mayor(v: string): string {
  return v.split('.')[0];
}

/** Lo que el contrato pide: `crearCodec(resolver)`; la opción `versionMotor` la pasa la integración (NOTAS-CONTRATO.md §6). */
export function crearCodec(resolver: ResolverPlantilla, opciones: OpcionesCodec = {}): CodecEnlace {
  async function codificar(e: Enlace): Promise<string> {
    const partes: string[] = [];
    if (e.tipo === 'modelo') {
      partes.push('m=' + await jsonComprimido(e.modelo));
    } else if (e.tipo === 'plantilla') {
      const { id, version } = e.plantilla;
      if (!RE_ID_PLANTILLA.test(id) || !RE_VERSION.test(version)) {
        throw new Error(`enlace: plantilla inválida: se esperaba «id@x.y.z» con id en minúsculas y llegó ${JSON.stringify(`${id}@${version}`)}`);
      }
      partes.push(`t=${id}@${version}`);
      if (e.parche.length > 0) partes.push('p=' + await jsonComprimido(e.parche));
    } else if (e.tipo !== 'receta') {
      throw new Error(`enlace: tipo desconocido ${JSON.stringify((e as { tipo?: unknown }).tipo)}`);
    }
    if (e.receta) partes.push('r=' + codificarReceta(e.receta));
    const f = partes.join('&');
    if (f.length > LIMITES_ENLACE.maxCaracteres) {
      throw new Error(`enlace: muy-largo: el fragmento tiene ${f.length} caracteres y el máximo es ${LIMITES_ENLACE.maxCaracteres}`);
    }
    return f;
  }

  async function decodificar(fragmento: string): Promise<Resultado> {
    try {
      if (typeof fragmento !== 'string') return fallo('formato', 'se esperaba un texto');
      const f = fragmento.startsWith('#') ? fragmento.slice(1) : fragmento;
      if (f.length > LIMITES_ENLACE.maxCaracteres) return fallo('muy-largo', `${f.length} caracteres (máximo ${LIMITES_ENLACE.maxCaracteres})`);
      if (f.length === 0) return fallo('formato', 'fragmento vacío');
      const partes = new Map<string, string>();
      for (const par of f.split('&')) {
        const i = par.indexOf('=');
        const k = i < 0 ? par : par.slice(0, i);
        if (i <= 0 || !CLAVES_FRAGMENTO.has(k)) return fallo('formato', `clave desconocida: se esperaba m, t, p o r y llegó ${JSON.stringify(k.slice(0, 16))}`);
        if (partes.has(k)) return fallo('formato', `la clave ${k} aparece dos veces`);
        const v = par.slice(i + 1);
        if (k === 't' ? !RE_PLANTILLA_EN_ENLACE.test(v) : !RE_BASE64URL.test(v)) {
          return fallo('formato', k === 't' ? 't: se esperaba «id@x.y.z»' : `${k}: caracteres fuera de base64url`);
        }
        partes.set(k, v);
      }
      if (partes.has('m') && (partes.has('t') || partes.has('p'))) return fallo('formato', 'm no se combina con t ni con p');
      if (partes.has('p') && !partes.has('t')) return fallo('formato', 'p sin t');

      let receta: Receta | undefined;
      const r = partes.get('r');
      if (r !== undefined) {
        const rr = decodificarReceta(r);
        if (!rr.ok) return fallo(rr.error, rr.detalle);
        receta = rr.receta;
        if (opciones.versionMotor && mayor(receta.motor) !== mayor(opciones.versionMotor)) {
          return fallo('version-motor', `la receta es del motor ${receta.motor} y este es ${opciones.versionMotor}`);
        }
      }

      const m = partes.get('m');
      if (m !== undefined) {
        const j = await leerJsonComprimido('m', m);
        if (!j.ok) return fallo(j.error, j.detalle);
        const c = await compilar(j.valor);
        if (!c.ok) return falloDeCompilacion(c.diagnosticos);
        if (receta && receta.modelo !== c.mv.huella) return fallo('esquema', `receta de otro modelo: ${receta.modelo} ≠ ${c.mv.huella}`);
        const modelo = j.valor as Modelo;
        return { ok: true, enlace: receta ? { tipo: 'modelo', modelo, receta } : { tipo: 'modelo', modelo } };
      }

      const t = partes.get('t');
      if (t !== undefined) {
        const [, id, version] = RE_PLANTILLA_EN_ENLACE.exec(t)!;
        const base = resolver(id, version);
        if (!base) return fallo('plantilla-desconocida', `${id}@${version}`);
        let parche: OpParche[] = [];
        const p = partes.get('p');
        if (p !== undefined) {
          const j = await leerJsonComprimido('p', p);
          if (!j.ok) return fallo(j.error, j.detalle);
          const cc = crearColector();
          validar(REGLA_PARCHE, j.valor, '/p', cc);
          if (cc.errores > 0) return fallo('esquema', `p: ${cc.lista[0].clave} en ${cc.lista[0].ruta}`);
          parche = j.valor as OpParche[];
        }
        let modelo: Modelo;
        try { modelo = aplicarParche(base, parche); } catch (e) { return fallo('esquema', (e as Error).message); }
        const c = await compilar(modelo);
        if (!c.ok) return falloDeCompilacion(c.diagnosticos);
        if (receta && receta.modelo !== c.mv.huella) return fallo('esquema', `receta de otro modelo: ${receta.modelo} ≠ ${c.mv.huella}`);
        const plantilla = { id, version };
        return { ok: true, enlace: receta ? { tipo: 'plantilla', plantilla, parche, receta } : { tipo: 'plantilla', plantilla, parche } };
      }

      if (receta) return { ok: true, enlace: { tipo: 'receta', receta } };
      return fallo('formato', 'falta m, t o r');
    } catch (e) {
      return fallo('formato', `error inesperado: ${(e as Error)?.message ?? String(e)}`);
    }
  }

  return { codificar, decodificar };
}

/** La firma exacta del contrato (sin opciones). */
export const crearCodecContrato: CrearCodec = (resolver) => crearCodec(resolver);
