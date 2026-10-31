// app/pantallas/presentar.ts · Andén simulador, corte 1 · P8 (interfaz). Pantalla 9: presentar (modo directorio v0).
// Los actos del diseño maestro §5.6: «Así es una noche» (la película habla), «Dónde se traba y por qué» (la rampa que más se llena y su
// causa confirmada), «Qué proponemos» (la comparación pareada de «¿y si…?») y «Cuánto confiar» (cien noches, peor noche, comprobante, lo
// que más pesa y qué medir). Pantalla completa, pantalla encendida (Wake Lock) y flechas del teclado. Funciona sin red (PWA).
import type { Contexto, Montar } from '../contexto.ts';
import { ClaseEntidad } from '../../contratos/traza.ts';
import { horaASeg } from '../../contratos/tipos-base.ts';
import { ACTOS } from '../estado.ts';
import { el, escuchar, limpiezas, poner } from '../ui/dom.ts';
import { crearLienzo } from '../ui/lienzo.ts';
import { bucleReproduccion, crearLineaTiempo } from '../ui/linea-tiempo.ts';
import { etiquetaNoche } from '../ui/etiqueta-noche.ts';
import { lineaResumen, sellos } from '../ui/resumen.ts';
import { bloqueComparacion } from './ysi.ts';
import { rampaMasLlena, paqueteDeRampa, paqueteParaMostrar } from './escena.ts';
import { textoFrase } from './comun.ts';

interface Candado { release(): Promise<void> }

async function pedirPantallaEncendida(): Promise<Candado | null> {
  const wl = (navigator as Navigator & { wakeLock?: { request(t: 'screen'): Promise<Candado> } }).wakeLock;
  if (!wl) return null;
  try { return await wl.request('screen'); } catch { return null; }
}

