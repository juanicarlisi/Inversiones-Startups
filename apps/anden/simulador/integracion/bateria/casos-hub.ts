// integracion/bateria/casos-hub.ts · Andén simulador, corte 1 · Integración (corte-1.md §8 y §10.6). Exigibles de P4 (y R06 de P1 · I)
// en la batería, con el motor que se le pase a la batería (el núcleo de producción en `npm run verificar`):
//   K02a · K02b · K03   cintas con separación y acumulación con contrapresión
//   L01–L07             el lazo de bandejas contra la teoría, la rueda, la parada forzada y la consistencia F2/F3
//   P02                 ausentismo del 5% en 10.000 sorteos (solo el sorteo)
//   R05a · R05b         el azar por dirección: agregar un puesto o achicar rampas no cambia ningún atributo de ningún paquete
//   R06                 foto a mitad de la noche + restaurar en un motor nuevo → misma huella (hub chico y grande)
// Además, el hub chico entra en R01 y R03 de P2 (`reproducibles`: «cada caso de la batería y el hub chico, 5 semillas»).
// Las mismas pruebas, con la referencia, son las de P4 en hub/pruebas/ (cintas, lazo, consistencia-f2 y azar): acá se escriben como
// casos de la batería, que devuelven un resultado con su motivo en vez de lanzar.
import type { CrearMotor, Foto } from '../../contratos/motor.ts';
import type { ModeloValidado } from '../../contratos/modelo.ts';
import type { ResultadoReplica } from '../../contratos/resultados.ts';
import { KPIS } from '../../contratos/resultados.ts';
import { TipoMomento, TipoTramo, type Traza } from '../../contratos/traza.ts';
import { aMs, horaASeg } from '../../contratos/tipos-base.ts';
import type { Caso, Contexto } from '../../verificacion/casos/comun.ts';
import { decl, evaluarIdentico, evaluarRelativo, replicasDe, Z_MAX } from '../../verificacion/casos/comun.ts';
import {
  armarNoche, crearSimularNoche, crearSimularNocheF2, DOMINIO_F2, opcionesNoche, PLANTILLAS, sorteaAusencia, type NocheArmada,
} from '../../hub/indice.ts';
import {
  acumulacionSinInduccion, chico, cintaSola, fija, lazoSaturado, modeloL07, noche, rampasSinTope, sinRuido, validado, type NocheHub,
} from './modelos-hub.ts';
import { coma, conDueno, media, resultado, varianza } from './comun.ts';

const HORA = 3_600_000, INICIO = 22 * HORA;
const ARCHIVO = 'integracion/bateria/casos-hub.ts';
const mod = (x: number, n: number) => ((x % n) + n) % n;

/** Índices de los tramos de cada paquete, en orden de escritura. */
function porPaquete(t: Traza): number[][] {
  const out: number[][] = Array.from({ length: t.paquetes.n }, () => []);
  const T = t.tramos;
  for (let i = 0; i < T.n; i++) if (T.k[i] >= TipoTramo.DESCARGA && T.k[i] <= TipoTramo.MANUAL) out[T.e[i]].push(i);
  return out;
}

/** Tramos de un tipo con t0 en [desde, hasta) que cumplen el filtro. */
function contar(t: Traza, k: number, desde: number, hasta: number, filtro: (i: number) => boolean = () => true): number {
  const T = t.tramos;
  let n = 0;
  for (let i = 0; i < T.n; i++) if (T.k[i] === k && T.t0[i] >= desde && T.t0[i] < hasta && filtro(i)) n++;
  return n;
}

function alertasVacias(fallas: string[], r: ResultadoReplica, donde: string): void {
  if (r.alertas.length) fallas.push(`${donde}: se esperaban 0 alertas y hubo ${r.alertas.join(', ')}`);
}

// ------------------------------------------------------------------------------------------------ K02 · K03

