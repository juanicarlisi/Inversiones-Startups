// Biografía: pasos encadenados con hora y duración, esperas tipadas sin decir «por culpa de», y cada cifra atada a un tramo de la traza.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Causa, ClaseEntidad, TipoMomento, TipoTramo, refDe } from '../../contratos/traza.ts';
import type { Traza } from '../../contratos/traza.ts';
import type { AlmacenResultados, Biografia, Frase } from '../../contratos/explicacion.ts';
import { trazaDeMaqueta } from '../../contratos/fixtures/traza-maqueta.ts';
import { armarBiografia, ESPERA_MINIMA_MS } from '../biografia.ts';
import { verificarFrases } from '../verificador.ts';
import { ConstructorTraza, H22, MIN, PERSONA, hm, modeloEjemplo, viaje } from './ayudas.ts';

const T0 = H22 + 10 * MIN;
const modelo = modeloEjemplo();
const es: Record<string, string> = JSON.parse(readFileSync(new URL('../textos.es.json', import.meta.url), 'utf8'));

/** El texto de una frase en español, como lo armaría la interfaz (números con coma decimal). */
function texto(f: Frase): string {
  return es[f.clave].replace(/\{(\w+)\}/g, (_, n: string) => {
    const v = f.vars[n];
    return typeof v === 'number' ? String(v).replace('.', ',') : String(v);
  });
}
const almacen = (t: Traza): AlmacenResultados => ({ experimentos: {}, trazas: { noche: t }, modelo });
const todasLasFrases = (b: Biografia): Frase[] => [b.titulo, ...b.pasos.map((p) => p.frase), ...b.causas];
function verificada(t: Traza, b: Biografia): void {
  const v = verificarFrases(todasLasFrases(b), almacen(t), 'noche');
  assert.deepEqual(v.fallas, [], `las cifras de la biografía tienen que salir de la traza: ${JSON.stringify(v.fallas)}`);
}

test('un paquete con el viaje completo: un paso por tramo, en orden, con la hora y los minutos, y la espera tipada en los que esperan', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, hm(23, 0), { camion: 1, indice: 233, ruta: 2, clase: 1 })
    .descarga(3000, 1, false, 1).cinta(40000).fila(6 * MIN).induccion(3000, PERSONA.I2, 1).esperaBandeja(90000).bandeja(30000)
    .vuelta(60000, 1, 1).vuelta(60000, 2, 1).rampa(10 * MIN, 1, PERSONA.R2).mano(3000, PERSONA.R2, 1).jaula(1);
  c.tramo(PERSONA.R2, TipoTramo.PERSONA_PAUSA, 1, 0, hm(23, 0) + 4 * MIN, hm(23, 0) + 25 * MIN);
  const t = c.construir({ corte: hm(24, 30) });
  const b = armarBiografia(t, modelo, ClaseEntidad.PAQUETE, v.id);

  assert.equal(b.clase, ClaseEntidad.PAQUETE);
  assert.equal(b.id, v.id);
  assert.equal(b.titulo.clave, 'explicacion.titulo.paquete');
  assert.deepEqual(b.titulo.vars, { indice: '233', camion: 'T02', ruta: 'Ruta 03', tamano: 'mediano' });
  assert.deepEqual(b.causas, [], 'ArmarBiografia es síncrona y no simula: las causas confirmadas las agrega CausasConfirmadas');
  assert.deepEqual(b.pasos.map((p) => p.frase.clave), [
    'explicacion.paso.descarga', 'explicacion.paso.cinta', 'explicacion.paso.acumulacion', 'explicacion.paso.induccion',
    'explicacion.paso.espera_bandeja', 'explicacion.paso.bandeja', 'explicacion.paso.vuelta', 'explicacion.paso.vuelta',
    'explicacion.paso.rampa.pausa', 'explicacion.paso.mano', 'explicacion.paso.jaula.antes_del_corte',
  ]);
  // los textos, tal como se leen
  assert.equal(texto(b.pasos[0].frase), 'Empezó a bajar del camión T02 por el andén A2 a las 23:00.');
  assert.equal(texto(b.pasos[2].frase), 'Esperó 6 min en la fila antes de la inducción.');
  assert.equal(texto(b.pasos[3].frase), 'Lo indujo P-I2 en el puesto I2.');
  assert.equal(texto(b.pasos[4].frase), 'Esperó 1,5 min una bandeja libre.');
  assert.equal(texto(b.pasos[6].frase), 'Dio la vuelta número 1 porque la rampa R02 estaba llena.');
  assert.equal(texto(b.pasos[7].frase), 'Dio la vuelta número 2 porque la rampa R02 estaba llena.');
  assert.equal(texto(b.pasos[8].frase), 'Esperó 10 min en la rampa R02: P-R2 estaba en pausa.');
  assert.match(texto(b.pasos[10].frase), /Entró a la jaula de la rampa R02 a las \d\d:\d\d, antes del corte\./);
  verificada(t, b);
});

