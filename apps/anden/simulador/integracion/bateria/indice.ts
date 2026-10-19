// integracion/bateria/indice.ts · Andén simulador, corte 1 · Integración (corte-1.md §8 y §10.6).
// Las 26 exigibles de la batería que no son de P2 (las 59 de P2 viven en verificacion/casos/), como `casosExtra` de crearBateria:
//   P1 · K01a–K01d                                   casos-nucleo.ts
//   P4 · K02a, K02b, K03, L01–L07, P02, R05a, R05b   casos-hub.ts (y el hub chico entra en R01 y R03 de P2)
//   P1 · I · R06 del hub                             casos-hub.ts
//   P5 · R07, S12, S13                               casos-experimentos.ts (R07 se mide antes, con hilos de verdad)
//   I · S03, S08, S09, S11                           casos-estadistica.ts
//   I · R04                                          casos-r04.ts (se mide antes, en Chromium)
import type { Caso } from '../../verificacion/casos/comun.ts';
import { EXIGIBLES_P2 } from '../../verificacion/bateria.ts';
import { tiempoTrapezoidal } from '../../nucleo/indice.ts';
import { casosNucleo } from './casos-nucleo.ts';
import { casosHub } from './casos-hub.ts';
import { casosExperimentos, type MedicionR07 } from './casos-experimentos.ts';
import { casosEstadistica } from './casos-estadistica.ts';
import { casosR04, type MedicionR04 } from './casos-r04.ts';

export type { MedicionR04, MedicionR07 };

/** Las 26 exigibles que suma la integración (§8: K 7 + L 7 + P 1 + R04–R07 5 + S 6). */
export const EXIGIBLES_EXTRA: readonly string[] = [
  'K01a', 'K01b', 'K01c', 'K01d', 'K02a', 'K02b', 'K03',
  'L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07',
  'P02',
  'R04', 'R05a', 'R05b', 'R06', 'R07',
  'S03', 'S08', 'S09', 'S11', 'S12', 'S13',
];
/** Las 85 exigibles del corte (§8: V 50 + C 3 + D/M 3 + R 8 + K 7 + L 7 + P 1 + S 6). */
export const EXIGIBLES_DEL_CORTE: readonly string[] = [...EXIGIBLES_P2, ...EXIGIBLES_EXTRA];

/** Lo que se mide antes de la batería porque es asíncrono (el navegador y los hilos). null = no se midió (y la prueba falla con su motivo). */
export interface Precalculado {
  r04: MedicionR04 | null;
  r07: MedicionR07 | null;
  /** Por qué no se midió R04 (si `r04` es null). */
  motivoR04?: string;
}

export function crearCasosExtra(pre: Precalculado): Caso[] {
  return [
    ...casosNucleo(tiempoTrapezoidal),
    ...casosHub(),
    ...casosExperimentos(pre.r07),
    ...casosEstadistica(),
    ...casosR04(pre.r04, pre.motivoR04),
  ];
}
