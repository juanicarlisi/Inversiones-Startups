// Variante B: el mismo cuadro del juego en PixiJS 8 (WebGL). Mismas funciones geométricas del juego (js/render.js: curva, puntoCurva,
// posAvion, aPantalla) para que las posiciones sean idénticas; lo que cambia es CÓMO se dibuja:
//  · capa estática (mar, tierra, fronteras, rutas) = Graphics que se reconstruye solo si cambia el zoom o el estado de una ruta;
//  · balizas, aviones y luces de navegación = ParticleContainer con un atlas (una llamada de dibujo);
//  · aeropuertos y etiquetas = se rearman solo cuando cambia el paso del modelo, la cámara o el día/noche.
import { Application, Graphics, Text, Texture, Sprite, Container, ParticleContainer, Particle, Rectangle } from 'pixi.js';
import { TIERRA, FRONTERAS } from '../../js/mapa.js';
import { AEROPUERTOS } from '../../js/datos.js';
import * as M from '../../js/modelo.js';
import { proyectar, curva, puntoCurva, aPantalla, posAvion } from '../../js/render.js';
import { CFG, prepararEscena, montar } from './comun.js';
import { PALETAS, crearAtlas } from './atlas.js';

const escena = prepararEscena();
const { s, cam, vis } = escena;
const pal = PALETAS[s.cap] ?? PALETAS[3];
const { W, H, dpr } = { W: CFG.W, H: CFG.H, dpr: CFG.dpr };
const lienzo = document.getElementById('mapa');

const app = new Application();
const tInit = performance.now();
await app.init({ canvas: lienzo, width: W, height: H, resolution: dpr, autoDensity: true, antialias: CFG.aa, preference: CFG.pref, autoStart: false, sharedTicker: false, powerPreference: 'high-performance', background: pal.mar });
app.ticker.stop();
const msInit = performance.now() - tInit;
const render = app.renderer;
const color = (c) => c; // los colores del juego son cadenas CSS; Pixi las acepta

// ── textura del atlas ──
const atlas = crearAtlas(pal, Math.max(2, Math.ceil(dpr)));
const base = Texture.from(atlas.canvas);
const marco = Object.fromEntries(Object.entries(atlas.marcos).map(([k, m]) => [k, new Texture({ source: base.source, frame: new Rectangle(m.x, m.y, m.w, m.h) })]));
const ESC = 1 / atlas.sc; // píxeles de atlas → píxeles lógicos

// ── mar (degradado vertical) ──
const cMar = document.createElement('canvas'); cMar.width = 1; cMar.height = 256;
{ const g = cMar.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, pal.mar); gr.addColorStop(1, pal.mar2); g.fillStyle = gr; g.fillRect(0, 0, 1, 256); }
const mar = new Sprite(Texture.from(cMar)); mar.width = W; mar.height = H;

// ── mundo: tierra, fronteras y rutas, en unidades de mapa (grados Mercator); el zoom es la escala del contenedor ──
const anillos = TIERRA.map((r) => r.flatMap(([x, y]) => proyectar(x / 100, y / 100)));
const lineas = FRONTERAS.map((l) => l.flatMap(([x, y]) => proyectar(x / 100, y / 100)));
const mundo = new Container(); const gTierra = new Graphics(), gFront = new Graphics(), gRutas = new Graphics();
mundo.addChild(gTierra, gFront, gRutas);
function trazoDiscontinuo(g, p, d, hueco) {
  let on = true, rem = d, px = p[0], py = p[1]; g.moveTo(px, py);
  for (let i = 2; i < p.length; i += 2) {
    const x1 = p[i], y1 = p[i + 1]; let dx = x1 - px, dy = y1 - py, L = Math.hypot(dx, dy);
    while (L > 1e-9) {
      const paso = Math.min(L, rem), nx = px + dx / L * paso, ny = py + dy / L * paso;
      if (on) g.lineTo(nx, ny); else g.moveTo(nx, ny);
      px = nx; py = ny; dx = x1 - px; dy = y1 - py; L -= paso; rem -= paso;
      if (rem <= 1e-9) { on = !on; rem = on ? d : hueco; }
    }
  }
}
let zConstruida = -1, firmaRutas = '';
function construirTierra(z) {
  gTierra.clear(); for (const a of anillos) gTierra.poly(a, true);
  gTierra.fill(pal.tierra); gTierra.stroke({ width: 1.2 / z, color: pal.costa, join: 'round' });
  gFront.clear(); for (const l of lineas) trazoDiscontinuo(gFront, l, 4 / z, 3 / z);
  gFront.stroke({ width: 0.8 / z, color: pal.borde });
}
function colorRuta(r) { return r.vuelos > 3 && r.ingresos - r.costos < 0 ? '#c0392b' : pal.ruta; }
function firmaDeRutas() { return s.rutas.map((r) => r.id + colorRuta(r) + (vis.sel?.tipo === 'ruta' && vis.sel.id === r.id ? 's' : '')).join(); }
function construirRutas(z) {
  gRutas.clear();
  for (const r of s.rutas) {
    const c = curva(r.a, r.b), sel = vis.sel?.tipo === 'ruta' && vis.sel.id === r.id;
    gRutas.beginPath(); gRutas.moveTo(c[0], c[1]); gRutas.quadraticCurveTo(c[2], c[3], c[4], c[5]);
    gRutas.stroke({ width: (sel ? 4 : 2.2) / z, color: colorRuta(r), alpha: sel ? 1 : 0.75, join: 'round' });
  }
}

