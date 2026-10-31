// hub/pruebas/plantillas.test.ts · P4 · Las dos plantillas publicadas y la propuesta hub-chico@1.1.0 (no publicada): contenido,
// reglas de generación, geometría, largo de los textos y lista negra.
// Con ANDEN_GENERAR=1 reescribe hub/plantillas/hub-lazo-noche.json y hub/plantillas/hub-chico-1.1.0.json desde generar.ts (solo para
// la primera vez o una versión nueva: una plantilla guardada no cambia).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import type { Modelo, OpParche } from '../../contratos/modelo.ts';
import { horaASeg } from '../../contratos/tipos-base.ts';
import { LIMITES_ENLACE } from '../../contratos/escena.ts';
import { PLANTILLAS, PROPUESTAS, plantilla } from '../plantillas/registro.ts';
import { PARCHE_HUB_CHICO_1_1_0, generarHubChico110, generarHubLazoNoche, pesosRutas, reemplazar } from '../plantillas/generar.ts';
import { geometria } from '../geometria.ts';
import { posEnLazo } from '../../contratos/geometria.ts';
import { bandejasLazo, capacidadAcumulacion, compilarConfig, largoLazo, ranuraDe } from '../config.ts';

const leer = (ruta: string) => JSON.parse(readFileSync(new URL(ruta, import.meta.url), 'utf8')) as Modelo;
const ejemplo = leer('../../contratos/ejemplos/hub-chico.json');
const RUTA_GRANDE = new URL('../plantillas/hub-lazo-noche.json', import.meta.url);
const RUTA_CHICO_110 = new URL('../plantillas/hub-chico-1.1.0.json', import.meta.url);
const valorDe = (o: OpParche): unknown => ('value' in o ? o.value : undefined);
/** Las publicadas y las propuestas: todas tienen que poder publicarse (coherencia, geometría, textos, lista negra). */
const TODAS = { ...PLANTILLAS, ...PROPUESTAS };

if (process.env.ANDEN_GENERAR === '1') {
  writeFileSync(RUTA_GRANDE, JSON.stringify(generarHubLazoNoche(ejemplo), null, 2) + '\n');
  writeFileSync(RUTA_CHICO_110, JSON.stringify(generarHubChico110(ejemplo), null, 2) + '\n');
}

test('el registro tiene exactamente las dos plantillas, congeladas, y resuelve por id y versión', () => {
  assert.deepEqual(Object.keys(PLANTILLAS).sort(), ['hub-chico@1.0.0', 'hub-lazo-noche@1.0.0']);
  for (const [clave, m] of Object.entries(PLANTILLAS)) {
    assert.ok(Object.isFrozen(m) && Object.isFrozen(m.hub) && Object.isFrozen(m.hub.rampas[0]), `${clave} tiene que estar congelada en profundidad`);
    assert.equal(`${m.plantilla?.id}@${m.plantilla?.version}`, clave, `${clave}: el campo plantilla tiene que coincidir con la clave`);
    assert.throws(() => { (m as { titulo: string }).titulo = 'otro'; }, TypeError);
  }
  assert.equal(plantilla('hub-chico', '1.0.0'), PLANTILLAS['hub-chico@1.0.0']);
  assert.equal(plantilla('hub-chico', '9.9.9'), null);
});

test('las propuestas están congeladas, fuera del registro publicado y sin que plantilla() las resuelva', () => {
  assert.deepEqual(Object.keys(PROPUESTAS), ['hub-chico@1.1.0']);
  for (const [clave, m] of Object.entries(PROPUESTAS)) {
    assert.ok(!(clave in PLANTILLAS), `${clave} no puede estar a la vez publicada y propuesta`);
    assert.ok(Object.isFrozen(m) && Object.isFrozen(m.personas.rampa) && Object.isFrozen(m.procedencia), `${clave} tiene que estar congelada en profundidad`);
    assert.equal(`${m.plantilla?.id}@${m.plantilla?.version}`, clave, `${clave}: el campo plantilla tiene que coincidir con la clave`);
  }
  assert.equal(plantilla('hub-chico', '1.1.0'), null, 'una propuesta no se abre por enlace hasta que la integración la publique');
});

