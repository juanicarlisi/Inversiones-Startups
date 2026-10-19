// integracion/pruebas/trabajador.test.ts · Andén simulador, corte 1 · Integración (corte-1.md §10.2): el Worker de simulación.
//  · la matemática congelada: Math.random y las trascendentes lanzan; sin y cos lanzan solo mientras corre el motor; las exactas andan;
//  · el protocolo (sonda, correr, cancelar, errores) con un simulador falso;
//  · la traza viaja TRANSFERIDA (sin copiar) y sin buffers repetidos;
//  · en un hilo de verdad (worker_threads, como un Web Worker): matemática congelada en ese hilo y la misma huella que en este.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import type { Simulador } from '../../contratos/experimentos.ts';
import type { MensajeDelTrabajador } from '../../contratos/mensajes-worker.ts';
import type { ResultadoReplica } from '../../contratos/resultados.ts';
import type { Traza } from '../../contratos/traza.ts';
import { validadoSinChequeos } from '../../contratos/referencias.ts';
import { ensamblar, VERSION_MOTOR } from '../ensamblar.ts';
import {
  buffersDeTraza, congelarMatematica, crearTrabajador, estaCongelada, motorCorriendo, motorVigilado, PROHIBIDAS_EN_EL_MOTOR, PROHIBIDAS_SIEMPRE, vigilar,
} from '../trabajador.ts';
import { HILO } from './hilos.ts';

const lanza = (f: () => unknown) => { try { f(); return false; } catch { return true; } };

test('trabajador · congelar: Math.random y las trascendentes lanzan, sin y cos solo dentro del motor, las exactas siguen', () => {
  // Una copia del Math de este hilo: congelar el de verdad rompería las demás pruebas del proceso.
  const M = Object.create(Math) as Math;
  for (const k of Object.getOwnPropertyNames(Math)) Object.defineProperty(M, k, Object.getOwnPropertyDescriptor(Math, k)!);
  assert.equal(estaCongelada(M), false);
  congelarMatematica(M);
  congelarMatematica(M);                                         // idempotente
  assert.equal(estaCongelada(M), true);
  const F = M as unknown as Record<string, (...a: number[]) => number>;
  for (const n of PROHIBIDAS_SIEMPRE) assert.ok(lanza(() => F[n](0.5, 0.5)), `Math.${n} tenía que lanzar en el Worker`);
  assert.throws(() => M.log(2), /m\.mat|matemática determinista/, 'el error tiene que decir qué usar en su lugar');
  for (const n of PROHIBIDAS_EN_EL_MOTOR) {
    assert.equal(F[n](0), n === 'cos' ? 1 : 0, `Math.${n} fuera del motor tiene que andar (la geometría de la traza la usa para dibujar)`);
    assert.ok(vigilar(() => lanza(() => F[n](0))), `Math.${n} dentro del motor tenía que lanzar`);
  }
  assert.equal(M.sqrt(9) + M.floor(2.5) + M.round(1.5) + M.imul(3, 4) + M.abs(-1), 3 + 2 + 2 + 12 + 1, 'las funciones exactas por IEEE 754 siguen');
  assert.throws(() => Object.defineProperty(M, 'log', { value: Math.log }), TypeError, 'no se puede descongelar');
});

test('trabajador · motorVigilado: correr, correrHasta y finalizar corren vigilados y la huella no cambia', async () => {
  const E = ensamblar();
  const c = await E.compilar(E.plantillas['hub-chico@1.0.0']);
  assert.ok(c.ok);
  if (!c.ok) return;
  const vigilado = ensamblar(motorVigilado(E.crearMotor));
  const a = E.simularNoche(c.mv, 9, 1, { traza: 'no' }), b = vigilado.simularNoche(c.mv, 9, 1, { traza: 'no' });
  assert.equal(b.resultado.huella, a.resultado.huella, 'vigilar el motor no puede cambiar la corrida');
  // en un motor falso: correr, correrHasta y finalizar ven el motor «corriendo»; antes y después, no
  const visto: string[] = [];
  const falso = () => ({
    correr: () => { visto.push(`correr:${motorCorriendo()}`); return { estado: 'sin-eventos', ahora: 0, eventos: 0, huella: '' }; },
    correrHasta: () => { visto.push(`correrHasta:${motorCorriendo()}`); return { estado: 'pausa', ahora: 0, eventos: 0, huella: '' }; },
    finalizar: () => { visto.push(`finalizar:${motorCorriendo()}`); },
  });
  const m = motorVigilado(falso as never)({} as never);
  m.correrHasta(1); m.correr(); m.finalizar();
  assert.deepEqual(visto, ['correrHasta:true', 'correr:true', 'finalizar:true']);
  assert.equal(motorCorriendo(), false, 'al salir del motor la marca vuelve a cero');
});

// ------------------------------------------------------------------------------------------------ protocolo con un simulador falso

