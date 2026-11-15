// Ciudades como pequeños conjuntos de maqueta: una ficha de pasto, la pista con sus luces, el hangar, casas, árboles.
// Cada ciudad sale siempre igual (azar con semilla). La base (Buenos Aires) lleva el edificio del correo y un faro que gira.
import * as THREE from 'three';
import { Armado, barra, V, pos, rot, esc, tr, col, esfera } from './aviones.js';
import { aMundo, azar, semillaDe } from './geo.js';

export const RADIO_CIUDAD = 0.5;      // tamaño del conjunto (en unidades de mundo, con escala 1)
export const PISTA = { z: 0.2, medio: 0.36 }; // la pista corre por el eje X local, corrida hacia la cámara

let matCuerpo, matLuces, matResplandor, texResplandor, matHaz, matSombraFicha;
function materiales() {
  if (matCuerpo) return;
  matCuerpo = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.0 });
  matLuces = new THREE.MeshBasicMaterial({ vertexColors: true });
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,200,120,1)'); gr.addColorStop(0.35, 'rgba(255,170,90,0.45)'); gr.addColorStop(1, 'rgba(255,150,70,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  texResplandor = new THREE.CanvasTexture(c);
  matResplandor = new THREE.MeshBasicMaterial({ map: texResplandor, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const c2 = document.createElement('canvas'); c2.width = c2.height = 128;
  const g2 = c2.getContext('2d'), gr2 = g2.createRadialGradient(64, 64, 34, 64, 64, 64);
  gr2.addColorStop(0, 'rgba(0,0,0,0.55)'); gr2.addColorStop(0.55, 'rgba(0,0,0,0.3)'); gr2.addColorStop(1, 'rgba(0,0,0,0)');
  g2.fillStyle = gr2; g2.fillRect(0, 0, 128, 128);
  matSombraFicha = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c2), transparent: true, depthWrite: false, opacity: 0.55 });
  matHaz = new THREE.MeshBasicMaterial({ color: col('#ffe6a8'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, side: THREE.DoubleSide });
}
export const materialesCiudad = () => { materiales(); return { matLuces, matResplandor, matHaz, matSombraFicha }; };

const TECHOS = ['#b5523a', '#c96a43', '#a44634', '#8f5a44', '#b8643a'];
const PAREDES = ['#f2ead8', '#ece0c2', '#f6f1e6', '#e6d3b3', '#f0dcc8'];

