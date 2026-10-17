'use strict';
// Bateria de validacion de Anden contra teoria de colas y casos publicados (medicion propia del 17-10-2026).
// Uso: node validacion.js [nombre_de_prueba ...]   (sin argumentos corre todas)
const { Sim, Resource, TimeWeighted, Tally, work } = require('./motor_ref.js');
const { performance } = require('perf_hooks');

// ================= Estadistica =================
function lgamma(x) { const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x); x -= 1; let a = c[0]; const t = x + g + 0.5; for (let i = 1; i < 9; i++) a += c[i] / (x + i); return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a); }
function betacf(a, b, x) { const FP = 1e-300; const qab = a + b, qap = a + 1, qam = a - 1; let c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < FP) d = FP; d = 1 / d; let h = d;
  for (let m = 1; m <= 300; m++) { const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2)); d = 1 + aa * d; if (Math.abs(d) < FP) d = FP; c = 1 + aa / c; if (Math.abs(c) < FP) c = FP; d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2)); d = 1 + aa * d; if (Math.abs(d) < FP) d = FP; c = 1 + aa / c; if (Math.abs(c) < FP) c = FP; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 3e-15) break; } return h; }
function ibeta(a, b, x) { if (x <= 0) return 0; if (x >= 1) return 1; const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x)); return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b; }
function tcdf(t, df) { const p = 0.5 * ibeta(df / 2, 0.5, df / (df + t * t)); return t > 0 ? 1 - p : p; }
function tinv(p, df) { let lo = 0, hi = 1e3; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (tcdf(m, df) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
function ci(xs, conf = 0.95) { const n = xs.length; const m = xs.reduce((a, b) => a + b, 0) / n; const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1); const se = Math.sqrt(v / n); return { n, mean: m, sd: Math.sqrt(v), se, hw: tinv(1 - (1 - conf) / 2, n - 1) * se }; }
const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;

// ================= Teoria (valores analiticos) =================
function erlangB(c, a) { let B = 1; for (let k = 1; k <= c; k++) B = a * B / (k + a * B); return B; }
function erlangC(c, a) { const B = erlangB(c, a), r = a / c; return B / (1 - r * (1 - B)); }
function mmc(lam, mu, c) { const a = lam / mu, C = erlangC(c, a), Wq = C / (c * mu - lam); return { rho: a / c, C, Wq, W: Wq + 1 / mu, Lq: lam * Wq, L: lam * (Wq + 1 / mu) }; }
function mg1(lam, ES, ES2) { const rho = lam * ES, Wq = lam * ES2 / (2 * (1 - rho)); return { rho, Wq, W: Wq + ES, Lq: lam * Wq, L: lam * (Wq + ES) }; }
function dm1(lam, mu) { const rho = lam / mu; let s = 0; for (let i = 0; i < 200000; i++) { const n = Math.exp(-mu * (1 - s) / lam); if (Math.abs(n - s) < 1e-15) { s = n; break; } s = n; } return { sigma: s, Wq: s / (mu * (1 - s)), pwait: s }; }
function birthDeath(lamf, muf, N) { const p = [1]; for (let n = 1; n <= N; n++) p[n] = p[n - 1] * lamf(n - 1) / muf(n); const z = p.reduce((a, b) => a + b, 0); return p.map(x => x / z); }
function kingman(rho, ca2, cs2, ES) { return rho / (1 - rho) * (ca2 + cs2) / 2 * ES; }
function allenCunneen(lam, mu, c, ca2, cs2) { return erlangC(c, lam / mu) / (c * mu - lam) * (ca2 + cs2) / 2; }
function mva(means, N) { const K = means.length; let L = new Array(K).fill(0), X = 0, W = []; for (let m = 1; m <= N; m++) { W = means.map((s, k) => s * (1 + L[k])); X = m / W.reduce((a, b) => a + b, 0); L = W.map(w => X * w); } return { TH: X, CT: N / X }; }
function mtInf(lb, beta, gam, mu, t) { return lb / mu * (1 - Math.exp(-mu * t)) + lb * beta * ((mu * Math.sin(gam * t) - gam * Math.cos(gam * t)) + gam * Math.exp(-mu * t)) / (mu * mu + gam * gam); }

// ================= Modelos (escritos con la API de procesos) =================
// Estacion G/G/c/K FIFO. Servicio sorteado al llegar desde su propio flujo (sincronizacion para numeros aleatorios comunes).
function station(o) {
  const sim = new Sim({ seed: o.seed ?? 1, rep: o.rep ?? 0, hashTrace: o.hashTrace }); const res = new Resource(sim, o.c);
  const ra = sim.stream('llegadas'), rs = sim.stream('servicio');
  const W = new Tally(), Wq = new Tally(), L = new TimeWeighted(sim); let n = 0, blocked = 0, arr = 0, waited = 0; const arrTimes = o.keepArrivals ? [] : null;
  const K = o.K ?? Infinity;
  function* cliente(sim, s, count) { const t0 = sim.now; const r = res.request(); yield r; const tw = sim.now - t0; yield sim.timeout(s); res.release(r); n--; L.set(n);
    if (count && t0 >= o.warm) { W.add(sim.now - t0); Wq.add(tw); if (tw > 0) waited++; } }
  function* fuente(sim) { for (;;) { yield sim.timeout(o.iat(ra)); const s = o.svc(rs); if (arrTimes && arrTimes.length < 50) arrTimes.push(sim.now); const w = sim.now >= o.warm; if (w) arr++;
    if (n >= K) { if (w) blocked++; continue; } n++; L.set(n); sim.process(cliente, s, true); } }
  for (let i = 0; i < (o.n0 || 0); i++) { n++; sim.process(cliente, o.svc(rs), false); } L.set(n);
  sim.process(fuente);
  if (o.warm > 0) sim.schedule(o.warm, () => { L.reset(); res.busy.reset(); res.qlen.reset(); }, 0);
  sim.run(o.T);
  return { W: W.mean(), Wq: Wq.mean(), L: L.mean(), Lq: res.qlen.mean(), util: res.busy.mean() / o.c, pwait: waited / W.n, pblock: blocked / arr, events: sim.events, hash: sim.hash, arrTimes };
}

// Una clase de alta y una de baja prioridad, un servidor, con o sin preempcion (reanudacion).
function prioridad(o) {
  const sim = new Sim({ seed: o.seed, rep: o.rep }); const res = new Resource(sim, 1); const T = [new Tally(), new Tally()], Q = [new Tally(), new Tally()];
  function* cliente(sim, k, s) { const t0 = sim.now;
    if (o.preempt) yield* work(sim, res, s, { priority: k, preempt: true });
    else { const r = res.request({ priority: k }); yield r; if (t0 >= o.warm) Q[k].add(sim.now - t0); yield sim.timeout(s); res.release(r); }
    if (t0 >= o.warm) T[k].add(sim.now - t0); }
  function* fuente(sim, k) { const ra = sim.stream('lleg' + k), rs = sim.stream('serv' + k); for (;;) { yield sim.timeout(ra.exp(1 / o.lam[k])); sim.process(cliente, k, rs.exp(1 / o.mu)); } }
  sim.process(fuente, 0); sim.process(fuente, 1); sim.run(o.T);
  return { T1: T[0].mean(), T2: T[1].mean(), Wq1: Q[0].mean(), Wq2: Q[1].mean() };
}

// Red abierta de Jackson con realimentacion y estaciones M/M/c.
function jackson(o) {
  const sim = new Sim({ seed: o.seed, rep: o.rep }); const K = o.nodes.length; const res = o.nodes.map(nd => new Resource(sim, nd.c));
  const rs = o.nodes.map((_, i) => sim.stream('serv' + i)), rr = sim.stream('ruteo'), ra = sim.stream('lleg');
  const Ltot = new TimeWeighted(sim), Li = o.nodes.map(() => new TimeWeighted(sim)); const ni = new Array(K).fill(0); let n = 0; const W = new Tally(); let entradas = 0;
  function* trabajo(sim) { const t0 = sim.now; let i = 0;
    while (i >= 0) { ni[i]++; Li[i].set(ni[i]); const r = res[i].request(); yield r; yield sim.timeout(rs[i].exp(1 / o.nodes[i].mu)); res[i].release(r); ni[i]--; Li[i].set(ni[i]);
      const u = rr.u(); let acc = 0, nx = -1; for (let j = 0; j < K; j++) { acc += o.P[i][j]; if (u < acc) { nx = j; break; } } i = nx; }
    n--; Ltot.set(n); if (t0 >= o.warm) W.add(sim.now - t0); }
  function* fuente(sim) { for (;;) { yield sim.timeout(ra.exp(1 / o.lam)); if (sim.now >= o.warm) entradas++; n++; Ltot.set(n); sim.process(trabajo); } }
  sim.process(fuente); sim.schedule(o.warm, () => { Ltot.reset(); Li.forEach(m => m.reset()); }, 0); sim.run(o.T);
  return { L: Ltot.mean(), W: W.mean(), Li: Li.map(m => m.mean()), lamHat: entradas / (o.T - o.warm) };
}

// Red cerrada (CONWIP, tipo Penny Fab de Hopp y Spearman): N trabajos dando vueltas por K estaciones de 1 maquina.
function cerrada(o) {
  const sim = new Sim({ seed: o.seed, rep: o.rep }); const K = o.means.length; const res = o.means.map(() => new Resource(sim, 1)); const rs = o.means.map((_, i) => sim.stream('serv' + i));
  let ciclos = 0; const CT = new Tally();
  function* trabajo(sim) { for (;;) { const t0 = sim.now; for (let i = 0; i < K; i++) { const r = res[i].request(); yield r; yield sim.timeout(o.det ? o.means[i] : rs[i].exp(o.means[i])); res[i].release(r); }
      if (sim.now >= o.warm) ciclos++; if (t0 >= o.warm) CT.add(sim.now - t0); } }
  for (let j = 0; j < o.N; j++) sim.process(trabajo);
  let c0 = 0; sim.schedule(o.warm, () => { c0 = ciclos; }, 0); sim.run(o.T);
  return { TH: ciclos / (o.T - o.warm), CT: CT.mean() };
}

// M_t/M/inf con llegadas de Poisson no homogeneas (adelgazamiento de Lewis y Shedler).
function mtinf(o) {
  const sim = new Sim({ seed: o.seed, rep: o.rep }); const ra = sim.stream('lleg'), rt = sim.stream('acepta'), rs = sim.stream('serv'); let n = 0; const obs = [];
  const lmax = o.lb * (1 + o.beta);
  function* fuente(sim) { for (;;) { yield sim.timeout(ra.exp(1 / lmax)); if (rt.u() < o.lb * (1 + o.beta * Math.sin(o.gam * sim.now)) / lmax) { n++; sim.schedule(rs.exp(1 / o.mu), () => { n--; }); } } }
  sim.process(fuente); for (const t of o.obsT) sim.schedule(t, () => obs.push(n), 0); sim.run(Math.max(...o.obsT) + 1e-9);
  return obs;
}

// Maquinas y reparador (fuente finita): N maquinas, falla cada exp(1/alfa) de marcha, 1 reparador exp(1/mu).
function reparador(o) {
  const sim = new Sim({ seed: o.seed, rep: o.rep }); const rep = new Resource(sim, 1); let rotas = 0; const B = new TimeWeighted(sim);
  function* maquina(sim, i) { const rf = sim.stream('falla' + i), rr = sim.stream('rep' + i); for (;;) { yield sim.timeout(rf.exp(1 / o.alfa)); rotas++; B.set(rotas); const r = rep.request(); yield r; yield sim.timeout(rr.exp(1 / o.mu)); rep.release(r); rotas--; B.set(rotas); } }
  for (let i = 0; i < o.N; i++) sim.process(maquina, i); sim.schedule(o.warm, () => B.reset(), 0); sim.run(o.T); return { rotas: B.mean() };
}

// Caso publicado 1 (Law 2023, ejemplos 2, 10 y 14): oficina de 9 a 17 h, c empleados, llegadas exp(1 min), servicio exp(4,5 min); atiende hasta vaciarse.
function dmv(o) {
  const sim = new Sim({ seed: o.seed, rep: o.rep }); const res = new Resource(sim, o.c); const ra = sim.stream('llegadas'), rs = sim.stream('servicio'); const D = new Tally();
  function* cliente(sim, s) { const t0 = sim.now; const r = res.request(); yield r; D.add(sim.now - t0); yield sim.timeout(s); res.release(r); }
  function* fuente(sim) { for (;;) { const a = ra.exp(1); if (sim.now + a > 480) return; yield sim.timeout(a); sim.process(cliente, rs.exp(o.svcMean ?? 4.5)); } }
  sim.process(fuente); sim.run(); return { X: D.mean(), n: D.n };
}

// Caso publicado 2 (Law 2023, ejemplo 9): maquina + inspector, 10% retrabajo, fallas por tiempo calendario con reanudacion; tiempo hasta 2.000 piezas buenas.
function fabrica(o) {
  const sim = new Sim({ seed: o.seed, rep: o.rep }); const maq = new Resource(sim, 1), insp = new Resource(sim, 1);
  const ra = sim.stream('llegadas'), rm = sim.stream('maquina'), ri = sim.stream('inspector'), rq = sim.stream('calidad'), rf = sim.stream('fallas'), rr = sim.stream('reparacion');
  let buenas = 0, T = NaN;
  function* pieza(sim) { for (;;) { yield* work(sim, maq, rm.unif(0.65, 0.70), { priority: 1 }); const r = insp.request({ priority: 1 }); yield r; yield sim.timeout(ri.unif(0.75, 0.80)); insp.release(r);
      if (rq.u() < 0.9) { if (++buenas === o.objetivo) { T = sim.now; sim.stop(); } return; } } }
  function* fuente(sim) { for (;;) { yield sim.timeout(ra.exp(1)); sim.process(pieza); } }
  function* fallas(sim) { for (;;) { yield sim.timeout(rf.exp(360)); const r = maq.request({ priority: 0, preempt: true }); yield r; yield sim.timeout(rr.unif(8, 12)); maq.release(r); } }
  sim.process(fuente); sim.process(fallas); sim.run(); return { Th: T / 60 };
}

// ================= Utilidades de la bateria =================
const out = []; // filas de resultados
function check(id, nombre, teo, est, opts = {}) { // est: resultado de ci(); pasa si |error| <= max(3,29*se, tolAbs) y el error relativo <= tolRel
  const err = est.mean - teo, rel = teo !== 0 ? err / teo : err; const z = est.se > 0 ? err / est.se : (err === 0 ? 0 : Infinity);
  const tolRel = opts.tolRel ?? 0.03; const pasa = (Math.abs(z) <= 3.29 || Math.abs(err) <= (opts.tolAbs ?? 0)) && Math.abs(rel) <= tolRel;
  out.push({ id, nombre, teorico: +teo.toPrecision(6), simulado: +est.mean.toPrecision(6), semiancho95: +est.hw.toPrecision(3), errRelPct: +(100 * rel).toFixed(2), z: +z.toFixed(2), n: est.n, pasa: opts.informativo ? 'informativo' : (pasa ? 'SI' : 'NO') });
}
function reps(n, f) { const r = []; for (let i = 0; i < n; i++) r.push(f(i)); return r; }
const col = (rs, k) => rs.map(r => r[k]);
const relax = (rho, mu) => 1 / (mu * (1 - Math.sqrt(rho)) ** 2); // tiempo de relajacion M/M/1 (inversa de la brecha espectral)

const pruebas = {
  mm1() { for (const rho of [0.5, 0.8, 0.9]) { const mu = 1, lam = rho; const th = mmc(lam, mu, 1); const tr = relax(rho, mu); const warm = 20 * tr, T = warm + (rho === 0.9 ? 400000 : 200000);
      const R = reps(20, i => station({ seed: 11, rep: i, c: 1, iat: r => r.exp(1 / lam), svc: r => r.exp(1 / mu), warm, T }));
      check('V01', `M/M/1 rho=${rho}: Wq (tiempos de servicio)`, th.Wq, ci(col(R, 'Wq'))); check('V02', `M/M/1 rho=${rho}: L`, th.L, ci(col(R, 'L'))); check('V03', `M/M/1 rho=${rho}: ocupacion`, rho, ci(col(R, 'util')), { tolRel: 0.01 }); check('V04', `M/M/1 rho=${rho}: P(esperar>0)`, rho, ci(col(R, 'pwait')), { tolRel: 0.01 });
      const Lw = R.map(r => r.L - lam * r.W); check('V05', `Ley de Little M/M/1 rho=${rho}: L - lambda*W`, 0, ci(Lw), { tolAbs: 0.02 * th.L, tolRel: Infinity }); } },
  mmc() { for (const [lam, mu, c] of [[2.4, 1, 3], [4.5, 1, 5], [45, 1, 50]]) { const th = mmc(lam, mu, c); const warm = 2000, T = warm + 400000 / lam;
      const R = reps(20, i => station({ seed: 12, rep: i, c, iat: r => r.exp(1 / lam), svc: r => r.exp(1 / mu), warm, T }));
      check('V06', `M/M/${c} rho=${th.rho.toFixed(2)}: P(esperar) Erlang C`, th.C, ci(col(R, 'pwait')), { tolRel: 0.02 }); check('V07', `M/M/${c} rho=${th.rho.toFixed(2)}: Wq`, th.Wq, ci(col(R, 'Wq'))); } },
  mg1() { { const lam = 0.9; const th = mg1(lam, 1, 1); const R = reps(20, i => station({ seed: 13, rep: i, c: 1, iat: r => r.exp(1 / lam), svc: () => 1, warm: 5000, T: 205000 })); check('V08', 'M/D/1 rho=0,9: Wq (Pollaczek-Khinchine)', th.Wq, ci(col(R, 'Wq'))); }
    { const lam = 0.7, cv = 1.5; const th = mg1(lam, 1, 1 + cv * cv); const R = reps(20, i => station({ seed: 14, rep: i, c: 1, iat: r => r.exp(1 / lam), svc: r => r.lognormal(1, cv), warm: 5000, T: 405000 })); check('V09', 'M/LN/1 rho=0,7 cv=1,5: Wq (Pollaczek-Khinchine)', th.Wq, ci(col(R, 'Wq')), { tolRel: 0.05 }); } },
  gm1() { const lam = 0.9, mu = 1; const th = dm1(lam, mu); const R = reps(40, i => station({ seed: 15, rep: i, c: 1, iat: () => 1 / lam, svc: r => r.exp(1 / mu), warm: 5000, T: 405000 }));
    check('V10', `D/M/1 rho=0,9: Wq exacto GI/M/1 (sigma=${th.sigma.toFixed(5)})`, th.Wq, ci(col(R, 'Wq'))); check('V11', 'D/M/1 rho=0,9: P(esperar>0)=sigma', th.sigma, ci(col(R, 'pwait')), { tolRel: 0.01 }); },
  aprox() { // Kingman y Allen-Cunneen: aproximaciones; se informa el error, no se exige pasar
    for (const [c, rho, k] of [[1, 0.9, 2], [2, 0.8, 2], [4, 0.85, 2]]) { const lam = rho * c; const R = reps(20, i => station({ seed: 16, rep: i, c, iat: r => r.erlang(k, 1 / lam), svc: r => r.erlang(k, 1), warm: 5000, T: 205000 }));
      const ap = c === 1 ? kingman(rho, 1 / k, 1 / k, 1) : allenCunneen(lam, 1, c, 1 / k, 1 / k); check('V12', `E${k}/E${k}/${c} rho=${rho}: Wq vs ${c === 1 ? 'Kingman' : 'Allen-Cunneen'} (aproximacion)`, ap, ci(col(R, 'Wq')), { informativo: true }); }
    { const c = 4, rho = 0.85, lam = rho * c, cv = 1.5; const R = reps(20, i => station({ seed: 17, rep: i, c, iat: r => r.exp(1 / lam), svc: r => r.lognormal(1, cv), warm: 5000, T: 405000 }));
      check('V12', `M/LN/4 rho=0,85 cv=1,5: Wq vs Allen-Cunneen (aproximacion)`, allenCunneen(lam, 1, c, 1, cv * cv), ci(col(R, 'Wq')), { informativo: true }); } },
  mmck() { const lam = 2, mu = 1, c = 2, K = 5; const p = birthDeath(() => lam, n => Math.min(n, c) * mu, K); const L = p.reduce((a, x, n) => a + n * x, 0);
    const R = reps(20, i => station({ seed: 18, rep: i, c, K, iat: r => r.exp(1 / lam), svc: r => r.exp(1 / mu), warm: 1000, T: 101000 }));
    check('V13', 'M/M/2/5: probabilidad de rechazo (PASTA)', p[K], ci(col(R, 'pblock')), { tolRel: 0.02 }); check('V14', 'M/M/2/5: L', L, ci(col(R, 'L')), { tolRel: 0.02 }); },
  erlangB() { const c = 10, a = 7; const B = erlangB(c, a);
    const Re = reps(20, i => station({ seed: 19, rep: i, c, K: c, iat: r => r.exp(1 / a), svc: r => r.exp(1), warm: 1000, T: 101000 }));
    const Rl = reps(20, i => station({ seed: 20, rep: i, c, K: c, iat: r => r.exp(1 / a), svc: r => r.lognormal(1, 2), warm: 1000, T: 201000 }));
    check('V15', 'M/M/10/10: Erlang B', B, ci(col(Re, 'pblock')), { tolRel: 0.02 }); check('V16', 'M/LN/10/10 cv=2: Erlang B (insensibilidad)', B, ci(col(Rl, 'pblock')), { tolRel: 0.03 }); },
  prioridad() { const lam = [0.3, 0.5], mu = 1; const W0 = (lam[0] + lam[1]) * 2 / 2, s1 = lam[0] / mu, s2 = (lam[0] + lam[1]) / mu;
    const Rn = reps(20, i => prioridad({ seed: 21, rep: i, lam, mu, preempt: false, warm: 2000, T: 202000 }));
    check('V17', 'Prioridad sin preempcion (Cobham): Wq clase alta', W0 / (1 - s1), ci(col(Rn, 'Wq1'))); check('V18', 'Prioridad sin preempcion (Cobham): Wq clase baja', W0 / ((1 - s1) * (1 - s2)), ci(col(Rn, 'Wq2')));
    const Rp = reps(20, i => prioridad({ seed: 22, rep: i, lam, mu, preempt: true, warm: 2000, T: 202000 }));
    check('V19', 'Prioridad con preempcion-reanudacion: T clase alta', 1 / (mu - lam[0]), ci(col(Rp, 'T1'))); check('V20', 'Prioridad con preempcion-reanudacion: T clase baja', (1 / mu) / (1 - s1) + W0 / ((1 - s1) * (1 - s2)), ci(col(Rp, 'T2'))); },
  jackson() { const nodes = [{ c: 2, mu: 1 }, { c: 1, mu: 1.2 }, { c: 1, mu: 0.5 }]; const P = [[0, 0.7, 0.3], [0.2, 0, 0], [0, 0, 0]]; const lam = 1;
    const l1 = lam / (1 - 0.7 * 0.2), lr = [l1, 0.7 * l1, 0.3 * l1]; const Ln = lr.map((l, i) => mmc(l, nodes[i].mu, nodes[i].c).L); const Lt = Ln.reduce((a, b) => a + b, 0);
    const R = reps(20, i => jackson({ seed: 23, rep: i, nodes, P, lam, warm: 2000, T: 102000 }));
    check('V21', 'Red de Jackson 3 nodos con realimentacion: L total', Lt, ci(col(R, 'L'))); check('V22', 'Red de Jackson: W total = L/lambda (Little)', Lt / lam, ci(col(R, 'W')));
    Ln.forEach((l, i) => check('V23', `Red de Jackson: L nodo ${i + 1} (M/M/${nodes[i].c}, rho=${(lr[i] / (nodes[i].c * nodes[i].mu)).toFixed(3)})`, l, ci(R.map(r => r.Li[i])))); },
  cerrada() { for (const N of [2, 4, 6]) { const r = cerrada({ seed: 1, rep: 0, means: [2, 2, 2, 2], N, det: true, warm: 200, T: 10200 }); const th = Math.min(N / 8, 0.5), ct = Math.max(8, N / 0.5);
      out.push({ id: 'V24', nombre: `Penny Fab determinista N=${N}: TH (trabajos/h) y CT (h)`, teorico: `${th} / ${ct}`, simulado: `${r.TH.toFixed(4)} / ${r.CT.toFixed(4)}`, semiancho95: 0, errRelPct: +(100 * (r.TH - th) / th).toFixed(3), z: '-', n: 1, pasa: Math.abs(r.TH - th) / th < 0.002 && Math.abs(r.CT - ct) < 1e-9 ? 'SI' : 'NO' }); }
    { const th = mva([2, 2, 2, 2], 4); const R = reps(20, i => cerrada({ seed: 24, rep: i, means: [2, 2, 2, 2], N: 4, det: false, warm: 1000, T: 101000 })); check('V25', 'Linea exponencial balanceada N=4 (peor caso practico): TH', th.TH, ci(col(R, 'TH'))); check('V26', 'Linea exponencial balanceada N=4: CT (h)', th.CT, ci(col(R, 'CT'))); }
    { const means = [1, 2, 1.5, 0.5]; const th = mva(means, 5); const R = reps(20, i => cerrada({ seed: 25, rep: i, means, N: 5, det: false, warm: 1000, T: 101000 })); check('V27', 'Red cerrada desbalanceada N=5 (MVA): TH', th.TH, ci(col(R, 'TH'))); } },
  mtinf() { const o = { lb: 20, beta: 0.6, gam: 2 * Math.PI / 24, mu: 1, obsT: [48, 54, 60, 66] }; const R = reps(400, i => mtinf({ ...o, seed: 26, rep: i }));
    o.obsT.forEach((t, j) => check('V28', `M_t/M/inf senoidal: E[N(t)] en t=${t} h`, mtInf(o.lb, o.beta, o.gam, o.mu, t), ci(R.map(r => r[j])), { tolRel: 0.02 }));
    const j = 1, xs = R.map(r => r[j]), m = mean(xs), v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1); out.push({ id: 'V29', nombre: 'M_t/M/inf: N(t) es Poisson (varianza/media = 1)', teorico: 1, simulado: +(v / m).toFixed(3), semiancho95: +(1.96 * Math.sqrt(2 / (xs.length - 1))).toFixed(3), errRelPct: +(100 * (v / m - 1)).toFixed(2), z: '-', n: xs.length, pasa: Math.abs(v / m - 1) < 3.29 * Math.sqrt(2 / (xs.length - 1)) ? 'SI' : 'NO' }); },
  reparador() { const N = 5, alfa = 0.1, mu = 1; const p = birthDeath(n => (N - n) * alfa, () => mu, N); const Lb = p.reduce((a, x, n) => a + n * x, 0);
    const R = reps(20, i => reparador({ seed: 27, rep: i, N, alfa, mu, warm: 1000, T: 101000 })); check('V30', 'Maquinas y reparador N=5 (fuente finita): maquinas rotas en promedio', Lb, ci(col(R, 'rotas'))); },
  law_dmv() { // Law 2023: X(25) = 5,68 +- 1,10 con 5 empleados; 1,30 con 6; diferencia 4,39 +- 0,99
    const n = 2000; const R5 = reps(n, i => dmv({ seed: 30, rep: i, c: 5 })), R6 = reps(n, i => dmv({ seed: 30, rep: i, c: 6 })), R6i = reps(n, i => dmv({ seed: 31, rep: i, c: 6 }));
    const c5 = ci(col(R5, 'X')), c6 = ci(col(R6, 'X')); const Zc = ci(R5.map((r, i) => r.X - R6[i].X)), Zi = ci(R5.map((r, i) => r.X - R6i[i].X));
    out.push({ id: 'C01', nombre: 'Law 2023 ej. 10: demora media 5 empleados (publicado 5,68 +- 1,10; IC [4,58; 6,79])', teorico: '[4,58; 6,79]', simulado: +c5.mean.toFixed(3), semiancho95: +c5.hw.toFixed(3), errRelPct: '-', z: '-', n, pasa: c5.mean >= 4.58 && c5.mean <= 6.79 ? 'SI' : 'NO' });
    out.push({ id: 'C02', nombre: 'Law 2023 ej. 14: demora media 6 empleados (publicado 1,30, 25 replicas)', teorico: 1.30, simulado: +c6.mean.toFixed(3), semiancho95: +c6.hw.toFixed(3), errRelPct: +(100 * (c6.mean - 1.3) / 1.3).toFixed(1), z: '-', n, pasa: 'informativo' });
    out.push({ id: 'C03', nombre: 'Law 2023 ej. 14: diferencia 5 vs 6 (publicado 4,39 +- 0,99; IC [3,39; 5,38])', teorico: '[3,39; 5,38]', simulado: +Zc.mean.toFixed(3), semiancho95: +Zc.hw.toFixed(3), errRelPct: '-', z: '-', n, pasa: Zc.mean >= 3.39 && Zc.mean <= 5.38 ? 'SI' : 'NO' });
    out.push({ id: 'E01', nombre: 'Numeros aleatorios comunes: varianza de la diferencia independiente / con CRN', teorico: '>1', simulado: +((Zi.sd ** 2) / (Zc.sd ** 2)).toFixed(2), semiancho95: '-', errRelPct: '-', z: '-', n, pasa: 'informativo' });
    const rr = (hw, sd) => Math.ceil((1.96 * sd / hw) ** 2); { const A = reps(n, i => dmv({ seed: 33, rep: i, c: 5, svcMean: 4.5 })), Bc = reps(n, i => dmv({ seed: 33, rep: i, c: 5, svcMean: 4.4 })), Bi = reps(n, i => dmv({ seed: 34, rep: i, c: 5, svcMean: 4.4 }));
      const zc = ci(A.map((r, i) => r.X - Bc[i].X)), zi = ci(A.map((r, i) => r.X - Bi[i].X));
      out.push({ id: 'E03', nombre: `Mejora chica (servicio 4,5 -> 4,4 min, 5 empleados): diferencia ${zc.mean.toFixed(3)} min; varianza independiente / con CRN`, teorico: '>1', simulado: +((zi.sd ** 2) / (zc.sd ** 2)).toFixed(1), semiancho95: `CRN +-${zc.hw.toFixed(3)} vs indep. +-${zi.hw.toFixed(3)}`, errRelPct: '-', z: '-', n, pasa: 'informativo' }); }
    out.push({ id: 'E02', nombre: 'Replicas para semiancho 0,25 min en la diferencia: independientes vs CRN', teorico: '-', simulado: `${rr(0.25, Zi.sd)} vs ${rr(0.25, Zc.sd)}`, semiancho95: '-', errRelPct: '-', z: '-', n, pasa: 'informativo' }); },
  law_fabrica() { const R = reps(400, i => fabrica({ seed: 32, rep: i, objetivo: 2000 })); const c = ci(col(R, 'Th'));
    out.push({ id: 'C04', nombre: 'Law 2023 ej. 9: horas para 2.000 piezas (publicado 33,25 +- 0,56; IC [32,69; 33,81])', teorico: '[32,69; 33,81]', simulado: +c.mean.toFixed(3), semiancho95: +c.hw.toFixed(3), errRelPct: '-', z: '-', n: R.length, pasa: c.mean >= 32.69 && c.mean <= 33.81 ? 'SI' : 'NO' }); },
  cobertura() { // Law 2023 sec. 5.2: IC "ingenuo" con datos de UNA corrida vs replicacion/borrado. M/M/1 lambda=1, mu=10/9, W=9 min.
    const lam = 1, mu = 10 / 9, Wtrue = 9; const M = 500; let ing = 0, bm = 0, rd = 0;
    function corrida(seed, rep) { const sim = new Sim({ seed, rep }); const res = new Resource(sim, 1); const ra = sim.stream('llegadas'), rs = sim.stream('servicio'); const ws = [];
      function* cl(sim, s) { const t0 = sim.now; const r = res.request(); yield r; yield sim.timeout(s); res.release(r); if (sim.now >= 5000) ws.push(sim.now - t0); }
      function* f(sim) { for (;;) { yield sim.timeout(ra.exp(1 / lam)); sim.process(cl, rs.exp(1 / mu)); } } sim.process(f); sim.run(15000); return ws; }
    for (let m = 0; m < M; m++) { const ws = corrida(40, m); const a = ci(ws); if (Math.abs(a.mean - Wtrue) <= a.hw) ing++;
      const B = 20, b = Math.floor(ws.length / B), bms = []; for (let k = 0; k < B; k++) bms.push(mean(ws.slice(k * b, (k + 1) * b))); const cb = ci(bms); if (Math.abs(cb.mean - Wtrue) <= cb.hw) bm++;
      const xs = []; for (let j = 0; j < 10; j++) xs.push(mean(corrida(41, m * 10 + j))); const cr = ci(xs); if (Math.abs(cr.mean - Wtrue) <= cr.hw) rd++; }
    const band = 1.96 * Math.sqrt(0.95 * 0.05 / M);
    out.push({ id: 'S01', nombre: `Cobertura IC 95% "ingenuo" (1 corrida, observaciones como si fueran independientes) — Law publica 7,2%`, teorico: 0.95, simulado: ing / M, semiancho95: +band.toFixed(3), errRelPct: '-', z: '-', n: M, pasa: 'debe FALLAR' });
    out.push({ id: 'S02', nombre: 'Cobertura IC 95% medias por lotes (1 corrida, 20 lotes de ~500 min)', teorico: 0.95, simulado: bm / M, semiancho95: +band.toFixed(3), errRelPct: '-', z: '-', n: M, pasa: 'debe FALLAR (subcobertura esperada con pocos lotes)' });
    out.push({ id: 'S03', nombre: 'Cobertura IC 95% replicacion/borrado (10 replicas de 15.000 min, calentamiento 5.000)', teorico: 0.95, simulado: rd / M, semiancho95: +band.toFixed(3), errRelPct: '-', z: '-', n: M, pasa: Math.abs(rd / M - 0.95) <= band ? 'SI' : 'NO' }); },
  mser() { // MSER-5 sobre M/M/1 rho=0,9 (mu=1, L=9) arrancando vacio y arrancando con 100 en sistema.
    const rho = 0.9, Ltrue = rho / (1 - rho), dt = 10, Tn = 20000; const res = {};
    for (const n0 of [0, 100]) { const cuts = [], bias0 = [], bias1 = [];
      for (let r = 0; r < 200; r++) { const sim = new Sim({ seed: 50 + n0, rep: r }); const R = new Resource(sim, 1); const ra = sim.stream('llegadas'), rs = sim.stream('servicio'); let n = 0; const L = new TimeWeighted(sim); const Y = [];
        function* cl(sim, s) { const q = R.request(); yield q; yield sim.timeout(s); R.release(q); n--; L.set(n); }
        function* f(sim) { for (;;) { yield sim.timeout(ra.exp(1 / rho)); n++; L.set(n); sim.process(cl, rs.exp(1)); } }
        for (let i = 0; i < n0; i++) { n++; sim.process(cl, rs.exp(1)); } L.set(n); sim.process(f);
        for (let k = 1; k <= Tn / dt; k++) sim.schedule(k * dt, () => { Y.push(L.mean()); L.reset(); }, 0);
        sim.run(Tn);
        // MSER-5: lotes de 5 observaciones; d* = argmin_{d <= n/2} S^2(d)/(n-d)^2
        const Z = []; for (let i = 0; i + 5 <= Y.length; i += 5) Z.push(mean(Y.slice(i, i + 5))); const nb = Z.length; let best = Infinity, dstar = 0;
        const suf = new Array(nb + 1).fill(0), suf2 = new Array(nb + 1).fill(0); for (let i = nb - 1; i >= 0; i--) { suf[i] = suf[i + 1] + Z[i]; suf2[i] = suf2[i + 1] + Z[i] * Z[i]; }
        for (let d = 0; d <= nb / 2; d++) { const m = nb - d, mu_ = suf[d] / m, ss = suf2[d] - m * mu_ * mu_; const s = ss / (m * m); if (s < best) { best = s; dstar = d; } }
        cuts.push(dstar * 5 * dt); bias0.push(suf[0] / nb - Ltrue); bias1.push(suf[dstar] / (nb - dstar) - Ltrue); }
      cuts.sort((a, b) => a - b); res[n0] = { medianaCorte: cuts[100], p90Corte: cuts[180], sesgoSinCorte: mean(bias0), sesgoConMSER: mean(bias1), seSin: ci(bias0).se, seCon: ci(bias1).se }; }
    out.push({ id: 'S04', nombre: `MSER-5 M/M/1 rho=0,9, arranque vacio: corte mediano / P90 (tiempos de servicio; relajacion=${relax(0.9, 1).toFixed(0)})`, teorico: '-', simulado: `${res[0].medianaCorte} / ${res[0].p90Corte}`, semiancho95: '-', errRelPct: '-', z: '-', n: 200, pasa: 'informativo' });
    out.push({ id: 'S05', nombre: 'MSER-5 arranque vacio: sesgo de L sin corte vs con corte (L real=9)', teorico: 0, simulado: `${res[0].sesgoSinCorte.toFixed(3)} (se ${res[0].seSin.toFixed(3)}) vs ${res[0].sesgoConMSER.toFixed(3)} (se ${res[0].seCon.toFixed(3)})`, semiancho95: '-', errRelPct: '-', z: '-', n: 200, pasa: 'informativo' });
    out.push({ id: 'S06', nombre: 'MSER-5 arranque con 100 en sistema: corte mediano / P90', teorico: '-', simulado: `${res[100].medianaCorte} / ${res[100].p90Corte}`, semiancho95: '-', errRelPct: '-', z: '-', n: 200, pasa: 'informativo' });
    out.push({ id: 'S07', nombre: 'MSER-5 arranque con 100: sesgo de L sin corte vs con corte', teorico: 0, simulado: `${res[100].sesgoSinCorte.toFixed(3)} (se ${res[100].seSin.toFixed(3)}) vs ${res[100].sesgoConMSER.toFixed(3)} (se ${res[100].seCon.toFixed(3)})`, semiancho95: '-', errRelPct: '-', z: '-', n: 200, pasa: 'informativo' }); },
  mser2() { // MSER-5 aplicado a la serie PROMEDIO de 10 replicas (estilo Welch) vs a una sola corrida; 40 macro-experimentos.
    const rho = 0.9, Ltrue = 9, dt = 10, Tn = 20000;
    function serie(seed, rep, n0) { const sim = new Sim({ seed, rep }); const R = new Resource(sim, 1); const ra = sim.stream('llegadas'), rs = sim.stream('servicio'); let n = 0; const L = new TimeWeighted(sim); const Y = [];
      function* cl(sim, s) { const q = R.request(); yield q; yield sim.timeout(s); R.release(q); n--; L.set(n); }
      function* f(sim) { for (;;) { yield sim.timeout(ra.exp(1 / rho)); n++; L.set(n); sim.process(cl, rs.exp(1)); } }
      for (let i = 0; i < n0; i++) { n++; sim.process(cl, rs.exp(1)); } L.set(n); sim.process(f);
      for (let k = 1; k <= Tn / dt; k++) sim.schedule(k * dt, () => { Y.push(L.mean()); L.reset(); }, 0); sim.run(Tn); return Y; }
    function mser5(Y) { const Z = []; for (let i = 0; i + 5 <= Y.length; i += 5) Z.push(mean(Y.slice(i, i + 5))); const nb = Z.length; let best = Infinity, d0 = 0; const suf = new Array(nb + 1).fill(0), suf2 = new Array(nb + 1).fill(0);
      for (let i = nb - 1; i >= 0; i--) { suf[i] = suf[i + 1] + Z[i]; suf2[i] = suf2[i + 1] + Z[i] * Z[i]; } for (let d = 0; d <= nb / 2; d++) { const m = nb - d, mu_ = suf[d] / m, sv = (suf2[d] - m * mu_ * mu_) / (m * m); if (sv < best) { best = sv; d0 = d; } } return d0 * 5; }
    for (const n0 of [0, 100]) { const bSin = [], bProm = [], cuts = [];
      for (let m = 0; m < 40; m++) { const Ys = []; for (let j = 0; j < 10; j++) Ys.push(serie(70 + n0, m * 10 + j, n0)); const Yb = Ys[0].map((_, i) => mean(Ys.map(y => y[i]))); const d = mser5(Yb); cuts.push(d * dt);
        bSin.push(mean(Ys.map(y => mean(y))) - Ltrue); bProm.push(mean(Ys.map(y => mean(y.slice(d)))) - Ltrue); }
      cuts.sort((a, b) => a - b); const a = ci(bSin), b = ci(bProm);
      out.push({ id: 'S10', nombre: `MSER-5 sobre el promedio de 10 replicas, arranque con ${n0}: corte mediano (min-max)`, teorico: '-', simulado: `${cuts[20]} (${cuts[0]}-${cuts[39]})`, semiancho95: '-', errRelPct: '-', z: '-', n: 40, pasa: 'informativo' });
      out.push({ id: 'S11', nombre: `Sesgo de L (real 9) arranque con ${n0}: sin corte vs MSER-5 sobre promedio`, teorico: 0, simulado: `${a.mean.toFixed(3)} (+-${a.hw.toFixed(3)}) vs ${b.mean.toFixed(3)} (+-${b.hw.toFixed(3)})`, semiancho95: '-', errRelPct: '-', z: '-', n: 40, pasa: 'informativo' }); } },
  whitt() { // Varianza asintotica del promedio temporal de N en M/M/1 (mu=1): 2 rho (1+rho)/(1-rho)^4. Arranque estacionario (N0 geometrica) -> sin calentamiento.
    for (const rho of [0.8]) { const T = 200000, R = 200; const Ls = [];
      for (let r = 0; r < R; r++) { const sim0 = new Sim({ seed: 60, rep: r }); const g = sim0.stream('inicial'); let n0 = 0; while (g.u() < rho) n0++;
        Ls.push(station({ seed: 61, rep: r, c: 1, iat: x => x.exp(1 / rho), svc: x => x.exp(1), warm: 0, T, n0 }).L); }
      const c = ci(Ls); const s2 = T * c.sd ** 2, teo = 2 * rho * (1 + rho) / (1 - rho) ** 4; const wh = z => (R - 1) * (1 - 2 / (9 * (R - 1)) + z * Math.sqrt(2 / (9 * (R - 1)))) ** 3; const lo = s2 * (R - 1) / wh(1.96), hi = s2 * (R - 1) / wh(-1.96); // chi2 por Wilson-Hilferty
      out.push({ id: 'S08', nombre: `Whitt 1989: T*Var(L promedio) en M/M/1 rho=${rho} (teorico 2rho(1+rho)/(1-rho)^4)`, teorico: teo, simulado: +s2.toFixed(0), semiancho95: `IC [${lo.toFixed(0)}; ${hi.toFixed(0)}]`, errRelPct: +(100 * (s2 - teo) / teo).toFixed(1), z: '-', n: R, pasa: teo >= lo && teo <= hi ? 'SI' : 'NO' });
      out.push({ id: 'S09', nombre: `M/M/1 rho=${rho}: media de L con arranque estacionario y sin calentamiento`, teorico: rho / (1 - rho), simulado: +c.mean.toFixed(4), semiancho95: +c.hw.toFixed(4), errRelPct: +(100 * (c.mean - 4) / 4).toFixed(2), z: +((c.mean - 4) / c.se).toFixed(2), n: R, pasa: Math.abs(c.mean - 4) <= 3.29 * c.se ? 'SI' : 'NO' }); } },
  determinismo() { const a = station({ seed: 7, rep: 3, c: 2, iat: r => r.exp(0.6), svc: r => r.exp(1), warm: 0, T: 20000, hashTrace: true }), b = station({ seed: 7, rep: 3, c: 2, iat: r => r.exp(0.6), svc: r => r.exp(1), warm: 0, T: 20000, hashTrace: true });
    out.push({ id: 'R01', nombre: 'Misma semilla y replica: huella de la traza de eventos identica', teorico: a.hash.toString(16), simulado: b.hash.toString(16), semiancho95: '-', errRelPct: '-', z: '-', n: a.events, pasa: a.hash === b.hash && a.W === b.W ? 'SI' : 'NO' });
    const c2 = station({ seed: 7, rep: 3, c: 2, iat: r => r.exp(0.6), svc: r => r.exp(1), warm: 0, T: 20000, keepArrivals: true }), c3 = station({ seed: 7, rep: 3, c: 3, iat: r => r.exp(0.6), svc: r => r.exp(1), warm: 0, T: 20000, keepArrivals: true });
    out.push({ id: 'R02', nombre: 'CRN sincronizados: las primeras 50 llegadas son identicas con 2 y con 3 servidores', teorico: 'identicas', simulado: c2.arrTimes.every((t, i) => t === c3.arrTimes[i]) ? 'identicas' : 'distintas', semiancho95: '-', errRelPct: '-', z: '-', n: 50, pasa: c2.arrTimes.every((t, i) => t === c3.arrTimes[i]) ? 'SI' : 'NO' });
    const d = station({ seed: 7, rep: 4, c: 2, iat: r => r.exp(0.6), svc: r => r.exp(1), warm: 0, T: 20000, hashTrace: true }); out.push({ id: 'R03', nombre: 'Otra replica: traza distinta', teorico: 'distinta', simulado: d.hash !== a.hash ? 'distinta' : 'igual', semiancho95: '-', errRelPct: '-', z: '-', n: d.events, pasa: d.hash !== a.hash ? 'SI' : 'NO' }); },
  rendimiento() { const t0 = performance.now(); const r = station({ seed: 9, rep: 0, c: 1, iat: x => x.exp(1 / 0.9), svc: x => x.exp(1), warm: 0, T: 2e6 }); const dt = (performance.now() - t0) / 1000;
    out.push({ id: 'P01', nombre: 'Rendimiento motor de procesos (generadores) M/M/1, 1 hilo, Node 22', teorico: '-', simulado: `${Math.round(r.events / dt).toLocaleString('es-AR')} eventos/s`, semiancho95: '-', errRelPct: '-', z: '-', n: r.events, pasa: 'informativo' }); },
};

const pedidas = process.argv.slice(2); const lista = pedidas.length ? pedidas : Object.keys(pruebas); const t0 = performance.now();
for (const k of lista) { const t = performance.now(); pruebas[k](); process.stderr.write(`${k}: ${((performance.now() - t) / 1000).toFixed(1)} s\n`); }
console.log(JSON.stringify(out, null, 0).replace(/\},\{/g, '},\n{'));
process.stderr.write(`total ${((performance.now() - t0) / 1000).toFixed(1)} s\n`);
