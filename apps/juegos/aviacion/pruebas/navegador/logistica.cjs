// HN-15: información logística accionable.
//  - Panel de ruta: «Sobran aviones…» con capacidad > 1,5 × flujo; «X sacas trabadas…» en rojo si la ruta no tiene aviones;
//    una línea «Pasan X · Ofrecés Z · Se pierden W …/h» con su barra; los números finos detrás de «Detalle».
//  - Comprar advierte cuando ya sobra capacidad y muestra el efecto en $/día; vender el último avión pide confirmación.
//  - Aeropuerto con centro de transbordo: % a tiempo y horas de atraso; «Detalle» con ocupación, demanda perdida y costo por unidad.
//  - Lista de rutas ordenable desde 8 rutas, probada con 36 en 390×844 y 1280×720. Ficha de avión con carga, destino, llegada y
//    ganancia estimada. Textos en es y en.
//   node pruebas/navegador/logistica.cjs [carpeta-capturas]
const C = require('./comun.cjs');
const OUT = C.carpeta(process.argv[2]);

async function ruta(b, url, locale) {
  const p = await C.abrir(b, url + '/index.html', { ancho: 1280, alto: 720, locale });
  await C.empezar(p);
  await p.evaluate(() => {
    const { estado, M } = window.__juego, s = estado();
    window.__juego.fijarVel(0);
    s.dinero = 1e6;
    M.abrirRuta(s, 'BUE', 'MVD'); for (let i = 0; i < 6; i++) M.comprarAvion(s, 'golondrina', 'BUE-MVD');
    M.abrirRuta(s, 'BUE', 'ROS'); M.comprarAvion(s, 'golondrina', 'BUE-ROS');
    M.abrirRuta(s, 'BUE', 'BHI');
    for (let i = 0; i < 150; i++) M.paso(s);
    M.tomarEventos(s);
    window.__juego.seleccionar({ tipo: 'ruta', id: 'BUE-MVD' });
  });
  await C.esperar(400);
  const mvd = await p.evaluate(() => ({ sobran: !document.querySelector('[data-campo="al1"]').hidden, linea: document.querySelector('#panel-cuerpo .flujo').textContent,
    medidor: !!document.querySelector('#panel-cuerpo .medidor i'), efecto: document.querySelector('[data-campo="ef:golondrina"]')?.textContent, efectoRojo: document.querySelector('[data-campo="ef:golondrina"]')?.classList.contains('rojo') }));
  C.verificar(mvd.sobran, `${locale}: 6 Golondrinas en una ruta corta → «Sobran aviones: subí la carga mínima o vendé uno»`);
  C.verificar(/\d.*\/h/.test(mvd.linea) && mvd.medidor, `${locale}: una línea con lo que pasa, lo que ofrecés y lo que se pierde, con su barra`, mvd.linea);
  C.verificar(!!mvd.efecto && mvd.efectoRojo && /\$/.test(mvd.efecto), `${locale}: Comprar advierte que ya sobra capacidad y muestra el efecto en $/día`, mvd.efecto);
  await p.locator('#panel-cuerpo [data-accion="detalle"]').click(); await C.esperar(150);
  const det = await p.evaluate(() => [...document.querySelectorAll('#panel-cuerpo .detalle .fila-dato, #panel-cuerpo .detalle p')].map((x) => x.textContent.trim()));
  C.verificar(det.length >= 7, `${locale}: «Detalle» muestra los dos sentidos (locales y en conexión), lo perdido, costo por despegue, ingreso por vuelo y costo parado`, det.slice(0, 3));
  if (OUT) await p.screenshot({ path: `${OUT}/logistica-${locale}-ruta.png` });
  // ruta sin aviones con carga esperando: trabadas, en rojo
  await p.evaluate(() => { const { estado, M } = window.__juego, s = estado(); for (let i = 0; i < 30; i++) M.paso(s); window.__juego.seleccionar({ tipo: 'ruta', id: 'BHI-BUE' }); });
  await C.esperar(300);
  const bhi = await p.evaluate(() => { const e = document.querySelector('[data-campo="al2"]'); return { visible: !e.hidden, txt: e.textContent, rojo: e.classList.contains('mala') }; });
  C.verificar(bhi.visible && bhi.rojo && /\d/.test(bhi.txt), `${locale}: ruta sin aviones con carga esperando → «X sacas trabadas», en rojo`, bhi.txt);
  // vender el último avión de una ruta pide confirmación
  await p.evaluate(() => window.__juego.seleccionar({ tipo: 'ruta', id: 'BUE-ROS' }));
  await C.esperar(200);
  await p.locator('#panel-cuerpo [data-accion="vender"]').first().click(); await C.esperar(150);
  const conf = await p.evaluate(() => ({ abierta: !document.getElementById('ventana').hidden, aviones: window.__juego.estado().aviones.filter((a) => a.ruta === 'BUE-ROS').length }));
  C.verificar(conf.abierta && conf.aviones === 1, `${locale}: vender el último avión de una ruta pide confirmación`, conf);
  await p.locator('#ventana .botones button').first().click(); // cancelar
  // aeropuerto con centro de transbordo
  await p.evaluate(() => window.__juego.seleccionar({ tipo: 'ap', id: 'BUE' }));
  await C.esperar(250);
  const hub = await p.evaluate(() => document.querySelector('[data-campo="hl"]')?.textContent);
  C.verificar(/%|sin entregas|no deliveries/.test(hub ?? '') && /h/.test(hub ?? ''), `${locale}: el hub muestra % a tiempo y horas de atraso`, hub);
  await p.locator('#panel-cuerpo [data-accion="detalle"]').click(); await C.esperar(150);
  const hd = await p.$$eval('#panel-cuerpo .detalle .fila-dato', (x) => x.map((y) => y.textContent.trim()));
  C.verificar(hd.length === 4, `${locale}: «Detalle» del hub: ocupación, demanda perdida por día, costo por unidad y entregas`, hd);
  if (OUT) await p.screenshot({ path: `${OUT}/logistica-${locale}-hub.png` });
  // ficha de avión (en vuelo)
  const id = await p.evaluate(async () => {
    const { estado, M } = window.__juego, s = estado();
    for (let i = 0; i < 400; i++) { const a = s.aviones.find((x) => x.fase === 'vuelo' && x.carga.length && x.resta > 20); if (a) return a.id; M.paso(s); }
    return null;
  });
  await p.evaluate((id) => window.__juego.seleccionar({ tipo: 'avion', id }), id);
  await C.esperar(250);
  const ficha = await p.evaluate(() => [...document.querySelectorAll('#panel-cuerpo .flujo')].map((x) => x.textContent.trim()));
  C.verificar(ficha.length >= 3 && /\d/.test(ficha[0]) && /\d/.test(ficha[1]) && /\$/.test(ficha[2]), `${locale}: ficha de avión con llegada, carga a bordo y ganancia estimada del viaje`, ficha);
  if (OUT) await p.screenshot({ path: `${OUT}/logistica-${locale}-avion.png` });
  C.verificar(p.errores.length === 0, `${locale}: 0 errores`, p.errores);
  await p.ctx.close();
}

