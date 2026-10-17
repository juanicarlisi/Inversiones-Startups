// contratos/geometria.ts · CONGELADO. Geometría del hub en metros (la calcula el paquete del hub; la usan las vistas).
export interface LazoEstadio {
  forma: 'estadio';
  recta: number;            // largo de cada recta (m)
  radio: number;            // radio de las curvas (m)
  origen: [number, number]; // inicio de la recta de abajo
  largo: number;            // 2·recta + 2π·radio
  paso: number;             // m entre bandejas
  bandejas: number;         // round(largo / paso)
}
export interface GeometriaHub {
  lazo: LazoEstadio;
  estaciones: { id: string; s: number; x: number; y: number }[];
  lector: { s: number; x: number; y: number };
  rampas: { id: string; s: number; lado: -1 | 1; x: number; y: number; capacidad: number; ruta: string }[];
  excepcion: { id: string; s: number; x: number; y: number };
  andenes: { id: string; x: number; y: number }[];
  cintas: { id: string; anden: string; puntos: [number, number][]; largo: number }[];
  acumulacion: { x: number; y: number; capacidad: number };
  limites: { xmin: number; ymin: number; xmax: number; ymax: number };
}
/**
 * Posición sobre el lazo tipo estadio a la distancia s (m) desde el origen, en sentido antihorario:
 * recta de abajo hacia +x, curva derecha, recta de arriba hacia −x, curva izquierda. Escribe [x, y, ángulo] en out.
 * Usa Math.cos/Math.sin nativos: es solo para dibujar, nunca entra al motor ni a la huella.
 */
export function posEnLazo(l: LazoEstadio, s: number, out: Float64Array | number[]): void {
  const L = l.largo, R = l.radio, Lr = l.recta, [x0, y0] = l.origen;
  let d = ((s % L) + L) % L;
  if (d < Lr) { out[0] = x0 + d; out[1] = y0; out[2] = 0; return; }
  d -= Lr;
  if (d < Math.PI * R) { const a = -Math.PI / 2 + d / R; out[0] = x0 + Lr + R * Math.cos(a); out[1] = y0 + R + R * Math.sin(a); out[2] = a + Math.PI / 2; return; }
  d -= Math.PI * R;
  if (d < Lr) { out[0] = x0 + Lr - d; out[1] = y0 + 2 * R; out[2] = Math.PI; return; }
  d -= Lr;
  const a = Math.PI / 2 + d / R; out[0] = x0 + R * Math.cos(a); out[1] = y0 + R + R * Math.sin(a); out[2] = a + Math.PI / 2;
}
