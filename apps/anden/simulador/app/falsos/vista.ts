// app/falsos/vista.ts · Andén simulador, corte 1 · P8 (interfaz) · SOLO PARA DESARROLLO Y PRUEBAS DE LA INTERFAZ.
// Reproductor y vista falsos, mínimos pero honestos: posiciones desde los tramos de la traza (cinta interpolada, fila por secuencia,
// bandeja por el paso del lazo, rampa por secuencia) y un dibujo en Canvas 2D en planta o en 2,5D. La app real usa los de escena/ (P6),
// que la integración pasa en Servicios; estos existen para que la interfaz se desarrolle y se pruebe sin importar otro paquete.
import type { Ms } from '../../contratos/tipos-base.ts';
import { ClaseEntidad, TipoTramo, type Traza } from '../../contratos/traza.ts';
import { posEnLazo } from '../../contratos/geometria.ts';
import {
  EstadoVisual, type Camara, type CrearReproductor, type CrearVista, type ElegirPiso, type EstadoRecursos, type Estilo,
  type OpcionesDibujo, type Piso, type Posiciones, type Reproductor, type Vista,
} from '../../contratos/vistas.ts';
import { nivelDeRiesgo } from '../ui/paleta.ts';

const VENTANA = 60_000;
const ESPERA_LARGA = 300_000;
const TIPOS_PAQUETE = new Set<number>([TipoTramo.DESCARGA, TipoTramo.CINTA, TipoTramo.ACUMULACION, TipoTramo.INDUCCION,
  TipoTramo.ESPERA_BANDEJA, TipoTramo.BANDEJA, TipoTramo.RAMPA, TipoTramo.MANO, TipoTramo.COLA_MANUAL, TipoTramo.MANUAL]);

function cotaInferior(a: Float64Array, x: number): number {
  let lo = 0, hi = a.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] <= x) lo = m + 1; else hi = m; }
  return lo;
}

function enPolilinea(pts: [number, number][], f: number, out: number[]): void {
  let total = 0;
  const largos: number[] = [];
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); largos.push(l); total += l; }
  let d = Math.min(1, Math.max(0, f)) * total;
  for (let i = 0; i < largos.length; i++) {
    if (d <= largos[i] || i === largos.length - 1) {
      const g = largos[i] > 0 ? Math.min(1, d / largos[i]) : 0;
      out[0] = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * g; out[1] = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * g; return;
    }
    d -= largos[i];
  }
  out[0] = pts[0][0]; out[1] = pts[0][1];
}

