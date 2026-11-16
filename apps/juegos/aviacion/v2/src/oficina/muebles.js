// Los muebles y los objetos del despacho de 1929, modelados por código. Cada función devuelve un grupo con el origen en su
// apoyo (el piso, la tapa del escritorio o la pared) y, si tiene partes que se mueven o cambian, las devuelve aparte.
import * as THREE from 'three';
import { Lote, caja, placa, torno, cilindro, esfera, barra, cano, pos, rot, esc, tr, V, col, azar, lienzo, textura, TAU, material } from './kit.js';

const BRONCE = '#c9a04e', BRONCE_OSC = '#9a7a3a', TINTA = '#1d2a4a', PAPEL = '#efe6cf', NEGRO = '#1e1f24';

// ── escritorio (visto desde la puerta: el frente es un tablero con relieve) ──
export function crearEscritorio(mats, C, w, d, carpeta = { cx: -0.3, cz: 0.1 }) {
  const l = new Lote(mats, 301), h = 0.78, tapa = 0.045, cw = w * 0.29, ch = h - tapa - 0.03 - 0.07, fz = (d - 0.08) / 2;
  l.mas(caja(w + 0.07, tapa, d + 0.06, 0.016, 3), 'barniz', C.nogal, pos(0, h - tapa / 2, 0), { veta: 0 });
  l.mas(caja(w, 0.03, d - 0.02, 0.008), 'madera', C.nogalOscuro, pos(0, h - tapa - 0.015, 0), { veta: 0 });
  for (const s of [-1, 1]) {
    const x = s * (w / 2 - cw / 2 - 0.02);
    l.mas(caja(cw, ch, d - 0.08, 0.008), 'madera', C.nogal, pos(x, 0.07 + ch / 2, 0), { veta: 1 });
    l.mas(caja(cw + 0.024, 0.07, d - 0.056, 0.01), 'madera', C.nogalOscuro, pos(x, 0.035, 0), { veta: 0 });
    l.mas(caja(cw - 0.1, ch - 0.12, 0.016, 0.012, 2), 'madera', C.nogalClaro, pos(x, 0.07 + ch / 2, fz + 0.004), { veta: 1 });
    l.mas(caja(0.016, ch - 0.12, d - 0.22, 0.012, 2), 'madera', C.nogalClaro, pos(x + s * (cw / 2 + 0.004), 0.07 + ch / 2, 0), { veta: 1 });
  }
  const pw = w - 2 * cw - 0.04, ph = ch * 0.7;
  l.mas(caja(pw + 0.02, ph, 0.022, 0.006), 'madera', C.nogal, pos(0, 0.07 + ch - ph / 2, fz - 0.18), { veta: 0 });
  l.mas(caja(pw - 0.14, ph - 0.14, 0.014, 0.012, 2), 'madera', C.nogalClaro, pos(0, 0.07 + ch - ph / 2, fz - 0.168), { veta: 0 });
  // carpeta de cuero con esquineras de bronce
  const { cx, cz } = carpeta, kw = 0.66, kd = 0.46;
  l.mas(placa(kw, kd, 0.016, 0.005).rotateX(-Math.PI / 2), 'cuero', '#27463a', pos(cx, h + 0.0025, cz));
  l.mas(placa(kw - 0.07, kd - 0.07, 0.008, 0.002).rotateX(-Math.PI / 2), 'cuero', '#2f5445', pos(cx, h + 0.0056, cz));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const e = new THREE.Shape(); e.moveTo(0, 0); e.lineTo(0.05, 0); e.lineTo(0, 0.05); e.closePath();
    const g = new THREE.ExtrudeGeometry(e, { depth: 0.003, bevelEnabled: false }).rotateX(-Math.PI / 2);
    l.mas(g, 'metal', BRONCE, tr(pos(cx + sx * kw / 2, h + 0.0048, cz + sz * kd / 2), rot(0, sx > 0 ? (sz > 0 ? Math.PI : Math.PI / 2) : (sz > 0 ? -Math.PI / 2 : 0), 0)));
  }
  return { grupo: l.armar({ nombre: 'escritorio' }), alto: h };
}

// ── sillón del dueño, detrás del escritorio ──
export function crearSillon(mats, C) {
  const l = new Lote(mats, 311), cuero = '#5a2723';
  l.mas(caja(0.54, 0.09, 0.5, 0.035, 3), 'cuero', cuero, pos(0, 0.5, 0));
  const mr = tr(pos(0, 0.56, -0.23), rot(-0.13, 0, 0));
  l.mas(caja(0.5, 0.6, 0.085, 0.04, 3), 'cuero', cuero, tr(mr.clone(), pos(0, 0.33, 0.006)));
  // marco de madera: travesaño de arriba con copete y parantes
  l.mas(caja(0.64, 0.085, 0.1, 0.03, 3), 'barniz', C.nogalOscuro, tr(mr.clone(), pos(0, 0.675, -0.006)), { veta: 0 });
  l.mas(caja(0.3, 0.05, 0.09, 0.022, 3), 'barniz', C.nogal, tr(mr.clone(), pos(0, 0.735, -0.008)), { veta: 0 });
  for (const sx of [-1, 1]) { l.mas(caja(0.06, 0.7, 0.095, 0.022, 2), 'barniz', C.nogalOscuro, tr(mr.clone(), pos(sx * 0.29, 0.34, -0.006)), { veta: 1 }); l.mas(esfera(0.034, 10, 8), 'barniz', C.nogal, tr(mr.clone(), pos(sx * 0.29, 0.725, -0.006))); }
  // capitoné y tachas
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) l.mas(esfera(0.012, 8, 6), 'cuero', '#451c19', tr(mr.clone(), pos(-0.14 + i * 0.14, 0.17 + j * 0.16, 0.046)));
  for (let i = 0; i < 11; i++) for (const sx of [-1, 1]) l.mas(esfera(0.0065, 6, 5), 'metal', BRONCE, tr(mr.clone(), pos(sx * 0.238, 0.07 + i * 0.052, 0.046)));
  for (let i = 0; i < 9; i++) l.mas(esfera(0.0065, 6, 5), 'metal', BRONCE, tr(mr.clone(), pos(-0.2 + i * 0.05, 0.615, 0.046)));
  for (const sx of [-1, 1]) {
    l.mas(caja(0.065, 0.045, 0.44, 0.02, 2), 'madera', C.nogalOscuro, pos(sx * 0.3, 0.72, 0.0), { veta: 2 });
    l.mas(caja(0.045, 0.2, 0.05, 0.015, 2), 'madera', C.nogalOscuro, pos(sx * 0.3, 0.61, 0.17), { veta: 1 });
  }
  l.mas(torno([[0, 0], [0.05, 0], [0.045, 0.03], [0.03, 0.06], [0.03, 0.4], [0.06, 0.45], [0, 0.45]], 12), 'hierro', '#2a2a2e', pos(0, 0.02, 0));
  for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + 0.6; l.mas(caja(0.3, 0.035, 0.05, 0.012), 'madera', C.nogalOscuro, tr(rot(0, a, 0), pos(0.16, 0.06, 0)), { veta: 0 }); l.mas(esfera(0.028, 8, 6), 'hierro', '#2a2a2e', pos(Math.cos(a) * 0.3, 0.028, -Math.sin(a) * 0.3)); }
  return { grupo: l.armar({ nombre: 'sillon' }) };
}

