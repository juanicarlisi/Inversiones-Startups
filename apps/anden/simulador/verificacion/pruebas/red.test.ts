// Pruebas de verificacion/flujo/red.ts con trayectorias deterministas calculadas a mano y con el motor de referencia.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearMotorReferencia, matNativa } from '../../contratos/referencia/motor-referencia.ts';
import { BloqueRed, compilarRed, correrRed, escalarRed, type ConfigRed } from '../flujo/red.ts';
import { mtInfMedia } from '../formulas/colas.ts';
import { intervaloMedia } from '../formulas/estadistica.ts';

const fija = (valor: number) => ({ tipo: 'fija', valor }) as const;
const exp = (media: number) => ({ tipo: 'exponencial', media }) as const;
const cerca = (x: number, y: number, que: string, tol = 1e-12) => assert.ok(Math.abs(x - y) <= tol, `${que}: se esperaba ${y} y salió ${x}`);

function dd1(servicio: number, horizonte: number, extra: Partial<ConfigRed> = {}): ConfigRed {
  return {
    id: 'prueba-dd1',
    estaciones: [{ id: 's', servidores: 1, servicio: fija(servicio) }],
    clases: [{ id: 'c', entrada: 's', llegadas: { tipo: 'renovacion', entre: fija(1) } }],
    horizonte, ...extra,
  };
}

test('D/D/1 sin cola: llegadas cada 1 y servicio 0,5 → nadie espera y la ocupación es 49,5 / 100', () => {
  const m = correrRed(crearMotorReferencia, dd1(0.5, 100), 1, 0);
  const s = m.estaciones[0];
  assert.equal(s.Wq[0], 0);
  assert.equal(s.pEspera[0], 0);
  cerca(s.ocupacion, 0.495, 'ocupación');
  cerca(m.L, 0.495, 'L');
  assert.deepEqual(m.conservacion, []);
});

test('D/D/1 con cola: servicio 1,5 → esperas 0; 0,5; 1; …; 3 (media 1,5) y 9 de 10 esperan', () => {
  const m = correrRed(crearMotorReferencia, dd1(1.5, 10.5), 1, 0);
  const s = m.estaciones[0];
  cerca(s.Wq[0], 1.5, 'Wq');
  assert.equal(s.nWq[0], 7, 'empezaron 7 servicios antes del horizonte');
  cerca(s.pEspera[0], 0.9, 'P(esperar)');
  cerca(m.clases[0].W, 2.75, 'W de los 6 que salieron');
  assert.equal(m.clases[0].nW, 6);
  assert.deepEqual(m.conservacion, []);
});

test('capacidad K = 1: se pierde un arribo de cada dos (llegadas cada 1, servicio 1,5)', () => {
  const c = dd1(1.5, 10.5);
  c.estaciones[0].capacidad = 1;
  const m = correrRed(crearMotorReferencia, c, 1, 0);
  assert.equal(m.estaciones[0].intentos, 10);
  assert.equal(m.estaciones[0].bloqueados, 5);
  assert.equal(m.estaciones[0].pBloqueo, 0.5);
  assert.deepEqual(m.conservacion, []);
});

function redPreempcion(preempta: boolean): ConfigRed {
  return {
    id: 'prueba-preempcion',
    estaciones: [{ id: 's', servidores: 1, servicio: fija(3), servicioPorClase: { baja: fija(10) } }],
    clases: [
      { id: 'alta', prioridad: 0, preempta, entrada: 's', llegadas: { tipo: 'renovacion', entre: fija(2), hasta: 2 } },
      { id: 'baja', prioridad: 1, entrada: 's', llegadas: { tipo: 'renovacion', entre: fija(1000), hasta: 0.5 } },
    ],
    iniciales: [{ clase: 'baja', estacion: 's', cantidad: 1 }],
    horizonte: 100,
  };
}

