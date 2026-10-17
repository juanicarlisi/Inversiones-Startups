// Balance: un jugador automático simple juega los capítulos y mide cuántos minutos reales tarda cada misión.
// Uso: node herramientas/balance.mjs [semilla]
import * as M from '../js/modelo.js';
import { AEROPUERTOS, MISIONES } from '../js/datos.js';
const s = M.nuevoEstado(Number(process.argv[2] ?? 1));
const minReales = () => (s.tTotal ?? 0) / M.MIN_POR_SEG / 60;
const log = [];
function jugar() {
  const m = M.misionActual(s);
  if (m?.tipo === 'ruta') M.abrirRuta(s, m.a, m.b);
  // expandir hacia el aeropuerto desbloqueado más cercano a la red
  const nodos = M.red(s).nodos;
  let mejor = null;
  const meta = m?.tipo === 'conectada' ? m.ciudad : null;
  const puntaje = (n, a, d) => (meta ? M.km(a, meta) * 3 : 0) + d;
  for (const a of AEROPUERTOS) if (a.cap <= s.cap && !M.enRed(s, a.id)) for (const n of (nodos.length ? nodos : ['BUE'])) {
    const p = M.puedeAbrirRuta(s, n, a.id);
    if (p.ok && (!mejor || puntaje(n, a.id, p.km) < mejor.p)) mejor = { n, a: a.id, km: p.km, p: puntaje(n, a.id, p.km) };
  }
  if (mejor && s.dinero > M.costoRuta(mejor.n, mejor.a) + 25000 * s.cap ** 2) M.abrirRuta(s, mejor.n, mejor.a);
  for (const r of s.rutas) {
    const avs = s.aviones.filter((a) => a.ruta === r.id);
    const tipos = M.avionesDisponibles(s).filter((t) => t.alcance >= r.km).sort((x, y) => y.precio - x.precio);
    const t = tipos[0];
    if (t && (avs.length === 0 || (r.ocup > 0.8 && avs.length < 6 && r.ingresos > r.costos)) && s.dinero > t.precio * 1.2) M.comprarAvion(s, t.id, r.id);
    if (s.cap === 1 && !r.balizas && s.dinero > M.costoBalizas(r) * 2) M.ponerBalizas(s, r.id);
  }
  for (const ap of nodos) if (M.enTransbordo(s, ap) > M.capacidadTransbordo(s, ap) * 2) M.mejorarTransbordo(s, ap);
}
const DEBUG = process.env.DEBUG;
for (let h = 0; h < 24 * 400; h++) {
  if (DEBUG && h % (24 * 10) === 0) console.log("día", h / 24, "dinero", Math.round(s.dinero), "rutas", s.rutas.map((r) => `${r.id}:${s.aviones.filter((a) => a.ruta === r.id).length}av ${Math.round((r.ingresos - r.costos) / 1000)}k ocup${r.ocup.toFixed(2)}`).join(" "));
  jugar();
  for (let i = 0; i < 60 / M.PASO; i++) {
    for (const e of M.paso(s)) {
      if (e.tipo === 'mision') log.push(`${minReales().toFixed(1).padStart(6)} min  cap ${s.cap}  ${e.id.padEnd(16)} dinero ${Math.round(s.dinero)}  rutas ${s.rutas.length}  aviones ${s.aviones.length}  día ${Math.round(M.gananciaDia(s))}`);
      if (e.tipo === 'capitulo') { if (!M.avanzarCapitulo(s).ok) { console.log(log.join('\n')); console.log('fin del juego'); process.exit(0); } }
    }
    s.tTotal = (s.tTotal ?? 0) + M.PASO;
  }
}
console.log(log.join('\n'));
console.log('sin terminar', M.misionActual(s)?.id, Math.round(M.progreso(s, M.misionActual(s))), '/', M.misionActual(s)?.meta, 'dinero', Math.round(s.dinero), 'perdidas', s.stats.perdidas);
