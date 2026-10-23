// La suite rápida de la batería con el motor de referencia: V24a–c, D01, M01, M02, R01–R03 y las doradas (corte-1.md §9, P2).
// Corre en unos segundos dentro de npm test. Además: la batería tiene dientes (un motor alterado hace fallar lo que tiene que fallar).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import type { CrearMotor, Motor } from '../../contratos/motor.ts';
import type { Distribucion, Direccion, FuenteAzar } from '../../contratos/azar.ts';
import { crearBateria, leerDoradas } from '../bateria.ts';
import { evaluarEstadistico, replicasDe, type Caso } from '../casos/comun.ts';

const RAPIDAS = ['V24a', 'V24b', 'V24c', 'D01', 'M01', 'M02', 'R01', 'R02', 'R03'];
const bateria = crearBateria(crearMotorReferencia);
const doradas = leerDoradas();
const informe = bateria.correr({ suite: 'rapida', doradas, motor: 'referencia' });

test('la suite rápida corre exactamente V24a–c, D01, M01, M02 y R01–R03', () => {
  assert.deepEqual(informe.resultados.map((r) => r.id).sort(), [...RAPIDAS].sort());
  assert.equal(informe.suite, 'rapida');
});

for (const id of RAPIDAS) {
  test(`${id} pasa con el motor de referencia`, () => {
    const r = informe.resultados.find((x) => x.id === id);
    assert.ok(r, `no hay resultado para ${id}`);
    assert.equal(r.estado, 'pasa', `${id} (${r.nombre}): se esperaba «pasa» y salió «${r.estado}»: ${r.motivo ?? ''}`);
  });
}

test('M01, M02, R01 y R03 recorren todos los casos de la batería (no pasan por vacías)', () => {
  const cortas = bateria.casos.reduce((s, c) => s + c.cortas.length, 0);
  const deterministas = bateria.casos.reduce((s, c) => s + c.cortas.filter((x) => x.determinista).length, 0);
  const n = (id: string) => informe.resultados.find((r) => r.id === id)!.n;
  assert.ok(cortas >= 30, `se esperaban al menos 30 redes cortas y hay ${cortas}`);
  assert.equal(n('R01'), cortas * 5, 'R01: cada red corta con 5 semillas');
  assert.equal(n('R03'), (cortas - deterministas) * 5, 'R03: cada red corta con azar, con 5 semillas');
  assert.ok(n('M01') > 20 * cortas, `M01 comparó solo ${n('M01')} valores`);
  assert.ok(n('M02') >= cortas, `M02 revisó solo ${n('M02')} corridas`);
});

test('doradas: la versión corta de cada caso da la huella guardada en doradas.json', (t) => {
  if (!doradas) { t.skip('no hay verificacion/doradas.json: generarlas con node verificacion/bateria.ts --generar-doradas'); return; }
  assert.equal(informe.doradas.estado, 'pasa', `huellas distintas: ${informe.doradas.distintas.slice(0, 5).join(' | ')}`);
  const cortas = bateria.casos.reduce((s, c) => s + c.cortas.length, 0);
  assert.equal(informe.doradas.comparadas, cortas * 2, 'réplicas 0 y 1 de cada red corta');
});

test('el informe aprueba y no tiene tiempos si no se le pasa reloj (es una función pura de motor y semilla)', () => {
  assert.equal(informe.resumen.aprobada, true);
  assert.equal(informe.resumen.segundos, undefined);
  const a = bateria.correr({ suite: 'rapida', ids: ['V24a', 'R02'] }), b = bateria.correr({ suite: 'rapida', ids: ['V24a', 'R02'] });
  assert.deepEqual(a, b);
});

// ---- Motores alterados: la batería tiene que darse cuenta ----

/** Envuelve el motor de referencia cambiando su fuente de azar. */
function conAzar(cambiar: (az: FuenteAzar) => FuenteAzar): CrearMotor {
  return (o) => {
    const m = crearMotorReferencia(o);
    const azar = cambiar(m.azar);
    return new Proxy(m, { get: (obj, k) => (k === 'azar' ? azar : Reflect.get(obj, k, obj)) }) as Motor;
  };
}