test('preempción con reanudación: la baja (10) arranca en 0, la alta (3) llega en 2 y la desaloja → alta sale en 5, baja en 13', () => {
  const m = correrRed(crearMotorReferencia, redPreempcion(true), 1, 0);
  cerca(m.clases[0].W, 3, 'W de la alta');
  cerca(m.clases[1].W, 13, 'W de la baja (sigue donde quedó: le faltaban 8)');
  assert.equal(m.estaciones[0].pEspera[0], 0, 'la alta no esperó');
  assert.deepEqual(m.conservacion, []);
});

test('sin preempción la alta espera a que termine la baja → alta sale en 13, baja en 10', () => {
  const m = correrRed(crearMotorReferencia, redPreempcion(false), 1, 0);
  cerca(m.clases[0].W, 11, 'W de la alta');
  cerca(m.clases[1].W, 10, 'W de la baja');
  cerca(m.estaciones[0].Wq[0], 8, 'Wq de la alta');
});

test('red cerrada determinista (Penny Fab, N = 3): TH = 3/8 por hora y CT = 8 h; la población no cambia', () => {
  const est = [0, 1, 2, 3].map((i) => ({ id: `e${i}`, servidores: 1, servicio: fija(2) }));
  const c: ConfigRed = {
    id: 'prueba-cerrada', estaciones: est,
    clases: [{ id: 'j', entrada: 'e0', poblacion: 3, ruteo: { e0: [['e1', 1]], e1: [['e2', 1]], e2: [['e3', 1]], e3: [['e0', 1]] } }],
    // Con calentamiento: los primeros ciclos de los trabajos 1 y 2 incluyen la espera inicial (10 y 12 h).
    horizonte: 8000, calentamiento: 100, ciclo: 'e0',
  };
  const m = correrRed(crearMotorReferencia, c, 1, 0);
  cerca(m.clases[0].CT, 8, 'CT');
  assert.ok(Math.abs(m.clases[0].TH - 0.375) / 0.375 < 0.001, `TH ${m.clases[0].TH}`);
  cerca(m.L, 3, 'L de una red cerrada = población');
  assert.deepEqual(m.conservacion, []);
});

test('objetivo: con llegadas cada 1 y servicio 0,5, la quinta salida es en 5,5 y la corrida se detiene', () => {
  const m = correrRed(crearMotorReferencia, dd1(0.5, 1000, { objetivo: { clase: 'c', salidas: 5 } }), 1, 0);
  cerca(m.tObjetivo!, 5.5, 'tObjetivo');
  assert.ok(m.corrida.eventos < 20, `después del objetivo no se agenda nada: ${m.corrida.eventos} eventos`);
});

test('D/D/∞: N(10) = 3 y la serie de N promedio por intervalos de 5 es [1,6; 2,5]', () => {
  const c: ConfigRed = {
    id: 'prueba-ddinf', estaciones: [{ id: 's', servidores: Infinity, servicio: fija(2.5) }],
    clases: [{ id: 'c', entrada: 's', llegadas: { tipo: 'renovacion', entre: fija(1) } }],
    horizonte: 10, observar: [10], serie: 5,
  };
  const m = correrRed(crearMotorReferencia, c, 1, 0);
  assert.deepEqual(m.observaciones, [3]);
  assert.equal(m.serie.length, 2);
  cerca(m.serie[0], 1.6, 'serie[0]');
  cerca(m.serie[1], 2.5, 'serie[1]');
  cerca(m.estaciones[0].ocupacion, m.estaciones[0].L, 'con servidores infinitos, ocupados = adentro');
});

test('calentamiento: el promedio de N mide solo la ventana y la serie no se reinicia', () => {
  const c: ConfigRed = {
    id: 'prueba-ddinf', estaciones: [{ id: 's', servidores: Infinity, servicio: fija(2.5) }],
    clases: [{ id: 'c', entrada: 's', llegadas: { tipo: 'renovacion', entre: fija(1) } }],
    horizonte: 10, calentamiento: 5, serie: 5,
  };
  const m = correrRed(crearMotorReferencia, c, 1, 0);
  cerca(m.L, 2.5, 'L en [5, 10]');
  cerca(m.serie[0], 1.6, 'serie[0]');
  cerca(m.ventana, 5, 'ventana');
});

