// hub/pruebas/cintas.test.ts · P4 · K02a, K02b y K03 (corte-1.md §8): cintas con separación y acumulación con contrapresión.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TipoTramo, type Traza } from '../../contratos/traza.ts';
import { acumulacionSinInduccion, cintaSola, noche } from './modelos.ts';

const HORA = 3_600_000, INICIO = 22 * HORA;

function tramosDe(t: Traza, k: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < t.tramos.n; i++) if (t.tramos.k[i] === k) out.push(i);
  return out;
}

const k02 = noche(cintaSola(), 0, 'completa');

test('K02a · cinta de 42 m a 2 m/s: cada paquete tarda 21,0 s en recorrerla', () => {
  const T = k02.traza!.tramos, cintas = tramosDe(k02.traza!, TipoTramo.CINTA);
  assert.equal(cintas.length, 15000, 'un tramo CINTA por paquete');
  for (const i of cintas) assert.equal(T.t1[i] - T.t0[i], 21000, `tramo ${i}: se esperaba un tránsito de 21.000 ms`);
});

test('K02b · con descarga instantánea la cinta lleva 12.000 paquetes por hora (± 1)', () => {
  const T = k02.traza!.tramos;
  const desde = INICIO + 60_000, hasta = desde + HORA;
  let n = 0;
  for (const i of tramosDe(k02.traza!, TipoTramo.CINTA)) if (T.t0[i] >= desde && T.t0[i] < hasta) n++;
  assert.ok(Math.abs(n - 12000) <= 1, `se esperaban 12.000 ± 1 entradas en una hora y entraron ${n}`);
  // la separación mínima se respeta siempre: 0,6 m ÷ 2 m/s = 300 ms entre entradas
  const entradas = tramosDe(k02.traza!, TipoTramo.CINTA).map((i) => T.t0[i]).sort((a, b) => a - b);
  for (let j = 1; j < entradas.length; j++) assert.ok(entradas[j] - entradas[j - 1] >= 300, `entradas ${j - 1} y ${j} a menos de 300 ms`);
});

test('K03 · acumulación de 42 m y paso 0,6 m sin puestos activos: entran exactamente 70 paquetes y los andenes paran', () => {
  const s = noche(acumulacionSinInduccion(), 0, 'completa');
  const entradas = tramosDe(s.traza!, TipoTramo.ACUMULACION).length;
  assert.equal(entradas, 70, `se esperaban 70 entradas a la acumulación y hubo ${entradas}`);
  assert.equal(s.resultado.kpi.paquetes, 70, 'con contrapresión no nace ningún paquete más que los lugares');
  assert.equal(s.hub.acum.fila.largo, 70);
  assert.deepEqual(s.resultado.alertas, ['no-termina'], 'sin inducción queda trabajo al horizonte, y nada más falla');
  // los tres andenes quedan parados y el momento ACUMULACION_LLENA aparece una vez
  assert.ok(s.hub.andenes.hayBloqueados());
  const M = s.traza!.momentos;
  let llena = 0;
  for (let i = 0; i < M.n; i++) if (M.tipo[i] === 60) llena++;
  assert.equal(llena, 1, 'un solo momento ACUMULACION_LLENA');
});
