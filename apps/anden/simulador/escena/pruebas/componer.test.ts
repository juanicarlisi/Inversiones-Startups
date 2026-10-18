// escena/pruebas/componer.test.ts · P6. Las vistas componen una lista de primitivas pura antes de pintar (corte-1.md §9 P6): cantidad y
// orden por profundidad en la isométrica, capas de la planta, selección, riesgo, fantasma, lazo detenido, movimiento reducido, pureza y
// coordenadas finitas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trazaDeMaqueta } from '../../contratos/fixtures/traza-maqueta.ts';
import { Causa, ClaseEntidad, TipoTramo, refDe } from '../../contratos/traza.ts';
import type { MapaRiesgo, Piso } from '../../contratos/vistas.ts';
import { crearReproductor, type ReproductorEscena } from '../reproductor.ts';
import { componer2d, type Capa, type Composicion } from '../componer2d.ts';
import { componerIso } from '../componeriso.ts';
import { encuadrar, type Primitiva } from '../primitivas.ts';
import { conMovimientoReducido, estilos } from '../estilo.ts';
import { LAZO, PERSONAS, lazoEnMarcha, trazaSintetica } from './ayudas.ts';

const MARCO = { ancho: 1280, alto: 800 };
const T = 30_000;

/** Escena chica: un paquete en una bandeja, uno en cada rampa de abajo y arriba, uno en la fila, una persona, un camión y una jaula. */
function escena(): ReproductorEscena {
  return crearReproductor(trazaSintetica((s) => {
    lazoEnMarcha(s);
    s.tramo(0, TipoTramo.BANDEJA, 3, 1, 0, 60_000, Causa.RAMPA_LLENA, refDe(ClaseEntidad.RAMPA, 0));
    s.tramo(1, TipoTramo.RAMPA, 0, 0, 0, 60_000);
    s.tramo(2, TipoTramo.RAMPA, 2, 0, 0, 60_000);
    s.tramo(3, TipoTramo.ACUMULACION, 0, 0, 0, 60_000, Causa.FILA);
    s.tramo(4, TipoTramo.JAULA, 1, 0, 1000, 3_600_000);
    s.tramo(PERSONAS.R1, TipoTramo.PERSONA_TRABAJA, 0, 1, 0, 60_000);
    s.tramo(0, TipoTramo.CAMION_ANDEN, 0, 10, 0, 600_000);
    for (let i = 0; i < 5; i++) s.paquete(i, { creado: 0, listo: 100_000 });
  }));
}

function comp(rep: ReproductorEscena, piso: Piso, capa: Capa, extra: Partial<Composicion> = {}): Composicion {
  return { rep, t: T, marco: MARCO, camara: encuadrar(rep.disposicion.limites, MARCO, piso), estilo: estilos.claro, capa, ...extra };
}
const contar = (ps: Primitiva[], f: (p: Primitiva) => boolean) => ps.reduce((n, p) => n + (f(p) ? 1 : 0), 0);

/** Todas las coordenadas de las primitivas son números finitos. */
function finitas(ps: Primitiva[]): string[] {
  const malos: string[] = [];
  ps.forEach((p, i) => {
    const nums: number[] = [];
    if (p.tipo === 'poligono' || p.tipo === 'linea') nums.push(...p.pts);
    else if (p.tipo === 'rect') nums.push(p.x, p.y, p.w, p.h);
    else if (p.tipo === 'circulo') nums.push(p.x, p.y, p.r);
    else if (p.tipo === 'glifo') nums.push(p.x, p.y, p.tam, p.ang);
    else if (p.tipo === 'sprite') nums.push(p.x, p.y, p.respaldo.x, p.respaldo.y);
    else nums.push(p.x, p.y, p.tam);
    if (nums.some((v) => !Number.isFinite(v))) malos.push(`${i} (${p.tipo})`);
  });
  return malos;
}

