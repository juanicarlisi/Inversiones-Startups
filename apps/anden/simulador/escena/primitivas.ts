// escena/primitivas.ts · Andén simulador, corte 1 · P6 (escena).
// Las vistas trabajan en dos pasos (corte-1.md §9 P6, diseño maestro §4.7): primero COMPONEN una lista de primitivas (función pura,
// probada en Node) y después la PINTAN en Canvas 2D. Este archivo define las primitivas (en píxeles CSS de la pantalla) y las
// transformaciones de cámara de la planta 2D y de la isométrica 2,5D, con sus inversas para tocar.
import type { Camara, Piso } from '../contratos/vistas.ts';
import type { Forma } from './estilo.ts';
import type { Limites } from './disposicion.ts';

/** Profundidad para ordenar en la isométrica: mayor = más lejos = se pinta antes. En la planta 2D es el orden de capas. */
interface Base { prof: number }
export interface PRect extends Base { tipo: 'rect'; x: number; y: number; w: number; h: number; relleno: string | null; borde: string | null; grosor: number }
export interface PPoligono extends Base { tipo: 'poligono'; pts: number[]; relleno: string | null; borde: string | null; grosor: number }
export interface PLinea extends Base { tipo: 'linea'; pts: number[]; color: string; grosor: number; guion: number[] | null; cerrada: boolean }
export interface PCirculo extends Base { tipo: 'circulo'; x: number; y: number; r: number; relleno: string | null; borde: string | null; grosor: number }
/** Glifo de una entidad: la forma distingue el estado también en escala de grises. `ref` = clase · 2²⁴ + id (refDe). */
export interface PGlifo extends Base {
  tipo: 'glifo'; forma: Forma; x: number; y: number; tam: number; ang: number; relleno: string; borde: string | null; ref: number; alfa: number;
}
/** Sprite horneado de la isométrica (clave del horno); si el horno no lo tiene, se pinta el glifo de respaldo. */
export interface PSprite extends Base { tipo: 'sprite'; clave: string; x: number; y: number; respaldo: PGlifo }
/** Texto de DATOS del modelo (id de una rampa, de un andén): nunca un texto de interfaz (esos van por i18n en app/). */
export interface PTexto extends Base {
  tipo: 'texto'; x: number; y: number; texto: string; tam: number; color: string; alinear: CanvasTextAlign;
  /** Pastilla detrás del texto (rótulos de rampa, escena/rotulos.ts), con su borde. Sin `fondo`, el texto va solo. */
  fondo?: string | null; bordeFondo?: string | null;
}
export type Primitiva = PRect | PPoligono | PLinea | PCirculo | PGlifo | PSprite | PTexto;

/** Tamaño de la pantalla en píxeles CSS (el dpr lo aplica el pintor). */
export interface Marco { ancho: number; alto: number }

/** Inclinación fija de la isométrica (ángulo de elevación de la cámara), como la maqueta medida (38°). */
export const ELEVACION_ISO = (38 * Math.PI) / 180;
/** Giro por defecto de la isométrica (24°, como la maqueta). */
export const GIRO_ISO = (24 * Math.PI) / 180;
/** Altura (m) a la que se invierte la proyección isométrica al tocar: la de los paquetes sobre el lazo y las mesas. */
export const ALTURA_TOQUE_ISO = 0.9;

const SE = Math.sin(ELEVACION_ISO), CE = Math.cos(ELEVACION_ISO);

/**
 * Proyector de una cámara: mundo (m, con altura z) → pantalla (px CSS). Reutilizable: escribe en `out`.
 * - 2D: rotación por `giro` alrededor del centro y escala `zoom` (px por m); y hacia arriba en el mundo, hacia abajo en pantalla.
 * - Iso: u = x·cos g − y·sen g, w = x·sen g + y·cos g; pantalla = (u, w·sen e + z·cos e). Profundidad = w.
 */
export interface Proyector {
  readonly piso: Piso;
  readonly camara: Readonly<Camara>;
  readonly marco: Readonly<Marco>;
  /** Escribe [px, py] del punto (x, y, z). */
  aPantalla(x: number, y: number, z: number, out: number[] | Float64Array): void;
  /** Profundidad del punto (mayor = más lejos). En 2D, 0. */
  prof(x: number, y: number): number;
  /** Pantalla → mundo en el plano z. */
  aMundo(px: number, py: number, z?: number): [number, number];
}

export function crearProyector(piso: Piso, c: Camara, m: Marco): Proyector {
  const cg = Math.cos(c.giro), sg = Math.sin(c.giro), z = c.zoom, W2 = m.ancho / 2, H2 = m.alto / 2;
  if (piso === '2d') {
    const xc = c.cx * cg - c.cy * sg, yc = c.cx * sg + c.cy * cg;
    return {
      piso, camara: c, marco: m,
      aPantalla(x, y, _z, out) {
        out[0] = W2 + z * (x * cg - y * sg - xc);
        out[1] = H2 - z * (x * sg + y * cg - yc);
      },
      prof: () => 0,
      aMundo(px, py) {
        const xr = (px - W2) / z + xc, yr = -(py - H2) / z + yc;
        return [xr * cg + yr * sg, -xr * sg + yr * cg];
      },
    };
  }
  const uc = c.cx * cg - c.cy * sg, wc = c.cx * sg + c.cy * cg;
  return {
    piso, camara: c, marco: m,
    aPantalla(x, y, h, out) {
      const u = x * cg - y * sg, w = x * sg + y * cg;
      out[0] = W2 + z * (u - uc);
      out[1] = H2 - z * ((w - wc) * SE + h * CE);
    },
    prof: (x, y) => x * sg + y * cg,
    aMundo(px, py, h = ALTURA_TOQUE_ISO) {
      const u = (px - W2) / z + uc;
      const w = wc - ((py - H2) / z + h * CE) / SE;
      return [u * cg + w * sg, -u * sg + w * cg];
    },
  };
}