test('un motor que ignora la réplica hace fallar R03 y las doradas', () => {
  const sinReplica: CrearMotor = (o) => crearMotorReferencia({ ...o, replica: 0 });
  const inf = crearBateria(sinReplica).correr({ suite: 'rapida', ids: ['R03'], doradas });
  assert.equal(inf.resultados.find((r) => r.id === 'R03')!.estado, 'falla');
  if (doradas) assert.equal(inf.doradas.estado, 'falla');
  assert.equal(inf.resumen.aprobada, false);
});

test('un motor con la exponencial corrida 5% hace fallar V25 (rendimiento de la línea exponencial)', () => {
  const corrido = conAzar((az) => ({ ...az, sortear: (d: Distribucion, dir: Direccion) => (d.tipo === 'exponencial' ? 1.05 : 1) * az.sortear(d, dir) }));
  const inf = crearBateria(corrido).correr({ suite: 'completa', ids: ['V25'], reintentar: false });
  const r = inf.resultados.find((x) => x.id === 'V25')!;
  assert.equal(r.estado, 'falla', `V25 con la exponencial corrida: ${r.simulado}`);
  // el umbral es t(0,9995; n − 1) (hallazgo H4): con las réplicas de V25 es 3,3 y pico
  assert.match(r.motivo ?? '', /\|z\| = .* > 3,\d\d \(t\(0,9995; \d+\)\)/);
});

/** Un caso falso cuyo resultado depende de la semilla y del factor de réplicas (para probar la política de reintento). */
function casoFalso(pasaSi: (semilla: number, replicas: number) => boolean): Caso {
  const d = { id: 'X01', nombre: 'Prueba falsa de la política de reintento', familia: 'V' as const, tipo: 'exigible' as const, esperado: 1,
    criterio: { tipo: 'estadistico' as const, probabilidad: false } };
  return {
    id: 'x-falso', titulo: 'Caso falso', archivo: 'casos/comun.ts', suite: 'rapida', replicas: 20, horizonte: 0, calentamiento: 0, cortas: [], pruebas: [d],
    correr: (ctx) => {
      const n = replicasDe(ctx, 20);
      const caso = casoFalso(pasaSi);
      return [evaluarEstadistico(caso, d, ctx, Array.from({ length: n }, (_, i) => (pasaSi(ctx.semilla, n) ? 1 : 1.5) + (i % 2 ? 0.01 : -0.01)))];
    },
  };
}

test('reintento (§8): una falla estocástica se re-corre con otra semilla y 4 veces más réplicas; pasa si la segunda vez pasa', () => {
  const caso = casoFalso((_, n) => n === 80);
  const inf = crearBateria(crearMotorReferencia, { casosExtra: [caso] }).correr({ suite: 'rapida', ids: ['X01'], semilla: 7 });
  const r = inf.resultados[0];
  assert.equal(r.estado, 'pasa');
  assert.ok(r.reintento, 'se anota el reintento');
  assert.equal(r.reintento.replicas, 80);
  assert.notEqual(r.reintento.semilla, 7);
  assert.equal(r.reintento.primerIntento.simulado, 1.5);
  assert.equal(inf.resumen.reintentos, 1);
});

test('reintento: si vuelve a fallar es error del motor; sin reintento se informa la primera falla', () => {
  const siempre = crearBateria(crearMotorReferencia, { casosExtra: [casoFalso(() => false)] });
  const r = siempre.correr({ suite: 'rapida', ids: ['X01'] }).resultados[0];
  assert.equal(r.estado, 'falla');
  assert.ok(r.reintento);
  const sin = siempre.correr({ suite: 'rapida', ids: ['X01'], reintentar: false }).resultados[0];
  assert.equal(sin.estado, 'falla');
  assert.equal(sin.reintento, undefined);
});

test('un motor que desordena eventos del mismo instante cambia las doradas', (t) => {
  if (!doradas) { t.skip('sin doradas.json'); return; }
  // Agenda todo con 1 ms de más: el orden se conserva pero los tiempos no.
  const corrido: CrearMotor = (o) => {
    const m = crearMotorReferencia(o);
    const agendar = m.agendar.bind(m);
    return new Proxy(m, { get: (obj, k) => (k === 'agendar' ? (tt: number, ...r: [number, number, number, (0 | 1 | 2)?, number?]) => agendar(tt + 1, ...r) : Reflect.get(obj, k, obj)) }) as Motor;
  };
  const c = crearBateria(corrido).compararDoradas(doradas);
  assert.ok(c.distintas.length > 0, 'un cambio de semántica del motor tiene que verse en las doradas');
});
