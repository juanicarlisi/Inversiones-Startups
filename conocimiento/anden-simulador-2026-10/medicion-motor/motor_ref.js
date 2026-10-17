'use strict';
// Motor de referencia minimo de Anden (medicion propia del 17-10-2026, para conocimiento/anden-simulador-2026-10/motor-validacion.md).
// No es el motor de produccion: es la maqueta de la API propuesta y la base para correr la bateria de validacion (validacion.js).
// Eventos discretos con: calendario (heap por tiempo, prioridad, secuencia), procesos como generadores (function*),
// recursos con cola por prioridad y preempcion (con reanudacion), interrupciones, monitores y flujos aleatorios con nombre.

// ---------- Flujos aleatorios con nombre: (semilla, nombre del flujo, replica) -> generador independiente ----------
// Prototipo: xoshiro128** sembrado por mezcla de hashes. En produccion: Philox4x32-10 (contador) con clave (semilla, flujo)
// y contador (replica, indice), que da flujos reproducibles en cualquier maquina sin guardar estado.
function rotl(x, k) { return (x << k) | (x >>> (32 - k)); }
function mix32(h) { h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0; }
function hashStr(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; }

class Stream {
  constructor(seed, name, rep) {
    let a = mix32(mix32(seed >>> 0) ^ hashStr(name));
    a = mix32(a ^ mix32((rep + 0x9e3779b9) >>> 0));
    const sm = () => { a = (a + 0x9e3779b9) | 0; let t = a ^ (a >>> 16); t = Math.imul(t, 0x21f0aaad); t ^= t >>> 15; t = Math.imul(t, 0x735a2d97); t ^= t >>> 15; return t >>> 0; };
    this.s = new Uint32Array([sm(), sm(), sm(), sm()]);
    this.draws = 0;
  }
  u32() { const s = this.s; const r = Math.imul(rotl(Math.imul(s[1], 5), 7), 9) >>> 0; const t = s[1] << 9; s[2] ^= s[0]; s[3] ^= s[1]; s[1] ^= s[2]; s[0] ^= s[3]; s[2] ^= t; s[3] = rotl(s[3], 11); return r; }
  u() { this.draws++; return ((this.u32() >>> 5) * 67108864 + (this.u32() >>> 6) + 0.5) / 9007199254740992; } // en (0,1), 53 bits
  exp(mean) { return -mean * Math.log(this.u()); }
  unif(a, b) { return a + (b - a) * this.u(); }
  erlang(k, mean) { let p = 1; for (let i = 0; i < k; i++) p *= this.u(); return -mean / k * Math.log(p); }
  normal() { const u1 = this.u(), u2 = this.u(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); } // siempre 2 numeros: sincronia para CRN
  lognormal(mean, cv) { const s2 = Math.log(1 + cv * cv); return mean * Math.exp(-s2 / 2 + Math.sqrt(s2) * this.normal()); }
  bern(p) { return this.u() < p; }
}

// ---------- Calendario de eventos: heap binario por (tiempo, prioridad, secuencia) -> orden total y determinista ----------
class Heap {
  constructor() { this.a = []; }
  static less(x, y) { return x.t < y.t || (x.t === y.t && (x.p < y.p || (x.p === y.p && x.q < y.q))); }
  push(e) { const a = this.a; a.push(e); let i = a.length - 1; while (i > 0) { const j = (i - 1) >> 1; if (!Heap.less(e, a[j])) break; a[i] = a[j]; i = j; } a[i] = e; }
  pop() { const a = this.a; const top = a[0]; const last = a.pop(); const n = a.length; if (n > 0) { let i = 0; for (;;) { const l = 2 * i + 1; if (l >= n) break; const r = l + 1; const m = (r < n && Heap.less(a[r], a[l])) ? r : l; if (!Heap.less(a[m], last)) break; a[i] = a[m]; i = m; } a[i] = last; } return top; }
  get size() { return this.a.length; }
}

const URGENTE = 0, NORMAL = 1;
const f64 = new Float64Array(1), u32v = new Uint32Array(f64.buffer);

class Sim {
  constructor(o = {}) { this.now = 0; this.heap = new Heap(); this.seq = 0; this.seed = o.seed ?? 1; this.rep = o.rep ?? 0; this.streams = new Map(); this.events = 0; this.hashOn = !!o.hashTrace; this.hash = 0x811c9dc5; this._stop = false; }
  stream(name) { let s = this.streams.get(name); if (!s) { s = new Stream(this.seed, name, this.rep); this.streams.set(name, s); } return s; }
  schedule(delay, fn, prio = NORMAL) { if (!(delay >= 0)) throw new Error('retardo negativo o NaN: ' + delay); const e = { t: this.now + delay, p: prio, q: this.seq++, fn, cancelled: false }; this.heap.push(e); return e; }
  timeout(d) { return new Timeout(this, d); }
  process(genFn, ...args) { const p = new Proc(this, genFn(this, ...args)); this.schedule(0, () => p._step('next'), URGENTE); return p; }
  stop() { this._stop = true; }
  run(until = Infinity) {
    const h = this.heap;
    while (h.size > 0 && !this._stop) {
      const e = h.a[0]; if (e.t > until) break; h.pop(); if (e.cancelled) continue;
      this.now = e.t; this.events++;
      if (this.hashOn) { f64[0] = e.t; this.hash = Math.imul(this.hash ^ u32v[0], 0x01000193) >>> 0; this.hash = Math.imul(this.hash ^ u32v[1], 0x01000193) >>> 0; }
      e.fn();
    }
    if (until !== Infinity && !this._stop && this.now < until) this.now = until;
  }
}

