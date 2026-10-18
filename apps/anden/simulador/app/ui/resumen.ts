// app/ui/resumen.ts · Andén simulador, corte 1 · P8 (interfaz).
// La línea de arriba de la escena (diseño maestro §5.3): «Costo por paquete $X (± Y) · Perder el corte: 1 noche de cada N · Confianza:
// [semáforo] · Comprobante», y los tres sellos que no se mezclan (§5.9): motor verificado, reproducida en este dispositivo y validación.
// Ningún número sin su incertidumbre: el costo lleva su ± (IC de t sobre las noches) y la probabilidad, su IC de Wilson.
import type { Proporcion } from '../../contratos/experimentos.ts';
import type { Contexto } from '../contexto.ts';
import { el, type Hijo } from './dom.ts';
import { fichaSemaforo } from './semaforo.ts';

/** «1 noche de cada 10», «3 de cada 10 noches», «ninguna de 100 noches»… a partir de P(no perder el corte). */
export function textoPerderCorte(ctx: Contexto, prop: Proporcion): { texto: string; ic: string } {
  const p = 1 - prop.p, bajo = 1 - prop.ic[1], alto = 1 - prop.ic[0];
  let texto: string;
  if (prop.exitos === prop.n) texto = ctx.t('app.resumen.perder.ninguna', { N: prop.n });
  else if (p >= 0.95) texto = ctx.t('app.resumen.perder.casiTodas');
  else if (p >= 0.2) texto = ctx.t('app.resumen.perder.deCada10', { k: Math.round(p * 10) });
  else texto = ctx.t('app.resumen.perder.unaDeCada', { cada: Math.max(2, Math.round(1 / p)) });
  const ic = ctx.t('app.resumen.perder.ic', { bajo: ctx.f.porcentaje(bajo, 0), alto: ctx.f.porcentaje(alto, 0) });
  return { texto, ic };
}

/** Línea de resumen de las cien noches. Mientras llegan, el progreso. */
export function lineaResumen(ctx: Contexto): HTMLElement {
  const s = ctx.sesion, mv = s.mv;
  const partes: Hijo[] = [];
  const sep = () => el('span', { class: 'resumen__sep', 'aria-hidden': 'true' }, '·');
  if (!mv) return el('div', { class: 'resumen' });
  if (!s.nochesListas) {
    partes.push(el('span', { class: 'resumen__item resumen__item--calculando', 'data-resumen': 'calculando' },
      ctx.t('app.resumen.calculando', { llegadas: s.llegadas, N: s.N })));
  } else {
    const moneda = mv.modelo.costos.moneda;
    if (s.resumenCosto) {
      partes.push(el('span', { class: 'resumen__item', 'data-resumen': 'costo' }, ctx.t('app.resumen.costo', {
        valor: ctx.f.moneda(s.resumenCosto.media, moneda), mas: ctx.f.moneda(s.resumenCosto.semiancho, moneda) })));
    }
    if (s.propCorte) {
      const { texto, ic } = textoPerderCorte(ctx, s.propCorte);
      partes.push(sep(), el('span', { class: 'resumen__item', 'data-resumen': 'corte' }, ctx.t('app.resumen.corte', { texto }),
        el('span', { class: 'resumen__ic' }, ` ${ic}`)));
    }
  }
  partes.push(sep(), el('span', { class: 'resumen__item', 'data-resumen': 'confianza' }, `${ctx.t('app.resumen.confianza')} `, fichaSemaforo(ctx, s.semaforo)));
  partes.push(sep(), el('button', { type: 'button', class: 'enlace-boton', 'data-accion': 'ir-comprobante', onclick: () => ctx.ir('comprobante') },
    ctx.t('app.resumen.comprobante')));
  return el('div', { class: 'resumen', role: 'group', 'aria-label': ctx.t('app.resumen.titulo') }, ...partes);
}

/** Los tres sellos con su texto exacto (diseño maestro §5.9). `compacto` = una línea cada uno (para la escena). */
export function sellos(ctx: Contexto, compacto = false): HTMLElement {
  const s = ctx.sesion, c = s.comprobante;
  const motor = c
    ? ctx.t('app.sello.motor', { version: c.motor.version, pasaron: c.motor.pasaron, exigibles: c.motor.pruebasExigibles })
    : ctx.t('app.sello.motor.pendiente', { version: ctx.servicios.versionMotor });
  const rep = s.selloReproducida();
  const reproducida = ctx.t(`app.sello.reproducida.${rep}`, { receta: s.receta?.motor ?? '', motor: ctx.servicios.versionMotor });
  const v = c?.validacion ?? { estado: 'sin-validar' as const };
  const validacion = v.estado === 'sin-validar' ? ctx.t('app.sello.validacion.sinValidar')
    : ctx.t('app.sello.validacion.validada', { dias: v.dias, dentro: v.dentroDelIntervalo });
  const item = (tipo: string, txt: string, extra: Hijo = null) =>
    el('li', { class: `sello sello--${tipo}`, 'data-sello': tipo }, el('span', { class: 'sello__marca', 'aria-hidden': 'true' }), el('span', null, txt), extra);
  return el('ul', { class: `sellos${compacto ? ' sellos--compacto' : ''}`, 'aria-label': ctx.t('app.sello.titulo') },
    item('motor', motor, el('button', { type: 'button', class: 'enlace-boton', 'data-accion': 'ver-motor', onclick: () => ctx.ir('comprobante') }, ctx.t('app.sello.ver'))),
    item(`reproducida-${rep}`, reproducida),
    item('validacion', validacion));
}
