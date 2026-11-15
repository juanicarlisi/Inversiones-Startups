// Los aviones en el mundo: cada avión del modelo tiene su nave 3D, que carretea, despega, vira inclinándose, deja estela y
// aterriza. La vista no inventa nada: la posición sale de la fase y del tiempo que le queda al avión en el modelo.
import * as THREE from 'three';
import { crearAvion } from './aviones.js';
import { RADIO_CIUDAD, PISTA } from './ciudades.js';
import { limitar, mezclar, suave } from './geo.js';

const N_ESTELA = 26;
const CASILLAS = [0, 0.115, -0.1, 0.2]; // corrimiento lateral de los aviones estacionados (× escala), para que no se pisen
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3();
const _p0 = new THREE.Vector3(), _p1 = new THREE.Vector3(), _p4 = new THREE.Vector3(), _p5 = new THREE.Vector3(), _c1 = new THREE.Vector3(), _c2 = new THREE.Vector3();
const _dT = new THREE.Vector3(), _dL = new THREE.Vector3(), _lat = new THREE.Vector3(), _e = new THREE.Euler(0, 0, 0, 'YXZ');

let matSombra, geoSombra, matEstela, matBrillo;
function materiales(luz) {
  if (matSombra) return;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 4, 32, 32, 32);
  gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  matSombra = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, opacity: 0.5 });
  geoSombra = new THREE.PlaneGeometry(1, 1); geoSombra.rotateX(-Math.PI / 2);
  const c2 = document.createElement('canvas'); c2.width = c2.height = 64;
  const g2 = c2.getContext('2d'), gr2 = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr2.addColorStop(0, 'rgba(255,214,150,0.9)'); gr2.addColorStop(0.3, 'rgba(255,190,110,0.35)'); gr2.addColorStop(1, 'rgba(255,170,90,0)');
  g2.fillStyle = gr2; g2.fillRect(0, 0, 64, 64);
  matBrillo = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  matEstela = new THREE.ShaderMaterial({
    uniforms: { uNoche: luz.uNoche, uSolColor: luz.uSolColor, uAmbCielo: luz.uAmbCielo },
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: /* glsl */`attribute float alfa; varying float vA; void main() { vA = alfa; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform float uNoche; uniform vec3 uSolColor, uAmbCielo; varying float vA;
      void main() {
        vec3 c = (uSolColor * 0.5 + uAmbCielo) * 0.95;
        gl_FragColor = vec4(c, vA * mix(0.75, 0.5, uNoche));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

class Nave {
  constructor(av, escena, luz) {
    materiales(luz);
    this.id = av.id; this.tipo = av.tipo;
    Object.assign(this, crearAvion(av.tipo));
    this.sombra = new THREE.Mesh(geoSombra, matSombra); this.sombra.renderOrder = 3;
    this.brillo = new THREE.Sprite(matBrillo); this.brillo.scale.setScalar(1.5 * this.envergadura); this.brillo.renderOrder = 5; this.grupo.add(this.brillo);
    const geo = new THREE.BufferGeometry();
    this.posE = new Float32Array(N_ESTELA * 2 * 3); this.alfaE = new Float32Array(N_ESTELA * 2);
    geo.setAttribute('position', new THREE.BufferAttribute(this.posE, 3)); geo.setAttribute('alfa', new THREE.BufferAttribute(this.alfaE, 1));
    const idx = [];
    for (let i = 0; i < N_ESTELA - 1; i++) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    geo.setIndex(idx);
    this.estela = new THREE.Mesh(geo, matEstela); this.estela.frustumCulled = false; this.estela.renderOrder = 4;
    this.puntos = []; this.tEstela = 0;
    this.pos = new THREE.Vector3(); this.adelante = new THREE.Vector3(0, 0, 1);
    this.alabeo = 0; this.cabeceoSuave = 0; this.giroHelice = 0; this.aparicion = 0; this.enAire = false; this.altura = 0;
    this.rumbo = null;
    escena.add(this.grupo, this.sombra, this.estela);
  }
  quitar(escena) { escena.remove(this.grupo, this.sombra, this.estela); this.estela.geometry.dispose(); }
}

export class Vuelos {
  constructor(mundo) {
    this.mundo = mundo; this.naves = new Map();
    this.eventos = []; // despegues y aterrizajes vistos (para polvo y sonido)
  }

  // Tamaño de un avión en el mundo.
  escalaDe(nave, S) { return 0.3 * S / Math.sqrt(nave.envergadura); }

  // Geometría de un tramo: del aeropuerto «de» al aeropuerto «a», para el avión con casillas dadas.
  tramo(de, a, S, casDe, casA, nave) {
    const L = RADIO_CIUDAD * S * PISTA.medio, k = this.escalaDe(nave, S);
    const cDe = de.centroPista(S, _a), cA = a.centroPista(S, _b);
    const hacia = _c.subVectors(cA, cDe); hacia.y = 0;
    const dist = hacia.length(); hacia.normalize();
    _dT.copy(de.dirPista); if (_dT.dot(hacia) < 0) _dT.negate();
    _dL.copy(a.dirPista); if (_dL.dot(hacia) < 0) _dL.negate();
    const ruedas = nave.suelo * k;
    // casillas: corrimiento perpendicular a cada pista
    _lat.set(Math.sin(de.angulo), 0, Math.cos(de.angulo)).multiplyScalar(CASILLAS[casDe] * S);
    _p0.copy(cDe).addScaledVector(_dT, -L * 0.8).add(_lat); _p0.y += ruedas;
    _p1.copy(cDe).addScaledVector(_dT, L * 0.5); _p1.y += ruedas;
    _lat.set(Math.sin(a.angulo), 0, Math.cos(a.angulo)).multiplyScalar(CASILLAS[casA] * S);
    _p4.copy(cA).addScaledVector(_dL, -L * 0.8); _p4.y += ruedas;
    _p5.copy(cA).addScaledVector(_dL, L * 0.62).add(_lat); _p5.y += ruedas;
    const kc = limitar(dist * 0.36, 0.32 * S, 2.4 * S);
    _c1.copy(_p1).addScaledVector(_dT, kc); _c2.copy(_p4).addScaledVector(_dL, -kc);
    return { dist };
  }

  // Altura de crucero sobre la línea entre las dos pistas: pasa por arriba de lo que haya (la cordillera).
  crucero(clave, de, a, S) {
    const c = this.cacheAlt ??= new Map();
    let m = c.get(clave);
    if (m == null) {
      m = 0;
      for (let i = 1; i < 12; i++) { const t = i / 12; m = Math.max(m, this.mundo.relieve.y(mezclar(de.pos.x, a.pos.x, t), mezclar(de.pos.z, a.pos.z, t))); }
      c.set(clave, m);
    }
    const base = Math.max(de.pos.y, a.pos.y), dist = Math.hypot(a.pos.x - de.pos.x, a.pos.z - de.pos.z);
    return Math.max(0.24 * S + Math.min(0.5, dist * 0.045) * S, m - base + 0.2 * S + 0.12);
  }

  // Posición en el tramo para la fracción de vuelo f (0 a 1). Deja el resultado en «out» y devuelve la fase.
  enVuelo(f, durSeg, alt, out) {
    const fa = Math.min(0.22, 1.15 / durSeg), fr = Math.min(0.22, 1.35 / durSeg), fb = 1 - fr;
    if (f <= fa) { const s = (f / fa) ** 2; out.lerpVectors(_p0, _p1, s); return { fase: 'carrera', s }; }
    if (f >= fb) { const s = 1 - (1 - (f - fb) / fr) ** 2; out.lerpVectors(_p4, _p5, s); return { fase: 'frenada', s }; }
    const u = (f - fa) / (fb - fa), w = mezclar(u, u * u * (3 - 2 * u), 0.55), v = 1 - w;
    out.set(0, 0, 0).addScaledVector(_p1, v * v * v).addScaledVector(_c1, 3 * v * v * w).addScaledVector(_c2, 3 * v * w * w).addScaledVector(_p4, w * w * w);
    out.y = mezclar(_p1.y, _p4.y, w) + alt * (w < 0.5 ? suave(0, 0.4, w) : suave(1, 0.6, w));
    return { fase: 'aire', u };
  }

  sincronizar(s, frac, dt, tiempo, minPorSeg, corriendo) {
    const { mundo } = this, S = mundo.S, vistos = new Set();
    // casilla estable de cada avión en cada punta de su ruta
    const cuenta = {};
    for (const av of s.aviones) {
      const r = mundo.rutaDe(av.ruta); if (!r) continue;
      av._ca = (cuenta[r.a] = (cuenta[r.a] ?? -1) + 1) % CASILLAS.length;
      av._cb = (cuenta[r.b] = (cuenta[r.b] ?? -1) + 1) % CASILLAS.length;
    }
    for (const av of s.aviones) {
      const r = mundo.rutaDe(av.ruta); if (!r) continue;
      const de = mundo.ciudades.get(av.en), a = mundo.ciudades.get(av.hacia);
      if (!de || !a) continue;
      vistos.add(av.id);
      let n = this.naves.get(av.id);
      if (!n) { n = new Nave(av, mundo.escena, mundo.cielo.u); this.naves.set(av.id, n); this.eventos.push({ tipo: 'nuevo', nave: n, ciudad: de }); }
      n.aparicion = Math.min(1, n.aparicion + dt * 2.2);
      const k = this.escalaDe(n, S);
      const cas = (c) => (c.id === r.a ? av._ca : av._cb);
      let estado, pitch = 0, enAire = false, potencia = 0.25, vira = 0;
      if (av.fase === 'vuelo') {
        this.tramo(de, a, S, cas(de), cas(a), n);
        const durSeg = Math.max(2.5, av.dur / minPorSeg);
        const f = limitar(1 - (av.resta - frac) / av.dur);
        const alt = this.crucero(r.id, de, a, S);
        estado = this.enVuelo(f, durSeg, alt, n.pos);
        const D = 0.006;
        const e2 = this.enVuelo(Math.min(1, f + D), durSeg, alt, _d);
        if (estado.fase === 'aire') {
          if (e2.fase === 'aire' && _d.distanceToSquared(n.pos) > 1e-10) {
            n.adelante.subVectors(_d, n.pos).normalize();
            // cuánto vira: se mide sobre la trayectoria (no entre cuadros), así el alabeo no depende de los cuadros por segundo
            const e3 = this.enVuelo(Math.min(1, f + 2 * D), durSeg, alt, _c);
            if (e3.fase === 'aire') {
              let d = Math.atan2(_c.x - _d.x, _c.z - _d.z) - Math.atan2(n.adelante.x, n.adelante.z);
              while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
              vira = d / (D * durSeg);
            }
          }
          enAire = true; potencia = 1;
        } else if (estado.fase === 'carrera') { n.adelante.copy(_dT); pitch = n.cabeceo * (1 - suave(0.2, 0.8, estado.s)); potencia = 0.6 + 0.4 * estado.s; }
        else { n.adelante.copy(_dL); pitch = n.cabeceo * suave(0.3, 1, estado.s); potencia = 0.5 - 0.25 * estado.s; }
        if (estado.fase === 'aire' && !n.enAire) this.eventos.push({ tipo: 'despegue', nave: n, ciudad: de });
        if (estado.fase === 'frenada' && n.enAire) this.eventos.push({ tipo: 'toque', nave: n, ciudad: a });
      } else {
        // en tierra: llegó desde «hacia» (su próximo destino es volver): rueda hasta la cabecera, gira y espera
        this.tramo(de, a, S, cas(de), cas(a), n);
        const g = av.espera ? 1 : limitar(1 - (av.resta - frac) / Math.max(1, av.dur));
        // el punto donde frenó: como _p5 pero en esta ciudad (aterrizó en sentido contrario al despegue)
        const L = RADIO_CIUDAD * S * PISTA.medio;
        _d.copy(_p0).addScaledVector(_dT, L * 0.18);
        const ir = suave(0, 0.3, g), giro = suave(0.3, 0.72, g);
        n.pos.lerpVectors(_d, _p0, ir);
        const ang0 = Math.atan2(-_dT.x, -_dT.z), ang1 = ang0 + Math.PI;
        const ang = mezclar(ang0, ang1, n.v0 ? giro : 1);
        n.adelante.set(Math.sin(ang), 0, Math.cos(ang));
        pitch = n.cabeceo;
        potencia = av.espera ? 0.0 : 0.22;
        estado = { fase: 'tierra', g };
        if (!n.v0 && (av.v ?? 0) > 0) n.v0 = true;
      }
      if (av.fase === 'vuelo') n.v0 = true;
      n.enAire = enAire; n.fase = estado.fase; n.espera = av.espera ?? null;
      // orientación: rumbo, cabeceo y alabeo (según cuánto vira)
      const rumbo = Math.atan2(n.adelante.x, n.adelante.z);
      n.rumbo = rumbo;
      const objetivo = enAire ? limitar(-vira * 1.1, -0.8, 0.8) : 0;
      n.alabeo += (objetivo - n.alabeo) * Math.min(1, dt * 4);
      const cab = (enAire ? -Math.asin(limitar(n.adelante.y, -0.6, 0.6)) : 0) - pitch;
      n.cabeceoSuave += (cab - n.cabeceoSuave) * Math.min(1, dt * 7);
      _e.set(n.cabeceoSuave, rumbo, n.alabeo);
      n.grupo.quaternion.setFromEuler(_e);
      n.grupo.position.copy(n.pos);
      const ap = n.aparicion, rebote = ap < 1 ? ap * (1 + 0.6 * Math.sin(ap * Math.PI)) : 1;
      n.grupo.scale.setScalar(k * rebote);
      // hélices
      n.potencia = (n.potencia ?? 0) + (potencia - (n.potencia ?? 0)) * Math.min(1, dt * 2.5);
      n.giroHelice += dt * (4 + 46 * n.potencia) * (corriendo ? 1 : 0.4);
      for (const h of n.helices) { h.eje.rotation.z = n.giroHelice; h.disco.visible = n.potencia > 0.45; }
      // sombra en el suelo
      const ySuelo = Math.max(mundo.relieve.y(n.pos.x, n.pos.z) + 0.012, enAire ? 0 : n.pos.y - n.suelo * k + 0.004);
      n.altura = Math.max(0, n.pos.y - ySuelo);
      n.sombra.position.set(n.pos.x + mundo.cielo.u.uSolDir.value.x * -n.altura * 0.5, ySuelo, n.pos.z + mundo.cielo.u.uSolDir.value.z * -n.altura * 0.5);
      const tam = k * n.envergadura * (1.15 + n.altura * 0.5);
      n.sombra.scale.set(tam, 1, tam);
      n.sombra.visible = n.altura < 3;
      this.estelar(n, dt, k, enAire);
    }
    for (const [id, n] of this.naves) if (!vistos.has(id)) { n.quitar(mundo.escena); this.naves.delete(id); }
    if (matSombra) { matSombra.opacity = 0.5 * (1 - 0.6 * mundo.cielo.noche); matBrillo.opacity = 0.8 * mundo.cielo.noche; }
  }

  // Estela: una cinta que nace en la cola y se desvanece.
  estelar(n, dt, k, enAire) {
    n.tEstela += dt;
    const cola = _c.copy(n.pos).addScaledVector(n.adelante, -0.33 * k * n.envergadura);
    if (enAire && n.tEstela > 0.05) {
      n.tEstela = 0;
      n.puntos.unshift({ x: cola.x, y: cola.y, z: cola.z, e: 1 });
      if (n.puntos.length > N_ESTELA) n.puntos.pop();
    }
    for (const p of n.puntos) p.e -= dt * (enAire ? 0.62 : 1.6);
    while (n.puntos.length && n.puntos[n.puntos.length - 1].e <= 0) n.puntos.pop();
    const P = n.puntos, pos = n.posE, alfa = n.alfaE, ancho = 0.035 * k * n.envergadura + 0.004;
    const m = P.length;
    n.estela.visible = m > 1;
    if (m < 2) return;
    for (let i = 0; i < N_ESTELA; i++) {
      const j = Math.min(i, m - 1), p = i === 0 && enAire ? cola : P[j], q = P[Math.min(j + 1, m - 1)], o = P[Math.max(j - 1, 0)];
      let dx = q.x - o.x, dz = q.z - o.z; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      const w = ancho * (0.5 + 1.1 * (j / N_ESTELA));
      pos[i * 6] = p.x - dz * w; pos[i * 6 + 1] = p.y; pos[i * 6 + 2] = p.z + dx * w;
      pos[i * 6 + 3] = p.x + dz * w; pos[i * 6 + 4] = p.y; pos[i * 6 + 5] = p.z - dx * w;
      const e = i >= m ? 0 : Math.max(0, P[j].e) * Math.min(1, i / 2);
      alfa[i * 2] = alfa[i * 2 + 1] = e * e;
    }
    n.estela.geometry.attributes.position.needsUpdate = true; n.estela.geometry.attributes.alfa.needsUpdate = true;
  }
}
