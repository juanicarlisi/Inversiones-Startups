// verificacion/flujo/monitores.ts · Andén simulador, corte 1, P2.
// Monitores de la batería: promedios ponderados por tiempo (L, Lq, ocupación) y conteos (n, suma, suma de cuadrados).
// Todo el estado vive en Float64Array: se fotografía con estado() y se restaura con restaurar() sin closures ni objetos.
import type { Ms } from '../../contratos/tipos-base.ts';
import type { EstadoBloque } from '../../contratos/motor.ts';

function copiar(a: Float64Array): Float64Array { return new Float64Array(a); }
function leerArreglo(e: EstadoBloque, k: string, largo: number): Float64Array {
  const v = e[k];
  if (!(v instanceof Float64Array) || v.length !== largo) {
    throw new Error(`restaurar monitor: se esperaba «${k}» como Float64Array de largo ${largo} y llegó ${v === undefined ? 'nada' : (v as object).constructor?.name}`);
  }
  return new Float64Array(v);
}

/**
 * n promedios ponderados por tiempo. Cada índice guarda: valor actual, área acumulada (valor × ms), último cambio y
 * comienzo de la ventana. La media de la ventana es (área + valor · (t − último)) / (t − desde).
 */
export class PromediosTiempo {
  readonly n: number;
  valor: Float64Array;
  area: Float64Array;
  ultimo: Float64Array;
  desde: Float64Array;

  constructor(n: number) {
    this.n = n;
    this.valor = new Float64Array(n);
    this.area = new Float64Array(n);
    this.ultimo = new Float64Array(n);
    this.desde = new Float64Array(n);
  }
  /** Fija el valor del índice i desde el instante t (acumula el área del valor anterior). */
  poner(i: number, v: number, t: Ms): void {
    this.area[i] += this.valor[i] * (t - this.ultimo[i]);
    this.ultimo[i] = t;
    this.valor[i] = v;
  }
  sumar(i: number, dv: number, t: Ms): void { this.poner(i, this.valor[i] + dv, t); }
  /** Área acumulada hasta t (sin modificar el estado). */
  areaHasta(i: number, t: Ms): number { return this.area[i] + this.valor[i] * (t - this.ultimo[i]); }
  /** Media de la ventana [desde, t]. NaN si la ventana tiene largo 0. */
  media(i: number, t: Ms): number {
    const d = t - this.desde[i];
    return d > 0 ? this.areaHasta(i, t) / d : Number.NaN;
  }
  /** Empieza una ventana nueva en t para el índice i (conserva el valor actual). */
  reiniciarIndice(i: number, t: Ms): void { this.area[i] = 0; this.ultimo[i] = t; this.desde[i] = t; }
  /** Empieza una ventana nueva en t para todos los índices (calentamiento). */
  reiniciar(t: Ms): void {
    for (let i = 0; i < this.n; i++) this.reiniciarIndice(i, t);
  }
  estado(prefijo: string): EstadoBloque {
    return { [`${prefijo}.valor`]: copiar(this.valor), [`${prefijo}.area`]: copiar(this.area),
      [`${prefijo}.ultimo`]: copiar(this.ultimo), [`${prefijo}.desde`]: copiar(this.desde) };
  }
  restaurar(e: EstadoBloque, prefijo: string): void {
    this.valor = leerArreglo(e, `${prefijo}.valor`, this.n);
    this.area = leerArreglo(e, `${prefijo}.area`, this.n);
    this.ultimo = leerArreglo(e, `${prefijo}.ultimo`, this.n);
    this.desde = leerArreglo(e, `${prefijo}.desde`, this.n);
  }
}

/** n conteos: cantidad, suma y suma de cuadrados de observaciones (esperas, estancias, ciclos). */
export class Conteos {
  readonly n: number;
  cantidad: Float64Array;
  suma: Float64Array;
  suma2: Float64Array;

  constructor(n: number) {
    this.n = n;
    this.cantidad = new Float64Array(n);
    this.suma = new Float64Array(n);
    this.suma2 = new Float64Array(n);
  }
  agregar(i: number, x: number): void {
    this.cantidad[i] += 1;
    this.suma[i] += x;
    this.suma2[i] += x * x;
  }
  /** Media de las observaciones del índice i; NaN si no hay ninguna. */
  media(i: number): number { return this.cantidad[i] > 0 ? this.suma[i] / this.cantidad[i] : Number.NaN; }
  reiniciar(): void { this.cantidad.fill(0); this.suma.fill(0); this.suma2.fill(0); }
  estado(prefijo: string): EstadoBloque {
    return { [`${prefijo}.cantidad`]: copiar(this.cantidad), [`${prefijo}.suma`]: copiar(this.suma), [`${prefijo}.suma2`]: copiar(this.suma2) };
  }
  restaurar(e: EstadoBloque, prefijo: string): void {
    this.cantidad = leerArreglo(e, `${prefijo}.cantidad`, this.n);
    this.suma = leerArreglo(e, `${prefijo}.suma`, this.n);
    this.suma2 = leerArreglo(e, `${prefijo}.suma2`, this.n);
  }
}