function casoCintas(): Caso {
  const caso: Caso = {
    id: 'k02-k03-cintas', titulo: 'Cinta con separación y acumulación con contrapresión (hub)', archivo: ARCHIVO, suite: 'rapida',
    replicas: 1, horizonte: 0, calentamiento: 0,
    pruebas: [
      { id: 'K02a', nombre: 'Cinta de 42 m a 2 m/s con paso 0,6 m: tránsito de cada paquete', familia: 'K', tipo: 'exigible', esperado: 21,
        criterio: { tipo: 'identico' } },
      { id: 'K02b', nombre: 'Ídem con descarga instantánea: capacidad de la cinta (paquetes por hora, ± 1)', familia: 'K', tipo: 'exigible',
        esperado: 12000, criterio: { tipo: 'relativo', tolRel: 1 / 12000 } },
      { id: 'K03', nombre: 'Acumulación de 42 m con paso 0,6 m y ningún puesto activo: paquetes que entran antes de que paren los andenes',
        familia: 'K', tipo: 'exigible', esperado: 70, criterio: { tipo: 'relativo', tolRel: 1e-9 } },
    ],
    cortas: [],
    correr(ctx) {
      const out = [];
      // K02a y K02b: una sola noche de la cinta sola con traza completa
      const k02 = noche(ctx.crearMotor, cintaSola(), ctx.semilla, 0, 'completa');
      const T = k02.traza!.tramos;
      const cintas: number[] = [];
      for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.CINTA) cintas.push(i);
      const fa: string[] = [];
      if (cintas.length !== 15000) fa.push(`se esperaba un tramo CINTA por paquete (15.000) y hubo ${cintas.length}`);
      let distintos = 0, primero = '';
      for (const i of cintas) if (T.t1[i] - T.t0[i] !== 21000) { distintos++; primero ||= `tramo ${i}: ${T.t1[i] - T.t0[i]} ms`; }
      if (distintos) fa.push(`${distintos} tránsitos distintos de 21.000 ms (el primero, ${primero})`);
      const transito = cintas.length ? (T.t1[cintas[0]] - T.t0[cintas[0]]) / 1000 : null;
      out.push(resultado(caso, decl(caso, 'K02a'), ctx, 'P4', { simulado: transito, fallas: fa, n: cintas.length, criterio: 'exacto: 21.000 ms en cada tramo CINTA' }));

      const desde = INICIO + 60_000, hasta = desde + HORA;
      const enHora = cintas.filter((i) => T.t0[i] >= desde && T.t0[i] < hasta).length;
      const entradas = cintas.map((i) => T.t0[i]).sort((a, b) => a - b);
      let pegadas = 0;
      for (let j = 1; j < entradas.length; j++) if (entradas[j] - entradas[j - 1] < 300) pegadas++;
      const rb = evaluarRelativo(caso, decl(caso, 'K02b'), ctx, enHora, 1);
      rb.criterio = '12.000 ± 1 entradas en una hora (error relativo ≤ 1/12.000) y nunca dos a menos de 300 ms';
      if (pegadas) { rb.estado = 'falla'; rb.motivo = [rb.motivo, `${pegadas} entradas a menos de 300 ms (0,6 m ÷ 2 m/s) de la anterior`].filter(Boolean).join('; '); }
      out.push(conDueno(rb, 'P4'));

      // K03: sin inducción, la acumulación se llena y los andenes paran por contrapresión
      const s = noche(ctx.crearMotor, acumulacionSinInduccion(), ctx.semilla, 0, 'completa');
      const t3 = s.traza!;
      const entraron = contar(t3, TipoTramo.ACUMULACION, -Infinity, Infinity);
      const r3 = evaluarRelativo(caso, decl(caso, 'K03'), ctx, entraron, 1);
      const f3: string[] = [];
      if (s.resultado.kpi.paquetes !== 70) f3.push(`con contrapresión no nace ningún paquete más que los lugares: nacieron ${s.resultado.kpi.paquetes}`);
      if (s.hub.acum.fila.largo !== 70) f3.push(`la acumulación termina con ${s.hub.acum.fila.largo} paquetes y se esperaban 70`);
      if (JSON.stringify(s.resultado.alertas) !== '["no-termina"]') f3.push(`se esperaba solo la alerta no-termina (sin inducción queda trabajo) y hubo [${s.resultado.alertas.join(', ')}]`);
      if (!s.hub.andenes.hayBloqueados()) f3.push('los andenes tenían que quedar parados por contrapresión');
      let llena = 0;
      for (let i = 0; i < t3.momentos.n; i++) if (t3.momentos.tipo[i] === TipoMomento.ACUMULACION_LLENA) llena++;
      if (llena !== 1) f3.push(`se esperaba un solo momento ACUMULACION_LLENA y hubo ${llena}`);
      if (f3.length) { r3.estado = 'falla'; r3.motivo = [r3.motivo, ...f3].filter(Boolean).join('; '); }
      out.push(conDueno(r3, 'P4'));
      return out;
    },
  };
  return caso;
}

// ------------------------------------------------------------------------------------------------ L01–L06

/** Ventana de régimen del lazo saturado: de 22:30 a 23:30 (desde las 22:30 los andenes alimentan más que el lazo). */
const DESDE_L = INICIO + HORA / 2, HASTA_L = DESDE_L + HORA;

