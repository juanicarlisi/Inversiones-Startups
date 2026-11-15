// Los siete aviones del juego, modelados por código (formas propias: ningún modelo real). Nariz hacia +Z, arriba +Y.
// Cada tipo se arma una sola vez: un cuerpo fundido con color por vértice, una malla de luces y sus hélices.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const col = (hex) => new THREE.Color(hex);
const M4 = () => new THREE.Matrix4();
const pos = (x, y, z) => M4().makeTranslation(x, y, z);
const rot = (x, y, z) => M4().makeRotationFromEuler(new THREE.Euler(x, y, z));
const esc = (x, y, z) => M4().makeScale(x, y, z);
const tr = (...ms) => ms.reduce((a, b) => a.multiply(b), M4());

// Fuselaje de revolución: perfil = [[z, radio], …] de la cola a la nariz; ancho y alto estiran la sección.
function fuselaje(perfil, ancho = 1, alto = 1, seg = 20) {
  const g = new THREE.LatheGeometry(perfil.map(([z, r]) => new THREE.Vector2(Math.max(r, 0.0001), z)), seg);
  g.rotateX(Math.PI / 2);
  g.scale(ancho, alto, 1);
  return g;
}
// Media ala (hacia +X): cuerda en la raíz y en la punta, flecha (cuánto retrocede la punta) y espesor. Bordes redondeados.
function mediaAla(largo, cuerdaRaiz, cuerdaPunta, espesor, flecha = 0) {
  const s = new THREE.Shape();
  const r = Math.min(cuerdaPunta * 0.5, largo * 0.2);
  s.moveTo(0, cuerdaRaiz / 2);
  s.lineTo(largo - r, cuerdaPunta / 2 - flecha);
  s.quadraticCurveTo(largo, cuerdaPunta / 2 - flecha, largo, cuerdaPunta / 2 - flecha - r);
  s.quadraticCurveTo(largo, -cuerdaPunta / 2 - flecha, largo - r, -cuerdaPunta / 2 - flecha);
  s.lineTo(0, -cuerdaRaiz / 2);
  s.closePath();
  const b = espesor * 0.42;
  const g = new THREE.ExtrudeGeometry(s, { depth: espesor - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b * 1.2, bevelSegments: 3, curveSegments: 6 });
  g.translate(0, 0, -(espesor - 2 * b) / 2);
  g.rotateX(-Math.PI / 2); // la forma queda en el plano XZ, el espesor en Y; +cuerda hacia +Z (borde de ataque)
  g.scale(1, 1, -1);
  // al espejar una sola vez se invierten las caras: se corrige el orden de los triángulos
  const p = g.index ? g.toNonIndexed() : g;
  const a = p.attributes.position.array, n = p.attributes.normal.array;
  for (let i = 0; i < a.length; i += 9) for (let k = 0; k < 3; k++) { let t = a[i + 3 + k]; a[i + 3 + k] = a[i + 6 + k]; a[i + 6 + k] = t; t = n[i + 3 + k]; n[i + 3 + k] = n[i + 6 + k]; n[i + 6 + k] = t; }
  return p;
}
function espejo(g) {
  const p = g.clone(); p.scale(-1, 1, 1);
  const a = p.attributes.position.array, n = p.attributes.normal.array;
  for (let i = 0; i < a.length; i += 9) for (let k = 0; k < 3; k++) { let t = a[i + 3 + k]; a[i + 3 + k] = a[i + 6 + k]; a[i + 6 + k] = t; t = n[i + 3 + k]; n[i + 3 + k] = n[i + 6 + k]; n[i + 6 + k] = t; }
  return p;
}
// Barra entre dos puntos (montantes, tren de aterrizaje).
function barra(a, b, r) {
  const d = new THREE.Vector3().subVectors(b, a), l = d.length();
  const g = new THREE.CylinderGeometry(r, r, l, 6);
  g.applyMatrix4(M4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())));
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);