test('hub-chico@1.1.0 (propuesta): el generador reproduce exacto el JSON guardado', () => {
  assert.deepEqual(generarHubChico110(ejemplo), JSON.parse(readFileSync(RUTA_CHICO_110, 'utf8')),
    'si cambia el generador, la propuesta guardada no cambia: otra dotación sería otra versión');
  assert.deepEqual(structuredClone(PROPUESTAS['hub-chico@1.1.0']), JSON.parse(readFileSync(RUTA_CHICO_110, 'utf8')));
  assert.throws(() => generarHubChico110(structuredClone(PLANTILLAS['hub-lazo-noche@1.0.0']) as Modelo), /se esperaba la base hub-chico@1\.0\.0/);
});

test('hub-chico@1.1.0 = hub-chico@1.0.0 + PARCHE_HUB_CHICO_1_1_0: la dotación es lo único que cambia la simulación', () => {
  const p = PROPUESTAS['hub-chico@1.1.0'];
  assert.deepEqual(PARCHE_HUB_CHICO_1_1_0.map((o) => [o.op, o.path, valorDe(o)]), [
    ['replace', '/personas/induccion/reten', 1], ['replace', '/personas/rampa/cantidad', 7], ['replace', '/personas/excepcion/cantidad', 2]]);
  // Fuera de los metadatos (versión, fecha, descripción, procedencia, escenarios), la propuesta es la 1.0.0 con el parche.
  // El texto de la caminata entre rampas (unidad, fuente, fecha) también es metadato: en 1.1.0 dice que es un mínimo (hallazgo HUB-R13).
  const sinTextoCaminar = (pp: Modelo['parametros']) => {
    const x = structuredClone(pp);
    const c = x.caminarEntreRampas as unknown as Record<string, unknown> | undefined;
    if (c) { delete c.unidad; delete c.fuente; delete c.fecha; }
    return x;
  };
  const sinMeta = (m: Modelo) => {
    const x = structuredClone(m) as Partial<Modelo>;
    for (const k of ['plantilla', 'creado', 'descripcion', 'procedencia', 'escenarios'] as const) delete x[k];
    x.parametros = sinTextoCaminar(m.parametros);
    return x;
  };
  assert.deepEqual(sinMeta(p), sinMeta(reemplazar(structuredClone(ejemplo), PARCHE_HUB_CHICO_1_1_0)));
  assert.equal(p.id, ejemplo.id);
  assert.deepEqual(sinTextoCaminar(p.parametros), sinTextoCaminar(ejemplo.parametros), 'los mismos parámetros, con sus fuentes');
  assert.equal(p.parametros.caminarEntreRampas.unidad, 's como mínimo al cambiar de rampa');
  assert.match(p.parametros.caminarEntreRampas.fuente, /la caminata real se calcula con la distancia sobre el pasillo del lazo a 1,2 m\/s/);
  assert.deepEqual(p.decision, ejemplo.decision, 'la misma decisión');
  assert.equal(p.experimento.semilla, ejemplo.experimento.semilla, 'la misma semilla');
  // La procedencia conserva la de 1.0.0 y suma cada valor del parche como SUPUESTO con fecha (corte-1.md §14.4).
  for (const [k, v] of Object.entries(ejemplo.procedencia ?? {})) assert.deepEqual(p.procedencia?.[k], v, `procedencia ${k} igual que en 1.0.0`);
  for (const op of PARCHE_HUB_CHICO_1_1_0) {
    const pr = p.procedencia?.[op.path];
    assert.ok(pr && pr.etiqueta === 'SUPUESTO' && pr.fuente.length > 40 && pr.fecha === '2026-10-18', `${op.path}: procedencia SUPUESTO con fuente y fecha`);
  }
  // Ningún escenario queda sin efecto: el de «una persona de retén» de 1.0.0 pasa a «sin la persona de retén».
  const esc = p.escenarios ?? [];
  assert.deepEqual(esc.map((e) => e.id), ['base', 'mas-un-puesto', 'sin-reten', 'rampas-contiguas', 'pico']);
  for (const e of esc) {
    for (const op of e.parche) {
      const actual = op.path.split('/').slice(1).reduce<unknown>((x, k) => (x as Record<string, unknown>)?.[k], p);
      assert.ok(actual !== undefined, `escenario ${e.id}: la ruta ${op.path} existe`);
      assert.notDeepEqual(actual, valorDe(op), `escenario ${e.id}: ${op.path} ya vale ${JSON.stringify(valorDe(op))} (el escenario no cambiaría nada)`);
    }
  }
});

test('hub-chico@1.0.0 es idéntica al modelo de ejemplo de contratos/ (corte-1.md §5)', () => {
  assert.deepEqual(structuredClone(PLANTILLAS['hub-chico@1.0.0']), ejemplo);
  assert.deepEqual(leer('../plantillas/hub-chico.json'), ejemplo);
});

