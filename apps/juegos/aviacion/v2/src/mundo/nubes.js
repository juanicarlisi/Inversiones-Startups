// Nubes de maqueta: racimos de esferas blandas que derivan con el viento. Cerca de la cámara se disuelven (no tapan el juego).
import * as THREE from 'three';
import { azar } from './geo.js';

const PERIODO = 64; // el campo de nubes se repite cada 64 unidades alrededor de lo que mira la cámara

export class Nubes {
  constructor(luz, calidad) {
    const r = azar(1929);
    this.copos = [];
    for (let i = 0; i < calidad.nubes; i++) {
      const cx = r() * PERIODO, cz = r() * PERIODO, alto = 2.3 + r() * 0.9, tam = 0.55 + r() * 0.9;
      const n = 4 + Math.floor(r() * 4);
      for (let k = 0; k < n; k++) {
        const a = r() * Math.PI * 2, d = r() * tam * 1.1;
        this.copos.push({ x: cx + Math.cos(a) * d * 1.5, z: cz + Math.sin(a) * d * 0.9, y: alto + (r() - 0.3) * tam * 0.25,
          sx: tam * (0.55 + r() * 0.6), sy: tam * (0.32 + r() * 0.25), sz: tam * (0.5 + r() * 0.5) });
      }
    }
    const geo = new THREE.IcosahedronGeometry(1, calidad.nubes > 20 ? 2 : 1);
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...luz, uCerca: { value: 9 } },
      vertexShader: /* glsl */`
        varying vec3 vN; varying vec3 vPos;
        void main() {
          vec4 p = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vN = normalize(mat3(instanceMatrix) * normal); vPos = p.xyz;
          gl_Position = projectionMatrix * viewMatrix * p;
        }`,
      fragmentShader: /* glsl */`
        precision highp float;
        uniform vec3 uSolDir, uSolColor, uAmbCielo, uAmbSuelo, uNiebla; uniform float uNieblaDens, uCerca, uNoche;
        varying vec3 vN; varying vec3 vPos;
        void main() {
          float dist = distance(cameraPosition, vPos);
          // se disuelve cerca de la cámara con un tramado (sin ordenar transparencias)
          float visible = smoothstep(uCerca * 0.55, uCerca, dist);
          float umbral = fract(dot(gl_FragCoord.xy, vec2(0.7548776662, 0.5698402910)));
          if (visible < umbral + 0.02) discard;
          vec3 n = normalize(vN);
          float dif = dot(n, uSolDir) * 0.5 + 0.5;
          vec3 c = uSolColor * (0.25 + 0.75 * dif * dif) * 0.62 + mix(uAmbSuelo * 0.9, uAmbCielo, n.y * 0.5 + 0.5) * 1.25;
          c *= mix(1.0, 0.55, uNoche);
          float nb = 1.0 - exp(-pow(dist * uNieblaDens, 2.0));
          c = mix(c, uNiebla, nb * 0.85);
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    this.malla = new THREE.InstancedMesh(geo, mat, this.copos.length);
    this.malla.frustumCulled = false;
    this.m = new THREE.Matrix4(); this.q = new THREE.Quaternion(); this.p = new THREE.Vector3(); this.s = new THREE.Vector3();
    this.viento = new THREE.Vector2();
    this.mat = mat;
  }

  // centro: lo que mira la cámara. El viento sopla del oeste.
  actualizar(dt, centro, distCamara) {
    this.viento.x += dt * 0.09; this.viento.y += dt * 0.03;
    const { copos, malla, m, q, p, s } = this;
    const medio = PERIODO / 2;
    for (let i = 0; i < copos.length; i++) {
      const c = copos[i];
      let x = (c.x + this.viento.x - centro.x) % PERIODO, z = (c.z + this.viento.y - centro.z) % PERIODO;
      if (x < -medio) x += PERIODO; else if (x > medio) x -= PERIODO;
      if (z < -medio) z += PERIODO; else if (z > medio) z -= PERIODO;
      p.set(centro.x + x, c.y, centro.z + z); s.set(c.sx, c.sy, c.sz);
      m.compose(p, q, s); malla.setMatrixAt(i, m);
    }
    malla.instanceMatrix.needsUpdate = true;
    this.mat.uniforms.uCerca.value = Math.max(7, distCamara * 0.9);
  }
}
