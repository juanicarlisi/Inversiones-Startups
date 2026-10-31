// Datos geográficos para las pruebas de globo/mapa (three, MapLibre, deck.gl, Phaser): salen del mismo juego (mapa.js, datos.js, modelo).
import { TIERRA, FRONTERAS } from '../../js/mapa.js';
import { AEROPUERTOS } from '../../js/datos.js';
import * as M from '../../js/modelo.js';

const RAD = Math.PI / 180;
export const AP = Object.fromEntries(AEROPUERTOS.map((a) => [a.id, a]));
export const tierraGeo = { type: 'FeatureCollection', features: TIERRA.map((r) => ({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[...r, r[0]].map(([x, y]) => [x / 100, y / 100])] } })) };
export const fronterasGeo = { type: 'FeatureCollection', features: FRONTERAS.map((l) => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: l.map(([x, y]) => [x / 100, y / 100]) } })) };

export const aVec = (lon, lat) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
export function slerp(a, b, t) {
  const d = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), w = Math.acos(d), s = Math.sin(w) || 1e-9;
  const k0 = Math.sin((1 - t) * w) / s, k1 = Math.sin(t * w) / s;
  return [a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1];
}
export const aLonLat = (v) => [Math.atan2(v[1], v[0]) / RAD, Math.asin(Math.max(-1, Math.min(1, v[2]))) / RAD];

// posición (lon, lat, rumbo en grados) de un avión en vuelo, sobre el círculo máximo; en tierra, en su aeropuerto
export function lonLatAvion(av, frac = 0) {
  const A = AP[av.en], B = AP[av.hacia];
  if (av.fase !== 'vuelo') return [A.lon, A.lat, 0, 0];
  const u = Math.min(1, Math.max(0, 1 - (av.resta - frac) / av.dur)), va = aVec(A.lon, A.lat), vb = aVec(B.lon, B.lat);
  const p = slerp(va, vb, u), q = slerp(va, vb, Math.min(1, u + 0.01)), [lon, lat] = aLonLat(p), [lon2, lat2] = aLonLat(q);
  return [lon, lat, Math.atan2((lon2 - lon) * Math.cos(lat * RAD), lat2 - lat) / RAD, u];
}
export const rutasLonLat = (s) => s.rutas.map((r) => ({ id: r.id, a: [AP[r.a].lon, AP[r.a].lat], b: [AP[r.b].lon, AP[r.b].lat], r }));
export { M, AEROPUERTOS };
