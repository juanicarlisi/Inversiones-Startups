// verificacion/casos/v-gm1.ts · V10 y V11: D/M/1 con ρ = 0,9, exacta por GI/M/1 (σ = e^{−(1−σ)/ρ} = 0,80690).
// Wq = σ / (1 − σ) y P(esperar) = σ. 40 réplicas, 5.000 unidades de calentamiento y 400.000 medidas (validacion.js).
import { dm1 } from '../formulas/colas.ts';
import { acortar, decl, evaluarEstadistico, exp, fija, replicar, replicasDe, type Caso } from './comun.ts';
import type { ConfigRed } from '../flujo/red.ts';
import type { MatematicaDeterminista } from '../../contratos/matematica.ts';

const REPLICAS = 40;
const CALENTAMIENTO = 5000;

export function casosGM1(mat: MatematicaDeterminista): Caso[] {
  const lambda = 0.9;
  const th = dm1(lambda, 1, mat);
  const config: ConfigRed = {
    id: 'v-dm1',
    estaciones: [{ id: 'servidor', servidores: 1, servicio: exp(1) }],
    clases: [{ id: 'cliente', entrada: 'servidor', llegadas: { tipo: 'renovacion', entre: fija(1 / lambda) } }],
    horizonte: CALENTAMIENTO + 400_000, calentamiento: CALENTAMIENTO,
  };
  const caso: Caso = {
    id: 'v-dm1', titulo: 'D/M/1 con ρ = 0,9', archivo: 'casos/v-gm1.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: config.horizonte, calentamiento: CALENTAMIENTO,
    pruebas: [
      { id: 'V10', nombre: `D/M/1 ρ = 0,9: Wq exacta de GI/M/1 (σ = ${th.sigma.toFixed(5).replace('.', ',')})`, familia: 'V', tipo: 'exigible',
        esperado: th.Wq, criterio: { tipo: 'estadistico', probabilidad: false } },
      { id: 'V11', nombre: 'D/M/1 ρ = 0,9: probabilidad de esperar = σ', familia: 'V', tipo: 'exigible',
        esperado: th.pEspera, criterio: { tipo: 'estadistico', probabilidad: true } },
    ],
    cortas: [{ etiqueta: 'corta', config: acortar(config, 3000) }],
    correr(ctx) {
      const ms = replicar(ctx, caso.id, config, replicasDe(ctx, REPLICAS));
      return [
        evaluarEstadistico(caso, decl(caso, 'V10'), ctx, ms.map((m) => m.estaciones[0].Wq[0])),
        evaluarEstadistico(caso, decl(caso, 'V11'), ctx, ms.map((m) => m.estaciones[0].pEspera[0])),
      ];
    },
  };
  return [caso];
}