export const montarPresentar: Montar = (raiz, ctx) => {
  const L = limpiezas(), s = ctx.sesion;
  if (!s.mv || !s.noche) { ctx.ir(s.mv ? 'escena' : 'inicio'); return () => {}; }
  raiz.classList.add('presentar');
  const titulo = el('h1', { class: 'presentar__titulo', tabindex: -1 });
  const subtitulo = el('p', { class: 'presentar__subtitulo' });
  const etq = etiquetaNoche(ctx, 'A');
  const conRiesgo = { activo: false };
  const lienzo = crearLienzo(ctx, { reproductor: () => s.noche?.reproductor ?? null, riesgo: () => (conRiesgo.activo ? s.mapa : null), tocable: true,
    etiqueta: ctx.t('app.presentar.lienzo'), clase: 'escena__caja--presentar', tablero: true, camara: true });
  L.sumar(lienzo.destruir);
  const linea = crearLineaTiempo(ctx, { momentos: () => s.noche?.momentos ?? [], corte: () => s.noche?.traza.corte ?? null, minImportancia: () => 3 });
  L.sumar(linea.destruir);
  const panel = el('div', { class: 'presentar__panel', 'aria-live': 'polite' });
  const puntos = el('ol', { class: 'presentar__puntos' });
  const anterior = el('button', { type: 'button', class: 'boton', 'data-accion': 'acto-anterior', onclick: () => ctx.almacen.despachar({ tipo: 'actoRelativo', delta: -1 }) }, `◀ ${ctx.t('app.presentar.anterior')}`);
  const siguiente = el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': 'acto-siguiente', onclick: () => ctx.almacen.despachar({ tipo: 'actoRelativo', delta: 1 }) }, `${ctx.t('app.presentar.siguiente')} ▶`);
  const completa = el('button', { type: 'button', class: 'boton', 'data-accion': 'pantalla-completa', onclick: () => { void raiz.requestFullscreen?.().catch(() => {}); } }, ctx.t('app.presentar.completa'));
  const salir = el('button', { type: 'button', class: 'boton', 'data-accion': 'salir-presentar', onclick: () => ctx.almacen.despachar({ tipo: 'volver' }) }, ctx.t('app.presentar.salir'));
  raiz.append(
    el('div', { class: 'presentar__barra' }, puntos, el('div', { class: 'presentar__botones' }, completa, salir)),
    // en pantalla completa y apaisado, la película a la izquierda y el texto del acto a la derecha, sin desplazar (hallazgo UX-08)
    el('div', { class: 'presentar__escenario' },
      el('div', { class: 'presentar__pelicula' }, lienzo.nodo, linea.nodo),
      el('div', { class: 'presentar__lado' }, el('div', { class: 'presentar__texto' }, titulo, subtitulo, etq.nodo), panel,
        el('div', { class: 'presentar__nav' }, anterior, el('p', { class: 'presentar__ayuda' }, ctx.t('app.presentar.ayuda')), siguiente))));

  let acto = -1;
  const pintarActo = () => {
    const a = ctx.almacen.estado.acto;
    const cambio = a !== acto; acto = a;
    poner(puntos, ...Array.from({ length: ACTOS }, (_, i) => el('li', { class: i === a ? 'presentar__punto presentar__punto--actual' : 'presentar__punto',
      'aria-current': i === a ? 'step' : undefined }, ctx.t(`app.presentar.acto${i}.corto`))));
    titulo.textContent = ctx.t(`app.presentar.acto${a}.titulo`);
    subtitulo.textContent = ctx.t(`app.presentar.acto${a}.subtitulo`);
    anterior.disabled = a === 0; siguiente.disabled = a === ACTOS - 1;
    conRiesgo.activo = a === 3;
    if (cambio) entrarAlActo(ctx, a);
    panelDelActo(ctx, a, panel);
    etq.actualizar(); lienzo.redibujar();
    raiz.dataset.acto = String(a);
    if (cambio) titulo.focus({ preventScroll: true });
  };
  pintarActo();
  L.sumar(ctx.almacen.suscribir((n, a) => {
    if (n.acto !== a.acto) pintarActo();
    if (n.t !== a.t || n.inicio !== a.inicio) linea.actualizar();
  }));
  L.sumar(s.suscribir(() => { panelDelActo(ctx, ctx.almacen.estado.acto, panel); etq.actualizar(); }));
  L.sumar(escuchar(document, 'keydown', (ev) => {
    const t = ev.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.getAttribute('role') === 'slider')) return;
    if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { ev.preventDefault(); ctx.almacen.despachar({ tipo: 'actoRelativo', delta: 1 }); }
    else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); ctx.almacen.despachar({ tipo: 'actoRelativo', delta: -1 }); }
    else if (ev.key === ' ') { ev.preventDefault(); ctx.almacen.despachar({ tipo: 'alternarReproduccion' }); }
  }));
  // pantalla encendida mientras se presenta (se vuelve a pedir si la pestaña vuelve a estar visible)
  let candado: Candado | null = null;
  void pedirPantallaEncendida().then((c) => { candado = c; });
  L.sumar(escuchar(document, 'visibilitychange', () => { if (document.visibilityState === 'visible') void pedirPantallaEncendida().then((c) => { candado = c; }); }));
  L.sumar(() => { void candado?.release().catch(() => {}); if (document.fullscreenElement) void document.exitFullscreen().catch(() => {}); });
  // pantalla completa al entrar, si el navegador lo deja (hace falta un gesto: el toque en «Presentar» lo es)
  void raiz.requestFullscreen?.().catch(() => {});
  L.sumar(bucleReproduccion(ctx));
  raiz.dataset.listo = '1';
  return () => { raiz.classList.remove('presentar'); L.correr(); };
};