// Sombra pintada en la ficha, hacia el sur (el sol del hemisferio sur anda por el norte): barata y da volumen.
function sombra(a, x, z, w, d, h) {
  a.mas(new THREE.BoxGeometry(w * 1.05, 0.0012, d * 0.6 + h * 0.55), '#4f6a36', pos(x + h * 0.12, 0.0128, z + d * 0.3 + h * 0.27));
}
function casa(a, r, x, z, alto = 1) {
  const w = 0.05 + r() * 0.03, d = 0.045 + r() * 0.025, h = (0.034 + r() * 0.022) * alto, g = r() < 0.5 ? 0 : Math.PI / 2;
  const m = tr(pos(x, 0.012, z), rot(0, g + (r() - 0.5) * 0.3, 0));
  a.mas(new THREE.BoxGeometry(w, h, d), PAREDES[Math.floor(r() * PAREDES.length)], tr(m.clone(), pos(0, h / 2, 0)));
  sombra(a, x, z, w, d, h + 0.03);
  const techo = new THREE.ConeGeometry(0.72, 0.035 + r() * 0.015, 4, 1); techo.rotateY(Math.PI / 4); techo.scale(w * 1.12, 1, d * 1.12);
  a.mas(techo, TECHOS[Math.floor(r() * TECHOS.length)], tr(m.clone(), pos(0, h + 0.02, 0)));
  // ventanas hacia la cámara y a un costado
  const luz = r() < 0.8;
  if (luz) {
    a.luz(new THREE.PlaneGeometry(0.011, 0.012), '#ffd27a', tr(m.clone(), pos(-w * 0.2, h * 0.55, d / 2 + 0.001)), false, 1.5);
    if (r() < 0.6) a.luz(new THREE.PlaneGeometry(0.011, 0.012), '#ffd27a', tr(m.clone(), pos(w * 0.22, h * 0.55, d / 2 + 0.001)), false, 1.5);
    if (r() < 0.5) a.luz(new THREE.PlaneGeometry(0.011, 0.012), '#ffca6a', tr(m.clone(), pos(w / 2 + 0.001, h * 0.55, 0), rot(0, Math.PI / 2, 0)), false, 1.5);
  }
}
function edificio(a, r, x, z, alto) {
  const w = 0.06 + r() * 0.03, d = 0.055 + r() * 0.02;
  a.mas(new THREE.BoxGeometry(w, alto, d), ['#e9e1d0', '#d9cdb8', '#efe7da', '#cfc4b0'][Math.floor(r() * 4)], pos(x, 0.012 + alto / 2, z));
  sombra(a, x, z, w, d, alto);
  a.mas(new THREE.BoxGeometry(w * 1.06, 0.008, d * 1.06), '#8a7f72', pos(x, 0.012 + alto + 0.004, z));
  const pisos = Math.max(2, Math.round(alto / 0.028)), cols = 3;
  for (let i = 0; i < pisos; i++) for (let k = 0; k < cols; k++) {
    if (r() < 0.3) continue;
    a.luz(new THREE.PlaneGeometry(0.009, 0.011), r() < 0.5 ? '#ffd27a' : '#ffe9b8', pos(x - w * 0.3 + k * w * 0.3, 0.03 + i * (alto - 0.03) / pisos, z + d / 2 + 0.001), false, 1.5);
  }
}
function arbol(a, r, x, z) {
  const h = 0.03 + r() * 0.03, verde = ['#3f7a3a', '#4f8a3c', '#2f6a3a', '#5c9442'][Math.floor(r() * 4)];
  a.mas(new THREE.CylinderGeometry(0.004, 0.005, 0.02, 5), '#5a4030', pos(x, 0.02, z));
  if (r() < 0.5) a.mas(new THREE.ConeGeometry(0.018, h, 7), verde, pos(x, 0.03 + h / 2, z));
  else a.mas(new THREE.IcosahedronGeometry(0.02 + r() * 0.008, 1), verde, tr(pos(x, 0.045, z), esc(1, 0.85, 1)));
}

