// HN-16: la ronda nocturna dentro del juego y el parte de la mañana.
// Escenario de referencia del juego (el de las pruebas del modelo, pruebas/ronda.test.mjs): capítulo 2, 4 rutas iluminadas desde
// Buenos Aires con 2 aviones cada una.
//  - Jugar con el plan sugerido da al menos 90 % a primera hora; saltear da exactamente el resultado automático; 0 errores.
//  - El chip nunca abre nada solo; aceptada, el tiempo va a unos 3 min de juego por segundo; tutorial de 2 pasos la primera vez.
//  - En 390×844, 844×390 y 800×450 se juega sin desplazarse para llegar a los controles. Textos en es y en.
//  - El parte de la mañana: una sola pantalla con el parte y la próxima meta, que se cierra con un toque.
//   node pruebas/navegador/ronda.cjs [carpeta-capturas]
const C = require('./comun.cjs');
const OUT = C.carpeta(process.argv[2]);

async function referencia(p) {
  await p.evaluate(() => {
    const { M } = window.__juego;
    const s = M.nuevoEstado(2);
    M.tomarEventos(s);
    s.misiones = ['m1_primera', 'm1_segunda', 'm1_transbordo', 'm1_noche', 'm1_sur', 'm1_gallegos', 'm1_caja'];
    s.cap = 2; s.t0 = Date.UTC(1946, 2, 1, 9, 0) - s.t * 60000; s.dia = M.diaCalendario(s); s.colas = {}; s.dinero = 1e7;
    for (const d of ['MVD', 'ROS', 'BHI', 'COR']) { M.abrirRuta(s, 'BUE', d); for (let i = 0; i < 2; i++) M.comprarAvion(s, d === 'BHI' || d === 'COR' ? 'tero' : 'golondrina', M.idRuta('BUE', d)); }
    window.__juego.cargar(s);
    window.__juego.fijarVel(6);
  });
}
const hastaChip = (p) => p.waitForSelector('#chips [data-accion="abrirRonda"]', { timeout: 30000 });