// ── lámpara de escritorio: pie de bronce, cuello de cisne y pantalla de esmalte verde ──
export function crearLampara(mats) {
  const l = new Lote(mats, 321);
  l.mas(torno([[0, 0], [0.088, 0], [0.092, 0.008], [0.088, 0.016], [0.055, 0.027], [0.024, 0.04], [0.017, 0.062], [0.012, 0.07], [0, 0.07]], 28), 'metal', BRONCE);
  l.mas(cano([V(0, 0.06, 0), V(0, 0.2, 0), V(0, 0.33, 0), V(0.018, 0.4, 0), V(0.07, 0.445, 0), V(0.135, 0.455, 0), V(0.18, 0.43, 0)], 0.0085, 36, 8), 'metal', BRONCE);
  l.mas(torno([[0.013, 0], [0.016, 0.008], [0.013, 0.016]], 12), 'metal', BRONCE_OSC, pos(0, 0.2, 0));
  l.mas(esfera(0.015, 10, 8), 'metal', BRONCE_OSC, pos(0.18, 0.43, 0));
  // llave de la luz
  l.mas(cilindro(0.006, 0.03, 8).rotateX(Math.PI / 2), 'satin', NEGRO, pos(0, 0.1, 0.02));
  const grupo = l.armar({ nombre: 'lampara' });
  // pantalla: afuera esmalte verde, adentro blanco que se enciende
  const inc = tr(pos(0.18, 0.43, 0), rot(0, 0, -0.5));
  const perfilAf = [[0.014, 0.0], [0.03, -0.01], [0.062, -0.036], [0.095, -0.078], [0.112, -0.118], [0.116, -0.128]];
  const perfilAd = [[0.112, -0.127], [0.106, -0.116], [0.09, -0.078], [0.058, -0.038], [0.026, -0.014], [0.008, -0.008]];
  const matAf = material({ color: col('#1c6a4c'), roughness: 0.2, metalness: 0, side: THREE.DoubleSide, emissive: col('#39c083'), emissiveIntensity: 0 });
  const matAd = material({ color: col('#f4efe2'), roughness: 0.5, side: THREE.DoubleSide, emissive: col('#ffcf8a'), emissiveIntensity: 0 });
  const af = new THREE.Mesh(torno(perfilAf, 32), matAf), ad = new THREE.Mesh(torno(perfilAd, 32), matAd);
  for (const m of [af, ad]) { m.applyMatrix4(inc); m.castShadow = false; grupo.add(m); }
  af.castShadow = true;
  const matFoco = new THREE.MeshBasicMaterial({ color: col('#ffe2b0') });
  const foco = new THREE.Mesh(esfera(0.024, 12, 10), matFoco); foco.applyMatrix4(tr(inc.clone(), pos(0, -0.06, 0))); grupo.add(foco);
  // cadenita con su perilla: se hamaca apenas
  const lc = new Lote(mats, 323);
  for (let i = 0; i < 9; i++) lc.mas(esfera(0.0032, 6, 5), 'metal', BRONCE, pos(0, -0.008 - i * 0.0085, 0));
  lc.mas(torno([[0, 0], [0.006, 0.004], [0.007, 0.014], [0.003, 0.02], [0, 0.02]], 8), 'metal', BRONCE, pos(0, -0.105, 0));
  const cadena = lc.armar({ nombre: 'cadena', sombra: false });
  cadena.position.copy(V(-0.07, -0.115, 0.05).applyMatrix4(inc));
  grupo.add(cadena);
  const boca = V(0, -0.075, 0).applyMatrix4(inc), abajo = V(0, -1, 0).applyMatrix4(inc.clone().setPosition(0, 0, 0)).normalize();
  return { grupo, matAf, matAd, matFoco, cadena, boca, abajo };
}

// ── telégrafo: manipulador, sonador y la cinta de papel que va saliendo ──
function texturaCinta() {
  const [c, g] = lienzo(512, 16), r = azar(71);
  g.fillStyle = '#f1e8d0'; g.fillRect(0, 0, 512, 16);
  g.fillStyle = '#26324f';
  let x = 6;
  while (x < 500) { const raya = r() < 0.45, w = raya ? 14 : 4; if (x + w > 506) break; g.fillRect(x, 6, w, 4); x += w + (r() < 0.22 ? 16 : 5); }
  const t = textura(c, { aniso: 4 }); t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}
