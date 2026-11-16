// El cuarto: piso de tablas, paredes con boiserie, la ventana a la pista, la alfombra y el frente con la puerta (para la
// primera entrada). Medidas en metros. La pared del fondo mira al norte (−z): por esa ventana entra el sol todo el día.
import * as THREE from 'three';
import { Lote, caja, placa, cilindro, esfera, torno, pos, rot, tr, texturaAlfombra, lienzo, textura, material } from './kit.js';

// Dos distribuciones: apaisada (escritorio) y vertical (celular). Cambia dónde va cada cosa en la pared, no qué hay.
export function planDe(vertical) {
  const base = {
    fondo: -2.0, espesor: 0.22, zocalo: 0.82,
    colores: { pared: '#a9bfae', cielorraso: '#efe9dc', nogal: '#8b5a36', nogalOscuro: '#6e452a', nogalClaro: '#a56f44', marco: '#f2ead8' },
  };
  // estante.filas(n): a qué alturas van las tablas según cuántos aviones hay (la flota crece: el estante también)
  if (vertical) return { ...base, vertical: true, ancho: 3.4, alto: 3.72, frente: 3.4,
    ventana: { x: 0.6, y: 1.7, w: 0.76, h: 1.3 },
    mapa: { x: -0.56, y: 1.72, w: 0.8 },
    reloj: { x: 0.03, y: 2.16 }, calendario: { x: 0.03, y: 1.2 },
    estante: { x: 0, w: 1.92, filas: (n) => (n <= 10 ? [2.64, 3.0] : [2.6, 2.89, 3.18]) },
    escritorio: { x: 0, z: -0.8, w: 1.62, d: 0.96 },
    alfombra: { x: 0, z: 0.1, w: 2.5, d: 2.3 },
  };
  return { ...base, vertical: false, fondo: -2.6, ancho: 6.2, alto: 3.05, frente: 3.7,
    ventana: { x: 1.56, y: 1.76, w: 1.36, h: 1.7 },
    mapa: { x: -0.62, y: 1.72, w: 1.0 },
    reloj: { x: 0.38, y: 2.06 }, calendario: { x: 0.38, y: 1.3 },
    estante: { x: -2.1, w: 1.3, filas: (n) => (n <= 6 ? [1.42, 1.96] : n <= 12 ? [1.2, 1.66, 2.12] : [1.02, 1.42, 1.82, 2.22]) },
    escritorio: { x: 0.0, z: -0.42, w: 1.92, d: 0.96 },
    alfombra: { x: 0.0, z: 0.1, w: 3.5, d: 2.5 },
  };
}

// Boiserie sobre una pared de largo L (en local: corre por +X, mira a +Z).
function boiserie(l, L, alto, m, C, saltar = null) {
  const paso = L / Math.max(1, Math.round(L / 0.62));
  l.mas(caja(L, 0.15, 0.032, 0.008), 'madera', C.nogalOscuro, tr(m.clone(), pos(L / 2, 0.075, 0.024)));
  l.mas(caja(L, 0.035, 0.014, 0.006), 'madera', C.nogal, tr(m.clone(), pos(L / 2, 0.168, 0.03)));
  l.mas(caja(L, 0.085, 0.024, 0.006), 'madera', C.nogal, tr(m.clone(), pos(L / 2, alto - 0.075, 0.022)));
  l.mas(caja(L, 0.04, 0.058, 0.014, 2), 'madera', C.nogalClaro, tr(m.clone(), pos(L / 2, alto + 0.012, 0.03)));
  l.mas(caja(L, 0.02, 0.035, 0.008), 'madera', C.nogal, tr(m.clone(), pos(L / 2, alto - 0.018, 0.024)));
  for (let x = 0; x <= L + 1e-3; x += paso) {
    l.mas(caja(0.078, alto - 0.3, 0.024, 0.006), 'madera', C.nogal, tr(m.clone(), pos(Math.min(L - 0.039, Math.max(0.039, x)), 0.185 + (alto - 0.3) / 2, 0.022)), { veta: 1 });
    if (x + paso > L + 1e-3) break;
    if (saltar && saltar(x + paso / 2)) continue;
    // tablero en relieve
    l.mas(caja(paso - 0.078 - 0.07, alto - 0.42, 0.014, 0.01, 2), 'madera', C.nogalClaro, tr(m.clone(), pos(x + paso / 2, 0.185 + (alto - 0.3) / 2, 0.02)), { veta: 1 });
  }
  // el tablero de fondo va último: lo de adelante se dibuja primero y el fondo solo paga donde se ve (las juntas)
  l.mas(caja(L, alto, 0.016, 0.002), 'madera', C.nogalOscuro, tr(m.clone(), pos(L / 2, alto / 2, 0.008)), { veta: 1 });
}