test('los pasos van encadenados: cada uno empieza donde terminó el anterior, sin solapes ni huecos', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(3000).cinta(40000).fila(6 * MIN).induccion(3000).bandeja(30000).vuelta(60000, 1, 0).rampa(8 * MIN, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  const t = c.construir();
  const b = armarBiografia(t, modelo, ClaseEntidad.PAQUETE, v.id);
  assert.equal(b.pasos.length, 9);
  assert.equal(b.pasos[0].desde, T0, 'el primer paso empieza cuando nació el paquete');
  for (let i = 1; i < b.pasos.length; i++) {
    assert.equal(b.pasos[i].desde, b.pasos[i - 1].hasta, `el paso ${i} (${b.pasos[i].frase.clave}) tiene que empezar donde terminó el ${i - 1}`);
    assert.ok(b.pasos[i].hasta >= b.pasos[i].desde);
  }
  assert.equal(b.pasos[b.pasos.length - 1].desde, b.pasos[b.pasos.length - 1].hasta, 'entrar a la jaula es un instante');
  assert.equal(b.pasos[b.pasos.length - 1].hasta, T0 + 3000 + 40000 + 6 * MIN + 3000 + 30000 + 60000 + 8 * MIN + 3000);
  verificada(t, b);
});

test('las esperas se adjuntan al paso con su tipo; los pasos que no esperan no llevan espera', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(3000).cinta(40000).fila(6 * MIN).induccion(3000).bandeja(30000).rampa(8 * MIN, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  const t = c.construir();
  const b = armarBiografia(t, modelo, ClaseEntidad.PAQUETE, v.id);
  const porClave = new Map(b.pasos.map((p) => [p.frase.clave, p]));
  assert.equal(porClave.get('explicacion.paso.acumulacion')!.espera?.causa, Causa.FILA);
  assert.equal(porClave.get('explicacion.paso.rampa.ocupada')!.espera?.causa, Causa.PERSONA_OCUPADA);
  for (const clave of ['explicacion.paso.cinta', 'explicacion.paso.induccion', 'explicacion.paso.mano', 'explicacion.paso.bandeja']) {
    assert.equal(porClave.get(clave)!.espera, null, clave);
  }
  // una espera que el paso trae es la misma que da esperasDe (la evidencia apunta al tramo del paso)
  const fila = porClave.get('explicacion.paso.acumulacion')!;
  assert.equal(t.tramos.t0[fila.espera!.evidencia[0]], fila.desde);
});

test('la biografía describe esperas pero nunca afirma una causa: ninguna frase de paso es una frase de causa confirmada', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(3000).cinta(40000).fila(6 * MIN).induccion(3000).esperaBandeja(9 * MIN).bandeja(30000).vuelta(60000, 1, 0).rampa(15 * MIN, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, T0 + 8 * MIN, T0 + 40 * MIN);
  const t = c.construir();
  const b = armarBiografia(t, modelo, ClaseEntidad.PAQUETE, v.id);
  for (const p of b.pasos) {
    assert.doesNotMatch(p.frase.clave, /^explicacion\.causa\./, 'un paso describe; la causa es de CausasConfirmadas');
    assert.doesNotMatch(texto(p.frase), /Confirmado|por culpa|gracias a/i);
  }
  assert.deepEqual(b.causas, []);
});

