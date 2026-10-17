// contratos/matematica.ts · CONGELADO.
// Solo + − × ÷ y sqrt (exactas por IEEE 754): el mismo resultado bit a bit en Node, Chrome, Firefox y Safari.
// Prohibido en el motor: Math.random, Math.log, Math.exp, Math.pow, Math.sin, Math.cos, Math.tan, Math.atan2, Date, performance.
export interface MatematicaDeterminista {
  log(x: number): number;
  exp(x: number): number;
  /** Reducción de Cody-Waite con dos términos, válida para |x| ≤ 1.000 (fuera de ese rango lanza error). El motor solo la usa en [0, 2π). */
  cos(x: number): number;
  sin(x: number): number;
  /** exp(y·log(x)) para x > 0; pow(0, y>0) = 0; pow(x, 0) = 1. No es correctamente redondeada, pero es determinista. */
  pow(x: number, y: number): number;
  /** Math.sqrt: exacta por IEEE 754, permitida. */
  sqrt(x: number): number;
}
