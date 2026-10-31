// pruebas/hostiles.test.ts · P3 · H01–H12 (corte-1.md §9, P3): entradas hostiles rechazadas con el error esperado.
// Objetivo del paquete: «que ningún enlace hostil cuelgue un teléfono». Acá se prueba que cada una vuelve rápido con el error
// del contrato, que no lanza, y que ninguna contamina el prototipo de Object.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compresionDeCeros } from './hostiles/ayuda-bomba.ts';
import { HOSTILES, FRAGMENTOS_MALFORMADOS } from './hostiles/entradas.ts';
import { crearCodec, descomprimirConTope } from '../enlace.ts';
import { compilar } from '../compilar.ts';
import { LIMITES_ENLACE } from '../../contratos/escena.ts';
import { resolverEjemplo, ejemploJson } from './ayudas.ts';

const codec = crearCodec(resolverEjemplo);

for (const h of HOSTILES) {
  test(`${h.id}: ${h.nombre} → ${h.esperado}`, async () => {
    const fragmento = await h.fragmento();
    const r = await codec.decodificar(fragmento);
    assert.equal(r.ok, false, `${h.id} se aceptó y tenía que rechazarse con «${h.esperado}»`);
    if (r.ok) return;
    assert.equal(r.error, h.esperado, `${h.id}: se esperaba «${h.esperado}» y salió «${r.error}»${r.detalle ? ` (${r.detalle})` : ''}`);
    assert.equal(({} as Record<string, unknown>).polluted, undefined, 'el prototipo de Object quedó contaminado');
  });
}

test('H01–H17 están todas (y las variantes b)', () => {
  const ids = HOSTILES.map((h) => h.id);
  for (let i = 1; i <= 17; i++) assert.ok(ids.includes('H' + String(i).padStart(2, '0')), `falta H${String(i).padStart(2, '0')}`);
});

test('H01 de verdad es una bomba: pocos KB comprimidos, megabytes descomprimidos, y entra en el tope de caracteres del enlace', async () => {
  const hostil = HOSTILES.find((h) => h.id === 'H01')!;
  const f = await hostil.fragmento();
  assert.ok(f.length <= LIMITES_ENLACE.maxCaracteres, `la bomba de prueba (${f.length} caracteres) tiene que pasar el tope de largo para probar la descompresión`);
  assert.ok(f.length < 14000, 'la bomba pesa unos 13.000 caracteres');
  const mil = await compresionDeCeros(1_000_000);
  assert.ok(mil.length < 2000, `1 MB de ceros comprimen a ${mil.length} bytes (deflate no pasa de 1.032:1)`);
});

test('la descompresión corta en el tope: una bomba de 100 MB (ejecutada directo, sin el tope de caracteres) se aborta enseguida', async () => {
  const bomba = await compresionDeCeros(100_000_000);
  assert.ok(bomba.length < 200_000, `la bomba comprimida pesa ${bomba.length} bytes`);
  const r = await descomprimirConTope(bomba, LIMITES_ENLACE.maxBytesDescomprimidos);
  assert.equal(r.ok, false);
  assert.ok(!r.ok && r.error === 'bomba', `se esperaba «bomba» y salió ${JSON.stringify(r)}`);
});

test('un deflate legítimo justo en el tope (262.144 bytes) pasa y uno de un byte más se corta', async () => {
  const justo = await descomprimirConTope(await compresionDeCeros(LIMITES_ENLACE.maxBytesDescomprimidos), LIMITES_ENLACE.maxBytesDescomprimidos);
  assert.ok(justo.ok, 'el tope es inclusivo');
  assert.ok(justo.ok && justo.bytes.length === LIMITES_ENLACE.maxBytesDescomprimidos);
  const demas = await descomprimirConTope(await compresionDeCeros(LIMITES_ENLACE.maxBytesDescomprimidos + 1), LIMITES_ENLACE.maxBytesDescomprimidos);
  assert.ok(!demas.ok && demas.error === 'bomba');
});

test('datos que no son deflate dan «formato», no una excepción', async () => {
  const r = await descomprimirConTope(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), 1000);
  assert.ok(!r.ok && r.error === 'formato', JSON.stringify(r));
});

for (const f of FRAGMENTOS_MALFORMADOS) {
  test(`fragmento malformado (${f.nombre}) → ${f.esperado}`, async () => {
    const r = await codec.decodificar(f.fragmento);
    assert.equal(r.ok, false, 'se aceptó');
    assert.ok(!r.ok && r.error === f.esperado, `se esperaba «${f.esperado}» y salió ${JSON.stringify(r)}`);
  });
}

test('el decodificador nunca lanza, aunque no le pasen un texto', async () => {
  for (const x of [undefined, null, 5, {}, [], Symbol.iterator] as unknown[]) {
    const r = await codec.decodificar(x as string);
    assert.equal(r.ok, false);
    assert.ok(!r.ok && r.error === 'formato');
  }
});

// ---- Hostiles directos al compilador (los que no pasan por el enlace: modo ingeniero, archivos, otras pruebas) ----

test('compilar: un objeto con 1.000.000 de nodos en memoria se corta en el tope de nodos', async () => {
  const gigante = ejemploJson();
  gigante.parametros = Object.fromEntries(Array.from({ length: 5000 }, (_, i) => [`p${i}`, { a: 1, b: [1, 2, 3, 4], c: { d: 1 } }]));
  gigante.relleno = new Array(1_000_000).fill(0);
  const r = await compilar(gigante);
  assert.equal(r.ok, false);
  assert.ok(!r.ok && r.diagnosticos.length === 1 && r.diagnosticos[0].clave === 'modelo.diag.E-ESQUEMA.nodos', JSON.stringify(r));
});

