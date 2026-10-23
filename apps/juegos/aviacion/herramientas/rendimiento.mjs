// Rendimiento del modelo en node (CPU normal): una red del capítulo 3 con 300 aviones.
// Metas (HN-06): paso() ≤ 4 ms en promedio · simularAusencia de 2 h ≤ 200 ms · guardado < 50 KB · guardar, restaurar y simular 1 día
// da el mismo dinero ±1% que sin guardar.
// Uso: node herramientas/rendimiento.mjs [--json]
import * as M from '../js/modelo.js';
import { AEROPUERTOS } from '../js/datos.js';

export function redGrande(semilla = 1, aviones = 300) {
  const s = M.nuevoEstado(semilla);
  M.tomarEventos(s);
  s.cap = 3; s.misiones = ['m1_primera', 'm1_segunda', 'm1_transbordo', 'm1_noche', 'm1_sur', 'm1_gallegos', 'm1_caja', 'm2_pax', 'm2_andes', 'm2_red', 'm2_caja'];
  s.t0 = Date.UTC(1970, 0, 1, 9, 0) - s.t * 60000; s.colas = {}; s.dinero = 1e12;
  // dos hubs (Buenos Aires y São Paulo) y radios a todo el continente
  for (const a of AEROPUERTOS) {
    if (a.id === 'BUE') continue;
    if (!M.abrirRuta(s, 'BUE', a.id).ok) M.abrirRuta(s, 'SPA', a.id);
  }
  M.abrirRuta(s, 'BUE', 'SPA');
  for (const ap of ['BUE', 'SPA']) for (let i = 0; i < 4; i++) M.mejorarTransbordo(s, ap);
  let i = 0;
  while (s.aviones.length < aviones) {
    const r = s.rutas[i++ % s.rutas.length];
    const t = M.avionesDisponibles(s).filter((x) => x.alcance >= r.km).sort((a, b) => b.precio - a.precio)[0];
    if (t) M.comprarAvion(s, t.id, r.id);
  }
  return s;
}

export function medir() {
  const s = redGrande();
  for (let k = 0; k < 288; k++) M.paso(s); // un día para llenar colas
  const n = 288;
  let t0 = performance.now();
  for (let k = 0; k < n; k++) M.paso(s);
  const msPaso = (performance.now() - t0) / n;
  const texto = M.guardar(s);
  const kb = texto.length / 1024;
  // guardar, restaurar y simular 1 día contra seguir sin guardar
  // la misma partida sigue en memoria (s) y en una copia que pasó por el guardado; se compara lo que ganan en 1 día
  // (se compara la ganancia del día, más exigente que el dinero total: la red armada a mano arranca con caja casi infinita)
  const a = M.restaurar(texto), d0 = s.dinero, a0 = a.dinero;
  for (let k = 0; k < 288; k++) { M.paso(a); M.paso(s); }
  const difDinero = Math.abs((a.dinero - a0) - (s.dinero - d0)) / Math.abs(s.dinero - d0);
  const b = M.restaurar(texto);
  t0 = performance.now();
  const r = M.simularAusencia(b, 2 * 3600);
  const msAusencia = performance.now() - t0;
  return { aviones: s.aviones.length, rutas: s.rutas.length, msPaso: +msPaso.toFixed(2), msAusencia2h: Math.round(msAusencia), minutosSimulados: r.minutos,
    guardadoKB: +kb.toFixed(1), partes: Object.fromEntries(Object.entries(JSON.parse(texto)).map(([k, v]) => [k, +(JSON.stringify(v).length / 1024).toFixed(1)]).filter(([, v]) => v >= 0.5)), difDineroTrasGuardar: +(difDinero * 100).toFixed(3),
    metas: { paso: msPaso <= 4, ausencia: msAusencia <= 200, guardado: kb < 50, guardarRestaurar: difDinero <= 0.01 } };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = medir();
  if (process.argv.includes('--json')) console.log(JSON.stringify(r, null, 1));
  else console.log(`${r.aviones} aviones, ${r.rutas} rutas · paso ${r.msPaso} ms · ausencia de 2 h ${r.msAusencia2h} ms (${r.minutosSimulados} min de juego) · guardado ${r.guardadoKB} KB ${JSON.stringify(r.partes)} · guardar/restaurar/1 día: ganancia ±${r.difDineroTrasGuardar}% · metas ${JSON.stringify(r.metas)}`);
}
