// integracion/pruebas/e-explicador.test.ts · Andén simulador, corte 1 · Integración: E01 y E02 (corte-1.md §8 y §12.5) con el hub real
// (P4), el explicador (P7) y el motor de producción (P1). Lo que se mide es la honestidad del explicador: una frase causal solo se
// muestra si el contrafactual la confirma, y eso se controla acá con una corrida INDEPENDIENTE de la misma noche con el cambio (la prueba
// simula la variante con el hub, sin pasar por el contrafactual de P7).
//
// E01, como la decidió la integración (integracion/NOTAS-CONTRATO.md §2, a partir de explicacion/NOTAS-CONTRATO.md §6). La letra de §8
// («todo paquete que pierde el corte con una espera en rampa de ≥ 5 min superpuesta a una pausa tiene la causa PAUSA confirmada») pide
// que el explicador confirme también lo que el contrafactual desmiente: con el corte a las 00:30 el hub chico pierde el corte por
// capacidad aunque no haya pausas (MEDIDO: solo ~11% de esos paquetes llega sin pausas). Se exige, en los dos escenarios:
//   (a) solidez: 0 frases de PAUSA sin que el mismo paquete llegue al corte en la misma noche sin pausas de rampa (corrida aparte);
//   (b) completitud: de los paquetes que sí llegan sin pausas, ≥ 95% tiene la frase de PAUSA;
// con el corte de la letra (00:30) y con el de la plantilla (01:30), pausas de rampa de 45 min. La fracción literal se informa.
//
// E02 (letra de §8): dos causas que se sobredeterminan (micro-paradas forzadas de 40 min y pausas de rampa de 40 min): 0 frases causales
// sin confirmar en 50 paquetes × 10 réplicas; la causa conjunta aparece solo si el contrafactual conjunto la confirma.
//
// Réplicas: con ANDEN_COMPLETA=1 las de la letra (50 en E01); en `npm test`, una muestra (cada réplica de E01 son ~20 noches del hub con
// sus contrafactuales: las 50 × 2 escenarios pasan los 3 minutos de §12.1). El informe de salida usa la corrida completa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ClaseEntidad, TipoTramo, claseDeRef, idDeRef, type Traza } from '../../contratos/traza.ts';
import type { Contrafactual, Frase } from '../../contratos/explicacion.ts';
import type { ModeloValidado, OpParche } from '../../contratos/modelo.ts';
import { causasConfirmadas, MARGEN_DE_ADELANTO_MS, UMBRAL_ESPERA_MS } from '../../explicacion/indice.ts';
import { ensamblar } from '../ensamblar.ts';

const E = ensamblar();
const COMPLETA = process.env.ANDEN_COMPLETA === '1';
const REPLICAS_E01 = COMPLETA ? 50 : 4;
const REPLICAS_E02 = 10;
const PAQUETES_E02 = 50;

async function variante(mv: ModeloValidado, parche: OpParche[]): Promise<ModeloValidado> {
  return E.variante(mv, parche);
}
async function plantillaChica(): Promise<ModeloValidado> {
  const c = await E.compilar(E.plantillas['hub-chico@1.0.0']);
  if (!c.ok) throw new Error('hub-chico@1.0.0 no compila');
  return c.mv;
}

/** Cuándo quedó listo cada paquete en una noche, por su clave estable (camión, índice). */
function listosDe(t: Traza): Map<number, number> {
  const P = t.paquetes, m = new Map<number, number>();
  for (let i = 0; i < P.n; i++) m.set(P.camion[i] * 1_000_000 + P.indice[i], P.listo[i]);
  return m;
}
const antesDelCorte = (listo: number | undefined, corte: number) => listo !== undefined && listo >= 0 && listo <= corte;

/** Noches de una réplica, recordadas por parche (la prueba simula las variantes por su cuenta, sin el contrafactual de P7). */
function crearNoches(mv: ModeloValidado, semilla: number, replica: number) {
  const memo = new Map<string, Promise<Traza>>();
  return (parche: OpParche[]): Promise<Traza> => {
    const clave = JSON.stringify(parche);
    let p = memo.get(clave);
    if (!p) {
      p = (async () => {
        const m = parche.length ? await variante(mv, parche) : mv;
        const t = E.simularNoche(m, semilla, replica, { traza: 'completa' }).traza;
        if (!t) throw new Error('la noche volvió sin traza');
        return t;
      })();
      memo.set(clave, p);
    }
    return p;
  };
}

