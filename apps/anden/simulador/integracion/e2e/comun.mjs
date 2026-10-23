// integracion/e2e/comun.mjs · Andén simulador, corte 1 · Integración (corte-1.md §10.8). Lo común a los recorridos de punta a punta.
//   · los enlaces de los recorridos, armados en Node con el mismo ensamblado que corre en los Workers (el motor es determinista y R04
//     prueba que Node = Chromium, así que lo que se calcula acá es lo que el navegador va a ver);
//   · abrir una página con los oídos puestos en la consola (0 errores ni avisos), esperar pantallas, tocar el lienzo de verdad y capturar.
// Nada de esto se publica: el servidor escucha en 127.0.0.1 y las capturas quedan en e2e/capturas/.
import { createRequire } from 'node:module';
import { join } from 'node:path';

export const CHROMIUM = process.env.CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
export function playwright() {
  const requerir = createRequire(join(process.env.NODE_PATH ?? '/opt/node-tools/node_modules', 'x.js'));
  return requerir('playwright');
}

/** Las cuatro combinaciones de §10.8 (y §12.8): 360 × 740 y 1280 × 800, claro y oscuro. */
export const COMBOS = [
  { ancho: 1280, alto: 800, tema: 'claro' }, { ancho: 1280, alto: 800, tema: 'oscuro' },
  { ancho: 360, alto: 740, tema: 'claro' }, { ancho: 360, alto: 740, tema: 'oscuro' },
];
export const etiquetaCombo = (c) => `${c.ancho}-${c.tema}`;

const rep = (path, value) => ({ op: 'replace', path, value });

/**
 * Primer minuto (§10.8 y diseño maestro §5.3): «Mirá cómo se traba el hub», con el enlace de la plantilla GRANDE.
 * El hub de quien comparte tiene 9 personas de rampa (no 15) y las reparte por vecindad, en tramos de igual cantidad de rampas (2 cambios
 * sobre hub-lazo-noche@1.0.0): cuando falta alguien, sus rampas se suman a las de la persona siguiente (regla 7) y esa persona no da
 * abasto. El enlace lleva la receta de la peor de las cien noches, parada en un instante en que se ve un paquete que pierde el corte con
 * una causa confirmada. «Balancear el plan» (bloques de rampas vecinas con la carga pareja entre las personas presentes) tiene algo que
 * mejorar: MEDIDO el 20-10-2026 con el motor 1.1.0 en 100 noches, P(todo antes del corte) 0,84 → 0,98 y recirculación 5,0% → 0,0%.
 * Con 8 personas la peor noche no terminaba en el horizonte (alerta «no-termina»); con 10 o más casi no hay diferencia (0,97 → 0,98); con
 * las 15 de la plantilla, ninguna rampa se llena con ninguno de los dos planes desde el motor 1.1.0. Con la plantilla tal cual el plan ya
 * va por volumen: la app lo dice y no compara (lo prueba aparte el recorrido).
 */
export const PARCHE_PRIMER_MINUTO = [rep('/personas/rampa/cantidad', 9), rep('/personas/rampa/asignacion', 'contiguas')];

/**
 * Decidir (§10.8): con hub-chico@1.0.0 tal cual ninguna opción cumple la meta (integracion/NOTAS-CONTRATO.md §3.2) y el formulario no
 * puede llegar a «Ya está». El recorrido abre la plantilla chica con los datos de un hub propio, sin tocar la plantilla publicada:
 * 1 retén, 7 personas de rampa, 2 puestos manuales (los de la propuesta hub-chico@1.1.0) y el corte a las 03:00. Con eso la decisión
 * tiene respuesta (2 puestos) y el formulario pregunta lo que la puede cambiar (MEDIDO en Node el 19-10-2026: el tiempo de inducción y
 * el error del pronóstico).
 */
export const PARCHE_DECIDIR = [
  rep('/personas/induccion/reten', 1), rep('/personas/rampa/cantidad', 7), rep('/personas/excepcion/cantidad', 2), rep('/calendario/corte', '27:00'),
];

