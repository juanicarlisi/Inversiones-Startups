// El plan de ejemplo del primer minuto: «Tu 2027». Inventado (el repositorio es público).
// Las fechas salen de hoy, así siempre hay algo alrededor de la línea de hoy: una tarea hecha, dos en curso,
// una que se corrió, fechas clave, hábitos y dos en foco. Se borra con un toque.

import { isoDe, anioDe, mesDe } from './fechas.js';

/** Año del plan: desde octubre ya se piensa en el año que viene. */
export const anioDelEjemplo = (hoy) => (mesDe(hoy) >= 9 ? anioDe(hoy) + 1 : anioDe(hoy));

export function planEjemplo(hoy) {
  const d = (k) => isoDe(hoy + k);
  const T = (id, p, n, s, e, extra = {}) => ({ id, p, n, s: d(s), e: d(e), ty: 'tarea', st: 'todo', star: false, ...extra });
  const H = (id, p, n, k, extra = {}) => ({ id, p, n, s: d(k), e: d(k), ty: 'hito', st: 'todo', star: false, ...extra });
  const R = (id, p, n, s, e) => ({ id, p, n, s: d(s), e: d(e), ty: 'habito', st: 'todo', star: false });
  return {
    ejemplo: true,
    areas: [
      { id: 'ej-a1', n: 'Trabajo', color: '#2f6fed' },
      { id: 'ej-a2', n: 'Estudio', color: '#7c4dff' },
      { id: 'ej-a3', n: 'Casa', color: '#e8860c' },
      { id: 'ej-a4', n: 'Salud y vida', color: '#12a37f' },
    ],
    projects: [
      { id: 'ej-p1', a: 'ej-a1', n: 'Lanzar mi tienda online', dept: 'Proyecto propio' },
      { id: 'ej-p2', a: 'ej-a1', n: 'Clientes del estudio' },
      { id: 'ej-p3', a: 'ej-a2', n: 'Rendir el final de Estadística' },
      { id: 'ej-p4', a: 'ej-a2', n: 'Inglés' },
      { id: 'ej-p5', a: 'ej-a3', n: 'Mudanza' },
      { id: 'ej-p6', a: 'ej-a3', n: 'Pintar el living' },
      { id: 'ej-p7', a: 'ej-a4', n: 'Moverme más' },
      { id: 'ej-p8', a: 'ej-a4', n: 'Vacaciones' },
    ],
    tasks: [
      T('ej-k1', 'ej-p1', 'Elegir qué vender primero', -12, -3, { st: 'done' }),
      T('ej-k2', 'ej-p1', 'Fotos de los productos', -3, 9, { st: 'doing', star: true, note: 'Luz de ventana a la mañana; fondo blanco.' }),
      T('ej-k3', 'ej-p1', 'Armar la tienda y los medios de pago', 10, 31),
      H('ej-k4', 'ej-p1', 'Abrir la tienda', 45),
      T('ej-k5', 'ej-p2', 'Propuesta para el cliente nuevo', -11, -4),
      R('ej-k6', 'ej-p2', 'Facturar a fin de mes', -6, 170),
      H('ej-k7', 'ej-p2', 'Entrega de mitad de año', 120),
      T('ej-k8', 'ej-p3', 'Repasar las unidades 1 a 4', 4, 24),
      T('ej-k9', 'ej-p3', 'Simulacros de examen', 25, 39),
      H('ej-k10', 'ej-p3', 'Final de Estadística', 41, { star: true }),
      R('ej-k11', 'ej-p4', 'Clase martes y jueves', -8, 150),
      H('ej-k12', 'ej-p4', 'Examen de nivel', 118),
      T('ej-k13', 'ej-p5', 'Buscar departamento', -5, 24, { st: 'doing' }),
      T('ej-k14', 'ej-p5', 'Pedir presupuestos de flete', 20, 33),
      H('ej-k15', 'ej-p5', 'Día de la mudanza', 68),
      T('ej-k16', 'ej-p6', 'Comprar pintura y rodillos', 84, 88),
      T('ej-k17', 'ej-p6', 'Pintar', 89, 96),
      R('ej-k18', 'ej-p7', 'Caminar tres veces por semana', -14, 200),
      H('ej-k19', 'ej-p7', 'Turno de control anual', 34),
      T('ej-k20', 'ej-p8', 'Elegir destino', 40, 55),
      T('ej-k21', 'ej-p8', 'Viaje', 75, 89),
    ],
  };
}
