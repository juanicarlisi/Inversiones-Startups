// PRUEBA PROPUESTA (vive en el laboratorio; no toca apps/anden/simulador/): el oráculo SimPy como juez independiente del motor.
// Sin Python en el momento de probar: compara contra los dorados que genera oraculo/generar_dorados.py.
//   node --test oraculo/prueba/oraculo.test.mjs
// Dos pisos:
//   EXACTO       modelos sin azar (A1..A5): el motor en F2 tiene que dar lo mismo que el oráculo, KPI por KPI (tolerancia 1e-6).
//   ESTADÍSTICO  C1 y C2: media del motor (N noches, semilla fija) contra media y desvío del oráculo: Welch |z| <= 3,5 en cada uno
//                de los KPI; F2 contra el oráculo en modo F2 y F3 contra el oráculo en modo F3-lite.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { correrNoches } from '../lib-motor.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const dir = resolve(aqui, '../dorados');
const archivo = readdirSync(dir).filter((f) => f.startsWith('simpy-')).sort().at(-1);
const D = JSON.parse(readFileSync(resolve(dir, archivo), 'utf8'));
const modelo = (n) => resolve(aqui, '../modelos', n + '.json');
const Z_MAX = 3.5;
const KPIS = Object.keys(Object.values(D.exactos)[0]);

for (const [nom, esperado] of Object.entries(D.exactos)) {
  test(`exacto · ${nom}: motor F2 = oráculo SimPy en los ${KPIS.length} KPI`, () => {
    const [r] = correrNoches(modelo(nom), 'F2', 1);
    assert.deepEqual(r.alertas, []);
    for (const k of KPIS) assert.ok(Math.abs(r.kpi[k] - esperado[k]) <= 1e-6 * Math.max(1, Math.abs(esperado[k])), `${nom}: ${k} motor ${r.kpi[k]} ≠ oráculo ${esperado[k]}`);
  });
}

const PAREJAS = [['C1-estocastico', 'F2', 'F2'], ['C1-estocastico', 'F3', 'F3-lite'], ['C2-dominio-F2', 'F2', 'F2'], ['C2-dominio-F2', 'F3', 'F3-lite']];
for (const [nom, fid, lazo] of PAREJAS) {
  test(`estadístico · ${nom}: motor ${fid} ~ oráculo ${lazo} (Welch |z| <= ${Z_MAX} en cada KPI)`, () => {
    const g = D.estadisticos[`${nom}|${lazo}`];
    const filas = correrNoches(modelo(nom), fid, g.n);
    assert.equal(filas.reduce((s, f) => s + f.alertas.length, 0), 0, 'alertas del motor');
    const fuera = [];
    for (const k of KPIS) {
      if (fid === 'F2' && ['recirculacionPct', 'vueltasExtra', 'paradasLazo', 'minutosLazoDetenido'].includes(k)) continue; // F2 no los tiene
      const x = filas.map((f) => f.kpi[k]), m = x.reduce((s, v) => s + v, 0) / x.length;
      const v = x.reduce((s, y) => s + (y - m) ** 2, 0) / (x.length - 1);
      const se = Math.sqrt(v / x.length + g.kpi[k].desvio ** 2 / g.n);
      const z = se === 0 ? (m === g.kpi[k].media ? 0 : Infinity) : (m - g.kpi[k].media) / se;
      if (!(Math.abs(z) <= Z_MAX)) fuera.push(`${k}: motor ${m.toFixed(3)} · oráculo ${g.kpi[k].media.toFixed(3)} · z ${z.toFixed(2)}`);
    }
    assert.deepEqual(fuera, [], 'KPI fuera del criterio');
  });
}
