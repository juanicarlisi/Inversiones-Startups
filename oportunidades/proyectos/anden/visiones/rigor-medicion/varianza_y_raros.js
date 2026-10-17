'use strict';
// Medicion propia (17-10-2026) para oportunidades/proyectos/anden/visiones/rigor.md.
// (1) Variables de control: cuanto achica la varianza usar los promedios muestreados de llegadas y servicios (media conocida)
//     como control del tiempo medio de espera en una M/M/c terminante.
// (2) Eventos raros por division de trayectorias (splitting de esfuerzo fijo): P(una cola M/M/1 llega a K antes de vaciarse,
//     arrancando con 1 cliente), con valor exacto 1/(r^K - 1)... ver formula abajo. Compara contra Monte Carlo crudo con el mismo esfuerzo.
// Semillas fijas; usa el generador del motor de referencia. Correr: node varianza_y_raros.js
const path = require('path');
const { Stream } = require(path.join(__dirname, '../../../../../conocimiento/anden-simulador-2026-10/medicion-motor/motor_ref.js'));

function mean(a) { return a.reduce((s, x) => s + x, 0) / a.length; }
function variance(a) { const m = mean(a); return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1); }

// ---------- (1) M/M/c terminante: N clientes desde vacio, FIFO ----------
function replicaMMc(seed, rep, lambda, mu, c, N) {
  const sa = new Stream(seed, 'llegadas', rep), ss = new Stream(seed, 'servicio', rep);
  const free = new Float64Array(c); let t = 0, sumW = 0, sumA = 0, sumS = 0;
  for (let i = 0; i < N; i++) {
    const a = sa.exp(1 / lambda); t += a; sumA += a;
    const s = ss.exp(1 / mu); sumS += s;
    let k = 0; for (let j = 1; j < c; j++) if (free[j] < free[k]) k = j;
    const start = Math.max(t, free[k]); sumW += start - t; free[k] = start + s;
  }
  return { w: sumW / N, a: sumA / N, s: sumS / N };
}
function controlVariates(lambda, mu, c, N, reps, macro, seed) {
  // Estimador controlado: W - b1 (A - 1/lambda) - b2 (S - 1/mu), b por minimos cuadrados con las mismas replicas.
  // Para medir la ganancia real (incluido el costo de estimar b) se repiten 'macro' experimentos independientes.
  const crude = [], ctrl = [];
  for (let m = 0; m < macro; m++) {
    const W = [], A = [], S = [];
    for (let r = 0; r < reps; r++) { const o = replicaMMc(seed + m, r, lambda, mu, c, N); W.push(o.w); A.push(o.a - 1 / lambda); S.push(o.s - 1 / mu); }
    const mw = mean(W), ma = mean(A), ms = mean(S);
    let saa = 0, sss = 0, sas = 0, saw = 0, ssw = 0;
    for (let r = 0; r < reps; r++) { const da = A[r] - ma, ds = S[r] - ms, dw = W[r] - mw; saa += da * da; sss += ds * ds; sas += da * ds; saw += da * dw; ssw += ds * dw; }
    const det = saa * sss - sas * sas; const b1 = (saw * sss - ssw * sas) / det, b2 = (ssw * saa - saw * sas) / det;
    crude.push(mw); ctrl.push(mw - b1 * ma - b2 * ms);
  }
  return { mediaCruda: mean(crude), mediaControl: mean(ctrl), varCruda: variance(crude), varControl: variance(ctrl), factor: variance(crude) / variance(ctrl) };
}

