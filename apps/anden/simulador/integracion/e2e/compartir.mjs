// integracion/e2e/compartir.mjs · Andén simulador, corte 1 · Integración (corte-1.md §10.8 y §12.7).
// Compartir: el enlace (plantilla + receta: la noche, el instante y la velocidad) y su QR; «Abrir en otra pestaña» abre el enlace TAL
// CUAL se comparte (sin el modo de depuración) y esa pestaña calcula sola las cien noches: la huella agregada tiene que ser la misma y el
// sello tiene que decir «reproducida en este dispositivo». Y el enlace hostil H01 (una bomba de deflate) por la URL: aviso, sin cuelgue.
import { abrirPestana } from './comun.mjs';

export async function compartir({ contexto, base, etiqueta, fallar, ok, guardar }) {
  const h = await abrirPestana(contexto, { fallar, etiqueta });
  const { page } = h;
  const datos = {};
  await page.goto(`${base}?depuracion=1#t=hub-chico@1.0.0`);
  await h.pantalla('escena', 60_000);
  // las cien noches listas y la escena ya en la noche mediana (la que se comparte)
  await h.esperar(() => { const s = window.__anden.sesion; return s.nochesListas && !!s.comprobante && s.cualNoche === 'mediana' && !s.cargandoNoche; },
    null, 120_000, 'las cien noches del hub chico y la noche mediana');
  // quien comparte se para en un momento de la noche (23:40) a ×600
  await h.sesion(() => { const a = window.__anden.almacen; a.despachar({ tipo: 'pausar' }); a.despachar({ tipo: 'cabezal', t: (23 * 60 + 40) * 60_000 }); });
  const original = await h.sesion(() => {
    const s = window.__anden.sesion;
    return { huellaAgregada: s.comprobante.huellaAgregada, noche: s.noche.replica, huellaNoche: s.noche.salida.resultado.huella, modelo: s.mv.huella };
  });
  await h.clic('ir-compartir'); await h.pantalla('compartir', 30_000);
  const enlace = await page.inputValue('[data-enlace]');
  const qr = await page.$eval('[data-qr]', (c) => ({ ancho: c.width, oculto: c.hidden }));
  const viaja = await page.$$eval('[data-viaja] li', (xs) => xs.map((x) => x.textContent));
  if (!/^http:\/\/127\.0\.0\.1:\d+\/#t=hub-chico@1\.0\.0&r=/.test(enlace)) fallar(`${etiqueta} · compartir: el enlace «${enlace.slice(0, 90)}» no es plantilla + receta`);
  if (/depuracion/.test(enlace)) fallar(`${etiqueta} · compartir: el enlace lleva el modo de depuración`);
  if (qr.oculto || !(qr.ancho >= 100)) fallar(`${etiqueta} · compartir: el QR no se dibujó (ancho ${qr.ancho}, oculto ${qr.oculto})`);
  if (!viaja.some((x) => /receta/.test(x))) fallar(`${etiqueta} · compartir: «qué viaja» no menciona la receta (${viaja.join(' | ')})`);
  datos.enlace = { largo: enlace.length, qrPx: qr.ancho };
  await h.sinDesborde('compartir');
  await guardar('compartir-qr', page, { completa: true });
  // la otra pestaña: el mismo enlace, sin depuración (como lo abriría quien lo recibe)
  const [otra] = await Promise.all([contexto.waitForEvent('page', { timeout: 15_000 }), h.clic('probar-enlace')]);
  const errOtra = [];
  otra.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errOtra.push(`otra pestaña · consola ${m.type()}: ${m.text()}`); });
  otra.on('pageerror', (e) => errOtra.push(`otra pestaña · error de página: ${e.message}`));
  otra.on('request', (r) => { const u = new URL(r.url()); if (/^https?:$/.test(u.protocol) && u.hostname !== '127.0.0.1') errOtra.push(`otra pestaña · pedido a otro sitio: ${r.url()}`); });
  const urlOtra = otra.url();
  if (urlOtra !== enlace) fallar(`${etiqueta} · compartir: la otra pestaña abrió «${urlOtra.slice(0, 90)}» y el enlace era «${enlace.slice(0, 90)}»`);
  await otra.waitForSelector('section[data-pantalla="escena"][data-listo="1"]', { timeout: 60_000 });
  await otra.waitForSelector('[data-sello="reproducida-reproducida"]', { timeout: 120_000 }).catch(() => {});
  const sello = await otra.$eval('[data-sello^="reproducida"]', (x) => ({ tipo: x.getAttribute('data-sello'), texto: x.textContent?.trim() }));
  if (sello.tipo !== 'reproducida-reproducida') fallar(`${etiqueta} · compartir: el sello de la otra pestaña es «${sello.tipo}: ${sello.texto}» (se esperaba «reproducida»)`);
  const etq = await otra.textContent('[data-etiqueta-noche="A"]');
  const hora = await otra.textContent('[data-hora]');
  await guardar('compartir-reabierto', otra, { completa: true, altoMax: 1300 });
  // el comprobante de la otra pestaña: misma huella agregada, misma noche y misma huella de la noche
  await otra.click('[data-accion="ir-comprobante"]');
  await otra.waitForSelector('section[data-pantalla="comprobante"][data-listo="1"]', { timeout: 60_000 });
  const receta = await otra.$$eval('[data-comprobante="receta"] dd', (xs) => xs.map((x) => x.textContent?.trim()));
  // orden de app/pantallas/comprobante.ts: huella del modelo, motor, semilla, noches, noche, instante, velocidad, escenarios, agregada, noche
  const otraHuellas = { modelo: receta[0], huellaAgregada: receta[8], huellaNoche: receta[9], noche: receta[4] };
  if (otraHuellas.huellaAgregada !== original.huellaAgregada) fallar(`${etiqueta} · compartir: huella agregada ${otraHuellas.huellaAgregada} en la otra pestaña y ${original.huellaAgregada} en la original`);
  if (otraHuellas.huellaNoche !== original.huellaNoche) fallar(`${etiqueta} · compartir: la noche que se ve tiene huella ${otraHuellas.huellaNoche} y la original ${original.huellaNoche}`);
  if (otraHuellas.modelo !== original.modelo) fallar(`${etiqueta} · compartir: huella del modelo ${otraHuellas.modelo} contra ${original.modelo}`);
  if (!new RegExp(`^Noche ${original.noche + 1} de 100 · la que eligió quien armó el enlace$`).test(etq ?? '')) fallar(`${etiqueta} · compartir: la otra pestaña muestra «${etq}»`);
  if (hora !== '23:40') fallar(`${etiqueta} · compartir: la otra pestaña abrió a las ${hora} (el enlace decía 23:40)`);
  datos.huellaAgregada = original.huellaAgregada; datos.sello = sello.texto; datos.otraPestana = { etiqueta: etq, hora };
  for (const e of errOtra) fallar(`${etiqueta} · ${e}`);
  ok(`${etiqueta} · compartir: enlace de ${enlace.length} caracteres con QR de ${qr.ancho} px; la otra pestaña: «${etq}» a las ${hora}, ` +
    `huella agregada ${otraHuellas.huellaAgregada} = la original, sello «${sello.texto}»`);
  const faltan = await h.faltantes();
  if (faltan.length) fallar(`${etiqueta} · compartir: claves de texto faltantes: ${faltan.join(', ')}`);
  await otra.close();
  await page.close();
  return { datos, errores: h.errores };
}