test('isométrica, capa móvil: un sprite por entidad, una tapa por bandeja, un disco por puesto, en orden de profundidad', () => {
  const rep = escena(), pos = rep.crearPosiciones();
  rep.posiciones(T, pos);
  const ps = componerIso(comp(rep, 'iso', 'movil')), c = estilos.claro.colores;
  assert.equal(contar(ps, (p) => p.tipo === 'sprite'), pos.n, `se esperaba un sprite por cada una de las ${pos.n} entidades a la vista`);
  assert.equal(contar(ps, (p) => p.tipo === 'poligono' && p.relleno === c.bandeja), LAZO.bandejas, 'una tapa por bandeja');
  assert.equal(contar(ps, (p) => p.tipo === 'circulo'), 2, 'un disco por puesto de inducción');
  for (let i = 1; i < ps.length; i++) {
    assert.ok(ps[i].prof <= ps[i - 1].prof, `la primitiva ${i} (${ps[i].tipo}, prof ${ps[i].prof}) se pinta después de una más cercana (prof ${ps[i - 1].prof})`);
  }
});

test('isométrica: lo que está más lejos de la cámara se pinta antes (rampa de arriba antes que la de abajo)', () => {
  const rep = escena();
  const ps = componerIso(comp(rep, 'iso', 'movil'));
  const idx = (id: number) => ps.findIndex((p) => p.tipo === 'sprite' && p.respaldo.ref === refDe(ClaseEntidad.PAQUETE, id));
  const lejos = idx(2), cerca = idx(1); // paquete 2 en R03 (y > 0, lejos) · paquete 1 en R01 (y < 0, cerca)
  assert.ok(lejos >= 0 && cerca >= 0, 'los dos paquetes de las rampas tienen que estar en la lista');
  assert.ok(lejos < cerca, `el paquete de la rampa de arriba (posición ${lejos}) tiene que ir antes que el de abajo (posición ${cerca})`);
});

test('isométrica, capa fija: el piso primero, después las cosas de lejos a cerca y los rótulos encima', () => {
  const rep = escena();
  const ps = componerIso(comp(rep, 'iso', 'fondo'));
  assert.equal(ps[0].tipo, 'rect');
  assert.equal((ps[0] as { relleno: string }).relleno, estilos.claro.colores.fondo);
  for (let i = 1; i < ps.length; i++) assert.ok(ps[i].prof <= ps[i - 1].prof, `capa fija: la primitiva ${i} rompe el orden por profundidad`);
  assert.deepEqual(ps.filter((p) => p.tipo === 'texto').map((p) => (p as { texto: string }).texto), ['R01', 'R02', 'R03']);
});

test('planta 2D: fondo con piso, cintas, lazo y rótulos; capa móvil con un glifo por paquete o persona y un polígono por camión', () => {
  const rep = escena(), pos = rep.crearPosiciones(), c = estilos.claro.colores;
  rep.posiciones(T, pos);
  const fondo = componer2d(comp(rep, '2d', 'fondo')), movil = componer2d(comp(rep, '2d', 'movil'));
  assert.equal(fondo[0].tipo, 'rect');
  assert.equal(contar(fondo, (p) => p.tipo === 'linea' && p.color === c.cinta), 2, 'una línea por cinta');
  assert.equal(contar(fondo, (p) => p.tipo === 'linea' && p.color === c.lazo && p.cerrada), 1, 'el lazo es una línea cerrada');
  assert.deepEqual(fondo.filter((p) => p.tipo === 'texto').map((p) => (p as { texto: string }).texto), ['R01', 'R02', 'R03', 'A1', 'A2']);
  let camiones = 0;
  for (let i = 0; i < pos.n; i++) if (pos.clase[i] === ClaseEntidad.CAMION) camiones++;
  assert.equal(contar(movil, (p) => p.tipo === 'glifo'), pos.n - camiones, 'un glifo por paquete o persona');
  assert.equal(contar(movil, (p) => p.tipo === 'poligono' && p.relleno === c.camion), camiones, 'un polígono por camión');
  for (const capa of [fondo, movil]) for (let i = 1; i < capa.length; i++) assert.ok(capa[i].prof > capa[i - 1].prof, 'en la planta el orden es el de la lista');
  assert.equal(componer2d(comp(rep, '2d', 'todo')).length, fondo.length + movil.length, '«todo» = fondo + móvil');
});

