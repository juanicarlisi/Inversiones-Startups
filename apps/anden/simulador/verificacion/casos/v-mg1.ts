// verificacion/casos/v-mg1.ts · V08 (M/D/1 ρ = 0,9) y V09 (M/G/1 lognormal media 1 y cv 1,5, ρ = 0,7): Wq de Pollaczek-Khinchine.
// 20 réplicas y 5.000 unidades de calentamiento (validacion.js); la M/D/1 mide 300.000 unidades (la maqueta, con 200.000, dio un
// semiancho de 1,6%: con 300.000 queda ≈ 1,3%).
import { pollaczekKhinchine, segundoMomentoLognormal } from '../formulas/colas.ts';
import { acortar, decl, evaluarEstadistico, exp, fija, replicar, replicasDe, type Caso } from './comun.ts';
import type { ConfigRed } from '../flujo/red.ts';
import type { Distribucion } from '../../contratos/azar.ts';

const REPLICAS = 20;
const CALENTAMIENTO = 5000;

function redMG1(id: string, lambda: number, servicio: Distribucion, horizonte: number): ConfigRed {
  return {
    id,
    estaciones: [{ id: 'servidor', servidores: 1, servicio }],
    clases: [{ id: 'cliente', entrada: 'servidor', llegadas: { tipo: 'renovacion', entre: exp(1 / lambda) } }],
    horizonte, calentamiento: CALENTAMIENTO,
  };
}

export function casosMG1(): Caso[] {
  const md1 = redMG1('v-md1', 0.9, fija(1), CALENTAMIENTO + 300_000);
  const mln1 = redMG1('v-mln1', 0.7, { tipo: 'lognormal', media: 1, cv: 1.5 }, CALENTAMIENTO + 400_000);
  const casoMD1: Caso = {
    id: 'v-md1', titulo: 'M/D/1 con ρ = 0,9', archivo: 'casos/v-mg1.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: md1.horizonte, calentamiento: CALENTAMIENTO,
    pruebas: [{ id: 'V08', nombre: 'M/D/1 ρ = 0,9: Wq de Pollaczek-Khinchine', familia: 'V', tipo: 'exigible',
      esperado: pollaczekKhinchine(0.9, 1, 1), criterio: { tipo: 'estadistico', probabilidad: false } }],
    cortas: [{ etiqueta: 'corta', config: acortar(md1, 3000) }],
    correr(ctx) {
      const ms = replicar(ctx, casoMD1.id, md1, replicasDe(ctx, REPLICAS));
      return [evaluarEstadistico(casoMD1, decl(casoMD1, 'V08'), ctx, ms.map((m) => m.estaciones[0].Wq[0]))];
    },
  };
  const casoMLN1: Caso = {
    id: 'v-mln1', titulo: 'M/G/1 lognormal (media 1, cv 1,5) con ρ = 0,7', archivo: 'casos/v-mg1.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: mln1.horizonte, calentamiento: CALENTAMIENTO,
    pruebas: [{ id: 'V09', nombre: 'M/G/1 lognormal (media 1, cv 1,5), ρ = 0,7: Wq de Pollaczek-Khinchine', familia: 'V', tipo: 'exigible',
      esperado: pollaczekKhinchine(0.7, 1, segundoMomentoLognormal(1, 1.5)), criterio: { tipo: 'estadistico', probabilidad: false } }],
    cortas: [{ etiqueta: 'corta', config: acortar(mln1, 3000) }],
    correr(ctx) {
      const ms = replicar(ctx, casoMLN1.id, mln1, replicasDe(ctx, REPLICAS));
      return [evaluarEstadistico(casoMLN1, decl(casoMLN1, 'V09'), ctx, ms.map((m) => m.estaciones[0].Wq[0]))];
    },
  };
  return [casoMD1, casoMLN1];
}