/** Causas de un paquete con el contrafactual real (P7 + hub + núcleo). */
function causasDe(t: Traza, mv: ModeloValidado, camion: number, indice: number) {
  return causasConfirmadas(t, mv, t.semilla, t.replica, camion, indice,
    (cambio: Contrafactual['cambio']) => E.contrafactual(E.simularNoche, mv, t.semilla, t.replica, camion, indice, cambio, E.variante));
}

// ------------------------------------------------------------------------------------------------ E01

/**
 * Paquetes que pierden el corte con una espera en RAMPA ≥ 5 min superpuesta a una pausa de la persona que atiende la rampa, con al
 * menos 5 min de la espera DENTRO de la pausa. Desde el motor 1.1.0 (hallazgo R3) mientras una persona está en pausa sus rampas las
 * atiende otra: una espera que apenas roza la pausa ya no es una espera «por la pausa» (la persona estaba trabajando, o cerrando una
 * jaula, casi todo el tiempo) y el explicador, bien, no la atribuye a la pausa (integracion/CAMBIOS-CONTRATO.md §2).
 */
function esperanSobrePausa(t: Traza): number[] {
  const T = t.tramos, P = t.paquetes;
  const pausas = new Map<number, [number, number][]>();
  for (let i = 0; i < T.n; i++) {
    if (T.k[i] !== TipoTramo.PERSONA_PAUSA) continue;
    const l = pausas.get(T.e[i]) ?? [];
    l.push([T.t0[i], T.t1[i]]);
    pausas.set(T.e[i], l);
  }
  const out = new Set<number>();
  for (let i = 0; i < T.n; i++) {
    if (T.k[i] !== TipoTramo.RAMPA || T.t1[i] - T.t0[i] < UMBRAL_ESPERA_MS) continue;
    const e = T.e[i];
    if (antesDelCorte(P.listo[e], t.corte)) continue;
    const q = T.q[i];
    if (q < 0 || claseDeRef(q) !== ClaseEntidad.PERSONA) continue;
    const solape = (pausas.get(idDeRef(q)) ?? []).reduce((n, [a, b]) => n + Math.max(0, Math.min(b, T.t1[i]) - Math.max(a, T.t0[i])), 0);
    if (solape >= UMBRAL_ESPERA_MS) out.add(e);
  }
  return [...out].sort((a, b) => a - b);
}

async function e01(corte: string): Promise<{ candidatos: number; rescatados: number; conPausa: number; falsas: string[]; faltan: string[] }> {
  const base = await plantillaChica();
  const mv = await variante(base, [
    { op: 'replace', path: '/calendario/corte', value: corte },
    { op: 'replace', path: '/personas/rampa/pausas/duracion', value: 2700 },
  ]);
  const semilla = mv.modelo.experimento.semilla;
  let candidatos = 0, rescatados = 0, conPausa = 0;
  const falsas: string[] = [], faltan: string[] = [];
  for (let r = 0; r < REPLICAS_E01; r++) {
    const noches = crearNoches(mv, semilla, r);
    const t = await noches([]);
    const sinPausas = listosDe(await noches([{ op: 'replace', path: '/personas/rampa/pausas/duracion', value: 0 }]));
    for (const e of esperanSobrePausa(t)) {
      candidatos++;
      const camion = t.paquetes.camion[e], indice = t.paquetes.indice[e];
      const llega = antesDelCorte(sinPausas.get(camion * 1_000_000 + indice), t.corte);
      if (llega) rescatados++;
      const { causas } = await causasDe(t, mv, camion, indice);
      const pausa = causas.some((f) => f.clave === 'explicacion.causa.pausa');
      if (pausa) conPausa++;
      const quien = `réplica ${r}, paquete (camión ${camion}, índice ${indice})`;
      if (pausa && !llega) falsas.push(quien);
      if (!pausa && llega) faltan.push(quien);
    }
  }
  return { candidatos, rescatados, conPausa, falsas, faltan };
}

