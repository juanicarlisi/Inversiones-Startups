// Geografía del mundo 3D: proyección, alturas y utilidades. Unidad del mundo = 1 grado de longitud (Mercator).
// Ejes: +x = este, −z = norte, +y = arriba. El origen es Buenos Aires.
import * as THREE from 'three';

const RAD = Math.PI / 180;
export const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + lat * RAD / 2)) / RAD;
export const ORIGEN = { lon: -58.38, lat: -34.60 };
const Y0 = merc(ORIGEN.lat);
// Exageración vertical de la maqueta: la cordillera tiene que verse desde lejos (20× la altura real).
export const EXAGERACION = 20;
export const KM_A_Y = EXAGERACION / 111.32; // unidades de mundo por km de altura

export const aMundo = (lon, lat) => [lon - ORIGEN.lon, -(merc(lat) - Y0)];

export class Relieve {
  // datos: { ancho, alto, km: Float32Array (altura en km), agua: Uint8Array }, mundo: límites de mundo.json
  constructor(datos, mundo) {
    Object.assign(this, datos);
    this.mundo = mundo;
    [this.x0, this.zN] = aMundo(mundo.oeste, mundo.norte);
    [this.x1, this.zS] = aMundo(mundo.este, mundo.sur);
    this.w = this.x1 - this.x0; this.h = this.zS - this.zN;
  }

  // Altura en km (negativa bajo el mar) con interpolación bilineal.
  km_(x, z) {
    const u = (x - this.x0) / this.w * this.ancho - 0.5, v = (z - this.zN) / this.h * this.alto - 0.5;
    const i = Math.max(0, Math.min(this.ancho - 2, Math.floor(u))), j = Math.max(0, Math.min(this.alto - 2, Math.floor(v)));
    const fu = Math.max(0, Math.min(1, u - i)), fv = Math.max(0, Math.min(1, v - j));
    const a = this.km, k = j * this.ancho + i;
    return (a[k] * (1 - fu) + a[k + 1] * fu) * (1 - fv) + (a[k + this.ancho] * (1 - fu) + a[k + this.ancho + 1] * fu) * fv;
  }

  // Distancia con signo a la orilla (positiva en tierra), en unidades de mundo.
  costa_(x, z) {
    const u = (x - this.x0) / this.w * this.ancho - 0.5, v = (z - this.zN) / this.h * this.alto - 0.5;
    if (u < 0 || v < 0 || u > this.ancho - 1 || v > this.alto - 1) return -0.5;
    const i = Math.min(this.ancho - 2, Math.floor(u)), j = Math.min(this.alto - 2, Math.floor(v)), fu = u - i, fv = v - j;
    const a = this.costa, k = j * this.ancho + i;
    return (((a[k] * (1 - fu) + a[k + 1] * fu) * (1 - fv) + (a[k + this.ancho] * (1 - fu) + a[k + this.ancho + 1] * fu) * fv) / 255 - 0.50196) * 1.00394;
  }

  // Altura del suelo en unidades de mundo (el mar es 0). Igual que el vértice del terreno.
  y(x, z) {
    const d = this.costa_(x, z);
    if (d <= 0) return 0;
    const t = Math.min(1, d / 0.02);
    return Math.max(0.002, this.km_(x, z)) * KM_A_Y * t * t * (3 - 2 * t) + 0.0015;
  }

  // El punto de tierra firme más cercano con lugar para apoyar un conjunto de radio r (para las ciudades de la costa).
  apoyo(x, z, r = 0.16) {
    const tierra = (px, pz) => {
      let n = 0;
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; if (this.costa_(px + Math.cos(a) * r, pz + Math.sin(a) * r) > 0.01) n++; }
      return (this.costa_(px, pz) > 0.02 ? 4 : 0) + n;
    };
    let mejor = [x, z], puntaje = tierra(x, z);
    if (puntaje >= 12) return mejor;
    for (let d = 0.04; d <= 0.5; d += 0.04) {
      for (let k = 0; k < 16; k++) {
        const a = k * Math.PI / 8, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
        const p = tierra(px, pz) - d * 4;
        if (p > puntaje) { puntaje = p; mejor = [px, pz]; }
      }
      if (puntaje >= 11) break;
    }
    return mejor;
  }
}

// Carga alturas.webp (R,G = altura en 16 bits, B = ríos y lagos) y la deja lista para la CPU y para la GPU.
async function pixeles(url) {
  const blob = await (await fetch(url)).blob();
  const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  const lienzo = document.createElement('canvas');
  lienzo.width = bmp.width; lienzo.height = bmp.height;
  const ctx = lienzo.getContext('2d', { willReadFrequently: true, colorSpace: 'srgb' });
  ctx.drawImage(bmp, 0, 0);
  const px = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
  bmp.close?.();
  return { px, ancho: lienzo.width, alto: lienzo.height };
}
export async function cargarRelieve(urlAlturas, urlCosta, mundo) {
  const [{ px, ancho, alto }, c] = await Promise.all([pixeles(urlAlturas), pixeles(urlCosta)]);
  const bmp = { width: ancho, height: alto };
  const n = bmp.width * bmp.height;
  const km = new Float32Array(n), agua = new Uint8Array(n);
  const gpu = new Uint16Array(n * 2);
  const rango = (mundo.altMax - mundo.altMin) / 1000;
  for (let i = 0; i < n; i++) {
    const v = ((px[i * 4] << 8) | px[i * 4 + 1]) / 65535 * rango + mundo.altMin / 1000;
    km[i] = v; agua[i] = px[i * 4 + 2];
    gpu[i * 2] = THREE.DataUtils.toHalfFloat(v); gpu[i * 2 + 1] = THREE.DataUtils.toHalfFloat(px[i * 4 + 2] / 255);
  }
  const textura = new THREE.DataTexture(gpu, bmp.width, bmp.height, THREE.RGFormat, THREE.HalfFloatType);
  textura.minFilter = textura.magFilter = THREE.LinearFilter;
  textura.wrapS = textura.wrapT = THREE.ClampToEdgeWrapping;
  textura.needsUpdate = true;
  const costa = new Uint8Array(n);
  for (let i = 0; i < n; i++) costa[i] = c.px[i * 4];
  const texCosta = new THREE.DataTexture(costa, ancho, alto, THREE.RedFormat, THREE.UnsignedByteType);
  texCosta.minFilter = texCosta.magFilter = THREE.LinearFilter; texCosta.needsUpdate = true;
  const r = new Relieve({ ancho, alto, km, agua, costa }, mundo);
  r.textura = textura; r.texCosta = texCosta;
  return r;
}

// Azar con semilla (para que cada ciudad y cada nube salgan siempre iguales).
export function azar(semilla) {
  let a = (semilla >>> 0) || 1;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export const semillaDe = (txt) => { let h = 2166136261; for (const c of txt) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
export const mezclar = (a, b, t) => a + (b - a) * t;
export const limitar = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const suave = (a, b, x) => { const t = limitar((x - a) / (b - a)); return t * t * (3 - 2 * t); };
