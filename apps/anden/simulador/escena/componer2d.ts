// escena/componer2d.ts · Andén simulador, corte 1 · P6 (escena).
// Planta 2D: compone la lista de primitivas de un instante (función pura, sin Canvas; se prueba en Node). Dos capas:
// - «fondo»: lo que no cambia con el tiempo (piso, grilla, lazo, cintas, andenes, toboganes, jaulas, estaciones, rótulos). La vista la
//   hornea una vez por cámara y tamaño.
// - «movil»: lo que sale de la traza en t (lazo detenido, carga de rampas y jaulas, bandejas, puestos, paquetes, personas, camiones,
//   selección y fantasma).
// Orden de pintado: el de la lista (prof creciente).
import type { Ms } from '../contratos/tipos-base.ts';
import { ClaseEntidad, refDe } from '../contratos/traza.ts';
import { EstadoVisual, type Camara, type Estilo, type OpcionesDibujo, type Reproductor } from '../contratos/vistas.ts';
import { posEnLazo } from '../contratos/geometria.ts';
import { calcular, buffersDe, type Buffers } from './buffers.ts';
import { lugarEnFila, type Disposicion } from './disposicion.ts';
import { COLOR_ESTADO, FORMA_ESTADO, color, colorRiesgo } from './estilo.ts';
import { posBandeja } from './lazo.ts';
import { crearProyector, esquinas, type Marco, type Primitiva, type Proyector } from './primitivas.ts';
import { EstadoPuesto, esReproductorEscena } from './reproductor.ts';

export type Capa = 'fondo' | 'movil' | 'todo';

export interface Composicion {
  rep: Reproductor;
  t: Ms;
  marco: Marco;
  camara: Camara;
  estilo: Estilo;
  opciones?: OpcionesDibujo;
  capa?: Capa;
  /** Fase (0–1) del pulso de la selección; con estilo.reducirMovimiento la selección no pulsa. */
  pulso?: number;
}

/** Tamaños en píxeles (con mínimos para que se vea en un teléfono de 360 px). */
export function tamanos(zoom: number) {
  const acotar = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
  return {
    paquete: acotar(0.5 * zoom, 4.5, 16),
    persona: acotar(0.75 * zoom, 6, 22),
    bandeja: acotar(0.5 * zoom, 2.5, 14),
    lazo: acotar(1.1 * zoom, 3, 40),
    cinta: acotar(0.6 * zoom, 2, 24),
    rotulo: acotar(0.55 * zoom, 0, 13),
  };
}

const proyectar = (p: Proyector, pts: number[], z = 0): number[] => {
  const o = [0, 0], out = new Array<number>(pts.length);
  for (let i = 0; i < pts.length; i += 2) { p.aPantalla(pts[i], pts[i + 1], z, o); out[i] = o[0]; out[i + 1] = o[1]; }
  return out;
};

/**
 * Contorno del lazo muestreado cada medio metro (en el mundo). Con `desplazamiento` (m), la curva paralela corrida hacia afuera (> 0) o
 * hacia adentro (< 0) del estadio: la normal hacia afuera en s es (sen θ, −cos θ), porque el lazo va en sentido antihorario.
 */
export function contornoLazo(D: Disposicion, paso = 0.5, desplazamiento = 0): number[] {
  const l = D.lazo, o = [0, 0, 0], pts: number[] = [];
  const n = Math.max(8, Math.ceil(l.largo / paso));
  for (let i = 0; i < n; i++) {
    posEnLazo(l, (i * l.largo) / n, o);
    pts.push(o[0] + Math.sin(o[2]) * desplazamiento, o[1] - Math.cos(o[2]) * desplazamiento);
  }
  return pts;
}

/** Distancia (m) del eje del lazo a cada una de las dos líneas que marcan el lazo detenido: por fuera de las bandejas. */
export const BORDE_LAZO_DETENIDO = 0.75;

