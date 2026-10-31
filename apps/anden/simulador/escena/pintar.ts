// escena/pintar.ts · Andén simulador, corte 1 · P6 (escena).
// Pinta una lista de primitivas (escena/primitivas.ts) en un contexto Canvas 2D, en el orden de la lista. No decide nada: lo que se
// ve es exactamente lo que compuso componer2d o componerIso. Los textos son datos del modelo (ids) y van con fillText, que no
// interpreta marcado: nunca hay innerHTML en la escena.
import type { PGlifo, Primitiva } from './primitivas.ts';

export type Contexto2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** Sprite horneado: imagen y punto de anclaje (el píxel de la imagen que va sobre el punto proyectado de la entidad). */
export interface Sprite { img: CanvasImageSource; ax: number; ay: number }
export interface Horno { obtener(clave: string): Sprite | null }

function camino(ctx: Contexto2D, pts: number[], cerrar: boolean): void {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  if (cerrar) ctx.closePath();
}

/** Pinta el glifo de una entidad: la forma depende del estado (estilo.ts, FORMA_ESTADO). */
export function pintarGlifo(ctx: Contexto2D, g: PGlifo): void {
  const { x, y, tam: s, relleno, borde } = g;
  const h = s / 2;
  if (g.alfa !== 1) ctx.globalAlpha = g.alfa;
  ctx.fillStyle = relleno;
  switch (g.forma) {
    case 'cuadrado':
      ctx.fillRect(x - h, y - h, s, s);
      break;
    case 'cuadrado-marcado':
      ctx.fillRect(x - h, y - h, s, s);
      ctx.lineWidth = Math.max(1.5, s * 0.22);
      ctx.strokeStyle = borde ?? relleno;
      ctx.strokeRect(x - h, y - h, s, s);
      break;
    case 'circulo':
      ctx.beginPath();
      ctx.arc(x, y, h * 1.05, 0, 2 * Math.PI);
      ctx.fill();
      break;
    case 'triangulo':
      ctx.beginPath();
      ctx.moveTo(x, y - h * 1.2);
      ctx.lineTo(x + h * 1.1, y + h * 0.85);
      ctx.lineTo(x - h * 1.1, y + h * 0.85);
      ctx.closePath();
      ctx.fill();
      break;
    case 'rombo':
      ctx.beginPath();
      ctx.moveTo(x, y - h * 1.25);
      ctx.lineTo(x + h * 1.25, y);
      ctx.lineTo(x, y + h * 1.25);
      ctx.lineTo(x - h * 1.25, y);
      ctx.closePath();
      ctx.fill();
      break;
    case 'barra': {
      const c = Math.cos(g.ang), sn = Math.sin(g.ang), l = s * 0.8, a = s * 0.35;
      ctx.beginPath();
      ctx.moveTo(x - c * l + sn * a, y - sn * l - c * a);
      ctx.lineTo(x + c * l + sn * a, y + sn * l - c * a);
      ctx.lineTo(x + c * l - sn * a, y + sn * l + c * a);
      ctx.lineTo(x - c * l - sn * a, y - sn * l + c * a);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'halo':
      ctx.beginPath();
      ctx.arc(x, y, h, 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = relleno;
      ctx.stroke();
      break;
    case 'persona':
      // cuerpo redondeado y cabeza: se distingue de cualquier paquete por la silueta
      ctx.beginPath();
      ctx.arc(x, y + h * 0.25, h * 0.75, 0, 2 * Math.PI);
      ctx.fill();
      if (borde) { ctx.lineWidth = 1; ctx.strokeStyle = borde; ctx.stroke(); }
      ctx.beginPath();
      ctx.arc(x, y - h * 0.75, h * 0.42, 0, 2 * Math.PI);
      ctx.fill();
      if (borde) ctx.stroke();
      break;
    case 'camion':
      ctx.fillRect(x - h, y - h * 0.6, s, s * 0.6);
      if (borde) { ctx.lineWidth = 1; ctx.strokeStyle = borde; ctx.strokeRect(x - h, y - h * 0.6, s, s * 0.6); }
      break;
  }
  if (g.alfa !== 1) ctx.globalAlpha = 1;
}

/** Pinta la lista entera. Devuelve cuántas primitivas pintó (las que no tienen nada que pintar no cuentan). */
export function pintar(ctx: Contexto2D, prims: readonly Primitiva[], horno: Horno | null = null): number {
  let n = 0;
  for (const p of prims) {
    switch (p.tipo) {
      case 'rect':
        if (p.relleno) { ctx.fillStyle = p.relleno; ctx.fillRect(p.x, p.y, p.w, p.h); }
        if (p.borde) { ctx.lineWidth = p.grosor; ctx.strokeStyle = p.borde; ctx.strokeRect(p.x, p.y, p.w, p.h); }
        break;
      case 'poligono':
        if (p.pts.length < 6) continue;
        camino(ctx, p.pts, true);
        if (p.relleno) { ctx.fillStyle = p.relleno; ctx.fill(); }
        if (p.borde) { ctx.lineWidth = p.grosor; ctx.strokeStyle = p.borde; ctx.stroke(); }
        break;
      case 'linea':
        if (p.pts.length < 4) continue;
        camino(ctx, p.pts, p.cerrada);
        ctx.lineWidth = p.grosor;
        ctx.strokeStyle = p.color;
        ctx.lineJoin = 'round';
        if (p.guion) ctx.setLineDash(p.guion);
        ctx.stroke();
        if (p.guion) ctx.setLineDash([]);
        break;
      case 'circulo':
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        if (p.relleno) { ctx.fillStyle = p.relleno; ctx.fill(); }
        if (p.borde) { ctx.lineWidth = p.grosor; ctx.strokeStyle = p.borde; ctx.stroke(); }
        break;
      case 'glifo':
        pintarGlifo(ctx, p);
        break;
      case 'sprite': {
        const s = horno ? horno.obtener(p.clave) : null;
        if (s) ctx.drawImage(s.img, Math.round(p.x - s.ax), Math.round(p.y - s.ay));
        else pintarGlifo(ctx, p.respaldo);
        break;
      }
      case 'texto':
        ctx.font = `600 ${p.tam}px system-ui, -apple-system, "Segoe UI", sans-serif`;
        ctx.textAlign = p.alinear;
        ctx.textBaseline = 'middle';
        if (p.fondo) {
          // pastilla ajustada al ancho real del texto (la composición solo lo estima)
          const w = (typeof ctx.measureText === 'function' ? ctx.measureText(p.texto).width : 0.62 * p.tam * p.texto.length) + 8, h = p.tam + 6;
          const x0 = p.alinear === 'center' ? p.x - w / 2 : p.alinear === 'right' || p.alinear === 'end' ? p.x - w + 4 : p.x - 4;
          const y0 = p.y - h / 2;
          if (typeof ctx.roundRect === 'function') { ctx.beginPath(); ctx.roundRect(x0, y0, w, h, h / 2); }
          else camino(ctx, [x0, y0, x0 + w, y0, x0 + w, y0 + h, x0, y0 + h], true);
          ctx.fillStyle = p.fondo;
          ctx.fill();
          if (p.bordeFondo) { ctx.lineWidth = 1.5; ctx.strokeStyle = p.bordeFondo; ctx.stroke(); }
        }
        ctx.fillStyle = p.color;
        ctx.fillText(p.texto, p.x, p.y);
        break;
    }
    n++;
  }
  return n;
}
