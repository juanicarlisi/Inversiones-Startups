// El mundo 3D: escena, cámara de cine, día y noche, ciudades, rutas, aviones y efectos. No sabe nada de plata ni de reglas:
// main.js le pasa el estado del modelo y el mundo lo muestra.
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, ToneMappingEffect, ToneMappingMode, VignetteEffect, SMAAEffect, TiltShiftEffect, KernelSize } from 'postprocessing';
import { cargarRelieve, aMundo, limitar, suave, mezclar } from './geo.js';
import { Cielo } from './cielo.js';
import { crearTerreno, crearMar } from './terreno.js';
import { Nubes } from './nubes.js';
import { Ciudad, RADIO_CIUDAD, materialesCiudad } from './ciudades.js';
import { RutaVista, materialFaros } from './rutas.js';
import { Vuelos } from './vuelos.js';
import { crearAvion, materialLucesAvion } from './aviones.js';
import { Particulas, crearAnillo, crearFlecha } from './efectos.js';
import { elegirCalidad, Medidor, NIVELES } from './calidad.js';

CameraControls.install({ THREE });
const A = CameraControls.ACTION;
const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _obj = new THREE.Vector3(), _pos = new THREE.Vector3();
const col = (hex, k = 1) => new THREE.Color(hex).convertSRGBToLinear().multiplyScalar(k);

export class Mundo {
  constructor(lienzo) {
    this.lienzo = lienzo;
    this.r = new THREE.WebGLRenderer({ canvas: lienzo, antialias: false, powerPreference: 'high-performance', stencil: false, depth: true });
    this.r.outputColorSpace = THREE.SRGBColorSpace;
    this.calidad = elegirCalidad(this.r.getContext());
    this.medidor = new Medidor();
    this.escalaRes = 1;
    this.escena = new THREE.Scene();
    this.camara = new THREE.PerspectiveCamera(34, 1, 0.05, 900);
    this.camara.position.set(0, 9, 9);
    this.cielo = new Cielo();
    this.escena.add(this.cielo.grupo);
    this.ciudades = new Map(); this.rutas = new Map(); this.rutasModelo = new Map();
    this.S = 1; this.tiempo = 0; this.horaFija = null; this.W = 1; this.H = 1;
    this.sel = null; this.foco = { x: 0, z: 0, r: 1, w: 0, meta: 0 };
    this.alPing = null; this.alEvento = null;
    this.ultimo = null;
  }

  async iniciar(urls, mundoJson, aeropuertos, base) {
    const [relieve, suelo] = await Promise.all([
      cargarRelieve(urls.alturas, mundoJson),
      new THREE.TextureLoader().loadAsync(urls.suelo),
    ]);
    this.relieve = relieve;
    suelo.flipY = false; suelo.colorSpace = THREE.NoColorSpace; suelo.anisotropy = 4;
    suelo.minFilter = THREE.LinearMipmapLinearFilter; suelo.generateMipmaps = true; suelo.needsUpdate = true;
    const u = this.cielo.u;
    this.terreno = crearTerreno(relieve, suelo, u, this.calidad);
    this.mar = crearMar(relieve, u, this.calidad);
    this.nubes = new Nubes(u, this.calidad);
    this.particulas = new Particulas(u);
    this.escena.add(this.terreno, this.mar, this.nubes.malla, this.particulas.puntos);
    this.matPoste = new THREE.MeshStandardMaterial({ color: col('#e9e2d0'), roughness: 0.7 });
    this.aeropuertos = aeropuertos; this.base = base;
    this.vuelos = new Vuelos(this);
    this.anillo = crearAnillo(); this.anilloGuia = crearAnillo('#ffffff'); this.flecha = crearFlecha();
    this.escena.add(this.anillo, this.anilloGuia, this.flecha);

    // cámara
    const c = this.controles = new CameraControls(this.camara, this.lienzo);
    c.minDistance = 2.4; c.maxDistance = 64; c.minPolarAngle = 0.2; c.maxPolarAngle = 1.2;
    c.dollyToCursor = true; c.smoothTime = 0.28; c.draggingSmoothTime = 0.09; c.dollySpeed = 0.7;
    c.mouseButtons.left = A.TRUCK; c.mouseButtons.right = A.ROTATE; c.mouseButtons.wheel = A.DOLLY; c.mouseButtons.middle = A.DOLLY;
    c.touches.one = A.TOUCH_TRUCK; c.touches.two = A.TOUCH_DOLLY_TRUCK; c.touches.three = A.TOUCH_ROTATE;
    c.setBoundary(new THREE.Box3(new THREE.Vector3(relieve.x0 + 6, -1, relieve.zN + 6), new THREE.Vector3(relieve.x0 + relieve.w - 6, 2, relieve.zN + relieve.h - 6)));
    c.boundaryFriction = 0.2;
    c.addEventListener('controlstart', () => { this.ultimoManual = performance.now(); this.siguiendo = null; });
    c.setLookAt(0, 9, 9, 0, 0, 0, false);
    this.armarPosproceso();
    this.medir();
    return this;
  }

