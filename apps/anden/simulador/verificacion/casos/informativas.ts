// verificacion/casos/informativas.ts · Lo que se reporta pero no decide, y las demostraciones que tienen que fallar.
// V12a–d (informativas): aproximaciones de Kingman y Allen-Cunneen contra simulación (la maqueta midió +3,6% a +9%):
//   E2/E2/1 ρ = 0,9 · E2/E2/2 ρ = 0,8 · E2/E2/4 ρ = 0,85 · M/LN/4 ρ = 0,85 con cv 1,5. 20 réplicas, 5.000 unidades de
//   calentamiento y 200.000 medidas (400.000 la lognormal), como validacion.js.
// S01 y S02 (tienen que fallar, Law 2023 §5.2): M/M/1 con λ = 1 y μ = 10/9 (W = 9 min), una corrida de 15.000 min con 5.000 de
//   calentamiento. S01: intervalo «ingenuo» que trata las estancias de una sola corrida como independientes (Law publica 7,2% de
//   cobertura; la maqueta, 8,4%). S02: medias por lotes con 20 lotes (la maqueta, 82,2%). Cuentan como aprobadas si la cobertura del
//   intervalo del 95% queda por debajo de 90% en 500 macro-experimentos.
import { allenCunneen, kingman } from '../formulas/colas.ts';
import { cuantilT, media } from '../formulas/estadistica.ts';
import { acortar, decl, evaluarCoberturaBaja, evaluarEstadistico, exp, replicar, replicasDe, type Caso } from './comun.ts';
import type { ConfigRed } from '../flujo/red.ts';
import type { Distribucion } from '../../contratos/azar.ts';

const REPLICAS = 20;
const CALENTAMIENTO = 5000;

function redGG(id: string, c: number, entre: Distribucion, servicio: Distribucion, medido: number): ConfigRed {
  return {
    id,
    estaciones: [{ id: 'servidores', servidores: c, servicio }],
    clases: [{ id: 'cliente', entrada: 'servidores', llegadas: { tipo: 'renovacion', entre } }],
    horizonte: CALENTAMIENTO + medido, calentamiento: CALENTAMIENTO,
  };
}

