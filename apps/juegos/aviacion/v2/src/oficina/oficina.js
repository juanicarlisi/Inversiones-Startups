// La oficina de la base: una escena 3D propia que funciona como el menú del juego. Módulo aparte: no sabe nada del modelo.
// Recibe los datos del «contrato de datos de la oficina» (diseno-carrera.md, §5) y pide acciones con accion({ tipo, … }).
//
//   const oficina = crearOficina({ contenedor, idioma, calidad, datos: () => objeto, accion: (a) => {}, sonido: (nombre, valor) => {} });
//   oficina.abrir();      // crea la escena y entra (la primera vez: puerta, nombre de la empresa y recorrido)
//   oficina.cerrar();     // sale y libera la escena entera (GPU incluida)
//   oficina.liberar();    // lo mismo, sin transición, para cuando se descarta el módulo
//
// Renderizador propio (no el del juego): se crea al entrar y se destruye al salir. Ver el README, «Decisiones».
// La interfaz vive en un árbol aparte (shadow DOM): los estilos del juego no la tocan y los suyos no se escapan (el juego
// también usa clases como .nota, .dato o .avion). Por eso la hoja de estilos se importa como texto y se pone ahí adentro.
import ESTILOS from './oficina.css' with { type: 'text' };
import { crearEscena, NIVELES_OFICINA } from './escena.js';
import { crearTextos, horaNumero, horaTexto, COLOR_DEFECTO } from './textos.js';
import { HOJAS, ORDEN_OBJETOS, filaDia, diasDelLibro, ico, esc } from './hojas.js';
import { correrPrimera } from './primera.js';
import { Medidor } from '../mundo/calidad.js';