for (const [corte, nombre] of [['24:30', 'corte a las 00:30 (la letra de §8)'], ['25:30', 'corte a la 01:30 (el de la plantilla)']] as const) {
  test(`E01 · ${nombre}, pausas de rampa de 45 min: 0 frases de PAUSA sin confirmar y ≥ 95% de las que corresponden`, async () => {
    const r = await e01(corte);
    const completitud = r.rescatados ? r.conPausa / r.rescatados : 1;
    console.log(`E01 ${corte} · ${REPLICAS_E01} réplicas · ${r.candidatos} paquetes pierden el corte esperando ≥ 5 min sobre una pausa · ` +
      `${r.rescatados} (${(100 * r.rescatados / Math.max(1, r.candidatos)).toFixed(1)}%: la letra de §8) llegan sin pausas · ` +
      `${r.conPausa} con la frase de PAUSA · falsas ${r.falsas.length} · faltan ${r.faltan.length} (${(100 * completitud).toFixed(1)}% de completitud)`);
    assert.ok(r.candidatos > 0, `el escenario tenía que tener paquetes que pierden el corte esperando sobre una pausa y no hubo ninguno`);
    assert.deepEqual(r.falsas, [], `(a) se esperaban 0 frases de PAUSA sin confirmar y hubo ${r.falsas.length}: ${r.falsas.slice(0, 5).join('; ')}`);
    assert.ok(completitud >= 0.95, `(b) se esperaba la frase de PAUSA en ≥ 95% de los ${r.rescatados} paquetes que llegan sin pausas y estuvo en ` +
      `${(100 * completitud).toFixed(1)}%; faltan, por ejemplo: ${r.faltan.slice(0, 5).join('; ')}`);
  });
}

// ------------------------------------------------------------------------------------------------ E02

/** Tipo de causa de una frase causal de P7 (o null si no es una frase causal de una sola causa). */
function tipoDeFrase(f: Frase): string | null {
  const m = /^explicacion\.causa\.([a-z_]+)(\.adelanto)?$/.exec(f.clave);
  return m && m[1] !== 'conjunta' ? m[1] : null;
}
/** Tipos cuyo cambio fijo puede respaldar una frase de ese tipo (fila y bloqueo comparten «un puesto más»: P7, NOTAS §8). */
const CAMBIOS_DE: Record<string, string[]> = { fila: ['fila', 'bloqueo'], bloqueo: ['fila', 'bloqueo'] };
/** El cambio fijo de cada causa según corte-1.md §9 P7, para comprobar que el contrafactual probó lo que dice la frase. */
function esElCambioFijo(tipo: string, parche: OpParche[]): boolean {
  const p = parche[0] as { op: string; path: string; value?: unknown } | undefined;
  if (!p || parche.length !== 1 || p.op !== 'replace') return false;
  switch (tipo) {
    case 'pausa': return /^\/personas\/(rampa|induccion)\/pausas\/duracion$/.test(p.path) && p.value === 0;
    case 'ausencia': return p.path === '/personas/induccion/reten';
    case 'rampa_llena': return /^\/hub\/rampas\/\d+\/capacidad$/.test(p.path);
    case 'falla': return p.path === '/hub/sorter/paradas/activas' && p.value === false;
    case 'fila': case 'bloqueo': return p.path === '/personas/induccion/puestosActivos';
    case 'no_leido': return p.path === '/hub/sorter/lector/noLeido' && p.value === 0;
    case 'cierre_jaula': return p.path === '/hub/jaulas/cierre' && p.value === 0;
    default: return false;
  }
}

