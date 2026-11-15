// Ciclo de día y noche: una sola fuente de verdad para la luz de todo el mundo (terreno, mar, cielo, ciudades, aviones).
import * as THREE from 'three';
import { limitar, suave } from './geo.js';

const c = (hex, k = 1) => new THREE.Color(hex).convertSRGBToLinear().multiplyScalar(k);
// Claves por hora: cenit y horizonte del cielo, luz directa (sol o luna), luz ambiente del cielo y del suelo, niebla.
const CLAVES = [
  { h: 0, cenit: c('#050a1c'), horiz: c('#131f47'), sol: c('#8fa8ff', 0.55), amb: c('#27386e', 0.95), suelo: c('#131a33', 0.7), niebla: c('#0d1736'), noche: 1 },
  { h: 4.6, cenit: c('#060b20'), horiz: c('#1a2552'), sol: c('#8fa8ff', 0.55), amb: c('#27386e', 0.95), suelo: c('#131a33', 0.7), niebla: c('#101a3c'), noche: 1 },
  { h: 5.9, cenit: c('#27356f'), horiz: c('#ee8a62'), sol: c('#ff8a4f', 0.9), amb: c('#5b5590', 0.9), suelo: c('#3a2d3f', 0.7), niebla: c('#b7778a'), noche: 0.35 },
  { h: 7.2, cenit: c('#3c78c8'), horiz: c('#ffd2a1'), sol: c('#ffc68a', 2.3), amb: c('#89a9d8', 0.85), suelo: c('#6b5a45', 0.6), niebla: c('#e9c9b0'), noche: 0 },
  { h: 10, cenit: c('#2f7fd6'), horiz: c('#bfe3f7'), sol: c('#fff1d6', 2.9), amb: c('#a3c7ee', 0.9), suelo: c('#7a7052', 0.6), niebla: c('#cfe5f4'), noche: 0 },
  { h: 15.5, cenit: c('#2f7fd6'), horiz: c('#c4e4f5'), sol: c('#fff0d2', 2.9), amb: c('#a3c7ee', 0.9), suelo: c('#7a7052', 0.6), niebla: c('#cfe5f4'), noche: 0 },
  { h: 17.6, cenit: c('#3a66b8'), horiz: c('#ffc187'), sol: c('#ffb46e', 2.5), amb: c('#9a90bd', 0.85), suelo: c('#6f5140', 0.6), niebla: c('#f0be98'), noche: 0 },
  { h: 19.1, cenit: c('#2a2f73'), horiz: c('#f0764f'), sol: c('#ff6f3d', 1.5), amb: c('#6f5f9c', 0.85), suelo: c('#46303d', 0.6), niebla: c('#c0627a'), noche: 0.3 },
  { h: 20.3, cenit: c('#0c1338'), horiz: c('#5a3a7a'), sol: c('#8fa8ff', 0.4), amb: c('#33407c', 0.95), suelo: c('#1a1c38', 0.7), niebla: c('#2a2558'), noche: 0.9 },
  { h: 21.5, cenit: c('#050a1c'), horiz: c('#131f47'), sol: c('#8fa8ff', 0.55), amb: c('#27386e', 0.95), suelo: c('#131a33', 0.7), niebla: c('#0d1736'), noche: 1 },
  { h: 24, cenit: c('#050a1c'), horiz: c('#131f47'), sol: c('#8fa8ff', 0.55), amb: c('#27386e', 0.95), suelo: c('#131a33', 0.7), niebla: c('#0d1736'), noche: 1 },
];

