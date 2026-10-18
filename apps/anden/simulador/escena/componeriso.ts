// escena/componeriso.ts · Andén simulador, corte 1 · P6 (escena).
// Vista 2,5D isométrica sin GPU (diseño maestro §4.7; maqueta medida en visiones/experiencia-medicion/vistas.mjs): compone la lista de
// primitivas de un instante (función pura, probada en Node) ordenada por PROFUNDIDAD (lo más lejano primero), con cajas proyectadas
// para lo fijo y sprites horneados por estado para lo que se mueve. Dos capas como la planta: «fondo» (se hornea una vez por cámara)
// y «movil». Dentro de cada capa, la lista sale ordenada por `prof` de mayor a menor: así se pinta.
import { ClaseEntidad, refDe } from '../contratos/traza.ts';
import { EstadoVisual } from '../contratos/vistas.ts';
import { posEnLazo } from '../contratos/geometria.ts';
import { buffersDe, calcular, type Buffers } from './buffers.ts';
import type { Disposicion, V2 } from './disposicion.ts';
import { COLOR_ESTADO, FORMA_ESTADO, color, colorRiesgo, sombrear } from './estilo.ts';
import { posBandeja } from './lazo.ts';
import { crearProyector, esquinas, type Primitiva, type Proyector, type PGlifo } from './primitivas.ts';
import { BORDE_LAZO_DETENIDO, cajaFila, contornoLazo, halo, tamanos, tobogan, toboganCarga, type Composicion } from './componer2d.ts';
import { EstadoPuesto, esReproductorEscena } from './reproductor.ts';

/** Alturas (m) de lo fijo, como la maqueta. */
export const ALTURAS = { lazo: 0.85, lazoTapa: 1.07, cinta: 0.58, cintaTapa: 0.7, toboganAlto: 0.8, toboganBajo: 0.4, mesa: 0.85, anden: 1.2 };
/** Altura (m) del rótulo de una rampa cuya jaula queda entre el rótulo y la cámara: por encima de la jaula llena (0,06 + 1,1 m). */
export const ALTURA_ROTULO_ATRAS = 1.5;

/**
 * Caras visibles de una caja orientada (centro cx, cy; dirección del largo dx, dy; base en z0; alto h): las laterales que miran a la
 * cámara (normal con w negativo) y la tapa, en ese orden. Las laterales se oscurecen según su orientación.
 */
export function carasCaja(
  p: Proyector, cx: number, cy: number, z0: number, dx: number, dy: number, largo: number, ancho: number, h: number, col: string,
  prof: number, prims: Primitiva[], borde: string | null = null,
): void {
  const c = esquinas(cx, cy, dx, dy, largo, ancho);
  const g = p.camara.giro, sg = Math.sin(g), cg = Math.cos(g);
  const o = [0, 0];
  const proj = (x: number, y: number, z: number, arr: number[]) => { p.aPantalla(x, y, z, o); arr.push(o[0], o[1]); };
  // las 4 caras laterales: (c0,c1), (c1,c2), (c2,c3), (c3,c0)
  for (let k = 0; k < 4; k++) {
    const ax = c[2 * k], ay = c[2 * k + 1], bx = c[(2 * k + 2) % 8], by = c[(2 * k + 3) % 8];
    // normal hacia afuera de la arista (el polígono va en sentido antihorario): (by − ay, −(bx − ax))
    const nx = by - ay, ny = -(bx - ax);
    const haciaCamara = nx * sg + ny * cg;
    if (haciaCamara >= 0) continue;
    const pts: number[] = [];
    proj(ax, ay, z0, pts); proj(bx, by, z0, pts); proj(bx, by, z0 + h, pts); proj(ax, ay, z0 + h, pts);
    const luz = 0.62 + 0.18 * Math.abs(nx) / (Math.abs(nx) + Math.abs(ny) || 1);
    prims.push({ tipo: 'poligono', pts, relleno: sombrear(col, luz), borde, grosor: borde ? 1 : 0, prof });
  }
  const tapa: number[] = [];
  for (let k = 0; k < 4; k++) proj(c[2 * k], c[2 * k + 1], z0 + h, tapa);
  prims.push({ tipo: 'poligono', pts: tapa, relleno: col, borde, grosor: borde ? 1 : 0, prof });
}