export const crearReproductorFalso: CrearReproductor = (tr: Traza): Reproductor => {
  const T = tr.tramos, G = tr.geometria, NR = G.rampas.length;
  const base = tr.inicio, nVent = Math.max(1, Math.ceil((tr.fin - base) / VENTANA) + 1);
  // índice por ventanas de 60 s de los tramos de paquetes que se dibujan
  const cuenta = new Int32Array(nVent + 1);
  const vent = (t: number) => Math.min(nVent - 1, Math.max(0, Math.floor((t - base) / VENTANA)));
  for (let i = 0; i < T.n; i++) if (TIPOS_PAQUETE.has(T.k[i])) for (let w = vent(T.t0[i]); w <= vent(Math.min(T.t1[i], tr.fin) - 1); w++) cuenta[w + 1]++;
  for (let w = 0; w < nVent; w++) cuenta[w + 1] += cuenta[w];
  const lista = new Int32Array(cuenta[nVent]); const lleno = cuenta.slice(0, nVent);
  for (let i = 0; i < T.n; i++) if (TIPOS_PAQUETE.has(T.k[i])) for (let w = vent(T.t0[i]); w <= vent(Math.min(T.t1[i], tr.fin) - 1); w++) lista[lleno[w]++] = i;
  let maxVisibles = 1;
  for (let w = 0; w < nVent; w++) maxVisibles = Math.max(maxVisibles, cuenta[w + 1] - cuenta[w]);
  // salidas de la acumulación y de cada rampa (t1 ordenados) para el lugar en la fila
  const t1Acum: number[] = [], t1Rampa: number[][] = Array.from({ length: NR + 1 }, () => []);
  let lazo0 = 0, k0 = 0;
  for (let i = 0; i < T.n; i++) {
    if (T.k[i] === TipoTramo.ACUMULACION) t1Acum.push(T.t1[i]);
    else if (T.k[i] === TipoTramo.RAMPA) t1Rampa[Math.min(NR, T.r[i])].push(T.t1[i]);
    else if (T.k[i] === TipoTramo.LAZO_MARCHA) { lazo0 = T.t0[i]; k0 = T.a[i]; }
  }
  const salAcum = Float64Array.from(t1Acum.sort((a, b) => a - b));
  const salRampa = t1Rampa.map((v) => Float64Array.from(v.sort((a, b) => a - b)));
  const L = G.lazo, tmp = [0, 0, 0];
  const pasoLazo = (t: number) => k0 + (t - lazo0) / tr.tickLazo;
  const posRampa = (r: number, lugar: number, out: number[]) => {
    if (r >= NR) { out[0] = G.excepcion.x + (lugar % 6) * 0.45; out[1] = G.excepcion.y + 1.2 + Math.floor(lugar / 6) * 0.45; return; }
    const rp = G.rampas[r]; out[0] = rp.x; out[1] = rp.y + rp.lado * (1.3 + lugar * 0.4);
  };
  const acotarT = (t: number) => Math.min(tr.fin - 1, Math.max(tr.inicio, t));

  const crearPosiciones = (): Posiciones => ({
    n: 0, x: new Float32Array(maxVisibles), y: new Float32Array(maxVisibles), ang: new Float32Array(maxVisibles),
    estado: new Uint8Array(maxVisibles), clase: new Uint8Array(maxVisibles), id: new Int32Array(maxVisibles),
  });
  const posiciones = (t0: Ms, out: Posiciones): void => {
    const t = acotarT(t0), w = vent(t); let n = 0;
    const p = [0, 0];
    for (let j = cuenta[w]; j < cuenta[w + 1]; j++) {
      const i = lista[j];
      if (!(T.t0[i] <= t && t < T.t1[i])) continue;
      const k = T.k[i], e = T.e[i];
      let estado: number = EstadoVisual.NORMAL;
      switch (k) {
        case TipoTramo.DESCARGA: { const a = G.andenes[T.r[i]] ?? G.andenes[0]; p[0] = a.x + ((e % 5) - 2) * 0.35; p[1] = a.y + 1; estado = EstadoVisual.EN_CAMION; break; }
        case TipoTramo.CINTA: { const c = G.cintas[T.r[i]] ?? G.cintas[0]; enPolilinea(c.puntos, (t - T.t0[i]) / Math.max(1, T.t1[i] - T.t0[i]), p); break; }
        case TipoTramo.ACUMULACION: {
          const lugar = Math.max(0, T.a[i] - cotaInferior(salAcum, t));
          p[0] = G.acumulacion.x - (lugar % 24) * 0.5; p[1] = G.acumulacion.y - 1 - Math.floor(lugar / 24) * 0.5;
          if (t - T.t0[i] >= ESPERA_LARGA) estado = EstadoVisual.ESPERANDO; break;
        }
        case TipoTramo.INDUCCION: case TipoTramo.ESPERA_BANDEJA: { const s = G.estaciones[T.r[i]] ?? G.estaciones[0]; p[0] = s.x; p[1] = s.y - 1.1; break; }
        case TipoTramo.BANDEJA: {
          posEnLazo(L, ((T.r[i] + pasoLazo(t)) % L.bandejas) * L.paso, tmp); p[0] = tmp[0]; p[1] = tmp[1];
          if (T.a[i] > 0) estado = EstadoVisual.DANDO_VUELTA; break;
        }
        case TipoTramo.RAMPA: {
          const r = Math.min(NR, T.r[i]);
          posRampa(r, Math.max(0, T.a[i] - cotaInferior(salRampa[r], t)), p);
          if (r >= NR) estado = EstadoVisual.EXCEPCION; break;
        }
        case TipoTramo.MANO: { const rp = G.rampas[Math.min(NR - 1, T.a[i])]; const f = (t - T.t0[i]) / Math.max(1, T.t1[i] - T.t0[i]); p[0] = rp.x; p[1] = rp.y + rp.lado * (1.3 + 3 * f); break; }
        case TipoTramo.COLA_MANUAL: case TipoTramo.MANUAL: { p[0] = G.excepcion.x - 1; p[1] = G.excepcion.y + 2.5; estado = EstadoVisual.EXCEPCION; break; }
        default: continue;
      }
      if (estado === EstadoVisual.NORMAL && e >= 0 && e < tr.paquetes.n) {
        const listo = tr.paquetes.listo[e];
        if (listo < 0 || listo > tr.corte) estado = EstadoVisual.ATRASADO;
      }
      out.x[n] = p[0]; out.y[n] = p[1]; out.ang[n] = 0; out.estado[n] = estado; out.clase[n] = ClaseEntidad.PAQUETE; out.id[n] = e; n++;
    }
    out.n = n;
  };
  const crearEstadoRecursos = (): EstadoRecursos => ({
    pasoLazo: 0, lazoDetenido: false, rampaOcupacion: new Float32Array(NR), rampaLlena: new Uint8Array(NR), filaAcumulacion: 0,
    puestoEstado: new Uint8Array(G.estaciones.length), personaEstado: new Uint8Array(tr.catalogo.personas.length),
  });
  const recursos = (t0: Ms, out: EstadoRecursos): void => {
    const t = acotarT(t0);
    out.pasoLazo = pasoLazo(t); out.lazoDetenido = false;
    out.rampaOcupacion.fill(0); out.puestoEstado.fill(4); out.filaAcumulacion = 0;
    for (let s = 0; s < G.estaciones.length; s++) out.puestoEstado[s] = 0;
    const w = vent(t);
    for (let j = cuenta[w]; j < cuenta[w + 1]; j++) {
      const i = lista[j];
      if (!(T.t0[i] <= t && t < T.t1[i])) continue;
      if (T.k[i] === TipoTramo.RAMPA && T.r[i] < NR) out.rampaOcupacion[T.r[i]]++;
      else if (T.k[i] === TipoTramo.ACUMULACION) out.filaAcumulacion++;
      else if (T.k[i] === TipoTramo.INDUCCION && T.r[i] < out.puestoEstado.length) out.puestoEstado[T.r[i]] = 1;
    }
    for (let r = 0; r < NR; r++) out.rampaLlena[r] = out.rampaOcupacion[r] >= G.rampas[r].capacidad ? 1 : 0;
  };
  const buf = crearPosiciones();
  const tocar = (x: number, y: number, t: Ms, radio: number): { clase: ClaseEntidad; id: number } | null => {
    posiciones(t, buf);
    let mejor = -1, dMejor = radio * radio;
    for (let i = 0; i < buf.n; i++) { const d = (buf.x[i] - x) ** 2 + (buf.y[i] - y) ** 2; if (d <= dMejor) { dMejor = d; mejor = i; } }
    if (mejor >= 0) return { clase: ClaseEntidad.PAQUETE, id: buf.id[mejor] };
    let rMejor = -1, dr = (radio * 2.5) ** 2;
    G.rampas.forEach((r, i) => { const d = (r.x - x) ** 2 + (r.y + r.lado * 2 - y) ** 2; if (d <= dr) { dr = d; rMejor = i; } });
    return rMejor >= 0 ? { clase: ClaseEntidad.RAMPA, id: rMejor } : null;
  };
  return { traza: tr, inicio: tr.inicio, fin: tr.fin, maxVisibles, crearPosiciones, crearEstadoRecursos, posiciones, recursos, tocar };
};

