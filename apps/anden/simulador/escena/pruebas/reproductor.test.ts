// escena/pruebas/reproductor.test.ts · P6. Fórmulas cerradas del reproductor (corte-1.md §9 P6): extremos de la cinta, lugar en la fila de
// la acumulación y de cada rampa (secuencia − salidas hasta t), estados visuales, personas en su puesto o caminando, camiones en el andén
// y en la playa, jaulas, puestos y validación de la entrada. Todo con trazas sintéticas sembradas a mano.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Causa, ClaseEntidad, TipoMomento, TipoTramo, type Traza } from '../../contratos/traza.ts';
import { EstadoVisual, type Posiciones } from '../../contratos/vistas.ts';
import { crearReproductor, EstadoPersona, EstadoPuesto, UMBRAL_ESPERA_MS, type ReproductorEscena } from '../reproductor.ts';
import { ALTURA_CAPA_PILA, PILA_CAPAS, PILA_COLUMNAS, PILA_FILAS, lugarEnFila, lugarEnPlaya, lugarEnRampa } from '../disposicion.ts';
import { posEnLazo } from '../../contratos/geometria.ts';
import { PERSONAS, dist, geometriaSintetica, lazoEnMarcha, trazaSintetica } from './ayudas.ts';

/** Entidad (clase, id) en t: posición y estado, o null si no se ve. */
function ver(rep: ReproductorEscena, t: number, clase: number, id: number): { x: number; y: number; ang: number; estado: number } | null {
  const p = rep.crearPosiciones();
  rep.posiciones(t, p);
  for (let i = 0; i < p.n; i++) if (p.clase[i] === clase && p.id[i] === id) return { x: p.x[i], y: p.y[i], ang: p.ang[i], estado: p.estado[i] };
  return null;
}
function verPaquete(rep: ReproductorEscena, t: number, id: number) {
  const v = ver(rep, t, ClaseEntidad.PAQUETE, id);
  assert.ok(v, `en t = ${t} ms se esperaba ver el paquete ${id} y no está`);
  return v;
}
function cerca(v: { x: number; y: number }, p: ArrayLike<number>, tol: number, que: string) {
  const d = dist(v.x, v.y, p[0], p[1]);
  assert.ok(d <= tol, `${que}: se esperaba (${p[0].toFixed(4)}, ${p[1].toFixed(4)}) y salió (${v.x.toFixed(4)}, ${v.y.toFixed(4)}), a ${d.toFixed(5)} m`);
}

test('cinta: al entrar está en el primer punto de la polilínea, a mitad de tiempo a mitad del largo y al salir en el último', () => {
  const tr = trazaSintetica((s) => {
    s.tramo(0, TipoTramo.CINTA, 0, 0, 1000, 10_000);
    s.paquete(0, { creado: 0, listo: 20_000 });
  });
  const rep = crearReproductor(tr);
  const ini = verPaquete(rep, 1000, 0);
  cerca(ini, [-5, -8], 1e-5, 'entrada de la cinta C1');
  assert.ok(Math.abs(ini.ang - Math.PI / 2) < 1e-6, `en el primer tramo la cinta va hacia +y (ángulo π/2) y salió ${ini.ang}`);
  cerca(verPaquete(rep, 5500, 0), [-5, -3.5], 1e-5, 'mitad de la cinta C1 (4,5 m de 9)');
  const fin = verPaquete(rep, 9999, 0);
  cerca(fin, [-1, -3], 0.0011, 'salida de la cinta C1 (1 ms antes del fin del tramo, a 1 m/s)');
  assert.ok(Math.abs(fin.ang) < 1e-6, `en el último tramo la cinta va hacia +x (ángulo 0) y salió ${fin.ang}`);
  assert.equal(ver(rep, 10_000, ClaseEntidad.PAQUETE, 0), null, 'en t1 el tramo ya terminó: activo es t0 ≤ t < t1');
});