async function jugar(b, url, { locale }) {
  const p = await C.abrir(b, url + '/index.html', { ancho: 1280, alto: 720, locale });
  await C.empezar(p);
  await referencia(p);
  await hastaChip(p);
  C.verificar(await p.evaluate(() => document.getElementById('ronda').hidden && document.getElementById('ventana').hidden), `${locale}: el chip aparece y no abre nada solo`);
  const chip = await p.locator('#chips [data-accion="abrirRonda"]').textContent();
  await p.locator('#chips [data-accion="abrirRonda"]').click();
  await C.esperar(200);
  C.verificar(await p.evaluate(() => !document.getElementById('ronda').hidden && !!document.querySelector('.rj-guia')), `${locale}: al aceptar se abre la vista de la noche con el tutorial de 2 pasos`, chip.trim());
  if (OUT) await p.screenshot({ path: `${OUT}/ronda-${locale}-1-tutorial.png` });
  // el tiempo va lento: unos 3 minutos de juego por segundo real
  const t0 = await p.evaluate(() => window.__juego.estado().t);
  await C.esperar(2000);
  const t1 = await p.evaluate(() => window.__juego.estado().t);
  C.verificar(Math.abs((t1 - t0) / 2 - 3) <= 1.5, `${locale}: con la ronda aceptada el tiempo va a unos 3 min de juego por segundo`, `${(t1 - t0) / 2} min/s`);
  await p.locator('[data-accion="rondaTutSig"]').click(); await C.esperar(100);
  await p.locator('[data-accion="rondaTutSig"]').click(); await C.esperar(100);
  C.verificar(await p.evaluate(() => !document.querySelector('.rj-guia')), `${locale}: el tutorial se cierra en 2 pasos`);
  // controles a toques: subir un destino en la cinta, mover una salida de a 15 min
  const orden0 = await p.$$eval('.rj-fila', (f) => f.map((x) => x.dataset.ruta));
  await p.locator('.rj-fila').nth(1).locator('[data-accion="rondaSubir"]').click(); await C.esperar(150);
  const orden1 = await p.$$eval('.rj-fila', (f) => f.map((x) => x.dataset.ruta));
  C.verificar(orden1[0] === orden0[1] && orden1[1] === orden0[0], `${locale}: «subir» cambia el orden de la cinta`, { orden0, orden1 });
  const h0 = await p.locator('.rj-fila').nth(0).locator('.rj-salida span').first().textContent();
  await p.locator('.rj-fila').nth(0).locator('[data-accion="rondaDespues"]').click(); await C.esperar(150);
  const h1 = await p.locator('.rj-fila').nth(0).locator('.rj-salida span').first().textContent();
  C.verificar(h0 !== h1, `${locale}: + mueve la salida 15 minutos`, `${h0} → ${h1}`);
  await p.locator('[data-accion="rondaSugerido"]').click(); await C.esperar(150);
  if (OUT) await p.screenshot({ path: `${OUT}/ronda-${locale}-2-plan.png` });
  // volver al mapa y apurar hasta las 07:00
  await p.locator('.rj-pie [data-accion="rondaCerrar"]').click();
  await p.evaluate(() => window.__juego.fijarVel(6));
  await p.waitForFunction(() => window.__juego.estado().ronda.historial.length > 0, null, { timeout: 60000 });
  await C.esperar(300);
  const r = await p.evaluate(() => ({ h: window.__juego.estado().ronda.historial[0], ventana: document.querySelector('#ventana h2')?.textContent, medalla: !!document.querySelector('#ventana .medalla-grande') }));
  if (OUT) await p.screenshot({ path: `${OUT}/ronda-${locale}-3-resultado.png` });
  C.verificar(r.h.jugada && r.h.pctPrimeraHora >= 0.9, `${locale}: con el plan sugerido, al menos 90 % a primera hora`, `${Math.round(r.h.pctPrimeraHora * 100)} %`);
  C.verificar(r.medalla && /%/.test(await p.locator('#ventana').textContent()), `${locale}: pantalla de resultado con medalla, % a primera hora e ingreso contra el automático`, r.ventana);
  C.verificar(p.errores.length === 0, `${locale}: 0 errores`, p.errores);
  await p.ctx.close();
}

async function saltear(b, url) {
  const p = await C.abrir(b, url + '/index.html', { ancho: 1280, alto: 720 });
  await C.empezar(p);
  await referencia(p);
  await hastaChip(p);
  // gemelo: la misma partida, copiada al aparecer el chip, simulada sin tocar nada
  const gemelo = await p.evaluate(() => {
    const { M, estado } = window.__juego;
    window.__juego.fijarVel(0);
    const g = M.restaurar(M.guardar(estado()));
    M.tomarEventos(g);
    for (let i = 0; i < 400; i++) for (const e of M.paso(g)) if (e.tipo === 'resultadoNoche') return { pct: e.pctPrimeraHora, ingreso: e.ingreso };
    return null;
  });
  // la partida real: tampoco restaura nada distinto (se restaura igual que el gemelo para comparar con la misma precisión)
  await p.evaluate(() => { const { M, estado } = window.__juego; const s = M.restaurar(M.guardar(estado())); window.__juego.cargar(s); window.__juego.fijarVel(6); });
  await p.waitForFunction(() => window.__juego.estado().ronda.historial.length > 0, null, { timeout: 60000 });
  await C.esperar(200);
  const r = await p.evaluate(() => ({ h: window.__juego.estado().ronda.historial[0], ventana: !document.getElementById('ventana').hidden, avisos: [...document.querySelectorAll('#avisos .aviso')].map((x) => x.textContent) }));
  C.verificar(!r.h.jugada && Math.abs(r.h.pctPrimeraHora - gemelo.pct) < 1e-9 && r.h.ingreso === gemelo.ingreso, 'saltear da el resultado automático (igual al gemelo sin tocar)', { juego: r.h.pctPrimeraHora, gemelo });
  C.verificar(!r.ventana && r.avisos.some((x) => /automática|Autopilot/.test(x)), 'saltear no abre ninguna pantalla: un aviso con el % automático', r.avisos);
  C.verificar(p.errores.length === 0, 'saltear: 0 errores', p.errores);
  await p.ctx.close();
}

