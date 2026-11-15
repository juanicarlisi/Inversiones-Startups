// Terreno (maqueta con relieve real) y mar. Leen dos texturas horneadas: alturas (R = km, G = ríos y lagos) y costa
// (distancia con signo a la orilla). El vértice se desplaza en la GPU, la costa sale nítida con cualquier zoom y la luz usa
// la normal calculada por píxel.
import * as THREE from 'three';
import { KM_A_Y } from './geo.js';

const RUIDO = /* glsl */`
  uniform sampler2D uRuido;
  float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float ruido(vec2 p) { return texture2D(uRuido, p / 16.0).g; }
  float fbm(vec2 p) { return texture2D(uRuido, p / 8.0).r; }
  float fbm2(vec2 p) { return texture2D(uRuido, p / 8.0).b; }
`;

// Sombras de nubes: un campo de ruido que se mueve con el viento (el mismo que desplaza las nubes).
const NUBES = /* glsl */`
  uniform vec2 uViento;
  float sombraNubes(vec2 xz) {
    vec4 r = texture2D(uRuido, (xz + uViento) * 0.02);
    return smoothstep(0.52, 0.70, r.r * 0.75 + r.b * 0.25);
  }
`;
const COSTA = /* glsl */`
  uniform sampler2D uCosta;
  // distancia a la orilla en unidades de mundo: positiva en tierra, negativa en el mar
  float costa(vec2 uv) { return (texture2D(uCosta, uv).r - 0.50196) * 1.00394; }
`;
const FOCO = /* glsl */`
  uniform vec4 uFoco;
  vec3 foco(vec3 c, vec2 xz) {
    if (uFoco.w <= 0.0) return c;
    float d = distance(xz, uFoco.xy);
    return c * mix(1.0, mix(0.45, 1.08, smoothstep(uFoco.z * 1.5, uFoco.z * 0.6, d)), uFoco.w);
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
    uCosta: { value: relieve.texCosta },
    uSuelo: { value: texSuelo },
    uTam: { value: new THREE.Vector2(relieve.ancho, relieve.alto) },
    uMundo: { value: new THREE.Vector2(w, h) },
    uK: { value: KM_A_Y },
    uViento: { value: new THREE.Vector2() },
    uFoco: { value: new THREE.Vector4(0, 0, 0, 0) }, // x,z, radio, intensidad: resalta una zona (guía)
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    defines: { DETALLE: calidad.olas },
    vertexShader: /* glsl */`
      uniform sampler2D uAlt; uniform float uK;
      ${COSTA}
      varying vec2 vUv; varying vec3 vPos;
      void main() {
        vUv = uv;
        float km = texture2D(uAlt, uv).r, d = costa(uv);
        vec3 p = position;
        p.y = d > 0.0 ? max(km, 0.002) * uK * smoothstep(0.0, 0.02, d) + 0.0015 : max(d * 0.35, -0.05);
        vPos = p;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform sampler2D uAlt, uSuelo;
      uniform vec2 uTam, uMundo; uniform float uK, uNoche, uTiempo, uNieblaDens;
      uniform vec3 uSolDir, uSolColor, uAmbCielo, uAmbSuelo, uNiebla;
      varying vec2 vUv; varying vec3 vPos;
      ${RUIDO}
      ${NUBES}
      ${COSTA}
      ${FOCO}
      float alt(vec2 uv) { return max(texture2D(uAlt, uv).r, 0.0); }
      void main() {
        float dC = costa(vUv);
        if (dC < -0.07) discard;                      // bajo el mar profundo no se ve: lo tapa el agua
        vec2 ag = texture2D(uAlt, vUv).rg;
        float km = max(ag.r, 0.0);
        vec2 px = 1.0 / uTam;
        float dx = uMundo.x * px.x, dz = uMundo.y * px.y;
        #if DETALLE > 1
        float hO = alt(vUv - vec2(px.x, 0.0)), hE = alt(vUv + vec2(px.x, 0.0));
        float hN = alt(vUv - vec2(0.0, px.y)), hS = alt(vUv + vec2(0.0, px.y));
        vec3 n = normalize(vec3(-(hE - hO) * uK / (2.0 * dx), 1.0, -(hS - hN) * uK / (2.0 * dz)));
        #else
        float hE = alt(vUv + vec2(px.x, 0.0)), hS = alt(vUv + vec2(0.0, px.y));
        vec3 n = normalize(vec3(-(hE - km) * uK / dx, 1.0, -(hS - km) * uK / dz));
        #endif
        float dist = distance(cameraPosition, vPos);
        float cerca = smoothstep(26.0, 5.0, dist);    // cuánto detalle fino se muestra
        vec4 r4 = texture2D(uRuido, vPos.xz * 1.125);
        float g1 = r4.r;
        #if DETALLE > 1
        float g2 = fbm2(vPos.xz * 31.0 + 7.0);
        #else
        float g2 = r4.b;
        #endif
        n = normalize(n + vec3(g1 - 0.5, 0.0, g2 - 0.5) * 0.12);
        float pend = 1.0 - n.y;

        vec4 s = texture2D(uSuelo, vUv);
        vec3 col = s.rgb;                              // la textura es sRGB: la GPU ya la pasa a lineal
        float lum = dot(col, vec3(0.3, 0.6, 0.1));
        col = max(mix(vec3(lum), col, 1.9), 0.0);     // más saturado que la cartografía de origen
        float verdor = clamp((col.g - col.r) * 6.0 + 0.35, 0.0, 1.0);   // 1 = verde (campo, selva); 0 = seco
        col *= mix(vec3(0.62, 0.56, 0.46), vec3(0.40, 0.60, 0.34), verdor);
        col *= 0.84 + 0.34 * g1;                      // manchas grandes
        #if DETALLE > 1
        // de cerca: parcelas de campo y manchas de monte, como en una maqueta
        vec2 q = mat2(0.94, -0.34, 0.34, 0.94) * vPos.xz * 11.0 + vec2(g1, fbm2(vPos.xz * 3.0)) * 1.6;
        vec2 celda = floor(q), fr = fract(q);
        float tono = hash21(celda);
        float borde = smoothstep(0.0, 0.06, fr.x) * smoothstep(1.0, 0.94, fr.x) * smoothstep(0.0, 0.06, fr.y) * smoothstep(1.0, 0.94, fr.y);
        float llano = smoothstep(0.10, 0.03, pend) * cerca;
        vec3 parcela = col * mix(vec3(0.78, 0.86, 0.7), vec3(1.22, 1.16, 0.9), tono) * mix(0.8, 1.0, borde);
        col = mix(col, parcela, llano * (0.25 + 0.5 * verdor));
        float monte = smoothstep(0.56, 0.7, ruido(vPos.xz * 70.0) * 0.6 + g2 * 0.5) * cerca * verdor * smoothstep(0.2, 0.0, pend);
        col = mix(col, col * vec3(0.5, 0.72, 0.5), monte * 0.75);
        #endif
        // roca en las pendientes, nieve arriba (la línea de nieve baja hacia el sur)
        vec3 roca = vec3(0.36, 0.31, 0.27) * (0.8 + 0.5 * g2);
        col = mix(col, roca, smoothstep(0.08, 0.3, pend) * 0.85);
        float lat = vUv.y;                            // 0 = norte, 1 = sur
        float lineaNieve = mix(4.9, 0.9, smoothstep(0.45, 1.0, lat));
        float nieve = smoothstep(lineaNieve - 0.5, lineaNieve + 0.5, km + (g1 - 0.5) * 0.9);
        col = mix(col, vec3(0.86, 0.90, 0.97), nieve);
        // playa: una franja de arena pegada a la orilla
        float playa = smoothstep(0.03 + 0.02 * g1, 0.004, dC) * (1.0 - nieve) * smoothstep(0.25, 0.02, km);
        col = mix(col, vec3(0.70, 0.60, 0.40), playa * 0.9);
        // fondo cerca de la orilla (se ve a través del agua)
        if (dC <= 0.0) col = mix(vec3(0.66, 0.58, 0.40), vec3(0.08, 0.30, 0.36), smoothstep(0.0, -0.05, dC));
        // fronteras: una costura punteada apenas visible, como en un mapa de maqueta
        float frn = (1.0 - s.a) * step(0.0, dC);
        float punto = step(0.5, fract((vPos.x + vPos.z) * 7.0));
        col = mix(col, col * 0.5 + vec3(0.07, 0.05, 0.04), frn * punto * 0.7);
        // ríos y lagos
        float agua = smoothstep(0.36, 0.5, ag.g) * step(0.0, dC);
        vec3 rio = mix(vec3(0.05, 0.22, 0.40), vec3(0.08, 0.36, 0.48), 0.5 + 0.5 * sin(uTiempo * 0.8 + vPos.x * 9.0 + vPos.z * 7.0));
        col = mix(col, rio, agua);
        n = normalize(mix(n, vec3(0.0, 1.0, 0.0), agua));

        #if DETALLE > 1
        float sombra = 1.0 - 0.42 * sombraNubes(vPos.xz + uSolDir.xz * 1.6 / max(uSolDir.y, 0.25));
        #else
        float sombra = 1.0;
        #endif
        float dif = max(dot(n, uSolDir), 0.0);
        dif = mix(dif, dot(n, uSolDir) * 0.5 + 0.5, 0.4);
        vec3 amb = mix(uAmbSuelo, uAmbCielo, n.y * 0.5 + 0.5) * 1.15;
        vec3 luzT = uSolColor * dif * sombra + amb;
        // de noche el suelo se enfría y pierde color
        float l2 = dot(col, vec3(0.3, 0.6, 0.1));
        col = mix(col, vec3(l2) * vec3(0.6, 0.76, 1.25), uNoche * 0.66);
        vec3 c = col * luzT;
        // brillo del agua dulce
        vec3 v = normalize(cameraPosition - vPos);
        c += agua * uSolColor * pow(max(dot(reflect(-uSolDir, n), v), 0.0), 60.0) * 0.5;
        c = foco(c, vPos.xz);
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
    uCosta: { value: relieve.texCosta },
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
      uniform sampler2D uAlt; uniform vec4 uCaja;
      uniform float uTiempo, uNoche, uNieblaDens;
      uniform vec3 uSolDir, uSolColor, uAmbCielo, uNiebla, uCenit, uHoriz;
      varying vec3 vPos;
      ${RUIDO}
      ${NUBES}
      ${COSTA}
      ${FOCO}
      void main() {
        vec2 uv = (vPos.xz - uCaja.xy) / uCaja.zw;
        float dentro = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
        vec2 uvc = clamp(uv, 0.0, 1.0);
        float dC = mix(-0.5, costa(uvc), dentro);
        if (dC > 0.003) discard;
        float prof = max(-mix(-4.0, texture2D(uAlt, uvc).r, dentro), 0.0);
        float dist = distance(cameraPosition, vPos);
        vec2 p = vPos.xz;
        vec4 w4 = texture2D(uRuido, (p * 3.1 + vec2(uTiempo * 0.10, uTiempo * 0.04)) / 8.0);
        float g = w4.g;
        // color: turquesa junto a la costa, azul sobre la plataforma, azul noche en el mar profundo
        vec3 poco = vec3(0.05, 0.42, 0.46), medio = vec3(0.02, 0.20, 0.38), hondo = vec3(0.008, 0.06, 0.17);
        float cercaCosta = smoothstep(-0.30 - 0.1 * g, -0.01, dC);
        vec3 col = mix(medio, hondo, smoothstep(0.12, 2.8, prof));
        col = mix(col, poco, cercaCosta * (0.55 + 0.45 * smoothstep(0.2, 0.0, prof)));
        col *= 0.9 + 0.2 * g;
        // olas: ruido que se mueve en dos direcciones; el detalle fino se apaga a lo lejos
        float fino = smoothstep(30.0, 6.0, dist);
        #if OLAS > 1
        vec2 gr = vec2(w4.r, fbm2(p * 3.1 + 11.0 - vec2(uTiempo * 0.07, uTiempo * 0.09))) - 0.5;
        #else
        vec2 gr = w4.rb - 0.5;
        #endif
        #if OLAS > 1
        gr += (vec2(ruido(p * 14.0 + uTiempo * vec2(0.5, 0.2)), ruido(p * 14.0 + 5.0 - uTiempo * vec2(0.3, 0.45))) - 0.5) * 0.7 * fino;
        gr += (vec2(ruido(p * 46.0 + uTiempo * vec2(0.9, 0.5)), ruido(p * 46.0 + 9.0 - uTiempo * vec2(0.6, 0.8))) - 0.5) * 0.5 * fino * fino;
        #endif
        float rizo = 0.34 * mix(0.3, 1.0, fino);
        vec3 n = normalize(vec3(-gr.x * rizo, 1.0, -gr.y * rizo));
        vec3 v = normalize(cameraPosition - vPos);
        float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
        vec3 cieloRef = mix(uHoriz, uCenit, clamp(reflect(-v, normalize(mix(vec3(0.0, 1.0, 0.0), n, 0.3))).y * 1.6, 0.0, 1.0)); // el reflejo del cielo, suave: sin manchas
        #if OLAS > 1
        float sombra = 1.0 - 0.4 * sombraNubes(vPos.xz + uSolDir.xz * 1.6 / max(uSolDir.y, 0.25));
        float chispa = smoothstep(0.93, 1.0, texture2D(uRuido, p * 0.8 + uTiempo * vec2(0.013, 0.007)).a) * fino;   // destellos de un píxel, no manchas
        float ondas = ruido(p * 12.0) * 0.012;
        float rompe = 0.35 + 0.65 * ruido(p * 25.0 + uTiempo * 0.3);
        #else
        float sombra = 1.0, chispa = 0.0, ondas = w4.g * 0.012, rompe = 0.4 + 0.6 * w4.a;
        #endif
        float dif = max(dot(n, uSolDir), 0.0);
        vec3 c = col * (uSolColor * dif * sombra * 0.95 + uAmbCielo * 1.15);
        c = mix(c, cieloRef, fres * 0.7 + 0.05);
        // reflejo del sol o de la luna: un camino de destellos
        float esp = pow(max(dot(reflect(-uSolDir, n), v), 0.0), 90.0);
        c += uSolColor * esp * (0.16 + 2.2 * chispa + 1.2 * uNoche) * sombra;
        // espuma: una línea en la orilla y dos olas que llegan
        float linea = smoothstep(-0.011, -0.002, dC);
        float fase = fract(-dC * 16.0 - uTiempo * 0.16 + ondas * 30.0);
        float llega = smoothstep(-0.085, -0.012, dC) * smoothstep(0.80, 0.97, fase) * rompe;
        float espuma = clamp(linea * 0.9 + llega * 0.55 * (0.3 + 0.7 * fino), 0.0, 1.0);
        vec3 blanco = uSolColor * 0.5 + uAmbCielo * 1.1;
        c = mix(c, mix(blanco, vec3(dot(blanco, vec3(0.3, 0.6, 0.1))), 0.55), espuma * 0.85);
        c = foco(c, vPos.xz);
        float nb = 1.0 - exp(-pow(dist * uNieblaDens, 2.0));
        c = mix(c, uNiebla, nb);
        // en la orilla el agua es transparente y deja ver la arena
        float a = 0.25 + 0.75 * smoothstep(0.0, -0.035, dC);
        gl_FragColor = vec4(c, clamp(a + espuma + nb, 0.0, 1.0));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const malla = new THREE.Mesh(geo, mat);
  malla.renderOrder = 1;
  return malla;
}