test('fila de la acumulación: lugar = secuencia − salidas hasta t, y la fila cuenta entradas − salidas', () => {
  const tr = trazaSintetica((s) => {
    for (let i = 0; i < 5; i++) {
      s.tramo(i, TipoTramo.ACUMULACION, 0, i, 1000 * i, 10_000 + 2000 * i, Causa.FILA);
      s.paquete(i, { creado: 0, listo: 60_000 });
    }
  });
  const rep = crearReproductor(tr), D = rep.disposicion, rec = rep.crearEstadoRecursos(), o = [0, 0];
  for (let i = 0; i < 5; i++) {
    lugarEnFila(D.fila, i, o);
    cerca(verPaquete(rep, 9000, i), o, 1e-5, `t = 9000: el paquete ${i} en el lugar ${i}`);
  }
  rep.recursos(9000, rec);
  assert.equal(rec.filaAcumulacion, 5);
  // a las 12.500 ms salieron los paquetes 0 y 1 (10.000 y 12.000): los otros avanzan dos lugares
  for (let i = 2; i < 5; i++) {
    lugarEnFila(D.fila, i - 2, o);
    cerca(verPaquete(rep, 12_500, i), o, 1e-5, `t = 12.500: el paquete ${i} en el lugar ${i - 2}`);
  }
  assert.equal(ver(rep, 12_500, ClaseEntidad.PAQUETE, 0), null, 'el paquete 0 ya salió de la fila');
  rep.recursos(12_500, rec);
  assert.equal(rec.filaAcumulacion, 3, `entradas 5 − salidas 2 = 3 y salió ${rec.filaAcumulacion}`);
});

test('fila de una rampa: lugar = secuencia − tomados hasta t; llena cuando la ocupación llega a la capacidad', () => {
  const tr = trazaSintetica((s) => {
    for (let i = 0; i < 3; i++) {
      s.tramo(i, TipoTramo.RAMPA, 0, i, 20_000 + 1000 * i, 40_000 + 5000 * i, Causa.NINGUNA, 2);
      s.paquete(i, { creado: 0, listo: 60_000 });
    }
  });
  const rep = crearReproductor(tr), R = rep.disposicion.rampas[0], rec = rep.crearEstadoRecursos(), o = [0, 0];
  rep.recursos(22_500, rec);
  assert.equal(rec.rampaOcupacion[0], 3);
  assert.equal(rec.rampaLlena[0], 1, 'con 3 de 3 lugares la rampa está llena');
  assert.equal(rec.rampaOcupacion[1], 0);
  for (let i = 0; i < 3; i++) {
    lugarEnRampa(R, i, false, o);
    cerca(verPaquete(rep, 22_500, i), o, 1e-5, `rampa R01, paquete ${i} en el lugar ${i}`);
  }
  rep.recursos(41_000, rec);
  assert.equal(rec.rampaOcupacion[0], 2, 'a las 41.000 ms ya tomaron uno');
  assert.equal(rec.rampaLlena[0], 0);
  for (let i = 1; i < 3; i++) {
    lugarEnRampa(R, i - 1, false, o);
    cerca(verPaquete(rep, 41_000, i), o, 1e-5, `rampa R01 después de tomar uno: paquete ${i} en el lugar ${i - 1}`);
  }
});

