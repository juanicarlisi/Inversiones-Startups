// modelo/parches.ts · P3 · JSON Pointer (RFC 6901) y JSON Patch (RFC 6902) sin tocar el original.
// Solo las cuatro operaciones del contrato (add, remove, replace, test). El parche se aplica sobre una copia: si una operación falla,
// se lanza un error que dice qué operación, qué se esperaba y qué había, y el documento original queda intacto.
import type { AplicarParche } from '../contratos/escena.ts';
import type { Modelo, OpParche } from '../contratos/modelo.ts';

/** Claves que nunca se aceptan (en el modelo, en el enlace ni en un puntero): con ellas se contamina el prototipo de Object. */
export const CLAVES_PROHIBIDAS: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype']);

/** Un token de JSON Pointer con sus escapes: «~» → «~0» y «/» → «~1». */
export function escaparToken(k: string): string {
  return k.replace(/~/g, '~0').replace(/\//g, '~1');
}

/** Puntero a partir de tokens sin escapar. */
export function punteroDe(tokens: readonly (string | number)[]): string {
  let p = '';
  for (const t of tokens) p += '/' + escaparToken(String(t));
  return p;
}

const RE_ESCAPE_MALO = /~(?![01])/;
const RE_INDICE = /^(0|[1-9]\d*)$/;

/** ¿Es sintácticamente un JSON Pointer? ('' es la raíz; si no, empieza con '/' y cada '~' va seguido de 0 o 1). */
export function esPunteroValido(p: unknown): p is string {
  return typeof p === 'string' && (p === '' || (p[0] === '/' && !RE_ESCAPE_MALO.test(p)));
}

/** Separa un puntero en tokens sin escapes. Lanza si la sintaxis es inválida. */
export function tokensDe(puntero: string): string[] {
  if (!esPunteroValido(puntero)) {
    throw new Error(`puntero inválido: se esperaba «» o un texto que empiece con «/» (con «~» solo como «~0» o «~1») y llegó ${JSON.stringify(puntero)}`);
  }
  if (puntero === '') return [];
  return puntero.slice(1).split('/').map((t) => t.replace(/~1/g, '/').replace(/~0/g, '~'));
}

function esObjetoPlano(x: unknown): x is Record<string, unknown> {
  if (x === null || typeof x !== 'object' || Array.isArray(x)) return false;
  const p = Object.getPrototypeOf(x);
  return p === Object.prototype || p === null;
}

/** Lee el valor en un puntero siguiendo solo propiedades propias (nunca heredadas como «toString»). */
export function leerPuntero(doc: unknown, puntero: string): { ok: true; valor: unknown } | { ok: false } {
  let tokens: string[];
  try { tokens = tokensDe(puntero); } catch { return { ok: false }; }
  return leerTokens(doc, tokens);
}

function leerTokens(doc: unknown, tokens: readonly string[]): { ok: true; valor: unknown } | { ok: false } {
  let x: unknown = doc;
  for (const t of tokens) {
    if (Array.isArray(x)) {
      if (!RE_INDICE.test(t)) return { ok: false };
      const i = Number(t);
      if (i >= x.length) return { ok: false };
      x = x[i];
    } else if (esObjetoPlano(x)) {
      if (CLAVES_PROHIBIDAS.has(t) || !Object.hasOwn(x, t)) return { ok: false };
      x = x[t];
    } else {
      return { ok: false };
    }
  }
  return { ok: true, valor: x };
}

/** Copia profunda de un valor JSON (listas y objetos planos; lo demás se copia por valor). */
export function clonarJson<T>(x: T): T {
  if (Array.isArray(x)) return x.map((e) => clonarJson(e)) as T;
  if (x !== null && typeof x === 'object') {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(x)) {
      if (CLAVES_PROHIBIDAS.has(k)) throw new Error(`copia: la clave «${k}» está prohibida`);
      const v = (x as Record<string, unknown>)[k];
      if (v !== undefined) o[k] = clonarJson(v);
    }
    return o as T;
  }
  return x;
}

