// Textura de ruido que se repite sin costuras: una lectura reemplaza a muchas cuentas por píxel (anda en equipos modestos).
// R = ruido en 4 octavas (8 celdas por repetición) · G = ruido simple (16 celdas) · B = otro de 4 octavas · A = blanco.
import * as THREE from 'three';
import { azar } from './geo.js';

function capa(tam, periodo, r) {
  const red = new Float32Array(periodo * periodo);
  for (let i = 0; i < red.length; i++) red[i] = r();
  const out = new Float32Array(tam * tam);
  for (let y = 0; y < tam; y++) for (let x = 0; x < tam; x++) {
    const u = x / tam * periodo, v = y / tam * periodo;
    const i = Math.floor(u), j = Math.floor(v);
    let fu = u - i, fv = v - j; fu = fu * fu * (3 - 2 * fu); fv = fv * fv * (3 - 2 * fv);
    const i1 = (i + 1) % periodo, j1 = (j + 1) % periodo;
    out[y * tam + x] = (red[j * periodo + i] * (1 - fu) + red[j * periodo + i1] * fu) * (1 - fv) + (red[j1 * periodo + i] * (1 - fu) + red[j1 * periodo + i1] * fu) * fv;
  }
  return out;
}
export function texturaRuido(tam = 256) {
  const r = azar(77);
  const fbm = (base) => {
    const o = [capa(tam, base, r), capa(tam, base * 2, r), capa(tam, base * 4, r), capa(tam, base * 8, r)];
    const out = new Float32Array(tam * tam);
    for (let i = 0; i < out.length; i++) out[i] = o[0][i] * 0.5 + o[1][i] * 0.25 + o[2][i] * 0.125 + o[3][i] * 0.0625;
    return out;
  };
  const R = fbm(8), G = capa(tam, 16, r), B = fbm(8);
  const px = new Uint8Array(tam * tam * 4);
  for (let i = 0; i < tam * tam; i++) { px[i * 4] = R[i] / 0.9375 * 255; px[i * 4 + 1] = G[i] * 255; px[i * 4 + 2] = B[i] / 0.9375 * 255; px[i * 4 + 3] = r() * 255; }
  const t = new THREE.DataTexture(px, tam, tam, THREE.RGBAFormat, THREE.UnsignedByteType);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.needsUpdate = true;
  return t;
}
