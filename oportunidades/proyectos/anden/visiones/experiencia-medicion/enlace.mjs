// Andén · visión «Experiencia» · medición propia (17-10-2026)
// ¿Entra un modelo entero en un enlace (en el «#», que no viaja a ningún servidor)? ¿Y en un código QR impreso?
// Se arma el DOCUMENTO DECLARATIVO completo del hub de la maqueta (layout, personas, turnos, camiones, curva cada 15 minutos,
// destinos, parámetros con su procedencia, escenarios y experimento) y se mide con tres codificaciones.
// Uso: node enlace.mjs   (necesita qrcode-generator en node_modules o en NODE_PATH; si no está, omite el QR)
import { HUB_BASE, geometria } from './hub.mjs';
import { deflateRawSync, brotliCompressSync, constants } from 'node:zlib';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const r2 = (x) => Math.round(x * 100) / 100;
export function documentoModelo(p = HUB_BASE) {
  const G = geometria(p);
  const ref = (v, u, dist, fuente, tipo, fecha = '2026-10-17') => ({ v, u, dist, fuente, tipo, fecha });
  const doc = {
    esquema: 'anden.modelo/0.1', id: 'hub-noche-24k', titulo: 'Hub de clasificación, turno noche, 24.000 paquetes',
    autor: 'seudónimo', licencia: 'CC-BY-4.0', creado: '2026-10-17T21:00:00-03:00', unidades: { largo: 'm', tiempo: 's', moneda: 'ARS' },
    plantilla: { id: 'hub-lazo', version: '1.0.0' },
    calendario: { turno: { inicio: '22:00', fin: '06:00' }, corte: '06:00', feriados: 'AR-2026' },
    biblioteca: {
      induccionMedia: ref(p.induccion.medio, 's/paquete', { tipo: 'lognormal', cv: p.induccion.cv }, 'oskon.com.tr (1.600/h sostenible)', 'ESTIMACIÓN'),
      fatiga: ref(p.induccion.fatiga, 'fracción', { tipo: 'exp', tau: p.induccion.tauFatiga }, 'Jaber, Givi y Neumann 2013 (WSC 2022)', 'ESTIMACIÓN'),
      ausentismo: ref(p.induccion.ausentismo, 'prob/día', { tipo: 'bernoulli' }, 'ADRHA vía EIL (tope 5%)', 'HECHO'),
      eficienciaTemporario: ref(p.induccion.eficienciaTemporario, 'fracción', null, 'Loske y Klumpp, IFAC 2020', 'HECHO'),
      noRead: ref(p.sorter.noRead, 'prob', { tipo: 'bernoulli' }, 'oskon.com.tr; cognex.com (98,5–99,9%)', 'ESTIMACIÓN'),
      descargaPersona: ref(p.andenes.paqPorHoraPersona, 'paq/h', { tipo: 'lognormal', cv: p.andenes.cv }, 'supuesto de la maqueta', 'HIPÓTESIS'),
      manejoRampa: ref(p.rampas.manejo, 's/paquete', { tipo: 'lognormal', cv: p.rampas.cvManejo }, 'supuesto de la maqueta', 'HIPÓTESIS'),
      cierreJaula: ref(p.rampas.cierreJaula, 's', null, 'supuesto de la maqueta', 'HIPÓTESIS'),
      costoHora: ref(13929, 'ARS/h productiva', null, 'apps/anden calculadora 3 (Camioneros 40/89)', 'ESTIMACIÓN'),
    },
    layout: {
      andenes: G.andenes.map((a, i) => ({ id: `A${i + 1}`, x: r2(a.x), y: r2(a.y), personas: p.andenes.personas })),
      cintas: G.andenes.map((a, i) => ({ id: `C${i + 1}`, desde: `A${i + 1}`, hasta: 'B1', largo: p.andenes.cintaLargo, vel: p.andenes.cintaVel,
        puntos: [[r2(a.x), r2(a.y + 2)], [r2(a.x), -10], [2, -10], [2, -3]] })),
      buffer: { id: 'B1', capacidad: p.buffer, regla: 'FIFO' },
      sorter: { id: 'S1', tipo: 'bandeja-basculante', forma: 'estadio', recta: p.sorter.recta, radio: r2(p.sorter.radio), paso: p.sorter.paso,
        vel: p.sorter.vel, maxVueltas: p.sorter.maxVueltas, lector: { id: 'L1', s: 12, noRead: '@noRead' } },
      induccion: G.estaciones.map((o, i) => ({ id: `I${i + 1}`, sorter: 'S1', s: r2(o.s), tiempo: '@induccionMedia' })),
      rampas: G.rampas.map((o, i) => ({ id: `R${String(i + 1).padStart(2, '0')}`, sorter: 'S1', s: r2(o.s), lado: o.lado, capacidad: p.rampas.capacidad,
        destino: `Ruta ${String(i + 1).padStart(2, '0')}`, jaula: { capacidad: p.rampas.jaula, cierre: '@cierreJaula' } })),
      excepcion: { id: 'RX', sorter: 'S1', s: r2(G.excepcion.s), puesto: { personas: p.manual.personas, tiempo: p.manual.tiempo } },
    },
    personas: [
      ...G.estaciones.map((_, i) => ({ id: `P-I${i + 1}`, rol: 'induccion', puesto: `I${i + 1}`, turno: 'noche',
        pausas: [0, 1, 2].map((m) => ({ inicio: (22 * 3600 + (m + 1) * p.induccion.cadaPausa + i * p.induccion.escalonPausa), dur: p.induccion.pausa })),
        antiguedadSemanas: 26, ausentismo: '@ausentismo' })),
      ...Array.from({ length: p.rampas.personas }, (_, w) => ({ id: `P-R${w + 1}`, rol: 'rampa', regla: 'la-mas-llena',
        rampas: G.rampas.map((_, r) => r).filter((r) => Math.floor(r * p.rampas.personas / G.rampas.length) === w).map((r) => `R${String(r + 1).padStart(2, '0')}`),
        turno: 'noche', manejo: '@manejoRampa' })),
      ...Array.from({ length: p.andenes.n * p.andenes.personas }, (_, k) => ({ id: `P-D${k + 1}`, rol: 'descarga', anden: `A${(k % p.andenes.n) + 1}`, turno: 'noche', ritmo: '@descargaPersona' })),
    ],
    llegadas: {
      camiones: Array.from({ length: p.camiones.n }, (_, i) => ({ turno: 22 * 3600 + i * p.camiones.cada, paquetes: p.camiones.paqMedio,
        desvio: { tipo: 'uniforme', min: p.camiones.desvioMin, max: p.camiones.desvioMax } })),
      curva15min: Array.from({ length: 96 }, (_, q) => (q >= 88 || q < 18) ? Math.round(923 * 4 * (0.8 + 0.4 * Math.sin(q))) : 0),
      destinos: { tipo: 'zipf', s: p.rampas.zipf, n: G.rampas.length },
    },
    costos: { personas: '@costoHora', alquilerM2Mes: 8.5, moneda: 'USD', fuente: 'apps/anden referencias (Cushman & Wakefield)' },
    escenarios: [
      { id: 'base', titulo: 'Como está hoy' },
      { id: 'mas-induccion', titulo: '+1 puesto de inducción', parche: [{ op: 'add', path: '/layout/induccion/-', value: { id: 'I5', sorter: 'S1', s: 11.6, tiempo: '@induccionMedia' } }] },
      { id: 'ruta1-doble', titulo: 'Ruta con más volumen en dos rampas', parche: [{ op: 'replace', path: '/layout/rampas/0/capacidad', value: 50 }] },
    ],
    experimento: { replicas: 'hasta-precision', precision: 0.02, confianza: 0.95, semillaRaiz: 20261017, numerosComunes: true,
      kpis: ['pctAlCorte', 'recirculacion', 'esperaP90', 'costoPorPaquete'] },
  };
  return doc;
}

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const medir = (obj) => {
  const json = JSON.stringify(obj), raw = Buffer.from(json);
  const def = deflateRawSync(raw, { level: 9 }), br = brotliCompressSync(raw, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } });
  return { jsonBytes: raw.length, deflateRawBytes: def.length, brotliBytes: br.length, fragmentoDeflate: b64url(def).length, fragmentoBrotli: b64url(br).length, fragmento: '#m=' + b64url(def) };
};

