// Atlas de sprites dibujado con las MISMAS siluetas del juego (copia de silueta() de js/render.js, que no la exporta).
// Lo usan las variantes optimizadas (Pixi y canvas 2D con sprites) para no dibujar vectores ni sombras por avión y por cuadro.
export const PALETAS = { // copia de js/render.js (capítulos 1-3)
  1: { mar: '#a9c7c9', mar2: '#8fb3b8', tierra: '#efe3c2', borde: '#b9a57a', costa: '#8c7a55', ruta: '#7a4b2a', texto: '#3d2c1c', hub: '#a2361d', avion: '#3d2c1c' },
  2: { mar: '#9cc3d6', mar2: '#7eabc4', tierra: '#e8e4d2', borde: '#a9a58c', costa: '#6f7d74', ruta: '#24527a', texto: '#1f2b33', hub: '#c0392b', avion: '#1f2b33' },
  3: { mar: '#a6cfe6', mar2: '#86b8d8', tierra: '#f2f1ec', borde: '#c5c3b8', costa: '#8e9aa3', ruta: '#1565c0', texto: '#1b2430', hub: '#e04f2a', avion: '#1b2430' },
};
export const FORMAS = ['biplano', 'mono', 'bimotor', 'cuatrimotor', 'jet', 'carguero'];
const VARIANTES = ['dia', 'noche', 'sel'];

export function silueta(ctx, forma, L) {
  const flecha = forma === 'jet' || forma === 'carguero';
  ctx.beginPath(); ctx.ellipse(0, 0, L, L * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  if (flecha) { ctx.moveTo(L * 0.25, 0); ctx.lineTo(-L * 0.3, -L * 0.95); ctx.lineTo(-L * 0.5, -L * 0.95); ctx.lineTo(-L * 0.2, 0); ctx.lineTo(-L * 0.5, L * 0.95); ctx.lineTo(-L * 0.3, L * 0.95); ctx.closePath(); }
  else { ctx.rect(L * 0.02, -L * 1.0, L * 0.3, L * 2.0); if (forma === 'biplano') ctx.rect(-L * 0.18, -L * 0.9, L * 0.22, L * 1.8); }
  ctx.moveTo(-L * 0.7, 0); ctx.lineTo(-L * 0.95, -L * 0.38); ctx.lineTo(-L * 1.02, -L * 0.38); ctx.lineTo(-L * 0.92, 0);
  ctx.lineTo(-L * 1.02, L * 0.38); ctx.lineTo(-L * 0.95, L * 0.38); ctx.closePath();
  ctx.fill();
  if (forma === 'bimotor' || forma === 'cuatrimotor') {
    for (const y of forma === 'bimotor' ? [-0.45, 0.45] : [-0.35, -0.7, 0.35, 0.7]) { ctx.beginPath(); ctx.ellipse(L * 0.3, L * y, L * 0.14, L * 0.07, 0, 0, 7); ctx.fill(); }
  }
}

// Devuelve { canvas, marcos } con marcos[nombre] = {x,y,w,h} en píxeles del atlas. sc = píxeles de atlas por píxel lógico.
export function crearAtlas(pal, sc = 2) {
  const CELDA = 32, cols = 6, filas = VARIANTES.length + 2; // la última fila aloja el resplandor (alto 56 px lógicos)
  const c = document.createElement('canvas'); c.width = CELDA * cols * sc; c.height = CELDA * filas * sc;
  const g = c.getContext('2d'); const marcos = {};
  VARIANTES.forEach((v, fi) => FORMAS.forEach((f, ci) => {
    const x = ci * CELDA * sc, y = fi * CELDA * sc;
    g.save(); g.translate(x + CELDA * sc / 2, y + CELDA * sc / 2); g.scale(sc, sc);
    g.shadowColor = v === 'noche' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)'; g.shadowBlur = 3 * sc; // la sombra no escala con la transformación
    g.fillStyle = v === 'sel' ? pal.hub : v === 'noche' ? '#e8edf5' : pal.avion;
    silueta(g, f, 10);
    g.restore();
    marcos[`${f}.${v}`] = { x, y, w: CELDA * sc, h: CELDA * sc };
  }));
  // fila de abajo: punto (r=3), resplandor de ciudad (radio 28)
  const y = VARIANTES.length * CELDA * sc;
  g.fillStyle = '#fff'; g.beginPath(); g.arc(8 * sc, y + 8 * sc, 3 * sc, 0, 7); g.fill();
  marcos.punto = { x: 5 * sc, y: y + 5 * sc, w: 6 * sc, h: 6 * sc };
  const R = 28 * sc, gx = 2 * CELDA * sc, gy = y;
  const gr = g.createRadialGradient(gx + R, gy + R, 0, gx + R, gy + R, R);
  gr.addColorStop(0, 'rgba(255,220,140,1)'); gr.addColorStop(1, 'rgba(255,220,140,0)'); // el color de las luces de ciudad va horneado
  g.fillStyle = gr; g.fillRect(gx, gy, R * 2, R * 2);
  marcos.brillo = { x: gx, y: gy, w: R * 2, h: R * 2 };
  return { canvas: c, marcos, sc };
}
