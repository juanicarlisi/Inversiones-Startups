// app/ui/lienzo.ts · Andén simulador, corte 1 · P8 (interfaz).
// Un lienzo con la vista de la escena (servicios.crearVista sobre el reproductor de la noche): se redibuja cuando cambia el cabezal, la
// selección, el tema, el piso o la noche; se adapta al tamaño de su caja (ResizeObserver) y a la densidad de la pantalla; tocar algo
// lo selecciona y abre su biografía. Lo que se dibuja sale de la traza (lo que se ve es lo que se calculó). Mientras no hay noche, si se
// pasa `plano`, dibuja el plano vacío del hub (ui/plano.ts): sin tablero, sin toques y sin marcarse listo, porque no es un instante.
import type { Contexto } from '../contexto.ts';
import type { MapaRiesgo, Piso, Reproductor, Vista } from '../../contratos/vistas.ts';
import type { Estado } from '../estado.ts';
import { el, escuchar, limpiezas } from './dom.ts';
import { crearTablero } from './tablero.ts';
import { desplazar, pasoDePellizco, PASO_ZOOM, zoomEnPunto } from './camara.ts';
import type { Camara } from '../../contratos/vistas.ts';

/** Piso elegido midiendo el primer cuadro 2,5D (una vez por sesión de la página). */
let pisoMedido: Piso | null = null;
/** ¿Ya se volvió a medir el piso con los Workers quietos? (una vez por página: ver `remedirPiso`). */
let pisoRemedido = false;
/** La cámara propia de cada lienzo con clave (escena, cien noches…): sobrevive a ir a una biografía y volver. */
const camaras = new Map<string, Camara>();

export interface OpcionesLienzo {
  reproductor: () => Reproductor | null;
  riesgo?: () => MapaRiesgo | null;
  fantasma?: () => Reproductor | null;
  /** Si se puede tocar para abrir biografías. */
  tocable?: boolean;
  etiqueta: string;
  /** Clase extra del contenedor. */
  clase?: string;
  /** Instante a dibujar (por defecto, el cabezal del estado). */
  instante?: () => number;
  /** Piso fijo (las miniaturas van en planta). */
  piso?: Piso;
  /** Tablero en vivo sobre la película (hora y cuentas del instante; ui/tablero.ts). 'compacto' para las mitades de la pantalla dividida. */
  tablero?: boolean | 'compacto';
  /** Rueda, arrastre y pellizco para acercar y mover la cámara; doble clic o «Ver todo el hub» para volver (ui/camara.ts). */
  camara?: boolean;
  /** Clave con la que se recuerda la cámara propia entre montajes (por ejemplo, `escena|<huella del modelo>`). */
  claveCamara?: string;
  /** Se llama cada vez que la vista se arma con otro piso (el medido, el elegido o el remedido): para el botón de piso (hallazgo UX-07). */
  alCambiarPiso?: (piso: Piso) => void;
  /** El plano vacío del hub (ui/plano.ts), que se dibuja mientras `reproductor()` da null. Si su vista falla, se deja de intentar. */
  plano?: () => Reproductor | null;
}

export interface Lienzo { nodo: HTMLElement; redibujar(): void; destruir(): void; vista(): Vista | null }

export function pisoActual(ctx: Contexto, medir?: () => Piso): Piso {
  const e = ctx.almacen.estado.piso;
  if (e) return e;
  if (!pisoMedido && medir) pisoMedido = medir();
  return pisoMedido ?? '2d';
}