/** Polígono plano en el mundo a la altura z (o con una altura por vértice). */
function plano(p: Proyector, pts: number[], z: number | number[]): number[] {
  const o = [0, 0], out: number[] = [];
  for (let i = 0; i < pts.length; i += 2) { p.aPantalla(pts[i], pts[i + 1], typeof z === 'number' ? z : z[i / 2], o); out.push(o[0], o[1]); }
  return out;
}

/** Profundidad de un punto para ordenar: w del punto menos un poco de su altura (a igual w, lo más alto se pinta después). */
const profDe = (p: Proyector, x: number, y: number, z = 0) => p.prof(x, y) - 0.25 * z;

/** Alturas de las 4 esquinas de un tobogán (de `ini` alto a `fin` bajo): orden de esquinas() con el largo de ini a fin. */
function alturasTobogan(): number[] {
  const A = ALTURAS;
  return [A.toboganAlto, A.toboganBajo, A.toboganBajo, A.toboganAlto];
}

function fondo(c: Composicion, p: Proyector, D: Disposicion, prims: Primitiva[]): void {
  const e = c.estilo, tm = tamanos(c.camara.zoom), A = ALTURAS, o = [0, 0];
  const L = D.limites;
  // piso y grilla: siempre detrás de todo
  const lejos = Infinity;
  prims.push({ tipo: 'rect', x: 0, y: 0, w: c.marco.ancho, h: c.marco.alto, relleno: color(e, 'fondo'), borde: null, grosor: 0, prof: lejos });
  prims.push({ tipo: 'poligono', pts: plano(p, [L.xmin, L.ymin, L.xmax, L.ymin, L.xmax, L.ymax, L.xmin, L.ymax], 0), relleno: color(e, 'piso'), borde: null, grosor: 0, prof: lejos });
  const grilla = color(e, 'grilla');
  for (let x = Math.ceil(L.xmin / 4) * 4; x <= L.xmax; x += 4) prims.push({ tipo: 'linea', pts: plano(p, [x, L.ymin, x, L.ymax], 0), color: grilla, grosor: 1, guion: null, cerrada: false, prof: lejos });
  for (let y = Math.ceil(L.ymin / 4) * 4; y <= L.ymax; y += 4) prims.push({ tipo: 'linea', pts: plano(p, [L.xmin, y, L.xmax, y], 0), color: grilla, grosor: 1, guion: null, cerrada: false, prof: lejos });

  const cosas: Primitiva[] = [];
  // acumulación: una mesa baja
  {
    const caja = cajaFila(D);
    const cx = (caja[0] + caja[4]) / 2, cy = (caja[1] + caja[5]) / 2, lx = Math.abs(caja[2] - caja[0]), ly = Math.abs(caja[5] - caja[3]);
    carasCaja(p, cx, cy, 0, 1, 0, lx, ly, 0.7, color(e, 'acumulacion'), profDe(p, cx, cy), cosas);
  }
  // cintas en tramos de ~1,2 m (para que el orden por profundidad no falle con piezas largas)
  for (const ci of D.cintas) {
    for (let k = 1; k < ci.acum.length; k++) {
      const x0 = ci.xy[2 * k - 2], y0 = ci.xy[2 * k - 1], x1 = ci.xy[2 * k], y1 = ci.xy[2 * k + 1];
      const l = ci.acum[k] - ci.acum[k - 1];
      if (!(l > 0)) continue;
      const nseg = Math.max(1, Math.ceil(l / 1.2)), dx = (x1 - x0) / l, dy = (y1 - y0) / l;
      for (let s = 0; s < nseg; s++) {
        const f = (s + 0.5) / nseg, cx = x0 + (x1 - x0) * f, cy = y0 + (y1 - y0) * f;
        carasCaja(p, cx, cy, A.cinta, dx, dy, l / nseg, 0.9, A.cintaTapa - A.cinta, color(e, 'cinta'), profDe(p, cx, cy, A.cinta), cosas);
      }
    }
  }
  // andenes (muelle)
  for (const a of D.andenes) carasCaja(p, a.base[0], a.base[1], 0, a.lat[0], a.lat[1], 2.6, 1.0, A.anden, color(e, 'anden'), profDe(p, a.base[0], a.base[1]), cosas);
  // lazo: una pieza por bandeja
  {
    const T = Math.max(8, D.lazo.bandejas), o3 = [0, 0, 0], paso = D.lazo.largo / T;
    for (let j = 0; j < T; j++) {
      posEnLazo(D.lazo, (j + 0.5) * paso, o3);
      carasCaja(p, o3[0], o3[1], A.lazo, Math.cos(o3[2]), Math.sin(o3[2]), paso * 1.02, 1.1, A.lazoTapa - A.lazo - 0.02, color(e, 'lazo'), profDe(p, o3[0], o3[1], A.lazo), cosas);
    }
  }
  // toboganes, jaulas y excepción
  const alt = alturasTobogan();
  for (const r of D.rampas) {
    const cx = (r.ini[0] + r.fin[0]) / 2, cy = (r.ini[1] + r.fin[1]) / 2;
    cosas.push({ tipo: 'poligono', pts: plano(p, tobogan(r.ini, r.fin, r.ancho), alt), relleno: color(e, 'rampa'), borde: color(e, 'rampaBorde'), grosor: 1, prof: profDe(p, cx, cy, 0.6) });
    const lj = Math.min(r.ancho * 1.1, 1.2);
    carasCaja(p, r.jaula[0], r.jaula[1], 0, r.dir[0], r.dir[1], lj, lj, 0.06, color(e, 'jaula'), profDe(p, r.jaula[0], r.jaula[1]), cosas);
  }
  {
    const X = D.excepcion, cx = (X.ini[0] + X.fin[0]) / 2, cy = (X.ini[1] + X.fin[1]) / 2;
    cosas.push({ tipo: 'poligono', pts: plano(p, tobogan(X.ini, X.fin, X.ancho * 1.6), alt), relleno: color(e, 'rampa'), borde: color(e, 'excepcion'), grosor: 2, prof: profDe(p, cx, cy, 0.6) });
    for (const m of D.mesas) carasCaja(p, m[0], m[1], 0, X.lat[0], X.lat[1], 1.0, 0.6, A.mesa, color(e, 'excepcion'), profDe(p, m[0], m[1]), cosas);
  }
  // estaciones: un pupitre en el lugar de la mano
  for (const s of D.estaciones) carasCaja(p, s.mano[0], s.mano[1], 0, s.dir[0], s.dir[1], 0.5, 0.7, A.mesa, color(e, 'cinta'), profDe(p, s.mano[0], s.mano[1]), cosas);
  // lector: un arco sobre el lazo
  {
    const l = D.lector;
    carasCaja(p, l[0], l[1], 1.75, 1, 0, 0.3, 2.0, 0.15, color(e, 'lector'), profDe(p, l[0], l[1], 1.75), cosas);
  }
  cosas.sort((a, b) => b.prof - a.prof);
  for (const x of cosas) prims.push(x);
  // rótulos (datos del modelo), siempre encima de lo fijo. Un rótulo que queda DETRÁS de su jaula (más lejos de la cámara) se levanta
  // por encima de la jaula llena (1,16 m), para que la carga de la capa móvil no lo tape.
  if (tm.rotulo >= 8) {
    const rot = color(e, 'rotulo');
    for (const r of D.rampas) {
      const x = r.jaula[0] + r.dir[0] * 0.9, y = r.jaula[1] + r.dir[1] * 0.9;
      const z = p.prof(x, y) > p.prof(r.jaula[0], r.jaula[1]) ? ALTURA_ROTULO_ATRAS : 0;
      p.aPantalla(x, y, z, o);
      prims.push({ tipo: 'texto', x: o[0], y: o[1], texto: r.id.slice(0, 8), tam: tm.rotulo, color: rot, alinear: 'center', prof: -Infinity });
    }
  }
}