// ---------- Vista en Canvas 2D ----------

type Contexto2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
const ISO_COS = Math.cos(Math.PI / 4), ISO_ACHATADO = 0.55;

export const crearVistaFalsa: CrearVista = (lienzo, r, estilo: Estilo, piso: Piso): Vista => {
  const ctx = lienzo.getContext('2d') as Contexto2D | null;
  if (!ctx) throw new Error('vista falsa: el lienzo no tiene contexto 2D');
  const G = r.traza.geometria, lim = G.limites;
  const pos = r.crearPosiciones(), rec = r.crearEstadoRecursos();
  let ancho = 300, alto = 150, dpr = 1;
  const c = (nombre: string, porDefecto: string) => estilo.colores[nombre] ?? porDefecto;
  // proyección mundo → pantalla (sin la cámara): planta con y hacia arriba; 2,5D girada 45° y achatada
  let girado = false;
  const proyectar = (x0: number, y0: number, z = 0): [number, number] => {
    const x = girado ? y0 : x0, y = girado ? -x0 : y0;
    if (piso === '2d') return [x, -y];
    const u = (x - y) * ISO_COS, v = (x + y) * ISO_COS * ISO_ACHATADO;
    return [u, -v - z];
  };
  const camara: Camara = { cx: 0, cy: 0, zoom: 1, giro: 0 };
  const encuadrar = () => {
    const medir = (g: boolean) => {
      girado = g;
      const esquinas = [[lim.xmin, lim.ymin], [lim.xmax, lim.ymin], [lim.xmin, lim.ymax], [lim.xmax, lim.ymax]].map(([x, y]) => proyectar(x, y));
      const xs = esquinas.map((e) => e[0]), ys = esquinas.map((e) => e[1]);
      const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
      return { cx: (Math.max(...xs) + Math.min(...xs)) / 2, cy: (Math.max(...ys) + Math.min(...ys)) / 2, zoom: Math.max(0.1, Math.min(ancho / (w * 1.06), alto / (h * 1.06))) };
    };
    const recto = medir(false), cuarto = medir(true);
    const usar = cuarto.zoom >= recto.zoom * 1.25 ? cuarto : recto;
    girado = usar === cuarto;
    camara.cx = usar.cx; camara.cy = usar.cy; camara.zoom = usar.zoom; camara.giro = girado ? Math.PI / 2 : 0;
  };
  const aPantalla = (x: number, y: number, z = 0): [number, number] => {
    const [u, v] = proyectar(x, y, z);
    return [(u - camara.cx) * camara.zoom + ancho / 2, (v - camara.cy) * camara.zoom + alto / 2];
  };
  const rect = (x: number, y: number, w: number, h: number, relleno: string, borde?: string) => {
    const a = aPantalla(x, y), b = aPantalla(x + w, y), d = aPantalla(x + w, y + h), e = aPantalla(x, y + h);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d[0], d[1]); ctx.lineTo(e[0], e[1]); ctx.closePath();
    ctx.fillStyle = relleno; ctx.fill(); if (borde) { ctx.strokeStyle = borde; ctx.lineWidth = 1; ctx.stroke(); }
  };
  const glifo = (x: number, y: number, estado: number, color: string, tam: number) => {
    const [px, py] = aPantalla(x, y, piso === 'iso' ? 0.6 : 0);
    const s = Math.max(2, tam * camara.zoom);
    ctx.fillStyle = color;
    ctx.beginPath();
    if (estado === EstadoVisual.DANDO_VUELTA) ctx.arc(px, py, s * 0.6, 0, Math.PI * 2);
    else if (estado === EstadoVisual.EXCEPCION) { ctx.moveTo(px, py - s * 0.7); ctx.lineTo(px + s * 0.7, py + s * 0.5); ctx.lineTo(px - s * 0.7, py + s * 0.5); ctx.closePath(); }
    else if (estado === EstadoVisual.ESPERANDO) { ctx.moveTo(px, py - s * 0.7); ctx.lineTo(px + s * 0.6, py); ctx.lineTo(px, py + s * 0.7); ctx.lineTo(px - s * 0.6, py); ctx.closePath(); }
    else ctx.rect(px - s / 2, py - s / 2, s, s);
    ctx.fill();
    if (estado === EstadoVisual.ATRASADO) { ctx.strokeStyle = c('fondo', '#ffffff'); ctx.lineWidth = Math.max(1, s * 0.18); ctx.beginPath(); ctx.moveTo(px - s / 2, py - s / 2); ctx.lineTo(px + s / 2, py + s / 2); ctx.stroke(); }
  };
  const colorEstado: Record<number, [string, string]> = {
    [EstadoVisual.NORMAL]: ['estadoNormal', '#8b5e34'], [EstadoVisual.DANDO_VUELTA]: ['estadoVuelta', '#1d4ed8'],
    [EstadoVisual.EXCEPCION]: ['estadoExcepcion', '#7e22ce'], [EstadoVisual.ESPERANDO]: ['estadoEsperando', '#a35200'],
    [EstadoVisual.ATRASADO]: ['estadoAtrasado', '#c81e1e'], [EstadoVisual.SELECCIONADO]: ['estadoSeleccionado', '#111827'],
    [EstadoVisual.EN_CAMION]: ['estadoEnCamion', '#475569'],
  };
  const trazoLazo = () => {
    const pts = [0, 0, 0];
    ctx.beginPath();
    for (let i = 0; i <= 160; i++) { posEnLazo(G.lazo, (i / 160) * G.lazo.largo, pts); const [px, py] = aPantalla(pts[0], pts[1], piso === 'iso' ? 0.4 : 0); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
    ctx.closePath();
  };
  const fantasmaPos = { r: null as Reproductor | null, p: null as Posiciones | null };
  return {
    piso,
    camara,
    redimensionar(w, h, d) {
      ancho = Math.max(1, w); alto = Math.max(1, h); dpr = Math.max(1, d);
      lienzo.width = Math.round(ancho * dpr); lienzo.height = Math.round(alto * dpr);
      encuadrar();
    },
    aMundo(px, py) {
      const u = (px - ancho / 2) / camara.zoom + camara.cx, v = (py - alto / 2) / camara.zoom + camara.cy;
      let x: number, y: number;
      if (piso === '2d') { x = u; y = -v; } else {
        // inversa de la 2,5D sobre el piso (z = 0)
        const s = u / ISO_COS, q = -v / (ISO_COS * ISO_ACHATADO);
        x = (s + q) / 2; y = (q - s) / 2;
      }
      // deshacer el cuarto de vuelta: (x, y) = (y0, −x0)
      return girado ? [-y, x] : [x, y];
    },
    dibujar(t: Ms, o: OpcionesDibujo = {}) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = c('fondo', '#f4f2ee'); ctx.fillRect(0, 0, ancho, alto);
      rect(lim.xmin, lim.ymin, lim.xmax - lim.xmin, lim.ymax - lim.ymin, c('piso', '#ebe7df'));
      r.recursos(t, rec);
      // cintas, andenes y acumulación
      ctx.lineWidth = Math.max(1.5, 0.8 * camara.zoom); ctx.strokeStyle = c('cinta', '#b9b2a6');
      for (const cinta of G.cintas) { ctx.beginPath(); cinta.puntos.forEach(([x, y], i) => { const [px, py] = aPantalla(x, y); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }); ctx.stroke(); }
      for (const a of G.andenes) rect(a.x - 1.5, a.y - 2.5, 3, 4, c('camion', '#dfe3e8'), c('camionBorde', '#7b8794'));
      rect(G.acumulacion.x - 12, G.acumulacion.y - 3.5, 12.5, 3, c('acumulacion', '#e2ddd3'), c('acumulacionBorde', '#b9b2a6'));
      // lazo
      trazoLazo(); ctx.lineWidth = Math.max(3, 1.4 * camara.zoom); ctx.strokeStyle = rec.lazoDetenido ? c('lazoDetenido', '#b42318') : c('lazo', '#8d97a3'); ctx.stroke();
      // rampas (con la capa de riesgo si viene)
      G.rampas.forEach((rp, i) => {
        let relleno = c('rampa', '#c3cad2');
        if (o.riesgo) relleno = c(`riesgo${nivelDeRiesgo(o.riesgo.rampaProbLlena[i] ?? 0)}`, relleno);
        else if (rec.rampaLlena[i]) relleno = c('rampaLlena', '#b42318');
        rect(rp.x - 0.7, rp.lado > 0 ? rp.y + 0.8 : rp.y - 4.8, 1.4, 4, relleno, c('rampaBorde', '#8d97a3'));
        const f = Math.min(1, rec.rampaOcupacion[i] / Math.max(1, rp.capacidad));
        if (!o.riesgo && f > 0) rect(rp.x - 0.7, rp.lado > 0 ? rp.y + 0.8 : rp.y - 0.8 - 4 * f, 1.4, 4 * f, rec.rampaLlena[i] ? c('rampaLlena', '#b42318') : c('rampaCarga', '#56698a'));
      });
      for (const s of G.estaciones) rect(s.x - 0.6, s.y - 2.2, 1.2, 1.2, c('estacion', '#2f3a48'));
      rect(G.excepcion.x - 1.2, G.excepcion.y + 0.8, 2.4, 2.4, c('excepcion', '#7e22ce'));
      // paquetes
      r.posiciones(t, pos);
      const tam = 0.45;
      if (piso === 'iso') {
        // orden por profundidad: lo de más atrás primero
        const orden = Array.from({ length: pos.n }, (_, i) => i).sort((a, b) => (pos.x[b] + pos.y[b]) - (pos.x[a] + pos.y[a]));
        for (const i of orden) { const [n, d] = colorEstado[pos.estado[i]] ?? colorEstado[0]; glifo(pos.x[i], pos.y[i], pos.estado[i], c(n, d), tam * 1.1); }
      } else {
        for (let i = 0; i < pos.n; i++) { const [n, d] = colorEstado[pos.estado[i]] ?? colorEstado[0]; glifo(pos.x[i], pos.y[i], pos.estado[i], c(n, d), tam); }
      }
      // el otro escenario como fantasma (contorno)
      if (o.fantasma) {
        if (fantasmaPos.r !== o.fantasma) { fantasmaPos.r = o.fantasma; fantasmaPos.p = o.fantasma.crearPosiciones(); }
        const fp = fantasmaPos.p!; o.fantasma.posiciones(t, fp);
        ctx.strokeStyle = c('fantasma', '#1d4ed8'); ctx.lineWidth = 1;
        for (let i = 0; i < fp.n; i++) { const [px, py] = aPantalla(fp.x[i], fp.y[i], piso === 'iso' ? 0.6 : 0); ctx.beginPath(); ctx.arc(px, py, Math.max(2, 0.3 * camara.zoom), 0, Math.PI * 2); ctx.stroke(); }
      }
      // selección
      const sel = o.seleccion;
      if (sel) {
        let sx = NaN, sy = NaN;
        if (sel.clase === ClaseEntidad.PAQUETE) { for (let i = 0; i < pos.n; i++) if (pos.id[i] === sel.id) { sx = pos.x[i]; sy = pos.y[i]; break; } }
        else if (sel.clase === ClaseEntidad.RAMPA && G.rampas[sel.id]) { sx = G.rampas[sel.id].x; sy = G.rampas[sel.id].y + G.rampas[sel.id].lado * 2.8; }
        if (Number.isFinite(sx)) {
          const [px, py] = aPantalla(sx, sy, piso === 'iso' ? 0.6 : 0);
          ctx.strokeStyle = c('seleccion', '#111827'); ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(px, py, Math.max(9, 1.4 * camara.zoom), 0, Math.PI * 2); ctx.stroke();
        }
      }
    },
    destruir() { fantasmaPos.r = null; fantasmaPos.p = null; },
  };
};

/** Elige 2,5D si el cuadro tarda ≤ 10 ms (mediana de 3 mediciones), como pide contratos/vistas.ts. */
export const elegirPisoFalso: ElegirPiso = (medir) => {
  const ms = [medir(), medir(), medir()].sort((a, b) => a - b);
  return ms[1] <= 10 ? 'iso' : '2d';
};
