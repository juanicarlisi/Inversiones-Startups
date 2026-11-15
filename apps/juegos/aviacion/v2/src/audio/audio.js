// Sonido y música, generados por código con Tone.js (no hay archivos de audio).
// Música: una milonga lenta en re menor (ritmo 3-3-2) con guitarra pulsada, fuelle suave y campanitas; de noche se queda
// en fuelle y campanitas. Sonidos: cada acción del juego tiene el suyo.
import { start, getContext, getTransport, getDestination, now as ahoraTone, Gain, Filter, Reverb, FeedbackDelay, Synth, PolySynth, FMSynth, PluckSynth, NoiseSynth, MembraneSynth, Loop, Frequency, Meter } from 'tone';

let listo = false, arrancando = null, sonidos = true, musicaOn = true, medidor = null;
let busMusica, busSfx, reverb, eco, filtroFuelle, fuelle, guitarras = [], iG = 0, bajo, campana, sfx = {}, noche = 0, ganGuitarra;
const CLAVE = 'hubnocturno.v2.audio';
try { const g = JSON.parse(localStorage.getItem(CLAVE) ?? 'null'); if (g) { sonidos = g.s !== false; musicaOn = g.m !== false; } } catch { /* sin almacenamiento */ }
const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify({ s: sonidos, m: musicaOn })); } catch { /* sin almacenamiento */ } };

export const sonidoActivo = () => sonidos;
export const musicaActiva = () => musicaOn;
export function alternarSonido() { sonidos = !sonidos; guardar(); if (busSfx) busSfx.gain.rampTo(sonidos ? 0.9 : 0, 0.1); return sonidos; }
export function alternarMusica() { musicaOn = !musicaOn; guardar(); if (busMusica) busMusica.gain.rampTo(musicaOn ? 0.5 : 0, 0.6); return musicaOn; }
export function silenciar(si) { try { getDestination().mute = !!si; } catch { /* sin audio */ } }

// Progresión de 8 compases (re menor). Cada acorde: bajo, notas del acorde y notas buenas para la melodía.
const ACORDES = [
  { b: 'D2', a: ['D3', 'F3', 'A3', 'D4'], m: ['A4', 'D5', 'F5', 'E5'] },
  { b: 'D2', a: ['D3', 'F3', 'A3', 'C4'], m: ['F5', 'E5', 'D5', 'A4'] },
  { b: 'Bb1', a: ['Bb2', 'D3', 'F3', 'Bb3'], m: ['D5', 'F5', 'G5', 'F5'] },
  { b: 'F2', a: ['F3', 'A3', 'C4', 'F4'], m: ['C5', 'F5', 'A5', 'G5'] },
  { b: 'G2', a: ['G2', 'Bb2', 'D3', 'G3'], m: ['Bb4', 'D5', 'G5', 'F5'] },
  { b: 'D2', a: ['D3', 'F3', 'A3', 'D4'], m: ['A4', 'F5', 'E5', 'D5'] },
  { b: 'A1', a: ['A2', 'C#3', 'E3', 'G3'], m: ['E5', 'C#5', 'E5', 'G5'] },
  { b: 'D2', a: ['D3', 'F3', 'A3', 'D4'], m: ['D5', 'A4', 'D5', 'D5'] },
];
// Dibujos de melodía (en corcheas del compás; null = silencio). Se eligen con una cuenta fija: siempre suena igual de bien.
const DIBUJOS = [[0, null, null, 1, null, null, 2, null], [null, null, 0, null, 1, null, null, 3], [0, null, 1, null, null, 2, null, null], [null, 2, null, null, 1, null, 0, null], [0, null, null, null, null, null, 3, null]];