function casoLazo(): Caso {
  const caso: Caso = {
    id: 'l01-l06-lazo', titulo: 'Lazo de bandejas contra la teoría, rueda de tiempos y parada forzada (hub)', archivo: ARCHIVO, suite: 'rapida',
    replicas: 1, horizonte: 0, calentamiento: 0,
    pruebas: [
      { id: 'L01', nombre: 'Lazo saturado: colocaciones por hora en régimen (velocidad ÷ paso × 3.600, ± 1)', familia: 'L', tipo: 'exigible',
        esperado: 12000, criterio: { tipo: 'relativo', tolRel: 1 / 12000 } },
      { id: 'L02', nombre: 'Lazo saturado con NO-READ 2%: caídas en la rampa correcta en la primera pasada por hora', familia: 'L', tipo: 'exigible',
        esperado: 11760, criterio: { tipo: 'z' } },
      { id: 'L03', nombre: 'Lazo saturado con 10% de paquetes de dos bandejas: paquetes por hora (12.000 ÷ 1,10)', familia: 'L', tipo: 'exigible',
        esperado: 12000 / 1.1, criterio: { tipo: 'z' } },
      { id: 'L04', nombre: 'Una ruta con su rampa de capacidad 0 y maxVueltas = 3: vueltasExtra = N_ruta × 4', familia: 'L', tipo: 'exigible',
        esperado: 'N_ruta × 4', criterio: { tipo: 'identico' } },
      { id: 'L05', nombre: 'Rueda: colocado en el paso k desde la ranura σₑ, cae en el paso k + ((σᵣ − σₑ) mod T)', familia: 'L', tipo: 'exigible',
        esperado: 'exacto', criterio: { tipo: 'identico' } },
      { id: 'L06', nombre: 'Parada forzada en el paso kₚ con reinicio en t′: el paso kₚ + i ocurre en t′ + i·tick y cada caída en tránsito se atrasa lo mismo',
        familia: 'L', tipo: 'exigible', esperado: 'exacto', criterio: { tipo: 'identico' } },
    ],
    cortas: [],
    correr(ctx) {
      const cm = ctx.crearMotor, s0 = ctx.semilla;
      const out = [];
      // L01
      {
        const s = noche(cm, lazoSaturado(), s0, 0, 'completa');
        const n = contar(s.traza!, TipoTramo.BANDEJA, DESDE_L, HASTA_L, (i) => s.traza!.tramos.a[i] === 0);
        const r = evaluarRelativo(caso, decl(caso, 'L01'), ctx, n, 1);
        r.criterio = '12.000 ± 1 colocaciones de 22:30 a 23:30 (error relativo ≤ 1/12.000) y sin alertas';
        if (s.resultado.alertas.length) { r.estado = 'falla'; r.motivo = [r.motivo, `alertas: ${s.resultado.alertas.join(', ')}`].filter(Boolean).join('; '); }
        out.push(conDueno(r, 'P4'));
      }
      // L02 y L03: estocásticas (binomial y renovación); con el reintento de §8 corren 4 noches
      const noches = replicasDe(ctx, 1);
      {
        const fallas: string[] = [];
        const cuentas: number[] = [];
        for (let rep = 0; rep < noches; rep++) {
          const m = lazoSaturado(0.02);
          m.personas.excepcion.cantidad = 0; // sin reinducción: cada colocación es un intento 0
          const s = noche(cm, m, s0, rep, 'completa'), t = s.traza!, T = t.tramos, cfg = s.hub.cfg;
          const tramos = porPaquete(t);
          let n = 0;
          for (let i = 0; i < T.n; i++) {
            if (T.k[i] !== TipoTramo.RAMPA || T.t0[i] < DESDE_L || T.t0[i] >= HASTA_L) continue;
            const e = T.e[i], lista = tramos[e], previo = lista[lista.indexOf(i) - 1];
            if (T.k[previo] !== TipoTramo.BANDEJA || T.a[previo] !== 0) { fallas.push(`noche ${rep}: el paquete ${e} cayó sin venir de la primera pasada`); continue; }
            const ruta = t.paquetes.ruta[e];
            const rampas = Array.from(cfg.rutaRampas.subarray(cfg.rutaOff[ruta], cfg.rutaOff[ruta + 1]));
            if (!rampas.includes(T.r[i])) { fallas.push(`noche ${rep}: el paquete ${e} cayó en la rampa ${T.r[i]}, que no es de su ruta`); continue; }
            n++;
          }
          cuentas.push(n);
        }
        out.push(zContra(caso, 'L02', ctx, cuentas, 11760, Math.sqrt(12000 * 0.02 * 0.98), fallas.slice(0, 3)));
      }
      {
        const fallas: string[] = [];
        const cuentas: number[] = [];
        for (let rep = 0; rep < noches; rep++) {
          const s = noche(cm, lazoSaturado(0, 0.1), s0, rep, 'completa');
          cuentas.push(contar(s.traza!, TipoTramo.BANDEJA, DESDE_L, HASTA_L, (i) => s.traza!.tramos.a[i] === 0));
          alertasVacias(fallas, s.resultado, `noche ${rep} (cada paquete de dos bandejas ocupa dos y nunca se pisan)`);
        }
        // renovación: pasos por paquete 1 + Bernoulli(0,1) → Var(N) ≈ t·σ²/μ³ = 12.000 · 0,09 / 1,1³
        out.push(zContra(caso, 'L03', ctx, cuentas, 12000 / 1.1, Math.sqrt((12000 * 0.09) / (1.1 * 1.1 * 1.1)), fallas));
      }
      // L04
      {
        const m = rampasSinTope(chico());
        m.hub.sorter.lector = { ...m.hub.sorter.lector, noLeido: 0 };
        m.personas.excepcion.cantidad = 0; // lo que va a excepción se queda ahí: cada paquete cuenta una sola vez
        m.hub.rampas.find((r) => r.id === 'R12')!.capacidad = 0; // R12 es la única rampa de la Ruta 10
        const s = noche(cm, m, s0, 0, 'no'), P = s.hub.P.S, cfg = s.hub.cfg;
        let nRuta = 0;
        for (let e = 0; e < P.nacidos; e++) if (P.ruta[e] === 9 && cfg.claseTransportable[P.clase[e]]) nRuta++;
        const dif: string[] = [];
        if (nRuta <= 300) dif.push(`la Ruta 10 tenía que tener paquetes (tiene ${nRuta})`);
        if (s.resultado.kpi.vueltasExtra !== 4 * nRuta) dif.push(`vueltasExtra = ${s.resultado.kpi.vueltasExtra} y se esperaba 4 × ${nRuta} = ${4 * nRuta}`);
        if (s.resultado.porRecurso.rampaVueltas[11] !== 4 * nRuta) dif.push(`R12 tiene ${s.resultado.porRecurso.rampaVueltas[11]} vueltas y tenían que ser todas (${4 * nRuta})`);
        out.push(conDueno(evaluarIdentico(caso, decl(caso, 'L04'), ctx, nRuta, dif, `${s.resultado.kpi.vueltasExtra} = 4 × ${nRuta}`), 'P4'));
      }
      out.push(conDueno(l05(caso, ctx), 'P4'));
      out.push(conDueno(l06(caso, ctx), 'P4'));
      return out;
    },
  };
  return caso;
}

