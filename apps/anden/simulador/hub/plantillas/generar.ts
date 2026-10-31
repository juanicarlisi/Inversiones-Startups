// hub/plantillas/generar.ts · Andén simulador, corte 1 · P4 (el hub).
// Genera la plantilla grande `hub-lazo-noche@1.0.0` (24.000 paquetes; la que abre el enlace de portada) desde el modelo de ejemplo,
// con las reglas de corte-1.md §5: 26 camiones de 923 paquetes desde las 22:00 cada 15 min; 4 andenes de 2 personas; acumulación de
// 96 m (160 lugares); 6 puestos físicos, 4 con persona; lazo de 70 m de recta y radio 40 ÷ 2π (300 bandejas); 60 rampas de capacidad
// 25 (25 abajo y 35 arriba, como la maqueta medida); 50 rutas con pesos 1 ÷ (r+1)^0,7 normalizados, las 10 más pesadas con dos rampas;
// 15 personas de rampa por volumen; 2 puestos manuales; corte a las 06:00 (30:00); los mismos parámetros.
// La salida se guarda UNA vez como JSON inmutable (hub-lazo-noche.json); la prueba plantillas.test.ts verifica que este generador la
// reproduce exacta. Una versión nueva sería otro id@versión. Es una herramienta: no corre en la app.
//
// También genera la PROPUESTA `hub-chico@1.1.0` (NOTAS-CONTRATO §13): la plantilla chica con la dotación que hace que «KPI sanos» de
// §9 se cumpla al pie de la letra. No está publicada: la integración decide si la suma a PLANTILLAS (registro.ts › PROPUESTAS).
import type { Modelo, OpParche } from '../../contratos/modelo.ts';
import { matNativa } from '../../contratos/referencia/motor-referencia.ts';

const dos = (n: number) => String(n).padStart(2, '0');
/** Redondeo a centímetros (las posiciones quedan como números cortos en el JSON). */
const aCm = (x: number) => Math.round(x * 100) / 100;

/** Posiciones (m sobre el lazo) de las 60 rampas: 25 en la recta de abajo y 35 en la de arriba, como la maqueta medida. */
export function posicionesRampas(): { s: number; lado: -1 | 1 }[] {
  const out: { s: number; lado: -1 | 1 }[] = [];
  for (let i = 0; i < 25; i++) out.push({ s: aCm(18 + i * 2), lado: -1 });
  for (let i = 0; i < 35; i++) out.push({ s: aCm(91 + i * 1.95), lado: 1 });
  return out;
}

/** Pesos 1 ÷ (r+1)^0,7 normalizados, r = 0…49 (reparto tipo Zipf de los destinos). */
export function pesosRutas(n = 50, exponente = 0.7): number[] {
  const w = Array.from({ length: n }, (_, r) => 1 / matNativa.pow(r + 1, exponente));
  let suma = 0;
  for (const x of w) suma += x;
  return w.map((x) => x / suma);
}