/** Lo que hace la escena al entrar a cada acto: la película a ×600, el salto al primer problema, etc. */
function entrarAlActo(ctx: Contexto, a: number): void {
  const s = ctx.sesion, A = ctx.almacen;
  if (a === 0) {
    A.despachar({ tipo: 'seleccionar', seleccion: null });
    A.despachar({ tipo: 'velocidad', velocidad: 600 });
    A.despachar({ tipo: 'rebobinar' });
    if (!ctx.reducirMovimiento()) A.despachar({ tipo: 'reproducir' });
  } else if (a === 1) {
    A.despachar({ tipo: 'pausar' });
    const r = rampaMasLlena(ctx);
    const llena = s.noche?.momentos.find((m) => m.clave === 'escena.momento.rampaLlena' && (r === null || m.r === r)) ?? s.noche?.momentos.find((m) => m.importancia >= 5);
    if (llena) A.despachar({ tipo: 'cabezal', t: llena.t });
    if (r !== null) A.despachar({ tipo: 'seleccionar', seleccion: { clase: ClaseEntidad.RAMPA, id: r } });
  } else {
    A.despachar({ tipo: 'pausar' });
    A.despachar({ tipo: 'seleccionar', seleccion: null });
  }
}

const causasPresentacion = new WeakMap<object, Promise<string[]>>();

