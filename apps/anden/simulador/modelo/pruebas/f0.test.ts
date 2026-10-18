// pruebas/f0.test.ts · P3 · Borrador analítico F0 (corte-1.md §5 y §6.10): los valores del ejemplo con error relativo ≤ 1e-9.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularF0, media, gammaUnoMas, ventanaSeg, bandejasLazo, largoLazo, tickMs, ranuraDe } from '../f0.ts';
import { compilar } from '../compilar.ts';
import type { Distribucion } from '../../contratos/azar.ts';
import { ejemploModelo, resumen } from './ayudas.ts';

function cerca(real: number, esperado: number, nombre: string, tol = 1e-9): void {
  const err = esperado === 0 ? Math.abs(real) : Math.abs(real - esperado) / Math.abs(esperado);
  assert.ok(err <= tol, `${nombre}: se esperaba ${esperado} y salió ${real} (error relativo ${err})`);
}

test('F0 del ejemplo: los valores de la tabla de corte-1.md §5', () => {
  const f = calcularF0(ejemploModelo());
  cerca(f.llegadaMediaPorHora, 3200, 'llegadaMediaPorHora');
  cerca(f.capacidadDescargaPorHora, 4320, 'capacidadDescargaPorHora');
  cerca(f.capacidadInduccionPorHora, 3937.5, 'capacidadInduccionPorHora');
  cerca(f.capacidadSorterTeoricaPorHora, 11320.7547169811, 'capacidadSorterTeoricaPorHora', 1e-12);
  cerca(f.capacidadSorterTeoricaPorHora, ((2 / 0.6) * 3600) / 1.06, 'capacidadSorterTeoricaPorHora (fórmula)');
  cerca(f.capacidadRampasPorHora, 4725, 'capacidadRampasPorHora');
  assert.equal(f.cuello, 'induccion');
  cerca(f.utilizacion.descarga, 3200 / 4320, 'utilizacion.descarga');
  cerca(f.utilizacion.induccion, 3200 / 3937.5, 'utilizacion.induccion');
  cerca(f.utilizacion.sorter, 3200 / 11320.7547169811, 'utilizacion.sorter', 1e-10);
  cerca(f.utilizacion.rampas, 3200 / 4725, 'utilizacion.rampas');
  // Los cinco decimales que imprime la especificación.
  assert.equal(f.utilizacion.descarga.toFixed(5), '0.74074');
  assert.equal(f.utilizacion.induccion.toFixed(5), '0.81270');
  assert.equal(f.utilizacion.sorter.toFixed(5), '0.28267');
  assert.equal(f.utilizacion.rampas.toFixed(5), '0.67725');
  assert.equal(f.finEstimado, '24:30', '22:00 + max(2,5 h; 8.000 ÷ 3.937,5 h)');
});

test('F0 con el mismo modelo da exactamente lo mismo (sin azar ni estado)', () => {
  assert.deepEqual(calcularF0(ejemploModelo()), calcularF0(ejemploModelo()));
});

test('el cuello es la menor capacidad: con 2 personas de rampa pasa a las rampas', () => {
  const m = ejemploModelo();
  m.personas.rampa.cantidad = 2;
  const f = calcularF0(m);
  assert.equal(f.cuello, 'rampas');
  // 2 × 3.600 ÷ (3 + 60 ÷ 60) × (1 − 900 ÷ 7.200) = 1.575
  cerca(f.capacidadRampasPorHora, 1575, 'capacidadRampasPorHora');
  cerca(f.utilizacion.rampas, 3200 / 1575, 'utilizacion.rampas');
  // finEstimado = 22:00 + max(2,5 h; 8.000 ÷ 1.575 = 5,0794 h) = 27:04
  assert.equal(f.finEstimado, '27:04');
});

test('la lluvia de distribuciones: media analítica de §6.10 y las demás', () => {
  const casos: [Distribucion, number][] = [
    [{ tipo: 'fija', valor: 7 }, 7],
    [{ tipo: 'uniforme', min: 2, max: 10 }, 6],
    [{ tipo: 'exponencial', media: 5 }, 5],
    [{ tipo: 'triangular', min: 0, moda: 3, max: 6 }, 3],
    [{ tipo: 'triangular', min: 0, moda: 1, max: 5 }, 2],
    [{ tipo: 'lognormal', media: 2.4, cv: 0.35 }, 2.4],
    [{ tipo: 'normal', media: 10, desvio: 2 }, 10],
    [{ tipo: 'erlang', k: 3, media: 9 }, 9],
    [{ tipo: 'bernoulli', p: 0.015 }, 0.015],
    [{ tipo: 'discreta', valores: [1, 2, 3], pesos: [1, 1, 2] }, (1 + 2 + 6) / 4],
    [{ tipo: 'empirica', valores: [0, 10] }, 5],
    [{ tipo: 'empirica', valores: [0, 10, 40] }, (5 + 25) / 2],
    [{ tipo: 'empirica', valores: [7] }, 7],
  ];
  for (const [d, esperado] of casos) cerca(media(d), esperado, `media de ${JSON.stringify(d)}`);
  // Weibull: escala · Γ(1 + 1/forma). forma 1 → escala; forma 2 → escala · √π / 2.
  cerca(media({ tipo: 'weibull', forma: 1, escala: 4 }), 4, 'weibull forma 1', 1e-6);
  cerca(media({ tipo: 'weibull', forma: 2, escala: 4 }), (4 * Math.sqrt(Math.PI)) / 2, 'weibull forma 2', 1e-6);
});