/**
 * Prepara en Node lo que los recorridos necesitan saber de antemano: la peor noche del hub del primer minuto, un paquete de esa noche
 * que pierde el corte con una causa CONFIRMADA por el contrafactual (el mismo que corre la app), y el instante en que espera a la vista.
 * Devuelve los fragmentos de los enlaces (lo que va después de #).
 */
export async function prepararEnlaces({ log = () => {} } = {}) {
  const { crearServicios } = await import('../puente.ts');
  const { fabricaDeHilos } = await import('../pruebas/hilos.ts');
  const { ensamblar } = await import('../ensamblar.ts');
  const { causasConfirmadas, esperasDe } = await import('../../explicacion/indice.ts');
  const { Prioridad } = await import('../../contratos/experimentos.ts');
  const { ClaseEntidad } = await import('../../contratos/traza.ts');
  const E = ensamblar();
  const hilos = fabricaDeHilos();
  const S = crearServicios({ fabrica: hilos.fabrica, trabajadores: 3 });
  try {
    const t0 = Date.now();
    const base = await E.compilar(E.plantillas['hub-lazo-noche@1.0.0']);
    if (!base.ok) throw new Error('hub-lazo-noche@1.0.0 no compila');
    const mv = await E.variante(base.mv, PARCHE_PRIMER_MINUTO);
    const semilla = mv.modelo.experimento.semilla, N = mv.modelo.experimento.nochesEscena;
    const noches = await S.noches(mv, semilla, 0, N, Prioridad.NOCHES);
    const mapa = S.agregarRiesgo(noches, mv.modelo.experimento.kpiNoche);
    const peor = mapa.nochePeor;
    log(`primer minuto: ${N} noches del hub grande con rampas vecinas en ${((Date.now() - t0) / 1000).toFixed(1)} s; la peor es la ${peor + 1}`);
    const { traza } = E.simularNoche(mv, semilla, peor, { traza: 'completa' });
    const P = traza.paquetes;
    // paquetes que pierden el corte, primero los que más esperaron (más chances de una causa confirmada)
    const atrasados = [];
    for (let e = 0; e < P.n; e++) if (P.creado[e] >= 0 && (P.listo[e] < 0 || P.listo[e] > traza.corte)) atrasados.push(e);
    const espera = (e) => esperasDe(traza, ClaseEntidad.PAQUETE, e).reduce((m, w) => (w.hasta - w.desde > m.hasta - m.desde ? w : m), { desde: 0, hasta: 0 });
    const candidatos = atrasados.map((e) => ({ e, w: espera(e) })).filter((x) => x.w.hasta - x.w.desde >= 5 * 60_000)
      .sort((a, b) => (b.w.hasta - b.w.desde) - (a.w.hasta - a.w.desde)).slice(0, 12);
    let elegido = null;
    for (const { e, w } of candidatos) {
      const r = await causasConfirmadas(traza, mv, semilla, peor, P.camion[e], P.indice[e],
        (cambio) => E.contrafactual(E.simularNoche, mv, semilla, peor, P.camion[e], P.indice[e], cambio, E.variante));
      const confirmados = r.contrafactuales.filter((c) => c.confirma);
      if (confirmados.length) { elegido = { e, w, causa: confirmados[0].cambio.clave }; break; }
    }
    if (!elegido) throw new Error(`primer minuto: ninguno de los ${candidatos.length} paquetes atrasados de la noche ${peor + 1} tiene una causa confirmada`);
    // el instante del enlace: un poco antes de la mitad de su espera más larga (se ve quieto, esperando)
    const instante = Math.round((elegido.w.desde + elegido.w.hasta) / 2 / 60_000) * 60_000;
    log(`primer minuto: paquete ${P.indice[elegido.e] + 1} del camión ${P.camion[elegido.e] + 1}, ${atrasados.length} atrasados en la noche, ` +
      `causa confirmada «${elegido.causa}», espera de ${((elegido.w.hasta - elegido.w.desde) / 60_000).toFixed(1)} min; enlace a las ${horaDe(instante)}`);
    // la receta lleva la huella agregada de las cien noches del autor (`h`, hallazgo H1): la pestaña que abre el enlace la compara con la
    // suya y recién entonces dice «reproducida»
    const comprobante = await S.comprobante(mv, noches, S.semaforoDe(mv, noches));
    const receta = { v: 1, modelo: mv.huella, motor: E.versionMotor, semilla, replicas: N, noche: peor, t: instante, vel: 600, h: comprobante.huellaAgregada };
    const primerMinuto = await E.codec.codificar({ tipo: 'plantilla', plantilla: { id: 'hub-lazo-noche', version: '1.0.0' }, parche: PARCHE_PRIMER_MINUTO, receta });
    const decidir = await E.codec.codificar({ tipo: 'plantilla', plantilla: { id: 'hub-chico', version: '1.0.0' }, parche: PARCHE_DECIDIR });
    // H01 de modelo/pruebas/hostiles: una bomba de deflate (10 MB de ceros en ~13.000 caracteres de enlace); y H07b (hallazgo SEG-01):
    // un modelo que pasaba los topes de paquetes y eventos y pedía una película de millones de tramos (más de 1 GB en la pestaña)
    const { HOSTILES } = await import('../../modelo/pruebas/hostiles/entradas.ts');
    const hostil = await HOSTILES.find((x) => x.id === 'H01').fragmento();
    const hostilPelicula = await HOSTILES.find((x) => x.id === 'H07b').fragmento();
    return {
      primerMinuto, decidir, hostil, hostilPelicula, peor, instante, huellaModeloPrimerMinuto: mv.huella, huellaAgregadaPrimerMinuto: comprobante.huellaAgregada,
      paquete: { camion: P.camion[elegido.e], indice: P.indice[elegido.e], causa: elegido.causa },
      atrasadosEnLaPeor: atrasados.length,
    };
  } finally {
    S.cerrar();
    await hilos.terminarTodos();
  }
}