test('la forma y el color del glifo salen del estado: el paquete que da otra vuelta es un círculo azul', () => {
  const rep = escena();
  const movil = componer2d(comp(rep, '2d', 'movil'));
  const g = movil.find((p) => p.tipo === 'glifo' && p.ref === refDe(ClaseEntidad.PAQUETE, 0));
  assert.ok(g && g.tipo === 'glifo');
  assert.equal(g.forma, 'circulo');
  assert.equal(g.relleno, estilos.claro.colores.estadoVuelta);
});

test('componer es puro: la misma entrada da la misma lista (y no cambia lo que pidieron antes)', () => {
  const rep = escena();
  for (const piso of ['2d', 'iso'] as const) {
    const f = piso === 'iso' ? componerIso : componer2d;
    const a = JSON.stringify(f(comp(rep, piso, 'todo')));
    f(comp(rep, piso, 'todo', { t: 50_000 }));
    const b = JSON.stringify(f(comp(rep, piso, 'todo')));
    assert.equal(a, b, `${piso}: dos composiciones del mismo instante tienen que ser idénticas`);
  }
});

test('selección: halo en el paquete elegido, borde en la rampa elegida, halo en el puesto elegido', () => {
  const rep = escena(), c = estilos.claro.colores;
  for (const piso of ['2d', 'iso'] as const) {
    const f = piso === 'iso' ? componerIso : componer2d;
    const conPaquete = f(comp(rep, piso, 'movil', { opciones: { seleccion: { clase: ClaseEntidad.PAQUETE, id: 2 } } }));
    assert.equal(contar(conPaquete, (p) => p.tipo === 'glifo' && p.forma === 'halo' && p.ref === refDe(ClaseEntidad.PAQUETE, 2)), 1, `${piso}: halo del paquete 2`);
    const conRampa = f(comp(rep, piso, 'movil', { opciones: { seleccion: { clase: ClaseEntidad.RAMPA, id: 1 } } }));
    assert.equal(contar(conRampa, (p) => p.tipo === 'poligono' && p.borde === c.seleccion && p.relleno === null), 1, `${piso}: borde de la rampa 1`);
    const conPuesto = f(comp(rep, piso, 'movil', { opciones: { seleccion: { clase: ClaseEntidad.PUESTO, id: 1 } } }));
    assert.equal(contar(conPuesto, (p) => p.tipo === 'glifo' && p.forma === 'halo' && p.ref === refDe(ClaseEntidad.PUESTO, 1)), 1, `${piso}: halo del puesto 1`);
  }
});

test('movimiento reducido: la selección no pulsa', () => {
  const rep = escena(), sel = { seleccion: { clase: ClaseEntidad.PAQUETE, id: 2 } };
  const tam = (estilo = estilos.claro, pulso = 0) => {
    const h = componer2d(comp(rep, '2d', 'movil', { opciones: sel, estilo, pulso })).find((p) => p.tipo === 'glifo' && p.forma === 'halo');
    assert.ok(h && h.tipo === 'glifo');
    return h.tam;
  };
  assert.notEqual(tam(estilos.claro, 0.25), tam(estilos.claro, 0), 'sin movimiento reducido el halo pulsa');
  const quieto = conMovimientoReducido(estilos.claro, true);
  assert.equal(tam(quieto, 0.25), tam(quieto, 0), 'con movimiento reducido el halo no cambia con el pulso');
});

