// HN-13: objetivos en pantalla, celebración, avisos que no tapan y fin de capítulo.
//  - 3 misiones cumplidas en el mismo paso: un solo aviso agrupado («3 misiones cumplidas: +$X»), sin ventanas ni avisos
//    superpuestos, el sello en la tarjeta, el premio que vuela a la caja y 0 errores.
//  - En 390×844, 844×390, 800×450 y 960×540 el carril de avisos no se cruza con la tarjeta de misión, la barra ni el zoom.
//  - Avión desbloqueado: tarjeta de hangar con su ficha. Fin de capítulo: resumen con datos, dato histórico y lo que sigue.
//  - Con prefers-reduced-motion no hay vuelo ni rebote.
//   node pruebas/navegador/misiones.cjs [carpeta-capturas]
const C = require('./comun.cjs');
const OUT = C.carpeta(process.argv[2]);

const cruces = (p) => p.evaluate(() => {
  const r = (e) => e.getBoundingClientRect();
  const corta = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
  const avisos = [...document.querySelectorAll('#avisos > *')].map(r);
  const otros = [['barra', document.getElementById('barra')], ['mision', document.querySelector('#objetivos .obj')], ['zoom', document.getElementById('zoom')]]
    .filter(([, e]) => e && e.offsetParent !== null).map(([n, e]) => [n, r(e)]);
  const out = [];
  for (const a of avisos) for (const [n, b] of otros) if (corta(a, b)) out.push(n);
  return { cruces: out, avisos: avisos.length };
});

async function tresJuntas(b, url, { ancho, alto, tactil, reducido = false }) {
  const nombre = `${ancho}x${alto}${reducido ? '-reducido' : ''}`;
  const p = await C.abrir(b, url + '/index.html', { ancho, alto, tactil, reducido });
  await C.empezar(p);
  // la caja: se registran los cambios de clase («sube» mientras cuenta hacia arriba)
  await p.evaluate(() => { window.__sube = []; new MutationObserver(() => window.__sube.push([performance.now(), document.getElementById('caja').classList.contains('sube')])).observe(document.getElementById('caja'), { attributes: true, attributeFilter: ['class'] }); });
  // con el juego en pausa: m1 y m2 se cumplen al comprar (sus eventos quedan pendientes) y m1_transbordo en el próximo paso
  await p.evaluate(() => {
    const { estado, M } = window.__juego, s = estado();
    window.__juego.fijarVel(0);
    M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
    s.dinero += 30000;
    M.abrirRuta(s, 'BUE', 'BHI'); M.comprarAvion(s, 'golondrina', 'BHI-BUE');
    s.stats.transbordos.BUE = (s.stats.transbordos.BUE ?? 0) + 60;
    window.__juego.vis.primeraClasif = true; // el aviso de la primera clasificación ya salió antes (en una partida real, con la 1.ª saca)
    window.__dinero0 = s.dinero;
    window.__juego.fijarVel(1);
  });
  await p.waitForFunction(() => window.__juego.estado().misiones.length >= 3, null, { timeout: 5000 });
  await C.esperar(250);
  const ahora = await p.evaluate(() => ({
    avisos: [...document.querySelectorAll('#avisos .aviso')].map((a) => a.textContent.trim()),
    ventana: !document.getElementById('ventana').hidden,
    sello: !!document.querySelector('#objetivos .sello'),
    lleno: !!document.querySelector('#objetivos .obj.lleno'),
    vuela: !!document.querySelector('.vuela'),
    misiones: window.__juego.estado().misiones,
  }));
  if (OUT) await p.screenshot({ path: `${OUT}/misiones-${nombre}-celebra.png` });
  const grupo = ahora.avisos.filter((x) => /3 (misiones|missions)/.test(x));
  C.verificar(ahora.misiones.length === 3 && grupo.length === 1 && ahora.avisos.length === 1, `${nombre}: 3 misiones en el mismo paso → un solo aviso agrupado`, ahora.avisos);
  C.verificar(!ahora.ventana, `${nombre}: ninguna ventana encima de la celebración`);
  C.verificar(ahora.sello && ahora.lleno, `${nombre}: la tarjeta se llena y cae el sello`);
  C.verificar(reducido ? !ahora.vuela : ahora.vuela, reducido ? `${nombre}: con movimiento reducido no hay vuelo del premio` : `${nombre}: el premio vuela hacia la caja`);
  const c = await cruces(p);
  C.verificar(c.cruces.length === 0, `${nombre}: los avisos no se cruzan con la misión, la barra ni el zoom`, c);
  // la caja cuenta hacia arriba (no salta): a los 1,2 s todavía no llegó al total y a los 2,4 s sí
  if (!reducido) {
    await C.esperar(2200);
    const sube = await p.evaluate(() => window.__sube);
    const ini = sube.find((x) => x[1]), fin = ini && sube.find((x) => !x[1] && x[0] > ini[0]);
    const ms = ini && fin ? Math.round(fin[0] - ini[0]) : null;
    C.verificar(ms != null && ms >= 300 && ms <= 1900, `${nombre}: la caja cuenta hacia arriba (espera el vuelo y cuenta 300 a 600 ms)`, ms);
  }
  await C.esperar(1200);
  C.verificar(await p.evaluate(() => !document.querySelector('#objetivos .sello')), `${nombre}: después de la celebración aparece la misión siguiente`);
  C.verificar(p.errores.length === 0, `${nombre}: 0 errores`, p.errores);
  await p.ctx.close();
}