export function horaDe(ms) {
  const m = Math.floor(ms / 60_000);
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/**
 * Una pestaña con oídos: junta errores y avisos de consola, errores de página, pedidos fallidos, pedidos a otro sitio y diálogos (el
 * corte exige 0 de todo). Devuelve ayudas para los recorridos.
 */
export async function abrirPestana(contexto, { fallar, etiqueta }) {
  const page = await contexto.newPage();
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errores.push(`consola ${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => errores.push(`error de página: ${e.message}`));
  page.on('requestfailed', (r) => { if (!/favicon/.test(r.url())) errores.push(`pedido fallido: ${r.url()} (${r.failure()?.errorText})`); });
  // nada sale de esta máquina (corte-1.md §12.12): todo pedido va al servidor local
  page.on('request', (r) => { const u = new URL(r.url()); if (/^https?:$/.test(u.protocol) && u.hostname !== '127.0.0.1') errores.push(`pedido a otro sitio: ${r.url()}`); });
  page.on('dialog', (d) => { errores.push(`diálogo inesperado: ${d.message()}`); void d.dismiss(); });
  const h = {
    page, errores,
    /** Espera la pantalla `p` lista (data-listo="1"). */
    pantalla: (p, ms = 60_000) => page.waitForSelector(`section[data-pantalla="${p}"][data-listo="1"]`, { timeout: ms }),
    clic: (accion) => page.click(`[data-accion="${accion}"]`),
    sesion: (f, arg) => page.evaluate(f, arg),
    esperar: (f, arg, ms, que) => page.waitForFunction(f, arg, { timeout: ms }).catch(() => { throw new Error(`${que}: no llegó en ${ms / 1000} s`); }),
    /** Página que no desborda a lo ancho (ningún elemento fuera de la pantalla, salvo tablas y el JSON, que se desplazan a propósito). */
    async sinDesborde(donde) {
      const d = await page.evaluate(() => {
        const fuera = [...document.querySelectorAll('#contenido *')].filter((e) => {
          if (e.closest('.tabla-contenedor, textarea')) return false;
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (r.right > window.innerWidth + 1 || r.left < -1);
        }).slice(0, 3).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}`);
        return { sw: document.documentElement.scrollWidth, w: window.innerWidth, fuera };
      });
      if (d.sw > d.w + 1) fallar(`${etiqueta} · ${donde}: la página desborda a lo ancho (se esperaba ≤ ${d.w} px y salió ${d.sw} px)`);
      if (d.fuera.length) fallar(`${etiqueta} · ${donde}: elementos que se salen de la pantalla: ${d.fuera.join(', ')}`);
    },
    /** Claves de texto que se pidieron y no existen (tiene que dar 0). */
    faltantes: () => page.evaluate(() => window.__anden?.faltantes?.() ?? []),
  };
  return h;
}