/** z de la media por noche contra el esperado, con el error estándar de una noche ÷ √noches. */
function zContra(caso: Caso, id: string, ctx: Contexto, cuentas: number[], esperado: number, eeNoche: number, fallas: string[]) {
  const n = cuentas.length, x = media(cuentas), ee = eeNoche / Math.sqrt(n), z = (x - esperado) / ee;
  const f = [...fallas];
  if (!(Math.abs(z) <= Z_MAX)) f.push(`|z| = ${coma(Math.abs(z))} > 3,29 (se esperaban ${coma(esperado, 1)} por hora y salieron ${coma(x, 1)})`);
  return resultado(caso, decl(caso, id), ctx, 'P4', { simulado: x, semiancho: 1.959963984540054 * ee, z, errorRelativo: (x - esperado) / esperado,
    n, fallas: f, criterio: '|error| ≤ 3,29 errores estándar (binomial o de renovación, por noche)' });
}

function l05(caso: Caso, ctx: Contexto) {
  const m = chico();
  m.hub.sorter.paradas = { ...m.hub.sorter.paradas, activas: false }; // sin paradas, el paso k ocurre en inicio + k·tick
  const s = noche(ctx.crearMotor, m, ctx.semilla, 1, 'completa'), t = s.traza!, T = t.tramos, cfg = s.hub.cfg;
  const dif: string[] = [];
  const k = (x: number) => {
    const q = (x - INICIO) / cfg.tick;
    if (!Number.isInteger(q)) dif.push(`el instante ${x} no está en la grilla de pasos`);
    return q;
  };
  let caidas = 0, vueltas = 0;
  for (const lista of porPaquete(t)) {
    for (let j = 0; j < lista.length; j++) {
      const i = lista[j];
      if (T.k[i] !== TipoTramo.BANDEJA) continue;
      const sig = lista[j + 1];
      if (T.a[i] === 0) {
        const esp = lista[j - 1];
        if (T.k[esp] !== TipoTramo.ESPERA_BANDEJA) { dif.push(`paquete ${T.e[i]}: antes de la bandeja tenía que esperar bandeja`); continue; }
        if (T.k[sig] === TipoTramo.RAMPA) {
          const esperado = mod(cfg.slotRampa[T.r[sig]] - cfg.slotEstacion[T.r[esp]], cfg.T) || cfg.T;
          const pasos = k(T.t1[i]) - k(T.t0[i]);
          if (pasos !== esperado) dif.push(`paquete ${T.e[i]}: cayó ${pasos} pasos después de colocarse y se esperaban ${esperado}`);
          caidas++;
        }
      } else {
        // una vuelta extra dura exactamente T pasos (salvo la que va a excepción)
        const prev = lista[j - 1];
        if (T.k[prev] === TipoTramo.BANDEJA && T.a[prev] > 0 && k(T.t1[prev]) - k(T.t0[prev]) !== cfg.T) dif.push(`paquete ${T.e[i]}: una vuelta extra no duró ${cfg.T} pasos`);
        vueltas++;
      }
    }
  }
  if (caidas <= 5000) dif.push(`se controlaron solo ${caidas} caídas (se esperaban más de 5.000)`);
  if (vueltas === 0) dif.push('no hubo vueltas extra para controlar');
  return evaluarIdentico(caso, decl(caso, 'L05'), ctx, caidas, dif, `${caidas} caídas y ${vueltas} vueltas; ${dif.length} distintas`);
}

