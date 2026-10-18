// pruebas/indice.test.ts · P3 · La entrega de P3 (corte-1.md §9): modelo/indice.ts exporta todo lo pedido, con los tipos del contrato.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as modelo from '../indice.ts';
import type { AplicarParche, CodecEnlace, CrearCodec, HuellaModelo, JsonCanonico } from '../../contratos/escena.ts';
import type { Anonimizar, CalcularF0, Compilar, EstimarPresupuesto, Variante } from '../../contratos/modelo.ts';
import { ejemploJson, resolverEjemplo } from './ayudas.ts';

// Chequeo de tipos (lo verifica tsc): cada entrega cumple su tipo del contrato.
const _compilar: Compilar = modelo.compilar;
const _crearVariante: (c: Compilar) => Variante = modelo.crearVariante;
const _calcularF0: CalcularF0 = modelo.calcularF0;
const _estimarPresupuesto: EstimarPresupuesto = modelo.estimarPresupuesto;
const _jsonCanonico: JsonCanonico = modelo.jsonCanonico;
const _huellaModelo: HuellaModelo = modelo.huellaModelo;
const _aplicarParche: AplicarParche = modelo.aplicarParche;
const _crearCodec: CrearCodec = modelo.crearCodec;
const _anonimizar: Anonimizar = modelo.anonimizar;
void [_compilar, _crearVariante, _calcularF0, _estimarPresupuesto, _jsonCanonico, _huellaModelo, _aplicarParche, _crearCodec, _anonimizar];

test('la entrega de P3 está completa: compilar, crearVariante, calcularF0, estimarPresupuesto, jsonCanonico, huellaModelo, aplicarParche, crearCodec, anonimizar', () => {
  for (const n of ['compilar', 'crearVariante', 'calcularF0', 'estimarPresupuesto', 'jsonCanonico', 'huellaModelo', 'aplicarParche', 'crearCodec', 'anonimizar'] as const) {
    assert.equal(typeof modelo[n], 'function', `falta ${n} en modelo/indice.ts`);
  }
});

test('las piezas del índice trabajan juntas: compilar → variante → enlace → compilar da la misma huella', async () => {
  const r = await modelo.compilar(ejemploJson());
  assert.ok(r.ok);
  const variante = modelo.crearVariante(modelo.compilar);
  const v = await variante(r.mv, [{ op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 }]);
  const codec: CodecEnlace = modelo.crearCodec(resolverEjemplo);
  const fragmento = await codec.codificar({
    tipo: 'plantilla', plantilla: { id: 'hub-chico', version: '1.0.0' },
    parche: [{ op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 }],
    receta: { v: 1, modelo: v.huella, motor: '1.0.0', semilla: 20261017, replicas: 100 },
  });
  const d = await codec.decodificar(fragmento);
  assert.ok(d.ok && d.enlace.tipo === 'plantilla', JSON.stringify(d));
  const rec = await modelo.compilar(modelo.aplicarParche(r.mv.modelo, d.enlace.parche));
  assert.ok(rec.ok);
  assert.equal(rec.mv.huella, v.huella);
  assert.equal(await modelo.huellaModelo(rec.mv.modelo), v.huella);
  assert.deepEqual(modelo.calcularF0(rec.mv.modelo), v.f0);
  assert.deepEqual(modelo.estimarPresupuesto(rec.mv.modelo), modelo.estimarPresupuesto(v.modelo));
  assert.equal(modelo.jsonCanonico({ b: 1, a: 2 }), '{"a":2,"b":1}');
  const anon = modelo.anonimizar(rec.mv.modelo, 123);
  assert.ok((await modelo.compilar(anon)).ok);
});

test('parsearJsonSeguro (para el modo ingeniero): parsea con los mismos límites que el enlace', () => {
  const ok = modelo.parsearJsonSeguro(JSON.stringify(ejemploJson()));
  assert.ok(ok.ok);
  const mal = modelo.parsearJsonSeguro('{"a":');
  assert.ok(!mal.ok && mal.error === 'json-invalido');
  const hondo = modelo.parsearJsonSeguro('['.repeat(40) + ']'.repeat(40));
  assert.ok(!hondo.ok && hondo.error === 'json-profundo');
  const proto = modelo.parsearJsonSeguro('{"__proto__":{}}');
  assert.ok(!proto.ok && proto.error === 'esquema');
});

test('el catálogo de controles y los topes públicos', () => {
  assert.ok(modelo.CONTROLES.includes('E-ESQUEMA') && modelo.CONTROLES.includes('A-CORTE-IMPOSIBLE'));
  assert.equal(modelo.MAX_VALORES_DECISION, 30);
  assert.equal(modelo.MAX_ESCENARIOS, 50);
  assert.equal(modelo.MAX_DIAGNOSTICOS, 100);
  assert.equal(modelo.claveDiag('E-RANGO', 'minimo'), 'modelo.diag.E-RANGO.minimo');
  assert.equal(modelo.claveDiag('E-ID-DUPLICADO'), 'modelo.diag.E-ID-DUPLICADO');
});