export function crearLienzo(ctx: Contexto, o: OpcionesLienzo): Lienzo {
  const L = limpiezas();
  const lienzo = el('canvas', { class: 'escena__lienzo', role: 'img', 'aria-label': o.etiqueta });
  const nodo = el('div', { class: `escena__caja ${o.clase ?? ''}`.trim() }, lienzo);
  const tablero = o.tablero ? crearTablero(ctx, o.reproductor, o.tablero === 'compacto') : null;
  if (tablero) nodo.appendChild(tablero.nodo);
  let vista: Vista | null = null, deReproductor: Reproductor | null = null, deTema = '', dePiso: Piso | null = null;
  // la cámara: el encuadre completo de la vista y, si la persona acercó o movió, la suya (sobrevive a otra noche o a otro tema)
  let encuadre: Camara | null = null, propia: Camara | null = null;
  // la cámara propia se recuerda por lienzo con clave y por piso (la de la planta no sirve en 2,5D)
  const claveDe = (piso: Piso | null) => (o.claveCamara && piso ? `${o.claveCamara}|${piso}` : null);
  const guardarCamara = () => { const k = claveDe(dePiso); if (k) { if (propia) camaras.set(k, propia); else camaras.delete(k); } };
  const encuadrar = el('button', { type: 'button', class: 'escena__encuadrar', 'data-accion': 'encuadrar', hidden: true,
    onclick: () => { propia = null; if (vista && encuadre) vista.camara = { ...encuadre }; pintarEncuadrar(); redibujar(); } }, ctx.t('app.escena.encuadrar'));
  // la cámara propia queda también en el DOM (data-camara): la usan los recorridos de punta a punta para saber dónde quedó cada cosa
  const pintarEncuadrar = () => {
    encuadrar.hidden = !propia; guardarCamara();
    if (propia) nodo.dataset.camara = JSON.stringify(propia); else delete nodo.dataset.camara;
  };
  if (o.camara) { nodo.appendChild(encuadrar); lienzo.classList.add('escena__lienzo--camara'); lienzo.title = ctx.t('app.escena.ayudaCamara'); }
  let ancho = 0, alto = 0;
  const dpr = () => Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio > 0) ? devicePixelRatio : 1);

  const medirIso = (r: Reproductor): Piso => {
    const prueba = ctx.servicios.crearVista(lienzo, r, ctx.estilo(), 'iso');
    try {
      prueba.redimensionar(Math.max(ancho, 320), Math.max(alto, 200), dpr());
      const t = ctx.almacen.estado.t;
      return ctx.servicios.elegirPiso(() => { const t0 = performance.now(); prueba.dibujar(t); return performance.now() - t0; });
    } finally { prueba.destruir(); }
  };
  // el plano mientras se simula: nunca mide el piso (vacío, el 2,5D siempre andaría rápido) y, si algo falla, se deja de intentar
  let planoRoto = false;
  const asegurarPlano = (): Vista | null => {
    const p = !planoRoto && o.plano ? o.plano() : null;
    if (!p || ancho < 2 || alto < 2) return null;
    // el piso elegido, el ya medido en esta página o el 2,5D (el que elige casi cualquier equipo: el banco midió 1,5 ms por cuadro)
    const piso = o.piso ?? ctx.almacen.estado.piso ?? pisoMedido ?? 'iso';
    const tema = `${ctx.temaResuelto()}|${ctx.reducirMovimiento()}`;
    if (vista && deReproductor === p && deTema === tema && dePiso === piso) return vista;
    try {
      vista?.destruir();
      vista = ctx.servicios.crearVista(lienzo, p, ctx.estilo(), piso);
      vista.redimensionar(ancho, alto, dpr());
    } catch {
      planoRoto = true; vista = null; deReproductor = null; delete nodo.dataset.plano;
      return null;
    }
    encuadre = { ...vista.camara };
    deReproductor = p; deTema = tema; dePiso = piso;
    const k = claveDe(piso);
    propia = k ? camaras.get(k) ?? null : null;
    if (propia) vista.camara = { ...propia };
    pintarEncuadrar();
    nodo.dataset.plano = '1';
    return vista;
  };
  const asegurarVista = (): Vista | null => {
    const r = o.reproductor();
    if (!r) return asegurarPlano();
    if (ancho < 2 || alto < 2) return null;
    const piso = o.piso ?? pisoActual(ctx, () => medirIso(r));
    const tema = `${ctx.temaResuelto()}|${ctx.reducirMovimiento()}`;
    if (vista && deReproductor === r && deTema === tema && dePiso === piso) return vista;
    vista?.destruir();
    const k = claveDe(piso);
    if (k) propia = camaras.get(k) ?? null;
    else if (dePiso !== piso) propia = null;
    vista = ctx.servicios.crearVista(lienzo, r, ctx.estilo(), piso);
    vista.redimensionar(ancho, alto, dpr());
    encuadre = { ...vista.camara };
    deReproductor = r; deTema = tema; dePiso = piso;
    if (propia) vista.camara = { ...propia };
    pintarEncuadrar();
    delete nodo.dataset.plano;
    const cambio = nodo.dataset.piso !== piso;
    nodo.dataset.piso = piso;
    if (cambio) o.alCambiarPiso?.(piso);
    return vista;
  };
  let pendiente = 0;
  const dibujarYa = () => {
    pendiente = 0;
    const v = asegurarVista();
    if (!v) return;
    if (!o.reproductor()) {
      // el plano: en el inicio del turno, sin tablero ni marca de listo (no es un instante simulado)
      try { v.dibujar(deReproductor?.inicio ?? 0); } catch { planoRoto = true; v.destruir(); vista = null; deReproductor = null; delete nodo.dataset.plano; }
      return;
    }
    const e = ctx.almacen.estado, t = o.instante ? o.instante() : e.t;
    v.dibujar(t, { seleccion: e.seleccion, riesgo: o.riesgo?.() ?? null, fantasma: o.fantasma?.() ?? null });
    tablero?.actualizar(t);
    nodo.dataset.listo = '1';
  };
  const redibujar = () => { if (!pendiente) pendiente = requestAnimationFrame(dibujarYa); };

  const ro = new ResizeObserver((entradas) => {
    const r = entradas[0]?.contentRect; if (!r) return;
    const w = Math.round(r.width), h = Math.round(r.height);
    if (w === ancho && h === alto) return;
    ancho = w; alto = h;
    // una caja oculta (la mitad que no se ve en la pantalla dividida alternada) mide 0: no hay nada que redimensionar ni dibujar
    if (ancho < 2 || alto < 2) return;
    if (vista) {
      vista.redimensionar(ancho, alto, dpr());
      // con la cámara propia, la vista la conserva; el encuadre completo es el del tamaño nuevo
      if (!propia) encuadre = { ...vista.camara };
    }
    redibujar();
  });
  ro.observe(nodo);
  L.sumar(() => ro.disconnect());
  L.sumar(ctx.almacen.suscribir((n: Estado, a: Estado) => {
    if (n.t !== a.t || n.seleccion !== a.seleccion || n.tema !== a.tema || n.piso !== a.piso) redibujar();
  }));
  L.sumar(ctx.sesion.suscribir((tema) => {
    // el piso se mide en el primer segundo, cuando los Workers simulan las cien noches y le ganan la CPU al hilo de la interfaz: en un
    // equipo de 4 núcleos eso puede dar 2D aunque el 2,5D ande holgado. Si salió 2D, se vuelve a medir una vez con las noches listas.
    if (tema === 'noches' && ctx.sesion.nochesListas && !o.piso && !ctx.almacen.estado.piso && pisoMedido === '2d' && !pisoRemedido) {
      const r = o.reproductor();
      if (r && ancho >= 2 && alto >= 2) { pisoRemedido = true; if (medirIso(r) === 'iso') pisoMedido = 'iso'; }
    }
    redibujar();
  }));
  // punteros activos (mouse, lápiz o dedos): uno que se arrastra mueve la cámara, dos que se pellizcan la acercan
  const punteros = new Map<number, { x: number; y: number }>();
  let abajo: { x: number; y: number } | null = null, moviendo = false, pellizco = false, escalaPendiente = 1;
  const local = (x: number, y: number): [number, number] => { const c = lienzo.getBoundingClientRect(); return [x - c.left, y - c.top]; };
  const tocarCamara = () => { if (vista) { propia = { ...vista.camara }; pintarEncuadrar(); redibujar(); } };
  if (o.camara) {
    L.sumar(escuchar(lienzo, 'wheel', (ev) => {
      const v = asegurarVista(); if (!v || !encuadre) return;
      ev.preventDefault();
      const [px, py] = local(ev.clientX, ev.clientY);
      zoomEnPunto(v, px, py, ev.deltaY < 0 ? PASO_ZOOM : 1 / PASO_ZOOM, encuadre);
      tocarCamara();
    }, { passive: false }));
    L.sumar(escuchar(lienzo, 'dblclick', () => { propia = null; if (vista && encuadre) vista.camara = { ...encuadre }; pintarEncuadrar(); redibujar(); }));
  }
  L.sumar(escuchar(lienzo, 'pointerdown', (ev) => {
    punteros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (punteros.size === 1) { abajo = { x: ev.clientX, y: ev.clientY }; moviendo = false; pellizco = false; escalaPendiente = 1; }
    if (punteros.size === 2) pellizco = true;
    if (o.camara) { try { lienzo.setPointerCapture(ev.pointerId); } catch { /* sin captura: igual anda */ } }
  }));
  L.sumar(escuchar(lienzo, 'pointermove', (ev) => {
    const antes = punteros.get(ev.pointerId);
    if (!antes || !o.camara) return;
    const v = asegurarVista(); if (!v || !encuadre) return;
    if (punteros.size === 1 && abajo && (moviendo || Math.hypot(ev.clientX - abajo.x, ev.clientY - abajo.y) > 8)) {
      moviendo = true;
      const [x0, y0] = local(antes.x, antes.y), [x1, y1] = local(ev.clientX, ev.clientY);
      desplazar(v, x0, y0, x1, y1);
      tocarCamara();
    } else if (punteros.size === 2) {
      const otro = [...punteros.entries()].find(([id]) => id !== ev.pointerId)?.[1];
      if (otro) {
        const d0 = Math.hypot(antes.x - otro.x, antes.y - otro.y), d1 = Math.hypot(ev.clientX - otro.x, ev.clientY - otro.y);
        escalaPendiente *= d0 > 0 ? d1 / d0 : 1;
        const paso = pasoDePellizco(escalaPendiente);
        if (paso !== 1) {
          const [mx, my] = local((ev.clientX + otro.x) / 2, (ev.clientY + otro.y) / 2);
          zoomEnPunto(v, mx, my, paso, encuadre);
          escalaPendiente /= paso;
          tocarCamara();
        }
      }
    }
    punteros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  }));
  const soltarPuntero = (ev: PointerEvent) => { punteros.delete(ev.pointerId); if (punteros.size === 0) abajo = null; };
  L.sumar(escuchar(lienzo, 'pointercancel', soltarPuntero));
  if (o.tocable) {
    L.sumar(escuchar(lienzo, 'pointerup', (ev) => {
      const fueToque = punteros.size === 1 && !moviendo && !pellizco && !!abajo && Math.hypot(ev.clientX - abajo.x, ev.clientY - abajo.y) <= 8;
      soltarPuntero(ev);
      if (!fueToque) return;
      const v = asegurarVista(), r = o.reproductor();
      if (!v || !r) return;
      const caja = lienzo.getBoundingClientRect();
      const px = ev.clientX - caja.left, py = ev.clientY - caja.top;
      const [x, y] = v.aMundo(px, py), [x2, y2] = v.aMundo(px + 16, py);
      const radio = Math.max(0.6, Math.hypot(x2 - x, y2 - y));
      const toque = r.tocar(x, y, ctx.almacen.estado.t, radio);
      if (toque) ctx.almacen.despachar({ tipo: 'seleccionar', seleccion: toque, abrir: true });
      else ctx.narrar(ctx.t('app.escena.nadaAhi'));
    }));
  } else L.sumar(escuchar(lienzo, 'pointerup', soltarPuntero));
  L.sumar(() => { if (pendiente) cancelAnimationFrame(pendiente); vista?.destruir(); vista = null; });
  return { nodo, redibujar, destruir: () => L.correr(), vista: () => vista };
}

/** Para las pruebas: olvidar el piso medido. */
export function olvidarPisoMedido(): void { pisoMedido = null; pisoRemedido = false; camaras.clear(); }
