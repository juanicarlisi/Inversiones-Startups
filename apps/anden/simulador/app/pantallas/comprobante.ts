// app/pantallas/comprobante.ts · Andén simulador, corte 1 · P8 (interfaz). Pantalla 7: el comprobante.
// La receta (con qué se calculó todo), la huella agregada de las noches, el motor y su batería («85 de 85»), los controles del modelo, la
// procedencia de cada dato con su insignia y los tres sellos con su texto exacto (diseño maestro §5.9). Es lo que permite que otra persona
// reproduzca los mismos números en su dispositivo.
import type { Montar } from '../contexto.ts';
import { el, limpiezas, poner } from '../ui/dom.ts';
import { cabecera, progreso, tarjeta } from '../ui/tarjeta.ts';
import { sellos } from '../ui/resumen.ts';
import { detalleSemaforo } from '../ui/semaforo.ts';
import { ETIQUETAS, insignia } from '../ui/insignia.ts';
import { botonVolver } from './comun.ts';

export const montarComprobante: Montar = (raiz, ctx) => {
  const L = limpiezas(), s = ctx.sesion;
  if (!s.mv) { ctx.ir('inicio'); return () => {}; }
  const cuerpo = el('div', { class: 'comprobante' });
  raiz.append(cabecera(ctx.t('app.comprobante.titulo'), botonVolver(ctx)), cuerpo);
  const dato = (k: string, v: string | HTMLElement, mono = false) => [el('dt', null, ctx.t(k)), el('dd', { class: mono ? 'mono' : undefined }, v)];
  const pintar = () => {
    const c = s.comprobante, mv = s.mv!;
    if (!c) {
      poner(cuerpo, sellos(ctx), progreso(s.llegadas / Math.max(1, s.N), ctx.t('app.comprobante.esperando', { llegadas: s.llegadas, N: s.N })));
      raiz.dataset.listo = '0';
      return;
    }
    const e = ctx.almacen.estado, r = s.recetaActual() ?? c.receta;
    const proc = c.procedencia;
    const cuenta: Record<string, number> = { DATO_USUARIO: proc.datoUsuario, MEDIDO: proc.medido, HECHO: proc.hecho, ESTIMACION: proc.estimacion,
      HIPOTESIS: proc.hipotesis, SUPUESTO: proc.supuesto };
    const diags = mv.diagnosticos.filter((d) => d.nivel !== 'error');
    poner(cuerpo,
      tarjeta(ctx.t('app.comprobante.sellos'), '', sellos(ctx)),
      tarjeta(ctx.t('app.comprobante.receta'), '', el('dl', { class: 'datos', 'data-comprobante': 'receta' },
        ...dato('app.comprobante.huellaModelo', r.modelo, true),
        ...dato('app.comprobante.motor', r.motor, true),
        ...dato('app.comprobante.semilla', String(r.semilla)),
        ...dato('app.comprobante.replicas', ctx.f.numero(r.replicas, 0)),
        ...dato('app.comprobante.noche', r.noche !== undefined ? ctx.t('app.comprobante.nocheN', { n: r.noche + 1 }) : '—'),
        ...dato('app.comprobante.instante', r.t !== undefined ? ctx.f.hora(r.t) : ctx.f.hora(e.t)),
        ...dato('app.comprobante.velocidad', `×${ctx.f.numero(r.vel ?? e.velocidad, 0)}`),
        ...dato('app.comprobante.escenarios', r.esc?.length ? r.esc.join(', ') : '—'),
        ...dato('app.comprobante.huellaAgregada', c.huellaAgregada, true),
        ...dato('app.comprobante.huellaNoche', s.noche?.salida.resultado.huella ?? '—', true))),
      tarjeta(ctx.t('app.comprobante.motorTitulo'), '', el('p', null, ctx.t('app.comprobante.motorDetalle', { version: c.motor.version, pasaron: c.motor.pasaron,
        exigibles: c.motor.pruebasExigibles, fecha: c.motor.fecha }))),
      tarjeta(ctx.t('app.comprobante.modelo'), '',
        el('p', { 'data-comprobante': 'controles' }, ctx.t('app.comprobante.controles', { controles: c.modelo.controles, pasaron: c.modelo.pasaron, avisos: c.modelo.avisos })),
        diags.length ? el('ul', { class: 'diagnosticos' }, ...diags.map((d) => el('li', { class: `diagnostico diagnostico--${d.nivel}` },
          el('span', { class: 'diagnostico__nivel' }, ctx.t(`modelo.nivel.${d.nivel}`)), ' ', ctx.t(d.clave, d.vars ?? {})))) : null),
      tarjeta(ctx.t('app.comprobante.procedencia'), '', el('p', { class: 'nota' }, ctx.t('app.comprobante.procedenciaNota')),
        el('div', { class: 'insignias', 'data-comprobante': 'procedencia' }, ...ETIQUETAS.map((x) => insignia(ctx, x, cuenta[x] ?? 0)))),
      tarjeta(ctx.t('app.comprobante.confianza'), '', detalleSemaforo(ctx, c.semaforo)),
      tarjeta(ctx.t('app.comprobante.validacion'), '', el('p', null, c.validacion.estado === 'sin-validar'
        ? ctx.t('experimentos.comprobante.sin-validar') : ctx.t('app.sello.validacion.validada', { dias: c.validacion.dias, dentro: c.validacion.dentroDelIntervalo }))));
    raiz.dataset.listo = '1';
  };
  pintar();
  L.sumar(s.suscribir((tema) => { if (tema === 'noches' || tema === 'progreso' || tema === 'noche') pintar(); }));
  void s.pedirNoches();
  return () => L.correr();
};
