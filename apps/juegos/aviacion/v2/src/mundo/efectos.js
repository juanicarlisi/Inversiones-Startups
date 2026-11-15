// Efectos del mundo: partículas (polvo, chispas, papelitos), el anillo de lo elegido y la flecha que marca dónde tocar.
import * as THREE from 'three';

const MAX = 420;
export class Particulas {
  constructor(luz) {
    this.n = 0; this.p = [];
    const geo = new THREE.BufferGeometry();
    this.pos = new Float32Array(MAX * 3); this.col = new Float32Array(MAX * 4); this.tam = new Float32Array(MAX);
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.col, 4));
    geo.setAttribute('tam', new THREE.BufferAttribute(this.tam, 1));
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uAlto: { value: 720 }, uSolColor: luz.uSolColor, uAmbCielo: luz.uAmbCielo },
      transparent: true, depthWrite: false,
      vertexShader: /* glsl */`
        attribute vec4 color; attribute float tam; uniform float uAlto; varying vec4 vC;
        void main() { vC = color; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uAlto * tam / max(0.5, -mv.z); }`,
      fragmentShader: /* glsl */`
        uniform vec3 uSolColor, uAmbCielo; varying vec4 vC;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = smoothstep(1.0, 0.55, d) * vC.a;
          vec3 c = vC.rgb;
          if (vC.r + vC.g + vC.b < 2.9) c *= (uSolColor * 0.45 + uAmbCielo);   // el polvo recibe la luz del día; las chispas brillan solas
          gl_FragColor = vec4(c, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    this.puntos = new THREE.Points(geo, this.mat); this.puntos.frustumCulled = false; this.puntos.renderOrder = 6;
  }

  // Suelta «n» partículas: color [r,g,b] lineal (más de 1 = brilla), vel = velocidad base, gravedad, vida en segundos.
  soltar(pos, n, { color = [1, 1, 1], vel = 0.3, arriba = 0.3, gravedad = 0.5, vida = 1, tam = 0.02, abre = 1, frena = 1.5 } = {}) {
    for (let i = 0; i < n && this.p.length < MAX; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random();
      const c = Array.isArray(color[0]) ? color[Math.floor(Math.random() * color.length)] : color;
      this.p.push({ x: pos.x, y: pos.y, z: pos.z, vx: Math.cos(a) * vel * r * abre, vy: arriba * (0.5 + Math.random()), vz: Math.sin(a) * vel * r * abre,
        g: gravedad, t: 0, vida: vida * (0.6 + 0.6 * Math.random()), c, tam: tam * (0.6 + 0.8 * Math.random()), frena });
    }
  }

  actualizar(dt) {
    const P = this.p;
    for (let i = P.length - 1; i >= 0; i--) {
      const q = P[i];
      q.t += dt;
      if (q.t >= q.vida) { P[i] = P[P.length - 1]; P.pop(); continue; }
      const f = Math.exp(-q.frena * dt);
      q.vx *= f; q.vz *= f; q.vy = q.vy * f - q.g * dt;
      q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
    }
    for (let i = 0; i < P.length; i++) {
      const q = P[i], k = q.t / q.vida;
      this.pos[i * 3] = q.x; this.pos[i * 3 + 1] = q.y; this.pos[i * 3 + 2] = q.z;
      this.col[i * 4] = q.c[0]; this.col[i * 4 + 1] = q.c[1]; this.col[i * 4 + 2] = q.c[2]; this.col[i * 4 + 3] = Math.min(1, k * 8) * (1 - k * k);
      this.tam[i] = q.tam * (1 + k * 0.8);
    }
    const g = this.puntos.geometry;
    g.setDrawRange(0, P.length);
    g.attributes.position.needsUpdate = g.attributes.color.needsUpdate = g.attributes.tam.needsUpdate = true;
  }
}

// Anillo en el suelo para lo que está elegido (ciudad o avión) y para la ciudad que la guía pide tocar (late).
export function crearAnillo(color = '#ffd76a') {
  const geo = new THREE.RingGeometry(0.93, 1, 72); geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.25), transparent: true, depthWrite: false, opacity: 0.85, side: THREE.DoubleSide });
  const m = new THREE.Mesh(geo, mat); m.renderOrder = 4; m.visible = false;
  return m;
}

// Flecha que rebota sobre el lugar que hay que tocar.
export function crearFlecha() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#ffc233'), emissive: new THREE.Color('#ff9a00'), emissiveIntensity: 0.9, roughness: 0.35 });
  const cono = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.2, 4), mat); cono.rotation.x = Math.PI; cono.position.y = 0.1;
  const tallo = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.16, 0.075), mat); tallo.position.y = 0.27; tallo.rotation.y = Math.PI / 4;
  g.add(cono, tallo); g.visible = false;
  return g;
}
