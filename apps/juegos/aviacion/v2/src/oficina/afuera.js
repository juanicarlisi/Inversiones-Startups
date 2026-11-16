// Lo que se ve por la ventana: el campo de aviación de la base, como maqueta. La pista con sus luces, los hangares, el faro
// que gira de noche, la manga de viento, un molino a lo lejos y los aviones de la flota que despegan. El cielo es el mismo
// del juego (cielo.js): misma hora, mismos colores.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Cielo } from '../mundo/cielo.js';
import { crearAvion } from '../mundo/aviones.js';
import { col, pos, rot, esc, tr, V, barra, azar, mezclar, limitar, suave, TAU, texturaMancha } from './kit.js';

const SUELO_Y = -7.4;      // el despacho está en el primer piso del edificio de la base
const ESCALA_AVION = 9;    // los modelos del juego miden ~1 de envergadura: acá, unos 9 metros

const VERT = /* glsl */`
  attribute vec3 color; varying vec3 vC; varying vec3 vN; varying vec3 vW; varying float vD;
  void main() { vC = color; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vD = -mv.z; gl_Position = projectionMatrix * mv; }`;
const LUZ = /* glsl */`
  uniform vec3 uSolDir, uSolColor, uAmbCielo, uAmbSuelo, uNiebla; uniform float uNoche;
  vec3 iluminar(vec3 base, vec3 n) {
    float nl = max(dot(n, uSolDir), 0.0);
    vec3 luz = uSolColor * (nl * 0.95 + 0.06) + mix(uAmbSuelo, uAmbCielo, n.y * 0.5 + 0.5) * 1.05;
    return base * luz;
  }
  vec3 niebla(vec3 c, float d) { return mix(c, uNiebla, (1.0 - exp(-d * 0.0012)) * 0.86); }`;