export function casosInformativas(): Caso[] {
  const e2 = (media: number): Distribucion => ({ tipo: 'erlang', k: 2, media });
  const disenos = [
    { letra: 'a', c: 1, rho: 0.9, red: redGG('v12-e2e2-1', 1, e2(1 / 0.9), e2(1), 200_000), aprox: kingman(0.9, 0.5, 0.5, 1), nombre: 'E2/E2/1 ρ = 0,9: Wq contra Kingman (aproximación)' },
    { letra: 'b', c: 2, rho: 0.8, red: redGG('v12-e2e2-2', 2, e2(1 / 1.6), e2(1), 200_000), aprox: allenCunneen(1.6, 1, 2, 0.5, 0.5), nombre: 'E2/E2/2 ρ = 0,8: Wq contra Allen-Cunneen (aproximación)' },
    { letra: 'c', c: 4, rho: 0.85, red: redGG('v12-e2e2-4', 4, e2(1 / 3.4), e2(1), 200_000), aprox: allenCunneen(3.4, 1, 4, 0.5, 0.5), nombre: 'E2/E2/4 ρ = 0,85: Wq contra Allen-Cunneen (aproximación)' },
    { letra: 'd', c: 4, rho: 0.85, red: redGG('v12-mln-4', 4, exp(1 / 3.4), { tipo: 'lognormal', media: 1, cv: 1.5 }, 400_000), aprox: allenCunneen(3.4, 1, 4, 1, 2.25), nombre: 'M/LN/4 ρ = 0,85, cv 1,5: Wq contra Allen-Cunneen (aproximación)' },
  ];
  const aproximaciones: Caso = {
    id: 'v12-aproximaciones', titulo: 'Kingman y Allen-Cunneen contra simulación', archivo: 'casos/informativas.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: CALENTAMIENTO + 400_000, calentamiento: CALENTAMIENTO,
    pruebas: disenos.map((d) => ({ id: `V12${d.letra}`, nombre: d.nombre, familia: 'V' as const, tipo: 'informativa' as const,
      esperado: d.aprox, criterio: { tipo: 'informativo' as const } })),
    cortas: disenos.map((d) => ({ etiqueta: `V12${d.letra}`, config: acortar(d.red, 1000) })),
    correr(ctx) {
      return disenos.map((d) => {
        const ms = replicar(ctx, aproximaciones.id, d.red, replicasDe(ctx, REPLICAS));
        return evaluarEstadistico(aproximaciones, decl(aproximaciones, `V12${d.letra}`), ctx, ms.map((m) => m.estaciones[0].Wq[0]));
      });
    },
  };

  // ---- S01 y S02: coberturas que tienen que fallar ----
  const MACRO = 500, LOTES = 20, W = 9;
  const corrida: ConfigRed = {
    id: 's-cobertura',
    estaciones: [{ id: 'servidor', servidores: 1, servicio: exp(0.9) }],
    clases: [{ id: 'cliente', entrada: 'servidor', llegadas: { tipo: 'renovacion', entre: exp(1) } }],
    horizonte: 15_000, calentamiento: 5000, registrar: { estancias: true },
  };
  const coberturas: Caso = {
    id: 's-cobertura', titulo: 'Coberturas de intervalos con una sola corrida (demostraciones)', archivo: 'casos/informativas.ts', suite: 'completa',
    replicas: MACRO, horizonte: 15_000, calentamiento: 5000,
    pruebas: [
      { id: 'S01', nombre: 'Intervalo del 95% «ingenuo» con una sola corrida (estancias tratadas como independientes)', familia: 'S', tipo: 'debe-fallar',
        esperado: 0.95, criterio: { tipo: 'cobertura-baja', umbral: 0.9 } },
      { id: 'S02', nombre: 'Intervalo del 95% por medias de 20 lotes de una sola corrida', familia: 'S', tipo: 'debe-fallar',
        esperado: 0.95, criterio: { tipo: 'cobertura-baja', umbral: 0.9 } },
    ],
    cortas: [{ etiqueta: 'corta', config: { ...corrida, horizonte: 3000, calentamiento: 500 } }],
    correr(ctx) {
      const n = replicasDe(ctx, MACRO);
      const tLotes = cuantilT(0.975, LOTES - 1, ctx.mat);
      let ingenuo = 0, lotes = 0;
      const ms = replicar(ctx, coberturas.id, corrida, n);
      for (const m of ms) {
        const ws = m.estancias!;
        // S01: intervalo de t con todas las estancias como si fueran independientes.
        const k = ws.length, mu = media(ws);
        let s2 = 0;
        for (const w of ws) s2 += (w - mu) * (w - mu);
        const semi = cuantilT(0.975, k - 1, ctx.mat) * Math.sqrt(s2 / (k - 1) / k);
        if (Math.abs(mu - W) <= semi) ingenuo++;
        // S02: 20 lotes consecutivos del mismo largo.
        const b = Math.floor(k / LOTES);
        const ys: number[] = [];
        for (let i = 0; i < LOTES; i++) { let s = 0; for (let j = i * b; j < (i + 1) * b; j++) s += ws[j]; ys.push(s / b); }
        const my = media(ys);
        let sy = 0;
        for (const y of ys) sy += (y - my) * (y - my);
        if (Math.abs(my - W) <= tLotes * Math.sqrt(sy / (LOTES - 1) / LOTES)) lotes++;
      }
      return [
        evaluarCoberturaBaja(coberturas, decl(coberturas, 'S01'), ctx, ingenuo, n),
        evaluarCoberturaBaja(coberturas, decl(coberturas, 'S02'), ctx, lotes, n),
      ];
    },
  };
  return [aproximaciones, coberturas];
}
