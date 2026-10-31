const { chromium } = require('playwright');
(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await br.newPage({ viewport: { width: 1366, height: 768 } });
  await p.setContent('<canvas id=c width=1366 height=768></canvas>');
  const r = await p.evaluate(async () => {
    const out = {};
    for (const opts of [{}, { antialias: false }, { antialias: false, alpha: false }, { antialias: false, powerPreference: 'high-performance' }]) {
      const c = document.createElement('canvas'); c.width = 1366; c.height = 768; document.body.appendChild(c);
      const gl = c.getContext('webgl2', opts);
      const vs = gl.createShader(gl.VERTEX_SHADER); gl.shaderSource(vs, '#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0,1);}'); gl.compileShader(vs);
      const fs = gl.createShader(gl.FRAGMENT_SHADER); gl.shaderSource(fs, '#version 300 es\nprecision mediump float;out vec4 o;void main(){o=vec4(.1,.4,.8,.5);}'); gl.compileShader(fs);
      const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr); gl.useProgram(pr);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const ms = [], px = new Uint8Array(4);
      for (let i = 0; i < 14; i++) { const a = performance.now(); gl.clearColor(1, 1, 1, 1); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); ms.push(performance.now() - a); await new Promise((r) => setTimeout(r, 0)); }
      out[JSON.stringify(opts)] = ms.slice(4).map((x) => Math.round(x * 10) / 10).join(',');
      c.remove();
    }
    return out;
  });
  console.log(r);
  await br.close();
})();
