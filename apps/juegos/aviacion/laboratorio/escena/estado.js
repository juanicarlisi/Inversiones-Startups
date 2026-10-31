// Estado de prueba: la red grande del capítulo 3 con 300 aviones, armada con el modelo REAL del juego (js/modelo.js, solo lectura).
// Copia de redGrande() de herramientas/rendimiento.mjs sin las partes de node, para correr en el navegador.
import * as M from '../../js/modelo.js';
import { AEROPUERTOS } from '../../js/datos.js';

export function redGrande(semilla = 1, aviones = 300) {
  const s = M.nuevoEstado(semilla);
  M.tomarEventos(s);
  s.cap = 3; s.misiones = ['m1_primera', 'm1_segunda', 'm1_transbordo', 'm1_noche', 'm1_sur', 'm1_gallegos', 'm1_caja', 'm2_pax', 'm2_andes', 'm2_red', 'm2_caja'];
  s.t0 = Date.UTC(1970, 0, 1, 9, 0) - s.t * 60000; s.colas = {}; s.dinero = 1e12;
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

// Deja la partida a una hora de la noche (22:00) para que el cuadro tenga luces, y con aviones repartidos en vuelo.
export function escenaNoche() {
  const s = redGrande();
  for (const r of s.rutas) M.ponerBalizas(s, r.id); // balizas en todas las rutas: la prueba es de noche, con luces a lo largo de cada ruta
  // la hora del juego sale de s.t0 + s.t (minutos); se avanza hasta las 22:00 y se deja correr un rato para repartir aviones
  let guardia = 0;
  while (M.hora(s) < 21.5 && guardia++ < 3000) M.paso(s);
  for (let k = 0; k < 24; k++) M.paso(s);
  return s;
}
export { M };