test('hub-lazo-noche@1.0.0: el generador reproduce exacto el JSON guardado', () => {
  assert.deepEqual(generarHubLazoNoche(ejemplo), JSON.parse(readFileSync(RUTA_GRANDE, 'utf8')),
    'si cambia el generador, la plantilla publicada no cambia: una versión nueva es otro id@versión');
});

test('hub-lazo-noche@1.0.0 cumple las reglas de §5', () => {
  const m = PLANTILLAS['hub-lazo-noche@1.0.0'], h = m.hub;
  assert.deepEqual(m.demanda.camiones, { serie: true, cantidad: 26, primero: '22:00', cada: 900, paquetes: 923 });
  assert.equal(h.andenes.length, 4);
  assert.ok(h.andenes.every((a) => a.personas === 2));
  assert.equal(h.acumulacion.largo, 96);
  assert.equal(capacidadAcumulacion(h.acumulacion), 160);
  assert.equal(h.induccion.puestos.length, 6);
  assert.equal(m.personas.induccion.puestosActivos, 4);
  assert.equal(h.sorter.recta, 70);
  assert.equal(h.sorter.radio, 40 / (2 * Math.PI));
  assert.equal(bandejasLazo(h.sorter), 300);
  assert.equal(h.rampas.length, 60);
  assert.ok(h.rampas.every((r) => r.capacidad === 25));
  assert.equal(h.rampas.filter((r) => r.s < h.sorter.recta).length, 25, '25 rampas en la recta de abajo');
  assert.equal(h.rampas.filter((r) => r.s > h.sorter.recta + Math.PI * h.sorter.radio).length, 35, '35 rampas en la recta de arriba');
  const rutas = h.planClasificacion.rutas;
  assert.equal(rutas.length, 50);
  const w = pesosRutas();
  let suma = 0;
  rutas.forEach((r, i) => {
    suma += r.peso;
    assert.ok(Math.abs(r.peso / rutas[0].peso - 1 / (i + 1) ** 0.7) < 1e-12, `peso de ${r.id} proporcional a 1 ÷ (r+1)^0,7`);
    assert.equal(r.peso, w[i]);
    assert.equal(r.rampas.length, i < 10 ? 2 : 1, `${r.id}: las 10 más pesadas con dos rampas`);
  });
  assert.ok(Math.abs(suma - 1) < 1e-12, `los pesos suman 1 (suman ${suma})`);
  const usadas = rutas.flatMap((r) => r.rampas);
  assert.equal(new Set(usadas).size, 60, 'cada rampa en una sola ruta y todas usadas');
  assert.equal(m.personas.rampa.cantidad, 15);
  assert.equal(m.personas.rampa.asignacion, 'por-volumen');
  assert.equal(m.personas.excepcion.cantidad, 2);
  assert.equal(m.calendario.corte, '30:00');
  assert.deepEqual(m.parametros, ejemplo.parametros, 'los mismos parámetros que el ejemplo');
});

test('las plantillas (y la propuesta) son coherentes: ranuras distintas, todo dentro del lazo, fracciones que suman 1, referencias que existen', () => {
  for (const [clave, m] of Object.entries(TODAS)) {
    const s = m.hub.sorter, T = bandejasLazo(s), L = largoLazo(s);
    const puntos = [...m.hub.induccion.puestos, ...m.hub.rampas, m.hub.excepcion];
    const ranuras = new Set<number>();
    for (const p of puntos) {
      assert.ok(p.s >= 0 && p.s < L, `${clave}: ${p.id} en s = ${p.s} tiene que estar dentro del lazo (largo ${L})`);
      const r = ranuraDe(s, T, p.s);
      assert.ok(!ranuras.has(r), `${clave}: ${p.id} repite la ranura ${r}`);
      ranuras.add(r);
    }
    assert.ok(s.lector.s >= 0 && s.lector.s < L);
    let f = 0;
    for (const c of m.hub.perfilPaquete.clases) f += c.fraccion;
    assert.ok(Math.abs(f - 1) < 1e-9, `${clave}: las fracciones del perfil suman ${f}`);
    const cfg = compilarConfig(m, 'F3');
    assert.equal(cfg.nCam, Array.isArray(m.demanda.camiones) ? m.demanda.camiones.length : m.demanda.camiones.cantidad);
    assert.ok(horaASeg(m.calendario.corte) <= horaASeg(m.calendario.fin));
  }
});

