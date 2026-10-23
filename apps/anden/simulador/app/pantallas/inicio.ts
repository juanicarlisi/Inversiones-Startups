// app/pantallas/inicio.ts · Andén simulador, corte 1 · P8 (interfaz). Pantalla 1: inicio.
// Las plantillas como películas (miniaturas vivas en planta a ×600, con nombre de problema), «Abrir un enlace» y «¿Qué tenés que
// decidir?» (diseño maestro §5.4). Con movimiento reducido, las miniaturas quedan quietas en un instante de la noche.
import type { Contexto, Montar } from '../contexto.ts';
import type { Modelo } from '../../contratos/modelo.ts';
import type { Reproductor, Vista } from '../../contratos/vistas.ts';
import { Prioridad } from '../../contratos/experimentos.ts';
import { el, limpiezas } from '../ui/dom.ts';
import { tarjeta } from '../ui/tarjeta.ts';

const VELOCIDAD_MINIATURA = 600;

/** Total de paquetes nominales de un modelo (para la ficha de la plantilla). */
export function paquetesNominales(m: Modelo): number {
  const c = m.demanda.camiones;
  return Array.isArray(c) ? c.reduce((a, x) => a + x.paquetes, 0) : c.cantidad * c.paquetes;
}

/**
 * Los paquetes nominales como los dice el título de la plantilla: si están a menos de 0,2% de un número redondo de miles (23.998 en una
 * plantilla de «24.000 paquetes»), «≈ 24.000»; si no, el número exacto (hallazgo UX-20).
 */
export function paquetesComoTitulo(ctx: Contexto, n: number): string {
  const redondo = Math.round(n / 1000) * 1000;
  if (redondo > 0 && n !== redondo && Math.abs(n - redondo) / redondo < 0.002) return `≈ ${ctx.f.numero(redondo, 0)}`;
  return ctx.f.numero(n, 0);
}

/** Miniatura viva: una noche de la plantilla, en planta, en bucle a ×600. */
function miniatura(ctx: Contexto, clave: string, caja: HTMLElement): () => void {
  let vivo = true, id = 0, vista: Vista | null = null, ro: ResizeObserver | null = null;
  const lienzo = el('canvas', { class: 'miniatura__lienzo', role: 'img', 'aria-label': ctx.t('app.inicio.miniatura') });
  // mientras se simula la noche de la miniatura, se dice qué pasa (no un rectángulo vacío)
  caja.append(lienzo, el('p', { class: 'miniatura__cargando', 'aria-hidden': 'true' }, ctx.t('app.inicio.simulando')));
  (async () => {
    const c = await ctx.servicios.compilar(ctx.servicios.plantillas[clave]);
    if (!vivo || !c.ok) return;
    const semilla = c.mv.modelo.experimento.semilla;
    const salida = await ctx.servicios.noche(c.mv, semilla, 0, Prioridad.VISTA_PREVIA);
    if (!vivo || !salida.traza) return;
    // si después se abre esta plantilla, la primera noche ya está calculada
    ctx.sesion.recordarNoche(c.mv, semilla, 0, salida);
    const r: Reproductor = ctx.servicios.crearReproductor(salida.traza);
    vista = ctx.servicios.crearVista(lienzo, r, ctx.estilo(), '2d');
    const medir = () => { const b = caja.getBoundingClientRect(); vista?.redimensionar(Math.max(10, Math.round(b.width)), Math.max(10, Math.round(b.height)), Math.min(2, devicePixelRatio || 1)); };
    medir();
    ro = new ResizeObserver(medir); ro.observe(caja);
    const dur = r.fin - r.inicio;
    let t = r.inicio + dur * 0.35, previo = 0;
    if (ctx.reducirMovimiento()) { vista.dibujar(t); caja.dataset.listo = '1'; return; }
    const cuadro = (ahora: number) => {
      if (!vivo || !vista) return;
      if (previo) t += (ahora - previo) * VELOCIDAD_MINIATURA;
      previo = ahora;
      if (t >= r.fin) t = r.inicio;
      vista.dibujar(t);
      caja.dataset.listo = '1';
      id = requestAnimationFrame(cuadro);
    };
    id = requestAnimationFrame(cuadro);
  })().catch(() => { caja.dataset.listo = 'error'; });
  return () => { vivo = false; cancelAnimationFrame(id); ro?.disconnect(); vista?.destruir(); };
}