test('números aleatorios comunes: con 1 o con 4 servidores las primeras 20 llegadas y servicios son idénticos', () => {
  const red = (c: number): ConfigRed => ({
    id: 'prueba-crn', estaciones: [{ id: 's', servidores: c, servicio: exp(1) }],
    clases: [{ id: 'c', entrada: 's', llegadas: { tipo: 'renovacion', entre: exp(0.5) } }], horizonte: 100, registrar: { primeras: 20 },
  });
  const a = correrRed(crearMotorReferencia, red(1), 3, 2), b = correrRed(crearMotorReferencia, red(4), 3, 2);
  assert.deepEqual(a.primeras, b.primeras);
  assert.ok(a.primeras!.llegadas.every(Number.isFinite) && a.primeras!.servicios.every(Number.isFinite));
  assert.notEqual(a.corrida.huella, b.corrida.huella);
  // Otro id de red → otros números.
  const c = correrRed(crearMotorReferencia, { ...red(1), id: 'otra' }, 3, 2);
  assert.notDeepEqual(a.primeras, c.primeras);
});

test('ruteo probabilístico: 70% / 30% en 20.000 trabajos (dentro de 4 errores estándar)', () => {
  const c: ConfigRed = {
    id: 'prueba-ruteo',
    estaciones: [{ id: 'a', servidores: Infinity, servicio: fija(0.001) }, { id: 'b', servidores: Infinity, servicio: fija(0.001) }, { id: 'c', servidores: Infinity, servicio: fija(0.001) }],
    clases: [{ id: 't', entrada: 'a', llegadas: { tipo: 'renovacion', entre: exp(1) }, ruteo: { a: [['b', 0.7], ['c', 0.3]] } }],
    horizonte: 20_000,
  };
  const m = correrRed(crearMotorReferencia, c, 5, 0);
  const n = m.estaciones[1].intentos + m.estaciones[2].intentos;
  const p = m.estaciones[1].intentos / n;
  assert.ok(Math.abs(p - 0.7) <= 4 * Math.sqrt(0.21 / n), `fracción a b: ${p} con n = ${n}`);
  assert.deepEqual(m.conservacion, []);
});

test('Poisson senoidal por adelgazamiento: E[N(12 h)] de la M_t/M/∞ dentro de 4 errores estándar (400 réplicas)', () => {
  const c: ConfigRed = {
    id: 'prueba-mtinf', estaciones: [{ id: 's', servidores: Infinity, servicio: exp(1) }],
    clases: [{ id: 'c', entrada: 's', llegadas: { tipo: 'senoidal', media: 20, amplitud: 0.6, periodo: 24 } }],
    horizonte: 12, observar: [12],
  };
  const xs: number[] = [];
  for (let r = 0; r < 400; r++) xs.push(correrRed(crearMotorReferencia, c, 9, r).observaciones[0]);
  const iv = intervaloMedia(xs, matNativa);
  const e = mtInfMedia(20, 0.6, 24, 1, 12, matNativa);
  assert.ok(Math.abs(iv.media - e) <= 4 * iv.ee, `E[N(12)]: se esperaba ${e} y salió ${iv.media} ± ${iv.ee}`);
});

test('iniciales con distribución: arranque con una cantidad sorteada (discreta) en la estación', () => {
  const c: ConfigRed = {
    id: 'prueba-iniciales', estaciones: [{ id: 's', servidores: 1, servicio: exp(1) }],
    clases: [{ id: 'c', entrada: 's', llegadas: { tipo: 'renovacion', entre: exp(2) } }],
    iniciales: [{ clase: 'c', estacion: 's', cantidad: { tipo: 'discreta', valores: [7], pesos: [1] } }],
    horizonte: 0.000001, observar: [0],
  };
  const m = correrRed(crearMotorReferencia, c, 1, 0);
  assert.deepEqual(m.observaciones, [7]);
});

