// escena/estilo.ts · Andén simulador, corte 1 · P6 (escena).
// Estilo de las vistas: paleta clara y oscura con LOS MISMOS nombres de color, una forma por estado visual (para que los estados se
// distingan en escala de grises y sin color: corte-1.md §9 P6, diseño maestro §5.10) y las cuentas de contraste WCAG 2.x que usan las
// pruebas. El color fuerte se reserva para estados (rampa llena, dando vuelta, excepción, atrasado); lo demás es neutro.
import { EstadoVisual, type Estilo } from '../contratos/vistas.ts';

/** Forma del glifo de cada estado. Dos estados distintos nunca comparten forma. */
export type Forma =
  | 'cuadrado' | 'circulo' | 'triangulo' | 'rombo' | 'cuadrado-marcado' | 'halo' | 'barra' | 'persona' | 'camion';

export const FORMA_ESTADO: Readonly<Record<EstadoVisual, Forma>> = {
  [EstadoVisual.NORMAL]: 'cuadrado',
  [EstadoVisual.DANDO_VUELTA]: 'circulo',
  [EstadoVisual.EXCEPCION]: 'triangulo',
  [EstadoVisual.ESPERANDO]: 'rombo',
  [EstadoVisual.ATRASADO]: 'cuadrado-marcado',
  [EstadoVisual.SELECCIONADO]: 'halo',
  [EstadoVisual.EN_CAMION]: 'barra',
};

/** Nombre del color de cada estado en `Estilo.colores` (el mismo en los dos temas). */
export const COLOR_ESTADO: Readonly<Record<EstadoVisual, string>> = {
  [EstadoVisual.NORMAL]: 'estadoNormal',
  [EstadoVisual.DANDO_VUELTA]: 'estadoVuelta',
  [EstadoVisual.EXCEPCION]: 'estadoExcepcion',
  [EstadoVisual.ESPERANDO]: 'estadoEsperando',
  [EstadoVisual.ATRASADO]: 'estadoAtrasado',
  [EstadoVisual.SELECCIONADO]: 'estadoSeleccionado',
  [EstadoVisual.EN_CAMION]: 'estadoEnCamion',
};

/** Todos los estados visuales, en orden. */
export const ESTADOS: readonly EstadoVisual[] = [
  EstadoVisual.NORMAL, EstadoVisual.DANDO_VUELTA, EstadoVisual.EXCEPCION, EstadoVisual.ESPERANDO, EstadoVisual.ATRASADO,
  EstadoVisual.SELECCIONADO, EstadoVisual.EN_CAMION,
];

/** Clave i18n del nombre de cada estado (para leyendas y lectores de pantalla). */
export const CLAVE_ESTADO: Readonly<Record<EstadoVisual, string>> = {
  [EstadoVisual.NORMAL]: 'escena.estado.normal',
  [EstadoVisual.DANDO_VUELTA]: 'escena.estado.dandoVuelta',
  [EstadoVisual.EXCEPCION]: 'escena.estado.excepcion',
  [EstadoVisual.ESPERANDO]: 'escena.estado.esperando',
  [EstadoVisual.ATRASADO]: 'escena.estado.atrasado',
  [EstadoVisual.SELECCIONADO]: 'escena.estado.seleccionado',
  [EstadoVisual.EN_CAMION]: 'escena.estado.enCamion',
};

/**
 * Pares de texto y fondo que las vistas y la interfaz pueden usar: todos con contraste ≥ 4,5:1 (WCAG AA para texto). Lo prueba
 * `pruebas/estilo.test.ts` en los dos temas.
 */
export const PARES_TEXTO: readonly (readonly [texto: string, fondo: string])[] = [
  ['texto', 'fondo'], ['textoSuave', 'fondo'], ['texto', 'panel'], ['textoSuave', 'panel'],
  ['etiquetaTexto', 'etiquetaFondo'], ['rotulo', 'fondo'], ['rotulo', 'piso'],
];

/** Superficies sobre las que se dibuja una entidad (el piso, una bandeja del lazo, el tobogán de una rampa). */
export const SUPERFICIES_ENTIDAD: readonly string[] = ['piso', 'bandeja', 'rampa'];