export function generarHubLazoNoche(base: Modelo): Modelo {
  const m = structuredClone(base) as Modelo;
  m.id = 'hub-lazo-noche';
  m.titulo = 'Hub de clasificación con lazo, turno noche (24.000 paquetes)';
  m.descripcion =
    'Hub de última milla con sorter de bandejas a escala de la maqueta medida: 26 camiones de 923 paquetes, 4 andenes, 6 puestos de ' +
    'inducción (4 con persona), 60 rampas para 50 rutas y 15 personas de rampa. Supuestos de ejemplo con su fuente; no es un hub real ' +
    'ni sale de ninguna empresa.';
  m.plantilla = { id: 'hub-lazo-noche', version: '1.0.0' };
  m.procedencia = {
    ...(m.procedencia ?? {}),
    '/hub/rampas': {
      etiqueta: 'SUPUESTO',
      fuente: 'Capacidad de rampa sin valor publicado (realismo-logistico.md §2.6); 60 rampas de capacidad 25, 25 abajo y 35 arriba, como la maqueta medida (visiones/experiencia-medicion/hub.mjs).',
      fecha: '2026-10-17',
    },
    '/hub/planClasificacion': {
      etiqueta: 'SUPUESTO',
      fuente: 'Pesos de 50 rutas 1 ÷ (r+1)^0,7 normalizados (reparto tipo Zipf de la maqueta medida); las 10 más pesadas con dos rampas, repartidas por el lazo.',
      fecha: '2026-10-17',
    },
  };
  m.calendario = { inicio: '22:00', fin: '30:00', corte: '30:00' };
  m.demanda = { ...m.demanda, camiones: { serie: true, cantidad: 26, primero: '22:00', cada: 900, paquetes: 923 } };

  const h = m.hub;
  h.andenes = [0, 1, 2, 3].map((i) => ({ id: `A${i + 1}`, x: -20 + 6 * i, y: -12, personas: 2 }));
  h.playa = { capacidad: 8 };
  h.cintas = h.andenes.map((a, i) => ({
    id: `C${i + 1}`, desde: a.id, velocidad: 1, paso: 0.6,
    puntos: (a.x === -2 ? [[-2, -10], [-2, -3]] : [[a.x, -10], [a.x, -3], [-2, -3]]) as [number, number][],
  }));
  h.acumulacion = { largo: 96, paso: 0.6, x: -1, y: -2 };
  h.sorter = { ...h.sorter, recta: 70, radio: 40 / (2 * Math.PI), lector: { ...h.sorter.lector, s: 10 } };
  h.induccion = { ...h.induccion, puestos: [0.5, 2, 3.5, 5, 6.5, 8].map((s, i) => ({ id: `I${i + 1}`, s })) };
  const pos = posicionesRampas();
  h.rampas = pos.map((p, i) => ({ id: `R${dos(i + 1)}`, s: p.s, lado: p.lado, capacidad: 25 }));
  h.excepcion = { id: 'RX', s: 159.5 };
  // Rampa i → «lugar» (i · 37) mod 60 (37 es coprimo con 60: es una permutación que reparte las rutas grandes por el lazo).
  // Lugar p < 50 → ruta p; lugar p ≥ 50 → segunda rampa de la ruta p − 50 (las 10 más pesadas).
  const pesos = pesosRutas();
  const rampasDe: string[][] = Array.from({ length: 50 }, () => []);
  for (let i = 0; i < 60; i++) {
    const p = (i * 37) % 60;
    rampasDe[p < 50 ? p : p - 50].push(h.rampas[i].id);
  }
  h.planClasificacion = {
    multiRampa: 'la-menos-llena',
    rutas: pesos.map((peso, r) => ({ id: `Ruta ${dos(r + 1)}`, peso, rampas: rampasDe[r] })),
  };

  const pe = m.personas;
  pe.induccion = { ...pe.induccion, puestosActivos: 4 };
  pe.rampa = { ...pe.rampa, cantidad: 15, asignacion: 'por-volumen' };
  pe.excepcion = { ...pe.excepcion, cantidad: 2 };

  if (m.decision) m.decision = { ...m.decision, variable: { ...m.decision.variable, max: 6 } };
  m.escenarios = [
    { id: 'base', titulo: 'Como está hoy', parche: [] },
    { id: 'mas-un-puesto', titulo: 'Un puesto de inducción más', parche: [{ op: 'replace', path: '/personas/induccion/puestosActivos', value: 5 }] },
    { id: 'reten', titulo: 'Una persona de retén que cubre faltas', parche: [{ op: 'replace', path: '/personas/induccion/reten', value: 1 }] },
    { id: 'rampas-contiguas', titulo: 'Cada persona de rampa con rampas vecinas', parche: [{ op: 'replace', path: '/personas/rampa/asignacion', value: 'contiguas' }] },
    { id: 'pico', titulo: 'Pico de evento: 50% más paquetes por camión', parche: [{ op: 'replace', path: '/demanda/camiones/paquetes', value: 1385 }] },
  ];
  return m;
}

/**
 * Aplica operaciones RFC 6902 `replace` sobre rutas que ya existen, en el lugar, y devuelve el mismo modelo. Es lo mínimo que necesitan
 * el generador y las pruebas del hub; el parche completo (add, remove, test, escapes) es de modelo/ (P3), que el hub no importa.
 */
export function reemplazar(m: Modelo, ops: readonly OpParche[]): Modelo {
  for (const op of ops) {
    if (op.op !== 'replace') throw new Error(`reemplazar: solo acepta 'replace' y vino '${op.op}' en ${op.path}.`);
    const partes = op.path.split('/').slice(1).map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'));
    let x = m as unknown as Record<string, unknown>;
    for (const p of partes.slice(0, -1)) {
      if (typeof x[p] !== 'object' || x[p] === null) throw new Error(`reemplazar: la ruta ${op.path} no existe (falta «${p}»).`);
      x = x[p] as Record<string, unknown>;
    }
    const ultima = partes[partes.length - 1];
    if (!Object.prototype.hasOwnProperty.call(x, ultima)) throw new Error(`reemplazar: la ruta ${op.path} no existe (falta «${ultima}»).`);
    x[ultima] = structuredClone(op.value);
  }
  return m;
}

/**
 * El cambio de dotación de la propuesta hub-chico@1.1.0 sobre hub-chico@1.0.0, como parche RFC 6902 (solo `replace`). Es lo único que
 * cambia en la simulación; lo demás de la propuesta es metadato (versión, descripción, procedencia de estos tres valores y el
 * escenario del retén, que con 1.0.0 agregaba la persona que 1.1.0 ya tiene).
 */