function l06(caso: Caso, ctx: Contexto) {
  const base = rampasSinTope(sinRuido(chico()));
  const conParada = structuredClone(base);
  conParada.hub.sorter.paradas = { activas: true, entre: fija(3600.15), duracion: fija(600) };
  const a = noche(ctx.crearMotor, base, ctx.semilla, 0, 'completa'), b = noche(ctx.crearMotor, conParada, ctx.semilla, 0, 'completa');
  const tick = b.hub.cfg.tick;
  const ts = INICIO + 3_600_150, tReinicio = ts + 600_000;
  const kp = Math.floor((ts - INICIO + tick - 1) / tick); // primer paso en o después de la parada
  const delta = tReinicio - (INICIO + kp * tick);
  const dif: string[] = [];
  if (kp !== 12001) dif.push(`el primer paso después de la parada tenía que ser el 12.001 y es ${kp}`);
  // tramos del lazo: marcha [inicio, ts] desde el paso 0, detenido [ts, t′] en kₚ, marcha desde t′ en kₚ
  const T = b.traza!.tramos, lazo: number[] = [];
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.LAZO_MARCHA || T.k[i] === TipoTramo.LAZO_DETENIDO) lazo.push(i);
  const [m0, d0, m1] = lazo;
  const igual = (que: string, x: number[], y: number[]) => { if (JSON.stringify(x) !== JSON.stringify(y)) dif.push(`${que}: se esperaba [${y}] y salió [${x}]`); };
  igual('primer tramo del lazo (marcha)', [T.k[m0], T.t0[m0], T.t1[m0], T.a[m0]], [TipoTramo.LAZO_MARCHA, INICIO, ts, 0]);
  igual('segundo tramo del lazo (detenido, causa FALLA)', [T.k[d0], T.t0[d0], T.t1[d0], T.a[d0], T.c[d0]], [TipoTramo.LAZO_DETENIDO, ts, tReinicio, kp, 7]);
  igual('tercer tramo del lazo (marcha desde t′)', [T.k[m1], T.t0[m1], T.a[m1]], [TipoTramo.LAZO_MARCHA, tReinicio, kp]);
  // las caídas de lo que estaba en bandejas al parar se atrasan todas lo mismo
  const A = a.traza!.tramos;
  const finBandejaB = new Map<number, number>();
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.BANDEJA && T.t0[i] < ts) finBandejaB.set(T.e[i], T.t1[i]);
  let enTransito = 0;
  for (let i = 0; i < A.n; i++) {
    if (A.k[i] !== TipoTramo.BANDEJA || !(A.t0[i] < ts && A.t1[i] > ts)) continue;
    const e = A.e[i], kCaida = (A.t1[i] - INICIO) / tick, fb = finBandejaB.get(e);
    if (fb !== A.t1[i] + delta) dif.push(`el paquete ${e} se tenía que atrasar ${delta} ms y terminó la bandeja en ${fb} en vez de ${A.t1[i] + delta}`);
    else if (fb !== tReinicio + (kCaida - kp) * tick) dif.push(`el paso ${kCaida} tenía que ocurrir en t′ + (k − kₚ)·tick`);
    enTransito++;
  }
  // con el motor 1.1.0 (persistencia y relevo en las rampas) hay menos vueltas de más y menos bandejas ocupadas a la hora de la parada:
  // 9 con la semilla de la batería (eran más de 10 con 1.0.0). Lo que se controla es que TODAS las que están en tránsito se atrasen igual;
  // 5 alcanzan para que el control no sea vacío (igual que hub/pruebas/lazo.test.ts).
  if (enTransito < 5) dif.push(`tenía que haber al menos 5 paquetes en tránsito al parar (hubo ${enTransito})`);
  if (!(b.resultado.kpi.paradasLazo >= 1)) dif.push('no se contó la parada');
  if (!(Math.abs(b.resultado.kpi.minutosLazoDetenido - 10 * b.resultado.kpi.paradasLazo) < 1e-9)) dif.push('cada parada tenía que durar 10 min');
  return evaluarIdentico(caso, decl(caso, 'L06'), ctx, enTransito, dif, `${enTransito} paquetes en tránsito atrasados ${delta} ms`);
}

// ------------------------------------------------------------------------------------------------ L07