/**
 * Toca de verdad (con el puntero) la entidad (clase, id) en el lienzo de la escena, en el instante del cabezal. Para saber dónde está en
 * pantalla arma una vista igual (mismo reproductor, piso, tamaño y densidad) sobre un lienzo aparte y usa su aMundo (pantalla → mundo,
 * afín en 2D y en 2,5D) para invertirlo. Devuelve las coordenadas tocadas o lanza si la entidad no está a la vista.
 */
export async function tocarEntidad(page, selectorCaja, clase, id) {
  const punto = await dondeEsta(page, selectorCaja, clase, id);
  await page.mouse.click(punto.x, punto.y);
  return punto;
}

/**
 * Dónde está en la pantalla (coordenadas de la ventana) la entidad (clase, id) en el instante del cabezal, con la cámara que tiene el
 * lienzo: la del encuadre completo o la que dejó la persona al acercar o mover (data-camara).
 */
export async function dondeEsta(page, selectorCaja, clase, id) {
  return page.evaluate(({ selectorCaja, clase, id }) => {
    const a = window.__anden, s = a.sesion, r = s.noche?.reproductor;
    const caja = document.querySelector(selectorCaja);
    if (!r || !caja) throw new Error('no hay película o lienzo');
    const t = a.almacen.estado.t;
    const pos = r.crearPosiciones(); r.posiciones(t, pos);
    let k = -1;
    for (let i = 0; i < pos.n; i++) if (pos.clase[i] === clase && pos.id[i] === id) { k = i; break; }
    if (k < 0) throw new Error(`la entidad ${clase}:${id} no está a la vista a las ${t} ms`);
    const rect = caja.getBoundingClientRect();
    const piso = caja.dataset.piso ?? '2d';
    const lienzo = document.createElement('canvas');
    const v = a.servicios.crearVista(lienzo, r, a.ctx.estilo(), piso);
    v.redimensionar(Math.round(rect.width), Math.round(rect.height), Math.min(2, devicePixelRatio || 1));
    // si la persona acercó o movió la cámara, la del lienzo está en data-camara (app/ui/lienzo.ts)
    if (caja.dataset.camara) v.camara = JSON.parse(caja.dataset.camara);
    const [x0, y0] = v.aMundo(0, 0), [x1, y1] = v.aMundo(100, 0), [x2, y2] = v.aMundo(0, 100);
    v.destruir();
    // mundo = o + px·u + py·w (por 100 px)  →  se resuelve px, py
    const ux = (x1 - x0) / 100, uy = (y1 - y0) / 100, wx = (x2 - x0) / 100, wy = (y2 - y0) / 100;
    const det = ux * wy - uy * wx, dx = pos.x[k] - x0, dy = pos.y[k] - y0;
    const px = (dx * wy - dy * wx) / det, py = (ux * dy - uy * dx) / det;
    if (!(px >= 0 && py >= 0 && px <= rect.width && py <= rect.height)) throw new Error(`la entidad queda fuera del lienzo (${px.toFixed(0)}, ${py.toFixed(0)})`);
    return { x: rect.left + px, y: rect.top + py, estado: pos.estado[k] };
  }, { selectorCaja, clase, id });
}

/** Captura de la pantalla visible (o de una parte de la página: `alto` px desde arriba), con el desplazamiento arriba. */
export async function capturar(page, archivo, { completa = false, altoMax = 1600 } = {}) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(120);
  if (!completa) { await page.screenshot({ path: archivo }); return; }
  const { w, h } = await page.evaluate(() => ({ w: window.innerWidth, h: document.documentElement.scrollHeight }));
  await page.screenshot({ path: archivo, fullPage: true, clip: { x: 0, y: 0, width: w, height: Math.min(h, altoMax) } });
}
