// app/ui/linea-tiempo.ts · Andén simulador, corte 1 · P8 (interfaz).
// Línea de tiempo de la noche: pista con cabezal arrastrable (role=slider: flechas ±1 min, mayúsculas ±15 min, Inicio/Fin), marcas de los
// momentos (botones que saltan a ese instante), la línea del corte y las horas. Debajo, los controles: rebobinar, reproducir o pausar y la
// velocidad (×1 a ×3.600). Todo lo que cambia el tiempo pasa por el almacén (estado.ts): la línea solo dibuja lo que dice el estado.
import type { Contexto } from '../contexto.ts';
import type { MomentoEscena } from '../../contratos/vistas.ts';
import { PASO_TECLADO_LARGO_MS, PASO_TECLADO_MS, VELOCIDADES } from '../estado.ts';
import { el, escuchar, limpiezas } from './dom.ts';

export interface LineaTiempo { nodo: HTMLElement; actualizar(): void; destruir(): void }

const fraccion = (t: number, a: number, b: number) => (b > a ? Math.min(1, Math.max(0, (t - a) / (b - a))) : 0);
const pct = (f: number) => `${(f * 100).toFixed(3)}%`;

export function crearLineaTiempo(ctx: Contexto, o: { momentos: () => MomentoEscena[]; corte: () => number | null; minImportancia?: () => number }): LineaTiempo {
  const L = limpiezas();
  const progreso = el('div', { class: 'lt__progreso' });
  const cabezal = el('div', { class: 'lt__cabezal', 'aria-hidden': 'true' });
  const corte = el('div', { class: 'lt__corte', 'aria-hidden': 'true' });
  const pista = el('div', { class: 'lt__pista', role: 'slider', tabindex: 0, 'aria-label': ctx.t('app.linea.titulo'), 'data-accion': 'linea-tiempo' },
    progreso, corte, cabezal);
  const marcas = el('div', { class: 'lt__marcas' });
  const horas = el('div', { class: 'lt__horas', 'aria-hidden': 'true' });
  const nodo = el('div', { class: 'linea-tiempo' }, el('div', { class: 'lt__zona' }, pista, marcas), horas);

  const tDeX = (clientX: number) => {
    const r = pista.getBoundingClientRect(), e = ctx.almacen.estado;
    return e.inicio + fraccion(clientX, r.left, r.right) * (e.fin - e.inicio);
  };
  let arrastrando = false;
  L.sumar(escuchar(pista, 'pointerdown', (ev) => {
    arrastrando = true; pista.setPointerCapture(ev.pointerId);
    ctx.almacen.despachar({ tipo: 'pausar' });
    ctx.almacen.despachar({ tipo: 'cabezal', t: tDeX(ev.clientX) });
  }));
  L.sumar(escuchar(pista, 'pointermove', (ev) => { if (arrastrando) ctx.almacen.despachar({ tipo: 'cabezal', t: tDeX(ev.clientX) }); }));
  const soltar = () => { arrastrando = false; };
  L.sumar(escuchar(pista, 'pointerup', soltar));
  L.sumar(escuchar(pista, 'pointercancel', soltar));
  L.sumar(escuchar(pista, 'keydown', (ev) => {
    const e = ctx.almacen.estado, d = ev.shiftKey ? PASO_TECLADO_LARGO_MS : PASO_TECLADO_MS;
    let t: number | null = null;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') t = e.t + d;
    else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') t = e.t - d;
    else if (ev.key === 'PageUp') t = e.t + PASO_TECLADO_LARGO_MS;
    else if (ev.key === 'PageDown') t = e.t - PASO_TECLADO_LARGO_MS;
    else if (ev.key === 'Home') t = e.inicio;
    else if (ev.key === 'End') t = e.fin;
    else if (ev.key === ' ' || ev.key === 'k') { ev.preventDefault(); ctx.almacen.despachar({ tipo: 'alternarReproduccion' }); return; }
    if (t === null) return;
    ev.preventDefault();
    ctx.almacen.despachar({ tipo: 'pausar' });
    ctx.almacen.despachar({ tipo: 'cabezal', t });
  }));

  let firma = '';
  const armarFijos = () => {
    const e = ctx.almacen.estado, ms = o.momentos(), min = o.minImportancia?.() ?? 1;
    // el ancho real decide cuántas marcas y horas entran sin pisarse (en 360 px no entran las nueve horas de la noche)
    const ancho = pista.clientWidth || 800;
    const f = `${e.inicio}|${e.fin}|${ms.length}|${min}|${ctx.traductor.idioma}|${Math.round(ancho / 24)}`;
    if (f === firma) return;
    firma = f;
    marcas.replaceChildren();
    // marcas que no se pisan: primero las más importantes; una marca a menos de 16 px de otra ya puesta no se dibuja (sigue en la
    // narración y en la biografía; la línea de tiempo es para saltar, no un registro completo)
    const sep = 16 / Math.max(1, ancho), puestas: number[] = [];
    const candidatas = ms.filter((m) => m.importancia >= min && m.t >= e.inicio && m.t <= e.fin)
      .sort((a, b) => b.importancia - a.importancia || a.t - b.t)
      .filter((m) => {
        const x = fraccion(m.t, e.inicio, e.fin);
        if (puestas.some((y) => Math.abs(y - x) < sep)) return false;
        puestas.push(x);
        return true;
      })
      .sort((a, b) => a.t - b.t);
    for (const m of candidatas) {
      const texto = `${ctx.f.hora(m.t)} · ${ctx.t(m.clave, m.vars)}`;
      const b = el('button', { type: 'button', class: `lt__marca lt__marca--${m.importancia}`, title: texto, 'aria-label': texto, 'data-accion': 'momento',
        onclick: () => { ctx.almacen.despachar({ tipo: 'pausar' }); ctx.almacen.despachar({ tipo: 'cabezal', t: m.t }); ctx.narrar(texto); } });
      b.style.left = pct(fraccion(m.t, e.inicio, e.fin));
      marcas.appendChild(b);
    }
    horas.replaceChildren();
    const h0 = Math.ceil(e.inicio / 3_600_000), h1 = Math.floor(e.fin / 3_600_000);
    // cada rótulo «00:00» ocupa ~36 px: se elige el paso (1, 2, 3, 4 o 6 h) que los deja al menos a 48 px
    const pxPorHora = ancho / Math.max(1e-9, (e.fin - e.inicio) / 3_600_000);
    const paso = [1, 2, 3, 4, 6].find((p) => p * pxPorHora >= 48) ?? 6;
    for (let h = h0; h <= h1; h += paso) {
      const fr = fraccion(h * 3_600_000, e.inicio, e.fin);
      const s = el('span', { class: fr > 0.96 ? 'lt__hora lt__hora--fin' : fr < 0.04 ? 'lt__hora lt__hora--inicio' : 'lt__hora' }, ctx.f.hora(h * 3_600_000));
      s.style.left = pct(fr);
      horas.appendChild(s);
    }
    const c = o.corte();
    corte.hidden = c === null || c < e.inicio || c > e.fin;
    if (c !== null) corte.style.left = pct(fraccion(c, e.inicio, e.fin));
  };
  const actualizar = () => {
    armarFijos();
    const e = ctx.almacen.estado, fr = fraccion(e.t, e.inicio, e.fin);
    progreso.style.width = pct(fr); cabezal.style.left = pct(fr);
    pista.setAttribute('aria-valuemin', String(Math.round(e.inicio / 60000)));
    pista.setAttribute('aria-valuemax', String(Math.round(e.fin / 60000)));
    pista.setAttribute('aria-valuenow', String(Math.round(e.t / 60000)));
    pista.setAttribute('aria-valuetext', ctx.f.hora(e.t));
  };
  actualizar();
  // al cambiar el ancho (girar el teléfono, abrir la pantalla dividida) se vuelven a repartir marcas y horas
  if (typeof ResizeObserver === 'function') {
    const ro = new ResizeObserver(() => actualizar());
    ro.observe(pista);
    L.sumar(() => ro.disconnect());
  }
  return { nodo, actualizar, destruir: () => L.correr() };
}

