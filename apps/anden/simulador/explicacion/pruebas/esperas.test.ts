// Esperas con taxonomía cerrada: cada causa se detecta en su traza sintética, y ninguna espera sale de la taxonomía.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Causa, ClaseEntidad, TipoMomento, TipoTramo, refDe } from '../../contratos/traza.ts';
import { trazaDeMaqueta } from '../../contratos/fixtures/traza-maqueta.ts';
import { CAUSAS_DE_LA_TAXONOMIA, esperasDe } from '../esperas.ts';
import { ConstructorTraza, H22, MIN, PERSONA, hm, viaje, viajeNormal } from './ayudas.ts';

const T0 = H22 + 10 * MIN;

test('FILA: la espera en la acumulación', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(3000).cinta(40000).fila(10 * MIN).induccion(3000).bandeja(30000).rampa(8000, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  const t = c.construir();
  const e = esperasDe(t, ClaseEntidad.PAQUETE, v.id);
  assert.equal(e.length, 2, `se esperaban la fila y la espera de 8 s en la rampa y llegaron ${JSON.stringify(e.map((x) => x.causa))}`);
  assert.equal(e[0].causa, Causa.FILA);
  assert.equal(e[0].donde, TipoTramo.ACUMULACION);
  assert.equal(e[0].hasta - e[0].desde, 10 * MIN);
  assert.equal(e[0].causante, -1);
  assert.deepEqual(e[0].evidencia, [2]);   // el tercer tramo del paquete (índices 0 descarga, 1 cinta, 2 acumulación)
  assert.equal(t.tramos.k[e[0].evidencia[0]], TipoTramo.ACUMULACION);
});

test('BLOQUEO: la descarga con causa BLOQUEO', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(8 * MIN, 1, true).cinta(40000).fila(1000).induccion(3000).bandeja(30000).rampa(1000, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  const e = esperasDe(c.construir(), ClaseEntidad.PAQUETE, v.id);
  assert.equal(e.length, 1);
  assert.equal(e[0].causa, Causa.BLOQUEO);
  assert.equal(e[0].donde, TipoTramo.DESCARGA);
  assert.equal(e[0].recurso, 1);
});

