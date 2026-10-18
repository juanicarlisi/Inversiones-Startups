// escena/pruebas/lazo.test.ts · P6. La bandeja se ve exactamente donde la puso el modelo: en el borde de cada paso, durante una micro-parada
// y al volver (corte-1.md §6.7 reglas 8 y 13; §9 P6 «posición de la bandeja en los bordes de cada paso y durante una parada»).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TipoTramo, Causa, ClaseEntidad } from '../../contratos/traza.ts';
import { crearReproductor } from '../reproductor.ts';
import { crearRelojLazo, posBandeja, ranuraDeBandeja, sDeRanura } from '../lazo.ts';
import { trazaDeMaqueta } from '../../contratos/fixtures/traza-maqueta.ts';
import { LAZO, TICK, dist, posRanura, trazaSintetica } from './ayudas.ts';

const T = LAZO.bandejas; // 50
const J = 7;             // bandeja sembrada
const T_PARADA = 3150;   // a mitad entre el paso 10 (3000) y el 11 (3300): el primer paso que no ocurre es el 11
const T_REINICIO = 9150; // la parada dura 6 s

/** Traza con el lazo en marcha desde 0, una parada a las 3150 ms y la vuelta a las 9150 ms, y un paquete sobre la bandeja J. */
function trazaConParada() {
  return trazaSintetica((s) => {
    s.tramo(-1, TipoTramo.LAZO_MARCHA, 0, 0, 0, T_PARADA);
    s.tramo(-1, TipoTramo.LAZO_DETENIDO, 0, 11, T_PARADA, T_REINICIO, Causa.FALLA);
    s.tramo(-1, TipoTramo.LAZO_MARCHA, 0, 11, T_REINICIO, 3_600_000);
    s.tramo(0, TipoTramo.BANDEJA, J, 0, 0, 60_000);
    s.paquete(0, { creado: 0, listo: 100_000 });
  });
}

/** Posición del paquete 0 y paso del lazo en t. */
function mirar(rep: ReturnType<typeof crearReproductor>, t: number) {
  const pos = rep.crearPosiciones(), rec = rep.crearEstadoRecursos();
  rep.posiciones(t, pos);
  rep.recursos(t, rec);
  let k = -1;
  for (let i = 0; i < pos.n; i++) if (pos.clase[i] === ClaseEntidad.PAQUETE && pos.id[i] === 0) k = i;
  assert.ok(k >= 0, `en t = ${t} ms se esperaba ver el paquete 0 y no está entre las ${pos.n} entidades`);
  return { x: pos.x[k], y: pos.y[k], paso: rec.pasoLazo, detenido: rec.lazoDetenido };
}

test('en el borde de cada paso, la bandeja está exactamente en su ranura (j + k) mod T', () => {
  const rep = crearReproductor(trazaConParada());
  for (let k = 0; k <= 10; k++) {
    const t = k * TICK, v = mirar(rep, t), [x, y] = posRanura(J + k);
    assert.equal(v.paso, k, `en t = ${t} ms se esperaba el paso ${k} y salió ${v.paso}`);
    assert.equal(v.detenido, false, `en t = ${t} ms el lazo anda`);
    assert.ok(dist(v.x, v.y, x, y) < 1e-4, `paso ${k}: la bandeja ${J} tiene que estar en la ranura ${(J + k) % T} (${x}, ${y}) y está en (${v.x}, ${v.y})`);
  }
});

test('entre dos pasos la bandeja avanza en forma continua (medio paso a mitad del tick)', () => {
  const rep = crearReproductor(trazaConParada());
  for (let k = 0; k < 10; k++) {
    const t = k * TICK + TICK / 2, v = mirar(rep, t);
    assert.ok(Math.abs(v.paso - (k + 0.5)) < 1e-12, `en t = ${t} ms se esperaba el paso ${k + 0.5} y salió ${v.paso}`);
    const [x, y] = posRanura(J + k + 0.5);
    assert.ok(dist(v.x, v.y, x, y) < 1e-4, `en t = ${t} ms la bandeja tiene que estar a mitad de camino entre las ranuras ${J + k} y ${J + k + 1}`);
  }
});

test('durante la parada todo queda quieto en el primer paso que no ocurrió, y al volver sigue desde ahí', () => {
  const rep = crearReproductor(trazaConParada());
  const [xp, yp] = posRanura(J + 11);
  for (const t of [T_PARADA, T_PARADA + 1, 5000, T_REINICIO - 1]) {
    const v = mirar(rep, t);
    assert.equal(v.paso, 11, `en t = ${t} ms (lazo detenido) se esperaba el paso 11 y salió ${v.paso}`);
    assert.equal(v.detenido, true, `en t = ${t} ms el lazo está detenido`);
    assert.ok(dist(v.x, v.y, xp, yp) < 1e-4, `en t = ${t} ms la bandeja tiene que estar quieta en la ranura ${J + 11}`);
  }
  for (let i = 0; i <= 20; i++) {
    const t = T_REINICIO + i * TICK, v = mirar(rep, t), [x, y] = posRanura(J + 11 + i);
    assert.equal(v.paso, 11 + i, `en t = ${t} ms (paso kp + ${i} desde el reinicio) se esperaba el paso ${11 + i} y salió ${v.paso}`);
    assert.equal(v.detenido, false);
    assert.ok(dist(v.x, v.y, x, y) < 1e-4, `después de la parada, paso ${11 + i}: bandeja en la ranura ${(J + 11 + i) % T}`);
  }
});