function panelDelActo(ctx: Contexto, a: number, panel: HTMLElement): void {
  const s = ctx.sesion;
  if (a === 0) { poner(panel, lineaResumen(ctx)); return; }
  if (a === 1) {
    // La rampa resaltada y la causa que se cuenta son del MISMO lugar (hallazgo UX-04): el paquete es uno que esperó por esa rampa.
    // Si ningún paquete esperó por la rampa que más se llenó, se cuenta el paquete atrasado (o el que más tardó) sin decir que es de ella.
    const r = rampaMasLlena(ctx), noche = s.noche;
    const deRampa = r !== null ? paqueteDeRampa(ctx, r) : null;
    const e = deRampa ?? paqueteParaMostrar(ctx);
    const bio = r !== null ? s.biografia(ClaseEntidad.RAMPA, r) : null;
    const lista = el('ul', { class: 'presentar__lista' });
    if (bio) {
      const ok = s.verificar([bio.titulo, ...bio.pasos.map((p) => p.frase)]);
      lista.append(el('li', { class: 'presentar__destacado' }, ok[0] ? textoFrase(ctx, bio.titulo) : ctx.t('app.bio.retenida')));
      // del relato de la rampa, primero cuándo estuvo llena (no los cierres de jaula)
      const idx = bio.pasos.map((p, i) => [p, i] as const);
      const llenas = idx.filter(([p]) => p.frase.clave === 'explicacion.paso.rampa_llena');
      const elegidos = (llenas.length ? llenas : idx).slice(0, 3);
      elegidos.forEach(([p, i]) => lista.append(el('li', null, `${ctx.f.hora(p.desde)} · ${ok[i + 1] ? textoFrase(ctx, p.frase) : ctx.t('app.bio.retenida')}`)));
    }
    const causas = el('div', { class: 'presentar__causas' }, el('p', { class: 'nota' }, ctx.t('app.bio.buscandoCausas')));
    poner(panel, lista, el('p', { class: 'presentar__subtitulo' }, ctx.t(deRampa !== null ? 'app.presentar.paqueteDeRampa' : 'app.presentar.paqueteOtro')), causas);
    if (e !== null && noche) {
      let p = causasPresentacion.get(noche);
      if (!p) {
        p = s.causas(e, noche).then((x) => {
          if (!x) return [];
          const ok = s.verificar(x.causas, noche);
          return x.causas.filter((_, i) => ok[i]).map((f) => textoFrase(ctx, f));
        }).catch(() => []);
        causasPresentacion.set(noche, p);
      }
      void p.then((txt) => poner(causas, txt.length ? el('ul', { class: 'causas' }, ...txt.map((x) => el('li', { class: 'causa' }, x))) : el('p', null, ctx.t('app.bio.sinCausas'))));
    } else poner(causas, el('p', null, ctx.t('app.bio.sinCausas')));
    return;
  }
  if (a === 2) {
    const y = s.ysi;
    if (y.fase === 'confirmada') {
      // con el semáforo de A y de B: en rojo, sin números ni veredictos (hallazgo EST-01)
      poner(panel, el('p', { class: 'presentar__destacado' }, ctx.t('app.presentar.propuesta')), ...bloqueComparacion(ctx, y));
    } else {
      poner(panel, lineaResumen(ctx), el('p', null, ctx.t('app.presentar.sinPropuesta')),
        el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': 'ir-ysi', onclick: () => ctx.ir('ysi') }, ctx.t('app.escena.ysi')));
    }
    return;
  }
  // acto 3: cuánto confiar
  const m = s.mapa;
  const items: HTMLElement[] = [];
  if (s.semaforo?.color === 'rojo') {
    // «No usar»: ni abanico ni peor noche (hallazgo E-02); el motivo está en el resumen
    items.push(lineaResumen(ctx));
  } else if (m && Number.isFinite(m.finClasificacionMin.p50) && s.mv) {
    const base = horaASeg(s.mv.modelo.calendario.inicio) * 1000;
    const h = (min: number) => ctx.f.hora(base + min * 60000);
    items.push(el('p', null, ctx.t('app.noches.abanico', { p10: h(m.finClasificacionMin.p10), p50: h(m.finClasificacionMin.p50), p90: h(m.finClasificacionMin.p90) })));
    // cada percentil con su intervalo (estadísticos de orden), como en «Cien noches» (hallazgo EST-07): un P90 de cien noches no es exacto
    const fines = s.nochesListas ? s.nochesLlegadas.map((r) => r.kpi.finClasificacionMin) : [];
    const ics = ctx.servicios.intervalos && fines.length ? [0.1, 0.5, 0.9].map((q) => ctx.servicios.intervalos!.icPercentil(fines, q, s.confianza)) : [];
    if (ics.length === 3 && ics.every((ic) => ic !== null)) {
      const conIc = (v: number, ic: [number, number]) => ctx.t('app.noches.conIc', { valor: h(v), bajo: h(ic[0]), alto: h(ic[1]) });
      const f = m.finClasificacionMin;
      items.push(el('p', { class: 'nota', 'data-presentar': 'percentiles-ic' }, ctx.t('app.presentar.percentilesIc', { conf: ctx.f.porcentaje(s.confianza, 0),
        p10: conIc(f.p10, ics[0]!), p50: conIc(f.p50, ics[1]!), p90: conIc(f.p90, ics[2]!) })));
    }
    // la peor noche con su tamaño: a qué hora termina y cuántos paquetes quedan afuera del corte (hallazgo UX-15)
    const peor = s.resultados[m.nochePeor];
    items.push(el('p', null, peor
      ? ctx.t('app.presentar.peorConTamano', { n: m.nochePeor + 1, hora: h(peor.kpi.finClasificacionMin), pendientes: ctx.f.numero(peor.kpi.pendientesAlCorte, 0) })
      : ctx.t('app.presentar.peor', { n: m.nochePeor + 1 })));
  } else items.push(el('p', { class: 'nota' }, ctx.t('app.noches.progreso', { llegadas: s.llegadas, N: s.N })));
  const r = s.decision.ranking;
  if (r && r.length) {
    const moneda = s.mv?.modelo.costos.moneda ?? 'ARS';
    items.push(el('p', { class: 'presentar__destacado' }, ctx.t('app.presentar.loQuePesa')));
    // la pérdida esperada es un PROMEDIO ponderado; el «hasta» es el peor extremo (hallazgo E-12)
    items.push(el('ul', { class: 'presentar__lista' }, ...r.slice(0, 3).map((x) => {
      const peor = (x as { peorCaso?: number }).peorCaso;
      return el('li', null, ctx.t(peor !== undefined ? 'app.presentar.supuestoConPeor' : 'app.presentar.supuesto', {
        parametro: x.parametro, perdida: ctx.f.moneda(x.perdidaEsperada, moneda), peor: ctx.f.moneda(peor ?? x.perdidaEsperada, moneda) }));
    })));
  } else items.push(el('p', null, ctx.t('app.presentar.sinTamizado')));
  poner(panel, ...items, sellos(ctx, true));
}