function casoConsistenciaF2(): Caso {
  const N = 20;
  const caso: Caso = {
    id: 'l07-consistencia-f2', titulo: 'Consistencia F2/F3 con ρ de inducción ≈ 0,3 y rampas sin tope (hub)', archivo: ARCHIVO, suite: 'rapida',
    replicas: N, horizonte: 0, calentamiento: 0,
    pruebas: [
      { id: 'L07', nombre: 'F2 reproduce a F3 con ρ de inducción ≈ 0,3 y rampas sin tope: paquetes por hora y tiempo medio en el hub', familia: 'L',
        tipo: 'exigible', esperado: 0, criterio: { tipo: 'z' } },
    ],
    cortas: [],
    correr(ctx) {
      const n = replicasDe(ctx, N);
      const mv = validado(modeloL07());
      const f3 = crearSimularNoche(ctx.crearMotor), f2 = crearSimularNocheF2(ctx.crearMotor);
      const correr = (sim: typeof f3, desde: number) => Array.from({ length: n }, (_, i) => sim(mv, ctx.semilla, desde + i, { traza: 'no' }).resultado);
      const a = correr(f3, 0), b = correr(f2, 0), bIndep = correr(f2, 1000);
      const fallas: string[] = [];
      for (const r of [...a, ...b]) alertasVacias(fallas, r, `réplica ${r.replica}`);
      const rho = 1600 / (4 * (3600 / 2.4) * (1 - 900 / 7200));
      if (!(rho <= DOMINIO_F2.rhoInduccionMax)) fallas.push(`el caso tenía que estar dentro del dominio de F2 (ρ = ${coma(rho, 3)})`);
      for (const r of b) if (r.kpi.vueltasExtra !== 0 || r.kpi.paradasLazo !== 0) fallas.push(`F2 no tiene vueltas ni paradas y la réplica ${r.replica} las tiene`);
      const medidas: [string, (r: ResultadoReplica) => number][] = [
        ['paquetes por hora', (r) => r.kpi.clasificados / (r.kpi.finClasificacionMin / 60)],
        ['tiempo medio en el hub', (r) => r.kpi.esperaMediaMin],
      ];
      const simulado: Record<string, number> = {};
      let peorZ = 0, peorRel = 0;
      for (const [nombre, f] of medidas) {
        const x3 = a.map(f), x2 = b.map(f), x2i = bIndep.map(f);
        const rel = (media(x2) - media(x3)) / media(x3);
        if (!(Math.abs(rel) <= 0.02)) fallas.push(`${nombre}: F2 ${coma(media(x2), 4)} contra F3 ${coma(media(x3), 4)}, diferencia ${coma(100 * rel)}% > 2% (mismas réplicas)`);
        const dif = media(x2i) - media(x3), ee = Math.sqrt(varianza(x3) / n + varianza(x2i) / n), z = dif / ee;
        if (!(Math.abs(z) <= Z_MAX)) fallas.push(`${nombre}: con réplicas independientes la diferencia es ${coma(dif, 4)} = ${coma(z)} ee (> 3,29)`);
        simulado[`${nombre} (F2/F3 − 1)`] = rel;
        if (Math.abs(z) > Math.abs(peorZ)) peorZ = z;
        if (Math.abs(rel) > Math.abs(peorRel)) peorRel = rel;
      }
      return [resultado(caso, decl(caso, 'L07'), ctx, 'P4', { simulado, z: peorZ, errorRelativo: peorRel, n, fallas,
        criterio: 'diferencia F2 − F3 ≤ 2% con las mismas réplicas y ≤ 3,29 ee contra réplicas independientes de F2' })];
    },
  };
  return caso;
}

// ------------------------------------------------------------------------------------------------ P02 · R05

