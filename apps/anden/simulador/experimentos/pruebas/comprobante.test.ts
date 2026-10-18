// Comprobante: receta, huella agregada, motor, modelo, semáforo, procedencia y validación (corte-1.md §7).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { armarComprobante, contarControles, contarProcedencia, CODIGOS_DE_CONTROL, huellaAgregada } from '../comprobante.ts';
import { barajar, modeloEjemplo, resultadoFalso, validadoEjemplo } from './ayudas.ts';
import type { Diagnostico } from '../../contratos/modelo.ts';
import type { Semaforo } from '../../contratos/experimentos.ts';

const MOTOR = { version: '1.0.0', pruebasExigibles: 85, pasaron: 85, fecha: '2026-10-18' };
const VERDE: Semaforo = { color: 'verde', motivo: 'ok', vars: { replicas: 5 } };
const diag = (codigo: string, nivel: Diagnostico['nivel']): Diagnostico => ({ codigo, nivel, ruta: '/x', clave: `modelo.diag.${codigo}` });
const replicas = (n: number, o: { semilla?: number; modelo?: string } = {}) =>
  Array.from({ length: n }, (_, i) => resultadoFalso({ semilla: o.semilla ?? 20261017, replica: i, modelo: o.modelo, huella: `${String(i).padStart(2, '0')}abcdef01234567` }));

test('huella agregada: valores dorados (calculados aparte con otra implementación de los dos carriles de §6.4)', () => {
  assert.equal(huellaAgregada([]), '811c9dc5c2b2ae35', 'sin huellas quedan los valores iniciales de los carriles');
  assert.equal(huellaAgregada(['0123456789abcdef']), '87bc333ddd36ced8');
  assert.equal(huellaAgregada(['aaaaaaaaaaaaaaaa', 'bbbbbbbbbbbbbbbb', 'cccccccccccccccc']), 'f8d160252bfb98b5');
  assert.equal(huellaAgregada(['h000000000000000', 'h000000000000001', 'h000000000000002']), 'bc0d9bc4cac1ab2a');
});

test('huella agregada: son 16 caracteres hex, el orden importa y cambiar un solo carácter de una réplica la cambia', () => {
  const a = ['0000000000000001', '0000000000000002', '0000000000000003'];
  const h = huellaAgregada(a);
  assert.match(h, /^[0-9a-f]{16}$/);
  assert.notEqual(huellaAgregada([a[1], a[0], a[2]]), h, 'el orden de las réplicas es parte de la huella');
  assert.notEqual(huellaAgregada([a[0], a[1], '0000000000000004']), h);
  assert.notEqual(huellaAgregada(a.slice(0, 2)), h);
});

test('armarComprobante: arma la receta, la huella agregada en orden de réplica, el motor, el modelo, el semáforo y la validación', async () => {
  const mv = validadoEjemplo();
  const rs = replicas(5);
  const c = await armarComprobante(mv, rs, VERDE, MOTOR, { semilla: 20261017, replicas: 5, noche: 2, t: 90000, vel: 8, esc: ['base', 'reten'] });
  assert.deepEqual(c.receta, { v: 1, modelo: mv.huella, motor: '1.0.0', semilla: 20261017, replicas: 5, noche: 2, t: 90000, vel: 8, esc: ['base', 'reten'] });
  assert.equal(c.huellaAgregada, huellaAgregada(rs.map((r) => r.huella)));
  assert.deepEqual(c.motor, MOTOR);
  assert.deepEqual(c.semaforo, VERDE);
  assert.deepEqual(c.validacion, { estado: 'sin-validar' });
  assert.deepEqual(c.modelo, { controles: 18, pasaron: 18, avisos: 0 });
});

test('la receta solo lleva los campos opcionales que se dieron (y el orden de las llaves es estable)', async () => {
  const c = await armarComprobante(validadoEjemplo(), replicas(3), VERDE, MOTOR, { semilla: 20261017, replicas: 3 });
  assert.deepEqual(Object.keys(c.receta), ['v', 'modelo', 'motor', 'semilla', 'replicas']);
  const d = await armarComprobante(validadoEjemplo(), replicas(3), VERDE, MOTOR, { semilla: 20261017, replicas: 3, vel: 4, noche: 0 });
  assert.deepEqual(Object.keys(d.receta), ['v', 'modelo', 'motor', 'semilla', 'replicas', 'noche', 'vel']);
});

test('las réplicas pueden llegar en cualquier orden: la huella agregada es la misma', async () => {
  const mv = validadoEjemplo();
  const rs = replicas(20);
  const base = await armarComprobante(mv, rs, VERDE, MOTOR, { semilla: 20261017, replicas: 20 });
  for (const sem of [1, 2, 3]) {
    const c = await armarComprobante(mv, barajar(rs, sem), VERDE, MOTOR, { semilla: 20261017, replicas: 20 });
    assert.equal(c.huellaAgregada, base.huellaAgregada, `barajadas con ${sem}`);
  }
});

