// verificacion/casos/v-prioridad.ts · Dos clases en un servidor exponencial (μ = 1), λ = (0,3; 0,5).
// V17 · V18: sin preempción (Cobham): Wq de la clase alta y de la baja.
// V19 · V20: con preempción y reanudación (el desalojado vuelve a la cola con su clave original): tiempo en el sistema.
// 20 réplicas, 2.000 unidades de calentamiento y 200.000 medidas (validacion.js).
import { cobham, preempcionReanudacion } from '../formulas/colas.ts';
import { acortar, decl, evaluarEstadistico, exp, replicar, replicasDe, type Caso } from './comun.ts';
import type { ConfigRed } from '../flujo/red.ts';

const REPLICAS = 20;
const CALENTAMIENTO = 2000;
const LAMBDAS = [0.3, 0.5];

function redPrioridad(id: string, preempta: boolean): ConfigRed {
  return {
    id,
    estaciones: [{ id: 'servidor', servidores: 1, servicio: exp(1) }],
    clases: [
      { id: 'alta', prioridad: 0, preempta, entrada: 'servidor', llegadas: { tipo: 'renovacion', entre: exp(1 / LAMBDAS[0]) } },
      { id: 'baja', prioridad: 1, entrada: 'servidor', llegadas: { tipo: 'renovacion', entre: exp(1 / LAMBDAS[1]) } },
    ],
    horizonte: CALENTAMIENTO + 200_000, calentamiento: CALENTAMIENTO,
  };
}

export function casosPrioridad(): Caso[] {
  const wq = cobham(LAMBDAS, 1);
  const sin = redPrioridad('v-prio-sin', false);
  const casoSin: Caso = {
    id: 'v-prio-sin', titulo: 'Prioridad sin preempción (Cobham)', archivo: 'casos/v-prioridad.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: sin.horizonte, calentamiento: CALENTAMIENTO,
    pruebas: [
      { id: 'V17', nombre: 'Prioridad sin preempción, λ = (0,3; 0,5): Wq de la clase alta', familia: 'V', tipo: 'exigible', esperado: wq[0], criterio: { tipo: 'estadistico', probabilidad: false } },
      { id: 'V18', nombre: 'Prioridad sin preempción, λ = (0,3; 0,5): Wq de la clase baja', familia: 'V', tipo: 'exigible', esperado: wq[1], criterio: { tipo: 'estadistico', probabilidad: false } },
    ],
    cortas: [{ etiqueta: 'corta', config: acortar(sin, 2000) }],
    correr(ctx) {
      const ms = replicar(ctx, casoSin.id, sin, replicasDe(ctx, REPLICAS));
      return [
        evaluarEstadistico(casoSin, decl(casoSin, 'V17'), ctx, ms.map((m) => m.estaciones[0].Wq[0])),
        evaluarEstadistico(casoSin, decl(casoSin, 'V18'), ctx, ms.map((m) => m.estaciones[0].Wq[1])),
      ];
    },
  };
  const T = preempcionReanudacion(LAMBDAS, 1);
  const con = redPrioridad('v-prio-con', true);
  const casoCon: Caso = {
    id: 'v-prio-con', titulo: 'Prioridad con preempción y reanudación', archivo: 'casos/v-prioridad.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: con.horizonte, calentamiento: CALENTAMIENTO,
    pruebas: [
      { id: 'V19', nombre: 'Prioridad con preempción y reanudación: tiempo en el sistema de la clase alta', familia: 'V', tipo: 'exigible', esperado: T[0], criterio: { tipo: 'estadistico', probabilidad: false } },
      { id: 'V20', nombre: 'Prioridad con preempción y reanudación: tiempo en el sistema de la clase baja', familia: 'V', tipo: 'exigible', esperado: T[1], criterio: { tipo: 'estadistico', probabilidad: false } },
    ],
    cortas: [{ etiqueta: 'corta', config: acortar(con, 2000) }],
    correr(ctx) {
      const ms = replicar(ctx, casoCon.id, con, replicasDe(ctx, REPLICAS));
      return [
        evaluarEstadistico(casoCon, decl(casoCon, 'V19'), ctx, ms.map((m) => m.clases[0].W)),
        evaluarEstadistico(casoCon, decl(casoCon, 'V20'), ctx, ms.map((m) => m.clases[1].W)),
      ];
    },
  };
  return [casoSin, casoCon];
}
