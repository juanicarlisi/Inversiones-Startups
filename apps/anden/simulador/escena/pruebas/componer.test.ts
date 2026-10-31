// escena/pruebas/componer.test.ts · P6. Las vistas componen una lista de primitivas pura antes de pintar (corte-1.md §9 P6): cantidad y
// orden por profundidad en la isométrica, capas de la planta, selección, riesgo, fantasma, lazo detenido, movimiento reducido, pureza y
// coordenadas finitas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trazaDeMaqueta } from '../../contratos/fixtures/traza-maqueta.ts';
import { Causa, ClaseEntidad, TipoTramo, refDe } from '../../contratos/traza.ts';
import type { MapaRiesgo, Piso } from '../../contratos/vistas.ts';
import { crearReproductor, type ReproductorEscena } from '../reproductor.ts';
import { CAPACIDAD_PILA } from '../disposicion.ts';
import { componer2d, type Capa, type Composicion } from '../componer2d.ts';
import { componerIso } from '../componeriso.ts';
import { encuadrar, MAX_LINEAS_GRILLA, pasoGrilla, pasoMuestreo, type Primitiva } from '../primitivas.ts';
import { conMovimientoReducido, estilos } from '../estilo.ts';
import { LAZO, PERSONAS, geometriaSintetica, lazoEnMarcha, trazaSintetica } from './ayudas.ts';

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
  // los rótulos de las rampas ya no van en el fondo: en la capa móvil, encima de la carga (EXP-08)
  assert.deepEqual(ps.filter((p) => p.tipo === 'texto').map((p) => (p as { texto: string }).texto), []);
  const movil = componerIso(comp(rep, 'iso', 'movil'));
  const textos = movil.filter((p) => p.tipo === 'texto') as { texto: string; prof: number; fondo?: string | null }[];
  assert.deepEqual(textos.map((p) => p.texto).sort(), ['R01', 'R02', 'R03'], 'acercado, se rotulan todas las rampas');
  assert.ok(textos.every((p) => p.prof === -Infinity && !!p.fondo), 'encima de todo y en una pastilla');
  assert.ok(movil.indexOf(textos[0] as unknown as Primitiva) > movil.findIndex((p) => p.tipo === 'sprite'), 'los rótulos van después de las entidades');
});

test('rótulos de rampa con el zoom bajo (EXP-03): las llenas y la seleccionada siempre, en pastilla de al menos 10 px; las demás no', () => {
  const rep = escena(), c = estilos.claro.colores;
  for (const piso of ['iso', '2d'] as const) {
    const lejos = comp(rep, piso, 'movil');
    lejos.camara = { ...lejos.camara, zoom: 2 };   // letra del zoom < 8 px: antes no había ningún rótulo
    const sinNada = (piso === 'iso' ? componerIso(lejos) : componer2d(lejos)).filter((p) => p.tipo === 'texto') as { texto: string }[];
    const b = rep.crearEstadoRecursos();
    rep.recursos(T, b);
    const llenas = D_RAMPAS.filter((_, r) => b.rampaLlena[r] === 1);
    assert.deepEqual(sinNada.map((x) => x.texto).sort(), [...llenas].sort(), `${piso}: con el zoom bajo solo las rampas llenas (${llenas.join(', ') || 'ninguna'})`);
    const conSel = { ...lejos, opciones: { seleccion: { clase: ClaseEntidad.RAMPA, id: 2 } } };
    const ts = (piso === 'iso' ? componerIso(conSel) : componer2d(conSel)).filter((p) => p.tipo === 'texto') as { texto: string; tam: number; fondo?: string | null; color: string }[];
    const r03 = ts.find((x) => x.texto === 'R03');
    assert.ok(r03, `${piso}: la rampa seleccionada lleva rótulo con cualquier zoom`);
    assert.ok(r03!.tam >= 10 && r03!.fondo === c.etiquetaFondo && r03!.color === c.etiquetaTexto, `${piso}: pastilla fuerte de al menos 10 px`);
  }
});
const D_RAMPAS = ['R01', 'R02', 'R03'];

