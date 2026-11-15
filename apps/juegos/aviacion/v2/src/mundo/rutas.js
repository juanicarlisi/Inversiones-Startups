// Rutas sobre el terreno (línea punteada que avanza) y sus faros, que se encienden en cadena.
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { mezclar } from './geo.js';

const N = 56; // puntos por ruta
const COLOR_RUTA = new THREE.Color('#ffc94d').convertSRGBToLinear();

export class RutaVista {
  constructor(id, a, b, mundo) {
    this.id = id; this.a = a; this.b = b; this.mundo = mundo;
    this.grupo = new THREE.Group();
    this.dibujo = 0;       // 0 a 1: cuánto de la línea está dibujado (animación al abrir)
    this.conAvion = false; this.balizas = false; this.encendido = 0; this.pings = 0;
    const pts = this.puntos = [];
    const A = a.pos, B = b.pos;
    let largo = 0;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1), x = mezclar(A.x, B.x, t), z = mezclar(A.z, B.z, t);
      const p = new THREE.Vector3(x, mundo.relieve.y(x, z) + 0.035, z);
      if (i) largo += p.distanceTo(pts[i - 1]);
      pts.push(p);
    }
    this.largo = largo;
    const plano = [];
    for (const p of pts) plano.push(p.x, p.y, p.z);
    const geo = new LineGeometry(); geo.setPositions(plano);
    this.mat = new LineMaterial({ color: COLOR_RUTA, linewidth: 3.2, dashed: true, dashSize: 0.1, gapSize: 0.075, transparent: true, opacity: 0.95, depthWrite: false });
    this.mat.resolution.set(innerWidth, innerHeight);
    this.linea = new Line2(geo, this.mat);
    this.linea.computeLineDistances();
    this.linea.renderOrder = 2;
    this.grupo.add(this.linea);
    this.geo = geo;
  }

  // Faros: postes y luces a lo largo de la ruta.
  ponerFaros(animar) {
    if (this.faros) return;
    const n = Math.max(3, Math.round(this.largo / 0.42));
    const pos = new Float32Array(n * 3), orden = new Float32Array(n);
    const postes = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.006, 0.011, 0.11, 6), this.mundo.matPoste, n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, k = t * (N - 1), j = Math.min(N - 2, Math.floor(k)), f = k - j;
      const p = new THREE.Vector3().lerpVectors(this.puntos[j], this.puntos[j + 1], f);
      p.y = this.mundo.relieve.y(p.x, p.z);
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y + 0.125; pos[i * 3 + 2] = p.z; orden[i] = i;
      m.makeTranslation(p.x, p.y + 0.055, p.z); postes.setMatrixAt(i, m);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('orden', new THREE.BufferAttribute(orden, 1));
    this.uFaros = { uEncendido: { value: animar ? 0 : n + 1 }, uTotal: { value: n } };
    const mat = this.mundo.materialFaros(this.uFaros);
    this.faros = new THREE.Points(geo, mat); this.faros.frustumCulled = false; this.faros.renderOrder = 5;
    this.postes = postes; postes.frustumCulled = false;
    this.nFaros = n; this.encendido = animar ? 0 : n + 1; this.pings = Math.floor(this.encendido);
    this.grupo.add(postes, this.faros);
    this.balizas = true;
  }
  reencender() { if (this.faros) { this.encendido = 0; this.pings = 0; } }

  actualizar(dt, S, tiempo, alPing) {
    if (this.dibujo < 1) {
      this.dibujo = Math.min(1, this.dibujo + dt / 1.1);
      this.geo.instanceCount = Math.max(1, Math.floor(this.dibujo * (N - 1)));
    }
    this.mat.dashOffset = -tiempo * 0.07 * (this.conAvion ? 1 : 0);
    this.mat.opacity = this.conAvion ? 0.95 : 0.55;
    this.mat.linewidth = (this.seleccionada ? 5 : 3.2) * (this.mundo.dprLinea ?? 1);
    this.mat.dashScale = 1 / Math.max(0.6, S);
    if (this.faros) {
      if (this.encendido < this.nFaros + 1) {
        this.encendido += dt * 7.5;
        while (this.pings < Math.min(this.nFaros, Math.floor(this.encendido))) { alPing?.(this, this.pings, this.nFaros); this.pings++; }
      }
      this.uFaros.uEncendido.value = this.encendido;
      this.postes.scale.setScalar(1);
    }
  }

  // Punto de la ruta más cercano a un punto de pantalla (para elegirla con un toque).
  puntoMedio(out = new THREE.Vector3()) { return out.copy(this.puntos[N >> 1]); }
  liberar() { this.geo.dispose(); this.mat.dispose(); this.faros?.geometry.dispose(); }
}

export function materialFaros(luz, propios) {
  return new THREE.ShaderMaterial({
    uniforms: { ...luz, ...propios, uEscala: { value: 1 }, uAlto: { value: 720 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute float orden; uniform float uEncendido, uTotal, uTiempo, uNoche, uEscala, uAlto;
      varying float vBrillo;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float prendido = smoothstep(orden, orden + 0.6, uEncendido);
        float destello = exp(-max(uEncendido - orden - 0.6, 0.0) * 1.6) * step(orden, uEncendido);      // el fogonazo al encenderse
        float ola = pow(max(0.0, sin(uTiempo * 2.6 - orden * 0.9)), 6.0);                                 // una luz que corre por la ruta
        vBrillo = prendido * (mix(0.22, 1.0, uNoche) * (0.75 + 0.9 * ola) + destello * 2.2);
        gl_PointSize = uAlto * uEscala * (0.05 + 0.03 * ola + 0.07 * destello) * mix(0.55, 1.0, uNoche) / max(0.6, -mv.z) * prendido;
      }`,
    fragmentShader: /* glsl */`
      varying float vBrillo;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = smoothstep(1.0, 0.0, d);
        vec3 c = vec3(1.0, 0.78, 0.36) * (a * a * 1.2 + smoothstep(0.35, 0.0, d) * 2.5) * vBrillo;
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}