/** Igualdad JSON (la de la operación «test» de RFC 6902): mismos tipos, mismas claves, listas en el mismo orden. */
export function igualJson(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!igualJson(a[i], b[i])) return false;
    return true;
  }
  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object' && !Array.isArray(b)) {
    const ka = Object.keys(a).filter((k) => (a as Record<string, unknown>)[k] !== undefined);
    const kb = Object.keys(b).filter((k) => (b as Record<string, unknown>)[k] !== undefined);
    if (ka.length !== kb.length) return false;
    for (const k of ka) {
      if (!Object.hasOwn(b, k)) return false;
      if (!igualJson((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
    }
    return true;
  }
  return false;
}

function mostrar(x: unknown): string {
  if (x === undefined) return 'nada';
  try {
    const s = JSON.stringify(x);
    return s.length > 80 ? s.slice(0, 77) + '…' : s;
  } catch {
    return String(x);
  }
}

/** Error de un parche: además del mensaje, el índice de la operación que falló. */
export class ErrorParche extends Error {
  readonly operacion: number;
  constructor(mensaje: string, operacion: number) {
    super(mensaje);
    this.name = 'ErrorParche';
    this.operacion = operacion;
  }
}

function aplicarOp(raiz: unknown, op: OpParche, i: number): unknown {
  try {
    return aplicarOpSinIndice(raiz, op, i);
  } catch (e) {
    if (e instanceof ErrorParche) throw e;
    throw new ErrorParche((e as Error).message, i);
  }
}

function aplicarOpSinIndice(raiz: unknown, op: OpParche, i: number): unknown {
  if (op === null || typeof op !== 'object') throw new Error(`parche: la operación ${i} no es un objeto (llegó ${mostrar(op)})`);
  const donde = `parche: operación ${i} (${String((op as { op?: unknown }).op)} ${mostrar((op as { path?: unknown }).path)})`;
  if (typeof op.path !== 'string') throw new Error(`${donde}: se esperaba «path» de texto`);
  let tokens: string[];
  try { tokens = tokensDe(op.path); } catch (e) { throw new Error(`${donde}: ${(e as Error).message}`); }
  for (const t of tokens) if (CLAVES_PROHIBIDAS.has(t)) throw new Error(`${donde}: la clave «${t}» está prohibida`);
  const necesitaValor = op.op === 'add' || op.op === 'replace' || op.op === 'test';
  if (necesitaValor && (op as { value?: unknown }).value === undefined) throw new Error(`${donde}: falta «value»`);

  if (op.op === 'test') {
    const r = leerTokens(raiz, tokens);
    if (!r.ok) throw new Error(`${donde}: el test falló: no existe ${op.path}`);
    if (!igualJson(r.valor, op.value)) throw new Error(`${donde}: el test falló: se esperaba ${mostrar(op.value)} y hay ${mostrar(r.valor)}`);
    return raiz;
  }
  if (op.op !== 'add' && op.op !== 'remove' && op.op !== 'replace') {
    throw new Error(`${donde}: operación desconocida: se esperaba add, remove, replace o test`);
  }
  if (tokens.length === 0) {
    if (op.op === 'remove') throw new Error(`${donde}: no se puede quitar la raíz del documento`);
    return clonarJson(op.value);
  }
  const padre = leerTokens(raiz, tokens.slice(0, -1));
  if (!padre.ok) throw new Error(`${donde}: no existe el contenedor ${punteroDe(tokens.slice(0, -1)) || '(raíz)'}`);
  const ultimo = tokens[tokens.length - 1];
  const p = padre.valor;
  if (Array.isArray(p)) {
    if (op.op === 'add') {
      if (ultimo === '-') { p.push(clonarJson(op.value)); return raiz; }
      if (!RE_INDICE.test(ultimo) || Number(ultimo) > p.length) {
        throw new Error(`${donde}: se esperaba un índice entre 0 y ${p.length} (o «-») y llegó «${ultimo}»`);
      }
      p.splice(Number(ultimo), 0, clonarJson(op.value));
      return raiz;
    }
    if (!RE_INDICE.test(ultimo) || Number(ultimo) >= p.length) {
      throw new Error(`${donde}: se esperaba un índice existente entre 0 y ${p.length - 1} y llegó «${ultimo}»`);
    }
    if (op.op === 'remove') p.splice(Number(ultimo), 1);
    else p[Number(ultimo)] = clonarJson(op.value);
    return raiz;
  }
  if (esObjetoPlano(p)) {
    if (op.op === 'add') { p[ultimo] = clonarJson(op.value); return raiz; }
    if (!Object.hasOwn(p, ultimo)) throw new Error(`${donde}: no existe ${op.path}`);
    if (op.op === 'remove') delete p[ultimo];
    else p[ultimo] = clonarJson(op.value);
    return raiz;
  }
  throw new Error(`${donde}: ${punteroDe(tokens.slice(0, -1)) || '(raíz)'} no es un objeto ni una lista (hay ${mostrar(p)})`);
}

/** Versión genérica (sirve para cualquier documento JSON, no solo modelos). */
export function aplicarParcheJson(doc: unknown, ops: readonly OpParche[]): unknown {
  if (!Array.isArray(ops)) throw new Error(`parche: se esperaba una lista de operaciones y llegó ${mostrar(ops)}`);
  let raiz = clonarJson(doc);
  for (let i = 0; i < ops.length; i++) raiz = aplicarOp(raiz, ops[i], i);
  return raiz;
}

/** RFC 6902 (add con «-», remove, replace, test) sobre una copia; lanza con el detalle si un «test» u otra operación falla. */
export const aplicarParche: AplicarParche = (doc: Modelo, ops: OpParche[]): Modelo => aplicarParcheJson(doc, ops) as Modelo;