export function crearCuarto(mats, plan, colorEmpresa) {
  const l = new Lote(mats, 101), C = plan.colores;
  const W = plan.ancho, H = plan.alto, zf = plan.fondo, zF = plan.frente, P = zF - zf, v = plan.ventana;

  // piso y cielorraso
  // (sin cielorraso: la cámara nunca mira hacia arriba; y el revoque arranca donde termina la boiserie, para no pintar dos veces)
  l.mas(new THREE.PlaneGeometry(W, P + 2.4).rotateX(-Math.PI / 2), 'piso', '#b98558', pos(0, 0, (zf + zF) / 2 + 1.2), { veta: 2 });
  const y0p = plan.zocalo - 0.04;

  // pared del fondo, con el hueco de la ventana
  const s = new THREE.Shape();
  s.moveTo(-W / 2, y0p); s.lineTo(W / 2, y0p); s.lineTo(W / 2, H); s.lineTo(-W / 2, H); s.closePath();
  const hueco = new THREE.Path();
  hueco.moveTo(v.x - v.w / 2, v.y - v.h / 2); hueco.lineTo(v.x - v.w / 2, v.y + v.h / 2); hueco.lineTo(v.x + v.w / 2, v.y + v.h / 2); hueco.lineTo(v.x + v.w / 2, v.y - v.h / 2); hueco.closePath();
  s.holes.push(hueco);
  l.mas(new THREE.ExtrudeGeometry(s, { depth: plan.espesor, bevelEnabled: false }), 'yeso', C.pared, pos(0, 0, zf - plan.espesor));
  // paredes de los costados
  const mIzq = tr(pos(-W / 2, 0, zF), rot(0, Math.PI / 2, 0)), mDer = tr(pos(W / 2, 0, zf), rot(0, -Math.PI / 2, 0));
  for (const m of [mIzq, mDer]) l.mas(caja(P, H - y0p, 0.12, 0.002), 'yeso', C.pared, tr(m.clone(), pos(P / 2, (H + y0p) / 2, -0.06)));
  // lo que tapa la boiserie también tapa el sol: una pared lisa detrás (no se ve, pero da sombra)
  l.mas(caja(W, y0p, 0.1, 0.002), 'mate', C.nogalOscuro, pos(0, y0p / 2, zf - 0.06));
  // boiserie (debajo de la ventana sigue, sin tableros donde pega el antepecho)
  boiserie(l, W, plan.zocalo, pos(-W / 2, 0, zf), C);
  boiserie(l, P, plan.zocalo, mIzq, C);
  boiserie(l, P, plan.zocalo, mDer, C);
  // moldura alta, de donde cuelgan los cuadros
  l.mas(caja(W, 0.05, 0.03, 0.01, 2), 'madera', C.nogal, pos(0, H - 0.34, zf + 0.015));
  for (const m of [mIzq, mDer]) l.mas(caja(P, 0.05, 0.03, 0.01, 2), 'madera', C.nogal, tr(m.clone(), pos(P / 2, H - 0.34, 0.015)));

  // ── ventana ──
  const x0 = v.x - v.w / 2, x1 = v.x + v.w / 2, y0 = v.y - v.h / 2, y1 = v.y + v.h / 2, zv = zf - 0.13;
  // contramarco y antepecho
  l.mas(caja(v.w + 0.3, 0.12, 0.034, 0.01, 2), 'satin', C.marco, pos(v.x, y1 + 0.06, zf + 0.017));
  l.mas(caja(v.w + 0.36, 0.03, 0.05, 0.01, 2), 'satin', C.marco, pos(v.x, y1 + 0.13, zf + 0.025));
  for (const sx of [-1, 1]) l.mas(caja(0.11, v.h + 0.02, 0.034, 0.01, 2), 'satin', C.marco, pos(v.x + sx * (v.w / 2 + 0.055), v.y, zf + 0.017));
  l.mas(caja(v.w + 0.36, 0.045, 0.3, 0.014, 2), 'satin', C.marco, pos(v.x, y0 - 0.0225, zf - 0.03));
  l.mas(caja(v.w + 0.24, 0.085, 0.026, 0.008), 'satin', C.marco, pos(v.x, y0 - 0.088, zf + 0.013));
  // forro del hueco (madera pintada)
  for (const sx of [-1, 1]) l.mas(caja(0.02, v.h, plan.espesor, 0.004), 'satin', C.marco, pos(v.x + sx * (v.w / 2 - 0.01), v.y, zf - plan.espesor / 2));
  l.mas(caja(v.w, 0.02, plan.espesor, 0.004), 'satin', C.marco, pos(v.x, y1 - 0.01, zf - plan.espesor / 2));
  // hojas: marco, parante del medio y varillas
  const b = 0.05, prof = 0.045, mar = 0.02;
  const X0 = x0 + mar, X1 = x1 - mar, Y0 = y0 + 0.002, Y1 = y1 - mar;
  l.mas(caja(X1 - X0, b, prof, 0.008), 'satin', C.marco, pos(v.x, Y1 - b / 2, zv));
  l.mas(caja(X1 - X0, b * 1.3, prof, 0.008), 'satin', C.marco, pos(v.x, Y0 + b * 0.65, zv));
  for (const x of [X0 + b / 2, X1 - b / 2]) l.mas(caja(b, Y1 - Y0, prof, 0.008), 'satin', C.marco, pos(x, (Y0 + Y1) / 2, zv));
  l.mas(caja(b * 1.25, Y1 - Y0, prof * 1.2, 0.008), 'satin', C.marco, pos(v.x, (Y0 + Y1) / 2, zv));
  const panos = [], cols = 2, filas = 3, vr = 0.02;
  for (const lado of [0, 1]) {
    const a = lado ? v.x + b * 0.625 : X0 + b, c = lado ? X1 - b : v.x - b * 0.625, ab = Y0 + b * 1.3, ar = Y1 - b;
    for (let i = 1; i < cols; i++) l.mas(caja(vr, ar - ab, prof * 0.7, 0.005), 'satin', C.marco, pos(a + (c - a) * i / cols, (ab + ar) / 2, zv));
    for (let j = 1; j < filas; j++) l.mas(caja(c - a, vr, prof * 0.7, 0.005), 'satin', C.marco, pos((a + c) / 2, ab + (ar - ab) * j / filas, zv));
    for (let i = 0; i < cols; i++) for (let j = 0; j < filas; j++) {
      const px0 = a + (c - a) * i / cols + (i ? vr / 2 : 0), px1 = a + (c - a) * (i + 1) / cols - (i < cols - 1 ? vr / 2 : 0);
      const py0 = ab + (ar - ab) * j / filas + (j ? vr / 2 : 0), py1 = ab + (ar - ab) * (j + 1) / filas - (j < filas - 1 ? vr / 2 : 0);
      panos.push({ x0: px0, x1: px1, y0: py0, y1: py1 });
    }
    // falleba de bronce
    l.mas(cilindro(0.008, 0.11, 8), 'metal', '#c9a04e', pos(lado ? v.x + 0.012 : v.x - 0.012, v.y - 0.05, zv + prof * 0.75));
  }
  l.mas(new THREE.PlaneGeometry(X1 - X0, Y1 - Y0), 'vidrio', '#9fb4c4', pos(v.x, (Y0 + Y1) / 2, zv));
  // maceta en el antepecho
  const mx = v.x + v.w / 2 - 0.2, my = y0, mz = zf - 0.03;
  l.mas(torno([[0.0, 0], [0.045, 0], [0.062, 0.085], [0.068, 0.09], [0.068, 0.105], [0.055, 0.105], [0.05, 0.095], [0, 0.095]], 14), 'mate', '#b4623c', pos(mx, my, mz));
  const rh = [[0, 0.17, 0, 0.4], [0.5, 0.15, 0.9, 0.5], [-0.5, 0.14, -1.1, 0.45], [0.2, 0.19, 2.2, 0.3], [-0.3, 0.12, 3.6, 0.55], [0.1, 0.13, 4.6, 0.6]];
  for (const [inc, largo, giro, caida] of rh) {
    const hoja = new THREE.SphereGeometry(1, 8, 6); hoja.scale(0.02, largo / 2, 0.006);
    l.mas(hoja, 'satin', inc > 0.3 ? '#4d8a4e' : '#3f7a44', tr(pos(mx, my + 0.1, mz), rot(0, giro, 0), rot(caida, 0, inc * 0.3), pos(0, largo / 2, 0)));
  }

  const grupo = l.armar({ nombre: 'cuarto' });
  // cielorraso: una malla aparte (casi nunca entra en cuadro: así no cuesta nada cuando no se ve)
  const techo = new THREE.Mesh(new THREE.PlaneGeometry(W, P + 0.4).rotateX(Math.PI / 2), new THREE.MeshLambertMaterial({ color: new THREE.Color(C.cielorraso) }));
  techo.position.set(0, H, (zf + zF) / 2); techo.name = 'cielorraso'; grupo.add(techo);

  // alfombra (pieza aparte: tiene su dibujo)
  const a = plan.alfombra;
  const texA = texturaAlfombra(colorEmpresa);
  const matA = material({ map: texA, roughness: 1, metalness: 0 });
  const alfombra = new THREE.Mesh(new THREE.PlaneGeometry(a.w, a.d).rotateX(-Math.PI / 2), matA);
  alfombra.position.set(a.x, 0.006, a.z); alfombra.receiveShadow = true; alfombra.name = 'alfombra'; alfombra.renderOrder = -1;     // antes que el piso: no se pinta dos veces
  grupo.add(alfombra);
  const lf = new Lote(mats, 5);
  for (const sx of [-1, 1]) for (let i = 0; i < 44; i++) {
    const z = a.z - a.d / 2 + (i + 0.5) * a.d / 44;
    lf.mas(caja(0.07, 0.004, a.d / 44 * 0.55, 0.001), 'mate', i % 2 ? '#e9d9b4' : '#d9c79c', tr(pos(a.x + sx * (a.w / 2 + 0.034), 0.004, z), rot(0, (((i * 37) % 11) - 5) * 0.012, 0)));
  }
  const flecos = lf.armar({ sombra: false, nombre: 'flecos' });
  grupo.add(flecos);

  return { grupo, panos, zVidrio: zv, alfombra: { malla: alfombra, repintar(color) { matA.map.dispose(); matA.map = texturaAlfombra(color); matA.needsUpdate = true; } } };
}

