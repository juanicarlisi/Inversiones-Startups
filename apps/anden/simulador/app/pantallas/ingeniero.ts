// app/pantallas/ingeniero.ts · Andén simulador, corte 1 · P8 (interfaz). Pantalla 10: modo ingeniero.
// El JSON del modelo con validación en vivo (el compilador de verdad, con sus diagnósticos), el borrador analítico F0, la descarga de la
// traza de la noche en CSV y la tabla de réplicas (huella, hora de fin, pendientes, costo, alertas). El texto del modelo nunca se
// interpreta como HTML: va en un textarea y en nodos de texto.
import type { Contexto, Montar } from '../contexto.ts';
import type { Diagnostico, ModeloValidado } from '../../contratos/modelo.ts';
import type { Traza } from '../../contratos/traza.ts';
import { horaASeg } from '../../contratos/tipos-base.ts';
import { el, limpiezas, poner } from '../ui/dom.ts';
import { cabecera, tarjeta } from '../ui/tarjeta.ts';
import { tabla } from '../ui/tabla.ts';
import { botonVolver, horaDelDia } from './comun.ts';

/** Traza en CSV: una fila por tramo, con las columnas del contrato (e, k, r, a, t0, t1, c, q). */
export function trazaACsv(t: Traza): string {
  const T = t.tramos, filas = ['e,k,r,a,t0,t1,c,q'];
  for (let i = 0; i < T.n; i++) filas.push(`${T.e[i]},${T.k[i]},${T.r[i]},${T.a[i]},${T.t0[i]},${T.t1[i]},${T.c[i]},${T.q[i]}`);
  return filas.join('\n') + '\n';
}

function listaDiagnosticos(ctx: Contexto, ds: Diagnostico[]): HTMLElement {
  if (!ds.length) return el('p', { class: 'nota' }, ctx.t('app.ingeniero.sinDiagnosticos'));
  return el('ul', { class: 'diagnosticos', 'data-diagnosticos': '' }, ...ds.map((d) => {
    const ruta = el('code', { class: 'diagnostico__ruta' }); ruta.textContent = d.ruta || '/';
    return el('li', { class: `diagnostico diagnostico--${d.nivel}` }, el('span', { class: 'diagnostico__nivel' }, ctx.t(`modelo.nivel.${d.nivel}`)), ' ',
      el('span', { class: 'diagnostico__codigo mono' }, d.codigo), ' ', ctx.t(d.clave, d.vars ?? {}), ' ', ruta);
  }));
}

