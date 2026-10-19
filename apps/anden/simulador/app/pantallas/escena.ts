// app/pantallas/escena.ts · Andén simulador, corte 1 · P8 (interfaz). Pantalla 2: la escena.
// La película de la noche sobre el piso elegido, con la línea de resumen arriba (costo con su ±, perder el corte con su IC, confianza y
// comprobante), la etiqueta de noche obligatoria, la línea de tiempo con marcas y cabezal, los controles, los botones a las demás
// pantallas, atajos para tocar sin puntero (un paquete que pierde el corte, la rampa que más se llena) y los tres sellos.
import type { Contexto, Montar } from '../contexto.ts';
import { ClaseEntidad } from '../../contratos/traza.ts';
import { el, limpiezas, poner } from '../ui/dom.ts';
import { crearLienzo } from '../ui/lienzo.ts';
import { bucleReproduccion, controlesReproduccion, crearLineaTiempo } from '../ui/linea-tiempo.ts';
import { etiquetaNoche, franjaSupuestos } from '../ui/etiqueta-noche.ts';
import { lineaResumen, sellos } from '../ui/resumen.ts';
import { horaDelDia, leyendaEstados } from './comun.ts';

/** Primer paquete (por hora de creación) que no llega al corte; si ninguno lo pierde, el que más tardó. */
export function paqueteParaMostrar(ctx: Contexto): number | null {
  const n = ctx.sesion.noche; if (!n) return null;
  const P = n.traza.paquetes, corte = n.traza.corte;
  let mejor = -1, peorEspera = -1, masTardo = -1;
  for (let e = 0; e < P.n; e++) {
    if (P.creado[e] < 0) continue;
    const l = P.listo[e];
    if ((l < 0 || l > corte) && (mejor < 0 || P.creado[e] < P.creado[mejor])) mejor = e;
    const w = (l < 0 ? n.traza.fin : l) - P.creado[e];
    if (w > peorEspera) { peorEspera = w; masTardo = e; }
  }
  return mejor >= 0 ? mejor : masTardo >= 0 ? masTardo : null;
}
/** ¿Algún paquete de la noche que se ve pierde el corte? (si no, el atajo muestra el que más tardó y lo dice). */
export function hayAtrasado(ctx: Contexto): boolean {
  const n = ctx.sesion.noche; if (!n) return false;
  const P = n.traza.paquetes, corte = n.traza.corte;
  for (let e = 0; e < P.n; e++) if (P.creado[e] >= 0 && (P.listo[e] < 0 || P.listo[e] > corte)) return true;
  return false;
}
/** Rampa con más minutos llena en la noche que se ve. */
export function rampaMasLlena(ctx: Contexto): number | null {
  const r = ctx.sesion.noche?.salida.resultado.porRecurso.rampaMinutosLlena;
  if (!r || !r.length) return null;
  let m = 0;
  for (let i = 1; i < r.length; i++) if (r[i] > r[m]) m = i;
  return m;
}

