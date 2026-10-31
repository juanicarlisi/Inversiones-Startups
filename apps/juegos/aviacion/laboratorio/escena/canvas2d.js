// Variante A: el render de producción tal cual (js/render.js, solo lectura), sobre canvas 2D.
import * as R from '../../js/render.js';
import { CFG, prepararEscena, montar } from './comun.js';

const lienzo = document.getElementById('mapa');
lienzo.width = CFG.W * CFG.dpr; lienzo.height = CFG.H * CFG.dpr; lienzo.style.width = CFG.W + 'px'; lienzo.style.height = CFG.H + 'px';
const ctx = lienzo.getContext('2d');
const escena = prepararEscena();
montar({
  nombre: 'canvas2d-produccion', escena,
  dibujar: (ahora) => { ctx.setTransform(CFG.dpr, 0, 0, CFG.dpr, 0, 0); R.dibujar(ctx, CFG.W, CFG.H, escena.s, escena.cam, escena.vis, ahora); },
  sincronizar: () => {}, // sin lectura de píxeles: varias lecturas pasan el canvas a modo software y falsean la medida
});