function trazaFalsa(n: number): Traza {
  const compartido = new ArrayBuffer(8 * n);
  return {
    version: 1, modelo: 'x', semilla: 1, replica: 0, tickLazo: 300, bandejas: 10, inicio: 0, fin: 1, corte: 1,
    // t0 y t1 son dos vistas del MISMO buffer: transferirlo dos veces sería un error del navegador
    tramos: { n, e: new Int32Array(n), k: new Uint8Array(n), r: new Int32Array(n), a: new Int32Array(n), t0: new Float64Array(compartido),
      t1: new Float64Array(compartido), c: new Uint8Array(n), q: new Int32Array(n) },
    momentos: { n: 0, t: new Float64Array(0), tipo: new Uint8Array(0), r: new Int32Array(0), v: new Float64Array(0) },
    paquetes: { n: 0, camion: new Int32Array(0), indice: new Int32Array(0), ruta: new Int16Array(0), clase: new Uint8Array(0),
      creado: new Float64Array(0), listo: new Float64Array(0), vueltas: new Uint8Array(0) },
    catalogo: { personas: [], camiones: [], rutas: [], rampas: [], puestos: [], andenes: [] },
    geometria: {} as Traza['geometria'], huella: 'h',
  };
}
const resultado = (replica: number): ResultadoReplica => ({ modelo: 'x', semilla: 1, replica, huella: `h${replica}`, kpi: {} as ResultadoReplica['kpi'],
  porRecurso: { rampaRecibidos: [], rampaVueltas: [], rampaMinutosLlena: [], personaOcupadaPct: [], puestoInducidos: [] },
  series: { filaInduccionMax: [], clasificados: [] }, alertas: [], eventos: 1 });

function armar(sim: Simulador) {
  const salida: { m: MensajeDelTrabajador; transferir: ArrayBuffer[] }[] = [];
  const atender = crearTrabajador({ simular: sim, version: '9.9.9', enviar: (m, transferir) => salida.push({ m, transferir }),
    ceder: () => new Promise<void>((r) => setImmediate(r)) });
  const esperar = async (cond: () => boolean) => { for (let i = 0; i < 1000 && !cond(); i++) await new Promise((r) => setImmediate(r)); };
  return { salida, atender, esperar };
}
const mv = validadoSinChequeos({} as never);

test('trabajador · protocolo: sonda, correr en orden con la traza transferida, fin con las completadas', async () => {
  const { salida, atender, esperar } = armar((_mv, _s, r, o) => (o.traza === 'completa' ? { resultado: resultado(r), traza: trazaFalsa(4) } : { resultado: resultado(r) }));
  atender({ tipo: 'sonda' });
  atender({ tipo: 'correr', id: 'a', mv, semilla: 1, desde: 2, hasta: 5, traza: 'completa' });
  atender({ tipo: 'correr', id: 'b', mv, semilla: 1, desde: 0, hasta: 2, traza: 'no' });
  await esperar(() => salida.filter((x) => x.m.tipo === 'fin').length === 2);
  const tipos = salida.map((x) => `${x.m.tipo}${'id' in x.m ? `:${x.m.id}` : ''}${x.m.tipo === 'resultado' ? `:${x.m.resultado.replica}` : ''}`);
  assert.deepEqual(tipos, ['listo', 'resultado:a:2', 'resultado:a:3', 'resultado:a:4', 'fin:a', 'resultado:b:0', 'resultado:b:1', 'fin:b']);
  assert.deepEqual(salida[0].m, { tipo: 'listo', motor: '9.9.9' });
  const fin = salida.find((x) => x.m.tipo === 'fin' && x.m.id === 'a')!.m as Extract<MensajeDelTrabajador, { tipo: 'fin' }>;
  assert.equal(fin.completadas, 3);
  const conTraza = salida[1];
  assert.equal(conTraza.transferir.length, 18, 'se transfieren los buffers de las 19 columnas, sin repetir el que comparten t0 y t1');
  assert.equal(new Set(conTraza.transferir).size, conTraza.transferir.length, 'ningún buffer repetido en la lista de transferencia');
  assert.equal(salida[5].transferir.length, 0, 'sin traza no se transfiere nada');
});

test('trabajador · cancelar corta antes de la réplica siguiente; un error del simulador se contesta con su mensaje', async () => {
  let corridas = 0;
  const { salida, atender, esperar } = armar((_mv, s, r) => { corridas++; if (s === 2 && r === 7) throw new Error('falla sembrada'); return { resultado: resultado(r) }; });
  atender({ tipo: 'correr', id: 'largo', mv, semilla: 1, desde: 0, hasta: 1000, traza: 'no' });
  atender({ tipo: 'correr', id: 'encolado', mv, semilla: 1, desde: 0, hasta: 3, traza: 'no' });
  atender({ tipo: 'cancelar', id: 'encolado' });
  await esperar(() => salida.length >= 3);
  atender({ tipo: 'cancelar', id: 'largo' });
  await esperar(() => salida.some((x) => x.m.tipo === 'fin' && x.m.id === 'largo'));
  assert.ok(corridas < 20, `cancelar tenía que cortar enseguida y corrieron ${corridas} réplicas`);
  assert.deepEqual(salida.filter((x) => x.m.tipo === 'fin').map((x) => x.m.tipo === 'fin' ? x.m.id : ''), ['encolado', 'largo']);
  atender({ tipo: 'correr', id: 'falla', mv, semilla: 2, desde: 5, hasta: 9, traza: 'no' });
  await esperar(() => salida.some((x) => x.m.tipo === 'error'));
  const e = salida.find((x) => x.m.tipo === 'error')!.m as Extract<MensajeDelTrabajador, { tipo: 'error' }>;
  assert.equal(e.id, 'falla');
  assert.match(e.mensaje, /réplica 7: falla sembrada/);
  atender({ tipo: 'correr', id: 'malo', mv, semilla: 1, desde: 3, hasta: 1, traza: 'no' });
  assert.match((salida.at(-1)!.m as { mensaje: string }).mensaje, /rango de réplicas inválido/);
});

