// app/i18n/formato.ts · Andén simulador, corte 1 · P8 (interfaz).
// Números, porcentajes, moneda, horas y duraciones con el formato de cada idioma (es-AR primero). Escrito a mano y sin Intl para que
// el texto sea el mismo en Node, Chromium, Firefox y Safari (Intl depende de los datos de ICU de cada uno).
//   es: 1.234,5 · 12,5% · $ 1.234 · 00:30 · «1 h 05 min» · «45 s»
//   en: 1,234.5 · 12.5% · ARS 1,234 · 00:30 · «1 h 05 min» · «45 s»
import type { Formato } from '../../contratos/i18n.ts';
import type { Idioma } from '../../contratos/tipos-base.ts';

const SEPARADORES: Record<Idioma, { miles: string; decimal: string }> = {
  es: { miles: '.', decimal: ',' },
  en: { miles: ',', decimal: '.' },
};
/** Signo menos tipográfico (U+2212): se lee «menos» en los lectores de pantalla y no se confunde con un guion. */
export const MENOS = '−';

/** Decimales «automáticos»: enteros sin decimales; si no, unas tres cifras significativas (hasta 4 decimales). */
export function decimalesAuto(x: number): number {
  const a = Math.abs(x);
  if (Number.isInteger(x) || a >= 100) return 0;
  if (a >= 10) return 1;
  if (a >= 1) return 2;
  if (a === 0) return 0;
  return Math.min(4, Math.max(0, 2 - Math.floor(Math.log10(a))));
}

function agrupar(entero: string, sep: string): string {
  let r = '';
  for (let i = 0; i < entero.length; i++) {
    if (i > 0 && (entero.length - i) % 3 === 0) r += sep;
    r += entero[i];
  }
  return r;
}

/** Número con separadores del idioma. `decimales` fijo, o automático (y sin ceros sobrantes) si no se da. */
export function numeroEn(idioma: Idioma, x: number, decimales?: number): string {
  if (Number.isNaN(x)) return '—';
  if (!Number.isFinite(x)) return x > 0 ? '∞' : `${MENOS}∞`;
  const auto = decimales === undefined;
  const d = auto ? decimalesAuto(x) : Math.max(0, Math.min(10, Math.floor(decimales)));
  let s = Math.abs(x).toFixed(d);
  if (auto && s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  const negativo = x < 0 && Number(s) !== 0;
  const [entero, fraccion] = s.split('.');
  const { miles, decimal } = SEPARADORES[idioma];
  return (negativo ? MENOS : '') + agrupar(entero, miles) + (fraccion ? decimal + fraccion : '');
}

/** HH:MM de un instante en ms (módulo 24: las 24:30 del modelo se leen 00:30). Redondea hacia abajo, como segAHora. */
export function horaDeMs(ms: number): string {
  if (!Number.isFinite(ms)) return '—';
  const min = Math.floor(ms / 60000);
  const hh = (((Math.floor(min / 60)) % 24) + 24) % 24;
  const mm = ((min % 60) + 60) % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Duración legible: «45 s» por debajo del minuto, «12 min» por debajo de la hora y «1 h 05 min» desde ahí. */
export function duracionDeMs(ms: number): string {
  if (!Number.isFinite(ms)) return '—';
  if (ms < 0) return MENOS + duracionDeMs(-ms);
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
}

export function crearFormato(idioma: Idioma): Formato {
  const numero = (x: number, decimales?: number) => numeroEn(idioma, x, decimales);
  return {
    idioma,
    numero,
    porcentaje: (x: number, decimales = 0) => (Number.isFinite(x) ? `${numeroEn(idioma, x * 100, decimales)}%` : '—'),
    moneda: (x: number, moneda: 'ARS' | 'USD') => {
      if (!Number.isFinite(x)) return '—';
      const d = Math.abs(x) < 100 && !Number.isInteger(x) ? 2 : 0;
      const v = numeroEn(idioma, Math.abs(x), d);
      const signo = x < 0 && v.replace(/[^1-9]/g, '') !== '' ? MENOS : '';
      if (idioma === 'es') return signo + (moneda === 'ARS' ? `$ ${v}` : `US$ ${v}`);
      return signo + (moneda === 'ARS' ? `ARS ${v}` : `US$${v}`);
    },
    hora: horaDeMs,
    duracion: duracionDeMs,
  };
}
