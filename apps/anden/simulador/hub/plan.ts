// hub/plan.ts · Andén simulador, corte 1 · P4 (el hub).
// Plan de clasificación y personas de rampa (corte-1.md §6.7 regla 7). Peso esperado de una rampa = peso de su ruta ÷ cantidad de
// rampas de la ruta.
// - 'por-volumen' (motor 1.1.0, hallazgo R1 de la revisión): bloques de rampas VECINAS con la carga más pareja. Las rampas se
//   ordenan por su lugar sobre el lazo (s; empate: orden del modelo) y se cortan en tantos bloques contiguos como personas presentes,
//   con la partición que hace mínima la carga del bloque más cargado (empate: el corte más temprano); el bloque k va a la k-ésima
//   persona presente. En 1.0.0 cada rampa iba a la persona con menos carga sin mirar dónde estaba, y las personas quedaban con rampas
//   a los dos lados del lazo: con la caminata medida en metros, ese plan caminaba de más;
// - 'contiguas': la rampa r (orden del modelo) a la persona floor(r · n ÷ R); las rampas de una persona ausente sin cubrir pasan a la
//   siguiente presente;
// - lista explícita: como dice; las de una ausente sin cubrir, a la siguiente presente.
// `planBalanceado(m)` devuelve el parche que pone 'por-volumen' (el escenario «balancear el plan»).
import type { OpParche } from '../contratos/modelo.ts';
import type { PlanBalanceado } from '../contratos/hub.ts';
import type { ConfigHub } from './config.ts';

export const planBalanceado: PlanBalanceado = () => [
  { op: 'replace', path: '/personas/rampa/asignacion', value: 'por-volumen' } satisfies OpParche,
];

/** Siguiente persona presente a partir de w (incluida), en ronda; −1 si no hay nadie. */
function siguientePresente(presentes: Uint8Array, w: number): number {
  const n = presentes.length;
  for (let j = 0; j < n; j++) {
    const x = (w + j) % n;
    if (presentes[x]) return x;
  }
  return -1;
}

/**
 * Partición de una fila de pesos en `b` bloques contiguos que hace mínima la carga del bloque más cargado (partición lineal, por
 * programación dinámica). Devuelve los b + 1 cortes: el bloque k va de cortes[k] a cortes[k+1] − 1. Si hay menos pesos que bloques,
 * cada peso va a un bloque y los últimos quedan vacíos. Empate: el corte más temprano (determinista).
 */
export function particionPareja(pesos: readonly number[], b: number): number[] {
  const R = pesos.length;
  if (b <= 0) return [0];
  if (R <= b) return Array.from({ length: b + 1 }, (_, k) => Math.min(k, R));
  const pre = new Float64Array(R + 1);
  for (let i = 0; i < R; i++) pre[i + 1] = pre[i] + pesos[i];
  // mejor[k][i]: la menor carga máxima repartiendo los primeros i pesos en k bloques no vacíos; desde[k][i]: dónde empieza el último.
  const mejor = Array.from({ length: b + 1 }, () => new Float64Array(R + 1).fill(Infinity));
  const desde = Array.from({ length: b + 1 }, () => new Int32Array(R + 1));
  mejor[0][0] = 0;
  for (let k = 1; k <= b; k++) {
    for (let i = k; i <= R - (b - k); i++) {
      for (let j = k - 1; j < i; j++) {
        const v = Math.max(mejor[k - 1][j], pre[i] - pre[j]);
        if (v < mejor[k][i]) { mejor[k][i] = v; desde[k][i] = j; }
      }
    }
  }
  const cortes = new Array<number>(b + 1);
  cortes[b] = R;
  for (let k = b, i = R; k > 0; k--) { i = desde[k][i]; cortes[k - 1] = i; }
  return cortes;
}

/**
 * Llena `asignada[r]` con el lugar de persona de rampa que atiende la rampa r (−1 si no hay nadie presente).
 * `presentes[w]` = 1 si el lugar w tiene quien trabaje (propio o retén).
 */
export function asignarRampas(cfg: ConfigHub, presentes: Uint8Array, asignada: Int32Array): void {
  const R = cfg.NR, n = cfg.nW;
  asignada.fill(-1);
  if (n === 0 || siguientePresente(presentes, 0) < 0) return;
  const a = cfg.asignacion;
  if (a === 'por-volumen') {
    const orden = Array.from({ length: R }, (_, r) => r).sort((x, y) => cfg.rampaS[x] - cfg.rampaS[y] || x - y);
    const gente: number[] = [];
    for (let w = 0; w < n; w++) if (presentes[w]) gente.push(w);
    const cortes = particionPareja(orden.map((r) => cfg.rampaPeso[r]), gente.length);
    for (let k = 0; k < gente.length; k++) for (let i = cortes[k]; i < cortes[k + 1]; i++) asignada[orden[i]] = gente[k];
    return;
  }
  if (a === 'contiguas') {
    for (let r = 0; r < R; r++) asignada[r] = siguientePresente(presentes, Math.floor((r * n) / R));
    return;
  }
  // lista explícita: persona w → ids de sus rampas
  const idx = new Map<string, number>();
  cfg.rampaIds.forEach((id, r) => idx.set(id, r));
  a.forEach((ids, w) => {
    if (w >= n) return;
    for (const id of ids) {
      const r = idx.get(id);
      if (r !== undefined && asignada[r] < 0) asignada[r] = siguientePresente(presentes, w);
    }
  });
}
