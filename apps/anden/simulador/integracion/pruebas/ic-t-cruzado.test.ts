// integracion/pruebas/ic-t-cruzado.test.ts · Andén simulador, corte 1 · Integración (corte-1.md §7; hallazgo REV-D2 de la revisión del
// 30-10-2026). El intervalo de t que muestra la app (el ± del costo, el IC de cada resumen: `resumirNumeros` de experimentos/, con la
// tabla de t precalculada y Cornish-Fisher) contra la implementación INDEPENDIENTE de la batería (`intervaloMedia` de verificacion/, que
// invierte la distribución t por bisección). Desde que S03 mide independencia y sesgo, ninguna exigible del sello mide este IC: una
// mutación que cambiara el cuantil t por el z de la normal pasaba la batería entera. Esta prueba la atrapa en `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resumirNumeros } from '../../experimentos/indice.ts';
import { intervaloMedia } from '../../verificacion/formulas/estadistica.ts';
import { matNativa } from '../../contratos/referencia/motor-referencia.ts';

/** Datos fijos y reproducibles: xorshift32 con semilla, con colas pesadas (una de cada 20 réplicas, ×25) como las noches del hub. */
function datos(n: number, semilla: number): number[] {
  let s = semilla >>> 0 || 1;
  const u = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s + 0.5) / 4294967296; };
  return Array.from({ length: n }, () => { const x = -Math.log(u()) * 10; return u() < 0.05 ? x * 25 : x; });
}

test('IC de t de la app = IC de t independiente de la batería (n de 2 a 1.000, confianza 0,90 / 0,95 / 0,99)', () => {
  let casos = 0;
  for (const n of [2, 3, 5, 10, 20, 40, 100, 199, 200, 201, 400, 1000]) {
    for (const confianza of [0.9, 0.95, 0.99]) {
      const xs = datos(n, 1000 * n + Math.round(confianza * 100));
      const app = resumirNumeros(xs, confianza);
      const bat = intervaloMedia(xs, matNativa, confianza);
      const err = Math.abs(app.semiancho - bat.semiancho) / bat.semiancho;
      // la tabla de la app y Cornish-Fisher (ν > 200) quedan a menos de 2e-6 relativo del cuantil exacto (EST-10)
      assert.ok(err < 1e-5, `n = ${n}, confianza ${confianza}: la app da ±${app.semiancho} y la batería ±${bat.semiancho} (error relativo ${err.toExponential(2)}; se esperaba < 1e-5)`);
      assert.ok(Math.abs(app.media - bat.media) <= 1e-12 * Math.max(1, Math.abs(bat.media)), `n = ${n}: la media difiere (${app.media} contra ${bat.media})`);
      assert.deepEqual(app.ic, [app.media - app.semiancho, app.media + app.semiancho]);
      casos++;
    }
  }
  assert.equal(casos, 36);
});

test('con pocas réplicas el cuantil es el de t, no el de la normal (una mutación t → z se nota)', () => {
  const xs = datos(5, 7);
  const app = resumirNumeros(xs, 0.95);
  const z = (1.959963984540054 * app.desvio) / Math.sqrt(5);
  // t(0,975; 4) = 2,776: el semiancho con t es un 42% más ancho que con z
  assert.ok(app.semiancho / z > 1.4, `con n = 5 se esperaba un semiancho ≥ 1,4 veces el de la normal y salió ${(app.semiancho / z).toFixed(3)} veces`);
});
