// Andén · medición de la síntesis (17-10-2026). Uso: node correr.mjs  → resultados.json
// 1) matemática propia contra la nativa en la maqueta del hub (tiempo y KPI); 2) diagnóstico de la recirculación;
// 3) plan de clasificación balanceado; 4) probabilidad de no llegar al corte con 4 y 5 puestos.
import * as N from '../visiones/experiencia-medicion/hub.mjs';
import * as P from './hub_diag.mjs';
import { writeFileSync } from 'node:fs';
const q = (a, x) => { const b = [...a].sort((u, v) => u - v); return b[Math.min(b.length - 1, Math.floor(x * b.length))]; };
const tiempos = (f) => { const t = []; for (let s = 1; s <= 10; s++) { const t0 = performance.now(); f(s); t.push(performance.now() - t0); } return { mediana: +q(t, 0.5).toFixed(1), min: +Math.min(...t).toFixed(1), max: +Math.max(...t).toFixed(1) }; };
for (let w = 0; w < 2; w++) { N.simular(N.HUB_BASE, 99); P.simular(P.HUB_BASE, 99); }
const R = { fecha: '2026-10-17', entorno: `Node ${process.version}, contenedor compartido de 4 núcleos (±15–30% entre corridas)` };
R.matematica = {
  nativa: { noche24kSinTrazaMs: tiempos((s) => N.simular(N.HUB_BASE, s, { traza: false })), noche24kConTrazaMs: tiempos((s) => N.simular(N.HUB_BASE, s)), noche90kSinTrazaMs: tiempos((s) => N.simular(N.hubGrande(), s, { traza: false })) },
  propia: { noche24kSinTrazaMs: tiempos((s) => P.simular(P.HUB_BASE, s, { traza: false })), noche24kConTrazaMs: tiempos((s) => P.simular(P.HUB_BASE, s)), noche90kSinTrazaMs: tiempos((s) => P.simular(P.hubGrande(), s, { traza: false })) },
};
let iguales = 0; for (let s = 1; s <= 10; s++) { const a = N.simular(N.HUB_BASE, s, { traza: false }).kpi, b = P.simular(P.HUB_BASE, s, { traza: false }).kpi; delete b.diag; if (JSON.stringify(a) === JSON.stringify(b)) iguales++; }
R.matematica.kpiIdenticos = `${iguales}/10`;
const k1 = N.simular(N.HUB_BASE, 1, { traza: false }).kpi; R.matematica.operacionesPorNoche = k1.eventos + k1.ticks; R.matematica.paquetes = k1.paquetes;
// diagnóstico de recirculación con el reparto contiguo de la maqueta
const turno = 8 * 3600 * 1000; const filas = [];
for (let s = 1; s <= 60; s++) { const k = P.simular(P.HUB_BASE, s, { traza: false }).kpi; filas.push({ s, rec: k.recirculacionPct, d: k.diag }); }
filas.sort((a, b) => b.rec - a.rec);
R.recirculacion = filas.slice(0, 3).map(({ s, rec, d }) => { const tot = d.recPorRampa.reduce((a, b) => a + b, 0); const g0 = d.grupoDe[0];
  const deG0 = d.recPorRampa.slice(0, 60).reduce((acc, v, r) => acc + (d.grupoDe[r] === g0 ? v : 0), 0);
  const cargaG0 = d.llegPorRampa.slice(0, 60).reduce((acc, v, r) => acc + (d.grupoDe[r] === g0 ? v : 0), 0);
  const cargas = Array.from({ length: 15 }, (_, w) => d.llegPorRampa.slice(0, 60).reduce((acc, v, r) => acc + (d.grupoDe[r] === w ? v : 0), 0));
  return { semilla: s, recirculacionPct: rec, pctVueltasDelGrupoDeR1: +(100 * deG0 / tot).toFixed(1), paquetesRutaR1: d.llegPorRampa[0], paquetesPersonaR1: cargaG0, medianaPaquetesPorPersona: q(cargas, 0.5), ocupacionPersonaR1Pct: +(100 * d.wBusy[g0] / turno).toFixed(0) }; });
const resumen = (p, n = 60) => { const rec = [], p90 = []; for (let s = 1; s <= n; s++) { const k = P.simular(p, s, { traza: false }).kpi; rec.push(k.recirculacionPct); p90.push(k.esperaP90min); } return { recMediana: q(rec, 0.5), recP90: q(rec, 0.9), recMax: Math.max(...rec), esperaP90Mediana: q(p90, 0.5) }; };
const bal = { ...structuredClone(P.HUB_BASE), planBalanceado: true };
R.planDeClasificacion = { repartoContiguo: resumen(P.HUB_BASE), repartoBalanceadoPorVolumen: resumen(bal) };
const corte = (p, n = 200) => { let perd = 0, conFalta = 0, perdConFalta = 0, dosOMas = 0; for (let s = 1; s <= n; s++) { const k = P.simular(p, s, { traza: false }).kpi; const faltan = p.induccion.puestos - k.inductoresPresentes; if (faltan > 0) conFalta++; if (faltan >= 2) dosOMas++; if (k.pctAlCorte < 100) { perd++; if (faltan > 0) perdConFalta++; } } return { noches: n, nochesQueNoLleganAlCorte: perd, nochesConAlgunaFalta: conFalta, nochesConDosOMasFaltas: dosOMas, perdidasConFalta: perdConFalta }; };
R.corte = { cuatroPuestos: corte(bal), cincoPuestos: corte({ ...structuredClone(bal), induccion: { ...bal.induccion, puestos: 5 } }), nota: 'La maqueta no repone a quien falta: es una regla del modelo, no un hecho del hub.' };
writeFileSync(new URL('./resultados.json', import.meta.url), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R, null, 1));
