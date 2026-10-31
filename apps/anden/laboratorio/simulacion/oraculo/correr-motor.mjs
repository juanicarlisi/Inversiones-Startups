// Corre el motor de Andén (núcleo de producción, SOLO LECTURA del código de apps/anden/simulador/) sobre un modelo
// y escribe los KPI de N réplicas en JSON. Lo usa el oráculo SimPy para compararse.
//   node oraculo/correr-motor.mjs --modelo=oraculo/modelos/estocastico.json --fid=F3 --n=300 --semilla=20261030 --out=resultados/motor-f3.json
// Node 22.18+ ejecuta los .ts del simulador directamente (type stripping).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const SIM = resolve(aqui, '../../../simulador');
const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const modeloPath = resolve(process.cwd(), arg.modelo ?? resolve(aqui, '../../../simulador/contratos/ejemplos/hub-chico.json'));
const fid = arg.fid ?? 'F3';
const N = Number(arg.n ?? 100);
const semilla = Number(arg.semilla ?? 20261030);
const salida = arg.out ? resolve(process.cwd(), arg.out) : null;
const conSeries = arg.series !== 'no';

const { crearMotorProduccion, VERSION_MOTOR } = await import(`${SIM}/integracion/ensamblar.ts`);
const { validadoSinChequeos } = await import(`${SIM}/contratos/referencias.ts`);
const { armarNoche, opcionesNoche } = await import(`${SIM}/hub/indice.ts`);

const modelo = JSON.parse(readFileSync(modeloPath, 'utf8'));
const mv = validadoSinChequeos(modelo);
const t0 = performance.now();
const replicas = [];
for (let r = 0; r < N; r++) {
  const motor = crearMotorProduccion(opcionesNoche(mv, semilla, r, 'no'));
  const noche = armarNoche(motor, mv, fid);
  const { resultado } = noche.cerrar(motor.correr());
  replicas.push({
    replica: r, huella: resultado.huella, eventos: resultado.eventos, alertas: resultado.alertas, kpi: resultado.kpi,
    ...(conSeries ? { porRecurso: resultado.porRecurso, series: resultado.series } : {}),
  });
}
const ms = performance.now() - t0;
const out = {
  motor: { version: VERSION_MOTOR, fidelidad: fid, semilla, n: N, ms: Math.round(ms), msPorNoche: Math.round(ms / N) },
  modelo: modeloPath.replace(SIM + '/', ''), replicas,
};
if (salida) { mkdirSync(dirname(salida), { recursive: true }); writeFileSync(salida, JSON.stringify(out)); }
console.log(JSON.stringify({ ...out.motor, alertasTotales: replicas.reduce((s, r) => s + r.alertas.length, 0) }));