test('cada causa de rampa tiene su frase de paso: pausa, ausencia, cierre de jaula y persona ocupada', () => {
  const casos: [string, (c: ConstructorTraza, d: number) => void, string][] = [
    ['pausa', (c, d) => { c.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, d, d + 20 * MIN); }, 'explicacion.paso.rampa.pausa'],
    ['ausencia', (c) => { c.tramo(PERSONA.R1, TipoTramo.PERSONA_AUSENTE, -1, 0, H22, H22 + 8 * 60 * MIN); }, 'explicacion.paso.rampa.ausencia'],
    ['cierre', (c, d) => { c.tramo(PERSONA.R1, TipoTramo.PERSONA_CIERRA_JAULA, 0, 0, d, d + 20 * MIN); }, 'explicacion.paso.rampa.cierre_jaula'],
    ['ocupada', () => {}, 'explicacion.paso.rampa.ocupada'],
  ];
  for (const [nombre, agregar, clave] of casos) {
    const c = new ConstructorTraza();
    const v = viaje(c, T0).descarga(1000).cinta(1000).fila(1000).induccion(1000).bandeja(1000);
    const d = v.t;
    v.rampa(20 * MIN, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
    agregar(c, d);
    const b = armarBiografia(c.construir(), modelo, ClaseEntidad.PAQUETE, v.id);
    assert.ok(b.pasos.some((p) => p.frase.clave === clave), `${nombre}: se esperaba un paso ${clave} y hay [${b.pasos.map((p) => p.frase.clave).join(', ')}]`);
  }
});

