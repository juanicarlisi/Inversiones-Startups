const { chromium } = require('playwright');
(async () => {
  const srv = await (await import('/home/user/Inversiones-Startups/apps/juegos/aviacion/laboratorio/servidor.mjs')).servir();
  for (const [n, f] of [['defecto', []], ['con banderas', ['--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-unsafe-swiftshader']]]) {
    const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: f });
    const p = await br.newPage(); await p.goto(srv.url + '/laboratorio/autoprueba.html');
    const r = await p.evaluate(async () => { try { return { gpuEnNavigator: 'gpu' in navigator, contextoSeguro: isSecureContext, adaptador: navigator.gpu ? !!(await navigator.gpu.requestAdapter()) : null }; } catch (e) { return String(e).slice(0, 80); } });
    console.log(n, JSON.stringify(r)); await br.close();
  }
  await srv.cerrar();
})();