export class Cielo {
  constructor() {
    // Estado compartido: los materiales propios leen estos uniformes; las luces de three se actualizan con los mismos valores.
    this.u = {
      uSolDir: { value: new THREE.Vector3(0.5, 0.7, -0.4).normalize() },
      uSolColor: { value: new THREE.Color() },
      uAmbCielo: { value: new THREE.Color() },
      uAmbSuelo: { value: new THREE.Color() },
      uNiebla: { value: new THREE.Color() },
      uNieblaDens: { value: 0.0085 },
      uNoche: { value: 0 },
      uTiempo: { value: 0 },
      uCenit: { value: new THREE.Color() },
      uHoriz: { value: new THREE.Color() },
      uDiscoDir: { value: new THREE.Vector3() }, // dónde se dibuja el sol (aunque ya alumbre la luna)
      uLunaDir: { value: new THREE.Vector3() },
    };
    this.hora = 9; this.noche = 0;
    this.sol = new THREE.DirectionalLight(0xffffff, 1);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    this.grupo = new THREE.Group();
    this.grupo.add(this.sol, this.sol.target, this.hemi);

    this.cupula = new THREE.Mesh(new THREE.SphereGeometry(420, 32, 20), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: this.u,
      vertexShader: /* glsl */`
        varying vec3 vDir;
        void main() { vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position, 1.0); gl_Position = (projectionMatrix * p).xyww; }`,
      fragmentShader: /* glsl */`
        uniform vec3 uCenit, uHoriz, uSolColor, uDiscoDir, uLunaDir, uNiebla; uniform float uNoche, uTiempo;
        varying vec3 vDir;
        float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        void main() {
          vec3 d = normalize(vDir);
          float alt = max(d.y, 0.0);
          vec3 col = mix(uHoriz, uCenit, pow(alt, 0.42));
          col = mix(uNiebla, col, smoothstep(-0.02, 0.10, d.y));
          // resplandor y disco del sol
          float s = max(dot(d, uDiscoDir), 0.0);
          float dia = 1.0 - uNoche;
          col += vec3(1.0, 0.62, 0.32) * pow(s, 9.0) * 0.55 * smoothstep(-0.25, 0.1, uDiscoDir.y) * (0.35 + 0.65 * dia);
          col += vec3(1.0, 0.9, 0.7) * smoothstep(0.9992, 0.9997, s) * 6.0 * smoothstep(-0.06, 0.0, uDiscoDir.y);
          // luna y estrellas
          float l = max(dot(d, uLunaDir), 0.0);
          col += vec3(0.75, 0.82, 1.0) * (smoothstep(0.99955, 0.9998, l) * 3.2 + pow(l, 60.0) * 0.18) * uNoche;
          vec3 g = floor(d * 190.0);
          float e = hash(g);
          float brillo = smoothstep(0.985, 1.0, e) * (0.6 + 0.4 * sin(uTiempo * (1.5 + 3.0 * fract(e * 91.7)) + e * 40.0));
          col += vec3(0.9, 0.93, 1.0) * brillo * uNoche * smoothstep(0.02, 0.3, d.y) * 1.6;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    this.cupula.renderOrder = -10; this.cupula.frustumCulled = false;
    this.grupo.add(this.cupula);
    this.fijarHora(9);
  }

  // hora: 0 a 24 (puede venir con decimales). Mezcla las dos claves vecinas.
  fijarHora(hora) {
    const h = ((hora % 24) + 24) % 24;
    this.hora = h;
    let i = 0;
    while (i < CLAVES.length - 2 && CLAVES[i + 1].h <= h) i++;
    const a = CLAVES[i], b = CLAVES[i + 1], t = suave(a.h, b.h, h);
    const u = this.u;
    u.uCenit.value.copy(a.cenit).lerp(b.cenit, t);
    u.uHoriz.value.copy(a.horiz).lerp(b.horiz, t);
    u.uSolColor.value.copy(a.sol).lerp(b.sol, t);
    u.uAmbCielo.value.copy(a.amb).lerp(b.amb, t);
    u.uAmbSuelo.value.copy(a.suelo).lerp(b.suelo, t);
    u.uNiebla.value.copy(a.niebla).lerp(b.niebla, t);
    this.noche = u.uNoche.value = a.noche + (b.noche - a.noche) * t;
    // El sol sale por el este (+x), pasa por el norte (−z, hemisferio sur) y se pone por el oeste. De noche alumbra la luna.
    const ang = (h - 6) / 12 * Math.PI;
    const disco = u.uDiscoDir.value.set(Math.cos(ang) * 0.92, Math.sin(ang) * 0.86, -0.42).normalize();
    const angL = (h < 12 ? h + 24 : h) - 18;
    const luna = u.uLunaDir.value.set(Math.cos(angL / 12 * Math.PI) * 0.7, 0.62 + 0.2 * Math.sin(angL / 12 * Math.PI), 0.55).normalize();
    const esLuna = limitar((this.noche - 0.45) / 0.3);
    const dir = u.uSolDir.value;
    if (esLuna >= 1) dir.copy(luna);
    else {
      // de día manda el sol, pero nunca tan rasante que todo quede negro
      dir.copy(disco); dir.y = Math.max(dir.y, 0.16); dir.normalize();
      if (esLuna > 0) dir.lerp(luna, esLuna).normalize();
    }
    this.sol.color.copy(u.uSolColor.value); this.sol.intensity = 1;
    this.sol.position.copy(dir).multiplyScalar(60);
    this.hemi.color.copy(u.uAmbCielo.value); this.hemi.groundColor.copy(u.uAmbSuelo.value); this.hemi.intensity = 1.25;
  }

  // La cúpula y las luces siguen a la cámara.
  seguir(camara, objetivo) {
    this.cupula.position.copy(camara.position);
    this.sol.target.position.copy(objetivo);
    this.sol.position.copy(objetivo).addScaledVector(this.u.uSolDir.value, 60);
  }
}
