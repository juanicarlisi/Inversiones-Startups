// app/pantallas/noches.ts · Andén simulador, corte 1 · P8 (interfaz). Pantalla 4: las cien noches.
// La capa de riesgo sobre el plano (probabilidad de que cada rampa se llene), el abanico de la hora de fin (P10, P50, P90) con el corte,
// el selector de noche (mediana, peor, mejor) y la barra de progreso mientras llegan las noches (el mapa se va completando con las que ya
// llegaron y lo dice). Nada se calcula con trazas: sale de ResultadoReplica (servicios.agregarRiesgo).
import type { Montar } from '../contexto.ts';
import type { MapaRiesgo } from '../../contratos/vistas.ts';
import type { CualNoche } from '../estado.ts';
import { horaASeg } from '../../contratos/tipos-base.ts';
import { el, limpiezas, poner } from '../ui/dom.ts';
import { crearLienzo } from '../ui/lienzo.ts';
import { cabecera, progreso, tarjeta } from '../ui/tarjeta.ts';
import { etiquetaNoche } from '../ui/etiqueta-noche.ts';
import { nivelDeRiesgo } from '../ui/paleta.ts';
import { botonVolver } from './comun.ts';

export const montarNoches: Montar = (raiz, ctx) => {
  const L = limpiezas(), s = ctx.sesion;
  if (!s.mv) { ctx.ir('inicio'); return () => {}; }
  let parcial: MapaRiesgo | null = null, firmaParcial = -1;
  const mapa = (): MapaRiesgo | null => {
    if (s.mapa) return s.mapa;
    const rs = s.nochesLlegadas;
    if (rs.length < 1) return null;
    if (rs.length !== firmaParcial && (rs.length - firmaParcial >= 5 || rs.length === s.N)) { parcial = ctx.servicios.agregarRiesgo(rs, s.kpiNoche); firmaParcial = rs.length; }
    return parcial;
  };
  const barra = el('div', { class: 'noches__progreso' });
  const etq = etiquetaNoche(ctx, 'A');
  const lienzo = crearLienzo(ctx, { reproductor: () => s.noche?.reproductor ?? null, riesgo: mapa, tocable: true, etiqueta: ctx.t('app.noches.lienzo'), camara: true,
    claveCamara: `noches|${s.mv?.huella ?? ''}` });
  L.sumar(lienzo.destruir);
  const leyenda = el('ul', { class: 'leyenda leyenda--riesgo', 'aria-label': ctx.t('app.noches.leyenda') },
    ...[0, 1, 2, 3, 4].map((n) => el('li', { class: `leyenda__item leyenda__item--riesgo${n}` }, el('span', { class: 'leyenda__muestra', 'aria-hidden': 'true' }),
      ctx.t(`escena.riesgo.nivel${n}`))));
  const tituloRiesgo = el('h2', { class: 'tarjeta__titulo' });
  const nota = el('p', { class: 'nota' });
  const abanico = el('div', { class: 'abanico' });
  const rampas = el('div', { class: 'noches__rampas' });
  const selector = el('div', { class: 'selector', role: 'radiogroup', 'aria-label': ctx.t('app.noches.selector') });
  const opciones: CualNoche[] = ['mediana', 'peor', 'mejor'];
  const botones = opciones.map((c) => el('button', { type: 'button', role: 'radio', class: 'selector__opcion', 'data-accion': `noche-${c}`,
    onclick: () => { ctx.almacen.despachar({ tipo: 'elegirNoche', noche: c }); void s.mostrarNoche(c); } }, ctx.t(`escena.riesgo.noche.${c}`)));
  selector.append(...botones);
  raiz.append(cabecera(ctx.t('app.noches.titulo', { N: s.N }), botonVolver(ctx)), barra,
    el('section', { class: 'tarjeta noches__mapa' }, tituloRiesgo, etq.nodo, lienzo.nodo, leyenda, nota),
    tarjeta(ctx.t('app.noches.abanicoTitulo'), 'noches__abanico', abanico, selector),
    tarjeta(ctx.t('app.noches.rampasTitulo'), 'noches__rampas-tarjeta', rampas));

  const pintar = () => {
    const m = mapa();
    const llegadas = s.llegadas;
    poner(barra, s.nochesListas ? el('p', { class: 'nota', 'data-noches-listas': '1' }, ctx.t('app.noches.listas', { N: s.N }))
      : progreso(llegadas / Math.max(1, s.N), ctx.t('app.noches.progreso', { llegadas, N: s.N })));
    tituloRiesgo.textContent = ctx.t('escena.riesgo.titulo', { noches: m?.noches ?? 0 });
    nota.textContent = m ? ctx.t('escena.riesgo.nota', { noches: m.noches }) + (s.nochesListas ? '' : ` ${ctx.t('app.noches.parcial')}`) : '';
    const sel = ctx.almacen.estado.noche;
    botones.forEach((b, i) => {
      b.setAttribute('aria-checked', String(opciones[i] === sel && s.cualNoche === sel));
      b.disabled = !s.nochesListas;
    });
    // abanico de la hora de fin
    if (m && m.noches >= 1 && Number.isFinite(m.finClasificacionMin.p50)) {
      const inicio = horaASeg(s.mv!.modelo.calendario.inicio) * 1000;
      const corte = horaASeg(s.mv!.modelo.calendario.corte) * 1000;
      const h = (min: number) => inicio + min * 60000;
      const { p10, p50, p90 } = m.finClasificacionMin;
      const lo = Math.min(p10, (corte - inicio) / 60000) - 20, hi = Math.max(p90, (corte - inicio) / 60000) + 20;
      const x = (v: number) => `${(100 * (v - lo) / (hi - lo)).toFixed(2)}%`;
      const banda = el('div', { class: 'abanico__banda' }); banda.style.left = x(p10); banda.style.width = `${(100 * (p90 - p10) / (hi - lo)).toFixed(2)}%`;
      const med = el('div', { class: 'abanico__mediana' }); med.style.left = x(p50);
      const lc = el('div', { class: 'abanico__corte' }); lc.style.left = x((corte - inicio) / 60000);
      poner(abanico,
        el('p', { class: 'abanico__texto', 'data-abanico': '' }, ctx.t('app.noches.abanico', { p10: ctx.f.hora(h(p10)), p50: ctx.f.hora(h(p50)), p90: ctx.f.hora(h(p90)) })),
        el('div', { class: 'abanico__pista', role: 'img', 'aria-label': ctx.t('app.noches.abanicoAria', { p10: ctx.f.hora(h(p10)), p50: ctx.f.hora(h(p50)), p90: ctx.f.hora(h(p90)), corte: ctx.f.hora(corte) }) },
          banda, med, lc),
        el('div', { class: 'abanico__rotulos', 'aria-hidden': 'true' },
          el('span', null, `P10 ${ctx.f.hora(h(p10))}`), el('span', null, `P50 ${ctx.f.hora(h(p50))}`), el('span', null, `P90 ${ctx.f.hora(h(p90))}`),
          el('span', { class: 'abanico__rotulo-corte' }, ctx.t('app.noches.corte', { hora: ctx.f.hora(corte) }))));
    } else poner(abanico, el('p', { class: 'nota' }, ctx.t('app.noches.esperando')));
    // las rampas con más riesgo
    const nr = s.noche?.traza.geometria.rampas ?? [];
    if (m && nr.length) {
      const orden = Array.from(m.rampaProbLlena, (p, i) => [p, i] as const).filter(([p]) => p > 0).sort((a, b) => b[0] - a[0]).slice(0, 6);
      poner(rampas, orden.length ? el('ul', { class: 'lista-riesgo' }, ...orden.map(([p, i]) => el('li', { class: `lista-riesgo__item lista-riesgo__item--${nivelDeRiesgo(p)}` },
        el('span', { class: 'lista-riesgo__muestra', 'aria-hidden': 'true' }),
        ctx.t('app.noches.rampa', { rampa: nr[i]?.id ?? String(i), ruta: nr[i]?.ruta ?? '', p: ctx.f.porcentaje(p, 0) }))))
        : el('p', null, ctx.t('app.noches.ningunaRampa')));
    } else poner(rampas, el('p', { class: 'nota' }, ctx.t('app.noches.esperando')));
    raiz.dataset.listo = s.nochesListas && s.noche ? '1' : '0';
  };
  pintar();
  L.sumar(s.suscribir((tema) => { if (tema !== 'ysi' && tema !== 'decision') { pintar(); etq.actualizar(); lienzo.redibujar(); } }));
  L.sumar(ctx.almacen.suscribir((n, a) => { if (n.noche !== a.noche) pintar(); }));
  void s.pedirNoches();
  return () => L.correr();
};