function armar() {
  const destino = getDestination();
  medidor = new Meter({ smoothing: 0.5 }); destino.connect(medidor);
  busMusica = new Gain(0).connect(destino); busSfx = new Gain(sonidos ? 0.9 : 0).connect(destino);
  reverb = new Reverb({ decay: 3.2, wet: 1 }); const envioRev = new Gain(0.32).connect(reverb); reverb.connect(busMusica);
  eco = new FeedbackDelay({ delayTime: '8n.', feedback: 0.28, wet: 0.3 }).connect(busMusica); eco.connect(envioRev);
  // fuelle: acordes largos, como un bandoneón lejos
  filtroFuelle = new Filter(900, 'lowpass').connect(busMusica); filtroFuelle.connect(envioRev);
  fuelle = new PolySynth(Synth, { oscillator: { type: 'fatsawtooth', count: 2, spread: 14 }, envelope: { attack: 0.5, decay: 0.3, sustain: 0.8, release: 1.6 }, volume: -25 }).connect(filtroFuelle);
  // guitarra pulsada (tres voces que se turnan)
  ganGuitarra = new Gain(1).connect(busMusica); ganGuitarra.connect(envioRev);
  for (let i = 0; i < 3; i++) guitarras.push(new PluckSynth({ attackNoise: 0.6, dampening: 3200, resonance: 0.965, volume: -10 }).connect(ganGuitarra));
  bajo = new Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.25, sustain: 0.35, release: 0.4 }, volume: -15 }).connect(busMusica);
  campana = new FMSynth({ harmonicity: 3.01, modulationIndex: 9, envelope: { attack: 0.002, decay: 1.1, sustain: 0, release: 1.2 }, modulationEnvelope: { attack: 0.002, decay: 0.4, sustain: 0, release: 0.4 }, volume: -19 }).connect(eco);
  campana.connect(envioRev);

  const tr = getTransport();
  tr.bpm.value = 88;
  let compas = 0;
  new Loop((tiempo) => {
    try { // si el equipo se traba, un compás puede llegar tarde: nunca tiene que romper el juego
      const k = compas % 8, ac = ACORDES[k], c8 = 60 / tr.bpm.value / 2;
      fuelle.triggerAttackRelease(ac.a.slice(0, 3), c8 * 7.4, tiempo, 0.5);
      // ritmo 3-3-2: bajo en las corcheas 0, 3 y 6
      [0, 3, 6].forEach((p, i) => bajo.triggerAttackRelease(i === 1 ? Frequency(ac.b).transpose(7).toNote() : ac.b, c8 * 1.6, tiempo + p * c8, i === 0 ? 0.9 : 0.6));
      if (noche < 0.75) {
        // arpegio de guitarra entre los golpes del bajo
        const orden = [1, 2, null, 3, 2, null, 1, 3];
        orden.forEach((n, p) => { if (n == null) return; guitarras[iG++ % 3].triggerAttack(Frequency(ac.a[n]).transpose(12).toNote(), tiempo + p * c8, 0.5 + 0.2 * (p % 3 === 0)); });
      }
      // melodía: un dibujo por compás; cada cuatro compases, uno de respiro
      if (compas % 4 !== 3 || noche > 0.5) {
        const d = DIBUJOS[(compas * 7 + (compas >> 3) * 3) % DIBUJOS.length];
        d.forEach((n, p) => { if (n == null) return; campana.triggerAttackRelease(noche > 0.5 ? Frequency(ac.m[n]).transpose(12).toNote() : ac.m[n], c8 * 1.5, tiempo + p * c8, 0.45 + 0.25 * (p === 0)); });
      }
      compas++;
    } catch { compas++; }
  }, '1m').start(0);

  // ── sonidos ──
  const a = (n) => n.connect(busSfx);
  sfx.pico = a(new Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.002, decay: 0.07, sustain: 0, release: 0.05 }, volume: -14 }));
  sfx.moneda = a(new PolySynth(Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.002, decay: 0.22, sustain: 0, release: 0.25 }, volume: -11 }));
  sfx.campana = new PolySynth(FMSynth, { harmonicity: 2.5, modulationIndex: 6, envelope: { attack: 0.002, decay: 0.9, sustain: 0, release: 0.9 }, modulationEnvelope: { attack: 0.002, decay: 0.3, sustain: 0, release: 0.3 }, volume: -14 });
  sfx.campana.connect(busSfx); sfx.campana.connect(new Gain(0.4).connect(reverb)); reverb.connect(busSfx);
  sfx.cuerda = a(new PluckSynth({ attackNoise: 1, dampening: 4200, resonance: 0.95, volume: -6 }));
  sfx.cuerda2 = a(new PluckSynth({ attackNoise: 1, dampening: 4200, resonance: 0.95, volume: -6 }));
  sfx.golpe = a(new MembraneSynth({ pitchDecay: 0.03, octaves: 3, envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.1 }, volume: -14 }));
  const filtroMotor = new Filter(520, 'lowpass').connect(busSfx);
  sfx.motor = new Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.25, decay: 0.2, sustain: 0.7, release: 0.9 }, volume: -22 }).connect(filtroMotor);
  const filtroAire = new Filter(1400, 'bandpass').connect(busSfx);
  sfx.aire = new NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.3, decay: 0.3, sustain: 0.4, release: 0.8 }, volume: -24 }).connect(filtroAire);
  sfx.filtroAire = filtroAire;
  sfx.grave = a(new Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }, volume: -10 }));
}

// Arranca el audio con el primer toque (los navegadores lo piden así).
export function iniciarAudio() {
  if (listo || arrancando) return arrancando;
  arrancando = start().then(() => {
    armar(); listo = true;
    getTransport().start('+0.1');
    busMusica.gain.rampTo(musicaOn ? 0.5 : 0, 2.5);
  }).catch(() => { arrancando = null; });
  return arrancando;
}
export function fijarNoche(n) {
  if (!listo || Math.abs(n - noche) < 0.02) return;
  noche = n;
  filtroFuelle.frequency.rampTo(900 - 420 * n, 1.5);
  ganGuitarra.gain.rampTo(1 - n, 2);
  bajo.volume.rampTo(-15 - 8 * n, 2);
}