const doc = documentoModelo();
const completo = medir(doc);
// variante: plantilla publicada + parche (lo que cambió el usuario respecto de la plantilla)
const parche = { t: 'hub-lazo@1.0.0', p: [
  { op: 'replace', path: '/layout/sorter/vel', value: 2.2 },
  { op: 'replace', path: '/personas/4/rampas', value: ['R01'] },
  { op: 'replace', path: '/llegadas/destinos/s', value: 0.75 },
  { op: 'replace', path: '/biblioteca/induccionMedia/v', value: 2.6 },
  { op: 'add', path: '/layout/induccion/-', value: { id: 'I5', sorter: 'S1', s: 11.6, tiempo: '@induccionMedia' } },
] };
const conParche = medir(parche);
// receta de un resultado: con esto, el teléfono de quien abre el enlace recalcula la misma película bit a bit
const huella = createHash('sha256').update(JSON.stringify(doc)).digest();
const receta = { m: b64url(huella.subarray(0, 16)), motor: '0.1.0', semilla: 2, escena: 'peor-noche', t: 3 * 3600 + 1800, vel: 60 };
const conReceta = medir(receta);

let qr = null;
try {
  const req = createRequire(import.meta.url); const qrcode = req('qrcode-generator');
  const version = (txt, nivel) => { for (let v = 1; v <= 40; v++) { try { const q = qrcode(v, nivel); q.addData(txt, 'Byte'); q.make(); return v; } catch (e) { /* no entra */ } } return null; };
  const url = (frag) => 'https://anden.app/v' + frag;
  qr = {
    modeloCompleto: { caracteres: url(completo.fragmento).length, versionL: version(url(completo.fragmento), 'L'), versionM: version(url(completo.fragmento), 'M') },
    plantillaMasParche: { caracteres: url(conParche.fragmento).length, versionL: version(url(conParche.fragmento), 'L'), versionM: version(url(conParche.fragmento), 'M') },
    recetaDeEscena: { caracteres: url(conReceta.fragmento).length, versionL: version(url(conReceta.fragmento), 'L'), versionM: version(url(conReceta.fragmento), 'M') },
  };
} catch (e) { qr = { nota: 'qrcode-generator no disponible: ' + e.message }; }

const out = { fecha: '2026-10-17', limites: { qrVersion40L_bytes: 2953, urlChrome_MB: 2 },
  modeloCompleto: { ...completo, fragmento: undefined, objetos: { rampas: doc.layout.rampas.length, personas: doc.personas.length, camiones: doc.llegadas.camiones.length } },
  plantillaMasParche: { ...conParche, fragmento: undefined }, recetaDeEscena: { ...conReceta, fragmento: undefined }, qr };
writeFileSync(new URL('./resultados-enlace.json', import.meta.url), JSON.stringify(out, null, 1));
writeFileSync(new URL('./modelo-ejemplo.json', import.meta.url), JSON.stringify(doc, null, 1));
console.log(JSON.stringify(out, null, 1));
