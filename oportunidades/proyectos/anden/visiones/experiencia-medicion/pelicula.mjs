// Andén · visión «Experiencia» · medición propia (17-10-2026)
// ¿Cuánto tarda el dispositivo de quien abre un enlace en calcular la «película» entera de una noche de hub, con el mecanismo
// completo, y cuánto pesa la traza? Uso: node pelicula.mjs [semillas=10]
import { simular, HUB_BASE, hubGrande } from './hub.mjs';
import { gzipSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const nSem = +process.argv[2] || 10;
const med = (v) => { const w = [...v].sort((a, b) => a - b); return w[w.length >> 1]; };
const rango = (v) => [Math.min(...v), Math.max(...v)];

function pesoTraza(tr) {
  const crudo = tr.e.byteLength + tr.k.byteLength + tr.r.byteLength + tr.a.byteLength + tr.t0.byteLength + tr.t1.byteLength;
  // columnas ordenadas por inicio; tiempo en ms entero con deltas; duración en vez de fin
  const idx = Array.from({ length: tr.n }, (_, i) => i).sort((x, y) => tr.t0[x] - tr.t0[y]);
  const dT = new Int32Array(tr.n), dur = new Int32Array(tr.n), E = new Int32Array(tr.n), Kk = new Uint8Array(tr.n), R = new Int32Array(tr.n), Aa = new Int32Array(tr.n);
  let prev = 0; idx.forEach((i, j) => { dT[j] = tr.t0[i] - prev; prev = tr.t0[i]; dur[j] = tr.t1[i] - tr.t0[i]; E[j] = tr.e[i]; Kk[j] = tr.k[i]; R[j] = tr.r[i]; Aa[j] = tr.a[i]; });
  const cols = [dT, dur, E, Kk, R, Aa].map((c) => gzipSync(Buffer.from(c.buffer), { level: 6 }).length).reduce((a, b) => a + b, 0);
  return { tramos: tr.n, crudoMB: +(crudo / 1048576).toFixed(2), columnasGzipMB: +(cols / 1048576).toFixed(2) };
}

const salida = { fecha: '2026-10-17', entorno: `Node ${process.version}, ${process.arch}`, semillas: nSem, casos: {} };
for (const [nombre, p] of [['hub24k', HUB_BASE], ['hub90k', hubGrande()]]) {
  simular(p, 999); simular(p, 998, { traza: false }); // calentar el compilador
  const conT = [], sinT = [], kpis = [], ev = [], ticks = [], tramos = [], span = [];
  let peso = null;
  for (let s = 1; s <= nSem; s++) {
    let t = performance.now(); const r = simular(p, s); conT.push(performance.now() - t);
    t = performance.now(); simular(p, s, { traza: false }); sinT.push(performance.now() - t);
    kpis.push(r.kpi); ev.push(r.kpi.eventos); ticks.push(r.kpi.ticks); tramos.push(r.kpi.tramos);
    span.push((r.traza.fin - r.traza.inicio) / 1000);
    if (s === 1) peso = pesoTraza(r.traza);
  }
  // primeros 10 minutos simulados desde el primer camión: lo que hace falta para el primer cuadro si se simula delante del cabezal
  const inicio = 22 * 3600 * 1000 - 5 * 60 * 1000; const prim = [];
  for (let s = 1; s <= nSem; s++) { const t = performance.now(); simular(p, s, { traza: true, hasta: inicio + 15 * 60 * 1000 }); prim.push(performance.now() - t); }
  const vel = span.map((x, i) => x / (conT[i] / 1000));
  salida.casos[nombre] = {
    paquetesMedio: Math.round(kpis.reduce((a, k) => a + k.paquetes, 0) / nSem),
    msNocheConTraza: { mediana: +med(conT).toFixed(0), rango: rango(conT).map((x) => +x.toFixed(0)) },
    msNocheSinTraza: { mediana: +med(sinT).toFixed(0), rango: rango(sinT).map((x) => +x.toFixed(0)) },
    msPrimeros15minSimulados: { mediana: +med(prim).toFixed(1), rango: rango(prim).map((x) => +x.toFixed(1)) },
    eventosMediana: med(ev), ticksMediana: med(ticks), tramosMediana: med(tramos),
    horasSimuladasMediana: +(med(span) / 3600).toFixed(1),
    vecesMasRapidoQueTiempoReal: { mediana: Math.round(med(vel)), minimo: Math.round(Math.min(...vel)) },
    pesoTrazaSemilla1: peso,
    kpiPorSemilla: kpis.map((k) => ({ paq: k.paquetes, alCorte: k.pctAlCorte, recirc: k.recirculacionPct, hRampaLlena: k.horasRampaLlena,
      p50: k.esperaP50min, p90: k.esperaP90min, ultimo: k.ultimoClasificado, inductores: k.inductoresPresentes })),
  };
}
const txt = JSON.stringify(salida, null, 1);
writeFileSync(new URL('./resultados-pelicula.json', import.meta.url), txt);
console.log(txt);