test('escalarRed: duraciones × f, tasas ÷ f, mismo id', () => {
  const c: ConfigRed = {
    id: 'x', estaciones: [{ id: 's', servidores: 2, servicio: { tipo: 'lognormal', media: 2, cv: 0.5 }, servicioPorClase: { b: { tipo: 'uniforme', min: 1, max: 3 } } }],
    clases: [{ id: 'a', entrada: 's', llegadas: { tipo: 'senoidal', media: 4, amplitud: 0.5, periodo: 24, hasta: 10 } },
      { id: 'b', entrada: 's', llegadas: { tipo: 'renovacion', entre: { tipo: 'erlang', k: 3, media: 1 } } }],
    horizonte: 100, calentamiento: 10, observar: [50], serie: 5,
  };
  const e = escalarRed(c, 60);
  assert.equal(e.id, 'x');
  assert.deepEqual(e.estaciones[0].servicio, { tipo: 'lognormal', media: 120, cv: 0.5 });
  assert.deepEqual(e.estaciones[0].servicioPorClase!.b, { tipo: 'uniforme', min: 60, max: 180 });
  assert.deepEqual(e.clases[0].llegadas, { tipo: 'senoidal', media: 4 / 60, amplitud: 0.5, periodo: 1440, hasta: 600 });
  assert.deepEqual(e.clases[1].llegadas, { tipo: 'renovacion', entre: { tipo: 'erlang', k: 3, media: 60 } });
  assert.equal(e.horizonte, 6000); assert.equal(e.calentamiento, 600); assert.deepEqual(e.observar, [3000]); assert.equal(e.serie, 300);
});

test('estado y restaurar: la foto del bloque a mitad de corrida vuelve idéntica en un bloque nuevo', () => {
  const c: ConfigRed = {
    id: 'prueba-foto',
    estaciones: [{ id: 'a', servidores: 2, servicio: exp(1) }, { id: 'b', servidores: 1, capacidad: 4, servicio: exp(0.8) }],
    clases: [{ id: 'p', entrada: 'a', llegadas: { tipo: 'renovacion', entre: exp(0.7) }, ruteo: { a: [['b', 0.6]], b: [['a', 0.2]] } },
      { id: 'q', prioridad: 0, preempta: true, entrada: 'b', poblacion: 1, ruteo: { b: [['a', 1]], a: [['b', 1]] } }],
    horizonte: 2000, calentamiento: 100, observar: [500, 1500], serie: 50,
  };
  // La clase cerrada no puede pasar por una estación con tope: la validación lo rechaza…
  assert.throws(() => compilarRed(c), /estaciones sin tope de capacidad/);
  delete c.estaciones[1].capacidad;
  const cfg = compilarRed(c);
  const m = crearMotorReferencia({ semilla: 4, replica: 0, hasta: cfg.hastaMs, traza: 'no' });
  const red = new BloqueRed(m, cfg);
  m.correrHasta(cfg.hastaMs / 2);
  const e = red.estado();
  const m2 = crearMotorReferencia({ semilla: 4, replica: 0, hasta: cfg.hastaMs, traza: 'no' });
  const red2 = new BloqueRed(m2, cfg);
  red2.restaurar(e);
  assert.deepEqual(red2.estado(), e);
  assert.deepEqual(red2.conservacion(), red.conservacion());
  // Todo el estado son arreglos tipados y números.
  for (const [k, v] of Object.entries(e)) assert.ok(typeof v === 'number' || ArrayBuffer.isView(v), `«${k}» no es número ni arreglo tipado`);
  // Los arreglos se copian: cambiar el original no toca al restaurado.
  (e.enEstacion as Int32Array)[0] = 99;
  assert.notEqual(red2.enEstacion[0], 99);
  assert.throws(() => red2.restaurar({ ...e, jClase: new Float64Array(1) }), /«jClase» como Int32Array y llegó Float64Array/);
  assert.throws(() => red2.restaurar({ ...e, nLibres: new Int32Array(1) }), /el número «nLibres»/);
});

