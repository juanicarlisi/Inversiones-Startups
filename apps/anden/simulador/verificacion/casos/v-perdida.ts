// verificacion/casos/v-perdida.ts · Sistemas con pérdida.
// V13 · V14: M/M/2/5 con λ = 2 (μ = 1): probabilidad de rechazo (PASTA) y L, por nacimiento y muerte.
// V15: M/M/10/10 con 7 Erlang: Erlang B. V16: M/G/10/10 lognormal con cv = 2: la misma Erlang B (insensibilidad).
// 20 réplicas, 1.000 unidades de calentamiento y 100.000 medidas (200.000 con servicio lognormal), como validacion.js.
import { erlangB, mmcK } from '../formulas/colas.ts';
import { acortar, decl, evaluarEstadistico, exp, replicar, replicasDe, type Caso } from './comun.ts';
import type { ConfigRed } from '../flujo/red.ts';
import type { Distribucion } from '../../contratos/azar.ts';

const REPLICAS = 20;
const CALENTAMIENTO = 1000;

function redPerdida(id: string, lambda: number, c: number, K: number, servicio: Distribucion, medido: number): ConfigRed {
  return {
    id,
    estaciones: [{ id: 'servidores', servidores: c, capacidad: K, servicio }],
    clases: [{ id: 'cliente', entrada: 'servidores', llegadas: { tipo: 'renovacion', entre: exp(1 / lambda) } }],
    horizonte: CALENTAMIENTO + medido, calentamiento: CALENTAMIENTO,
  };
}

export function casosPerdida(): Caso[] {
  const k = mmcK(2, 1, 2, 5);
  const mm25 = redPerdida('v-mm25', 2, 2, 5, exp(1), 100_000);
  const casoMM25: Caso = {
    id: 'v-mm25', titulo: 'M/M/2/5 con λ = 2', archivo: 'casos/v-perdida.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: mm25.horizonte, calentamiento: CALENTAMIENTO,
    pruebas: [
      { id: 'V13', nombre: 'M/M/2/5, λ = 2: probabilidad de rechazo', familia: 'V', tipo: 'exigible', esperado: k.pBloqueo, criterio: { tipo: 'estadistico', probabilidad: true } },
      { id: 'V14', nombre: 'M/M/2/5, λ = 2: cantidad media en el sistema L', familia: 'V', tipo: 'exigible', esperado: k.L, criterio: { tipo: 'estadistico', probabilidad: false } },
    ],
    cortas: [{ etiqueta: 'corta', config: acortar(mm25, 1500) }],
    correr(ctx) {
      const ms = replicar(ctx, casoMM25.id, mm25, replicasDe(ctx, REPLICAS));
      return [
        evaluarEstadistico(casoMM25, decl(casoMM25, 'V13'), ctx, ms.map((m) => m.estaciones[0].pBloqueo)),
        evaluarEstadistico(casoMM25, decl(casoMM25, 'V14'), ctx, ms.map((m) => m.L)),
      ];
    },
  };
  const B = erlangB(10, 7);
  const exB = redPerdida('v-erlang-b', 7, 10, 10, exp(1), 100_000);
  const casoB: Caso = {
    id: 'v-erlang-b', titulo: 'M/M/10/10 con 7 Erlang', archivo: 'casos/v-perdida.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: exB.horizonte, calentamiento: CALENTAMIENTO,
    pruebas: [{ id: 'V15', nombre: 'M/M/10/10, 7 Erlang: Erlang B', familia: 'V', tipo: 'exigible', esperado: B, criterio: { tipo: 'estadistico', probabilidad: true } }],
    cortas: [{ etiqueta: 'corta', config: acortar(exB, 400) }],
    correr(ctx) {
      const ms = replicar(ctx, casoB.id, exB, replicasDe(ctx, REPLICAS));
      return [evaluarEstadistico(casoB, decl(casoB, 'V15'), ctx, ms.map((m) => m.estaciones[0].pBloqueo))];
    },
  };
  const lnB = redPerdida('v-erlang-b-ln', 7, 10, 10, { tipo: 'lognormal', media: 1, cv: 2 }, 200_000);
  const casoLN: Caso = {
    id: 'v-erlang-b-ln', titulo: 'M/G/10/10 lognormal (cv 2) con 7 Erlang', archivo: 'casos/v-perdida.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: lnB.horizonte, calentamiento: CALENTAMIENTO,
    pruebas: [{ id: 'V16', nombre: 'M/G/10/10 lognormal cv = 2: insensibilidad de Erlang B', familia: 'V', tipo: 'exigible', esperado: B, criterio: { tipo: 'estadistico', probabilidad: true } }],
    cortas: [{ etiqueta: 'corta', config: acortar(lnB, 400) }],
    correr(ctx) {
      const ms = replicar(ctx, casoLN.id, lnB, replicasDe(ctx, REPLICAS));
      return [evaluarEstadistico(casoLN, decl(casoLN, 'V16'), ctx, ms.map((m) => m.estaciones[0].pBloqueo))];
    },
  };
  return [casoMM25, casoB, casoLN];
}
