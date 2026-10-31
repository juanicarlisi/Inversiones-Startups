// pruebas/anonimizar.test.ts · P3 · Anonimizar antes de compartir (corte-1.md §9, P3): rutas «Ruta 01…», volúmenes × f con
// f ∈ [0,8; 1,25] derivado de la semilla, costos a 2 cifras significativas, sin `autor` ni `descripcion`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anonimizar, factorVolumen, redondear2Cifras, ID_ANONIMO, TITULO_ANONIMO, FUENTE_PROPIA } from '../anonimizar.ts';
import { compilar } from '../compilar.ts';
import type { Modelo } from '../../contratos/modelo.ts';
import { congelar, ejemploJson, ejemploModelo, resumen } from './ayudas.ts';

const SEMILLA = 987654321;

test('f ∈ [0,8; 1,25] para 100.000 semillas, determinista, y reparte todo el rango', () => {
  let min = Infinity, max = -Infinity;
  for (let s = 0; s < 100_000; s++) {
    const f = factorVolumen(s * 40503 + 12345);
    assert.ok(f >= 0.8 && f <= 1.25, `f = ${f} con la semilla ${s}`);
    if (f < min) min = f;
    if (f > max) max = f;
  }
  assert.ok(min < 0.801 && max > 1.249, `el rango cubierto fue [${min}, ${max}]`);
  assert.equal(factorVolumen(42), factorVolumen(42));
  assert.notEqual(factorVolumen(42), factorVolumen(43), 'semillas consecutivas dan factores distintos');
  // Independiente: fmix32 de MurmurHash3 con BigInt (sin Math.imul), para que ningún motor de JavaScript pueda dar otro factor.
  const M32 = 0xffffffffn;
  const fmix = (x: bigint): bigint => {
    x ^= x >> 16n; x = (x * 0x85ebca6bn) & M32; x ^= x >> 13n; x = (x * 0xc2b2ae35n) & M32; x ^= x >> 16n; return x & M32;
  };
  for (const semilla of [0, 1, SEMILLA, 4294967295, 20261017]) {
    const u = Number(fmix((BigInt(semilla) ^ 0x9e3779b9n) & M32)) / 4294967296;
    assert.equal(factorVolumen(semilla), 0.8 + 0.45 * u, `f de la semilla ${semilla}`);
  }
});

test('quita autor y descripción; id y título neutros; no toca el original', () => {
  const m = congelar(ejemploModelo());
  const a = anonimizar(m, SEMILLA);
  assert.equal('autor' in a, false);
  assert.equal('descripcion' in a, false);
  assert.equal(a.id, ID_ANONIMO);
  assert.equal(a.titulo, TITULO_ANONIMO);
  assert.equal(m.autor, 'Andén (plantilla pública de ejemplo)');
  assert.notEqual(a, m);
});

test('las rutas se llaman «Ruta 01…» y los camiones «Camión 01…»; las rampas, andenes, puestos y cintas tienen ids neutros', () => {
  const m = ejemploModelo();
  m.hub.planClasificacion.rutas.forEach((r, i) => { r.id = `Cliente ${String.fromCharCode(65 + i)}`; });
  const a = anonimizar(m, SEMILLA);
  assert.deepEqual(a.hub.planClasificacion.rutas.map((r) => r.id), Array.from({ length: 10 }, (_, i) => `Ruta ${String(i + 1).padStart(2, '0')}`));
  const rutas100 = ejemploModelo();
  rutas100.hub.planClasificacion.rutas = Array.from({ length: 120 }, (_, i) => ({ id: `r${i}`, peso: 1, rampas: [`R${String((i % 12) + 1).padStart(2, '0')}`] }));
  const b = anonimizar(rutas100, SEMILLA);
  assert.equal(b.hub.planClasificacion.rutas[0].id, 'Ruta 001', 'con más de 99 rutas, tres dígitos');
  assert.equal(b.hub.planClasificacion.rutas[119].id, 'Ruta 120');
  const lista = ejemploModelo();
  lista.demanda.camiones = [{ id: 'Camión de Juan', turno: '22:00', paquetes: 500 }, { id: 'Otro', turno: '22:30', paquetes: 700 }];
  lista.escenarios = lista.escenarios!.slice(0, 4);
  const c = anonimizar(lista, SEMILLA);
  assert.ok(Array.isArray(c.demanda.camiones));
  assert.deepEqual((c.demanda.camiones as { id: string }[]).map((x) => x.id), ['Camión 01', 'Camión 02']);
  assert.deepEqual(a.hub.andenes.map((x) => x.id), ['A1', 'A2', 'A3']);
  assert.deepEqual(a.hub.induccion.puestos.map((x) => x.id), ['I1', 'I2', 'I3', 'I4', 'I5']);
  assert.deepEqual(a.hub.cintas.map((x) => x.id), ['C1', 'C2', 'C3']);
  assert.equal(a.hub.excepcion.id, 'RX');
  assert.equal(a.hub.sorter.id, 'S1');
});

