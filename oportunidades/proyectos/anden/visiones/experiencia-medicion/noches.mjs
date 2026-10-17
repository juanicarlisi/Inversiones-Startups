// Andén · visión «Experiencia» · medición propia (17-10-2026): ¿cuánto cambia una noche de otra? Uso: node noches.mjs [60]
import { simular, HUB_BASE } from './hub.mjs';
import { writeFileSync } from 'node:fs';
const n = +process.argv[2] || 60, filas = [];
for (let s = 1; s <= n; s++) { const k = simular(HUB_BASE, s, { traza: false }).kpi;
  filas.push({ semilla: s, recirc: k.recirculacionPct, hRampaLlena: k.horasRampaLlena, p90: k.esperaP90min, ultimo: k.ultimoClasificado, inductores: k.inductoresPresentes }); }
const q = (campo, p) => { const v = filas.map((f) => f[campo]).sort((a, b) => a - b); return v[Math.min(v.length - 1, Math.floor(p * v.length))]; };
const out = { fecha: '2026-10-17', noches: n, recirculacionPct: { p50: q('recirc', 0.5), p90: q('recirc', 0.9), max: q('recirc', 1) },
  esperaP90min: { p50: q('p90', 0.5), p90: q('p90', 0.9), max: q('p90', 1) }, nochesConUnInductorMenos: filas.filter((f) => f.inductores < 4).length,
  peorNoche: filas.reduce((a, b) => (b.recirc > a.recirc ? b : a)), filas };
writeFileSync(new URL('./resultados-noches.json', import.meta.url), JSON.stringify(out, null, 1));
const { filas: _, ...resumen } = out; console.log(JSON.stringify(resumen));
