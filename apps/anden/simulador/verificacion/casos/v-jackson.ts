// verificacion/casos/v-jackson.ts · V21–V23c: red de Jackson abierta con realimentación.
// λ = 1 externo al nodo 1 (M/M/2, μ = 1) → 70% al nodo 2 y 30% al 3; nodo 2 (M/M/1, μ = 1,2) → 20% vuelve al 1, el resto sale;
// nodo 3 (M/M/1, μ = 0,5) → sale. L total · W total (= L/λ por Little) · L de cada nodo. 20 réplicas, 2.000 unidades de
// calentamiento y 100.000 medidas (validacion.js).
import { jackson } from '../formulas/colas.ts';
import { acortar, decl, evaluarEstadistico, exp, replicar, replicasDe, type Caso } from './comun.ts';
import type { ConfigRed } from '../flujo/red.ts';

const REPLICAS = 20;
const CALENTAMIENTO = 2000;

export function casosJackson(): Caso[] {
  const nodos = [{ c: 2, mu: 1 }, { c: 1, mu: 1.2 }, { c: 1, mu: 0.5 }];
  const P = [[0, 0.7, 0.3], [0.2, 0, 0], [0, 0, 0]];
  const th = jackson([1, 0, 0], nodos, P);
  const config: ConfigRed = {
    id: 'v-jackson',
    estaciones: nodos.map((n, i) => ({ id: `nodo${i + 1}`, servidores: n.c, servicio: exp(1 / n.mu) })),
    clases: [{
      id: 'trabajo', entrada: 'nodo1', llegadas: { tipo: 'renovacion', entre: exp(1) },
      ruteo: { nodo1: [['nodo2', 0.7], ['nodo3', 0.3]], nodo2: [['nodo1', 0.2]] },
    }],
    horizonte: CALENTAMIENTO + 100_000, calentamiento: CALENTAMIENTO,
  };
  const rho = (i: number) => (th.lambdas[i] / (nodos[i].c * nodos[i].mu)).toFixed(3).replace('.', ',');
  const caso: Caso = {
    id: 'v-jackson', titulo: 'Red de Jackson de 3 nodos con realimentación', archivo: 'casos/v-jackson.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: config.horizonte, calentamiento: CALENTAMIENTO,
    pruebas: [
      { id: 'V21', nombre: 'Red de Jackson: cantidad media en la red L', familia: 'V', tipo: 'exigible', esperado: th.Ltotal, criterio: { tipo: 'estadistico', probabilidad: false } },
      { id: 'V22', nombre: 'Red de Jackson: tiempo medio en la red W (= L/λ)', familia: 'V', tipo: 'exigible', esperado: th.Wtotal, criterio: { tipo: 'estadistico', probabilidad: false } },
      { id: 'V23a', nombre: `Red de Jackson: L del nodo 1 (M/M/2, ρ = ${rho(0)})`, familia: 'V', tipo: 'exigible', esperado: th.L[0], criterio: { tipo: 'estadistico', probabilidad: false } },
      { id: 'V23b', nombre: `Red de Jackson: L del nodo 2 (M/M/1, ρ = ${rho(1)})`, familia: 'V', tipo: 'exigible', esperado: th.L[1], criterio: { tipo: 'estadistico', probabilidad: false } },
      { id: 'V23c', nombre: `Red de Jackson: L del nodo 3 (M/M/1, ρ = ${rho(2)})`, familia: 'V', tipo: 'exigible', esperado: th.L[2], criterio: { tipo: 'estadistico', probabilidad: false } },
    ],
    cortas: [{ etiqueta: 'corta', config: acortar(config, 1000) }],
    correr(ctx) {
      const ms = replicar(ctx, caso.id, config, replicasDe(ctx, REPLICAS));
      return [
        evaluarEstadistico(caso, decl(caso, 'V21'), ctx, ms.map((m) => m.L)),
        evaluarEstadistico(caso, decl(caso, 'V22'), ctx, ms.map((m) => m.clases[0].W)),
        evaluarEstadistico(caso, decl(caso, 'V23a'), ctx, ms.map((m) => m.estaciones[0].L)),
        evaluarEstadistico(caso, decl(caso, 'V23b'), ctx, ms.map((m) => m.estaciones[1].L)),
        evaluarEstadistico(caso, decl(caso, 'V23c'), ctx, ms.map((m) => m.estaciones[2].L)),
      ];
    },
  };
  return [caso];
}
