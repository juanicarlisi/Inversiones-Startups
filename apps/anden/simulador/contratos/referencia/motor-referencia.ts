// contratos/referencia/motor-referencia.ts · Implementación de REFERENCIA del contrato del motor: simple, lenta y legible.
// Para qué: (1) que los paquetes corran su código antes de que exista nucleo/ y (2) la prueba diferencial R08: el núcleo de
// producción tiene que dar la MISMA huella que esta referencia en los mismos modelos. Usa Math.* nativo (en V8 coincide bit a bit
// con la matemática propia: MEDIDO el 17-10-2026); no implementa foto ni restaurar. No se usa en la app.
import { Fase, type Ms } from '../tipos-base.ts';
import type { Direccion, Distribucion, FuenteAzar } from '../azar.ts';
import type { Bloque, EstadoCorrida, Motor, OpcionesMotor, ResultadoCorrida, Foto } from '../motor.ts';
import type { MatematicaDeterminista } from '../matematica.ts';
import type { Causa, EscritorTraza, NivelTraza, TipoMomento, TipoTramo, Traza } from '../traza.ts';

// ---- Philox4x32-10 (Salmon y otros, SC11) ----
const M0 = 0xd2511f53, M1 = 0xcd9e8d57, W0 = 0x9e3779b9, W1 = 0xbb67ae85;
function mulhi(a: number, b: number): number {
  const a0 = a & 0xffff, a1 = a >>> 16, b0 = b & 0xffff, b1 = b >>> 16;
  const p00 = a0 * b0, p01 = a0 * b1, p10 = a1 * b0, p11 = a1 * b1;
  const mid = (p00 >>> 16) + (p01 & 0xffff) + (p10 & 0xffff);
  return (p11 + (p01 >>> 16) + (p10 >>> 16) + (mid >>> 16)) >>> 0;
}
export function philox4x32_10(c0: number, c1: number, c2: number, c3: number, k0: number, k1: number, out: Uint32Array): void {
  for (let r = 0; r < 10; r++) {
    const h0 = mulhi(M0, c0), l0 = Math.imul(M0, c0) >>> 0, h1 = mulhi(M1, c2), l1 = Math.imul(M1, c2) >>> 0;
    const n0 = (h1 ^ c1 ^ k0) >>> 0, n2 = (h0 ^ c3 ^ k1) >>> 0;
    c0 = n0; c1 = l1; c2 = n2; c3 = l0; k0 = (k0 + W0) >>> 0; k1 = (k1 + W1) >>> 0;
  }
  out[0] = c0; out[1] = c1; out[2] = c2; out[3] = c3;
}
const UTF8 = new TextEncoder();
/** FNV-1a de 32 bits sobre los bytes UTF-8 de `${ruta}/${proposito}`. */
export function claveDe(ruta: string, proposito: string): number {
  let h = 0x811c9dc5;
  for (const b of UTF8.encode(`${ruta}/${proposito}`)) h = Math.imul(h ^ b, 0x01000193) >>> 0;
  return h >>> 0;
}
export const matNativa: MatematicaDeterminista = {
  log: Math.log, exp: Math.exp, cos: Math.cos, sin: Math.sin, sqrt: Math.sqrt,
  pow: (x, y) => (y === 0 ? 1 : x === 0 ? 0 : Math.exp(y * Math.log(x))),
};
export function crearFuenteAzarReferencia(semilla: number, replica: number, mat: MatematicaDeterminista = matNativa): FuenteAzar {
  const out = new Uint32Array(4);
  const bloque = (d: Direccion, sub: number, o: Uint32Array) =>
    philox4x32_10(replica >>> 0, d.a >>> 0, d.b >>> 0, ((d.c & 0xffffff) * 256 + (sub & 0xff)) >>> 0, semilla >>> 0, d.clave >>> 0, o);
  const uniforme = (d: Direccion, i = 0): number => {
    bloque(d, i >> 1, out);
    const hi = (i & 1) === 0 ? out[0] : out[2], lo = (i & 1) === 0 ? out[1] : out[3];
    return ((hi >>> 5) * 67108864 + (lo >>> 6) + 0.5) / 9007199254740992;
  };
  const normal = (d: Direccion): number => mat.sqrt(-2 * mat.log(uniforme(d, 0))) * mat.cos(2 * Math.PI * uniforme(d, 1));
  const sortear = (x: Distribucion, d: Direccion): number => {
    switch (x.tipo) {
      case 'fija': return x.valor;
      case 'uniforme': return x.min + (x.max - x.min) * uniforme(d, 0);
      case 'exponencial': return -x.media * mat.log(uniforme(d, 0));
      case 'triangular': {
        const u = uniforme(d, 0), f = (x.moda - x.min) / (x.max - x.min);
        return u < f ? x.min + mat.sqrt(u * (x.max - x.min) * (x.moda - x.min)) : x.max - mat.sqrt((1 - u) * (x.max - x.min) * (x.max - x.moda));
      }
      case 'normal': {
        const v = x.media + x.desvio * normal(d);
        return Math.min(x.max ?? Infinity, Math.max(x.min ?? -Infinity, v));
      }
      case 'lognormal': {
        const s2 = mat.log(1 + x.cv * x.cv);
        return mat.exp(mat.log(x.media) - s2 / 2 + mat.sqrt(s2) * normal(d));
      }
      case 'erlang': { let s = 0; for (let i = 0; i < x.k; i++) s += mat.log(uniforme(d, i)); return -(x.media / x.k) * s; }
      case 'weibull': return x.escala * mat.exp(mat.log(-mat.log(uniforme(d, 0))) / x.forma);
      case 'bernoulli': return uniforme(d, 0) < x.p ? 1 : 0;
      case 'discreta': {
        const u = uniforme(d, 0); let tot = 0; for (const p of x.pesos) tot += p;
        let ac = 0; for (let i = 0; i < x.valores.length; i++) { ac += x.pesos[i] / tot; if (u <= ac) return x.valores[i]; }
        return x.valores[x.valores.length - 1];
      }
      case 'empirica': {
        const v = x.valores, pos = uniforme(d, 0) * (v.length - 1), i = Math.floor(pos);
        return i >= v.length - 1 ? v[v.length - 1] : v[i] + (pos - i) * (v[i + 1] - v[i]);
      }
    }
  };
  return { semilla, replica, bloque, uniforme, sortear };
}