test('FALTA_BANDEJA: espera de bandeja sin el lazo detenido; con menos de la mitad detenido sigue siendo falta de bandeja', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(3000).cinta(40000).fila(1000).induccion(3000).esperaBandeja(4 * MIN).bandeja(30000).rampa(1000, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  assert.equal(esperasDe(c.construir(), ClaseEntidad.PAQUETE, v.id).filter((e) => e.donde === TipoTramo.ESPERA_BANDEJA)[0].causa, Causa.FALTA_BANDEJA);

  // 10 de 30 minutos con el lazo detenido: un tercio, no más de la mitad
  const c2 = new ConstructorTraza();
  const v2 = viaje(c2, T0).descarga(3000).cinta(40000).fila(1000).induccion(3000).esperaBandeja(30 * MIN).bandeja(30000).rampa(1000, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  c2.tramo(-1, TipoTramo.LAZO_DETENIDO, 0, 100, T0 + 20 * MIN, T0 + 30 * MIN + 1000, Causa.FALLA);
  const e2 = esperasDe(c2.construir(), ClaseEntidad.PAQUETE, v2.id).filter((e) => e.donde === TipoTramo.ESPERA_BANDEJA);
  assert.equal(e2[0].causa, Causa.FALTA_BANDEJA);
});

test('FALLA: más de la mitad de la espera de bandeja coincide con el lazo detenido (exactamente la mitad no alcanza)', () => {
  const armar = (detenidoMin: number) => {
    const c = new ConstructorTraza();
    const v = viaje(c, T0).descarga(3000).cinta(40000).fila(1000).induccion(3000).esperaBandeja(30 * MIN).bandeja(30000).rampa(1000, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
    const det = c.tramo(-1, TipoTramo.LAZO_DETENIDO, 0, 100, T0 + 1000 + 40000 + 1000 + 3000 + 5 * MIN - 1000 + 0, T0 + 1000 + 40000 + 1000 + 3000 + 5 * MIN - 1000 + detenidoMin * MIN, Causa.FALLA);
    return { t: c.construir(), id: v.id, det };
  };
  const mas = armar(20);
  const emas = esperasDe(mas.t, ClaseEntidad.PAQUETE, mas.id).filter((e) => e.donde === TipoTramo.ESPERA_BANDEJA);
  assert.equal(emas[0].causa, Causa.FALLA);
  assert.equal(emas[0].causante, refDe(ClaseEntidad.EQUIPO, 0));
  assert.deepEqual(emas[0].evidencia.slice(1), [mas.det], 'la evidencia incluye el tramo del lazo detenido');
  const mitad = armar(15);   // los 15 minutos caen enteros adentro de la espera: exactamente la mitad
  const emitad = esperasDe(mitad.t, ClaseEntidad.PAQUETE, mitad.id).filter((e) => e.donde === TipoTramo.ESPERA_BANDEJA);
  assert.equal(emitad[0].causa, Causa.FALTA_BANDEJA, 'la mitad justa no alcanza para decir que fue la falla');
});

test('RAMPA_LLENA: cada vuelta extra, con la rampa como causante', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(3000).cinta(40000).fila(1000).induccion(3000).bandeja(30000).vuelta(90000, 1, 1).vuelta(90000, 2, 1).rampa(1000, 1, PERSONA.R2).mano(3000, PERSONA.R2, 1).jaula(1);
  const e = esperasDe(c.construir(), ClaseEntidad.PAQUETE, v.id).filter((x) => x.causa === Causa.RAMPA_LLENA);
  assert.equal(e.length, 2);
  for (const x of e) {
    assert.equal(x.donde, TipoTramo.BANDEJA);
    assert.equal(x.causante, refDe(ClaseEntidad.RAMPA, 1));
  }
});

/** Un paquete que espera `espera` en la rampa 0 atendida por la persona R1, a partir de T0; devuelve la traza lista para agregarle actividad. */
function esperaEnRampa(c: ConstructorTraza, persona: number = PERSONA.R1, espera = 20 * MIN) {
  const v = viaje(c, T0).descarga(1000).cinta(1000).fila(1000).induccion(1000).bandeja(1000);
  const desde = v.t;
  v.rampa(espera, 0, persona).mano(3000, persona).jaula(0);
  return { v, desde, hasta: desde + espera };
}

test('PAUSA, AUSENCIA, CIERRE_JAULA y PERSONA_OCUPADA: según lo que hacía la persona asignada durante la espera en la rampa', () => {
  const casos: { nombre: string; causa: number; armar: (c: ConstructorTraza, desde: number, hasta: number) => number[] }[] = [
    { nombre: 'pausa', causa: Causa.PAUSA, armar: (c, d) => [c.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, d + 5 * MIN, d + 20 * MIN)] },
    { nombre: 'ausente', causa: Causa.AUSENCIA, armar: (c) => [c.tramo(PERSONA.R1, TipoTramo.PERSONA_AUSENTE, -1, 0, H22, H22 + 8 * 60 * MIN)] },
    { nombre: 'cierre de jaula', causa: Causa.CIERRE_JAULA, armar: (c, d) => [c.tramo(PERSONA.R1, TipoTramo.PERSONA_CIERRA_JAULA, 0, 0, d + 2 * MIN, d + 5 * MIN)] },
    { nombre: 'ocupada', causa: Causa.PERSONA_OCUPADA, armar: (c, d, h) => [c.tramo(PERSONA.R1, TipoTramo.PERSONA_TRABAJA, 1, 77, d, h)] },
  ];
  for (const caso of casos) {
    const c = new ConstructorTraza();
    const { v } = esperaEnRampa(c);
    const desde = c.construir().tramos.t0.length; void desde;
    const t0 = T0 + 5000;          // la espera empieza justo después de los pasos previos (1 s cada uno)
    const prueba = caso.armar(c, t0, t0 + 20 * MIN);
    const t = c.construir();
    const e = esperasDe(t, ClaseEntidad.PAQUETE, v.id).filter((x) => x.donde === TipoTramo.RAMPA);
    assert.equal(e.length, 1, caso.nombre);
    assert.equal(e[0].causa, caso.causa, `${caso.nombre}: se esperaba la causa ${caso.causa} y llegó ${e[0].causa}`);
    assert.equal(e[0].causante, refDe(ClaseEntidad.PERSONA, PERSONA.R1), caso.nombre);
    if (caso.causa !== Causa.PERSONA_OCUPADA) assert.deepEqual(e[0].evidencia.slice(1), prueba, `${caso.nombre}: la evidencia trae el tramo de la persona`);
    else assert.deepEqual(e[0].evidencia.length, 1);
  }
});

