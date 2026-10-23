// hub/pruebas/doradas.test.ts · P4 · Doradas del hub chico (corte-1.md §9, P4): huella y KPI de 5 semillas, guardadas una vez en
// hub/pruebas/doradas.json. Si cambian, cambió la semántica del hub (o del motor de referencia): eso es una versión nueva del motor.
// Se generan si el archivo no existe o con ANDEN_GENERAR=1. El núcleo de producción tiene que dar las mismas (R08b, integración).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import { KPIS, type KpiId } from '../../contratos/resultados.ts';
import { crearSimularNoche } from '../simular.ts';
import { chico, SEMILLA, validado } from './modelos.ts';

const ARCHIVO = new URL('./doradas.json', import.meta.url);
const SEMILLAS = [1, 2, 3, SEMILLA, 4294967295];

interface Dorada { semilla: number; replica: number; huella: string; eventos: number; kpi: Record<KpiId, number> }

function calcular(): Dorada[] {
  const sim = crearSimularNoche(crearMotorReferencia), mv = validado(chico());
  return SEMILLAS.map((semilla) => {
    const r = sim(mv, semilla, 0, { traza: 'no' }).resultado;
    return { semilla, replica: 0, huella: r.huella, eventos: r.eventos, kpi: r.kpi };
  });
}

test('doradas del hub chico: misma huella, mismos eventos y mismos KPI que los guardados (5 semillas)', () => {
  const ahora = calcular();
  if (process.env.ANDEN_GENERAR === '1' || !existsSync(ARCHIVO)) {
    writeFileSync(ARCHIVO, JSON.stringify({
      descripcion: 'Doradas del hub chico (hub-chico@1.0.0), réplica 0, traza «no», motor de referencia de contratos/, semántica del hub del motor 1.1.0 (caminata por distancia, persistencia en la rampa, relevo en las pausas, pausas después del fin, uso de la inducción sobre la jornada pagada). Generadas por hub/pruebas/doradas.test.ts.',
      generadas: '2026-10-19',
      doradas: ahora,
    }, null, 2) + '\n');
  }
  const guardadas = (JSON.parse(readFileSync(ARCHIVO, 'utf8')) as { doradas: Dorada[] }).doradas;
  assert.equal(guardadas.length, SEMILLAS.length);
  for (const [i, g] of guardadas.entries()) {
    const a = ahora[i];
    assert.equal(a.semilla, g.semilla);
    assert.equal(a.huella, g.huella, `semilla ${g.semilla}: la huella cambió (se esperaba ${g.huella} y salió ${a.huella})`);
    assert.equal(a.eventos, g.eventos, `semilla ${g.semilla}: cambió la cantidad de eventos`);
    for (const k of KPIS) assert.equal(a.kpi[k], g.kpi[k], `semilla ${g.semilla}: el KPI ${k} cambió (se esperaba ${g.kpi[k]} y salió ${a.kpi[k]})`);
  }
});
