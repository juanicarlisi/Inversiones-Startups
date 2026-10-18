// verificacion/casos/c-law.ts · Casos publicados por Law (WSC 2023, https://informs-sim.org/wsc23papers/124.pdf).
// C01: oficina de 9 a 17 h, 5 empleados, llegadas exp(1 min), servicio exp(4,5 min); no entra nadie después de las 17 h y se
//      atiende hasta vaciar: demora media en la cola dentro de [4,58; 6,78] (publicado 5,68 ± 1,10 con 25 réplicas).
// C02 (informativa): lo mismo con 6 empleados (publicado 1,30, sin intervalo).
// C03: diferencia pareada 5 contra 6 empleados con números aleatorios comunes, dentro de [3,40; 5,38] (4,39 ± 0,99).
// C04: fábrica: máquina U[0,65; 0,70] min + inspector U[0,75; 0,80] min, 10% vuelve a la máquina, llegadas exp(1 min), fallas de
//      la máquina cada exp(6 h) de calendario (desde que termina la reparación anterior) con reparación U[8; 12] min que desaloja
//      la pieza en curso, que después sigue donde quedó: horas hasta 2.000 piezas buenas dentro de [32,69; 33,81] (33,25 ± 0,56).
// La oficina corre 2.000 réplicas y la fábrica 400 (validacion.js).
import { decl, evaluarIntervalo, evaluarEstadistico, exp, replicar, replicasDe, type Caso } from './comun.ts';
import type { ConfigRed } from '../flujo/red.ts';

const REPLICAS_OFICINA = 2000;
const REPLICAS_FABRICA = 400;

/** La misma id para 5 y 6 empleados: cada cliente llega en el mismo minuto y pide el mismo servicio (números aleatorios comunes). */
export function redOficina(empleados: number, mediaServicio = 4.5): ConfigRed {
  return {
    id: 'c-law-oficina',
    estaciones: [{ id: 'mostrador', servidores: empleados, servicio: exp(mediaServicio) }],
    clases: [{ id: 'cliente', entrada: 'mostrador', llegadas: { tipo: 'renovacion', entre: exp(1), hasta: 480 } }],
    // Se atiende hasta vaciar: el horizonte deja de sobra para eso (el calendario se vacía antes).
    horizonte: 480 + 2000,
  };
}

export function redFabrica(): ConfigRed {
  return {
    id: 'c-law-fabrica',
    estaciones: [
      { id: 'maquina', servidores: 1, servicio: { tipo: 'uniforme', min: 0.65, max: 0.7 }, servicioPorClase: { falla: { tipo: 'uniforme', min: 8, max: 12 } } },
      { id: 'inspector', servidores: 1, servicio: { tipo: 'uniforme', min: 0.75, max: 0.8 } },
      { id: 'reloj', servidores: Infinity, servicio: exp(360) },
    ],
    clases: [
      { id: 'pieza', prioridad: 1, entrada: 'maquina', llegadas: { tipo: 'renovacion', entre: exp(1) },
        ruteo: { maquina: [['inspector', 1]], inspector: [['maquina', 0.1]] } },
      // La falla es un trabajo de población 1: espera en el «reloj» su tiempo hasta fallar y entra a la máquina con prioridad y preempción.
      { id: 'falla', prioridad: 0, preempta: true, entrada: 'reloj', poblacion: 1,
        ruteo: { reloj: [['maquina', 1]], maquina: [['reloj', 1]] } },
    ],
    objetivo: { clase: 'pieza', salidas: 2000 },
    horizonte: 20_000,
  };
}

export function casosLaw(): Caso[] {
  const of5 = redOficina(5), of6 = redOficina(6);
  const casoOficina: Caso = {
    id: 'c-law-oficina', titulo: 'Law: oficina con 5 y con 6 empleados', archivo: 'casos/c-law.ts', suite: 'completa',
    replicas: REPLICAS_OFICINA, horizonte: of5.horizonte, calentamiento: 0,
    pruebas: [
      { id: 'C01', nombre: 'Law (WSC 2023): oficina con 5 empleados, demora media en la cola (min)', familia: 'C', tipo: 'exigible',
        esperado: { min: 4.58, max: 6.78 }, criterio: { tipo: 'intervalo' } },
      { id: 'C02', nombre: 'Law (WSC 2023): oficina con 6 empleados, demora media (publicado 1,30 min, sin intervalo)', familia: 'C', tipo: 'informativa',
        esperado: 1.3, criterio: { tipo: 'informativo' } },
      { id: 'C03', nombre: 'Law (WSC 2023): diferencia pareada de la demora media, 5 contra 6 empleados (min)', familia: 'C', tipo: 'exigible',
        esperado: { min: 3.4, max: 5.38 }, criterio: { tipo: 'intervalo' } },
    ],
    cortas: [{ etiqueta: '5 empleados', config: { ...of5, horizonte: 120, clases: [{ ...of5.clases[0], llegadas: { tipo: 'renovacion', entre: exp(1), hasta: 100 } }] } },
      { etiqueta: '6 empleados', config: { ...of6, horizonte: 120, clases: [{ ...of6.clases[0], llegadas: { tipo: 'renovacion', entre: exp(1), hasta: 100 } }] } }],
    correr(ctx) {
      const n = replicasDe(ctx, REPLICAS_OFICINA);
      const x5 = replicar(ctx, casoOficina.id, of5, n).map((m) => m.estaciones[0].Wq[0]);
      const x6 = replicar(ctx, casoOficina.id, of6, n).map((m) => m.estaciones[0].Wq[0]);
      return [
        evaluarIntervalo(casoOficina, decl(casoOficina, 'C01'), ctx, x5),
        evaluarEstadistico(casoOficina, decl(casoOficina, 'C02'), ctx, x6),
        evaluarIntervalo(casoOficina, decl(casoOficina, 'C03'), ctx, x5.map((x, i) => x - x6[i])),
      ];
    },
  };
  const fab = redFabrica();
  const casoFabrica: Caso = {
    id: 'c-law-fabrica', titulo: 'Law: fábrica con máquina, inspector, retrabajo y fallas', archivo: 'casos/c-law.ts', suite: 'completa',
    replicas: REPLICAS_FABRICA, horizonte: fab.horizonte, calentamiento: 0,
    pruebas: [{ id: 'C04', nombre: 'Law (WSC 2023): fábrica, horas hasta 2.000 piezas buenas', familia: 'C', tipo: 'exigible',
      esperado: { min: 32.69, max: 33.81 }, criterio: { tipo: 'intervalo' } }],
    cortas: [{ etiqueta: '100 piezas', config: { ...fab, objetivo: { clase: 'pieza', salidas: 100 } } }],
    correr(ctx) {
      const ms = replicar(ctx, casoFabrica.id, fab, replicasDe(ctx, REPLICAS_FABRICA));
      const horas = ms.map((m) => {
        if (m.tObjetivo === null) throw new Error(`C04: la réplica ${m.replica} no llegó a 2.000 piezas buenas antes del horizonte (${fab.horizonte} min)`);
        return m.tObjetivo / 60;
      });
      return [evaluarIntervalo(casoFabrica, decl(casoFabrica, 'C04'), ctx, horas)];
    },
  };
  return [casoOficina, casoFabrica];
}
