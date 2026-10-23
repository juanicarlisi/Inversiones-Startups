// app/estado.ts · Andén simulador, corte 1 · P8 (interfaz).
// Estado de la interfaz: qué pantalla se ve, la reproducción (cabezal, velocidad), la selección, el piso, el tema, las perillas de
// «¿y si…?» y el acto de la presentación. Es puro: `reducir(estado, accion)` devuelve un estado nuevo y nunca toca el anterior, no lee el
// reloj ni el DOM, y se prueba en Node (pruebas/estado.test.ts). Los datos de la corrida (modelo, traza, noches) viven en sesion.ts.
import type { Ms, Idioma } from '../contratos/tipos-base.ts';
import type { ClaseEntidad } from '../contratos/traza.ts';
import type { Piso } from '../contratos/vistas.ts';

export const PANTALLAS = [
  'inicio', 'escena', 'biografia', 'noches', 'ysi', 'decidir', 'comprobante', 'compartir', 'presentar', 'ingeniero',
] as const;
export type Pantalla = (typeof PANTALLAS)[number];
/**
 * Pantallas donde se ve la película de la noche (A): solo ahí tiene sentido avisar que la película cambió sola de noche. La biografía
 * queda atada a la noche con que se abrió, y las demás no muestran película.
 */
export const PANTALLAS_CON_PELICULA: readonly Pantalla[] = ['escena', 'noches', 'ysi', 'presentar'];
export function muestraPelicula(p: Pantalla): boolean { return PANTALLAS_CON_PELICULA.includes(p); }

/** Velocidades de reproducción: ×1 (tiempo real) a ×3.600 (una hora por segundo). ×600 es la de las miniaturas y la presentación. */
export const VELOCIDADES = [1, 10, 60, 600, 3600] as const;
export const VELOCIDAD_INICIAL = 600;
/** Cuánto mueve el cabezal una flecha del teclado (1 min) y una flecha con mayúsculas (15 min). */
export const PASO_TECLADO_MS = 60_000;
export const PASO_TECLADO_LARGO_MS = 900_000;
/** Actos de la presentación (diseño maestro §5.6): «Así es una noche» y los tres actos. */
export const ACTOS = 4;
/** Tope de la pila de «volver». */
export const MAX_HISTORIAL = 20;

export type Tema = 'sistema' | 'claro' | 'oscuro';
export type CualNoche = 'mediana' | 'peor' | 'mejor';
export type Plan = 'por-volumen' | 'contiguas';
export interface Seleccion { clase: ClaseEntidad; id: number }
export interface Aviso { clave: string; vars: Record<string, string | number>; nivel: 'info' | 'error' }

/** Perillas de «¿y si…?»: null = como está en el modelo. */
export interface Perillas {
  puestos: number | null;
  personasRampa: number | null;
  reten: number | null;
  plan: Plan | null;
  /** «Balancear el plan» (corte-1.md §6.7 regla 7): aplica el parche de planBalanceado. */
  balanceado: boolean;
}
export type NombrePerilla = 'puestos' | 'personasRampa' | 'reten' | 'plan';

export interface Estado {
  pantalla: Pantalla;
  historial: Pantalla[];
  tema: Tema;
  idioma: Idioma;
  /** Piso elegido por la persona; null = el que elige la escena midiendo el primer cuadro. */
  piso: Piso | null;
  ingeniero: boolean;
  // reproducción
  inicio: Ms;
  fin: Ms;
  t: Ms;
  velocidad: number;
  reproduciendo: boolean;
  seleccion: Seleccion | null;
  /** Qué noche de las cien se quiere ver. */
  noche: CualNoche;
  perillas: Perillas;
  /** En 360 px la pantalla dividida se alterna: qué lado se ve. */
  lado: 'A' | 'B';
  acto: number;
  anonimizar: boolean;
  aviso: Aviso | null;
}

export type Accion =
  | { tipo: 'ir'; pantalla: Pantalla }
  | { tipo: 'volver' }
  | { tipo: 'tema'; tema: Tema }
  | { tipo: 'idioma'; idioma: Idioma }
  | { tipo: 'piso'; piso: Piso | null }
  | { tipo: 'ingeniero'; activo?: boolean }
  | { tipo: 'cargarNoche'; inicio: Ms; fin: Ms; t?: Ms }
  | { tipo: 'cabezal'; t: Ms }
  | { tipo: 'avanzar'; msReales: number }
  | { tipo: 'saltar'; ms: number }
  | { tipo: 'reproducir' }
  | { tipo: 'pausar' }
  | { tipo: 'alternarReproduccion' }
  | { tipo: 'velocidad'; velocidad: number }
  | { tipo: 'velocidadSiguiente'; sentido: 1 | -1 }
  | { tipo: 'rebobinar' }
  | { tipo: 'seleccionar'; seleccion: Seleccion | null; abrir?: boolean }
  | { tipo: 'elegirNoche'; noche: CualNoche }
  | { tipo: 'perilla'; nombre: NombrePerilla; valor: number | Plan | null }
  | { tipo: 'balancear'; activo: boolean }
  | { tipo: 'reiniciarPerillas' }
  | { tipo: 'lado'; lado?: 'A' | 'B' }
  | { tipo: 'acto'; acto: number }
  | { tipo: 'actoRelativo'; delta: number }
  | { tipo: 'anonimizar'; activo: boolean }
  | { tipo: 'aviso'; aviso: Aviso | null };