const retratosHechos = new Map();     // tipo de avión → imagen (se dibujan una vez por sesión)
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export function crearOficina({ contenedor, idioma = 'es', calidad = 'medio', datos, accion = () => {}, sonido = null }) {
  let raiz = null, anfitrion = null, lienzo = null, E = null, F = null, d = null, medidor = null;
  let abierta = false, turno = 0, estado = 'cerrada', foco = null, raf = 0, ultimo = 0, pausado = false, manual = false;
  let W = 1, H = 1, escala = 1, nivel = NIVELES_OFICINA.medio, fijo = false, tactil = false, sobre = null, primera = null, hora = 9;
  let abajo = null, rot = {}, colorPrueba = null, desmontarViejo = null, temporizadores = [];
  const $ = (s) => raiz.querySelector(s);
  const sonar = (n, v) => { try { sonido?.(n, v); } catch { /* el sonido nunca rompe la oficina */ } };
  const pedir = (a) => { try { return accion(a); } catch (e) { console.error('[oficina] la acción falló', a, e); return { ok: false }; } };
  const luego = (fn, ms) => { const id = setTimeout(() => { temporizadores = temporizadores.filter((x) => x !== id); if (abierta) fn(); }, ms); temporizadores.push(id); return id; };
  const angosto = () => W <= 720;

  function leerDatos() {
    let x = {};
    try { x = (typeof datos === 'function' ? datos() : datos) ?? {}; } catch (e) { console.error('[oficina] no se pudieron leer los datos', e); }
    return { empresa: {}, hoy: {}, dias: [], rutas: [], flota: [], bandeja: [], cuaderno: [], carrera: null, ...x };
  }
  function elegirNivel(c) {
    const nombre = typeof c === 'string' ? c : c?.nombre;
    nivel = NIVELES_OFICINA[nombre] ?? NIVELES_OFICINA.medio;
    escala = typeof c === 'object' && c ? Math.max(0.5, Math.min(1, c.escala ?? c.escalaInicial ?? 1)) : 1;
    fijo = typeof c === 'object' && !!c?.fijo;
  }
  function fijarEstado(e) { estado = e; if (raiz) raiz.dataset.estado = e; }

  // ── montaje ──
  function montar() {
    raiz = document.createElement('div');
    raiz.className = 'ofi'; raiz.setAttribute('role', 'region'); raiz.setAttribute('aria-label', F.t('oficina'));
    if (tactil) raiz.dataset.tactil = '1';
    raiz.innerHTML = `
      <div class="ofi-rotulos"></div>
      <div class="ofi-barra">
        <button class="ofi-pastilla ofi-salir" data-of="salir">${ico('volver')}<span>${esc(F.t('salir'))}</span></button>
        <div class="ofi-pastilla ofi-empresa"><i></i><b></b></div>
        <div class="ofi-pastilla ofi-caja" title="${esc(F.t('enCajaCorto'))}">${ico('moneda')}<b></b></div>
        <div class="ofi-pastilla ofi-reloj"><span></span><b></b><em>${ico('pausa')}${esc(F.t('relojQuieto'))}</em></div>
      </div>
      <p class="ofi-pista">${esc(F.t('pista'))}</p>
      <aside class="ofi-hoja" hidden></aside>
      <div class="ofi-primera" hidden></div>
      <div class="ofi-velo"></div>`;
    anfitrion = document.createElement('div'); anfitrion.className = 'oficina-anfitrion'; anfitrion.style.cssText = 'position:absolute;inset:0;pointer-events:auto';
    const sombra = anfitrion.attachShadow({ mode: 'open' }), estilo = document.createElement('style');
    estilo.textContent = ESTILOS; sombra.append(estilo, raiz);
    contenedor.appendChild(anfitrion);
    raiz.addEventListener('click', alClic);
    raiz.addEventListener('submit', alEnviar);
    raiz.addEventListener('input', alEscribir);
    raiz.addEventListener('pointerover', alPasarHoja);
    addEventListener('resize', alMedir);
    addEventListener('keydown', alTecla);
    fijarEstado('entrando');
  }
  function ponerLienzo() {
    lienzo?.remove();
    lienzo = document.createElement('canvas'); lienzo.className = 'ofi-lienzo';
    raiz.prepend(lienzo);
    lienzo.addEventListener('pointermove', alMover);
    lienzo.addEventListener('pointerleave', () => { if (!tactil) senalar(null); E?.fijarCursor(0, 0); });
    lienzo.addEventListener('pointerdown', (e) => { abajo = { x: e.clientX, y: e.clientY }; });
    lienzo.addEventListener('pointerup', alSoltar);
    lienzo.addEventListener('webglcontextlost', (e) => e.preventDefault());
  }
  function armarEscena() {
    const caja = contenedor.getBoundingClientRect(); W = Math.max(1, Math.round(caja.width)); H = Math.max(1, Math.round(caja.height));
    ponerLienzo();
    E = crearEscena({ lienzo, q: nivel, vertical: W / H < 0.9, t: F.t, datos: d, hora });
    E.medir(W, H, escala);
    E.alTic(() => { if (!pausado && estado !== 'primera') sonar('telegrafo'); });
    crearRotulos(); ponerBarra();
  }
  // Retratos de los aviones para las tarjetas (uno por tipo y por color de empresa; se dibujan una vez por sesión).
  const colorActual = () => (d.empresa?.color || COLOR_DEFECTO).toLowerCase();
  function retratos() {
    const color = colorActual(), tipos = [...new Set(d.flota.map((a) => a.tipo))], faltan = tipos.filter((x) => !retratosHechos.has(`${x}|${color}`));
    if (faltan.length && E) { const r = E.retratos(faltan); for (const k of faltan) retratosHechos.set(`${k}|${color}`, r[k]); }
    return Object.fromEntries(tipos.map((x) => [x, retratosHechos.get(`${x}|${color}`)]));
  }
  function desmontar(deUna = false) {
    const r0 = raiz, a0 = anfitrion, e0 = E;
    cancelAnimationFrame(raf); for (const id of temporizadores) clearTimeout(id); temporizadores = [];
    removeEventListener('resize', alMedir); removeEventListener('keydown', alTecla);
    primera?.cortar(); primera = null;
    raiz = null; anfitrion = null; E = null; lienzo = null; rot = {}; foco = null; sobre = null; pausado = false;
    const fin = () => { desmontarViejo = null; try { e0?.liberar(); } catch (e) { console.error('[oficina] al liberar', e); } a0?.remove(); };
    if (deUna || !r0) fin(); else { r0.classList.add('saliendo'); const id = setTimeout(fin, 280); desmontarViejo = () => { clearTimeout(id); fin(); }; }
  }

  // ── barra y rótulos ──
  function ponerBarra() {
    const e = d.empresa ?? {};
    raiz.style.setProperty('--empresa', colorPrueba ?? e.color ?? COLOR_DEFECTO);
    $('.ofi-empresa b').textContent = e.nombre || F.t('nombreDefecto');
    $('.ofi-caja b').textContent = F.plata(d.hoy?.caja ?? 0);
    $('.ofi-reloj span').textContent = d.hoy?.fecha ?? ''; $('.ofi-reloj b').textContent = horaTexto(d.hoy?.hora ?? hora);
  }
  function subRotulo(id) {
    if (id !== 'bandeja') return F.t(`o_${id}_s`);
    const n = d.bandeja.filter((x) => !x.leido).length;
    return n ? F.t('o_bandeja_s', { n }) : F.t('o_bandeja_s0');
  }
  function crearRotulos() {
    const cont = $('.ofi-rotulos'); cont.replaceChildren(); rot = {}; for (const k of Object.keys(puestoRot)) delete puestoRot[k];
    for (const id of ORDEN_OBJETOS) {
      const b = document.createElement('button');
      b.className = 'ofi-rot'; b.dataset.of = 'objeto'; b.dataset.id = id;
      b.addEventListener('pointerenter', () => { if (!tactil) senalar(id); });
      b.addEventListener('pointerleave', () => { if (!tactil) senalar(null); });
      cont.appendChild(b); rot[id] = b;
    }
    textoRotulos();
  }
  function textoRotulos() {
    const sin = d.bandeja.filter((x) => !x.leido).length;
    for (const id of ORDEN_OBJETOS) if (rot[id]) rot[id].innerHTML = `<b>${esc(F.t(`o_${id}`))}</b><small>${esc(subRotulo(id))}</small>${id === 'bandeja' && sin ? `<span class="globo">${sin}</span>` : ''}`;
  }
  // Rótulos sin choques: por prioridad, cada uno prueba arriba, abajo y corrido a los lados, y se queda con el primer lugar
  // que no pisa a otro ni a la barra (la misma idea que ui/rotulos.js en el mapa). Recuerda su lugar para no titilar.
  const _p = {}, _q = {}, PRIORIDAD = ['mapa', 'flota', 'libro', 'bandeja', 'placa', 'cuaderno'], lugarRot = {}, puestoRot = {};
  function ponerRotulos() {
    if (estado !== 'casa' && estado !== 'entrando') return;
    const puestos = [[0, 0, W, 62]], pisa = (x, y, w, h) => x < 6 || x + w > W - 6 || y + h > H - 6 || puestos.some((r) => x < r[2] + 5 && x + w > r[0] - 5 && y < r[3] + 5 && y + h > r[1] - 5);
    for (const id of PRIORIDAD) {
      const o = E.objetos.get(id), el = rot[id]; if (!o || !el) continue;
      E.aPantalla(o.ancla, _p); E.aPantalla(o.pie, _q);
      const w = el.offsetWidth, h = el.offsetHeight, s = 10;
      const arriba = [_p.x - w / 2, _p.y - h - s, 0], abajo = [_q.x - w / 2, _q.y + s, 1];
      const lados = [[_p.x - w * 0.86, _p.y - h - s, 0], [_p.x - w * 0.14, _p.y - h - s, 0], [_q.x - w * 0.86, _q.y + s, 1], [_q.x - w * 0.14, _q.y + s, 1], [_p.x - w / 2, _p.y - 2 * h - s - 6, 0]];
      const opciones = id === 'placa' ? [abajo, arriba, ...lados] : [arriba, abajo, ...lados];
      // el lugar preferido manda siempre que entre; si no, se queda donde estaba (para no titilar) o busca el primero libre
      let k = 0;
      if (pisa(opciones[0][0], opciones[0][1], w, h)) { k = lugarRot[id] ?? 0; if (pisa(opciones[k][0], opciones[k][1], w, h)) { k = opciones.findIndex((c) => !pisa(c[0], c[1], w, h)); if (k < 0) k = 0; } }
      lugarRot[id] = k;
      const c = opciones[k], x = Math.max(6, Math.min(W - 6 - w, c[0])), y = Math.max(66, c[1]);
      puestos.push([x, y, x + w, y + h]);
      el.classList.toggle('abajo', c[2] === 1);
      el.style.setProperty('--tx', `${(k < 2 || k === 6 ? 50 : (k % 2 ? 86 : 14)).toFixed(0)}%`);
      // a píxeles enteros y solo si se movió de verdad: la letra no tiembla con la respiración de la cámara
      const u = puestoRot[id];
      if (!u || Math.abs(u[0] - x) >= 1 || Math.abs(u[1] - y) >= 1) { puestoRot[id] = [Math.round(x), Math.round(y)]; el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`; }
      el.style.visibility = _p.visible ? '' : 'hidden';
    }
  }
  function senalar(id) {
    if (sobre === id) return;
    sobre = id;
    E?.senalar(id);
    for (const k of ORDEN_OBJETOS) rot[k]?.classList.toggle('sobre', k === id);
    lienzo?.classList.toggle('mano', !!id);
    if (id) sonar('senalar', id);
  }

  // ── hojas ──
  function pintarHoja(conservar = false) {
    const cont = $('.ofi-hoja'), cuerpo = cont.querySelector('.h-cuerpo'), y = conservar && cuerpo ? cuerpo.scrollTop : 0;
    const extra = foco === 'flota' ? retratos() : foco === 'libro' ? pintarHoja.dia ?? null : foco === 'bandeja' ? !!pintarHoja.todas : undefined;
    cont.innerHTML = `<div class="hoja" data-hoja="${foco}" role="dialog" aria-label="${esc(F.t(`o_${foco}`))}">${HOJAS[foco](d, F, extra)}</div>`;
    if (y) cont.querySelector('.h-cuerpo').scrollTop = y;
  }
  function abrirHoja(id) {
    if (!E || !HOJAS[id] || estado === 'primera' || estado === 'entrando') return;
    const cambio = foco && foco !== id;
    if (foco === 'placa' && id !== 'placa') deshacerPrueba();
    foco = id; pintarHoja.dia = null; pintarHoja.todas = false; fijarEstado('foco'); sobre = null; E.senalar(null);
    $('.ofi-pista').classList.add('fuera');
    pausado = false;
    const cont = $('.ofi-hoja');
    const anchoHoja = Math.min(540, W * 0.46) + 14;
    E.irA(E.poseObjeto(id, angosto() ? {} : { derecha: anchoHoja / W }), cambio ? 0.9 : 1.1);
    const mostrar = () => {
      if (foco !== id) return;
      pintarHoja(); cont.hidden = false; cont.classList.remove('sale'); cont.classList.remove('entra'); void cont.offsetWidth; cont.classList.add('entra');
      if (angosto()) luego(() => { if (foco === id && angosto()) pausado = true; }, 560);   // la hoja tapa todo: el 3D descansa
    };
    if (angosto() && !cambio) luego(mostrar, 420); else mostrar();
    sonar('abrir', id);
  }
  function deshacerPrueba() { if (colorPrueba != null || deshacerPrueba.nombre) { colorPrueba = null; deshacerPrueba.nombre = false; E?.ponerEmpresa(d.empresa?.nombre || F.t('nombreDefecto'), d.empresa?.color || COLOR_DEFECTO); ponerBarra(); } }
  function cerrarHoja() {
    if (!foco) return;
    if (foco === 'placa') deshacerPrueba();
    const cont = $('.ofi-hoja');
    foco = null; pausado = false; ultimo = performance.now();
    cont.classList.remove('entra'); cont.classList.add('sale');
    luego(() => { if (!foco) { cont.hidden = true; cont.replaceChildren(); } }, 230);
    E.mapa.resaltar(null); E.senalar(null);
    E.irA(E.casa, 1.0);
    fijarEstado('casa');
    sonar('cerrar');
  }
  // Vuelve a pedir los datos al juego y repinta lo que cambió.
  function refrescar() {
    d = leerDatos(); hora = horaNumero(d.hoy?.hora, hora);
    if (colorPrueba == null && !deshacerPrueba.nombre) E.ponerEmpresa(d.empresa?.nombre || F.t('nombreDefecto'), d.empresa?.color || COLOR_DEFECTO);
    E.ponerDatos(d); ponerBarra(); textoRotulos();
    if (foco) pintarHoja(true);
  }

  // ── entrada ──
  function alClic(e) {
    const b = e.target.closest('[data-of]'); if (!b || !raiz.contains(b)) return;
    const que = b.dataset.of;
    if (que === 'salir') return salir();
    if (que === 'objeto') return abrirHoja(b.dataset.id);
    if (que === 'cerrar') return cerrarHoja();
    if (que === 'ir') {
      // ir a verlo en el mapa es salir de la oficina: cierra el juego (si devuelve { salir: true }) o, si no dice nada, la oficina
      const r = pedir({ tipo: 'ir', a: b.dataset.a, id: /^\d+$/.test(b.dataset.id) ? +b.dataset.id : b.dataset.id });
      if (abierta && (r === undefined || r?.salir)) { sonar('salir'); cerrar(); }
      return;
    }
    if (que === 'dia') {
      const n = +b.dataset.n, x = diasDelLibro(d, F).find((y) => y.n === n); if (!x) return;
      pintarHoja.dia = n;
      raiz.querySelectorAll('.bar').forEach((el) => el.classList.toggle('sel', el === b));
      $('#of-dia').innerHTML = filaDia(x, F); $('#of-dia-t').textContent = x.hoy ? F.t('hoyVa') : F.t('diaN', { n }); $('.d-fecha').textContent = x.fecha ?? '';
      return sonar('toque');
    }
    if (que === 'masNotas') { pintarHoja.todas = true; return pintarHoja(true); }
    if (que === 'leido') { b.closest('.nota')?.classList.add('yendo'); pedir({ tipo: 'leido', id: b.dataset.id }); sonar('papel'); return luego(refrescar, 260); }
    if (que === 'leerTodo') { for (const x of d.bandeja) if (!x.leido) pedir({ tipo: 'leido', id: x.id }); sonar('papel'); return refrescar(); }
    if (que === 'bandeja') { const r = pedir({ tipo: 'bandeja', id: b.dataset.id, accion: b.dataset.accion }); sonar('toque'); if (abierta && r?.salir) return cerrar(); return abierta ? refrescar() : undefined; }
    if (que === 'color') {
      if (primera) return primera.color(b.dataset.color, b);
      colorPrueba = b.dataset.color;
      b.parentElement.querySelectorAll('.muestra').forEach((m) => { m.classList.toggle('sel', m === b); m.setAttribute('aria-checked', m === b); });
      E.ponerEmpresa(undefined, colorPrueba); ponerBarra();
      return sonar('toque');
    }
    if (que === 'saltarPrimera') return primera?.saltar();
    if (que === 'pasoPrimera') return primera?.siguiente();
  }
  function alEnviar(e) {
    const f = e.target.closest('form[data-of]'); if (!f) return;
    e.preventDefault();
    if (f.dataset.of === 'formPrimera') return primera?.confirmar();
    const nombre = (f.querySelector('input[name=nombre]').value ?? '').trim().slice(0, 24) || F.t('nombreDefecto');
    const color = colorPrueba ?? d.empresa?.color ?? COLOR_DEFECTO;
    const r = pedir({ tipo: 'nombre', nombre, color });
    colorPrueba = null; deshacerPrueba.nombre = false;
    sonar('placa'); refrescar();
    if (r?.ok === false) return;
    const b = $('.empresa .b-pri'); if (b) { b.innerHTML = `${ico('si')}${esc(F.t('guardado'))}`; }
  }
  function alEscribir(e) {
    if (e.target.name !== 'nombre' || primera || foco !== 'placa') return;
    deshacerPrueba.nombre = true;
    clearTimeout(alEscribir.t); const v = e.target.value;
    alEscribir.t = setTimeout(() => { if (E && foco === 'placa') E.ponerEmpresa(v.trim() || F.t('nombreDefecto')); }, 110);
  }
  function alPasarHoja(e) {     // pasar por una ruta de la hoja enciende su hilo en el mapa de pared
    if (foco !== 'mapa' || !E) return;
    E.mapa.resaltar(e.target.closest?.('[data-ruta]')?.dataset.ruta ?? null);
  }
  function alMover(e) {
    if (!E || e.pointerType === 'touch') return;
    const r = lienzo.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    E.fijarCursor(x / W * 2 - 1, y / H * 2 - 1);
    if (estado === 'casa' || estado === 'foco') { const id = E.apuntar(x, y); senalar(id && id !== foco ? id : null); }
  }
  function alSoltar(e) {
    if (!E || !abajo || Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y) > 10) { abajo = null; return; }
    abajo = null;
    if (estado !== 'casa' && estado !== 'foco') return;
    const r = lienzo.getBoundingClientRect(), id = E.apuntar(e.clientX - r.left, e.clientY - r.top, e.pointerType === 'touch' ? 0.06 : 0);
    if (id && id !== foco) abrirHoja(id); else if (!id && foco) cerrarHoja();
  }
  function alTecla(e) {
    if (!abierta || !raiz) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (primera) primera.saltar(); else if (foco) cerrarHoja(); else salir(); }
    else if (e.key === 'Enter' && primera?.etapa === 'recorrido') { e.preventDefault(); primera.siguiente(); }
  }
  function alMedir() {
    if (!abierta || !E) return;
    const caja = contenedor.getBoundingClientRect(), w = Math.max(1, Math.round(caja.width)), h = Math.max(1, Math.round(caja.height));
    if (w === W && h === H) return;
    W = w; H = h;
    if ((W / H < 0.9) !== E.vertical && !primera) {       // el teléfono giró: se arma la otra distribución
      const f = foco; E.liberar(); E = null; armarEscena(); E.irA(E.casa, 0);
      if (f) { foco = null; abrirHoja(f); }
    } else { E.medir(W, H, escala); if (foco && !primera) E.irA(E.poseObjeto(foco, angosto() ? {} : { derecha: (Math.min(540, W * 0.46) + 14) / W }), 0.4); }
  }

  // ── bucle ──
  function paso(dt, dibujar = true) {
    if (!E) return;
    E.fijarHora(hora);
    primera?.cuadro(dt);
    E.cuadro(dt, dibujar);
    ponerRotulos();
  }
  // Adelanta la escena «seg» segundos sin dibujar los cuadros del medio (para pruebas y capturas).
  function avanzar(seg, dt = 1 / 30) { for (let x = 0; x < seg - 1e-6; x += dt) paso(dt, false); paso(0.001, true); }
  function bucle(ahora) {
    if (!abierta) return;
    raf = requestAnimationFrame(bucle);
    if (pausado || manual) { ultimo = ahora; return; }
    const dt = Math.min(0.1, Math.max(0.001, (ahora - ultimo) / 1000)); ultimo = ahora;
    paso(dt);
    medidor.cuadro(ahora, (s) => { const e = Math.max(0.5, Math.min(1, escala + s * 0.15)); if (e !== escala) { escala = e; E?.medir(W, H, escala); } }, fijo);
  }

  // ── API ──
  async function abrir(op = {}) {
    if (abierta) return;
    abierta = true; const yo = ++turno;
    desmontarViejo?.();
    if (op.idioma) idioma = op.idioma;
    if (op.calidad) calidad = op.calidad;
    elegirNivel(calidad);
    tactil = op.tactil ?? matchMedia('(pointer: coarse)').matches;
    F = crearTextos(idioma, tactil);
    d = leerDatos(); hora = horaNumero(op.hora ?? d.hoy?.hora, 9);
    const esPrimera = op.primera ?? !d.empresa?.nombre;
    montar();
    // las letras pintadas (placa, libro, mapa) usan la tipografía del juego: se espera un instante a que esté
    try { await Promise.race([Promise.all([document.fonts?.load?.('700 20px Fraunces'), document.fonts?.load?.('800 14px Nunito')]), espera(1500)]); } catch { /* queda la de respaldo */ }
    if (!abierta || yo !== turno) return;
    armarEscena();
    medidor = new Medidor(); ultimo = performance.now();
    raiz.classList.add('visible');
    const velo = $('.ofi-velo');
    if (esPrimera) {
      fijarEstado('primera');
      primera = correrPrimera({ E, capa: $('.ofi-primera'), velo, F, datos: d, accion: pedir, sonar,
        alCambiarEmpresa: (nombre, color) => { colorPrueba = color; E.ponerEmpresa(nombre, color); raiz.style.setProperty('--empresa', color); },
        alTerminar: () => { primera = null; colorPrueba = null; fijarEstado('casa'); refrescar(); } });
    } else {
      // entrada corta: la cámara llega caminando desde la puerta
      const c = E.casa;
      E.irA({ pos: c.pos.clone().add({ x: 0, y: -0.1, z: E.vertical ? 0.7 : 0.9 }), obj: c.obj.clone(), fov: c.fov }, 0);
      E.irA(c, 1.7);
      luego(() => velo.classList.add('fuera'), 60);
      luego(() => { if (estado === 'entrando') fijarEstado('casa'); }, 900);
    }
    paso(0.016);
    raf = requestAnimationFrame(bucle);
    sonar('entrar');
    luego(() => $('.ofi-pista')?.classList.add('fuera'), 9000);
  }
  function cerrar() { if (!abierta) return; abierta = false; turno++; fijarEstado('cerrada'); desmontar(false); }
  function liberar() { abierta = false; turno++; estado = 'cerrada'; desmontarViejo?.(); desmontar(true); }
  function salir() { sonar('salir'); pedir({ tipo: 'salir' }); if (abierta) cerrar(); }

  return {
    abrir, cerrar, liberar, refrescar: () => { if (abierta && E) refrescar(); },
    get abierta() { return abierta; }, get estado() { return estado; },
    // para pruebas y para la página de demostración
    depurar: {
      get escena() { return E; }, get raiz() { return raiz; }, get foco() { return foco; }, get primera() { return primera; }, get datos() { return d; },
      abrirHoja, cerrarHoja, paso, avanzar,
      manual(v) { manual = !!v; pausado = false; },
      fijarHora(h) { hora = h; },
      info: () => ({ estado, foco, W, H, escala, nivel: nivel.nombre, fps: medidor?.fps, historia: medidor ? [...medidor.historia] : [], ...(E?.info() ?? {}) }),
    },
  };
}