test('las esperas de menos de 3 segundos no son un paso (el hueco que dejan es menor que ese umbral)', () => {
  assert.equal(ESPERA_MINIMA_MS, 3000);
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(3000).cinta(40000).fila(2999).induccion(3000).bandeja(30000).rampa(1000, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  const t = c.construir();
  const b = armarBiografia(t, modelo, ClaseEntidad.PAQUETE, v.id);
  assert.deepEqual(b.pasos.map((p) => p.frase.clave), [
    'explicacion.paso.descarga', 'explicacion.paso.cinta', 'explicacion.paso.induccion', 'explicacion.paso.bandeja', 'explicacion.paso.mano', 'explicacion.paso.jaula.antes_del_corte',
  ]);
  for (let i = 1; i < b.pasos.length; i++) assert.ok(b.pasos[i].desde - b.pasos[i - 1].hasta < ESPERA_MINIMA_MS, `hueco entre ${i - 1} y ${i}`);
  // justo 3 segundos sí es un paso
  const c2 = new ConstructorTraza();
  const w = viaje(c2, T0).descarga(3000).cinta(40000).fila(3000).induccion(3000).bandeja(30000).rampa(1000, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  assert.ok(armarBiografia(c2.construir(), modelo, ClaseEntidad.PAQUETE, w.id).pasos.some((p) => p.frase.clave === 'explicacion.paso.acumulacion'));
});

test('bloqueo en la descarga, cola manual, puesto manual y paquete que no terminó la noche', () => {
  const c = new ConstructorTraza();
  const a = viaje(c, T0).descarga(8 * MIN, 1, true).cinta(40000).fila(1000).colaManual(6 * MIN, Causa.NO_LEIDO).manual(20000).jaula(0);
  const b2 = viaje(c, T0).descarga(2000).cinta(1000).fila(1000).colaManual(7 * MIN, Causa.NO_TRANSPORTABLE).manual(20000).jaula(0);
  const d = viaje(c, T0).descarga(2000).cinta(1000).fila(1000).induccion(1000).bandeja(1000).vuelta(60000, 3, 2).colaManual(5 * MIN, Causa.RAMPA_LLENA);
  const t = c.construir();
  const ba = armarBiografia(t, modelo, ClaseEntidad.PAQUETE, a.id);
  assert.equal(texto(ba.pasos[0].frase), 'La descarga en el andén A2 tardó 8 min porque se frenó con la acumulación llena.');
  assert.equal(ba.pasos[0].espera?.causa, Causa.BLOQUEO);
  assert.ok(ba.pasos.some((p) => p.frase.clave === 'explicacion.paso.cola_manual.no_leido'));
  assert.ok(ba.pasos.some((p) => p.frase.clave === 'explicacion.paso.manual'));
  assert.equal(texto(armarBiografia(t, modelo, ClaseEntidad.PAQUETE, b2.id).pasos.find((p) => p.frase.clave.includes('no_transportable'))!.frase),
    'No puede ir por el sorter: esperó 7 min en la cola del puesto manual.');
  const bd = armarBiografia(t, modelo, ClaseEntidad.PAQUETE, d.id);
  assert.ok(bd.pasos.some((p) => p.frase.clave === 'explicacion.paso.cola_manual.rampa_llena'));
  const ultimo = bd.pasos[bd.pasos.length - 1];
  assert.equal(ultimo.frase.clave, 'explicacion.paso.no_termino', 'el paquete no entró a ninguna jaula');
  assert.equal(texto(ultimo.frase), 'Hasta el final de la noche no llegó a una jaula.');
  assert.ok(ultimo.desde >= bd.pasos[bd.pasos.length - 2].hasta);
  for (const id of [a.id, b2.id, d.id]) verificada(t, armarBiografia(t, modelo, ClaseEntidad.PAQUETE, id));
});

test('el paquete que entra a la jaula después del corte lo dice', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, hm(24, 20)).descarga(3000).cinta(40000).fila(6 * MIN).induccion(3000).bandeja(30000).rampa(8 * MIN, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  const b = armarBiografia(c.construir({ corte: hm(24, 30) }), modelo, ClaseEntidad.PAQUETE, v.id);
  assert.equal(b.pasos[b.pasos.length - 1].frase.clave, 'explicacion.paso.jaula.despues_del_corte');
  assert.match(texto(b.pasos[b.pasos.length - 1].frase), /después del corte\.$/);
});

test('percentil del tiempo en el hub entre los paquetes de la noche (0–100)', () => {
  const c = new ConstructorTraza();
  const ids: number[] = [];
  // diez paquetes que tardan 10, 20, … 100 segundos
  for (let i = 1; i <= 10; i++) ids.push(viaje(c, T0).descarga(i * 10000).jaula(0).id);
  const t = c.construir();
  const p = (id: number) => armarBiografia(t, modelo, ClaseEntidad.PAQUETE, id).percentil;
  assert.equal(p(ids[0]), 0, 'el más rápido: ninguno tardó menos');
  assert.equal(p(ids[9]), 90, 'el más lento: nueve de diez tardaron menos');
  assert.equal(p(ids[4]), 40);
  assert.ok((p(ids[3]) as number) < (p(ids[4]) as number));
});

test('un paquete que no existe: el error dice qué se esperaba', () => {
  const c = new ConstructorTraza();
  viaje(c, T0).descarga(1000).jaula(0);
  const t = c.construir();
  assert.throws(() => armarBiografia(t, modelo, ClaseEntidad.PAQUETE, 5), /el paquete 5 no existe en la traza \(se esperaba un número entre 0 y 0\)/);
  assert.throws(() => armarBiografia(t, modelo, ClaseEntidad.PAQUETE, -1), /el paquete -1 no existe/);
  assert.throws(() => armarBiografia(t, modelo, ClaseEntidad.CAMION, 9), /el camión 9 no tiene tramos/);
  assert.throws(() => armarBiografia(t, modelo, ClaseEntidad.PERSONA, 99), /la persona 99 no existe en el catálogo/);
  assert.throws(() => armarBiografia(t, modelo, ClaseEntidad.RAMPA, 99), /la rampa 99 no existe en la geometría/);
  assert.throws(() => armarBiografia(t, modelo, ClaseEntidad.PUESTO, 99), /el puesto 99 no existe en el catálogo/);
  assert.throws(() => armarBiografia(t, modelo, 77 as never, 0), /la clase 77 no es una clase de entidad conocida/);
});

// ------------------------------------------------------------------------------------------------------------ otras entidades

test('camión: lo que esperó en la playa y lo que descargó en el andén', () => {
  const c = new ConstructorTraza();
  c.tramo(0, TipoTramo.CAMION_PLAYA, -1, 0, hm(22, 0), hm(22, 12), Causa.ANDEN_OCUPADO);
  c.tramo(0, TipoTramo.CAMION_ANDEN, 1, 800, hm(22, 12), hm(23, 5));
  c.tramo(1, TipoTramo.CAMION_ANDEN, 0, 800, hm(22, 15), hm(23, 0));
  const t = c.construir();
  const b = armarBiografia(t, modelo, ClaseEntidad.CAMION, 0);
  assert.equal(texto(b.titulo), 'Camión T01');
  assert.deepEqual(b.pasos.map((p) => p.frase.clave), ['explicacion.paso.camion_espera', 'explicacion.paso.camion_anden']);
  assert.equal(texto(b.pasos[0].frase), 'Esperó 12 min en la playa a que se liberara un andén.');
  assert.equal(b.pasos[0].espera?.causa, Causa.ANDEN_OCUPADO);
  assert.equal(texto(b.pasos[1].frase), 'Descargó 800 paquetes en el andén A2, de 22:12 a 23:05.');
  verificada(t, b);
  // el camión que no esperó no tiene paso de espera
  assert.deepEqual(armarBiografia(t, modelo, ClaseEntidad.CAMION, 1).pasos.map((p) => p.frase.clave), ['explicacion.paso.camion_anden']);
});

test('persona: bloques de trabajo (tramos a menos de un minuto de distancia se juntan), pausas, huecos libres y ausencia', () => {
  const c = new ConstructorTraza();
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_TRABAJA, 0, 5, hm(22, 0), hm(22, 30));
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_CAMINA, 1, 0, hm(22, 30) + 20000, hm(22, 31));      // 20 s después: el mismo bloque
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 1, 0, hm(22, 31), hm(22, 46));
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_TRABAJA, 1, 6, hm(23, 0), hm(23, 20));              // 14 min libre antes
  c.tramo(PERSONA.R3, TipoTramo.PERSONA_AUSENTE, -1, 0, H22, H22 + 8 * 60 * MIN);
  const t = c.construir();
  const b = armarBiografia(t, modelo, ClaseEntidad.PERSONA, PERSONA.R1);
  assert.equal(texto(b.titulo), 'P-R1 · persona de rampa');
  assert.deepEqual(b.pasos.map((p) => p.frase.clave), [
    'explicacion.paso.persona_activa', 'explicacion.paso.persona_pausa', 'explicacion.paso.persona_libre', 'explicacion.paso.persona_activa',
  ]);
  assert.equal(texto(b.pasos[0].frase), 'Trabajó de 22:00 a 22:31.');
  assert.equal(texto(b.pasos[1].frase), 'Pausa de 15 min a las 22:31.');
  assert.equal(b.pasos[1].espera?.causa, Causa.PAUSA);
  assert.equal(texto(b.pasos[2].frase), 'Sin trabajo de 22:46 a 23:00.');
  assert.equal(texto(b.pasos[3].frase), 'Trabajó de 23:00 a 23:20.');
  for (let i = 1; i < b.pasos.length; i++) assert.ok(b.pasos[i].desde >= b.pasos[i - 1].hasta);
  verificada(t, b);
  const au = armarBiografia(t, modelo, ClaseEntidad.PERSONA, PERSONA.R3);
  assert.deepEqual(au.pasos.map((p) => p.frase.clave), ['explicacion.paso.persona_ausente']);
  assert.equal(au.pasos[0].espera?.causa, Causa.AUSENCIA);
  assert.equal(texto(armarBiografia(t, modelo, ClaseEntidad.PERSONA, PERSONA.T1).titulo), 'P-T1 · retén');
});

