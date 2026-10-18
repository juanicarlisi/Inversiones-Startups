// verificacion/casos/v-mmc.ts · V06a–V07c: M/M/c (μ = 1): Erlang C (probabilidad de esperar) y Wq.
// M/M/3 con λ = 2,4 · M/M/5 con λ = 4,5 · M/M/50 con λ = 45. Calentamiento 2.000 unidades y 20 réplicas, como validacion.js;
// el tramo medido se alarga para que el semiancho quede bajo el tope de §8 (la maqueta dio 2,75% en el Wq de la M/M/50 con
// 400.000 llegadas: con 1.200.000 baja a ≈ 1,6%).
import { mmc } from '../formulas/colas.ts';
import { acortar, decl, evaluarEstadistico, exp, replicar, replicasDe, type Caso } from './comun.ts';
import type { ConfigRed } from '../flujo/red.ts';

const DISENO = [
  { c: 3, lambda: 2.4, letra: 'a', llegadas: 400_000 },
  { c: 5, lambda: 4.5, letra: 'b', llegadas: 600_000 },
  { c: 50, lambda: 45, letra: 'c', llegadas: 1_200_000 },
];
const REPLICAS = 20;
const CALENTAMIENTO = 2000;

export function redMMc(id: string, lambda: number, mu: number, c: number, horizonte: number, calentamiento: number): ConfigRed {
  return {
    id,
    estaciones: [{ id: 'servidores', servidores: c, servicio: exp(1 / mu) }],
    clases: [{ id: 'cliente', entrada: 'servidores', llegadas: { tipo: 'renovacion', entre: exp(1 / lambda) } }],
    horizonte, calentamiento,
  };
}

export function casosMMc(): Caso[] {
  return DISENO.map(({ c, lambda, letra, llegadas }) => {
    const th = mmc(lambda, 1, c);
    const config = redMMc(`v-mmc-${letra}`, lambda, 1, c, CALENTAMIENTO + llegadas / lambda, CALENTAMIENTO);
    const l = String(lambda).replace('.', ',');
    const caso: Caso = {
      id: `v-mmc-${letra}`, titulo: `M/M/${c} con λ = ${l}`, archivo: 'casos/v-mmc.ts', suite: 'completa',
      replicas: REPLICAS, horizonte: config.horizonte, calentamiento: CALENTAMIENTO,
      pruebas: [
        { id: `V06${letra}`, nombre: `M/M/${c}, λ = ${l}: probabilidad de esperar (Erlang C)`, familia: 'V', tipo: 'exigible', esperado: th.C, criterio: { tipo: 'estadistico', probabilidad: true } },
        { id: `V07${letra}`, nombre: `M/M/${c}, λ = ${l}: espera media en la cola Wq`, familia: 'V', tipo: 'exigible', esperado: th.Wq, criterio: { tipo: 'estadistico', probabilidad: false } },
      ],
      cortas: [{ etiqueta: 'corta', config: acortar(config, Math.max(50, 2000 / lambda)) }],
      correr(ctx) {
        const ms = replicar(ctx, caso.id, config, replicasDe(ctx, REPLICAS));
        return [
          evaluarEstadistico(caso, decl(caso, `V06${letra}`), ctx, ms.map((m) => m.estaciones[0].pEspera[0])),
          evaluarEstadistico(caso, decl(caso, `V07${letra}`), ctx, ms.map((m) => m.estaciones[0].Wq[0])),
        ];
      },
    };
    return caso;
  });
}
