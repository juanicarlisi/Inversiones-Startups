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
import { crearAvion, materialLucesAvion, pintarEmpresa } from './aviones.js';
import { Particulas, crearAnillo, crearFlecha } from './efectos.js';
import { elegirCalidad, Medidor, NIVELES } from './calidad.js';

CameraControls.install({ THREE });
const A = CameraControls.ACTION;
const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _obj = new THREE.Vector3(), _pos = new THREE.Vector3();
const _n = new THREE.Vector3(), _rayo = new THREE.Vector3(), _u = new THREE.Vector3();
// Cámara: qué tan cerca y qué tan lejos se puede mirar, y cuánto crecen los modelos con la distancia.
//  · de cerca (menos de 4,8) los modelos ya no se achican: acercar agranda de verdad, hasta ver un avión a pantalla llena;
//  · de lejos crecen con la distancia (exponente 0,72) para seguir legibles con toda la red de la época en pantalla.
export const DIST_MIN = 0.9, DIST_MAX_BASE = 40, ESCALA_MIN = 0.8, ESCALA_MAX = 9;
const PASO_RUEDA = 0.0016, PASO_PELLIZCO = 0.01, PASO_BOTON = 1.6, DOBLE_MS = 320, DOBLE_PX = 30;
const ALEJAR_SIGUIENDO = 1.7, SUELTA_SEGUIR = 8.5;       // siguiendo a un avión: cuánto más rinde alejar y a qué distancia se lo suelta
const col = (hex, k = 1) => new THREE.Color(hex).multiplyScalar(k);