test('Γ(1 + a) aproximada: valores conocidos con error ≤ 1e-6', () => {
  cerca(gammaUnoMas(0), 1, 'Γ(1)', 1e-6);
  cerca(gammaUnoMas(1), 1, 'Γ(2)', 1e-6);
  cerca(gammaUnoMas(0.5), Math.sqrt(Math.PI) / 2, 'Γ(1,5)', 1e-6);
  cerca(gammaUnoMas(4), 24, 'Γ(5)', 1e-6);
  cerca(gammaUnoMas(10.5), 11899423.083962249, 'Γ(11,5)', 1e-6);
  assert.equal(gammaUnoMas(171), Infinity);
  assert.ok(Number.isNaN(gammaUnoMas(-1)));
});

test('ventana de una serie y de una lista de camiones (mediana de los intervalos)', () => {
  const m = ejemploModelo();
  assert.equal(ventanaSeg(m), 9000, '10 camiones × 900 s');
  m.demanda.camiones = [
    { id: 'T1', turno: '22:00', paquetes: 1 }, { id: 'T2', turno: '22:15', paquetes: 1 },
    { id: 'T3', turno: '22:30', paquetes: 1 }, { id: 'T4', turno: '23:00', paquetes: 1 },
  ];
  assert.equal(ventanaSeg(m), 3600 + 900);
  m.demanda.camiones = [{ id: 'T1', turno: '22:00', paquetes: 1 }, { id: 'T2', turno: '22:30', paquetes: 1 }];
  assert.equal(ventanaSeg(m), 1800 + 1800, 'dos camiones: la mediana es el único intervalo');
  m.demanda.camiones = [{ id: 'T1', turno: '22:00', paquetes: 1 }, { id: 'T2', turno: '22:10', paquetes: 1 }, { id: 'T3', turno: '22:40', paquetes: 1 }, { id: 'T4', turno: '22:50', paquetes: 1 }];
  // intervalos 600, 1.800, 600 → ordenados 600, 600, 1.800 → mediana 600
  assert.equal(ventanaSeg(m), 3000 + 600);
  m.demanda.camiones = [{ id: 'T1', turno: '22:00', paquetes: 1 }];
  assert.equal(ventanaSeg(m), 0);
});

test('todos los camiones en el mismo instante (ventana 0): la llegada efectiva la pone la descarga', () => {
  const m = ejemploModelo();
  m.demanda.camiones = [{ id: 'T1', turno: '22:00', paquetes: 800 }];
  const f = calcularF0(m);
  assert.equal(f.llegadaMediaPorHora, f.capacidadDescargaPorHora);
  assert.ok(Number.isFinite(f.utilizacion.descarga));
});

test('un fin estimado imposible o infinito se informa como «47:59»', () => {
  const m = ejemploModelo();
  m.personas.induccion.puestosActivos = 0; // capacidad 0 → fin infinito
  const f = calcularF0(m);
  assert.equal(f.capacidadInduccionPorHora, 0);
  assert.equal(f.cuello, 'induccion');
  assert.equal(f.finEstimado, '47:59');
  assert.equal(f.utilizacion.induccion, Infinity);
});

test('geometría del lazo del ejemplo: 142 bandejas a 2 m/s, tick de 300 ms (§5 y §6.2)', () => {
  const s = ejemploModelo().hub.sorter;
  cerca(largoLazo(s), 60 + 8 * Math.PI, 'largo del lazo');
  assert.equal(bandejasLazo(s), 142);
  assert.equal(tickMs(s), 300);
  assert.equal(ranuraDe(s, 12), 20);
  assert.equal(ranuraDe(s, 0.5), 1);
  assert.equal(ranuraDe(s, 66), 110);
  assert.equal(ranuraDe(s, largoLazo(s)), 0, 'dar la vuelta completa vuelve a la ranura 0');
});

test('F0 del modelo compilado coincide con calcularF0 del modelo', async () => {
  const r = await compilar(ejemploModelo());
  assert.ok(r.ok, r.ok ? '' : resumen(r.diagnosticos));
  assert.deepEqual(r.mv.f0, calcularF0(r.mv.modelo));
});
