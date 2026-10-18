// modelo/anonimizar.ts · P3 · Anonimizar antes de compartir (activado por defecto en «Compartir»).
// Lo que pide la especificación (§9, P3): rutas «Ruta 01…», volúmenes × f con f ∈ [0,8; 1,25] derivado de la semilla, costos
// redondeados a 2 cifras significativas, sin `autor` ni `descripcion`. Además, porque cualquiera de estos campos puede llevar el
// nombre de una empresa, de un cliente o de una planta: id y título neutros; ids de andenes, cintas, puestos, rampas, excepción,
// sorter y camiones renombrados (con sus referencias); la fuente de los costos y de los datos propios (DATO_USUARIO, MEDIDO)
// reemplazada, porque suele repetir el número exacto; y los parches de los escenarios con los mismos cambios.
// Determinista: el mismo (modelo, semilla) da el mismo resultado en cualquier dispositivo (solo + − × ÷ y enteros de 32 bits).
// IMPORTANTE: la semilla tiene que ser secreta (por ejemplo, crypto.getRandomValues) y NO la del experimento, que viaja en la
// receta: con ella cualquiera recalcula f y recupera los volúmenes reales.
import type { Anonimizar, Modelo, OpParche } from '../contratos/modelo.ts';
import { clonarJson, tokensDe } from './parches.ts';

/** Mezclador de 32 bits (fmix32 de MurmurHash3): bits bien repartidos aun con semillas consecutivas. */
function mezclar32(x: number): number {
  x = (x ^ (x >>> 16)) >>> 0;
  x = Math.imul(x, 0x85ebca6b) >>> 0;
  x = (x ^ (x >>> 13)) >>> 0;
  x = Math.imul(x, 0xc2b2ae35) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

/** Factor de volumen en [0,8; 1,25) derivado de la semilla. */
export function factorVolumen(semilla: number): number {
  const u = mezclar32(((semilla >>> 0) ^ 0x9e3779b9) >>> 0) / 4294967296;
  return 0.8 + 0.45 * u;
}

/** Redondeo a 2 cifras significativas sin logaritmos: 7.085 → 7.100; 496.000 → 500.000; 0,0123 → 0,012. */
export function redondear2Cifras(x: number): number {
  if (x === 0 || !Number.isFinite(x)) return x;
  const a = Math.abs(x);
  let r: number;
  if (a >= 1) {
    let k = 0, p = 1;
    while (p * 10 <= a) { p *= 10; k++; }
    r = k >= 1 ? Math.round(a / (p / 10)) * (p / 10) : Math.round(a * 10) / 10;
  } else {
    let q = 10;
    while (a * q < 1) q *= 10;   // a ∈ [1/q, 10/q)
    r = Math.round(a * q * 10) / (q * 10);
  }
  return x < 0 ? -r : r;
}

export const TITULO_ANONIMO = 'Hub anonimizado';
export const ID_ANONIMO = 'modelo-anonimo';
export const FUENTE_COSTO = 'Costo redondeado a 2 cifras significativas al anonimizar.';
export const FUENTE_PROPIA = 'Dato propio (anonimizado).';

const ancho = (n: number) => Math.max(2, String(n).length);
const num = (i: number, n: number) => String(i + 1).padStart(ancho(n), '0');

/** Cambia todos los textos de `x` que sean exactamente una clave de `mapa` (para los valores de los parches de escenarios). */
function renombrarEnValor(x: unknown, mapa: ReadonlyMap<string, string>): unknown {
  if (typeof x === 'string') return mapa.get(x) ?? x;
  if (Array.isArray(x)) return x.map((e) => renombrarEnValor(e, mapa));
  if (x !== null && typeof x === 'object') {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(x)) o[k] = renombrarEnValor((x as Record<string, unknown>)[k], mapa);
    return o;
  }
  return x;
}

/** Escala los paquetes que aparecen en el valor de una operación cuyo puntero cae dentro de /demanda/camiones. */
function escalarVolumenEnOp(tokens: readonly string[], valor: unknown, f: number): unknown {
  const escalar = (p: unknown) => (typeof p === 'number' ? Math.round(p * f) : p);
  const enCamion = (c: unknown) => {
    if (c === null || typeof c !== 'object' || Array.isArray(c)) return c;
    const o = { ...(c as Record<string, unknown>) };
    if ('paquetes' in o) o.paquetes = escalar(o.paquetes);
    return o;
  };
  if (tokens[0] !== 'demanda') return valor;
  if (tokens.length === 1) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) return valor;
    const d = { ...(valor as Record<string, unknown>) };
    if (Array.isArray(d.camiones)) d.camiones = d.camiones.map(enCamion);
    else d.camiones = enCamion(d.camiones);
    return d;
  }
  if (tokens[1] !== 'camiones') return valor;
  const ultimo = tokens[tokens.length - 1];
  if (ultimo === 'paquetes') return escalar(valor);
  if (tokens.length === 2) return Array.isArray(valor) ? valor.map(enCamion) : enCamion(valor);
  if (tokens.length === 3) return enCamion(valor);
  return valor;
}

