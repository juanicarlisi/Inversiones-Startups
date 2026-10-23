// HN-12: un jugador de pantalla que solo toca lo que marcan la guía o el chip de mejor próxima acción (nunca lee el estado para
// decidir). Mide, desde «Empezar»: el primer cobro (≤ 10 s), la misión 1 (≤ 60 s), el hueco máximo sin un elemento marcado en
// los primeros 3 minutos (≤ 20 s), errores de consola (0) y que ningún panel de ciudad quede sin acción ni explicación.
// Reacción: de 0,7 a 1,2 s para buscar y tocar algo nuevo; de 0,35 a 0,55 s si lo marcado quedó donde ya estaba el dedo o el
// puntero (a menos de 48 px del toque anterior: no hay que buscarlo).
//   node pruebas/navegador/jugador_pantalla.cjs [carpeta-capturas] [--segundos 180]
const C = require('./comun.cjs');

const CONFIGS = [
  { nombre: '1280x720-es', ancho: 1280, alto: 720, locale: 'es-AR', tactil: false },
  { nombre: '960x540-en', ancho: 960, alto: 540, locale: 'en-US', tactil: false },
  { nombre: '390x844-en', ancho: 390, alto: 844, locale: 'en-US', tactil: true },
  { nombre: '360x640-es', ancho: 360, alto: 640, locale: 'es-AR', tactil: true },
];
const i = process.argv.indexOf('--segundos');
const SEGUNDOS = i > 0 ? Number(process.argv[i + 1]) : 180;
const SOLO = process.env.HN_SOLO ? process.env.HN_SOLO.split(',') : null;
const OUT = C.carpeta(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null);

// Una sola lectura por vuelta: lo marcado (un botón con data-marca, la mano sobre el mapa o el chip de la mejor próxima acción),
// el estado que se mide y si el panel muestra una ciudad sin acción ni explicación.
async function mirar(p) {
  return p.evaluate(() => {
    const vis = (el) => el && el.offsetParent !== null && el.getBoundingClientRect().width > 0;
    const centro = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
    let m = null;
    const boton = [...document.querySelectorAll('button[data-marca]')].find(vis);
    const mano = document.getElementById('marca');
    const chip = document.querySelector('#chips [data-accion="sugerencia"]');
    if (boton) m = { tipo: 'boton', k: boton.dataset.k, xy: centro(boton) };
    else if (mano && !mano.hidden && mano.hasAttribute('data-marca') && mano.dataset.x) m = { tipo: 'mapa', xy: [Number(mano.dataset.x), Number(mano.dataset.y)] };
    else if (vis(chip)) m = { tipo: 'chip', k: 'chip-sug', xy: centro(chip), txt: chip.textContent };
    const s = window.__juego.estado(), v = window.__juego.vis;
    let vacio = false;
    if (v.sel?.tipo === 'ap' && !v.modo) {
      const c = document.getElementById('panel-cuerpo');
      const accion = [...c.querySelectorAll('button[data-accion]')].some((b) => b.dataset.accion !== 'cerrarPanel' && !b.disabled);
      const explica = [...c.querySelectorAll('.explica, .alerta')].some((e) => e.textContent.trim().length > 8 && e.offsetParent !== null);
      vacio = !(accion || explica);
    }
    return { m, vacio, st: { ing: s.stats.ingresos, m1: s.misiones.includes('m1_primera') } };
  });
}

