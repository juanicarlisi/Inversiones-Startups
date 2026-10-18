// nucleo/pruebas/rendimiento.ts · Rendimiento del núcleo (INFORMATIVO: no entra en `npm test` ni decide nada).
// Uso: node nucleo/pruebas/rendimiento.ts [--clientes=N] [--corridas=K]
// Mide eventos por segundo de una M/M/1 sintética (ρ = 0,8; dos sorteos exponenciales por cliente: servicio y próxima llegada),
// la mediana de K corridas, con el motor del núcleo y con la referencia de contratos/. Meta de corte-1.md §9 (P1): ≥ 4 M eventos/s
// en el contenedor de referencia. El reloj es process.hrtime (Node): el motor nunca lo ve; las mediciones van al banco (§11).
// Cada motor se mide en su propio proceso: si los dos corren en el mismo, el código del bloque sintético ve dos formas de motor y
// V8 lo optimiza peor (mide el cruce, no el motor).
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { crearMotor } from '../motor/motor.ts';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import type { CrearMotor, Motor } from '../../contratos/motor.ts';
import { mm1Sintetica } from './modelos-sinteticos.ts';

function argumento(nombre: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`));
  return a ? a.slice(nombre.length + 3) : undefined;
}
function segundos(): number {
  return Number(process.hrtime.bigint()) / 1e9;
}
function mediana(x: number[]): number {
  const o = [...x].sort((a, b) => a - b);
  return o[Math.floor(o.length / 2)];
}

interface Medicion { medianaMEventosPorSegundo: number; corridas: number[]; huella: string; eventos: number }

function medir(crear: CrearMotor, clientes: number, corridas: number): Medicion {
  const una = (n: number) => {
    const m: Motor = crear({ semilla: 20261017, replica: 0, hasta: 1e15, traza: 'no' });
    mm1Sintetica(m, n, 0.8);
    const t0 = segundos();
    const r = m.correr();
    return { tasa: r.eventos / (segundos() - t0) / 1e6, huella: r.huella, eventos: r.eventos };
  };
  una(50_000); // calentamiento (compilación JIT)
  const tasas: number[] = [];
  let huella = '', eventos = 0;
  for (let i = 0; i < corridas; i++) { const r = una(clientes); tasas.push(r.tasa); huella = r.huella; eventos = r.eventos; }
  return { medianaMEventosPorSegundo: Number(mediana(tasas).toFixed(2)), corridas: tasas.map((x) => Number(x.toFixed(2))), huella, eventos };
}

const clientes = Number(argumento('clientes') ?? 1_000_000);
const corridas = Number(argumento('corridas') ?? 5);
const solo = argumento('motor');
if (solo) {
  // Proceso hijo: mide un solo motor y devuelve JSON.
  console.log(JSON.stringify(medir(solo === 'nucleo' ? crearMotor : crearMotorReferencia, clientes, corridas)));
} else {
  const yo = fileURLToPath(import.meta.url);
  const resultados: Record<string, Medicion> = {};
  for (const motor of ['nucleo', 'referencia']) {
    const p = spawnSync(process.execPath, [yo, `--motor=${motor}`, `--clientes=${clientes}`, `--corridas=${corridas}`], { encoding: 'utf8' });
    if (p.status !== 0) throw new Error(`la medición de ${motor} falló: ${p.stderr}`);
    resultados[motor] = JSON.parse(p.stdout) as Medicion;
  }
  const meta = 4;
  console.log(JSON.stringify({
    prueba: 'rendimiento del núcleo (informativa)', modelo: `M/M/1 ρ = 0,8, ${clientes} clientes, ${resultados.nucleo.eventos} eventos`,
    node: process.version, ...resultados,
    mismaHuella: resultados.nucleo.huella === resultados.referencia.huella,
    meta: `≥ ${meta} M eventos/s`, cumple: resultados.nucleo.medianaMEventosPorSegundo >= meta,
  }, null, 2));
}
