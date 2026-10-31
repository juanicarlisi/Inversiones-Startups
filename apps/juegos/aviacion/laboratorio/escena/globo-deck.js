// Candidato: deck.gl 9.4.1 con _GlobeView: tierra (GeoJsonLayer), rutas (ArcLayer en círculo máximo) y 300 aviones (IconLayer), sin mapa base.
import { Deck, _GlobeView as GlobeView } from '@deck.gl/core';
import { GeoJsonLayer, ArcLayer, IconLayer, SolidPolygonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { CFG, prepararEscena, montar } from './comun.js';
import { crearAtlas, PALETAS } from './atlas.js';
import { tierraGeo, fronterasGeo, lonLatAvion, rutasLonLat, AEROPUERTOS } from './globo-datos.js';

const escena = prepararEscena(); const { s, vis } = escena; const { W, H } = CFG;
document.getElementById('mapa').remove();
const cont = document.getElementById('cont'); cont.style.width = W + 'px'; cont.style.height = H + 'px';
const at = crearAtlas(PALETAS[3], 2), m = at.marcos['jet.noche']; const ic = document.createElement('canvas'); ic.width = m.w; ic.height = m.h; ic.getContext('2d').drawImage(at.canvas, m.x, m.y, m.w, m.h, 0, 0, m.w, m.h);
const rutas = rutasLonLat(s);
const estaticas = [
  new SolidPolygonLayer({ id: 'mar', data: [{ p: [[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]] }], getPolygon: (d) => d.p, getFillColor: [10, 26, 56], parameters: { cullMode: 'none' } }),
  new GeoJsonLayer({ id: 'tierra', data: tierraGeo, getFillColor: [28, 51, 88], getLineColor: [79, 120, 168], lineWidthMinPixels: 1, stroked: true, filled: true, parameters: { cullMode: 'none' } }),
  new GeoJsonLayer({ id: 'front', data: fronterasGeo, getLineColor: [120, 160, 210, 110], lineWidthMinPixels: 1, parameters: { cullMode: 'none' } }),
  new ArcLayer({ id: 'rutas', data: rutas, getSourcePosition: (d) => d.a, getTargetPosition: (d) => d.b, greatCircle: true, numSegments: 48, getHeight: 0.25, getSourceColor: [255, 196, 87, 190], getTargetColor: [255, 196, 87, 190], getWidth: 1.6, parameters: { cullMode: 'none' } }),
  new ScatterplotLayer({ id: 'aps', data: AEROPUERTOS, getPosition: (d) => [d.lon, d.lat], getRadius: (d) => 9000 + d.peso * 220, radiusMinPixels: 3, getFillColor: [21, 101, 192], stroked: true, getLineColor: [255, 255, 255], lineWidthMinPixels: 1, parameters: { cullMode: 'none' } }),
];
const deck = new Deck({ parent: cont, width: W, height: H, views: new GlobeView({ id: 'g', controller: false }), initialViewState: { longitude: -60, latitude: -22, zoom: 1.8 }, layers: estaticas, useDevicePixels: CFG.dpr, _typedArrayManagerProps: undefined, deviceProps: { webgl: { antialias: CFG.aa } } });
function dibujar() {
  const f = vis.frac ?? 0, data = s.aviones.map((av) => { const [lon, lat, rumbo] = lonLatAvion(av, f); return { p: [lon, lat], r: 90 - rumbo }; });
  deck.setProps({ layers: [...estaticas, new IconLayer({ id: 'aviones', data, getPosition: (d) => d.p, getAngle: (d) => d.r, getIcon: () => ({ url: ic.toDataURL(), width: m.w, height: m.h, anchorY: m.h / 2, mask: false }), getSize: 14, sizeUnits: 'pixels', parameters: { cullMode: 'none' } })] });
  deck.redraw(true);
}
await new Promise((ok) => setTimeout(ok, 2500));
montar({ nombre: 'deckgl-globo', escena, dibujar, sincronizar: () => {}, extra: { renderer: () => 'deck.gl/luma' } });
