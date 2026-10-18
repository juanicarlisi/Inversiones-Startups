// Flota: cuánto rinde cada avión por ruta tipo (cuenta analítica con las reglas del modelo, sin azar).
// Por avión y por ruta tipo imprime: ganancia por día por cada $1.000, repago en días de juego y en minutos reales, y ocupación de
// equilibrio (la carga a la que el vuelo, con sus horas en tierra, ni gana ni pierde).
// Supuestos: el avión hace ida y vuelta sin esperar más que su giro; la carga por vuelo es la demanda acumulada en un ciclo (hasta
// su capacidad); vuela 24 h si es nocturno o la ruta tiene balizas, 14 h si no. Las rutas tipo usan la demanda de una ruta real
// de ese largo en el capítulo que corresponde.
// Uso: node herramientas/flota.mjs [--json]
import { AVIONES, CARGAS, ECONOMIA, CAPITULOS } from '../js/datos.js';
import { tarifa, costoCiclo, MIN_POR_SEG } from '../js/modelo.js';

// Demanda por hora y por sentido de cada carga, tomada de rutas reales del juego con la demanda del modelo (y algo de conexiones):
// corto-correo ≈ Buenos Aires–Montevideo/Rosario, largo-correo ≈ Buenos Aires–Córdoba/Bahía Blanca (rutas cargadas),
// corto-pax ≈ Buenos Aires–Rosario/Mar del Plata en 1946, largo-pax ≈ Buenos Aires–Santiago con conexiones, muy-corto-pax ≈ 250 km.
export const RUTAS_TIPO = [
  { id: 'corto-correo', km: 250, cap: 1, demanda: { correo: 9 } },
  { id: 'largo-correo', km: 650, cap: 1, demanda: { correo: 8 } },
  { id: 'corto-pax', km: 450, cap: 2, demanda: { correo: 9, pasajeros: 9 } },
  { id: 'largo-pax', km: 1200, cap: 2, demanda: { correo: 8, pasajeros: 18 } },
  { id: 'muy-corto-pax', km: 250, cap: 2, demanda: { correo: 10, pasajeros: 9 } },
];
// Nicho de cada avión → ruta tipo donde se lo mide contra su par.
const NICHO = { 'corto-correo': 'corto-correo', 'largo-correo': 'largo-correo', 'corto-pasajeros': 'corto-pax', 'largo-pasajeros': 'largo-pax' };

export function rinde(t, rt, { horas = null, lleno = false } = {}) {
  const ciclo = 2 * (rt.km / t.vel + t.giro / 60);              // horas por ida y vuelta
  const hs = horas ?? (t.nocturno || rt.cap >= 2 ? 24 : 14);
  const vuelosDia = 2 * hs / ciclo;
  let ingreso = 0, ingresoLleno = 0, carga = 0, cap = 0;
  for (const [c, n] of Object.entries(t.lleva)) {
    const d = rt.demanda[c] ?? 0;
    const u = lleno ? n : Math.min(n, d * ciclo / 2 * (24 / hs)); // lo que junta mientras va y vuelve (de noche también se junta)
    ingreso += u * tarifa(c, rt.km); ingresoLleno += n * tarifa(c, rt.km); carga += u; cap += n;
  }
  const vuelo = Math.round(rt.km * t.costoKm + t.tripHora * rt.km / t.vel + costoCiclo(t));
  const tierra = t.tierraHora * t.giro / 60 + t.tierraHora * (24 - hs) / vuelosDia; // horas paradas por vuelo
  const porVuelo = ingreso - vuelo - tierra;
  const dia = porVuelo * vuelosDia;
  return { avion: t.id, ruta: rt.id, vuelosDia: +vuelosDia.toFixed(1), ocupacion: +(carga / cap).toFixed(2),
    equilibrio: +((vuelo + tierra) / ingresoLleno).toFixed(2), dia: Math.round(dia), por1000: Math.round(dia / t.precio * 1000),
    repagoDias: dia > 0 ? +(t.precio / dia).toFixed(1) : null, repagoMin: dia > 0 ? +(t.precio / dia * 1440 / MIN_POR_SEG / 60).toFixed(1) : null };
}

export function tabla() {
  const out = [];
  for (const t of AVIONES.filter((x) => x.cap <= 2)) for (const rt of RUTAS_TIPO) {
    if (t.alcance < rt.km || rt.cap < t.cap) continue;
    if (!Object.keys(t.lleva).some((c) => CAPITULOS[rt.cap - 1].cargas[c])) continue;
    out.push({ ...rinde(t, rt), nicho: t.nicho ? `${t.nicho.tramo}-${t.nicho.carga}` : '' });
  }
  return out;
}

// Las metas del diseño (HN-09): el Tero rinde por $1.000 entre 1,3 y 1,8 veces la Golondrina en su nicho, lo mismo el Cauquén
// respecto del Chajá; cada uno es peor fuera de su nicho; el Cauquén pierde plata en tramos de menos de 300 km; la ocupación de
// equilibrio de los 4 queda entre 45% y 70% en su nicho.
export function metas(t = tabla()) {
  const de = (a, r) => t.find((x) => x.avion === a && x.ruta === r);
  const enNicho = AVIONES.filter((x) => x.cap <= 2).map((x) => de(x.id, NICHO[`${x.nicho.tramo}-${x.nicho.carga}`]));
  return {
    teroGolondrina: +(de('tero', 'largo-correo').por1000 / de('golondrina', 'largo-correo').por1000).toFixed(2),
    golondrinaGanaCorto: de('golondrina', 'corto-correo').por1000 > de('tero', 'corto-correo').por1000,
    cauquenChaja: +(de('cauquen', 'largo-pax').por1000 / de('chaja', 'largo-pax').por1000).toFixed(2),
    chajaGanaCorto: de('chaja', 'corto-pax').por1000 > de('cauquen', 'corto-pax').por1000,
    cauquenPierdeCorto: de('cauquen', 'muy-corto-pax').dia < 0,
    equilibrioEnNicho: Object.fromEntries(enNicho.map((x) => [x.avion, x.equilibrio])),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const t = tabla();
  if (process.argv.includes('--json')) console.log(JSON.stringify({ tabla: t, metas: metas(t) }, null, 1));
  else {
    console.log('avión'.padEnd(11), 'ruta tipo'.padEnd(14), 'nicho'.padEnd(16), 'vuelos/día', 'ocup', 'equilibrio', 'neto/día', 'por $1000', 'repago días', 'repago min');
    for (const r of t) console.log(r.avion.padEnd(11), r.ruta.padEnd(14), r.nicho.padEnd(16), String(r.vuelosDia).padStart(10), String(r.ocupacion).padStart(5), String(r.equilibrio).padStart(10),
      String(r.dia).padStart(9), String(r.por1000).padStart(9), String(r.repagoDias ?? '—').padStart(11), String(r.repagoMin ?? '—').padStart(10));
    const m = metas(t);
    console.log('\nmetas: Tero/Golondrina', m.teroGolondrina, '(1,3 a 1,8) · Golondrina gana en corto', m.golondrinaGanaCorto, '· Cauquén/Chajá', m.cauquenChaja,
      '(1,3 a 1,8) · Chajá gana en corto', m.chajaGanaCorto, '· Cauquén pierde en < 300 km', m.cauquenPierdeCorto, '· equilibrio en su nicho', JSON.stringify(m.equilibrioEnNicho), '(0,45 a 0,70)');
  }
}