// ---- Traza (referencia: arreglos comunes, columnas al terminar) ----
export function crearEscritorReferencia(nivel: NivelTraza): EscritorTraza {
  const T: number[][] = [[], [], [], [], [], [], [], []]; // e k r a t0 t1 c q
  const Mo: number[][] = [[], [], [], []];
  const P: number[][] = [[], [], [], [], [], [], []];       // camion indice ruta clase creado listo vueltas
  const completa = nivel === 'completa';
  const tramo = (e: number, k: TipoTramo, r: number, a: number, t0: Ms, t1: Ms, c: Causa = 0 as Causa, q = -1): number => {
    if (!completa) return -1;
    const i = T[0].length; [e, k, r, a, t0, t1, c, q].forEach((v, j) => T[j].push(v)); return i;
  };
  return {
    nivel,
    abrir: (e, k, r, a, t0, c, q) => tramo(e, k, r, a, t0, Infinity, c, q),
    cerrar: (i, t1, a) => { if (i < 0) return; T[5][i] = t1; if (a !== undefined) T[3][i] = a; },
    tramo,
    momento: (t, tipo: TipoMomento, r, v) => { if (!completa) return; [t, tipo, r, v].forEach((x, j) => Mo[j].push(x)); },
    paquete: (id, camion, indice, ruta, clase, creado) => { if (!completa) return; P[0][id] = camion; P[1][id] = indice; P[2][id] = ruta; P[3][id] = clase; P[4][id] = creado; P[5][id] = -1; P[6][id] = 0; },
    paqueteListo: (id, listo, vueltas) => { if (!completa) return; P[5][id] = listo; P[6][id] = vueltas; },
    terminar: (datos): Traza => {
      for (let i = 0; i < T[5].length; i++) if (T[5][i] === Infinity) T[5][i] = datos.fin;
      const n = T[0].length, np = P[0].length;
      return {
        ...datos, version: 1,
        tramos: { n, e: Int32Array.from(T[0]), k: Uint8Array.from(T[1]), r: Int32Array.from(T[2]), a: Int32Array.from(T[3]),
          t0: Float64Array.from(T[4]), t1: Float64Array.from(T[5]), c: Uint8Array.from(T[6]), q: Int32Array.from(T[7]) },
        momentos: { n: Mo[0].length, t: Float64Array.from(Mo[0]), tipo: Uint8Array.from(Mo[1]), r: Int32Array.from(Mo[2]), v: Float64Array.from(Mo[3]) },
        paquetes: { n: np, camion: Int32Array.from(P[0]), indice: Int32Array.from(P[1]), ruta: Int16Array.from(P[2]), clase: Uint8Array.from(P[3]),
          creado: Float64Array.from(P[4]), listo: Float64Array.from(P[5]), vueltas: Uint8Array.from(P[6]) },
      };
    },
  };
}