/** Caja que encierra la fila de la acumulación (en el mundo). */
export function cajaFila(D: Disposicion): number[] {
  const f = D.fila, o = [0, 0];
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const l of [0, f.columnas - 1, f.columnas * (f.filas - 1), f.columnas * f.filas - 1]) {
    lugarEnFila(f, Math.max(0, l), o);
    x0 = Math.min(x0, o[0]); x1 = Math.max(x1, o[0]); y0 = Math.min(y0, o[1]); y1 = Math.max(y1, o[1]);
  }
  const m = f.paso * 0.6;
  return [x0 - m, y0 - m, x1 + m, y0 - m, x1 + m, y1 + m, x0 - m, y1 + m];
}

/** Lo fijo de la planta. */
function fondo(c: Composicion, p: Proyector, D: Disposicion, prims: Primitiva[]): void {
  const e = c.estilo, z = c.camara.zoom, tm = tamanos(z), o = [0, 0];
  let prof = 0;
  prims.push({ tipo: 'rect', x: 0, y: 0, w: c.marco.ancho, h: c.marco.alto, relleno: color(e, 'fondo'), borde: null, grosor: 0, prof: prof++ });
  // piso (los límites) y grilla cada 5 m
  const L = D.limites;
  prims.push({ tipo: 'poligono', pts: proyectar(p, [L.xmin, L.ymin, L.xmax, L.ymin, L.xmax, L.ymax, L.xmin, L.ymax]), relleno: color(e, 'piso'), borde: null, grosor: 0, prof: prof++ });
  const grilla = color(e, 'grilla');
  for (let x = Math.ceil(L.xmin / 5) * 5; x <= L.xmax; x += 5) prims.push({ tipo: 'linea', pts: proyectar(p, [x, L.ymin, x, L.ymax]), color: grilla, grosor: 1, guion: null, cerrada: false, prof: prof++ });
  for (let y = Math.ceil(L.ymin / 5) * 5; y <= L.ymax; y += 5) prims.push({ tipo: 'linea', pts: proyectar(p, [L.xmin, y, L.xmax, y]), color: grilla, grosor: 1, guion: null, cerrada: false, prof: prof++ });
  // acumulación
  prims.push({ tipo: 'poligono', pts: proyectar(p, cajaFila(D)), relleno: color(e, 'acumulacion'), borde: color(e, 'acumulacionBorde'), grosor: 1, prof: prof++ });
  // cintas
  for (const ci of D.cintas) prims.push({ tipo: 'linea', pts: proyectar(p, Array.from(ci.xy)), color: color(e, 'cinta'), grosor: tm.cinta, guion: null, cerrada: false, prof: prof++ });
  // andenes
  for (const a of D.andenes) {
    prims.push({ tipo: 'poligono', pts: proyectar(p, esquinas(a.base[0], a.base[1], a.lat[0], a.lat[1], 2.6, 1.0)), relleno: color(e, 'anden'), borde: null, grosor: 0, prof: prof++ });
  }
  // lazo
  prims.push({ tipo: 'linea', pts: proyectar(p, contornoLazo(D)), color: color(e, 'lazo'), grosor: tm.lazo, guion: null, cerrada: true, prof: prof++ });
  // toboganes, jaulas y la excepción
  for (const r of D.rampas) {
    prims.push({ tipo: 'poligono', pts: proyectar(p, tobogan(r.ini, r.fin, r.ancho)), relleno: color(e, 'rampa'), borde: color(e, 'rampaBorde'), grosor: 1, prof: prof++ });
    const lj = Math.min(r.ancho * 1.1, 1.2);
    prims.push({ tipo: 'poligono', pts: proyectar(p, esquinas(r.jaula[0], r.jaula[1], r.dir[0], r.dir[1], lj, lj)), relleno: null, borde: color(e, 'jaula'), grosor: 1.5, prof: prof++ });
  }
  const X = D.excepcion;
  prims.push({ tipo: 'poligono', pts: proyectar(p, tobogan(X.ini, X.fin, X.ancho * 1.6)), relleno: color(e, 'rampa'), borde: color(e, 'excepcion'), grosor: 2, prof: prof++ });
  for (const m of D.mesas) prims.push({ tipo: 'poligono', pts: proyectar(p, esquinas(m[0], m[1], X.lat[0], X.lat[1], 1.0, 0.6)), relleno: null, borde: color(e, 'excepcion'), grosor: 1.5, prof: prof++ });
  // lector (una barra atravesada en el lazo)
  {
    const n = [0, 0, 0];
    posEnLazo(D.lazo, D.lazo.largo > 0 ? lectorS(D) : 0, n);
    const dx = -Math.sin(n[2]), dy = Math.cos(n[2]);
    prims.push({ tipo: 'linea', pts: proyectar(p, [n[0] - dx * 0.9, n[1] - dy * 0.9, n[0] + dx * 0.9, n[1] + dy * 0.9]), color: color(e, 'lector'), grosor: Math.max(2, 0.25 * z), guion: null, cerrada: false, prof: prof++ });
  }
  // rótulos de las rampas y los andenes (datos del modelo; solo si se leen)
  if (tm.rotulo >= 8) {
    const rot = color(e, 'rotulo');
    for (const r of D.rampas) {
      p.aPantalla(r.jaula[0] + r.dir[0] * 0.9, r.jaula[1] + r.dir[1] * 0.9, 0, o);
      prims.push({ tipo: 'texto', x: o[0], y: o[1], texto: r.id.slice(0, 8), tam: tm.rotulo, color: rot, alinear: 'center', prof: prof++ });
    }
    for (const a of D.andenes) {
      p.aPantalla(a.base[0] - a.dirCamion[0] * 1.2, a.base[1] - a.dirCamion[1] * 1.2, 0, o);
      prims.push({ tipo: 'texto', x: o[0], y: o[1], texto: a.id.slice(0, 8), tam: tm.rotulo, color: rot, alinear: 'center', prof: prof++ });
    }
  }
}