function movil(c: Composicion, p: Proyector, D: Disposicion, b: Buffers, prims: Primitiva[]): void {
  const e = c.estilo, z = c.camara.zoom, tm = tamanos(z), A = ALTURAS, o = [0, 0], o3 = new Float64Array(3);
  const rep = c.rep, rec = b.rec, pos = b.pos, op = c.opciones ?? {};
  const lista: Primitiva[] = [];
  if (rec.lazoDetenido) {
    // dos líneas punteadas del color de alarma a los costados del lazo, a la altura de las bandejas (nada de la capa móvil las tapa)
    const cd = color(e, 'lazoDetenido'), g = Math.max(2, 0.12 * z);
    for (const d of [BORDE_LAZO_DETENIDO, -BORDE_LAZO_DETENIDO]) {
      lista.push({ tipo: 'linea', pts: plano(p, contornoLazo(D, 0.5, d), A.lazoTapa + 0.02), color: cd, grosor: g, guion: [6, 4], cerrada: true, prof: Infinity });
    }
  }
  const alt = alturasTobogan().map((h) => h + 0.02);
  const riesgo = op.riesgo ?? null;
  for (let r = 0; r < D.rampas.length; r++) {
    const R = D.rampas[r], cx = (R.ini[0] + R.fin[0]) / 2, cy = (R.ini[1] + R.fin[1]) / 2, pr = profDe(p, cx, cy, 0.62);
    if (riesgo && r < riesgo.rampaProbLlena.length) {
      lista.push({ tipo: 'poligono', pts: plano(p, tobogan(R.ini, R.fin, R.ancho), alt), relleno: color(e, colorRiesgo(riesgo.rampaProbLlena[r])), borde: null, grosor: 0, prof: pr });
    }
    const oc = rec.rampaOcupacion[r];
    if (oc > 0) {
      const llena = rec.rampaLlena[r] === 1, f = Math.min(1, oc / Math.max(1, R.capacidad));
      // la parte cargada va del extremo bajo (fin) hacia el lazo: alturas interpoladas
      const hIni = A.toboganBajo + (A.toboganAlto - A.toboganBajo) * f + 0.03, hFin = A.toboganBajo + 0.03;
      lista.push({
        tipo: 'poligono', pts: plano(p, toboganCarga(R.ini, R.fin, R.ancho * 0.8, f), [hIni, hFin, hFin, hIni]),
        relleno: color(e, llena ? 'rampaLlena' : 'rampaCarga'), borde: llena ? color(e, 'texto') : null, grosor: llena ? 1.2 : 0, prof: pr - 0.001,
      });
    }
    const nj = b.nivelJaula[r];
    if (nj > 0) {
      const lj = Math.min(R.ancho * 1.1, 1.2) * 0.86;
      carasCaja(p, R.jaula[0], R.jaula[1], 0.06, R.dir[0], R.dir[1], lj, lj, 1.1 * nj, color(e, 'jaulaCarga'), profDe(p, R.jaula[0], R.jaula[1], 0.06), lista);
    }
  }
  // bandejas: la tapa de cada una a la altura del lazo
  const T = D.lazo.bandejas, cb = color(e, 'bandeja'), paso = D.lazo.largo / Math.max(1, T);
  for (let j = 0; j < T; j++) {
    posBandeja(D.lazo, j, rec.pasoLazo, o3);
    const pts = plano(p, esquinas(o3[0], o3[1], Math.cos(o3[2]), Math.sin(o3[2]), paso * 0.82, 0.95), A.lazoTapa);
    lista.push({ tipo: 'poligono', pts, relleno: cb, borde: null, grosor: 0, prof: profDe(p, o3[0], o3[1], A.lazoTapa) });
  }
  // puestos: un disco sobre el pupitre, por estado
  for (let s = 0; s < D.estaciones.length; s++) {
    const S = D.estaciones[s], st = rec.puestoEstado[s];
    p.aPantalla(S.mano[0], S.mano[1], A.mesa + 0.02, o);
    const rel = st === EstadoPuesto.SIN_PERSONA ? null : st === EstadoPuesto.PAUSA ? color(e, 'personaPausa')
      : st === EstadoPuesto.ESPERA_BANDEJA ? color(e, 'estadoEsperando') : color(e, 'estacion');
    lista.push({ tipo: 'circulo', x: o[0], y: o[1], r: Math.max(2, 0.2 * z), relleno: rel, borde: color(e, 'estacion'), grosor: 1, prof: profDe(p, S.mano[0], S.mano[1], A.mesa) - 0.002 });
  }
  // entidades: sprites horneados (con un glifo de respaldo)
  const sel = op.seleccion ?? null, refSel = sel ? refDe(sel.clase, sel.id) : -1;
  const zs = pos.z;
  for (let i = 0; i < pos.n; i++) {
    const clase = pos.clase[i], est = pos.estado[i] as EstadoVisual, ref = refDe(clase as ClaseEntidad, pos.id[i]);
    const h = zs ? zs[i] : clase === ClaseEntidad.PAQUETE ? 0.9 : 0;
    p.aPantalla(pos.x[i], pos.y[i], h, o);
    const pr = profDe(p, pos.x[i], pos.y[i], h);
    let respaldo: PGlifo, clave: string;
    if (clase === ClaseEntidad.PERSONA) {
      const pausa = est === EstadoVisual.ESPERANDO;
      clave = `persona:${pausa ? EstadoVisual.ESPERANDO : EstadoVisual.NORMAL}`;
      respaldo = { tipo: 'glifo', forma: 'persona', x: o[0], y: o[1] - tm.persona * 0.6, tam: tm.persona, ang: 0, relleno: color(e, pausa ? 'personaPausa' : 'persona'), borde: color(e, 'fondo'), ref, alfa: 1, prof: pr };
    } else if (clase === ClaseEntidad.CAMION) {
      const espera = est === EstadoVisual.ESPERANDO;
      clave = `camion:${espera ? EstadoVisual.ESPERANDO : EstadoVisual.NORMAL}:${gradosCamion(pos.ang[i])}`;
      respaldo = { tipo: 'glifo', forma: 'camion', x: o[0], y: o[1], tam: Math.max(10, D.camionLargo * z), ang: 0, relleno: color(e, espera ? 'camionEspera' : 'camion'), borde: color(e, 'camionBorde'), ref, alfa: 1, prof: pr };
    } else {
      const grande = esReproductorEscena(rep) && rep.bandejasDe(pos.id[i]) === 2;
      clave = `${grande ? 'paquete2' : 'paquete'}:${est}`;
      respaldo = {
        tipo: 'glifo', forma: FORMA_ESTADO[est], x: o[0], y: o[1], tam: grande ? tm.paquete * 1.35 : tm.paquete, ang: 0,
        relleno: color(e, COLOR_ESTADO[est]), borde: est === EstadoVisual.ATRASADO ? color(e, 'texto') : null, ref, alfa: 1, prof: pr,
      };
    }
    lista.push({ tipo: 'sprite', clave, x: o[0], y: o[1], respaldo, prof: pr });
    if (ref === refSel) lista.push(halo(c, o[0], o[1], clase === ClaseEntidad.PERSONA ? tm.persona : tm.paquete, ref, pr - 0.001));
  }
  if (sel && sel.clase === ClaseEntidad.RAMPA && sel.id >= 0 && sel.id < D.rampas.length) {
    const R = D.rampas[sel.id];
    lista.push({ tipo: 'poligono', pts: plano(p, tobogan(R.ini, R.jaula, R.ancho * 1.5), 0.9), relleno: null, borde: color(e, 'seleccion'), grosor: 2.5, prof: -Infinity });
  } else if (sel && sel.clase === ClaseEntidad.PUESTO && sel.id >= 0 && sel.id < D.estaciones.length) {
    const S = D.estaciones[sel.id];
    p.aPantalla(S.mano[0], S.mano[1], A.mesa, o);
    lista.push(halo(c, o[0], o[1], Math.max(8, 0.9 * z), refDe(ClaseEntidad.PUESTO, sel.id), -Infinity));
  }
  if (op.fantasma) {
    const bf = calcular(op.fantasma, c.t), pf = bf.pos, cf = color(e, 'fantasma');
    for (let i = 0; i < pf.n; i++) {
      if (pf.clase[i] !== ClaseEntidad.PAQUETE) continue;
      const h = pf.z ? pf.z[i] : 0.9;
      p.aPantalla(pf.x[i], pf.y[i], h, o);
      lista.push({
        tipo: 'glifo', forma: FORMA_ESTADO[pf.estado[i] as EstadoVisual], x: o[0], y: o[1], tam: tm.paquete, ang: 0, relleno: cf, borde: null,
        ref: refDe(ClaseEntidad.PAQUETE, pf.id[i]), alfa: 0.4, prof: profDe(p, pf.x[i], pf.y[i], h) - 0.0005,
      });
    }
  }
  lista.sort((a, b) => b.prof - a.prof);
  for (const x of lista) prims.push(x);
}

/** Lista de primitivas de la vista 2,5D en el instante c.t, ordenada por profundidad dentro de cada capa. */
export function componerIso(c: Composicion): Primitiva[] {
  const p = crearProyector('iso', c.camara, c.marco);
  const capa = c.capa ?? 'todo';
  const prims: Primitiva[] = [];
  const D = buffersDe(c.rep).disposicion;
  if (capa !== 'movil') fondo(c, p, D, prims);
  if (capa !== 'fondo') movil(c, p, D, calcular(c.rep, c.t), prims);
  return prims;
}

/** Ángulo de un camión redondeado a 15° (clave del sprite: el horno tiene uno por orientación). */
export function gradosCamion(ang: number): number {
  const g = Math.round(((ang * 180) / Math.PI) / 15) * 15;
  return ((g % 360) + 360) % 360;
}

/** Centro de un tobogán en el mundo (para pruebas y para la vista). */
export function centroTobogan(ini: V2, fin: V2): V2 {
  return [(ini[0] + fin[0]) / 2, (ini[1] + fin[1]) / 2];
}
