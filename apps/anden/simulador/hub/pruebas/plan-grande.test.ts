// hub/pruebas/plan-grande.test.ts · P4 · El plan de rampas en la plantilla grande (corte-1.md §9, P4: «en 30 noches de la plantilla
// grande, el P90 de recirculación con 'por-volumen' ≤ con 'contiguas'»). Va aparte de plan.test.ts porque son 120 noches de 24.000
// paquetes (≈ 27 s de CPU con el motor de referencia): en su propio archivo corre en paralelo con las demás pruebas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grande, recirculacionP90 } from './modelos.ts';

test("30 noches de la plantilla grande (corte-1.md §9, al pie de la letra): el P90 de recirculación con 'por-volumen' ≤ con 'contiguas'", () => {
  // Con las 15 personas de rampa de la plantilla y el motor 1.1.0 (persistencia y relevo en las pausas) ninguna rampa se llena con
  // ninguno de los dos planes: los dos P90 dan 0 (MEDIDO el 23-10-2026). El criterio se cumple; la prueba que sigue muestra dónde muerde.
  const volumen = recirculacionP90(grande, 'por-volumen'), contiguas = recirculacionP90(grande, 'contiguas');
  assert.ok(volumen <= contiguas, `P90 de recirculación en la grande: por volumen ${volumen.toFixed(3)}% contra contiguas ${contiguas.toFixed(3)}%`);
});

test("30 noches de la grande con 9 personas de rampa: 'por-volumen' evita la recirculación que 'contiguas' no", () => {
  // Con menos gente el plan decide. MEDIDO el 23-10-2026 (estas 30 noches): P90 0,011% contra 29,5%, media 0,003% contra 6,5% y
  // P(todo antes del corte) 1,00 contra 0,83. La síntesis había medido 0,01% contra 7,2% con el motor de la maqueta.
  const volumen = recirculacionP90(grande, 'por-volumen', 9), contiguas = recirculacionP90(grande, 'contiguas', 9);
  assert.ok(contiguas > 1, `con rampas contiguas tiene que haber recirculación que ahorrar (P90 ${contiguas.toFixed(3)}%)`);
  assert.ok(volumen * 10 <= contiguas, `por volumen tiene que recircular al menos diez veces menos: ${volumen.toFixed(3)}% contra ${contiguas.toFixed(3)}%`);
});
