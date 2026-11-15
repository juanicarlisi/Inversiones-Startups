// Ciclo de día y noche: una sola fuente de verdad para la luz de todo el mundo (terreno, mar, cielo, ciudades, aviones).
import * as THREE from 'three';
import { limitar, suave } from './geo.js';
import { texturaRuido } from './ruido.js';

const c = (hex, k = 1) => new THREE.Color(hex).multiplyScalar(k);
// Claves por hora: cenit y horizonte del cielo, luz directa (sol o luna), luz ambiente del cielo y del suelo, niebla.
const CLAVES = [
  { h: 0, cenit: c('#050a1c'), horiz: c('#131f47'), sol: c('#9db4ff', 0.46), amb: c('#27386e', 0.72), suelo: c('#131a33', 0.7), niebla: c('#0d1736'), noche: 1 },
  { h: 4.6, cenit: c('#060b20'), horiz: c('#1a2552'), sol: c('#9db4ff', 0.46), amb: c('#27386e', 0.72), suelo: c('#131a33', 0.7), niebla: c('#101a3c'), noche: 1 },
  { h: 5.9, cenit: c('#27356f'), horiz: c('#ee8a62'), sol: c('#ff8a4f', 0.8), amb: c('#5b5590', 0.6), suelo: c('#3a2d3f', 0.7), niebla: c('#b7778a'), noche: 0.35 },
  { h: 7.0, cenit: c('#3c78c8'), horiz: c('#ffd2a1'), sol: c('#ffc68a', 1.5), amb: c('#89a9d8', 0.5), suelo: c('#6b5a45', 0.6), niebla: c('#e9c9b0'), noche: 0 },
  { h: 8.6, cenit: c('#2f7fd6'), horiz: c('#bfe3f7'), sol: c('#fff1d6', 1.55), amb: c('#a3c7ee', 0.5), suelo: c('#7a7052', 0.6), niebla: c('#cfe5f4'), noche: 0 },
  { h: 15.5, cenit: c('#2f7fd6'), horiz: c('#c4e4f5'), sol: c('#fff0d2', 1.55), amb: c('#a3c7ee', 0.5), suelo: c('#7a7052', 0.6), niebla: c('#cfe5f4'), noche: 0 },
  { h: 17.4, cenit: c('#3a6fc4'), horiz: c('#ffd9a0'), sol: c('#ffd39a', 1.6), amb: c('#a6a3cc', 0.52), suelo: c('#7a5f48', 0.6), niebla: c('#f4d2a8'), noche: 0 },
  { h: 18.8, cenit: c('#3b4f9e'), horiz: c('#ffa868'), sol: c('#ffb070', 1.55), amb: c('#9a86b8', 0.55), suelo: c('#6a4a44', 0.6), niebla: c('#eba987'), noche: 0.08 },
  { h: 19.6, cenit: c('#252a6e'), horiz: c('#f07e58'), sol: c('#ff8f5e', 1.0), amb: c('#6f62a2', 0.62), suelo: c('#40304a', 0.6), niebla: c('#b9697f'), noche: 0.45 },
  { h: 20.3, cenit: c('#0c1338'), horiz: c('#5a3a7a'), sol: c('#8fa8ff', 0.4), amb: c('#33407c', 0.8), suelo: c('#1a1c38', 0.7), niebla: c('#2a2558'), noche: 0.9 },
  { h: 21.5, cenit: c('#050a1c'), horiz: c('#131f47'), sol: c('#9db4ff', 0.46), amb: c('#27386e', 0.72), suelo: c('#131a33', 0.7), niebla: c('#0d1736'), noche: 1 },
  { h: 24, cenit: c('#050a1c'), horiz: c('#131f47'), sol: c('#9db4ff', 0.46), amb: c('#27386e', 0.72), suelo: c('#131a33', 0.7), niebla: c('#0d1736'), noche: 1 },
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
      uRuido: { value: texturaRuido() },
    };
    this.hora = 9; this.noche = 0;
    this.sol = new THREE.DirectionalLight(0xffffff, 1);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    this.grupo = new THREE.Group();
    this.grupo.add(this.sol, this.sol.target, this.hemi);

    this.cupula = new THREE.Mesh(new THREE.SphereGeometry(420, 32, 20), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, depthFunc: THREE.LessEqualDepth, fog: false,
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
          // estrellas redondas: una por celda, con brillo y parpadeo propios
          vec3 q = d * 150.0, g = floor(q);
          float e = hash(g);
          float punto = smoothstep(0.42, 0.08, length(fract(q) - 0.5));
          float brillo = smoothstep(0.972, 1.0, e) * punto * (0.65 + 0.35 * sin(uTiempo * (1.5 + 3.0 * fract(e * 91.7)) + e * 40.0));
          col += vec3(0.9, 0.93, 1.0) * brillo * smoothstep(0.25, 1.0, uNoche) * smoothstep(0.02, 0.3, d.y) * 2.2;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    this.cupula.renderOrder = 50; this.cupula.frustumCulled = false; // se dibuja después de lo opaco: solo pinta donde no hay nada
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
      dir.copy(disco); dir.y = Math.max(dir.y, 0.3); dir.normalize();
      if (esLuna > 0) dir.lerp(luna, esLuna).normalize();
    }
    this.sol.color.copy(u.uSolColor.value);
    // three divide el difuso por π (los materiales propios no); con el sol bajo se compensa, como hace el terreno con su luz envolvente
    this.sol.intensity = Math.PI * (1 + 0.75 * (1 - dir.y));
    this.sol.position.copy(dir).multiplyScalar(60);
    this.hemi.color.copy(u.uAmbCielo.value); this.hemi.groundColor.copy(u.uAmbSuelo.value); this.hemi.intensity = Math.PI * (1 - 0.35 * this.noche);
  }

  // La cúpula y las luces siguen a la cámara.
  seguir(camara, objetivo) {
    this.cupula.position.copy(camara.position);
    this.sol.target.position.copy(objetivo);
    this.sol.position.copy(objetivo).addScaledVector(this.u.uSolDir.value, 60);
  }
}
