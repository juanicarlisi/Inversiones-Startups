// integracion/r04/huellas.ts · Andén simulador, corte 1 · Integración (corte-1.md §8 R04 y §10.7).
// Lo que R04 compara entre motores de JavaScript: el MISMO código corre en Node (r04.mjs lo importa) y en el navegador (r04/pagina.ts,
// empaquetado con esbuild) y devuelve un mapa clave → huella. R04 pasa si los dos mapas son idénticos. Contiene:
//   rapida:<id>          el resultado de cada prueba de la suite rápida de la batería (valores, z, error, estado) con el núcleo;
//   dorada:<caso>/…      la huella y los eventos de la versión corta de cada caso de la batería (las 66 doradas de P2);
//   hub:<plantilla>/s<n> la huella de la noche, un resumen de 64 bits de sus KPI, indicadores por recurso, series y alertas, y otro de
//                        toda la traza (tramos, momentos, paquetes y catálogo); la geometría aparte (se calcula para dibujar);
//                        hub chico con 5 semillas y hub grande con 1;
//   mat:<f>              las 1.000 doradas de la matemática determinista de cada función (cuántas coinciden bit a bit y un resumen
//                        de las salidas).
// No importa nada de Node: verificacion/bateria.ts sí (node:fs para escribir el informe), y el empaquetado del navegador lo resuelve con
// módulos vacíos (r04.mjs); ninguna función de archivos se llama desde acá.
import type { Traza } from '../../contratos/traza.ts';
import type { ResultadoReplica } from '../../contratos/resultados.ts';
import { crearBateria } from '../../verificacion/bateria.ts';
import { crearMotor, det } from '../../nucleo/indice.ts';
import { ensamblar } from '../ensamblar.ts';
import doradasMat from '../../nucleo/matematica/doradas-mat.json' with { type: 'json' };

/** Semillas del hub chico en R04 (las de R01 de P4: incluye los extremos 1 y 2³² − 1). */
export const SEMILLAS_HUB = [1, 2, 3, 20261017, 4294967295];

/** Resumen de 64 bits con los dos carriles de §6.4 sobre bytes, números (sus 8 bytes IEEE 754) y textos, en un orden canónico. */
export class Resumidor {
  private h1 = 0x811c9dc5;
  private h2 = 0xc2b2ae35;
  private readonly f = new Float64Array(1);
  private readonly fb = new Uint8Array(this.f.buffer);
  palabra(w: number): void {
    this.h1 = Math.imul(this.h1 ^ w, 0x01000193) >>> 0;
    this.h2 = Math.imul(this.h2 ^ w, 0x85ebca6b) >>> 0;
    this.h2 = (this.h2 ^ (this.h2 >>> 13)) >>> 0;
  }
  bytes(b: Uint8Array): void { this.palabra(b.length); for (let i = 0; i < b.length; i++) this.palabra(b[i]); }
  numero(x: number): void { this.f[0] = x; this.bytes(this.fb); }
  texto(s: string): void { this.palabra(s.length); for (let i = 0; i < s.length; i++) this.palabra(s.charCodeAt(i)); }
  /** Cualquier valor: objetos con las claves ordenadas, arreglos y arreglos tipados en orden (los bytes tal cual). */
  valor(v: unknown): void {
    if (v === null || v === undefined) { this.palabra(0xfffffff0); return; }
    if (typeof v === 'number') { this.palabra(1); this.numero(v); return; }
    if (typeof v === 'string') { this.palabra(2); this.texto(v); return; }
    if (typeof v === 'boolean') { this.palabra(v ? 3 : 4); return; }
    if (ArrayBuffer.isView(v)) { this.palabra(5); this.bytes(new Uint8Array(v.buffer, v.byteOffset, v.byteLength)); return; }
    if (Array.isArray(v)) { this.palabra(6); this.palabra(v.length); for (const x of v) this.valor(x); return; }
    if (typeof v === 'object') {
      this.palabra(7);
      const o = v as Record<string, unknown>;
      for (const k of Object.keys(o).sort()) { this.texto(k); this.valor(o[k]); }
      return;
    }
    throw new Error(`Resumidor: no sé resumir un valor de tipo ${typeof v}`);
  }
  hex(): string { return this.h1.toString(16).padStart(8, '0') + this.h2.toString(16).padStart(8, '0'); }
}

export function resumen(v: unknown): string {
  const r = new Resumidor();
  r.valor(v);
  return r.hex();
}

/** Números no finitos como texto (JSON no los tiene) y con todos sus dígitos. */
function json(v: unknown): string {
  return JSON.stringify(v, (_, x) => (typeof x === 'number' && !Number.isFinite(x) ? String(x) : x));
}

