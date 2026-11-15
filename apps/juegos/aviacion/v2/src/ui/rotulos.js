// Colocación de rótulos del mundo sin choques. Regla: ningún rótulo se dibuja debajo ni encima de un panel fijo, ninguno se sale
// de la pantalla y dos rótulos nunca se pisan. Algoritmo voraz por prioridad (la base primero, después las ciudades de la misión,
// las que tienen cartas esperando y el resto): cada rótulo prueba sus lugares posibles alrededor de su objeto y se queda con el
// primero libre; si no hay ninguno, no se muestra. Con memoria, para que un rótulo no salte de lugar a cada cuadro.
// Es una función pura (sin DOM): la prueba pruebas/rotulos.test.mjs la corre sin navegador.

// Lugares posibles, en orden de preferencia. Devuelven la esquina de arriba a la izquierda del rótulo.
//   r: ancla { x, y } = punto de arriba del objeto; cx, cy = centro del objeto; rx, ry = su radio en pantalla; w, h = tamaño.
export const LUGARES = [
  (r) => ({ x: r.x - r.w / 2, y: r.y - r.h }),                         // 0 arriba, centrado (el de siempre)
  (r) => ({ x: r.x - r.w * 0.16, y: r.y - r.h }),                      // 1 arriba, corrido a la derecha
  (r) => ({ x: r.x - r.w * 0.84, y: r.y - r.h }),                      // 2 arriba, corrido a la izquierda
  (r) => ({ x: r.cx + r.rx + 6, y: r.cy - r.h / 2 }),                  // 3 a la derecha
  (r) => ({ x: r.cx - r.rx - 6 - r.w, y: r.cy - r.h / 2 }),            // 4 a la izquierda
  (r) => ({ x: r.x - r.w / 2, y: r.cy + r.ry + 6 }),                   // 5 abajo
  (r) => ({ x: r.x - r.w / 2, y: r.y - 2 * r.h - 4 }),                 // 6 arriba, un renglón más alto
  (r) => ({ x: r.cx + r.rx + 6, y: r.cy + r.ry * 0.4 }),               // 7 abajo a la derecha
  (r) => ({ x: r.cx - r.rx - 6 - r.w, y: r.cy + r.ry * 0.4 }),         // 8 abajo a la izquierda
];
const PREFERIDO = { arr: 0, der: 3, izq: 4, aba: 5 };

const choca = (a, b, aire) => a.x0 < b.x1 + aire && a.x1 > b.x0 - aire && a.y0 < b.y1 + aire && a.y1 > b.y0 - aire;
const dentro = (p, c) => p.x >= c.x0 && p.x <= c.x1 && p.y >= c.y0 && p.y <= c.y1;

// rotulos: [{ id, x, y, cx, cy, rx, ry, w, h, prio, pref? ('arr'|'der'|'izq'|'aba'), lugares? (índices permitidos), solido? }]
//   solido: el objeto del rótulo (una ciudad) tampoco se tapa con el rótulo de otro, mientras haya otro lugar.
// obstaculos: [{ x0, y0, x1, y1 }] (los paneles fijos); vista: { W, H }; memoria: Map que guarda el lugar de cada rótulo.
// Devuelve Map id → { x, y, lugar } (los que no entran no están en el mapa).
// ahora: el reloj en milisegundos (para la memoria); paciencia: cuánto tiene que llevar libre un lugar mejor para mudarse a él.
export function colocar(rotulos, obstaculos, vista, memoria = new Map(), { aire = 3, borde = 3, paciencia = 450, ahora = Date.now() } = {}) {
  const puestos = [], salida = new Map();
  const orden = [...rotulos].sort((a, b) => b.prio - a.prio || (a.id < b.id ? -1 : 1));
  const objetos = orden.filter((r) => r.solido).map((r) => ({ id: r.id, x0: r.cx - r.rx, x1: r.cx + r.rx, y0: r.cy - r.ry * 1.3, y1: r.cy + r.ry }));
  // libre: no se sale de la pantalla ni pisa un panel ni otro rótulo; limpio: además no tapa la ciudad de otro
  const libre = (c) => {
    if (c.x0 < borde || c.y0 < borde || c.x1 > vista.W - borde || c.y1 > vista.H - borde) return false;
    for (const o of obstaculos) if (choca(c, o, aire)) return false;
    for (const p of puestos) if (choca(c, p, aire)) return false;
    return true;
  };
  const limpio = (c, id) => { for (const o of objetos) if (o.id !== id && choca(c, o, 0)) return false; return true; };
  const caja = (r, i) => { const p = LUGARES[i](r); return { x0: p.x, y0: p.y, x1: p.x + r.w, y1: p.y + r.h }; };
  for (const r of orden) {
    const centro = { x: r.cx, y: r.cy };
    // un objeto tapado por un panel (o fuera de la pantalla) no lleva rótulo
    if (r.cx < 0 || r.cy < 0 || r.cx > vista.W || r.cy > vista.H || obstaculos.some((o) => dentro(centro, o))) { memoria.delete(r.id); continue; }
    const permitidos = r.lugares ?? LUGARES.map((_, i) => i);
    const pref = PREFERIDO[r.pref];
    // orden de prueba: arriba, el lado sugerido para esa ciudad y después el resto
    const lista = [...new Set([0, ...(pref != null ? [pref] : []), ...permitidos])].filter((i) => permitidos.includes(i));
    const cajas = lista.map((i) => ({ lugar: i, c: caja(r, i) })).filter((x) => libre(x.c));
    const limpias = cajas.filter((x) => limpio(x.c, r.id));
    const buenas = limpias.length ? limpias : cajas; // si todos los lugares libres tapan una ciudad, peor es no mostrarlo
    const m = memoria.get(r.id);
    let elegido = buenas[0] ?? null;
    const actual = m && buenas.find((x) => x.lugar === m.lugar);
    if (actual && elegido && actual !== elegido) {
      // se queda donde estaba; se muda a un lugar mejor solo si ese lleva un rato libre (así no titila entre dos lugares)
      m.desde ??= ahora;
      if (ahora - m.desde <= paciencia) elegido = actual;
    } else if (m) m.desde = null;
    if (!elegido) { memoria.delete(r.id); continue; }
    if (!m || m.lugar !== elegido.lugar) memoria.set(r.id, { lugar: elegido.lugar, desde: null });
    puestos.push(elegido.c);
    salida.set(r.id, { x: elegido.c.x0, y: elegido.c.y0, lugar: elegido.lugar });
  }
  for (const id of [...memoria.keys()]) if (!salida.has(id)) memoria.delete(id);
  return salida;
}