/** Controles de reproducción. */
export function controlesReproduccion(ctx: Contexto): { nodo: HTMLElement; actualizar(): void } {
  const hora = el('span', { class: 'controles__hora', 'data-hora': '' });
  const reproducir = el('button', { type: 'button', class: 'boton boton--icono boton--primario', 'data-accion': 'reproducir',
    onclick: () => ctx.almacen.despachar({ tipo: 'alternarReproduccion' }) });
  const rebobinar = el('button', { type: 'button', class: 'boton boton--icono', 'data-accion': 'rebobinar', 'aria-label': ctx.t('app.control.rebobinar'),
    title: ctx.t('app.control.rebobinar'), onclick: () => ctx.almacen.despachar({ tipo: 'rebobinar' }) }, '⏮');
  const velocidad = el('select', { class: 'controles__velocidad', 'data-accion': 'velocidad', 'aria-label': ctx.t('app.control.velocidad') },
    ...VELOCIDADES.map((v) => el('option', { value: v }, `×${ctx.f.numero(v, 0)}`)));
  velocidad.addEventListener('change', () => ctx.almacen.despachar({ tipo: 'velocidad', velocidad: Number(velocidad.value) }));
  const actualizar = () => {
    const e = ctx.almacen.estado;
    const txt = e.reproduciendo ? ctx.t('app.control.pausar') : ctx.t('app.control.reproducir');
    reproducir.textContent = e.reproduciendo ? '❚❚' : '▶';
    reproducir.setAttribute('aria-label', txt); reproducir.title = txt;
    reproducir.setAttribute('aria-pressed', String(e.reproduciendo));
    if (velocidad.value !== String(e.velocidad)) velocidad.value = String(e.velocidad);
    hora.textContent = ctx.f.hora(e.t);
  };
  actualizar();
  return { nodo: el('div', { class: 'controles' }, rebobinar, reproducir, velocidad, hora), actualizar };
}

/** Bucle de reproducción: mientras el estado diga «reproduciendo», avanza el cabezal con el tiempo real × la velocidad. */
export function bucleReproduccion(ctx: Contexto): () => void {
  let previo = 0, id = 0, vivo = true;
  const cuadro = (ahora: number) => {
    if (!vivo) return;
    if (ctx.almacen.estado.reproduciendo && previo > 0) ctx.almacen.despachar({ tipo: 'avanzar', msReales: Math.min(100, ahora - previo) });
    previo = ahora;
    id = requestAnimationFrame(cuadro);
  };
  id = requestAnimationFrame(cuadro);
  return () => { vivo = false; cancelAnimationFrame(id); };
}
