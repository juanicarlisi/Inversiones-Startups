// verificacion/casos/v-mm1.ts · V01a–V05c: M/M/1 con ρ = 0,5 · 0,8 · 0,9 (μ = 1).
// Wq · L · ocupación · P(esperar) · Little (L − λW). Diseño de validacion.js: 20 réplicas, calentamiento de 20 tiempos de
// relajación y 200.000 unidades medidas (400.000 con ρ = 0,9).
import type { ConfigRed } from '../flujo/red.ts';
import { mmc, relajacionMM1 } from '../formulas/colas.ts';
import { acortar, decl, evaluarEstadistico, exp, replicar, replicasDe, type Caso, type DeclaracionPrueba } from './comun.ts';

const DISENO = [
  { rho: 0.5, letra: 'a', medido: 200_000 },
  { rho: 0.8, letra: 'b', medido: 200_000 },
  { rho: 0.9, letra: 'c', medido: 400_000 },
];
const REPLICAS = 20;

export function redMM1(id: string, lambda: number, mu: number, horizonte: number, calentamiento: number): ConfigRed {
  return {
    id,
    estaciones: [{ id: 'servidor', servidores: 1, servicio: exp(1 / mu) }],
    clases: [{ id: 'cliente', entrada: 'servidor', llegadas: { tipo: 'renovacion', entre: exp(1 / lambda) } }],
    horizonte, calentamiento,
  };
}

export function casosMM1(): Caso[] {
  return DISENO.map(({ rho, letra, medido }) => {
    const lambda = rho, mu = 1;
    const th = mmc(lambda, mu, 1);
    const cal = 20 * relajacionMM1(rho, mu);
    const config = redMM1(`v-mm1-${letra}`, lambda, mu, cal + medido, cal);
    const r = String(rho).replace('.', ',');
    const pruebas: DeclaracionPrueba[] = [
      { id: `V01${letra}`, nombre: `M/M/1 ρ = ${r}: espera media en la cola Wq`, familia: 'V', tipo: 'exigible', esperado: th.Wq, criterio: { tipo: 'estadistico', probabilidad: false } },
      { id: `V02${letra}`, nombre: `M/M/1 ρ = ${r}: cantidad media en el sistema L`, familia: 'V', tipo: 'exigible', esperado: th.L, criterio: { tipo: 'estadistico', probabilidad: false } },
      { id: `V03${letra}`, nombre: `M/M/1 ρ = ${r}: ocupación del servidor`, familia: 'V', tipo: 'exigible', esperado: th.rho, criterio: { tipo: 'estadistico', probabilidad: true } },
      { id: `V04${letra}`, nombre: `M/M/1 ρ = ${r}: probabilidad de esperar`, familia: 'V', tipo: 'exigible', esperado: th.C, criterio: { tipo: 'estadistico', probabilidad: true } },
      { id: `V05${letra}`, nombre: `M/M/1 ρ = ${r}: ley de Little (L − λW)`, familia: 'V', tipo: 'exigible', esperado: 0, criterio: { tipo: 'estadistico', probabilidad: false } },
    ];
    const caso: Caso = {
      id: `v-mm1-${letra}`, titulo: `M/M/1 con ρ = ${r}`, archivo: 'casos/v-mm1.ts', suite: 'completa',
      replicas: REPLICAS, horizonte: config.horizonte, calentamiento: cal, pruebas,
      cortas: [{ etiqueta: 'corta', config: acortar(config, 3000) }],
      correr(ctx) {
        const ms = replicar(ctx, caso.id, config, replicasDe(ctx, REPLICAS));
        const est = (f: (m: (typeof ms)[number]) => number) => ms.map(f);
        return [
          evaluarEstadistico(caso, decl(caso, `V01${letra}`), ctx, est((m) => m.estaciones[0].Wq[0])),
          evaluarEstadistico(caso, decl(caso, `V02${letra}`), ctx, est((m) => m.L)),
          evaluarEstadistico(caso, decl(caso, `V03${letra}`), ctx, est((m) => m.estaciones[0].ocupacion)),
          evaluarEstadistico(caso, decl(caso, `V04${letra}`), ctx, est((m) => m.estaciones[0].pEspera[0])),
          evaluarEstadistico(caso, decl(caso, `V05${letra}`), ctx, est((m) => m.L - lambda * m.clases[0].W)),
        ];
      },
    };
    return caso;
  });
}
