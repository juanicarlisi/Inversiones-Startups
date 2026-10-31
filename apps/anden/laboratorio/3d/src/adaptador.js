// Adaptador del contrato congelado Reproductor.posiciones() (apps/anden/simulador/contratos/vistas.ts) a matrices de InstancedMesh.
// Posiciones = {n, x[], y[], ang[], estado[]} en metros y radianes sobre el plano; el 3D usa plano (x, y) -> mundo (x, z) y altura propia.
// Sin dependencias: se puede llamar dentro de un Worker y transferir el Float32Array resultante.
export function posicionesAMatrices(pos, out, tam, alto, colores, estadoARgb) {
  const n = pos.n, [sx, sy, sz] = tam;
  for (let i = 0; i < n; i++) {
    const c = Math.cos(pos.ang[i]), s = Math.sin(pos.ang[i]), o = i * 16;
    out[o] = c * sx; out[o + 1] = 0; out[o + 2] = -s * sx; out[o + 3] = 0;
    out[o + 4] = 0; out[o + 5] = sy; out[o + 6] = 0; out[o + 7] = 0;
    out[o + 8] = s * sz; out[o + 9] = 0; out[o + 10] = c * sz; out[o + 11] = 0;
    out[o + 12] = pos.x[i]; out[o + 13] = alto + sy / 2; out[o + 14] = pos.y[i]; out[o + 15] = 1;
    if (colores) { const k = estadoARgb[pos.estado[i]] ?? 0; colores[i * 3] = ((k >> 16) & 255) / 255; colores[i * 3 + 1] = ((k >> 8) & 255) / 255; colores[i * 3 + 2] = (k & 255) / 255; }
  }
  return n;
}