test('rampa: los lapsos en que estuvo llena (por los tramos de rampa) y los cierres de jaula', () => {
  const c = new ConstructorTraza();
  // capacidad 2: tres paquetes en la rampa 0 durante [0, 10], [2, 12] y [5, 8] minutos → llena desde el minuto 2 hasta que sale el primero (10)
  for (const [a, b] of [[0, 10], [2, 12], [5, 8]]) {
    const id = c.paquete(0, c.cantidadPaquetes, T0 + a * MIN);
    c.tramo(id, TipoTramo.RAMPA, 0, 1, T0 + a * MIN, T0 + b * MIN, Causa.NINGUNA, refDe(ClaseEntidad.PERSONA, PERSONA.R1));
  }
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_CIERRA_JAULA, 0, 0, T0 + 20 * MIN, T0 + 21 * MIN);
  const t = c.construir({ capacidadRampas: 2 });
  const b = armarBiografia(t, modelo, ClaseEntidad.RAMPA, 0);
  assert.equal(texto(b.titulo), 'Rampa R01 · Ruta 01');
  assert.deepEqual(b.pasos.map((p) => p.frase.clave), ['explicacion.paso.rampa_llena', 'explicacion.paso.rampa_cierra_jaula']);
  assert.equal(b.pasos[0].desde, T0 + 2 * MIN);
  assert.equal(b.pasos[0].hasta, T0 + 10 * MIN, 'queda llena hasta que sale el primero');
  assert.equal(texto(b.pasos[1].frase), 'P-R1 cerró una jaula a las 22:30 (1 min).');
  verificada(t, b);
});

