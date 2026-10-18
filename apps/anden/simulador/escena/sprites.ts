// escena/sprites.ts · Andén simulador, corte 1 · P6 (escena).
// Horno de sprites de la vista 2,5D (diseño maestro §4.7; maqueta medida: 1,8 ms por cuadro con sprites contra mucho más dibujando
// cada caja): cada entidad se dibuja UNA vez por estado, tema, giro y escala en un lienzo chico, y en cada cuadro se copia con
// drawImage. Se hornea a pedido (la primera vez que aparece una clave). Sin lienzos (Node), el horno no da nada y el pintor usa el glifo.
// Claves: 'paquete:<estado>', 'paquete2:<estado>' (dos bandejas), 'persona:<estado>', 'camion:<estado>:<grados>'.
import { EstadoVisual, type Estilo } from '../contratos/vistas.ts';
import { COLOR_ESTADO, FORMA_ESTADO, color } from './estilo.ts';
import { carasCaja } from './componeriso.ts';
import { pintar, pintarGlifo, type Contexto2D, type Horno, type Sprite } from './pintar.ts';
import { crearProyector, type Primitiva } from './primitivas.ts';

export type CrearLienzo = (ancho: number, alto: number) => { lienzo: CanvasImageSource; ctx: Contexto2D } | null;

/** Lienzo fuera de pantalla: OffscreenCanvas si existe; si no, un <canvas> del documento; si no hay ninguno (Node), null. */
export const lienzoFueraDePantalla: CrearLienzo = (ancho, alto) => {
  const w = Math.max(1, Math.ceil(ancho)), h = Math.max(1, Math.ceil(alto));
  const g = globalThis as { OffscreenCanvas?: typeof OffscreenCanvas; document?: Document };
  if (typeof g.OffscreenCanvas === 'function') {
    const c = new g.OffscreenCanvas(w, h), ctx = c.getContext('2d');
    return ctx ? { lienzo: c, ctx } : null;
  }
  if (g.document && typeof g.document.createElement === 'function') {
    const c = g.document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    return ctx ? { lienzo: c, ctx } : null;
  }
  return null;
};

/** Medidas de las cajas (m): largo, ancho, alto. */
const MEDIDAS = {
  paquete: [0.42, 0.34, 0.28], paquete2: [0.85, 0.4, 0.3], cuerpo: [0.45, 0.4, 1.15], cabeza: [0.3, 0.3, 0.3], camion: [3.4, 2.2, 2.6],
} as const;

export interface OpcionesHorno {
  estilo: Estilo;
  /** px por metro de la cámara. */
  zoom: number;
  giro: number;
  /** Tamaño mínimo en px del lado del paquete (para que se vea en un teléfono). */
  minPaquetePx?: number;
  /** Alto mínimo en px de una persona. */
  minPersonaPx?: number;
  crearLienzo?: CrearLienzo;
}

