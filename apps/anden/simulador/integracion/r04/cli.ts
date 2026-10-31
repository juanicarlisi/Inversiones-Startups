// integracion/r04/cli.ts · Andén simulador, corte 1 · Integración (corte-1.md §8 R04 y §10.7).
// R04 fuera del navegador: calcula las mismas huellas que la página (huellas.ts) con el motor de JavaScript que ejecute este archivo y
// las escribe como JSON en la salida estándar. r04.mjs lo corre con Bun (JavaScriptCore, el motor de Safari) para que R04 compare dos
// motores distintos y no solo V8 contra V8 (hallazgo REV-D5 de la revisión del 30-10-2026). Bun no reemplaza a Safari ni a WebKit:
// suma un motor que no comparte código con V8. No escribe nada en disco ni abre la red.
import { calcularHuellas } from './huellas.ts';

const t0 = performance.now();
const r = await calcularHuellas();
const bun = (globalThis as { Bun?: { version: string } }).Bun;
const agente = bun ? `Bun ${bun.version} (JavaScriptCore)` : `Node ${process.version} (V8 ${process.versions.v8})`;
process.stdout.write(`${JSON.stringify({ ...r, ms: performance.now() - t0, agente })}\n`);
