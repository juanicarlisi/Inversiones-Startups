// app/ui/lienzo.ts · Andén simulador, corte 1 · P8 (interfaz).
// Un lienzo con la vista de la escena (servicios.crearVista sobre el reproductor de la noche): se redibuja cuando cambia el cabezal, la
// selección, el tema, el piso o la noche; se adapta al tamaño de su caja (ResizeObserver) y a la densidad de la pantalla; tocar algo
// lo selecciona y abre su biografía. Lo que se dibuja sale de la traza (lo que se ve es lo que se calculó).
import type { Contexto } from '../contexto.ts';
import type { MapaRiesgo, Piso, Reproductor, Vista } from '../../contratos/vistas.ts';
import type { Estado } from '../estado.ts';
import { el, escuchar, limpiezas } from './dom.ts';

/** Piso elegido midiendo el primer cuadro 2,5D (una vez por sesión de la página). */
let pisoMedido: Piso | null = null;

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
  let vista: Vista | null = null, deReproductor: Reproductor | null = null, deTema = '', dePiso: Piso | null = null;
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
  const asegurarVista = (): Vista | null => {
    const r = o.reproductor();
    if (!r || ancho < 2 || alto < 2) return null;
    const piso = o.piso ?? pisoActual(ctx, () => medirIso(r));
    const tema = `${ctx.temaResuelto()}|${ctx.reducirMovimiento()}`;
    if (vista && deReproductor === r && deTema === tema && dePiso === piso) return vista;
    vista?.destruir();
    vista = ctx.servicios.crearVista(lienzo, r, ctx.estilo(), piso);
    vista.redimensionar(ancho, alto, dpr());
    deReproductor = r; deTema = tema; dePiso = piso;
    nodo.dataset.piso = piso;
    return vista;
  };
  let pendiente = 0;
  const dibujarYa = () => {
    pendiente = 0;
    const v = asegurarVista();
    if (!v) return;
    const e = ctx.almacen.estado;
    v.dibujar(o.instante ? o.instante() : e.t, { seleccion: e.seleccion, riesgo: o.riesgo?.() ?? null, fantasma: o.fantasma?.() ?? null });
    nodo.dataset.listo = '1';
  };
  const redibujar = () => { if (!pendiente) pendiente = requestAnimationFrame(dibujarYa); };

  const ro = new ResizeObserver((entradas) => {
    const r = entradas[0]?.contentRect; if (!r) return;
    const w = Math.round(r.width), h = Math.round(r.height);
    if (w === ancho && h === alto) return;
    ancho = w; alto = h;
    if (vista) vista.redimensionar(ancho, alto, dpr());
    redibujar();
  });
  ro.observe(nodo);
  L.sumar(() => ro.disconnect());
  L.sumar(ctx.almacen.suscribir((n: Estado, a: Estado) => {
    if (n.t !== a.t || n.seleccion !== a.seleccion || n.tema !== a.tema || n.piso !== a.piso) redibujar();
  }));
  L.sumar(ctx.sesion.suscribir(() => redibujar()));
  if (o.tocable) {
    let abajo: { x: number; y: number } | null = null;
    L.sumar(escuchar(lienzo, 'pointerdown', (ev) => { abajo = { x: ev.clientX, y: ev.clientY }; }));
    L.sumar(escuchar(lienzo, 'pointerup', (ev) => {
      if (!abajo || Math.hypot(ev.clientX - abajo.x, ev.clientY - abajo.y) > 8) { abajo = null; return; }
      abajo = null;
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
  }
  L.sumar(() => { if (pendiente) cancelAnimationFrame(pendiente); vista?.destruir(); vista = null; });
  return { nodo, redibujar, destruir: () => L.correr(), vista: () => vista };
}

/** Para las pruebas: olvidar el piso medido. */
export function olvidarPisoMedido(): void { pisoMedido = null; }