export const montarEscena: Montar = (raiz, ctx) => {
  const L = limpiezas(), s = ctx.sesion;
  const mv = s.mv;
  if (!mv) { ctx.ir('inicio'); return () => {}; }
  const titulo = el('h1', { class: 'pantalla__titulo' });
  titulo.textContent = mv.modelo.titulo;
  const resumen = el('div', { class: 'escena__resumen' });
  const etq = etiquetaNoche(ctx, 'A');
  const franja = el('div', { class: 'escena__franja' });
  const lienzo = crearLienzo(ctx, { reproductor: () => s.noche?.reproductor ?? null, tocable: true, etiqueta: ctx.t('app.escena.lienzo'), tablero: true });
  L.sumar(lienzo.destruir);
  const linea = crearLineaTiempo(ctx, { momentos: () => s.noche?.momentos ?? [], corte: () => s.noche?.traza.corte ?? null,
    minImportancia: () => (ctx.esAncho() ? 2 : 3) });
  L.sumar(linea.destruir);
  const controles = controlesReproduccion(ctx);
  const cargando = el('p', { class: 'escena__cargando', role: 'status' });
  const selloCaja = el('div', { class: 'escena__sellos' });
  const ingeniero = el('div', { class: 'escena__ingeniero' });
  const botonPiso = el('button', { type: 'button', class: 'boton', 'data-accion': 'piso', onclick: () => {
    const actual = lienzo.vista()?.piso ?? '2d';
    ctx.almacen.despachar({ tipo: 'piso', piso: actual === 'iso' ? '2d' : 'iso' });
  } });
  const botonIng = el('button', { type: 'button', class: 'boton', 'data-accion': 'modo-ingeniero', onclick: () => ctx.almacen.despachar({ tipo: 'ingeniero' }) });
  const ir = (p: Parameters<Contexto['ir']>[0], accion: string, clave: string) =>
    el('button', { type: 'button', class: 'boton', 'data-accion': accion, onclick: () => ctx.ir(p) }, ctx.t(clave));
  const acciones = el('nav', { class: 'escena__acciones', 'aria-label': ctx.t('app.escena.acciones') },
    ir('noches', 'ir-noches', 'app.escena.noches'), ir('ysi', 'ir-ysi', 'app.escena.ysi'), ir('decidir', 'ir-decidir', 'app.escena.decidir'),
    ir('compartir', 'ir-compartir', 'app.escena.compartir'), ir('presentar', 'ir-presentar', 'app.escena.presentar'), botonPiso, botonIng);
  const verAtrasado = el('button', { type: 'button', class: 'boton boton--suave', 'data-accion': 'ver-atrasado', onclick: () => {
    const e = paqueteParaMostrar(ctx);
    if (e !== null) ctx.almacen.despachar({ tipo: 'seleccionar', seleccion: { clase: ClaseEntidad.PAQUETE, id: e }, abrir: true });
  } });
  const pintarAtajo = () => { verAtrasado.textContent = ctx.t(hayAtrasado(ctx) || !s.noche ? 'app.escena.verAtrasado' : 'app.escena.verMasTardo'); };
  pintarAtajo();
  const atajos = el('div', { class: 'escena__atajos' },
    verAtrasado,
    el('button', { type: 'button', class: 'boton boton--suave', 'data-accion': 'ver-rampa', onclick: () => {
      const r = rampaMasLlena(ctx);
      if (r !== null) ctx.almacen.despachar({ tipo: 'seleccionar', seleccion: { clase: ClaseEntidad.RAMPA, id: r }, abrir: true });
    } }, ctx.t('app.escena.verRampa')));
  raiz.append(
    el('header', { class: 'pantalla__cabecera' },
      el('button', { type: 'button', class: 'boton boton--volver', 'data-accion': 'volver-inicio', onclick: () => ctx.ir('inicio') }, ctx.t('app.volver.inicio')),
      titulo),
    resumen,
    el('div', { class: 'escena__etiquetas' }, etq.nodo, franja),
    lienzo.nodo, cargando, leyendaEstados(ctx), linea.nodo, controles.nodo, acciones, atajos, ingeniero, selloCaja);

  const pintarResumen = () => { poner(resumen, lineaResumen(ctx)); poner(selloCaja, sellos(ctx, true)); poner(franja, franjaSupuestos(ctx)); };
  const pintarIngeniero = () => {
    const e = ctx.almacen.estado;
    botonIng.textContent = ctx.t(e.ingeniero ? 'app.escena.ingenieroSalir' : 'app.escena.ingeniero');
    botonIng.setAttribute('aria-pressed', String(e.ingeniero));
    const actual = lienzo.vista()?.piso ?? e.piso ?? '2d';
    botonPiso.textContent = ctx.t(actual === 'iso' ? 'app.escena.piso2d' : 'app.escena.pisoIso');
    if (!e.ingeniero || !s.noche || !s.mv) { ingeniero.replaceChildren(); ingeniero.hidden = true; return; }
    ingeniero.hidden = false;
    const f0 = s.mv.f0, n = s.noche;
    poner(ingeniero, el('dl', { class: 'datos' },
      el('dt', null, ctx.t('app.ingeniero.huellaModelo')), el('dd', { class: 'mono' }, s.mv.huella),
      el('dt', null, ctx.t('app.ingeniero.huellaNoche')), el('dd', { class: 'mono' }, n.salida.resultado.huella),
      el('dt', null, ctx.t('app.ingeniero.eventos')), el('dd', null, ctx.f.numero(n.salida.resultado.eventos, 0)),
      el('dt', null, ctx.t('app.ingeniero.tramos')), el('dd', null, ctx.f.numero(n.traza.tramos.n, 0)),
      el('dt', null, ctx.t('app.ingeniero.f0')), el('dd', null, ctx.t('app.ingeniero.f0Detalle', {
        cuello: ctx.t(`modelo.etapa.${f0.cuello}`), fin: horaDelDia(f0.finEstimado), rho: ctx.f.porcentaje(f0.utilizacion[f0.cuello], 0) }))),
    el('button', { type: 'button', class: 'boton', 'data-accion': 'ir-ingeniero', onclick: () => ctx.ir('ingeniero') }, ctx.t('app.escena.abrirIngeniero')));
  };
  const pintarCarga = () => {
    cargando.textContent = s.cargandoNoche ? ctx.t('app.escena.cargandoNoche') : '';
    cargando.hidden = !s.cargandoNoche;
  };
  pintarResumen(); pintarIngeniero(); pintarCarga();
  let ultimoT = ctx.almacen.estado.t;
  L.sumar(ctx.almacen.suscribir((n, a) => {
    if (n.t !== a.t || n.inicio !== a.inicio || n.fin !== a.fin) linea.actualizar();
    if (n.t !== a.t || n.reproduciendo !== a.reproduciendo || n.velocidad !== a.velocidad) controles.actualizar();
    if (n.ingeniero !== a.ingeniero || n.piso !== a.piso) pintarIngeniero();
    // narrar los momentos importantes que el cabezal acaba de pasar (aria-live)
    if (n.reproduciendo && n.t > ultimoT && s.noche) {
      const m = s.noche.momentos.find((x) => x.importancia >= 4 && x.t > ultimoT && x.t <= n.t);
      if (m) ctx.narrar(`${ctx.f.hora(m.t)} · ${ctx.t(m.clave, m.vars)}`);
    }
    ultimoT = n.t;
  }));
  L.sumar(s.suscribir((tema) => {
    if (tema === 'noche') { etq.actualizar(); linea.actualizar(); pintarCarga(); pintarIngeniero(); pintarAtajo(); }
    if (tema === 'progreso' || tema === 'noches' || tema === 'modelo') { pintarResumen(); etq.actualizar(); }
  }));
  L.sumar(bucleReproduccion(ctx));
  raiz.dataset.listo = s.noche ? '1' : '0';
  L.sumar(s.suscribir((tema) => { if (tema === 'noche' && s.noche) raiz.dataset.listo = '1'; }));
  return () => L.correr();
};