/** Redondea los costos que aparecen en una operación (costos directos, parámetros de costo e indiferencia de la decisión). */
function redondearCostoEnOp(tokens: readonly string[], valor: unknown, parametrosDeCosto: ReadonlySet<string>): unknown {
  const r = (v: unknown) => (typeof v === 'number' ? redondear2Cifras(v) : v);
  const t = tokens.join('/');
  if (t === 'costos/horaPersona' || t === 'costos/fijoNoche' || t === 'decision/indiferencia/valor') return r(valor);
  if (tokens[0] === 'parametros' && tokens.length >= 3 && parametrosDeCosto.has(tokens[1]) && tokens[2] === 'valor') return r(valor);
  return valor;
}

export const anonimizar: Anonimizar = (entrada: Modelo, semilla: number): Modelo => {
  const m = clonarJson(entrada);
  const f = factorVolumen(semilla);
  const h = m.hub;

  // 1. Metadatos: fuera autor y descripción; id y título neutros.
  delete m.autor;
  delete m.descripcion;
  m.id = ID_ANONIMO;
  m.titulo = TITULO_ANONIMO;

  // 2. Ids del hub, con sus referencias.
  const ids = new Map<string, string>();
  // Un solo mapa para renombrar dentro de los parches; si una ruta se llama igual que un elemento del hub, gana el del hub.
  const ren = (viejo: string, nuevo: string) => { if (!ids.has(viejo)) ids.set(viejo, nuevo); return nuevo; };
  const andenes = new Map<string, string>();
  h.andenes.forEach((a, i) => { andenes.set(a.id, ren(a.id, `A${i + 1}`)); a.id = `A${i + 1}`; });
  h.cintas.forEach((c, i) => { c.id = ren(c.id, `C${i + 1}`); c.desde = andenes.get(c.desde) ?? c.desde; });
  h.induccion.puestos.forEach((p, i) => { p.id = ren(p.id, `I${i + 1}`); });
  const rampas = new Map<string, string>();
  h.rampas.forEach((r, i) => { const n = `R${num(i, h.rampas.length)}`; rampas.set(r.id, n); ren(r.id, n); r.id = n; });
  h.excepcion.id = ren(h.excepcion.id, 'RX');
  h.sorter.id = ren(h.sorter.id, 'S1');
  const rutas = h.planClasificacion.rutas;
  rutas.forEach((r, i) => {
    r.id = ren(r.id, `Ruta ${num(i, rutas.length)}`);
    r.rampas = r.rampas.map((x) => rampas.get(x) ?? x);
  });
  const asig = m.personas.rampa.asignacion;
  if (Array.isArray(asig)) m.personas.rampa.asignacion = asig.map((l) => l.map((x) => rampas.get(x) ?? x));

  // 3. Volúmenes × f.
  const cam = m.demanda.camiones;
  if (Array.isArray(cam)) cam.forEach((c, i) => { c.id = `Camión ${num(i, cam.length)}`; c.paquetes = Math.round(c.paquetes * f); });
  else cam.paquetes = Math.round(cam.paquetes * f);

  // 4. Costos a 2 cifras significativas (directos o en su parámetro, sin la fuente que repite el número exacto).
  const parametrosDeCosto = new Set<string>();
  for (const k of ['horaPersona', 'fijoNoche'] as const) {
    const x = m.costos[k];
    if (typeof x === 'number') { m.costos[k] = redondear2Cifras(x); continue; }
    const nombre = x.slice(1);
    if (!Object.hasOwn(m.parametros, nombre)) continue;
    parametrosDeCosto.add(nombre);
    const p = m.parametros[nombre];
    if (typeof p.valor === 'number') p.valor = redondear2Cifras(p.valor);
    else if (p.valor.tipo === 'fija') p.valor = { tipo: 'fija', valor: redondear2Cifras(p.valor.valor) };
    if (p.rango) p.rango = [redondear2Cifras(p.rango[0]), redondear2Cifras(p.rango[1])];
    if (p.incierto) {
      p.incierto = { ...p.incierto, bajo: redondear2Cifras(p.incierto.bajo), medio: redondear2Cifras(p.incierto.medio), alto: redondear2Cifras(p.incierto.alto) };
    }
    p.fuente = FUENTE_COSTO;
    delete p.url;
    delete p.nota;
  }
  if (m.decision) m.decision.indiferencia.valor = redondear2Cifras(m.decision.indiferencia.valor);

  // 5. Datos propios: la fuente puede nombrar la planta o la persona que midió.
  for (const k of Object.keys(m.parametros)) {
    const p = m.parametros[k];
    if (p.etiqueta === 'DATO_USUARIO' || p.etiqueta === 'MEDIDO') { p.fuente = FUENTE_PROPIA; delete p.url; delete p.nota; }
  }
  if (m.procedencia) {
    for (const k of Object.keys(m.procedencia)) {
      const p = m.procedencia[k];
      if (p.etiqueta === 'DATO_USUARIO' || p.etiqueta === 'MEDIDO') p.fuente = FUENTE_PROPIA;
    }
  }

  // 6. Escenarios: los mismos cambios en sus parches (ids, volúmenes, costos).
  if (m.escenarios) {
    for (const e of m.escenarios) {
      e.parche = e.parche.map((op): OpParche => {
        if (op.op === 'remove') return op;
        let tokens: string[];
        try { tokens = tokensDe(op.path); } catch { return op; }
        let v = renombrarEnValor(op.value, ids);
        v = escalarVolumenEnOp(tokens, v, f);
        v = redondearCostoEnOp(tokens, v, parametrosDeCosto);
        return { ...op, value: v };
      });
    }
  }
  return m;
};