test('estados visuales: da otra vuelta, va a excepción, atrasado, esperando, en el camión y normal (con su precedencia)', () => {
  const tr = trazaSintetica((s) => {
    lazoEnMarcha(s);
    s.tramo(0, TipoTramo.BANDEJA, 3, 1, 0, 60_000, Causa.RAMPA_LLENA, 4 * 16777216); // vuelta extra
    s.tramo(1, TipoTramo.BANDEJA, 9, 0, 0, 60_000);                                   // NO-READ: lo que sigue es la cola manual
    s.tramo(1, TipoTramo.COLA_MANUAL, 0, 0, 60_000, 90_000, Causa.NO_LEIDO);
    s.tramo(2, TipoTramo.CINTA, 0, 0, 0, 60_000);                                     // llega después del corte
    s.tramo(3, TipoTramo.ACUMULACION, 0, 0, 0, 400_000, Causa.FILA);                  // espera más de 5 min
    s.tramo(4, TipoTramo.DESCARGA, 1, 0, 0, 60_000);                                  // en el camión
    s.tramo(5, TipoTramo.INDUCCION, 0, 0, 0, 60_000);                                 // normal
    s.tramo(6, TipoTramo.BANDEJA, 20, 2, 0, 60_000, Causa.RAMPA_LLENA, 4 * 16777216); // vuelta y además atrasado
    s.tramo(7, TipoTramo.CINTA, 1, 0, 0, 60_000);                                     // no terminó (listo −1)
    s.paquete(0, { creado: 0, listo: 100_000 });
    s.paquete(1, { creado: 0, listo: 100_000 });
    s.paquete(2, { creado: 0, listo: 2_000_000 });
    s.paquete(3, { creado: 0, listo: 500_000 });
    s.paquete(4, { creado: 0, listo: 100_000 });
    s.paquete(5, { creado: 0, listo: 100_000 });
    s.paquete(6, { creado: 0, listo: 2_500_000 });
    s.paquete(7, { creado: 0, listo: -1 });
  });
  const rep = crearReproductor(tr), t = 30_000;
  const esperado: [number, number, string][] = [
    [0, EstadoVisual.DANDO_VUELTA, 'BANDEJA con a > 0'],
    [1, EstadoVisual.EXCEPCION, 'BANDEJA rumbo a la cola manual'],
    [2, EstadoVisual.ATRASADO, 'listo > corte'],
    [4, EstadoVisual.EN_CAMION, 'en DESCARGA'],
    [5, EstadoVisual.NORMAL, 'induciendo, a tiempo'],
    [6, EstadoVisual.DANDO_VUELTA, 'dar otra vuelta pesa más que estar atrasado'],
    [7, EstadoVisual.ATRASADO, 'listo = −1 (no terminó)'],
  ];
  for (const [id, est, por] of esperado) assert.equal(verPaquete(rep, t, id).estado, est, `paquete ${id} (${por}): se esperaba el estado ${est}`);
  assert.equal(verPaquete(rep, UMBRAL_ESPERA_MS - 1, 3).estado, EstadoVisual.NORMAL, 'en la fila hace menos de 5 min: normal');
  assert.equal(verPaquete(rep, UMBRAL_ESPERA_MS, 3).estado, EstadoVisual.ESPERANDO, 'en la fila hace 5 min: esperando');
  assert.equal(verPaquete(rep, 70_000, 1).estado, EstadoVisual.EXCEPCION, 'en la cola manual: excepción');
});

test('personas: en su rampa, caminando entre dos rampas (interpolada), en pausa (esperando) y quieta donde quedó', () => {
  const g = PERSONAS.R1;
  const tr = trazaSintetica((s) => {
    s.tramo(g, TipoTramo.PERSONA_TRABAJA, 0, 0, 0, 1000);
    s.tramo(g, TipoTramo.PERSONA_CAMINA, 1, 0, 1000, 3000);
    s.tramo(g, TipoTramo.PERSONA_TRABAJA, 1, 0, 3000, 4000);
    s.tramo(g, TipoTramo.PERSONA_PAUSA, 1, 0, 4000, 5000);
    s.tramo(PERSONAS.R2, TipoTramo.PERSONA_AUSENTE, -1, 0, 0, 3_600_000);
  });
  const rep = crearReproductor(tr), D = rep.disposicion, rec = rep.crearEstadoRecursos();
  const p0 = D.rampas[0].persona, p1 = D.rampas[1].persona;
  const en = (t: number) => { const v = ver(rep, t, ClaseEntidad.PERSONA, g); assert.ok(v, `en t = ${t} ms se esperaba ver a P-R1`); return v; };
  cerca(en(500), p0, 1e-5, 'trabajando en la rampa R01');
  cerca(en(2000), [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], 1e-4, 'a mitad de la caminata de R01 a R02');
  cerca(en(3500), p1, 1e-5, 'trabajando en la rampa R02');
  assert.equal(en(4500).estado, EstadoVisual.ESPERANDO, 'en pausa se ve «esperando»');
  cerca(en(6000), p1, 1e-5, 'sin tramo, quieta donde quedó');
  assert.equal(en(6000).estado, EstadoVisual.NORMAL);
  assert.equal(ver(rep, 500, ClaseEntidad.PERSONA, PERSONAS.R2), null, 'una persona ausente no se dibuja');
  const codigos: [number, number][] = [[500, EstadoPersona.TRABAJA], [2000, EstadoPersona.CAMINA], [4500, EstadoPersona.PAUSA], [6000, EstadoPersona.LIBRE]];
  for (const [t, c] of codigos) {
    rep.recursos(t, rec);
    assert.equal(rec.personaEstado[g], c, `en t = ${t} ms el estado de P-R1 tiene que ser ${c} y salió ${rec.personaEstado[g]}`);
    assert.equal(rec.personaEstado[PERSONAS.R2], EstadoPersona.AUSENTE);
  }
});

