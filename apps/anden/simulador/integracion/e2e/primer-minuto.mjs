// integracion/e2e/primer-minuto.mjs · Andén simulador, corte 1 · Integración (corte-1.md §10.8 y diseño maestro §5.3).
// «Mirá cómo se traba el hub»: abrir el enlace de la plantilla grande → la película corre → tocar (con el puntero, sobre el lienzo) un
// paquete que pierde el corte → su biografía con una causa CONFIRMADA → las cien noches → «¿y si…?» con «balancear el plan» → pantalla
// dividida con veredicto. En 1280 × 800 claro, además: con la plantilla tal cual, «balancear» dice que el plan ya está balanceado y no
// compara (B = A).
import { ClaseEntidad } from '../../contratos/traza.ts';
import { abrirPestana, dondeEsta, horaDe } from './comun.mjs';

export async function primerMinuto({ contexto, base, etiqueta, combo, prep, fallar, ok, guardar }) {
  const h = await abrirPestana(contexto, { fallar, etiqueta });
  const { page } = h;
  const datos = {};
  // el enlace muestra la causa confirmada durante el turno (no a media mañana, con el turno terminado: revisión de I-3)
  if (!prep.paquete.enTurno) fallar(`${etiqueta} · primer minuto: el enlace abre a las ${horaDe(prep.instante)}, sin la causa confirmada a la vista antes del corte`);
  const t0 = Date.now();
  await page.goto(`${base}?depuracion=1#${prep.primerMinuto}`);
  await h.pantalla('escena', 60_000);
  datos.peliculaMs = Date.now() - t0;
  // la etiqueta de noche dice cuál es y por qué (la eligió quien armó el enlace); el tablero en vivo está a la vista
  const etq = await page.textContent('[data-etiqueta-noche="A"]');
  if (!new RegExp(`^Noche ${prep.peor + 1} de 100 · la que eligió quien armó el enlace$`).test(etq ?? '')) {
    fallar(`${etiqueta} · primer minuto: etiqueta de noche «${etq}» (se esperaba «Noche ${prep.peor + 1} de 100 · la que eligió quien armó el enlace»)`);
  }
  await page.waitForSelector('[data-tablero-vivo]:not([hidden])', { timeout: 10_000 });
  // los tres sellos (diseño maestro §5.9) en la escena: motor, reproducida y validación
  const sellos = await page.$$eval('section[data-pantalla="escena"] [data-sello]', (xs) => xs.map((x) => x.getAttribute('data-sello')));
  if (sellos.length !== 3 || sellos[0] !== 'motor' || !sellos[1].startsWith('reproducida-') || sellos[2] !== 'validacion') {
    fallar(`${etiqueta} · primer minuto: sellos de la escena ${JSON.stringify(sellos)} (se esperaban motor, reproducida-… y validacion)`);
  }
  datos.sellos = sellos;
  datos.etiquetaNoche = etq;
  const t = await h.sesion(() => window.__anden.almacen.estado.t);
  if (t !== prep.instante) fallar(`${etiqueta} · primer minuto: el enlace abre a las ${horaDe(t)} y la receta decía ${horaDe(prep.instante)}`);
  // la película corre: reproducir, ver que el cabezal avanza, pausar
  await h.clic('reproducir');
  await h.esperar((x) => window.__anden.almacen.estado.t > x + 60_000, prep.instante, 10_000, 'el cabezal no avanzó al reproducir');
  await h.clic('reproducir');
  const corrio = await h.sesion(() => window.__anden.almacen.estado.t);
  datos.peliculaAvanzoMin = Math.round((corrio - prep.instante) / 60_000);
  // volver al instante del enlace arrastrando el cabezal en la línea de tiempo (un toque en la pista)
  const pista = await page.$('section[data-pantalla="escena"] .lt__pista');
  await pista.scrollIntoViewIfNeeded();
  const cajaPista = await pista.boundingBox();
  const fr = await h.sesion((x) => { const e = window.__anden.almacen.estado; return (x - e.inicio) / (e.fin - e.inicio); }, prep.instante);
  await page.mouse.click(cajaPista.x + fr * cajaPista.width, cajaPista.y + cajaPista.height / 2);
  await page.waitForTimeout(250);
  // el paquete del enlace (camión, índice) en esta traza; si el toque cae en un vecino que también pierde el corte, vale igual
  const id = await h.sesion(({ camion, indice }) => {
    const P = window.__anden.sesion.noche.traza.paquetes;
    for (let e = 0; e < P.n; e++) if (P.camion[e] === camion && P.indice[e] === indice) return e;
    return -1;
  }, prep.paquete);
  if (id < 0) throw new Error(`el paquete ${prep.paquete.indice + 1} del camión ${prep.paquete.camion + 1} no está en la traza del navegador`);
  // la escena con la línea de arriba completa (costo, perder el corte, confianza): las cien noches ya calculadas
  await h.esperar(() => window.__anden.sesion.nochesListas && !!window.__anden.sesion.comprobante, null, 120_000, 'las cien noches');
  datos.cienNochesS = Number(((Date.now() - t0) / 1000).toFixed(1));
  await guardar('primer-minuto-escena', page);
  // acercar con la rueda sobre el paquete (como en un simulador de escritorio): el paquete queda bajo el cursor, aparece «Ver todo el hub»
  const caja = 'section[data-pantalla="escena"] .escena__caja';
  // las coordenadas son de la ventana: el lienzo, entero a la vista (los clics de antes pudieron desplazar la página)
  await page.$eval(caja, (x) => x.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(100);
  const punto = await dondeEsta(page, caja, ClaseEntidad.PAQUETE, id);
  await page.mouse.move(punto.x, punto.y);
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(60); }
  await page.waitForSelector(`${caja} [data-accion="encuadrar"]:not([hidden])`, { timeout: 5000 }).catch(async () => {
    const d = await page.evaluate((p) => { const e = document.elementFromPoint(p.x, p.y); return { piso: document.querySelector('section[data-pantalla="escena"] .escena__caja')?.dataset.piso,
      oculto: document.querySelector('[data-accion="encuadrar"]')?.hidden, punto: [Math.round(p.x), Math.round(p.y)], debajo: e ? `${e.tagName}.${e.className}` : null,
      scrollY, pantalla: document.querySelector('section[data-pantalla]')?.dataset.pantalla }; }, punto);
    throw new Error(`acercar con la rueda no mostró «Ver todo el hub» (${JSON.stringify(d)})`);
  });
  // arrastrar el plano para traer el paquete al centro del lienzo (arrastrar mueve la cámara, no abre nada)
  const rect = await page.$eval(caja, (x) => { const r = x.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const centro = { x: rect.x + rect.w / 2, y: rect.y + rect.h * 0.55 };
  await page.mouse.move(punto.x, punto.y);
  await page.mouse.down();
  await page.mouse.move(centro.x, centro.y, { steps: 8 });
  await page.mouse.up();
  const sigueEnEscena = await page.$('section[data-pantalla="escena"]');
  if (!sigueEnEscena) fallar(`${etiqueta} · primer minuto: arrastrar el plano abrió otra pantalla`);
  // el paquete quedó donde se soltó el arrastre (lo que estaba bajo el puntero se mueve con él)
  const trasArrastre = await dondeEsta(page, caja, ClaseEntidad.PAQUETE, id);
  datos.arrastreErrorPx = Math.round(Math.hypot(trasArrastre.x - centro.x, trasArrastre.y - centro.y));
  if (datos.arrastreErrorPx > 12) fallar(`${etiqueta} · primer minuto: después de arrastrar, el paquete quedó a ${datos.arrastreErrorPx} px del puntero (se esperaba ≤ 12)`);
  datos.zoom = await page.evaluate(() => document.querySelector('[data-accion="encuadrar"]')?.textContent);
  await page.waitForTimeout(250);
  await guardar('primer-minuto-zoom', page);
  // tocarlo (con el puntero, sobre el lienzo acercado y movido); la captura pudo desplazar la página: las coordenadas se toman de nuevo
  await page.$eval(caja, (x) => x.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(100);
  const despues = await dondeEsta(page, caja, ClaseEntidad.PAQUETE, id);
  await page.mouse.click(despues.x, despues.y);
  await h.pantalla('biografia', 90_000).catch(async () => {
    const d = await page.evaluate(({ p, caja, id }) => {
      const a = window.__anden, el = document.elementFromPoint(p.x, p.y), c = document.querySelector(caja), rect = c.getBoundingClientRect();
      const r = a.sesion.noche.reproductor, lienzo = document.createElement('canvas');
      const v = a.servicios.crearVista(lienzo, r, a.ctx.estilo(), c.dataset.piso);
      v.redimensionar(Math.round(rect.width), Math.round(rect.height), Math.min(2, devicePixelRatio || 1));
      if (c.dataset.camara) v.camara = JSON.parse(c.dataset.camara);
      const px = p.x - rect.left, py = p.y - rect.top, [x, y] = v.aMundo(px, py), [x2, y2] = v.aMundo(px + 16, py);
      const radio = Math.max(0.6, Math.hypot(x2 - x, y2 - y));
      const pos = r.crearPosiciones(); r.posiciones(a.almacen.estado.t, pos);
      let k = -1; for (let i = 0; i < pos.n; i++) if (pos.clase[i] === 0 && pos.id[i] === id) k = i;
      return { debajo: `${el?.tagName}.${el?.className}`, pantalla: document.querySelector('section[data-pantalla]')?.dataset.pantalla, mundo: [x, y], radio,
        paquete: k >= 0 ? [pos.x[k], pos.y[k]] : null, toque: r.tocar(x, y, a.almacen.estado.t, radio), t: a.almacen.estado.t, seleccion: a.almacen.estado.seleccion };
    }, { p: despues, caja, id });
    throw new Error(`tocar el paquete en (${Math.round(despues.x)}, ${Math.round(despues.y)}) no abrió su biografía: ${JSON.stringify(d)}`);
  });
  const sel = await h.sesion(() => {
    const a = window.__anden, s = a.almacen.estado.seleccion, n = a.sesion.noche, P = n.traza.paquetes;
    return s ? { ...s, atrasado: P.listo[s.id] < 0 || P.listo[s.id] > n.traza.corte } : null;
  });
  if (!sel || sel.clase !== ClaseEntidad.PAQUETE || !sel.atrasado) {
    fallar(`${etiqueta} · primer minuto: el toque en (${centro.x.toFixed(0)}, ${centro.y.toFixed(0)}) no abrió un paquete que pierde el corte (abrió ${JSON.stringify(sel)})`);
  }
  datos.toqueEnElPaquete = sel?.id === id;
  const confirmados = await page.$$eval('.confirmado', (xs) => xs.map((x) => x.textContent));
  const causas = await page.$$eval('[data-causa]', (xs) => xs.map((x) => x.getAttribute('data-causa')));
  if (!confirmados.length) fallar(`${etiqueta} · primer minuto: la biografía no muestra una causa confirmada (causas: ${causas.join(', ') || 'ninguna'})`);
  datos.causa = confirmados[0] ?? null;
  await h.sinDesborde('biografía');
  await guardar('primer-minuto-biografia', page, { completa: true });
  ok(`${etiqueta} · primer minuto: película a los ${(datos.peliculaMs / 1000).toFixed(1)} s, corrió ${datos.peliculaAvanzoMin} min; toque → «${(await page.textContent('h1'))?.trim()}» · ${datos.causa}`);
  // de vuelta en la escena, la cámara acercada sigue; «Ver todo el hub» vuelve al encuadre completo
  await h.clic('volver'); await h.pantalla('escena');
  await page.click(`${caja} [data-accion="encuadrar"]`, { timeout: 5000 }).catch(() => { throw new Error('al volver a la escena la cámara acercada no estaba («Ver todo el hub» oculto)'); });
  await page.waitForSelector(`${caja} [data-accion="encuadrar"][hidden]`, { state: 'attached', timeout: 5000 })
    .catch(() => { throw new Error('«Ver todo el hub» no volvió al encuadre completo'); });
  // cien noches
  await h.clic('ir-noches'); await h.pantalla('noches', 60_000);
  await h.esperar(() => window.__anden.sesion.nochesListas && !!window.__anden.sesion.mapa, null, 120_000, 'las cien noches');
  await page.waitForTimeout(300);
  const riesgo = await h.sesion(() => {
    const m = window.__anden.sesion.mapa;
    return { noches: m.noches, rampasQueSeLlenan: [...m.rampaProbLlena].filter((p) => p > 0).length, p50: m.finClasificacionMin.p50 };
  });
  if (riesgo.noches !== 100) fallar(`${etiqueta} · cien noches: el mapa tiene ${riesgo.noches} noches`);
  // el sello «reproducida» compara la huella agregada de ESTA pestaña con la `h` de la receta del autor (hallazgo H1)
  await h.esperar(() => !!window.__anden.sesion.comprobante, null, 60_000, 'el comprobante de las cien noches');
  const sello = await h.sesion(() => ({ sello: window.__anden.sesion.selloReproducida(), huella: window.__anden.sesion.comprobante.huellaAgregada }));
  if (sello.sello !== 'reproducida' || sello.huella !== prep.huellaAgregadaPrimerMinuto) {
    fallar(`${etiqueta} · cien noches: sello «${sello.sello}» con la huella agregada ${sello.huella} (se esperaba «reproducida» con ${prep.huellaAgregadaPrimerMinuto}, la del autor)`);
  }
  riesgo.sello = sello.sello; riesgo.huellaAgregada = sello.huella;
  datos.cienNoches = riesgo;
  await h.sinDesborde('cien noches');
  await guardar('primer-minuto-cien-noches', page, { completa: true });
  // «¿y si…?» con «balancear el plan»: pantalla dividida con la misma suerte, confirmada con las mismas noches que A (cien desde EST-02)
  await h.clic('volver'); await h.pantalla('escena');
  await h.clic('ir-ysi'); await h.pantalla('ysi');
  const tYsi = Date.now();
  await h.clic('balancear');
  await page.waitForSelector('[data-ysi="previa"]', { timeout: 30_000 });
  await page.waitForSelector('[data-ysi="confirmada"]', { timeout: 480_000 });
  datos.ysiConfirmadaS = Number(((Date.now() - tYsi) / 1000).toFixed(1));
  const filas = await page.$$eval('[data-tabla="comparacion"] tbody tr', (xs) => xs.map((x) => x.textContent));
  const veredictos = await page.$$eval('[data-tabla="comparacion"] .veredicto', (xs) => xs.map((x) => x.className.replace('veredicto veredicto--', '')));
  if (filas.length < 5) fallar(`${etiqueta} · ¿y si…?: ${filas.length} indicadores comparados (se esperaban 5)`);
  if (!veredictos.includes('b-mejor')) fallar(`${etiqueta} · ¿y si…?: balancear el plan no dio ningún «B es mejor» (veredictos: ${veredictos.join(', ')})`);
  datos.veredictos = veredictos;
  const lados = await page.$$eval('.dividida__lado .escena__caja', (xs) => xs.map((x) => x.getBoundingClientRect().width > 0));
  if (combo.ancho >= 900 && !(lados[0] && lados[1])) fallar(`${etiqueta} · ¿y si…?: en escritorio A y B tienen que verse lado a lado (${lados})`);
  if (combo.ancho < 900) {
    await h.clic('alternar-ab');
    await page.waitForFunction(() => document.querySelector('.dividida')?.dataset.visible === 'B', null, { timeout: 5000 });
  }
  await h.sinDesborde('¿y si…?');
  await guardar('primer-minuto-ysi', page, { completa: true, altoMax: 1900 });
  ok(`${etiqueta} · ¿y si…? balancear: confirmado en ${datos.ysiConfirmadaS} s con ${filas.length} indicadores (${veredictos.join(', ')})`);
  // con la plantilla tal cual, el plan ya va por volumen: balancear no cambia el modelo y la app lo dice (sin comparar)
  if (etiqueta === '1280-claro') {
    await page.goto(`${base}?depuracion=1#t=hub-lazo-noche@1.0.0`);
    await h.pantalla('escena', 60_000);
    await h.clic('ir-ysi'); await h.pantalla('ysi');
    await h.clic('balancear');
    await page.waitForSelector('[data-ysi="igual"]', { timeout: 20_000 });
    datos.balancearYaBalanceado = (await page.textContent('[data-ysi="igual"]'))?.trim();
    ok(`${etiqueta} · balancear con la plantilla tal cual: «${datos.balancearYaBalanceado.slice(0, 70)}…»`);
  }
  const faltan = await h.faltantes();
  if (faltan.length) fallar(`${etiqueta} · primer minuto: claves de texto faltantes: ${faltan.join(', ')}`);
  await page.close();
  return { datos, errores: h.errores };
}
