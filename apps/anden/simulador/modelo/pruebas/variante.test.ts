// pruebas/variante.test.ts · P3 · Variantes: parche + compilación nueva. Nunca se simula una variante inválida.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compilar } from '../compilar.ts';
import { crearVariante, esErrorVariante } from '../variante.ts';
import type { ModeloValidado, OpParche } from '../../contratos/modelo.ts';
import { congelar, ejemploJson, resumen } from './ayudas.ts';

async function base(): Promise<ModeloValidado> {
  const r = await compilar(ejemploJson());
  assert.ok(r.ok, r.ok ? '' : resumen(r.diagnosticos));
  return r.mv;
}
const variante = crearVariante(compilar);
const op = (o: unknown[]) => o as OpParche[];

test('una variante válida: modelo nuevo, huella nueva, F0 recalculado, original intacto', async () => {
  const mv = congelar(await base());
  const v = await variante(mv, op([{ op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 }]));
  assert.equal(v.modelo.personas.induccion.puestosActivos, 4);
  assert.equal(mv.modelo.personas.induccion.puestosActivos, 3);
  assert.notEqual(v.huella, mv.huella);
  assert.ok(v.f0.capacidadInduccionPorHora > mv.f0.capacidadInduccionPorHora, 'con un puesto más sube la capacidad de inducción');
  assert.equal(v.f0.capacidadInduccionPorHora, (4 * 3600) / 2.4 * (1 - 900 / 7200));
  assert.equal(v.diagnosticos.some((d) => d.nivel === 'error'), false);
});

test('un parche vacío da la misma huella (la variante base)', async () => {
  const mv = await base();
  const v = await variante(mv, []);
  assert.equal(v.huella, mv.huella);
});

test('el mismo parche sobre el mismo modelo da siempre la misma huella; el orden de las operaciones independientes no importa', async () => {
  const mv = await base();
  const a = await variante(mv, op([{ op: 'replace', path: '/personas/induccion/reten', value: 1 }, { op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 }]));
  const b = await variante(mv, op([{ op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 }, { op: 'replace', path: '/personas/induccion/reten', value: 1 }]));
  const c = await variante(mv, op([{ op: 'replace', path: '/personas/induccion/reten', value: 1 }, { op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 }]));
  assert.equal(a.huella, b.huella);
  assert.equal(a.huella, c.huella);
});

test('los escenarios del ejemplo y los valores de la decisión se arman todos como variantes', async () => {
  const mv = await base();
  for (const e of mv.modelo.escenarios!) {
    const v = await variante(mv, e.parche);
    assert.equal(v.diagnosticos.some((d) => d.nivel === 'error'), false, `el escenario ${e.id} no compila`);
    assert.equal(e.parche.length === 0, v.huella === mv.huella, `el escenario ${e.id} ${e.parche.length === 0 ? 'no cambia nada y la huella cambió' : 'cambia el modelo y la huella no'}`);
  }
  const d = mv.modelo.decision!;
  const huellas = new Set<string>();
  for (let x = d.variable.min; x <= d.variable.max; x++) {
    const v = await variante(mv, op([{ op: 'replace', path: d.variable.ruta, value: x }]));
    huellas.add(v.huella);
    assert.equal(v.modelo.personas.induccion.puestosActivos, x);
  }
  assert.equal(huellas.size, d.variable.max - d.variable.min + 1);
});

test('un parche que no se puede aplicar rechaza con la operación que falló', async () => {
  const mv = await base();
  await assert.rejects(
    variante(mv, op([{ op: 'replace', path: '/personas/noExiste', value: 1 }])),
    (e: Error) => /operación 0 \(replace "\/personas\/noExiste"\)/.test(e.message) && /no existe/.test(e.message),
  );
  await assert.rejects(variante(mv, op([{ op: 'test', path: '/personas/induccion/puestosActivos', value: 99 }])), /el test falló: se esperaba 99 y hay 3/);
});

test('una variante que no compila rechaza con los diagnósticos y un mensaje que dice qué falló', async () => {
  const mv = await base();
  let error: unknown;
  try {
    await variante(mv, op([{ op: 'replace', path: '/personas/induccion/puestosActivos', value: 9 }]));
  } catch (e) { error = e; }
  assert.ok(error instanceof Error, 'tenía que rechazar');
  assert.ok(esErrorVariante(error), 'el error tiene que traer los diagnósticos');
  assert.match(error.message, /variante inválida: el parche de 1 operación\(es\) deja el modelo con 1 error\(es\): E-PUESTOS en \/personas\/induccion\/puestosActivos/);
  assert.ok(error.diagnosticos.some((d) => d.codigo === 'E-PUESTOS'));
  assert.equal(esErrorVariante(new Error('otro')), false);
  assert.equal(esErrorVariante('texto'), false);
});

test('el parche no puede meter claves prohibidas ni números no finitos en el modelo', async () => {
  const mv = await base();
  await assert.rejects(variante(mv, op([{ op: 'add', path: '/__proto__', value: { x: 1 } }])), /prohibida/);
  await assert.rejects(variante(mv, op([{ op: 'replace', path: '/hub/sorter/velocidad', value: Infinity }])), /variante inválida.*E-ESQUEMA/);
  await assert.rejects(variante(mv, op([{ op: 'replace', path: '/hub/sorter/velocidad', value: '2' }])), /variante inválida.*E-ESQUEMA/);
});

test('el cambio de la capacidad de una rampa, del retén y de la asignación solo toca esos campos (el resto del modelo es igual)', async () => {
  const mv = await base();
  const v = await variante(mv, op([
    { op: 'replace', path: '/hub/rampas/0/capacidad', value: 40 },
    { op: 'replace', path: '/personas/rampa/asignacion', value: 'contiguas' },
  ]));
  const a = JSON.parse(JSON.stringify(mv.modelo));
  const b = JSON.parse(JSON.stringify(v.modelo));
  a.hub.rampas[0].capacidad = 40;
  a.personas.rampa.asignacion = 'contiguas';
  assert.deepEqual(b, a);
});
