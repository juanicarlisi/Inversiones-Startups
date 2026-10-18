// Motor (corte-1.md §6.1): orden (t, fase, prioridad, seq), rechazos, guardianes, correrHasta, seq y finalizar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearMotor, MAX_MISMO_INSTANTE_POR_DEFECTO } from '../motor/motor.ts';
import { Calendario } from '../motor/calendario.ts';
import { fnv1a32 } from '../azar/clave.ts';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import { Fase } from '../../contratos/tipos-base.ts';
import type { Bloque, CrearMotor, Motor, OpcionesMotor } from '../../contratos/motor.ts';

const OPC: OpcionesMotor = { semilla: 1, replica: 0, hasta: 1e12, traza: 'no' };

/** Bloque que anota cada evento que recibe. */
function bloqueAnotador(ruta = 'prueba.anotador') {
  const vistos: { t: number; tipo: number; arg: number; seq: number }[] = [];
  const b: Bloque = {
    ruta,
    manejar(m, tipo, arg) { vistos.push({ t: m.ahora, tipo, arg, seq: m.seq }); },
    estado: () => ({}), restaurar() {},
  };
  return { b, vistos };
}

/** Generador congruencial simple con semilla fija (solo para armar casos de prueba). Devuelve los 16 bits altos: los bajos de un
 * congruencial módulo 2^32 tienen períodos cortos. */
function lcg(semilla: number) {
  let s = semilla >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s >>> 16; };
}

test('orden total (t, fase, prioridad, seq): 5.000 eventos con muchos empates salen ordenados', () => {
  const m = crearMotor(OPC);
  const { b, vistos } = bloqueAnotador();
  const i = m.registrar(b);
  const azar = lcg(99);
  const esperados: { t: number; fase: number; prio: number; seq: number; arg: number }[] = [];
  for (let k = 0; k < 5000; k++) {
    const t = (azar() % 40) * 1000, fase = azar() % 3, prio = (azar() % 7) - 3;
    const seq = m.agendar(t, i, 1, k, fase as Fase, prio);
    assert.equal(seq, k, 'seq tiene que ser global, creciente y empezar en 0');
    esperados.push({ t, fase, prio, seq, arg: k });
  }
  esperados.sort((x, y) => x.t - y.t || x.fase - y.fase || x.prio - y.prio || x.seq - y.seq);
  const r = m.correr();
  assert.equal(r.estado, 'sin-eventos');
  assert.equal(r.eventos, 5000);
  assert.deepEqual(vistos.map((v) => v.arg), esperados.map((e) => e.arg), 'el orden de proceso no es (t, fase, prioridad, seq)');
  assert.deepEqual(vistos.map((v) => v.seq), esperados.map((e) => e.seq), 'm.seq tiene que ser el seq del evento en proceso');
});

test('un evento agendado durante el proceso, en el mismo instante y con una fase anterior, va antes que los pendientes', () => {
  const m = crearMotor(OPC);
  const orden: string[] = [];
  let yo = -1;
  const b: Bloque = {
    ruta: 'prueba.fases',
    manejar(m, tipo) {
      orden.push(`t${m.ahora}:${tipo}`);
      if (tipo === 1) m.agendar(m.ahora, yo, 9, 0, Fase.URGENTE); // mismo t, fase anterior a la de los NORMAL pendientes
    },
    estado: () => ({}), restaurar() {},
  };
  yo = m.registrar(b);
  m.agendar(5, yo, 2, 0, Fase.NORMAL);
  m.agendar(5, yo, 3, 0, Fase.TARDIA);
  m.agendar(5, yo, 1, 0, Fase.NORMAL, -1);
  m.correr();
  assert.deepEqual(orden, ['t5:1', 't5:9', 't5:2', 't5:3']);
});