async function lista(b, url, [w, h, tactil]) {
  const p = await C.abrir(b, url + '/index.html', { ancho: w, alto: h, tactil });
  await C.empezar(p);
  const n = await p.evaluate(() => {
    const { estado, M } = window.__juego;
    const s = M.nuevoEstado(5);
    M.tomarEventos(s);
    s.misiones = ['m1_primera', 'm1_segunda', 'm1_transbordo', 'm1_noche', 'm1_sur', 'm1_gallegos', 'm1_caja', 'm2_pax', 'm2_andes', 'm2_red', 'm2_cauquen', 'm2_conexiones', 'm2_caja', 'm3_jet', 'm3_carga', 'm3_continente'];
    s.cap = 3; s.dinero = 1e9;
    for (const id in M.AP) if (id !== 'BUE' && M.ciudadDisponible(s, id)) M.abrirRuta(s, 'BUE', id);
    let i = 0;
    for (const r of s.rutas) if (i++ % 3 === 0) M.comprarAvion(s, 'halcon', r.id);
    window.__juego.cargar(s);
    window.__juego.fijarVel(0);
    for (let k = 0; k < 120; k++) M.paso(s);
    M.tomarEventos(s);
    window.__juego.seleccionar({ tipo: 'rutas' });
    return s.rutas.length;
  });
  await C.esperar(400);
  const filas = await p.$$eval('#panel-cuerpo .lista-rutas .ruta', (x) => x.length);
  C.verificar(n === 36 && filas === 36, `${w}×${h}: la lista muestra las 36 rutas`, { n, filas });
  const leer = () => p.evaluate(() => {
    const s = window.__juego.estado(), M = window.__juego.M;
    return [...document.querySelectorAll('#panel-cuerpo .lista-rutas .ruta')].map((b) => {
      const r = s.rutas.find((x) => x.id === b.dataset.id), f = M.flujoTramo(s, r.id);
      return { neto: r.ingresos - r.costos, ocup: r.ocup, perd: f.ida.perdidas + f.vuelta.perdidas, corta: [...b.querySelectorAll('small')].some((e) => e.scrollWidth > e.clientWidth + 1) };
    });
  });
  const ordenada = (xs, k) => xs.every((x, i) => i === 0 || xs[i - 1][k] >= x[k] - 1e-9);
  for (const [o, k] of [['ocup', 'ocup'], ['perdida', 'perd'], ['neto', 'neto']]) {
    await C.pulsar(p, p.locator(`#panel-cuerpo [data-accion="ordenar"][data-v="${o}"]`));
    await C.esperar(250);
    const xs = await leer();
    C.verificar(ordenada(xs, k), `${w}×${h}: ordena por ${o}`);
  }
  const xs = await leer();
  C.verificar(xs.filter((x) => x.corta).length === 0, `${w}×${h}: se lee (ninguna línea de datos cortada)`);
  if (OUT) await p.screenshot({ path: `${OUT}/logistica-lista-${w}x${h}.png` });
  C.verificar(p.errores.length === 0, `${w}×${h}: 0 errores`, p.errores);
  await p.ctx.close();
}