async function tamanos(b, url) {
  for (const [w, h, tactil] of [[390, 844, true], [844, 390, true], [800, 450, false]]) {
    const p = await C.abrir(b, url + '/index.html', { ancho: w, alto: h, tactil });
    await C.empezar(p);
    await referencia(p);
    await hastaChip(p);
    await C.pulsar(p, p.locator('#chips [data-accion="abrirRonda"]'));
    await p.evaluate(() => window.__juego.fijarVel(0));
    if (await p.$('[data-accion="rondaTutSaltear"]')) await C.pulsar(p, p.locator('[data-accion="rondaTutSaltear"]'));
    await C.esperar(200);
    const r = await p.evaluate(() => {
      const fuera = [...document.querySelectorAll('#ronda button')].filter((x) => { const b = x.getBoundingClientRect(); return b.top < 0 || b.bottom > innerHeight || b.left < 0 || b.right > innerWidth; }).map((x) => x.dataset.k);
      const c = document.querySelector('.rj-cuerpo');
      return { fuera, scroll: c.scrollHeight > c.clientHeight + 1, filas: document.querySelectorAll('.rj-fila').length };
    });
    if (OUT) await p.screenshot({ path: `${OUT}/ronda-${w}x${h}.png` });
    C.verificar(!r.fuera.length && !r.scroll, `${w}×${h}: la ronda se juega sin desplazarse para llegar a los controles`, r);
    C.verificar(p.errores.length === 0, `${w}×${h}: 0 errores`, p.errores);
    await p.ctx.close();
  }
}

async function parte(b, url) {
  const p0 = await C.abrir(b, url + '/index.html');
  await C.empezar(p0);
  const g = await p0.evaluate(() => { const { estado, M } = window.__juego, s = estado(); M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD'); for (let i = 0; i < 60; i++) M.paso(s); const o = JSON.parse(M.guardar(s)); o.guardado = Date.now() - 14 * 3600e3; return JSON.stringify(o); });
  await p0.ctx.close();
  for (const locale of ['es-AR', 'en-US']) {
    const p = await C.abrir(b, url + '/index.html', { locale, guardado: g });
    await C.esperar(400);
    const r = await p.evaluate(() => ({ titulo: document.querySelector('#ventana h2')?.textContent, stats: document.querySelectorAll('#ventana .stat').length, botones: document.querySelectorAll('#ventana .botones button').length,
      meta: /Próxima meta|Next goal/.test(document.getElementById('ventana').textContent) }));
    if (OUT) await p.screenshot({ path: `${OUT}/parte-${locale}.png` });
    C.verificar(/Parte de la mañana|Morning report/.test(r.titulo) && r.stats === 3 && r.meta && r.botones === 1, `${locale}: al volver de 14 h, el parte de la mañana en una pantalla con la próxima meta`, r);
    await p.locator('#ventana .boton.principal').click(); await C.esperar(150);
    C.verificar(await p.evaluate(() => document.getElementById('ventana').hidden), `${locale}: el parte se cierra con un toque`);
    C.verificar(p.errores.length === 0, `${locale}: parte sin errores`, p.errores);
    await p.ctx.close();
  }
}

(async () => {
  const srv = await C.servir();
  const b = await C.navegador();
  await jugar(b, srv.url, { locale: 'es-AR' });
  await jugar(b, srv.url, { locale: 'en-US' });
  await saltear(b, srv.url);
  await tamanos(b, srv.url);
  await parte(b, srv.url);
  await b.close(); await srv.cerrar();
  C.terminar();
})();