test('el calendario en columnas soporta 200.000 eventos al azar y crece duplicando sin perder el orden', () => {
  const c = new Calendario(4);
  const azar = lcg(7);
  const n = 200_000;
  for (let s = 0; s < n; s++) c.poner((((azar() << 16) | azar()) >>> 0) % 100_000, azar() % 3, (azar() % 5) - 2, s, 0, s & 0xff, s);
  const veces = c.capacidad / 4;
  assert.ok(c.capacidad >= n && Number.isInteger(veces) && (veces & (veces - 1)) === 0,
    `la capacidad tiene que ser 4·2^k ≥ ${n} (crece duplicando) y es ${c.capacidad}`);
  let pt = -1, pf = -1, pp = -1, ps = -1, sacados = 0;
  while (c.n > 0) {
    const t = c.t[0], f = c.fase[0], p = c.prioridad[0], s = c.seq[0];
    const ordenado = pt < t || (pt === t && (pf < f || (pf === f && (pp < p || (pp === p && ps < s)))));
    if (!ordenado) assert.fail(`desorden en el evento ${sacados}: (${pt}, ${pf}, ${pp}, ${ps}) antes de (${t}, ${f}, ${p}, ${s})`);
    assert.equal(c.arg[0], s, 'las columnas de un evento tienen que viajar juntas');
    pt = t; pf = f; pp = p; ps = s;
    c.quitarPrimero();
    sacados++;
  }
  assert.equal(sacados, n);
});

test('agendar rechaza tiempos no enteros y del pasado, con mensajes que dicen qué se esperaba', () => {
  const m = crearMotor(OPC);
  const { b } = bloqueAnotador();
  const i = m.registrar(b);
  assert.throws(() => m.agendar(1.5, i, 1, 0), /agendar: se esperaba un tiempo entero en ms y llegó 1\.5/);
  assert.throws(() => m.agendar(NaN, i, 1, 0), /llegó NaN/);
  assert.throws(() => m.agendar(Infinity, i, 1, 0), /llegó Infinity/);
  let error: unknown = null;
  let yo = -1;
  const atrasado: Bloque = {
    ruta: 'prueba.pasado',
    manejar(m) { try { m.agendar(m.ahora - 1, yo, 1, 0); } catch (e) { error = e; } },
    estado: () => ({}), restaurar() {},
  };
  yo = m.registrar(atrasado);
  m.agendar(1000, yo, 1, 0);
  m.correr();
  assert.ok(error instanceof RangeError, 'agendar en el pasado tiene que lanzar RangeError');
  assert.match((error as Error).message, /tiempo en el pasado: t = 999 ms < ahora = 1000 ms/);
  // Igual en el instante actual: sí se puede (t = ahora).
  assert.doesNotThrow(() => m.agendar(m.ahora, yo, 1, 0));
});

test('agendar valida bloque, tipo, arg, fase y prioridad (enteros de 32 bits: el calendario los guarda en Int32Array)', () => {
  const m = crearMotor(OPC);
  const { b } = bloqueAnotador();
  const i = m.registrar(b);
  assert.throws(() => m.agendar(0, 1, 1, 0), /se esperaba el índice de un bloque registrado \(0…0\) y llegó 1/);
  assert.throws(() => m.agendar(0, -1, 1, 0), RangeError);
  assert.throws(() => m.agendar(0, i, 1.5, 0), /se esperaba tipo entero de 32 bits y llegó 1\.5/);
  assert.throws(() => m.agendar(0, i, 1, 2147483648), /se esperaba arg entero de 32 bits y llegó 2147483648/);
  assert.throws(() => m.agendar(0, i, 1, 0.25), TypeError);
  assert.throws(() => m.agendar(0, i, 1, 0, 3 as Fase), /se esperaba fase 0 \(URGENTE\), 1 \(NORMAL\) o 2 \(TARDIA\) y llegó 3/);
  assert.throws(() => m.agendar(0, i, 1, 0, Fase.NORMAL, 0.5), /prioridad entera/);
  assert.doesNotThrow(() => m.agendar(0, i, -7, -2147483648, Fase.TARDIA, -2147483648));
});

/** Bloque que se reagenda sin fin: en el mismo instante (lazo de tiempo cero) o 1 ms después. */
function bloqueSinFin(m: Motor, demora: number): void {
  let yo = -1;
  const b: Bloque = { ruta: 'prueba.sinfin', manejar(m, _t, arg) { m.agendar(m.ahora + demora, yo, 1, (arg + 1) | 0); }, estado: () => ({}), restaurar() {} };
  yo = m.registrar(b);
  m.agendar(7, yo, 1, 0);
}