// ---- Motor de referencia ----
interface Ev { t: Ms; fase: number; prio: number; seq: number; bloque: number; tipo: number; arg: number }
const antes = (x: Ev, y: Ev) => x.t < y.t || (x.t === y.t && (x.fase < y.fase || (x.fase === y.fase && (x.prio < y.prio || (x.prio === y.prio && x.seq < y.seq)))));
export function crearMotorReferencia(o: OpcionesMotor): Motor {
  const heap: Ev[] = [], bloques: Bloque[] = [];
  let ahora = 0, seq = 0, actual = -1, eventos = 0, h1 = 0x811c9dc5, h2 = 0xc2b2ae35, mismo = 0, tAnterior = -1;
  const maxEv = o.maxEventos ?? 50_000_000, maxMismo = o.maxMismoInstante ?? 1_000_000;
  const mezclar = (w: number) => { h1 = Math.imul(h1 ^ w, 0x01000193) >>> 0; h2 = Math.imul(h2 ^ w, 0x85ebca6b) >>> 0; h2 = (h2 ^ (h2 >>> 13)) >>> 0; };
  const hex = () => h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  const subir = (i: number) => { while (i > 0) { const p = (i - 1) >> 1; if (!antes(heap[i], heap[p])) break; [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; } };
  const bajar = (i: number) => { for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && antes(heap[l], heap[m])) m = l; if (r < heap.length && antes(heap[r], heap[m])) m = r; if (m === i) return; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m; } };
  const sacar = (): Ev => { const top = heap[0], last = heap.pop()!; if (heap.length) { heap[0] = last; bajar(0); } return top; };
  const correrHasta = (hasta: Ms): ResultadoCorrida => {
    let estado: EstadoCorrida = 'sin-eventos';
    while (heap.length) {
      if (heap[0].t > hasta) { estado = hasta >= o.hasta ? 'horizonte' : 'pausa'; break; }
      if (eventos >= maxEv) { estado = 'tope-eventos'; break; }
      const e = sacar(); ahora = e.t; actual = e.seq; eventos++;
      if (e.t === tAnterior) { if (++mismo > maxMismo) { estado = 'lazo-tiempo-cero'; break; } } else { mismo = 0; tAnterior = e.t; }
      mezclar(e.t % 4294967296); mezclar(Math.floor(e.t / 4294967296)); mezclar(e.bloque >>> 0); mezclar(e.tipo >>> 0); mezclar(e.arg >>> 0);
      bloques[e.bloque].manejar(m, e.tipo, e.arg);
    }
    if (estado === 'sin-eventos' || estado === 'pausa' || estado === 'horizonte') ahora = Math.max(ahora, Math.min(hasta, o.hasta));
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
      heap.push({ t, fase, prio: prioridad, seq, bloque, tipo, arg }); subir(heap.length - 1); return seq++;
    },
    correr: () => correrHasta(o.hasta),
    correrHasta,
    foto: (): Foto => { throw new Error('la referencia no implementa foto()'); },
    restaurar: () => { throw new Error('la referencia no implementa restaurar()'); },
    huella: hex,
    finalizar: () => { for (const b of bloques) b.finalizar?.(m); },
  };
  return m;
}
