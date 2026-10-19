// app/arrancar.ts · Andén simulador, corte 1 · P8 (interfaz).
// La cáscara de la aplicación: arma el estado, la sesión y el traductor, monta y desmonta las pantallas, aplica el tema (claro, oscuro o
// el del sistema) y el idioma, abre el enlace que trae la página (#…), maneja «volver» (también el botón atrás del navegador y Escape),
// muestra los avisos y registra el service worker (PWA local). La integración la llama con los servicios reales:
//   arrancar(servicios, document.getElementById('app')!)
// y entrada-falsa.ts la llama con los servicios falsos para desarrollar y para las pruebas de humo.
import type { Servicios } from '../contratos/servicios.ts';
import type { Diccionario } from '../contratos/i18n.ts';
import type { Idioma } from '../contratos/tipos-base.ts';
import type { Piso } from '../contratos/vistas.ts';
import type { ModeloValidado } from '../contratos/modelo.ts';
import type { ServiciosApp } from './extras.ts';
import type { Contexto, Montar } from './contexto.ts';
import { crearAlmacen, estadoInicial, type Pantalla, type Tema } from './estado.ts';
import { Sesion, type Origen } from './sesion.ts';
import { crearFormato } from './i18n/formato.ts';
import { crearTraductor, type Traductor } from './i18n/traducir.ts';
import { diccionariosDeTodos } from './i18n/diccionarios.ts';
import { estiloPara } from './ui/paleta.ts';
import { el, escuchar, limpiezas } from './ui/dom.ts';
import { montarInicio } from './pantallas/inicio.ts';
import { montarEscena } from './pantallas/escena.ts';
import { montarBiografia } from './pantallas/biografia.ts';
import { montarNoches } from './pantallas/noches.ts';
import { montarYsi } from './pantallas/ysi.ts';
import { montarDecidir } from './pantallas/decidir.ts';
import { montarComprobante } from './pantallas/comprobante.ts';
import { montarCompartir } from './pantallas/compartir.ts';
import { montarPresentar } from './pantallas/presentar.ts';
import { montarIngeniero } from './pantallas/ingeniero.ts';

export const MONTAJES: Record<Pantalla, Montar> = {
  inicio: montarInicio, escena: montarEscena, biografia: montarBiografia, noches: montarNoches, ysi: montarYsi, decidir: montarDecidir,
  comprobante: montarComprobante, compartir: montarCompartir, presentar: montarPresentar, ingeniero: montarIngeniero,
};

export interface OpcionesArranque {
  /** Diccionarios ya juntados (por defecto, los textos.*.json de todos los paquetes: i18n/diccionarios.ts). */
  diccionarios?: Record<Idioma, Diccionario>;
  /** Registrar el service worker (por defecto sí, si el navegador lo tiene y la página se sirve por http o https). */
  pwa?: boolean;
  /** Expone window.__anden (almacén, sesión, servicios, claves faltantes) para las pruebas. */
  depuracion?: boolean;
  /** Idioma inicial (si no, el guardado o español). */
  idioma?: Idioma;
}

const CLAVE_PREFS = 'anden.preferencias';
interface Preferencias { tema?: Tema; idioma?: Idioma; piso?: Piso | null }
function leerPrefs(): Preferencias {
  try { const x = JSON.parse(localStorage.getItem(CLAVE_PREFS) ?? '{}'); return x && typeof x === 'object' ? x as Preferencias : {}; } catch { return {}; }
}
function guardarPrefs(p: Preferencias): void {
  try { localStorage.setItem(CLAVE_PREFS, JSON.stringify(p)); } catch { /* sin almacenamiento: no pasa nada */ }
}

