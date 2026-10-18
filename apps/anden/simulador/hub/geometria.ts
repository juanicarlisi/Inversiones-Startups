// hub/geometria.ts · Andén simulador, corte 1 · P4 (el hub).
// Geometría del hub en metros para las vistas (contratos/geometria.ts). El lazo es un estadio: recta de abajo hacia +x desde el
// origen, curva derecha, recta de arriba hacia −x y curva izquierda (posEnLazo, del contrato). Estaciones, lector, rampas y excepción
// quedan sobre el lazo (las vistas las corren hacia afuera con `lado`). Los límites encierran todo con un margen.
// Solo dibuja: nada de esto entra al motor ni a la huella.
import type { GeometriaDe } from '../contratos/hub.ts';
import { posEnLazo, type GeometriaHub, type LazoEstadio } from '../contratos/geometria.ts';
import type { Modelo } from '../contratos/modelo.ts';
import { bandejasLazo, capacidadAcumulacion, largoLazo, largoPolilinea } from './config.ts';

/** Margen alrededor de todo lo que hay en el plano (m). */
export const MARGEN_LIMITES = 3;

export const geometria: GeometriaDe = (m: Modelo): GeometriaHub => {
  const h = m.hub, s = h.sorter;
  const lazo: LazoEstadio = {
    forma: 'estadio', recta: s.recta, radio: s.radio, origen: [s.origen[0], s.origen[1]], largo: largoLazo(s), paso: s.paso,
    bandejas: bandejasLazo(s),
  };
  const p = new Float64Array(3);
  const en = (pos: number): [number, number] => {
    posEnLazo(lazo, pos, p);
    return [p[0], p[1]];
  };
  const rutaDe = new Map<string, string>();
  for (const ru of h.planClasificacion.rutas) for (const r of ru.rampas) if (!rutaDe.has(r)) rutaDe.set(r, ru.id);

  const estaciones = h.induccion.puestos.map((e) => { const [x, y] = en(e.s); return { id: e.id, s: e.s, x, y }; });
  const [lx, ly] = en(s.lector.s);
  const rampas = h.rampas.map((r) => {
    const [x, y] = en(r.s);
    return { id: r.id, s: r.s, lado: r.lado, x, y, capacidad: r.capacidad, ruta: rutaDe.get(r.id) ?? '' };
  });
  const [ex, ey] = en(h.excepcion.s);
  const andenes = h.andenes.map((a) => ({ id: a.id, x: a.x, y: a.y }));
  const cintas = h.cintas.map((c) => ({
    id: c.id, anden: c.desde, puntos: c.puntos.map(([x, y]) => [x, y] as [number, number]), largo: largoPolilinea(c.puntos),
  }));
  const acumulacion = { x: h.acumulacion.x, y: h.acumulacion.y, capacidad: capacidadAcumulacion(h.acumulacion) };

  // Límites: el estadio entero (x de origen − radio a origen + recta + radio; y de origen a origen + 2·radio) y todo lo demás.
  const [ox, oy] = lazo.origen;
  let xmin = ox - s.radio, xmax = ox + s.recta + s.radio, ymin = oy, ymax = oy + 2 * s.radio;
  const incluir = (x: number, y: number) => {
    if (x < xmin) xmin = x;
    if (x > xmax) xmax = x;
    if (y < ymin) ymin = y;
    if (y > ymax) ymax = y;
  };
  for (const a of andenes) incluir(a.x, a.y);
  for (const c of cintas) for (const [x, y] of c.puntos) incluir(x, y);
  incluir(acumulacion.x, acumulacion.y);
  const M = MARGEN_LIMITES;
  return {
    lazo, estaciones, lector: { s: s.lector.s, x: lx, y: ly }, rampas, excepcion: { id: h.excepcion.id, s: h.excepcion.s, x: ex, y: ey },
    andenes, cintas, acumulacion, limites: { xmin: xmin - M, ymin: ymin - M, xmax: xmax + M, ymax: ymax + M },
  };
};