  armarPosproceso() {
    this.compositor?.dispose(); this.compositor = null;
    const q = this.calidad;
    if (!q.pos) { this.r.toneMapping = THREE.ACESFilmicToneMapping; this.r.toneMappingExposure = 1.0; return; }
    this.r.toneMapping = THREE.NoToneMapping;
    const comp = this.compositor = new EffectComposer(this.r, { frameBufferType: THREE.HalfFloatType, multisampling: q.msaa });
    comp.addPass(new RenderPass(this.escena, this.camara));
    this.bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 1.05, luminanceSmoothing: 0.3, intensity: 0.85, radius: 0.7 });
    const efectos = [this.bloom];
    if (q.nombre === 'alto') efectos.push(new TiltShiftEffect({ offset: 0.0, focusArea: 0.62, feather: 0.4, kernelSize: KernelSize.SMALL }));
    efectos.push(new VignetteEffect({ offset: 0.3, darkness: 0.52 }), new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC }));
    if (!q.msaa) efectos.push(new SMAAEffect());
    comp.addPass(new EffectPass(this.camara, ...efectos));
  }

  // Ajusta el lienzo al tamaño de la ventana y a la calidad.
  medir() {
    const W = this.lienzo.clientWidth || innerWidth, H = this.lienzo.clientHeight || innerHeight;
    this.W = W; this.H = H;
    const dpr = Math.min(devicePixelRatio || 1, this.calidad.dpr) * this.escalaRes;
    this.dprReal = dpr;
    this.r.setPixelRatio(dpr); this.r.setSize(W, H, false);
    this.compositor?.setSize(W, H);
    this.camara.aspect = W / H;
    // en pantallas angostas se abre el ángulo para que entre lo mismo a lo ancho
    this.camara.fov = W / H < 1 ? 46 : 34;
    this.camara.updateProjectionMatrix();
    for (const r of this.rutas.values()) r.mat.resolution.set(W, H);
    this.particulas && (this.particulas.mat.uniforms.uAlto.value = H * dpr);
    this.altoPx = H * dpr;
  }

  // Sube o baja la calidad cuando el medidor lo pide.
  ajustarCalidad(sentido) {
    if (sentido < 0) {
      if (this.escalaRes > 0.72) this.escalaRes = Math.max(0.7, this.escalaRes - 0.15);
      else if (this.calidad.pos) { this.calidad = { ...this.calidad, ...NIVELES.bajo, mallaTerreno: this.calidad.mallaTerreno, nubes: this.calidad.nubes }; this.escalaRes = 1; this.armarPosproceso(); }
      else if (this.escalaRes > 0.5) this.escalaRes = Math.max(0.5, this.escalaRes - 0.1);
    } else if (this.escalaRes < 1) this.escalaRes = Math.min(1, this.escalaRes + 0.15);
    this.medir();
  }

  materialFaros(propios) {
    const m = materialFaros(this.cielo.u, propios);
    (this.matsFaros ??= []).push(m);
    return m;
  }
  rutaDe(id) { return this.rutasModelo.get(id); }

  // ── sincronización con el modelo ──
  // disponible(id): si la ciudad ya se puede usar (las demás no se muestran).
  sincronizar(s, frac, dt, opciones) {
    const { disponible, hora, minPorSeg, corriendo } = opciones;
    // ciudades
    for (const ap of this.aeropuertos) {
      const hay = this.ciudades.get(ap.id);
      if (!hay && disponible(ap.id)) {
        const c = new Ciudad(ap, this.relieve, ap.id === this.base);
        if (this.iniciado) { c.aparicion = 0; this.alEvento?.({ tipo: 'ciudadNueva', ciudad: c }); }
        this.ciudades.set(ap.id, c); this.escena.add(c.grupo);
      }
    }
    // rutas
    this.rutasModelo.clear();
    for (const r of s.rutas) this.rutasModelo.set(r.id, r);
    const conAvion = new Set(s.aviones.map((a) => a.ruta));
    for (const r of s.rutas) {
      let v = this.rutas.get(r.id);
      if (!v) {
        const a = this.ciudades.get(r.a), b = this.ciudades.get(r.b);
        if (!a || !b) continue;
        // se dibuja desde la punta que ya estaba en la red (la base primero)
        const desdeB = r.b === this.base || (r.a !== this.base && [...this.rutas.values()].some((x) => x.a.id === r.b || x.b.id === r.b));
        v = new RutaVista(r.id, desdeB ? b : a, desdeB ? a : b, this);
        v.mat.resolution.set(this.W, this.H);
        if (!this.iniciado) v.dibujo = 1;
        else this.alEvento?.({ tipo: 'rutaNueva', ruta: v });
        this.rutas.set(r.id, v); this.escena.add(v.grupo);
      }
      v.conAvion = conAvion.has(r.id);
      if (r.balizas && !v.faros) v.ponerFaros(this.iniciado);
    }
    for (const [id, v] of this.rutas) if (!this.rutasModelo.has(id)) { this.escena.remove(v.grupo); v.liberar(); this.rutas.delete(id); }
    // hora y luz
    const h = this.horaFija ?? hora;
    const eraNoche = this.cielo.noche > 0.6;
    this.cielo.fijarHora(h);
    if (!eraNoche && this.cielo.noche > 0.6 && this.iniciado) for (const v of this.rutas.values()) v.reencender();
    this.vuelos.sincronizar(s, frac, dt, this.tiempo, minPorSeg, corriendo);
    this.iniciado = true;
  }

  // ── cuadro ──
  cuadro(ahora) {
    const dt = this.ultimo == null ? 0.016 : Math.min(0.1, (ahora - this.ultimo) / 1000); this.ultimo = ahora;
    this.dt = dt; this.tiempo += dt;
    const u = this.cielo.u;
    u.uTiempo.value = this.tiempo;
    // cine o controles
    if (this.cine) this.avanzarCine(dt);
    if (this.siguiendo != null) {
      const n = this.vuelos.naves.get(this.siguiendo);
      if (n) this.controles.moveTo(n.pos.x, 0, n.pos.z, true); else this.siguiendo = null;
    }
    this.controles.update(dt);
    this.controles.getTarget(_obj);
    const dist = this.camara.position.distanceTo(_obj);
    const S = limitar((dist / 6.5) ** 0.72, 0.8, 6.5);
    this.S += (S - this.S) * Math.min(1, dt * 5);
    this.dist = dist;
    this.cielo.seguir(this.camara, _obj);
    this.nubes.actualizar(dt, _obj, dist);
    this.terreno.material.uniforms.uViento.value.copy(this.nubes.viento).negate();
    this.mar.material.uniforms.uViento.value.copy(this.nubes.viento).negate();
    this.mar.position.set(Math.round(_obj.x), 0, Math.round(_obj.z));
    // niebla: más lejos cuando la cámara se aleja
    u.uNieblaDens.value = 0.085 / Math.max(6, dist) ;
    // foco de la guía
    const f = this.foco; f.w += (f.meta - f.w) * Math.min(1, dt * 3);
    this.terreno.material.uniforms.uFoco.value.set(f.x, f.z, f.r, f.w);
    this.mar.material.uniforms.uFoco.value.set(f.x, f.z, f.r, f.w);
    // ciudades
    const noche = this.cielo.noche;
    const { matLuces, matResplandor, matHaz } = materialesCiudad();
    matLuces.color.setScalar(mezclar(0.35, 2.3, noche));
    matResplandor.opacity = 0.34 * noche; matHaz.opacity = 0.2 * noche;
    materialLucesAvion().color.setScalar(mezclar(0.85, 2.6, noche));
    for (const c of this.ciudades.values()) c.actualizar(this.S, dt, this.tiempo);
    for (const r of this.rutas.values()) { r.seleccionada = this.sel?.tipo === 'ruta' && this.sel.id === r.id; r.actualizar(dt, this.S, this.tiempo, this.alPing); }
    for (const m of this.matsFaros ?? []) { m.uniforms.uAlto.value = this.altoPx; m.uniforms.uEscala.value = this.S; }
    this.dprLinea = 1;
    // eventos de vuelo: polvo y aviso a quien escuche (sonido)
    for (const e of this.vuelos.eventos) {
      if (e.tipo === 'despegue' || e.tipo === 'toque') this.particulas.soltar(_v.copy(e.nave.pos).setY(e.nave.pos.y - 0.02 * this.S), 12, { color: [0.75, 0.68, 0.55], vel: 0.25 * this.S, arriba: 0.06 * this.S, gravedad: -0.02, vida: 1.1, tam: 0.035 * this.S, frena: 2.5 });
      if (e.tipo === 'nuevo' && this.iniciado && e.nave.aparicion < 0.2) this.chispas(e.nave.pos, 26);
      this.alEvento?.(e);
    }
    this.vuelos.eventos.length = 0;
    this.particulas.actualizar(dt);
    this.marcas(dt);
    if (this.bloom) this.bloom.luminanceMaterial.threshold = mezclar(1.08, 0.62, noche);
    if (this.compositor) this.compositor.render(dt); else this.r.render(this.escena, this.camara);
    this.medidor.cuadro(ahora, (s) => this.ajustarCalidad(s), this.calidad.fijo);
  }

  chispas(pos, n = 20, color = [[3, 2.2, 0.8], [3, 2.8, 1.6], [2.6, 1.4, 0.5]]) {
    this.particulas.soltar(pos, n, { color, vel: 0.6 * this.S, arriba: 0.5 * this.S, gravedad: 0.9 * this.S, vida: 0.9, tam: 0.02 * this.S, frena: 1.2 });
  }
  papelitos(pos, n = 60) {
    this.particulas.soltar(_v.copy(pos).setY(pos.y + 0.3 * this.S), n, { color: [[2.4, 0.5, 0.4], [2.4, 1.8, 0.4], [0.5, 1.6, 2.4], [0.6, 2.2, 0.9], [2.6, 2.6, 2.6]], vel: 0.9 * this.S, arriba: 0.9 * this.S, gravedad: 0.7 * this.S, vida: 2.2, tam: 0.022 * this.S, frena: 1.6 });
  }

  // Anillos y flecha.
  marcas(dt) {
    const S = this.S, t = this.tiempo;
    const lugar = (x) => {
      if (!x) return null;
      if (x.tipo === 'ciudad') { const c = this.ciudades.get(x.id); return c ? { p: c.pos, r: RADIO_CIUDAD * S * 1.12 } : null; }
      if (x.tipo === 'avion') { const n = this.vuelos.naves.get(x.id); return n ? { p: _w.set(n.pos.x, Math.max(n.pos.y - n.altura, 0) + 0.02, n.pos.z), r: 0.2 * S } : null; }
      return null;
    };
    const a = lugar(this.sel);
    this.anillo.visible = !!a;
    if (a) { this.anillo.position.set(a.p.x, a.p.y + 0.012, a.p.z); this.anillo.scale.setScalar(a.r * (1 + 0.03 * Math.sin(t * 4))); this.anillo.rotation.y = t * 0.4; }
    const g = lugar(this.marca);
    this.anilloGuia.visible = this.flecha.visible = !!g;
    if (g) {
      const k = (t * 0.9) % 1;
      this.anilloGuia.position.set(g.p.x, g.p.y + 0.014, g.p.z); this.anilloGuia.scale.setScalar(g.r * (0.75 + 0.75 * k)); this.anilloGuia.material.opacity = 0.95 * (1 - k);
      this.flecha.position.set(g.p.x, g.p.y + (0.42 + 0.1 * Math.abs(Math.sin(t * 3.4))) * S, g.p.z); this.flecha.scale.setScalar(S * 1.15); this.flecha.rotation.y = t * 1.6;
    }
  }
  marcar(x) { this.marca = x; }
  elegir(x) { this.sel = x; }
  enfocar(ciudades, activo = true) {
    // apaga un poco todo menos la zona de esas ciudades (para la guía)
    if (!activo || !ciudades?.length) { this.foco.meta = 0; return; }
    let x = 0, z = 0, n = 0; const ps = [];
    for (const id of ciudades) { const c = this.ciudades.get(id); if (c) { x += c.pos.x; z += c.pos.z; n++; ps.push(c.pos); } }
    if (!n) return;
    x /= n; z /= n;
    this.foco.x = x; this.foco.z = z; this.foco.r = Math.max(1.4, ...ps.map((p) => Math.hypot(p.x - x, p.z - z) * 1.6 + 0.9)); this.foco.meta = 1;
  }

  // ── cámara ──
  // Encuadra un conjunto de puntos del mundo. margen: aire alrededor; abajo: fracción de pantalla tapada por la interfaz.
  encuadrar(puntos, { margen = 1.35, suave: s = true, azimut = null, polar = 0.86, abajo = 0, distMin = 4.2, distMax = 60 } = {}) {
    if (!puntos.length) return;
    const caja = new THREE.Box3();
    for (const p of puntos) caja.expandByPoint(_v.set(p.x, 0, p.z));
    caja.getCenter(_v);
    const ancho = Math.max(0.8, caja.max.x - caja.min.x), prof = Math.max(0.8, caja.max.z - caja.min.z);
    const vf = THREE.MathUtils.degToRad(this.camara.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * this.camara.aspect);
    const dAncho = (ancho * margen / 2) / Math.tan(hf / 2);
    const dProf = (prof * Math.cos(polar) * margen / 2) / Math.tan(vf / 2) / (1 - abajo);
    const d = limitar(Math.max(dAncho, dProf), distMin, distMax);
    // la interfaz tapa abajo: se corre el objetivo hacia el sur (lo que se mira sube en pantalla)
    const corr = abajo * d * Math.tan(vf / 2) * 0.9 / Math.cos(polar);
    this.controles.normalizeRotations();
    this.controles.setLookAt(_v.x + Math.sin(azimut ?? this.controles.azimuthAngle) * Math.sin(polar) * d, Math.cos(polar) * d, _v.z + corr + Math.cos(azimut ?? this.controles.azimuthAngle) * Math.sin(polar) * d, _v.x, 0, _v.z + corr, s);
  }
  seguir(idAvion) { this.siguiendo = idAvion; }

  // Secuencia de cine: claves = [{ t (segundos), pos: [x,y,z], obj: [x,y,z], hora? }]; pasa suave por todas.
  rodar(claves, alTerminar) {
    const P = new THREE.CatmullRomCurve3(claves.map((k) => new THREE.Vector3(...k.pos)), false, 'centripetal');
    const O = new THREE.CatmullRomCurve3(claves.map((k) => new THREE.Vector3(...k.obj)), false, 'centripetal');
    this.cine = { claves, P, O, t: 0, dur: claves[claves.length - 1].t, alTerminar };
    this.controles.enabled = false;
    this.avanzarCine(0);
  }
  avanzarCine(dt) {
    const c = this.cine; c.t += dt;
    const t = Math.min(c.t, c.dur);
    let i = 0; while (i < c.claves.length - 2 && c.claves[i + 1].t <= t) i++;
    const a = c.claves[i], b = c.claves[i + 1], f = suave(a.t, b.t, t) * 0.5 + (t - a.t) / (b.t - a.t) * 0.5;
    const u = (i + f) / (c.claves.length - 1);
    c.P.getPoint(u, _pos); c.O.getPoint(u, _w);
    this.controles.setLookAt(_pos.x, _pos.y, _pos.z, _w.x, _w.y, _w.z, false);
    if (a.hora != null && b.hora != null) this.horaFija = mezclar(a.hora, b.hora, f);
    if (c.t >= c.dur) this.cortarCine();
  }
  cortarCine() {
    const c = this.cine; if (!c) return;
    this.cine = null; this.controles.enabled = true; this.horaFija = null;
    c.alTerminar?.();
  }

  // ── pantalla ──
  aPantalla(p, out = {}) {
    _v.copy(p).project(this.camara);
    out.x = (_v.x * 0.5 + 0.5) * this.W; out.y = (-_v.y * 0.5 + 0.5) * this.H;
    out.visible = _v.z < 1 && _v.z > -1 && out.x > -60 && out.x < this.W + 60 && out.y > -60 && out.y < this.H + 60;
    return out;
  }
  pxPorUnidad(p) { return this.H / (2 * Math.tan(THREE.MathUtils.degToRad(this.camara.fov) / 2) * Math.max(0.5, this.camara.position.distanceTo(p))); }

  // Qué hay en un punto de la pantalla: avión, ciudad o ruta.
  queHay(x, y) {
    const o = {};
    let mejor = null, d2 = Infinity;
    for (const n of this.vuelos.naves.values()) {
      this.aPantalla(n.pos, o); if (!o.visible) continue;
      const r = Math.max(26, this.pxPorUnidad(n.pos) * 0.14 * this.S), d = Math.hypot(o.x - x, o.y - y);
      if (d < r && d < d2) { d2 = d; mejor = { tipo: 'avion', id: n.id }; }
    }
    let ciudad = null; d2 = Infinity;
    for (const c of this.ciudades.values()) {
      this.aPantalla(c.pos, o); if (!o.visible) continue;
      const r = Math.max(30, this.pxPorUnidad(c.pos) * RADIO_CIUDAD * this.S * 1.05), d = Math.hypot(o.x - x, o.y - y);
      if (d < r && d < d2) { d2 = d; ciudad = { tipo: 'ciudad', id: c.id }; }
    }
    // un avión estacionado no tapa a su ciudad: gana la ciudad salvo que el avión esté en el aire
    if (mejor && (!ciudad || this.vuelos.naves.get(mejor.id)?.enAire)) return mejor;
    if (ciudad) return ciudad;
    if (mejor) return mejor;
    let ruta = null; d2 = 16;
    const q = {};
    for (const r of this.rutas.values()) {
      for (let i = 0; i < r.puntos.length - 4; i += 4) {
        this.aPantalla(r.puntos[i], o); this.aPantalla(r.puntos[i + 4], q);
        const dx = q.x - o.x, dy = q.y - o.y, l2 = dx * dx + dy * dy || 1;
        const t = limitar(((x - o.x) * dx + (y - o.y) * dy) / l2), d = Math.hypot(o.x + dx * t - x, o.y + dy * t - y);
        if (d < d2) { d2 = d; ruta = { tipo: 'ruta', id: r.id }; }
      }
    }
    return ruta;
  }

  // Retratos de los aviones para las tarjetas (se dibujan una vez con un lienzo aparte).
  retratos(tipos, ancho = 360, alto = 240) {
    const lienzo = document.createElement('canvas');
    const r = new THREE.WebGLRenderer({ canvas: lienzo, alpha: true, antialias: true, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.setSize(ancho, alto, false); r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace;
    const escena = new THREE.Scene();
    const sol = new THREE.DirectionalLight(col('#fff1d6'), 3.0); sol.position.set(2.5, 4, 3);
    const relleno = new THREE.DirectionalLight(col('#9cc4ff'), 0.9); relleno.position.set(-3, 1, -2);
    escena.add(sol, relleno, new THREE.HemisphereLight(col('#bcd7ff'), col('#6b5a45'), 1.4));
    const cam = new THREE.PerspectiveCamera(26, ancho / alto, 0.1, 50);
    const salida = {};
    for (const tipo of tipos) {
      const n = crearAvion(tipo);
      n.grupo.rotation.set(-0.16, -2.25, 0.12, 'YXZ');
      for (const h of n.helices) h.disco.visible = true;
      escena.add(n.grupo);
      const d = n.envergadura * 2.5;
      cam.position.set(0, d * 0.3, d); cam.lookAt(0, -0.02 * n.envergadura, 0);
      materialLucesAvion().color.setScalar(1.2);
      r.render(escena, cam);
      salida[tipo] = lienzo.toDataURL('image/png');
      escena.remove(n.grupo);
    }
    r.dispose(); r.forceContextLoss?.();
    return salida;
  }
}

export { aMundo };
