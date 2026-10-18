// verificacion/casos/v-cerradas.ts · Redes cerradas (CONWIP) de 4 estaciones de una máquina (Hopp y Spearman).
// V24a–c (suite rápida): Penny Fab determinista, 4 estaciones de 2 h, N = 2, 4, 6: TH y CT exactos del mejor caso
//   (0,25/h y 8 h · 0,5/h y 8 h · 0,5/h y 12 h); error ≤ 0,1% por el arranque. Calentamiento 200 h, medido 10.000 h.
// V25 · V26: línea exponencial balanceada con N = 4 (peor caso práctico): TH = 0,285714/h y CT = 14 h (MVA).
// V27: red desbalanceada (1; 2; 1,5; 0,5 h) con N = 5: TH = 0,437838/h (MVA).
// Las exponenciales: 20 réplicas, 1.000 h de calentamiento y 100.000 medidas (validacion.js).
import { mva, pennyFabDeterminista } from '../formulas/colas.ts';
import { acortar, decl, evaluarEstadistico, evaluarRelativo, exp, fija, replicar, replicasDe, type Caso } from './comun.ts';
import type { ConfigRed } from '../flujo/red.ts';

const REPLICAS = 20;

export function redCerrada(id: string, medias: number[], N: number, determinista: boolean, horizonte: number, calentamiento: number): ConfigRed {
  const est = medias.map((s, i) => ({ id: `estacion${i + 1}`, servidores: 1, servicio: determinista ? fija(s) : exp(s) }));
  const ruteo: Record<string, [string, number][]> = {};
  est.forEach((e, i) => { ruteo[e.id] = [[est[(i + 1) % est.length].id, 1]]; });
  return {
    id, estaciones: est,
    clases: [{ id: 'trabajo', entrada: est[0].id, poblacion: N, ruteo }],
    horizonte, calentamiento, ciclo: est[0].id,
  };
}

export function casosCerradas(): Caso[] {
  const PENNY = [2, 2, 2, 2];
  const deterministas = [2, 4, 6].map((N) => redCerrada(`v-penny-det-${N}`, PENNY, N, true, 10_200, 200));
  const casoPenny: Caso = {
    id: 'v-penny-det', titulo: 'Penny Fab determinista (N = 2, 4, 6)', archivo: 'casos/v-cerradas.ts', suite: 'rapida',
    replicas: 1, horizonte: 10_200, calentamiento: 200,
    pruebas: [2, 4, 6].map((N, i) => {
      const th = pennyFabDeterminista(PENNY, N);
      return { id: `V24${'abc'[i]}`, nombre: `Penny Fab determinista, N = ${N}: rendimiento TH (por h) y tiempo de ciclo CT (h)`, familia: 'V' as const,
        tipo: 'exigible' as const, esperado: { TH: th.TH, CT: th.CT }, criterio: { tipo: 'relativo' as const, tolRel: 0.001 } };
    }),
    cortas: deterministas.map((c, i) => ({ etiqueta: `N=${[2, 4, 6][i]}`, config: acortar(c, 400), determinista: true })),
    correr(ctx) {
      return deterministas.map((c, i) => {
        const [m] = replicar(ctx, casoPenny.id, c, 1);
        return evaluarRelativo(casoPenny, decl(casoPenny, `V24${'abc'[i]}`), ctx, { TH: m.clases[0].TH, CT: m.clases[0].CT }, m.clases[0].nCT);
      });
    },
  };
  const balanceada = redCerrada('v-linea-exp', PENNY, 4, false, 101_000, 1000);
  const thB = mva(PENNY, 4);
  const casoB: Caso = {
    id: 'v-linea-exp', titulo: 'Línea exponencial balanceada, N = 4', archivo: 'casos/v-cerradas.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: 101_000, calentamiento: 1000,
    pruebas: [
      { id: 'V25', nombre: 'Línea exponencial balanceada, N = 4: rendimiento TH (por h)', familia: 'V', tipo: 'exigible', esperado: thB.TH, criterio: { tipo: 'estadistico', probabilidad: false } },
      { id: 'V26', nombre: 'Línea exponencial balanceada, N = 4: tiempo de ciclo CT (h)', familia: 'V', tipo: 'exigible', esperado: thB.CT, criterio: { tipo: 'estadistico', probabilidad: false } },
    ],
    cortas: [{ etiqueta: 'corta', config: acortar(balanceada, 2000) }],
    correr(ctx) {
      const ms = replicar(ctx, casoB.id, balanceada, replicasDe(ctx, REPLICAS));
      return [
        evaluarEstadistico(casoB, decl(casoB, 'V25'), ctx, ms.map((m) => m.clases[0].TH)),
        evaluarEstadistico(casoB, decl(casoB, 'V26'), ctx, ms.map((m) => m.clases[0].CT)),
      ];
    },
  };
  const MEDIAS = [1, 2, 1.5, 0.5];
  const desbalanceada = redCerrada('v-red-mva', MEDIAS, 5, false, 101_000, 1000);
  const casoD: Caso = {
    id: 'v-red-mva', titulo: 'Red cerrada desbalanceada, N = 5 (MVA)', archivo: 'casos/v-cerradas.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: 101_000, calentamiento: 1000,
    pruebas: [{ id: 'V27', nombre: 'Red cerrada desbalanceada (1; 2; 1,5; 0,5 h), N = 5: rendimiento TH por MVA', familia: 'V', tipo: 'exigible',
      esperado: mva(MEDIAS, 5).TH, criterio: { tipo: 'estadistico', probabilidad: false } }],
    cortas: [{ etiqueta: 'corta', config: acortar(desbalanceada, 1500) }],
    correr(ctx) {
      const ms = replicar(ctx, casoD.id, desbalanceada, replicasDe(ctx, REPLICAS));
      return [evaluarEstadistico(casoD, decl(casoD, 'V27'), ctx, ms.map((m) => m.clases[0].TH))];
    },
  };
  return [casoPenny, casoB, casoD];
}