/** s del lector sobre el lazo (la disposición guarda su punto; se busca la s más cercana con el lazo muestreado). */
function lectorS(D: Disposicion): number {
  const o = [0, 0, 0];
  let mejor = 0, d = Infinity;
  for (let s = 0; s < D.lazo.largo; s += 0.1) {
    posEnLazo(D.lazo, s, o);
    const dd = (o[0] - D.lector[0]) ** 2 + (o[1] - D.lector[1]) ** 2;
    if (dd < d) { d = dd; mejor = s; }
  }
  return mejor;
}

/** Tobogán: rectángulo de `ini` a `fin` con el ancho dado. */
export function tobogan(ini: [number, number], fin: [number, number], ancho: number): number[] {
  const dx = fin[0] - ini[0], dy = fin[1] - ini[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
  return esquinas((ini[0] + fin[0]) / 2, (ini[1] + fin[1]) / 2, dx / l, dy / l, l, ancho);
}

/** Parte del tobogán ocupada (fracción f desde el extremo de la persona hacia el lazo). */
export function toboganCarga(ini: [number, number], fin: [number, number], ancho: number, f: number): number[] {
  const g = Math.max(0, Math.min(1, f));
  const desde: [number, number] = [fin[0] + (ini[0] - fin[0]) * g, fin[1] + (ini[1] - fin[1]) * g];
  return tobogan(desde, fin, ancho);
}

/** Lo que se mueve en t. */
function movil(c: Composicion, p: Proyector, D: Disposicion, b: Buffers, prims: Primitiva[]): void {
  const e = c.estilo, z = c.camara.zoom, tm = tamanos(z), o = [0, 0], o3 = new Float64Array(3);
  const rep = c.rep, rec = b.rec, pos = b.pos, op = c.opciones ?? {};
  let prof = 100000;
  const L = D.lazo;
  // capa de riesgo (cien noches): el tobogán entero teñido por la probabilidad de llenarse
  const riesgo = op.riesgo ?? null;
  for (let r = 0; r < D.rampas.length; r++) {
    const R = D.rampas[r];
    if (riesgo && r < riesgo.rampaProbLlena.length) {
      prims.push({ tipo: 'poligono', pts: proyectar(p, tobogan(R.ini, R.fin, R.ancho)), relleno: color(e, colorRiesgo(riesgo.rampaProbLlena[r])), borde: null, grosor: 0, prof: prof++ });
    }
    const oc = rec.rampaOcupacion[r];
    if (oc > 0) {
      const llena = rec.rampaLlena[r] === 1;
      prims.push({
        tipo: 'poligono', pts: proyectar(p, toboganCarga(R.ini, R.fin, R.ancho * 0.8, oc / Math.max(1, R.capacidad))),
        relleno: color(e, llena ? 'rampaLlena' : 'rampaCarga'), borde: llena ? color(e, 'texto') : null, grosor: llena ? 1.5 : 0, prof: prof++,
      });
    }
    const nj = b.nivelJaula[r];
    if (nj > 0) {
      const lj = Math.min(R.ancho * 1.1, 1.2) * 0.86;
      const centro: [number, number] = [R.jaula[0] - R.dir[0] * lj * (1 - nj) / 2, R.jaula[1] - R.dir[1] * lj * (1 - nj) / 2];
      prims.push({ tipo: 'poligono', pts: proyectar(p, esquinas(centro[0], centro[1], R.dir[0], R.dir[1], lj * nj, lj)), relleno: color(e, 'jaulaCarga'), borde: null, grosor: 0, prof: prof++ });
    }
  }
  // bandejas
  const T = L.bandejas, cb = color(e, 'bandeja'), tb = tm.bandeja;
  for (let j = 0; j < T; j++) {
    posBandeja(L, j, rec.pasoLazo, o3);
    p.aPantalla(o3[0], o3[1], 0, o);
    prims.push({ tipo: 'rect', x: o[0] - tb / 2, y: o[1] - tb / 2, w: tb, h: tb, relleno: cb, borde: null, grosor: 0, prof: prof++ });
  }
  // lazo detenido (micro-parada): dos líneas punteadas del color de alarma, por fuera de las bandejas, encima del lazo
  if (rec.lazoDetenido) {
    const cd = color(e, 'lazoDetenido'), g = Math.max(2, 0.14 * z);
    for (const d of [BORDE_LAZO_DETENIDO, -BORDE_LAZO_DETENIDO]) {
      prims.push({ tipo: 'linea', pts: proyectar(p, contornoLazo(D, 0.5, d)), color: cd, grosor: g, guion: [6, 4], cerrada: true, prof: prof++ });
    }
  }
  // puestos de inducción, por estado
  for (let s = 0; s < D.estaciones.length; s++) {
    const S = D.estaciones[s], st = rec.puestoEstado[s];
    p.aPantalla(S.base[0] + S.dir[0] * 0.15, S.base[1] + S.dir[1] * 0.15, 0, o);
    const rel = st === EstadoPuesto.SIN_PERSONA ? null : st === EstadoPuesto.PAUSA ? color(e, 'personaPausa')
      : st === EstadoPuesto.ESPERA_BANDEJA ? color(e, 'estadoEsperando') : color(e, 'estacion');
    prims.push({ tipo: 'circulo', x: o[0], y: o[1], r: Math.max(2.5, 0.3 * z), relleno: rel, borde: color(e, 'estacion'), grosor: 1.5, prof: prof++ });
  }
  // entidades
  const sel = op.seleccion ?? null;
  const refSel = sel ? refDe(sel.clase, sel.id) : -1;
  for (let i = 0; i < pos.n; i++) {
    const clase = pos.clase[i], est = pos.estado[i] as EstadoVisual, ref = refDe(clase as ClaseEntidad, pos.id[i]);
    p.aPantalla(pos.x[i], pos.y[i], 0, o);
    const ang = -(pos.ang[i] + c.camara.giro); // la cámara gira el mundo por `giro`; en pantalla y va hacia abajo
    if (clase === ClaseEntidad.CAMION) {
      const A = D.andenes[0];
      const dx = A ? A.dirCamion[0] : 0, dy = A ? A.dirCamion[1] : -1;
      prims.push({
        tipo: 'poligono', pts: proyectar(p, esquinas(pos.x[i], pos.y[i], dx, dy, D.camionLargo, D.camionAncho)),
        relleno: color(e, est === EstadoVisual.ESPERANDO ? 'camionEspera' : 'camion'), borde: color(e, 'camionBorde'), grosor: 1.5, prof: prof++,
      });
    } else if (clase === ClaseEntidad.PERSONA) {
      prims.push({
        tipo: 'glifo', forma: 'persona', x: o[0], y: o[1], tam: tm.persona, ang: 0,
        relleno: color(e, est === EstadoVisual.ESPERANDO ? 'personaPausa' : 'persona'), borde: color(e, 'fondo'), ref, alfa: 1, prof: prof++,
      });
    } else {
      const grande = esReproductorEscena(rep) && rep.bandejasDe(pos.id[i]) === 2;
      prims.push({
        tipo: 'glifo', forma: FORMA_ESTADO[est], x: o[0], y: o[1], tam: grande ? tm.paquete * 1.35 : tm.paquete, ang,
        relleno: color(e, COLOR_ESTADO[est]), borde: est === EstadoVisual.ATRASADO ? color(e, 'texto') : null, ref, alfa: 1, prof: prof++,
      });
    }
    if (ref === refSel) prims.push(halo(c, o[0], o[1], clase === ClaseEntidad.PERSONA ? tm.persona : tm.paquete, ref, prof++));
  }
  // selección de un recurso fijo
  if (sel && sel.clase === ClaseEntidad.RAMPA && sel.id >= 0 && sel.id < D.rampas.length) {
    const R = D.rampas[sel.id];
    prims.push({ tipo: 'poligono', pts: proyectar(p, tobogan(R.ini, R.jaula, R.ancho * 1.5)), relleno: null, borde: color(e, 'seleccion'), grosor: 2.5, prof: prof++ });
  } else if (sel && sel.clase === ClaseEntidad.PUESTO && sel.id >= 0 && sel.id < D.estaciones.length) {
    const S = D.estaciones[sel.id];
    p.aPantalla(S.base[0], S.base[1], 0, o);
    prims.push(halo(c, o[0], o[1], Math.max(8, 0.9 * z), refDe(ClaseEntidad.PUESTO, sel.id), prof++));
  }
  // fantasma: los paquetes del otro escenario en el mismo instante, solo el contorno
  if (op.fantasma) {
    const bf = calcular(op.fantasma, c.t), pf = bf.pos, cf = color(e, 'fantasma');
    for (let i = 0; i < pf.n; i++) {
      if (pf.clase[i] !== ClaseEntidad.PAQUETE) continue;
      p.aPantalla(pf.x[i], pf.y[i], 0, o);
      prims.push({
        tipo: 'glifo', forma: FORMA_ESTADO[pf.estado[i] as EstadoVisual], x: o[0], y: o[1], tam: tm.paquete, ang: 0, relleno: cf, borde: null,
        ref: refDe(ClaseEntidad.PAQUETE, pf.id[i]), alfa: 0.4, prof: prof++,
      });
    }
  }
}

/** Halo de la selección (pulsa salvo con movimiento reducido). */
export function halo(c: Composicion, x: number, y: number, tam: number, ref: number, prof: number): Primitiva {
  const pulso = c.estilo.reducirMovimiento ? 0 : (c.pulso ?? 0);
  return {
    tipo: 'glifo', forma: 'halo', x, y, tam: tam * (1.9 + 0.35 * Math.sin(2 * Math.PI * pulso)), ang: 0,
    relleno: color(c.estilo, 'seleccion'), borde: null, ref, alfa: 1, prof,
  };
}

/** Lista de primitivas de la planta 2D en el instante c.t (capa «fondo», «movil» o «todo»). */
export function componer2d(c: Composicion): Primitiva[] {
  const p = crearProyector('2d', c.camara, c.marco);
  const capa = c.capa ?? 'todo';
  const prims: Primitiva[] = [];
  const D = buffersDe(c.rep).disposicion;
  if (capa !== 'movil') fondo(c, p, D, prims);
  if (capa !== 'fondo') movil(c, p, D, calcular(c.rep, c.t), prims);
  return prims;
}