test('la geometría de las plantillas (y de la propuesta) queda dentro de sus límites', () => {
  for (const [clave, m] of Object.entries(TODAS)) {
    const g = geometria(m), { xmin, xmax, ymin, ymax } = g.limites;
    const dentro = (x: number, y: number, que: string) =>
      assert.ok(x >= xmin && x <= xmax && y >= ymin && y <= ymax, `${clave}: ${que} en (${x}, ${y}) fuera de [${xmin}, ${xmax}] × [${ymin}, ${ymax}]`);
    for (const e of g.estaciones) dentro(e.x, e.y, `estación ${e.id}`);
    for (const r of g.rampas) dentro(r.x, r.y, `rampa ${r.id}`);
    for (const a of g.andenes) dentro(a.x, a.y, `andén ${a.id}`);
    for (const c of g.cintas) for (const [x, y] of c.puntos) dentro(x, y, `cinta ${c.id}`);
    dentro(g.excepcion.x, g.excepcion.y, 'excepción');
    dentro(g.lector.x, g.lector.y, 'lector');
    dentro(g.acumulacion.x, g.acumulacion.y, 'acumulación');
    const p = new Float64Array(3);
    for (let i = 0; i < 400; i++) { // el lazo entero (posEnLazo usa Math nativo: es solo para dibujar)
      posEnLazo(g.lazo, (i / 400) * g.lazo.largo, p);
      dentro(p[0], p[1], `punto ${i} del lazo`);
    }
    assert.equal(g.lazo.bandejas, bandejasLazo(m.hub.sorter));
    assert.equal(g.rampas.length, m.hub.rampas.length);
    assert.ok(g.rampas.every((r) => r.ruta !== ''), `${clave}: toda rampa tiene ruta`);
    assert.equal(g.acumulacion.capacidad, capacidadAcumulacion(m.hub.acumulacion));
  }
});

test('ningún nombre de la lista negra en las plantillas (las empresas solo en campos «fuente» o «url»)', () => {
  const NEGRA = ['Andreani', 'Mercado Libre', 'MercadoLibre', 'Correo Argentino', 'OCA', 'DHL', 'FedEx', 'UPS', 'Amazon', 'Loginter',
    'Urbano', 'Rappi', 'PedidosYa'];
  const patrones = NEGRA.map((n) => new RegExp(`(^|[^\\p{L}])${n.replace(' ', '\\s+')}([^\\p{L}]|$)`, 'iu'));
  for (const sembrado of ['un hub de Mercado  Libre', 'Envíos OCA.', 'dhl', '(Amazon)']) {
    assert.ok(patrones.some((p) => p.test(sembrado)), `la búsqueda tiene que detectar «${sembrado}»`);
  }
  assert.ok(!patrones.some((p) => p.test('grupos, focales, suburbanos')), 'sin falsos positivos dentro de palabras');
  for (const [clave, m] of Object.entries(TODAS)) {
    const textos: [string, string][] = [];
    const recorrer = (x: unknown, ruta: string) => {
      if (typeof x === 'string') textos.push([ruta, x]);
      else if (Array.isArray(x)) x.forEach((v, i) => recorrer(v, `${ruta}/${i}`));
      else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) if (k !== 'fuente' && k !== 'url') recorrer(v, `${ruta}/${k}`);
    };
    recorrer(m, '');
    assert.ok(textos.length > 50, 'se recorrieron los textos');
    for (const [ruta, t] of textos) for (const p of patrones) assert.ok(!p.test(t), `${clave}${ruta}: «${t}» nombra a una empresa (${p})`);
  }
});

test(`ningún texto de las plantillas (ni de la propuesta) pasa los ${LIMITES_ENLACE.maxLargoTexto} caracteres que acepta el enlace`, () => {
  for (const [clave, m] of Object.entries(TODAS)) {
    let n = 0;
    const recorrer = (x: unknown, ruta: string): void => {
      if (typeof x === 'string') {
        n++;
        assert.ok(x.length <= LIMITES_ENLACE.maxLargoTexto, `${clave}${ruta}: ${x.length} caracteres (tope ${LIMITES_ENLACE.maxLargoTexto})`);
        assert.ok(!/[\u0000-\u001f\u007f]/.test(x), `${clave}${ruta}: tiene caracteres de control`);
      } else if (Array.isArray(x)) x.forEach((v, i) => recorrer(v, `${ruta}/${i}`));
      else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) recorrer(v, `${ruta}/${k}`);
    };
    recorrer(m, '');
    assert.ok(n > 50, `${clave}: se recorrieron ${n} textos`);
  }
});
