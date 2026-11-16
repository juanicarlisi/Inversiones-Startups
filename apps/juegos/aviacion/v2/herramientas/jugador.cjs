// Jugador automático de la v2: juega solo siguiendo «Siguiente paso» (lo mismo que haría alguien que no sabe nada) y avisa
// si aparece un error de JavaScript. Sirve para comprobar que el capítulo 1 se puede jugar de punta a punta con la capa nueva.
//   node herramientas/jugador.cjs [minutos de juego reales simulados = 12] [carpeta de capturas]
// Necesita dist/ servido en http://localhost:8812 (npm run servir). VEL=0.5|1|3 fija la velocidad (por defecto, la de una partida
// nueva: tranquila).
// Desde la etapa 1 (16-11-2026): con un panel abierto el reloj está frenado, así que el jugador decide y cierra antes de seguir;
// el parte de la mañana se cierra con su botón («A trabajar») como cualquier ventana; compra solo lo que marca «Siguiente paso»
// (el botón que late) y, si la tarjeta de un panel dice que la compra pierde plata, no la hace.
// Desde los arreglos de la prueba a ciegas 1 (16-11-2026): toca «Seguir» en el cartel de misión cumplida (si no, se va solo a los
// 9 s), no toca el paso cuando dice «te faltan $ X» (ahí se espera) y mide, con el reloj de verdad, cuántos segundos hubo dos o
// más carteles con texto a la vez (el festejo, la tarjeta de arriba, la burbuja de la guía y el aviso de abajo): tiene que dar 0.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');

