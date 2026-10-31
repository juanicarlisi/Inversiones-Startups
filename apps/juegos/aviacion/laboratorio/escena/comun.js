// Arnés común de la prueba de render: arma la escena con el modelo REAL (300 aviones, red grande del capítulo 3, de noche),
// avanza la simulación igual que el bucle del juego (js/main.js: pasoCuadro) y mide. Cada variante solo aporta dibujar() y sincronizar().
import { escenaNoche, M } from './estado.js';
import { CAPITULOS } from '../../js/datos.js';
import { crearCamara } from '../../js/render.js';

performance.mark('hn:modulo');
const q = new URLSearchParams(location.search);
export const CFG = {
  modo: q.get('modo') ?? 'real',            // real: el modelo corre como en el juego · enjambre: los 300 en vuelo, todos animados
  W: Math.round(+(q.get('w') ?? innerWidth)), H: Math.round(+(q.get('h') ?? innerHeight)), dpr: +(q.get('dpr') ?? 1),
  contar: q.has('contar'), aa: q.get('aa') !== '0', pref: q.get('pref') ?? 'webgl',
};

// contadores de llamadas (solo con ?contar=1: parchean los prototipos y alteran el tiempo, no se mezclan con las medidas de tiempo)
export const cuenta = {};
if (CFG.contar) {
  const sumar = (k) => { cuenta[k] = (cuenta[k] ?? 0) + 1; };
  const parchear = (proto, prefijo, solo) => {
    for (const k of Object.getOwnPropertyNames(proto)) {
      let d; try { d = Object.getOwnPropertyDescriptor(proto, k); } catch { continue; }
      if (!d || typeof d.value !== 'function' || k === 'constructor' || (solo && !solo.test(k))) continue;
      const f = d.value;
      proto[k] = function (...a) {
        sumar(prefijo + k);
        if (prefijo === 'gl.' && /^drawElements/.test(k)) cuenta['gl.triangulos'] = (cuenta['gl.triangulos'] ?? 0) + (a[0] === 4 ? a[1] / 3 : 0) * (k === 'drawElementsInstanced' ? a[5] : 1);
        return f.apply(this, a);
      };
    }
  };
  parchear(CanvasRenderingContext2D.prototype, '2d.');
  if (window.WebGL2RenderingContext) parchear(WebGL2RenderingContext.prototype, 'gl.', /^(draw|bufferData|bufferSubData|texImage|texSubImage|useProgram|bindTexture|uniform|bindBuffer|bindVertexArray)/);
}

export function prepararEscena() {
  const s = escenaNoche();
  if (CFG.modo === 'enjambre') {
    let k = 0;
    for (const a of s.aviones) {
      const r = s.rutas.find((x) => x.id === a.ruta);
      const inv = a.id % 2;
      a.fase = 'vuelo'; a.en = inv ? r.b : r.a; a.hacia = inv ? r.a : r.b; a.dur = Math.max(20, a.dur || 60);
      a.resta = ((k++ * 0.6180339887) % 1) * a.dur; // fases repartidas, determinista
    }
  }
  performance.mark('hn:escena');
  const cam = crearCamara(CAPITULOS[2].vista, CFG.W, CFG.H, { arriba: 0, abajo: 0, izq: 0, der: 0 });
  const vis = { sel: null, modo: null, origen: null, destino: null, puntero: null, flotan: [], frac: 0, dpr: CFG.dpr, ultimoFlota: {} };
  return { s, cam, vis };
}

const pct = (a, p) => { const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; };
const media = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const r1 = (x) => Math.round(x * 100) / 100;