// ── balizas (partículas en pantalla) ──
const pcBal = new ParticleContainer({ texture: marco.punto, dynamicProperties: { position: false, rotation: false, vertex: true, color: true }, boundsArea: new Rectangle(0, 0, W, H) });
let balizas = []; // { p, i, r }
function construirBalizas() {
  pcBal.removeParticles?.(0, pcBal.particleChildren.length); pcBal.particleChildren.length = 0; balizas = [];
  for (const r of s.rutas) {
    if (!r.balizas) continue;
    const c = curva(r.a, r.b), n = Math.max(3, Math.round(r.km / 70));
    for (let i = 1; i < n; i++) {
      const [x, y] = puntoCurva(c, i / n), [sx, sy] = aPantalla(cam, W, H, [x, y]);
      const p = new Particle({ texture: marco.punto, x: sx, y: sy, anchorX: 0.5, anchorY: 0.5, tint: 0xffd666, alpha: 0.4, scaleX: ESC * 2.4 / 3, scaleY: ESC * 2.4 / 3 });
      pcBal.addParticle(p); balizas.push({ p, i });
    }
  }
  pcBal.update();
}
let tickBal = -1;
function parpadeoBalizas(ahora, osc) {
  const tick = Math.floor(ahora / 400);
  if (tick === tickBal && osc === oscBal) return; tickBal = tick; oscBal = osc;
  for (const b of balizas) {
    const prende = osc > 0.2 && (tick + b.i) % 3 !== 0, k = ESC * (prende ? 2.4 : 1.4) / 3;
    b.p.alpha = prende ? 0.5 + osc * 0.5 : 0.35; b.p.scaleX = b.p.scaleY = k;
  }
  pcBal.update();
}
let oscBal = -1;

// ── noche ──
const noche = new Sprite(Texture.WHITE); noche.width = W; noche.height = H; noche.tint = 0x081028; noche.alpha = 0;

// ── aviones y luces (partículas) ──
const pcAv = new ParticleContainer({ texture: marco.punto, dynamicProperties: { position: true, rotation: true, vertex: false, color: true, uvs: false }, boundsArea: new Rectangle(-50, -50, W + 100, H + 100) });
const aviones = s.aviones.map((a) => {
  const forma = M.AV[a.tipo].forma;
  const cuerpo = new Particle({ texture: marco[`${forma}.dia`], anchorX: 0.5, anchorY: 0.5, scaleX: ESC, scaleY: ESC });
  const verde = new Particle({ texture: marco.punto, anchorX: 0.5, anchorY: 0.5, tint: 0x69f0ae, alpha: 0, scaleX: ESC * 1.6 / 3, scaleY: ESC * 1.6 / 3 });
  const rojo = new Particle({ texture: marco.punto, anchorX: 0.5, anchorY: 0.5, tint: 0xff5252, alpha: 0, scaleX: ESC * 1.6 / 3, scaleY: ESC * 1.6 / 3 });
  pcAv.addParticle(cuerpo, verde, rojo);
  return { a, forma, cuerpo, verde, rojo, marcoActual: '' };
});

