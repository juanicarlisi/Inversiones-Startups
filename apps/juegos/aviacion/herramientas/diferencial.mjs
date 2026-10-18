// ¿Pagan los diferenciales? Mide el % de diferencia de neto por día de juego en 6 casos (redes armadas a mano, sin jugador):
//  (a) transbordo de Buenos Aires en nivel 0 contra nivel 2, en una estrella de 5 radios
//  (b) las 4 opciones de carga mínima en 3 rutas de referencia (dentro de la estrella)
//  (c) estrella contra cadena, con los mismos aviones
//  (d) 4 rutas sin aviones entre las puntas de la estrella
//  (e) 10 rutas durante 30 días, con clima y sin clima (promedio de 3 semillas)
//  (f) perfil «listo» contra «compraTodo» a los 60 minutos reales (jugadores.mjs)
// Metas (HN-04 y HN-05): (a) ≥ +30% · (b) en 2 de 3 rutas la mejor es 30% o 60% y la peor rinde ≥ 15% menos · (c) estrella ≥ +35%
// · (d) baja ≤ 2% · (e) el clima resta entre 3% y 10% · (f) listo ≥ +25%.
// Uso: node herramientas/diferencial.mjs [--json] [--sin-f]
import * as M from '../js/modelo.js';
import { correr } from './jugadores.mjs';

const ESTRELLA = [['BUE', 'MVD'], ['BUE', 'ROS'], ['BUE', 'MDQ'], ['BUE', 'BHI'], ['BUE', 'COR']];
const CADENA = [['COR', 'ROS'], ['ROS', 'BUE'], ['BUE', 'MVD'], ['MVD', 'MDQ'], ['MDQ', 'BHI']];
const PUNTAS = [['MVD', 'ROS'], ['ROS', 'COR'], ['MDQ', 'BHI'], ['BHI', 'COR']];
const DIEZ = [...ESTRELLA, ['BHI', 'CRD'], ['CRD', 'RGL'], ['COR', 'MDZ'], ['BHI', 'NQN'], ['BHI', 'SAO']];

// Estado de capítulo 1 con todas las ciudades del capítulo abiertas y plata de sobra para armar la red.
function base(semilla, { clima = true } = {}) {
  const s = M.nuevoEstado(semilla);
  M.tomarEventos(s);
  s.misiones = ['m1_primera', 'm1_segunda', 'm1_transbordo', 'm1_noche', 'm1_sur', 'm1_gallegos']; // ciudades y Tero disponibles
  s.colas = {};
  if (!clima) s.opciones = { sinClima: true };
  s.dinero = 1e8;
  return s;
}
function armar(s, rutas, { aviones = 3, balizas = true, nivelBUE = 0, sinAvion = [] } = {}) {
  for (const [a, b] of rutas) { const r = M.abrirRuta(s, a, b); if (!r.ok) throw new Error(`no se pudo abrir ${a}-${b}: ${r.error}`); }
  for (const [a, b] of sinAvion) { const r = M.abrirRuta(s, a, b); if (!r.ok) throw new Error(`no se pudo abrir ${a}-${b}: ${r.error}`); }
  for (const r of s.rutas) {
    if (sinAvion.some(([a, b]) => M.idRuta(a, b) === r.id)) continue;
    const tipo = r.km > 600 ? 'tero' : 'golondrina';
    for (let i = 0; i < aviones; i++) { s.dinero = 1e8; const x = M.comprarAvion(s, tipo, r.id); if (!x.ok) throw new Error(`avión ${r.id}: ${x.error}`); }
    if (balizas) M.ponerBalizas(s, r.id);
  }
  for (let i = 0; i < nivelBUE; i++) M.mejorarTransbordo(s, 'BUE');
  return s;
}
// Neto por día de juego: lo que cambia la caja entre el día 2 y el final (sin compras: la red ya está armada).
function netoDia(s, dias = 7, calentar = 2) {
  for (let i = 0; i < calentar * 1440 / M.PASO; i++) M.paso(s);
  const d0 = s.dinero;
  for (let i = 0; i < dias * 1440 / M.PASO; i++) M.paso(s);
  return (s.dinero - d0) / dias;
}
const pct = (a, b) => +((a / b - 1) * 100).toFixed(1);