export function crearTelegrafo(mats, C) {
  const l = new Lote(mats, 331), caoba = '#8a4f33';
  l.mas(caja(0.34, 0.022, 0.19, 0.008, 2), 'barniz', caoba, pos(0, 0.011, 0), { veta: 0 });
  // manipulador (a la izquierda): puente, bornes y base del eje
  for (const sz of [-1, 1]) l.mas(caja(0.012, 0.04, 0.012, 0.003), 'metal', BRONCE, pos(-0.085, 0.042, sz * 0.024));
  for (const [x, z] of [[-0.15, 0.06], [-0.15, -0.06]]) { l.mas(cilindro(0.009, 0.022, 10), 'metal', BRONCE, pos(x, 0.033, z)); l.mas(cilindro(0.012, 0.008, 10), 'satin', NEGRO, pos(x, 0.048, z)); }
  l.mas(cilindro(0.006, 0.014, 8), 'metal', BRONCE, pos(-0.022, 0.029, 0));
  // sonador (a la derecha): dos bobinas y su puente
  for (const sz of [-1, 1]) { l.mas(cilindro(0.021, 0.05, 14), 'satin', '#2a2422', pos(0.085, 0.047, sz * 0.026)); l.mas(cilindro(0.023, 0.005, 14), 'metal', BRONCE, pos(0.085, 0.0745, sz * 0.026)); l.mas(cilindro(0.023, 0.005, 14), 'metal', BRONCE, pos(0.085, 0.0245, sz * 0.026)); }
  l.mas(caja(0.014, 0.085, 0.014, 0.003), 'metal', BRONCE, pos(0.142, 0.064, 0));
  l.mas(cilindro(0.004, 0.03, 8), 'metal', BRONCE, pos(0.142, 0.115, 0));
  // carrete de cinta, atrás, sobre su soporte
  for (const sz of [-1, 1]) l.mas(caja(0.012, 0.13, 0.006, 0.002), 'metal', BRONCE, pos(0.0, 0.085, -0.07 + sz * 0.016));
  const grupo = l.armar({ nombre: 'telegrafo' });

  const lp = new Lote(mats, 333);  // palanca del manipulador: gira en su eje
  lp.mas(caja(0.15, 0.007, 0.014, 0.003), 'metal', BRONCE, pos(0.012, 0, 0));
  lp.mas(cilindro(0.0045, 0.062, 8).rotateX(Math.PI / 2), 'metal', BRONCE_OSC);
  lp.mas(torno([[0, 0], [0.019, 0], [0.021, 0.004], [0.014, 0.009], [0.006, 0.012], [0.006, 0.02], [0, 0.02]], 14).rotateX(Math.PI), 'satin', NEGRO, pos(0.08, 0.024, 0));
  lp.mas(cilindro(0.003, 0.02, 6), 'metal', BRONCE, pos(0.08, 0.008, 0));
  const palanca = lp.armar({ nombre: 'palanca' }); palanca.position.set(-0.085, 0.062, 0); grupo.add(palanca);

  const ls = new Lote(mats, 335);  // brazo del sonador
  ls.mas(caja(0.11, 0.007, 0.016, 0.003), 'metal', BRONCE, pos(-0.05, 0, 0));
  ls.mas(caja(0.02, 0.008, 0.06, 0.003), 'hierro', '#3a3a40', pos(-0.058, -0.008, 0));
  const brazo = ls.armar({ nombre: 'brazo' }); brazo.position.set(0.142, 0.094, 0); grupo.add(brazo);

  const lr = new Lote(mats, 337);  // carrete
  // rollo de papel entre dos aros de bronce con rayos
  lr.mas(cilindro(0.05, 0.014, 24).rotateX(Math.PI / 2), 'mate', '#efe6cf');
  for (const sz of [-1, 1]) {
    lr.mas(new THREE.TorusGeometry(0.056, 0.0035, 6, 28), 'metal', BRONCE, pos(0, 0, sz * 0.0095));
    for (let k = 0; k < 4; k++) lr.mas(caja(0.11, 0.006, 0.0025, 0.001), 'metal', BRONCE, tr(pos(0, 0, sz * 0.0095), rot(0, 0, k / 4 * Math.PI)));
    lr.mas(cilindro(0.012, 0.004, 12).rotateX(Math.PI / 2), 'metal', BRONCE_OSC, pos(0, 0, sz * 0.011));
  }
  lr.mas(cilindro(0.005, 0.05, 8).rotateX(Math.PI / 2), 'metal', BRONCE_OSC);
  const carrete = lr.armar({ nombre: 'carrete' }); carrete.position.set(0, 0.15, -0.07); grupo.add(carrete);

  // la cinta: sale del carrete, pasa por el sonador y cae en rulo sobre el escritorio
  const camino = new THREE.CatmullRomCurve3([V(0.04, 0.19, -0.07), V(0.075, 0.13, -0.045), V(0.1, 0.092, -0.01), V(0.16, 0.06, 0.02), V(0.2, 0.01, 0.05), V(0.25, -0.02, 0.09), V(0.31, -0.02, 0.1), V(0.35, -0.012, 0.07), V(0.36, -0.021, 0.02), V(0.33, -0.02, -0.02), V(0.3, -0.012, 0.0)], false, 'catmullrom', 0.5);
  const N = 70, ancho = 0.013, p = new Float32Array((N + 1) * 6), uv = new Float32Array((N + 1) * 4), idx = [];
  const lado = new THREE.Vector3(), tg = new THREE.Vector3(), pt = new THREE.Vector3(), arriba = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= N; i++) {
    camino.getPoint(i / N, pt); camino.getTangent(i / N, tg);
    lado.crossVectors(tg, arriba).normalize().multiplyScalar(ancho / 2);
    const tw = Math.sin(i / N * 5) * 0.25; lado.applyAxisAngle(tg, tw);
    p.set([pt.x - lado.x, Math.max(pt.y - lado.y, -0.0205), pt.z - lado.z, pt.x + lado.x, Math.max(pt.y + lado.y, -0.0205), pt.z + lado.z], i * 6);
    uv.set([i / N * 2.2, 0, i / N * 2.2, 1], i * 4);
    if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const gc = new THREE.BufferGeometry();
  gc.setAttribute('position', new THREE.BufferAttribute(p, 3)); gc.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); gc.setIndex(idx); gc.computeVertexNormals();
  const matCinta = material({ map: texturaCinta(), roughness: 0.9, side: THREE.DoubleSide });
  const cinta = new THREE.Mesh(gc, matCinta); cinta.castShadow = true; cinta.receiveShadow = true; grupo.add(cinta);
  return { grupo, palanca, brazo, carrete, matCinta };
}

