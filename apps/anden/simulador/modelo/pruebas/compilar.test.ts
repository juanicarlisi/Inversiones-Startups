// pruebas/compilar.test.ts · P3 · El compilador con el modelo de ejemplo de corte-1.md §5 y sus propiedades generales.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { compilar, revisar } from '../compilar.ts';
import { jsonCanonico } from '../canonico.ts';
import { huellaModelo } from '../huella.ts';
import { CONTROLES } from '../chequeos.ts';
import type { Modelo } from '../../contratos/modelo.ts';
import { congelar, ejemploJson, ejemploModelo, hubGrandeJson, resumen } from './ayudas.ts';

test('el ejemplo compila sin errores ni avisos y trae I-SUPUESTOS (14 de 20) e I-CONTROLES', async () => {
  const r = await compilar(ejemploJson());
  assert.equal(r.ok, true, r.ok ? '' : `el ejemplo no compiló: ${resumen(r.diagnosticos)}`);
  if (!r.ok) return;
  const ds = r.mv.diagnosticos;
  assert.deepEqual(ds.filter((d) => d.nivel !== 'info'), [], `no debería haber errores ni avisos: ${resumen(ds)}`);
  const sup = ds.find((d) => d.codigo === 'I-SUPUESTOS');
  assert.ok(sup, 'falta I-SUPUESTOS');
  assert.deepEqual(sup.vars, { n: 14, total: 20 }, 'el ejemplo tiene 20 parámetros y 14 son SUPUESTO');
  assert.equal(sup.nivel, 'info');
  const con = ds.find((d) => d.codigo === 'I-CONTROLES');
  assert.ok(con, 'falta I-CONTROLES');
  assert.deepEqual(con.vars, { controles: CONTROLES.length, pasaron: CONTROLES.length, avisos: 0 });
});

test('la huella del ejemplo: 16 hex, igual a SHA-256 del JSON canónico con node:crypto, y fija (dorada)', async () => {
  const r = await compilar(ejemploJson());
  assert.ok(r.ok);
  const esperado = createHash('sha256').update(jsonCanonico(ejemploJson()), 'utf8').digest('hex').slice(0, 16);
  assert.match(r.mv.huella, /^[0-9a-f]{16}$/);
  assert.equal(r.mv.huella, esperado, 'la huella no coincide con SHA-256 del JSON canónico calculado con node:crypto');
  // Dorada: si cambia, cambió el JSON canónico, el esquema del ejemplo o la normalización (y con ellos todos los enlaces publicados).
  assert.equal(r.mv.huella, '0491977a06fedf2a');
  assert.equal(await huellaModelo(r.mv.modelo), r.mv.huella);
});

test('compilar no modifica su entrada (entrada congelada en profundidad) y devuelve una copia', async () => {
  const entrada = congelar(ejemploJson());
  const r = await compilar(entrada);
  assert.ok(r.ok, r.ok ? '' : resumen(r.diagnosticos));
  assert.notEqual(r.mv.modelo, entrada, 'el modelo compilado tiene que ser una copia, no el mismo objeto');
  assert.deepEqual(r.mv.modelo, entrada, 'sin normalización, la copia es idéntica al original');
  assert.equal(Object.isFrozen(r.mv.modelo), false);
});

test('compilar es idempotente: compilar(mv.modelo) da la misma huella; y el orden de las claves no cambia la huella', async () => {
  const r1 = await compilar(ejemploJson());
  assert.ok(r1.ok);
  const r2 = await compilar(r1.mv.modelo);
  assert.ok(r2.ok);
  assert.equal(r2.mv.huella, r1.mv.huella);
  assert.deepEqual(r2.mv.f0, r1.mv.f0);
  // Mismo modelo con las claves de cada objeto en orden inverso.
  const invertir = (x: unknown): unknown => {
    if (Array.isArray(x)) return x.map(invertir);
    if (x !== null && typeof x === 'object') {
      const o: Record<string, unknown> = {};
      for (const k of Object.keys(x).reverse()) o[k] = invertir((x as Record<string, unknown>)[k]);
      return o;
    }
    return x;
  };
  const r3 = await compilar(invertir(ejemploJson()));
  assert.ok(r3.ok);
  assert.equal(r3.mv.huella, r1.mv.huella, 'la huella depende del orden en que vienen las claves');
});

test('A-PESOS: los pesos que no suman 1 se normalizan con aviso y la huella del normalizado es estable', async () => {
  const m = ejemploJson();
  for (const r of m.hub.planClasificacion.rutas) r.peso *= 3.7; // suman 3,7
  const r1 = await compilar(m);
  assert.ok(r1.ok, r1.ok ? '' : resumen(r1.diagnosticos));
  const aviso = r1.mv.diagnosticos.find((d) => d.codigo === 'A-PESOS');
  assert.ok(aviso, 'falta A-PESOS');
  assert.equal(aviso.nivel, 'aviso');
  const suma = r1.mv.modelo.hub.planClasificacion.rutas.reduce((s, r) => s + r.peso, 0);
  assert.ok(Math.abs(suma - 1) < 1e-12, `los pesos normalizados suman ${suma}`);
  // Volver a compilar el modelo ya normalizado no da aviso y da la misma huella.
  const r2 = await compilar(r1.mv.modelo);
  assert.ok(r2.ok);
  assert.equal(r2.mv.diagnosticos.some((d) => d.codigo === 'A-PESOS'), false, 'la normalización no es idempotente: vuelve a avisar');
  assert.equal(r2.mv.huella, r1.mv.huella);
  // El modelo del que parte quien llama no se toca.
  assert.equal(m.hub.planClasificacion.rutas[0].peso, 0.2 * 3.7);
});

