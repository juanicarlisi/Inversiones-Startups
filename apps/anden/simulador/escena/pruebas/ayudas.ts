// escena/pruebas/ayudas.ts · Andén simulador, corte 1 · P6 (escena). Ayudas de las pruebas del paquete (no es un archivo de prueba).
// - Una geometría sintética chica con cuentas redondas (lazo de 30 m, 50 bandejas de 0,6 m, tick de 300 ms) y un constructor de trazas a
//   mano sobre el escritor de la referencia de contratos/: cada prueba siembra exactamente los tramos que necesita.
// - La traza de la maqueta medida con cualquier juego de parámetros (la fixture de contratos/ solo arma la de 24.000 paquetes; la de
//   90.000 es la que pide la prueba de costo de §9 P6).
// - Un lienzo falso que anota lo que se le pide (para probar la vista en Node, sin navegador).
// Todo es determinista: la maqueta tiene su propio azar con semilla y las trazas sintéticas no sortean nada.
import { posEnLazo, type GeometriaHub, type LazoEstadio } from '../../contratos/geometria.ts';
import { crearEscritorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import { TipoTramo, type Causa, type Catalogo, type TipoMomento, type Traza } from '../../contratos/traza.ts';
import type { KpiId, ResultadoReplica } from '../../contratos/resultados.ts';
import { KPIS } from '../../contratos/resultados.ts';
// @ts-expect-error la maqueta es JavaScript sin tipos
import { simular, HUB_BASE, K, hubGrande } from '../../contratos/fixtures/maqueta/hub.mjs';

// ---------------------------------------------------------------------------------------------------------------------------------
// Geometría sintética
// ---------------------------------------------------------------------------------------------------------------------------------

/** Paso del lazo (m), velocidad (m/s) y tick (ms) de la geometría sintética. */
export const PASO = 0.6, VELOCIDAD = 2, TICK = 300;
/** Lazo tipo estadio: rectas de 9 m, curvas de 6 m (radio 6/π): largo 30 m, 50 bandejas exactas. */
export const LAZO: LazoEstadio = { forma: 'estadio', recta: 9, radio: 6 / Math.PI, origen: [0, 0], largo: 30, paso: PASO, bandejas: 50 };

function punto(s: number): { x: number; y: number } {
  const o = [0, 0, 0];
  posEnLazo(LAZO, s, o);
  return { x: o[0], y: o[1] };
}

/**
 * Hub sintético: 2 puestos de inducción (s 0,6 y 1,8), lector a 3 m, 3 rampas (R01 y R02 abajo hacia −y, R03 arriba hacia +y) de 3
 * lugares, excepción arriba a 21 m, 2 andenes con su cinta (9 m y 5 m), acumulación de 20 lugares en (−1, −2).
 */
export function geometriaSintetica(): GeometriaHub {
  return {
    lazo: LAZO,
    estaciones: [{ id: 'I1', s: 0.6, ...punto(0.6) }, { id: 'I2', s: 1.8, ...punto(1.8) }],
    lector: { s: 3, ...punto(3) },
    rampas: [
      { id: 'R01', s: 4.8, lado: -1, ...punto(4.8), capacidad: 3, ruta: 'Ruta 01' },
      { id: 'R02', s: 7.2, lado: -1, ...punto(7.2), capacidad: 3, ruta: 'Ruta 02' },
      { id: 'R03', s: 18, lado: 1, ...punto(18), capacidad: 3, ruta: 'Ruta 03' },
    ],
    excepcion: { id: 'RX', s: 21, ...punto(21) },
    andenes: [{ id: 'A1', x: -5, y: -9 }, { id: 'A2', x: -2, y: -9 }],
    cintas: [
      { id: 'C1', anden: 'A1', puntos: [[-5, -8], [-5, -3], [-1, -3]], largo: 9 },
      { id: 'C2', anden: 'A2', puntos: [[-2, -8], [-2, -3]], largo: 5 },
    ],
    acumulacion: { x: -1, y: -2, capacidad: 20 },
    limites: { xmin: -9, ymin: -13, xmax: 15, ymax: 10 },
  };
}

/** Personas del hub sintético (índice global = posición en la lista). */
export const PERSONAS = {
  I1: 0, I2: 1, R1: 2, R2: 3, D1: 4, D2: 5, X1: 6, T1: 7,
} as const;

export function catalogoSintetico(): Catalogo {
  return {
    personas: [
      { id: 'P-I1', rol: 'induccion' }, { id: 'P-I2', rol: 'induccion' }, { id: 'P-R1', rol: 'rampa' }, { id: 'P-R2', rol: 'rampa' },
      { id: 'P-D1', rol: 'descarga' }, { id: 'P-D2', rol: 'descarga' }, { id: 'P-X1', rol: 'excepcion' }, { id: 'P-T1', rol: 'reten' },
    ],
    camiones: [{ id: 'T01', turno: 0 }, { id: 'T02', turno: 900_000 }, { id: 'T03', turno: 1_800_000 }],
    rutas: ['Ruta 01', 'Ruta 02', 'Ruta 03'],
    rampas: ['R01', 'R02', 'R03'],
    puestos: ['I1', 'I2'],
    andenes: ['A1', 'A2'],
  };
}

/** Lo que se le puede sembrar a una traza sintética. */
export interface Sembrador {
  tramo(e: number, k: TipoTramo, r: number, a: number, t0: number, t1: number, c?: Causa, q?: number): number;
  momento(t: number, tipo: TipoMomento, r: number, v: number): void;
  /** Resumen de un paquete (listo = −1 si no terminó). */
  paquete(id: number, o: { camion?: number; indice?: number; ruta?: number; clase?: number; creado: number; listo: number; vueltas?: number }): void;
}

export interface OpcionesSintetica { inicio?: number; fin?: number; corte?: number; geometria?: GeometriaHub; catalogo?: Catalogo }

/**
 * Traza sintética sobre el escritor de la referencia de contratos/: lo que se siembra es exactamente lo que queda en la traza.
 * Por defecto: inicio 0, fin 1 h, corte 30 min.
 */
export function trazaSintetica(sembrar: (s: Sembrador) => void, o: OpcionesSintetica = {}): Traza {
  const esc = crearEscritorReferencia('completa');
  const inicio = o.inicio ?? 0, fin = o.fin ?? 3_600_000, corte = o.corte ?? 1_800_000;
  sembrar({
    tramo: (e, k, r, a, t0, t1, c, q) => esc.tramo(e, k, r, a, t0, t1, c, q),
    momento: (t, tipo, r, v) => esc.momento(t, tipo, r, v),
    paquete: (id, p) => {
      esc.paquete(id, p.camion ?? 0, p.indice ?? id, p.ruta ?? 0, p.clase ?? 0, p.creado);
      if (p.listo >= 0) esc.paqueteListo(id, p.listo, p.vueltas ?? 0);
    },
  });
  return esc.terminar({
    modelo: 'sintetico', semilla: 1, replica: 0, tickLazo: TICK, bandejas: LAZO.bandejas, inicio, fin, corte,
    catalogo: o.catalogo ?? catalogoSintetico(), geometria: o.geometria ?? geometriaSintetica(), huella: 'sintetica',
  });
}

/** Un tramo LAZO_MARCHA desde el inicio hasta el fin con k0 = 0 (el lazo anda toda la noche). */
export function lazoEnMarcha(s: Sembrador, inicio = 0, fin = 3_600_000): void {
  s.tramo(-1, TipoTramo.LAZO_MARCHA, 0, 0, inicio, fin);
}

/** Posición [x, y] de la ranura σ de la geometría sintética (s = σ · paso, exacto porque 50 · 0,6 = 30). */
export function posRanura(sigma: number): [number, number] {
  const T = LAZO.bandejas, o = [0, 0, 0];
  posEnLazo(LAZO, (((sigma % T) + T) % T) * (LAZO.largo / T), o);
  return [o[0], o[1]];
}

// ---------------------------------------------------------------------------------------------------------------------------------
// La maqueta medida con cualquier juego de parámetros (copia de contratos/fixtures/traza-maqueta.ts con la geometría generalizada)
// ---------------------------------------------------------------------------------------------------------------------------------

const MAPA_K: Record<number, number> = {
  [K.DESCARGA]: TipoTramo.DESCARGA, [K.CINTA]: TipoTramo.CINTA, [K.COLA]: TipoTramo.ACUMULACION,
  [K.INDUCCION]: TipoTramo.INDUCCION, [K.BANDEJA]: TipoTramo.BANDEJA, [K.RAMPA]: TipoTramo.RAMPA,
  [K.MANO]: TipoTramo.MANO, [K.JAULA]: TipoTramo.JAULA, [K.MANUAL]: TipoTramo.MANUAL,
};

/** Parámetros de la maqueta de ~90.000 paquetes (la variante grande de la visión «Experiencia»). */
export const MAQUETA_90K: unknown = hubGrande();
export const MAQUETA_24K: unknown = HUB_BASE;

/** Traza de la maqueta con los parámetros `p` (los de la fixture o los de la variante grande). Sin personas ni momentos. */
export function trazaDeMaquetaCon(p: any, semilla: number): Traza {
  const { traza: t, geo: g, kpi } = simular(p, semilla);
  const n: number = t.n, N = n + 1;
  const col = {
    n: N, e: new Int32Array(N), k: new Uint8Array(N), r: new Int32Array(N), a: new Int32Array(N),
    t0: new Float64Array(N), t1: new Float64Array(N), c: new Uint8Array(N), q: new Int32Array(N).fill(-1),
  };
  for (let i = 0; i < n; i++) col.k[i] = MAPA_K[t.k[i]] ?? 0;
  col.e.set(t.e); col.r.set(t.r); col.a.set(t.a); col.t0.set(t.t0); col.t1.set(t.t1);
  col.e[n] = -1; col.k[n] = TipoTramo.LAZO_MARCHA; col.t0[n] = 0; col.t1[n] = t.fin; col.a[n] = 0;
  const np = kpi.paquetes as number;
  const paq = {
    n: np, camion: new Int32Array(np).fill(-1), indice: new Int32Array(np), ruta: new Int16Array(np), clase: new Uint8Array(np),
    creado: new Float64Array(np).fill(-1), listo: new Float64Array(np).fill(-1), vueltas: new Uint8Array(np),
  };
  for (let i = 0; i < n; i++) {
    const e = t.e[i];
    if (e < 0 || e >= np) continue;
    if (col.k[i] === TipoTramo.DESCARGA) { paq.creado[e] = t.t0[i]; paq.indice[e] = e; }
    if (col.k[i] === TipoTramo.RAMPA) paq.ruta[e] = t.r[i];
    if (col.k[i] === TipoTramo.JAULA) paq.listo[e] = t.t0[i];
    if (col.k[i] === TipoTramo.BANDEJA) paq.vueltas[e] = Math.max(paq.vueltas[e], t.a[i]);
  }
  const S = p.sorter;
  const rampas = g.rampas.map((o: { s: number; x: number; y: number; lado: -1 | 1 }, i: number) => ({
    id: `R${String(i + 1).padStart(2, '0')}`, s: o.s, lado: o.lado, x: o.x, y: o.y, capacidad: p.rampas.capacidad,
    ruta: `Ruta ${String(i + 1).padStart(2, '0')}`,
  }));
  const andenes = g.andenes.map((a: { x: number; y: number }, i: number) => ({ id: `A${i + 1}`, x: a.x, y: a.y }));
  const geometria: GeometriaHub = {
    lazo: { forma: 'estadio', recta: S.recta, radio: S.radio, origen: [0, 0], largo: g.L, paso: S.paso, bandejas: g.T },
    estaciones: g.estaciones.map((o: { s: number; x: number; y: number }, i: number) => ({ id: `I${i + 1}`, s: o.s, x: o.x, y: o.y })),
    lector: { s: 12, x: 12, y: 0 },
    rampas,
    excepcion: { id: 'RX', s: g.excepcion.s, x: g.excepcion.x, y: g.excepcion.y },
    andenes,
    cintas: g.andenes.map((a: { x: number; y: number }, i: number) => ({
      id: `C${i + 1}`, anden: `A${i + 1}`, puntos: [[a.x, a.y + 2], [a.x, -10], [2, -10], [2, -3]] as [number, number][], largo: p.andenes.cintaLargo,
    })),
    acumulacion: { x: 2, y: -3, capacidad: p.buffer },
    limites: { xmin: -35, ymin: -25, xmax: S.recta + 2 * S.radio + 5, ymax: 2 * S.radio + 10 },
  };
  return {
    version: 1, modelo: 'maqueta', semilla, replica: 0, tickLazo: t.tick, bandejas: t.T, inicio: t.inicio, fin: t.fin, corte: p.corte * 1000,
    tramos: col, momentos: { n: 0, t: new Float64Array(0), tipo: new Uint8Array(0), r: new Int32Array(0), v: new Float64Array(0) },
    paquetes: paq,
    catalogo: {
      personas: [
        ...Array.from({ length: p.induccion.puestos }, (_, i) => ({ id: `P-I${i + 1}`, rol: 'induccion' as const })),
        ...Array.from({ length: p.rampas.personas }, (_, i) => ({ id: `P-R${i + 1}`, rol: 'rampa' as const })),
        ...Array.from({ length: p.manual.personas }, (_, i) => ({ id: `P-X${i + 1}`, rol: 'excepcion' as const })),
      ],
      camiones: Array.from({ length: p.camiones.n }, (_, i) => ({ id: `T${i + 1}`, turno: (p.camiones.desde + i * p.camiones.cada) * 1000 })),
      rutas: rampas.map((r: { ruta: string }) => r.ruta), rampas: rampas.map((r: { id: string }) => r.id),
      puestos: geometria.estaciones.map((e) => e.id), andenes: andenes.map((a: { id: string }) => a.id),
    },
    geometria, huella: 'maqueta-sin-huella',
  };
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Resultados sintéticos (para el mapa de riesgo)
// ---------------------------------------------------------------------------------------------------------------------------------

/** Un ResultadoReplica con todos los KPI en 0 salvo los que se pasan. */
export function resultado(replica: number, o: {
  kpi?: Partial<Record<KpiId, number>>; minutosLlena?: number[]; fila?: number[]; modelo?: string;
}): ResultadoReplica {
  const kpi = Object.fromEntries(KPIS.map((k) => [k, 0])) as Record<KpiId, number>;
  Object.assign(kpi, o.kpi ?? {});
  const nr = (o.minutosLlena ?? []).length;
  return {
    modelo: o.modelo ?? 'm', semilla: 1, replica, huella: `h${replica}`, kpi,
    porRecurso: {
      rampaRecibidos: new Array(nr).fill(0), rampaVueltas: new Array(nr).fill(0), rampaMinutosLlena: o.minutosLlena ?? [],
      personaOcupadaPct: [], puestoInducidos: [],
    },
    series: { filaInduccionMax: o.fila ?? [], clasificados: [] },
    alertas: [], eventos: 0,
  };
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Lienzo falso
// ---------------------------------------------------------------------------------------------------------------------------------

/** Contexto 2D falso: cuenta las llamadas por nombre y guarda los drawImage. Cualquier método que no esté abajo no existe. */
export class ContextoFalso {
  llamadas: Record<string, number> = {};
  imagenes: unknown[] = [];
  textos: string[] = [];
  transformaciones: number[][] = [];
  fillStyle: unknown = '#000';
  strokeStyle: unknown = '#000';
  lineWidth = 1;
  lineJoin = 'miter';
  globalAlpha = 1;
  font = '';
  textAlign = 'start';
  textBaseline = 'alphabetic';
  private anotar(n: string) { this.llamadas[n] = (this.llamadas[n] ?? 0) + 1; }
  beginPath() { this.anotar('beginPath'); }
  closePath() { this.anotar('closePath'); }
  moveTo(x: number, y: number) { this.revisar(x, y); this.anotar('moveTo'); }
  lineTo(x: number, y: number) { this.revisar(x, y); this.anotar('lineTo'); }
  arc(x: number, y: number) { this.revisar(x, y); this.anotar('arc'); }
  fill() { this.anotar('fill'); }
  stroke() { this.anotar('stroke'); }
  fillRect(x: number, y: number) { this.revisar(x, y); this.anotar('fillRect'); }
  strokeRect(x: number, y: number) { this.revisar(x, y); this.anotar('strokeRect'); }
  fillText(t: string, x: number, y: number) { this.revisar(x, y); this.textos.push(t); this.anotar('fillText'); }
  setLineDash() { this.anotar('setLineDash'); }
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number) { this.transformaciones.push([a, b, c, d, e, f]); this.anotar('setTransform'); }
  drawImage(img: unknown, x: number, y: number) { this.revisar(x, y); this.imagenes.push(img); this.anotar('drawImage'); }
  /** Ninguna coordenada que llega al lienzo puede ser NaN o infinita. */
  noFinitos = 0;
  private revisar(x: number, y: number) { if (!Number.isFinite(x) || !Number.isFinite(y)) this.noFinitos++; }
}

/** Lienzo falso con su contexto (width y height como un <canvas>). */
export function lienzoFalso(ancho = 640, alto = 400): { width: number; height: number; ctx: ContextoFalso; getContext(tipo: string): ContextoFalso | null } {
  const ctx = new ContextoFalso();
  return { width: ancho, height: alto, ctx, getContext: (tipo: string) => (tipo === '2d' ? ctx : null) };
}

/** Distancia entre dos puntos. */
export function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}