test('caminata entre las dos rectas: por el pasillo, rodeando la curva del lado más corto (como mide el hub), parejo en s y sin entrar al estadio', () => {
  // R02 (s 7,2, abajo) → R03 (s 18, arriba): 10,8 m hacia adelante por la curva derecha (no 19,2 por la izquierda); después R03 → R01
  // (s 4,8): 13,2 m hacia atrás, otra vez por la curva derecha. 1 ms por mm de s, para que los instantes caigan en s redondos.
  const g = PERSONAS.R1;
  const tr = trazaSintetica((s) => {
    s.tramo(g, TipoTramo.PERSONA_TRABAJA, 1, 0, 0, 1000);
    s.tramo(g, TipoTramo.PERSONA_CAMINA, 2, 0, 1000, 11_800);
    s.tramo(g, TipoTramo.PERSONA_TRABAJA, 2, 0, 11_800, 12_000);
    s.tramo(g, TipoTramo.PERSONA_CAMINA, 0, 0, 12_000, 25_200);
    s.tramo(g, TipoTramo.PERSONA_TRABAJA, 0, 0, 25_200, 26_000);
  });
  const rep = crearReproductor(tr), D = rep.disposicion, L = D.lazo, R = L.radio, [x0, y0] = L.origen;
  const off = D.rampas[1].pasillo;
  assert.ok(off > 0 && Math.abs(D.rampas[2].pasillo - off) < 1e-12, `las dos rampas salen hacia afuera con el mismo pasillo (vino ${off} y ${D.rampas[2].pasillo})`);
  const en = (t: number) => { const v = ver(rep, t, ClaseEntidad.PERSONA, g); assert.ok(v, `en t = ${t} ms se esperaba ver a P-R1`); return v; };
  cerca(en(1000), D.rampas[1].persona, 1e-5, 'al salir, en el lugar de la persona de R02');
  cerca(en(11_799), D.rampas[2].persona, 0.002, 'al llegar, en el lugar de la persona de R03');
  cerca(en(25_199), D.rampas[0].persona, 0.002, 'al volver, en el lugar de la persona de R01');
  // s = 12 es la mitad de la curva derecha (de 9 a 15): el punto de más a la derecha del pasillo.
  cerca(en(5800), [x0 + L.recta + R + off, y0 + R], 1e-4, 'a 4,8 m de R02 (s = 12), en la punta de la curva derecha');
  cerca(en(18_000), [x0 + L.recta + R + off, y0 + R], 1e-4, 'a 6 m de R03 hacia atrás (s = 12), en la punta de la curva derecha');
  // En todo el camino: a R + pasillo del eje del estadio (afuera del lazo, nunca encima ni adentro).
  const eje = (x: number, y: number) => {
    const dx = x < x0 ? x - x0 : x > x0 + L.recta ? x - (x0 + L.recta) : 0;
    return Math.sqrt(dx * dx + (y - (y0 + R)) ** 2);
  };
  for (let t = 1000; t < 25_200; t += 200) {
    if (t >= 11_800 && t < 12_000) continue;
    const v = en(t);
    assert.ok(Math.abs(eje(v.x, v.y) - (R + off)) < 1e-4,
      `en t = ${t} ms la persona tiene que ir por el pasillo, a ${(R + off).toFixed(3)} m del eje del estadio, y está a ${eje(v.x, v.y).toFixed(3)} m`);
    assert.ok(v.x > x0 + 4.8 - 1e-6, `en t = ${t} ms la persona tiene que rodear por la curva derecha y está en x = ${v.x.toFixed(3)}`);
  }
});

