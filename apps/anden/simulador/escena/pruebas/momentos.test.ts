// escena/pruebas/momentos.test.ts · P6. Marcas de la línea de tiempo (DetectarMomentos): los momentos del hub más los derivados (primer
// paquete que pierde el corte, fila máxima), ordenados, con importancia, clave i18n existente y todas sus variables.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { trazaDeMaqueta } from '../../contratos/fixtures/traza-maqueta.ts';
import { Causa, TipoMomento, TipoTramo } from '../../contratos/traza.ts';
import type { MomentoEscena } from '../../contratos/vistas.ts';
import { DEF_MOMENTO, MomentoDerivado, claveMomento, detectarMomentos, filaMaxima } from '../momentos.ts';
import { narrar } from '../narracion.ts';
import { crearReproductor } from '../reproductor.ts';
import { PERSONAS, trazaSintetica } from './ayudas.ts';

const ES: Record<string, string> = JSON.parse(readFileSync(new URL('../textos.es.json', import.meta.url), 'utf8'));
const EN: Record<string, string> = JSON.parse(readFileSync(new URL('../textos.en.json', import.meta.url), 'utf8'));
const variables = (texto: string) => [...texto.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

function noche() {
  return trazaSintetica((s) => {
    // momentos escritos fuera de orden (el hub los escribe en orden; el detector no lo supone)
    s.momento(1_800_000, TipoMomento.CORTE, 0, 0);
    s.momento(50_000, TipoMomento.RAMPA_LLENA, 1, 3);
    s.momento(0, TipoMomento.CAMION_LLEGA, 0, -3);
    s.momento(50_000, TipoMomento.LAZO_PARA, 0, 0);
    s.momento(0, TipoMomento.AUSENCIA, PERSONAS.R2, 0);
    s.momento(0, TipoMomento.REEMPLAZO, PERSONAS.T1, PERSONAS.R2);
    s.momento(120_000, TipoMomento.JAULA_CERRADA, 2, 0);
    // fila: tres paquetes a la vez entre 3.000 y 5.000 ms (el máximo); a las 5.000 sale uno y entra otro
    s.tramo(0, TipoTramo.ACUMULACION, 0, 0, 1000, 5000, Causa.FILA);
    s.tramo(1, TipoTramo.ACUMULACION, 0, 1, 2000, 6000, Causa.FILA);
    s.tramo(2, TipoTramo.ACUMULACION, 0, 2, 3000, 7000, Causa.FILA);
    s.tramo(3, TipoTramo.ACUMULACION, 0, 3, 5000, 8000, Causa.FILA);
    s.paquete(0, { creado: 0, listo: 100_000 });
    s.paquete(1, { camion: 1, creado: 20_000, listo: 2_000_000, ruta: 1 });
    s.paquete(2, { camion: 2, creado: 10_000, listo: -1, ruta: 2 });
    s.paquete(3, { creado: 0, listo: 1_800_000 });
  });
}

test('momentos ordenados por instante y, en el mismo instante, por importancia (de mayor a menor)', () => {
  const ms = detectarMomentos(noche());
  for (let i = 1; i < ms.length; i++) {
    const a = ms[i - 1], b = ms[i];
    assert.ok(a.t < b.t || (a.t === b.t && a.importancia >= b.importancia), `fuera de orden: ${a.clave} (${a.t}, ${a.importancia}) antes de ${b.clave} (${b.t}, ${b.importancia})`);
  }
  assert.deepEqual(ms.filter((m) => m.t === 0).map((m) => m.clave), ['escena.momento.ausencia', 'escena.momento.reemplazo', 'escena.momento.camionLlega']);
  assert.deepEqual(ms.filter((m) => m.t === 50_000).map((m) => m.clave), ['escena.momento.lazoPara', 'escena.momento.rampaLlena']);
});

test('variables de cada momento: ids del catálogo, minutos y horas', () => {
  const ms = detectarMomentos(noche());
  const de = (clave: string) => { const m = ms.find((x) => x.clave === clave); assert.ok(m, `falta el momento ${clave}`); return m; };
  assert.deepEqual(de('escena.momento.camionLlega').vars, { camion: 'T01', minutos: -3 });
  assert.deepEqual(de('escena.momento.rampaLlena').vars, { rampa: 'R02', ruta: 'Ruta 02', paquetes: 3 });
  assert.deepEqual(de('escena.momento.lazoPara').vars, { numero: 1 });
  assert.deepEqual(de('escena.momento.reemplazo').vars, { reten: 'P-T1', persona: 'P-R2' });
  assert.deepEqual(de('escena.momento.jaulaCerrada').vars, { rampa: 'R03', jaula: 1 });
  assert.deepEqual(de('escena.momento.corte').vars, { hora: '00:30', pendientes: 2 }, 'pendientes al corte: el que llega a las 00:33 y el que no termina');
});

test('derivado: el primer paquete (por hora de creación) que pierde el corte, con importancia máxima', () => {
  const m = detectarMomentos(noche()).find((x) => x.tipo === MomentoDerivado.PRIMER_ATRASADO);
  assert.ok(m);
  assert.equal(m.t, 10_000, 'nace a los 10 s (el paquete 2; el 1 nace después)');
  assert.equal(m.r, 2);
  assert.equal(m.importancia, 5);
  assert.deepEqual(m.vars, { camion: 'T03', ruta: 'Ruta 03', pendientes: 2 });
});

test('derivado: la fila máxima, en el primer instante en que llega al máximo', () => {
  const tr = noche();
  assert.deepEqual(filaMaxima(tr), { t: 3000, paquetes: 3 });
  const m = detectarMomentos(tr).find((x) => x.tipo === MomentoDerivado.FILA_MAXIMA);
  assert.ok(m);
  assert.deepEqual([m.t, m.vars.paquetes, m.vars.minutos], [3000, 3, 0]);
  assert.equal(filaMaxima(trazaSintetica(() => {})), null, 'sin fila no hay máximo');
  assert.equal(detectarMomentos(trazaSintetica(() => {})).length, 0, 'una noche vacía no tiene marcas');
});

test('un paquete sin hora de creación cuenta como pendiente pero no marca el primer atrasado', () => {
  const tr = trazaSintetica((s) => {
    s.paquete(0, { creado: -1, listo: -1 });
    s.paquete(1, { creado: 50_000, listo: 2_000_000 });
    s.momento(1_800_000, TipoMomento.CORTE, 0, 0);
  });
  const ms = detectarMomentos(tr);
  assert.equal(ms.find((x) => x.tipo === MomentoDerivado.PRIMER_ATRASADO)?.t, 50_000);
  assert.equal(ms.find((x) => x.tipo === TipoMomento.CORTE)?.vars.pendientes, 2);
});

test('cada clave existe en español y en inglés, y cada variable del texto viene en vars', () => {
  const todos: MomentoEscena[] = [...detectarMomentos(noche()), ...detectarMomentos(trazaDeMaqueta(2))];
  // y un momento de cada tipo conocido
  const conTodo = trazaSintetica((s) => {
    for (const tipo of Object.keys(DEF_MOMENTO).map(Number).filter((x) => x < 100)) s.momento(tipo * 1000, tipo as TipoMomento, 0, 1);
  });
  todos.push(...detectarMomentos(conTodo));
  for (const m of todos) {
    assert.ok(ES[m.clave] && EN[m.clave], `falta la clave ${m.clave} en textos.es.json o textos.en.json`);
    for (const v of variables(ES[m.clave])) assert.ok(v in m.vars, `${m.clave}: el texto usa {${v}} y vars trae ${JSON.stringify(m.vars)}`);
  }
  assert.equal(claveMomento(99), 'escena.momento.otro', 'un tipo desconocido no rompe: va como «momento de la noche»');
});

test('la maqueta (sin momentos escritos) tiene sus dos derivados: fila máxima y primer atrasado (si lo hay)', () => {
  const tr = trazaDeMaqueta(2), ms = detectarMomentos(tr);
  assert.ok(ms.some((m) => m.tipo === MomentoDerivado.FILA_MAXIMA));
  const tarde = Array.from(tr.paquetes.listo).some((l, e) => tr.paquetes.creado[e] >= 0 && (l < 0 || l > tr.corte));
  assert.equal(ms.some((m) => m.tipo === MomentoDerivado.PRIMER_ATRASADO), tarde);
});

test('narración para la región aria-live: hora, paquetes a la vista, fila y rampas llenas; o el lazo detenido', () => {
  const B = 79_200_000; // 22:00
  const tr = trazaSintetica((s) => {
    s.tramo(-1, TipoTramo.LAZO_MARCHA, 0, 0, B, B + 60_000);
    s.tramo(-1, TipoTramo.LAZO_DETENIDO, 0, 200, B + 60_000, B + 120_000, Causa.FALLA);
    s.tramo(-1, TipoTramo.LAZO_MARCHA, 0, 200, B + 120_000, B + 3_600_000);
    s.tramo(0, TipoTramo.ACUMULACION, 0, 0, B, B + 200_000, Causa.FILA);
    for (let i = 1; i <= 3; i++) s.tramo(i, TipoTramo.RAMPA, 0, i - 1, B, B + 200_000);
    for (let i = 0; i <= 3; i++) s.paquete(i, { creado: B, listo: B + 300_000 });
  }, { inicio: B, fin: B + 3_600_000, corte: B + 1_800_000 });
  const rep = crearReproductor(tr);
  const a = narrar(rep, B + 30_000);
  assert.equal(a.clave, 'escena.narracion.instante');
  assert.deepEqual(a.vars, { hora: '22:00', paquetes: 4, fila: 1, llenas: 1 });
  const b = narrar(rep, B + 90_000);
  assert.equal(b.clave, 'escena.narracion.lazoDetenido');
  assert.deepEqual(b.vars, { hora: '22:01', paquetes: 4 });
  for (const n of [a, b]) for (const v of variables(ES[n.clave])) assert.ok(v in n.vars, `${n.clave}: falta {${v}}`);
});