// HN-12: una ciudad fuera de la red tiene «Conectar con …»; si ningún avión llega, el panel dice por qué ciudad hacer escala.
async function conectar(b, url) {
  const p = await C.abrir(b, url + '/index.html', { ancho: 1280, alto: 720 });
  await C.empezar(p);
  await p.evaluate(() => window.__juego.seleccionar({ tipo: 'ap', id: 'ROS' }));
  await C.esperar(200);
  const ros = await p.locator('#panel-cuerpo [data-accion="conectar"]').textContent();
  C.verificar(/Conectar con Buenos Aires · \$/.test(ros), 'ciudad fuera de la red: «Conectar con <la ciudad más cercana de la red> · $X»', ros.trim());
  await C.pulsar(p, p.locator('#panel-cuerpo [data-accion="conectar"]'));
  await C.esperar(150);
  C.verificar(await p.evaluate(() => window.__juego.estado().rutas.some((r) => r.id === 'BUE-ROS')), 'un solo toque abre la ruta');
  await p.evaluate(() => { const { estado, M } = window.__juego, s = estado(); s.dinero = 1e5; M.abrirRuta(s, 'BUE', 'BHI'); M.comprarAvion(s, 'golondrina', 'BHI-BUE'); M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD'); window.__juego.seleccionar({ tipo: 'ap', id: 'CRD' }); });
  await C.esperar(200);
  const crd = await p.locator('#panel-cuerpo').textContent();
  C.verificar(/hacé escala en San Antonio Oeste|Trelew/.test(crd) && await p.locator('#panel-cuerpo [data-accion="verCiudad"]').count() === 1, 'si ningún avión llega, el panel dice por qué ciudad hacer escala (y lleva ahí)', crd.match(/hacé escala en [^.]*/)?.[0]);
  C.verificar(p.errores.length === 0, 'conectar: 0 errores', p.errores);
  await p.ctx.close();
}

(async () => {
  const srv = await C.servir();
  const b = await C.navegador();
  await conectar(b, srv.url);
  await ruta(b, srv.url, 'es-AR');
  await ruta(b, srv.url, 'en-US');
  await lista(b, srv.url, [390, 844, true]);
  await lista(b, srv.url, [1280, 720, false]);
  await b.close(); await srv.cerrar();
  C.terminar();
})();
