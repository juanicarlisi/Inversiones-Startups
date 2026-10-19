// integracion/bateria/casos-r04.ts · Andén simulador, corte 1 · Integración (corte-1.md §8 R04 y §10.7).
// R04 en la batería: la misma huella en Node y en el navegador. La mide integracion/r04.mjs (Chromium con Playwright, asíncrono) antes de
// correr la batería, que es síncrona; este caso informa esa medición. Firefox y WebKit quedan pendientes con su motivo si no están.
import type { Caso } from '../../verificacion/casos/comun.ts';
import { decl } from '../../verificacion/casos/comun.ts';
import { resultado } from './comun.ts';

export interface NavegadorR04 {
  nombre: string;
  estado: 'pasa' | 'falla' | 'pendiente';
  version?: string;
  motivo?: string;
  comparadas?: number;
  iguales?: number;
  nDistintas?: number;
  nFaltan?: number;
  nSobran?: number;
  distintas?: string[];
  matDistintas?: number;
  errores?: string[];
}

export interface MedicionR04 {
  version: 1;
  prueba: 'R04';
  node: string;
  claves: number;
  grupos: Record<string, number>;
  matDistintasNode: number;
  navegadores: NavegadorR04[];
  estado: 'pasa' | 'falla';
  alcance: string;
  pendientes: { nombre: string; motivo: string }[];
  huellasNode: Record<string, string>;
  segundos: number;
}

export function casosR04(r04: MedicionR04 | null, motivoSinMedir = 'no se midió (npm run verificar corre R04 en Chromium antes de la batería)'): Caso[] {
  const caso: Caso = {
    id: 'r04-navegadores', titulo: 'La misma huella en Node y en el navegador (R04)', archivo: 'integracion/bateria/casos-r04.ts', suite: 'completa',
    replicas: 1, horizonte: 0, calentamiento: 0,
    pruebas: [{ id: 'R04', nombre: 'La misma huella en Node y en Chromium (y en Firefox y WebKit si están) para la suite rápida, sus doradas, ' +
      'el hub chico (5 semillas) y las doradas de matemática', familia: 'R', tipo: 'exigible', esperado: 'idénticas', criterio: { tipo: 'identico' } }],
    cortas: [],
    correr(ctx) {
      const d = decl(caso, 'R04');
      if (!r04) return [resultado(caso, d, ctx, 'I', { simulado: null, fallas: [motivoSinMedir], n: 0 })];
      const fallas: string[] = [];
      const corridos = r04.navegadores.filter((x) => x.estado !== 'pendiente');
      if (!corridos.length) fallas.push('no se pudo correr en ningún navegador');
      if (r04.matDistintasNode) fallas.push(`en Node, ${r04.matDistintasNode} doradas de matemática distintas`);
      for (const x of corridos) {
        if (x.estado === 'pasa') continue;
        fallas.push(`${x.nombre} ${x.version ?? ''}: ${x.nDistintas ?? 0} claves distintas, ${x.nFaltan ?? 0} faltan, ${x.nSobran ?? 0} sobran, ` +
          `${x.matDistintas ?? 0} doradas de matemática distintas, ${x.errores?.length ?? 0} errores` +
          `${x.distintas?.length ? ` (la primera: ${x.distintas[0]})` : x.errores?.length ? ` (${x.errores[0]})` : ''}`);
      }
      const pend = r04.pendientes.length ? `; pendientes: ${r04.pendientes.map((p) => p.nombre).join(' y ')} (no instalados)` : '';
      const versiones = corridos.map((x) => `${x.nombre} ${x.version ?? ''}`.trim()).join(', ');
      return [resultado(caso, d, ctx, 'I', { simulado: `${r04.alcance} en ${r04.claves} claves (${versiones}; Node ${r04.node})${pend}`,
        fallas, n: r04.claves, criterio: 'idénticas clave por clave; Firefox y WebKit, si no están instalados, quedan pendientes con su motivo (§10.7)' })];
    },
  };
  return [caso];
}
