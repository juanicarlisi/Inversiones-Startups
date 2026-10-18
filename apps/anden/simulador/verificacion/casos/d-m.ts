// verificacion/casos/d-m.ts · Pruebas degenerada, metamórfica y de conservación (suite rápida).
// D01: M/M/1 con λ = 1,2 y μ = 1 (ρ > 1): la cantidad en el sistema crece con pendiente λ − μ = 0,2 (± 5%). 10 réplicas de
//      100.000 unidades; la pendiente de cada réplica es N(T) / T.
// M01: multiplicar por 60 todas las duraciones y dividir por 60 todas las tasas, con la misma semilla y réplica, en la versión
//      corta de cada caso de la batería: los indicadores de tiempo salen × 60, los rendimientos ÷ 60 y todo lo demás igual
//      (cantidades, probabilidades, conteos, eventos), con error relativo ≤ 1e-6.
// M02: conservación por bloque (entraron = salieron + adentro en cada estación y en cada clase; en servicio + en cola = adentro;
//      nunca más que los servidores ni que la capacidad) en cada corrida de la batería: las versiones cortas de todos los casos y
//      todas las corridas que se hayan hecho antes en esta misma ejecución. Exacta.
import { correrRed, escalarRed, type ConfigRed, type MedidasRed } from '../flujo/red.ts';
import { decl, evaluarIdentico, evaluarRelativo, exp, replicar, type Caso } from './comun.ts';

const F = 60;
const TOL_M01 = 1e-6;

function compararEscalado(etiqueta: string, a: MedidasRed, b: MedidasRed, dif: string[]): number {
  let n = 0;
  const ver = (que: string, x: number, y: number, factor: number) => {
    n++;
    if (Number.isNaN(x) && Number.isNaN(y)) return;
    const esperado = x * factor;
    const rel = esperado !== 0 ? Math.abs(y - esperado) / Math.abs(esperado) : Math.abs(y);
    if (!(rel <= TOL_M01)) dif.push(`${etiqueta} · ${que}: se esperaba ${esperado} (= ${x} × ${factor}) y salió ${y} (error relativo ${rel.toExponential(2)})`);
  };
  ver('ventana', a.ventana, b.ventana, F);
  ver('L', a.L, b.L, 1);
  a.estaciones.forEach((e, s) => {
    const f = b.estaciones[s];
    ver(`${e.id}.L`, e.L, f.L, 1); ver(`${e.id}.Lq`, e.Lq, f.Lq, 1); ver(`${e.id}.ocupacion`, e.ocupacion, f.ocupacion, 1);
    ver(`${e.id}.intentos`, e.intentos, f.intentos, 1); ver(`${e.id}.bloqueados`, e.bloqueados, f.bloqueados, 1);
    ver(`${e.id}.pBloqueo`, e.pBloqueo, f.pBloqueo, 1);
    e.Wq.forEach((w, k) => { ver(`${e.id}.Wq[${k}]`, w, f.Wq[k], F); ver(`${e.id}.nWq[${k}]`, e.nWq[k], f.nWq[k], 1); ver(`${e.id}.pEspera[${k}]`, e.pEspera[k], f.pEspera[k], 1); });
  });
  a.clases.forEach((c, k) => {
    const d = b.clases[k];
    ver(`${c.id}.W`, c.W, d.W, F); ver(`${c.id}.nW`, c.nW, d.nW, 1); ver(`${c.id}.salidas`, c.salidas, d.salidas, 1);
    ver(`${c.id}.ciclos`, c.ciclos, d.ciclos, 1); ver(`${c.id}.TH`, c.TH, d.TH, 1 / F); ver(`${c.id}.CT`, c.CT, d.CT, F); ver(`${c.id}.nCT`, c.nCT, d.nCT, 1);
  });
  a.observaciones.forEach((x, i) => ver(`observaciones[${i}]`, x, b.observaciones[i], 1));
  if (a.tObjetivo !== null || b.tObjetivo !== null) ver('tObjetivo', a.tObjetivo ?? Number.NaN, b.tObjetivo ?? Number.NaN, F);
  ver('eventos', a.corrida.eventos, b.corrida.eventos, 1);
  return n;
}

