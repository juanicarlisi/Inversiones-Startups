// Balance de la historia con las reglas v1: el perfil novato (y los otros, para comparar) en las semillas 1 a 3.
// Imprime minutos reales por capítulo, primer cobro, hueco máximo sin novedad en la primera hora, rondas y contratos.
// Metas (HN-10, perfil novato): capítulo 1 en 8–12 min, capítulo 2 en 15–20, capítulo 3 en 30–45; ninguna sequía de más de 5 min
// en la primera hora; el banco del hub (ronda) disponible antes del minuto 12.
// Compuertas del chip (HN-32, perfil soloChip, a ×1): a los 30 min gana por día entre 0,6 y 0,9 veces lo del listo; termina el
// capítulo 1 en 12 min o menos y la historia en 75 o menos; las ventas «que sobra» son menos del 5% de las compras y no vende aviones
// con menos de 2 días; en los primeros 5 min (con el «×3» de verdad) nunca pasa más de 60 s sin una acción útil; ningún perfil se
// traba 5 min en una misión.
// Uso: node herramientas/balance.mjs [semilla] [--perfiles novato,listo] [--minutos 110] [--chip] [--json]
//      sin semilla: también las compuertas del chip; con --chip, solo las compuertas.
import { correr, informe } from './jugadores.mjs';

export function filaBalance(perfil, semilla, minutos = 110) {
  const r = informe(correr(perfil, { semilla, minutos }));
  const cap = (n) => r.minPorCapitulo.find((c) => c.cap === n)?.min ?? null;
  const hueco = (desde, hasta) => { let antes = desde, h = 0; for (const n of r.novedades) { if (n.min < desde) continue; if (n.min > hasta) break; h = Math.max(h, n.min - antes); antes = n.min; } return +Math.max(h, Math.min(hasta, r.final.min) - antes).toFixed(1); };
  const fin2 = r.capitulos[1]?.min ?? 60;
  return { perfil, semilla, cap1: cap(1), cap2: cap(2), cap3: cap(3), historia: r.capitulos[2]?.min ?? null, primerCobro: r.primerCobro,
    huecoHora1: r.huecoMaxNovedad, huecoCap12: hueco(0, Math.min(60, fin2)), huecoCap3: r.capitulos[1] ? hueco(fin2, r.capitulos[2]?.min ?? r.final.min) : null,
    bancoListo: r.bancoListo, rondas: r.rondas, contratos: r.contratos, trabadas: r.trabadas.map((t) => t.id).join(' ') || '-',
    mision: r.final.mision, gd60: r.gananciaDia[60] ?? null };
}

// Las compuertas del chip. Devuelve las corridas y, por compuerta, el valor medido y si pasa.
export function compuertasChip(semillas = [1, 2, 3]) {
  const chip = semillas.map((semilla) => ({ semilla, r: correr('soloChip', { semilla, minutos: 80, velMax: 1 }) }));
  const listo = semillas.map((semilla) => ({ semilla, r: correr('listo', { semilla, minutos: 31 }) }));
  const rapido = semillas.map((semilla) => ({ semilla, r: correr('soloChip', { semilla, minutos: 6 }) })); // con el «×3» de verdad
  const gd = (x) => x.r.gananciaDia[30] ?? 0;
  const razones = chip.map((x, i) => +(gd(x) / Math.max(1, gd(listo[i]))).toFixed(2));
  const razonMedia = +(chip.reduce((a, x) => a + gd(x), 0) / Math.max(1, listo.reduce((a, x) => a + gd(x), 0))).toFixed(2);
  const cap1 = chip.map((x) => x.r.minPorCapitulo[0]?.min ?? null), historia = chip.map((x) => x.r.capitulos[2]?.min ?? null);
  const sobra = chip.map((x) => +(x.r.ventasSobra / Math.max(1, x.r.comprasTotal) * 100).toFixed(1));
  const jovenes = chip.reduce((a, x) => a + x.r.ventasJovenes, 0);
  const util = rapido.map((x) => x.r.sinAccionUtil5min);
  const trabadas = [...chip, ...listo].flatMap((x) => x.r.trabadas.map((t) => `${x.r.perfil}/${x.semilla}:${t.id}`));
  const c = {
    razon30: { valor: razones, media: razonMedia, meta: '0,6 a 0,9 (media de las semillas)', ok: razonMedia >= 0.6 && razonMedia <= 0.9 },
    capitulo1: { valor: cap1, meta: '≤ 12 min', ok: cap1.every((v) => v != null && v <= 12) },
    historia: { valor: historia, meta: '≤ 75 min', ok: historia.every((v) => v != null && v <= 75) },
    ventasSobra: { valor: sobra, meta: '< 5% de las compras', ok: sobra.every((v) => v < 5) },
    ventasJovenes: { valor: jovenes, meta: '0 aviones con menos de 2 días', ok: jovenes === 0 },
    sinAccionUtil: { valor: util, meta: '≤ 60 s en los primeros 5 min (×3 incluido)', ok: util.every((v) => v <= 60) },
    trabadas: { valor: trabadas, meta: 'ningún perfil 5 min trabado (soloChip y listo)', ok: !trabadas.length },
  };
  return { compuertas: c, ok: Object.values(c).every((x) => x.ok) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
  const semillaSola = process.argv[2] && /^\d+$/.test(process.argv[2]) ? [Number(process.argv[2])] : null;
  const soloChip = process.argv.includes('--chip');
  const json = process.argv.includes('--json');
  const filas = [];
  if (!soloChip) {
    const perfiles = arg('perfiles', 'novato').split(','), minutos = Number(arg('minutos', 110));
    for (const perfil of perfiles) for (const semilla of semillaSola ?? [1, 2, 3]) filas.push(filaBalance(perfil, semilla, minutos));
  }
  const chip = soloChip || !semillaSola ? compuertasChip(semillaSola ?? [1, 2, 3]) : null;
  if (json) console.log(JSON.stringify({ filas, chip }, null, 1));
  else {
    if (filas.length) {
      const cols = ['perfil', 'semilla', 'cap1', 'cap2', 'cap3', 'historia', 'primerCobro', 'huecoHora1', 'huecoCap12', 'huecoCap3', 'bancoListo', 'rondas', 'contratos', 'trabadas', 'mision'];
      console.log(cols.join(' | '));
      for (const f of filas) console.log(cols.map((c) => f[c] ?? '—').join(' | '));
    }
    if (chip) {
      console.log(`\nCompuertas del chip (soloChip a ×1, semillas ${(semillaSola ?? [1, 2, 3]).join(', ')}): ${chip.ok ? 'todas pasan' : 'NO pasan todas'}`);
      for (const [k, v] of Object.entries(chip.compuertas)) console.log(`  ${k}: ${JSON.stringify(v.valor)}${v.media != null ? ` (media ${v.media})` : ''} · meta ${v.meta} · ${v.ok ? 'sí' : 'NO'}`);
    }
  }
}