class Timeout { constructor(sim, d) { this.sim = sim; this.d = d; } _bind(p) { const e = this.sim.schedule(this.d, () => p._step('next')); p.pending = { cancel() { e.cancelled = true; } }; } }

class Interrupt { constructor(cause) { this.cause = cause; } }

class Proc {
  constructor(sim, gen) { this.sim = sim; this.gen = gen; this.pending = null; this.done = false; this.waiters = []; }
  _step(m, arg) {
    this.pending = null;
    const r = this.gen[m](arg);
    if (r.done) { this.done = true; this.value = r.value; const w = this.waiters; this.waiters = []; for (const f of w) f(r.value); return; }
    const cmd = r.value; if (!cmd || !cmd._bind) throw new Error('el proceso hizo yield de algo que no es un evento');
    cmd._bind(this);
  }
  _bind(p) { if (this.done) this.sim.schedule(0, () => p._step('next', this.value)); else this.waiters.push(v => this.sim.schedule(0, () => p._step('next', v))); } // esperar a que termine otro proceso
  interrupt(cause) { if (this.done) return; if (this.pending) this.pending.cancel(); this.pending = null; this.sim.schedule(0, () => this._step('throw', new Interrupt(cause)), URGENTE); }
}

// ---------- Monitores ----------
class TimeWeighted { // promedio ponderado por tiempo (L, Lq, ocupacion)
  constructor(sim, v = 0) { this.sim = sim; this.v = v; this.t0 = 0; this.last = 0; this.area = 0; }
  set(v) { const t = this.sim.now; this.area += this.v * (t - this.last); this.last = t; this.v = v; }
  reset() { const t = this.sim.now; this.area = 0; this.last = t; this.t0 = t; }
  mean() { const t = this.sim.now; return (this.area + this.v * (t - this.last)) / (t - this.t0); }
}
class Tally { constructor() { this.n = 0; this.s = 0; } add(x) { this.n++; this.s += x; } mean() { return this.s / this.n; } reset() { this.n = 0; this.s = 0; } }

// ---------- Recurso con cola por (prioridad, tiempo de pedido, secuencia) y preempcion ----------
class Request {
  constructor(res, o) { this.res = res; this.priority = o.priority ?? 0; this.preempt = !!o.preempt; this.keyTime = o.keyTime; this.proc = null; this.granted = false; }
  _bind(p) { this.proc = p; this.res._enqueue(this); if (!this.granted) p.pending = { cancel: () => this.res._cancel(this) }; }
}
class Resource {
  constructor(sim, capacity = 1) { this.sim = sim; this.cap = capacity; this.users = []; this.queue = []; this.busy = new TimeWeighted(sim); this.qlen = new TimeWeighted(sim); }
  request(o = {}) { return new Request(this, o); }
  static cmp(a, b) { return (a.priority - b.priority) || (a.kt - b.kt) || (a.q - b.q); }
  _enqueue(r) {
    r.kt = r.keyTime ?? this.sim.now; r.q = this.sim.seq++;
    let i = this.queue.length; while (i > 0 && Resource.cmp(this.queue[i - 1], r) > 0) i--; this.queue.splice(i, 0, r);
    if (this.users.length >= this.cap && r.preempt && this.queue[0] === r) {
      let v = null; for (const u of this.users) if (!v || u.priority > v.priority || (u.priority === v.priority && u.grantT > v.grantT)) v = u;
      if (v && v.priority > r.priority) { this.users.splice(this.users.indexOf(v), 1); this.busy.set(this.users.length); v.granted = false; v.proc.interrupt({ by: r, usageSince: v.grantT, resource: this }); }
    }
    this._tryGrant();
  }
  _tryGrant() {
    while (this.users.length < this.cap && this.queue.length > 0) {
      const r = this.queue.shift(); r.granted = true; r.grantT = this.sim.now; this.users.push(r); this.busy.set(this.users.length);
      const e = this.sim.schedule(0, () => r.proc._step('next', r)); r.proc.pending = { cancel() { e.cancelled = true; } };
    }
    this.qlen.set(this.queue.length);
  }
  release(r) { const i = this.users.indexOf(r); if (i >= 0) { this.users.splice(i, 1); this.busy.set(this.users.length); } this._tryGrant(); }
  _cancel(r) { const i = this.queue.indexOf(r); if (i >= 0) this.queue.splice(i, 1); this.qlen.set(this.queue.length); }
}

// Trabajo con preempcion y reanudacion (preemptive-resume): si lo sacan, vuelve a la cola con su clave original y sigue donde quedo.
function* work(sim, res, dur, o = {}) {
  let rem = dur; const kt = sim.now;
  while (rem > 1e-12) {
    const req = res.request({ ...o, keyTime: kt }); let start;
    try { yield req; start = sim.now; yield sim.timeout(rem); rem = 0; res.release(req); }
    catch (e) { if (!(e instanceof Interrupt)) throw e; if (start !== undefined) rem -= sim.now - start; }
  }
}

module.exports = { Sim, Stream, Resource, Interrupt, TimeWeighted, Tally, work, URGENTE, NORMAL };
