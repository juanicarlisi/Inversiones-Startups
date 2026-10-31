// Laboratorio Andén · calles y flota. MapLibre GL JS + deck.gl (interleaved). No es producto.
import * as maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { layers as pmLayers, namedFlavor } from "@protomaps/basemaps";
import { MapLibreOverlay as MapboxOverlay } from "@deck.gl/maplibre";
import { TripsLayer } from "@deck.gl/geo-layers";
import { ScatterplotLayer } from "@deck.gl/layers";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";

maplibregl.setWorkerUrl(new URL("dist/maplibre-gl-worker.mjs", location.href).href);   // maplibre-gl 6: el worker es un modulo aparte
const Q = new URLSearchParams(location.search);
const P = {
  base: Q.get("base") || "local",           // local | pmtiles | ofm
  n: +(Q.get("n") || 300),                   // vehiculos
  heads: Q.get("heads") || "trucks",         // none | dots | trucks
  heat: Q.get("heat") === "1",
  glow: Q.get("glow") !== "0",
  bld: Q.get("bld") !== "0",
  speed: +(Q.get("speed") || 90),            // segundos simulados por segundo real
  t: Q.has("t") ? +Q.get("t") : null,        // tiempo fijo (capturas)
  bench: +(Q.get("bench") || 0),             // segundos de medicion
  zoom: +(Q.get("zoom") || 15.0), pitch: +(Q.get("pitch") || 58), bearing: +(Q.get("bearing") || -22),
  trail: +(Q.get("trail") || 480), yawoff: +(Q.get("yawoff") || 0), truck: +(Q.get("truck") || 1.8),  rolloff: +(Q.get("rolloff") || 90), xray: Q.get("xray") !== "0", round: Q.get("round") !== "0", lng: +(Q.get("lng") || -58.4445), lat: +(Q.get("lat") || -34.6005),
};
const DEPOT_COLORS = [[64, 224, 208], [255, 176, 64], [255, 92, 160]];
const ATTR = '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a> · Overture Maps Foundation';

const hud = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };

async function cargarFlota() {
  const meta = await (await fetch("datos/viajes.meta.json")).json();
  const raw = await (await fetch("datos/viajes.bin")).arrayBuffer();
  const np = meta.puntos, V0 = meta.vehiculos;
  const C0 = new Float32Array(raw, 0, 2*np), T0 = new Float32Array(raw, 8*np, np), S0 = new Int32Array(raw, 12*np, V0+1);
  const k = Math.ceil(P.n / V0), V = P.n;
  // replicas con desfase temporal para escalar la flota (misma geometria, otra hora de salida)
  let total = 0; for (let v = 0; v < V; v++) { const b = v % V0; total += S0[b+1] - S0[b]; }
  const C = new Float32Array(2*total), T = new Float32Array(total), S = new Uint32Array(V+1), col = new Uint8Array(3*total);
  let o = 0, tMax = 0;
  for (let v = 0; v < V; v++) {
    const b = v % V0, a = S0[b], e = S0[b+1], rep = Math.floor(v / V0), off = rep * 11.7 % 600;
    S[v] = o; const dc = DEPOT_COLORS[meta.veh[b].depot % 3];
    for (let i = a; i < e; i++, o++) { C[2*o] = C0[2*i]; C[2*o+1] = C0[2*i+1]; T[o] = T0[i] + off; col[3*o] = dc[0]; col[3*o+1] = dc[1]; col[3*o+2] = dc[2]; if (T[o] > tMax) tMax = T[o]; }
  }
  S[V] = o;
  return { V, total, C, T, S, col, tMax, depositos: meta.depositos };
}

