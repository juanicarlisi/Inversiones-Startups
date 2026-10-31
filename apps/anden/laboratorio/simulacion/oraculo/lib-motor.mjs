// Corre el motor de Andén (núcleo de producción; SOLO LECTURA de apps/anden/simulador/) y devuelve los KPI. Lo comparten
// correr-motor.mjs (línea de comandos) y prueba/oraculo.test.mjs (la prueba propuesta).
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const aqui = dirname(fileURLToPath(import.meta.url));
export const SIM = resolve(aqui, '../../../simulador');
const { crearMotorProduccion, VERSION_MOTOR } = await import(`${SIM}/integracion/ensamblar.ts`);
const { validadoSinChequeos } = await import(`${SIM}/contratos/referencias.ts`);
const { armarNoche, opcionesNoche } = await import(`${SIM}/hub/indice.ts`);
export { VERSION_MOTOR };
export function correrNoches(rutaModelo, fid, n, semilla = 20261030) {
  const mv = validadoSinChequeos(JSON.parse(readFileSync(rutaModelo, 'utf8')));
  const filas = [];
  for (let r = 0; r < n; r++) {
    const motor = crearMotorProduccion(opcionesNoche(mv, semilla, r, 'no'));
    const { resultado } = armarNoche(motor, mv, fid).cerrar(motor.correr());
    filas.push({ kpi: resultado.kpi, alertas: resultado.alertas, huella: resultado.huella });
  }
  return filas;
}
