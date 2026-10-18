// hub/pruebas/consistencia-f2.test.ts · P4 · L07 (corte-1.md §8): F2 (lazo como demora fija) reproduce a F3 (bandejas) dentro de su
// dominio de validez: ρ de inducción ≈ 0,3 y rampas sin tope. Se comparan los paquetes por hora y el tiempo medio en el hub.
// Dos lecturas del criterio de §8: (1) con la misma semilla y réplica (números comunes) la diferencia de F2 contra F3 es ≤ 2%, y
// (2) contra réplicas independientes de F2 la diferencia no se distingue del ruido (≤ 3,29 errores estándar).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import { crearSimularNocheF2, DOMINIO_F2 } from '../f2.ts';
import { crearSimularNoche } from '../simular.ts';
import { chico, rampasSinTope, SEMILLA, validado } from './modelos.ts';

const N = 20;

function modeloL07() {
  // 10 camiones de 400 paquetes (1.600 por hora) y 4 puestos: ρ = 1.600 ÷ (4 · 1.500 · 0,875) ≈ 0,30
  const m = rampasSinTope(chico());
  m.demanda.camiones = { serie: true, cantidad: 10, primero: '22:00', cada: 900, paquetes: 400 };
  m.personas.induccion.puestosActivos = 4;
  m.hub.sorter.paradas = { ...m.hub.sorter.paradas, activas: false }; // F2 no tiene lazo que parar
  return validado(m);
}

const media = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
const varianza = (a: number[]) => { const x = media(a); return a.reduce((s, y) => s + (y - x) ** 2, 0) / (a.length - 1); };

test('L07 · F2 y F3 coinciden con ρ de inducción ≈ 0,3 y rampas sin tope: diferencia ≤ 2% y ≤ 3,29 ee', () => {
  const mv = modeloL07();
  const f3 = crearSimularNoche(crearMotorReferencia), f2 = crearSimularNocheF2(crearMotorReferencia);
  const correr = (sim: typeof f3, desde: number) => Array.from({ length: N }, (_, i) => sim(mv, SEMILLA, desde + i, { traza: 'no' }).resultado);
  const a = correr(f3, 0), b = correr(f2, 0), bIndep = correr(f2, 1000);
  for (const r of [...a, ...b]) assert.deepEqual(r.alertas, [], `réplica ${r.replica}: sin alertas`);
  const rho = 1600 / (4 * (3600 / 2.4) * (1 - 900 / 7200));
  assert.ok(rho <= DOMINIO_F2.rhoInduccionMax, 'el caso está dentro del dominio de F2');
  const medidas = {
    'paquetes por hora': (r: (typeof a)[number]) => r.kpi.clasificados / (r.kpi.finClasificacionMin / 60),
    'tiempo medio en el hub (min)': (r: (typeof a)[number]) => r.kpi.esperaMediaMin,
  };
  for (const [nombre, f] of Object.entries(medidas)) {
    const x3 = a.map(f), x2 = b.map(f), x2i = bIndep.map(f);
    const rel = Math.abs(media(x2) - media(x3)) / media(x3);
    assert.ok(rel <= 0.02, `${nombre}: F2 ${media(x2).toFixed(4)} contra F3 ${media(x3).toFixed(4)}, diferencia ${(100 * rel).toFixed(2)}% > 2%`);
    const dif = media(x2i) - media(x3), ee = Math.sqrt(varianza(x3) / N + varianza(x2i) / N);
    assert.ok(Math.abs(dif) <= 3.29 * ee, `${nombre}: diferencia ${dif.toFixed(4)} > 3,29 ee (${(3.29 * ee).toFixed(4)}) con réplicas independientes`);
  }
  // en F2 no hay espera de bandeja ni vueltas
  for (const r of b) { assert.equal(r.kpi.vueltasExtra, 0); assert.equal(r.kpi.paradasLazo, 0); }
});