// ── libro de cuentas, abierto ──
// Dibuja las dos páginas con los números de verdad de los últimos días.
export function dibujarLibro(g, w, h, datos, t, fuente) {
  g.fillStyle = '#f1e8d2'; g.fillRect(0, 0, w, h);
  const r = azar(41);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(120,96,60,${r() * 0.05})`; g.fillRect(r() * w, r() * h, 2, 2); }
  const medio = w / 2;
  // sombra del lomo
  const gr = g.createLinearGradient(medio - 46, 0, medio + 46, 0);
  gr.addColorStop(0, 'rgba(70,50,30,0)'); gr.addColorStop(0.5, 'rgba(70,50,30,.42)'); gr.addColorStop(1, 'rgba(70,50,30,0)');
  g.fillStyle = gr; g.fillRect(medio - 46, 0, 92, h);
  const dias = (datos?.dias ?? []).slice(-9), fila = 37, y0 = 96;
  const pagina = (x0, ancho, titulo, cols, celdas) => {
    g.fillStyle = TINTA; g.textBaseline = 'alphabetic';
    g.font = `700 25px ${fuente}`; g.textAlign = 'left'; g.fillText(titulo, x0 + 14, 42);
    g.strokeStyle = 'rgba(176,58,46,.75)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 8, 54); g.lineTo(x0 + ancho - 8, 54); g.stroke();
    g.beginPath(); g.moveTo(x0 + 8, 58); g.lineTo(x0 + ancho - 8, 58); g.stroke();
    // renglones azules y columnas rojas
    g.strokeStyle = 'rgba(70,110,160,.34)'; g.lineWidth = 1;
    for (let y = y0 + 8; y < h - 14; y += fila) { g.beginPath(); g.moveTo(x0 + 8, y); g.lineTo(x0 + ancho - 8, y); g.stroke(); }
    const xs = cols.map((_, i) => x0 + 84 + (ancho - 98) * (i + 1) / cols.length);
    g.strokeStyle = 'rgba(176,58,46,.5)';
    for (const x of [x0 + 80, ...xs.slice(0, -1)]) { g.beginPath(); g.moveTo(x, 60); g.lineTo(x, h - 12); g.stroke(); }
    g.font = `600 15px ${fuente}`; g.textAlign = 'right'; g.fillStyle = 'rgba(29,42,74,.78)';
    cols.forEach((c, i) => g.fillText(c, xs[i] - 8, 80));
    dias.forEach((d, k) => {
      const y = y0 + k * fila;
      g.font = `500 17px ${fuente}`; g.textAlign = 'left'; g.fillStyle = 'rgba(29,42,74,.82)'; g.fillText(`${t('diaCorto')} ${d.n}`, x0 + 14, y);
      const hueco = (ancho - 98) / cols.length - 14;
      celdas(d).forEach(([txt, color], i) => { let tam = 19; do { g.font = `600 ${tam}px ${fuente}`; tam -= 1; } while (g.measureText(txt).width > hueco && tam > 10); g.textAlign = 'right'; g.fillStyle = color ?? TINTA; g.fillText(txt, xs[i] - 8, y); });
    });
  };
  const n = (v) => Math.round(v).toLocaleString('es-AR');
  pagina(6, medio - 52, t('libroPagina1'), [t('entro'), t('salio'), t('quedo')], (d) => [[n(d.entro)], [n(d.salio)], [(d.entro - d.salio >= 0 ? '+' : '−') + n(Math.abs(d.entro - d.salio)), d.entro - d.salio >= 0 ? '#1f5a3c' : '#a8392c']]);
  pagina(medio + 46, medio - 52, t('libroPagina2'), [t('cartas'), t('aTiempoCorto'), t('tardeCorto')], (d) => [[n(d.cartas)], [n(d.aTiempo)], [n(d.tarde), d.tarde > 0 ? '#a8392c' : TINTA]]);
}
export function crearLibro(mats, colorEmpresa) {
  const l = new Lote(mats, 341), w = 0.58, d = 0.39;
  l.mas(caja(w, 0.012, d, 0.005), 'cuero', '#5a2a26', pos(0, 0.006, 0));
  for (const sx of [-1, 1]) { const hh = sx < 0 ? 0.02 : 0.03; l.mas(caja(w / 2 - 0.022, hh, d - 0.03, 0.002), 'mate', '#e6dcc2', pos(sx * (w / 4 - 0.006), 0.012 + hh / 2, 0)); }
  // lapicera
  const ml = tr(pos(0.19, 0.056, 0.05), rot(0, 0.5, 0), rot(0, 0, Math.PI / 2));
  l.mas(torno([[0, 0], [0.0052, 0.004], [0.0062, 0.03], [0.0062, 0.085], [0.0048, 0.09], [0.0048, 0.125], [0.0025, 0.14], [0.0006, 0.152]], 10), 'esmalte', '#16233f', ml);
  l.mas(cilindro(0.0066, 0.006, 10), 'metal', BRONCE, tr(ml.clone(), pos(0, 0.088, 0)));
  l.mas(cilindro(0.0066, 0.004, 10), 'metal', BRONCE, tr(ml.clone(), pos(0, 0.03, 0)));
  const grupo = l.armar({ nombre: 'libro' });
  // las páginas: dos hojas con comba hacia el lomo
  const [lz, ctx] = lienzo(1024, 512);
  const tex = textura(lz, { repetir: false, aniso: 8 });
  const matPag = material({ map: tex, roughness: 0.94 });
  const gp = new THREE.PlaneGeometry(w - 0.044, d - 0.03, 28, 1).rotateX(-Math.PI / 2);
  const P = gp.attributes.position;
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), u = Math.abs(x) / (w / 2 - 0.022), base = x < 0 ? 0.032 : 0.042;
    P.setY(i, base + 0.012 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (1 - 0.35 * u) - 0.016 * Math.exp(-u * 14));
  }
  gp.computeVertexNormals();
  const paginas = new THREE.Mesh(gp, matPag); paginas.receiveShadow = true; paginas.castShadow = true; grupo.add(paginas);
  // señalador de cinta, del color de la empresa
  const matCinta = material({ color: col(colorEmpresa), roughness: 0.7, side: THREE.DoubleSide });
  const cinta = new THREE.Mesh(new THREE.PlaneGeometry(0.014, d * 0.5 + 0.1, 1, 8).rotateX(-Math.PI / 2), matCinta);
  const Pc = cinta.geometry.attributes.position;
  for (let i = 0; i < Pc.count; i++) { const z = Pc.getZ(i) + d * 0.25 + 0.05; Pc.setZ(i, z); Pc.setY(i, z > d / 2 - 0.012 ? Math.max(0.002, 0.03 - (z - d / 2 + 0.012) * 0.9) : 0.03); }
  cinta.geometry.computeVertexNormals(); cinta.position.set(0.012, 0, 0); cinta.castShadow = true; grupo.add(cinta);
  return { grupo, lienzo: lz, ctx, tex, matCinta };
}

// ── bandeja de alambre con los papeles sin leer ──
function texturaHoja() {
  const [c, g] = lienzo(256, 192), r = azar(23);
  g.fillStyle = '#f4eedd'; g.fillRect(0, 0, 256, 192);
  g.fillStyle = 'rgba(40,48,72,.6)'; g.fillRect(24, 22, 92, 5);
  g.fillStyle = 'rgba(40,48,72,.5)';
  for (let y = 44; y < 160; y += 12) { let x = 24; while (x < 224) { const w = 8 + r() * 30; if (x + w > 232) break; g.fillRect(x, y, w, 3); x += w + 6; } if (r() < 0.2) y += 8; }
  g.strokeStyle = 'rgba(176,58,46,.75)'; g.lineWidth = 3; g.beginPath(); g.arc(204, 150, 17, 0, TAU); g.stroke(); g.beginPath(); g.arc(204, 150, 11, 0, TAU); g.stroke();
  return textura(c, { repetir: false });
}
export function crearBandeja(mats) {
  const l = new Lote(mats, 351), w = 0.36, d = 0.27, h = 0.07, r = 0.03, alambre = '#b89a5a';
  const aro = (y, rad, k = 1) => {
    const pts = [], a = w / 2 * k, b = d / 2 * k;
    for (const [cx, cz, a0] of [[a - r, b - r, 0], [-a + r, b - r, 0.25], [-a + r, -b + r, 0.5], [a - r, -b + r, 0.75]]) for (let i = 0; i <= 4; i++) { const an = (a0 + i / 16) * TAU; pts.push(V(cx + Math.cos(an) * r, y, cz + Math.sin(an) * r)); }
    return cano(pts, rad, 48, 6, true);
  };
  l.mas(aro(h, 0.004), 'metal', alambre); l.mas(aro(0.005, 0.0035, 0.95), 'metal', alambre);
  for (let i = 0; i <= 8; i++) { const x = -w / 2 + r + (w - 2 * r) * i / 8; for (const sz of [-1, 1]) l.mas(barra(V(x * 0.95, 0.005, sz * d / 2 * 0.95), V(x, h, sz * d / 2), 0.0022, 5), 'metal', alambre); }
  for (let i = 0; i <= 5; i++) { const z = -d / 2 + r + (d - 2 * r) * i / 5; for (const sx of [-1, 1]) l.mas(barra(V(sx * w / 2 * 0.95, 0.005, z * 0.95), V(sx * w / 2, h, z), 0.0022, 5), 'metal', alambre); }
  for (let i = 1; i < 8; i++) { const x = (-w / 2 + w * i / 8) * 0.95; l.mas(barra(V(x, 0.005, -d / 2 * 0.95), V(x, 0.005, d / 2 * 0.95), 0.002, 5), 'metal', alambre); }
  for (let i = 1; i < 4; i++) { const z = (-d / 2 + d * i / 4) * 0.95; l.mas(barra(V(-w / 2 * 0.95, 0.005, z), V(w / 2 * 0.95, 0.005, z), 0.002, 5), 'metal', alambre); }
  const grupo = l.armar({ nombre: 'bandeja' });
  const papeles = new THREE.Group(); grupo.add(papeles);
  const matHoja = material({ map: texturaHoja(), roughness: 0.95 });
  const matCanto = material({ color: col('#e9e0c8'), roughness: 0.95 });
  const geoHoja = new THREE.BoxGeometry(0.3, 0.0024, 0.215);
  const rz = azar(77);
  // Pone «n» hojas (hasta 14 a la vista); devuelve cuántas quedaron.
  function poner(n) {
    const quiero = Math.min(14, Math.max(0, n));
    while (papeles.children.length > quiero) papeles.remove(papeles.children[papeles.children.length - 1]);
    while (papeles.children.length < quiero) {
      const i = papeles.children.length;
      const m = new THREE.Mesh(geoHoja, [matCanto, matCanto, matHoja, matCanto, matCanto, matCanto]);
      m.position.set((rz() - 0.5) * 0.02, 0.0085 + i * 0.0027, (rz() - 0.5) * 0.016); m.rotation.y = (rz() - 0.5) * 0.16;
      m.castShadow = true; m.receiveShadow = true;
      papeles.add(m);
    }
    return quiero;
  }
  return { grupo, papeles, poner, cima: () => 0.0085 + papeles.children.length * 0.0027 };
}

// ── placa de bronce con el nombre de la empresa ──
export function dibujarPlaca(g, w, h, nombre, pie, fuente) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#f1d489'); gr.addColorStop(0.5, '#d9b25c'); gr.addColorStop(1, '#b98f3e');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const r = azar(19);
  for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${r() < 0.5 ? '255,244,205' : '110,80,30'},${0.04 + r() * 0.08})`; g.lineWidth = 1; const y = r() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (r() - 0.5) * 3); g.stroke(); }
  g.strokeStyle = 'rgba(70,48,14,.8)'; g.lineWidth = 3; g.strokeRect(10, 10, w - 20, h - 20);
  g.lineWidth = 1.2; g.strokeRect(16, 16, w - 32, h - 32);
  const txt = (nombre || '').toUpperCase();
  let tam = 60; g.textAlign = 'center'; g.textBaseline = 'middle';
  const espaciar = (s) => [...s].join(' ');
  do { g.font = `800 ${tam}px ${fuente}`; tam -= 2; } while (g.measureText(espaciar(txt)).width > w - 76 && tam > 16);
  const y = pie ? h * 0.43 : h * 0.5;
  g.fillStyle = 'rgba(255,246,214,.75)'; g.fillText(espaciar(txt), w / 2 + 1.2, y + 1.6);   // filo de luz del grabado
  g.fillStyle = '#3a2708'; g.fillText(espaciar(txt), w / 2, y);
  if (pie) { g.font = `700 19px ${fuente}`; g.fillStyle = 'rgba(58,39,8,.85)'; g.fillText(espaciar(pie.toUpperCase()), w / 2, h * 0.78); }
}
export function crearPlaca(mats, C, colorEmpresa) {
  const l = new Lote(mats, 361), largo = 0.5;
  const s = new THREE.Shape(); s.moveTo(0.05, 0); s.lineTo(0.012, 0.104); s.quadraticCurveTo(0.008, 0.112, -0.004, 0.112); s.lineTo(-0.014, 0.112); s.quadraticCurveTo(-0.032, 0.11, -0.036, 0.08); s.lineTo(-0.044, 0); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: largo, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 6 });
  g.translate(0, 0, -largo / 2); g.rotateY(-Math.PI / 2);     // el perfil queda en el plano ZY y el largo por X; la cara inclinada mira a +Z
  l.mas(g, 'barniz', C.nogalOscuro, null, { veta: 0 });
  const grupo = l.armar({ nombre: 'placa' });
  const [lz, ctx] = lienzo(768, 144);
  const tex = textura(lz, { repetir: false, aniso: 8 });
  const inc = Math.atan2(0.05 - 0.012, 0.104);
  const matChapa = material({ map: tex, roughness: 0.4, metalness: 0.55, emissive: col('#ffffff'), emissiveMap: tex, emissiveIntensity: 0.06 });
  const gch = placa(largo - 0.04, 0.086, 0.005, 0.0024, 0.0008), uvc = gch.attributes.uv, pc = gch.attributes.position;
  for (let i = 0; i < uvc.count; i++) uvc.setXY(i, pc.getX(i) / (largo - 0.04) + 0.5, pc.getY(i) / 0.086 + 0.5);   // la chapa entera muestra el dibujo
  const chapa = new THREE.Mesh(gch, matChapa);
  chapa.position.set(0, 0.054, 0.0325); chapa.rotation.x = -inc; chapa.castShadow = true; grupo.add(chapa);
  // filete de esmalte con el color de la empresa
  const matEsmalte = material({ color: col(colorEmpresa), roughness: 0.25 });
  const filete = new THREE.Mesh(caja(largo + 0.012, 0.008, 0.104, 0.002), matEsmalte); filete.position.set(0, 0.004, 0.003); grupo.add(filete);
  return { grupo, lienzo: lz, ctx, tex, matEsmalte, chapa, matChapa };
}

