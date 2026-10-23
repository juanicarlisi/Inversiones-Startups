// nucleo/pruebas/rendimiento.ts · Rendimiento del núcleo (INFORMATIVO: no entra en `npm test` ni decide nada).
// Uso: node nucleo/pruebas/rendimiento.ts [--clientes=N] [--corridas=K] [--uniformes=U]
//
// Mide dos cosas, cada una con la mediana de K corridas:
//   1. Eventos por segundo de una M/M/1 sintética (ρ = 0,8; dos sorteos exponenciales por cliente: servicio y próxima llegada), con
//      el motor del núcleo y con la referencia de contratos/. Meta de corte-1.md §9 (P1): ≥ 4 M eventos/s en el contenedor de
//      referencia.
//   2. El azar solo: bloques Philox4x32-10 por segundo y uniformes de 53 bits por segundo de la fuente del núcleo (pidiendo los
//      uniformes de a pares de la misma dirección, como la normal y la lognormal). Base de corte-1.md §9 y diseño maestro §4.5:
//      12–20 M de bloques y 25–41 M de uniformes por segundo (MEDIDO el 17-10-2026).
// Como el contenedor suele correr otras cosas a la vez (los paquetes del corte se construyen en paralelo), el informe trae la carga
// del equipo (promedio de 1 minuto) y la cantidad de núcleos: un número bajo con carga alta no dice nada del motor.
// El reloj es process.hrtime (Node): el motor nunca lo ve; las mediciones de verdad van al banco (§11).
// Cada medición corre en su propio proceso: si dos motores corren en el mismo, el código del bloque sintético ve dos formas de motor y
// V8 lo optimiza peor (mide el cruce, no el motor).
import { spawnSync } from 'node:child_process';
import { availableParallelism, loadavg } from 'node:os';
import { fileURLToPath } from 'node:url';
import { crearMotor } from '../motor/motor.ts';
import { crearFuenteAzar } from '../azar/fuente.ts';
import { philox4x32_10 } from '../azar/philox.ts';
import { claveDe } from '../azar/clave.ts';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import type { CrearMotor, Motor } from '../../contratos/motor.ts';
import type { Direccion } from '../../contratos/azar.ts';
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
const dosDecimales = (x: number) => Number(x.toFixed(2));

interface Medicion { medianaMEventosPorSegundo: number; corridas: number[]; huella: string; eventos: number }

function medirMotor(crear: CrearMotor, clientes: number, corridas: number): Medicion {
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
  return { medianaMEventosPorSegundo: dosDecimales(mediana(tasas)), corridas: tasas.map(dosDecimales), huella, eventos };
}

interface MedicionAzar { medianaMBloquesPorSegundo: number; medianaMUniformesPorSegundo: number; control: number }

function medirAzar(uniformes: number, corridas: number): MedicionAzar {
  const out = new Uint32Array(4);
  const fuente = crearFuenteAzar(20261017, 0);
  const d: Direccion = { clave: claveDe('rendimiento', 'azar'), a: 0, b: 0, c: 0 };
  let control = 0; // suma de lo sorteado: que V8 no pueda descartar el trabajo
  const bloques = (n: number) => {
    const t0 = segundos();
    for (let i = 0; i < n; i++) { philox4x32_10(0, i, 7, 0, 20261017, 0x9e3779b9, out); control += out[0] & 1; }
    return n / (segundos() - t0) / 1e6;
  };
  const pares = (n: number) => {
    const t0 = segundos();
    for (let i = 0; i < n; i += 2) { d.a = i; control += fuente.uniforme(d, 0) + fuente.uniforme(d, 1); }
    return n / (segundos() - t0) / 1e6;
  };
  bloques(200_000); pares(200_000); // calentamiento
  const tb: number[] = [], tu: number[] = [];
  for (let k = 0; k < corridas; k++) { tb.push(bloques(uniformes / 2)); tu.push(pares(uniformes)); }
  return { medianaMBloquesPorSegundo: dosDecimales(mediana(tb)), medianaMUniformesPorSegundo: dosDecimales(mediana(tu)), control };
}

const clientes = Number(argumento('clientes') ?? 1_000_000);
const corridas = Number(argumento('corridas') ?? 5);
const uniformes = Number(argumento('uniformes') ?? 10_000_000);
const solo = argumento('medir');
if (solo) {
  // Proceso hijo: mide una sola cosa y devuelve JSON.
  const r = solo === 'azar' ? medirAzar(uniformes, corridas) : medirMotor(solo === 'nucleo' ? crearMotor : crearMotorReferencia, clientes, corridas);
  console.log(JSON.stringify(r));
} else {
  const yo = fileURLToPath(import.meta.url);
  const hijo = (que: string) => {
    const p = spawnSync(process.execPath, [yo, `--medir=${que}`, `--clientes=${clientes}`, `--corridas=${corridas}`, `--uniformes=${uniformes}`],
      { encoding: 'utf8' });
    if (p.status !== 0) throw new Error(`la medición de «${que}» falló: ${p.stderr}`);
    return JSON.parse(p.stdout) as unknown;
  };
  const cargaAntes = loadavg()[0];
  const nucleo = hijo('nucleo') as Medicion, referencia = hijo('referencia') as Medicion;
  const { control: _control, ...azar } = hijo('azar') as MedicionAzar;
  void _control;
  const meta = 4;
  console.log(JSON.stringify({
    prueba: 'rendimiento del núcleo (informativa)',
    equipo: { node: process.version, nucleos: availableParallelism(), cargaUnMinuto: [dosDecimales(cargaAntes), dosDecimales(loadavg()[0])] },
    motor: {
      modelo: `M/M/1 ρ = 0,8, ${clientes} clientes, ${nucleo.eventos} eventos`,
      nucleo, referencia, mismaHuella: nucleo.huella === referencia.huella,
      meta: `≥ ${meta} M eventos/s`, cumple: nucleo.medianaMEventosPorSegundo >= meta,
    },
    azar: { ...azar, base: '12–20 M bloques/s y 25–41 M uniformes/s (diseño maestro §4.5, 17-10-2026)' },
    nota: 'Con carga alta (cargaUnMinuto cerca de la cantidad de núcleos o más) los números bajan y no dicen nada del motor.',
  }, null, 2));
}