test('el último medio paso antes de la parada se recorre entero: llega a la ranura kp justo cuando el lazo para', () => {
  const reloj = crearRelojLazo(trazaConParada());
  assert.equal(reloj.pasoEn(3000), 10, 'en el último paso que ocurrió (3000 ms) el paso es 10');
  assert.ok(Math.abs(reloj.pasoEn(3075) - 10.5) < 1e-12, `a mitad del tramo comprimido se esperaba 10,5 y salió ${reloj.pasoEn(3075)}`);
  assert.equal(reloj.pasoEn(T_PARADA), 11, 'en el instante de la parada el paso es 11');
});

test('k(t) nunca retrocede ni salta: crece a lo sumo un paso cada 150 ms en todo el borde de la parada', () => {
  const reloj = crearRelojLazo(trazaConParada());
  let antes = reloj.pasoEn(0);
  for (let t = 1; t <= 12_000; t++) {
    const k = reloj.pasoEn(t);
    assert.ok(k >= antes, `k bajó de ${antes} a ${k} en t = ${t} ms`);
    assert.ok(k - antes <= 1 / 150 + 1e-9, `k saltó de ${antes} a ${k} en 1 ms (t = ${t})`);
    antes = k;
  }
});

test('una parada justo en el borde de un paso: ese paso no ocurre y el lazo queda en él', () => {
  const tr = trazaSintetica((s) => {
    s.tramo(-1, TipoTramo.LAZO_MARCHA, 0, 0, 0, 3000);
    s.tramo(-1, TipoTramo.LAZO_DETENIDO, 0, 10, 3000, 6000, Causa.FALLA);
    s.tramo(-1, TipoTramo.LAZO_MARCHA, 0, 10, 6000, 3_600_000);
  });
  const reloj = crearRelojLazo(tr);
  assert.equal(reloj.pasoEn(2700), 9);
  assert.ok(reloj.pasoEn(2999) < 10 && reloj.pasoEn(2999) > 9.99, `antes de la parada todavía no llegó al paso 10 (salió ${reloj.pasoEn(2999)})`);
  for (const t of [3000, 4500, 5999, 6000]) assert.equal(reloj.pasoEn(t), 10, `en t = ${t} ms se esperaba el paso 10 y salió ${reloj.pasoEn(t)}`);
  assert.equal(reloj.pasoEn(6300), 11);
  assert.equal(reloj.detenidoEn(2999), false);
  assert.equal(reloj.detenidoEn(3000), true);
  assert.equal(reloj.detenidoEn(6000), false);
});

test('antes del primer tramo el lazo no arrancó, y después del último queda donde quedó', () => {
  const tr = trazaSintetica((s) => { s.tramo(-1, TipoTramo.LAZO_MARCHA, 0, 4, 10_000, 20_000); });
  const reloj = crearRelojLazo(tr);
  assert.equal(reloj.pasoEn(0), 4, 'antes de arrancar, el paso del primer tramo');
  assert.equal(reloj.pasoEn(10_000 + 3 * TICK), 7);
  const ultimo = 4 + 10_000 / TICK;
  assert.ok(Math.abs(reloj.pasoEn(30_000) - ultimo) < 1e-12, `después del último tramo se esperaba ${ultimo} y salió ${reloj.pasoEn(30_000)}`);
});

test('sin tramos de lazo (F2) el paso es 0 y un paquete en BANDEJA r = −1 recorre el lazo de la estación a la rampa', () => {
  const tr = trazaSintetica((s) => {
    s.tramo(0, TipoTramo.INDUCCION, 0, 0, 0, 1000);
    s.tramo(0, TipoTramo.BANDEJA, -1, 0, 1000, 5000);
    s.tramo(0, TipoTramo.RAMPA, 1, 0, 5000, 9000);
    s.paquete(0, { creado: 0, listo: 9000 });
  });
  const rep = crearReproductor(tr);
  assert.equal(rep.reloj.tramos, 0);
  const g = tr.geometria, ini = mirar(rep, 1000), casiFin = mirar(rep, 4999);
  assert.equal(ini.paso, 0);
  assert.ok(dist(ini.x, ini.y, g.estaciones[0].x, g.estaciones[0].y) < 1e-4, 'al entrar al lazo está frente a su estación');
  assert.ok(dist(casiFin.x, casiFin.y, g.rampas[1].x, g.rampas[1].y) < 0.01, 'al salir del lazo está frente a su rampa');
});

