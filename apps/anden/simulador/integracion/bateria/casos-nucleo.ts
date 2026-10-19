// integracion/bateria/casos-nucleo.ts · Andén simulador, corte 1 · Integración (corte-1.md §8). Exigibles de P1 en la batería.
// K01a–K01d: tiempo de un recorrido con perfil trapezoidal (vmáx 2 m/s, a = frenado = 0,5 m/s²) para 5, 8, 30 y 100 m, con la función
// del núcleo de producción (nucleo/cinematica/trapezoidal.ts). Deterministas: exactas (error relativo ≤ 1e-9).
// Valor esperado exacto: a 5 m el perfil es triangular con pico √(a·d) = √2,5 m/s, así que t = 2·√2,5 ÷ 0,5 = 4·√2,5 = 6,32455…
// (§8 lo publica redondeado: 6,3246); de 8 m en adelante es un trapecio: t = d ÷ v + v ÷ a = 8, 19 y 54 s.
import type { Caso } from '../../verificacion/casos/comun.ts';
import { decl, evaluarRelativo } from '../../verificacion/casos/comun.ts';
import type { TiempoTrapezoidal } from '../../contratos/motor.ts';
import { conDueno } from './comun.ts';

const VMAX = 2, ACEL = 0.5;
/** d (m) → tiempo exacto (s): triangular si d < v²/a, trapecio si no. */
function exacto(d: number): number {
  return d < (VMAX * VMAX) / ACEL ? 2 * Math.sqrt(d / ACEL) : d / VMAX + VMAX / ACEL;
}

export function casosNucleo(tiempoTrapezoidal: TiempoTrapezoidal): Caso[] {
  const distancias: [string, number, string][] = [['K01a', 5, '6,3246'], ['K01b', 8, '8,0000'], ['K01c', 30, '19,0000'], ['K01d', 100, '54,0000']];
  const caso: Caso = {
    id: 'k01-trapezoidal', titulo: 'Recorrido con perfil trapezoidal (núcleo)', archivo: 'integracion/bateria/casos-nucleo.ts', suite: 'rapida',
    replicas: 1, horizonte: 0, calentamiento: 0,
    pruebas: distancias.map(([id, d, publicado]) => ({
      id, nombre: `Trapezoidal, vmáx 2 m/s y a 0,5 m/s²: ${d} m → ${publicado} s`, familia: 'K' as const, tipo: 'exigible' as const,
      esperado: exacto(d), criterio: { tipo: 'relativo' as const, tolRel: 1e-9 },
    })),
    cortas: [],
    correr(ctx) {
      return distancias.map(([id, d]) => conDueno(evaluarRelativo(caso, decl(caso, id), ctx, tiempoTrapezoidal(d, VMAX, ACEL), 1), 'P1'));
    },
  };
  return [caso];
}