// ---------- (2) Evento raro: cadena de nacimiento y muerte embebida de M/M/1 ----------
// Sube con p = lambda/(lambda+mu), baja con q = 1-p. Desde 1, P(llegar a K antes que a 0) = (1 - q/p) / (1 - (q/p)^K) (ruina del jugador).
function exacto(rho, K) { const r = 1 / rho; return (1 - r) / (1 - Math.pow(r, K)); }
function crudo(rho, K, budgetSteps, st) {
  const p = rho / (1 + rho); let hits = 0, trials = 0, steps = 0;
  while (steps < budgetSteps) { let x = 1; trials++; while (x > 0 && x < K) { x += st.u() < p ? 1 : -1; steps++; } if (x === K) hits++; }
  return { est: hits / trials, trials, hits, steps };
}
function splitting(rho, K, Nper, st) {
  // Niveles 1..K. En el nivel l se lanzan Nper trayectorias desde l; exito = tocar l+1 antes de 0. Estimador = producto de fracciones.
  const p = rho / (1 + rho); let prod = 1, steps = 0;
  for (let l = 1; l < K; l++) {
    let ok = 0;
    for (let i = 0; i < Nper; i++) { let x = l; while (x > 0 && x < l + 1) { x += st.u() < p ? 1 : -1; steps++; } if (x === l + 1) ok++; }
    if (ok === 0) return { est: 0, steps };
    prod *= ok / Nper;
  }
  return { est: prod, steps };
}

const out = { fecha: '2026-10-17', entorno: `Node ${process.version}` };
console.log('(1) Variables de control en M/M/c terminante (N clientes desde vacio; 200 replicas por experimento; 200 experimentos)');
out.variablesControl = [];
for (const [lambda, c, N] of [[4.5, 5, 2000], [3.5, 5, 2000], [0.9, 1, 2000], [4.5, 5, 500]]) {
  const r = controlVariates(lambda, 1, c, N, 200, 200, 20261017);
  const fila = { modelo: `M/M/${c}`, rho: lambda / c, N, ...r };
  out.variablesControl.push(fila);
  console.log(`  M/M/${c} rho=${(lambda / c).toFixed(2)} N=${N}: media cruda ${r.mediaCruda.toFixed(4)} | controlada ${r.mediaControl.toFixed(4)} | varianza /${r.factor.toFixed(2)}`);
}

console.log('(2) Evento raro: P(cola M/M/1 llega a K antes de vaciarse, desde 1 cliente)');
out.eventosRaros = [];
for (const [rho, K, Nper] of [[0.5, 20, 2000], [0.8, 40, 2000]]) {
  const ex = exacto(rho, K);
  const st = new Stream(20261017, `split-${rho}-${K}`, 0);
  const ests = []; let stepsTot = 0; const M = 100;
  for (let m = 0; m < M; m++) { const s = splitting(rho, K, Nper, st); ests.push(s.est); stepsTot += s.steps; }
  const m = mean(ests), se = Math.sqrt(variance(ests) / M), cvUno = Math.sqrt(variance(ests)) / m;
  const presupuesto = Math.round(stepsTot / M); // esfuerzo de UNA corrida de splitting
  const cr = crudo(rho, K, presupuesto, new Stream(20261017, `crudo-${rho}-${K}`, 0));
  // Monte Carlo crudo necesario para el mismo error relativo que una corrida de splitting: n = (1-p)/(p*cv^2) trayectorias
  const nCrudo = (1 - ex) / (ex * cvUno * cvUno);
  const pasosPorTrayCruda = cr.steps / cr.trials;
  const fila = { rho, K, exacto: ex, mediaSplitting: m, errorEstandar: se, errorRelativoUnaCorrida: cvUno, pasosPorCorridaSplitting: presupuesto,
    crudoMismoEsfuerzo: cr, pasosCrudoParaIgualPrecision: nCrudo * pasosPorTrayCruda, ventaja: (nCrudo * pasosPorTrayCruda) / presupuesto };
  out.eventosRaros.push(fila);
  console.log(`  rho=${rho} K=${K}: exacto ${ex.toExponential(4)} | splitting (100 corridas) ${m.toExponential(4)} ± ${(1.96 * se).toExponential(2)} | error relativo de una corrida ${(100 * cvUno).toFixed(1)}% con ${presupuesto.toLocaleString('es-AR')} pasos`);
  console.log(`     crudo con el mismo esfuerzo: ${cr.hits} aciertos en ${cr.trials.toLocaleString('es-AR')} trayectorias | crudo necesitaria ~${(nCrudo * pasosPorTrayCruda).toExponential(2)} pasos para esa precision (ventaja x${fila.ventaja.toExponential(2)})`);
}
require('fs').writeFileSync(path.join(__dirname, 'resultados.json'), JSON.stringify(out, null, 2));