/**
 * Pares de gráfico y fondo que tienen que tener contraste ≥ 3:1 (WCAG 2.1, criterio 1.4.11, contraste de lo que no es texto): cada color
 * de estado y de persona contra cada superficie de entidad, y las marcas de alarma (rampa llena, lazo detenido) y la carga de la rampa
 * contra donde se pintan. Lo prueba `pruebas/estilo.test.ts` en los dos temas.
 */
export const PARES_GRAFICOS: readonly (readonly [grafico: string, fondo: string])[] = [
  ...['estadoNormal', 'estadoVuelta', 'estadoExcepcion', 'estadoEsperando', 'estadoAtrasado', 'estadoSeleccionado', 'estadoEnCamion',
    'persona', 'personaPausa'].flatMap((g) => SUPERFICIES_ENTIDAD.map((f) => [g, f] as const)),
  ['rampaLlena', 'piso'], ['rampaLlena', 'rampa'], ['lazoDetenido', 'piso'], ['rampaCarga', 'rampa'], ['excepcion', 'piso'],
  ['estacion', 'piso'], ['seleccion', 'piso'], ['fantasma', 'piso'],
];

/** Colores de cada tema. Las claves son las mismas en los dos (lo prueba estilo.test.ts). */
const CLARO: Record<string, string> = {
  // superficies y texto
  fondo: '#f4f2ee', piso: '#ebe7df', grilla: '#ddd8ce', panel: '#ffffff',
  texto: '#1f2933', textoSuave: '#52606d', rotulo: '#3e4c59', etiquetaFondo: '#1f2933', etiquetaTexto: '#ffffff',
  // instalaciones (neutras)
  lazo: '#8d97a3', lazoBorde: '#6b7682', lazoDetenido: '#b42318', bandeja: '#d3d8de', bandejaBorde: '#a7b0ba',
  cinta: '#b9b2a6', cintaBorde: '#9a9284', anden: '#5b6470', camion: '#dfe3e8', camionBorde: '#7b8794',
  rampa: '#c3cad2', rampaBorde: '#8d97a3', rampaCarga: '#56698a', rampaLlena: '#b42318',
  jaula: '#9aa4ae', jaulaCarga: '#a8743f', estacion: '#2f3a48', lector: '#3e4c59', excepcion: '#7e22ce',
  acumulacion: '#e2ddd3', acumulacionBorde: '#b9b2a6',
  // estados de las entidades (glifo y sprite)
  estadoNormal: '#8b5e34', estadoVuelta: '#1d4ed8', estadoExcepcion: '#7e22ce', estadoEsperando: '#a35200',
  estadoAtrasado: '#c81e1e', estadoSeleccionado: '#111827', estadoEnCamion: '#475569',
  // personas y camiones
  persona: '#2f3a48', personaPausa: '#a35200', camionEspera: '#a35200',
  // capa de riesgo (escala secuencial de 5 pasos, de nada a casi siempre; monótona en luminancia: se lee también en escala de grises)
  riesgo0: '#f3f4f6', riesgo1: '#fcd34d', riesgo2: '#f59e0b', riesgo3: '#dc2626', riesgo4: '#7f1d1d',
  // fantasma (el otro escenario en la pantalla dividida) y selección
  fantasma: '#1d4ed8', seleccion: '#111827',
};