test('guardián «lazo-tiempo-cero»: maxMismoInstante eventos seguidos en el mismo t; igual que la referencia', () => {
  for (const crear of [crearMotor, crearMotorReferencia] as CrearMotor[]) {
    const m = crear({ ...OPC, maxMismoInstante: 1000 });
    bloqueSinFin(m, 0);
    const r = m.correr();
    assert.equal(r.estado, 'lazo-tiempo-cero');
    assert.equal(r.eventos, 1002, 'el primero fija el instante y se corta al superar 1.000 repeticiones');
    assert.equal(r.ahora, 7);
  }
  const a = crearMotor({ ...OPC, maxMismoInstante: 1000 }), b = crearMotorReferencia({ ...OPC, maxMismoInstante: 1000 });
  bloqueSinFin(a, 0); bloqueSinFin(b, 0);
  assert.deepEqual(a.correr(), b.correr());
});

test('guardián «lazo-tiempo-cero» con el valor por defecto (1.000.000)', () => {
  const m = crearMotor(OPC);
  bloqueSinFin(m, 0);
  const r = m.correr();
  assert.equal(r.estado, 'lazo-tiempo-cero');
  assert.equal(r.eventos, MAX_MISMO_INSTANTE_POR_DEFECTO + 2);
});

test('guardián «tope-eventos»: corta al llegar a maxEventos, igual que la referencia', () => {
  const a = crearMotor({ ...OPC, maxEventos: 5000 }), b = crearMotorReferencia({ ...OPC, maxEventos: 5000 });
  bloqueSinFin(a, 1); bloqueSinFin(b, 1);
  const ra = a.correr();
  assert.equal(ra.estado, 'tope-eventos');
  assert.equal(ra.eventos, 5000);
  assert.deepEqual(ra, b.correr());
});

test('correrHasta: pausa, horizonte y sin-eventos; ahora queda en el instante pedido', () => {
  const m = crearMotor({ ...OPC, hasta: 10_000 });
  const { b, vistos } = bloqueAnotador();
  const i = m.registrar(b);
  for (const t of [1000, 2000, 3000, 20_000]) m.agendar(t, i, 1, t);
  let r = m.correrHasta(2500);
  assert.deepEqual([r.estado, r.ahora, r.eventos], ['pausa', 2500, 2]);
  assert.equal(m.ahora, 2500);
  r = m.correrHasta(2500);
  assert.deepEqual([r.estado, r.ahora, r.eventos], ['pausa', 2500, 2], 'correr dos veces hasta el mismo instante no procesa nada');
  // Pedir más allá del horizonte no procesa el evento de 20.000 ms: el horizonte de las opciones manda (§6.1).
  r = m.correrHasta(50_000);
  assert.deepEqual([r.estado, r.ahora, r.eventos], ['horizonte', 10_000, 3]);
  assert.deepEqual(vistos.map((v) => v.t), [1000, 2000, 3000]);
  // Sin eventos pendientes: 'sin-eventos' y ahora = el horizonte (como la referencia).
  const n = crearMotor({ ...OPC, hasta: 10_000 }), j = n.registrar(bloqueAnotador().b);
  n.agendar(3000, j, 1, 0);
  assert.deepEqual(n.correr(), { estado: 'sin-eventos', ahora: 10_000, eventos: 1, huella: n.huella() });
});

test('m.seq vale −1 antes del primer evento y, durante manejar, el seq que devolvió agendar (patrón de descarte)', () => {
  const m = crearMotor(OPC);
  assert.equal(m.seq, -1);
  let yo = -1, vigente = -1, descartados = 0, atendidos = 0;
  const b: Bloque = {
    ruta: 'prueba.descarte',
    manejar(m, tipo) {
      if (tipo === 1) { // reprograma: el evento 2 anterior queda viejo
        vigente = m.agendar(m.ahora + 10, yo, 2, 0);
      } else if (m.seq !== vigente) descartados++; else atendidos++;
    },
    estado: () => ({}), restaurar() {},
  };
  yo = m.registrar(b);
  vigente = m.agendar(50, yo, 2, 0);
  m.agendar(5, yo, 1, 0);
  m.agendar(7, yo, 1, 0);
  m.correr();
  assert.deepEqual({ descartados, atendidos }, { descartados: 2, atendidos: 1 });
});

