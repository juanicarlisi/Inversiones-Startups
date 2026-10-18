// hub/estructuras/rueda.ts · Andén simulador, corte 1 · P4 (el hub).
// Rueda de tiempos del lazo del sorter (implementa RuedaTiempos de contratos/motor.ts): una ranura por paso de una vuelta.
// Cada paquete en bandeja se agenda para el paso en que su bandeja llega a la rampa destino: el costo por paso es O(lo que cae ahí).
// Los elementos de cada ranura forman una lista FIFO enlazada en arreglos tipados (nodos con «siguiente» y «valor» y una lista de
// nodos libres): el estado entero son arreglos tipados y números, sin objetos (se fotografía y se restaura).
import type { EstadoBloque, RuedaTiempos } from '../../contratos/motor.ts';

export class Rueda implements RuedaTiempos {
  readonly ranuras: number;
  private cabeza: Int32Array;
  private cola: Int32Array;
  private sig: Int32Array;
  private val: Int32Array;
  private libre = -1;
  private usados = 0;
  private pasoActual = -1;
  private cantidad = 0;

  constructor(ranuras: number, capacidad = 64) {
    if (!Number.isInteger(ranuras) || ranuras < 1) {
      throw new RangeError(`crearRueda: la cantidad de ranuras tiene que ser un entero ≥ 1 y vino ${ranuras}.`);
    }
    if (!Number.isInteger(capacidad) || capacidad < 1) {
      throw new RangeError(`crearRueda: la capacidad inicial tiene que ser un entero ≥ 1 y vino ${capacidad}.`);
    }
    this.ranuras = ranuras;
    this.cabeza = new Int32Array(ranuras).fill(-1);
    this.cola = new Int32Array(ranuras).fill(-1);
    this.sig = new Int32Array(capacidad);
    this.val = new Int32Array(capacidad);
  }

  /** Último paso tomado (−1 si todavía no se tomó ninguno). */
  get paso(): number {
    return this.pasoActual;
  }

  /** Elementos agendados que todavía no se tomaron. */
  get pendientes(): number {
    return this.cantidad;
  }

  agendar(paso: number, x: number): void {
    if (!Number.isInteger(paso)) throw new RangeError(`rueda.agendar: el paso tiene que ser entero y vino ${paso}.`);
    if (!(paso > this.pasoActual && paso <= this.pasoActual + this.ranuras)) {
      throw new RangeError(
        `rueda.agendar: el paso tiene que estar en (${this.pasoActual}, ${this.pasoActual + this.ranuras}] y vino ${paso}.`,
      );
    }
    if ((x | 0) !== x) throw new RangeError(`rueda.agendar: se esperaba un entero de 32 bits y vino ${x}.`);
    const nodo = this.nodoNuevo();
    this.val[nodo] = x;
    this.sig[nodo] = -1;
    const s = paso % this.ranuras;
    if (this.cola[s] < 0) this.cabeza[s] = nodo;
    else this.sig[this.cola[s]] = nodo;
    this.cola[s] = nodo;
    this.cantidad++;
  }

  tomar(paso: number, f: (x: number) => void): number {
    if (!Number.isInteger(paso)) throw new RangeError(`rueda.tomar: el paso tiene que ser entero y vino ${paso}.`);
    if (!(paso > this.pasoActual)) {
      throw new RangeError(`rueda.tomar: el paso tiene que ser mayor que el último tomado (${this.pasoActual}) y vino ${paso}.`);
    }
    if (this.cantidad > 0 && paso > this.pasoActual + 1) {
      // Saltear pasos solo vale si en esos pasos no había nada agendado (el lazo sin actividad).
      const saltos = Math.min(paso - this.pasoActual - 1, this.ranuras);
      for (let i = 1; i <= saltos; i++) {
        if (this.cabeza[(this.pasoActual + i) % this.ranuras] >= 0) {
          throw new Error(
            `rueda.tomar: se salteó el paso ${this.pasoActual + i}, que tenía elementos agendados (se esperaba tomar los pasos en orden).`,
          );
        }
      }
    }
    this.pasoActual = paso;
    const s = paso % this.ranuras;
    let nodo = this.cabeza[s];
    // La ranura se vacía ANTES de llamar a f: lo que f agende para paso + ranuras queda para la próxima vuelta.
    this.cabeza[s] = -1;
    this.cola[s] = -1;
    let cuantos = 0;
    while (nodo >= 0) {
      const x = this.val[nodo], siguiente = this.sig[nodo];
      this.sig[nodo] = this.libre;
      this.libre = nodo;
      this.cantidad--;
      cuantos++;
      f(x);
      nodo = siguiente;
    }
    return cuantos;
  }

  estado(): EstadoBloque {
    return {
      cabeza: this.cabeza, cola: this.cola, sig: this.sig, val: this.val,
      libre: this.libre, usados: this.usados, pasoActual: this.pasoActual, cantidad: this.cantidad,
    };
  }

  restaurar(e: EstadoBloque): void {
    const { cabeza, cola, sig, val, libre, usados, pasoActual, cantidad } = e;
    for (const [nombre, v, largo] of [['cabeza', cabeza, this.ranuras], ['cola', cola, this.ranuras]] as const) {
      if (!(v instanceof Int32Array) || v.length !== largo) {
        throw new TypeError(`rueda.restaurar: «${nombre}» tiene que ser un Int32Array de largo ${largo} (las ranuras de esta rueda).`);
      }
    }
    if (!(sig instanceof Int32Array) || !(val instanceof Int32Array) || sig.length !== val.length || sig.length < 1) {
      throw new TypeError('rueda.restaurar: «sig» y «val» tienen que ser Int32Array del mismo largo (≥ 1).');
    }
    for (const [nombre, v] of [['libre', libre], ['usados', usados], ['pasoActual', pasoActual], ['cantidad', cantidad]] as const) {
      if (typeof v !== 'number' || !Number.isInteger(v)) throw new TypeError(`rueda.restaurar: «${nombre}» tiene que ser un entero.`);
    }
    if ((usados as number) > sig.length) throw new RangeError('rueda.restaurar: «usados» no puede superar el largo de los nodos.');
    this.cabeza = (cabeza as Int32Array).slice();
    this.cola = (cola as Int32Array).slice();
    this.sig = sig.slice();
    this.val = val.slice();
    this.libre = libre as number;
    this.usados = usados as number;
    this.pasoActual = pasoActual as number;
    this.cantidad = cantidad as number;
  }

  private nodoNuevo(): number {
    if (this.libre >= 0) {
      const n = this.libre;
      this.libre = this.sig[n];
      return n;
    }
    if (this.usados === this.sig.length) {
      const c = this.sig.length * 2, sig = new Int32Array(c), val = new Int32Array(c);
      sig.set(this.sig);
      val.set(this.val);
      this.sig = sig;
      this.val = val;
    }
    return this.usados++;
  }
}

export function crearRueda(ranuras: number, capacidad?: number): RuedaTiempos {
  return new Rueda(ranuras, capacidad);
}
