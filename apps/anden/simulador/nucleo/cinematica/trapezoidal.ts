// nucleo/cinematica/trapezoidal.ts · Tiempo de un recorrido con perfil de velocidad trapezoidal (contratos/motor.ts).
// Acelera con `aceleracion` hasta `velocidadMax`, sigue a velocidad constante y frena con `frenado` (por defecto, igual a la
// aceleración). Si la distancia no alcanza para llegar a la velocidad máxima, el perfil es triangular: el pico v cumple
// v²/(2a) + v²/(2f) = d. Solo usa + − × ÷ y sqrt (exacta por IEEE 754). Unidades: metros, m/s, m/s² → segundos.
// Prueba K01: vmáx 2 m/s, a 0,5 m/s²: 5 m → 6,3246 s · 8 m → 8 s · 30 m → 19 s · 100 m → 54 s.
import type { TiempoTrapezoidal } from '../../contratos/motor.ts';

function exigirPositivo(nombre: string, x: number): void {
  if (typeof x !== 'number' || !(x > 0) || x === Infinity) {
    throw new RangeError(`tiempoTrapezoidal: se esperaba ${nombre} finita y > 0 y llegó ${x}`);
  }
}

export const tiempoTrapezoidal: TiempoTrapezoidal = (distancia, velocidadMax, aceleracion, frenado = aceleracion) => {
  if (typeof distancia !== 'number' || !(distancia >= 0) || distancia === Infinity) {
    throw new RangeError(`tiempoTrapezoidal: se esperaba una distancia finita ≥ 0 (m) y llegó ${distancia}`);
  }
  exigirPositivo('la velocidad máxima (m/s)', velocidadMax);
  exigirPositivo('la aceleración (m/s²)', aceleracion);
  exigirPositivo('el frenado (m/s²)', frenado);
  if (distancia === 0) return 0;
  const v2 = velocidadMax * velocidadMax;
  const dAcelerar = v2 / (2 * aceleracion);
  const dFrenar = v2 / (2 * frenado);
  if (distancia >= dAcelerar + dFrenar) {
    // Trapecio: acelerar, crucero y frenar.
    return velocidadMax / aceleracion + velocidadMax / frenado + (distancia - dAcelerar - dFrenar) / velocidadMax;
  }
  // Triángulo: v_pico² = 2·d·a·f / (a + f).
  const pico = Math.sqrt((2 * distancia * aceleracion * frenado) / (aceleracion + frenado));
  return pico / aceleracion + pico / frenado;
};
