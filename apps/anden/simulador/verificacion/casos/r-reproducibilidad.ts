// verificacion/casos/r-reproducibilidad.ts · Reproducibilidad (suite rápida).
// R01: misma semilla y réplica → misma huella y mismas medidas, en la versión corta de cada caso de la batería y con 5 semillas.
//      (El hub chico lo prueba P4 con sus 5 semillas.)
// R02: números aleatorios comunes: con 2 o con 3 servidores, las primeras 50 llegadas y sus servicios son idénticos.
// R03: otra réplica → otra huella (en los casos con azar; la Penny Fab determinista no tiene).
import { correrRed, type ConfigRed, type MedidasRed } from '../flujo/red.ts';
import { decl, evaluarIdentico, exp, type Caso } from './comun.ts';

const SEMILLAS = 5;

/** Igualdad exacta de dos medidas (NaN = NaN). */
export function mismasMedidas(a: MedidasRed, b: MedidasRed): string | null {
  const ja = JSON.stringify(a, (_, v) => (typeof v === 'number' && Number.isNaN(v) ? 'NaN' : v));
  const jb = JSON.stringify(b, (_, v) => (typeof v === 'number' && Number.isNaN(v) ? 'NaN' : v));
  if (ja === jb) return null;
  let i = 0;
  while (i < ja.length && ja[i] === jb[i]) i++;
  return `difieren desde «…${ja.slice(Math.max(0, i - 40), i + 40)}…» contra «…${jb.slice(Math.max(0, i - 40), i + 40)}…»`;
}

export function redR02(servidores: number): ConfigRed {
  return {
    id: 'r02-crn',
    estaciones: [{ id: 'servidores', servidores, servicio: exp(1) }],
    clases: [{ id: 'cliente', entrada: 'servidores', llegadas: { tipo: 'renovacion', entre: exp(0.6) } }],
    horizonte: 200, registrar: { primeras: 50 },
  };
}

export function casosReproducibilidad(): Caso[] {
  const casoR01: Caso = {
    id: 'r01-misma-huella', titulo: 'Misma semilla y réplica, misma huella', archivo: 'casos/r-reproducibilidad.ts', suite: 'rapida',
    replicas: 1, horizonte: 0, calentamiento: 0,
    pruebas: [{ id: 'R01', nombre: 'Misma semilla y réplica → misma huella (cada caso de la batería, 5 semillas)', familia: 'R', tipo: 'exigible',
      esperado: 'idénticas', criterio: { tipo: 'identico' } }],
    cortas: [],
    correr(ctx) {
      const dif: string[] = [];
      let n = 0;
      for (const caso of ctx.casos()) for (const c of caso.cortas) for (let s = 0; s < SEMILLAS; s++) {
        const semilla = (ctx.semilla + s) >>> 0;
        const a = correrRed(ctx.crearMotor, c.config, semilla, 0), b = correrRed(ctx.crearMotor, c.config, semilla, 0);
        ctx.alCorrer(casoR01.id, a); ctx.alCorrer(casoR01.id, b);
        n++;
        if (a.corrida.huella !== b.corrida.huella) dif.push(`${caso.id}/${c.etiqueta}, semilla ${semilla}: huellas ${a.corrida.huella} y ${b.corrida.huella}`);
        else { const d = mismasMedidas(a, b); if (d) dif.push(`${caso.id}/${c.etiqueta}, semilla ${semilla}: misma huella pero medidas distintas: ${d}`); }
      }
      return [evaluarIdentico(casoR01, decl(casoR01, 'R01'), ctx, n, dif, `${n} pares; ${dif.length} distintos`)];
    },
  };
  const casoR02: Caso = {
    id: 'r02-numeros-comunes', titulo: 'Números aleatorios comunes con 2 y 3 servidores', archivo: 'casos/r-reproducibilidad.ts', suite: 'rapida',
    replicas: 1, horizonte: 200, calentamiento: 0,
    pruebas: [{ id: 'R02', nombre: 'Números comunes: con 2 o con 3 servidores, las primeras 50 llegadas y sus servicios son idénticos', familia: 'R', tipo: 'exigible',
      esperado: 'idénticos', criterio: { tipo: 'identico' } }],
    cortas: [{ etiqueta: '2 servidores', config: redR02(2) }, { etiqueta: '3 servidores', config: redR02(3) }],
    correr(ctx) {
      const a = correrRed(ctx.crearMotor, redR02(2), ctx.semilla, 0), b = correrRed(ctx.crearMotor, redR02(3), ctx.semilla, 0);
      ctx.alCorrer(casoR02.id, a); ctx.alCorrer(casoR02.id, b);
      const dif: string[] = [];
      const pa = a.primeras!, pb = b.primeras!;
      for (let i = 0; i < 50; i++) {
        if (!Number.isFinite(pa.llegadas[i]) || !Number.isFinite(pa.servicios[i])) dif.push(`la llegada ${i} no quedó registrada (¿horizonte corto?)`);
        else if (pa.llegadas[i] !== pb.llegadas[i]) dif.push(`llegada ${i}: ${pa.llegadas[i]} ms con 2 servidores y ${pb.llegadas[i]} ms con 3`);
        else if (pa.servicios[i] !== pb.servicios[i]) dif.push(`servicio ${i}: ${pa.servicios[i]} ms con 2 servidores y ${pb.servicios[i]} ms con 3`);
      }
      if (a.corrida.huella === b.corrida.huella) dif.push('las dos corridas dieron la misma huella: la cantidad de servidores no cambió nada (¿la red no se armó?)');
      return [evaluarIdentico(casoR02, decl(casoR02, 'R02'), ctx, 50, dif, dif.length ? `${dif.length} diferencias` : 'idénticos')];
    },
  };
  const casoR03: Caso = {
    id: 'r03-otra-replica', titulo: 'Otra réplica, otra huella', archivo: 'casos/r-reproducibilidad.ts', suite: 'rapida',
    replicas: 1, horizonte: 0, calentamiento: 0,
    pruebas: [{ id: 'R03', nombre: 'Otra réplica → otra huella (cada caso de la batería con azar, 5 semillas)', familia: 'R', tipo: 'exigible',
      esperado: 'distintas', criterio: { tipo: 'identico' } }],
    cortas: [],
    correr(ctx) {
      const dif: string[] = [];
      let n = 0;
      for (const caso of ctx.casos()) for (const c of caso.cortas) {
        if (c.determinista) continue;
        for (let s = 0; s < SEMILLAS; s++) {
          const semilla = (ctx.semilla + s) >>> 0;
          const a = correrRed(ctx.crearMotor, c.config, semilla, 0), b = correrRed(ctx.crearMotor, c.config, semilla, 1);
          ctx.alCorrer(casoR03.id, a); ctx.alCorrer(casoR03.id, b);
          n++;
          if (a.corrida.huella === b.corrida.huella) dif.push(`${caso.id}/${c.etiqueta}, semilla ${semilla}: réplicas 0 y 1 con la misma huella ${a.corrida.huella}`);
        }
      }
      return [evaluarIdentico(casoR03, decl(casoR03, 'R03'), ctx, n, dif, `${n} pares; ${dif.length} iguales`)];
    },
  };
  return [casoR01, casoR02, casoR03];
}
