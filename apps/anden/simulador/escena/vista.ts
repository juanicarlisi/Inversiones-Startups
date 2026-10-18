// escena/vista.ts · Andén simulador, corte 1 · P6 (escena).
// Vista sobre un lienzo (contratos/vistas.ts, CrearVista): planta 2D o 2,5D isométrica, sin GPU. En cada cuadro: copia el fondo horneado
// (se rehace solo si cambian la cámara, el tamaño o el tema), compone la capa móvil del instante y la pinta. La vista nunca le pide nada
// al motor: todo sale del reproductor (la traza). Funciona con HTMLCanvasElement y con OffscreenCanvas (en un Worker).
import type { Ms } from '../contratos/tipos-base.ts';
import type { Camara, CrearVista, Estilo, OpcionesDibujo, Piso, Reproductor, Vista } from '../contratos/vistas.ts';
import { buffersDe } from './buffers.ts';
import { componer2d } from './componer2d.ts';
import { componerIso } from './componeriso.ts';
import { pintar, type Contexto2D, type Horno } from './pintar.ts';
import { crearProyector, encuadrar, type Marco, type Primitiva } from './primitivas.ts';
import { crearHorno, lienzoFueraDePantalla, type CrearLienzo } from './sprites.ts';

type Lienzo = HTMLCanvasElement | OffscreenCanvas;

export interface OpcionesVista {
  /** Fábrica de lienzos fuera de pantalla (para el fondo y los sprites). Por defecto OffscreenCanvas o <canvas>; null = no hornear. */
  crearLienzo?: CrearLienzo | null;
  /** Reloj para el pulso de la selección (ms). Por defecto performance.now si existe. */
  reloj?: () => number;
}

const igual = (a: Camara, b: Camara) => a.cx === b.cx && a.cy === b.cy && a.zoom === b.zoom && a.giro === b.giro;

/** Crea la vista. Con `opciones` se pueden inyectar el lienzo fuera de pantalla y el reloj (lo usan las pruebas en Node). */
export function crearVistaCon(lienzo: Lienzo, r: Reproductor, estilo: Estilo, piso: Piso, opciones: OpcionesVista = {}): Vista {
  const ctx = lienzo.getContext('2d') as Contexto2D | null;
  if (!ctx) throw new Error('escena: el lienzo no da un contexto 2D (¿ya tiene otro contexto, como WebGL?).');
  const crearLienzo = opciones.crearLienzo === undefined ? lienzoFueraDePantalla : opciones.crearLienzo;
  const reloj = opciones.reloj ?? (() => (globalThis.performance ? globalThis.performance.now() : 0));
  const lim = buffersDe(r).disposicion.limites;
  let marco: Marco = { ancho: Math.max(1, lienzo.width), alto: Math.max(1, lienzo.height) };
  let dpr = 1;
  let auto = encuadrar(lim, marco, piso);
  let destruida = false;
  let fondo: { clave: string; img: CanvasImageSource | null; prims: Primitiva[] } | null = null;
  let horno: { clave: string; h: Horno } | null = null;

  const vista: Vista = {
    piso,
    camara: { ...auto },
    dibujar(t: Ms, o?: OpcionesDibujo): void {
      if (destruida) return;
      const cam = vista.camara;
      const clave = `${piso}|${marco.ancho}x${marco.alto}@${dpr}|${cam.cx},${cam.cy},${cam.zoom},${cam.giro}|${estilo.tema}`;
      if (!fondo || fondo.clave !== clave) {
        const comp = { rep: r, t, marco, camara: cam, estilo, capa: 'fondo' as const };
        const prims = piso === 'iso' ? componerIso(comp) : componer2d(comp);
        let img: CanvasImageSource | null = null;
        const l = crearLienzo ? crearLienzo(marco.ancho * dpr, marco.alto * dpr) : null;
        if (l) {
          l.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          pintar(l.ctx, prims);
          img = l.lienzo;
        }
        fondo = { clave, img, prims };
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (fondo.img) ctx.drawImage(fondo.img, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!fondo.img) pintar(ctx, fondo.prims);
      if (piso === 'iso') {
        const ch = `${cam.zoom}|${cam.giro}|${estilo.tema}`;
        if (!horno || horno.clave !== ch) horno = { clave: ch, h: crearHorno({ estilo, zoom: cam.zoom, giro: cam.giro, crearLienzo: crearLienzo ?? (() => null) }) };
      }
      const pulso = estilo.reducirMovimiento ? 0 : (reloj() / 1200) % 1;
      const comp = { rep: r, t, marco, camara: cam, estilo, opciones: o, capa: 'movil' as const, pulso };
      const prims = piso === 'iso' ? componerIso(comp) : componer2d(comp);
      pintar(ctx, prims, horno ? horno.h : null);
    },
    redimensionar(ancho: number, alto: number, d: number): void {
      if (destruida) return;
      if (!(ancho > 0) || !(alto > 0) || !(d > 0)) {
        throw new RangeError(`escena: redimensionar espera ancho, alto y dpr > 0 (vinieron ${ancho}, ${alto} y ${d}).`);
      }
      const eraAuto = igual(vista.camara, auto);
      marco = { ancho, alto };
      dpr = d;
      lienzo.width = Math.round(ancho * d);
      lienzo.height = Math.round(alto * d);
      auto = encuadrar(lim, marco, piso);
      if (eraAuto) vista.camara = { ...auto };
      fondo = null;
    },
    aMundo(px: number, py: number): [number, number] {
      return crearProyector(piso, vista.camara, marco).aMundo(px, py);
    },
    destruir(): void {
      destruida = true;
      fondo = null;
      horno = null;
    },
  };
  return vista;
}

export const crearVista: CrearVista = (lienzo, r, estilo, piso) => crearVistaCon(lienzo, r, estilo, piso);

/** Vuelve la cámara al encuadre completo del hub. */
export function encuadrarVista(v: Vista, r: Reproductor, ancho: number, alto: number): void {
  v.camara = encuadrar(buffersDe(r).disposicion.limites, { ancho, alto }, v.piso);
}