test('finalizar llama a finalizar() de cada bloque en orden de registro; registrar devuelve índices consecutivos', () => {
  const m = crearMotor(OPC);
  const orden: string[] = [];
  const mk = (ruta: string, conFinalizar: boolean): Bloque => ({
    ruta, manejar() {}, estado: () => ({}), restaurar() {},
    ...(conFinalizar ? { finalizar: (mm: Motor) => { assert.equal(mm, m); orden.push(ruta); } } : {}),
  });
  assert.equal(m.registrar(mk('a', true)), 0);
  assert.equal(m.registrar(mk('b', false)), 1);
  assert.equal(m.registrar(mk('c', true)), 2);
  m.finalizar();
  assert.deepEqual(orden, ['a', 'c']);
});

test('no se puede volver a correr, sacar foto ni restaurar desde manejar()', () => {
  const m = crearMotor(OPC);
  const errores: string[] = [];
  const b: Bloque = {
    ruta: 'prueba.reentrada',
    manejar(m) {
      for (const f of [() => m.correr(), () => m.correrHasta(5), () => m.foto()]) {
        try { f(); } catch (e) { errores.push((e as Error).message); }
      }
    },
    estado: () => ({}), restaurar() {},
  };
  m.agendar(1, m.registrar(b), 1, 0);
  m.correr();
  assert.equal(errores.length, 3);
  assert.match(errores[0], /no se puede llamar desde manejar/);
  assert.match(errores[2], /foto: no se puede sacar desde manejar/);
  // Si manejar lanza, el error sale y el motor vuelve a quedar usable.
  const n = crearMotor(OPC);
  const roto: Bloque = { ruta: 'prueba.roto', manejar() { throw new Error('falla del bloque'); }, estado: () => ({}), restaurar() {} };
  n.agendar(1, n.registrar(roto), 1, 0);
  assert.throws(() => n.correr(), /falla del bloque/);
  assert.doesNotThrow(() => n.foto());
});

test('crearMotor y registrar validan sus entradas con mensajes claros', () => {
  assert.throws(() => crearMotor({ ...OPC, semilla: -1 }), /se esperaba semilla entera entre 0 y 4\.294\.967\.295 \(uint32\) y llegó -1/);
  assert.throws(() => crearMotor({ ...OPC, replica: 1.5 }), /replica/);
  assert.throws(() => crearMotor({ ...OPC, hasta: NaN }), /se esperaba hasta \(horizonte en ms\) ≥ 0/);
  assert.throws(() => crearMotor({ ...OPC, traza: 'toda' as 'no' }), /se esperaba traza 'no', 'kpi' o 'completa'/);
  assert.throws(() => crearMotor({ ...OPC, maxEventos: -5 }), /maxEventos/);
  const m = crearMotor(OPC);
  assert.throws(() => m.registrar({ ruta: 'x' } as unknown as Bloque), /se esperaba un bloque con manejar/);
  assert.throws(() => m.registrar({ ruta: '', manejar() {}, estado: () => ({}), restaurar() {} }), /ruta de texto no vacía/);
  assert.ok(Object.isFrozen(m.opciones), 'las opciones del motor no se pueden cambiar después de crearlo');
});

test('el motor expone el azar, la matemática, la traza y claveDe del núcleo', () => {
  const m = crearMotor({ ...OPC, semilla: 77, replica: 3, traza: 'completa' });
  assert.equal(m.azar.semilla, 77);
  assert.equal(m.azar.replica, 3);
  assert.equal(m.traza.nivel, 'completa');
  assert.equal(m.claveDe('a', 'b'), fnv1a32('a/b'));
  assert.equal(typeof m.mat.log, 'function');
  // Las funciones son clausuras: se pueden desestructurar, como en la referencia.
  const { agendar, registrar, correr } = m;
  const i = registrar(bloqueAnotador().b);
  agendar(3, i, 1, 0);
  assert.equal(correr().eventos, 1);
});