// ── aeropuertos: brillo (sprites), círculos y arcos (Graphics), etiquetas (Text) ──
const capaAp = new Container(); const brillos = new Container(); const gAp = new Graphics(); const etiquetas = new Container();
capaAp.addChild(brillos, gAp, etiquetas);
const textos = new Map();
const estiloEt = (grande, enRed, osc) => ({ fontFamily: 'system-ui, sans-serif', fontSize: grande ? 11 : 12, fontWeight: enRed ? '600' : '500', fill: osc > 0.5 ? '#f1f4f9' : pal.texto,
  stroke: { color: osc > 0.5 ? 'rgba(8,16,40,0.8)' : 'rgba(255,255,255,0.85)', width: 3, join: 'round' } });
for (const ap of AEROPUERTOS) {
  const t = new Text({ text: ap.nombre, style: estiloEt(true, false, 0), resolution: Math.max(1, dpr) }); t.visible = false; etiquetas.addChild(t);
  const b = new Sprite(marco.brillo); b.anchor.set(0.5); b.visible = false; brillos.addChild(b);
  textos.set(ap.id, { t, b, ap });
}
let firmaAp = '', oscEt = -1, camAp = '';
function redibujarAeropuertos(osc) {
  const enRed = new Set(M.nodosRed(s)), zoomLejos = cam.z < 9;
  gAp.clear();
  const ocupado = []; const pisa = (r) => ocupado.some((o) => r[0] < o[2] && r[2] > o[0] && r[1] < o[3] && r[3] > o[1]);
  for (const ap of [...AEROPUERTOS].sort((x, y) => (y.id === 'BUE') - (x.id === 'BUE') || y.peso - x.peso)) {
    const { t, b } = textos.get(ap.id); t.visible = false; b.visible = false;
    if (!M.ciudadDisponible(s, ap.id)) continue;
    const [x, y] = aPantalla(cam, W, H, proyectar(ap.lon, ap.lat));
    if (x < -40 || y < -40 || x > W + 40 || y > H + 40) continue;
    const enLaRed = enRed.has(ap.id), rad = 3 + Math.sqrt(ap.peso) * 0.55, sel = vis.sel?.tipo === 'ap' && vis.sel.id === ap.id;
    if (osc > 0.2 && enLaRed) { b.visible = true; b.position.set(x, y); b.width = b.height = rad * 8; b.alpha = 0.55 * osc; }
    gAp.circle(x, y, rad).fill(enLaRed ? (ap.id === 'BUE' ? pal.hub : pal.ruta) : { color: '#ffffff', alpha: 0.85 }).stroke({ width: sel ? 3 : 1.5, color: sel ? '#ffb300' : (osc > 0.5 ? '#dfe6f0' : pal.texto) });
    if (enLaRed) {
      const tb = M.enTransbordo(s, ap.id), cap = M.capacidadTransbordo(s, ap.id);
      if (tb > 0) { const f = Math.min(1, tb / (cap * 3)); gAp.moveTo(x, y - rad - 4); gAp.arc(x, y, rad + 4, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2).stroke({ width: 3, color: f > 0.66 ? '#e53935' : '#fb8c00' }); }
    }
    const mostrar = sel || enLaRed || !zoomLejos || ap.peso >= 25 || vis.modo === 'nuevaRuta';
    if (!mostrar) continue;
    const [tx, ty, al] = ap.etq === 'der' ? [x + rad + 4, y - 7, 0] : ap.etq === 'izq' ? [x - rad - 4, y - 7, 1] : ap.etq === 'arr' ? [x, y - rad - 16, 0.5] : [x, y + rad + 3, 0.5];
    t.anchor.set(al, 0); t.position.set(tx, ty - 3); // la caja de Text de Pixi deja ~3 px sobre la tinta; el canvas 2D alinea al borde de la em
    const w = t.width, x0 = al === 0 ? tx : al === 1 ? tx - w : tx - w / 2, caja = [x0 - 2, ty - 1, x0 + w + 2, ty + 14];
    if (!sel && pisa(caja)) continue;
    ocupado.push(caja); t.visible = true;
  }
}
function recolorearEtiquetas(osc) {
  for (const { t, ap } of textos.values()) { const e = estiloEt(true, false, osc); t.style.fill = e.fill; t.style.stroke = e.stroke; }
}

// ── escena ──
app.stage.addChild(mar, mundo, pcBal, noche, pcAv, capaAp);
{ // diagnóstico: ?sin=mundo,bal,noche,av,ap oculta capas para ver cuál cuesta en la GPU
  const sin = new URLSearchParams(location.search).get('sin')?.split(',') ?? [];
  const mapa = { mar, mundo, bal: pcBal, noche, av: pcAv, ap: capaAp, tierra: gTierra, front: gFront, rutas: gRutas, etiquetas, gap: gAp, brillos };
  for (const k of sin) if (mapa[k]) mapa[k].visible = false;
}