test('volúmenes × f: cada camión de la serie y del pico, redondeado, con el f de la semilla', () => {
  const m = ejemploModelo();
  const f = factorVolumen(SEMILLA);
  const a = anonimizar(m, SEMILLA);
  assert.ok(!Array.isArray(a.demanda.camiones));
  assert.equal((a.demanda.camiones as { paquetes: number }).paquetes, Math.round(800 * f));
  assert.equal((a.demanda.camiones as { cantidad: number }).cantidad, 10, 'la cantidad de camiones no se toca');
  const pico = a.escenarios!.find((e) => e.id === 'pico')!;
  assert.equal((pico.parche[0] as { value: number }).value, Math.round(1200 * f), 'el escenario «pico» se escala igual que la base');
  // Lista de camiones.
  const l = ejemploModelo();
  l.demanda.camiones = [{ id: 'a', turno: '22:00', paquetes: 500 }, { id: 'b', turno: '22:30', paquetes: 777 }];
  l.escenarios = [];
  const al = anonimizar(l, SEMILLA);
  assert.deepEqual((al.demanda.camiones as { paquetes: number }[]).map((x) => x.paquetes), [Math.round(500 * f), Math.round(777 * f)]);
  // Otra semilla: otro volumen.
  const otro = anonimizar(m, SEMILLA + 1);
  assert.notEqual((otro.demanda.camiones as { paquetes: number }).paquetes, (a.demanda.camiones as { paquetes: number }).paquetes);
});

test('los escenarios que reemplazan toda la demanda o la lista de camiones también se escalan', () => {
  const m = ejemploModelo();
  const f = factorVolumen(SEMILLA);
  m.escenarios = [
    { id: 'a', titulo: 'a', parche: [{ op: 'replace', path: '/demanda/camiones', value: { serie: true, cantidad: 4, primero: '22:00', cada: 900, paquetes: 1000 } }] },
    { id: 'b', titulo: 'b', parche: [{ op: 'replace', path: '/demanda/camiones/paquetes', value: 900 }] },
    { id: 'c', titulo: 'c', parche: [{ op: 'replace', path: '/demanda', value: { ...m.demanda, camiones: { serie: true, cantidad: 2, primero: '22:00', cada: 900, paquetes: 600 } } }] },
    { id: 'd', titulo: 'd', parche: [{ op: 'replace', path: '/personas/induccion/reten', value: 1 }] },
  ];
  const a = anonimizar(m, SEMILLA);
  const valores = a.escenarios!.map((e) => (e.parche[0] as { value: unknown }).value);
  assert.equal((valores[0] as { paquetes: number }).paquetes, Math.round(1000 * f));
  assert.equal(valores[1], Math.round(900 * f));
  assert.equal(((valores[2] as { camiones: { paquetes: number } }).camiones).paquetes, Math.round(600 * f));
  assert.equal(valores[3], 1, 'lo que no es volumen ni costo no se toca');
});