function casoAzar(): Caso {
  const caso: Caso = {
    id: 'p02-r05-azar', titulo: 'Azar por dirección del hub: ausentismo y atributos que no cambian con la dotación', archivo: ARCHIVO, suite: 'rapida',
    replicas: 2000, horizonte: 0, calentamiento: 0,
    pruebas: [
      { id: 'P02', nombre: 'Ausentismo 5%: fracción de ausentes en 10.000 sorteos (2.000 noches × 5 personas; solo el sorteo)', familia: 'P',
        tipo: 'exigible', esperado: 0.05, criterio: { tipo: 'z' } },
      { id: 'R05a', nombre: 'Agregar un puesto de inducción activo no cambia ruta, clase, tiempo base, manejo ni ninguna falta de ningún paquete',
        familia: 'R', tipo: 'exigible', esperado: 'idénticos', criterio: { tipo: 'identico' } },
      { id: 'R05b', nombre: 'Bajar la capacidad de las rampas (más vueltas) no cambia la lectura de ningún (paquete, intento)', familia: 'R',
        tipo: 'exigible', esperado: 'idénticas', criterio: { tipo: 'identico' } },
    ],
    cortas: [],
    correr(ctx) {
      const out = [];
      // P02: el sorteo del hub (sorteaAusencia) sobre la fuente de azar del motor, por (semilla, noche) y dirección (rol, ordinal)
      {
        const noches = replicasDe(ctx, 2000), personas = 5;
        let ausentes = 0, clave = 0;
        for (let n = 0; n < noches; n++) {
          const m = ctx.crearMotor({ semilla: ctx.semilla, replica: n, hasta: 0, traza: 'no' });
          clave = m.claveDe('personas.rampa', 'ausencia');
          for (let p = 0; p < personas; p++) if (sorteaAusencia(m.azar, clave, p, 0.05)) ausentes++;
        }
        const total = noches * personas, p = ausentes / total, ee = Math.sqrt((0.05 * 0.95) / total), z = (p - 0.05) / ee;
        const fallas: string[] = [];
        if (!(Math.abs(z) <= Z_MAX)) fallas.push(`|z| = ${coma(Math.abs(z))} > 3,29: fracción de ausentes ${p} fuera de 0,05 ± ${coma(3.29 * ee, 4)}`);
        const m0 = ctx.crearMotor({ semilla: 1, replica: 1, hasta: 0, traza: 'no' });
        if (sorteaAusencia(m0.azar, clave, 0, 0)) fallas.push('con p = 0 alguien faltó');
        out.push(resultado(caso, decl(caso, 'P02'), ctx, 'P4', { simulado: p, semiancho: 1.959963984540054 * ee, z, errorRelativo: (p - 0.05) / 0.05,
          n: total, replicas: noches, fallas, criterio: '|error| ≤ 3,29 errores estándar binomiales (0,05 ± 0,0072 con 10.000 sorteos)' }));
      }
      // R05a
      {
        const dif: string[] = [];
        let comparados = 0;
        for (const replica of [0, 3, 7]) {
          const a = noche(ctx.crearMotor, chico(), ctx.semilla, replica);
          const m = chico();
          m.personas.induccion.puestosActivos = 4;
          const b = noche(ctx.crearMotor, m, ctx.semilla, replica);
          const A = atributos(a), B = atributos(b);
          if (A.size !== B.size) dif.push(`réplica ${replica}: nacen ${A.size} paquetes con 3 puestos y ${B.size} con 4`);
          for (const [clave, x] of A) {
            const y = B.get(clave);
            if (!y) { dif.push(`réplica ${replica}: el paquete ${clave} no existe con 4 puestos`); continue; }
            for (const campo of ['ruta', 'clase', 'manejo'] as const) if (y[campo] !== x[campo]) dif.push(`réplica ${replica}, paquete ${clave}: ${campo} ${x[campo]} → ${y[campo]}`);
            if (x.base0 >= 0 && y.base0 >= 0) { if (y.base0 !== x.base0) dif.push(`réplica ${replica}, paquete ${clave}: tiempo base ${x.base0} → ${y.base0}`); comparados++; }
          }
          const fa = ausencias(a.hub), fb = ausencias(b.hub);
          for (const [quien, presente] of fa) if (fb.get(quien) !== presente) dif.push(`réplica ${replica}: la falta de ${quien} cambió`);
          if (a.resultado.huella === b.resultado.huella) dif.push(`réplica ${replica}: la corrida tenía que cambiar (misma huella)`);
        }
        if (comparados <= 3 * 7000) dif.push(`se compararon solo ${comparados} tiempos base`);
        out.push(conDueno(evaluarIdentico(caso, decl(caso, 'R05a'), ctx, comparados, dif, `${comparados} paquetes comparados en 3 réplicas; ${dif.length} diferencias`), 'P4'));
      }
      // R05b
      {
        const a = noche(ctx.crearMotor, chico(), ctx.semilla, 2);
        const m = chico();
        for (const r of m.hub.rampas) r.capacidad = 6;
        const b = noche(ctx.crearMotor, m, ctx.semilla, 2);
        const dif: string[] = [];
        if (!(b.resultado.kpi.vueltasExtra > a.resultado.kpi.vueltasExtra)) dif.push(`con rampas más chicas tenía que haber más vueltas (${a.resultado.kpi.vueltasExtra} → ${b.resultado.kpi.vueltasExtra})`);
        const A = atributos(a), B = atributos(b);
        let leidos = 0;
        for (const [clave, x] of A) {
          const y = B.get(clave);
          if (!y) { dif.push(`el paquete ${clave} no existe con rampas chicas`); continue; }
          if (x.noLeido !== 2 && y.noLeido !== 2) { if (y.noLeido !== x.noLeido) dif.push(`${clave}: la lectura del intento 0 cambió`); leidos++; }
        }
        if (leidos <= 7000) dif.push(`se compararon solo ${leidos} lecturas`);
        out.push(conDueno(evaluarIdentico(caso, decl(caso, 'R05b'), ctx, leidos, dif, `${leidos} lecturas comparadas; ${dif.length} diferencias`), 'P4'));
      }
      return out;
    },
  };
  return caso;
}

/** Atributos de cada paquete por su clave estable (camión, índice). */
function atributos(s: NocheHub): Map<string, { ruta: number; clase: number; base0: number; manejo: number; noLeido: number }> {
  const P = s.hub.P.S, out = new Map<string, { ruta: number; clase: number; base0: number; manejo: number; noLeido: number }>();
  for (let e = 0; e < P.nacidos; e++) {
    out.set(`${P.camion[e]}/${P.indice[e]}`, { ruta: P.ruta[e], clase: P.clase[e], base0: P.base0[e], manejo: P.manejo[e], noLeido: P.noLeido[e] });
  }
  return out;
}

/** Ausencias por (rol, ordinal en el rol). */
function ausencias(h: NocheArmada['hub']): Map<string, number> {
  const out = new Map<string, number>(), cuenta = new Map<string, number>();
  h.cfg.catalogo.personas.forEach((p, g) => {
    const i = cuenta.get(p.rol) ?? 0;
    cuenta.set(p.rol, i + 1);
    out.set(`${p.rol}/${i}`, h.personas.S.presente[g]);
  });
  return out;
}

// ------------------------------------------------------------------------------------------------ R06 (y el hub chico en R01/R03)

