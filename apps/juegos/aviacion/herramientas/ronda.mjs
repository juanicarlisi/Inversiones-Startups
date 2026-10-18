// Mide la ronda nocturna en la escena de referencia (6 radios de 30 sacas, centro de 40/h) durante 200 noches.
// Metas del diseño (HN-08, paso 1):
//  - el automático da 70% o menos a primera hora;
//  - el plan sugerido da 95% o más;
//  - el ingreso de la noche difiere entre 25% y 45% (plan contra automático);
//  - con el centro en 120/h, el automático da 85% o más (mejorar el hub también resuelve, más caro).
// Uso: node herramientas/ronda.mjs [noches] [--json]
import * as R from '../js/ronda.js';

const noches = Number(process.argv.find((x) => /^\d+$/.test(x)) ?? 200);
const json = process.argv.includes('--json');

function medir(centro) {
  let auto = 0, plan = 0, sacas = 0, ingA = 0, ingP = 0, soloSalidas = 0, soloOrden = 0;
  const medallas = { oro: 0, plata: 0, bronce: 0, ninguna: 0 };
  for (let n = 1; n <= noches; n++) {
    const e = R.escenaReferencia(n, { centro });
    const a = R.simular(e), p = R.simular(e, R.planSugerido(e));
    // dos jugadas a medias, para ver que las dos palancas importan
    const salidasLimite = Object.fromEntries(e.radios.map((x) => [x.id, Math.floor(R.limite(x) / R.GRILLA) * R.GRILLA]));
    const s1 = R.simular(e, { prioridad: null, salidas: salidasLimite });
    const s2 = R.simular(e, { prioridad: R.planSugerido(e).prioridad, salidas: null });
    sacas += a.sacas; auto += a.aTiempo; plan += p.aTiempo; ingA += a.ingreso; ingP += p.ingreso;
    soloSalidas += s1.aTiempo; soloOrden += s2.aTiempo;
    medallas[a.medalla ?? 'ninguna']++;
  }
  return {
    centro, noches,
    automatico: +(auto / sacas).toFixed(3), sugerido: +(plan / sacas).toFixed(3),
    soloMoverSalidas: +(soloSalidas / sacas).toFixed(3), soloOrdenarCinta: +(soloOrden / sacas).toFixed(3),
    difIngreso: +((ingP / ingA - 1)).toFixed(3), medallasAutomatico: medallas,
  };
}

const r40 = medir(40), r120 = medir(120);
const metas = {
  automaticoHasta70: r40.automatico <= 0.70,
  sugeridoDesde95: r40.sugerido >= 0.95,
  ingresoEntre25y45: r40.difIngreso >= 0.25 && r40.difIngreso <= 0.45,
  centro120Desde85: r120.automatico >= 0.85,
};
if (json) console.log(JSON.stringify({ r40, r120, metas }, null, 1));
else {
  const pct = (v) => `${(v * 100).toFixed(1)}%`;
  console.log(`Ronda nocturna · escena de referencia · ${noches} noches`);
  for (const r of [r40, r120]) {
    console.log(`  centro ${r.centro}/h: automático ${pct(r.automatico)} · sugerido ${pct(r.sugerido)} · solo mover salidas ${pct(r.soloMoverSalidas)} · solo ordenar cinta ${pct(r.soloOrdenarCinta)} · ingreso plan/auto +${pct(r.difIngreso)}`);
  }
  console.log('  metas:', Object.entries(metas).map(([k, v]) => `${k} ${v ? 'sí' : 'NO'}`).join(' · '));
}