test('la persona asignada hizo varias cosas durante la espera: gana la de más solape; a igual solape, pausa antes que cierre', () => {
  const c = new ConstructorTraza();
  const { v } = esperaEnRampa(c);
  const d = T0 + 5000;
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, d + 2 * MIN, d + 7 * MIN);           // 5 min de pausa
  const cierre = c.tramo(PERSONA.R1, TipoTramo.PERSONA_CIERRA_JAULA, 0, 0, d + 10 * MIN, d + 18 * MIN);   // 8 min de cierre
  const e = esperasDe(c.construir(), ClaseEntidad.PAQUETE, v.id).filter((x) => x.donde === TipoTramo.RAMPA);
  assert.equal(e[0].causa, Causa.CIERRE_JAULA);
  assert.deepEqual(e[0].evidencia.slice(1), [cierre]);

  const c2 = new ConstructorTraza();
  const { v: v2 } = esperaEnRampa(c2);
  c2.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, d + 1 * MIN, d + 6 * MIN);          // 5 min
  c2.tramo(PERSONA.R1, TipoTramo.PERSONA_CIERRA_JAULA, 0, 0, d + 10 * MIN, d + 15 * MIN); // 5 min
  const e2 = esperasDe(c2.construir(), ClaseEntidad.PAQUETE, v2.id).filter((x) => x.donde === TipoTramo.RAMPA);
  assert.equal(e2[0].causa, Causa.PAUSA, 'el empate se resuelve a favor de la pausa');
});

test('una pausa de la persona ANTES o DESPUÉS de la espera no cuenta', () => {
  const c = new ConstructorTraza();
  const { v } = esperaEnRampa(c);
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, H22, T0 + 5000);                      // termina justo cuando empieza la espera
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, T0 + 5000 + 20 * MIN, T0 + 5000 + 40 * MIN);   // empieza justo cuando termina
  const e = esperasDe(c.construir(), ClaseEntidad.PAQUETE, v.id).filter((x) => x.donde === TipoTramo.RAMPA);
  assert.equal(e[0].causa, Causa.PERSONA_OCUPADA);
});

test('una espera en rampa sin persona asignada (q = −1) es PERSONA_OCUPADA con causante −1', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(1000).cinta(1000).fila(1000).induccion(1000).bandeja(1000);
  c.tramo(v.id, TipoTramo.RAMPA, 0, 1, v.t, v.t + 5 * MIN, Causa.NINGUNA, -1);
  const e = esperasDe(c.construir(), ClaseEntidad.PAQUETE, v.id).filter((x) => x.donde === TipoTramo.RAMPA);
  assert.equal(e[0].causa, Causa.PERSONA_OCUPADA);
  assert.equal(e[0].causante, -1);
});

test('COLA_MANUAL: NO_LEIDO, NO_TRANSPORTABLE y RAMPA_LLENA (con la rampa de la última vuelta como causante)', () => {
  const c = new ConstructorTraza();
  const a = viaje(c, T0).descarga(1000).cinta(1000).fila(1000).induccion(1000).bandeja(1000).colaManual(6 * MIN, Causa.NO_LEIDO).manual(20000).jaula(0);
  const b = viaje(c, T0).descarga(1000).cinta(1000).fila(1000).colaManual(7 * MIN, Causa.NO_TRANSPORTABLE).manual(20000).jaula(0);
  const d = viaje(c, T0).descarga(1000).cinta(1000).fila(1000).induccion(1000).bandeja(1000).vuelta(90000, 1, 2).vuelta(90000, 2, 2).vuelta(90000, 3, 2).colaManual(8 * MIN, Causa.RAMPA_LLENA).manual(20000).jaula(2);
  const t = c.construir();
  const cola = (id: number) => esperasDe(t, ClaseEntidad.PAQUETE, id).filter((x) => x.donde === TipoTramo.COLA_MANUAL);
  assert.equal(cola(a.id)[0].causa, Causa.NO_LEIDO);
  assert.equal(cola(b.id)[0].causa, Causa.NO_TRANSPORTABLE);
  assert.equal(cola(d.id)[0].causa, Causa.RAMPA_LLENA);
  assert.equal(cola(d.id)[0].causante, refDe(ClaseEntidad.RAMPA, 2), 'la rampa llena sale de la última vuelta extra');
});

