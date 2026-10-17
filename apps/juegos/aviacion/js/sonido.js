// Sonidos sintetizados con WebAudio (sin archivos): cobro, compra, misión y tormenta.
let ctx = null, apagado = false, silenciado = false;
try { apagado = localStorage.getItem('hubnocturno.sonido') === 'no'; } catch { /* sin almacenamiento */ }

export const sonidoActivo = () => !apagado;
export function alternarSonido() {
  apagado = !apagado;
  try { localStorage.setItem('hubnocturno.sonido', apagado ? 'no' : 'si'); } catch { /* sin almacenamiento */ }
}
export function silenciar(si) { silenciado = si; }

function nota(f, t0, dur, tipo = 'sine', vol = 0.06) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = tipo; o.frequency.value = f;
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0 + dur + 0.05);
}

export function sonar(cual) {
  if (apagado || silenciado) return;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    if (cual === 'cobro') { nota(1318.5, t, 0.08, 'triangle', 0.025); }
    if (cual === 'compra') { nota(659.3, t, 0.12, 'triangle'); nota(987.8, t + 0.08, 0.18, 'triangle'); }
    if (cual === 'mision') { [523.3, 659.3, 784, 1046.5].forEach((f, i) => nota(f, t + i * 0.09, 0.28, 'triangle', 0.07)); }
    if (cual === 'error') { nota(220, t, 0.18, 'sawtooth', 0.03); }
    if (cual === 'tormenta') { nota(98, t, 0.6, 'sawtooth', 0.03); nota(73.4, t + 0.1, 0.7, 'sawtooth', 0.025); }
  } catch { /* sin audio */ }
}