// ── cuaderno de apuntes, con su lápiz ──
export function crearCuaderno(mats, marcas = 0) {
  const l = new Lote(mats, 371);
  l.mas(caja(0.165, 0.004, 0.225, 0.002), 'cuero', '#22252e', pos(0, 0.002, 0));
  l.mas(caja(0.155, 0.016, 0.217, 0.002), 'mate', '#e9e0c9', pos(0.003, 0.012, 0));
  l.mas(caja(0.165, 0.004, 0.225, 0.002), 'cuero', '#22252e', pos(0, 0.022, 0));
  l.mas(caja(0.03, 0.0245, 0.226, 0.006, 2), 'cuero', '#7a2f2a', pos(-0.07, 0.012, 0));
  l.mas(placa(0.08, 0.045, 0.004, 0.001).rotateX(-Math.PI / 2), 'mate', '#efe6cf', pos(0.018, 0.0246, -0.03));
  for (let i = 0; i < Math.min(5, marcas); i++) l.mas(caja(0.012, 0.0012, 0.03, 0.0004), 'mate', ['#cf3f2c', '#d9a13b', '#3f7a6a', '#4f79b8', '#8a4f7d'][i], pos(-0.03 + i * 0.026, 0.0125, -0.118));
  // lápiz
  const ml = tr(pos(0.03, 0.0305, 0.03), rot(0, -0.7, 0), rot(0, 0, Math.PI / 2));
  l.mas(cilindro(0.0042, 0.13, 6), 'satin', '#d9a13b', ml);
  l.mas(cilindro(0.0044, 0.012, 8), 'metal', '#b9b9b0', tr(ml.clone(), pos(0, -0.07, 0)));
  l.mas(cilindro(0.0042, 0.012, 8), 'mate', '#c9705e', tr(ml.clone(), pos(0, -0.082, 0)));
  l.mas(cilindro(0.0042, 0.016, 6, 0.0008), 'mate', '#e2c79a', tr(ml.clone(), pos(0, 0.073, 0)));
  l.mas(cilindro(0.0012, 0.005, 6, 0.0002), 'satin', '#2a2a2e', tr(ml.clone(), pos(0, 0.0835, 0)));
  return { grupo: l.armar({ nombre: 'cuaderno' }) };
}