async function hangarYCapitulo(b, url) {
  const p = await C.abrir(b, url + '/index.html', { ancho: 1280, alto: 720 });
  await C.empezar(p);
  // m1_noche desbloquea el Tero: tarjeta de hangar con su ficha
  await p.evaluate(() => {
    const { estado, M } = window.__juego, s = estado();
    window.__juego.fijarVel(0);
    s.misiones = ['m1_primera', 'm1_segunda', 'm1_transbordo'];
    M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
    M.tomarEventos(s);
    window.__juego.fijarVel(1);
  });
  await C.esperar(600);
  await p.evaluate(() => { const s = window.__juego.estado(); s.stats.despNoche = (s.mision?.base ?? 0) + 4; });
  await p.waitForSelector('.hangar', { timeout: 4000 });
  const ficha = await p.$$eval('.hangar dd', (d) => d.map((x) => x.textContent));
  C.verificar(ficha.length === 4 && ficha.every((x) => x.trim().length > 0), 'avión desbloqueado: tarjeta de hangar con velocidad, alcance, capacidad y precio', ficha);
  if (OUT) await p.screenshot({ path: `${OUT}/misiones-hangar.png` });
  // fin del capítulo 1: resumen con datos, el dato de época y lo que sigue
  await p.evaluate(() => {
    const { estado } = window.__juego, s = estado();
    s.misiones = ['m1_primera', 'm1_segunda', 'm1_transbordo', 'm1_noche', 'm1_sur', 'm1_gallegos'];
    s.mision = null;
  });
  await C.esperar(400);
  await p.evaluate(() => { const s = window.__juego.estado(); if (s.mision) s.mision.mejor = 60000; });
  await p.waitForSelector('#ventana .tarjeta.resumen', { timeout: 6000 });
  const res = await p.evaluate(() => ({ titulo: document.querySelector('#ventana h2').textContent, stats: document.querySelectorAll('#ventana .stat').length,
    texto: document.querySelector('#ventana .tarjeta').textContent, botones: [...document.querySelectorAll('#ventana .botones button')].map((x) => x.textContent) }));
  if (OUT) await p.screenshot({ path: `${OUT}/misiones-fin-capitulo.png` });
  C.verificar(res.stats >= 3 && /1930/.test(res.texto) && /Capítulo 2|Chapter 2/.test(res.texto), 'fin de capítulo: resumen con datos, dato histórico (1930) y la meta del capítulo siguiente', { titulo: res.titulo, stats: res.stats, botones: res.botones });
  await p.locator('#ventana .boton.principal').click();
  await C.esperar(300);
  const cap = await p.evaluate(() => ({ cap: window.__juego.estado().cap, ventana: document.querySelector('#ventana h2')?.textContent }));
  C.verificar(cap.cap === 2, '«Ir al capítulo 2» pasa al capítulo 2', cap);
  C.verificar(p.errores.length === 0, 'hangar y capítulo: 0 errores', p.errores);
  await p.ctx.close();
}

(async () => {
  const srv = await C.servir();
  const b = await C.navegador();
  for (const [ancho, alto, tactil] of [[390, 844, true], [844, 390, true], [800, 450, false], [960, 540, false]]) await tresJuntas(b, srv.url, { ancho, alto, tactil });
  await tresJuntas(b, srv.url, { ancho: 1280, alto: 720, tactil: false, reducido: true });
  await hangarYCapitulo(b, srv.url);
  await b.close(); await srv.cerrar();
  C.terminar();
})();
