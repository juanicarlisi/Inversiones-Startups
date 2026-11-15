// Niveles de calidad. Se elige uno al arrancar (o con ?calidad=alto|medio|bajo) y el juego baja solo si no llega a 30 cuadros.
export const NIVELES = {
  alto: { nombre: 'alto', dpr: 2, mallaTerreno: 440, olas: 2, pos: true, msaa: 4, nubes: 44, luces: 1 },
  medio: { nombre: 'medio', dpr: 1.5, mallaTerreno: 300, olas: 2, pos: true, msaa: 0, nubes: 28, luces: 1 },
  bajo: { nombre: 'bajo', dpr: 1, mallaTerreno: 180, olas: 1, pos: false, msaa: 0, nubes: 12, luces: 0 },
};

export function elegirCalidad(gl) {
  const q = new URLSearchParams(location.search).get('calidad');
  if (NIVELES[q]) return { ...NIVELES[q], fijo: true };
  let gpu = '';
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    gpu = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '');
  } catch { /* sin dato */ }
  const porSoftware = /swiftshader|llvmpipe|software|basic render/i.test(gpu);
  const nucleos = navigator.hardwareConcurrency ?? 4, memoria = navigator.deviceMemory ?? 4;
  const celular = /android|iphone|ipad|mobile/i.test(navigator.userAgent);
  if (porSoftware || nucleos <= 2 || memoria <= 2) return { ...NIVELES.bajo };
  if (celular || nucleos <= 4 || memoria <= 4) return { ...NIVELES.medio };
  return { ...NIVELES.alto };
}

// Mide cuadros por segundo y ajusta la resolución (y, si hace falta, apaga el posproceso).
export class Medidor {
  constructor() { this.n = 0; this.t0 = performance.now(); this.fps = 60; this.escala = 1; this.malos = 0; this.buenos = 0; this.historia = []; this.minimo = 99; }
  cuadro(ahora, alCambiar, fijo) {
    this.n++;
    const dt = ahora - this.t0;
    if (dt < 1500) return;
    this.fps = this.n * 1000 / dt; this.n = 0; this.t0 = ahora;
    this.historia.push(this.fps); if (this.historia.length > 40) this.historia.shift();
    this.minimo = Math.min(this.minimo, this.fps);
    if (fijo || document.hidden) return;
    if (this.fps < 27) { this.malos++; this.buenos = 0; } else if (this.fps > 52) { this.buenos++; this.malos = 0; } else { this.malos = 0; this.buenos = 0; }
    if (this.malos >= 2) { this.malos = 0; alCambiar(-1); }
    if (this.buenos >= 6) { this.buenos = 0; alCambiar(1); }
  }
}
