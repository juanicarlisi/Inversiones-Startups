// Protocolo idéntico para los tres motores: 5000 cajas que se mueven (matriz recalculada en JS cada cuadro), un piso, una luz direccional
// con sombra de 2048, la misma cámara; cuadros sincrónicos (readPixels de 1 píxel) como en la escena del laboratorio.
export const N = 5000, W = 960, H = 540;
export function rng(seed = 123456789) { let s = seed; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export function cajas(n = N) { const r = rng(); const a = []; for (let i = 0; i < n; i++) a.push({ x: -34 + r() * 68, z: -20 + r() * 40, y: 0.1 + (r() < 0.5 ? 0 : 0.2), v: 0.6 + r() * 1.2, yaw: r() * 6.283 }); return a; }
export function publicar(gl, actualizar, dibujar, canvas) {
  const px = new Uint8Array(4); let t = 6;
  window.__lab = { listo: true, error: null, dibujar: () => { actualizar(t); dibujar(); },
    medir: async (frames = 4, calentar = 2, dt = 1 / 60) => { const ms = [], js = []; const t00 = performance.now(); actualizar(t); dibujar(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const primer = performance.now() - t00;
      for (let k = 0; k < calentar + frames; k++) { await new Promise((r) => setTimeout(r, 0)); const a = performance.now(); t += dt; actualizar(t); dibujar(); const b = performance.now(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const c = performance.now(); if (k >= calentar) { ms.push(c - a); js.push(b - a); } }
      const s = [...ms].sort((x, y) => x - y), ss = [...js].sort((x, y) => x - y); const med = (v) => v[(v.length / 2) | 0];
      return { frames: ms.length, primer_cuadro_ms: primer, ms_media: ms.reduce((x, y) => x + y, 0) / ms.length, ms_mediana: med(s), ms_p95: s[Math.floor(s.length * 0.95)], ms_min: s[0], js_mediana_ms: med(ss) }; } };
}
