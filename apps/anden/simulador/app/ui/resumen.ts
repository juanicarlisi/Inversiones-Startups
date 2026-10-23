// app/ui/resumen.ts · Andén simulador, corte 1 · P8 (interfaz).
// La línea de arriba de la escena (diseño maestro §5.3): «Costo por paquete $X (± Y) · Perder el corte: 1 noche de cada N · Confianza:
// [semáforo] · Comprobante», y los tres sellos que no se mezclan (§5.9): motor verificado, reproducida en este dispositivo y validación.
// Ningún número sin su incertidumbre: el costo lleva su ± (IC de t sobre las noches) y la probabilidad, su IC de Wilson.
import type { Comprobante, Proporcion } from '../../contratos/experimentos.ts';
import type { Contexto } from '../contexto.ts';
import { el, type Hijo } from './dom.ts';
import { fichaSemaforo } from './semaforo.ts';

/**
 * Un extremo de intervalo en porcentaje que no miente al redondear (hallazgo E-14): 0 y 1 exactos van sin decimales; un valor positivo
 * menor que 1% nunca se muestra «0%» (va con un decimal, o «<0,1%»), y uno menor que 100% nunca «100%».
 */
export function porcentajeExtremo(ctx: Contexto, x: number): string {
  if (x <= 0) return ctx.f.porcentaje(0, 0);
  if (x >= 1) return ctx.f.porcentaje(1, 0);
  if (x < 0.001) return `<${ctx.f.porcentaje(0.001, 1)}`;
  if (x < 0.01) return ctx.f.porcentaje(x, 1);
  if (x > 0.999) return `>${ctx.f.porcentaje(0.999, 1)}`;
  if (x > 0.99) return ctx.f.porcentaje(x, 1);
  return ctx.f.porcentaje(x, 0);
}

/** «1 noche de cada 10», «3 de cada 10 noches», «ninguna de 100 noches», «todas las 100 noches»… a partir de P(no perder el corte). */
export function textoPerderCorte(ctx: Contexto, prop: Proporcion): { texto: string; ic: string } {
  const p = 1 - prop.p, bajo = 1 - prop.ic[1], alto = 1 - prop.ic[0];
  let texto: string;
  if (prop.exitos === prop.n) texto = ctx.t('app.resumen.perder.ninguna', { N: prop.n });
  else if (prop.exitos === 0) texto = ctx.t('app.resumen.perder.todas', { N: prop.n });
  else if (p >= 0.95) texto = ctx.t('app.resumen.perder.casiTodas');
  else if (p >= 0.2) texto = ctx.t('app.resumen.perder.deCada10', { k: Math.round(p * 10) });
  else texto = ctx.t('app.resumen.perder.unaDeCada', { cada: Math.max(2, Math.round(1 / p)) });
  const ic = ctx.t('app.resumen.perder.ic', { bajo: porcentajeExtremo(ctx, bajo), alto: porcentajeExtremo(ctx, alto) });
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
  } else if (s.semaforo?.color === 'rojo') {
    // «No usar»: el texto del semáforo dice «No se muestran números», y no se muestran (hallazgo E-02; contrato de honestidad §7.10.5)
    partes.push(el('span', { class: 'resumen__item resumen__item--rojo', 'data-resumen': 'sin-numeros' }, ctx.t('app.resumen.sinNumeros')));
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

/** Texto del sello del motor: el resultado de la batería con ESTE código, o «sin verificar» si no hay una corrida que le corresponda. */
export function textoSelloMotor(ctx: Contexto, m: Comprobante['motor'] | null | undefined): string {
  if (!m) return ctx.t('app.sello.motor.pendiente', { version: ctx.servicios.versionMotor });
  if (m.pasaron === 0 && m.fecha === '—') return ctx.t('app.sello.motor.sinVerificar', { version: m.version });
  return ctx.t('app.sello.motor', { version: m.version, pasaron: m.pasaron, exigibles: m.pruebasExigibles });
}

/**
 * Los tres sellos con su texto exacto (diseño maestro §5.9). `compacto` = una línea cada uno (para la escena). `conVer` = el «(ver)» del
 * motor, que lleva al comprobante (en el comprobante mismo no va: no llevaría a ningún lado).
 */
export function sellos(ctx: Contexto, compacto = false, conVer = true): HTMLElement {
  const s = ctx.sesion, c = s.comprobante;
  // el resultado de la batería se conoce al construir: el sello sale completo desde el primer cuadro (hallazgo UX-18)
  const motor = textoSelloMotor(ctx, c?.motor ?? ctx.servicios.motorVerificado);
  const rep = s.selloReproducida();
  const reproducida = ctx.t(`app.sello.reproducida.${rep}`, { receta: s.recetaEnlace?.motor ?? '', motor: ctx.servicios.versionMotor });
  const v = c?.validacion ?? { estado: 'sin-validar' as const };
  const validacion = v.estado === 'sin-validar' ? ctx.t('app.sello.validacion.sinValidar')
    : ctx.t('app.sello.validacion.validada', { dias: v.dias, dentro: v.dentroDelIntervalo });
  const item = (tipo: string, txt: string, extra: Hijo = null) =>
    el('li', { class: `sello sello--${tipo}`, 'data-sello': tipo }, el('span', { class: 'sello__marca', 'aria-hidden': 'true' }),
      el('span', { class: 'sello__texto' }, txt, extra ? ' ' : null, extra));
  return el('ul', { class: `sellos${compacto ? ' sellos--compacto' : ''}`, 'aria-label': ctx.t('app.sello.titulo') },
    item('motor', motor, conVer
      ? el('button', { type: 'button', class: 'enlace-boton', 'data-accion': 'ver-motor', onclick: () => ctx.ir('comprobante') }, ctx.t('app.sello.ver')) : null),
    item(`reproducida-${rep}`, reproducida),
    item('validacion', validacion));
}
