// Candidato: MapLibre GL JS 6.16.0 con proyección de globo. Estilo 100% local (sin servidor de teselas): tierra y rutas desde GeoJSON del juego.
import * as maplibregl from 'maplibre-gl'; import 'maplibre-gl/dist/maplibre-gl.css';
import { CFG, prepararEscena, montar } from './comun.js';
import { crearAtlas, PALETAS } from './atlas.js';
import { tierraGeo, fronterasGeo, lonLatAvion, rutasLonLat, AEROPUERTOS } from './globo-vendor.js';

maplibregl.setWorkerUrl(location.origin + '/laboratorio/dist/maplibre-gl-worker.mjs');
const escena = prepararEscena(); const { s, vis } = escena; const { W, H } = CFG;
document.getElementById('mapa').remove();
const cont = document.getElementById('cont'); cont.style.width = W + 'px'; cont.style.height = H + 'px';
const vacio = { type: 'FeatureCollection', features: [] };
const map = new maplibregl.Map({ container: cont, interactive: false, attributionControl: false, fadeDuration: 0, pixelRatio: CFG.dpr, antialias: CFG.aa,
  center: [-60, -22], zoom: 2.15, canvasContextAttributes: { antialias: CFG.aa },
  style: { version: 8, projection: { type: 'globe' }, sources: {
    tierra: { type: 'geojson', data: tierraGeo }, fronteras: { type: 'geojson', data: fronterasGeo },
    rutas: { type: 'geojson', data: { type: 'FeatureCollection', features: rutasLonLat(s).map((x) => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: arco(x.a, x.b) } })) } },
    aps: { type: 'geojson', data: { type: 'FeatureCollection', features: AEROPUERTOS.map((a) => ({ type: 'Feature', properties: { peso: a.peso }, geometry: { type: 'Point', coordinates: [a.lon, a.lat] } })) } },
    aviones: { type: 'geojson', data: vacio } },
  layers: [
    { id: 'mar', type: 'background', paint: { 'background-color': '#0a1a38' } },
    { id: 'tierra', type: 'fill', source: 'tierra', paint: { 'fill-color': '#1c3358', 'fill-outline-color': '#4f78a8' } },
    { id: 'front', type: 'line', source: 'fronteras', paint: { 'line-color': 'rgba(120,160,210,0.45)', 'line-width': 0.7 } },
    { id: 'rutas', type: 'line', source: 'rutas', paint: { 'line-color': '#ffc457', 'line-width': 1.6, 'line-opacity': 0.75 } },
    { id: 'glow', type: 'circle', source: 'aps', paint: { 'circle-radius': ['+', 10, ['*', 0.12, ['get', 'peso']]], 'circle-color': 'rgba(255,220,140,0.35)', 'circle-blur': 1 } },
    { id: 'aps', type: 'circle', source: 'aps', paint: { 'circle-radius': 3, 'circle-color': '#1565c0', 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.2 } },
    { id: 'aviones', type: 'symbol', source: 'aviones', layout: { 'icon-image': 'avion', 'icon-size': 0.5, 'icon-rotate': ['get', 'rumbo'], 'icon-allow-overlap': true, 'icon-rotation-alignment': 'map' } },
  ] } });
function arco(a, b) { const n = 40, o = []; for (let i = 0; i <= n; i++) o.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); return o; } // en globo MapLibre dibuja círculos máximos entre vértices; 40 puntos bastan
await new Promise((ok) => map.once('load', ok));
{ const at = crearAtlas(PALETAS[3], 2), m = at.marcos['jet.noche'], d = at.canvas.getContext('2d').getImageData(m.x, m.y, m.w, m.h); map.addImage('avion', { width: m.w, height: m.h, data: d.data }); }
const fuente = map.getSource('aviones');
function dibujar() {
  const f = vis.frac ?? 0;
  fuente.setData({ type: 'FeatureCollection', features: s.aviones.map((av) => { const [lon, lat, rumbo] = lonLatAvion(av, f); return { type: 'Feature', properties: { rumbo: rumbo - 90 }, geometry: { type: 'Point', coordinates: [lon, lat] } }; }) });
  map.triggerRepaint();
}
await new Promise((ok) => setTimeout(ok, 1500));
montar({ nombre: 'maplibre-globo', escena, dibujar, sincronizar: () => {}, extra: { renderer: () => 'maplibre/webgl' } });
