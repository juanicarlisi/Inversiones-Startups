// contratos/fixtures/traza-maqueta.ts · SOLO DESARROLLO Y PRUEBAS de las vistas y la interfaz mientras el hub de producción no existe.
// Corre la maqueta medida de la visión «Experiencia» (fixtures/maqueta/hub.mjs, copia literal; usa Math nativo y su propio azar,
// así que NO sirve para huellas ni para la batería) y convierte su traza al contrato de contratos/traza.ts.
// @ts-expect-error la maqueta es JavaScript sin tipos
import { simular, HUB_BASE, K } from './maqueta/hub.mjs';
import { TipoTramo, type Traza } from '../traza.ts';
import type { GeometriaHub } from '../geometria.ts';

const MAPA_K: Record<number, number> = {
  [K.DESCARGA]: TipoTramo.DESCARGA, [K.CINTA]: TipoTramo.CINTA, [K.COLA]: TipoTramo.ACUMULACION,
  [K.INDUCCION]: TipoTramo.INDUCCION, [K.BANDEJA]: TipoTramo.BANDEJA, [K.RAMPA]: TipoTramo.RAMPA,
  [K.MANO]: TipoTramo.MANO, [K.JAULA]: TipoTramo.JAULA, [K.MANUAL]: TipoTramo.MANUAL,
};

export function trazaDeMaqueta(semilla = 2): Traza {
  const { traza: t, geo: g, kpi } = simular(HUB_BASE, semilla);
  const n: number = t.n;
  const k = new Uint8Array(n);
  for (let i = 0; i < n; i++) k[i] = MAPA_K[t.k[i]] ?? 0;
  // la maqueta cuenta el paso del lazo desde t = 0: un solo tramo de marcha con k0 = 0
  const extra = 1, N = n + extra;
  const col = {
    n: N, e: new Int32Array(N), k: new Uint8Array(N), r: new Int32Array(N), a: new Int32Array(N),
    t0: new Float64Array(N), t1: new Float64Array(N), c: new Uint8Array(N), q: new Int32Array(N).fill(-1),
  };
  col.e.set(t.e); col.k.set(k); col.r.set(t.r); col.a.set(t.a); col.t0.set(t.t0); col.t1.set(t.t1);
  col.e[n] = -1; col.k[n] = TipoTramo.LAZO_MARCHA; col.t0[n] = 0; col.t1[n] = t.fin; col.a[n] = 0;
  // resumen por paquete a partir de los tramos
  const np = kpi.paquetes as number;
  const paq = { n: np, camion: new Int32Array(np).fill(-1), indice: new Int32Array(np), ruta: new Int16Array(np), clase: new Uint8Array(np),
    creado: new Float64Array(np).fill(-1), listo: new Float64Array(np).fill(-1), vueltas: new Uint8Array(np) };
  for (let i = 0; i < n; i++) {
    const e = t.e[i]; if (e < 0 || e >= np) continue;
    if (k[i] === TipoTramo.DESCARGA) { paq.creado[e] = t.t0[i]; paq.indice[e] = e; }
    if (k[i] === TipoTramo.RAMPA) paq.ruta[e] = t.r[i];
    if (k[i] === TipoTramo.JAULA) paq.listo[e] = t.t0[i];
    if (k[i] === TipoTramo.BANDEJA) paq.vueltas[e] = Math.max(paq.vueltas[e], t.a[i]);
  }
  const lazo = { forma: 'estadio' as const, recta: HUB_BASE.sorter.recta, radio: HUB_BASE.sorter.radio, origen: [0, 0] as [number, number],
    largo: g.L, paso: HUB_BASE.sorter.paso, bandejas: g.T };
  const geometria: GeometriaHub = {
    lazo,
    estaciones: g.estaciones.map((o: { s: number; x: number; y: number }, i: number) => ({ id: `I${i + 1}`, s: o.s, x: o.x, y: o.y })),
    lector: { s: 12, x: 12, y: 0 },
    rampas: g.rampas.map((o: { s: number; x: number; y: number; lado: -1 | 1 }, i: number) => ({ id: `R${String(i + 1).padStart(2, '0')}`, s: o.s,
      lado: o.lado, x: o.x, y: o.y, capacidad: HUB_BASE.rampas.capacidad, ruta: `Ruta ${String(i + 1).padStart(2, '0')}` })),
    excepcion: { id: 'RX', s: g.excepcion.s, x: g.excepcion.x, y: g.excepcion.y },
    andenes: g.andenes.map((a: { x: number; y: number }, i: number) => ({ id: `A${i + 1}`, x: a.x, y: a.y })),
    cintas: g.andenes.map((a: { x: number; y: number }, i: number) => ({ id: `C${i + 1}`, anden: `A${i + 1}`,
      puntos: [[a.x, a.y + 2], [a.x, -10], [2, -10], [2, -3]] as [number, number][], largo: HUB_BASE.andenes.cintaLargo })),
    acumulacion: { x: 2, y: -3, capacidad: HUB_BASE.buffer },
    limites: { xmin: -35, ymin: -25, xmax: HUB_BASE.sorter.recta + 2 * HUB_BASE.sorter.radio + 5, ymax: 2 * HUB_BASE.sorter.radio + 10 },
  };
  return {
    version: 1, modelo: 'maqueta', semilla, replica: 0, tickLazo: t.tick, bandejas: t.T, inicio: t.inicio, fin: t.fin, corte: HUB_BASE.corte * 1000,
    tramos: col, momentos: { n: 0, t: new Float64Array(0), tipo: new Uint8Array(0), r: new Int32Array(0), v: new Float64Array(0) },
    paquetes: paq,
    catalogo: {
      personas: [
        ...Array.from({ length: HUB_BASE.induccion.puestos }, (_, i) => ({ id: `P-I${i + 1}`, rol: 'induccion' as const })),
        ...Array.from({ length: HUB_BASE.rampas.personas }, (_, i) => ({ id: `P-R${i + 1}`, rol: 'rampa' as const })),
        ...Array.from({ length: HUB_BASE.manual.personas }, (_, i) => ({ id: `P-X${i + 1}`, rol: 'excepcion' as const })),
      ],
      camiones: Array.from({ length: HUB_BASE.camiones.n }, (_, i) => ({ id: `T${i + 1}`, turno: (HUB_BASE.camiones.desde + i * HUB_BASE.camiones.cada) * 1000 })),
      rutas: geometria.rampas.map((r) => r.ruta), rampas: geometria.rampas.map((r) => r.id), puestos: geometria.estaciones.map((e) => e.id),
      andenes: geometria.andenes.map((a) => a.id),
    },
    geometria, huella: 'maqueta-sin-huella',
  };
}
