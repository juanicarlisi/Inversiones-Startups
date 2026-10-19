// integracion/pruebas/diferencial.test.ts · Andén simulador, corte 1 · Integración: R08b (corte-1.md §8 y §12.3).
// El núcleo de producción (nucleo/) y la referencia de contratos/ son dos implementaciones independientes de la misma semántica (§6):
// tienen que dar la MISMA huella en la batería rápida y en el hub. Si difieren, uno de los dos no cumple la especificación.
//  · batería rápida: el informe completo idéntico con los dos motores (salvo el nombre del motor) y las 66 trazas doradas iguales a las
//    guardadas en verificacion/doradas.json (que se generaron con la referencia);
//  · hub chico en 5 semillas, hub grande en 2 semillas y 2 réplicas, y el hub chico en F2: misma huella, mismos eventos, los 24 KPI,
//    las alertas, los indicadores por recurso, las series y la traza completa columna por columna.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import { KPIS } from '../../contratos/resultados.ts';
import type { SalidaSimulacion } from '../../contratos/experimentos.ts';
import type { ModeloValidado } from '../../contratos/modelo.ts';
import type { Traza } from '../../contratos/traza.ts';
import { leerDoradas, type InformeBateria } from '../../verificacion/bateria.ts';
import { ensamblar } from '../ensamblar.ts';
import { ensamblarBateria } from '../ensamblar-bateria.ts';

const produccion = ensamblar();
const referencia = ensamblar(crearMotorReferencia);

async function compilada(clave: string): Promise<ModeloValidado> {
  const c = await produccion.compilar(produccion.plantillas[clave]);
  if (!c.ok) throw new Error(`la plantilla ${clave} no compila: ${c.diagnosticos.map((d) => d.codigo).join(', ')}`);
  return c.mv;
}

/** Las columnas de la traza, como bytes, para comparar todo de una vez sin tolerancia. */
function columnas(t: Traza): Record<string, Uint8Array> {
  const out: Record<string, Uint8Array> = {};
  for (const [grupo, cols] of [['tramos', t.tramos], ['momentos', t.momentos], ['paquetes', t.paquetes]] as const) {
    for (const [k, v] of Object.entries(cols)) {
      if (ArrayBuffer.isView(v)) out[`${grupo}.${k}`] = new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
    }
  }
  return out;
}

function compararNoches(a: SalidaSimulacion, b: SalidaSimulacion, que: string): void {
  const ra = a.resultado, rb = b.resultado;
  assert.equal(rb.huella, ra.huella, `${que}: la huella de la referencia (${rb.huella}) no es la del núcleo (${ra.huella})`);
  assert.equal(rb.eventos, ra.eventos, `${que}: eventos procesados`);
  for (const k of KPIS) assert.ok(Object.is(ra.kpi[k], rb.kpi[k]), `${que}: el KPI ${k} da ${ra.kpi[k]} con el núcleo y ${rb.kpi[k]} con la referencia`);
  assert.deepEqual(rb.alertas, ra.alertas, `${que}: alertas`);
  assert.deepEqual(rb.porRecurso, ra.porRecurso, `${que}: indicadores por recurso`);
  assert.deepEqual(rb.series, ra.series, `${que}: series por cuarto de hora`);
  if (a.traza || b.traza) {
    assert.ok(a.traza && b.traza, `${que}: los dos motores tienen que devolver la traza`);
    const ca = columnas(a.traza), cb = columnas(b.traza);
    assert.deepEqual(Object.keys(cb).sort(), Object.keys(ca).sort(), `${que}: columnas de la traza`);
    for (const k of Object.keys(ca)) assert.ok(Buffer.from(ca[k]).equals(Buffer.from(cb[k])), `${que}: la columna ${k} de la traza difiere`);
    const { tramos: _t1, momentos: _m1, paquetes: _p1, ...restoA } = a.traza;
    const { tramos: _t2, momentos: _m2, paquetes: _p2, ...restoB } = b.traza;
    assert.deepEqual(restoB, restoA, `${que}: catálogo, geometría y datos de la traza`);
  }
}

test('R08b · hub chico en 5 semillas (F3, traza completa): núcleo = referencia', async () => {
  const mv = await compilada('hub-chico@1.0.0');
  for (const semilla of [1, 2, 3, 20261017, 4294967295]) {
    const a = produccion.simularNoche(mv, semilla, 0, { traza: 'completa' });
    const b = referencia.simularNoche(mv, semilla, 0, { traza: 'completa' });
    assert.deepEqual(a.resultado.alertas, [], `hub chico, semilla ${semilla}: la noche no tiene que tener alertas`);
    compararNoches(a, b, `hub chico, semilla ${semilla}`);
  }
});

test('R08b · hub grande en 2 semillas × 2 réplicas (F3, traza completa): núcleo = referencia', async () => {
  const mv = await compilada('hub-lazo-noche@1.0.0');
  for (const semilla of [1, 20261017]) {
    for (const replica of [0, 3]) {
      compararNoches(produccion.simularNoche(mv, semilla, replica, { traza: 'completa' }),
        referencia.simularNoche(mv, semilla, replica, { traza: 'completa' }), `hub grande, semilla ${semilla}, réplica ${replica}`);
    }
  }
});

test('R08b · hub chico en F2 y sin traza: núcleo = referencia', async () => {
  const mv = await compilada('hub-chico@1.0.0');
  for (const semilla of [7, 20261017]) {
    compararNoches(produccion.simularNocheF2(mv, semilla, 1, { traza: 'completa' }), referencia.simularNocheF2(mv, semilla, 1, { traza: 'completa' }),
      `hub chico F2, semilla ${semilla}`);
    compararNoches(produccion.simularNoche(mv, semilla, 2, { traza: 'no' }), referencia.simularNoche(mv, semilla, 2, { traza: 'no' }),
      `hub chico sin traza, semilla ${semilla}`);
  }
});

/** El informe sin lo que depende de quién lo corrió ni de cuánto tardó. */
function sinMotor(inf: InformeBateria): unknown {
  return JSON.parse(JSON.stringify(inf, (k, v) => (k === 'motor' || k === 'fecha' || k === 'segundos' || k === 'msCaso' ? undefined : v)));
}

test('R08b · batería rápida: mismo informe con el núcleo y con la referencia, y las 66 doradas iguales a las guardadas', () => {
  const doradas = leerDoradas();
  assert.ok(doradas, 'falta verificacion/doradas.json (las trazas doradas de la batería)');
  const a = ensamblarBateria().correr({ suite: 'rapida', doradas, motor: 'núcleo de producción' });
  const b = ensamblarBateria(crearMotorReferencia).correr({ suite: 'rapida', doradas, motor: 'referencia' });
  assert.equal(a.resumen.aprobada, true, `la batería rápida con el núcleo tiene que aprobar: ${JSON.stringify(a.resumen)}`);
  assert.ok(a.doradas && a.doradas.estado === 'pasa' && a.doradas.comparadas === doradas.corridas.length && a.doradas.distintas.length === 0,
    `las doradas con el núcleo tienen que coincidir con las guardadas: ${JSON.stringify(a.doradas)}`);
  assert.equal(doradas.corridas.length, 66, 'se esperaban 66 corridas doradas');
  assert.deepEqual(sinMotor(a), sinMotor(b), 'el informe de la batería rápida tiene que ser idéntico con los dos motores');
});