// Vidrio esmerilado de la puerta, con el rótulo pintado.
function texturaVidrioPuerta(rotulo, fuente) {
  const [c, g] = lienzo(256, 320);
  g.fillStyle = '#d8d2bf'; g.fillRect(0, 0, 256, 320);
  let s = 5;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '120,110,90'},${r() * 0.1})`; g.fillRect(r() * 256, r() * 320, 2, 2); }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  // letras en arco, negras con filete dorado
  const txt = rotulo.toUpperCase(), radio = 250, cx = 128, cy = 150 + radio, paso = Math.min(0.105, 0.82 / txt.length);
  g.font = `800 ${Math.min(34, 300 / txt.length)}px ${fuente}`;
  [...txt].forEach((ch, i) => {
    const a = (i - (txt.length - 1) / 2) * paso;
    g.save(); g.translate(cx + Math.sin(a) * radio, cy - Math.cos(a) * radio); g.rotate(a);
    g.lineWidth = 5; g.strokeStyle = '#b08a3c'; g.strokeText(ch, 0, 0); g.fillStyle = '#1c1a17'; g.fillText(ch, 0, 0);
    g.restore();
  });
  g.strokeStyle = '#1c1a17'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(70, 196); g.lineTo(186, 196); g.stroke();
  g.fillStyle = '#b08a3c'; g.beginPath(); g.moveTo(128, 205); g.lineTo(136, 214); g.lineTo(128, 223); g.lineTo(120, 214); g.closePath(); g.fill();
  return textura(c, { repetir: false });
}

// El frente del cuarto visto desde el pasillo: pared, marco y la puerta que gira sobre sus bisagras.
export function crearFrente(mats, plan, rotulo, fuente) {
  const C = plan.colores, zF = plan.frente, W = Math.min(plan.ancho, 4.4), H = plan.alto, pw = 0.96, ph = 2.12, e = 0.16;
  const l = new Lote(mats, 211);
  const s = new THREE.Shape();
  s.moveTo(-W / 2, 0); s.lineTo(W / 2, 0); s.lineTo(W / 2, H); s.lineTo(-W / 2, H); s.closePath();
  const h = new THREE.Path();
  h.moveTo(-pw / 2, 0); h.lineTo(-pw / 2, ph); h.lineTo(pw / 2, ph); h.lineTo(pw / 2, 0); h.closePath();
  s.holes.push(h);
  l.mas(new THREE.ExtrudeGeometry(s, { depth: e, bevelEnabled: false }), 'yeso', '#6f8a80', pos(0, 0, zF));
  // boiserie del pasillo a los dos lados de la puerta
  const L = (W - pw) / 2 - 0.1;
  boiserie(l, L, plan.zocalo, pos(-W / 2, 0, zF + e), C);
  boiserie(l, L, plan.zocalo, pos(pw / 2 + 0.1, 0, zF + e), C);
  // marco
  for (const sx of [-1, 1]) l.mas(caja(0.1, ph + 0.05, e + 0.05, 0.012, 2), 'madera', C.nogal, pos(sx * (pw / 2 + 0.05), (ph + 0.05) / 2, zF + e / 2 + 0.012), { veta: 1 });
  l.mas(caja(pw + 0.26, 0.12, e + 0.06, 0.012, 2), 'madera', C.nogal, pos(0, ph + 0.06, zF + e / 2 + 0.014));
  l.mas(caja(pw + 0.34, 0.035, e + 0.09, 0.012, 2), 'madera', C.nogalClaro, pos(0, ph + 0.135, zF + e / 2 + 0.02));
  // piso del pasillo
  l.mas(new THREE.PlaneGeometry(W, 2.6).rotateX(-Math.PI / 2), 'piso', '#8a6242', pos(0, -0.001, zF + 1.3), { veta: 2 });
  const grupo = l.armar({ nombre: 'frente' });

  // hoja de la puerta: el eje está en la bisagra (x = −pw/2)
  const lp = new Lote(mats, 223), hw = pw - 0.02, hh = ph - 0.015, he = 0.044, cxh = hw / 2;
  // la hoja: tablero macizo abajo y, arriba, un bastidor alrededor del vidrio
  lp.mas(caja(hw, 1.1, he, 0.006), 'madera', C.nogalOscuro, pos(cxh, 0.55 + 0.008, 0), { veta: 1 });
  for (const x of [0.065, hw - 0.065]) lp.mas(caja(0.13, hh - 1.1, he, 0.004), 'madera', C.nogalOscuro, pos(x, 1.1 + (hh - 1.1) / 2 + 0.008, 0), { veta: 1 });
  lp.mas(caja(hw, 0.15, he, 0.004), 'madera', C.nogalOscuro, pos(cxh, hh - 0.067, 0));
  // bastidor en relieve y tableros de abajo
  for (const z of [-1, 1]) {
    const zz = z * (he / 2 + 0.004);
    for (const x of [0.065, hw - 0.065]) lp.mas(caja(0.13, hh - 0.01, 0.012, 0.004), 'madera', C.nogal, pos(x, hh / 2 + 0.008, zz), { veta: 1 });
    lp.mas(caja(hw - 0.26, 0.14, 0.012, 0.004), 'madera', C.nogal, pos(cxh, hh - 0.062, zz));
    lp.mas(caja(hw - 0.26, 0.2, 0.012, 0.004), 'madera', C.nogal, pos(cxh, 0.11, zz));
    lp.mas(caja(hw - 0.26, 0.13, 0.012, 0.004), 'madera', C.nogal, pos(cxh, 1.02, zz));
    lp.mas(caja(hw - 0.34, 0.66, 0.012, 0.012, 2), 'madera', C.nogalClaro, pos(cxh, 0.585, zz), { veta: 1 });
    // picaporte de bronce
    lp.mas(torno([[0.0, 0], [0.03, 0], [0.03, 0.006], [0.012, 0.012], [0.01, 0.04], [0.024, 0.05], [0.03, 0.064], [0.022, 0.078], [0, 0.082]], 16).rotateX(z * Math.PI / 2), 'metal', '#c9a04e', pos(hw - 0.07, 1.04, z * (he / 2 + 0.008)));
    lp.mas(placa(0.05, 0.2, 0.008, 0.004), 'metal', '#c9a04e', pos(hw - 0.07, 1.0, z * (he / 2 + 0.011)));
  }
  const hoja = lp.armar({ nombre: 'puerta' });
  // vidrio esmerilado: se enciende con la luz de adentro
  const tex = texturaVidrioPuerta(rotulo, fuente);
  const matV = material({ map: tex, emissiveMap: tex, emissive: new THREE.Color('#ffd9a0'), emissiveIntensity: 0.9, roughness: 0.5 });
  const vidrio = new THREE.Mesh(new THREE.BoxGeometry(hw - 0.24, hh - 1.1 - 0.13, he * 0.4), matV);
  vidrio.position.set(cxh, 1.1 + (hh - 1.1 - 0.13) / 2, 0); hoja.add(vidrio);
  const eje = new THREE.Group(); eje.position.set(-pw / 2 + 0.01, 0, zF + 0.03); eje.add(hoja);
  grupo.add(eje);
  return { grupo, eje, vidrio: matV, ancho: pw, alto: ph, z: zF };
}
