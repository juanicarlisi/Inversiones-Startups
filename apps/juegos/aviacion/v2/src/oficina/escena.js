// Arma el despacho entero: cuarto, muebles, mapa, lo de afuera, luces y cámara. No sabe nada de la interfaz: recibe datos
// y devuelve qué objeto hay bajo el cursor, dónde va cada rótulo y cómo acercarse a cada cosa.
import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, ToneMappingEffect, ToneMappingMode, VignetteEffect, SMAAEffect, TiltShiftEffect, KernelSize } from 'postprocessing';
import { crearAvion } from '../mundo/aviones.js';
import { crearMateriales, material, soltar, col, V, limitar, mezclar, suave, azar, texturaMancha, TAU } from './kit.js';
import { planDe, crearCuarto, crearFrente } from './cuarto.js';
import * as Mu from './muebles.js';
import { crearMapaPared } from './mapa-pared.js';
import { crearAfuera } from './afuera.js';
import { crearLuces } from './luces.js';

export const NIVELES_OFICINA = {
  alto: { nombre: 'alto', dpr: 2, sombra: 2048, sombraLampara: true, pos: true, msaa: 4, rebanadas: 16, rayoPorPano: true, polvo: 420, mapa: 1024, rayo: 1, arboles: 1, foco: false },
  medio: { nombre: 'medio', dpr: 1.5, sombra: 1024, sombraLampara: false, pos: true, msaa: 0, rebanadas: 10, rayoPorPano: true, polvo: 240, mapa: 896, rayo: 1, arboles: 0.8, foco: false },
  bajo: { nombre: 'bajo', dpr: 1, sombra: 1024, sombraDura: true, sombraLampara: false, sinFocoLampara: true, pos: false, msaa: 0, rebanadas: 5, rayoPorPano: false, polvo: 90, mapa: 640, rayo: 1.2, arboles: 0.5, foco: false },
};
const FUENTE = `'Fraunces', Georgia, 'Times New Roman', serif`;
const facil = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _caja = new THREE.Box3(), _rayo = new THREE.Raycaster(), _p2 = new THREE.Vector2();