test('procedencia: cuenta los parámetros del modelo por etiqueta', () => {
  const m = modeloEjemplo();
  const mv = validadoEjemplo();
  const p = contarProcedencia(mv);
  const por = (e: string) => Object.values(m.parametros).filter((x) => x.etiqueta === e).length;
  assert.deepEqual(p, { hecho: por('HECHO'), medido: por('MEDIDO'), estimacion: por('ESTIMACION'), hipotesis: por('HIPOTESIS'), supuesto: por('SUPUESTO'), datoUsuario: por('DATO_USUARIO') });
  assert.equal(p.hecho + p.medido + p.estimacion + p.hipotesis + p.supuesto + p.datoUsuario, Object.keys(m.parametros).length);
  assert.equal(p.estimacion, 6); assert.equal(p.supuesto, 14, 'el ejemplo de §5 tiene 6 ESTIMACION y 14 SUPUESTO (20 parámetros)');
  const raro = structuredClone(m); raro.parametros.induccionBase.etiqueta = 'INVENTADA' as never;
  assert.throws(() => contarProcedencia({ ...mv, modelo: raro }), /«induccionBase» trae una etiqueta de procedencia desconocida: «INVENTADA»/);
});

test('controles del modelo: 18 controles estáticos; pasa el que no dejó errores; los avisos se cuentan aparte', () => {
  assert.equal(CODIGOS_DE_CONTROL.length, 18);
  assert.deepEqual(contarControles([]), { controles: 18, pasaron: 18, avisos: 0 });
  assert.deepEqual(contarControles([diag('A-RHO', 'aviso'), diag('A-RHO', 'aviso'), diag('I-SUPUESTOS', 'info')]), { controles: 18, pasaron: 18, avisos: 2 });
  assert.deepEqual(contarControles([diag('E-REF', 'error'), diag('E-REF', 'error'), diag('E-RANGO', 'error')]), { controles: 18, pasaron: 16, avisos: 0 }, 'dos controles con error (aunque E-REF salte dos veces)');
  assert.deepEqual(contarControles([diag('E-NUEVO', 'error')]), { controles: 19, pasaron: 18, avisos: 0 }, 'un control que el compilador agregue también cuenta');
});

test('el comprobante toma los diagnósticos del modelo validado', async () => {
  const mv = { ...validadoEjemplo(), diagnosticos: [diag('A-PESOS', 'aviso'), diag('I-SUPUESTOS', 'info')] };
  const c = await armarComprobante(mv, replicas(3), VERDE, MOTOR, { semilla: 20261017, replicas: 3 });
  assert.deepEqual(c.modelo, { controles: 18, pasaron: 18, avisos: 1 });
});

test('no certifica lo que no puede reproducir: sin réplicas, de otro modelo, de otra semilla, con saltos o con otra cantidad lanza error', async () => {
  const mv = validadoEjemplo();
  const r = { semilla: 20261017, replicas: 5 };
  await assert.rejects(armarComprobante(mv, [], VERDE, MOTOR, { semilla: 1, replicas: 0 }), /no hay réplicas/);
  await assert.rejects(armarComprobante(mv, replicas(5, { modelo: 'aaaaaaaaaaaaaaaa' }), VERDE, MOTOR, r), /es del modelo aaaaaaaaaaaaaaaa y el comprobante es del modelo 0000000000000000/);
  await assert.rejects(armarComprobante(mv, replicas(5, { semilla: 9 }), VERDE, MOTOR, r), /usó la semilla 9 y la receta dice 20261017/);
  await assert.rejects(armarComprobante(mv, replicas(5).filter((x) => x.replica !== 2), VERDE, MOTOR, { semilla: 20261017, replicas: 4 }), /0 a 3 sin saltos.*en el lugar 2 llegó la réplica 3/);
  await assert.rejects(armarComprobante(mv, replicas(5), VERDE, MOTOR, { semilla: 20261017, replicas: 20 }), /la receta dice 20 réplicas y llegaron 5/);
  await assert.rejects(armarComprobante(mv, [...replicas(3), replicas(3)[1]], VERDE, MOTOR, { semilla: 20261017, replicas: 4 }), /aparece más de una vez/);
});

test('el comprobante no comparte referencias con la entrada (modificar la receta de entrada después no lo cambia)', async () => {
  const entrada = { semilla: 20261017, replicas: 3, esc: ['a', 'b'] };
  const c = await armarComprobante(validadoEjemplo(), replicas(3), VERDE, MOTOR, entrada);
  entrada.esc.push('c');
  assert.deepEqual(c.receta.esc, ['a', 'b']);
});
