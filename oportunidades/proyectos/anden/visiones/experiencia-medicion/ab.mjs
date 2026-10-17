// Andén · visión «Experiencia» · medición propia (17-10-2026): la pantalla dividida A/B con la misma aleatoriedad.
// ¿Cuánto menos ruido tiene la diferencia entre dos escenarios si los dos ven los mismos camiones, la misma mezcla y las mismas
// ausencias (números aleatorios comunes) que si cada uno tiene su propia suerte? Uso: node ab.mjs [40]
import { simular, HUB_BASE } from './hub.mjs';
import { writeFileSync } from 'node:fs';
const n = +process.argv[2] || 40;
const A = structuredClone(HUB_BASE), B = structuredClone(HUB_BASE); B.induccion.puestos = 5; // escenario B: un puesto de inducción más
const kpi = (p, s) => { const k = simular(p, s, { traza: false }).kpi; const [h, m] = k.ultimoClasificado.split(':').map(Number); return { fin: (h < 12 ? h + 24 : h) * 60 + m, p90: k.esperaP90min }; };
const comun = [], indep = [];
for (let s = 1; s <= n; s++) { const a = kpi(A, s), b = kpi(B, s), b2 = kpi(B, s + 10000);
  comun.push({ fin: b.fin - a.fin, p90: b.p90 - a.p90 }); indep.push({ fin: b2.fin - a.fin, p90: b2.p90 - a.p90 }); }
const est = (v, c) => { const x = v.map((o) => o[c]), m = x.reduce((a, b) => a + b, 0) / x.length, s2 = x.reduce((a, b) => a + (b - m) ** 2, 0) / (x.length - 1);
  return { media: +m.toFixed(2), desvio: +Math.sqrt(s2).toFixed(2), ic95: +(1.96 * Math.sqrt(s2 / x.length)).toFixed(2) }; };
const out = { fecha: '2026-10-17', replicas: n, escenario: '4 → 5 puestos de inducción',
  finDeClasificacionMin: { comunes: est(comun, 'fin'), independientes: est(indep, 'fin') },
  esperaP90Min: { comunes: est(comun, 'p90'), independientes: est(indep, 'p90') } };
out.reduccionVarianzaFin = +((out.finDeClasificacionMin.independientes.desvio / out.finDeClasificacionMin.comunes.desvio) ** 2).toFixed(1);
out.reduccionVarianzaP90 = +((out.esperaP90Min.independientes.desvio / out.esperaP90Min.comunes.desvio) ** 2).toFixed(1);
writeFileSync(new URL('./resultados-ab.json', import.meta.url), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
