// integracion/pruebas/datos/generar-pares-hub.ts · Andén simulador, corte 1 · Integración (hallazgo EST-02 de la revisión del 30-10-2026).
//
// Genera el pozo de noches REALES pareadas que usa `pareada-hub.test.ts`: hub-chico@1.0.0 contra la misma plantilla con 4 puestos de
// inducción activos (3 → 4, la comparación del hallazgo), las mismas réplicas 0…N−1 con la semilla de la plantilla, y por cada noche la
// diferencia B − A de los cinco indicadores que compara «¿y si…?» (app/sesion.ts › KPI_COMPARACION). Las colas de esas diferencias
// (asimetría ≈ 12 en la espera P90) son las que rompían el IC de t; la prueba mide la cobertura del método que decide hoy con ellas.
//
// Uso (desde apps/anden/simulador):  node integracion/pruebas/datos/generar-pares-hub.ts [N]      (N = 600 por defecto, ~2–4 min)
// Escribe integracion/pruebas/datos/pares-hub-chico.json. Hay que regenerarlo cuando cambia la versión del motor (la prueba lo exige).
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { KpiId } from '../../../contratos/resultados.ts';
import type { ModeloValidado, OpParche } from '../../../contratos/modelo.ts';
import { ensamblar } from '../../ensamblar.ts';
import { VERSION_MOTOR } from '../../../nucleo/version.ts';

export const PLANTILLA_PARES = 'hub-chico@1.0.0';
export const CAMBIO_PARES: OpParche[] = [{ op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 }];
export const KPIS_PARES: readonly KpiId[] = ['costoPorPaquete', 'pendientesAlCorte', 'finClasificacionMin', 'esperaP90Min', 'recirculacionPct'];
export const ARCHIVO_PARES = join(dirname(fileURLToPath(import.meta.url)), 'pares-hub-chico.json');

export interface PozoPares {
  generado: string;
  motor: string;
  plantilla: string;
  cambio: OpParche[];
  semilla: number;
  noches: number;
  /** Por indicador, B − A de cada réplica 0…noches−1 (12 cifras significativas). */
  diferencias: Record<string, number[]>;
}

/** Los dos modelos (A y B) de la comparación del pozo. */
export async function modelosDelPozo(E = ensamblar()): Promise<{ a: ModeloValidado; b: ModeloValidado }> {
  const c = await E.compilar(E.plantillas[PLANTILLA_PARES]);
  if (!c.ok) throw new Error(`${PLANTILLA_PARES} no compila`);
  return { a: c.mv, b: await E.variante(c.mv, CAMBIO_PARES) };
}

/** B − A de los cinco indicadores en la réplica `r` (mismas semilla y réplica en A y B). */
export function diferenciasDe(E: ReturnType<typeof ensamblar>, a: ModeloValidado, b: ModeloValidado, r: number): Record<string, number> {
  const s = a.modelo.experimento.semilla;
  const ra = E.simularNoche(a, s, r, { traza: 'no' }), rb = E.simularNoche(b, s, r, { traza: 'no' });
  const out: Record<string, number> = {};
  for (const k of KPIS_PARES) out[k] = rb.resultado.kpi[k] - ra.resultado.kpi[k];
  return out;
}

async function principal(n: number): Promise<void> {
  const E = ensamblar();
  const { a, b } = await modelosDelPozo(E);
  const diferencias: Record<string, number[]> = Object.fromEntries(KPIS_PARES.map((k) => [k, []]));
  for (let r = 0; r < n; r++) {
    const d = diferenciasDe(E, a, b, r);
    for (const k of KPIS_PARES) diferencias[k].push(Number(d[k].toPrecision(12)));
    if ((r + 1) % 100 === 0) console.log(`${r + 1} de ${n} pares`);
  }
  const pozo: PozoPares = {
    generado: new Date().toISOString().slice(0, 10), motor: VERSION_MOTOR, plantilla: PLANTILLA_PARES, cambio: CAMBIO_PARES,
    semilla: a.modelo.experimento.semilla, noches: n, diferencias,
  };
  writeFileSync(ARCHIVO_PARES, JSON.stringify(pozo) + '\n');
  console.log(`escrito ${ARCHIVO_PARES}: ${n} pares, motor ${VERSION_MOTOR}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const n = Number(process.argv[2] ?? 600);
  if (!Number.isInteger(n) || n < 100) throw new Error(`se esperaba una cantidad de pares entera ≥ 100 y llegó «${process.argv[2]}»`);
  await principal(n);
}
