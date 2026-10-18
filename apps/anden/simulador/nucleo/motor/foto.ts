// nucleo/motor/foto.ts · Foto y restauración (corte-1.md §6.5).
//
// La foto contiene ahora, seq, eventos, los dos carriles de la huella, el calendario en columnas y, por ruta de bloque, lo que
// devuelve estado(). Con azar por dirección no hay estado de generadores que guardar. Todo se COPIA al sacar la foto y al
// restaurar: la foto no cambia aunque el motor siga corriendo, y se puede restaurar varias veces (división de trayectorias).
//
// Además de las columnas, `calendario` lleva (Record lo permite; ver nucleo/NOTAS-CONTRATO.md):
//   actual            seq del último evento procesado (lo que devuelve m.seq)
//   mismo, tAnterior  estado del guardián de lazos de tiempo cero
//   bloques           cantidad de bloques registrados
//   rutas             FNV-1a de la ruta de cada bloque en orden de registro (para exigir el mismo orden al restaurar)
//   semilla, replica  informativos: la foto se puede restaurar con otra réplica a propósito (división de trayectorias, corte 5)
import type { EstadoBloque, Foto } from '../../contratos/motor.ts';
import type { ColumnasCalendario } from './calendario.ts';
import { fnv1a32 } from '../azar/clave.ts';

type Columna = Float64Array | Int32Array | Uint32Array | Int16Array | Uint16Array | Uint8Array;

function esColumna(x: unknown): x is Columna {
  return x instanceof Float64Array || x instanceof Int32Array || x instanceof Uint32Array || x instanceof Int16Array ||
    x instanceof Uint16Array || x instanceof Uint8Array;
}

/** Copia profunda de un estado de bloque. Exige el patrón del contrato: solo arreglos tipados y números. */
export function clonarEstado(e: EstadoBloque, ruta: string): EstadoBloque {
  if (e === null || typeof e !== 'object') {
    throw new TypeError(`estado() del bloque «${ruta}» tiene que devolver un objeto y devolvió ${e === null ? 'null' : typeof e}`);
  }
  const copia: EstadoBloque = {};
  for (const clave of Object.keys(e)) {
    const v = e[clave] as unknown;
    if (typeof v === 'number') copia[clave] = v;
    else if (esColumna(v)) copia[clave] = v.slice();
    else {
      throw new TypeError(`estado() del bloque «${ruta}», clave «${clave}»: se esperaba un arreglo tipado o un número y llegó ` +
        `${v === null ? 'null' : Array.isArray(v) ? 'un arreglo común' : typeof v}`);
    }
  }
  return copia;
}

/** Huellas de las rutas de los bloques, en orden de registro. */
export function huellasDeRutas(rutas: readonly string[]): Float64Array {
  const h = new Float64Array(rutas.length);
  for (let i = 0; i < rutas.length; i++) h[i] = fnv1a32(rutas[i]);
  return h;
}

/** Rutas repetidas (la foto identifica cada bloque por su ruta). */
export function rutasRepetidas(rutas: readonly string[]): string[] {
  const vistas = new Set<string>(), repetidas = new Set<string>();
  for (const r of rutas) { if (vistas.has(r)) repetidas.add(r); vistas.add(r); }
  return [...repetidas];
}

function numeroFoto(f: Foto, nombre: string, x: unknown, entero: boolean): number {
  if (typeof x !== 'number' || !Number.isFinite(x) || (entero && !Number.isInteger(x))) {
    throw new TypeError(`restaurar: la foto trae ${nombre} = ${String(x)}; se esperaba un número ${entero ? 'entero' : 'finito'} (foto versión ${f.version})`);
  }
  return x;
}

/** Lee y valida las columnas del calendario de una foto. */
export function columnasDeFoto(f: Foto): ColumnasCalendario {
  const c = f.calendario;
  const n = numeroFoto(f, 'calendario.n', c.n, true);
  if (n < 0) throw new RangeError(`restaurar: calendario.n = ${n}; se esperaba ≥ 0`);
  const tipos: [keyof ColumnasCalendario, new (n: number) => Columna][] = [
    ['t', Float64Array], ['fase', Uint8Array], ['prioridad', Int32Array], ['seq', Float64Array],
    ['bloque', Int32Array], ['tipo', Int32Array], ['arg', Int32Array],
  ];
  for (const [nombre, Tipo] of tipos) {
    const col = c[nombre];
    if (!(col instanceof Tipo) || col.length < n) {
      throw new TypeError(`restaurar: calendario.${nombre} tiene que ser un ${Tipo.name} de largo ≥ ${n} y llegó ` +
        `${esColumna(col) ? `${col.constructor.name} de largo ${col.length}` : typeof col}`);
    }
  }
  return {
    n, t: c.t as Float64Array, fase: c.fase as Uint8Array, prioridad: c.prioridad as Int32Array, seq: c.seq as Float64Array,
    bloque: c.bloque as Int32Array, tipo: c.tipo as Int32Array, arg: c.arg as Int32Array,
  };
}

/** Valida que la foto corresponda a los mismos bloques, en el mismo orden, que los registrados en el motor que restaura. */
export function exigirMismosBloques(f: Foto, rutas: readonly string[]): void {
  const c = f.calendario;
  const cantidad = numeroFoto(f, 'calendario.bloques', c.bloques, true);
  if (cantidad !== rutas.length) {
    throw new Error(`restaurar: la foto tiene ${cantidad} bloques y el motor tiene ${rutas.length} registrados; ` +
      'se esperaba el mismo conjunto de bloques en el mismo orden (corte-1.md §6.5)');
  }
  const esperadas = c.rutas;
  const actuales = huellasDeRutas(rutas);
  if (!(esperadas instanceof Float64Array) || esperadas.length !== actuales.length) {
    throw new TypeError('restaurar: la foto no trae calendario.rutas (Float64Array con la FNV-1a de cada ruta)');
  }
  for (let i = 0; i < actuales.length; i++) {
    if (esperadas[i] !== actuales[i]) {
      throw new Error(`restaurar: el bloque ${i} registrado es «${rutas[i]}», pero en la foto el bloque ${i} es otro; ` +
        'se esperaba el mismo conjunto de bloques en el mismo orden (corte-1.md §6.5)');
    }
  }
  for (const r of rutas) {
    if (!Object.prototype.hasOwnProperty.call(f.bloques, r)) {
      throw new Error(`restaurar: la foto no trae el estado del bloque «${r}»`);
    }
  }
  const enFoto = Object.keys(f.bloques).length;
  if (enFoto !== rutas.length) {
    throw new Error(`restaurar: la foto trae el estado de ${enFoto} bloques y el motor tiene ${rutas.length}`);
  }
}

export { numeroFoto };