function armar(ap, esBase) {
  const a = new Armado(), r = azar(semillaDe(ap.id));
  // ficha de maqueta
  a.mas(new THREE.CylinderGeometry(0.5, 0.52, 0.012, 48), '#7f9f52', pos(0, 0.006, 0));
  a.mas(new THREE.CylinderGeometry(0.525, 0.54, 0.008, 48), '#5d7a3e', pos(0, 0.0, 0));
  // pista
  const { z: pz, medio } = PISTA;
  a.mas(new THREE.BoxGeometry(medio * 2 + 0.06, 0.004, 0.1), '#b9a878', pos(0, 0.0135, pz));
  a.mas(new THREE.BoxGeometry(medio * 2, 0.004, 0.066), '#474a55', pos(0, 0.0155, pz));
  for (let i = -5; i <= 5; i++) a.mas(new THREE.BoxGeometry(0.03, 0.002, 0.006), '#f4f1e6', pos(i * 0.058, 0.018, pz));
  for (const s of [-1, 1]) for (let k = -2; k <= 2; k++) a.mas(new THREE.BoxGeometry(0.02, 0.002, 0.005), '#f4f1e6', pos(s * (medio - 0.025), 0.018, pz + k * 0.011));
  for (let i = -6; i <= 6; i++) for (const s of [-1, 1]) a.luz(esfera(0.0052), '#ffe9b0', pos(i * medio / 6, 0.02, pz + s * 0.04), false, 2.2);
  for (const s of [-1, 1]) for (let k = -1; k <= 1; k++) a.luz(esfera(0.0055), s < 0 ? '#51ff8a' : '#ff5a4a', pos(s * (medio + 0.012), 0.02, pz + k * 0.02), false, 2.2);
  // hangar (techo de arco) y manga de viento
  const hx = -0.2, hz = pz - 0.14;
  const arco = new THREE.CylinderGeometry(0.062, 0.062, 0.13, 16, 1, false, 0, Math.PI); arco.rotateZ(Math.PI / 2); arco.rotateY(Math.PI / 2);
  a.mas(arco, esBase ? '#d2a640' : '#a9483a', pos(hx, 0.03, hz));
  sombra(a, hx, hz, 0.124, 0.13, 0.08);
  a.mas(new THREE.BoxGeometry(0.124, 0.03, 0.13), '#e8dcc2', pos(hx, 0.027, hz));
  a.mas(new THREE.BoxGeometry(0.08, 0.05, 0.004), '#2c2a2e', pos(hx, 0.037, hz + 0.066));
  a.luz(new THREE.PlaneGeometry(0.07, 0.012), '#ffcf7a', pos(hx, 0.07, hz + 0.0685), false, 1.3);
  a.mas(barra(V(0.3, 0.012, pz - 0.075), V(0.3, 0.075, pz - 0.075), 0.003), '#e9e4d6');
  const manga = new THREE.ConeGeometry(0.011, 0.045, 8); manga.rotateZ(-Math.PI / 2);
  a.mas(manga, '#f0642c', pos(0.324, 0.072, pz - 0.075));
  // torre con farol
  const tx = 0.1, tz = pz - 0.1;
  a.mas(new THREE.CylinderGeometry(0.009, 0.013, esBase ? 0.17 : 0.11, 8), '#f0e9da', pos(tx, 0.012 + (esBase ? 0.085 : 0.055), tz));
  a.mas(new THREE.CylinderGeometry(0.02, 0.014, 0.018, 8), '#b5483a', pos(tx, (esBase ? 0.19 : 0.13), tz));
  a.luz(esfera(0.011), '#fff0c0', pos(tx, (esBase ? 0.207 : 0.146), tz), false, 2.6);
  // pueblo
  const n = Math.min(16, 4 + Math.round(ap.peso / 8));
  const puestos = [];
  const libre = (x, z, d) => puestos.every((p) => Math.hypot(p[0] - x, p[1] - z) > d) && Math.hypot(x, z) < 0.44 && Math.hypot(x - hx, z - hz) > 0.12 && Math.hypot(x - tx, z - tz) > 0.06;
  const altos = ap.peso >= 80 ? 5 : ap.peso >= 28 ? 3 : ap.peso >= 18 ? 1 : 0;
  for (let i = 0; i < altos; i++) for (let k = 0; k < 20; k++) {
    const x = (r() - 0.5) * 0.3, z = -0.12 - r() * 0.2;
    if (!libre(x, z, 0.1)) continue;
    puestos.push([x, z]); edificio(a, r, x, z, 0.07 + r() * (ap.peso >= 80 ? 0.1 : 0.05)); break;
  }
  if (esBase) {
    // el correo central: cúpula dorada y bandera
    const x = 0.02, z = -0.02;
    puestos.push([x, z], [x + 0.06, z], [x - 0.06, z]);
    a.mas(new THREE.BoxGeometry(0.17, 0.06, 0.08), '#f3ead6', pos(x, 0.042, z));
    for (let k = -3; k <= 3; k++) a.mas(new THREE.CylinderGeometry(0.005, 0.005, 0.05, 6), '#fffaf0', pos(x + k * 0.022, 0.037, z + 0.043));
    a.mas(new THREE.BoxGeometry(0.18, 0.008, 0.095), '#c9b99a', pos(x, 0.074, z));
    a.mas(new THREE.SphereGeometry(0.036, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#e3b23c', pos(x, 0.078, z));
    a.mas(barra(V(x, 0.11, z), V(x, 0.16, z), 0.002), '#ffffff');
    a.mas(new THREE.BoxGeometry(0.03, 0.016, 0.002), '#7fc4ee', pos(x + 0.016, 0.151, z));
    for (let k = -3; k <= 3; k++) a.luz(new THREE.PlaneGeometry(0.01, 0.016), '#ffdf9a', pos(x + k * 0.022 + 0.011, 0.04, z + 0.0405), false, 1.6);
  }
  for (let i = 0; i < n; i++) for (let k = 0; k < 24; k++) {
    const x = (r() - 0.5) * 0.8, z = -0.42 + r() * (pz - 0.08 + 0.42 - 0.03);
    if (!libre(x, z, 0.078) || z > pz - 0.09) continue;
    puestos.push([x, z]); casa(a, r, x, z, ap.peso >= 28 ? 1.15 : 1); break;
  }
  // farolitos: de noche el pueblo se ve desde lejos
  for (let i = 0; i < 6 + Math.round(ap.peso / 10); i++) { const an = r() * Math.PI * 2, d = 0.06 + r() * 0.36; const x = Math.cos(an) * d, z = Math.sin(an) * d * 0.8 - 0.1; if (Math.abs(z - pz) > 0.07) a.luz(esfera(0.0065), r() < 0.7 ? '#ffd9a0' : '#fff2d0', pos(x, 0.03, z), false, 2.4); }
  const arboles = ap.lat < -44 ? 3 : 9;
  for (let i = 0; i < arboles; i++) for (let k = 0; k < 16; k++) {
    const an = r() * Math.PI * 2, d = 0.2 + r() * 0.27, x = Math.cos(an) * d, z = Math.sin(an) * d;
    if (Math.abs(z - pz) < 0.085 || !libre(x, z, 0.05)) continue;
    puestos.push([x, z]); arbol(a, r, x, z); break;
  }
  return { cuerpo: a.fundir(a.piezas), luces: a.fundir(a.luces), torre: [tx, esBase ? 0.207 : 0.146, tz] };
}

export class Ciudad {
  constructor(ap, relieve, esBase) {
    materiales();
    this.id = ap.id; this.ap = ap; this.esBase = esBase;
    const [x0, z0] = aMundo(ap.lon, ap.lat);
    const [x, z] = relieve.apoyo(x0, z0, 0.2);
    this.pos = new THREE.Vector3(x, relieve.y(x, z) + 0.004, z);
    const r = azar(semillaDe(ap.id) ^ 0x9e37);
    this.angulo = (r() - 0.5) * 0.7;                 // rumbo de la pista: casi este-oeste, para que se vea larga
    this.dirPista = new THREE.Vector3(Math.cos(this.angulo), 0, -Math.sin(this.angulo));
    const g = armar(ap, esBase);
    this.grupo = new THREE.Group();
    this.grupo.position.copy(this.pos); this.grupo.rotation.y = this.angulo;
    this.cuerpo = new THREE.Mesh(g.cuerpo, matCuerpo);
    this.luces = new THREE.Mesh(g.luces, matLuces);
    this.resplandor = new THREE.Mesh(new THREE.PlaneGeometry(esBase ? 3.6 : 2.8, esBase ? 3.6 : 2.8), matResplandor);
    this.resplandor.rotation.x = -Math.PI / 2; this.resplandor.position.y = 0.02; this.resplandor.renderOrder = 2;
    this.sombra = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), matSombraFicha);
    this.sombra.rotation.x = -Math.PI / 2; this.sombra.position.set(0.05, -0.002, 0.07); this.sombra.renderOrder = 1.5;
    this.grupo.add(this.cuerpo, this.luces, this.resplandor, this.sombra);
    if (esBase) {
      // el faro de la base: dos haces que giran
      this.haz = new THREE.Group(); this.haz.position.set(...g.torre);
      for (const s of [0, Math.PI]) {
        const geo = new THREE.PlaneGeometry(1.5, 0.07); geo.translate(0.75, 0, 0);
        const m = new THREE.Mesh(geo, matHaz); m.rotation.y = s; this.haz.add(m);
        const m2 = m.clone(); m2.rotation.x = Math.PI / 2; m2.rotation.y = s; this.haz.add(m2);
      }
      this.grupo.add(this.haz);
    }
    this.escala = 1; this.aparicion = 1; this.visible = true;
    this.tmp = new THREE.Vector3();
  }

  // Centro de la pista en el mundo.
  centroPista(S, out = new THREE.Vector3()) {
    const k = RADIO_CIUDAD * S * PISTA.z;
    // el eje Z local, girado por el rumbo
    return out.set(this.pos.x + Math.sin(this.angulo) * k, this.pos.y + 0.017 * RADIO_CIUDAD * S, this.pos.z + Math.cos(this.angulo) * k);
  }

  actualizar(S, dt, tiempo) {
    if (this.aparicion < 1) this.aparicion = Math.min(1, this.aparicion + dt * 1.6);
    const e = this.aparicion, rebote = e < 1 ? 1 + 0.25 * Math.sin(e * Math.PI) * (1 - e) * 2 : 1;
    const k = RADIO_CIUDAD * S * (0.2 + 0.8 * e * e * (3 - 2 * e)) * rebote;
    this.grupo.scale.setScalar(k);
    if (this.haz) this.haz.rotation.y = tiempo * 1.1;
  }
}