/** Ganancia mínima de escala para girar el plano un cuarto de vuelta (un 25% más grande, por lo menos). */
export const GANANCIA_GIRO = 1.25;

/**
 * Giro por defecto de la cámara para un marco: el de siempre (0 en la planta, GIRO_ISO en la isométrica) o un cuarto de vuelta más si
 * así el hub se ve al menos GANANCIA_GIRO veces más grande. Es lo que pasa con un hub apaisado en un teléfono parado (360 × 740): sin
 * girar, el plano ocupa una franja de un tercio de la pantalla.
 */
export function giroAuto(lim: Limites, m: Marco, piso: Piso, margen = 12): number {
  const base = piso === 'iso' ? GIRO_ISO : 0;
  const z0 = encuadrar(lim, m, piso, margen, base).zoom;
  const z1 = encuadrar(lim, m, piso, margen, base + Math.PI / 2).zoom;
  return z1 >= z0 * GANANCIA_GIRO ? base + Math.PI / 2 : base;
}

/**
 * Cámara que encuadra los límites en el marco con un margen (px). En la isométrica se encuadran las cuatro esquinas del piso y una
 * altura de 3 m (camiones y personas). Sin `giro`, lo elige giroAuto.
 */
export function encuadrar(lim: Limites, m: Marco, piso: Piso, margen = 12, giroPedido?: number): Camara {
  const giro = giroPedido ?? giroAuto(lim, m, piso, margen);
  const W = Math.max(1, m.ancho - 2 * margen), H = Math.max(1, m.alto - 2 * margen);
  const cg = Math.cos(giro), sg = Math.sin(giro);
  if (piso === '2d') {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const [x, y] of [[lim.xmin, lim.ymin], [lim.xmax, lim.ymin], [lim.xmin, lim.ymax], [lim.xmax, lim.ymax]]) {
      const xr = x * cg - y * sg, yr = x * sg + y * cg;
      x0 = Math.min(x0, xr); x1 = Math.max(x1, xr); y0 = Math.min(y0, yr); y1 = Math.max(y1, yr);
    }
    const zoom = Math.min(W / Math.max(1e-6, x1 - x0), H / Math.max(1e-6, y1 - y0));
    const xc = (x0 + x1) / 2, yc = (y0 + y1) / 2;
    return { cx: xc * cg + yc * sg, cy: -xc * sg + yc * cg, zoom, giro };
  }
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  for (const [x, y] of [[lim.xmin, lim.ymin], [lim.xmax, lim.ymin], [lim.xmin, lim.ymax], [lim.xmax, lim.ymax]]) {
    const u = x * cg - y * sg, w = x * sg + y * cg;
    u0 = Math.min(u0, u); u1 = Math.max(u1, u);
    v0 = Math.min(v0, w * SE); v1 = Math.max(v1, w * SE + 3 * CE);
  }
  const zoom = Math.min(W / Math.max(1e-6, u1 - u0), H / Math.max(1e-6, v1 - v0));
  const uc = (u0 + u1) / 2, wc = (v0 + v1) / 2 / SE; // el centro de la pantalla mira al centro vertical del encuadre, en z = 0
  return { cx: uc * cg + wc * sg, cy: -uc * sg + wc * cg, zoom, giro };
}

/** Rectángulo orientado (centro, dirección del largo, largo, ancho) → 4 esquinas en el mundo. */
export function esquinas(cx: number, cy: number, dx: number, dy: number, largo: number, ancho: number): number[] {
  const lx = dx * largo / 2, ly = dy * largo / 2, ax = -dy * ancho / 2, ay = dx * ancho / 2;
  return [cx - lx - ax, cy - ly - ay, cx + lx - ax, cy + ly - ay, cx + lx + ax, cy + ly + ay, cx - lx + ax, cy - ly + ay];
}

/**
 * Defensa del dibujo (hallazgo SEG-R1 de la revisión del 30-10-2026): ningún bucle de la escena puede depender del tamaño del modelo sin
 * tope. El esquema ya acota la geometría (±5 km, cintas de 2 km), pero si mañana cambia, una grilla cada 4 m sobre mil millones de
 * metros no puede volver a colgar la pestaña.
 */
export const MAX_LINEAS_GRILLA = 200;
/** Paso de la grilla del piso: `base` (m) duplicado hasta que entren a lo sumo MAX_LINEAS_GRILLA líneas por eje (Infinity si no hay rango finito). */
export function pasoGrilla(base: number, ...rangos: number[]): number {
  let r = 0;
  for (const x of rangos) r = Math.max(r, Math.abs(x));
  if (!Number.isFinite(r)) return Infinity;
  let paso = base;
  while (r / paso > MAX_LINEAS_GRILLA) paso *= 2;
  return paso;
}
/** Paso para muestrear un recorrido de largo `largo` (m): `base`, o más largo si harían falta más de `maxMuestras` muestras. */
export function pasoMuestreo(largo: number, base: number, maxMuestras: number): number {
  if (!Number.isFinite(largo) || largo <= 0) return Infinity;
  return Math.max(base, largo / maxMuestras);
}
/** ¿El punto de pantalla (x, y) cae dentro del marco, con un margen en px? Para no componer lo que no se ve. */
export function enMarco(m: Marco, x: number, y: number, margen: number): boolean {
  return x >= -margen && y >= -margen && x <= m.ancho + margen && y <= m.alto + margen;
}