test('caminata que pasa por el origen del lazo: el lado más corto da la vuelta por s = 0 (s 28 → s 4,8 son 6,8 m, no 23,2)', () => {
  const geo = geometriaSintetica();
  const pc = [0, 0, 0];
  posEnLazo(geo.lazo, 28, pc);
  geo.rampas.push({ id: 'R04', s: 28, lado: -1, x: pc[0], y: pc[1], capacidad: 3, ruta: 'Ruta 03' });
  const g = PERSONAS.R1;
  const tr = trazaSintetica((s) => {
    s.tramo(g, TipoTramo.PERSONA_TRABAJA, 3, 0, 0, 1000);
    s.tramo(g, TipoTramo.PERSONA_CAMINA, 0, 0, 1000, 7800);
    s.tramo(PERSONAS.R2, TipoTramo.PERSONA_CAMINA, 2, 0, 0, 1000); // sin tramo anterior: no sabe de qué rampa salió
  }, { geometria: geo });
  const rep = crearReproductor(tr), D = rep.disposicion;
  const off = D.rampas[0].pasillo;
  const v = ver(rep, 4400, ClaseEntidad.PERSONA, g)!;
  // a mitad del tiempo, 3,4 m después de s = 28: s = 31,4 ≡ 1,4 sobre la recta de abajo, a `pasillo` m hacia −y
  cerca(v, [1.4, -off], 1e-4, 'a mitad de la caminata de R04 a R01, pasando por el origen');
  cerca(ver(rep, 1000, ClaseEntidad.PERSONA, g)!, D.rampas[3].persona, 1e-5, 'al salir, en el lugar de la persona de R04 (en la curva)');
  const otra = ver(rep, 500, ClaseEntidad.PERSONA, PERSONAS.R2);
  assert.ok(otra && Number.isFinite(otra.x) && Number.isFinite(otra.y), 'una caminata sin rampa de salida se dibuja igual (en línea recta desde su lugar)');
});

test('puestos de inducción: induce, espera bandeja, pausa, libre y sin persona', () => {
  const tr = trazaSintetica((s) => {
    lazoEnMarcha(s);
    s.tramo(0, TipoTramo.INDUCCION, 0, PERSONAS.I1, 0, 1000);
    s.tramo(0, TipoTramo.ESPERA_BANDEJA, 0, 1, 1000, 1300, Causa.FALTA_BANDEJA);
    s.tramo(PERSONAS.I1, TipoTramo.PERSONA_TRABAJA, 0, 0, 0, 1000);
    s.tramo(PERSONAS.I1, TipoTramo.PERSONA_PAUSA, 0, 0, 2000, 3000);
    s.paquete(0, { creado: 0, listo: 9000 });
  });
  const rep = crearReproductor(tr), rec = rep.crearEstadoRecursos();
  const estado = (t: number) => { rep.recursos(t, rec); return [rec.puestoEstado[0], rec.puestoEstado[1]]; };
  assert.deepEqual(estado(500), [EstadoPuesto.INDUCE, EstadoPuesto.SIN_PERSONA], 'a los 500 ms el puesto I1 induce; I2 nunca tuvo persona');
  assert.deepEqual(estado(1100), [EstadoPuesto.ESPERA_BANDEJA, EstadoPuesto.SIN_PERSONA]);
  assert.deepEqual(estado(1500), [EstadoPuesto.LIBRE, EstadoPuesto.SIN_PERSONA]);
  assert.deepEqual(estado(2500), [EstadoPuesto.PAUSA, EstadoPuesto.SIN_PERSONA]);
});

