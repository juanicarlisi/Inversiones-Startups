// Fechas como «número de día» (días desde 1970-01-01 en UTC). Así no hay horas, husos ni cambios de horario
// que corran una barra un día. Las fechas se guardan como texto ISO «AAAA-MM-DD».

export const DIA = 864e5;

/** «2027-03-05» → número de día. */
export const dn = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / DIA;
};

/** Número de día → «2027-03-05». */
export const isoDe = (n) => new Date(n * DIA).toISOString().slice(0, 10);

/** Hoy según el reloj del dispositivo (fecha local, no UTC). */
export const hoyLocal = (ahora = new Date()) =>
  Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()) / DIA;

/** ¿Es una fecha ISO válida y existente? («2027-02-30» no lo es). */
export const esISO = (s) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const n = dn(s);
  return Number.isFinite(n) && isoDe(n) === s;
};

const fecha = (n) => new Date(n * DIA);
/** 0 = domingo … 6 = sábado. */
export const diaSemana = (n) => fecha(n).getUTCDay();
/** Lunes de la semana del día n. */
export const inicioSemana = (n) => n - ((diaSemana(n) + 6) % 7);
export const inicioMes = (n) => {
  const d = fecha(n);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) / DIA;
};
export const finMes = (n) => {
  const d = fecha(n);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0) / DIA;
};
export const diaDelMes = (n) => fecha(n).getUTCDate();
export const mesDe = (n) => fecha(n).getUTCMonth();
export const anioDe = (n) => fecha(n).getUTCFullYear();
/** Día n del mes m (0-11) del año a. */
export const dia = (a, m, d) => Date.UTC(a, m, d) / DIA;

// Textos en español rioplatense. Intl agrega un punto a los meses abreviados («dic.»): se saca.
const fCorta = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const fMesAnio = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const fMesCorto = new Intl.DateTimeFormat('es-AR', { month: 'short', timeZone: 'UTC' });
const fLarga = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const mayus = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** «3 dic» */
export const fechaCorta = (n) => fCorta.format(fecha(n)).replace('.', '');
/** «Diciembre de 2026» */
export const mesAnio = (n) => mayus(fMesAnio.format(fecha(n)));
/** «Dic» */
export const mesCorto = (n) => mayus(fMesCorto.format(fecha(n)).replace('.', ''));
/** «martes 3 de diciembre» */
export const fechaLarga = (n) => fLarga.format(fecha(n));

/** «1 día» / «12 días» */
export const dias = (k) => `${k} ${k === 1 ? 'día' : 'días'}`;