test('trabajador · buffersDeTraza de una noche real del hub: las 19 columnas, sin repetir', async () => {
  const E = ensamblar();
  const c = await E.compilar(E.plantillas['hub-chico@1.0.0']);
  assert.ok(c.ok);
  if (!c.ok) return;
  const t = E.simularNoche(c.mv, 1, 0, { traza: 'completa' }).traza!;
  const b = buffersDeTraza(t);
  assert.equal(b.length, 8 + 4 + 7, 'tramos (8), momentos (4) y paquetes (7)');
  assert.equal(new Set(b).size, b.length);
});

// ------------------------------------------------------------------------------------------------ en un hilo de verdad

test('trabajador · en un hilo (worker_threads): matemática congelada en ese hilo y la misma huella que en este', async () => {
  const E = ensamblar();
  const c = await E.compilar(E.plantillas['hub-chico@1.0.0']);
  assert.ok(c.ok);
  if (!c.ok) return;
  const hilo = new Worker(HILO);
  try {
    const mensajes: unknown[] = [];
    const esperas: { cond: (m: never) => boolean; resolver: (m: never) => void }[] = [];
    hilo.on('message', (m) => {
      mensajes.push(m);
      for (const w of [...esperas]) if (w.cond(m as never)) { esperas.splice(esperas.indexOf(w), 1); w.resolver(m as never); }
    });
    let caido: Error | null = null;
    hilo.on('error', (e) => { caido = e; });
    const llego = (cond: (m: never) => boolean) => new Promise<never>((resolver, rechazar) => {
      const t = setTimeout(() => rechazar(caido ?? new Error(`el hilo no contestó; llegaron: ${JSON.stringify(mensajes).slice(0, 300)}`)), 30_000);
      esperas.push({ cond, resolver: (m) => { clearTimeout(t); resolver(m); } });
    });
    const congelado = llego((m: { tipo: string }) => m.tipo === 'congelado');
    hilo.postMessage({ tipo: 'probar-congelado' });
    const k = await congelado as unknown as { siempre: string[]; afuera: string[]; adentro: string[]; exactas: string[] };
    assert.deepEqual(k.siempre, [...PROHIBIDAS_SIEMPRE], 'en el hilo, todas las prohibidas tienen que lanzar');
    assert.deepEqual(k.afuera, [], 'sin y cos fuera del motor andan');
    assert.deepEqual(k.adentro, [...PROHIBIDAS_EN_EL_MOTOR], 'sin y cos dentro del motor lanzan');
    assert.equal(k.exactas.length, 5);
    const listo = llego((m: { tipo: string }) => m.tipo === 'listo');
    hilo.postMessage({ tipo: 'sonda' });
    assert.deepEqual(await listo, { tipo: 'listo', motor: VERSION_MOTOR });
    const fin = llego((m: { tipo: string }) => m.tipo === 'fin' || m.tipo === 'error');
    hilo.postMessage({ tipo: 'correr', id: 'n', mv: c.mv, semilla: 20261017, desde: 0, hasta: 2, traza: 'completa' });
    const f = await fin as unknown as MensajeDelTrabajador;
    assert.equal(f.tipo, 'fin', `el hilo tenía que terminar sin error y contestó ${JSON.stringify(f).slice(0, 300)}`);
    const rs = mensajes.filter((m) => (m as { tipo: string }).tipo === 'resultado') as Extract<MensajeDelTrabajador, { tipo: 'resultado' }>[];
    assert.equal(rs.length, 2);
    for (const r of rs) {
      const aca = E.simularNoche(c.mv, 20261017, r.resultado.replica, { traza: 'completa' });
      assert.equal(r.resultado.huella, aca.resultado.huella, `réplica ${r.resultado.replica}: el hilo con la matemática congelada da otra huella`);
      assert.equal(r.traza!.tramos.n, aca.traza!.tramos.n, 'la traza llega entera');
      assert.ok(r.traza!.tramos.t0 instanceof Float64Array && r.traza!.tramos.t0.length === r.traza!.tramos.n, 'las columnas llegan como arreglos tipados');
      assert.ok(typeof r.resultado.msCalculo === 'undefined' || r.resultado.msCalculo >= 0);
    }
  } finally {
    await hilo.terminate();
  }
});