// ── mate y tintero: dos detalles de la mesa ──
export function crearMate(mats) {
  const l = new Lote(mats, 381);
  l.mas(torno([[0, 0], [0.022, 0], [0.038, 0.016], [0.044, 0.04], [0.04, 0.066], [0.033, 0.08], [0.034, 0.088]], 18), 'satin', '#5a3a24');
  l.mas(torno([[0.034, 0.084], [0.037, 0.088], [0.037, 0.094], [0.033, 0.096], [0.031, 0.09]], 18), 'metal', '#c8c2b4');
  l.mas(cilindro(0.031, 0.004, 14), 'mate', '#5d7a3a', pos(0, 0.088, 0));
  l.mas(barra(V(0.006, 0.07, 0), V(0.05, 0.165, 0.012), 0.0028, 6), 'metal', '#c8c2b4');
  l.mas(esfera(0.0045, 6, 5), 'metal', '#c8c2b4', tr(pos(0.05, 0.165, 0.012), esc(1.5, 0.6, 1)));
  return { grupo: l.armar({ nombre: 'mate' }) };
}
export function crearTintero(mats) {
  const l = new Lote(mats, 383);
  l.mas(caja(0.11, 0.012, 0.07, 0.004), 'barniz', '#6e452a', pos(0, 0.006, 0));
  l.mas(torno([[0, 0], [0.024, 0], [0.026, 0.004], [0.026, 0.028], [0.016, 0.036], [0.013, 0.04]], 14), 'esmalte', '#16233f', pos(-0.022, 0.012, 0));
  l.mas(torno([[0.0, 0.0], [0.015, 0], [0.016, 0.006], [0.008, 0.012], [0, 0.013]], 12), 'metal', BRONCE, pos(-0.022, 0.052, 0));
  l.mas(caja(0.035, 0.006, 0.05, 0.002), 'metal', BRONCE, pos(0.03, 0.015, 0));
  return { grupo: l.armar({ nombre: 'tintero' }) };
}

