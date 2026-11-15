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
      transparent: true, depthWrite: false,
      uniforms: { ...luz, uCerca: { value: 9 }, uObjetivo: { value: new THREE.Vector3() } },
      vertexShader: /* glsl */`
        varying vec3 vN; varying vec3 vPos;
        void main() {
          vec4 p = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vN = normalize(mat3(instanceMatrix) * normal); vPos = p.xyz;
          gl_Position = projectionMatrix * viewMatrix * p;
        }`,
      fragmentShader: /* glsl */`
        precision highp float;
        uniform vec3 uSolDir, uSolColor, uAmbCielo, uAmbSuelo, uNiebla, uObjetivo; uniform float uNieblaDens, uCerca, uNoche;
        varying vec3 vN; varying vec3 vPos;
        void main() {
          float dist = distance(cameraPosition, vPos);
          // se disuelve cerca de la cámara con un tramado (sin ordenar transparencias)
          // solo se ven lejos de la cámara y lejos de lo que se mira: la zona de juego queda despejada
          float visible = smoothstep(uCerca * 0.74, uCerca * 0.9, dist) * smoothstep(uCerca * 0.42, uCerca * 0.6, distance(vPos.xz, uObjetivo.xz));
          if (visible < 0.01) discard;
          vec3 n = normalize(vN);
          float dif = dot(n, uSolDir) * 0.5 + 0.5;
          vec3 c = uSolColor * (0.3 + 0.7 * dif * dif) * 0.75 + mix(uAmbSuelo * 1.4 + uAmbCielo * 0.5, uAmbCielo * 1.6, n.y * 0.5 + 0.5);
          c *= mix(1.0, 0.55, uNoche);
          float nb = 1.0 - exp(-pow(dist * uNieblaDens, 2.0));
          c = mix(c, uNiebla, nb * 0.85);
          // el borde de cada copo se deshace: de lejos se lee como nube y no como un recorte blanco de canto duro
          float borde = smoothstep(0.06, 0.62, abs(dot(n, normalize(cameraPosition - vPos))));
          gl_FragColor = vec4(c, visible * 0.94 * borde);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    this.malla = new THREE.InstancedMesh(geo, mat, this.copos.length);
    this.malla.frustumCulled = false; this.malla.renderOrder = 8;
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
    this.mat.uniforms.uCerca.value = Math.max(8, distCamara); this.mat.uniforms.uObjetivo.value.copy(centro);
  }
}
