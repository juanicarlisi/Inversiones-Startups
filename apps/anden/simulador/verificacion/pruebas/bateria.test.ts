// Estructura de la batería Andén Verificado: ids, dueños, diseño mínimo (réplicas y horizontes de validacion.js), informe y CLI.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import { compilarRed } from '../flujo/red.ts';
import { crearBateria, DEBEN_FALLAR_P2, EXIGIBLES_DEL_CORTE, EXIGIBLES_P2, fechaDeMs, INFORMATIVAS_P2, principal, type InformeBateria } from '../bateria.ts';
import { paginaInforme, escapar } from '../pagina.ts';
import type { Caso } from '../casos/comun.ts';

const bateria = crearBateria(crearMotorReferencia);
const declaradas = bateria.casos.flatMap((c) => c.pruebas.map((p) => ({ ...p, caso: c })));

test('las exigibles de P2 son exactamente las 59 de la tabla de §8 (V 50, C 3, D01, M01, M02, R01–R03)', () => {
  const exig = declaradas.filter((p) => p.tipo === 'exigible').map((p) => p.id).sort();
  assert.deepEqual(exig, [...EXIGIBLES_P2].sort());
  assert.equal(EXIGIBLES_P2.length, 59);
  assert.equal(EXIGIBLES_P2.filter((id) => id.startsWith('V')).length, 50);
  assert.equal(EXIGIBLES_DEL_CORTE, 85);
});

test('informativas (V12a–d, C02) y demostraciones que tienen que fallar (S01, S02)', () => {
  assert.deepEqual(declaradas.filter((p) => p.tipo === 'informativa').map((p) => p.id).sort(), [...INFORMATIVAS_P2].sort());
  assert.deepEqual(declaradas.filter((p) => p.tipo === 'debe-fallar').map((p) => p.id).sort(), [...DEBEN_FALLAR_P2].sort());
});

test('ids únicos, nombres en español y cada prueba con esperado y criterio', () => {
  const ids = declaradas.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, 'ids repetidos');
  for (const p of declaradas) {
    assert.ok(p.nombre.length > 10 && !/undefined|NaN/.test(p.nombre), `${p.id}: nombre «${p.nombre}»`);
    assert.ok(p.esperado !== undefined && p.esperado !== null, `${p.id} sin esperado`);
    if (typeof p.esperado === 'number') assert.ok(Number.isFinite(p.esperado), `${p.id}: esperado ${p.esperado}`);
    assert.ok(p.criterio, `${p.id} sin criterio`);
  }
  for (const c of bateria.casos) assert.ok(existsSync(new URL(`../${c.archivo}`, import.meta.url)), `${c.id}: no existe ${c.archivo}`);
});

test('cada red de la batería y cada versión corta pasan la validación de la red', () => {
  for (const c of bateria.casos) for (const r of c.cortas) assert.doesNotThrow(() => compilarRed(r.config), `${c.id}/${r.etiqueta}`);
});

/** Diseño mínimo de validacion.js (réplicas y unidades medidas después del calentamiento); §8: «como mínimo, los de validacion.js». */
const MINIMOS: Record<string, { replicas: number; medido: number }> = {
  'v-mm1-a': { replicas: 20, medido: 200_000 }, 'v-mm1-b': { replicas: 20, medido: 200_000 }, 'v-mm1-c': { replicas: 20, medido: 400_000 },
  'v-mmc-a': { replicas: 20, medido: 400_000 / 2.4 }, 'v-mmc-b': { replicas: 20, medido: 400_000 / 4.5 }, 'v-mmc-c': { replicas: 20, medido: 400_000 / 45 },
  'v-md1': { replicas: 20, medido: 200_000 }, 'v-mln1': { replicas: 20, medido: 400_000 }, 'v-dm1': { replicas: 40, medido: 400_000 },
  'v-mm25': { replicas: 20, medido: 100_000 }, 'v-erlang-b': { replicas: 20, medido: 100_000 }, 'v-erlang-b-ln': { replicas: 20, medido: 200_000 },
  'v-prio-sin': { replicas: 20, medido: 200_000 }, 'v-prio-con': { replicas: 20, medido: 200_000 }, 'v-jackson': { replicas: 20, medido: 100_000 },
  'v-penny-det': { replicas: 1, medido: 10_000 }, 'v-linea-exp': { replicas: 20, medido: 100_000 }, 'v-red-mva': { replicas: 20, medido: 100_000 },
  'v-mtinf': { replicas: 400, medido: 66 }, 'v-reparador': { replicas: 20, medido: 100_000 },
  'c-law-oficina': { replicas: 2000, medido: 480 }, 'c-law-fabrica': { replicas: 400, medido: 0 },
  'v12-aproximaciones': { replicas: 20, medido: 200_000 }, 's-cobertura': { replicas: 500, medido: 10_000 },
};

test('réplicas y horizontes: como mínimo los de validacion.js', () => {
  for (const [id, min] of Object.entries(MINIMOS)) {
    const c = bateria.casos.find((x) => x.id === id);
    assert.ok(c, `falta el caso ${id}`);
    assert.ok(c.replicas >= min.replicas, `${id}: ${c.replicas} réplicas y el mínimo es ${min.replicas}`);
    assert.ok(c.horizonte - c.calentamiento >= min.medido - 1e-9, `${id}: mide ${c.horizonte - c.calentamiento} unidades y el mínimo es ${min.medido}`);
  }
});

