// Andén · visión «Experiencia» · medición propia (17-10-2026)
// Reproductor de la traza: dado un instante t, calcula dónde está cada cosa (paquetes, bandejas, rampas, jaulas) SIN volver a
// simular y sin motor de física: todo sale de fórmulas cerradas sobre los tramos (lerp en cintas, bandeja = slot + t/tick,
// lugar en la fila = número de secuencia − salidas hasta t). Lo usan las tres vistas (2D, 2,5D isométrica y 3D) y el video.
import { K } from './hub.mjs';

const ESTADO = { CINTA: 0, COLA: 1, MANOS: 2, BANDEJA: 3, VUELTA: 4, RAMPA: 5, EXCEPCION: 6 };
export { ESTADO };

// cantidad de valores <= t en un arreglo ordenado
function hasta(arr, t) { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] <= t) lo = m + 1; else hi = m; } return lo; }

export class Reproductor {
  constructor(sim) {
    const tr = sim.traza, G = sim.geo; this.tr = tr; this.G = G;
    const n = tr.n, idx = [];
    for (let i = 0; i < n; i++) if (tr.k[i] !== K.JAULA) idx.push(i);
    idx.sort((a, b) => tr.t0[a] - tr.t0[b]); this.ord = Int32Array.from(idx);
    this.ptr = 0; this.act = new Int32Array(1 << 16); this.nAct = 0;
    // salidas de la fila de inducción y de cada rampa, ordenadas (para el lugar en la fila)
    const sal = [], NR = G.rampas.length + 1, entR = Array.from({ length: NR }, () => []), salR = Array.from({ length: NR }, () => []),
      jau = Array.from({ length: G.rampas.length }, () => []);
    for (let i = 0; i < n; i++) {
      const k = tr.k[i];
      if (k === K.COLA) sal.push(tr.t1[i]);
      else if (k === K.RAMPA) { entR[tr.r[i]].push(tr.t0[i]); salR[tr.r[i]].push(tr.t1[i]); }
      else if (k === K.JAULA) jau[tr.r[i]].push(tr.t0[i]);
    }
    const ordenar = (a) => Float64Array.from(a).sort();
    this.salCola = ordenar(sal); this.entR = entR.map(ordenar); this.salR = salR.map(ordenar); this.jau = jau.map(ordenar);
    // salida: posiciones en metros (x, y, z) y estado por entidad visible
    const cap = 1 << 16; this.x = new Float32Array(cap); this.y = new Float32Array(cap); this.z = new Float32Array(cap); this.est = new Uint8Array(cap);
    this.nVis = 0;
    const T = G.T; this.bx = new Float32Array(T); this.by = new Float32Array(T); this.bang = new Float32Array(T);
    this.ocupRampa = new Float32Array(NR); this.nivelJaula = new Float32Array(G.rampas.length); this.nroJaula = new Int32Array(G.rampas.length);
    // cintas: polilínea de cada andén a la fila
    this.cintas = G.andenes.map((a) => { const pts = [[a.x, a.y + 2], [a.x, -10], [2, -10], [2, -3]]; const L = [0];
      for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, L }; });
  }
  enCinta(c, f, out) { const { pts, L } = this.cintas[c]; const s = f * L[L.length - 1]; let i = 1; while (i < L.length - 1 && L[i] < s) i++;
    const g = (s - L[i - 1]) / (L[i] - L[i - 1] || 1); out[0] = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * g; out[1] = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * g; }
  // avanza el conjunto de tramos activos hasta t (solo hacia adelante; para rebobinar se reconstruye desde una foto)
  ir(t) {
    const tr = this.tr, ord = this.ord; let w = 0;
    for (let q = 0; q < this.nAct; q++) { const i = this.act[q]; if (tr.t1[i] > t) this.act[w++] = i; }
    this.nAct = w;
    while (this.ptr < ord.length && tr.t0[ord[this.ptr]] <= t) { const i = ord[this.ptr++]; if (tr.t1[i] > t) { if (this.nAct === this.act.length) { const b = new Int32Array(this.act.length * 2); b.set(this.act); this.act = b; } this.act[this.nAct++] = i; } }
  }
  reiniciar() { this.ptr = 0; this.nAct = 0; }
  posiciones(t) {
    const tr = this.tr, G = this.G, TICK = tr.tick, T = G.T, paso = G.L / T; const o = [0, 0];
    const deq = hasta(this.salCola, t);
    const NR = G.rampas.length;
    const tomadas = new Int32Array(NR + 1); for (let r = 0; r <= NR; r++) tomadas[r] = hasta(this.salR[r], t);
    let v = 0;
    for (let q = 0; q < this.nAct; q++) {
      const i = this.act[q], k = tr.k[i], r = tr.r[i], f = (t - tr.t0[i]) / (tr.t1[i] - tr.t0[i]);
      let x = 0, y = 0, z = 0.3, e = ESTADO.CINTA;
      if (k === K.DESCARGA) { const a = G.andenes[r]; x = a.x; y = a.y + 2 * f; }
      else if (k === K.CINTA) { this.enCinta(r, f, o); x = o[0]; y = o[1]; z = 0.8; }
      else if (k === K.COLA) { const rk = tr.a[i] - deq; e = ESTADO.COLA; z = 0.8;
        if (rk < 28) { x = 12 - 0.5 * rk; y = -3; } else { x = -2; y = -3 - 0.5 * (rk - 28); } }
      else if (k === K.INDUCCION) { const s = G.estaciones[r]; x = s.x; y = -1.4; z = 1.0; e = ESTADO.MANOS; }
      else if (k === K.BANDEJA) { const s = ((r + t / TICK) % T) * paso; const p = G.enLazo(s); x = p[0]; y = p[1]; z = 1.15;
        e = tr.a[i] > 0 && (t - tr.t0[i]) > G.L / (paso / TICK) * 0.9 ? ESTADO.VUELTA : ESTADO.BANDEJA; }
      else if (k === K.RAMPA) { const rk = tr.a[i] - tomadas[r]; const R = r < NR ? G.rampas[r] : G.excepcion; const lado = R.lado;
        x = R.x; y = R.y + lado * (1.0 + 0.1 * rk); z = 0.9 - 0.02 * rk; e = r < NR ? ESTADO.RAMPA : ESTADO.EXCEPCION; }
      else if (k === K.MANO) { const R = G.rampas[tr.a[i]]; x = R.x; y = R.y + R.lado * (3.5 + 1.0 * f); z = 1.0; e = ESTADO.MANOS; }
      else if (k === K.MANUAL) { x = G.excepcion.x + 2 * r; y = G.excepcion.y + 4; z = 1.0; e = ESTADO.EXCEPCION; }
      this.x[v] = x; this.y[v] = y; this.z[v] = z; this.est[v] = e; v++;
    }
    this.nVis = v;
    for (let j = 0; j < T; j++) { const p = G.enLazo(((j + t / TICK) % T) * paso); this.bx[j] = p[0]; this.by[j] = p[1]; this.bang[j] = p[2]; }
    for (let r = 0; r <= NR; r++) { const cap = r < NR ? 25 : 60; this.ocupRampa[r] = Math.min(1, (hasta(this.entR[r], t) - tomadas[r]) / cap); }
    for (let r = 0; r < NR; r++) { const c = hasta(this.jau[r], t); this.nroJaula[r] = Math.floor(c / 60); this.nivelJaula[r] = (c % 60) / 60; }
    return v;
  }
}
