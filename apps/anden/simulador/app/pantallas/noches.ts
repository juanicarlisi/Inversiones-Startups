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
import { crearPlano } from '../ui/plano.ts';
import { cabecera, progreso, tarjeta } from '../ui/tarjeta.ts';
import { etiquetaNoche } from '../ui/etiqueta-noche.ts';
import { nivelDeRiesgo } from '../ui/paleta.ts';
import { botonVolver } from './comun.ts';

export const montarNoches: Montar = (raiz, ctx) => {
  const L = limpiezas(), s = ctx.sesion;
  const mv = s.mv;
  if (!mv) { ctx.ir('inicio'); return () => {}; }
  // El mapa parcial se rearma con las noches que ya llegaron, como mucho cada 300 ms y nunca con más de una cuenta en vuelo: con
  // muchas noches rearmarlo cada 5 llegadas saturaba el hilo de la interfaz (hallazgo SEG-03).
  let parcial: MapaRiesgo | null = null, firmaParcial = -1, ultimoArmado = -Infinity;
  const mapa = (): MapaRiesgo | null => {
    if (s.mapa) return s.mapa;
    if (s.llegadas < 1) return null;
    const ahora = performance.now();
    if (s.llegadas !== firmaParcial && (ahora - ultimoArmado >= 300 || parcial === null)) {
      const rs = s.nochesLlegadas;
      parcial = ctx.servicios.agregarRiesgo(rs, s.kpiNoche); firmaParcial = rs.length; ultimoArmado = performance.now();
    }
    return parcial;
  };
  const barra = el('div', { class: 'noches__progreso' });
  const etq = etiquetaNoche(ctx, 'A');
  // El mapa va sobre el PLANO del hub (corte-1.md §9 P8), no sobre un instante de la noche que se ve: con los paquetes, las bandejas y
  // las rampas cargadas de las 05:04 encima, las placas de riesgo no se leían, sobre todo en 360 px (revisión de la experiencia, I-3,
  // 30-10-2026). Va en planta (2D): en 2,5D y en 360 px el hub quedaba en diagonal, chico, y las rampas eran rayitas sin color legible;
  // en planta cada tobogán se pinta entero con su color de riesgo. Tocar una rampa sigue abriendo su biografía en la noche de la escena
  // (las rampas son las mismas en el plano).
  const plano = crearPlano(() => ctx.servicios.geometria(mv.modelo), ctx.servicios.crearReproductor, mv);
  const lienzo = crearLienzo(ctx, { reproductor: () => (s.noche ? plano() ?? s.noche.reproductor : null), riesgo: () => (s.semaforo?.color === 'rojo' ? null : mapa()), tocable: true, etiqueta: ctx.t('app.noches.lienzo'), camara: true,
    piso: '2d', claveCamara: `noches|${s.mv?.huella ?? ''}` });
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
    el('section', { class: 'tarjeta noches__mapa' }, tituloRiesgo, lienzo.nodo, leyenda, nota),
    // la etiqueta de la noche va con el selector que la cambia (el mapa es de las cien, no de una)
    tarjeta(ctx.t('app.noches.abanicoTitulo'), 'noches__abanico', abanico, selector, etq.nodo),
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
    // con el semáforo en rojo («No usar») no se muestran números (hallazgo E-02): el abanico y las rampas dicen por qué
    if (s.nochesListas && s.semaforo?.color === 'rojo') {
      const motivo = el('p', { class: 'aviso-rojo', 'data-sin-numeros': '' }, ctx.t('app.resumen.sinNumeros'));
      poner(abanico, motivo);
      poner(rampas, el('p', { class: 'aviso-rojo' }, ctx.t('app.resumen.sinNumeros')));
      raiz.dataset.listo = s.noche ? '1' : '0';
      return;
    }
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
      // cada percentil con su IC (estadísticos de orden) cuando ya están todas las noches y alcanzan (hallazgo E-06)
      const fines = s.nochesListas ? s.nochesLlegadas.map((r) => r.kpi.finClasificacionMin) : [];
      const icDe = (q: number) => (ctx.servicios.intervalos && fines.length ? ctx.servicios.intervalos.icPercentil(fines, q, s.confianza) : null);
      const conIc = (q: number, v: number) => {
        const ic = icDe(q);
        return ic ? ctx.t('app.noches.conIc', { valor: ctx.f.hora(h(v)), bajo: ctx.f.hora(h(ic[0])), alto: ctx.f.hora(h(ic[1])) }) : ctx.f.hora(h(v));
      };
      const peor = s.nochesListas ? s.resultados[m.nochePeor] : undefined;
      poner(abanico,
        el('p', { class: 'abanico__texto', 'data-abanico': '' }, ctx.t('app.noches.abanico', { p10: ctx.f.hora(h(p10)), p50: ctx.f.hora(h(p50)), p90: ctx.f.hora(h(p90)) })),
        // la cola: la peor noche con su tamaño (hallazgo UX-15)
        peor ? el('p', { class: 'abanico__peor', 'data-peor': '' }, ctx.t('app.noches.peor', { n: m.nochePeor + 1, hora: ctx.f.hora(h(peor.kpi.finClasificacionMin)),
          pendientes: ctx.f.numero(peor.kpi.pendientesAlCorte, 0) })) : null,
        el('div', { class: 'abanico__pista', role: 'img', 'aria-label': ctx.t('app.noches.abanicoAria', { p10: ctx.f.hora(h(p10)), p50: ctx.f.hora(h(p50)), p90: ctx.f.hora(h(p90)), corte: ctx.f.hora(corte) }) },
          banda, med, lc),
        el('div', { class: 'abanico__rotulos', 'aria-hidden': 'true' },
          el('span', null, `P10 ${conIc(0.1, p10)}`), el('span', null, `P50 ${conIc(0.5, p50)}`), el('span', null, `P90 ${conIc(0.9, p90)}`),
          el('span', { class: 'abanico__rotulo-corte' }, ctx.t('app.noches.corte', { hora: ctx.f.hora(corte) }))));
    } else poner(abanico, el('p', { class: 'nota' }, ctx.t('app.noches.esperando')));
    // las rampas con más riesgo
    const nr = s.noche?.traza.geometria.rampas ?? [];
    if (m && nr.length) {
      const orden = Array.from(m.rampaProbLlena, (p, i) => [p, i] as const).filter(([p]) => p > 0).sort((a, b) => b[0] - a[0]).slice(0, 6);
      // cada probabilidad con su IC de Wilson (éxitos = noches en que se llenó) cuando ya están todas las noches (hallazgo E-06)
      const iv = ctx.servicios.intervalos;
      const texto = (p: number, i: number) => {
        const vars = { rampa: nr[i]?.id ?? String(i), ruta: nr[i]?.ruta ?? '', p: ctx.f.porcentaje(p, 0) };
        if (!iv || !s.nochesListas) return ctx.t('app.noches.rampa', vars);
        const ic = iv.wilson(Math.round(p * m.noches), m.noches, s.confianza);
        return ctx.t('app.noches.rampaConIc', { ...vars, bajo: ctx.f.porcentaje(ic[0], 0), alto: ctx.f.porcentaje(ic[1], 0) });
      };
      poner(rampas, orden.length ? el('ul', { class: 'lista-riesgo' }, ...orden.map(([p, i]) => el('li', { class: `lista-riesgo__item lista-riesgo__item--${nivelDeRiesgo(p)}` },
        el('span', { class: 'lista-riesgo__muestra', 'aria-hidden': 'true' }),
        texto(p, i))))
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
