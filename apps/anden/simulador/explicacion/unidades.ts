// explicacion/unidades.ts · Andén simulador, corte 1, P7 · Redondeo y unidades de tiempo.
// Una sola definición de «cómo se redondea una cifra» y «cómo se pasa de ms a la unidad que dice la frase»: la usan los
// constructores de frases (que escriben la cifra) y el verificador (que la controla). Si no fueran la misma función, una frase
// verdadera podría fallar por redondeo.

const POTENCIAS_DE_10 = [1, 10, 100, 1000, 10000, 100000, 1000000] as const;

/** Redondeo simétrico (la mitad se aleja del cero) a `decimales` (0 a 6). Sin potencias nativas: las potencias de 10 salen de una tabla. */
export function redondear(x: number, decimales: number): number {
  const p = POTENCIAS_DE_10[decimales];
  if (p === undefined) throw new Error(`redondear: se esperaban entre 0 y 6 decimales y llegó ${decimales}`);
  const r = Math.round(Math.abs(x) * p) / p;
  return x < 0 ? -r : r;
}

/** ¿Dos cifras son la misma al redondearlas a `decimales`? */
export function mismaCifra(a: number, b: number, decimales: number): boolean {
  return redondear(a, decimales) === redondear(b, decimales);
}

/** Unidades de tiempo que entienden las afirmaciones sobre la traza. `hora` = minutos enteros desde la medianoche del día del turno. */
export const UNIDADES_DE_TIEMPO = ['ms', 's', 'min', 'h', 'hora'] as const;
export type UnidadDeTiempo = (typeof UNIDADES_DE_TIEMPO)[number];

export function esUnidadDeTiempo(u: string): u is UnidadDeTiempo {
  return (UNIDADES_DE_TIEMPO as readonly string[]).includes(u);
}

/** Pasa ms a la unidad pedida. `null` si la unidad no es de tiempo. */
export function enUnidad(ms: number, unidad: string): number | null {
  switch (unidad) {
    case 'ms': return ms;
    case 's': return ms / 1000;
    case 'min': return ms / 60000;
    case 'h': return ms / 3600000;
    case 'hora': return Math.floor(ms / 60000);
    default: return null;
  }
}

/** Signo con el cero como cero (Math.sign devuelve -0 para -0; acá no hace falta distinguirlo). */
export function signo(x: number): -1 | 0 | 1 {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}
