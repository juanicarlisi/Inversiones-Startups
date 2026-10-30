// Jugadores automáticos: el instrumento de medición de Hub Nocturno (el fundador no juega; los números duros salen de acá).
// Cuatro perfiles deterministas por semilla. Solo usan la API de la interfaz (interfaz.mjs) y lo que ve el jugador: no leen colas
// internas ni el ruteo. Miden economía y huecos, no diversión.
//   literal     hace exactamente lo que dice el texto de la misión activa (y la pista, cuando aparece)
//   novato      lo del literal + compra cuando le alcanza donde se ve carga esperando + acepta contratos; balizas solo si una misión lo pide
//   listo       busca la acción más barata que hace avanzar cualquier objetivo; si no hay, la mejor próxima acción; juega la ronda
//   compraTodo  sigue la historia lo mínimo y compra un avión cada vez que le alcanza (el más grande que llega)
// Uso: node herramientas/jugadores.mjs --perfil literal --semilla 1 [--minutos 90] [--novedad] [--todos]
import { I } from './interfaz.mjs';
import { PERFILES, REACCION, NOVEDADES, aplicar } from './perfiles.mjs';

// ───────── la corrida ─────────
// Cada paso del modelo son PASO minutos de juego = 0,5 s reales a velocidad 1. Las ventanas de fin de capítulo pausan el juego
// (como en la interfaz) y suman 4 s reales.
// ausencias: [{ min, horas }] → a esos minutos reales el jugador se va esas horas (simularAusencia) y vuelve.
// vel: la velocidad base; velMax: la que permite el juego (HN-33 la puede bajar). «×3 hasta juntar $X» (el chip) sube la velocidad a
// ×3 hasta que la caja llega a X.
export function correr(perfil, { semilla = 1, minutos = 90, vel = 1, velMax = 6, ventanas = 4, ausencias = [] } = {}) {
  const decidir = PERFILES[perfil];
  if (!decidir) throw new Error(`perfil desconocido: ${perfil}`);
  const s = I.nuevoEstado(semilla);
  let acelera = null; // «×3 hasta juntar $X» ({ meta }) o «×3 hasta el próximo consejo» ({ hasta }: minuto de juego)
  const acelerando = () => acelera != null && (acelera.meta != null ? s.dinero < acelera.meta : s.t < acelera.hasta);
  const velAhora = () => Math.min(velMax, acelerando() ? Math.max(vel, 3) : vel);
  let dtReal = I.PASO / I.MIN_POR_SEG / velAhora();
  let seg = 0, espera = REACCION[perfil];  // la primera acción llega después de tocar «Empezar»
  const out = { perfil, semilla, primerDespegue: null, primerCobro: null, primerViajeNeto: null, primerTransbordo: null, misiones: [], capitulos: [],
    novedades: [], gananciaDia: {}, cajaMin: s.dinero, trabadas: [], acciones: 0, sinDecision3min: 0, rojoMaxDias: 0, negMaxDias30: 0, cajaMin30: s.dinero,
    bancoListo: null, rondas: 0, contratos: 0, desdeMision: 0, primerAvionRepago: null, atrasoPremio: 0, ausencias: [], contratosMin: [], contratosCortosMin: [], contratosVencidos: 0,
    compras: {}, medallas: [], primeraRonda: null, acciones60: 0, utiles: [], ventasSobra: 0, ventasSeguridad: 0, ventasJovenes: 0, comprasTotal: 0, aceleradas: 0 };
  const aceptado = {};
  const pendientes = [...ausencias].sort((a, b) => a.min - b.min);
  let avance = { id: null, v: -1, t: 0 }, rojo = null, neg = null, ultimaDecisionPositiva = 0, primerAvion = null;
  // lo que el jugador vio aparecer en pantalla, y su propio azar (determinista por semilla: dos corridas iguales dan lo mismo)
  let az = (semilla * 2654435761) >>> 0;
  const ctx = { rondaDisponible: false, azar: () => { az = (az + 0x6d2b79f5) >>> 0; let t = az; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; } };
  const marcas = [10, 30, 60];
  const min = () => seg / 60;
  while (seg < minutos * 60) {
    if (espera <= 0) {
      const a = decidir(s, ctx);
      // una venta: ¿lo que sobra o la red de seguridad? ¿un avión con menos de 2 días de juego?
      const vendido = a?.tipo === 'vender' ? s.aviones.find((x) => x.id === a.id) : null;
      const r = a?.tipo === 'acelerar' && acelerando() ? { ok: false } : a ? aplicar(s, a) : null; // ya va a ×3: tocarlo otra vez no hace nada
      // Sin nada para hacer (o si la acción no salió), vuelve a mirar la pantalla después de su tiempo de reacción: nota lo nuevo
      // con una demora de entre 0 y ese tiempo, como una persona que no está mirando cada medio segundo.
      if (r?.ok) {
        out.acciones++;
        out.utiles.push(+seg.toFixed(1));
        if (seg <= 60) out.acciones60++;
        if (r.acelerar != null) { acelera = r.acelerar; out.aceleradas++; }
        if (vendido) { if (a.sobra) out.ventasSobra++; if (a.seguridad) out.ventasSeguridad++; if (s.t - (vendido.desde ?? 0) < 2 * 1440) out.ventasJovenes++; }
        if (a.tipo === 'avion') out.comprasTotal++;
        if (a.tipo === 'contrato') aceptado[a.id] = seg;
        if (a.tipo === 'avion') { if (!primerAvion) primerAvion = r.avion; const c = (out.compras[s.cap] ??= {}); c[a.id] = (c[a.id] ?? 0) + 1; } // aviones comprados por capítulo y tipo
        if (a.tipo === 'ronda') ctx.rondaDisponible = false;
      }
      espera = REACCION[perfil];
    }
    for (const e of I.paso(s)) {
      if (e.tipo === 'despegue' && out.primerDespegue === null) out.primerDespegue = +seg.toFixed(1);
      if (e.tipo === 'aterrizaje' && e.ingreso > 0 && out.primerCobro === null) { out.primerCobro = +(seg + dtReal).toFixed(1); out.primerViajeNeto = e.netoViaje; }
      if (NOVEDADES.has(e.tipo)) out.novedades.push({ min: +min().toFixed(2), tipo: e.tipo, id: e.tipo === 'resultadoNoche' ? e.medalla ?? '-' : e.id ?? e.avion ?? e.ciudades?.join(',') ?? '' });
      if (e.tipo === 'mision') { out.misiones.push({ id: e.id, min: +min().toFixed(2), duracion: +(min() - out.desdeMision).toFixed(2) }); out.desdeMision = min(); }
      if (e.tipo === 'bancoListo' && out.bancoListo === null) out.bancoListo = +min().toFixed(2);
      if (e.tipo === 'rondaDisponible') { ctx.rondaDisponible = true; if (out.primeraRonda === null) out.primeraRonda = +min().toFixed(2); }
      if (e.tipo === 'rondaCorte') ctx.rondaDisponible = false;
      if (e.tipo === 'resultadoNoche') { out.rondas++; out.medallas.push({ min: +min().toFixed(2), pct: e.pctPrimeraHora, medalla: e.medalla, jugada: e.jugada }); }
      if (e.tipo === 'contrato') { out.contratos++; if (aceptado[e.id] != null) (e.corto ? out.contratosCortosMin : out.contratosMin).push(+((seg - aceptado[e.id]) / 60).toFixed(2)); }
      if (e.tipo === 'contratoVencido') out.contratosVencidos++;
      if (e.tipo === 'capitulo') {
        out.capitulos.push({ cap: e.cap, min: +min().toFixed(2) });
        seg += ventanas; // las dos ventanas del cambio de capítulo
        I.avanzarCapitulo(s); // al final de la historia el juego sigue (contratos y rondas)
        out.desdeMision = min();
      }
    }
    seg += dtReal; espera -= dtReal;
    dtReal = I.PASO / I.MIN_POR_SEG / velAhora();
    // ninguna misión queda cumplida sin premio después de un paso
    const act = I.misionActual(s);
    if (act && I.progreso(s, act) >= act.meta) out.atrasoPremio++;
    if (pendientes.length && min() >= pendientes[0].min) {
      const a = pendientes.shift(), antes = s.misiones.length, d0 = s.dinero;
      const r = I.simularAusencia(s, a.horas * 3600);
      for (const e of r.eventos) {
        if (NOVEDADES.has(e.tipo)) out.novedades.push({ min: +min().toFixed(2), tipo: e.tipo, id: e.id ?? e.avion ?? '', ausente: true });
        if (e.tipo === 'mision') out.misiones.push({ id: e.id, min: +min().toFixed(2), duracion: +(min() - out.desdeMision).toFixed(2), ausente: true });
        if (e.tipo === 'capitulo') { out.capitulos.push({ cap: e.cap, min: +min().toFixed(2), ausente: true }); I.avanzarCapitulo(s); }
      }
      out.ausencias.push({ min: a.min, horas: a.horas, neto: r.neto, dias: r.dias, misiones: s.misiones.length - antes, parte: r.parte, cajaAntes: Math.round(d0), cajaDespues: Math.round(s.dinero) });
    }
    if (out.primerTransbordo === null && (s.stats?.transbordos?.BUE ?? 0) > 0) out.primerTransbordo = +seg.toFixed(1); // solo para el informe
    // misión trabada: 5 min reales sin avance
    const h = I.misionesActivas(s).find((o) => o.tipo === 'historia');
    if (h) {
      const v = h.progreso;
      if (h.id !== avance.id || v > avance.v + 1e-9) avance = { id: h.id, v, t: seg, marcada: false };
      else if (!avance.marcada && seg - avance.t >= 300) { avance.marcada = true; out.trabadas.push({ id: h.id, desde: +(avance.t / 60).toFixed(2) }); }
    }
    // caja y neto: red de seguridad
    out.cajaMin = Math.min(out.cajaMin, s.dinero);
    if (seg <= 1800) out.cajaMin30 = Math.min(out.cajaMin30, s.dinero);
    if (s.dinero < 0) { rojo ??= s.t; out.rojoMaxDias = Math.max(out.rojoMaxDias, (s.t - rojo) / 1440); if (seg <= 1800) out.rojoMaxDias30 = Math.max(out.rojoMaxDias30 ?? 0, (s.t - rojo) / 1440); } else rojo = null;
    if (I.gananciaDia(s) < 0 && s.aviones.length && s.t > 1440) { neg ??= s.t; if (seg <= 1800) out.negMaxDias30 = Math.max(out.negMaxDias30, (s.t - neg) / 1440); } else neg = null;
    // ¿hay una decisión posible con efecto positivo? (primeros 3 minutos)
    if (seg <= 180 && Math.abs(seg % 1) < dtReal / 2) {
      if (I.decisiones(s).some((d) => d.efectoDia > 0)) ultimaDecisionPositiva = seg;
      out.sinDecision3min = Math.max(out.sinDecision3min, seg - ultimaDecisionPositiva);
    }
    if (primerAvion && out.primerAvionRepago === null) {
      const av = s.aviones.find((a) => a.id === primerAvion.id);
      if (av && av.ing - av.cos >= I.AV[av.tipo].precio) out.primerAvionRepago = +min().toFixed(2);
    }
    while (marcas.length && min() >= marcas[0]) out.gananciaDia[marcas.shift()] = Math.round(I.gananciaDia(s));
  }
  // hueco máximo sin novedad en la primera hora
  let antes = 0, hueco = 0;
  for (const n of out.novedades) { if (n.min > 60) break; hueco = Math.max(hueco, n.min - antes); antes = n.min; }
  out.huecoMaxNovedad = +Math.max(hueco, Math.min(60, min()) - antes).toFixed(2);
  out.final = { min: +min().toFixed(1), cap: s.cap, dinero: Math.round(s.dinero), rutas: s.rutas.length, aviones: s.aviones.length,
    tipos: [...new Set(s.aviones.map((a) => a.tipo))], mejorDia: Math.round(s.stats.mejorDia), mision: I.misionActual(s)?.id ?? null };
  out.cajaMin = Math.round(out.cajaMin); out.cajaMin30 = Math.round(out.cajaMin30);
  out.rojoMaxDias = +out.rojoMaxDias.toFixed(2); out.rojoMaxDias30 = +(out.rojoMaxDias30 ?? 0).toFixed(2); out.negMaxDias30 = +out.negMaxDias30.toFixed(2); out.sinDecision3min = +out.sinDecision3min.toFixed(1);
  out.minPorCapitulo = out.capitulos.map((c, i) => ({ cap: c.cap, min: +(c.min - (out.capitulos[i - 1]?.min ?? 0)).toFixed(2) }));
  // segundos máximos sin una acción útil (una que hizo algo, «×3» incluido) en los primeros 5 minutos
  { let antes = 0, h = 0; for (const t of out.utiles) { if (t > 300) break; h = Math.max(h, t - antes); antes = t; } out.sinAccionUtil5min = +Math.max(h, Math.min(300, seg) - antes).toFixed(1); }
  out.estado = s;
  return out;
}

export function informe(r) { const { estado, ...resto } = r; return resto; }

// ───────── línea de comandos ─────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
  const minutos = Number(arg('minutos', 90)), semilla = Number(arg('semilla', 1));
  if (process.argv.includes('--novedad')) {
    const r = correr('novato', { semilla, minutos: 60 });
    console.log(`Novedades del perfil novato, semilla ${semilla}, primera hora (hueco máximo ${r.huecoMaxNovedad} min):`);
    let antes = 0;
    for (const n of r.novedades.filter((x) => x.min <= 60)) { console.log(`${n.min.toFixed(1).padStart(6)} min  (+${(n.min - antes).toFixed(1).padStart(4)})  ${n.tipo} ${n.id}`); antes = n.min; }
  } else if (process.argv.includes('--todos')) {
    for (const p of Object.keys(PERFILES)) console.log(JSON.stringify(informe(correr(p, { semilla, minutos }))));
  } else {
    console.log(JSON.stringify(informe(correr(arg('perfil', 'literal'), { semilla, minutos })), null, 1));
  }
}