test('CAMION_PLAYA con ANDEN_OCUPADO es una espera del camión; sin esa causa no', () => {
  const c = new ConstructorTraza();
  c.tramo(0, TipoTramo.CAMION_PLAYA, -1, 0, H22, H22 + 12 * MIN, Causa.ANDEN_OCUPADO);
  c.tramo(0, TipoTramo.CAMION_ANDEN, 1, 800, H22 + 12 * MIN, H22 + 60 * MIN);
  c.tramo(1, TipoTramo.CAMION_PLAYA, -1, 0, H22, H22 + 12 * MIN, Causa.NINGUNA);
  const t = c.construir();
  const e = esperasDe(t, ClaseEntidad.CAMION, 0);
  assert.equal(e.length, 1);
  assert.equal(e[0].causa, Causa.ANDEN_OCUPADO);
  assert.equal(e[0].donde, TipoTramo.CAMION_PLAYA);
  assert.deepEqual(esperasDe(t, ClaseEntidad.CAMION, 1), []);
});

test('persona: pausa, ausencia y cierre de jaula; puesto: pausas y ausencias de su gente; lazo: detenciones', () => {
  const c = new ConstructorTraza();
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_TRABAJA, 0, 5, H22, H22 + 30 * MIN);
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, H22 + 30 * MIN, H22 + 45 * MIN);
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_CIERRA_JAULA, 0, 0, H22 + 50 * MIN, H22 + 51 * MIN);
  c.tramo(PERSONA.I1, TipoTramo.PERSONA_PAUSA, 0, 0, H22 + 100 * MIN, H22 + 115 * MIN);   // puesto 0
  c.tramo(PERSONA.I2, TipoTramo.PERSONA_AUSENTE, 1, 0, H22, H22 + 8 * 60 * MIN);           // puesto 1
  c.tramo(PERSONA.R2, TipoTramo.PERSONA_PAUSA, 1, 0, H22 + 200 * MIN, H22 + 215 * MIN);   // de rampa: no es del puesto 1 aunque r = 1
  c.tramo(-1, TipoTramo.LAZO_DETENIDO, 0, 3, H22 + 70 * MIN, H22 + 110 * MIN, Causa.FALLA);
  const t = c.construir();
  assert.deepEqual(esperasDe(t, ClaseEntidad.PERSONA, PERSONA.R1).map((e) => e.causa), [Causa.PAUSA, Causa.CIERRE_JAULA]);
  assert.deepEqual(esperasDe(t, ClaseEntidad.PUESTO, 0).map((e) => e.causa), [Causa.PAUSA]);
  assert.deepEqual(esperasDe(t, ClaseEntidad.PUESTO, 1).map((e) => e.causa), [Causa.AUSENCIA]);
  const lazo = esperasDe(t, ClaseEntidad.EQUIPO, 0);
  assert.equal(lazo.length, 1);
  assert.equal(lazo[0].causa, Causa.FALLA);
  assert.equal(lazo[0].hasta - lazo[0].desde, 40 * MIN);
});

test('rampa: los lapsos entre RAMPA_LLENA y RAMPA_LIBERA, con las vueltas que causó como evidencia', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(1000).cinta(1000).fila(1000).induccion(1000).bandeja(1000).vuelta(90000, 1, 1).rampa(1000, 1, PERSONA.R2).mano(3000, PERSONA.R2, 1).jaula(1);
  c.momento(T0 + 2 * MIN, TipoMomento.RAMPA_LLENA, 1, 20);
  c.momento(T0 + 9 * MIN, TipoMomento.RAMPA_LIBERA, 1, 19);
  c.momento(T0 + 3 * MIN, TipoMomento.RAMPA_LLENA, 2, 20);      // otra rampa: no cuenta
  c.momento(T0 + 20 * MIN, TipoMomento.RAMPA_LLENA, 1, 20);     // queda llena hasta el final
  const t = c.construir();
  const e = esperasDe(t, ClaseEntidad.RAMPA, 1);
  assert.equal(e.length, 2);
  assert.equal(e[0].hasta - e[0].desde, 7 * MIN);
  assert.equal(e[1].hasta, t.fin, 'la que no se liberó dura hasta el fin de la traza');
  assert.ok(e.every((x) => x.causa === Causa.RAMPA_LLENA && x.causante === refDe(ClaseEntidad.RAMPA, 1)));
  assert.equal(e[0].evidencia.length, 1, 'la vuelta extra del paquete cae dentro del primer lapso');
  assert.equal(t.tramos.k[e[0].evidencia[0]], TipoTramo.BANDEJA);
  void v;
});