test('E02 · dos causas que se sobredeterminan: 0 frases causales sin confirmar en 50 paquetes × 10 réplicas', async () => {
  const base = await plantillaChica();
  const mv = await variante(base, [
    { op: 'replace', path: '/calendario/corte', value: '26:00' },
    { op: 'replace', path: '/hub/sorter/paradas/activas', value: true },
    { op: 'replace', path: '/parametros/paradaLazoEntre/valor', value: { tipo: 'fija', valor: 3600 } },
    { op: 'replace', path: '/parametros/paradaLazoDuracion/valor', value: { tipo: 'fija', valor: 2400 } },
    { op: 'replace', path: '/personas/rampa/pausas/duracion', value: 2400 },
  ]);
  const semilla = mv.modelo.experimento.semilla;
  const SIN_PARADAS: OpParche[] = [{ op: 'replace', path: '/hub/sorter/paradas/activas', value: false }];
  const SIN_PAUSAS: OpParche[] = [{ op: 'replace', path: '/personas/rampa/pausas/duracion', value: 0 }];
  let paquetes = 0, frasesSolas = 0, conjuntas = 0, sinCausa = 0, nochesSuficientes = 0;
  const sinConfirmar: string[] = [];
  for (let r = 0; r < REPLICAS_E02; r++) {
    const noches = crearNoches(mv, semilla, r);
    const t = await noches([]);
    // cada causa, sola, alcanza para perder el corte: con solo las pausas (sin paradas) y con solo las paradas (sin pausas) hay pendientes
    const pend = (x: Traza) => { let n = 0; for (let i = 0; i < x.paquetes.n; i++) if (!antesDelCorte(x.paquetes.listo[i], x.corte)) n++; return n; };
    if (pend(await noches(SIN_PARADAS)) > 0 && pend(await noches(SIN_PAUSAS)) > 0) nochesSuficientes++;
    let elegidos = 0;
    for (let e = 0; e < t.paquetes.n && elegidos < PAQUETES_E02; e++) {
      if (antesDelCorte(t.paquetes.listo[e], t.corte)) continue;
      const camion = t.paquetes.camion[e], indice = t.paquetes.indice[e];
      const { causas, contrafactuales } = await causasDe(t, mv, camion, indice);
      if (contrafactuales.length === 0) continue;               // sin candidatas no hay nada que afirmar: no cuenta entre los 50
      elegidos++; paquetes++;
      if (causas.length === 0) sinCausa++;
      const quien = `réplica ${r}, paquete (camión ${camion}, índice ${indice})`;
      const antes = listosDe(t).get(camion * 1_000_000 + indice);
      /** Corrida independiente de la variante: ¿el paquete llega antes del corte, o 5 min antes si ya llegaba? */
      const confirmaAparte = async (parche: OpParche[]) => {
        const despues = listosDe(await noches(parche)).get(camion * 1_000_000 + indice);
        return antesDelCorte(antes, t.corte)
          ? despues !== undefined && despues >= 0 && antes! - despues >= MARGEN_DE_ADELANTO_MS
          : antesDelCorte(despues, t.corte);
      };
      for (const f of causas) {
        if (f.clave === 'explicacion.causa.conjunta' || f.clave === 'explicacion.causa.conjunta.adelanto') {
          conjuntas++;
          const c = contrafactuales.find((x) => x.cambio.clave === 'explicacion.cambio.conjunta' && x.confirma);
          if (!c || !(await confirmaAparte(c.cambio.parche))) sinConfirmar.push(`${quien}: causa conjunta sin un contrafactual conjunto que la confirme`);
          continue;
        }
        if (f.clave.startsWith('explicacion.causa.conjunta.')) {
          // componente de la conjunta: tiene que haberse probado sola y NO haber confirmado (si no, iría como causa sola)
          const tipo = f.clave.slice('explicacion.causa.conjunta.'.length);
          const solas = contrafactuales.filter((x) => (CAMBIOS_DE[tipo] ?? [tipo]).some((k) => x.cambio.clave === `explicacion.cambio.${k}`) &&
            (tipo !== 'rampa_llena' || x.cambio.vars.rampa === f.vars.rampa));
          if (solas.length === 0 || solas.some((x) => x.confirma)) sinConfirmar.push(`${quien}: componente ${tipo} de la conjunta mal armado`);
          continue;
        }
        const tipo = tipoDeFrase(f);
        if (!tipo) continue;                                     // no es una frase causal
        frasesSolas++;
        const respaldo = contrafactuales.find((x) => x.confirma && (CAMBIOS_DE[tipo] ?? [tipo]).some((k) => x.cambio.clave === `explicacion.cambio.${k}`) &&
          (tipo !== 'rampa_llena' || x.cambio.vars.rampa === f.vars.rampa) && esElCambioFijo(tipo, x.cambio.parche));
        if (!respaldo) { sinConfirmar.push(`${quien}: «${f.clave}» sin un contrafactual que la confirme con el cambio fijo de su causa`); continue; }
        if (!(await confirmaAparte(respaldo.cambio.parche))) sinConfirmar.push(`${quien}: «${f.clave}» confirmada por P7 pero no en la corrida aparte`);
      }
    }
  }
  console.log(`E02 · ${REPLICAS_E02} réplicas · ${paquetes} paquetes con candidatas · ${frasesSolas} frases de una causa · ${conjuntas} conjuntas · ` +
    `${sinCausa} sin causa afirmable · ${nochesSuficientes} de ${REPLICAS_E02} noches donde cada causa sola alcanza · sin confirmar ${sinConfirmar.length}`);
  assert.equal(paquetes, PAQUETES_E02 * REPLICAS_E02, `se esperaban ${PAQUETES_E02} paquetes con candidatas por réplica`);
  assert.ok(nochesSuficientes >= REPLICAS_E02 - 1, `el escenario tiene que sobredeterminar: en ${nochesSuficientes} de ${REPLICAS_E02} noches cada causa sola alcanza para perder el corte`);
  assert.deepEqual(sinConfirmar, [], `se esperaban 0 frases causales sin confirmar y hubo ${sinConfirmar.length}:\n${sinConfirmar.slice(0, 10).join('\n')}`);
});