class Armado {
  constructor() { this.piezas = []; this.luces = []; this.helices = []; }
  // suma una pieza (y su espejo en X si se pide)
  mas(geo, color, m = null, simetrica = false) {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (m) g.applyMatrix4(m);
    this.piezas.push([g, col(color)]);
    if (simetrica) this.piezas.push([espejo(g), col(color)]);
    return this;
  }
  luz(geo, color, m, simetrica = false, brillo = 1) {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (m) g.applyMatrix4(m);
    this.luces.push([g, col(color).multiplyScalar(brillo)]);
    if (simetrica) this.luces.push([espejo(g), col(color).multiplyScalar(brillo)]);
    return this;
  }
  helice(x, y, z, radio, palas = 2) { this.helices.push({ x, y, z, radio, palas }); return this; }
  // Motor de hélice: capó, frente oscuro y cono.
  motor(x, y, z, r, largo, color = '#3a3f4a') {
    this.mas(new THREE.CylinderGeometry(r, r * 0.86, largo, 14), color, tr(pos(x, y, z), rot(Math.PI / 2, 0, 0)));
    this.mas(new THREE.CylinderGeometry(r * 0.8, r * 0.8, 0.012, 14), '#1c1e24', tr(pos(x, y, z + largo / 2 + 0.004), rot(Math.PI / 2, 0, 0)));
    this.mas(new THREE.ConeGeometry(r * 0.3, r * 0.7, 10), '#d9b45a', tr(pos(x, y, z + largo / 2 + r * 0.34), rot(Math.PI / 2, 0, 0)));
    return this;
  }
  rueda(x, y, z, r) { return this.mas(new THREE.CylinderGeometry(r, r, r * 0.55, 12), '#22242a', tr(pos(x, y, z), rot(0, 0, Math.PI / 2))); }
  fundir(lista) {
    if (!lista.length) return null;
    const gs = lista.map(([g, c]) => {
      g.deleteAttribute('uv');
      const n = g.attributes.position.count, arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
      g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
      return g;
    });
    return mergeGeometries(gs, false);
  }
}

// Ventanillas en fila (brillan de noche).
function ventanillas(a, desde, hasta, n, y, x, tam = 0.022) {
  for (let i = 0; i < n; i++) {
    const z = desde + (hasta - desde) * (i / Math.max(1, n - 1));
    a.luz(new THREE.BoxGeometry(0.008, tam, tam * 1.25), '#ffd98a', pos(x, y, z), true, 1);
  }
}
const esfera = (r) => new THREE.SphereGeometry(r, 10, 8);
function lucesNavegacion(a, x, y, z, cola) {
  a.luz(esfera(0.014), '#ff3b30', pos(-x, y, z), false, 2.2);
  a.luz(esfera(0.014), '#3dff7a', pos(x, y, z), false, 2.2);
  a.luz(esfera(0.012), '#ffffff', pos(0, cola[0], cola[1]), false, 2.0);
}

