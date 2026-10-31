// Candidato: Phaser 4.2.1 (WebGL). Mismo cuadro: tierra, rutas, aeropuertos y 300 aviones (imágenes del atlas); el bucle de Phaser se avanza a mano.
import Phaser from 'phaser';
import { TIERRA, FRONTERAS } from '../../js/mapa.js';
import { AEROPUERTOS } from '../../js/datos.js';
import * as M from '../../js/modelo.js';
import { proyectar, curva, aPantalla, posAvion } from '../../js/render.js';
import { CFG, prepararEscena, montar } from './comun.js';
import { PALETAS, crearAtlas } from './atlas.js';

const escena = prepararEscena(); const { s, cam, vis } = escena; const { W, H } = CFG; const pal = PALETAS[3];
const lienzo = document.getElementById('mapa'); lienzo.style.width = W + 'px'; lienzo.style.height = H + 'px';
const at = crearAtlas(pal, 2); const ESC = 1 / at.sc; let sprites = [], pasos = 0;
const hex = (c) => parseInt(c.slice(1), 16);
const tipo = CFG.pref === 'canvas' ? Phaser.CANVAS : Phaser.WEBGL;
const juego = await new Promise((ok) => {
  const g = new Phaser.Game({ type: tipo, canvas: lienzo, width: W, height: H, banner: false, audio: { noAudio: true }, backgroundColor: pal.mar, antialias: CFG.aa, resolution: CFG.dpr, scale: { mode: Phaser.Scale.NONE },
    scene: { create() {
      const tx = this.textures.addCanvas('atlas', at.canvas);
      for (const [k, m] of Object.entries(at.marcos)) tx.add(k, 0, m.x, m.y, m.w, m.h);
      const gr = this.add.graphics();
      gr.fillStyle(hex(pal.tierra), 1); gr.lineStyle(1.2, hex(pal.costa), 1);
      for (const a of TIERRA) { const pts = a.map(([x, y]) => { const [px, py] = aPantalla(cam, W, H, proyectar(x / 100, y / 100)); return { x: px, y: py }; }); gr.fillPoints(pts, true); gr.strokePoints(pts, true); }
      gr.lineStyle(0.8, hex(pal.borde), 1); for (const l of FRONTERAS) gr.strokePoints(l.map(([x, y]) => { const [px, py] = aPantalla(cam, W, H, proyectar(x / 100, y / 100)); return { x: px, y: py }; }), false);
      for (const r of s.rutas) { const c = curva(r.a, r.b).map((v, i) => (i % 2 ? (v - cam.y) * cam.z + H / 2 : (v - cam.x) * cam.z + W / 2)); gr.lineStyle(2.2, hex(pal.ruta), 0.75); gr.strokePoints(new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(c[0], c[1]), new Phaser.Math.Vector2(c[2], c[3]), new Phaser.Math.Vector2(c[4], c[5])).getPoints(24), false); }
      gr.fillStyle(0x081028, 0.55); gr.fillRect(0, 0, W, H);
      for (const a of AEROPUERTOS) { const [x, y] = aPantalla(cam, W, H, proyectar(a.lon, a.lat)); gr.fillStyle(hex(pal.ruta), 1); gr.fillCircle(x, y, 3 + Math.sqrt(a.peso) * 0.55); gr.lineStyle(1.5, 0xdfe6f0, 1); gr.strokeCircle(x, y, 3 + Math.sqrt(a.peso) * 0.55); }
      sprites = s.aviones.map((a) => this.add.image(0, 0, 'atlas', `${M.AV[a.tipo].forma}.noche`).setScale(ESC * 0.8));
      ok(g);
    }, update() { pasos++; } } });
});
juego.loop.stop?.();
let t = 0;
function dibujar() {
  for (let i = 0; i < sprites.length; i++) { const [x, y, ang] = posAvion(cam, W, H, s.aviones[i], vis.frac ?? 0); sprites[i].setPosition(x, y).setRotation(ang); }
  t += 16.7; juego.step(t, 16.7);
}
const gl = juego.renderer.gl;
montar({ nombre: `phaser-${tipo === Phaser.CANVAS ? 'canvas' : 'webgl'}`, escena, dibujar, sincronizar: () => { if (gl) gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); }, extra: { renderer: () => (gl ? 'phaser/webgl' : 'phaser/canvas') } });
