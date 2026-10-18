// hub/pruebas/motor-con-foto.ts · SOLO PRUEBAS de P4. El motor de referencia de contratos/ no implementa foto() ni restaurar(), y
// este paquete no puede importar nucleo/ (corte-1.md §14.3). Para probar desde ya que el estado de los bloques del hub es completo
// (R06: foto a mitad de la noche + restaurar en un motor nuevo con bloques nuevos → la misma huella final), este archivo copia la
// semántica de la referencia (mismo azar, mismo orden del calendario, misma huella, mismo escritor) y le agrega foto y restauración.
// La prueba R06 de la integración la repite con el núcleo de producción.
import { Fase, type Ms } from '../../contratos/tipos-base.ts';
import type { Bloque, EstadoBloque, EstadoCorrida, Foto, Motor, OpcionesMotor, ResultadoCorrida } from '../../contratos/motor.ts';
import { claveDe, crearEscritorReferencia, crearFuenteAzarReferencia, matNativa } from '../../contratos/referencia/motor-referencia.ts';

interface Ev { t: Ms; fase: number; prio: number; seq: number; bloque: number; tipo: number; arg: number }
const antes = (x: Ev, y: Ev) =>
  x.t < y.t || (x.t === y.t && (x.fase < y.fase || (x.fase === y.fase && (x.prio < y.prio || (x.prio === y.prio && x.seq < y.seq)))));

function copiarEstado(e: EstadoBloque): EstadoBloque {
  const out: EstadoBloque = {};
  for (const k of Object.keys(e)) {
    const v = e[k];
    out[k] = typeof v === 'number' ? v : v.slice();
  }
  return out;
}

export function crearMotorConFoto(o: OpcionesMotor): Motor {
  let heap: Ev[] = [];
  const bloques: Bloque[] = [];
  let ahora = 0, seq = 0, actual = -1, eventos = 0, h1 = 0x811c9dc5, h2 = 0xc2b2ae35, mismo = 0, tAnterior = -1;
  const maxEv = o.maxEventos ?? 50_000_000, maxMismo = o.maxMismoInstante ?? 1_000_000;
  const mezclar = (w: number) => {
    h1 = Math.imul(h1 ^ w, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ w, 0x85ebca6b) >>> 0;
    h2 = (h2 ^ (h2 >>> 13)) >>> 0;
  };
  const hex = () => h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  const subir = (i: number) => { while (i > 0) { const p = (i - 1) >> 1; if (!antes(heap[i], heap[p])) break; [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; } };
  const bajar = (i: number) => {
    for (;;) {
      const l = 2 * i + 1, r = l + 1;
      let m = i;
      if (l < heap.length && antes(heap[l], heap[m])) m = l;
      if (r < heap.length && antes(heap[r], heap[m])) m = r;
      if (m === i) return;
      [heap[i], heap[m]] = [heap[m], heap[i]];
      i = m;
    }
  };
  const sacar = (): Ev => { const top = heap[0], last = heap.pop()!; if (heap.length) { heap[0] = last; bajar(0); } return top; };
  const correrHasta = (hasta: Ms): ResultadoCorrida => {
    let estado: EstadoCorrida = 'sin-eventos';
    const tope = Math.min(hasta, o.hasta);
    while (heap.length) {
      if (heap[0].t > tope) { estado = hasta >= o.hasta ? 'horizonte' : 'pausa'; break; }
      if (eventos >= maxEv) { estado = 'tope-eventos'; break; }
      const e = sacar();
      ahora = e.t; actual = e.seq; eventos++;
      if (e.t === tAnterior) { if (++mismo > maxMismo) { estado = 'lazo-tiempo-cero'; break; } } else { mismo = 0; tAnterior = e.t; }
      mezclar(e.t % 4294967296); mezclar(Math.floor(e.t / 4294967296)); mezclar(e.bloque >>> 0); mezclar(e.tipo >>> 0); mezclar(e.arg >>> 0);
      bloques[e.bloque].manejar(m, e.tipo, e.arg);
    }
    if (estado === 'sin-eventos' || estado === 'pausa' || estado === 'horizonte') ahora = Math.max(ahora, tope);
    return { estado, ahora, eventos, huella: hex() };
  };
  const azar = crearFuenteAzarReferencia(o.semilla, o.replica);
  const traza = crearEscritorReferencia(o.traza);
  const m: Motor = {
    get ahora() { return ahora; }, get seq() { return actual; }, get eventos() { return eventos; },
    opciones: o, azar, mat: matNativa, traza, claveDe,
    registrar: (b) => { bloques.push(b); return bloques.length - 1; },
    agendar: (t, bloque, tipo, arg, fase = Fase.NORMAL, prioridad = 0) => {
      if (!Number.isInteger(t)) throw new Error(`tiempo no entero: ${t}`);
      if (t < ahora) throw new Error(`tiempo en el pasado: ${t} < ${ahora}`);
      heap.push({ t, fase, prio: prioridad, seq, bloque, tipo, arg });
      subir(heap.length - 1);
      return seq++;
    },
    correr: () => correrHasta(o.hasta),
    correrHasta,
    foto: (): Foto => {
      const n = heap.length;
      const cal = {
        n, t: new Float64Array(n), fase: new Uint8Array(n), prioridad: new Int32Array(n), seq: new Float64Array(n),
        bloque: new Int32Array(n), tipo: new Int32Array(n), arg: new Int32Array(n), actual, mismo, tAnterior,
      };
      heap.forEach((e, i) => { cal.t[i] = e.t; cal.fase[i] = e.fase; cal.prioridad[i] = e.prio; cal.seq[i] = e.seq; cal.bloque[i] = e.bloque; cal.tipo[i] = e.tipo; cal.arg[i] = e.arg; });
      const bl: Record<string, EstadoBloque> = {};
      for (const b of bloques) {
        if (bl[b.ruta]) throw new Error(`foto: ruta de bloque repetida ${b.ruta}`);
        bl[b.ruta] = copiarEstado(b.estado());
      }
      return { version: 1, ahora, seq, eventos, huella: [h1, h2], calendario: cal, bloques: bl };
    },
    restaurar: (f: Foto) => {
      const rutas = Object.keys(f.bloques);
      if (rutas.length !== bloques.length || bloques.some((b, i) => b.ruta !== rutas[i])) {
        throw new Error(`restaurar: se esperaban los bloques ${rutas.join(', ')} en ese orden y están ${bloques.map((b) => b.ruta).join(', ')}`);
      }
      const c = f.calendario as Record<string, Float64Array | Int32Array | Uint8Array | number>;
      const n = c.n as number, T = c.t as Float64Array, Fa = c.fase as Uint8Array, Pr = c.prioridad as Int32Array, Sq = c.seq as Float64Array;
      const B = c.bloque as Int32Array, Ti = c.tipo as Int32Array, A = c.arg as Int32Array;
      heap = Array.from({ length: n }, (_, i) => ({ t: T[i], fase: Fa[i], prio: Pr[i], seq: Sq[i], bloque: B[i], tipo: Ti[i], arg: A[i] }));
      ahora = f.ahora; seq = f.seq; eventos = f.eventos; [h1, h2] = f.huella;
      actual = c.actual as number; mismo = c.mismo as number; tAnterior = c.tAnterior as number;
      for (const b of bloques) b.restaurar(copiarEstado(f.bloques[b.ruta]));
    },
    huella: hex,
    finalizar: () => { for (const b of bloques) b.finalizar?.(m); },
  };
  return m;
}
