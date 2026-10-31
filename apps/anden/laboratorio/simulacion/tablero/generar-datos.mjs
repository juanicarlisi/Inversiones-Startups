// Datos reales para las pruebas de tableros: N noches del hub chico (motor de producción, F3, traza completa) -> Arrow IPC.
//   node tablero/generar-datos.mjs --n=125 --semilla=20261030
// Salidas (datos/, regenerables): paquetes.arrow (una fila por paquete: noche, camion, ruta, clase, creado_min, espera_min, vueltas)
// y noches.arrow (una fila por noche con los 24 KPI).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tableFromArrays, tableToIPC } from 'apache-arrow';

const aqui = dirname(fileURLToPath(import.meta.url));
const SIM = resolve(aqui, '../../../simulador');
const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const N = Number(arg.n ?? 125), semilla = Number(arg.semilla ?? 20261030);
const { crearMotorProduccion } = await import(`${SIM}/integracion/ensamblar.ts`);
const { validadoSinChequeos } = await import(`${SIM}/contratos/referencias.ts`);
const { armarNoche, opcionesNoche } = await import(`${SIM}/hub/indice.ts`);
const { KPIS } = await import(`${SIM}/contratos/resultados.ts`);
const mv = validadoSinChequeos(JSON.parse(readFileSync(`${SIM}/contratos/ejemplos/hub-chico.json`, 'utf8')));

const cols = { noche: [], camion: [], ruta: [], clase: [], creado_min: [], espera_min: [], vueltas: [] };
const kp = Object.fromEntries(['noche', ...KPIS].map((k) => [k, []]));
const t0 = performance.now();
for (let r = 0; r < N; r++) {
  const motor = crearMotorProduccion(opcionesNoche(mv, semilla, r, 'completa'));
  const noche = armarNoche(motor, mv, 'F3');
  const { resultado, traza } = noche.cerrar(motor.correr());
  const P = traza.paquetes, ini = traza.inicio;
  for (let e = 0; e < P.n; e++) {
    if (P.listo[e] < 0) continue;
    cols.noche.push(r); cols.camion.push(P.camion[e]); cols.ruta.push(P.ruta[e]); cols.clase.push(P.clase[e]);
    cols.creado_min.push((P.creado[e] - ini) / 60000); cols.espera_min.push((P.listo[e] - P.creado[e]) / 60000); cols.vueltas.push(P.vueltas[e]);
  }
  kp.noche.push(r);
  for (const k of KPIS) kp[k].push(resultado.kpi[k]);
}
const ms = performance.now() - t0;
mkdirSync(resolve(aqui, '../datos'), { recursive: true });
const tp = tableFromArrays({
  noche: Int16Array.from(cols.noche), camion: Int8Array.from(cols.camion), ruta: Int8Array.from(cols.ruta), clase: Int8Array.from(cols.clase),
  creado_min: Float32Array.from(cols.creado_min), espera_min: Float32Array.from(cols.espera_min), vueltas: Int8Array.from(cols.vueltas),
});
const tk = tableFromArrays(Object.fromEntries(Object.entries(kp).map(([k, v]) => [k, k === 'noche' ? Int16Array.from(v) : Float64Array.from(v)])));
writeFileSync(resolve(aqui, '../datos/paquetes.arrow'), tableToIPC(tp, 'file'));
writeFileSync(resolve(aqui, '../datos/noches.arrow'), tableToIPC(tk, 'file'));
console.log(JSON.stringify({ noches: N, filasPaquetes: tp.numRows, filasNoches: tk.numRows, msGenerar: Math.round(ms), msPorNoche: Math.round(ms / N) }));