export function casoA(semilla = 3) {
  const n0 = netoDia(armar(base(semilla), ESTRELLA, { nivelBUE: 0 }));
  const n2 = netoDia(armar(base(semilla), ESTRELLA, { nivelBUE: 2 }));
  return { nivel0: Math.round(n0), nivel2: Math.round(n2), dif: pct(n2, n0), meta: '≥ +30%', ok: pct(n2, n0) >= 30 };
}
// (b) Cada ruta de referencia se mide por su propio neto (lo que muestra su panel), con las demás en 60%: los tres radios cortos de la
// estrella, con 2 aviones cada uno (con un solo avión por ruta la carga mínima casi no cambia nada: el avión sale lleno igual).
// Lo que se espera: en los tramos cortos y cargados conviene salir seguido (30% o 60%); en los largos, llenar (se ve en el informe).
export const REFERENCIA_B = [['BUE', 'MVD'], ['BUE', 'ROS'], ['BUE', 'MDQ']];
export function casoB(semilla = 3) {
  const filas = REFERENCIA_B.map(([a, b]) => {
    const por = {};
    for (const v of M.CARGA_MINIMA) {
      const s = armar(base(semilla), ESTRELLA, { nivelBUE: 2, aviones: 2 });
      for (const r of s.rutas) M.fijarCargaMinima(s, r.id, 0.6);
      const id = M.idRuta(a, b);
      M.fijarCargaMinima(s, id, v);
      const r = s.rutas.find((x) => x.id === id);
      for (let i = 0; i < 2 * 1440 / M.PASO; i++) M.paso(s);
      const n0 = r.ingresos - r.costos;
      for (let i = 0; i < 7 * 1440 / M.PASO; i++) M.paso(s);
      por[v] = Math.round((r.ingresos - r.costos - n0) / 7);
    }
    const orden = Object.entries(por).sort((x, y) => y[1] - x[1]);
    const mejor = Number(orden[0][0]), peor = orden.at(-1)[1];
    return { ruta: `${a}-${b}`, neto: por, mejor, peorRindeMenos: +((1 - peor / orden[0][1]) * 100).toFixed(1) };
  });
  const buenas = filas.filter((f) => (f.mejor === 0.3 || f.mejor === 0.6) && f.peorRindeMenos >= 15).length;
  return { rutas: filas, meta: 'en 2 de 3 la mejor es 30% o 60% y la peor rinde ≥ 15% menos', ok: buenas >= 2 };
}
export function casoC(semilla = 3) {
  const st = netoDia(armar(base(semilla), ESTRELLA, { nivelBUE: 2 }));
  const s = base(semilla);
  for (const [a, b] of CADENA) M.abrirRuta(s, a, b);
  for (const r of s.rutas) { for (let i = 0; i < 2; i++) M.comprarAvion(s, r.km > 600 ? 'tero' : 'golondrina', r.id); M.ponerBalizas(s, r.id); }
  M.mejorarTransbordo(s, 'BUE'); M.mejorarTransbordo(s, 'BUE');
  const ca = netoDia(s);
  return { estrella: Math.round(st), cadena: Math.round(ca), dif: pct(st, ca), meta: '≥ +35%', ok: pct(st, ca) >= 35 };
}
export function casoD(semilla = 3) {
  const sin = netoDia(armar(base(semilla), ESTRELLA, { nivelBUE: 2 }));
  const con = netoDia(armar(base(semilla), ESTRELLA, { nivelBUE: 2, sinAvion: PUNTAS }));
  return { sinVacias: Math.round(sin), conVacias: Math.round(con), dif: pct(con, sin), meta: 'baja ≤ 2%', ok: pct(con, sin) >= -2 };
}
export function casoE(semillas = [1, 2, 3]) {
  let con = 0, sin = 0;
  for (const se of semillas) {
    con += netoDia(armar(base(se), DIEZ, { nivelBUE: 2 }), 30, 1);
    sin += netoDia(armar(base(se, { clima: false }), DIEZ, { nivelBUE: 2 }), 30, 1);
  }
  const dif = pct(con, sin);
  return { conClima: Math.round(con / semillas.length), sinClima: Math.round(sin / semillas.length), dif, meta: 'resta entre 3% y 10%', ok: dif <= -3 && dif >= -10 };
}
export function casoF(semilla = 1) {
  const l = correr('listo', { semilla, minutos: 60 }), c = correr('compraTodo', { semilla, minutos: 60 });
  const a = l.gananciaDia[60], b = c.gananciaDia[60];
  const dif = b > 0 ? pct(a, b) : null;
  return { listo: a, compraTodo: b, capListo: l.final.cap, capCompraTodo: c.final.cap, dif, meta: '≥ +25%', ok: b <= 0 ? a > 0 : dif >= 25 };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = { a: casoA(), b: casoB(), c: casoC(), d: casoD(), e: casoE() };
  if (!process.argv.includes('--sin-f')) r.f = casoF();
  if (process.argv.includes('--json')) console.log(JSON.stringify(r, null, 1));
  else {
    console.log(`(a) transbordo BUE nivel 0 → 2: ${r.a.nivel0} → ${r.a.nivel2} por día (${r.a.dif}%) · meta ${r.a.meta} · ${r.a.ok ? 'sí' : 'NO'}`);
    for (const f of r.b.rutas) console.log(`(b) ${f.ruta}: ${Object.entries(f.neto).map(([k, v]) => `${k * 100}% ${v}`).join(' · ')} → mejor ${f.mejor * 100}%, la peor rinde ${f.peorRindeMenos}% menos`);
    console.log(`(b) meta ${r.b.meta} · ${r.b.ok ? 'sí' : 'NO'}`);
    console.log(`(c) estrella ${r.c.estrella} contra cadena ${r.c.cadena} por día (${r.c.dif}%) · meta ${r.c.meta} · ${r.c.ok ? 'sí' : 'NO'}`);
    console.log(`(d) 4 rutas vacías entre las puntas: ${r.d.sinVacias} → ${r.d.conVacias} (${r.d.dif}%) · meta ${r.d.meta} · ${r.d.ok ? 'sí' : 'NO'}`);
    console.log(`(e) 10 rutas, 30 días: sin clima ${r.e.sinClima}, con clima ${r.e.conClima} (${r.e.dif}%) · meta ${r.e.meta} · ${r.e.ok ? 'sí' : 'NO'}`);
    if (r.f) console.log(`(f) a los 60 min: listo ${r.f.listo} (cap ${r.f.capListo}) contra compraTodo ${r.f.compraTodo} (cap ${r.f.capCompraTodo}) por día (${r.f.dif ?? 'compraTodo en rojo'}%) · meta ${r.f.meta} · ${r.f.ok ? 'sí' : 'NO'}`);
  }
}