async function correr(b, url, cfg) {
  const p = await C.abrir(b, url + '/index.html', { ancho: cfg.ancho, alto: cfg.alto, locale: cfg.locale, tactil: cfg.tactil });
  await C.esperar(300);
  // un solo clic para jugar: «Empezar» es lo único que hay
  const emp = await p.locator('#ventana .boton.principal').boundingBox();
  await C.tocar(p, emp.x + emp.width / 2, emp.y + emp.height / 2, cfg.tactil);
  const t0 = Date.now();
  const r = { config: cfg.nombre, toques: 1, primerCobro: null, mision1: null, huecoMax: 0, panelSinAccion: 0, errores: [], acciones: [] };
  let ultimoMarcado = Date.now(), proxima = Date.now() + 700, n = 0, ultimoToque = [emp.x + emp.width / 2, emp.y + emp.height / 2], visto = null;
  while (Date.now() - t0 < SEGUNDOS * 1000) {
    await C.esperar(60);
    const seg = (Date.now() - t0) / 1000;
    const { m, vacio, st } = await mirar(p);
    if (r.primerCobro == null && st.ing > 0) r.primerCobro = +seg.toFixed(1);
    if (r.mision1 == null && st.m1) r.mision1 = +seg.toFixed(1);
    if (m) {
      const hueco = (Date.now() - ultimoMarcado) / 1000;
      if (seg <= 180 && hueco > r.huecoMax) { r.huecoMax = hueco; r.huecoEn = +seg.toFixed(1); }
      ultimoMarcado = Date.now();
      // reacción desde que aparece algo nuevo marcado
      const clave = `${m.tipo}|${m.k ?? ''}|${Math.round(m.xy[0] / 20)}|${Math.round(m.xy[1] / 20)}`;
      if (clave !== visto) {
        visto = clave;
        const cerca = Math.hypot(m.xy[0] - ultimoToque[0], m.xy[1] - ultimoToque[1]) < 48;
        proxima = Math.max(proxima, Date.now() + (cerca ? 350 + Math.random() * 200 : 700 + Math.random() * 500));
      }
    }
    if (vacio) r.panelSinAccion++;
    if (m && Date.now() >= proxima) {
      await C.tocar(p, m.xy[0], m.xy[1], cfg.tactil);
      ultimoToque = m.xy; visto = null;
      r.toques++; n++;
      r.acciones.push(`${seg.toFixed(1)}s ${m.tipo}:${m.k ?? ''}${m.txt ? ` «${m.txt.trim().slice(0, 50)}»` : ''}`);
      proxima = Date.now() + 350; // después de tocar, lo que aparezca se busca de nuevo
      if (OUT && n <= 6) await p.screenshot({ path: `${OUT}/bot-${cfg.nombre}-${String(n).padStart(2, '0')}.png` });
    }
    if (seg > 180 && r.primerCobro != null) break;
  }
  if (OUT) await p.screenshot({ path: `${OUT}/bot-${cfg.nombre}-final.png` });
  r.final = await p.evaluate(() => { const s = window.__juego.estado(); return { misiones: s.misiones, rutas: s.rutas.length, aviones: s.aviones.length, dinero: Math.round(s.dinero), minutoJuego: s.t }; });
  r.errores = p.errores;
  await p.ctx.close();
  return r;
}

(async () => {
  const srv = await C.servir();
  const b = await C.navegador();
  const res = await Promise.all(CONFIGS.filter((c) => !SOLO || SOLO.includes(c.nombre)).map((c) => correr(b, srv.url, c)));
  for (const r of res) {
    console.log(JSON.stringify({ ...r, acciones: r.acciones.slice(0, 14) }));
    C.verificar(r.primerCobro != null && r.primerCobro <= 10, `${r.config}: primer cobro ≤ 10 s`, r.primerCobro);
    C.verificar(r.mision1 != null && r.mision1 <= 60, `${r.config}: misión 1 ≤ 60 s`, r.mision1);
    C.verificar(r.huecoMax <= 20, `${r.config}: nunca más de 20 s sin un elemento marcado (3 min)`, +r.huecoMax.toFixed(1));
    C.verificar(r.errores.length === 0, `${r.config}: 0 errores de consola`, r.errores);
    C.verificar(r.panelSinAccion === 0, `${r.config}: ningún panel de ciudad sin acción ni explicación`, r.panelSinAccion);
  }
  await b.close(); await srv.cerrar();
  C.terminar();
})();