test('un título con <script> se acepta como texto y se conserva tal cual (P8 lo muestra con textContent)', async () => {
  const m = ejemploJson();
  m.titulo = '<script>alert("hola")</script> & <img src=x onerror=alert(1)>';
  m.parametros.induccionBase.fuente = '<b>negrita</b>';
  const r = await compilar(m);
  assert.ok(r.ok, r.ok ? '' : resumen(r.diagnosticos));
  assert.equal(r.mv.modelo.titulo, m.titulo);
  assert.equal(r.mv.modelo.parametros.induccionBase.fuente, '<b>negrita</b>');
});

test('revisar (síncrono, sin huella) coincide con compilar', async () => {
  const rev = revisar(ejemploJson());
  assert.ok(rev.ok);
  const r = await compilar(ejemploJson());
  assert.ok(r.ok);
  assert.deepEqual(rev.modelo, r.mv.modelo);
  assert.deepEqual(rev.f0, r.mv.f0);
  assert.deepEqual(rev.diagnosticos, r.mv.diagnosticos);
});

test('un modelo con un escenario roto no se acepta (modo profundo) pero revisar sin profundo lo deja pasar', () => {
  const m = ejemploJson();
  m.escenarios[2].parche = [{ op: 'replace', path: '/personas/induccion/reten', value: -1 }];
  const profundo = revisar(m, { profundo: true });
  assert.equal(profundo.ok, false);
  const superficial = revisar(m, { profundo: false });
  assert.equal(superficial.ok, true);
});

test('el ejemplo con 400 camiones, 50 escenarios y 30 valores de decisión compila (límites en el borde)', async () => {
  const m = ejemploJson();
  m.demanda.camiones = Array.from({ length: 400 }, (_, i) => ({ id: `T${i}`, turno: '22:00', paquetes: 10 }));
  m.escenarios = Array.from({ length: 50 }, (_, i) => ({ id: `e${i}`, titulo: `Escenario ${i}`, parche: [{ op: 'replace', path: '/personas/induccion/reten', value: i % 3 }] }));
  m.decision.variable = { ruta: '/personas/induccion/reten', min: 0, max: 29 };
  const r = await compilar(m);
  assert.ok(r.ok, r.ok ? '' : resumen(r.diagnosticos));
});

test('lista de camiones con turnos explícitos: compila y el F0 usa la ventana de la lista', async () => {
  const m = ejemploJson();
  m.demanda.camiones = [
    { id: 'T1', turno: '22:00', paquetes: 800 }, { id: 'T2', turno: '22:15', paquetes: 800 },
    { id: 'T3', turno: '22:30', paquetes: 800 }, { id: 'T4', turno: '23:00', paquetes: 800 },
  ];
  // El escenario «pico» cambia /demanda/camiones/paquetes, que en una lista no existe: el compilador lo tiene que rechazar...
  const roto = await compilar(m);
  assert.equal(roto.ok, false);
  assert.ok(!roto.ok && roto.diagnosticos.some((d) => d.clave === 'modelo.diag.E-ESCENARIO.parche' && d.ruta === '/escenarios/4/parche/0'), 'falta E-ESCENARIO.parche del escenario pico');
  // ...y sin ese escenario el modelo con la lista compila.
  m.escenarios = m.escenarios.slice(0, 4);
  const r = await compilar(m);
  assert.ok(r.ok, r.ok ? '' : resumen(r.diagnosticos));
  // ventana = (23:00 − 22:00) + mediana de [900, 900, 1.800] = 3.600 + 900 = 4.500 s; 3.200 paquetes
  assert.ok(Math.abs(r.mv.f0.llegadaMediaPorHora - (3200 / 4500) * 3600) < 1e-9);
});

test('el modelo compilado tiene el tipo Modelo (forma básica)', async () => {
  const r = await compilar(ejemploJson());
  assert.ok(r.ok);
  const m: Modelo = r.mv.modelo;
  assert.equal(m.esquema, 'anden.modelo/1');
  assert.equal(m.hub.rampas.length, 12);
  assert.deepEqual(m.plantilla, { id: 'hub-chico', version: '1.0.0' });
  assert.deepEqual(ejemploModelo(), m);
});

test('la escala de la plantilla grande (corte-1.md §5): 24.000 paquetes, 60 rampas, 50 rutas, lazo de 300 bandejas compila sin errores', async () => {
  const r = await compilar(hubGrandeJson());
  assert.ok(r.ok, r.ok ? '' : resumen(r.diagnosticos));
  const m = r.mv.modelo;
  assert.equal(m.hub.rampas.length, 60);
  assert.equal(m.hub.planClasificacion.rutas.length, 50);
  const suma = m.hub.planClasificacion.rutas.reduce((a, x) => a + x.peso, 0);
  assert.ok(Math.abs(suma - 1) < 1e-12);
  assert.equal(r.mv.diagnosticos.some((d) => d.nivel === 'error'), false);
  // 26 × 923 = 23.998 paquetes nominales (la plantilla grande «de 24.000»).
  assert.ok(Math.abs(r.mv.f0.llegadaMediaPorHora - (23998 / (26 * 900)) * 3600) < 1e-9);
  assert.equal(bandejas(m), 300);
});

function bandejas(m: Modelo): number {
  return Math.round((2 * m.hub.sorter.recta + 2 * Math.PI * m.hub.sorter.radio) / m.hub.sorter.paso);
}