export function crearHorno(o: OpcionesHorno): Horno {
  const crear = o.crearLienzo ?? lienzoFueraDePantalla;
  const cache = new Map<string, Sprite | null>();
  const e = o.estilo;
  // Escala propia de cada familia: nunca más chica que el mínimo legible.
  const zPaq = Math.max(o.zoom, (o.minPaquetePx ?? 5) / MEDIDAS.paquete[0]);
  const zPer = Math.max(o.zoom, (o.minPersonaPx ?? 14) / (MEDIDAS.cuerpo[2] + MEDIDAS.cabeza[2]));

  const hornear = (dibujar: (prims: Primitiva[]) => void, marca?: (ctx: Contexto2D, ax: number, ay: number) => void): Sprite | null => {
    // Primero se compone con la cámara en el origen y se mide la caja de lo dibujado; después se pinta corrido.
    const prims: Primitiva[] = [];
    dibujar(prims);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of prims) if (p.tipo === 'poligono') for (let i = 0; i < p.pts.length; i += 2) {
      x0 = Math.min(x0, p.pts[i]); x1 = Math.max(x1, p.pts[i]); y0 = Math.min(y0, p.pts[i + 1]); y1 = Math.max(y1, p.pts[i + 1]);
    }
    if (!Number.isFinite(x0)) return null;
    const pad = 3, w = x1 - x0 + 2 * pad, h = y1 - y0 + 2 * pad;
    const l = crear(w, h);
    if (!l) return null;
    const dx = pad - x0, dy = pad - y0;
    for (const p of prims) if (p.tipo === 'poligono') for (let i = 0; i < p.pts.length; i += 2) { p.pts[i] += dx; p.pts[i + 1] += dy; }
    pintar(l.ctx, prims);
    if (marca) marca(l.ctx, dx, dy);
    return { img: l.lienzo, ax: dx, ay: dy }; // el origen del mundo (0, 0, 0) quedó en (dx, dy)
  };

  const sprite = (clave: string): Sprite | null => {
    const [familia, estS, gradS] = clave.split(':');
    const est = Number(estS) as EstadoVisual;
    if (!(est in FORMA_ESTADO)) return null;
    if (familia === 'paquete' || familia === 'paquete2') {
      const [l, a, h] = MEDIDAS[familia];
      const col = color(e, COLOR_ESTADO[est]);
      const borde = est === EstadoVisual.ATRASADO ? color(e, 'texto') : null;
      return hornear((prims) => {
        const proy = crearProyector('iso', { cx: 0, cy: 0, zoom: zPaq, giro: o.giro }, { ancho: 0, alto: 0 });
        carasCaja(proy, 0, 0, 0, 1, 0, l, a, h, col, 0, prims, borde);
      }, (ctx, ax, ay) => {
        // la marca de forma sobre la tapa: también se distingue en escala de grises (salvo el normal, que es la caja lisa)
        if (est === EstadoVisual.NORMAL) return;
        const proy = crearProyector('iso', { cx: 0, cy: 0, zoom: zPaq, giro: o.giro }, { ancho: 0, alto: 0 });
        const q = [0, 0];
        proy.aPantalla(0, 0, h, q);
        const tam = Math.max(3, Math.min(7, l * zPaq * 0.55));
        pintarGlifo(ctx, {
          tipo: 'glifo', forma: FORMA_ESTADO[est], x: q[0] + ax, y: q[1] + ay, tam, ang: 0, relleno: color(e, 'fondo'), borde: null, ref: -1, alfa: 0.9, prof: 0,
        });
      });
    }
    if (familia === 'persona') {
      const col = color(e, est === EstadoVisual.ESPERANDO ? 'personaPausa' : 'persona');
      return hornear((prims) => {
        const proy = crearProyector('iso', { cx: 0, cy: 0, zoom: zPer, giro: o.giro }, { ancho: 0, alto: 0 });
        const [cl, ca, ch] = MEDIDAS.cuerpo, [hl, ha, hh] = MEDIDAS.cabeza;
        carasCaja(proy, 0, 0, 0, 1, 0, cl, ca, ch, col, 0, prims);
        carasCaja(proy, 0, 0, ch + 0.05, 1, 0, hl, ha, hh, col, 0, prims);
      });
    }
    if (familia === 'camion') {
      const ang = ((Number(gradS) || 0) * Math.PI) / 180;
      const col = color(e, est === EstadoVisual.ESPERANDO ? 'camionEspera' : 'camion');
      return hornear((prims) => {
        const proy = crearProyector('iso', { cx: 0, cy: 0, zoom: o.zoom, giro: o.giro }, { ancho: 0, alto: 0 });
        const [l, a, h] = MEDIDAS.camion;
        carasCaja(proy, 0, 0, 0, Math.cos(ang), Math.sin(ang), l, a, h, col, 0, prims, color(e, 'camionBorde'));
      });
    }
    return null;
  };

  return {
    obtener(clave: string): Sprite | null {
      if (!cache.has(clave)) cache.set(clave, sprite(clave));
      return cache.get(clave) ?? null;
    },
  };
}
