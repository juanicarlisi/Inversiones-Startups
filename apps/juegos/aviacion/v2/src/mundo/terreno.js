// Terreno (maqueta con relieve real) y mar. Los dos leen la misma textura de alturas: el vértice se desplaza en la GPU,
// la costa sale nítida con cualquier zoom (umbral sobre la altura interpolada) y la luz usa la normal calculada por píxel.
import * as THREE from 'three';
import { KM_A_Y } from './geo.js';

const RUIDO = /* glsl */`
  float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float ruido(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1, 0)), f.x), mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * ruido(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
`;

// Sombras de nubes: un campo de ruido que se mueve con el viento (el mismo que desplaza las nubes).
const NUBES = /* glsl */`
  uniform vec2 uViento;
  float sombraNubes(vec2 xz) {
    vec2 p = (xz + uViento) * 0.16;
    float n = fbm(p) * 0.7 + fbm(p * 2.7 + 3.0) * 0.3;
    return smoothstep(0.50, 0.68, n);
  }
`;

export function crearTerreno(relieve, texSuelo, luz, calidad) {
  const { x0, zN, w, h } = relieve;
  const segX = calidad.mallaTerreno, segZ = Math.round(segX * h / w);
  const geo = new THREE.PlaneGeometry(w, h, segX, segZ);
  geo.rotateX(-Math.PI / 2);
  geo.translate(x0 + w / 2, 0, zN + h / 2);
  // PlaneGeometry trae uv con v=1 al norte: se invierte para leer la textura con la fila 0 al norte.
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
  geo.boundingBox = new THREE.Box3(new THREE.Vector3(x0, -0.1, zN), new THREE.Vector3(x0 + w, 1.6, zN + h));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(x0 + w / 2, 0, zN + h / 2), Math.hypot(w, h) / 2);

  const uniforms = {
    ...luz,
    uAlt: { value: relieve.textura },
    uSuelo: { value: texSuelo },
    uTam: { value: new THREE.Vector2(relieve.ancho, relieve.alto) },
    uMundo: { value: new THREE.Vector2(w, h) },
    uK: { value: KM_A_Y },
    uViento: { value: new THREE.Vector2() },
    uFoco: { value: new THREE.Vector4(0, 0, 0, 0) }, // x,z, radio, intensidad: resalta una zona (guía)
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      uniform sampler2D uAlt; uniform float uK;
      varying vec2 vUv; varying vec3 vPos;
      void main() {
        vUv = uv;
        float km = texture2D(uAlt, uv).r;
        vec3 p = position;
        p.y = km > 0.0 ? km * uK : max(km, -0.35) * uK * 0.9;
        vPos = p;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform sampler2D uAlt, uSuelo;
      uniform vec2 uTam, uMundo; uniform float uK, uNoche, uTiempo, uNieblaDens;
      uniform vec3 uSolDir, uSolColor, uAmbCielo, uAmbSuelo, uNiebla; uniform vec4 uFoco;
      varying vec2 vUv; varying vec3 vPos;
      ${RUIDO}
      ${NUBES}
      float alt(vec2 uv) { return max(texture2D(uAlt, uv).r, 0.0); }
      void main() {
        vec2 ag = texture2D(uAlt, vUv).rg;
        float km = ag.r;
        vec2 px = 1.0 / uTam;
        float dx = uMundo.x * px.x, dz = uMundo.y * px.y;
        float hO = alt(vUv - vec2(px.x, 0.0)), hE = alt(vUv + vec2(px.x, 0.0));
        float hN = alt(vUv - vec2(0.0, px.y)), hS = alt(vUv + vec2(0.0, px.y));
        vec3 n = normalize(vec3(-(hE - hO) * uK / (2.0 * dx), 1.0, -(hS - hN) * uK / (2.0 * dz)));
        // detalle: un poco de grano en la normal para que el llano no sea de plástico
        float g1 = fbm(vPos.xz * 9.0), g2 = fbm(vPos.xz * 31.0 + 7.0);
        n = normalize(n + vec3(g1 - 0.5, 0.0, g2 - 0.5) * 0.10);
        float pend = 1.0 - n.y;

        vec4 s = texture2D(uSuelo, vUv);
        vec3 col = pow(s.rgb, vec3(2.2));
        float lum = dot(col, vec3(0.3, 0.6, 0.1));
        col = mix(vec3(lum), col, 1.75);             // más saturado que la cartografía de origen
        col *= vec3(0.80, 0.86, 0.72);
        col *= 0.82 + 0.36 * g1;                      // manchas de campo
        // roca en las pendientes, nieve arriba (la línea de nieve baja hacia el sur)
        vec3 roca = vec3(0.30, 0.25, 0.22) * (0.8 + 0.4 * g2);
        col = mix(col, roca, smoothstep(0.10, 0.34, pend) * 0.8);
        float lat = vUv.y;                            // 0 = norte, 1 = sur
        float lineaNieve = mix(5.0, 0.9, smoothstep(0.45, 1.0, lat));
        float nieve = smoothstep(lineaNieve - 0.5, lineaNieve + 0.5, km + (g1 - 0.5) * 0.8);
        col = mix(col, vec3(0.92, 0.95, 1.0), nieve);
        // playa
        float playa = smoothstep(0.035, 0.0, km) * (1.0 - nieve);
        col = mix(col, vec3(0.80, 0.70, 0.50), playa * 0.85);
        // fondo cerca de la orilla (se ve a través del agua)
        if (km <= 0.0) col = mix(vec3(0.72, 0.66, 0.48), vec3(0.10, 0.30, 0.36), smoothstep(0.0, -0.12, km));
        // fronteras: una costura punteada apenas visible, como en un mapa de maqueta
        float fr = (1.0 - s.a) * step(0.0, km);
        float punto = step(0.5, fract((vPos.x + vPos.z) * 7.0));
        col = mix(col, col * 0.45 + vec3(0.25, 0.20, 0.16) * 0.3, fr * punto * 0.75);
        // ríos y lagos
        float agua = smoothstep(0.38, 0.52, ag.g) * step(0.0, km);
        vec3 rio = mix(vec3(0.06, 0.26, 0.42), vec3(0.10, 0.42, 0.52), 0.5 + 0.5 * sin(uTiempo * 0.8 + vPos.x * 9.0 + vPos.z * 7.0));
        col = mix(col, rio, agua);
        n = normalize(mix(n, vec3(0.0, 1.0, 0.0), agua));

        float sombra = 1.0 - 0.55 * sombraNubes(vPos.xz + uSolDir.xz * 1.6 / max(uSolDir.y, 0.25));
        float dif = max(dot(n, uSolDir), 0.0);
        dif = mix(dif, dif * 0.5 + 0.5, 0.25);
        vec3 amb = mix(uAmbSuelo, uAmbCielo, n.y * 0.5 + 0.5);
        vec3 luzT = uSolColor * dif * sombra + amb;
        // de noche el suelo se enfría y pierde color
        float l2 = dot(col, vec3(0.3, 0.6, 0.1));
        col = mix(col, vec3(l2) * vec3(0.75, 0.86, 1.25), uNoche * 0.55);
        vec3 c = col * luzT;
        // brillo del agua dulce
        vec3 v = normalize(cameraPosition - vPos);
        c += agua * uSolColor * pow(max(dot(reflect(-uSolDir, n), v), 0.0), 60.0) * 0.6;
        // foco de la guía: lo de afuera se apaga un poco
        if (uFoco.w > 0.0) { float d = distance(vPos.xz, uFoco.xy); c *= mix(1.0, mix(0.42, 1.12, smoothstep(uFoco.z * 1.5, uFoco.z * 0.6, d)), uFoco.w); }
        float dist = distance(cameraPosition, vPos);
        float nb = 1.0 - exp(-pow(dist * uNieblaDens, 2.0));
        c = mix(c, uNiebla, nb);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const malla = new THREE.Mesh(geo, mat);
  malla.matrixAutoUpdate = false;
  return malla;
}

export function crearMar(relieve, luz, calidad) {
  const { x0, zN, w, h } = relieve;
  const geo = new THREE.PlaneGeometry(900, 900, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const uniforms = {
    ...luz,
    uAlt: { value: relieve.textura },
    uCaja: { value: new THREE.Vector4(x0, zN, w, h) },
    uFoco: { value: new THREE.Vector4(0, 0, 0, 0) },
    uViento: { value: new THREE.Vector2() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    defines: { OLAS: calidad.olas },
    vertexShader: /* glsl */`
      varying vec3 vPos;
      void main() { vec4 p = modelMatrix * vec4(position, 1.0); vPos = p.xyz; gl_Position = projectionMatrix * viewMatrix * p; }`,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform sampler2D uAlt; uniform vec4 uCaja, uFoco;
      uniform float uTiempo, uNoche, uNieblaDens;
      uniform vec3 uSolDir, uSolColor, uAmbCielo, uNiebla, uCenit, uHoriz;
      varying vec3 vPos;
      ${RUIDO}
      ${NUBES}
      // olas: suma de ondas con dirección; devuelve la pendiente
      vec2 ola(vec2 p, vec2 dir, float frec, float vel, float amp) {
        float f = dot(p, dir) * frec + uTiempo * vel;
        return dir * cos(f) * amp * frec;
      }
      void main() {
        vec2 uv = (vPos.xz - uCaja.xy) / uCaja.zw;
        float dentro = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
        float km = mix(-4.0, texture2D(uAlt, clamp(uv, 0.0, 1.0)).r, dentro);
        if (km > 0.004) discard;
        float prof = max(-km, 0.0);
        float dist = distance(cameraPosition, vPos);
        // color según la profundidad real
        vec3 poco = vec3(0.07, 0.50, 0.52), medio = vec3(0.025, 0.24, 0.40), hondo = vec3(0.010, 0.075, 0.19);
        vec3 col = mix(poco, medio, smoothstep(0.0, 0.14, prof));
        col = mix(col, hondo, smoothstep(0.08, 3.2, prof));
        // olas
        vec2 p = vPos.xz;
        float lejos = clamp(1.0 - dist / 60.0, 0.0, 1.0);
        vec2 g = vec2(0.0);
        g += ola(p, normalize(vec2(1.0, 0.35)), 5.0, 0.9, 0.010);
        g += ola(p, normalize(vec2(-0.4, 1.0)), 8.3, 1.2, 0.006);
        #if OLAS > 1
        g += ola(p, normalize(vec2(0.7, -0.8)), 17.0, 1.7, 0.003);
        g += (vec2(fbm(p * 6.0 + uTiempo * 0.12), fbm(p * 6.0 - uTiempo * 0.1 + 5.0)) - 0.5) * 0.18;
        g += (vec2(ruido(p * 34.0 + uTiempo * 0.4), ruido(p * 34.0 - uTiempo * 0.35 + 9.0)) - 0.5) * 0.10;
        #endif
        g *= 0.35 + 0.65 * lejos;
        vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
        vec3 v = normalize(cameraPosition - vPos);
        float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
        vec3 cieloRef = mix(uHoriz, uCenit, clamp(reflect(-v, n).y * 1.6, 0.0, 1.0));
        float sombra = 1.0 - 0.5 * sombraNubes(vPos.xz + uSolDir.xz * 1.6 / max(uSolDir.y, 0.25));
        float dif = max(dot(n, uSolDir), 0.0);
        vec3 c = col * (uSolColor * dif * sombra * 0.9 + uAmbCielo * 1.1);
        c = mix(c, cieloRef, fres * 0.75 + 0.06);
        // reflejo del sol o de la luna
        float esp = pow(max(dot(reflect(-uSolDir, n), v), 0.0), 240.0);
        c += uSolColor * esp * (1.8 + 2.0 * uNoche) * sombra;
        // espuma en la orilla: una banda fija y otra que va y viene
        float orilla = smoothstep(0.022, 0.0, prof);
        float vaiven = 0.5 + 0.5 * sin(prof * 520.0 - uTiempo * 1.6 + ruido(p * 9.0) * 6.0);
        float espuma = orilla * (0.25 + 0.75 * smoothstep(0.55, 0.9, vaiven)) + smoothstep(0.004, 0.0, prof) * 0.6;
        c = mix(c, (uSolColor * 0.55 + uAmbCielo) * vec3(0.95), clamp(espuma, 0.0, 1.0) * 0.8);
        if (uFoco.w > 0.0) { float d = distance(vPos.xz, uFoco.xy); c *= mix(1.0, mix(0.42, 1.12, smoothstep(uFoco.z * 1.5, uFoco.z * 0.6, d)), uFoco.w); }
        float nb = 1.0 - exp(-pow(dist * uNieblaDens, 2.0));
        c = mix(c, uNiebla, nb);
        // en la orilla el agua es transparente y deja ver la arena
        float a = smoothstep(-0.004, 0.012, prof) * 0.5 + smoothstep(0.0, 0.05, prof) * 0.5;
        gl_FragColor = vec4(c, clamp(a + espuma * 0.5 + nb, 0.0, 1.0));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const malla = new THREE.Mesh(geo, mat);
  malla.position.y = 0;
  malla.renderOrder = 1;
  return malla;
}