function casoFoto(): Caso {
  const caso: Caso = {
    id: 'r06-foto-hub', titulo: 'Foto a mitad de la noche y restauración en un motor nuevo (hub chico y grande)', archivo: ARCHIVO, suite: 'rapida',
    replicas: 1, horizonte: 0, calentamiento: 0,
    pruebas: [
      { id: 'R06', nombre: 'Foto a mitad de la corrida + restaurar en un motor nuevo → misma huella final (hub chico, 2 semillas × 4 horas; hub grande, 2 horas)',
        familia: 'R', tipo: 'exigible', esperado: 'idéntica', criterio: { tipo: 'identico' } },
    ],
    cortas: [],
    // R01 y R03 de P2 corren también el hub chico (5 semillas, 2 réplicas): huella y KPI
    reproducibles: [{
      etiqueta: 'hub chico (hub-chico@1.0.0)',
      correr(cm, semilla, replica) {
        const r = crearSimularNoche(cm)(validado(chico()), semilla, replica, { traza: 'no' }).resultado;
        return { huella: r.huella, medidas: { eventos: r.eventos, kpi: r.kpi, alertas: r.alertas } };
      },
    }],
    correr(ctx) {
      const dif: string[] = [];
      let fotos = 0;
      const ms = (h: string) => aMs(horaASeg(h));
      const probar = (mv: ModeloValidado, semilla: number, replica: number, horas: string[], que: string) => {
        const base = continua(ctx.crearMotor, mv, semilla, replica);
        for (const hora of horas) {
          const foto = fotoEn(ctx.crearMotor, mv, semilla, replica, ms(hora));
          if (typeof foto === 'string') { dif.push(`${que}, foto a las ${hora}: ${foto}`); continue; }
          // la foto viaja entre hilos (structuredClone, como postMessage) y se restaura en un motor y un hub nuevos
          const b = desdeFoto(ctx.crearMotor, mv, semilla, replica, structuredClone(foto));
          fotos++;
          if (typeof b === 'string') { dif.push(`${que}, semilla ${semilla}, foto a las ${hora}: ${b}`); continue; }
          const d = diferencia(base, b);
          if (d) dif.push(`${que}, semilla ${semilla}, foto a las ${hora}: ${d}`);
        }
      };
      const chicoV = validado(chico()), grandeV = validado(structuredClone(PLANTILLAS['hub-lazo-noche@1.0.0']));
      for (const semilla of [ctx.semilla, (ctx.semilla + 1) >>> 0]) probar(chicoV, semilla, 0, ['22:20', '23:30', '24:45', '26:10'], 'hub chico');
      probar(grandeV, ctx.semilla, 1, ['24:00', '25:30'], 'hub grande');
      return [conDueno(evaluarIdentico(caso, decl(caso, 'R06'), ctx, fotos, dif, `${fotos} fotos restauradas; ${dif.length} distintas`), 'I')];
    },
  };
  return caso;
}

function continua(cm: CrearMotor, mv: ModeloValidado, semilla: number, replica: number): ResultadoReplica {
  const m = cm(opcionesNoche(mv, semilla, replica, 'no'));
  return armarNoche(m, mv).cerrar(m.correr()).resultado;
}
function fotoEn(cm: CrearMotor, mv: ModeloValidado, semilla: number, replica: number, hasta: number): Foto | string {
  const m = cm(opcionesNoche(mv, semilla, replica, 'no'));
  armarNoche(m, mv);
  const r = m.correrHasta(hasta);
  if (r.estado !== 'pausa') return `la corrida tenía que pausarse en ${hasta} ms y terminó con estado ${r.estado}`;
  // contrato: correrHasta deja ahora = hasta (hallazgo REV-D6: sin esto, una foto «atrasada» pasaba igual)
  if (m.ahora !== hasta) return `correrHasta(${hasta}) dejó ahora = ${m.ahora} y el contrato pide ahora = hasta`;
  return m.foto();
}
function desdeFoto(cm: CrearMotor, mv: ModeloValidado, semilla: number, replica: number, foto: Foto): ResultadoReplica | string {
  const m = cm(opcionesNoche(mv, semilla, replica, 'no'));
  const n = armarNoche(m, mv);
  const original = JSON.stringify(foto);
  m.restaurar(foto);
  // ida y vuelta: la foto tomada apenas restaurada es la misma (ahora, seq, eventos, huella, calendario y bloques). Detecta un
  // contador que restaurar() no devuelve (por ejemplo seq) aunque la huella final no llegue a cambiar con pocos cortes (REV-D6)
  const eco = JSON.stringify(m.foto());
  if (eco !== original) {
    const a = JSON.parse(original) as Record<string, unknown>, b = JSON.parse(eco) as Record<string, unknown>;
    const campos = Object.keys(a).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
    return `la foto tomada apenas restaurada no es la misma (difieren: ${campos.join(', ')})`;
  }
  return n.cerrar(m.correr()).resultado;
}
function diferencia(a: ResultadoReplica, b: ResultadoReplica): string | null {
  if (a.huella !== b.huella) return `huella ${b.huella} desde la foto contra ${a.huella} de un tirón`;
  if (a.eventos !== b.eventos) return `eventos ${b.eventos} contra ${a.eventos}`;
  for (const k of KPIS) if (!Object.is(a.kpi[k], b.kpi[k])) return `el KPI ${k} da ${a.kpi[k]} de un tirón y ${b.kpi[k]} desde la foto`;
  if (JSON.stringify(a.alertas) !== JSON.stringify(b.alertas)) return 'alertas distintas';
  if (JSON.stringify(a.porRecurso) !== JSON.stringify(b.porRecurso)) return 'indicadores por recurso distintos';
  if (JSON.stringify(a.series) !== JSON.stringify(b.series)) return 'series distintas';
  return null;
}

/** Los casos del hub que la integración suma a la batería. */
export function casosHub(): Caso[] {
  return [casoCintas(), casoLazo(), casoConsistenciaF2(), casoAzar(), casoFoto()];
}