function claveNoche(r: ResultadoReplica, t: Traza | undefined): string {
  const salida = resumen({ eventos: r.eventos, kpi: r.kpi, porRecurso: r.porRecurso, series: r.series, alertas: r.alertas });
  const traza = t ? resumen({ tramos: t.tramos, momentos: t.momentos, paquetes: t.paquetes, catalogo: t.catalogo, inicio: t.inicio, fin: t.fin,
    corte: t.corte, tickLazo: t.tickLazo, bandejas: t.bandejas }) : 'sin-traza';
  return `${r.huella} · salida ${salida} · traza ${traza}`;
}

interface DocMat { version: number; funciones: Record<string, string[][]> }

/** Las doradas de matemática: cuántas coinciden bit a bit (NaN = NaN) y un resumen de todas las salidas. */
function matematica(doc: DocMat): Record<string, string> {
  const G = new Float64Array(1), GU = new Uint32Array(G.buffer);
  const ALTO = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1 ? 1 : 0;
  const deHex = (h: string): number => { GU[ALTO] = Number.parseInt(h.slice(0, 8), 16); GU[1 - ALTO] = Number.parseInt(h.slice(8), 16); return G[0]; };
  const F = new Float64Array(2), U = new Uint32Array(F.buffer);
  const igual = (y: number, esperado: string) => {
    if (esperado === 'nan') return y !== y;
    F[0] = y; F[1] = deHex(esperado);
    return U[0] === U[2] && U[1] === U[3];
  };
  const out: Record<string, string> = {};
  for (const nombre of ['log', 'exp', 'cos', 'sin', 'sqrt', 'pow'] as const) {
    const filas = doc.funciones[nombre];
    const r = new Resumidor();
    let iguales = 0;
    for (const fila of filas) {
      const y = nombre === 'pow' ? det.pow(deHex(fila[0]), deHex(fila[1])) : det[nombre](deHex(fila[0]));
      if (igual(y, fila[fila.length - 1])) iguales++;
      r.numero(y !== y ? NaN : y); // un NaN cuenta por su clase, no por sus bits (JavaScript no los fija)
    }
    out[`mat:${nombre}`] = `${iguales}/${filas.length} iguales a las doradas · ${r.hex()}`;
  }
  return out;
}

export interface HuellasR04 {
  huellas: Record<string, string>;
  /** Cuántas claves de cada grupo. */
  grupos: Record<string, number>;
  /** Doradas de matemática que no coinciden en este motor (tiene que ser 0). */
  matDistintas: number;
}

/** Calcula todas las huellas de R04 en el motor de JavaScript donde corre. */
export async function calcularHuellas(): Promise<HuellasR04> {
  const huellas: Record<string, string> = {};
  // 1. La suite rápida de la batería con el núcleo de producción (sin reloj: los tiempos no entran)
  const bateria = crearBateria(crearMotor);
  const inf = bateria.correr({ suite: 'rapida', motor: 'nucleo' });
  for (const r of inf.resultados) {
    huellas[`rapida:${r.id}`] = json({ estado: r.estado, simulado: r.simulado, z: r.z, errorRelativo: r.errorRelativo, semiancho: r.semiancho, n: r.n });
  }
  // 2. Las doradas de la batería (versión corta de cada caso, réplicas 0 y 1)
  for (const c of bateria.generarDoradas('nucleo').corridas) huellas[`dorada:${c.caso}/${c.etiqueta}/r${c.replica}`] = `${c.huella} · ${c.eventos} eventos`;
  // 3. El hub: noches con traza completa, sobre el modelo compilado (huella SHA-256 con crypto.subtle en los dos)
  const E = ensamblar();
  for (const [plantilla, semillas] of [['hub-chico@1.0.0', SEMILLAS_HUB], ['hub-lazo-noche@1.0.0', [20261017]]] as const) {
    const c = await E.compilar(E.plantillas[plantilla]);
    if (!c.ok) throw new Error(`R04: la plantilla ${plantilla} no compila`);
    huellas[`modelo:${plantilla}`] = c.mv.huella;
    for (const s of semillas) {
      const salida = E.simularNoche(c.mv, s, 0, { traza: 'completa' });
      huellas[`hub:${plantilla}/s${s}`] = claveNoche(salida.resultado, salida.traza);
      if (salida.traza) huellas[`hub:${plantilla}/s${s}/geometria`] = resumen(salida.traza.geometria);
    }
  }
  // 4. Las doradas de la matemática determinista
  const mat = matematica(doradasMat as DocMat);
  Object.assign(huellas, mat);
  let matDistintas = 0;
  for (const v of Object.values(mat)) { const m = /^(\d+)\/(\d+)/.exec(v)!; matDistintas += Number(m[2]) - Number(m[1]); }
  const grupos: Record<string, number> = {};
  for (const k of Object.keys(huellas)) { const g = k.slice(0, k.indexOf(':')); grupos[g] = (grupos[g] ?? 0) + 1; }
  return { huellas, grupos, matDistintas };
}
