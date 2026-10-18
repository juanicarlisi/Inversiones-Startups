// nucleo/motor/calendario.ts · Calendario de eventos: montículo binario en columnas de arreglos tipados (corte-1.md §6.1).
//
// Orden total: (t, fase, prioridad, seq), todo ascendente. Como `seq` es único, el orden de salida no depende de cómo esté
// acomodado el montículo por dentro: por eso la foto puede guardar los eventos pendientes en cualquier orden y rearmarlos.
// Columnas: t Float64 · fase Uint8 · prioridad Int32 · seq Float64 · bloque, tipo y arg Int32. Crecen duplicando.
// No hay cancelación: los bloques descartan eventos viejos comparando el `seq` que guardaron (patrón de corte-1.md §4).

/** Las columnas de un calendario, con largo exacto `n` (es lo que viaja en la foto). */
export interface ColumnasCalendario {
  n: number;
  t: Float64Array;
  fase: Uint8Array;
  prioridad: Int32Array;
  seq: Float64Array;
  bloque: Int32Array;
  tipo: Int32Array;
  arg: Int32Array;
}

const CAPACIDAD_INICIAL = 64;

export class Calendario {
  /** Eventos pendientes. */
  n = 0;
  t: Float64Array;
  fase: Uint8Array;
  prioridad: Int32Array;
  seq: Float64Array;
  bloque: Int32Array;
  tipo: Int32Array;
  arg: Int32Array;

  constructor(capacidad = CAPACIDAD_INICIAL) {
    const c = Math.max(1, Math.floor(capacidad));
    this.t = new Float64Array(c);
    this.fase = new Uint8Array(c);
    this.prioridad = new Int32Array(c);
    this.seq = new Float64Array(c);
    this.bloque = new Int32Array(c);
    this.tipo = new Int32Array(c);
    this.arg = new Int32Array(c);
  }

  get capacidad(): number {
    return this.t.length;
  }

  private crecer(): void {
    const c = this.t.length * 2;
    const t = new Float64Array(c); t.set(this.t); this.t = t;
    const fase = new Uint8Array(c); fase.set(this.fase); this.fase = fase;
    const prioridad = new Int32Array(c); prioridad.set(this.prioridad); this.prioridad = prioridad;
    const seq = new Float64Array(c); seq.set(this.seq); this.seq = seq;
    const bloque = new Int32Array(c); bloque.set(this.bloque); this.bloque = bloque;
    const tipo = new Int32Array(c); tipo.set(this.tipo); this.tipo = tipo;
    const arg = new Int32Array(c); arg.set(this.arg); this.arg = arg;
  }

  /** Agrega un evento (los valores ya vienen validados por el motor). */
  poner(t: number, fase: number, prioridad: number, seq: number, bloque: number, tipo: number, arg: number): void {
    if (this.n === this.t.length) this.crecer();
    const T = this.t, FA = this.fase, PR = this.prioridad, SQ = this.seq, BL = this.bloque, TI = this.tipo, AR = this.arg;
    let i = this.n++;
    // Sube el hueco mientras el padre vaya después del nuevo evento.
    while (i > 0) {
      const p = (i - 1) >> 1;
      const tp = T[p];
      if (tp < t) break;
      if (tp === t) {
        const fp = FA[p];
        if (fp < fase) break;
        if (fp === fase) {
          const pp = PR[p];
          if (pp < prioridad || (pp === prioridad && SQ[p] < seq)) break;
        }
      }
      T[i] = tp; FA[i] = FA[p]; PR[i] = PR[p]; SQ[i] = SQ[p]; BL[i] = BL[p]; TI[i] = TI[p]; AR[i] = AR[p];
      i = p;
    }
    T[i] = t; FA[i] = fase; PR[i] = prioridad; SQ[i] = seq; BL[i] = bloque; TI[i] = tipo; AR[i] = arg;
  }

  /** Saca el primero (posición 0). El que llama ya leyó sus columnas. */
  quitarPrimero(): void {
    const n = --this.n;
    if (n <= 0) { this.n = 0; return; }
    const T = this.t, FA = this.fase, PR = this.prioridad, SQ = this.seq, BL = this.bloque, TI = this.tipo, AR = this.arg;
    // El último baja desde la raíz.
    const t = T[n], fase = FA[n], prioridad = PR[n], seq = SQ[n], bloque = BL[n], tipo = TI[n], arg = AR[n];
    this.hundir(0, n, t, fase, prioridad, seq, bloque, tipo, arg);
  }

  /** Hunde el evento (t, …) desde el hueco i en un montículo de n elementos. */
  private hundir(i: number, n: number, t: number, fase: number, prioridad: number, seq: number, bloque: number, tipo: number, arg: number): void {
    const T = this.t, FA = this.fase, PR = this.prioridad, SQ = this.seq, BL = this.bloque, TI = this.tipo, AR = this.arg;
    for (;;) {
      let h = 2 * i + 1;
      if (h >= n) break;
      const d = h + 1;
      if (d < n && antes(T[d], FA[d], PR[d], SQ[d], T[h], FA[h], PR[h], SQ[h])) h = d;
      if (!antes(T[h], FA[h], PR[h], SQ[h], t, fase, prioridad, seq)) break;
      T[i] = T[h]; FA[i] = FA[h]; PR[i] = PR[h]; SQ[i] = SQ[h]; BL[i] = BL[h]; TI[i] = TI[h]; AR[i] = AR[h];
      i = h;
    }
    T[i] = t; FA[i] = fase; PR[i] = prioridad; SQ[i] = seq; BL[i] = bloque; TI[i] = tipo; AR[i] = arg;
  }

  /** Copia de las columnas con largo exacto (para la foto). */
  columnas(): ColumnasCalendario {
    const n = this.n;
    return {
      n,
      t: this.t.slice(0, n), fase: this.fase.slice(0, n), prioridad: this.prioridad.slice(0, n), seq: this.seq.slice(0, n),
      bloque: this.bloque.slice(0, n), tipo: this.tipo.slice(0, n), arg: this.arg.slice(0, n),
    };
  }

  /** Reemplaza el contenido por los eventos de `c` (en cualquier orden) y rearma el montículo. */
  cargar(c: ColumnasCalendario): void {
    const n = c.n;
    let cap = CAPACIDAD_INICIAL;
    while (cap < n) cap *= 2;
    this.t = new Float64Array(cap); this.t.set(c.t.subarray(0, n));
    this.fase = new Uint8Array(cap); this.fase.set(c.fase.subarray(0, n));
    this.prioridad = new Int32Array(cap); this.prioridad.set(c.prioridad.subarray(0, n));
    this.seq = new Float64Array(cap); this.seq.set(c.seq.subarray(0, n));
    this.bloque = new Int32Array(cap); this.bloque.set(c.bloque.subarray(0, n));
    this.tipo = new Int32Array(cap); this.tipo.set(c.tipo.subarray(0, n));
    this.arg = new Int32Array(cap); this.arg.set(c.arg.subarray(0, n));
    this.n = n;
    for (let i = (n >> 1) - 1; i >= 0; i--) {
      this.hundir(i, n, this.t[i], this.fase[i], this.prioridad[i], this.seq[i], this.bloque[i], this.tipo[i], this.arg[i]);
    }
  }
}

/** ¿El evento 1 va antes que el 2? Orden (t, fase, prioridad, seq). */
function antes(t1: number, f1: number, p1: number, s1: number, t2: number, f2: number, p2: number, s2: number): boolean {
  if (t1 !== t2) return t1 < t2;
  if (f1 !== f2) return f1 < f2;
  if (p1 !== p2) return p1 < p2;
  return s1 < s2;
}