(async () => {
  const minutos = +(process.argv[2] ?? 12), carpeta = process.argv[3] ?? null;
  const url = process.env.URL_JUEGO ?? 'http://localhost:8812/index.html';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(String(e).slice(0, 300)));
  p.on('console', (m) => { if (m.type() === 'error') errores.push(m.text().slice(0, 300)); });
  await p.goto(`${url}?calidad=${process.env.CALIDAD ?? 'bajo'}&nuevo=1&saltar=guia&lang=es`);
  await p.waitForFunction(() => window.__hn?.estado?.escena === 'juego', null, { timeout: 60000 });
  if (process.env.VEL) await p.evaluate((v) => window.__hn.fijarVel(+v), process.env.VEL);
  // carteles a la vez: una muestra cada 100 ms del reloj de verdad
  await p.evaluate(() => {
    const L = window.__carteles = { dos: 0, alguno: 0, total: 0, juntos: {}, pasos: 0 };
    const vis = (sel) => { const e = document.querySelector(sel); return !!e && !e.hidden && e.offsetParent !== null && getComputedStyle(e).opacity !== '0'; };
    let ult = performance.now(), ultPaso = null;
    setInterval(() => {
      const ahora = performance.now(), dt = (ahora - ult) / 1000; ult = ahora;
      const v = ['#cartel', '#momento', '#burbuja'].filter(vis); if (document.querySelector('#avisos .aviso:not(.fuera)')) v.push('#avisos');
      L.total += dt; if (v.length) L.alguno += dt;
      if (v.length >= 2) { L.dos += dt; const k = v.join(' + '); L.juntos[k] = +((L.juntos[k] ?? 0) + dt).toFixed(1); }
      const k = window.__hn.paso?.clave ?? null; if (k !== ultPaso) { ultPaso = k; L.pasos++; }
    }, 100);
  });
  let partes = 0, resultados = 0, frenado = 0, vueltas = 0;
  const foto = async (n) => { if (carpeta) { await p.waitForTimeout(2500); await p.screenshot({ path: path.join(carpeta, n) }); } };
  const hitos = [];
  let ultimaMision = null, fotoNoche = false, fotoFaros = false, fotoBase = false;
  const tramo = 2; // segundos reales simulados por vuelta
  for (let seg = 0; seg < minutos * 60; seg += tramo) {
    const e = await p.evaluate((tramo) => {
      const h = window.__hn, doc = document;
      h.cuentas();                               // las cuentas de las tarjetas, ya (en el juego se hacen de a ratitos)
      // cerrar ventanas (también el parte de la mañana) y elegir en los momentos
      const esParte = !!doc.querySelector('#ventana:not([hidden]) .consejo');
      const res = !!doc.querySelector('#momento.res:not([hidden])');
      const v = doc.querySelector('#ventana:not([hidden]) [data-accion="siguienteCapitulo"], #ventana:not([hidden]) [data-accion="cerrarVentana"].boton');
      if (v) v.click();
      const festejo = doc.querySelector('#cartel:not([hidden])'); if (festejo) festejo.click();       // «Seguir» en la misión cumplida
      const el = doc.querySelector('#momento:not([hidden]) .elige button'); if (el) el.click();
      // seguir el consejo: tocar «Siguiente paso» y después el botón que late (con un panel abierto el reloj está frenado)
      const panel = doc.querySelector('#panel:not([hidden])');
      const late = [...doc.querySelectorAll('#panel .late:not(.no), #mision .late')].find((x) => x.offsetParent !== null);   // solo lo que se ve
      if (late) late.click();
      else if (!panel) { if (!String(h.paso?.clave ?? '').startsWith('junta')) h.tocarPaso(); }      // «te faltan $ X»: se espera
      else {
        // sin botón marcado: abre la ruta si es lo que hay; si no, cierra el panel para que el reloj siga
        const m = doc.querySelector('#panel [data-accion="abrirRuta"]:not(.no)');
        if (m && !doc.querySelector('#panel .porque.mal')) m.click(); else doc.querySelector('#panel [data-accion="cerrarPanel"]')?.click();
      }
      h.avanzar(tramo);
      const s = h.s;
      return { ...h.estado, esParte, res, noche: h.M.esNoche(s), balizas: s.rutas.filter((r) => r.balizas).length, t: s.t, cap: s.cap, misiones: s.misiones.length, paso: doc.querySelector('#paso .txt')?.textContent ?? '' };
    }, tramo);
    vueltas++; if (e.esParte) partes++; if (e.res) resultados++; if (e.frenado) frenado++;
    // la interfaz descarta los toques a menos de 120 ms del anterior (filtro de doble toque): sin esta pausa, el jugador automático
    // perdía la mayoría de sus toques según cómo cayeran los cuadros, y cada corrida daba otra cosa
    await p.waitForTimeout(130);
    if (e.mision !== ultimaMision) { hitos.push(`${(seg / 60).toFixed(1)} min: misión ${e.mision} · $${Math.round(e.dinero)} · ${e.rutas} rutas · ${e.aviones} aviones`); ultimaMision = e.mision; }
    if (carpeta && !fotoNoche && e.noche && e.aviones >= 2 && e.balizas === 0) { fotoNoche = true; await foto('j-noche-sin-faros.png'); }
    if (carpeta && !fotoFaros && e.noche && e.balizas >= 1) { fotoFaros = true; await p.evaluate(() => window.__hn.verRed()); await foto('j-noche-faros.png'); }
    if (carpeta && !fotoBase && e.rutas >= 3 && !e.noche) { fotoBase = true; await p.evaluate(() => { const h = window.__hn; h.elegir({ tipo: 'ciudad', id: 'BUE' }); h.avanzar(1.5); }); await foto('j-base.png'); await p.evaluate(() => document.querySelector('[data-accion="cerrarPanel"]')?.click()); }
    if (e.cap > 1) { hitos.push(`${(seg / 60).toFixed(1)} min: capítulo ${e.cap}`); break; }
  }
  const fin = await p.evaluate(() => ({ ...window.__hn.estado, misiones: window.__hn.s.misiones, dia: Math.round(window.__hn.s.t / 1440 * 10) / 10, diasLibro: window.__hn.libro.dias.length, promesas: window.__hn.libro.promesas.length, notas: window.__hn.libro.notas.length }));
  console.log(`partes de la mañana cerrados: ${partes} · vueltas con un resultado en pantalla: ${resultados} · vueltas con el reloj frenado al terminar: ${frenado} de ${vueltas}`);
  const C = await p.evaluate(() => window.__carteles);
  console.log(`carteles con texto: ${C.alguno.toFixed(0)} s con alguno a la vista de ${C.total.toFixed(0)} s de reloj · dos o más carteles a la vez: ${C.dos.toFixed(1)} s${C.dos > 0 ? ' ' + JSON.stringify(C.juntos) : ''} · «Siguiente paso» cambió de propuesta ${C.pasos} veces`);
  if (carpeta) await foto('j-fin.png');
  console.log(hitos.join('\n'));
  console.log('final:', JSON.stringify(fin));
  console.log(errores.length ? `ERRORES (${errores.length}):\n${[...new Set(errores)].join('\n')}` : 'sin errores de JavaScript');
  await b.close();
  process.exit(errores.length || C.dos >= 0.5 ? 1 : 0);
})();