// ── reloj de pared con péndulo ──
function texturaEsfera(fuente) {
  const [c, g] = lienzo(256, 256);
  g.fillStyle = '#f3ecd8'; g.beginPath(); g.arc(128, 128, 128, 0, TAU); g.fill();
  g.strokeStyle = '#1c2238'; g.lineWidth = 2.5; g.beginPath(); g.arc(128, 128, 112, 0, TAU); g.stroke();
  g.lineWidth = 1.5; g.beginPath(); g.arc(128, 128, 76, 0, TAU); g.stroke();
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; g.lineWidth = i % 5 ? 1.5 : 4; g.beginPath(); g.moveTo(128 + Math.sin(a) * 112, 128 - Math.cos(a) * 112); g.lineTo(128 + Math.sin(a) * (i % 5 ? 105 : 100), 128 - Math.cos(a) * (i % 5 ? 105 : 100)); g.stroke(); }
  g.fillStyle = '#1c2238'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 22px ${fuente}`;
  ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].forEach((n, i) => { const a = i / 12 * TAU; g.save(); g.translate(128 + Math.sin(a) * 88, 128 - Math.cos(a) * 88); g.rotate(a); g.fillText(n, 0, 0); g.restore(); });
  return textura(c, { repetir: false });
}
export function crearReloj(mats, C, fuente) {
  const l = new Lote(mats, 391), prof = 0.11;
  // cabeza redonda y cuerpo con la ventana del péndulo (mira a +Z; el origen está en el centro de la esfera)
  l.mas(cilindro(0.165, prof, 32).rotateX(Math.PI / 2), 'madera', C.nogalOscuro, pos(0, 0, prof / 2));
  l.mas(new THREE.TorusGeometry(0.128, 0.012, 8, 36), 'metal', BRONCE, pos(0, 0, prof + 0.002));
  l.mas(new THREE.TorusGeometry(0.158, 0.009, 8, 36), 'madera', C.nogalClaro, pos(0, 0, prof));
  const cw = 0.2, chh = 0.46, cy = -0.15 - chh / 2;
  l.mas(caja(cw, chh, 0.012, 0.003), 'madera', '#2c1c12', pos(0, cy, 0.006));
  for (const sx of [-1, 1]) l.mas(caja(0.028, chh, prof * 0.8, 0.006), 'madera', C.nogalOscuro, pos(sx * (cw / 2 - 0.014), cy, prof * 0.4), { veta: 1 });
  l.mas(caja(cw + 0.03, 0.035, prof * 0.86, 0.008, 2), 'madera', C.nogal, pos(0, cy - chh / 2 - 0.01, prof * 0.43));
  l.mas(torno([[0, 0], [0.02, 0.006], [0.028, 0.03], [0.014, 0.05], [0, 0.06]], 12).rotateX(Math.PI), 'madera', C.nogal, pos(0, cy - chh / 2 - 0.02, prof * 0.4));
  l.mas(caja(cw, 0.03, prof * 0.8, 0.006), 'madera', C.nogalOscuro, pos(0, -0.155, prof * 0.4));
  const grupo = l.armar({ nombre: 'reloj' });
  const matEsf = material({ map: texturaEsfera(fuente), roughness: 0.8 });
  const esf = new THREE.Mesh(new THREE.CircleGeometry(0.122, 40), matEsf); esf.position.z = prof + 0.001; grupo.add(esf);
  const matAguja = material({ color: col('#15192a'), roughness: 0.5 });
  const aguja = (largo, ancho) => { const s = new THREE.Shape(); s.moveTo(-ancho / 2, -0.012); s.lineTo(ancho / 2, -0.012); s.lineTo(ancho * 0.32, largo * 0.7); s.lineTo(ancho, largo * 0.78); s.lineTo(0, largo); s.lineTo(-ancho, largo * 0.78); s.lineTo(-ancho * 0.32, largo * 0.7); s.closePath(); return new THREE.Mesh(new THREE.ShapeGeometry(s), matAguja); };
  const horas = aguja(0.066, 0.011), minutos = aguja(0.1, 0.008);
  horas.position.z = prof + 0.004; minutos.position.z = prof + 0.006; grupo.add(horas, minutos);
  const tapa = new THREE.Mesh(cilindro(0.008, 0.006, 10).rotateX(Math.PI / 2), mats.metal.clone()); tapa.material.vertexColors = false; tapa.material.color = col(BRONCE); tapa.position.z = prof + 0.007; grupo.add(tapa);
  // péndulo
  const lp = new Lote(mats, 393);
  lp.mas(caja(0.007, 0.3, 0.003, 0.001), 'metal', BRONCE, pos(0, -0.15, 0));
  lp.mas(torno([[0, 0], [0.04, 0.002], [0.046, 0.007], [0.04, 0.012], [0, 0.014]], 24).rotateX(Math.PI / 2), 'metal', '#dcb65e', pos(0, -0.31, -0.007));
  const pendulo = lp.armar({ nombre: 'pendulo' }); pendulo.position.set(0, -0.2, prof * 0.5); grupo.add(pendulo);
  return { grupo, horas, minutos, pendulo };
}

// ── almanaque de taco: muestra la fecha del juego ──
export function dibujarAlmanaque(g, w, h, fecha, color, fuente) {
  g.fillStyle = '#f6f1e4'; g.fillRect(0, 0, w, h);
  g.fillStyle = color; g.fillRect(0, 0, w, h * 0.24);
  const txt = String(fecha ?? ''), dia = txt.match(/\b(\d{1,2})\b/)?.[1] ?? '', anio = txt.match(/\b(\d{4})\b/)?.[1] ?? '';
  const mes = (txt.replace(/\d+/g, ' ').replace(/\b(de|del|of)\b/gi, ' ').replace(/[.,]/g, ' ').trim().split(/\s+/)[0] ?? '').toUpperCase();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#fff8e6'; g.font = `800 ${h * 0.13}px ${fuente}`; g.fillText([...mes].join(' '), w / 2, h * 0.125);
  g.fillStyle = '#1c2238'; g.font = `800 ${h * 0.5}px ${fuente}`; g.fillText(dia, w / 2, h * 0.55);
  g.font = `700 ${h * 0.11}px ${fuente}`; g.fillStyle = 'rgba(28,34,56,.75)'; g.fillText(anio, w / 2, h * 0.88);
  g.strokeStyle = 'rgba(28,34,56,.25)'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
}
export function crearAlmanaque(mats) {
  const l = new Lote(mats, 401);
  l.mas(placa(0.24, 0.36, 0.012, 0.008), 'satin', '#27463a', pos(0, 0, 0.004));
  l.mas(caja(0.168, 0.2, 0.026, 0.003), 'mate', '#ece5d2', pos(0, -0.055, 0.021));
  l.mas(caja(0.176, 0.022, 0.03, 0.004), 'metal', BRONCE, pos(0, 0.048, 0.022));
  l.mas(cilindro(0.012, 0.006, 12).rotateX(Math.PI / 2), 'metal', BRONCE, pos(0, 0.15, 0.01));
  const grupo = l.armar({ nombre: 'almanaque' });
  const [lz, ctx] = lienzo(192, 224);
  const tex = textura(lz, { repetir: false });
  const hoja = new THREE.Mesh(new THREE.PlaneGeometry(0.164, 0.19), material({ map: tex, roughness: 0.95 }));
  hoja.position.set(0, -0.058, 0.0345); grupo.add(hoja);
  return { grupo, lienzo: lz, ctx, tex };
}

// ── estantes de pared (los aviones se ponen aparte) ──
export function crearEstantes(mats, C, w, ys) {
  const l = new Lote(mats, 411), prof = 0.24;
  for (const y of ys) {
    l.mas(caja(w, 0.03, prof, 0.01, 2), 'barniz', C.nogal, pos(0, y - 0.015, prof / 2), { veta: 0 });
    l.mas(caja(w - 0.04, 0.05, 0.016, 0.005), 'madera', C.nogalOscuro, pos(0, y - 0.055, 0.008), { veta: 0 });
    const n = w > 1.6 ? 4 : 2;
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + 0.12 + (w - 0.24) * i / (n - 1);
      // ménsula de hierro con voluta
      l.mas(caja(0.02, 0.2, 0.008, 0.003), 'hierro', '#2c2a2a', pos(x, y - 0.13, 0.004));
      l.mas(caja(0.02, 0.008, prof - 0.05, 0.003), 'hierro', '#2c2a2a', pos(x, y - 0.034, (prof - 0.05) / 2));
      l.mas(cano([V(x, y - 0.21, 0.01), V(x, y - 0.16, 0.06), V(x, y - 0.09, 0.13), V(x, y - 0.045, 0.17), V(x, y - 0.055, 0.19), V(x, y - 0.075, 0.175)], 0.006, 20, 6), 'hierro', '#2c2a2a');
    }
  }
  return { grupo: l.armar({ nombre: 'estantes' }), prof };
}

// Pie torneado para un avión del estante.
export function crearPie(mats, C, alto, colorEmpresa) {
  const l = new Lote(mats, 421);
  l.mas(torno([[0, 0], [0.05, 0], [0.052, 0.006], [0.046, 0.014], [0.03, 0.018], [0.012, 0.022], [0, 0.022]], 20), 'barniz', C.nogalOscuro);
  l.mas(cilindro(0.0035, alto, 6), 'metal', BRONCE, pos(0, 0.02 + alto / 2, 0));
  l.mas(cilindro(0.047, 0.003, 20), 'esmalte', colorEmpresa, pos(0, 0.0075, 0));
  return l.armar({ nombre: 'pie' });
}

// ── perchero con la campera de vuelo (decoración: llena el rincón) ──
export function crearPerchero(mats, C) {
  const l = new Lote(mats, 431);
  l.mas(torno([[0, 0], [0.17, 0], [0.18, 0.015], [0.12, 0.035], [0.04, 0.06], [0.028, 0.12], [0.024, 0.5], [0.03, 0.52], [0.022, 0.54], [0.022, 1.5], [0.03, 1.52], [0.022, 1.56], [0.02, 1.74], [0.034, 1.77], [0.03, 1.8], [0, 1.83]], 16), 'madera', C.nogalOscuro, null, { veta: 1 });
  for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + 0.4, cx = Math.cos(a), sz = Math.sin(a); l.mas(cano([V(cx * 0.02, 1.62, sz * 0.02), V(cx * 0.1, 1.66, sz * 0.1), V(cx * 0.16, 1.72, sz * 0.16), V(cx * 0.17, 1.76, sz * 0.17)], 0.008, 12, 6), 'metal', BRONCE); l.mas(esfera(0.013, 8, 6), 'metal', BRONCE, pos(cx * 0.17, 1.765, sz * 0.17)); }
  // campera de cuero colgada (una forma blanda) y gorro con antiparras
  const a0 = 0.4, cx = Math.cos(a0), sz = Math.sin(a0), bx = cx * 0.15, bz = sz * 0.15;
  const cuerpo = new THREE.SphereGeometry(1, 14, 10); cuerpo.scale(0.17, 0.4, 0.09);
  l.mas(cuerpo, 'cuero', '#5a3a26', tr(pos(bx, 1.32, bz), rot(0, -a0 + Math.PI / 2, 0)));
  for (const s of [-1, 1]) { const manga = new THREE.SphereGeometry(1, 10, 8); manga.scale(0.055, 0.3, 0.06); l.mas(manga, 'cuero', '#4f3221', tr(pos(bx, 1.3, bz), rot(0, -a0 + Math.PI / 2, 0), pos(s * 0.17, -0.04, 0.01), rot(0, 0, s * 0.12))); }
  const cuello = new THREE.TorusGeometry(0.075, 0.03, 8, 16, Math.PI * 1.3); l.mas(cuello, 'mate', '#e6d9bd', tr(pos(bx, 1.66, bz), rot(0, -a0 + Math.PI / 2, 0), rot(Math.PI / 2 - 0.3, 0, Math.PI * 0.85)));
  const a1 = a0 + Math.PI / 2, gx = Math.cos(a1) * 0.17, gz = Math.sin(a1) * 0.17;
  const gorro = new THREE.SphereGeometry(0.1, 14, 10, 0, TAU, 0, Math.PI * 0.62); l.mas(gorro, 'cuero', '#4a2f20', tr(pos(gx, 1.67, gz), rot(0.2, -a1, 0.5)));
  return { grupo: l.armar({ nombre: 'perchero' }) };
}