export const PERILLAS_VACIAS: Perillas = Object.freeze({ puestos: null, personasRampa: null, reten: null, plan: null, balanceado: false });

export function estadoInicial(o: Partial<Pick<Estado, 'tema' | 'idioma' | 'piso' | 'ingeniero'>> = {}): Estado {
  return {
    pantalla: 'inicio', historial: [], tema: o.tema ?? 'sistema', idioma: o.idioma ?? 'es', piso: o.piso ?? null,
    ingeniero: o.ingeniero ?? false,
    inicio: 0, fin: 0, t: 0, velocidad: VELOCIDAD_INICIAL, reproduciendo: false, seleccion: null, noche: 'mediana',
    perillas: { ...PERILLAS_VACIAS }, lado: 'A', acto: 0, anonimizar: true, aviso: null,
  };
}

export function esPantalla(x: unknown): x is Pantalla {
  return typeof x === 'string' && (PANTALLAS as readonly string[]).includes(x);
}

function acotar(t: number, a: number, b: number): number {
  if (!Number.isFinite(t)) return a;
  return Math.min(b, Math.max(a, Math.round(t)));
}

/** La velocidad permitida más cercana (las intermedias no existen: así la receta es corta y la etiqueta clara). */
export function velocidadValida(v: number): number {
  let mejor: number = VELOCIDADES[0];
  for (const x of VELOCIDADES) if (Math.abs(Math.log(x) - Math.log(Math.max(v, 1e-9))) < Math.abs(Math.log(mejor) - Math.log(Math.max(v, 1e-9)))) mejor = x;
  return mejor;
}

function irA(e: Estado, p: Pantalla): Estado {
  if (p === e.pantalla) return e;
  // ir al inicio vacía la pila: desde ahí no hay a dónde «volver».
  if (p === 'inicio') return { ...e, pantalla: p, historial: [], reproduciendo: false };
  const historial = [...e.historial, e.pantalla].slice(-MAX_HISTORIAL);
  // la presentación arranca siempre en el primer acto
  return { ...e, pantalla: p, historial, acto: p === 'presentar' ? 0 : e.acto };
}

/**
 * Transición pura. Una acción que no cambia nada devuelve el mismo objeto (así las vistas no se redibujan de más). Al cambiar de pantalla,
 * un aviso informativo (copiado, la película cambió de noche) se va: era de la pantalla anterior. Un aviso de error se queda hasta que se
 * cierra o vence (un enlace que no abre avisa y lleva al inicio).
 */
export function reducir(e: Estado, a: Accion): Estado {
  const n = transicion(e, a);
  return n.pantalla !== e.pantalla && n.aviso?.nivel === 'info' && a.tipo !== 'aviso' ? { ...n, aviso: null } : n;
}