test('lazo y puesto: detenciones y pausas o ausencias de su gente', () => {
  const c = new ConstructorTraza();
  c.tramo(-1, TipoTramo.LAZO_DETENIDO, 0, 100, hm(23, 10), hm(23, 50), Causa.FALLA);
  c.tramo(PERSONA.I1, TipoTramo.PERSONA_PAUSA, 0, 0, hm(23, 0), hm(23, 15));
  c.tramo(PERSONA.I2, TipoTramo.PERSONA_AUSENTE, 1, 0, H22, H22 + 8 * 60 * MIN);
  c.momento(hm(23, 10), TipoMomento.LAZO_PARA, 0, 0);
  const t = c.construir();
  const lazo = armarBiografia(t, modelo, ClaseEntidad.EQUIPO, 0);
  assert.equal(texto(lazo.titulo), 'Lazo del sorter');
  assert.equal(texto(lazo.pasos[0].frase), 'El lazo estuvo detenido 40 min desde las 23:10.');
  assert.equal(lazo.pasos[0].espera?.causa, Causa.FALLA);
  verificada(t, lazo);
  const p0 = armarBiografia(t, modelo, ClaseEntidad.PUESTO, 0);
  assert.equal(texto(p0.titulo), 'Puesto de inducción I1');
  assert.deepEqual(p0.pasos.map((p) => p.frase.clave), ['explicacion.paso.persona_pausa']);
  const p1 = armarBiografia(t, modelo, ClaseEntidad.PUESTO, 1);
  assert.deepEqual(p1.pasos.map((p) => p.frase.clave), ['explicacion.paso.persona_ausente']);
  verificada(t, p0); verificada(t, p1);
});

// -------------------------------------------------------------------------------------------------------------------- la maqueta

test('3.000 paquetes de la maqueta: biografías encadenadas, con todas las cifras verificables contra la traza', () => {
  const t = trazaDeMaqueta(2);
  const alm = almacen(t);
  let pasosTotales = 0;
  for (let k = 0; k < 3000; k++) {
    const id = k * 8;
    if (t.paquetes.creado[id] < 0) continue;
    const b = armarBiografia(t, modelo, ClaseEntidad.PAQUETE, id);
    assert.ok(b.pasos.length >= 5, `paquete ${id}: ${b.pasos.length} pasos`);
    pasosTotales += b.pasos.length;
    for (let i = 1; i < b.pasos.length; i++) {
      const hueco = b.pasos[i].desde - b.pasos[i - 1].hasta;
      assert.ok(hueco >= 0 && hueco < ESPERA_MINIMA_MS, `paquete ${id}, paso ${i} (${b.pasos[i].frase.clave}): hueco de ${hueco} ms`);
    }
    if (k % 20 === 0) {
      const v = verificarFrases(todasLasFrases(b), alm, 'noche');
      assert.deepEqual(v.fallas, [], `paquete ${id}`);
    }
  }
  assert.ok(pasosTotales > 15000);
  // una rampa, una persona y un camión de la maqueta
  assert.doesNotThrow(() => armarBiografia(t, modelo, ClaseEntidad.RAMPA, 3));
  assert.doesNotThrow(() => armarBiografia(t, modelo, ClaseEntidad.PERSONA, 0));
  assert.doesNotThrow(() => armarBiografia(t, modelo, ClaseEntidad.PUESTO, 0));
});