test('camiones: en su andén y, mientras esperan, en la playa en orden de llegada', () => {
  const tr = trazaSintetica((s) => {
    s.tramo(0, TipoTramo.CAMION_ANDEN, 1, 800, 0, 600_000);
    s.tramo(2, TipoTramo.CAMION_PLAYA, -1, 0, 200_000, 800_000, Causa.ANDEN_OCUPADO);
    s.tramo(1, TipoTramo.CAMION_PLAYA, -1, 0, 100_000, 700_000, Causa.ANDEN_OCUPADO);
  });
  const rep = crearReproductor(tr), D = rep.disposicion, o = [0, 0];
  const c0 = ver(rep, 300_000, ClaseEntidad.CAMION, 0);
  assert.ok(c0);
  cerca(c0, D.andenes[1].camion, 1e-5, 'el camión T01 en el andén A2');
  assert.equal(c0.estado, EstadoVisual.NORMAL);
  for (const [id, lugar] of [[1, 0], [2, 1]]) {
    const c = ver(rep, 300_000, ClaseEntidad.CAMION, id);
    assert.ok(c, `el camión ${id} espera en la playa`);
    lugarEnPlaya(D.playa, lugar, o);
    cerca(c, o, 1e-5, `camión ${id} en el lugar ${lugar} de la playa (por orden de llegada)`);
    assert.equal(c.estado, EstadoVisual.ESPERANDO);
  }
});

test('jaulas: nivel de la jaula en curso y su número; la capacidad sale de la traza', () => {
  const tr = trazaSintetica((s) => {
    s.tramo(0, TipoTramo.JAULA, 0, 0, 1000, 3_600_000);
    s.tramo(1, TipoTramo.JAULA, 0, 1, 2000, 3_600_000);
    s.tramo(2, TipoTramo.JAULA, 0, 1000, 3000, 3_600_000);
    for (let i = 0; i < 3; i++) s.paquete(i, { creado: 0, listo: 1000 * (i + 1) });
  });
  const rep = crearReproductor(tr), nivel = new Float32Array(3), numero = new Int32Array(3);
  assert.equal(rep.capacidadJaula, 2, 'la jaula 0 se completó con las posiciones 0 y 1');
  rep.jaulas(500, nivel, numero);
  assert.deepEqual([nivel[0], numero[0]], [0, 0]);
  rep.jaulas(1500, nivel, numero);
  assert.deepEqual([nivel[0], numero[0]], [0.5, 0]);
  rep.jaulas(2500, nivel, numero);
  assert.deepEqual([nivel[0], numero[0]], [1, 0]);
  rep.jaulas(3500, nivel, numero);
  assert.deepEqual([nivel[0], numero[0]], [0.5, 1], 'empezó la jaula 1');
  assert.equal(ver(rep, 2500, ClaseEntidad.PAQUETE, 0), null, 'un paquete en la jaula no se dibuja: se cuenta');
});

test('la cola del puesto manual cuenta lo que entró y todavía no salió', () => {
  const tr = trazaSintetica((s) => {
    s.tramo(0, TipoTramo.COLA_MANUAL, 0, 0, 1000, 5000, Causa.NO_LEIDO);
    s.tramo(1, TipoTramo.COLA_MANUAL, 0, 1, 2000, 6000, Causa.NO_TRANSPORTABLE);
    s.tramo(0, TipoTramo.MANUAL, PERSONAS.X1, 0, 5000, 25_000);
    s.paquete(0, { creado: 0, listo: 30_000 });
    s.paquete(1, { creado: 0, listo: 40_000 });
  });
  const rep = crearReproductor(tr);
  assert.equal(rep.colaExcepcion(3000), 2);
  assert.equal(rep.colaExcepcion(5500), 1);
  assert.equal(rep.colaExcepcion(7000), 0);
  assert.equal(verPaquete(rep, 10_000, 0).estado, EstadoVisual.EXCEPCION, 'en el puesto manual: excepción');
});