const oscuridad = (h) => (h >= 7 && h < 19 ? 0 : h >= 19 && h < 21 ? (h - 19) / 2 : h >= 5 && h < 7 ? 1 - (h - 5) / 2 : 1);
let escAnt = -1, pasoVisto = -1, nocheFrame = false, oscAnt = -2;
const msReconstruir = {};

const partes = { actualizar: 0, render: 0, n: 0 };
function dibujar(ahora) {
  const tA = performance.now();
  const osc = oscuridad(M.hora(s)), esNoche = osc > 0.5, frac = vis.frac ?? 0, z = cam.z;
  // cámara: el contenedor del mundo lleva el zoom; solo se reconstruye la geometría si cambia el zoom
  mundo.scale.set(z); mundo.position.set(W / 2 - cam.x * z, H / 2 - cam.y * z);
  if (z !== zConstruida) { const t0 = performance.now(); construirTierra(z); construirRutas(z); msReconstruir.tierraYRutas = performance.now() - t0; zConstruida = z; firmaRutas = firmaDeRutas(); construirBalizas(); camAp = ''; }
  if (s.t !== pasoVisto) { // una vez por paso del modelo
    pasoVisto = s.t;
    const f = firmaDeRutas(); if (f !== firmaRutas) { construirRutas(z); firmaRutas = f; }
    camAp = '';
  }
  if (osc !== oscAnt) { noche.alpha = 0.55 * osc; oscAnt = osc; camAp = ''; }
  if (esNoche !== nocheFrame) { // día ↔ noche: el avión cambia de marco y las etiquetas de color
    nocheFrame = esNoche; recolorearEtiquetas(osc); for (const v of aviones) v.marcoActual = '';
    pcAv.update();
  }
  if (camAp === '') { redibujarAeropuertos(osc); camAp = 'ok'; }
  parpadeoBalizas(ahora, osc);
  const zoomLejos = z < 9, esc = ESC * (zoomLejos ? 8 : 10) / 10;
  let cambio = esc !== escAnt; escAnt = esc;
  for (const v of aviones) {
    const a = v.a, [x, y, ang] = posAvion(cam, W, H, a, frac);
    const selA = vis.sel?.tipo === 'avion' && vis.sel.id === a.id;
    const nombre = `${v.forma}.${selA ? 'sel' : esNoche ? 'noche' : 'dia'}`;
    const c = v.cuerpo; c.x = x; c.y = y; c.rotation = ang; c.scaleX = c.scaleY = esc;
    if (v.marcoActual !== nombre) { c.texture = marco[nombre]; v.marcoActual = nombre; cambio = true; }
    const luz = osc > 0.3 && a.fase === 'vuelo' && Math.floor(ahora / 600 + a.id) % 2 === 1;
    const sn = Math.sin(ang), cs = Math.cos(ang);
    v.rojo.alpha = luz ? 1 : 0; v.verde.alpha = luz ? 1 : 0;
    if (luz) { v.rojo.x = x + 9 * sn; v.rojo.y = y - 9 * cs; v.verde.x = x - 9 * sn; v.verde.y = y + 9 * cs; }
  }
  if (cambio) pcAv.update(); // textura o escala cambiaron (día/noche, zoom): se vuelven a subir; la posición y la rotación se suben siempre
  const tB = performance.now();
  render.render(app.stage);
  partes.actualizar += tB - tA; partes.render += performance.now() - tB; partes.n++;
}

const gl = render.gl;
montar({
  nombre: `pixi-${render.name ?? 'webgl'}${CFG.aa ? '' : '-sinAA'}`, escena, dibujar,
  sincronizar: () => { if (gl) { const px = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); } },
  extra: { partes: () => { const o = { actualizarMs: +(partes.actualizar / partes.n).toFixed(2), renderMs: +(partes.render / partes.n).toFixed(2) }; partes.actualizar = partes.render = partes.n = 0; return o; }, msInit: () => msInit, msReconstruir: () => msReconstruir, renderer: () => render.name ?? (gl ? 'webgl' : 'webgpu'),
    reconstruirTierra: () => { const t0 = performance.now(); construirTierra(cam.z * 1.0001); return performance.now() - t0; } },
});