/** Enlace hostil H01 por la URL (modelo/pruebas/hostiles/entradas.ts): se rechaza con su aviso, se vuelve al inicio y la página responde. */
export async function enlaceHostil({ contexto, base, etiqueta, prep, fallar, ok, guardar }) {
  const h = await abrirPestana(contexto, { fallar, etiqueta });
  const { page } = h;
  const t0 = Date.now();
  await page.goto(`${base}?depuracion=1#${prep.hostil}`);
  await page.waitForSelector('[data-aviso="modelo.enlace.bomba"]', { timeout: 15_000 });
  const avisoMs = Date.now() - t0;
  await h.pantalla('inicio', 15_000);
  const aviso = (await page.textContent('[data-aviso] p'))?.trim();
  // sin cuelgue: la página contesta enseguida y el inicio se puede usar
  const tr = Date.now();
  await page.evaluate(() => 1);
  const respuestaMs = Date.now() - tr;
  if (respuestaMs > 1000) fallar(`${etiqueta} · enlace hostil: la página tardó ${respuestaMs} ms en contestar después del aviso`);
  await guardar('enlace-hostil', page);
  await page.click('[data-accion="abrir-plantilla"][data-plantilla="hub-chico@1.0.0"]');
  await h.pantalla('escena', 60_000);
  ok(`${etiqueta} · enlace hostil H01 (${prep.hostil.length} caracteres): aviso a los ${avisoMs} ms («${aviso}»), la página contesta en ${respuestaMs} ms y abre una plantilla`);
  const faltan = await h.faltantes();
  if (faltan.length) fallar(`${etiqueta} · enlace hostil: claves de texto faltantes: ${faltan.join(', ')}`);
  await page.close();
  return { datos: { avisoMs, respuestaMs, aviso, caracteres: prep.hostil.length }, errores: h.errores };
}
