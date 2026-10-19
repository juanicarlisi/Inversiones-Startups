// app/pruebas/camara.test.ts · P8 (lo sumó la integración, I-3) · acercar, alejar y mover la cámara: el punto bajo el cursor queda quieto,
// el zoom respeta sus topes, arrastrar mueve lo de abajo junto con el puntero y el pellizco va en pasos fijos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Camara } from '../../contratos/vistas.ts';
import { desplazar, pasoDePellizco, PASO_ZOOM, ZOOM_MAX, ZOOM_MIN, zoomEnPunto } from '../ui/camara.ts';

/** Una vista mínima en planta, girada, con el mismo aMundo que escena/primitivas.ts (centro en el medio del marco de 800 × 600). */
function vistaFalsa(c: Camara) {
  const v = {
    camara: c,
    aMundo(px: number, py: number): [number, number] {
      const { cx, cy, zoom: z, giro } = v.camara, cg = Math.cos(giro), sg = Math.sin(giro);
      const xc = cx * cg - cy * sg, yc = cx * sg + cy * cg;
      const xr = (px - 400) / z + xc, yr = -(py - 300) / z + yc;
      return [xr * cg + yr * sg, -xr * sg + yr * cg];
    },
  };
  return v;
}
const cerca = (a: number, b: number, que: string) => assert.ok(Math.abs(a - b) < 1e-9, `${que}: se esperaba ${b} y salió ${a}`);

test('zoomEnPunto: el punto del mundo bajo el cursor no se mueve (también con la cámara girada)', () => {
  const encuadre: Camara = { cx: 10, cy: -5, zoom: 4, giro: 0.4 };
  const v = vistaFalsa({ ...encuadre });
  const [x0, y0] = v.aMundo(620, 130);
  zoomEnPunto(v, 620, 130, PASO_ZOOM, encuadre);
  cerca(v.camara.zoom, 4 * PASO_ZOOM, 'zoom');
  const [x1, y1] = v.aMundo(620, 130);
  cerca(x1, x0, 'x bajo el cursor'); cerca(y1, y0, 'y bajo el cursor');
});

test('zoomEnPunto: topes de ×16 y ×0,8 del encuadre completo', () => {
  const encuadre: Camara = { cx: 0, cy: 0, zoom: 2, giro: 0 };
  const v = vistaFalsa({ ...encuadre });
  for (let i = 0; i < 40; i++) zoomEnPunto(v, 400, 300, PASO_ZOOM, encuadre);
  cerca(v.camara.zoom, 2 * ZOOM_MAX, 'zoom máximo');
  for (let i = 0; i < 80; i++) zoomEnPunto(v, 400, 300, 1 / PASO_ZOOM, encuadre);
  cerca(v.camara.zoom, 2 * ZOOM_MIN, 'zoom mínimo');
});

test('desplazar: lo que estaba bajo el puntero al empezar el arrastre queda bajo el puntero al terminarlo', () => {
  const v = vistaFalsa({ cx: 3, cy: 7, zoom: 5, giro: -0.9 });
  const [x0, y0] = v.aMundo(100, 100);
  desplazar(v, 100, 100, 340, 260);
  const [x1, y1] = v.aMundo(340, 260);
  cerca(x1, x0, 'x'); cerca(y1, y0, 'y');
  assert.equal(v.camara.zoom, 5, 'arrastrar no cambia el zoom');
});

test('pasoDePellizco: pasos enteros de PASO_ZOOM (1 si el pellizco todavía no llega a medio paso)', () => {
  assert.equal(pasoDePellizco(1.05), 1);
  cerca(pasoDePellizco(1.3), PASO_ZOOM, 'un paso hacia adentro');
  cerca(pasoDePellizco(1 / 1.3), 1 / PASO_ZOOM, 'un paso hacia afuera');
  cerca(pasoDePellizco(PASO_ZOOM ** 2), PASO_ZOOM ** 2, 'dos pasos');
  assert.equal(pasoDePellizco(0), 1); assert.equal(pasoDePellizco(Number.NaN), 1);
});