const OSCURO: Record<string, string> = {
  fondo: '#14181d', piso: '#1a1f26', grilla: '#262c35', panel: '#1f252d',
  texto: '#e5e7eb', textoSuave: '#9aa5b1', rotulo: '#c3cad2', etiquetaFondo: '#e5e7eb', etiquetaTexto: '#14181d',
  lazo: '#56606c', lazoBorde: '#7b8794', lazoDetenido: '#f87171', bandeja: '#3a424d', bandejaBorde: '#56606c',
  cinta: '#4b4f55', cintaBorde: '#6b7076', anden: '#9aa5b1', camion: '#2b323b', camionBorde: '#7b8794',
  rampa: '#343c46', rampaBorde: '#56606c', rampaCarga: '#7d93b2', rampaLlena: '#f87171',
  jaula: '#56606c', jaulaCarga: '#c58a52', estacion: '#c3cad2', lector: '#9aa5b1', excepcion: '#c084fc',
  acumulacion: '#232930', acumulacionBorde: '#4b4f55',
  estadoNormal: '#d9a066', estadoVuelta: '#60a5fa', estadoExcepcion: '#c084fc', estadoEsperando: '#facc15',
  estadoAtrasado: '#f87171', estadoSeleccionado: '#f9fafb', estadoEnCamion: '#94a3b8',
  persona: '#c3cad2', personaPausa: '#facc15', camionEspera: '#facc15',
  riesgo0: '#2b323b', riesgo1: '#78350f', riesgo2: '#b45309', riesgo3: '#ef4444', riesgo4: '#fca5a5',
  fantasma: '#60a5fa', seleccion: '#f9fafb',
};

export const estilos: { claro: Estilo; oscuro: Estilo } = {
  claro: Object.freeze({ tema: 'claro', colores: Object.freeze({ ...CLARO }), reducirMovimiento: false }) as Estilo,
  oscuro: Object.freeze({ tema: 'oscuro', colores: Object.freeze({ ...OSCURO }), reducirMovimiento: false }) as Estilo,
};

/** El mismo estilo con «movimiento reducido» (sin pulso de la selección ni ninguna animación decorativa). */
export function conMovimientoReducido(e: Estilo, reducir: boolean): Estilo {
  return { tema: e.tema, colores: e.colores, reducirMovimiento: reducir };
}

/** Color con nombre del estilo; si falta, avisa con el nombre (un color inexistente pintaría negro sin decir nada). */
export function color(e: Estilo, nombre: string): string {
  const c = e.colores[nombre];
  if (c === undefined) throw new Error(`escena: el estilo «${e.tema}» no tiene el color «${nombre}».`);
  return c;
}

/** Paso (0–4) de la escala de riesgo de una probabilidad en [0, 1]: nunca · < 1 de 10 · 1 a 3 · 3 a 6 · 6 o más noches de cada 10. */
export function nivelRiesgo(p: number): 0 | 1 | 2 | 3 | 4 {
  if (!(p > 0)) return 0;
  if (p < 0.1) return 1;
  if (p < 0.3) return 2;
  if (p < 0.6) return 3;
  return 4;
}
/** Escala de riesgo: probabilidad en [0, 1] → nombre del color (5 pasos). */
export function colorRiesgo(p: number): string {
  return `riesgo${nivelRiesgo(p)}`;
}
/** Clave i18n de la leyenda del paso de riesgo de una probabilidad ('escena.riesgo.nivel0' … 'nivel4'). */
export function claveRiesgo(p: number): string {
  return `escena.riesgo.nivel${nivelRiesgo(p)}`;
}

// ---- Contraste (WCAG 2.x) ----

/** '#rrggbb' o '#rgb' → [r, g, b] en 0–255. */
export function rgb(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`escena: color inválido «${hex}» (se esperaba #rrggbb).`);
  let h = m[1];
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lineal(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Luminancia relativa WCAG (0 negro, 1 blanco). Es lo que ve alguien en escala de grises. */
export function luminancia(hex: string): number {
  const [r, g, b] = rgb(hex);
  return 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b);
}

/** Relación de contraste WCAG entre dos colores (1 a 21). */
export function contraste(a: string, b: string): number {
  const la = luminancia(a), lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Mezcla lineal en sRGB de dos colores (f = 0 → a, f = 1 → b), para sombras de las caras de los sprites. */
export function mezclar(a: string, b: string, f: number): string {
  const x = rgb(a), y = rgb(b);
  const c = (i: number) => Math.round(x[i] + (y[i] - x[i]) * f).toString(16).padStart(2, '0');
  return `#${c(0)}${c(1)}${c(2)}`;
}

/** Oscurece (f < 1) un color multiplicando sus canales (caras laterales de una caja en la vista 2,5D). */
export function sombrear(hex: string, f: number): string {
  const [r, g, b] = rgb(hex);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
