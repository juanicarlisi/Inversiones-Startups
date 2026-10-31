const { chromium } = require('playwright');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const sets = {
  'defecto': [],
  'swiftshader': ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  'swiftshader+accel': ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-accelerated-2d-canvas'],
  'disable-gpu': ['--disable-gpu'],
};
(async () => {
  for (const [n, f] of Object.entries(sets)) {
    const br = await chromium.launch({ executablePath: EXE, args: f });
    const p = await br.newPage({ viewport: { width: 1366, height: 768 } });
    await p.setContent('<canvas id=c width=1366 height=768></canvas>');
    const r = await p.evaluate(() => new Promise((ok) => { const c = document.getElementById('c').getContext('2d'); let n = 0; const t0 = performance.now(); const f = (t) => { c.fillStyle = `hsl(${n * 7 % 360} 60% 50%)`; c.fillRect(0, 0, 1366, 768); n++; if (t - t0 < 3000) requestAnimationFrame(f); else ok(n / ((t - t0) / 1000)); }; requestAnimationFrame(f); }));
    const g = await p.evaluate(() => { const gl = document.createElement('canvas').getContext('webgl2'); if (!gl) return 'sin webgl2'; const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'webgl2'; });
    console.log(n.padEnd(20), 'fillRect pantalla completa fps', r.toFixed(1), '|', g);
    await br.close();
  }
})();