test('capa de riesgo: cada tobogán se tiñe con el color de su probabilidad de llenarse', () => {
  const rep = escena(), c = estilos.claro.colores;
  const riesgo: MapaRiesgo = {
    noches: 10, rampaProbLlena: Float32Array.from([0, 0.2, 0.7]), rampaMinutosLlenaP90: new Float32Array(3), filaP50: new Float32Array(0),
    filaP90: new Float32Array(0), finClasificacionMin: { p10: 0, p50: 0, p90: 0 }, nocheMediana: 0, nochePeor: 0,
  };
  for (const piso of ['2d', 'iso'] as const) {
    const ps = (piso === 'iso' ? componerIso : componer2d)(comp(rep, piso, 'movil', { opciones: { riesgo } }));
    for (const nombre of ['riesgo0', 'riesgo2', 'riesgo4']) {
      assert.equal(contar(ps, (p) => p.tipo === 'poligono' && p.relleno === c[nombre]), 1, `${piso}: un tobogán con ${nombre}`);
    }
  }
});

test('pantalla dividida: el fantasma dibuja los paquetes del otro escenario, semitransparentes', () => {
  const rep = escena();
  const otro = crearReproductor(trazaSintetica((s) => {
    lazoEnMarcha(s);
    for (let i = 0; i < 4; i++) { s.tramo(i, TipoTramo.BANDEJA, 10 * i, 0, 0, 60_000); s.paquete(i, { creado: 0, listo: 100_000 }); }
  }));
  for (const piso of ['2d', 'iso'] as const) {
    const ps = (piso === 'iso' ? componerIso : componer2d)(comp(rep, piso, 'movil', { opciones: { fantasma: otro } }));
    assert.equal(contar(ps, (p) => p.tipo === 'glifo' && p.alfa < 1 && p.relleno === estilos.claro.colores.fantasma), 4, `${piso}: 4 paquetes fantasma`);
  }
});

test('lazo detenido: se marca con dos líneas punteadas del color de alarma; rampa llena con su color', () => {
  const rep = crearReproductor(trazaSintetica((s) => {
    s.tramo(-1, TipoTramo.LAZO_MARCHA, 0, 0, 0, 10_000);
    s.tramo(-1, TipoTramo.LAZO_DETENIDO, 0, 34, 10_000, 40_000, Causa.FALLA);
    for (let i = 0; i < 3; i++) { s.tramo(i, TipoTramo.RAMPA, 1, i, 0, 60_000); s.paquete(i, { creado: 0, listo: 100_000 }); }
  }));
  const c = estilos.claro.colores;
  for (const piso of ['2d', 'iso'] as const) {
    const ps = (piso === 'iso' ? componerIso : componer2d)(comp(rep, piso, 'movil'));
    assert.equal(contar(ps, (p) => p.tipo === 'linea' && p.color === c.lazoDetenido && p.guion !== null), 2, `${piso}: el lazo detenido se marca a los dos costados`);
    assert.equal(contar(ps, (p) => p.tipo === 'poligono' && p.relleno === c.rampaLlena), 1, `${piso}: la rampa R02 llena`);
    const despues = (piso === 'iso' ? componerIso : componer2d)(comp(rep, piso, 'movil', { t: 45_000 }));
    assert.equal(contar(despues, (p) => p.tipo === 'linea' && p.color === c.lazoDetenido), 0, `${piso}: con el lazo andando no hay marca`);
  }
});

test('tema oscuro: los mismos elementos con los colores del tema', () => {
  const rep = escena();
  const claro = componerIso(comp(rep, 'iso', 'todo')), oscuro = componerIso(comp(rep, 'iso', 'todo', { estilo: estilos.oscuro }));
  assert.equal(oscuro.length, claro.length);
  assert.equal((oscuro[0] as { relleno: string }).relleno, estilos.oscuro.colores.fondo);
});

test('maqueta: 20 instantes en las dos vistas sin coordenadas NaN ni infinitas', () => {
  const rep = crearReproductor(trazaDeMaqueta(2));
  for (let i = 0; i < 20; i++) {
    const t = rep.inicio + ((rep.fin - rep.inicio) * i) / 19;
    for (const piso of ['2d', 'iso'] as const) {
      const ps = (piso === 'iso' ? componerIso : componer2d)(comp(rep, piso, 'todo', { t }));
      const malos = finitas(ps);
      assert.deepEqual(malos, [], `${piso}, t = ${t}: primitivas con coordenadas no finitas: ${malos.slice(0, 5).join(', ')}`);
    }
  }
});
