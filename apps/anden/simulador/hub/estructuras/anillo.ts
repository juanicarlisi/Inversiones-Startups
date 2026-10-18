// hub/estructuras/anillo.ts · Andén simulador, corte 1 · P4 (el hub).
// Cola FIFO de enteros de 32 bits en un Int32Array circular que se agranda duplicando (implementa AnilloI32 de contratos/motor.ts).
// Todo su estado es un arreglo tipado y dos números: se fotografía y se restaura sin closures (corte-1.md §4).
// La usan la acumulación, cada rampa, la playa de camiones y la cola del puesto manual.
import type { AnilloI32, EstadoBloque } from '../../contratos/motor.ts';

const CAPACIDAD_MINIMA = 8;

function potenciaDeDos(n: number): number {
  let c = CAPACIDAD_MINIMA;
  while (c < n) c *= 2;
  return c;
}

export class Anillo implements AnilloI32 {
  private buf: Int32Array;
  private ini = 0;
  private n = 0;

  constructor(capacidad = CAPACIDAD_MINIMA) {
    if (!Number.isInteger(capacidad) || capacidad < 0) {
      throw new RangeError(`crearAnillo: la capacidad inicial tiene que ser un entero ≥ 0 y vino ${capacidad}.`);
    }
    this.buf = new Int32Array(potenciaDeDos(capacidad));
  }

  get largo(): number {
    return this.n;
  }

  poner(x: number): void {
    if ((x | 0) !== x) throw new RangeError(`anillo.poner: se esperaba un entero de 32 bits y vino ${x}.`);
    if (this.n === this.buf.length) this.crecer();
    this.buf[(this.ini + this.n) & (this.buf.length - 1)] = x;
    this.n++;
  }

  sacar(): number {
    if (this.n === 0) throw new Error('anillo.sacar: la cola está vacía (se esperaba al menos un elemento).');
    const x = this.buf[this.ini];
    this.ini = (this.ini + 1) & (this.buf.length - 1);
    this.n--;
    return x;
  }

  mirar(i = 0): number {
    if (!Number.isInteger(i) || i < 0 || i >= this.n) {
      throw new RangeError(`anillo.mirar: el índice tiene que estar entre 0 y ${this.n - 1} y vino ${i}.`);
    }
    return this.buf[(this.ini + i) & (this.buf.length - 1)];
  }

  vaciar(): void {
    this.ini = 0;
    this.n = 0;
  }

  /** Devuelve las referencias vivas: quien fotografía copia (el motor lo hace en foto()). */
  estado(): EstadoBloque {
    return { buf: this.buf, ini: this.ini, n: this.n };
  }

  restaurar(e: EstadoBloque): void {
    const buf = e.buf, ini = e.ini, n = e.n;
    if (!(buf instanceof Int32Array)) throw new TypeError('anillo.restaurar: se esperaba «buf» Int32Array.');
    const c = buf.length;
    if (c < CAPACIDAD_MINIMA || (c & (c - 1)) !== 0) {
      throw new RangeError(`anillo.restaurar: «buf» tiene que tener un largo potencia de dos ≥ ${CAPACIDAD_MINIMA} y tiene ${c}.`);
    }
    if (typeof ini !== 'number' || !Number.isInteger(ini) || ini < 0 || ini >= c) {
      throw new RangeError(`anillo.restaurar: «ini» tiene que ser un entero en [0, ${c}) y vino ${String(ini)}.`);
    }
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 0 || n > c) {
      throw new RangeError(`anillo.restaurar: «n» tiene que ser un entero en [0, ${c}] y vino ${String(n)}.`);
    }
    this.buf = buf.slice();
    this.ini = ini;
    this.n = n;
  }

  private crecer(): void {
    const viejo = this.buf, c = viejo.length, nuevo = new Int32Array(c * 2);
    for (let i = 0; i < this.n; i++) nuevo[i] = viejo[(this.ini + i) & (c - 1)];
    this.buf = nuevo;
    this.ini = 0;
  }
}

export function crearAnillo(capacidad?: number): AnilloI32 {
  return new Anillo(capacidad);
}