export function crearAfuera({ plan, tipos = ['golondrina'], vuelaDeNoche = false, densidad = 1 }) {
  const cielo = new Cielo(), u = cielo.u;
  const raiz = new THREE.Group(); raiz.name = 'afuera';
  const cupula = cielo.cupula; cupula.removeFromParent(); raiz.add(cupula);
  const g = new THREE.Group(); g.position.y = SUELO_Y; raiz.add(g);
  const zr = plan.fondo - 74, anchoPista = 28;        // la pista corre de este a oeste, frente a la ventana
  const cx = plan.ventana.x;                          // todo se ordena alrededor de lo que enmarca la ventana
  const unis = { uSolDir: u.uSolDir, uSolColor: u.uSolColor, uAmbCielo: u.uAmbCielo, uAmbSuelo: u.uAmbSuelo, uNiebla: u.uNiebla, uNoche: u.uNoche };

  // el campo: pasto con manchas, franjas de corte junto a la pista y parcelas a lo lejos
  const matSuelo = new THREE.ShaderMaterial({
    uniforms: { ...unis, uRuido: u.uRuido, uPista: { value: new THREE.Vector2(zr, anchoPista / 2) } },
    vertexShader: /* glsl */`varying vec3 vW; varying float vD; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uRuido; uniform vec2 uPista; varying vec3 vW; varying float vD;
      ${LUZ}
      float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 p = vW.xz;
        float n = texture2D(uRuido, p * 0.006).r, n2 = texture2D(uRuido, p * 0.045).b;
        vec3 pasto = mix(vec3(0.2, 0.36, 0.085), vec3(0.36, 0.5, 0.13), n);
        pasto *= 0.9 + 0.2 * n2;
        // franjas de corte cerca de la pista
        float cerca = 1.0 - smoothstep(30.0, 70.0, abs(p.y - uPista.x));
        pasto *= 1.0 + 0.07 * cerca * sign(sin(p.x * 0.35));
        // parcelas a lo lejos: trigo, tierra arada, alfalfa
        vec2 celda = floor(vec2(p.x + 37.0 * floor(p.y / 90.0), p.y) / vec2(140.0, 90.0));
        float k = h21(celda);
        vec3 parcela = k < 0.3 ? vec3(0.6, 0.46, 0.14) : k < 0.5 ? vec3(0.34, 0.22, 0.12) : k < 0.8 ? vec3(0.2, 0.4, 0.09) : vec3(0.42, 0.52, 0.14);
        float lejos = smoothstep(190.0, 260.0, uPista.x - p.y);
        vec3 c = mix(pasto, parcela * (0.9 + 0.2 * n2), lejos * 0.85);
        c = iluminar(c, vec3(0.0, 1.0, 0.0));
        gl_FragColor = vec4(niebla(c, vD), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(3200, 1900).rotateX(-Math.PI / 2), matSuelo);
  suelo.position.set(cx + 150, 0, zr - 600); g.add(suelo);

  // lo construido: una sola malla con color por vértice
  const mat = new THREE.ShaderMaterial({
    uniforms: unis, vertexShader: VERT,
    fragmentShader: /* glsl */`varying vec3 vC; varying vec3 vN; varying float vD; ${LUZ}
      void main() { vec3 c = iluminar(vC, normalize(vN)); gl_FragColor = vec4(niebla(c, vD), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const piezas = [], luces = [];
  const mas = (lista, geo, color, m) => {
    const x = geo.index ? geo.toNonIndexed() : geo; if (m) x.applyMatrix4(m);
    for (const k of Object.keys(x.attributes)) if (k !== 'position' && k !== 'normal') x.deleteAttribute(k);
    const c = col(color), n = x.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
    x.setAttribute('color', new THREE.BufferAttribute(a, 3)); lista.push(x);
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  // Lo que se ve desde la puerta por la ventana va sobre una línea que se abre hacia la derecha: a «d» metros del vidrio,
  // el centro de la vista cae en lx(d). Todo se acomoda sobre esa línea para que la ventana tenga algo en cada plano.
  const lx = (d) => cx + 0.3 * d, D = (d) => plan.fondo - d;
  // pista, márgenes y marcas
  mas(piezas, B(1400, 0.1, anchoPista + 10), '#b9a878', pos(cx, 0.0, zr));
  mas(piezas, B(1400, 0.1, anchoPista), '#4f525c', pos(cx, 0.06, zr));
  for (let i = -28; i <= 28; i++) mas(piezas, B(13, 0.04, 1.1), '#f4f1e6', pos(cx + i * 24, 0.13, zr));
  for (const s of [-1, 1]) mas(piezas, B(1400, 0.04, 0.6), '#f4f1e6', pos(cx, 0.13, zr + s * (anchoPista / 2 - 1.4)));
  // calle de rodaje y plataforma frente a los hangares
  mas(piezas, B(14, 0.1, 62), '#a59f88', pos(lx(120) - 30, 0.03, zr - anchoPista / 2 - 31));
  mas(piezas, B(130, 0.1, 34), '#b0a98f', pos(lx(170) - 34, 0.03, D(166)));
  // luces de pista (de noche se ven desde la ventana)
  for (let i = -24; i <= 24; i++) for (const s of [-1, 1]) mas(luces, new THREE.SphereGeometry(0.42, 6, 5), '#ffe2a0', pos(cx + i * 22, 0.45, zr + s * (anchoPista / 2 + 1.5)));
  // hangares de techo curvo (el de la base, dorado)
  const hangar = (x, z, r, largo, techo) => {
    const arco = new THREE.CylinderGeometry(r, r, largo, 22, 1, false, 0, Math.PI); arco.rotateZ(Math.PI / 2); arco.rotateY(Math.PI / 2);
    mas(piezas, arco, techo, pos(x, 0, z));
    mas(piezas, new THREE.CircleGeometry(r * 0.96, 22, 0, Math.PI), '#f3ead6', pos(x, 0, z + largo / 2 + 0.06));
    mas(piezas, B(r * 1.25, r * 0.56, 0.3), '#2c2a2e', pos(x, r * 0.28, z + largo / 2 + 0.1));
    mas(luces, B(r * 1.1, 0.5, 0.2), '#ffcf7a', pos(x, r * 0.62, z + largo / 2 + 0.3));
    mas(piezas, B(r * 2.04, 1.2, largo), '#e8dcc2', pos(x, 0.6, z));
  };
  hangar(lx(196) - 22, D(196), 10, 28, '#d2a640');
  hangar(lx(204) - 50, D(204), 8, 22, '#a9483a');
  // edificio bajo de la estación
  mas(piezas, B(22, 5, 9), '#f2ead8', pos(lx(210) + 34, 2.5, D(210)));
  mas(piezas, B(23.5, 0.7, 10.5), '#b5523a', pos(lx(210) + 34, 5.3, D(210)));
  for (let i = -3; i <= 3; i++) mas(luces, B(1.2, 1.5, 0.2), '#ffd27a', pos(lx(210) + 34 + i * 3, 2.7, D(210) + 4.6));
  // faro de la base: torre blanca, gorro rojo y linterna
  const fx = lx(150) + 13, fz = D(150), fAlto = 15;
  mas(piezas, new THREE.CylinderGeometry(0.8, 1.3, fAlto, 10), '#f0e9da', pos(fx, fAlto / 2, fz));
  mas(piezas, new THREE.CylinderGeometry(1.9, 1.2, 1.5, 10), '#b5483a', pos(fx, fAlto + 0.75, fz));
  mas(piezas, new THREE.ConeGeometry(1.45, 1.5, 10), '#b5483a', pos(fx, fAlto + 3.55, fz));
  for (let k = 0; k < 4; k++) mas(piezas, barra(V(fx + Math.cos(k * TAU / 4) * 1.05, fAlto + 1.5, fz + Math.sin(k * TAU / 4) * 1.05), V(fx + Math.cos(k * TAU / 4) * 1.05, fAlto + 2.8, fz + Math.sin(k * TAU / 4) * 1.05), 0.09, 4), '#2c2a2e');
  mas(luces, new THREE.SphereGeometry(0.8, 10, 8), '#fff0c0', pos(fx, fAlto + 2.15, fz));
  // molino de viento y casco de estancia, a lo lejos
  const mx = lx(340) - 6, mz = D(340);
  for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + 0.78; mas(piezas, barra(V(mx + Math.cos(a) * 2.6, 0, mz + Math.sin(a) * 2.6), V(mx + Math.cos(a) * 0.4, 15, mz + Math.sin(a) * 0.4), 0.2, 4), '#6a6866'); }
  mas(piezas, B(14, 4.4, 8), '#f2ead8', pos(mx + 30, 2.2, mz - 6)); mas(piezas, B(15.5, 2, 9.4), '#b5523a', pos(mx + 30, 5.2, mz - 6));
  // árboles: montes redondos y cortinas de álamos, como en las ciudades del mapa
  const r = azar(88), verdes = ['#3f7a3a', '#4f8a3c', '#2f6a3a', '#5c9442'];
  const nArb = Math.round(110 * densidad);
  for (let i = 0; i < nArb; i++) {
    const d = 235 + r() * r() * 420, x = lx(d) - 330 + r() * 660, z = D(d), alamo = r() < 0.35;
    if (alamo) { const h = 13 + r() * 9; mas(piezas, new THREE.ConeGeometry(1.7 + r() * 0.6, h, 6), verdes[Math.floor(r() * 4)], pos(x, h / 2 + 1.2, z)); }
    else { const t = 5 + r() * 4.5; mas(piezas, new THREE.IcosahedronGeometry(t, 1), verdes[Math.floor(r() * 4)], tr(pos(x, t * 0.95, z), esc(1.2, 0.85, 1.05))); mas(piezas, new THREE.CylinderGeometry(0.45, 0.55, t, 5), '#5a4030', pos(x, t * 0.4, z)); }
  }
  for (let i = 0; i < 11; i++) { const h = 15 + r() * 5; mas(piezas, new THREE.ConeGeometry(1.9, h, 6), verdes[i % 4], pos(lx(228) + 26 + i * 4.6, h / 2 + 1.2, D(228) - (i % 2) * 1.5)); }
  // manga de viento: el poste (la manga va aparte, se mueve)
  const vx = lx(104) + 7.5, vz = D(104);
  mas(piezas, new THREE.CylinderGeometry(0.12, 0.16, 8, 6), '#e9e4d6', pos(vx, 4, vz));
  const construido = new THREE.Mesh(mergeGeometries(piezas, false), mat); g.add(construido);
  for (const x of piezas) x.dispose();
  const matLuces = new THREE.MeshBasicMaterial({ vertexColors: true });
  const mallaLuces = new THREE.Mesh(mergeGeometries(luces, false), matLuces); g.add(mallaLuces);
  for (const x of luces) x.dispose();

  // manga de viento
  const gm = [];
  for (let k = 0; k < 4; k++) { const cono = new THREE.CylinderGeometry(0.55 - k * 0.09, 0.64 - k * 0.09, 0.75, 8, 1, true); cono.rotateZ(Math.PI / 2); mas(gm, cono, k % 2 ? '#f2ede0' : '#f0642c', pos(0.4 + k * 0.75, 0, 0)); }
  const manga = new THREE.Mesh(mergeGeometries(gm, false), mat.clone()); manga.material.side = THREE.DoubleSide; manga.material.uniforms = unis;
  for (const x of gm) x.dispose();
  manga.position.set(vx, 7.8, vz); g.add(manga);
  // rueda del molino
  const gr = [];
  for (let k = 0; k < 12; k++) { const pala = B(0.5, 2.3, 0.06); mas(gr, pala, '#c9ced6', tr(rot(0, 0, k / 12 * TAU), pos(0, 1.55, 0), rot(0, 0.5, 0))); }
  const rueda = new THREE.Mesh(mergeGeometries(gr, false), mat); rueda.position.set(mx, 15.4, mz + 0.6); rueda.scale.setScalar(1.25); g.add(rueda);
  for (const x of gr) x.dispose();

  // haces del faro
  const matHaz = new THREE.MeshBasicMaterial({ color: col('#ffe9b8'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const haz = new THREE.Group(); haz.position.set(fx, fAlto + 2.25, fz);
  for (const s of [0, Math.PI]) {
    const gh = new THREE.PlaneGeometry(240, 9, 1, 1); gh.translate(120, 0, 0);
    const P = gh.attributes.position; for (let i = 0; i < P.count; i++) if (P.getX(i) < 1) P.setY(i, P.getY(i) * 0.12);
    const m1 = new THREE.Mesh(gh, matHaz); m1.rotation.y = s; haz.add(m1);
    const m2 = new THREE.Mesh(gh, matHaz); m2.rotation.set(Math.PI / 2, s, 0, 'YXZ'); haz.add(m2);
  }
  g.add(haz);
  const texDestello = texturaMancha(64);
  const matDestello = new THREE.SpriteMaterial({ map: texDestello, color: col('#fff1cc'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const destello = new THREE.Sprite(matDestello); destello.position.set(fx, fAlto + 2.25, fz); g.add(destello);

  // aviones: materiales propios (los del juego no se tocan) y geometría copiada (la del juego queda en su caché)
  const matAvion = mat, matAvionLuz = new THREE.MeshBasicMaterial({ vertexColors: true });
  const matPala = new THREE.MeshBasicMaterial({ color: col('#241c18') });
  const matDisco = new THREE.MeshBasicMaterial({ color: col('#d8dde6'), transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  function avionDeAfuera(tipo) {
    const a = crearAvion(tipo);
    let i = 0;
    const discos = new Set(a.helices.map((h) => h.disco));
    a.grupo.traverse((o) => { o.renderOrder = 40; });
    a.grupo.traverse((o) => { if (!o.isMesh) return; o.geometry = o.geometry.clone(); o.material = discos.has(o) ? matDisco : o.parent === a.grupo ? (i++ === 0 ? matAvion : matAvionLuz) : matPala; });
    a.grupo.scale.setScalar(ESCALA_AVION);
    return a;
  }
  // uno estacionado frente al hangar
  const quieto = avionDeAfuera(tipos[0] ?? 'golondrina');
  quieto.grupo.position.set(lx(152) - 9, quieto.suelo * ESCALA_AVION + 0.1, D(152)); quieto.grupo.rotation.set(-quieto.cabeceo, 2.5, 0, 'YXZ');
  for (const h of quieto.helices) h.disco.visible = false;
  g.add(quieto.grupo);
  // el que despega: entra despacio a la parte de pista que enmarca la ventana, acelera, se va, y un rato después cruza
  // el cielo a lo lejos, ya virando. Así se lo ve dos veces y sin apuro (por la ventana se ve un tramo corto de pista).
  let vuelo = null, espera = 3.5, turno = 0;
  const flota = tipos.length ? tipos : ['golondrina'];
  const x74 = lx(74), camino = new THREE.CatmullRomCurve3([
    V(x74 - 24, 0, zr), V(x74 + 4, 0, zr), V(x74 + 60, 0, zr), V(x74 + 120, 4, zr), V(x74 + 250, 12, zr - 16), V(x74 + 372, 18, zr - 100),
    V(x74 + 356, 23, zr - 200), V(lx(300) + 46, 27, D(300)), V(lx(330) - 110, 33, D(330)), V(lx(380) - 330, 46, D(380)),      // bajo: tiene que verse dentro de la ventana
  ], false, 'centripetal');
  const largoCamino = camino.getLength(), ACEL = 1.9, VMAX = 27, T_ACEL = VMAX / ACEL, S_ACEL = 0.5 * ACEL * T_ACEL * T_ACEL;
  const _t = new THREE.Vector3(), _t2 = new THREE.Vector3(), _m = new THREE.Matrix4(), _lado = new THREE.Vector3(), _arr = new THREE.Vector3(), _q = new THREE.Quaternion();
  function despegar() {
    const a = avionDeAfuera(flota[turno++ % flota.length]);
    for (const h of a.helices) h.eje.children.forEach((c) => { if (c !== h.disco) c.visible = false; });
    g.add(a.grupo);
    vuelo = { a, t: 0, inclina: 0 };
    moverVuelo(0);
  }
  function moverVuelo(dt) {
    const v = vuelo, a = v.a; v.t += dt;
    const rec = v.t < T_ACEL ? 0.5 * ACEL * v.t * v.t : S_ACEL + (v.t - T_ACEL) * VMAX, u = rec / largoCamino;
    if (u >= 1) { g.remove(a.grupo); a.grupo.traverse((o) => o.geometry?.dispose()); vuelo = null; espera = 9 + Math.random() * 10; return; }
    camino.getPointAt(u, a.grupo.position); camino.getTangentAt(u, _t); camino.getTangentAt(Math.min(1, u + 0.012), _t2);
    const alto = a.grupo.position.y, enAire = suave(0.2, 3.5, alto), colaArriba = suave(4, 10, v.t);
    // se inclina hacia adentro del viraje
    const giro = Math.atan2(_t.x * _t2.z - _t.z * _t2.x, _t.x * _t2.x + _t.z * _t2.z);
    v.inclina += (limitar(giro * 9, -0.6, 0.6) - v.inclina) * Math.min(1, dt * 1.5);
    _arr.set(0, 1, 0); _lado.crossVectors(_arr, _t).normalize(); _arr.crossVectors(_t, _lado).normalize();
    _m.makeBasis(_lado, _arr, _t); a.grupo.quaternion.setFromRotationMatrix(_m);
    a.grupo.quaternion.multiply(_q.setFromAxisAngle(V(0, 0, 1), -v.inclina));
    a.grupo.quaternion.multiply(_q.setFromAxisAngle(V(1, 0, 0), -(mezclar(a.cabeceo, 0, colaArriba) * (1 - enAire) + enAire * 0.05)));
    a.grupo.position.y += a.suelo * ESCALA_AVION + 0.1;
    for (const h of a.helices) h.eje.rotation.z += dt * 40;
  }

  let ang = 0;
  const estado = { destello: 0 };
  function actualizar(dt, tiempo, camara) {
    const noche = cielo.noche;
    cupula.position.copy(camara.position);
    matLuces.color.setScalar(mezclar(0.4, 3.6, noche));
    matAvionLuz.color.setScalar(mezclar(0.9, 3.4, noche));
    manga.rotation.y = 0.25 + Math.sin(tiempo * 0.7) * 0.12 + Math.sin(tiempo * 1.9) * 0.05; manga.rotation.z = -0.1 + Math.sin(tiempo * 2.6) * 0.04;
    rueda.rotation.z -= dt * 1.4;
    // faro: gira siempre; de noche se ven los haces y, cuando apunta a la ventana, encandila un instante
    ang += dt * 0.95; haz.rotation.y = ang;
    matHaz.opacity = 0.34 * suave(0.5, 0.95, noche);
    const haciaVentana = Math.atan2(-(camara.position.z - fz), camara.position.x - fx);   // rotation.y que apunta a la cámara
    let d = ((ang - haciaVentana) % Math.PI + Math.PI) % Math.PI; if (d > Math.PI / 2) d -= Math.PI;
    estado.destello = Math.exp(-(d * d) / 0.012) * suave(0.5, 0.95, noche);
    matDestello.opacity = Math.min(1, 0.35 * noche + estado.destello); destello.scale.setScalar(6 + 26 * estado.destello);
    // despegues: de día siempre; de noche, solo si alguna ruta tiene luces
    if (vuelo) moverVuelo(dt);
    else { espera -= dt; if (espera <= 0) { if (noche < 0.6 || vuelaDeNoche) despegar(); else espera = 6; } }
  }
  // Todo lo de afuera se dibuja después de lo de adentro: así solo se pinta lo que asoma por la ventana.
  raiz.traverse((o) => { if (o.isMesh && o !== cupula) o.renderOrder = 40; });
  function liberar() { cielo.sol.dispose?.(); texDestello.dispose(); }
  return { raiz, cielo, actualizar, estado, liberar, lanzar() { if (!vuelo) despegar(); }, get vuelo() { return vuelo; } };
}