export const montarInicio: Montar = (raiz, ctx) => {
  const L = limpiezas();
  const claves = Object.keys(ctx.servicios.plantillas).sort((a, b) => paquetesNominales(ctx.servicios.plantillas[b]) - paquetesNominales(ctx.servicios.plantillas[a]));
  const tarjetas = claves.map((clave) => {
    const m = ctx.servicios.plantillas[clave], id = clave.split('@')[0];
    const caja = el('div', { class: 'miniatura' });
    L.sumar(miniatura(ctx, clave, caja));
    const problema = ctx.traductor.tiene(`app.plantilla.${id}.problema`) ? ctx.t(`app.plantilla.${id}.problema`) : ctx.t('app.plantilla.generica');
    const tituloModelo = el('p', { class: 'plantilla__modelo' }); tituloModelo.textContent = m.titulo;
    return el('article', { class: 'plantilla', 'data-plantilla': clave },
      caja,
      el('div', { class: 'plantilla__cuerpo' },
        el('h2', { class: 'plantilla__problema' }, problema), tituloModelo,
        el('p', { class: 'plantilla__datos' }, ctx.t('app.inicio.datos', { paquetes: paquetesComoTitulo(ctx, paquetesNominales(m)), rampas: m.hub.rampas.length,
          puestos: m.personas.induccion.puestosActivos })),
        el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': 'abrir-plantilla', 'data-plantilla': clave,
          onclick: () => void ctx.abrirPlantilla(clave) }, ctx.t('app.inicio.verNoche'))));
  });
  // abrir un enlace pegado (todo lo que va después de #, o el enlace entero)
  const campo = el('input', { type: 'url', class: 'campo', id: 'enlace-pegado', placeholder: ctx.t('app.inicio.enlacePista'), 'data-accion': 'enlace-pegado',
    autocomplete: 'off', inputmode: 'url' });
  const abrir = async () => {
    const v = campo.value.trim(); if (!v) return;
    const i = v.indexOf('#');
    await ctx.abrirFragmento(i >= 0 ? v.slice(i + 1) : v);
  };
  campo.addEventListener('keydown', (e) => { if (e.key === 'Enter') void abrir(); });
  const decisiones = claves.filter((c) => ctx.servicios.plantillas[c].decision).map((clave) => {
    const d = ctx.servicios.plantillas[clave].decision!;
    const b = el('button', { type: 'button', class: 'decision-opcion', 'data-accion': 'decidir-plantilla', 'data-plantilla': clave,
      onclick: () => void ctx.abrirPlantilla(clave, 'decidir') });
    // las dos plantillas preguntan lo mismo: la pregunta dice para qué hub (hallazgo UX-20)
    const pregunta = el('span', { class: 'decision-opcion__pregunta' });
    pregunta.textContent = ctx.t('app.inicio.decisionPara', { pregunta: d.pregunta, paquetes: paquetesComoTitulo(ctx, paquetesNominales(ctx.servicios.plantillas[clave])) });
    const plantilla = el('span', { class: 'decision-opcion__plantilla' }); plantilla.textContent = ctx.servicios.plantillas[clave].titulo;
    b.append(pregunta, plantilla);
    return el('li', null, b);
  });
  raiz.append(
    el('header', { class: 'inicio__cabecera' },
      el('h1', { class: 'inicio__titulo' }, ctx.t('app.inicio.titulo')),
      el('p', { class: 'inicio__bajada' }, ctx.t('app.inicio.bajada'))),
    el('div', { class: 'plantillas' }, ...tarjetas),
    el('div', { class: 'inicio__puertas' },
      tarjeta(ctx.t('app.inicio.decidir'), 'inicio__decidir', el('p', { class: 'nota' }, ctx.t('app.inicio.decidirNota')), el('ul', { class: 'decisiones' }, ...decisiones)),
      tarjeta(ctx.t('app.inicio.enlace'), 'inicio__enlace', el('label', { for: 'enlace-pegado', class: 'campo__etiqueta' }, ctx.t('app.inicio.enlaceEtiqueta')),
        el('div', { class: 'fila-campo' }, campo, el('button', { type: 'button', class: 'boton', 'data-accion': 'abrir-enlace', onclick: () => void abrir() }, ctx.t('app.inicio.abrir'))),
        el('p', { class: 'nota' }, ctx.t('app.inicio.enlaceNota')))),
    el('p', { class: 'inicio__pie' }, ctx.t('app.inicio.pie')));
  raiz.dataset.listo = '1';
  return () => L.correr();
};