test('mil paquetes en la cola del puesto manual: una pila acotada junto a la mesa que crece hacia arriba, no una fila que sale del plano', () => {
  // Revisión de la integración (I-3, 23-10-2026): las columnas de la excepción seguían hacia los costados sin límite y, con mil paquetes
  // en la cola, la fila salía del edificio. Ahora es un bloque de PILA_FILAS × PILA_COLUMNAS por capa y las capas suben hasta PILA_CAPAS.
  const N = 1000;
  const tr = trazaSintetica((s) => {
    for (let e = 0; e < N; e++) {
      s.tramo(e, TipoTramo.COLA_MANUAL, 0, e, 1000, 3_000_000, Causa.RAMPA_LLENA);
      s.paquete(e, { creado: 0, listo: -1 });
    }
  });
  const rep = crearReproductor(tr), pos = rep.crearPosiciones();
  rep.posiciones(10_000, pos);
  const X = rep.disposicion.excepcion;
  let paquetes = 0, latMax = 0, zMin = Infinity, zMax = -Infinity;
  const capas = new Set<number>();
  for (let k = 0; k < pos.n; k++) {
    if (pos.clase[k] !== ClaseEntidad.PAQUETE) continue;
    paquetes++;
    const dx = pos.x[k] - X.ini[0], dy = pos.y[k] - X.ini[1];
    latMax = Math.max(latMax, Math.abs(dx * X.lat[0] + dy * X.lat[1]));
    zMin = Math.min(zMin, pos.z[k]); zMax = Math.max(zMax, pos.z[k]);
    capas.add(Math.round((pos.z[k] - zMin) / ALTURA_CAPA_PILA));
    assert.equal(pos.estado[k], EstadoVisual.EXCEPCION, `el paquete ${pos.id[k]} de la cola manual tiene que verse como excepción`);
  }
  assert.equal(paquetes, N, `se esperaban los ${N} paquetes de la cola a la vista y salieron ${paquetes}`);
  const latTope = (Math.floor(PILA_COLUMNAS / 2) + 0.5) * 0.4 + 1e-9;
  assert.ok(latMax <= latTope, `la pila tiene que quedar a ±${latTope.toFixed(2)} m de la mesa a lo ancho y llegó a ${latMax.toFixed(2)} m`);
  assert.ok(Math.abs(zMax - zMin - (PILA_CAPAS - 1) * ALTURA_CAPA_PILA) < 1e-6,
    `con ${N} paquetes (más de ${PILA_FILAS * PILA_COLUMNAS * PILA_CAPAS}) la pila llega a ${PILA_CAPAS} capas: alto ${(zMax - zMin).toFixed(2)} m`);
  assert.equal(rep.recortes, 0, 'ninguna posición de la pila cae fuera de los límites');
  assert.equal(rep.colaExcepcion(10_000), N, 'cuántos son lo cuenta colaExcepcion (lo muestra el tablero)');
  // los primeros 40 ocupan lugares distintos de la capa de abajo
  const o: number[] = [0, 0], vistos = new Set<string>();
  for (let l = 0; l < PILA_FILAS * PILA_COLUMNAS; l++) {
    assert.equal(lugarEnRampa(X, l, true, o), 0, `el lugar ${l} va en la capa 0`);
    vistos.add(`${o[0].toFixed(3)},${o[1].toFixed(3)}`);
  }
  assert.equal(vistos.size, PILA_FILAS * PILA_COLUMNAS, 'cada lugar de una capa es distinto');
  assert.equal(lugarEnRampa(X, PILA_FILAS * PILA_COLUMNAS, true, o), 1, 'el lugar 40 abre la segunda capa');
  assert.equal(lugarEnRampa(X, 10_000, true, o), PILA_CAPAS - 1, 'desde la última capa los lugares se repiten');
});

test('el retén que cubre a alguien hace su rol (REEMPLAZO: r = retén, v = persona cubierta)', () => {
  const tr = trazaSintetica((s) => {
    s.momento(0, TipoMomento.AUSENCIA, PERSONAS.R1, 0);
    s.momento(0, TipoMomento.REEMPLAZO, PERSONAS.T1, PERSONAS.R1);
    s.tramo(PERSONAS.R1, TipoTramo.PERSONA_AUSENTE, -1, 0, 0, 3_600_000);
    s.tramo(PERSONAS.T1, TipoTramo.PERSONA_TRABAJA, 2, 0, 1000, 2000);
  });
  const rep = crearReproductor(tr);
  const v = ver(rep, 1500, ClaseEntidad.PERSONA, PERSONAS.T1);
  assert.ok(v);
  cerca(v, rep.disposicion.rampas[2].persona, 1e-5, 'el retén cubre una rampa: está en la rampa R03');
});