// ── los siete tipos ──
const TIPOS = {
  // Biplano de correo de los años 20: cabina abierta, piloto con bufanda, motor a la vista.
  golondrina() {
    const a = new Armado();
    const crema = '#f3e6c4', rojo = '#cf3f2c', oscuro = '#3c2f2a';
    a.mas(fuselaje([[-0.36, 0.012], [-0.3, 0.035], [-0.1, 0.066], [0.1, 0.078], [0.24, 0.078], [0.3, 0.07]], 0.9, 1.05), crema);
    a.mas(fuselaje([[-0.1, 0.0672], [0.1, 0.0792], [0.2, 0.0792]], 0.9, 1.05).clone(), rojo, tr(pos(0, -0.012, 0), esc(1.012, 0.5, 1))); // franja de la panza
    a.motor(0, 0, 0.33, 0.074, 0.07);
    for (let k = 0; k < 7; k++) { const an = k / 7 * Math.PI * 2; a.mas(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 6), '#55585f', tr(pos(Math.cos(an) * 0.075, Math.sin(an) * 0.075, 0.33), rot(0, 0, an - Math.PI / 2))); }
    a.helice(0, 0, 0.395, 0.17);
    // alas: la de arriba más adelante
    a.mas(mediaAla(0.5, 0.17, 0.15, 0.02), rojo, pos(0, 0.165, 0.14), true);
    a.mas(mediaAla(0.44, 0.15, 0.13, 0.02), rojo, pos(0.02, -0.045, 0.07), true);
    a.mas(new THREE.BoxGeometry(0.1, 0.02, 0.17), rojo, pos(0, 0.165, 0.14));
    for (const z of [0.17, 0.05]) {
      a.mas(barra(V(0.3, -0.04, z - 0.03), V(0.32, 0.16, z + 0.03), 0.006), oscuro, null, true);
      a.mas(barra(V(0.045, 0.07, z), V(0.07, 0.16, z + 0.03), 0.006), oscuro, null, true);
    }
    a.mas(barra(V(0.3, -0.04, 0.02), V(0.32, 0.16, 0.2), 0.003), '#8a8f99', null, true);
    // cola
    a.mas(mediaAla(0.17, 0.11, 0.08, 0.014), rojo, pos(0, 0.01, -0.31), true);
    a.mas(mediaAla(0.14, 0.12, 0.07, 0.014), crema, tr(pos(0, 0.01, -0.31), rot(0, 0, Math.PI / 2)));
    // cabina abierta y piloto
    a.mas(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 12), '#2a2320', pos(0, 0.072, 0.0));
    a.mas(esfera(0.034), '#e9b98f', pos(0, 0.105, -0.005));
    a.mas(new THREE.SphereGeometry(0.037, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), '#6b4226', pos(0, 0.108, -0.008));
    a.mas(new THREE.BoxGeometry(0.05, 0.012, 0.018), '#20242c', pos(0, 0.112, 0.022)); // antiparras
    a.mas(new THREE.BoxGeometry(0.016, 0.012, 0.11), '#e8eef5', tr(pos(0.012, 0.085, -0.07), rot(0.25, 0.2, 0)));  // bufanda al viento
    a.mas(new THREE.BoxGeometry(0.07, 0.035, 0.006), '#9fd3ee', tr(pos(0, 0.098, 0.05), rot(-0.5, 0, 0))); // parabrisas
    // tren
    a.rueda(0.1, -0.15, 0.15, 0.045).rueda(-0.1, -0.15, 0.15, 0.045);
    a.mas(barra(V(0.06, -0.05, 0.19), V(0.1, -0.15, 0.15), 0.007), oscuro, null, true);
    a.mas(barra(V(0.06, -0.05, 0.09), V(0.1, -0.15, 0.15), 0.007), oscuro, null, true);
    a.mas(barra(V(-0.1, -0.15, 0.15), V(0.1, -0.15, 0.15), 0.005), oscuro);
    a.mas(barra(V(0, -0.03, -0.32), V(0, -0.075, -0.35), 0.006), oscuro);
    lucesNavegacion(a, 0.5, 0.165, 0.14, [0.15, -0.36]);
    return { a, envergadura: 1.0, suelo: 0.195, cabeceo: 0.2 };
  },
  // Monoplano de ala alta de 1929: cabina cerrada, ala gruesa sobre montantes.
  tero() {
    const a = new Armado();
    const azul = '#27457f', crema = '#f1e6cb', amar = '#e9b53a', oscuro = '#2b2f3a';
    a.mas(fuselaje([[-0.42, 0.012], [-0.34, 0.04], [-0.1, 0.075], [0.12, 0.088], [0.28, 0.086], [0.34, 0.07]], 0.92, 1.12), azul);
    a.motor(0, 0, 0.37, 0.07, 0.08, '#c9ced6');
    a.helice(0, 0, 0.44, 0.18);
    a.mas(mediaAla(0.58, 0.21, 0.14, 0.03), crema, pos(0, 0.135, 0.1), true);
    a.mas(new THREE.BoxGeometry(0.1, 0.028, 0.2), crema, pos(0, 0.135, 0.1));
    a.mas(barra(V(0.07, -0.06, 0.14), V(0.3, 0.125, 0.13), 0.008), oscuro, null, true);
    a.mas(barra(V(0.07, -0.06, 0.04), V(0.3, 0.125, 0.07), 0.008), oscuro, null, true);
    a.mas(mediaAla(0.2, 0.12, 0.08, 0.014), amar, pos(0, 0.02, -0.36), true);
    a.mas(mediaAla(0.17, 0.14, 0.07, 0.014), amar, tr(pos(0, 0.02, -0.36), rot(0, 0, Math.PI / 2)));
    a.luz(new THREE.BoxGeometry(0.008, 0.04, 0.07), '#ffe2a0', pos(0.074, 0.05, 0.2), true, 0.9);
    ventanillas(a, -0.02, 0.1, 3, 0.04, 0.076, 0.03);
    a.mas(new THREE.BoxGeometry(0.12, 0.05, 0.05), '#9fd3ee', tr(pos(0, 0.085, 0.25), rot(-0.6, 0, 0)));
    a.rueda(0.12, -0.17, 0.16, 0.048).rueda(-0.12, -0.17, 0.16, 0.048);
    a.mas(barra(V(0.06, -0.06, 0.16), V(0.12, -0.17, 0.16), 0.008), oscuro, null, true);
    a.mas(barra(V(0.07, 0.0, 0.1), V(0.12, -0.17, 0.16), 0.006), oscuro, null, true);
    a.mas(barra(V(0, -0.03, -0.38), V(0, -0.08, -0.41), 0.006), oscuro);
    lucesNavegacion(a, 0.58, 0.14, 0.08, [0.18, -0.42]);
    return { a, envergadura: 1.16, suelo: 0.22, cabeceo: 0.17 };
  },
  // Bimotor metálico de 1936, 21 asientos.
  chaja() {
    const a = new Armado();
    const metal = '#cfd5dc', naranja = '#e2762b', oscuro = '#2b2f3a';
    a.mas(fuselaje([[-0.55, 0.012], [-0.44, 0.045], [-0.2, 0.085], [0.1, 0.1], [0.34, 0.098], [0.46, 0.07], [0.52, 0.03]], 0.95, 1.05, 24), metal);
    a.mas(fuselaje([[-0.4, 0.052], [-0.2, 0.086], [0.1, 0.101], [0.34, 0.099]], 0.957, 0.2, 24), naranja, pos(0, 0.012, 0));
    a.mas(mediaAla(0.72, 0.27, 0.11, 0.035, 0.06), metal, tr(pos(0, -0.05, 0.08), rot(0, 0, 0.07)), true);
    for (const s of [1, -1]) { a.motor(s * 0.24, -0.02, 0.2, 0.062, 0.2, '#b9bfc8'); a.helice(s * 0.24, -0.02, 0.325, 0.16, 3); a.rueda(s * 0.24, -0.2, 0.17, 0.05); a.mas(barra(V(s * 0.24, -0.05, 0.17), V(s * 0.24, -0.2, 0.17), 0.009), oscuro); }
    a.mas(mediaAla(0.26, 0.15, 0.08, 0.016, 0.02), metal, pos(0, 0.03, -0.46), true);
    a.mas(mediaAla(0.24, 0.2, 0.09, 0.018, 0.05), naranja, tr(pos(0, 0.03, -0.46), rot(0, 0, Math.PI / 2)));
    ventanillas(a, -0.2, 0.3, 7, 0.045, 0.094);
    a.mas(new THREE.BoxGeometry(0.13, 0.04, 0.07), '#27404f', tr(pos(0, 0.075, 0.42), rot(-0.5, 0, 0)));
    a.mas(barra(V(0, -0.02, -0.5), V(0, -0.08, -0.52), 0.006), oscuro);
    lucesNavegacion(a, 0.72, 0.0, 0.03, [0.27, -0.52]);
    return { a, envergadura: 1.5, suelo: 0.25, cabeceo: 0.13 };
  },
  // Cuatrimotor de posguerra.
  cauquen() {
    const a = new Armado();
    const blanco = '#eef1f4', metal = '#c5ccd4', azul = '#2c5fa8', oscuro = '#2b2f3a';
    a.mas(fuselaje([[-0.72, 0.012], [-0.58, 0.05], [-0.3, 0.095], [0.2, 0.105], [0.52, 0.1], [0.66, 0.07], [0.72, 0.03]], 1, 1, 24), metal);
    a.mas(fuselaje([[-0.58, 0.0505], [-0.3, 0.0955], [0.2, 0.1055], [0.52, 0.1005], [0.66, 0.0705]], 1.003, 1.003, 24, ), blanco, tr(pos(0, 0.03, 0), esc(1, 0.72, 1)));
    a.mas(fuselaje([[-0.5, 0.068], [-0.3, 0.0962], [0.2, 0.1062], [0.5, 0.1014]], 1.004, 0.16, 24), azul, pos(0, 0.012, 0));
    a.mas(mediaAla(0.95, 0.3, 0.1, 0.038, 0.08), metal, tr(pos(0, -0.06, 0.08), rot(0, 0, 0.08)), true);
    for (const s of [1, -1]) for (const [x, z] of [[0.26, 0.21], [0.52, 0.17]]) { a.motor(s * x, -0.035 + x * 0.07, z, 0.05, 0.2, '#aab1ba'); a.helice(s * x, -0.035 + x * 0.07, z + 0.125, 0.14, 3); }
    a.rueda(0.26, -0.22, 0.12, 0.05).rueda(-0.26, -0.22, 0.12, 0.05).rueda(0, -0.2, 0.56, 0.04);
    a.mas(barra(V(0.26, -0.05, 0.12), V(0.26, -0.22, 0.12), 0.009), oscuro, null, true);
    a.mas(barra(V(0, -0.08, 0.56), V(0, -0.2, 0.56), 0.008), oscuro);
    a.mas(mediaAla(0.32, 0.17, 0.08, 0.018, 0.03), metal, pos(0, 0.03, -0.6), true);
    a.mas(mediaAla(0.3, 0.24, 0.1, 0.02, 0.07), azul, tr(pos(0, 0.03, -0.6), rot(0, 0, Math.PI / 2)));
    ventanillas(a, -0.4, 0.46, 12, 0.045, 0.1, 0.02);
    a.mas(new THREE.BoxGeometry(0.13, 0.04, 0.07), '#27404f', tr(pos(0, 0.07, 0.63), rot(-0.55, 0, 0)));
    lucesNavegacion(a, 0.95, 0.02, 0.0, [0.33, -0.68]);
    return { a, envergadura: 1.9, suelo: 0.27, cabeceo: 0 };
  },
  // Turbohélice de ala alta.
  petrel() {
    const a = new Armado();
    const blanco = '#f2f4f6', verde = '#17877d', oscuro = '#2b2f3a';
    a.mas(fuselaje([[-0.68, 0.012], [-0.5, 0.06], [-0.3, 0.098], [0.36, 0.1], [0.54, 0.075], [0.62, 0.03]], 1, 1, 24), blanco);
    a.mas(fuselaje([[-0.48, 0.066], [-0.3, 0.0985], [0.36, 0.1005], [0.5, 0.083]], 1.003, 0.17, 24), verde, pos(0, 0.0, 0));
    a.mas(mediaAla(0.8, 0.2, 0.1, 0.03, 0.02), blanco, pos(0, 0.11, 0.05), true);
    a.mas(new THREE.BoxGeometry(0.16, 0.03, 0.2), blanco, pos(0, 0.11, 0.05));
    for (const s of [1, -1]) { a.mas(fuselaje([[-0.14, 0.02], [-0.05, 0.045], [0.1, 0.045], [0.16, 0.025]], 1, 1, 12), '#d7dbe0', pos(s * 0.27, 0.075, 0.1)); a.mas(new THREE.ConeGeometry(0.02, 0.05, 8), '#30333a', tr(pos(s * 0.27, 0.075, 0.28), rot(Math.PI / 2, 0, 0))); a.helice(s * 0.27, 0.075, 0.275, 0.17, 4); a.rueda(s * 0.1, -0.16, 0.02, 0.04); }
    a.rueda(0, -0.16, 0.48, 0.035);
    a.mas(mediaAla(0.3, 0.14, 0.08, 0.016, 0.03), blanco, pos(0, 0.27, -0.63), true);
    a.mas(mediaAla(0.26, 0.24, 0.13, 0.02, 0.1), verde, tr(pos(0, 0.03, -0.56), rot(0, 0, Math.PI / 2)));
    ventanillas(a, -0.34, 0.36, 11, 0.04, 0.097, 0.02);
    a.mas(new THREE.BoxGeometry(0.13, 0.04, 0.07), '#27404f', tr(pos(0, 0.065, 0.53), rot(-0.6, 0, 0)));
    lucesNavegacion(a, 0.8, 0.11, 0.03, [0.29, -0.66]);
    return { a, envergadura: 1.6, suelo: 0.2, cabeceo: 0 };
  },
  // Jet de pasajeros: alas en flecha, dos motores bajo el ala.
  halcon() {
    const a = new Armado();
    const blanco = '#f4f5f7', azul = '#1c2f5e', oro = '#e3b23c';
    a.mas(fuselaje([[-0.95, 0.012], [-0.75, 0.06], [-0.5, 0.1], [0.6, 0.105], [0.82, 0.08], [0.93, 0.03]], 1, 1, 24), blanco);
    a.mas(fuselaje([[-0.75, 0.0605], [-0.5, 0.1005], [0.6, 0.1055], [0.8, 0.083]], 1.003, 0.14, 24), azul, pos(0, 0.0, 0));
    a.mas(mediaAla(0.92, 0.36, 0.09, 0.03, 0.42), '#d9dde2', tr(pos(0, -0.055, 0.2), rot(0, 0, 0.09)), true);
    for (const s of [1, -1]) { a.mas(fuselaje([[-0.14, 0.035], [-0.05, 0.055], [0.1, 0.058], [0.14, 0.05]], 1, 1, 14), '#c9ced6', pos(s * 0.32, -0.1, 0.16)); a.mas(new THREE.CylinderGeometry(0.046, 0.046, 0.01, 14), '#20232a', tr(pos(s * 0.32, -0.1, 0.303), rot(Math.PI / 2, 0, 0))); }
    a.rueda(0.12, -0.2, -0.02, 0.04).rueda(-0.12, -0.2, -0.02, 0.04).rueda(0, -0.2, 0.7, 0.035);
    a.mas(mediaAla(0.36, 0.2, 0.07, 0.016, 0.2), '#d9dde2', pos(0, 0.04, -0.74), true);
    a.mas(mediaAla(0.36, 0.3, 0.11, 0.022, 0.26), azul, tr(pos(0, 0.05, -0.7), rot(0, 0, Math.PI / 2)));
    a.mas(esfera(0.045), oro, tr(pos(0, 0.3, -0.87), esc(0.2, 1, 1)));
    ventanillas(a, -0.6, 0.62, 20, 0.04, 0.103, 0.016);
    a.mas(new THREE.BoxGeometry(0.13, 0.035, 0.07), '#27404f', tr(pos(0, 0.062, 0.82), rot(-0.6, 0, 0)));
    lucesNavegacion(a, 0.92, 0.03, -0.24, [0.4, -0.98]);
    return { a, envergadura: 1.95, suelo: 0.24, cabeceo: 0 };
  },
  // Carguero: panza grande, joroba, cuatro motores.
  cormoran() {
    const a = new Armado();
    const gris = '#e6e8ea', naranja = '#e2632b';
    a.mas(fuselaje([[-1.1, 0.012], [-0.85, 0.08], [-0.55, 0.14], [0.7, 0.145], [0.95, 0.11], [1.08, 0.04]], 1, 1, 24), gris);
    a.mas(fuselaje([[0.3, 0.02], [0.5, 0.09], [0.85, 0.1], [1.0, 0.03]], 0.9, 1, 16), gris, pos(0, 0.09, 0));
    a.mas(fuselaje([[-0.85, 0.0805], [-0.55, 0.1405], [0.7, 0.1455], [0.93, 0.113]], 1.003, 0.13, 24), naranja, pos(0, -0.01, 0));
    a.mas(mediaAla(1.15, 0.46, 0.11, 0.04, 0.5), '#d3d7dc', tr(pos(0, -0.05, 0.25), rot(0, 0, 0.09)), true);
    for (const s of [1, -1]) for (const [x, z] of [[0.36, 0.2], [0.72, 0.02]]) { a.mas(fuselaje([[-0.16, 0.035], [-0.05, 0.06], [0.1, 0.064], [0.15, 0.055]], 1, 1, 14), '#c9ced6', pos(s * x, -0.12 + x * 0.08, z)); a.mas(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 14), '#20232a', tr(pos(s * x, -0.12 + x * 0.08, z + 0.153), rot(Math.PI / 2, 0, 0))); }
    a.rueda(0.14, -0.24, -0.05, 0.045).rueda(-0.14, -0.24, -0.05, 0.045).rueda(0.14, -0.24, 0.08, 0.045).rueda(-0.14, -0.24, 0.08, 0.045).rueda(0, -0.24, 0.85, 0.04);
    a.mas(mediaAla(0.44, 0.25, 0.08, 0.02, 0.25), '#d3d7dc', pos(0, 0.06, -0.86), true);
    a.mas(mediaAla(0.44, 0.36, 0.13, 0.026, 0.3), naranja, tr(pos(0, 0.08, -0.82), rot(0, 0, Math.PI / 2)));
    a.mas(new THREE.BoxGeometry(0.15, 0.035, 0.07), '#27404f', tr(pos(0, 0.165, 0.9), rot(-0.6, 0, 0)));
    lucesNavegacion(a, 1.15, 0.05, -0.27, [0.5, -1.12]);
    return { a, envergadura: 2.4, suelo: 0.285, cabeceo: 0 };
  },
};