export class Mundo {
  constructor(lienzo) {
    this.lienzo = lienzo;
    this.r = new THREE.WebGLRenderer({ canvas: lienzo, antialias: false, powerPreference: 'high-performance', stencil: false, depth: true });
    this.r.outputColorSpace = THREE.SRGBColorSpace;
    this.calidad = elegirCalidad(this.r.getContext());
    this.medidor = new Medidor();
    this.escalaRes = this.calidad.escalaInicial ?? 1;
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
      cargarRelieve(urls.alturas, urls.costa, mundoJson),
      new THREE.TextureLoader().loadAsync(urls.suelo),
    ]);
    this.relieve = relieve;
    suelo.flipY = false; suelo.colorSpace = THREE.SRGBColorSpace; suelo.anisotropy = 4;
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
    // camera-controls hace las transiciones suaves, los límites y el giro (botón derecho o tres dedos). Arrastrar, la rueda, el
    // pellizco y el doble toque se atienden acá (gestos()): el punto del suelo que está bajo el dedo o el cursor queda bajo el dedo
    // o el cursor, cosa que la librería no hace con la cámara inclinada (medido el 15-11-2026: una muesca de rueda corría el suelo
    // 3,2 unidades, y el gesto de trackpad cambiaba el zoom de la lente sin tope, de 0,01 a 33,8).
    const c = this.controles = new CameraControls(this.camara, this.lienzo);
    c.minDistance = DIST_MIN; c.maxDistance = 64; c.minPolarAngle = 0.2; c.maxPolarAngle = 1.2;
    c.minZoom = 1; c.maxZoom = 1;                       // la lente no se toca nunca: acercar es siempre mover la cámara
    c.dollyToCursor = false; c.smoothTime = 0.22; c.draggingSmoothTime = 0.09;
    c.mouseButtons.left = A.NONE; c.mouseButtons.right = A.ROTATE; c.mouseButtons.wheel = A.NONE; c.mouseButtons.middle = A.NONE;
    c.touches.one = A.NONE; c.touches.two = A.NONE; c.touches.three = A.TOUCH_ROTATE;
    c.setBoundary(new THREE.Box3(new THREE.Vector3(relieve.x0 + 6, -1, relieve.zN + 6), new THREE.Vector3(relieve.x0 + relieve.w - 6, 2, relieve.zN + relieve.h - 6)));
    c.boundaryFriction = 0.2;
    c.addEventListener('controlstart', () => { if (this.girando) this.manual(); });
    c.setLookAt(0, 9, 9, 0, 0, 0, false);
    this.alza = 0; this.propia = false; this.dist = 9;
    this.gestos();
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
    if (q.nombre === 'alto') efectos.push(new TiltShiftEffect({ offset: 0.0, focusArea: 0.78, feather: 0.3, kernelSize: KernelSize.VERY_SMALL }));
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
    this.limites();
  }

  // Sube o baja la calidad cuando el medidor lo pide.
  ajustarCalidad(sentido) {
    if (sentido < 0) {
      if (this.escalaRes > 0.72) this.escalaRes = Math.max(0.7, this.escalaRes - 0.15);
      else if (this.calidad.pos) { this.calidad = { ...this.calidad, ...NIVELES.bajo, mallaTerreno: this.calidad.mallaTerreno, nubes: this.calidad.nubes }; this.escalaRes = 1; this.armarPosproceso(); }
      else if (this.escalaRes > 0.4) this.escalaRes = Math.max(0.4, this.escalaRes - 0.1);
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
    this.controles.getTarget(_obj, false);
    const dist = this.controles.distance;
    const S = limitar((dist / 6.5) ** 0.72, ESCALA_MIN, ESCALA_MAX);
    this.S += (S - this.S) * Math.min(1, dt * 5);
    this.dist = dist;
    this.alzar(dt, dist);
    this.cielo.seguir(this.camara, _obj);
    this.nubes.actualizar(dt, _obj, dist);
    this.terreno.material.uniforms.uViento.value.copy(this.nubes.viento).negate();
    this.mar.material.uniforms.uViento.value.copy(this.nubes.viento).negate();
    this.mar.position.set(Math.round(_obj.x), 0, Math.round(_obj.z));
    // niebla: más lejos cuando la cámara se aleja
    u.uNieblaDens.value = 0.05 / Math.max(6, dist);
    // foco de la guía
    const f = this.foco; f.w += (f.meta - f.w) * Math.min(1, dt * 3);
    this.terreno.material.uniforms.uFoco.value.set(f.x, f.z, f.r, f.w);
    this.mar.material.uniforms.uFoco.value.set(f.x, f.z, f.r, f.w);
    // ciudades
    const noche = this.cielo.noche;
    const { matLuces, matResplandor, matHaz } = materialesCiudad();
    matLuces.color.setScalar(mezclar(0.35, 3.4, noche));
    const sinPos = this.compositor ? 1 : 1.9; // sin posproceso no hay resplandor de lente: se compensa
    matResplandor.opacity = Math.min(1, 0.5 * noche * sinPos); matHaz.opacity = 0.42 * noche;
    materialLucesAvion().color.setScalar(mezclar(0.85, 3.4, noche));
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
  // Encuadra un conjunto de puntos del mundo. margen: aire alrededor; abajo, derecha e izquierda: fracción de la pantalla tapada
  // por la interfaz de ese lado (los paneles): lo encuadrado queda en la parte libre, no debajo de un panel.
  encuadrar(puntos, { margen = 1.35, suave: s = true, azimut = null, polar = 0.86, abajo = 0, derecha = 0, izquierda = 0, distMin = 4.2, distMax = null } = {}) {
    if (!puntos.length) return;
    distMax ??= this.controles.maxDistance;
    const caja = new THREE.Box3();
    for (const p of puntos) caja.expandByPoint(_v.set(p.x, 0, p.z));
    caja.getCenter(_v);
    const ancho = Math.max(0.8, caja.max.x - caja.min.x), prof = Math.max(0.8, caja.max.z - caja.min.z);
    const vf = THREE.MathUtils.degToRad(this.camara.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * this.camara.aspect);
    const dAncho = (ancho * margen / 2) / Math.tan(hf / 2) / (1 - derecha - izquierda);
    const dProf = (prof * Math.cos(polar) * margen / 2) / Math.tan(vf / 2) / (1 - abajo);
    const d = limitar(Math.max(dAncho, dProf), distMin, distMax);
    const az = azimut ?? this.controles.azimuthAngle;
    // la interfaz tapa abajo: se corre el objetivo hacia el sur (lo que se mira sube en pantalla)
    const corr = abajo * d * Math.tan(vf / 2) * 0.9 / Math.cos(polar);
    // la interfaz tapa a un costado: se corre el objetivo hacia ese lado de la pantalla (lo que se mira va al lado libre)
    const corrD = (derecha - izquierda) * d * Math.tan(hf / 2), ox = Math.cos(az) * corrD, oz = -Math.sin(az) * corrD;
    this.controles.normalizeRotations();
    this.controles.zoomTo(1, false);
    this.controles.setLookAt(_v.x + ox + Math.sin(az) * Math.sin(polar) * d, Math.cos(polar) * d, _v.z + oz + corr + Math.cos(az) * Math.sin(polar) * d, _v.x + ox, 0, _v.z + oz + corr, s);
  }
  seguir(idAvion) { this.siguiendo = idAvion; }

  // Hasta dónde se puede alejar: lo justo para que entren todas las ciudades de la época, con aire (cambia con la forma de la
  // pantalla: en un celular vertical hace falta alejarse más para lo mismo).
  limites(puntos = this.puntosLimite) {
    this.puntosLimite = puntos;
    if (!puntos?.length || !this.controles) return;
    const caja = new THREE.Box3();
    for (const p of puntos) caja.expandByPoint(_v.set(p.x, 0, p.z));
    const ancho = caja.max.x - caja.min.x, prof = caja.max.z - caja.min.z, polar = 0.86, margen = 1.5;
    const vf = THREE.MathUtils.degToRad(this.camara.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * this.camara.aspect);
    const d = Math.max((ancho * margen / 2) / Math.tan(hf / 2), (prof * Math.cos(polar) * margen / 2) / Math.tan(vf / 2));
    this.controles.maxDistance = Math.max(DIST_MAX_BASE, d * 1.06);
  }

  // ── la cámara es del jugador ──
  // Desde que el jugador mueve, acerca o gira la cámara, el juego no se la mueve más por su cuenta (propia = true): solo cuando
  // él lo pide («Ver mi red», «Siguiente paso», «Seguirlo con la cámara»).
  manual() { this.ultimoManual = performance.now(); this.propia = true; }
  pedida() { this.propia = false; }

  // La cámara mira a la altura de lo que hay: de cerca, el suelo (o el avión que se sigue) queda en el centro, no el nivel del mar.
  // De lejos no cambia nada. Nunca se hunde en el relieve.
  alzar(dt, dist) {
    const w = 1 - suave(7, 16, dist);
    let h = 0;
    if (w > 0 && !this.cine && !this.orbita) {             // la entrada y la portada llevan su propia cámara
      const n = this.siguiendo != null ? this.vuelos.naves.get(this.siguiendo) : null;
      h = (n ? n.pos.y : this.relieve.y(_obj.x, _obj.z)) * w;
    }
    this.alza += (h - this.alza) * Math.min(1, dt * 4);
    const cam = this.camara;
    cam.position.y += this.alza;
    const piso = this.relieve.y(cam.position.x, cam.position.z) + 0.05;
    if (cam.position.y < piso) cam.position.y = piso;
    cam.updateMatrixWorld();
  }

  // Dirección del rayo que sale de la cámara por un punto de la pantalla (píxeles).
  rayo(x, y, out = _rayo) {
    return out.set(x / this.W * 2 - 1, -(y / this.H) * 2 + 1, 0.5).unproject(this.camara).sub(this.camara.position).normalize();
  }
  // El punto del suelo (a la altura a la que mira la cámara) que se ve en ese punto de la pantalla. null si se mira al cielo.
  suelo(x, y, out = new THREE.Vector3()) {
    const r = this.rayo(x, y), cam = this.camara.position;
    if (r.y > -0.02) return null;
    const k = (this.alza - cam.y) / r.y;
    return out.set(cam.x + r.x * k, this.alza, cam.z + r.z * k);
  }
  // A dónde tiene que mirar la cámara (a distancia d) para que el punto del suelo G quede en ese punto de la pantalla.
  // Con la cámara a distancia d del objetivo T: G = T + d · u, donde u depende solo de la orientación y del punto de la pantalla.
  objetivoPara(G, x, y, d, out = new THREE.Vector3()) {
    const r = this.rayo(x, y);
    if (r.y > -0.02) return null;
    this.controles.getTarget(_obj, false); this.controles.getPosition(_pos, false);
    _n.subVectors(_pos, _obj).normalize();                         // del objetivo a la cámara
    _u.copy(_n).addScaledVector(r, -_n.y / r.y);                    // horizontal: su altura se anula
    return out.set(G.x - d * _u.x, 0, G.z - d * _u.z);
  }
  distFinal() { return this.controles._sphericalEnd?.radius ?? this.controles.distance; }

  // Acerca (k < 1) o aleja (k > 1) dejando quieto el punto del suelo que está en (x, y). Varias muescas seguidas usan el mismo
  // punto de anclaje (el de la primera): así el zoom no «camina» aunque la transición no haya terminado.
  acercarEn(x, y, k, { suave: s = true, ancla = null } = {}) {
    const c = this.controles, ahora = performance.now();
    const d = limitar(this.distFinal() * k, c.minDistance, c.maxDistance);
    this.manual();
    if (this.siguiendo != null) {
      // Siguiendo a un avión, el centro es el avión. Alejar rinde más que acercar (del primer plano se sale con pocas muescas:
      // en la prueba a ciegas del 16-11-2026 «casi no alejaba») y, pasado el primer plano, el seguimiento se suelta solo: la
      // cámara queda donde está y la rueda vuelve a anclar en el cursor, como siempre.
      const d2 = k > 1 ? limitar(this.distFinal() * k ** ALEJAR_SIGUIENDO, c.minDistance, c.maxDistance) : d;
      c.dollyTo(d2, s);
      if (d2 > SUELTA_SEGUIR) this.siguiendo = null;
      return d2;
    }
    let a = ancla ?? this.anclaZoom;
    if (!ancla && (!a || ahora - a.t > 260 || Math.hypot(a.x - x, a.y - y) > 8)) { const G = this.suelo(x, y); a = this.anclaZoom = G ? { x, y, G, t: ahora } : null; }
    if (a) a.t = ahora;
    const T = a && this.objetivoPara(a.G, x, y, d, _w);
    c.dollyTo(d, s);
    if (T) c.moveTo(T.x, 0, T.z, s);
    return d;
  }
  // Los botones + y −, las teclas y el doble toque: un paso fijo, hacia el centro de la parte libre de la pantalla.
  // sentido: +1 acerca, −1 aleja.
  pasoZoom(sentido, x = this.W / 2, y = this.H / 2) { this.anclaZoom = null; return this.acercarEn(x, y, sentido > 0 ? 1 / PASO_BOTON : PASO_BOTON); }

  // Lleva lo justo: mueve la cámara lo mínimo para que esos puntos queden en la parte libre de la pantalla (fracciones tapadas por
  // la interfaz de cada lado). No acerca nunca; se aleja solo si no entran. Si ya se ven, no hace nada.
  asegurarVisible(puntos, { izquierda = 0, derecha = 0, arriba = 0.1, abajo = 0, margen = 56 } = {}) {
    if (!puntos.length) return false;
    const x0 = this.W * izquierda + margen, x1 = this.W * (1 - derecha) - margen, y0 = this.H * arriba + margen * 0.6, y1 = this.H * (1 - abajo) - margen;
    let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity, atras = false;
    const o = {};
    for (const p of puntos) { _v.copy(p).project(this.camara); if (_v.z > 1) atras = true; o.x = (_v.x * 0.5 + 0.5) * this.W; o.y = (-_v.y * 0.5 + 0.5) * this.H; a0 = Math.min(a0, o.x); a1 = Math.max(a1, o.x); b0 = Math.min(b0, o.y); b1 = Math.max(b1, o.y); }
    if (atras || a1 - a0 > x1 - x0 || b1 - b0 > y1 - y0) {
      // no entran a esta distancia: se encuadran alejando lo justo (nunca más cerca que ahora)
      this.encuadrar(puntos, { margen: 1.5, azimut: this.controles.azimuthAngle, polar: this.controles.polarAngle, abajo, derecha, izquierda, distMin: this.distFinal() });
      return true;
    }
    const dx = a0 < x0 ? x0 - a0 : a1 > x1 ? x1 - a1 : 0, dy = b0 < y0 ? y0 - b0 : b1 > y1 ? y1 - b1 : 0;
    if (!dx && !dy) return false;
    // el suelo que hoy está en el centro tiene que quedar corrido (dx, dy) en la pantalla
    const cx = this.W / 2, cy = this.H / 2, G = this.suelo(cx, cy, _w);
    const T = G && this.objetivoPara(G, cx + dx, cy + dy, this.distFinal());
    if (!T) return false;
    this.siguiendo = null;
    this.controles.moveTo(T.x, 0, T.z, true);
    return true;
  }

  // ── gestos: arrastrar, rueda, pellizco, doble toque ──
  gestos() {
    const el = this.lienzo, dedos = new Map();
    let g = null, toque = null, ultimoToque = null;
    const centro = () => { let x = 0, y = 0; for (const p of dedos.values()) { x += p.x; y += p.y; } return { x: x / dedos.size, y: y / dedos.size }; };
    const abertura = () => { const [a, b] = [...dedos.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
    const empezar = () => {
      if (dedos.size === 1) { const p = centro(), G = this.suelo(p.x, p.y); g = G ? { tipo: 'mover', G, x0: p.x, y0: p.y, movido: false } : null; }
      else if (dedos.size === 2) { const p = centro(), G = this.suelo(p.x, p.y); g = G ? { tipo: 'pellizco', G, ab0: Math.max(24, abertura()), d0: this.distFinal() } : null; this.manual(); this.siguiendo = null; }
      else g = null;
    };
    el.addEventListener('pointerdown', (e) => {
      if (!this.controles.enabled) return;
      this.girando = e.pointerType === 'mouse' && e.button === 2;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { el.setPointerCapture(e.pointerId); } catch { /* sin captura */ }
      toque = dedos.size === 1 ? { x: e.clientX, y: e.clientY, t: e.timeStamp } : null;
      empezar();
    });
    el.addEventListener('pointermove', (e) => {
      const p = dedos.get(e.pointerId);
      if (!p) return;
      p.x = e.clientX; p.y = e.clientY;
      if (!g || !this.controles.enabled) return;
      const c = this.controles, m = centro();
      if (g.tipo === 'mover') {
        if (!g.movido && Math.hypot(m.x - g.x0, m.y - g.y0) < 6) return;     // un toque que tiembla no es un arrastre
        if (!g.movido) { g.movido = true; this.manual(); this.siguiendo = null; el.classList.add('arrastra'); }
        const T = this.objetivoPara(g.G, m.x, m.y, this.dist, _w);
        if (T) c.moveTo(T.x, 0, T.z, false);
      } else if (g.tipo === 'pellizco') {
        const d = limitar(g.d0 * g.ab0 / Math.max(24, abertura()), c.minDistance, c.maxDistance);
        c.dollyTo(d, false);
        const T = this.objetivoPara(g.G, m.x, m.y, d, _w);
        if (T) c.moveTo(T.x, 0, T.z, false);
      }
    });
    const soltar = (e) => {
      if (!dedos.delete(e.pointerId)) return;
      el.classList.remove('arrastra');
      // doble clic o doble toque: acerca hacia ese punto
      if (toque && e.type === 'pointerup' && dedos.size === 0 && Math.hypot(e.clientX - toque.x, e.clientY - toque.y) < 9 && e.timeStamp - toque.t < 500) {
        if (ultimoToque && e.timeStamp - ultimoToque.t < DOBLE_MS && Math.hypot(e.clientX - ultimoToque.x, e.clientY - ultimoToque.y) < DOBLE_PX) { this.anclaZoom = null; this.acercarEn(e.clientX, e.clientY, 0.5); ultimoToque = null; this.alDoble?.(); }
        else ultimoToque = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      }
      toque = null;
      empezar();                                         // si queda un dedo, sigue arrastrando desde donde está
    };
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
    // la rueda (y el gesto de trackpad, que llega como rueda con ctrl): siempre acerca o aleja la cámara, hacia el cursor, con tope
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (!this.controles.enabled) return;
      let dy = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 300 : 1);
      dy = limitar(dy, -260, 260);
      this.acercarEn(e.clientX, e.clientY, Math.exp(dy * (e.ctrlKey ? PASO_PELLIZCO : PASO_RUEDA)));
    }, { passive: false });
  }

  colorEmpresa(hex) { pintarEmpresa(hex); }

  // Secuencia de cine: claves = [{ t (segundos), pos: [x,y,z], obj: [x,y,z], hora? }]; pasa suave por todas.
  rodar(claves, alTerminar) {
    const P = new THREE.CatmullRomCurve3(claves.map((k) => new THREE.Vector3(...k.pos)), false, 'centripetal');
    const O = new THREE.CatmullRomCurve3(claves.map((k) => new THREE.Vector3(...k.obj)), false, 'centripetal');
    this.cine = { claves, P, O, t: 0, dur: claves[claves.length - 1].t, alTerminar };
    this.controles.enabled = false;
    this.controles.maxPolarAngle = Math.PI / 2 - 0.01; this.controles.minDistance = 0.5; // en el cine la cámara puede mirar al horizonte
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
    this.controles.maxPolarAngle = 1.2; this.controles.minDistance = DIST_MIN;
    // si se saltó antes del final, la cámara va suave hasta la última toma
    const u = c.claves[c.claves.length - 1];
    if (c.t < c.dur) this.controles.setLookAt(...u.pos, ...u.obj, true);
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
      const d = n.envergadura * 1.62;
      cam.position.set(0, d * 0.32, d); cam.lookAt(0, -0.03 * n.envergadura, 0);
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