test('planta 2D: fondo con piso, cintas, lazo y rótulos; capa móvil con un glifo por paquete o persona y un polígono por camión', () => {
  const rep = escena(), pos = rep.crearPosiciones(), c = estilos.claro.colores;
  rep.posiciones(T, pos);
  const fondo = componer2d(comp(rep, '2d', 'fondo')), movil = componer2d(comp(rep, '2d', 'movil'));
  assert.equal(fondo[0].tipo, 'rect');
  assert.equal(contar(fondo, (p) => p.tipo === 'linea' && p.color === c.cinta), 2, 'una línea por cinta');
  assert.equal(contar(fondo, (p) => p.tipo === 'linea' && p.color === c.lazo && p.cerrada), 1, 'el lazo es una línea cerrada');
  assert.deepEqual(fondo.filter((p) => p.tipo === 'texto').map((p) => (p as { texto: string }).texto), ['A1', 'A2']);
  assert.deepEqual(movil.filter((p) => p.tipo === 'texto').map((p) => (p as { texto: string }).texto).sort(), ['R01', 'R02', 'R03'], 'las rampas, en la capa móvil');
  let camiones = 0;
  for (let i = 0; i < pos.n; i++) if (pos.clase[i] === ClaseEntidad.CAMION) camiones++;
  assert.equal(contar(movil, (p) => p.tipo === 'glifo' && p.forma !== 'halo'), pos.n - camiones, 'un glifo por paquete o persona');
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
      assert.equal(contar(ps, (p) => p.tipo === 'poligono' && p.relleno === c[nombre] && p.prof !== -Infinity), 1, `${piso}: un tobogán con ${nombre}`);
    }
    if (piso === 'iso') {
      // y en 2,5D, una placa encima de la jaula (dibujada al final) por cada rampa con riesgo, para las del lado lejano (UX-02)
      for (const nombre of ['riesgo2', 'riesgo4']) {
        assert.equal(contar(ps, (p) => p.tipo === 'poligono' && p.relleno === c[nombre] && p.prof === -Infinity), 1, `iso: una placa con ${nombre}`);
      }
      assert.equal(contar(ps, (p) => p.tipo === 'poligono' && p.relleno === c.riesgo0 && p.prof === -Infinity), 0, 'sin riesgo, sin placa');
      // la placa es lo último que se dibuja: nada la tapa
      const ultimo = ps.map((p, i) => [p, i] as const).filter(([p]) => p.tipo === 'poligono' && p.relleno === c.riesgo4 && p.prof === -Infinity)[0][1];
      assert.ok(ps.slice(ultimo + 1).every((p) => p.prof === -Infinity), 'después de la placa solo puede venir otra cosa «encima de todo»');
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
    assert.equal(contar(ps, (p) => p.tipo === 'poligono' && p.relleno === c.rampaLlena && p.prof !== -Infinity), 1, `${piso}: la rampa R02 llena`);
    // y además se marca encima de todo (UX-02): en 2D el contorno del tobogán, en 2,5D la placa sobre la jaula
    if (piso === '2d') assert.equal(contar(ps, (p) => p.tipo === 'poligono' && p.relleno === null && p.borde === c.rampaLlena), 1, '2d: contorno de la rampa llena');
    else assert.equal(contar(ps, (p) => p.tipo === 'poligono' && p.relleno === c.rampaLlena && p.prof === -Infinity), 1, 'iso: placa de la rampa llena');
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

test('la pila del puesto manual: las vistas no dibujan los paquetes tapados por otro idéntico, salvo el seleccionado', () => {
  // 1.000 paquetes en la cola manual: solo CAPACIDAD_PILA lugares distintos; los demás caen exactamente encima (revisión de I-3: con
  // 2.455 en la cola, dibujarlos todos llevaba el cuadro 2,5D a 21,6 ms y el piso caía a 2D)
  const N = 1000;
  const rep = crearReproductor(trazaSintetica((s) => {
    for (let e = 0; e < N; e++) { s.tramo(e, TipoTramo.COLA_MANUAL, 0, e, 0, 3_000_000, Causa.RAMPA_LLENA); s.paquete(e, { creado: 0, listo: -1 }); }
  }));
  const pos = rep.crearPosiciones();
  rep.posiciones(T, pos);
  let tapados = 0;
  for (let k = 0; k < pos.n; k++) tapados += pos.tapado[k];
  assert.equal(tapados, N - CAPACIDAD_PILA, `se esperaban ${N - CAPACIDAD_PILA} paquetes tapados y salieron ${tapados}`);
  // un paquete es un sprite (2,5D, con su glifo de respaldo) o un glifo (2D) cuya referencia es de la clase PAQUETE
  const refDePrim = (p: Primitiva): number | undefined => p.tipo === 'sprite' ? (p as { respaldo: { ref: number } }).respaldo.ref
    : p.tipo === 'glifo' ? (p as { ref: number }).ref : undefined;
  const paquetesDibujados = (ps: Primitiva[]) => contar(ps, (p) => {
    const r = refDePrim(p);
    return r !== undefined && r >= 0 && Math.floor(r / 16777216) === ClaseEntidad.PAQUETE;
  });
  for (const [piso, f] of [['iso', componerIso], ['2d', componer2d]] as const) {
    const n = paquetesDibujados(f(comp(rep, piso, 'movil')));
    assert.equal(n, CAPACIDAD_PILA, `${piso}: se esperaban ${CAPACIDAD_PILA} paquetes dibujados (los lugares distintos de la pila) y salieron ${n}`);
    // el último de la cola está tapado; seleccionado, se dibuja igual (con su halo)
    const sel = { clase: ClaseEntidad.PAQUETE, id: N - 1 };
    const conSel = paquetesDibujados(f(comp(rep, piso, 'movil', { opciones: { seleccion: sel } })));
    assert.ok(conSel >= CAPACIDAD_PILA + 1, `${piso}: el paquete seleccionado tiene que dibujarse aunque esté tapado (salieron ${conSel})`);
  }
});

test('SEG-R1: un hub de mil millones de metros se compone en un instante y con una grilla acotada (ningún bucle depende del tamaño)', () => {
  // La geometría que dejaba pasar el esquema antes de la revisión del 30-10-2026: la acumulación a 1e9 m y los límites hasta ahí.
  const g = geometriaSintetica();
  g.acumulacion = { ...g.acumulacion, x: 1e9 };
  g.limites = { ...g.limites, xmax: 1e9 + 10 };
  g.cintas = [{ ...g.cintas[0], puntos: [[-5, -8], [1e9, -8]], largo: 1e9 + 5 }, g.cintas[1]];
  const t0 = performance.now();
  const rep = crearReproductor(trazaSintetica(() => {}, { geometria: g }));
  let lineas = 0, total = 0;
  for (const piso of ['iso', '2d'] as const) {
    const ps = piso === 'iso' ? componerIso(comp(rep, piso, 'fondo')) : componer2d(comp(rep, piso, 'fondo'));
    total += ps.length;
    lineas += ps.filter((p) => p.tipo === 'linea').length;
  }
  const ms = performance.now() - t0;
  assert.ok(ms < 5000, `componer un hub de 1e9 m tardó ${ms.toFixed(0)} ms (antes colgaba la pestaña)`);
  assert.ok(lineas <= 4 * (MAX_LINEAS_GRILLA + 2) + 10, `la grilla tiene que quedar acotada y salieron ${lineas} líneas en los dos pisos`);
  assert.ok(total < 20_000, `el fondo de los dos pisos tiene ${total} primitivas`);
  assert.equal(pasoGrilla(4, 1e9) >= 1e9 / MAX_LINEAS_GRILLA, true);
  assert.equal(pasoGrilla(4, Infinity), Infinity, 'sin rango finito no hay grilla');
  assert.equal(pasoMuestreo(1e9, 0.5, 4000), 1e9 / 4000);
});