test('validación: cada error dice qué se esperaba y qué llegó', () => {
  const base = (): ConfigRed => dd1(0.5, 10);
  const con = (f: (c: ConfigRed) => void) => { const c = base(); f(c); return () => compilarRed(c); };
  assert.throws(con((c) => { c.estaciones[0].servidores = 0; }), /servidores: se esperaba un entero entre 1 y 100.000, o Infinity y llegó 0/);
  assert.throws(con((c) => { c.estaciones[0].servidores = 2; c.estaciones[0].capacidad = 1; }), /capacidad: se esperaba un entero ≥ servidores, o sin tope y llegó 1/);
  assert.throws(con((c) => { c.clases[0].ruteo = { s: [['nada', 1]] }; }), /una estación existente \(s\) y llegó «nada»/);
  assert.throws(con((c) => { c.clases[0].ruteo = { s: [['s', 0.7], ['s', 0.5]] }; }), /probabilidades que sumen como mucho 1 y llegó 1.2/);
  assert.throws(con((c) => { c.clases[0].poblacion = 3; }), /exactamente una de «llegadas» \(abierta\) o «poblacion» \(cerrada\)/);
  assert.throws(con((c) => { delete c.clases[0].llegadas; c.clases[0].poblacion = 2; c.clases[0].ruteo = { s: [['s', 0.5]] }; }), /probabilidades que sumen 1 \(una clase cerrada no sale\) y llegó 0.5/);
  assert.throws(con((c) => { c.estaciones[0].servicio = { tipo: 'normal', media: 1, desvio: 1 }; }), /normal con desvío ≥ 0 y recortada con min ≥ 0/);
  assert.throws(con((c) => { c.clases[0].llegadas = { tipo: 'renovacion', entre: fija(0) }; }), /intervalo fijo > 0/);
  assert.throws(con((c) => { c.calentamiento = 10; }), /calentamiento: se esperaba un número entre 0 y el horizonte \(10\) y llegó 10/);
  assert.throws(con((c) => { c.objetivo = { clase: 'otra', salidas: 3 }; }), /objetivo.clase: se esperaba una clase existente \(c\) y llegó «otra»/);
  assert.throws(con((c) => { c.estaciones.push({ ...c.estaciones[0] }); }), /ids de estación únicos y llegó «s»/);
  assert.throws(con((c) => { (c.estaciones[0] as { servicio: unknown }).servicio = { tipo: 'gamma', k: 2 }; }), /un tipo de distribución del contrato \(azar.ts\) y llegó «gamma»/);
  const cfg = compilarRed(base());
  const m = crearMotorReferencia({ semilla: 1, replica: 0, hasta: 5, traza: 'no' });
  assert.throws(() => new BloqueRed(m, cfg), /el motor se creó con hasta = 5 ms y la red espera 10000000 ms/);
});

test('una réplica es una función pura de (configuración, semilla, réplica)', () => {
  const c: ConfigRed = {
    id: 'prueba-pura',
    estaciones: [{ id: 'a', servidores: 3, servicio: { tipo: 'lognormal', media: 1, cv: 1 } }],
    clases: [{ id: 'p', entrada: 'a', llegadas: { tipo: 'renovacion', entre: exp(0.4) } }], horizonte: 500, calentamiento: 50,
  };
  const a = correrRed(crearMotorReferencia, c, 77, 3), b = correrRed(crearMotorReferencia, c, 77, 3);
  assert.deepEqual(a, b);
  assert.notEqual(correrRed(crearMotorReferencia, c, 78, 3).corrida.huella, a.corrida.huella);
});