export function crearEscena({ lienzo, q, vertical, t, datos, hora }) {
  const plan = planDe(vertical), C = plan.colores;
  const r = new THREE.WebGLRenderer({ canvas: lienzo, antialias: false, powerPreference: 'high-performance', stencil: false, depth: true });
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.shadowMap.enabled = true; r.shadowMap.type = q.sombraDura ? THREE.BasicShadowMap : THREE.PCFShadowMap; r.shadowMap.autoUpdate = false;
  const escena = new THREE.Scene(); escena.background = col('#0b1222');
  const camara = new THREE.PerspectiveCamera(40, 1, 0.08, 1600);
  const mats = crearMateriales(q.nombre);
  const empresa = { nombre: datos.empresa?.nombre ?? '', color: datos.empresa?.color || '#cf3f2c' };
  const propios = [];        // texturas y materiales sueltos que no cuelgan de la escena

  // ── cuarto y muebles ──
  const cuarto = crearCuarto(mats, plan, empresa.color); escena.add(cuarto.grupo);
  const E = plan.escritorio, k = E.w / 1.92;
  const escritorio = Mu.crearEscritorio(mats, C, E.w, E.d, { cx: -0.3 * k, cz: -0.02 });
  escritorio.grupo.position.set(E.x, 0, E.z); escena.add(escritorio.grupo);
  const mesa = new THREE.Group(); mesa.position.set(E.x, escritorio.alto, E.z); escena.add(mesa);   // todo lo que apoya en la tapa
  const sillon = Mu.crearSillon(mats, C); sillon.grupo.position.set(E.x + 0.12, 0, E.z - 0.82); sillon.grupo.rotation.y = 0.32; escena.add(sillon.grupo);
  const lampara = Mu.crearLampara(mats); lampara.grupo.position.set(-0.74 * k, 0, -0.27); lampara.grupo.rotation.y = -0.62; mesa.add(lampara.grupo);
  const telegrafo = Mu.crearTelegrafo(mats, C); telegrafo.grupo.position.set(vertical ? 0.1 : 0.52 * k, 0, vertical ? -0.33 : -0.27); telegrafo.grupo.rotation.y = -0.2; mesa.add(telegrafo.grupo);
  const libro = Mu.crearLibro(mats, empresa.color); libro.grupo.position.set(-0.3 * k, 0.006, -0.02); libro.grupo.rotation.y = 0.04; mesa.add(libro.grupo);
  const bandeja = Mu.crearBandeja(mats); bandeja.grupo.position.set(vertical ? 0.52 : 0.68 * k, 0, vertical ? -0.06 : 0.14); bandeja.grupo.rotation.y = -0.1; mesa.add(bandeja.grupo);
  const placa = Mu.crearPlaca(mats, C, empresa.color); placa.grupo.position.set(0, 0, E.d / 2 - 0.06); mesa.add(placa.grupo);
  const cuaderno = Mu.crearCuaderno(mats, (datos.cuaderno ?? []).length); cuaderno.grupo.position.set(vertical ? 0.56 : 0.3 * k, 0, vertical ? 0.3 : 0.13); cuaderno.grupo.rotation.y = -0.22; mesa.add(cuaderno.grupo);
  const mate = Mu.crearMate(mats); mate.grupo.position.set(-0.84 * k, 0, 0.12); mate.grupo.rotation.y = 0.8; mesa.add(mate.grupo);
  const tintero = Mu.crearTintero(mats); tintero.grupo.position.set(vertical ? -0.42 : 0.1 * k, 0, vertical ? -0.4 : -0.32); tintero.grupo.rotation.y = 0.15; mesa.add(tintero.grupo);
  // en la pared
  const zp = plan.fondo;
  const reloj = Mu.crearReloj(mats, C, FUENTE); reloj.grupo.position.set(plan.reloj.x, plan.reloj.y, zp); escena.add(reloj.grupo);
  const almanaque = Mu.crearAlmanaque(mats); almanaque.grupo.position.set(plan.calendario.x, plan.calendario.y, zp); escena.add(almanaque.grupo);
  let estantes = null;      // las tablas se arman con la flota (más aviones, más tablas)
  const mapa = crearMapaPared(mats, C, { ancho: plan.mapa.w, epoca: datos.hoy?.epoca ?? 1929, resolucion: q.mapa, altoMax: vertical ? 1.2 : 1.42 });
  mapa.grupo.position.set(plan.mapa.x, plan.mapa.y, zp); escena.add(mapa.grupo);
  if (!vertical) { const p = Mu.crearPerchero(mats, C); p.grupo.position.set(plan.ancho / 2 - 0.42, 0, zp + 0.42); p.grupo.rotation.y = 2.2; escena.add(p.grupo); }

  // sombras de apoyo bajo lo que está sobre la mesa (dan peso aunque no pegue el sol)
  const texSombra = texturaMancha(64); propios.push(texSombra);
  const matSombra = new THREE.MeshBasicMaterial({ map: texSombra, color: 0x000000, transparent: true, opacity: 0.34, depthWrite: false }); propios.push(matSombra);
  const apoyo = (padre, x, z, w, d, giro = 0, y = 0.0012) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), matSombra); m.position.set(x, y, z); m.rotation.y = giro; m.renderOrder = 2; padre.add(m); return m; };
  apoyo(mesa, libro.grupo.position.x, libro.grupo.position.z, 0.78, 0.56); apoyo(mesa, bandeja.grupo.position.x, bandeja.grupo.position.z, 0.52, 0.42);
  apoyo(mesa, lampara.grupo.position.x, lampara.grupo.position.z, 0.32, 0.32); apoyo(mesa, telegrafo.grupo.position.x, telegrafo.grupo.position.z, 0.52, 0.34, -0.2);
  apoyo(mesa, placa.grupo.position.x, placa.grupo.position.z, 0.56, 0.2); apoyo(mesa, cuaderno.grupo.position.x, cuaderno.grupo.position.z, 0.26, 0.32, -0.22);
  apoyo(mesa, mate.grupo.position.x, mate.grupo.position.z, 0.16, 0.16); apoyo(mesa, tintero.grupo.position.x, tintero.grupo.position.z, 0.2, 0.14);
  const sombraPiso = apoyo(escena, E.x, E.z + 0.05, E.w + 0.7, E.d + 0.9, 0, 0.012); sombraPiso.material = matSombra.clone(); sombraPiso.material.opacity = 0.42; propios.push(sombraPiso.material);

  // resplandor que se posa detrás de lo que se señala (más barato que otra luz y se ve mejor)
  const matResplandor = new THREE.SpriteMaterial({ map: texSombra, color: col('#ffd9a0'), transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }); propios.push(matResplandor);
  const resplandor = new THREE.Sprite(matResplandor); resplandor.renderOrder = 7; resplandor.visible = false; escena.add(resplandor);

  const adelante = (obj) => obj.traverse((o) => { if (o.isMesh && !(Array.isArray(o.material) ? o.material[0] : o.material).transparent && o.renderOrder === 0) o.renderOrder = -2; });

  // ── aviones de la flota en el estante ──
  const matAvion = material({ vertexColors: true, roughness: 0.42, metalness: 0.1 });
  const matAvionLuz = new THREE.MeshBasicMaterial({ vertexColors: true });
  const matPala = material({ color: col('#3a2a20'), roughness: 0.6 });
  const matDisco = new THREE.MeshBasicMaterial({ color: col('#d8dde6'), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  propios.push(matAvion, matAvionLuz, matPala, matDisco);
  function modeloAvion(tipo) {
    const a = crearAvion(tipo), discos = new Set(a.helices.map((h) => h.disco));
    let i = 0;
    a.grupo.traverse((o) => {
      if (!o.isMesh) return;
      const tramos = o.geometry.userData?.empresa;
      o.geometry = o.geometry.clone();     // la del juego queda en su caché, sin atarse a este renderizador
      if (tramos) {                        // la librea lleva el color de la empresa que muestra la oficina (también mientras se lo prueba)
        const at = o.geometry.attributes.color, c = col(empresa.color);
        for (const [desde, n] of tramos) for (let j = desde; j < desde + n; j++) at.setXYZ(j, c.r, c.g, c.b);
      }
      o.material = discos.has(o) ? matDisco : o.parent === a.grupo ? (i++ === 0 ? matAvion : matAvionLuz) : matPala;
      o.castShadow = !discos.has(o);
    });
    return a;
  }
  const flota = new THREE.Group(); flota.position.set(plan.estante.x, 0, zp); escena.add(flota);
  let naves = [], giroHelices = 0;
  function ponerFlota(lista) {
    for (const o of [...flota.children]) { flota.remove(o); soltar(o); }
    if (estantes) { escena.remove(estantes.grupo); soltar(estantes.grupo); }
    naves = [];
    const n = lista.length, ys = plan.estante.filas(n), porFila = Math.max(vertical ? 4 : 3, Math.ceil(n / ys.length));
    estantes = Mu.crearEstantes(mats, C, plan.estante.w, ys); estantes.grupo.position.set(plan.estante.x, 0, zp); escena.add(estantes.grupo); adelante(estantes.grupo);
    const hueco = Math.min(0.34, (plan.estante.w - 0.06) / porFila), az = azar(5);
    lista.forEach((av, i) => {
      const fila = Math.min(ys.length - 1, Math.floor(i / porFila)), enFila = Math.min(porFila, n - fila * porFila), j = i - fila * porFila;
      const x = (j - (enFila - 1) / 2) * hueco, y = ys[ys.length - 1 - fila];     // los primeros aviones, en la tabla de arriba
      const alto = 0.07 + az() * 0.035;
      const pie = Mu.crearPie(mats, C, alto, empresa.color); pie.position.set(x, y, estantes.prof * 0.5); flota.add(pie);
      const esmalte = pie.children.find((m) => m.material === mats.esmalte);
      const a = modeloAvion(av.tipo), s = hueco * 0.86 / Math.max(1.05, a.envergadura);
      a.grupo.scale.setScalar(s);
      a.grupo.position.set(x, y + 0.02 + alto + 0.045 * s / 0.3, estantes.prof * 0.5);
      a.grupo.rotation.set(-0.1, -0.75 + (az() - 0.5) * 0.5, 0.12 + (az() - 0.5) * 0.1, 'YXZ');
      flota.add(a.grupo);
      const pintables = [];
      a.grupo.traverse((o) => { if (o.isMesh && o.geometry.userData?.empresa) pintables.push(o.geometry); });
      adelante(pie); adelante(a.grupo);
      naves.push({ a, id: av.id, base: a.grupo.position.y, fase: az() * TAU, pintar(c) {
        for (const geo of pintables) { const at = geo.attributes.color; for (const [desde, m] of geo.userData.empresa) for (let j = desde; j < desde + m; j++) at.setXYZ(j, c.r, c.g, c.b); at.needsUpdate = true; }
        if (esmalte) { const at = esmalte.geometry.attributes.color; for (let j = 0; j < at.count; j++) at.setXYZ(j, c.r, c.g, c.b); at.needsUpdate = true; }
      } });
    });
  }

  // Orden de dibujo: primero lo que tapa (muebles y lo que cuelga de la pared), después el cuarto y al final lo de afuera.
  // three ordena lo opaco por material antes que por distancia: sin esto el piso y las paredes se pintan enteros y después
  // se les pinta encima (medido: es de lo que más cuesta en equipos modestos).
  for (const x of [escritorio.grupo, mesa, sillon.grupo, reloj.grupo, almanaque.grupo, mapa.grupo]) adelante(x);

  // ── afuera y luces ──
  const afuera = crearAfuera({ plan, tipos: [...new Set((datos.flota ?? []).map((a) => a.tipo))], vuelaDeNoche: (datos.rutas ?? []).some((x) => x.luces), densidad: q.arboles });
  escena.add(afuera.raiz);
  mesa.updateMatrixWorld(true);
  const boca = lampara.boca.clone().applyMatrix4(lampara.grupo.matrixWorld), abajo = lampara.abajo.clone().transformDirection(lampara.grupo.matrixWorld);
  const luces = crearLuces({ escena, renderer: r, plan, panos: cuarto.panos, zVidrio: cuarto.zVidrio, lampara: { ...lampara, boca, abajo }, cielo: afuera.cielo, q });

  // ── posproceso (los mismos efectos del juego) ──
  let compositor = null, bloom = null;
  if (q.pos) {
    r.toneMapping = THREE.NoToneMapping;
    compositor = new EffectComposer(r, { frameBufferType: THREE.HalfFloatType, multisampling: q.msaa });
    compositor.addPass(new RenderPass(escena, camara));
    bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 1.0, luminanceSmoothing: 0.3, intensity: 0.75, radius: 0.72 });
    const efectos = [bloom];
    if (q.foco) efectos.push(new TiltShiftEffect({ offset: 0.0, focusArea: 1.0, feather: 0.7, kernelSize: KernelSize.VERY_SMALL }));
    efectos.push(new VignetteEffect({ offset: 0.32, darkness: 0.56 }), new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC }));
    if (!q.msaa) efectos.push(new SMAAEffect());
    compositor.addPass(new EffectPass(camara, ...efectos));
  } else { r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0; }

  // ── cámara: poses y viajes ──
  const casa = vertical
    ? { pos: V(0, 2.4, 2.75), obj: V(0, 1.5, plan.fondo), fov: 58 }
    : { pos: V(0.0, 2.06, 2.75), obj: V(0.0, 1.0, plan.fondo), fov: 40 };
  const cam = { pos: casa.pos.clone(), obj: casa.obj.clone(), fov: casa.fov, viaje: null, px: 0, py: 0, mx: 0, my: 0, corr: 0 };
  let W = 1, H = 1, altoPx = 720, tiempo = 0, horaActual = hora ?? 9;
  function irA(pose, dur = 1.15, alLlegar = null) {
    cam.viaje = { de: { pos: cam.pos.clone(), obj: cam.obj.clone(), fov: cam.fov }, a: pose, t: 0, dur, alLlegar };
    if (dur <= 0) { cam.pos.copy(pose.pos); cam.obj.copy(pose.obj); cam.fov = pose.fov ?? casa.fov; cam.viaje = null; alLlegar?.(); }
  }
  function moverCamara(dt) {
    const vj = cam.viaje;
    if (vj) {
      vj.t += dt; const u = facil(limitar(vj.t / vj.dur));
      cam.pos.lerpVectors(vj.de.pos, vj.a.pos, u); cam.obj.lerpVectors(vj.de.obj, vj.a.obj, u);
      // un arco leve: la cámara se levanta un poco a mitad de camino
      cam.pos.y += Math.sin(u * Math.PI) * 0.06 * Math.min(1, vj.de.pos.distanceTo(vj.a.pos));
      cam.fov = mezclar(vj.de.fov, vj.a.fov ?? casa.fov, u);
      if (vj.t >= vj.dur) { cam.viaje = null; vj.alLlegar?.(); }
    }
    // paralaje con el cursor y una respiración mínima: la escena nunca queda congelada
    cam.px += (cam.mx - cam.px) * Math.min(1, dt * 2.2); cam.py += (cam.my - cam.py) * Math.min(1, dt * 2.2);
    const d = cam.pos.distanceTo(cam.obj), am = Math.min(0.11, d * 0.022);
    const dx = cam.px * am + Math.sin(tiempo * 0.23) * am * 0.16, dy = -cam.py * am * 0.55 + Math.sin(tiempo * 0.31 + 1) * am * 0.1;
    camara.position.set(cam.pos.x + dx, cam.pos.y + dy, cam.pos.z);
    camara.fov = cam.fov; camara.updateProjectionMatrix();
    camara.lookAt(cam.obj.x + dx * 0.25, cam.obj.y + dy * 0.25, cam.obj.z);
  }
  // Pose para mirar un punto desde una dirección, dejando libre una parte de la pantalla (donde va la hoja).
  function poseDe(centro, desde, dist, { derecha = 0, abajo = 0, fov = vertical ? 46 : 34 } = {}) {
    const dir = desde.clone().normalize(), pos = centro.clone().addScaledVector(dir, dist), obj = centro.clone();
    const vf = THREE.MathUtils.degToRad(fov), hf = 2 * Math.atan(Math.tan(vf / 2) * (W / H));
    const lado = _v.crossVectors(V(0, 1, 0), dir).normalize();      // derecha de la cámara
    const corrX = derecha * dist * Math.tan(hf / 2), corrY = abajo * dist * Math.tan(vf / 2);
    obj.addScaledVector(lado, corrX); pos.addScaledVector(lado, corrX * 0.82); obj.y -= corrY; pos.y -= corrY * 0.8;
    return { pos, obj, fov };
  }

  // ── objetos que se pueden tocar ──
  const objetos = new Map();
  function registrar(id, grupo, { ancla, margen = 0.03, desde, dist, mueve = 0.012, luz = 0.5, encuadra = false }) {
    grupo.updateWorldMatrix(true, true);
    const caja = new THREE.Box3().setFromObject(grupo).expandByScalar(margen), centro = caja.getCenter(new THREE.Vector3());
    const v = viejos.get(id);
    objetos.set(id, { id, grupo, caja, centro, ancla: ancla ?? V(centro.x, caja.max.y + 0.03, centro.z), pie: V(centro.x, caja.min.y, caja.max.z), desde, dist, mueve, luz, encuadra, y0: v?.y0 ?? grupo.position.y, k: v?.k ?? 0, meta: v?.meta ?? 0, rot0: v?.rot0 ?? grupo.rotation.clone() });
  }
  let viejos = new Map();
  function registrarTodo() {
    viejos = new Map(objetos); objetos.clear();
    registrar('mapa', mapa.grupo, { desde: V(0.1, 0.02, 1), dist: vertical ? 2.3 : 2.75, mueve: 0, margen: 0.0, luz: 0.4, encuadra: true, ancla: V(plan.mapa.x, plan.mapa.y + mapa.h / 2 + (vertical ? 0.0 : 0.06), zp + 0.05) });
    const cf = new THREE.Box3().setFromObject(estantes.grupo).union(new THREE.Box3().setFromObject(flota));
    objetos.set('flota', { id: 'flota', grupo: flota, pie: V(plan.estante.x, cf.min.y, zp + 0.2), caja: cf.expandByScalar(0.03), centro: cf.getCenter(new THREE.Vector3()), ancla: V(plan.estante.x, cf.max.y + (vertical ? -0.02 : 0.05), zp + 0.2), desde: V(vertical ? 0 : 0.28, 0.1, 1), dist: vertical ? 2.9 : 2.7, mueve: 0, luz: 0.22, encuadra: true, y0: 0, k: viejos.get('flota')?.k ?? 0, meta: viejos.get('flota')?.meta ?? 0, rot0: flota.rotation.clone() });
    registrar('libro', libro.grupo, { desde: V(0, 0.9, 0.62), dist: vertical ? 1.5 : 1.3, luz: 0.3 });
    registrar('bandeja', bandeja.grupo, { desde: V(-0.05, 0.85, 0.66), dist: vertical ? 1.2 : 1.2, luz: 0.4 });
    registrar('cuaderno', cuaderno.grupo, { desde: V(0, 0.9, 0.6), dist: 0.95, margen: 0.04, luz: 0.4 });
    registrar('placa', placa.grupo, { desde: V(0, 0.42, 1), dist: vertical ? 1.8 : 1.15, margen: 0.035, mueve: 0.006, luz: 0.45 });
  }
  function poseObjeto(id, libre = {}) {
    const o = objetos.get(id); if (!o) return casa;
    let dist = o.dist;
    if (o.encuadra) {      // que entre entero en la parte libre de la pantalla, debajo de la barra
      const fov = vertical ? 46 : 34, vf = THREE.MathUtils.degToRad(fov), hf = 2 * Math.atan(Math.tan(vf / 2) * (W / H));
      o.caja.getSize(_w);
      dist = Math.max(1.5, _w.y * 1.16 / (0.8 * 2 * Math.tan(vf / 2)), _w.x * 1.12 / (2 * Math.tan(hf / 2) * (1 - (libre.derecha ?? 0))));
      return poseDe(o.centro, o.desde, dist, { ...libre, abajo: (libre.abajo ?? 0) - 0.07 });
    }
    return poseDe(o.centro, o.desde, dist, libre);
  }

  // Qué objeto hay en un punto de la pantalla (px). Primero, lo que el rayo toca de verdad (lo más cercano). Si no toca nada
  // y hay holgura (dedo), lo que queda a menos de esa distancia; entre varios, aquel cuyo centro está más cerca del toque.
  function apuntar(x, y, holgura = 0) {
    _p2.set(x / W * 2 - 1, -(y / H) * 2 + 1); _rayo.setFromCamera(_p2, camara);
    let mejor = null, dMin = Infinity;
    for (const o of objetos.values()) {
      const p = _rayo.ray.intersectBox(o.caja, _w);
      if (p) { const d = p.distanceTo(camara.position); if (d < dMin) { dMin = d; mejor = o.id; } }
    }
    if (mejor || !holgura) return mejor;
    const q = {};
    for (const o of objetos.values()) {
      _caja.copy(o.caja).expandByScalar(holgura);
      if (!_rayo.ray.intersectBox(_caja, _w)) continue;
      aPantalla(o.centro, q); const d = Math.hypot(q.x - x, q.y - y);
      if (d < dMin) { dMin = d; mejor = o.id; }
    }
    return mejor;
  }
  function senalar(id) { for (const o of objetos.values()) o.meta = o.id === id ? 1 : 0; }
  function aPantalla(p, out = {}) {
    _v.copy(p).project(camara);
    out.x = (_v.x * 0.5 + 0.5) * W; out.y = (-_v.y * 0.5 + 0.5) * H; out.visible = _v.z < 1 && _v.z > -1;
    return out;
  }

  // ── datos → cosas ──
  function ponerDatos(d) {
    datos = d;
    const noLeidas = (d.bandeja ?? []).filter((x) => !x.leido).length;
    const antes = bandeja.papeles.children.length;
    if (noLeidas < antes && antes <= 14 && iniciado) volarPapel(antes - noLeidas); else bandeja.poner(noLeidas);
    Mu.dibujarLibro(libro.ctx, libro.lienzo.width, libro.lienzo.height, d, t, FUENTE); libro.tex.needsUpdate = true;
    Mu.dibujarAlmanaque(almanaque.ctx, almanaque.lienzo.width, almanaque.lienzo.height, d.hoy?.fecha, empresa.color, FUENTE); almanaque.tex.needsUpdate = true;
    const firma = JSON.stringify((d.flota ?? []).map((a) => [a.id, a.tipo]));
    if (firma !== ponerDatos.flota) { ponerDatos.flota = firma; ponerFlota(d.flota ?? []); }
    const firmaRed = JSON.stringify((d.rutas ?? []).map((x) => [x.id, !!x.luces])) + empresa.color;
    if (firmaRed !== ponerDatos.red) { ponerDatos.red = firmaRed; mapa.ponerRed(d.rutas ?? [], empresa.color); }
    dibujarTitulos();
    registrarTodo();
    r.shadowMap.needsUpdate = true;
  }
  const dibujarTitulos = () => {
    Mu.dibujarPlaca(placa.ctx, placa.lienzo.width, placa.lienzo.height, empresa.nombre, t('placaPie', { epoca: datos.hoy?.epoca ?? 1929 }), FUENTE); placa.tex.needsUpdate = true;
    mapa.dibujar({ rutas: datos.rutas ?? [], titulo: empresa.nombre || t('mapaTitulo'), sub: t('mapaSub'), pie: t('mapaPie', { epoca: datos.hoy?.epoca ?? 1929 }), fuente: FUENTE });
  };
  // Nombre y color de la empresa: se repinta lo que los lleva (placa, mapa, hilos, libreas, alfombra, señalador, almanaque).
  function ponerEmpresa(nombre, color) {
    const otroColor = !!color && color !== empresa.color;
    empresa.nombre = nombre ?? empresa.nombre; empresa.color = color || empresa.color;
    dibujarTitulos();
    if (!otroColor) return;
    const c = col(empresa.color);
    placa.matEsmalte.color.copy(c); libro.matCinta.color.copy(c);
    cuarto.alfombra.repintar(empresa.color);
    mapa.pintarHilos(empresa.color);
    for (const nv of naves) nv.pintar(c);
    Mu.dibujarAlmanaque(almanaque.ctx, almanaque.lienzo.width, almanaque.lienzo.height, datos.hoy?.fecha, empresa.color, FUENTE); almanaque.tex.needsUpdate = true;
    ponerDatos.red = JSON.stringify((datos.rutas ?? []).map((x) => [x.id, !!x.luces])) + empresa.color;
  }
  // Un papel sale de la bandeja (se leyó una nota).
  const volando = [];
  function volarPapel(n) {
    for (let i = 0; i < n; i++) { const m = bandeja.papeles.children[bandeja.papeles.children.length - 1 - i]; if (m) volando.push({ m, t: -i * 0.12, y: m.position.y, x: m.position.x, giro: m.rotation.y }); }
  }

  // ── telégrafo: ráfagas de puntos y rayas ──
  const morse = { activo: false, t: 2.5, sig: 0, baja: false, ang: 0 };
  function moverTelegrafo(dt) {
    morse.t -= dt;
    if (morse.t <= 0) {
      if (!morse.activo) { morse.activo = true; morse.resto = 10 + Math.floor(Math.random() * 14); morse.t = 0; }
      if (morse.resto-- <= 0) { morse.activo = false; morse.baja = false; morse.t = 4 + Math.random() * 6; }
      else { morse.baja = !morse.baja; morse.t = morse.baja ? (Math.random() < 0.4 ? 0.26 : 0.1) : (Math.random() < 0.2 ? 0.3 : 0.1); if (morse.baja) alTic?.(); }
    }
    morse.ang += ((morse.baja ? 1 : 0) - morse.ang) * Math.min(1, dt * 38);
    telegrafo.palanca.rotation.z = 0.05 - morse.ang * 0.11;
    telegrafo.brazo.rotation.z = -0.03 + morse.ang * 0.09;
    if (morse.activo) { telegrafo.matCinta.map.offset.x -= dt * 0.085; telegrafo.carrete.rotation.z -= dt * 0.5; }
  }
  let alTic = null;

  // ── puerta (solo la primera vez) ──
  let frente = null;
  function ponerFrente(rotulo) {
    if (frente) return frente;
    frente = crearFrente(mats, plan, rotulo, FUENTE); escena.add(frente.grupo);
    r.shadowMap.needsUpdate = true;
    return frente;
  }
  function quitarFrente() { if (!frente) return; escena.remove(frente.grupo); soltar(frente.grupo); frente = null; r.shadowMap.needsUpdate = true; }
  const posePuerta = () => ({ pos: V(0, 1.56, plan.frente + 2.25), obj: V(0, 1.42, plan.frente), fov: vertical ? 56 : 38 });
  const poseUmbral = () => ({ pos: V(0, 1.6, plan.frente + 0.25), obj: V(0, 1.4, plan.fondo), fov: vertical ? 60 : 44 });

  // ── retratos de los aviones para las tarjetas (se dibujan una vez, en el mismo lienzo) ──
  function retratos(tipos, fondo = '#e7efe6') {
    const salida = {}, w = 360, h = 230, dpr = r.getPixelRatio();
    const mini = new THREE.Scene(); mini.background = col(fondo);
    const s1 = new THREE.DirectionalLight(col('#fff1d6'), 3.0); s1.position.set(2.5, 4, 3);
    const s2 = new THREE.DirectionalLight(col('#9cc4ff'), 0.9); s2.position.set(-3, 1, -2);
    mini.add(s1, s2, new THREE.HemisphereLight(col('#bcd7ff'), col('#6b5a45'), 1.4));
    const c = new THREE.PerspectiveCamera(26, w / h, 0.1, 50);
    const tm = r.toneMapping; r.toneMapping = THREE.ACESFilmicToneMapping;
    const [lz, g] = (() => { const x = document.createElement('canvas'); x.width = w; x.height = h; return [x, x.getContext('2d')]; })();
    const pw = Math.min(lienzo.width, Math.round(w * dpr)), ph = Math.min(lienzo.height, Math.round(h * dpr));
    for (const tipo of tipos) {
      const n = modeloAvion(tipo);
      n.grupo.rotation.set(-0.16, -2.25, 0.12, 'YXZ');
      matDisco.opacity = 0.0;
      mini.add(n.grupo);
      const d = n.envergadura * 1.62; c.position.set(0, d * 0.32, d); c.lookAt(0, -0.03 * n.envergadura, 0);
      r.setViewport(0, 0, pw / dpr, ph / dpr); r.setScissor(0, 0, pw / dpr, ph / dpr); r.setScissorTest(true);
      r.render(mini, c);
      g.clearRect(0, 0, w, h); g.drawImage(lienzo, 0, lienzo.height - ph, pw, ph, 0, 0, w, h);
      salida[tipo] = lz.toDataURL('image/jpeg', 0.86);
      mini.remove(n.grupo); n.grupo.traverse((o) => o.geometry?.dispose());
    }
    r.setScissorTest(false); r.setViewport(0, 0, W, H); r.toneMapping = tm;
    s1.dispose(); s2.dispose();
    if (iniciado) cuadro(0.001);      // el lienzo vuelve a mostrar la oficina en el mismo instante
    return salida;
  }

  // ── tamaño ──
  function medir(w, h, escala = 1) {
    W = w; H = h;
    const dpr = Math.min(window.devicePixelRatio || 1, q.dpr) * escala;
    r.setPixelRatio(dpr); r.setSize(W, H, false); compositor?.setSize(W, H);
    camara.aspect = W / H; camara.updateProjectionMatrix();
    altoPx = H * dpr; luces.medir(altoPx);
  }

  // ── cuadro ──
  let iniciado = false, sombraEn = 0, horaSombra = -99;
  function cuadro(dt, dibujar = true) {
    tiempo += dt;
    moverCamara(dt);
    afuera.actualizar(dt, tiempo, camara);
    luces.aplicar(horaActual, afuera.estado.destello, tiempo, dt, camara, suave(0.25, 1.1, cam.pos.distanceTo(casa.pos)) * (frente ? 0 : 1));
    const n = luces.est.noche;
    // el reloj marca la hora del juego; el péndulo no para
    const hh = ((horaActual % 12) + 12) % 12;
    reloj.horas.rotation.z = -hh / 12 * TAU; reloj.minutos.rotation.z = -(hh % 1) * TAU;
    reloj.pendulo.rotation.z = 0.19 * Math.sin(tiempo * TAU / 1.7);
    lampara.cadena.rotation.z = 0.05 * Math.sin(tiempo * 1.3) + 0.03 * Math.sin(tiempo * 2.9); lampara.cadena.rotation.x = 0.03 * Math.sin(tiempo * 1.7);
    moverTelegrafo(dt);
    mapa.actualizar(dt, tiempo, n);
    matAvionLuz.color.setScalar(mezclar(0.9, 2.6, n));
    // lo señalado: sube apenas, se inclina y recibe luz
    let fuerte = null;
    for (const o of objetos.values()) {
      o.k += (o.meta - o.k) * Math.min(1, dt * 9);
      if (o.mueve) { o.grupo.position.y = o.y0 + o.mueve * o.k + (o.k > 0.02 ? Math.sin(tiempo * 3.2) * 0.0015 * o.k : 0); o.grupo.rotation.y = o.rot0.y + 0.035 * o.k * Math.sin(tiempo * 1.6); }
      if (o.k > 0.02 && (!fuerte || o.k > fuerte.k)) fuerte = o;
    }
    resplandor.visible = !!fuerte;
    if (fuerte) {
      fuerte.caja.getSize(_v); const tam = Math.max(_v.x, _v.y, _v.z) * 1.7 + 0.2;
      resplandor.position.copy(fuerte.centro); resplandor.scale.set(tam, tam * (_v.y > _v.x ? 1.2 : 0.8), 1);
      matResplandor.opacity = fuerte.luz * fuerte.k * mezclar(0.3, 0.5, n) * (0.92 + 0.08 * Math.sin(tiempo * 3.1));
    }
    // las hélices giran cuando se señala el estante
    const of = objetos.get('flota');
    giroHelices += ((of?.meta ? 26 : 0) - giroHelices) * Math.min(1, dt * (of?.meta ? 2.5 : 1.2));
    matDisco.opacity = Math.min(0.22, giroHelices / 60);
    for (const nv of naves) { for (const h of nv.a.helices) h.eje.rotation.z += dt * giroHelices; nv.a.grupo.position.y = nv.base + Math.sin(tiempo * 2 + nv.fase) * 0.004 * (of?.k ?? 0); }
    // papeles que se van
    for (let i = volando.length - 1; i >= 0; i--) {
      const p = volando[i]; p.t += dt; if (p.t < 0) continue;
      const u = Math.min(1, p.t / 0.7), e = u * u * (3 - 2 * u);
      p.m.position.set(p.x + e * 0.34, p.y + Math.sin(u * Math.PI) * 0.09, p.m.position.z - e * 0.05); p.m.rotation.y = p.giro - e * 0.7; p.m.rotation.z = -e * 0.5; p.m.scale.setScalar(1 - e * e * 0.96);
      if (u >= 1) { bandeja.papeles.remove(p.m); volando.splice(i, 1); r.shadowMap.needsUpdate = true; }
    }
    if (frente) frente.vidrio.emissiveIntensity = mezclar(1.15, 0.55, n);
    placa.matChapa.emissiveIntensity = mezclar(0.05, 0.3, n);      // el bronce siempre devuelve algo de luz: el nombre se lee también de noche
    // las sombras se rehacen cuando cambia la luz y, si no, cada tanto (casi todo está quieto)
    sombraEn -= dt;
    if (Math.abs(horaActual - horaSombra) > 0.004 || sombraEn <= 0 || volando.length || frente) { r.shadowMap.needsUpdate = true; horaSombra = horaActual; sombraEn = 0.6; }
    if (bloom) bloom.luminanceMaterial.threshold = mezclar(1.0, 0.72, n);
    if (dibujar) { if (compositor) compositor.render(dt); else r.render(escena, camara); }
    iniciado = true;
  }
  function liberar() {
    // three guarda una textura compartida entre renderizadores (la tabla DFG de los materiales con brillo) y cada
    // renderizador se anota en ella: si no se lo desanota, el renderizador entero queda vivo para siempre (medido con una
    // foto de la memoria el 16-11-2026). Se la busca en un material antes de soltar nada y se la suelta al final: los demás
    // renderizadores (el del mapa) la vuelven a subir solos en su próximo cuadro (son 16 × 16 píxeles).
    let tablaDFG = null;
    escena.traverse((o) => { for (const m of (Array.isArray(o.material) ? o.material : o.material ? [o.material] : [])) tablaDFG ??= r.properties.get(m)?.uniforms?.dfgLUT?.value ?? null; });
    mapa.liberar(); luces.liberar(); afuera.liberar();
    compositor?.dispose();
    soltar(escena);
    for (const x of propios) x.dispose();
    for (const tx of mats.texturas) tx.dispose();
    for (const m of Object.values(mats)) m.dispose?.();
    r.renderLists.dispose(); r.dispose(); r.forceContextLoss();
    tablaDFG?.dispose();
    _rayo.camera = null;
  }

  ponerDatos(datos);
  return {
    r, escena, camara, plan, casa, objetos, luces, afuera, mapa, cam, vertical,
    medir, cuadro, irA, poseObjeto, apuntar, senalar, aPantalla, ponerDatos, ponerEmpresa, retratos, liberar,
    ponerFrente, quitarFrente, posePuerta, poseUmbral,
    fijarHora(h) { horaActual = h; }, get hora() { return horaActual; }, get tiempo() { return tiempo; },
    fijarCursor(nx, ny) { cam.mx = nx; cam.my = ny; },
    fijarPasillo(pos, fuerza) { luces.fijarPasillo(pos && fuerza > 0 ? { pos, fuerza } : null); },
    alTic(fn) { alTic = fn; },
    get puerta() { return frente; },
    info: () => ({ triangulos: r.info.render.triangles, llamadas: r.info.render.calls, geometrias: r.info.memory.geometries, texturas: r.info.memory.textures }),
  };
}