test('un paquete de dos bandejas se dibuja entre la suya (j) y la de atrás (j − 1)', () => {
  const tr = trazaSintetica((s) => {
    s.tramo(-1, TipoTramo.LAZO_MARCHA, 0, 0, 0, 3_600_000);
    s.tramo(0, TipoTramo.ESPERA_BANDEJA, 0, 2, 0, 600, Causa.FALTA_BANDEJA);
    s.tramo(0, TipoTramo.BANDEJA, J, 0, 600, 60_000);
    s.paquete(0, { creado: 0, listo: 70_000 });
  });
  const rep = crearReproductor(tr);
  assert.equal(rep.bandejasDe(0), 2);
  const v = mirar(rep, 900), [x, y] = posRanura(J + 3 - 0.5);
  assert.ok(dist(v.x, v.y, x, y) < 1e-4, 'en el paso 3 el paquete grande va a mitad de camino entre las ranuras 10 y 9');
});

test('ranura y distancia de una bandeja: (j + k) mod T, también con fracción y con k negativo', () => {
  assert.equal(ranuraDeBandeja(LAZO, 49, 1), 0);
  assert.equal(ranuraDeBandeja(LAZO, 3, -5), 48);
  assert.ok(Math.abs(ranuraDeBandeja(LAZO, 0, 49.5) - 49.5) < 1e-12);
  assert.ok(Math.abs(sDeRanura(LAZO, 25) - 15) < 1e-12);
  const o = [0, 0, 0];
  posBandeja(LAZO, 0, 0, o);
  assert.ok(Math.abs(o[0]) < 1e-12 && Math.abs(o[1]) < 1e-12, 'la bandeja 0 en el paso 0 está en el origen del lazo');
});

test('una traza con tramos de lazo y tick ≤ 0 se rechaza diciendo qué se esperaba', () => {
  const tr = trazaSintetica((s) => { s.tramo(-1, TipoTramo.LAZO_MARCHA, 0, 0, 0, 1000); });
  assert.throws(() => crearRelojLazo({ ...tr, tickLazo: 0 }), /tickLazo = 0 \(se esperaba > 0 ms\)/);
});

test('maqueta: cada paquete se ve frente a su estación al subir a la bandeja y frente a su rampa al caer (a menos de un paso)', () => {
  // Con datos de una noche entera: la ranura de una estación o rampa es round(s ÷ paso) mod T (§6.7 regla 8), así que el redondeo
  // deja hasta medio paso, y un paquete de dos bandejas se dibuja medio paso más atrás: nunca más de un paso (0,6 m).
  const tr = trazaDeMaqueta(2), T = tr.tramos, rep = crearReproductor(tr), pos = rep.crearPosiciones(), paso = tr.geometria.lazo.paso;
  const ult = new Map<number, number>(), sig = new Int32Array(T.n).fill(-1), ant = new Int32Array(T.n).fill(-1);
  for (let i = 0; i < T.n; i++) {
    if (T.k[i] < TipoTramo.DESCARGA || T.k[i] > TipoTramo.MANUAL) continue;
    const j = ult.get(T.e[i]);
    if (j !== undefined) { sig[j] = i; ant[i] = j; }
    ult.set(T.e[i], i);
  }
  const donde = (t: number, e: number) => {
    rep.posiciones(t, pos);
    for (let q = 0; q < pos.n; q++) if (pos.clase[q] === ClaseEntidad.PAQUETE && pos.id[q] === e) return [pos.x[q], pos.y[q]];
    return null;
  };
  let caidas = 0, subidas = 0;
  for (let i = 0; i < T.n && caidas < 2000; i++) {
    if (T.k[i] !== TipoTramo.BANDEJA || T.t1[i] - T.t0[i] < 2) continue;
    const j = sig[i], a = ant[i];
    if (j >= 0 && T.k[j] === TipoTramo.RAMPA && T.r[j] < tr.geometria.rampas.length) {
      const p = donde(T.t1[i] - 1, T.e[i]), R = tr.geometria.rampas[T.r[j]];
      assert.ok(p, `el paquete ${T.e[i]} tiene que verse 1 ms antes de caer`);
      const d = dist(p[0], p[1], R.x, R.y);
      assert.ok(d <= paso, `el paquete ${T.e[i]} cae en ${R.id} a ${d.toFixed(3)} m de la rampa (se esperaba ≤ ${paso} m)`);
      caidas++;
    }
    if (a >= 0 && T.k[a] === TipoTramo.INDUCCION) {
      const p = donde(T.t0[i], T.e[i]), E = tr.geometria.estaciones[T.r[a]];
      assert.ok(p);
      const d = dist(p[0], p[1], E.x, E.y);
      assert.ok(d <= paso, `el paquete ${T.e[i]} sube a la bandeja a ${d.toFixed(3)} m de su estación ${E.id}`);
      subidas++;
    }
  }
  assert.ok(caidas >= 2000 && subidas > 1000, `se revisaron ${caidas} caídas y ${subidas} subidas`);
});