test('las versiones cortas son cortas: ninguna pasa de 20.000 eventos', () => {
  for (const d of bateria.generarDoradas().corridas) assert.ok(d.eventos <= 20_000, `${d.caso}/${d.etiqueta}: ${d.eventos} eventos`);
});

test('casosExtra: la integración puede sumar casos de otros paquetes; un id repetido se rechaza', () => {
  const extra: Caso = {
    id: 'k-extra', titulo: 'Caso de otro paquete', archivo: 'casos/comun.ts', suite: 'rapida', replicas: 1, horizonte: 0, calentamiento: 0, cortas: [],
    pruebas: [{ id: 'K99', nombre: 'Prueba sumada por la integración', familia: 'R', tipo: 'exigible', esperado: 'ok', criterio: { tipo: 'identico' } }],
    correr: (ctx) => [{ id: 'K99', nombre: 'Prueba sumada por la integración', familia: 'R', suite: 'rapida', tipo: 'exigible', dueno: 'P2', caso: 'k-extra',
      criterio: 'idénticos', esperado: 'ok', simulado: 'ok', semiancho: null, semianchoRelativo: null, z: null, errorRelativo: null, n: 1, replicas: 1,
      semilla: ctx.semilla, estado: 'pasa' }],
  };
  const inf = crearBateria(crearMotorReferencia, { casosExtra: [extra] }).correr({ suite: 'rapida', ids: ['K99'] });
  assert.deepEqual(inf.resultados.map((r) => r.id), ['K99']);
  const repetido = { ...extra, pruebas: [{ ...extra.pruebas[0], id: 'V01a' }] };
  assert.throws(() => crearBateria(crearMotorReferencia, { casosExtra: [repetido] }), /el id de prueba V01a está repetido \(caso k-extra\)/);
});

function informeDePrueba(nombre: string): InformeBateria {
  return {
    version: 1, bateria: 'Andén Verificado', suite: 'rapida', semilla: 1, motor: 'm <b>', fecha: '2026-10-18',
    resumen: { exigiblesDelCorte: 85, exigiblesP2: 59, exigiblesCorridas: 1, pasaron: 0, fallaron: 1, informativas: 0, debeFallar: 0, debeFallarOk: 0, reintentos: 0, aprobada: false },
    resultados: [{ id: 'X1', nombre, familia: 'V', suite: 'rapida', tipo: 'exigible', dueno: 'P2', caso: 'c', criterio: 'idénticos', esperado: { min: 1, max: 2 },
      simulado: Number.NaN, semiancho: null, semianchoRelativo: null, z: null, errorRelativo: -0.0123, n: 3, replicas: 3, semilla: 1, estado: 'falla', motivo: '<img src=x>' }],
    casos: [], doradas: { estado: 'no-pedidas', comparadas: 0, distintas: [] }, conservacion: { corridas: 0, violaciones: 0 },
  };
}

test('informe.html: todo texto escapado, en español y sin scripts', () => {
  const html = paginaInforme(informeDePrueba('<script>alert(1)</script> Wq'));
  assert.ok(!html.includes('<script>'), 'un nombre con <script> tiene que quedar como texto');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt; Wq'));
  assert.ok(html.includes('&lt;img src=x&gt;') && !html.includes('<img'));
  assert.ok(html.includes('lang="es"') && html.includes('No aprobada'));
  assert.ok(html.includes('[1; 2]') && html.includes('−1,23%'), 'intervalos y porcentajes con formato es-AR');
  assert.ok(html.includes('sin dato'), 'NaN se muestra como «sin dato»');
  assert.equal(escapar(`a&b"c'`), 'a&amp;b&quot;c&#39;');
});

test('fechaDeMs: fecha de Buenos Aires (UTC−3) sin usar el reloj', () => {
  assert.equal(fechaDeMs(0), '1969-12-31');
  assert.equal(fechaDeMs(1_760_745_600_000), '2025-10-17'); // 2025-10-18 00:00 UTC
  assert.equal(fechaDeMs(1_760_756_400_000), '2025-10-18'); // 2025-10-18 03:00 UTC
  assert.equal(fechaDeMs(951_793_200_000), '2000-02-29');   // año bisiesto
});

test('la línea de comandos rechaza argumentos desconocidos diciendo cuáles acepta', async () => {
  await assert.rejects(() => principal(['--rapidísima']), /argumento desconocido --rapidísima; se esperaba --rapida, --completa/);
  await assert.rejects(() => principal(['--semilla=-3']), /--semilla: se esperaba un entero entre 0 y 4294967295 y llegó -3/);
  const sinMotor = fileURLToPath(new URL('../../contratos/azar.ts', import.meta.url));
  await assert.rejects(() => principal([`--motor=${sinMotor}`]), /se esperaba un módulo que exporte la función crearMotor y exporta CONSUMO/);
});

test('crearBateria rechaza algo que no es un CrearMotor', () => {
  assert.throws(() => crearBateria(42 as never), /se esperaba una función CrearMotor y llegó number/);
});