const cache = new Map();
let matCuerpo = null, matLuces = null, matPala = null, matDisco = null, geoDisco = null;
function materiales() {
  if (matCuerpo) return;
  matCuerpo = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.48, metalness: 0.12 });
  matLuces = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: true });
  matPala = new THREE.MeshStandardMaterial({ color: col('#3a2a20'), roughness: 0.6 });
  matDisco = new THREE.MeshBasicMaterial({ color: col('#d8dde6'), transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide });
  geoDisco = new THREE.CircleGeometry(1, 24);
}
export const materialLucesAvion = () => { materiales(); return matLuces; };

function plantilla(tipo) {
  if (cache.has(tipo)) return cache.get(tipo);
  materiales();
  const { a, envergadura, suelo, cabeceo } = (TIPOS[tipo] ?? TIPOS.golondrina)();
  const p = { cuerpo: a.fundir(a.piezas), luces: a.fundir(a.luces), helices: a.helices, envergadura, suelo, cabeceo };
  cache.set(tipo, p);
  return p;
}

// Devuelve un avión nuevo: { grupo, helices[], envergadura, suelo (altura del eje sobre las ruedas), cabeceo (cola baja en tierra) }.
export function crearAvion(tipo) {
  const p = plantilla(tipo);
  const grupo = new THREE.Group();
  const cuerpo = new THREE.Mesh(p.cuerpo, matCuerpo);
  grupo.add(cuerpo);
  if (p.luces) grupo.add(new THREE.Mesh(p.luces, matLuces));
  const helices = [];
  for (const h of p.helices) {
    const eje = new THREE.Group(); eje.position.set(h.x, h.y, h.z);
    for (let k = 0; k < h.palas; k++) {
      const pala = new THREE.Mesh(new THREE.BoxGeometry(h.radio * 2 / (h.palas === 2 ? 1 : 2), 0.022, 0.006), matPala);
      if (h.palas !== 2) pala.geometry.translate(h.radio / 2, 0, 0);
      pala.rotation.z = k / h.palas * Math.PI * (h.palas === 2 ? 1 : 2);
      eje.add(pala);
      if (h.palas === 2) break;
    }
    const disco = new THREE.Mesh(geoDisco, matDisco); disco.scale.setScalar(h.radio);
    eje.add(disco);
    grupo.add(eje); helices.push({ eje, disco });
  }
  return { grupo, helices, envergadura: p.envergadura, suelo: p.suelo, cabeceo: p.cabeceo };
}

export const TIPOS_AVION = Object.keys(TIPOS);
export { Armado, barra, V, pos, rot, esc, tr, col, esfera };
