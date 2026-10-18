// escena/narracion.ts · Andén simulador, corte 1 · P6 (escena).
// Lo que la región aria-live de la interfaz lee del lienzo (diseño maestro §5.10: «una región aria-live narra los momentos»): una clave
// i18n con sus variables, calculadas desde el reproductor (la misma fuente que lo que se ve). La interfaz la traduce y la pone con
// textContent.
import type { Ms } from '../contratos/tipos-base.ts';
import { segAHora } from '../contratos/tipos-base.ts';
import { ClaseEntidad } from '../contratos/traza.ts';
import type { Reproductor } from '../contratos/vistas.ts';
import { calcular } from './buffers.ts';

export function narrar(rep: Reproductor, t: Ms): { clave: string; vars: Record<string, string | number> } {
  const b = calcular(rep, t), p = b.pos, rec = b.rec;
  let paquetes = 0;
  for (let i = 0; i < p.n; i++) if (p.clase[i] === ClaseEntidad.PAQUETE) paquetes++;
  let llenas = 0;
  for (let r = 0; r < rec.rampaLlena.length; r++) llenas += rec.rampaLlena[r];
  const hora = segAHora(Math.floor(Math.min(Math.max(t, rep.inicio), rep.fin) / 1000));
  if (rec.lazoDetenido) return { clave: 'escena.narracion.lazoDetenido', vars: { hora, paquetes } };
  return { clave: 'escena.narracion.instante', vars: { hora, paquetes, fila: rec.filaAcumulacion, llenas } };
}