test('el instante se acota a [inicio, fin − 1 ms]; un instante que no es número se rechaza', () => {
  const tr = trazaSintetica((s) => { s.tramo(0, TipoTramo.CINTA, 0, 0, 0, 3_600_000); s.paquete(0, { creado: 0, listo: -1 }); }, { inicio: 0, fin: 3_600_000 });
  const rep = crearReproductor(tr);
  assert.equal(rep.instante(-5000), 0);
  assert.equal(rep.instante(9e9), 3_599_999);
  assert.ok(ver(rep, 9e9, ClaseEntidad.PAQUETE, 0), 'el último cuadro muestra el último milisegundo con algo adentro');
  assert.throws(() => rep.instante(Number.NaN), /el instante tiene que ser un número finito de ms \(vino NaN\)/);
  const p = rep.crearPosiciones();
  assert.throws(() => rep.posiciones(Number.POSITIVE_INFINITY, p), /número finito/);
});

test('Posiciones demasiado chicas se rechazan diciendo cuántas entran', () => {
  const tr = trazaSintetica((s) => { for (let i = 0; i < 3; i++) { s.tramo(i, TipoTramo.CINTA, 0, 0, 0, 10_000); s.paquete(i, { creado: 0, listo: 20_000 }); } });
  const rep = crearReproductor(tr);
  const chica: Posiciones = { n: 0, x: new Float32Array(2), y: new Float32Array(2), ang: new Float32Array(2), estado: new Uint8Array(2), clase: new Uint8Array(2), id: new Int32Array(2) };
  assert.throws(() => rep.posiciones(5000, chica), /Posiciones tiene lugar para 2 entidades y hay más/);
  const grande = rep.crearPosiciones();
  rep.posiciones(5000, grande);
  assert.ok(grande.n <= rep.maxVisibles && grande.x.length === rep.maxVisibles);
});

test('una traza mal formada se rechaza diciendo qué se esperaba y qué vino', () => {
  const tr = trazaSintetica((s) => { s.tramo(0, TipoTramo.CINTA, 0, 0, 0, 1000); s.paquete(0, { creado: 0, listo: 2000 }); });
  assert.throws(() => crearReproductor({ ...tr, version: 2 } as unknown as Traza), /se esperaba una traza versión 1 y vino 2/);
  const corta = { ...tr, tramos: { ...tr.tramos, t1: new Float64Array(0) } };
  assert.throws(() => crearReproductor(corta), /la columna de tramos «t1» tiene 0 elemento\(s\) y la traza dice n = 1/);
  assert.throws(() => crearReproductor({ ...tr, fin: Number.NaN }), /inicio y fin de la traza tienen que ser finitos/);
  assert.throws(() => crearReproductor({ ...tr, geometria: { ...tr.geometria, estaciones: [] } }), /no tiene estaciones de inducción/);
});

test('tramos de una entidad desordenados en la traza: el reproductor los ordena y dibuja igual', () => {
  const g = PERSONAS.R1;
  const ordenada = trazaSintetica((s) => {
    s.tramo(g, TipoTramo.PERSONA_TRABAJA, 0, 0, 0, 1000);
    s.tramo(g, TipoTramo.PERSONA_TRABAJA, 2, 0, 5000, 6000);
  });
  const desordenada = trazaSintetica((s) => {
    s.tramo(g, TipoTramo.PERSONA_TRABAJA, 2, 0, 5000, 6000);
    s.tramo(g, TipoTramo.PERSONA_TRABAJA, 0, 0, 0, 1000);
  });
  const a = crearReproductor(ordenada), b = crearReproductor(desordenada);
  for (const t of [500, 3000, 5500, 7000]) {
    const va = ver(a, t, ClaseEntidad.PERSONA, g), vb = ver(b, t, ClaseEntidad.PERSONA, g);
    assert.ok(va && vb);
    cerca(vb, [va.x, va.y], 1e-6, `en t = ${t} ms la persona tiene que estar en el mismo lugar con los tramos en cualquier orden`);
  }
});