test('costos a 2 cifras significativas: los parámetros de costo, los costos directos y la indiferencia de la decisión', () => {
  const a = anonimizar(ejemploModelo(), SEMILLA);
  assert.equal(a.parametros.costoHoraPersona.valor, 7100, '7.085 → 7.100');
  assert.equal(a.parametros.costoFijoNoche.valor, 500000, '496.000 → 500.000');
  assert.equal(a.decision!.indiferencia.valor, 20000);
  assert.equal(a.parametros.costoHoraPersona.fuente, 'Costo redondeado a 2 cifras significativas al anonimizar.', 'la fuente repetía el número exacto');
  assert.equal(a.parametros.costoHoraPersona.url, undefined);
  const d = ejemploModelo();
  d.costos.horaPersona = 7085;
  d.costos.fijoNoche = 123456;
  const b = anonimizar(d, SEMILLA);
  assert.equal(b.costos.horaPersona, 7100);
  assert.equal(b.costos.fijoNoche, 120000);
  // Un escenario que cambia el costo.
  const e = ejemploModelo();
  e.escenarios = [{ id: 'caro', titulo: 'Más caro', parche: [{ op: 'replace', path: '/parametros/costoHoraPersona/valor', value: 8123 }, { op: 'replace', path: '/costos/fijoNoche', value: 987654 }] }];
  const c = anonimizar(e, SEMILLA);
  assert.equal((c.escenarios![0].parche[0] as { value: number }).value, 8100);
  assert.equal((c.escenarios![0].parche[1] as { value: number }).value, 990000);
});

test('redondeo a 2 cifras significativas: tabla', () => {
  const tabla: [number, number][] = [
    [7085, 7100], [496000, 500000], [123456, 120000], [0.0123, 0.012], [0.0126, 0.013], [1, 1], [9.96, 10], [9.94, 9.9], [10, 10], [99.5, 100],
    [100, 100], [1234567, 1200000], [0, 0], [-7085, -7100], [-0.0123, -0.012], [15, 15], [14.9, 15], [1.04, 1], [0.5, 0.5], [0.99, 0.99],
  ];
  for (const [x, esperado] of tabla) assert.equal(redondear2Cifras(x), esperado, `redondear2Cifras(${x})`);
  assert.equal(redondear2Cifras(Infinity), Infinity);
  assert.ok(Number.isNaN(redondear2Cifras(NaN)));
});