function transicion(e: Estado, a: Accion): Estado {
  switch (a.tipo) {
    case 'ir':
      return esPantalla(a.pantalla) ? irA(e, a.pantalla) : e;
    case 'volver': {
      if (e.historial.length === 0) return e.pantalla === 'inicio' ? e : { ...e, pantalla: 'inicio', reproduciendo: false };
      const historial = e.historial.slice(0, -1);
      return { ...e, pantalla: e.historial[e.historial.length - 1], historial };
    }
    case 'tema':
      return a.tema === e.tema ? e : { ...e, tema: a.tema };
    case 'idioma':
      return a.idioma === e.idioma ? e : { ...e, idioma: a.idioma };
    case 'piso':
      return a.piso === e.piso ? e : { ...e, piso: a.piso };
    case 'ingeniero': {
      const activo = a.activo ?? !e.ingeniero;
      return activo === e.ingeniero ? e : { ...e, ingeniero: activo };
    }
    case 'cargarNoche': {
      const inicio = Math.round(a.inicio), fin = Math.max(inicio, Math.round(a.fin));
      return { ...e, inicio, fin, t: acotar(a.t ?? (e.fin > e.inicio ? e.t : inicio), inicio, fin) };
    }
    case 'cabezal': {
      const t = acotar(a.t, e.inicio, e.fin);
      return t === e.t ? e : { ...e, t };
    }
    case 'saltar': {
      const t = acotar(e.t + a.ms, e.inicio, e.fin);
      return t === e.t ? e : { ...e, t };
    }
    case 'avanzar': {
      if (!e.reproduciendo || !(a.msReales > 0)) return e;
      const t = acotar(e.t + a.msReales * e.velocidad, e.inicio, e.fin);
      return t >= e.fin ? { ...e, t: e.fin, reproduciendo: false } : { ...e, t };
    }
    case 'reproducir':
      if (e.fin <= e.inicio) return e;
      // al final, «reproducir» vuelve a empezar
      return { ...e, reproduciendo: true, t: e.t >= e.fin ? e.inicio : e.t };
    case 'pausar':
      return e.reproduciendo ? { ...e, reproduciendo: false } : e;
    case 'alternarReproduccion':
      return transicion(e, { tipo: e.reproduciendo ? 'pausar' : 'reproducir' });
    case 'velocidad': {
      const v = velocidadValida(a.velocidad);
      return v === e.velocidad ? e : { ...e, velocidad: v };
    }
    case 'velocidadSiguiente': {
      const i = (VELOCIDADES as readonly number[]).indexOf(velocidadValida(e.velocidad));
      const j = Math.min(VELOCIDADES.length - 1, Math.max(0, i + a.sentido));
      return reducir(e, { tipo: 'velocidad', velocidad: VELOCIDADES[j] });
    }
    case 'rebobinar':
      return e.t === e.inicio ? e : { ...e, t: e.inicio };
    case 'seleccionar': {
      const igual = (a.seleccion === null && e.seleccion === null) ||
        (a.seleccion !== null && e.seleccion !== null && a.seleccion.clase === e.seleccion.clase && a.seleccion.id === e.seleccion.id);
      const conSel = igual ? e : { ...e, seleccion: a.seleccion ? { clase: a.seleccion.clase, id: a.seleccion.id } : null };
      return a.abrir && a.seleccion ? irA({ ...conSel, reproduciendo: false }, 'biografia') : conSel;
    }
    case 'elegirNoche':
      return a.noche === e.noche ? e : { ...e, noche: a.noche };
    case 'perilla': {
      const v = a.valor;
      if (a.nombre === 'plan') {
        if (v !== null && v !== 'por-volumen' && v !== 'contiguas') return e;
        if (v === e.perillas.plan) return e;
        // elegir un plan a mano deja de lado «balancear»
        return { ...e, perillas: { ...e.perillas, plan: v, balanceado: false } };
      }
      if (v !== null && (typeof v !== 'number' || !Number.isInteger(v) || v < 0)) return e;
      if (v === e.perillas[a.nombre]) return e;
      return { ...e, perillas: { ...e.perillas, [a.nombre]: v } };
    }
    case 'balancear':
      return a.activo === e.perillas.balanceado ? e
        : { ...e, perillas: { ...e.perillas, balanceado: a.activo, plan: a.activo ? null : e.perillas.plan } };
    case 'reiniciarPerillas':
      return { ...e, perillas: { ...PERILLAS_VACIAS }, lado: 'A' };
    case 'lado': {
      const lado = a.lado ?? (e.lado === 'A' ? 'B' : 'A');
      return lado === e.lado ? e : { ...e, lado };
    }
    case 'acto': {
      const acto = Math.min(ACTOS - 1, Math.max(0, Math.floor(a.acto)));
      return acto === e.acto ? e : { ...e, acto };
    }
    case 'actoRelativo':
      return reducir(e, { tipo: 'acto', acto: e.acto + a.delta });
    case 'anonimizar':
      return a.activo === e.anonimizar ? e : { ...e, anonimizar: a.activo };
    case 'aviso':
      return a.aviso === e.aviso ? e : { ...e, aviso: a.aviso };
    default:
      return e;
  }
}

/** ¿Hay alguna perilla movida? */
export function hayCambios(p: Perillas): boolean {
  return p.puestos !== null || p.personasRampa !== null || p.reten !== null || p.plan !== null || p.balanceado;
}

export type Oyente = (nuevo: Estado, anterior: Estado, accion: Accion) => void;
export interface Almacen {
  readonly estado: Estado;
  despachar(a: Accion): void;
  suscribir(f: Oyente): () => void;
}

/** Almacén mínimo: guarda el estado, aplica `reducir` y avisa a los oyentes solo si algo cambió. */
export function crearAlmacen(inicial: Estado): Almacen {
  let actual = inicial;
  const oyentes = new Set<Oyente>();
  return {
    get estado() { return actual; },
    despachar(a) {
      const anterior = actual;
      const nuevo = reducir(anterior, a);
      if (nuevo === anterior) return;
      actual = nuevo;
      for (const f of [...oyentes]) f(nuevo, anterior, a);
    },
    suscribir(f) {
      oyentes.add(f);
      return () => { oyentes.delete(f); };
    },
  };
}
