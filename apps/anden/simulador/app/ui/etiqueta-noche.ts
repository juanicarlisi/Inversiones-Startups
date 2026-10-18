// app/ui/etiqueta-noche.ts · Andén simulador, corte 1 · P8 (interfaz).
// La etiqueta de noche, OBLIGATORIA en toda vista con película (diseño maestro §5.1.4 y §5.9): «Noche 37 de 100 · la mediana por hora de
// fin». Nunca se muestra una noche sin decir cuál es y por qué es esa. Al lado, la franja de supuestos («6 supuestos sin fuente…»).
import type { Contexto } from '../contexto.ts';
import type { CualNocheMostrada, NocheVista } from '../sesion.ts';
import { el } from './dom.ts';

export function textoEtiquetaNoche(ctx: Contexto, noche: NocheVista | null, cual: CualNocheMostrada, N: number, provisoriaB = false): string {
  if (!noche) return ctx.t('app.noche.cargando');
  const vars = { n: noche.replica + 1, N, criterio: ctx.t(`app.kpi.${ctx.sesion.kpiNoche}`) };
  if (provisoriaB) return ctx.t('app.noche.etiqueta.previa', vars);
  return ctx.t(`app.noche.etiqueta.${cual}`, vars);
}

/** Etiqueta de la noche que se ve (A) y, si se pasa, la de B. Se actualiza con `actualizar()`. */
export function etiquetaNoche(ctx: Contexto, lado: 'A' | 'B' = 'A'): { nodo: HTMLElement; actualizar(): void } {
  const nodo = el('p', { class: 'etiqueta-noche', 'data-etiqueta-noche': lado });
  const actualizar = () => {
    const s = ctx.sesion;
    const txt = lado === 'A' ? textoEtiquetaNoche(ctx, s.noche, s.cualNoche, s.N)
      : textoEtiquetaNoche(ctx, s.ysi.nocheB, s.cualNoche, s.N, s.ysi.fase !== 'confirmada');
    nodo.textContent = txt;
  };
  actualizar();
  return { nodo, actualizar };
}

/** Franja de supuestos: cuántos valores son supuestos o estimaciones (no datos de quien mira). Lleva al comprobante. */
export function franjaSupuestos(ctx: Contexto): HTMLElement {
  const mv = ctx.sesion.mv;
  if (!mv) return el('span');
  const ps = Object.values(mv.modelo.parametros);
  const supuestos = ps.filter((p) => p.etiqueta === 'SUPUESTO').length;
  const estimaciones = ps.filter((p) => p.etiqueta === 'ESTIMACION' || p.etiqueta === 'HIPOTESIS').length;
  const propios = ps.filter((p) => p.etiqueta === 'DATO_USUARIO' || p.etiqueta === 'MEDIDO').length;
  return el('button', { type: 'button', class: 'franja-supuestos', 'data-accion': 'ir-comprobante-supuestos', onclick: () => ctx.ir('comprobante') },
    ctx.t(propios ? 'app.franja.conPropios' : 'app.franja.supuestos', { supuestos, estimaciones, propios }));
}
