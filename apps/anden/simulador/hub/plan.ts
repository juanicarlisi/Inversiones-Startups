// hub/plan.ts · Andén simulador, corte 1 · P4 (el hub).
// Plan de clasificación y personas de rampa (corte-1.md §6.7 regla 7). Peso esperado de una rampa = peso de su ruta ÷ cantidad de
// rampas de la ruta.
// - 'por-volumen': rampas de mayor a menor peso (empate: orden del modelo), cada una a la persona presente con menos carga
//   (empate: menor índice);
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
 * Llena `asignada[r]` con el lugar de persona de rampa que atiende la rampa r (−1 si no hay nadie presente).
 * `presentes[w]` = 1 si el lugar w tiene quien trabaje (propio o retén).
 */
export function asignarRampas(cfg: ConfigHub, presentes: Uint8Array, asignada: Int32Array): void {
  const R = cfg.NR, n = cfg.nW;
  asignada.fill(-1);
  if (n === 0 || siguientePresente(presentes, 0) < 0) return;
  const a = cfg.asignacion;
  if (a === 'por-volumen') {
    const orden = Array.from({ length: R }, (_, r) => r).sort((x, y) => cfg.rampaPeso[y] - cfg.rampaPeso[x] || x - y);
    const carga = new Float64Array(n);
    for (const r of orden) {
      let mejor = -1;
      for (let w = 0; w < n; w++) if (presentes[w] && (mejor < 0 || carga[w] < carga[mejor])) mejor = w;
      asignada[r] = mejor;
      carga[mejor] += cfg.rampaPeso[r];
    }
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
