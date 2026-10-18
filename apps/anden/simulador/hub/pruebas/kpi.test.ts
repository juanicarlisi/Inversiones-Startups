// hub/pruebas/kpi.test.ts · P4 · KPI sanos en 50 noches del hub chico (corte-1.md §9, P4) y definiciones de §6.9 y costos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KPIS } from '../../contratos/resultados.ts';
import { costoNoche, costoPorPaquete, horasPersonaPagadas } from '../costos.ts';
import { percentil } from '../kpi.ts';
import { chico, noche } from './modelos.ts';

const NOCHES = 50;

function contarNoTransportables(h: ReturnType<typeof noche>['hub']): number {
  const P = h.P.S;
  let n = 0;
  for (let e = 0; e < P.nacidos; e++) if (!h.cfg.claseTransportable[P.clase[e]]) n++;
  return n;
}
const INICIO = 22 * 3_600_000, FIN = 30 * 3_600_000;

test('percentil: P_q = x₍min(n−1, ⌊q·n⌋)₎ con x ordenado', () => {
  const x = Float64Array.from({ length: 10 }, (_, i) => i + 1);
  assert.equal(percentil(x, 0.5), 6);
  assert.equal(percentil(x, 0.9), 10);
  assert.equal(percentil(x, 0.99), 10);
  assert.equal(percentil(x, 0), 1);
  assert.ok(Number.isNaN(percentil(new Float64Array(0), 0.5)));
});

test('costos: horas pagadas, costo de la noche y costo por paquete (regla 1 de §6.7 y §6.9)', () => {
  assert.equal(horasPersonaPagadas(16, INICIO, FIN, -1), 128, 'sin paquetes, la jornada es el turno');
  assert.equal(horasPersonaPagadas(16, INICIO, FIN, FIN - 1), 128);
  assert.equal(horasPersonaPagadas(10, INICIO, FIN, FIN + 1_800_000), 85, 'si el último paquete sale después del fin, se paga hasta ahí');
  assert.equal(costoNoche(128, 7085, 496000), 128 * 7085 + 496000);
  assert.equal(costoPorPaquete(1000, 0), 1000, 'max(1, clasificados)');
  assert.equal(costoPorPaquete(1000, 4), 250);
});

test(`KPI sanos en ${NOCHES} noches del hub chico: todo clasificado, sin alertas, fin plausible y definiciones de §6.9`, () => {
  const fines: number[] = [];
  let nominales = 0;
  for (let r = 0; r < NOCHES; r++) {
    const s = noche(chico(), r);
    const k = s.resultado.kpi, h = s.hub, donde = `réplica ${r}`;
    assert.deepEqual(s.resultado.alertas, [], `${donde}: sin alertas`);
    for (const id of KPIS) assert.ok(Number.isFinite(k[id]), `${donde}: el KPI ${id} tiene que ser finito y es ${k[id]}`);
    assert.equal(k.clasificados, k.paquetes, `${donde}: todo paquete clasificado al horizonte`);
    assert.ok(k.finClasificacionMin >= 120 && k.finClasificacionMin <= 480, `${donde}: fin ${k.finClasificacionMin} min fuera del turno`);
    fines.push(k.finClasificacionMin);
    // las noches sin faltas ni atraso común terminan entre 2 y 5 horas (ver NOTAS-CONTRATO §13 para las demás)
    if (k.ausentes === 0 && h.demanda.S.atraso === 0) {
      nominales++;
      assert.ok(k.finClasificacionMin >= 120 && k.finClasificacionMin <= 300, `${donde}: noche sin golpes con fin ${k.finClasificacionMin} min`);
    }
    // definiciones
    assert.equal(k.pctAlCorte, (100 * (k.paquetes - k.pendientesAlCorte)) / k.paquetes);
    assert.equal(k.todoAntesDelCorte, k.pendientesAlCorte === 0 ? 1 : 0);
    assert.ok(k.esperaP50Min <= k.esperaP90Min && k.esperaMediaMin > 0);
    assert.ok(k.utilInduccionPct > 0 && k.utilInduccionPct <= 100);
    assert.ok(k.inductoresPresentes <= 3 && k.inductoresPresentes >= 0);
    assert.equal(k.recirculacionPct, (100 * k.vueltasExtra) / h.sorter.S.colocaciones);
    assert.equal(k.noLeidosPct, (100 * h.sorter.S.noLeidos) / h.sorter.S.colocaciones);
    const presentes = h.personas.presentes();
    assert.equal(presentes, 16 - k.ausentes);
    assert.equal(k.horasPersonaPagadas, (presentes * Math.max(8 * 60, k.finClasificacionMin)) / 60);
    assert.equal(k.costoNoche, k.horasPersonaPagadas * 7085 + 496000);
    assert.equal(k.costoPorPaquete, k.costoNoche / k.clasificados);
    // recursos y series
    const pr = s.resultado.porRecurso;
    assert.equal(pr.rampaRecibidos.length, 12);
    assert.equal(pr.personaOcupadaPct.length, 16);
    assert.equal(pr.puestoInducidos.length, 5);
    assert.equal(pr.puestoInducidos.reduce((a, b) => a + b, 0), h.sorter.S.colocaciones, 'cada inducción termina en una colocación');
    assert.equal(pr.rampaVueltas.reduce((a, b) => a + b, 0), k.vueltasExtra);
    assert.ok(Math.abs(pr.rampaMinutosLlena.reduce((a, b) => a + b, 0) / 60 - k.horasRampaLlena) < 1e-9);
    assert.equal(pr.puestoInducidos[3] + pr.puestoInducidos[4], 0, 'los puestos sin persona no inducen');
    assert.ok(pr.personaOcupadaPct.every((x) => x >= 0 && x <= 100 * (480 + 480) / 480));
    const series = s.resultado.series;
    assert.ok(series.clasificados.length >= 32, 'al menos los 32 cuartos de hora del turno');
    assert.equal(series.clasificados.length, series.filaInduccionMax.length);
    assert.equal(series.clasificados.reduce((a, b) => a + b, 0), k.clasificados, 'la serie de clasificados suma todos los clasificados');
    // la contrapresión frena a los andenes, no a los reingresos del puesto manual (regla 12): la fila puede pasar los 120 lugares
    // solo por paquetes que vuelven del manual (NOTAS-CONTRATO §4; el control exacto está en invariantes.test.ts)
    const reingresos = s.resultado.porRecurso.puestoInducidos.reduce((a, b) => a + b, 0) - (k.paquetes - contarNoTransportables(h));
    assert.ok(Math.max(...series.filaInduccionMax) <= 120 + reingresos, 'la fila supera los lugares solo por reingresos del manual');
  }
  fines.sort((a, b) => a - b);
  const mediana = fines[NOCHES >> 1];
  assert.ok(mediana >= 120 && mediana <= 300, `la mediana del fin (${mediana} min) tiene que estar entre 120 y 300`);
  assert.ok(nominales >= 15, `hubo ${nominales} noches sin golpes para controlar`);
});
