export const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;
export const DIAS_CORTOS = ["D", "L", "M", "X", "J", "V", "S"] as const;
export const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"] as const;

/** Fecha local como 'AAAA-MM-DD'. */
export function claveDia(d: Date = new Date()): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dd}`;
}

export function sumarDias(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Lunes a domingo de la semana de la fecha dada. */
export function semanaDe(d: Date = new Date()): Date[] {
  const dia = d.getDay(); // 0 = domingo
  const lunes = sumarDias(d, dia === 0 ? -6 : 1 - dia);
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
}

export function diaDelAnio(d: Date = new Date()): number {
  const inicio = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - inicio.getTime()) / 86_400_000);
}

export function saludo(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buen día";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function mmss(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${`${s % 60}`.padStart(2, "0")}`;
}
