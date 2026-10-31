// Punto de entrada: lee parámetros de la URL y expone window.__lab para que Playwright mida y capture.
import { crearEscena } from './escena.js';
const q = new URLSearchParams(location.search);
const num = (k, d) => (q.has(k) ? Number(q.get(k)) : d);
const cfg = {
  w: num('w', 1280), h: num('h', 720), N: num('n', 5000), anim: q.get('anim') || 'gpu', sombras: num('sombras', 2048), ibl: q.get('ibl') || 'hdr',
  ao: q.get('ao') || 'ninguno', aoSamples: num('aoMuestras', 12), aoHalf: q.get('aoMitad') === '1', post: q.get('post') === '1', aa: q.get('aa') || 'ninguno', material: q.get('mat') || 'standard',
  fog: q.get('niebla') !== '0', paquete: q.get('paquete') || 'plano', techo: q.get('techo') || 'si',
};
window.__lab = { listo: false, error: null, cfg };
(async () => {
  try {
    const canvas = document.getElementById('c');
    const esc = await crearEscena(canvas, cfg);
    window.__lab.esc = esc; window.__lab.composicion = esc.composicion;
    if (q.has('u')) esc.recorrido(num('u', 0)); else esc.toma(q.get('toma') || 'general'); esc.tiempo(num('t', 6));
    window.__lab.dibujar = () => esc.dibujar();
    // mide `frames` cuadros con rAF; devuelve ms por cuadro (mediana, p95, media), tiempo JS por cuadro y llamadas de dibujo
    // mide `frames` cuadros SINCRÓNICOS: dibuja y fuerza el fin del trabajo de la GPU (readPixels de 1 píxel) antes de tomar el tiempo.
    // Con WebGL por software el trabajo ocurre en otro proceso; sin esta espera, requestAnimationFrame mide solo el envío.
    const gl = esc.renderer.getContext(); const px = new Uint8Array(4);
    window.__lab.medir = async (frames = 30, calentar = 2, avanza = 1 / 60) => {
      const ms = [], js = []; let t = num('t', 6); const t00 = performance.now();
      esc.tiempo(t); esc.dibujar(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const primer = performance.now() - t00; // incluye compilar shaders
      for (let k = 0; k < calentar + frames; k++) {
        await new Promise((r) => setTimeout(r, 0)); const a = performance.now(); t += avanza; esc.tiempo(t); esc.dibujar(); const b = performance.now();
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const c = performance.now(); if (k >= calentar) { ms.push(c - a); js.push(b - a); } }
      const s = [...ms].sort((x, y) => x - y), ss = [...js].sort((x, y) => x - y), med = (v) => v[(v.length / 2) | 0];
      return { frames: ms.length, primer_cuadro_ms: primer, ms_media: ms.reduce((x, y) => x + y, 0) / ms.length, ms_mediana: med(s), ms_p95: s[Math.floor(s.length * 0.95)], ms_min: s[0], js_mediana_ms: med(ss), llamadas: esc.info.render.calls, triangulos: esc.info.render.triangles, geometrias: esc.info.memory.geometries, texturas: esc.info.memory.textures };
    };
    window.__lab.listo = true;
  } catch (e) { window.__lab.error = String(e && e.stack || e); console.error(e); }
})();
