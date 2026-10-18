// app/ui/paleta.ts · Andén simulador, corte 1 · P8 (interfaz).
// El Estilo que la interfaz le pasa a crearVista. El contrato de Servicios no trae los estilos de la escena (NOTAS-CONTRATO.md §3):
// si la integración los agrega (`estilos` en ServiciosApp) se usan esos; si no, esta paleta de respaldo, con LOS MISMOS nombres de color
// que usa escena/estilo.ts (la vista real lanza si falta uno), para que la escena se vea igual con cualquiera de las dos.
import type { Estilo } from '../../contratos/vistas.ts';

const CLARO: Record<string, string> = {
  fondo: '#f4f2ee', piso: '#ebe7df', grilla: '#ddd8ce', panel: '#ffffff',
  texto: '#1f2933', textoSuave: '#52606d', rotulo: '#3e4c59', etiquetaFondo: '#1f2933', etiquetaTexto: '#ffffff',
  lazo: '#8d97a3', lazoBorde: '#6b7682', lazoDetenido: '#b42318', bandeja: '#d3d8de', bandejaBorde: '#a7b0ba',
  cinta: '#b9b2a6', cintaBorde: '#9a9284', anden: '#5b6470', camion: '#dfe3e8', camionBorde: '#7b8794',
  rampa: '#c3cad2', rampaBorde: '#8d97a3', rampaCarga: '#56698a', rampaLlena: '#b42318',
  jaula: '#9aa4ae', jaulaCarga: '#a8743f', estacion: '#2f3a48', lector: '#3e4c59', excepcion: '#7e22ce',
  acumulacion: '#e2ddd3', acumulacionBorde: '#b9b2a6',
  estadoNormal: '#8b5e34', estadoVuelta: '#1d4ed8', estadoExcepcion: '#7e22ce', estadoEsperando: '#a35200',
  estadoAtrasado: '#c81e1e', estadoSeleccionado: '#111827', estadoEnCamion: '#475569',
  persona: '#2f3a48', personaPausa: '#a35200', camionEspera: '#a35200',
  riesgo0: '#f3f4f6', riesgo1: '#fcd34d', riesgo2: '#f59e0b', riesgo3: '#dc2626', riesgo4: '#7f1d1d',
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

export const ESTILOS_RESPALDO: { claro: Estilo; oscuro: Estilo } = {
  claro: { tema: 'claro', colores: CLARO, reducirMovimiento: false },
  oscuro: { tema: 'oscuro', colores: OSCURO, reducirMovimiento: false },
};

/** Estilo para un tema, con «movimiento reducido» si el sistema lo pide. */
export function estiloPara(tema: 'claro' | 'oscuro', reducirMovimiento: boolean,
  estilos: { claro: Estilo; oscuro: Estilo } = ESTILOS_RESPALDO): Estilo {
  const e = estilos[tema];
  return { tema: e.tema, colores: e.colores, reducirMovimiento };
}

/** Escala de riesgo de 5 pasos (la misma que la escena): nunca · < 1 de 10 · 1 a 3 · 3 a 6 · 6 o más noches de cada 10. */
export function nivelDeRiesgo(p: number): 0 | 1 | 2 | 3 | 4 {
  if (!(p > 0)) return 0;
  if (p < 0.1) return 1;
  if (p < 0.3) return 2;
  if (p < 0.6) return 3;
  return 4;
}