export function casosDM(): Caso[] {
  const T = 100_000;
  const degenerada: ConfigRed = {
    id: 'd01-inestable',
    estaciones: [{ id: 'servidor', servidores: 1, servicio: exp(1) }],
    clases: [{ id: 'cliente', entrada: 'servidor', llegadas: { tipo: 'renovacion', entre: exp(1 / 1.2) } }],
    horizonte: T, observar: [T],
  };
  const casoD01: Caso = {
    id: 'd01-inestable', titulo: 'Degenerada: M/M/1 con ρ = 1,2', archivo: 'casos/d-m.ts', suite: 'rapida',
    replicas: 10, horizonte: T, calentamiento: 0,
    pruebas: [{ id: 'D01', nombre: 'Degenerada: M/M/1 con λ = 1,2 y μ = 1, pendiente de crecimiento de la cola (λ − μ)', familia: 'D', tipo: 'exigible',
      esperado: 0.2, criterio: { tipo: 'relativo', tolRel: 0.05 } }],
    cortas: [{ etiqueta: 'corta', config: { ...degenerada, horizonte: 1000, observar: [1000] } }],
    correr(ctx) {
      const ms = replicar(ctx, casoD01.id, degenerada, Math.max(10, Math.round(10 * ctx.factorReplicas)));
      let s = 0;
      for (const m of ms) s += m.observaciones[0] / T;
      return [evaluarRelativo(casoD01, decl(casoD01, 'D01'), ctx, s / ms.length, ms.length)];
    },
  };
  const casoM01: Caso = {
    id: 'm01-metamorfica', titulo: 'Metamórfica: todas las duraciones × 60', archivo: 'casos/d-m.ts', suite: 'rapida',
    replicas: 1, horizonte: 0, calentamiento: 0,
    pruebas: [{ id: 'M01', nombre: 'Metamórfica: duraciones × 60 y tasas ÷ 60 con la misma semilla → tiempos × 60, todo lo demás igual', familia: 'M', tipo: 'exigible',
      esperado: 'tiempos × 60 con error relativo ≤ 1e-6', criterio: { tipo: 'identico' } }],
    cortas: [],
    correr(ctx) {
      const dif: string[] = [];
      let n = 0, redes = 0;
      for (const caso of ctx.casos()) for (const c of caso.cortas) {
        const a = correrRed(ctx.crearMotor, c.config, ctx.semilla, 0);
        const b = correrRed(ctx.crearMotor, escalarRed(c.config, F), ctx.semilla, 0);
        ctx.alCorrer(casoM01.id, a); ctx.alCorrer(casoM01.id, b);
        n += compararEscalado(`${caso.id}/${c.etiqueta}`, a, b, dif);
        redes++;
      }
      return [evaluarIdentico(casoM01, decl(casoM01, 'M01'), ctx, n, dif, `${n} valores en ${redes} redes; ${dif.length} fuera de tolerancia`)];
    },
  };
  const casoM02: Caso = {
    id: 'm02-conservacion', titulo: 'Conservación por bloque en cada corrida', archivo: 'casos/d-m.ts', suite: 'rapida',
    replicas: 1, horizonte: 0, calentamiento: 0, alFinal: true,
    pruebas: [{ id: 'M02', nombre: 'Conservación por bloque: entraron = salieron + adentro, en cada caso de la batería', familia: 'M', tipo: 'exigible',
      esperado: 'ninguna violación', criterio: { tipo: 'identico' } }],
    cortas: [],
    correr(ctx) {
      for (const caso of ctx.casos()) for (const c of caso.cortas) ctx.alCorrer(caso.id, correrRed(ctx.crearMotor, c.config, ctx.semilla, 0));
      const { corridas, violaciones } = ctx.conservacion();
      return [evaluarIdentico(casoM02, decl(casoM02, 'M02'), ctx, corridas, violaciones, `${corridas} corridas; ${violaciones.length} violaciones`)];
    },
  };
  return [casoD01, casoM01, casoM02];
}
