// Balance de la historia con las reglas v1: el perfil novato (y los otros, para comparar) en las semillas 1 a 3.
// Imprime minutos reales por capítulo, primer cobro, hueco máximo sin novedad en la primera hora, rondas y contratos.
// Metas (HN-10, perfil novato): capítulo 1 en 8–12 min, capítulo 2 en 15–20, capítulo 3 en 30–45; ninguna sequía de más de 5 min
// en la primera hora; el banco del hub (ronda) disponible antes del minuto 12.
// Uso: node herramientas/balance.mjs [semilla] [--perfiles novato,listo] [--minutos 110]
import { correr, informe } from './jugadores.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const semillaSola = process.argv[2] && /^\d+$/.test(process.argv[2]) ? [Number(process.argv[2])] : null;
const perfiles = arg('perfiles', 'novato').split(',');
const minutos = Number(arg('minutos', 110));
const filas = [];
for (const perfil of perfiles) for (const semilla of semillaSola ?? [1, 2, 3]) {
  const r = informe(correr(perfil, { semilla, minutos }));
  const cap = (n) => r.minPorCapitulo.find((c) => c.cap === n)?.min ?? null;
  const hueco = (desde, hasta) => { let antes = desde, h = 0; for (const n of r.novedades) { if (n.min < desde) continue; if (n.min > hasta) break; h = Math.max(h, n.min - antes); antes = n.min; } return +Math.max(h, Math.min(hasta, r.final.min) - antes).toFixed(1); };
  const fin1 = r.capitulos[0]?.min ?? 60, fin2 = r.capitulos[1]?.min ?? 60;
  filas.push({ perfil, semilla, cap1: cap(1), cap2: cap(2), cap3: cap(3), historia: r.capitulos[2]?.min ?? null, primerCobro: r.primerCobro,
    huecoHora1: r.huecoMaxNovedad, huecoCap12: hueco(0, Math.min(60, fin2)), huecoCap3: r.capitulos[1] ? hueco(fin2, r.capitulos[2]?.min ?? r.final.min) : null,
    bancoListo: r.bancoListo, rondas: r.rondas, contratos: r.contratos, trabadas: r.trabadas.map((t) => t.id).join(' ') || '-',
    mision: r.final.mision, gd60: r.gananciaDia[60] ?? null });
}
if (process.argv.includes('--json')) console.log(JSON.stringify(filas, null, 1));
else {
  const cols = ['perfil', 'semilla', 'cap1', 'cap2', 'cap3', 'historia', 'primerCobro', 'huecoHora1', 'huecoCap12', 'huecoCap3', 'bancoListo', 'rondas', 'contratos', 'trabadas', 'mision'];
  console.log(cols.join(' | '));
  for (const f of filas) console.log(cols.map((c) => f[c] ?? '—').join(' | '));
}