export function montar({ nombre, dibujar, sincronizar, escena, extra = {} }) {
  const { s, cam, vis } = escena;
  let acc = 0;
  function avanzar(dt) {
    if (CFG.modo === 'real') {
      acc += dt * M.MIN_POR_SEG; let p = 0;
      while (acc >= M.PASO && p < 40) { M.paso(s); acc -= M.PASO; p++; }
      vis.frac = acc;
    } else {
      const dm = dt * M.MIN_POR_SEG;
      for (const a of s.aviones) { a.resta -= dm; if (a.resta <= 0) { const t = a.en; a.en = a.hacia; a.hacia = t; a.resta += a.dur; } }
      vis.frac = 0;
    }
  }
  const enVuelo = () => s.aviones.filter((a) => a.fase === 'vuelo').length;

  // rAF real: lo que vería el jugador (fps, intervalos) y el tiempo de JS dentro del cuadro (hilo principal, ya frenado si hay estrangulación)
  function medirRaf(seg, calentar = 2) {
    return new Promise((ok) => {
      const ts = [], js = []; let ult = null, total = 0; const t0 = performance.now();
      const f = (ahora) => {
        if (ult !== null) {
          total++;
          const a = performance.now(); avanzar(Math.min(0.25, (ahora - ult) / 1000)); dibujar(ahora); const b = performance.now();
          if (ahora - t0 > calentar * 1000) { ts.push(ahora); js.push(b - a); }
        }
        ult = ahora;
        if (ahora - t0 < (calentar + seg) * 1000) requestAnimationFrame(f);
        else {
          const iv = ts.slice(1).map((t, i) => t - ts[i]);
          ok({ cuadros: ts.length, cuadrosTotal: total, fps: r1((ts.length - 1) / ((ts.at(-1) - ts[0]) / 1000)), intervaloP50: r1(pct(iv, 0.5)), intervaloP95: r1(pct(iv, 0.95)), intervaloMax: r1(Math.max(...iv)),
            jsMedia: r1(media(js)), jsP95: r1(pct(js, 0.95)), enVuelo: enVuelo() });
        }
      };
      requestAnimationFrame(f);
    });
  }
  // cuadros sincrónicos: se dibuja y se fuerza el fin del trabajo (lectura de 1 píxel) antes de parar el reloj; mide dibujo + GPU.
  async function medirSync(n = 40, calentar = 6) {
    const ms = [], msJs = []; let ahora = performance.now();
    for (let i = 0; i < n + calentar; i++) {
      ahora += 1000 / 60; avanzar(1 / 60);
      const a = performance.now(); dibujar(ahora); const b = performance.now(); sincronizar(); const c = performance.now();
      if (i >= calentar) { ms.push(c - a); msJs.push(b - a); }
      await new Promise((r) => setTimeout(r, 0));
    }
    if (!n) return { n: 0, msMediana: 0, msMedia: 0, msMin: 0, msP95: 0, jsMediana: 0 };
    return { n, msMediana: r1(pct(ms, 0.5)), msMedia: r1(media(ms)), msMin: r1(Math.min(...ms)), msP95: r1(pct(ms, 0.95)), jsMediana: r1(pct(msJs, 0.5)) };
  }
  async function contarLlamadas(n = 30) {
    for (let i = 0; i < 6; i++) { avanzar(1 / 60); dibujar(performance.now()); }
    for (const k of Object.keys(cuenta)) delete cuenta[k];
    for (let i = 0; i < n; i++) { avanzar(1 / 60); dibujar(performance.now() + i * 16.7); }
    const out = {}; for (const [k, v] of Object.entries(cuenta)) out[k] = r1(v / n);
    const total2d = Object.entries(out).filter(([k]) => k.startsWith('2d.')).reduce((x, [, v]) => x + v, 0);
    const draws = Object.entries(out).filter(([k]) => /^gl\.draw/.test(k)).reduce((x, [, v]) => x + v, 0);
    const top = Object.entries(out).filter(([k]) => k !== 'gl.triangulos').sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { porCuadro: { llamadas2d: r1(total2d), drawGL: r1(draws), triangulosGL: Math.round(out['gl.triangulos'] ?? 0) }, top: Object.fromEntries(top) };
  }
  window.__hn = { escena, nombre, marcas: () => Object.fromEntries(performance.getEntriesByType('mark').map((m) => [m.name, Math.round(m.startTime)])), medirRaf, medirSync, contarLlamadas, enVuelo, hora: () => M.hora(s), heap: () => performance.memory?.usedJSHeapSize ?? null,
    dibujarUno: () => { avanzar(1 / 60); dibujar(performance.now()); sincronizar(); }, ...extra };
  dibujar(performance.now()); sincronizar(); performance.mark('hn:primerCuadro');
  window.__listo = true;
}