test('determinista: la misma semilla da exactamente el mismo modelo; otra semilla, otro volumen', () => {
  const a = anonimizar(ejemploModelo(), SEMILLA);
  const b = anonimizar(ejemploModelo(), SEMILLA);
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

test('el modelo anonimizado sigue siendo válido: compila, con sus escenarios y su decisión', async () => {
  for (const semilla of [0, 1, SEMILLA, 4294967295]) {
    const a = anonimizar(ejemploModelo(), semilla);
    const r = await compilar(a);
    assert.ok(r.ok, `semilla ${semilla}: ${r.ok ? '' : resumen(r.diagnosticos)}`);
  }
});

test('no queda ningún nombre propio: ni en ids, ni en autor, ni en descripción, ni en la fuente de datos propios', async () => {
  const NOMBRES = ['Andreani', 'Norte', 'Juan', 'Sucursal Quilmes', 'Pérez'];
  // Se renombran las rampas, y se meten nombres propios en todos los lugares donde el usuario puede escribir un id o una fuente.
  let texto = JSON.stringify(ejemploJson()).replace(/"R(\d\d)"/g, '"Norte-$1"');
  const m = JSON.parse(texto);
  m.autor = 'Juan Pérez, Andreani';
  m.descripcion = 'Sucursal Quilmes de Andreani';
  m.hub.andenes[0].id = 'Andén Andreani';
  m.hub.cintas[0].desde = 'Andén Andreani';
  m.hub.planClasificacion.rutas[0].id = 'Ruta Pérez';
  m.hub.induccion.puestos[0].id = 'Puesto Juan';
  m.hub.excepcion.id = 'Manual Norte';
  m.hub.sorter.id = 'Sorter Andreani';
  m.parametros.induccionBase.etiqueta = 'DATO_USUARIO';
  m.parametros.induccionBase.fuente = 'Medición de Juan Pérez en la sucursal Quilmes de Andreani: 2,31 s';
  m.parametros.induccionBase.url = 'https://andreani.example/medicion';
  m.parametros.induccionBase.nota = 'Dato interno de Andreani';
  m.parametros.manejoRampa.etiqueta = 'MEDIDO';
  m.parametros.manejoRampa.fuente = 'Cronometrado por Juan en Quilmes';
  m.procedencia['/hub/rampas'] = { etiqueta: 'DATO_USUARIO', fuente: 'Plano de Andreani Sucursal Quilmes', fecha: '2026-10-17' };
  m.personas.rampa.cantidad = 2;
  m.personas.rampa.asignacion = [['Norte-01', 'Norte-02', 'Norte-03', 'Norte-04', 'Norte-05', 'Norte-06'], ['Norte-07', 'Norte-08', 'Norte-09', 'Norte-10', 'Norte-11', 'Norte-12']];
  m.escenarios.push({ id: 'otra-asignacion', titulo: 'Reasignar', parche: [{ op: 'replace', path: '/personas/rampa/asignacion', value: [['Norte-12', 'Norte-02', 'Norte-03', 'Norte-04', 'Norte-05', 'Norte-06'], ['Norte-07', 'Norte-08', 'Norte-09', 'Norte-10', 'Norte-11', 'Norte-01']] }] });
  const original = await compilar(m);
  assert.ok(original.ok, original.ok ? '' : resumen(original.diagnosticos));
  for (const n of NOMBRES) assert.ok(JSON.stringify(m).includes(n), `la prueba está mal armada: «${n}» no está en el modelo de partida`);
  const a = anonimizar(m as Modelo, SEMILLA);
  const salida = JSON.stringify(a);
  for (const n of NOMBRES) assert.equal(salida.includes(n), false, `«${n}» sobrevivió a la anonimización`);
  assert.equal(a.parametros.induccionBase.fuente, FUENTE_PROPIA);
  assert.equal(a.parametros.induccionBase.url, undefined);
  assert.equal(a.procedencia!['/hub/rampas'].fuente, FUENTE_PROPIA);
  // Las referencias siguen cerradas: el modelo anonimizado compila (rutas ↔ rampas ↔ asignación ↔ parche del escenario).
  const r = await compilar(a);
  assert.ok(r.ok, r.ok ? '' : resumen(r.diagnosticos));
  const asig = a.personas.rampa.asignacion as string[][];
  assert.deepEqual(asig[0], ['R01', 'R02', 'R03', 'R04', 'R05', 'R06']);
  assert.deepEqual((a.escenarios!.find((e) => e.id === 'otra-asignacion')!.parche[0] as { value: string[][] }).value[0][0], 'R12');
});

test('los datos con fuente pública (SUPUESTO, ESTIMACION) conservan su fuente: no es un secreto y el lector la necesita', () => {
  const a = anonimizar(ejemploModelo(), SEMILLA);
  assert.match(a.parametros.induccionBase.fuente, /Oskon/);
  assert.equal(a.parametros.induccionBase.url, 'https://www.oskon.com.tr/en/blog/how-to-calculate-sorter-capacity');
});

test('anonimizar dos veces con la misma semilla sigue siendo un modelo válido y no pierde las rutas', async () => {
  const una = anonimizar(ejemploModelo(), SEMILLA);
  const dos = anonimizar(una, SEMILLA);
  assert.equal(dos.hub.planClasificacion.rutas.length, 10);
  const r = await compilar(dos);
  assert.ok(r.ok, r.ok ? '' : resumen(r.diagnosticos));
});

test('SEG-R5 · la licencia y la frase de la meta (texto libre que podía nombrar a la empresa o al cliente) no viajan en el modelo anonimizado', () => {
  const m = ejemploJson();
  m.licencia = 'Confidencial ACME';
  m.decision.restriccion.dichoComo = 'que el cliente MercadoX reciba todo antes de las 6';
  const a = anonimizar(m, 12345);
  assert.equal(a.licencia, undefined);
  assert.doesNotMatch(JSON.stringify(a), /ACME|MercadoX/, 'ninguna marca sembrada sobrevive');
  assert.match(a.decision!.restriccion.dichoComo, /al menos el \d+% de las noches/);
});