const PENTA = ['D5', 'F5', 'G5', 'A5', 'C6', 'D6', 'F6', 'G6', 'A6', 'C7', 'D7'];
let ultimo = {};
export function sonar(cual, x = 0) {
  if (!listo || !sonidos) return;
  const t = ahoraTone();
  if ((ultimo[cual] ?? 0) > t - 0.045) return; // nunca dos iguales pegados
  ultimo[cual] = t;
  try {
    switch (cual) {
      case 'clic': sfx.pico.triggerAttackRelease('A5', 0.04, t, 0.5); break;
      case 'abrir': sfx.pico.triggerAttackRelease('D5', 0.05, t, 0.5); sfx.pico.triggerAttackRelease('A5', 0.05, t + 0.06, 0.4); break;
      case 'cerrar': sfx.pico.triggerAttackRelease('A5', 0.05, t, 0.4); sfx.pico.triggerAttackRelease('D5', 0.05, t + 0.06, 0.4); break;
      case 'ruta': ['D4', 'A4', 'D5', 'F#5', 'A5'].forEach((n, i) => (i % 2 ? sfx.cuerda2 : sfx.cuerda).triggerAttack(n, t + i * 0.085)); sfx.campana.triggerAttackRelease(['D6'], 0.6, t + 0.45, 0.5); break;
      case 'compra': sfx.moneda.triggerAttackRelease(['B5'], 0.1, t, 0.8); sfx.moneda.triggerAttackRelease(['E6', 'B6'], 0.3, t + 0.09, 0.8);
        sfx.motor.triggerAttackRelease('A1', 1.1, t + 0.25, 0.9); sfx.motor.frequency.rampTo(82, 0.9, t + 0.3); break;
      case 'despegue': sfx.motor.triggerAttackRelease('C2', 1.5, t, 0.8); sfx.motor.frequency.rampTo(104, 1.3, t + 0.05);
        sfx.filtroAire.frequency.setValueAtTime(700, t); sfx.filtroAire.frequency.rampTo(2200, 1.4, t); sfx.aire.triggerAttackRelease(1.3, t, 0.6); break;
      case 'aterriza': sfx.golpe.triggerAttackRelease('G1', 0.2, t, 0.6); sfx.filtroAire.frequency.setValueAtTime(1800, t); sfx.filtroAire.frequency.rampTo(500, 0.8, t); sfx.aire.triggerAttackRelease(0.6, t + 0.03, 0.4); break;
      case 'cobro': { const n = ['E6', 'G6', 'A6', 'B6'][Math.floor(Math.random() * 4)]; sfx.moneda.triggerAttackRelease(['B5'], 0.08, t, 0.7); sfx.moneda.triggerAttackRelease([n], 0.25, t + 0.07, 0.8); break; }
      case 'moneda': sfx.moneda.triggerAttackRelease([PENTA[4 + (x % 5)]], 0.08, t, 0.35); break;
      case 'mision': ['D5', 'F#5', 'A5', 'D6'].forEach((n, i) => sfx.campana.triggerAttackRelease([n], 0.5, t + i * 0.11, 0.8)); sfx.campana.triggerAttackRelease(['D5', 'A5', 'F#6'], 1.4, t + 0.5, 0.7); sfx.golpe.triggerAttackRelease('D2', 0.3, t + 0.5, 0.5); break;
      case 'faro': sfx.campana.triggerAttackRelease([PENTA[Math.min(PENTA.length - 1, x)]], 0.5, t, 0.55); break;
      case 'noche': sfx.campana.triggerAttackRelease(['A5'], 1, t, 0.4); sfx.campana.triggerAttackRelease(['F5'], 1, t + 0.35, 0.4); sfx.campana.triggerAttackRelease(['D5'], 1.6, t + 0.7, 0.45); break;
      case 'dia': sfx.campana.triggerAttackRelease(['D5'], 0.8, t, 0.35); sfx.campana.triggerAttackRelease(['A5'], 0.8, t + 0.25, 0.35); sfx.campana.triggerAttackRelease(['D6'], 1.4, t + 0.5, 0.4); break;
      case 'momento': sfx.campana.triggerAttackRelease(['A5'], 0.5, t, 0.5); sfx.campana.triggerAttackRelease(['D6'], 0.9, t + 0.14, 0.5); break;
      case 'error': sfx.grave.triggerAttackRelease('E3', 0.1, t, 0.7); sfx.grave.triggerAttackRelease('Eb3', 0.16, t + 0.12, 0.7); break;
      case 'ciudad': sfx.cuerda.triggerAttack('A4', t); sfx.cuerda2.triggerAttack('D5', t + 0.1); break;
      case 'paso': sfx.aire.triggerAttackRelease(0.35, t, 0.3); break;
      default: break;
    }
  } catch { /* un sonido que falla no rompe el juego */ }
}
export const audioListo = () => listo;
export const nivelContexto = () => { try { return getContext().state; } catch { return 'sin audio'; } };

// Nivel de salida en decibeles (para comprobar que suena y que no satura).
export const nivel = () => (medidor ? medidor.getValue() : -Infinity);