function estiloLocal() {
  return { version: 8, sources: {
      calles: { type: "geojson", data: "datos/calles.geojson", attribution: ATTR },
      edif: { type: "geojson", data: "datos/edificios.geojson" } },
    layers: [
      { id: "fondo", type: "background", paint: { "background-color": "#0a0f16" } },
      { id: "calle-borde", type: "line", source: "calles", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#0e1621", "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 12, 1.2, 16, 9, 19, 36] } },
      { id: "calle", type: "line", source: "calles", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ["match", ["get", "hw"], ["primary", "secondary", "trunk", "motorway"], "#3b5068", "#2a3b4e"], "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 12, .6, 16, 6.5, 19, 28] } },
      ...(P.bld ? [{ id: "edificios", type: "fill-extrusion", source: "edif", minzoom: 13, paint: { "fill-extrusion-color": ["interpolate", ["linear"], ["get", "h"], 4, "#18222e", 20, "#26364a", 44, "#3a4f68"], "fill-extrusion-height": ["get", "h"], "fill-extrusion-opacity": 0.8, "fill-extrusion-vertical-gradient": true } }] : []),
    ] };
}
function estiloPmtiles() {
  const protocol = new Protocol(); maplibregl.addProtocol("pmtiles", protocol.tile);
  const base = pmLayers("protomaps", namedFlavor("dark"), { lang: "es" });
  const ext = P.bld ? [{ id: "edificios-overture", type: "fill-extrusion", source: "edif", minzoom: 14, paint: { "fill-extrusion-color": ["interpolate", ["linear"], ["get", "h"], 4, "#1b2531", 20, "#2a3b50", 44, "#3d546f"], "fill-extrusion-height": ["get", "h"], "fill-extrusion-opacity": 0.78, "fill-extrusion-vertical-gradient": true } }] : [];
  // las etiquetas quedan arriba: edificios extruidos van antes de la primera capa de simbolos
  const iSym = base.findIndex(l => l.type === "symbol"); const L = [...base.slice(0, iSym), ...ext, ...base.slice(iSym)];
  return { version: 8, glyphs: location.origin + "/assets/fonts/{fontstack}/{range}.pbf", sprite: location.origin + "/assets/sprites/dark",
    sources: { protomaps: { type: "vector", url: "pmtiles://" + location.origin + "/datos/barrio.pmtiles", attribution: ATTR }, edif: { type: "geojson", data: "datos/edificios.geojson" } }, layers: L };
}

(async () => {
  const flota = await cargarFlota();
  const style = P.base === "pmtiles" ? estiloPmtiles() : P.base === "ofm" ? "https://tiles.openfreemap.org/styles/dark" : estiloLocal();
  const map = new maplibregl.Map({ container: "mapa", style, center: [P.lng, P.lat], zoom: P.zoom, pitch: P.pitch, bearing: P.bearing, maxPitch: 75, attributionControl: false, canvasContextAttributes: { antialias: true } });
  map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: P.base === "ofm" ? "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" : "" }), "bottom-right");
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
  const overlay = new MapboxOverlay({ interleaved: true, layers: [] }); map.addControl(overlay);

  // cabezas de vehiculos: cursor monotono por vehiculo (O(V) por cuadro)
  const { V, C, T, S, col, tMax } = flota; const loop = tMax + 90;
  const cur = new Int32Array(V); for (let v = 0; v < V; v++) cur[v] = S[v];
  const buf = [0, 1].map(() => ({ pos: new Float32Array(3*V), ori: new Float32Array(3*V) })); let flip = 0, lastT = -1;
  function cabezas(t) {
    if (t < lastT) for (let v = 0; v < V; v++) cur[v] = S[v];
    lastT = t; const B = buf[flip ^= 1], cosl = Math.cos(P.lat*Math.PI/180); let vivos = 0;
    for (let v = 0; v < V; v++) {
      const a = S[v], e = S[v+1]-1; let i = cur[v];
      while (i < e - 1 && T[i+1] <= t) i++; cur[v] = i;
      if (t < T[a] || t > T[e]) { B.pos[3*v] = 0; B.pos[3*v+1] = 0; B.pos[3*v+2] = -1e4; continue; }   // fuera de servicio: bajo tierra
      vivos++;
      const t0 = T[i], t1 = T[i+1], f = t1 > t0 ? Math.min(1, (t - t0)/(t1 - t0)) : 0;
      const x0 = C[2*i], y0 = C[2*i+1], x1 = C[2*i+2], y1 = C[2*i+3];
      B.pos[3*v] = x0 + (x1-x0)*f; B.pos[3*v+1] = y0 + (y1-y0)*f; B.pos[3*v+2] = 0;
      if (x1 !== x0 || y1 !== y0) B.ori[3*v+1] = Math.atan2((y1-y0), (x1-x0)*cosl) * 180/Math.PI + P.yawoff;   // se conserva el rumbo previo en pausas
      B.ori[3*v] = 0; B.ori[3*v+2] = P.rolloff;
    }
    return { B, vivos };
  }
  const tripsData = { length: V, startIndices: S.subarray(0, V), attributes: { getPath: { value: C, size: 2 }, getTimestamps: { value: T, size: 1 }, getColor: { value: col, size: 3, normalized: true } } };
  const heatPts = P.heat ? Array.from({ length: 2000 }, (_, i) => { const v = i % V, a = S[v]; return [C[2*(a + (i*7) % (S[v+1]-a))], C[2*(a + (i*7) % (S[v+1]-a))+1]]; }) : [];

  function capas(t) {
    const { B, vivos } = P.heads === "none" ? { B: null, vivos: 0 } : cabezas(t);
    const L = [];
    if (P.heat) L.push(new HeatmapLayer({ id: "calor", data: heatPts, getPosition: d => d, radiusPixels: 38, intensity: 1.4, threshold: .04, opacity: .55, colorRange: [[20, 30, 60], [40, 90, 160], [64, 224, 208], [255, 220, 120], [255, 120, 80], [255, 60, 60]] }));
    if (P.glow) L.push(new TripsLayer({ id: "viajes-halo", data: tripsData, currentTime: t, trailLength: P.trail, fadeTrail: true, widthMinPixels: 7, opacity: .22, capRounded: P.round, jointRounded: P.round, _pathType: "open", parameters: P.xray ? { depthCompare: "always" } : {} }));
    L.push(new TripsLayer({ id: "viajes", data: tripsData, currentTime: t, trailLength: P.trail, fadeTrail: true, widthMinPixels: 2.2, capRounded: P.round, jointRounded: P.round, _pathType: "open", parameters: P.xray ? { depthCompare: "always" } : {} }));
    if (B && P.heads === "trucks") { const Bp = B.pos, Bo = B.ori;
      L.push(new ScenegraphLayer({ id: "camiones", data: { length: V }, scenegraph: "assets/modelos/camion.glb", sizeScale: P.truck, sizeMinPixels: 9, sizeMaxPixels: 60, _lighting: "pbr", pickable: false,
        getPosition: (_, { index, target }) => { target[0] = Bp[3*index]; target[1] = Bp[3*index+1]; target[2] = Bp[3*index+2]; return target; },
        getOrientation: (_, { index, target }) => { target[0] = Bo[3*index]; target[1] = Bo[3*index+1]; target[2] = Bo[3*index+2]; return target; },
        updateTriggers: { getPosition: [flip, t], getOrientation: [flip, t] } })); }
    else if (B && P.heads === "dots") L.push(new ScatterplotLayer({ id: "puntos", data: { length: V, attributes: { getPosition: { value: B.pos, size: 3 } } }, getRadius: 6, radiusMinPixels: 2.5, getFillColor: [255, 255, 255], updateTriggers: { getPosition: [flip] } }));
    window.__vivos = vivos; return L;
  }

  // reloj y medicion
  const dt = [], js = []; let t0r = null, simT = 0, frames = 0, benchDone = false;
  const fmt = s => `${String(Math.floor(s/3600)).padStart(2, "0")}:${String(Math.floor(s%3600/60)).padStart(2, "0")}:${String(Math.floor(s%60)).padStart(2, "0")}`;
  let last = performance.now(), fpsAcc = 0, fpsN = 0, fpsT = last;
  function tick(now) {
    if (t0r === null) t0r = now;
    simT = P.t !== null ? P.t : ((now - t0r)/1000 * P.speed) % loop;
    const j0 = performance.now(); overlay.setProps({ layers: capas(simT) }); const jm = performance.now() - j0;
    const d = now - last; last = now; frames++;
    if (P.bench && frames > 3) { dt.push(d); js.push(jm); }   // 3 cuadros de calentamiento (compilacion de shaders, carga de datos)              // 2 s de calentamiento
    fpsAcc += d; fpsN++; if (now - fpsT > 500) { hud("fps", (1000*fpsN/fpsAcc).toFixed(0)); fpsAcc = fpsN = 0; fpsT = now; }
    hud("reloj", fmt(8*3600 + simT)); hud("vivos", String(window.__vivos ?? "-"));
    if (P.bench && !benchDone && ((dt.length >= 10 && (now - t0r) > P.bench*1000) || (now - t0r) > 70000) && dt.length >= 2) {
      benchDone = true; const s = [...dt].sort((a, b) => a - b), m = dt.reduce((a, b) => a + b, 0)/dt.length;
      const gl = document.createElement("canvas").getContext("webgl2"); const ext = gl && gl.getExtension("WEBGL_debug_renderer_info");
      window.__bench = { vehiculos: V, puntos: flota.total, base: P.base, heads: P.heads, glow: P.glow, heat: P.heat, bld: P.bld, cuadros: dt.length, fps_medio: +(1000/m).toFixed(1), ms_p50: +s[Math.floor(s.length*.5)].toFixed(1), ms_p95: +s[Math.floor(s.length*.95)].toFixed(1), ms_max: +s[s.length-1].toFixed(1), js_ms_p50: +[...js].sort((a, b) => a - b)[Math.floor(js.length*.5)].toFixed(2), js_ms_p95: +[...js].sort((a, b) => a - b)[Math.floor(js.length*.95)].toFixed(2), viewport: innerWidth + "x" + innerHeight, renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "?" };
    }
    if (P.t !== null && ++fixed > 14 && map.areTilesLoaded()) { window.__quieto = true; return; }   // captura: se detiene el bucle
    requestAnimationFrame(tick);
  }
  let fixed = 0;
  map.on("load", () => { window.__listo = true; hud("nveh", String(V)); hud("npts", flota.total.toLocaleString("es-AR")); requestAnimationFrame(tick); });
  map.on("error", e => { window.__errores = (window.__errores || []).concat(String(e.error && e.error.message || e)); });
  window.__map = map;
})();
