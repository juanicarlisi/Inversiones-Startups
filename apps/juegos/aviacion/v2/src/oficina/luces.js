// La luz del despacho según la hora del juego. De día entra el sol por la ventana (un solo foco con sombra: la pared y las
// varillas de la ventana recortan el rayo), con polvo en el aire y luz que rebota; de noche, la lámpara, la luna y el faro
// de la base que pasa. Los colores salen del cielo del juego (cielo.js).
import * as THREE from 'three';
import { col, V, limitar, mezclar, suave } from './kit.js';

const _d = new THREE.Vector3(), _c = new THREE.Color();

export function crearLuces({ escena, renderer, plan, panos, zVidrio, lampara, cielo, q }) {
  const v = plan.ventana, centro = V(v.x, v.y, plan.fondo - 0.1);
  const grupo = new THREE.Group(); grupo.name = 'luces'; escena.add(grupo);

  // sol o luna por la ventana: un foco lejano (rayos casi paralelos) que solo alumbra lo que pasa por el hueco
  const sol = new THREE.SpotLight(0xffffff, 1, 0, Math.atan(Math.hypot(v.w, v.h) * 0.56 / 60), 0.04, 0);
  sol.castShadow = true; sol.shadow.mapSize.set(q.sombra, q.sombra); sol.shadow.camera.near = 52; sol.shadow.camera.far = 72;
  sol.shadow.bias = -0.0006; sol.shadow.normalBias = 0.012; sol.shadow.radius = q.sombra >= 2048 ? 3.2 : 2.2;
  grupo.add(sol, sol.target);
  // Pocas luces (cada una cuesta en cada píxel): el foco de la ventana, la lámpara (solo cuando está encendida), una luz
  // de relleno que hace de rebote del sol de día y de resplandor de la lámpara de noche, y la claridad general.
  const hemi = new THREE.HemisphereLight(0xffffff, 0x6b4a30, 0.4);
  const relleno = new THREE.PointLight(0xffffff, 0, 8, 1.4);
  const lamp = new THREE.SpotLight(col('#ffc98a'), 0, 5, 1.05, 0.75, 1.9);
  lamp.position.copy(lampara.boca); lamp.target.position.copy(lampara.boca).addScaledVector(lampara.abajo, 0.5);
  if (q.sombraLampara) { lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.camera.near = 0.05; lamp.shadow.camera.far = 4; lamp.shadow.bias = -0.002; lamp.shadow.radius = 4; }
  const posHalo = lampara.boca.clone().add(q.sinFocoLampara ? V(0.16, -0.02, 0.2) : V(0.1, 0.16, 0.3));
  grupo.add(hemi, relleno, lamp, lamp.target);
  let pasillo = null;      // en la primera entrada la luz de relleno alumbra el pasillo: { pos, fuerza }

  // ── rayo de luz: rebanadas del hueco de cada paño, corridas a lo largo del rayo ──
  const K = q.rebanadas, unidades = q.rayoPorPano ? panos : [0, 1].map((i) => { const ps = panos.slice(i * panos.length / 2, (i + 1) * panos.length / 2); return { x0: Math.min(...ps.map((p) => p.x0)), x1: Math.max(...ps.map((p) => p.x1)), y0: Math.min(...ps.map((p) => p.y0)), y1: Math.max(...ps.map((p) => p.y1)) }; });
  const nq = unidades.length * K, base = new Float32Array(nq * 12), uv = new Float32Array(nq * 8), av = new Float32Array(nq * 4), idx = [];
  let i = 0;
  for (const p of unidades) for (let k = 0; k < K; k++, i++) {
    const s = (k + 0.5) / K;
    base.set([p.x0, p.y0, zVidrio, p.x1, p.y0, zVidrio, p.x1, p.y1, zVidrio, p.x0, p.y1, zVidrio], i * 12);
    uv.set([0, 0, 1, 0, 1, 1, 0, 1], i * 8); av.set([s, s, s, s], i * 4);
    idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
  }
  const gRayo = new THREE.BufferGeometry();
  gRayo.setAttribute('position', new THREE.BufferAttribute(base, 3)); gRayo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); gRayo.setAttribute('avance', new THREE.BufferAttribute(av, 1)); gRayo.setIndex(idx);
  const uRayo = { uDir: { value: new THREE.Vector3(0, -0.5, 0.8) }, uLargo: { value: 4 }, uColor: { value: new THREE.Color() }, uFuerza: { value: 0 }, uTiempo: { value: 0 }, uRuido: cielo.u.uRuido, uPiso: { value: 0 } };
  const matRayo = new THREE.ShaderMaterial({
    uniforms: uRayo, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: /* glsl */`
      attribute float avance; uniform vec3 uDir; uniform float uLargo; varying vec2 vUv; varying float vA; varying vec3 vW;
      void main() { vUv = uv; vA = avance; vec3 p = position + uDir * (avance * uLargo); vW = p; gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uFuerza, uTiempo; uniform sampler2D uRuido; varying vec2 vUv; varying float vA; varying vec3 vW;
      void main() {
        float f = mix(0.2, 0.5, vA);            // el borde se ablanda a medida que el rayo se aleja del vidrio
        float m = smoothstep(0.0, f, vUv.x) * smoothstep(0.0, f, 1.0 - vUv.x) * smoothstep(0.0, f, vUv.y) * smoothstep(0.0, f, 1.0 - vUv.y);
        float humo = 0.86 + 0.28 * texture2D(uRuido, vW.xy * 0.16 + vec2(uTiempo * 0.006, vW.z * 0.11 - uTiempo * 0.004)).r;
        float a = m * pow(1.0 - vA, 1.2) * smoothstep(0.0, 0.05, vA) * humo * uFuerza * smoothstep(0.0, 0.25, vW.y);
        gl_FragColor = vec4(uColor * a, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const rayo = new THREE.Mesh(gRayo, matRayo); rayo.frustumCulled = false; rayo.renderOrder = 8; grupo.add(rayo);

  // ── polvo: brilla solo donde lo cruza el rayo ──
  const N = q.polvo, pp = new Float32Array(N * 3), fase = new Float32Array(N * 3);
  for (let k = 0; k < N; k++) {
    pp.set([-2.4 + Math.random() * 4.9, 0.25 + Math.random() * 2.4, plan.fondo + 0.1 + Math.random() * 4.6], k * 3);
    fase.set([Math.random() * 6.28, Math.random() * 6.28, 0.5 + Math.random()], k * 3);
  }
  const gPolvo = new THREE.BufferGeometry();
  gPolvo.setAttribute('position', new THREE.BufferAttribute(pp, 3)); gPolvo.setAttribute('fase', new THREE.BufferAttribute(fase, 3));
  const uPolvo = { uDir: uRayo.uDir, uColor: uRayo.uColor, uFuerza: { value: 0 }, uTiempo: uRayo.uTiempo, uAlto: { value: 720 }, uVentana: { value: new THREE.Vector4(v.x - v.w / 2, v.y - v.h / 2, v.x + v.w / 2, v.y + v.h / 2) }, uZ: { value: zVidrio } };
  const matPolvo = new THREE.ShaderMaterial({
    uniforms: uPolvo, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute vec3 fase; uniform vec3 uDir; uniform vec4 uVentana; uniform float uTiempo, uAlto, uZ; varying float vL;
      void main() {
        vec3 p = position;
        p.x += sin(uTiempo * 0.11 * fase.z + fase.x) * 0.22; p.z += cos(uTiempo * 0.09 * fase.z + fase.y) * 0.2;
        p.y = 0.25 + mod(p.y - 0.25 - uTiempo * 0.012 * fase.z + sin(uTiempo * 0.3 + fase.x) * 0.03, 2.4);
        // ¿está dentro del rayo? se lo lleva de vuelta hasta el vidrio siguiendo la luz
        float s = (p.z - uZ) / max(uDir.z, 0.05); vec3 o = p - uDir * s;
        float dentro = smoothstep(uVentana.x - 0.02, uVentana.x + 0.12, o.x) * smoothstep(uVentana.z + 0.02, uVentana.z - 0.12, o.x) * smoothstep(uVentana.y - 0.02, uVentana.y + 0.12, o.y) * smoothstep(uVentana.w + 0.02, uVentana.w - 0.12, o.y);
        vL = dentro * (0.55 + 0.45 * sin(uTiempo * (0.7 + fase.z) + fase.y * 3.0));
        vec4 mv = viewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
        gl_PointSize = min(uAlto * 0.0075, uAlto * 0.0095 * (0.6 + 0.6 * fase.z) / max(0.4, -mv.z));
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uFuerza; varying float vL;
      void main() { float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.2, d) * vL * uFuerza; if (a < 0.004) discard; gl_FragColor = vec4(uColor * a * 1.6, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const polvo = new THREE.Points(gPolvo, matPolvo); polvo.frustumCulled = false; polvo.renderOrder = 9; grupo.add(polvo);

  // ── reflejos: un cuartito de colores planos que se vuelve mapa de entorno (para el bronce y el barniz) ──
  const pmrem = new THREE.PMREMGenerator(renderer);
  const ent = new THREE.Scene();
  const caras = ['#000', '#000', '#000', '#000', '#000', '#000'].map((c) => new THREE.MeshBasicMaterial({ color: col(c), side: THREE.BackSide }));
  ent.add(new THREE.Mesh(new THREE.BoxGeometry(6, 3, 5), caras));             // +x, −x, +y, −y, +z, −z
  const matVentanaEnt = new THREE.MeshBasicMaterial({ color: 0xffffff }), matLampEnt = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const vent = new THREE.Mesh(new THREE.PlaneGeometry(v.w, v.h), matVentanaEnt); vent.position.set(v.x, v.y - 1.5, -2.45); ent.add(vent);
  const lampEnt = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), matLampEnt); lampEnt.position.set(lampara.boca.x, lampara.boca.y - 1.5, lampara.boca.z + 0.8); ent.add(lampEnt);
  let entorno = null, horaEntorno = -99;
  function rehacerEntorno(h, noche, dia) {
    if (Math.abs(h - horaEntorno) < 0.2) return;
    horaEntorno = h;
    const u = cielo.u, pared = col(plan.colores.pared), k = mezclar(0.36, 0.045, noche), calido = _c.copy(u.uSolColor.value).multiplyScalar(0.12 * dia);
    caras[0].color.copy(pared).multiplyScalar(k).add(calido); caras[1].color.copy(pared).multiplyScalar(k * 1.15).add(calido);
    caras[2].color.set('#efe9dc').multiplyScalar(k * 1.2).add(calido); caras[3].color.set('#8b5a36').multiplyScalar(k * 1.1).add(calido);
    caras[4].color.copy(pared).multiplyScalar(k * 0.9); caras[5].color.copy(pared).multiplyScalar(k * 0.8);
    matVentanaEnt.color.copy(u.uHoriz.value).lerp(u.uCenit.value, 0.4).multiplyScalar(mezclar(5.5, 1.2, noche));
    matLampEnt.color.set('#ffc98a').multiplyScalar(14 * suave(0.05, 0.4, noche));
    const nuevo = pmrem.fromScene(ent, 0.035, 0.1, 20);
    entorno?.dispose(); entorno = nuevo;
    escena.environment = entorno.texture;
  }

  const est = { noche: 0, dia: 1, lampara: 0, sol: new THREE.Vector3(), viaje: new THREE.Vector3() };
  let enfoque = 0;   // cuánta luz propia se le da a lo que se mira de cerca (para leer el mapa de noche)
  // hora: 0 a 24. destello: 0 a 1, el faro de la base apuntando a la ventana.
  function aplicar(hora, destello = 0, tiempo = 0, dt = 0.016, camara = null, cerca = 0) {
    cielo.fijarHora(hora);
    const u = cielo.u, n = cielo.noche, k = limitar((cielo.hora - 5.6) / 14);
    const hayDia = cielo.hora > 5.6 && cielo.hora < 19.6;
    // sol bajo, de invierno: el rayo cruza el escritorio a toda hora y al atardecer el disco se ve por la ventana
    const elev = Math.max(0.03, 0.56 * Math.sin(Math.PI * k) ** 1.6), az = mezclar(0.6, 0.22, k);
    const s = est.sol.set(Math.sin(az) * Math.cos(elev), Math.sin(elev), -Math.cos(az) * Math.cos(elev));
    const luna = _d.set(Math.sin(0.3) * Math.cos(0.21), Math.sin(0.21), -Math.cos(0.3) * Math.cos(0.21));
    const esLuna = n >= 0.62 || !hayDia;
    const dia = esLuna ? 0 : 1 - suave(0.3, 0.62, n), fLuna = esLuna ? suave(0.62, 0.86, n) : 0;
    u.uDiscoDir.value.copy(s); if (!hayDia) u.uDiscoDir.value.y = -0.4;
    u.uLunaDir.value.copy(luna);
    const pos = esLuna ? luna : s;
    u.uSolDir.value.copy(pos);
    est.viaje.copy(pos).negate();
    sol.position.copy(centro).addScaledVector(pos, 60); sol.target.position.copy(centro);
    // color: el del cielo del juego; de noche, luna tenue más el faro cuando pasa
    sol.color.copy(u.uSolColor.value);
    if (esLuna) sol.color.multiplyScalar(0.62 * fLuna).add(_c.set('#ffe9b8').multiplyScalar(1.5 * destello));
    else sol.color.multiplyScalar(0.74 * dia * mezclar(0.85, 1, Math.sin(Math.PI * k)));
    sol.intensity = Math.PI;
    // al amanecer y al atardecer el cuarto entero toma el color del horizonte
    const dorado = hayDia ? (1 - Math.sin(Math.PI * k)) ** 2 * (1 - suave(0.4, 0.8, n)) : 0;
    hemi.color.copy(u.uAmbCielo.value).lerp(_c.set('#fff1dc'), 0.5).lerp(_c.copy(u.uHoriz.value), 0.6 * dorado); hemi.groundColor.set('#7a5638').lerp(_c.copy(u.uAmbSuelo.value), 0.4);
    hemi.intensity = mezclar(2.1, 0.42, n) * (1 - 0.3 * dorado);
    // lámpara: se enciende al atardecer (apagada no entra en la cuenta de luces)
    const on = suave(0.04, 0.38, n);
    // (en el nivel bajo la lámpara no lleva foco propio: su luz la da el relleno, que de noche se para sobre la mesa)
    lamp.intensity = 7.5 * on; lamp.visible = on > 0.01 && !q.sinFocoLampara;
    // relleno: de día, donde el rayo toca el piso o el escritorio; de noche, alrededor de la lámpara
    const baja = -est.viaje.y, largo = Math.min(6.2, (v.y - 0.1) / Math.max(0.05, baja));
    if (pasillo) { relleno.position.copy(pasillo.pos); relleno.color.set('#ffd9a8'); relleno.intensity = pasillo.fuerza; }
    else {
      const wN = suave(0.25, 0.6, n);
      relleno.position.copy(centro).addScaledVector(est.viaje, Math.min(largo, 4.4)); relleno.position.y = Math.max(0.6, relleno.position.y + 0.5);
      relleno.position.lerp(posHalo, wN);
      relleno.color.copy(u.uSolColor.value).multiply(_c.set('#ffd9b0')).lerp(_c.set('#ffbf7a'), wN);
      relleno.intensity = mezclar(2.2 * dia * (1 + 1.2 * dorado), (q.sinFocoLampara ? 4.6 : 2.6) * on, wN) + 0.5 * destello;
    }
    lampara.matAf.emissiveIntensity = 0.5 * on; lampara.matAd.emissiveIntensity = 2.6 * on; lampara.matFoco.color.set('#ffe2b0').multiplyScalar(0.6 + 6 * on);
    // rayo y polvo
    uRayo.uDir.value.copy(est.viaje); uRayo.uLargo.value = Math.min(largo, 5.6) * 1.02; uRayo.uTiempo.value = tiempo;
    uRayo.uColor.value.copy(u.uSolColor.value).multiplyScalar(esLuna ? 0.9 : 0.62);
    // mirado de frente (la cámara dentro del rayo) las rebanadas se apilan y se notan: ahí el rayo baja y queda el resplandor
    const frente = camara ? Math.max(0, _d.copy(camara.position).sub(centro).normalize().dot(est.viaje)) : 0;
    // (y de cerca, mirando un objeto, el rayo se aparta: no tiene que velar lo que se está leyendo)
    uRayo.uFuerza.value = (0.52 * dia + 0.1 * fLuna + 0.2 * destello) * (1 - 0.8 * frente ** 3) * (1 - 0.8 * cerca) * q.rayo / Math.sqrt(K / 10);
    uPolvo.uFuerza.value = 1.5 * dia + 0.3 * fLuna + 0.8 * destello;
    est.noche = n; est.dia = dia; est.lampara = on;
    rehacerEntorno(cielo.hora, n, dia);
    escena.environmentIntensity = 1;
    enfoque = n;
  }
  function medir(altoPx) { uPolvo.uAlto.value = altoPx; }
  function liberar() { entorno?.dispose(); pmrem.dispose(); for (const c of caras) c.dispose(); matVentanaEnt.dispose(); matLampEnt.dispose(); ent.traverse((o) => o.geometry?.dispose()); }
  return { grupo, sol, lamp, aplicar, medir, liberar, est, fijarPasillo(p) { pasillo = p; }, get enfoque() { return enfoque; } };
}