test('las esperas vienen ordenadas por inicio y sin duración cero; un paquete inexistente no tiene esperas', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(3000).cinta(1000).fila(0).induccion(1000).esperaBandeja(0).bandeja(1000).vuelta(60000, 1, 0).rampa(5 * MIN, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  const t = c.construir();
  const e = esperasDe(t, ClaseEntidad.PAQUETE, v.id);
  assert.deepEqual(e.map((x) => x.causa), [Causa.RAMPA_LLENA, Causa.PERSONA_OCUPADA]);
  assert.ok(e.every((x, i) => x.hasta > x.desde && (i === 0 || e[i - 1].desde <= x.desde)));
  assert.deepEqual(esperasDe(t, ClaseEntidad.PAQUETE, 9999), []);
  assert.deepEqual(esperasDe(t, ClaseEntidad.PAQUETE, -1), []);
});

test('los tramos escritos en cualquier orden dan las mismas esperas (la traza viene por orden de cierre, no de inicio)', () => {
  const armar = (invertido: boolean) => {
    const c = new ConstructorTraza();
    const pasos: [number, number, number][] = [[TipoTramo.ACUMULACION, T0, T0 + 6 * MIN], [TipoTramo.INDUCCION, T0 + 6 * MIN, T0 + 6 * MIN + 3000], [TipoTramo.RAMPA, T0 + 7 * MIN, T0 + 15 * MIN]];
    const id = c.paquete(0, 0, T0);
    for (const [k, a, b] of invertido ? [...pasos].reverse() : pasos) c.tramo(id, k, 0, 1, a, b, k === TipoTramo.ACUMULACION ? Causa.FILA : Causa.NINGUNA, k === TipoTramo.RAMPA ? refDe(ClaseEntidad.PERSONA, PERSONA.R1) : -1);
    return esperasDe(c.construir(), ClaseEntidad.PAQUETE, id).map((x) => [x.causa, x.desde, x.hasta]);
  };
  assert.deepEqual(armar(true), armar(false));
});

test('ninguna espera sale de la taxonomía: en todas las trazas sintéticas y en 3.000 paquetes de la maqueta', () => {
  const c = new ConstructorTraza();
  viajeNormal(c, T0); viajeNormal(c, T0 + 1000);
  viaje(c, T0).descarga(8 * MIN, 0, true).cinta(1000).fila(7 * MIN).induccion(1000).esperaBandeja(9 * MIN).bandeja(1000).vuelta(60000, 1, 0).rampa(9 * MIN, 0, PERSONA.R1).mano(1000, PERSONA.R1).jaula(0);
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, T0 + 10 * MIN, T0 + 30 * MIN);
  const t = c.construir();
  const vistas = new Set<number>();
  for (let id = 0; id < t.paquetes.n; id++) for (const e of esperasDe(t, ClaseEntidad.PAQUETE, id)) {
    vistas.add(e.causa);
    assert.ok(CAUSAS_DE_LA_TAXONOMIA.includes(e.causa), `causa ${e.causa} fuera de la taxonomía`);
    assert.ok(e.evidencia.length >= 1 && e.evidencia.every((i) => i >= 0 && i < t.tramos.n), 'la evidencia apunta a tramos que existen');
    assert.equal(e.evidencia[0] >= 0 && t.tramos.t0[e.evidencia[0]], e.desde, 'el primer tramo de la evidencia es la espera misma');
  }
  assert.ok(vistas.size >= 5, `solo se vieron ${vistas.size} causas distintas`);

  const m = trazaDeMaqueta(2);
  const causasMaqueta = new Set<number>();
  for (let id = 0; id < 3000; id++) for (const e of esperasDe(m, ClaseEntidad.PAQUETE, id * 8)) {
    causasMaqueta.add(e.causa);
    assert.ok(CAUSAS_DE_LA_TAXONOMIA.includes(e.causa));
    assert.ok(e.hasta > e.desde);
    assert.ok(e.evidencia.every((i) => i >= 0 && i < m.tramos.n));
  }
  assert.ok(causasMaqueta.has(Causa.FILA), 'la maqueta tiene paquetes que esperan en la fila');
});

test('la hora de las esperas es la del tramo (referencia de tiempo del turno)', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, hm(23, 50)).descarga(1000).cinta(1000).fila(6 * MIN).induccion(1000).bandeja(1000).rampa(1000, 0, PERSONA.R1).mano(1000, PERSONA.R1).jaula(0);
  const e = esperasDe(c.construir(), ClaseEntidad.PAQUETE, v.id);
  assert.equal(e[0].desde, hm(23, 50) + 2000);
});
