// experimentos/estadistica/generar-tabla-t.ts · Andén simulador, corte 1, P5.
// Genera `tabla-t.json`: cuantiles bilaterales de la t de Student para ν = 1…200 y las tres confianzas admitidas (0,90 · 0,95 · 0,99).
// Método (corte-1.md §7): beta incompleta regularizada (fracción continua de Lentz) y bisección sobre t.
//   P(|T| ≤ t) = 1 − I_x(ν/2, 1/2) con x = ν / (ν + t²)  →  se busca t tal que I_x(ν/2, 1/2) = 1 − confianza.
// Uso:  node experimentos/estadistica/generar-tabla-t.ts            (reescribe tabla-t.json)
// La matemática (log, exp) entra como parámetro: acá se usa la de la referencia porque esto corre UNA vez, fuera del motor;
// el módulo de producción (`t-student.ts`) solo lee la tabla. Un control de pruebas regenera la tabla y la compara (tolerancia 1e-9).
import { writeFileSync } from 'node:fs';
import type { MatematicaDeterminista } from '../../contratos/matematica.ts';

export const CONFIANZAS_TABLA = [0.9, 0.95, 0.99] as const;
export const NU_MAX_TABLA = 200;
const DECIMALES = 10;

/** ln Γ(k2/2) para k2 entero ≥ 1, por recurrencia exacta (sin aproximaciones): Γ(1) = 1 y Γ(1/2) = √π. */
export function lnGammaMedios(k2: number, mat: MatematicaDeterminista): number {
  if (!Number.isInteger(k2) || k2 < 1) throw new Error(`lnGammaMedios: se esperaba un entero ≥ 1 y llegó ${k2}`);
  if (k2 % 2 === 0) {
    let s = 0;
    for (let i = 2; i < k2 / 2; i++) s += mat.log(i);   // ln Γ(n) = Σ_{i=1}^{n−1} ln i
    return s;
  }
  const m = (k2 - 1) / 2;                                // Γ(m + 1/2) = √π · Π_{i=0}^{m−1} (i + 1/2)
  let s = 0.5 * mat.log(Math.PI);
  for (let i = 0; i < m; i++) s += mat.log(i + 0.5);
  return s;
}

/** Fracción continua de la beta incompleta (Lentz modificado). */
function fraccionBeta(a: number, b: number, x: number): number {
  const MIN = 1e-300, EPS = 1e-16;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < MIN) d = MIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 2000; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < MIN) d = MIN;
    c = 1 + aa / c; if (Math.abs(c) < MIN) c = MIN;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < MIN) d = MIN;
    c = 1 + aa / c; if (Math.abs(c) < MIN) c = MIN;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPS) return h;
  }
  throw new Error(`fraccionBeta: no convergió con a=${a}, b=${b}, x=${x}`);
}

/** Beta incompleta regularizada I_x(ν/2, 1/2) para ν entero: la probabilidad de que |T| supere t (con x = ν/(ν + t²)). */
export function colaDosColas(nu: number, x: number, mat: MatematicaDeterminista): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const a = nu / 2, b = 0.5;
  const lnBeta = lnGammaMedios(nu, mat) + lnGammaMedios(1, mat) - lnGammaMedios(nu + 1, mat);   // ln B(a, b)
  const lnFrente = a * mat.log(x) + b * mat.log(1 - x) - lnBeta;
  const frente = mat.exp(lnFrente);
  if (x < (a + 1) / (a + b + 2)) return (frente * fraccionBeta(a, b, x)) / a;
  return 1 - (frente * fraccionBeta(b, a, 1 - x)) / b;
}

/** Cuantil bilateral: el t > 0 con P(|T| ≤ t) = confianza, para ν grados de libertad. Bisección sobre t. */
export function cuantilTExacto(confianza: number, nu: number, mat: MatematicaDeterminista): number {
  const alfa = 1 - confianza;
  let lo = 0, hi = 1000;
  for (let i = 0; i < 200; i++) {
    const t = (lo + hi) / 2;
    if (t === lo || t === hi) break;
    const cola = colaDosColas(nu, nu / (nu + t * t), mat);   // P(|T| > t)
    if (cola > alfa) lo = t; else hi = t;                    // la cola baja al crecer t
  }
  return (lo + hi) / 2;
}

export interface TablaT {
  formato: 'anden.tabla-t/1';
  metodo: string;
  nuMax: number;
  confianzas: number[];
  /** Clave = confianza como texto ('0.9', '0.95', '0.99'); el valor i es t para ν = i + 1. */
  t: Record<string, number[]>;
}

export function generarTablaT(mat: MatematicaDeterminista): TablaT {
  const t: Record<string, number[]> = {};
  for (const c of CONFIANZAS_TABLA) {
    const col: number[] = [];
    for (let nu = 1; nu <= NU_MAX_TABLA; nu++) col.push(Number(cuantilTExacto(c, nu, mat).toFixed(DECIMALES)));
    t[String(c)] = col;
  }
  return {
    formato: 'anden.tabla-t/1',
    metodo: 'beta incompleta regularizada (fracción continua de Lentz) y bisección; cuantil bilateral P(|T| ≤ t) = confianza',
    nuMax: NU_MAX_TABLA,
    confianzas: [...CONFIANZAS_TABLA],
    t,
  };
}

/** Serializa con una fila por confianza (el archivo queda legible y estable en git). */
export function serializarTabla(tabla: TablaT): string {
  const filas = Object.entries(tabla.t).map(([c, v]) => `    ${JSON.stringify(c)}: [${v.join(', ')}]`);
  return [
    '{',
    `  "formato": ${JSON.stringify(tabla.formato)},`,
    `  "metodo": ${JSON.stringify(tabla.metodo)},`,
    `  "nuMax": ${tabla.nuMax},`,
    `  "confianzas": ${JSON.stringify(tabla.confianzas)},`,
    '  "t": {',
    filas.join(',\n'),
    '  }',
    '}',
    '',
  ].join('\n');
}

// Ejecución directa: node experimentos/estadistica/generar-tabla-t.ts
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const { matNativa } = await import('../../contratos/referencia/motor-referencia.ts');
  const tabla = generarTablaT(matNativa);
  writeFileSync(new URL('./tabla-t.json', import.meta.url), serializarTabla(tabla));
  console.log(`tabla-t.json escrita: ${CONFIANZAS_TABLA.length} confianzas × ${NU_MAX_TABLA} grados de libertad`);
}
