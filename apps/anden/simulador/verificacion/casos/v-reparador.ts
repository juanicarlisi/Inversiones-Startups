// verificacion/casos/v-reparador.ts · V30: máquinas y reparador (fuente finita).
// 5 máquinas que fallan a 0,1 por hora mientras andan y 1 reparador a 1 por hora: máquinas rotas en promedio = 0,639522
// (nacimiento y muerte). Se arma como red cerrada: «marcha» es una demora pura (cada máquina anda su tiempo hasta fallar) y «taller»
// es el reparador. 20 réplicas, 1.000 h de calentamiento y 100.000 medidas (validacion.js).
import { reparador } from '../formulas/colas.ts';
import { acortar, decl, evaluarEstadistico, exp, replicar, replicasDe, type Caso } from './comun.ts';
import type { ConfigRed } from '../flujo/red.ts';

const REPLICAS = 20;
const CALENTAMIENTO = 1000;

export function casosReparador(): Caso[] {
  const N = 5, alfa = 0.1, mu = 1;
  const config: ConfigRed = {
    id: 'v-reparador',
    estaciones: [
      { id: 'marcha', servidores: Infinity, servicio: exp(1 / alfa) },
      { id: 'taller', servidores: 1, servicio: exp(1 / mu) },
    ],
    clases: [{ id: 'maquina', entrada: 'marcha', poblacion: N, ruteo: { marcha: [['taller', 1]], taller: [['marcha', 1]] } }],
    horizonte: CALENTAMIENTO + 100_000, calentamiento: CALENTAMIENTO,
  };
  const caso: Caso = {
    id: 'v-reparador', titulo: 'Máquinas y reparador (5 máquinas, 1 reparador)', archivo: 'casos/v-reparador.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: config.horizonte, calentamiento: CALENTAMIENTO,
    pruebas: [{ id: 'V30', nombre: 'Fuente finita (5 máquinas, falla 0,1/h, 1 reparador a 1/h): máquinas rotas en promedio', familia: 'V', tipo: 'exigible',
      esperado: reparador(N, alfa, mu, 1), criterio: { tipo: 'estadistico', probabilidad: false } }],
    cortas: [{ etiqueta: 'corta', config: acortar(config, 3000) }],
    correr(ctx) {
      const ms = replicar(ctx, caso.id, config, replicasDe(ctx, REPLICAS));
      return [evaluarEstadistico(caso, decl(caso, 'V30'), ctx, ms.map((m) => m.estaciones[1].L))];
    },
  };
  return [caso];
}