export const PARCHE_HUB_CHICO_1_1_0: readonly OpParche[] = Object.freeze([
  Object.freeze({ op: 'replace', path: '/personas/induccion/reten', value: 1 }),
  Object.freeze({ op: 'replace', path: '/personas/rampa/cantidad', value: 7 }),
  Object.freeze({ op: 'replace', path: '/personas/excepcion/cantidad', value: 2 }),
] as OpParche[]);

/** Fecha de la propuesta 1.1.0 (la de las mediciones de NOTAS-CONTRATO §13). */
const FECHA_1_1_0 = '2026-10-18';

/**
 * PROPUESTA hub-chico@1.1.0 desde hub-chico@1.0.0 (`base`): aplica PARCHE_HUB_CHICO_1_1_0 y escribe la procedencia de los tres
 * valores como SUPUESTO con la medición que los justifica. Mismo id de modelo, mismos parámetros, misma decisión y misma semilla.
 */
export function generarHubChico110(base: Modelo): Modelo {
  const m = structuredClone(base) as Modelo;
  if (m.plantilla?.id !== 'hub-chico' || m.plantilla.version !== '1.0.0') {
    throw new Error(`generarHubChico110: se esperaba la base hub-chico@1.0.0 y vino ${m.plantilla?.id}@${m.plantilla?.version}.`);
  }
  reemplazar(m, PARCHE_HUB_CHICO_1_1_0);
  // Desde el motor 1.1.0 la caminata entre rampas se calcula por la distancia sobre el lazo a 1,2 m/s y este parámetro es solo el mínimo:
  // la procedencia de 1.0.0 decía lo contrario (hallazgo HUB-R13 de la revisión del 30-10-2026; la 1.0.0 publicada no se toca).
  const caminar = m.parametros.caminarEntreRampas;
  if (caminar) {
    caminar.unidad = 's como mínimo al cambiar de rampa';
    caminar.fuente = 'Supuesto de la maqueta de medición. Es el mínimo por cambio de rampa: la caminata real se calcula con la distancia ' +
      'sobre el pasillo del lazo a 1,2 m/s (motor 1.1.0 en adelante).';
    caminar.fecha = '2026-10-31';
  }
  m.plantilla = { id: 'hub-chico', version: '1.1.0' };
  m.creado = FECHA_1_1_0;
  m.descripcion =
    'Hub de última milla con sorter de bandejas: 10 camiones de 800 paquetes, 3 andenes, 5 puestos de inducción (3 con persona y una ' +
    'de retén que cubre faltas), 12 rampas para 10 rutas con 7 personas y 2 puestos manuales. Supuestos de ejemplo con su fuente; no es ' +
    'un hub real ni sale de ninguna empresa.';
  m.procedencia = {
    ...(m.procedencia ?? {}),
    '/personas/induccion/reten': {
      etiqueta: 'SUPUESTO',
      fuente: 'Dotación de ejemplo (versión 1.1.0): una persona de retén cubre las faltas de inducción y después las de rampa. Sin ' +
        'retén, una noche con dos de tres inductores ausentes no termina en 5 h: el único presente tarda más que eso solo en inducir.',
      fecha: FECHA_1_1_0,
    },
    '/personas/rampa/cantidad': {
      etiqueta: 'SUPUESTO',
      fuente: 'Dotación de ejemplo (versión 1.1.0): 7 personas de rampa en vez de 6. Con 6, la caminata entre rampas y las pausas en ' +
        'el pico hacen de la rampa el cuello (F0 no cuenta la caminata). MEDIDO con el motor de referencia en 200 noches (18-10-2026): ' +
        'fin P50 195 · P90 209 · máx. 252 min; con 1.0.0, el 13,5% de las noches pasa los 300 min.',
      fecha: FECHA_1_1_0,
    },
    '/personas/excepcion/cantidad': {
      etiqueta: 'SUPUESTO',
      fuente: 'Dotación de ejemplo (versión 1.1.0): 2 puestos manuales en vez de 1. Con uno, la excepción (20 s por paquete, ' +
        'supuesto) pone la cola de la noche cuando las rampas se llenan.',
      fecha: FECHA_1_1_0,
    },
  };
  // Con 1.0.0 el escenario «reten» agregaba la persona que 1.1.0 ya tiene: pasa a mostrar qué compra esa persona.
  m.escenarios = (m.escenarios ?? []).map((e) => e.id !== 'reten' ? e
    : { id: 'sin-reten', titulo: 'Sin la persona de retén', parche: [{ op: 'replace', path: '/personas/induccion/reten', value: 0 }] });
  return m;
}