test('compilar: un texto de 1 MB, claves prohibidas, ciclos y accesores que lanzan', async () => {
  const largo = ejemploJson(); largo.titulo = 'x'.repeat(1_000_000);
  assert.ok(!(await compilar(largo)).ok);
  const ciclo = ejemploJson(); ciclo.hub.ciclo = ciclo;
  const rc = await compilar(ciclo);
  assert.ok(!rc.ok && rc.diagnosticos[0].clave === 'modelo.diag.E-ESQUEMA.profundidad', 'un ciclo se corta por profundidad');
  const trampa = ejemploJson();
  Object.defineProperty(trampa, 'titulo', { enumerable: true, get() { throw new Error('boom'); } });
  const rt = await compilar(trampa);
  assert.ok(!rt.ok && rt.diagnosticos[0].clave === 'modelo.diag.E-ESQUEMA.no-plano', 'un accesor que lanza se rechaza sin propagar la excepción');
  const proxy = new Proxy({}, { ownKeys() { throw new Error('boom'); } });
  assert.ok(!(await compilar(proxy)).ok);
  const proxy2 = new Proxy({}, { getPrototypeOf() { throw new Error('boom'); } });
  assert.ok(!(await compilar(proxy2)).ok);
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
});

test('compilar: para cualquier cosa que se le pase, devuelve un resultado y nunca lanza', async () => {
  const cosas: unknown[] = [undefined, null, 0, 1, NaN, '', 'texto', true, [], {}, [[]], [{}], () => {}, Symbol('s'), 10n, new Date(0), /x/, new Error('e'), new Uint8Array(3), Object.create(null), new Set([1]), { esquema: 'anden.modelo/1' }];
  for (const x of cosas) {
    const r = await compilar(x);
    assert.equal(r.ok, false, `compilar(${String(typeof x)}) aceptó una entrada que no es un modelo`);
    assert.ok(!r.ok && r.diagnosticos.length > 0 && r.diagnosticos.every((d) => d.clave.startsWith('modelo.diag.')));
  }
});

test('compilar: los diagnósticos están acotados (una entrada con miles de errores no llena la memoria)', async () => {
  const m = ejemploJson();
  m.hub.andenes = Array.from({ length: 3000 }, () => ({ id: 5, x: 'a', y: 'b', personas: -1 }));
  const r = await compilar(m);
  assert.ok(!r.ok);
  assert.ok(!r.ok && r.diagnosticos.length <= 100, `salieron ${!r.ok ? r.diagnosticos.length : 0} diagnósticos`);
  assert.ok(!r.ok && r.diagnosticos.some((d) => d.clave === 'modelo.diag.E-ESQUEMA.demasiados'));
});

test('compilar: 50 escenarios de 60 operaciones compilan (el trabajo está acotado por el tope de nodos)', async () => {
  const armar = (ops: number) => {
    const m = ejemploJson();
    m.escenarios = Array.from({ length: 50 }, (_, i) => ({
      id: `e${i}`, titulo: `E${i}`,
      parche: Array.from({ length: ops }, (_, j) => ({ op: 'replace', path: '/personas/induccion/reten', value: (i + j) % 3 })),
    }));
    return m;
  };
  const r = await compilar(armar(60));
  assert.ok(r.ok, r.ok ? '' : JSON.stringify(r.diagnosticos.slice(0, 3)));
  // Con 200 operaciones por escenario (el máximo por parche) el documento pasa los 20.000 nodos y se corta antes de compilar nada.
  const grande = await compilar(armar(200));
  assert.ok(!grande.ok && grande.diagnosticos[0].clave === 'modelo.diag.E-ESQUEMA.nodos', 'el tope de nodos tiene que acotar el trabajo total de los escenarios');
});

test('compilar: una cinta con 5.000 puntos (15.000 nodos, dentro del tope) se procesa entera', async () => {
  const m = ejemploJson();
  // en zigzag dentro de 30 × 20 cm: 5.000 puntos y menos de 2.000 m de cinta (el máximo desde la revisión del 30-10-2026, SEG-R1)
  m.hub.cintas[0].puntos = Array.from({ length: 5000 }, (_, i) => [-14 + 0.05 * (i % 7), -10 + 0.05 * (i % 5)]);
  const r = await compilar(m);
  assert.ok(r.ok, r.ok ? '' : JSON.stringify(r.diagnosticos.slice(0, 3)));
});

test('una cinta de más de 2.000 m se rechaza con E-RANGO «cinta-larga» (SEG-R1), aunque cada punto esté dentro de ±5 km', async () => {
  const m = ejemploJson();
  m.hub.cintas[0].puntos = [[-14, -10], [4000, -10], [-4000, -10]];
  const r = await compilar(m);
  assert.equal(r.ok, false, 'una cinta de 12 km no puede compilar');
  if (r.ok) return;
  assert.ok(r.diagnosticos.some((d) => d.clave === 'modelo.diag.E-RANGO.cinta-larga' && d.ruta === '/hub/cintas/0/puntos'),
    `se esperaba E-RANGO cinta-larga en /hub/cintas/0/puntos y salió ${JSON.stringify(r.diagnosticos.slice(0, 3))}`);
});
