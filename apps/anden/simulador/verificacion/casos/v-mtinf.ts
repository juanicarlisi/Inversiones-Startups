// verificacion/casos/v-mtinf.ts · V28a–d y V29: M_t/M/∞ con llegadas de Poisson no homogéneas (adelgazamiento de Lewis y Shedler).
// λ(t) = 20 (1 + 0,6 sen(2π t / 24)) por hora, servicio exponencial de 1 h, arranca vacía. E[N(t)] exacta en t = 48, 54, 60 y 66 h;
// N(t) es Poisson, así que varianza/media = 1. La tabla de §8 dice 400 réplicas (el mínimo de validacion.js); con 400 el semiancho
// de E[N(66)] es 3,3% del valor, por encima del tope de 2% de §8, así que el diseño usa 2.000 (≈ 1,5%).
import { mtInfMedia } from '../formulas/colas.ts';
import { decl, evaluarEstadistico, evaluarZ, exp, replicar, replicasDe, type Caso } from './comun.ts';
import type { ConfigRed } from '../flujo/red.ts';
import type { MatematicaDeterminista } from '../../contratos/matematica.ts';
import { media, desvio } from '../formulas/estadistica.ts';

const REPLICAS = 2000;
const INSTANTES = [48, 54, 60, 66];

export function casosMtInf(mat: MatematicaDeterminista): Caso[] {
  const lb = 20, beta = 0.6, periodo = 24, mu = 1;
  const config: ConfigRed = {
    id: 'v-mtinf',
    estaciones: [{ id: 'sistema', servidores: Infinity, servicio: exp(1 / mu) }],
    clases: [{ id: 'cliente', entrada: 'sistema', llegadas: { tipo: 'senoidal', media: lb, amplitud: beta, periodo } }],
    horizonte: 66, observar: INSTANTES,
  };
  const caso: Caso = {
    id: 'v-mtinf', titulo: 'M_t/M/∞ con llegadas senoidales', archivo: 'casos/v-mtinf.ts', suite: 'completa',
    replicas: REPLICAS, horizonte: 66, calentamiento: 0,
    pruebas: [
      ...INSTANTES.map((t, i) => ({
        id: `V28${'abcd'[i]}`, nombre: `M_t/M/∞ senoidal: E[N(t)] en t = ${t} h`, familia: 'V' as const, tipo: 'exigible' as const,
        esperado: mtInfMedia(lb, beta, periodo, mu, t, mat), criterio: { tipo: 'estadistico' as const, probabilidad: false },
      })),
      { id: 'V29', nombre: 'M_t/M/∞: N(54 h) es Poisson (varianza / media = 1)', familia: 'V', tipo: 'exigible', esperado: 1, criterio: { tipo: 'z' } },
    ],
    cortas: [{ etiqueta: 'corta', config: { ...config, horizonte: 50, observar: [48] } }],
    correr(ctx) {
      const ms = replicar(ctx, caso.id, config, replicasDe(ctx, REPLICAS));
      const out = INSTANTES.map((_, i) => evaluarEstadistico(caso, decl(caso, `V28${'abcd'[i]}`), ctx, ms.map((m) => m.observaciones[i])));
      // Razón varianza/media en t = 54 h. Error estándar para un Poisson de media λ: √(2/(n−1) + 1/(λ n)) (delta, con el cuarto cumulante = λ).
      const xs = ms.map((m) => m.observaciones[1]);
      const m = media(xs), s = desvio(xs), n = xs.length;
      out.push(evaluarZ(caso, decl(caso, 'V29'), ctx, (s * s) / m, Math.sqrt(2 / (n - 1) + 1 / (m * n)), n));
      return out;
    },
  };
  return [caso];
}