export const montarIngeniero: Montar = (raiz, ctx) => {
  const L = limpiezas(), s = ctx.sesion;
  if (!s.mv) { ctx.ir('inicio'); return () => {}; }
  const area = el('textarea', { class: 'campo campo--json mono', spellcheck: 'false', 'aria-label': ctx.t('app.ingeniero.json'), 'data-accion': 'json', rows: 18 });
  area.value = JSON.stringify(s.mv.modelo, null, 2);
  const diag = el('div', { class: 'ingeniero__diagnosticos', 'aria-live': 'polite' });
  let candidato: ModeloValidado | null = null;
  const aplicar = el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': 'aplicar-modelo', disabled: true, onclick: () => {
    if (!candidato) return;
    s.abrir(candidato, { tipo: 'modelo' }, null);
    ctx.ir('escena');
  } }, ctx.t('app.ingeniero.aplicar'));
  let token = 0, espera: ReturnType<typeof setTimeout> | null = null;
  const validar = async () => {
    const mio = ++token;
    candidato = null; aplicar.disabled = true;
    let x: unknown;
    try { x = JSON.parse(area.value); } catch (e) {
      poner(diag, el('p', { class: 'diagnostico diagnostico--error', 'data-json': 'invalido' }, ctx.t('app.ingeniero.jsonInvalido', { detalle: (e as Error).message })));
      return;
    }
    poner(diag, el('p', { class: 'nota' }, ctx.t('app.ingeniero.validando')));
    const r = await ctx.servicios.compilar(x);
    if (mio !== token) return;
    if (r.ok) {
      const igual = r.mv.huella === s.mv?.huella;
      candidato = igual ? null : r.mv; aplicar.disabled = igual;
      poner(diag, el('p', { class: 'diagnostico diagnostico--info', 'data-json': 'valido' }, ctx.t(igual ? 'app.ingeniero.sinCambios' : 'app.ingeniero.valido', { huella: r.mv.huella })),
        listaDiagnosticos(ctx, r.mv.diagnosticos));
    } else poner(diag, el('p', { class: 'diagnostico diagnostico--error', 'data-json': 'errores' }, ctx.t('app.ingeniero.conErrores', { n: r.diagnosticos.length })),
      listaDiagnosticos(ctx, r.diagnosticos));
  };
  area.addEventListener('input', () => { if (espera) clearTimeout(espera); espera = setTimeout(() => void validar(), 400); });
  L.sumar(() => { if (espera) clearTimeout(espera); token++; });

  const descargar = el('button', { type: 'button', class: 'boton', 'data-accion': 'descargar-traza', onclick: () => {
    const n = s.noche; if (!n) return;
    const blob = new Blob([trazaACsv(n.traza)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: `traza-${n.traza.modelo}-noche${n.replica + 1}.csv` });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } }, ctx.t('app.ingeniero.descargar'));
  const f0Caja = el('div');
  const replicas = el('div', { class: 'ingeniero__replicas' });
  raiz.append(cabecera(ctx.t('app.ingeniero.titulo'), botonVolver(ctx)),
    tarjeta(ctx.t('app.ingeniero.modelo'), '', area, el('div', { class: 'fila-botones' }, aplicar), diag),
    tarjeta(ctx.t('app.ingeniero.f0'), '', f0Caja),
    tarjeta(ctx.t('app.ingeniero.traza'), '', el('p', { class: 'nota' }, ctx.t('app.ingeniero.trazaNota')), descargar),
    tarjeta(ctx.t('app.ingeniero.replicas'), '', replicas));
  const pintar = () => {
    const mv = s.mv!, f0 = mv.f0;
    const etapas = ['descarga', 'induccion', 'sorter', 'rampas'] as const;
    const cap = { descarga: f0.capacidadDescargaPorHora, induccion: f0.capacidadInduccionPorHora, sorter: f0.capacidadSorterTeoricaPorHora, rampas: f0.capacidadRampasPorHora };
    poner(f0Caja, el('p', null, ctx.t('app.ingeniero.f0Llegada', { llegada: ctx.f.numero(f0.llegadaMediaPorHora, 0), fin: horaDelDia(f0.finEstimado), cuello: ctx.t(`modelo.etapa.${f0.cuello}`) })),
      tabla([ctx.t('app.ingeniero.col.etapa'), ctx.t('app.ingeniero.col.capacidad'), ctx.t('app.ingeniero.col.utilizacion')],
        etapas.map((k) => [ctx.t(`modelo.etapa.${k}`), ctx.f.numero(cap[k], 0), ctx.f.porcentaje(f0.utilizacion[k], 0)]), { numericas: [1, 2], titulo: ctx.t('app.ingeniero.f0Tabla') }));
    const rs = s.nochesLlegadas;
    const base = horaASeg(mv.modelo.calendario.inicio) * 1000;
    poner(replicas, rs.length ? tabla([ctx.t('app.ingeniero.col.noche'), ctx.t('app.ingeniero.col.huella'), ctx.t('app.ingeniero.col.fin'), ctx.t('app.ingeniero.col.pendientes'),
      ctx.t('app.ingeniero.col.costo'), ctx.t('app.ingeniero.col.alertas')],
    rs.map((r) => [String(r.replica + 1), el('span', { class: 'mono' }, r.huella), ctx.f.hora(base + r.kpi.finClasificacionMin * 60000), ctx.f.numero(r.kpi.pendientesAlCorte, 0),
      ctx.f.moneda(r.kpi.costoPorPaquete, mv.modelo.costos.moneda), r.alertas.length ? r.alertas.join(', ') : '—']),
    { numericas: [3, 4], titulo: ctx.t('app.ingeniero.replicasTitulo', { n: rs.length, N: s.N }), accion: 'replicas' }) : el('p', { class: 'nota' }, ctx.t('app.noches.esperando')));
    descargar.disabled = !s.noche;
  };
  pintar();
  L.sumar(s.suscribir((t) => { if (t === 'noches' || t === 'noche' || t === 'modelo') pintar(); }));
  void validar().then(() => { raiz.dataset.listo = '1'; });
  return () => L.correr();
};
