// contratos/tipos-base.ts · Andén simulador, corte 1 · CONGELADO: se cambia solo en el paquete de integración.
/** Tiempo del motor: milisegundos enteros (exactos en float64 hasta 2^53 ms ≈ 285.000 años). */
export type Ms = number;
/** Segundos: la unidad de tiempo de los modelos (anden.modelo/1). */
export type Seg = number;
export const MS_POR_SEG = 1000;
/** Única conversión de segundos del modelo a ms del motor. Regla fija de redondeo: Math.round. */
export function aMs(s: Seg): Ms {
  return Math.round(s * MS_POR_SEG);
}
/** «HH:MM» con HH de 00 a 47. «30:00» son las 06:00 del día siguiente al que empieza el turno. */
export type Hora = string;
export function horaASeg(h: Hora): Seg {
  const m = /^(\d{2}):(\d{2})$/.exec(h);
  if (!m) throw new Error(`hora inválida: ${h}`);
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh > 47 || mm > 59) throw new Error(`hora fuera de rango: ${h}`);
  return hh * 3600 + mm * 60;
}
export function segAHora(s: Seg): Hora {
  const m = Math.floor(s / 60);
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
/** Igual que segAHora pero sin módulo 24 (formato Hora del modelo: «24:30» son las 00:30 del día siguiente). */
export function segAHoraLarga(s: Seg): Hora {
  const m = Math.floor(s / 60);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
/** Fases dentro del mismo instante: urgente (paradas, ausencias, interrupciones) → normal → tardía (medición y observación). */
export const Fase = { URGENTE: 0, NORMAL: 1, TARDIA: 2 } as const;
export type Fase = (typeof Fase)[keyof typeof Fase];
/** Etiquetas de evidencia (doctrina/02-estandares-de-evidencia.md) más el dato que trae el usuario. */
export type Etiqueta = 'HECHO' | 'MEDIDO' | 'ESTIMACION' | 'HIPOTESIS' | 'SUPUESTO' | 'DATO_USUARIO';
export type Idioma = 'es' | 'en';