export function arrancar(servicios: Servicios, raiz: HTMLElement, opciones: OpcionesArranque = {}): void {
  const S = servicios as ServiciosApp;
  const prefs = leerPrefs();
  const temaGuardado = prefs.tema === 'claro' || prefs.tema === 'oscuro' || prefs.tema === 'sistema' ? prefs.tema : 'sistema';
  const idiomaInicial: Idioma = opciones.idioma ?? (prefs.idioma === 'en' ? 'en' : 'es');
  const almacen = crearAlmacen(estadoInicial({ tema: temaGuardado, idioma: idiomaInicial, piso: prefs.piso === '2d' || prefs.piso === 'iso' ? prefs.piso : null }));
  const sesion = new Sesion(S, almacen);
  const diccionarios = opciones.diccionarios ?? diccionariosDeTodos();
  let traductor: Traductor = crearTraductor(diccionarios, idiomaInicial, crearFormato(idiomaInicial));
  let formato = crearFormato(idiomaInicial);
  const mqOscuro = matchMedia('(prefers-color-scheme: dark)');
  const mqReducir = matchMedia('(prefers-reduced-motion: reduce)');
  const mqAncho = matchMedia('(min-width: 900px)');
  const temaResuelto = (): 'claro' | 'oscuro' => {
    const t = almacen.estado.tema;
    return t === 'sistema' ? (mqOscuro.matches ? 'oscuro' : 'claro') : t;
  };

  // ---- cáscara ----
  const narrador = el('div', { class: 'visualmente-oculto', 'aria-live': 'polite', 'data-narrador': '' });
  const avisos = el('div', { class: 'avisos', role: 'status', 'aria-live': 'polite' });
  const contenido = el('main', { class: 'contenido', id: 'contenido' });
  const cabecera = el('header', { class: 'barra' });
  raiz.replaceChildren(el('a', { class: 'saltar', href: '#contenido', 'data-accion': 'saltar' }), cabecera, contenido, avisos, narrador);
  raiz.classList.add('app');

  const ctx: Contexto = {
    servicios: S, almacen, sesion,
    t: (clave, vars) => traductor.t(clave, vars),
    get f() { return formato; },
    get traductor() { return traductor; },
    estilo: () => estiloPara(temaResuelto(), mqReducir.matches, S.estilos),
    temaResuelto,
    reducirMovimiento: () => mqReducir.matches,
    esAncho: () => mqAncho.matches,
    ir: (p) => almacen.despachar({ tipo: 'ir', pantalla: p }),
    avisar: (clave, vars = {}, nivel = 'info') => almacen.despachar({ tipo: 'aviso', aviso: { clave, vars, nivel } }),
    narrar: (texto) => { narrador.textContent = ''; setTimeout(() => { narrador.textContent = texto; }, 30); },
    abrirPlantilla: async (clave, destino = 'escena') => {
      const m = S.plantillas[clave];
      if (!m) { ctx.avisar('app.enlace.plantillaDesconocida', { plantilla: clave }, 'error'); return; }
      const c = await S.compilar(m);
      if (!c.ok) { ctx.avisar('app.enlace.invalido', { detalle: c.diagnosticos[0]?.codigo ?? '' }, 'error'); return; }
      const [id, version] = clave.split('@');
      abrirModelo(c.mv, { tipo: 'plantilla', clave, plantilla: { id, version }, parche: [] }, null);
      try {
        history.replaceState(history.state, '', `#${await S.codec.codificar({ tipo: 'plantilla', plantilla: { id, version }, parche: [] })}`);
        hashVisto = location.hash;
      } catch { /* sin historial */ }
      ctx.ir(destino);
    },
    abrirFragmento: async (fragmento) => {
      const r = await S.codec.decodificar(fragmento);
      if (!r.ok) {
        ctx.avisar(`modelo.enlace.${r.error}`, {}, 'error');
        ctx.ir('inicio');
        return false;
      }
      const e = r.enlace;
      try {
        if (e.tipo === 'receta') { ctx.avisar('app.enlace.soloReceta', {}, 'error'); ctx.ir('inicio'); return false; }
        if (e.tipo === 'plantilla') {
          const clave = `${e.plantilla.id}@${e.plantilla.version}`, m = S.plantillas[clave];
          if (!m) { ctx.avisar('modelo.enlace.plantilla-desconocida', {}, 'error'); ctx.ir('inicio'); return false; }
          const c = await S.compilar(m);
          if (!c.ok) throw new Error(c.diagnosticos[0]?.codigo ?? 'plantilla');
          const mv = e.parche.length ? await S.variante(c.mv, e.parche) : c.mv;
          abrirModelo(mv, { tipo: 'plantilla', clave, plantilla: e.plantilla, parche: e.parche }, e.receta ?? null);
        } else {
          const c = await S.compilar(e.modelo);
          if (!c.ok) throw new Error(c.diagnosticos[0]?.codigo ?? 'modelo');
          abrirModelo(c.mv, { tipo: 'modelo' }, e.receta ?? null);
        }
        if (e.receta?.vel) almacen.despachar({ tipo: 'velocidad', velocidad: e.receta.vel });
        ctx.ir('escena');
        return true;
      } catch (err) {
        ctx.avisar('app.enlace.invalido', { detalle: err instanceof Error ? err.message : String(err) }, 'error');
        ctx.ir('inicio');
        return false;
      }
    },
  };

  let reproducirAlCargar = false;
  /** Último fragmento (#…) que la app vio, para distinguir «atrás» de «abrir otro enlace». */
  let hashVisto = location.hash;
  const abrirModelo = (mv: ModeloValidado, origen: Origen, receta: Parameters<Sesion['abrir']>[2]) => {
    almacen.despachar({ tipo: 'reiniciarPerillas' });
    almacen.despachar({ tipo: 'seleccionar', seleccion: null });
    almacen.despachar({ tipo: 'pausar' });
    reproducirAlCargar = !mqReducir.matches && receta?.t === undefined;
    sesion.abrir(mv, origen, receta);
  };

  const pintarCabecera = () => {
    const e = almacen.estado;
    const idioma = el('select', { class: 'barra__idioma', 'aria-label': ctx.t('app.barra.idioma'), 'data-accion': 'idioma' },
      el('option', { value: 'es' }, 'ES'), el('option', { value: 'en' }, 'EN'));
    idioma.value = e.idioma;
    idioma.addEventListener('change', () => almacen.despachar({ tipo: 'idioma', idioma: idioma.value === 'en' ? 'en' : 'es' }));
    const siguienteTema: Record<Tema, Tema> = { sistema: 'claro', claro: 'oscuro', oscuro: 'sistema' };
    const nombreTema = ctx.t(`app.tema.${e.tema}`);
    const tema = el('button', { type: 'button', class: 'boton boton--barra boton--tema', 'data-accion': 'tema', title: nombreTema,
      'aria-label': ctx.t('app.barra.temaAria', { tema: nombreTema }), onclick: () => almacen.despachar({ tipo: 'tema', tema: siguienteTema[almacen.estado.tema] }) },
    el('span', { class: 'boton__texto-corto', 'aria-hidden': 'true' }, ctx.t(`app.tema.corto.${e.tema}`)), el('span', { class: 'boton__texto-ancho' }, nombreTema));
    const titulo = el('span', { class: 'barra__modelo' });
    titulo.textContent = sesion.mv && e.pantalla !== 'inicio' ? sesion.mv.modelo.titulo : '';
    cabecera.replaceChildren(
      el('button', { type: 'button', class: 'barra__marca', 'data-accion': 'ir-inicio', 'aria-label': ctx.t('app.barra.inicio'), onclick: () => ctx.ir('inicio') },
        el('span', { class: 'barra__logo', 'aria-hidden': 'true' }), ctx.t('app.nombre')),
      titulo, el('span', { class: 'barra__espacio' }), idioma, tema);
    document.title = sesion.mv && e.pantalla !== 'inicio' ? ctx.t('app.tituloCon', { modelo: sesion.mv.modelo.titulo }) : ctx.t('app.titulo');
  };
  const aplicarTema = () => {
    document.documentElement.dataset.tema = temaResuelto();
    document.documentElement.lang = almacen.estado.idioma === 'en' ? 'en' : 'es-AR';
  };

  // ---- pantallas ----
  let desmontar: (() => void) | null = null;
  const montar = (p: Pantalla) => {
    desmontar?.();
    desmontar = null;
    const seccion = el('section', { class: `pantalla pantalla--${p}`, 'data-pantalla': p, 'aria-labelledby': `titulo-${p}` });
    contenido.replaceChildren(seccion);
    contenido.dataset.pantalla = p;
    try {
      desmontar = MONTAJES[p](seccion, ctx);
    } catch (e) {
      console.error(e);
      seccion.replaceChildren(el('p', { class: 'aviso aviso--error' }, ctx.t('app.error.pantalla', { detalle: e instanceof Error ? e.message : String(e) })));
    }
    const h1 = seccion.querySelector('h1');
    if (h1) { h1.id = `titulo-${p}`; h1.tabIndex = -1; if (document.activeElement && document.activeElement !== document.body) h1.focus({ preventScroll: true }); }
    window.scrollTo?.(0, 0);
    pintarCabecera();
  };

  // ---- avisos ----
  let temporizador: ReturnType<typeof setTimeout> | null = null;
  const pintarAviso = () => {
    const a = almacen.estado.aviso;
    if (temporizador) { clearTimeout(temporizador); temporizador = null; }
    if (!a) { avisos.replaceChildren(); return; }
    avisos.replaceChildren(el('div', { class: `aviso aviso--${a.nivel}`, 'data-aviso': a.clave },
      el('p', null, ctx.t(a.clave, a.vars)),
      el('button', { type: 'button', class: 'boton boton--icono', 'aria-label': ctx.t('app.aviso.cerrar'), 'data-accion': 'cerrar-aviso',
        onclick: () => almacen.despachar({ tipo: 'aviso', aviso: null }) }, '×')));
    temporizador = setTimeout(() => almacen.despachar({ tipo: 'aviso', aviso: null }), a.nivel === 'error' ? 12000 : 5000);
  };

  // ---- historial del navegador: «atrás» = volver ----
  let empujadas = 0, ignorarPop = 0, desdePop = false;
  const L = limpiezas();
  L.sumar(escuchar(window, 'popstate', () => {
    // ir a otro fragmento (#…) también dispara popstate: eso no es «atrás», lo atiende hashchange
    if (location.hash !== hashVisto) { hashVisto = location.hash; return; }
    if (ignorarPop > 0) { ignorarPop--; return; }
    if (empujadas > 0) { empujadas--; desdePop = true; almacen.despachar({ tipo: 'volver' }); desdePop = false; }
  }));

  almacen.suscribir((n, a, accion) => {
    if (n.tema !== a.tema || n.idioma !== a.idioma || n.piso !== a.piso) guardarPrefs({ tema: n.tema, idioma: n.idioma, piso: n.piso });
    if (n.tema !== a.tema) { aplicarTema(); pintarCabecera(); }
    if (n.idioma !== a.idioma) {
      formato = crearFormato(n.idioma);
      traductor = crearTraductor(diccionarios, n.idioma, formato);
      aplicarTema(); montar(n.pantalla);
      return;
    }
    if (n.pantalla !== a.pantalla) {
      if (accion.tipo === 'volver') { if (!desdePop && empujadas > 0) { empujadas--; ignorarPop++; history.back(); } }
      else { try { history.pushState({ anden: n.pantalla }, ''); empujadas++; } catch { /* sin historial */ } }
      montar(n.pantalla);
    }
    if (n.aviso !== a.aviso) pintarAviso();
  });
  sesion.suscribir((tema) => {
    if (tema === 'error' && sesion.ultimoError) ctx.avisar(sesion.ultimoError.clave, sesion.ultimoError.vars, 'error');
    // otro modelo: la pantalla que se ve se vuelve a montar con él (si es la misma pantalla, ir() no la remontaría)
    if (tema === 'modelo') { if (almacen.estado.pantalla !== 'inicio') montar(almacen.estado.pantalla); else pintarCabecera(); }
    if (tema === 'noche' && sesion.noche && reproducirAlCargar) { reproducirAlCargar = false; almacen.despachar({ tipo: 'reproducir' }); }
  });
  const alCambiarSistema = () => { if (almacen.estado.tema === 'sistema') { aplicarTema(); montar(almacen.estado.pantalla); } };
  mqOscuro.addEventListener('change', alCambiarSistema);
  L.sumar(escuchar(document, 'keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    // la primera Escape sale de la pantalla completa (si el navegador no lo hizo solo); la siguiente, vuelve
    if (document.fullscreenElement) { void document.exitFullscreen().catch(() => {}); return; }
    const t = ev.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    if (almacen.estado.pantalla !== 'inicio') almacen.despachar({ tipo: 'volver' });
  }));
  L.sumar(escuchar(window, 'hashchange', () => { hashVisto = location.hash; const f = location.hash.slice(1); if (f) void ctx.abrirFragmento(f); }));

  aplicarTema();
  montar('inicio');
  const fragmento = location.hash.slice(1);
  if (fragmento) void ctx.abrirFragmento(fragmento);

  const conPwa = opciones.pwa ?? true;
  if (conPwa && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* sin PWA: la app anda igual con red */ });
  }
  if (opciones.depuracion) {
    (window as unknown as { __anden: unknown }).__anden = {
      almacen, sesion, servicios: S, ctx,
      faltantes: () => traductor.faltantes(),
    };
  }
}
