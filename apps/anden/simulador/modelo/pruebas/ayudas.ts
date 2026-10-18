// pruebas/ayudas.ts · P3 · Piezas comunes de las pruebas del paquete (no es una prueba: node --test solo corre los *.test.ts).
import { readFileSync } from 'node:fs';
import type { ResolverPlantilla } from '../../contratos/escena.ts';
import type { Diagnostico, Modelo } from '../../contratos/modelo.ts';

const RUTA_EJEMPLO = new URL('../../contratos/ejemplos/hub-chico.json', import.meta.url);
const TEXTO_EJEMPLO = readFileSync(RUTA_EJEMPLO, 'utf8');

/** El modelo de ejemplo de corte-1.md §5 (hub chico de última milla), como objeto nuevo en cada llamada. */
export function ejemploJson(): any {
  return JSON.parse(TEXTO_EJEMPLO);
}
export function ejemploModelo(): Modelo {
  return JSON.parse(TEXTO_EJEMPLO) as Modelo;
}
export const TEXTO_DEL_EJEMPLO = TEXTO_EJEMPLO;

/** La plantilla `hub-chico@1.0.0` es el propio ejemplo (§5). */
export const resolverEjemplo: ResolverPlantilla = (id, version) => (id === 'hub-chico' && version === '1.0.0' ? ejemploModelo() : null);

/** Generador congruencial lineal con semilla fija: ninguna prueba depende de Math.random ni del reloj. */
export class Lcg {
  private x: number;
  constructor(semilla: number) { this.x = semilla >>> 0; }
  /** Entero de 32 bits sin signo. */
  siguiente(): number {
    this.x = (Math.imul(this.x, 1664525) + 1013904223) >>> 0;
    return this.x;
  }
  /** Entero en [0, n). */
  hasta(n: number): number { return Math.floor((this.siguiente() / 4294967296) * n); }
  /** Número en [0, 1). */
  unidad(): number { return this.siguiente() / 4294967296; }
}

export function codigos(ds: readonly Diagnostico[]): string[] {
  return ds.map((d) => d.codigo);
}

/** Resumen corto de los diagnósticos para armar mensajes de error de las pruebas. */
export function resumen(ds: readonly Diagnostico[]): string {
  return ds.length === 0 ? '(sin diagnósticos)' : ds.slice(0, 6).map((d) => `${d.nivel[0].toUpperCase()}:${d.clave}@${d.ruta || '/'}`).join(' · ');
}

/** Variables {nombre} de un texto de interfaz, sin repetir. */
export function variablesDe(texto: string): string[] {
  const vistos = new Set<string>();
  for (const m of texto.matchAll(/\{([A-Za-z0-9_]+)\}/g)) vistos.add(m[1]);
  return [...vistos].sort();
}

/** Congela un valor en profundidad: sirve para probar que una función no modifica su entrada. */
export function congelar<T>(x: T): T {
  if (x !== null && typeof x === 'object') {
    for (const k of Object.keys(x)) congelar((x as Record<string, unknown>)[k]);
    Object.freeze(x);
  }
  return x;
}

/**
 * Hub grande sintético armado con las reglas de la plantilla `hub-lazo-noche` de corte-1.md §5 (26 camiones de 923 paquetes, 4 andenes
 * de 2 personas, acumulación de 96 m, 6 puestos físicos con 4 personas, lazo de 70 m de recta y radio 40 ÷ 2π (300 bandejas),
 * 60 rampas de capacidad 25, 50 rutas con pesos 1 ÷ (r+1)^0,7 y las 10 más pesadas con dos rampas, 15 personas de rampa, 2 puestos
 * manuales, corte a las 06:00). La plantilla verdadera la genera P4; esto prueba que el compilador acepta esa escala y esa geometría.
 */
export function hubGrandeJson(): any {
  const m = ejemploJson();
  m.id = 'hub-grande-sintetico';
  m.plantilla = { id: 'hub-lazo-noche', version: '1.0.0' };
  m.calendario = { inicio: '22:00', fin: '30:00', corte: '30:00' };
  m.demanda.camiones = { serie: true, cantidad: 26, primero: '22:00', cada: 900, paquetes: 923 };
  m.hub.andenes = [0, 1, 2, 3].map((i) => ({ id: `A${i + 1}`, x: -20 + 6 * i, y: -12, personas: 2 }));
  m.hub.cintas = [0, 1, 2, 3].map((i) => ({ id: `C${i + 1}`, desde: `A${i + 1}`, velocidad: 1, paso: 0.6, puntos: [[-20 + 6 * i, -10], [-20 + 6 * i, -3], [-2, -3]] }));
  m.hub.acumulacion = { largo: 96, paso: 0.6, x: -1, y: -2 };
  m.hub.sorter.recta = 70;
  m.hub.sorter.radio = 40 / (2 * Math.PI);
  m.hub.induccion.puestos = [0, 1, 2, 3, 4, 5].map((i) => ({ id: `I${i + 1}`, s: 0.6 + 1.2 * i }));
  m.personas.induccion.puestosActivos = 4;
  const rampas: { id: string; s: number; lado: number; capacidad: number }[] = [];
  for (let i = 0; i < 25; i++) rampas.push({ id: `R${String(i + 1).padStart(2, '0')}`, s: 12 + 1.2 * i, lado: -1, capacidad: 25 });
  for (let i = 0; i < 35; i++) rampas.push({ id: `R${String(i + 26).padStart(2, '0')}`, s: 100 + 1.2 * i, lado: 1, capacidad: 25 });
  m.hub.rampas = rampas;
  m.hub.excepcion = { id: 'RX', s: 170 };
  const pesos = Array.from({ length: 50 }, (_, r) => 1 / Math.pow(r + 2, 0.7));
  const suma = pesos.reduce((a, b) => a + b, 0);
  let sig = 0;
  m.hub.planClasificacion.rutas = pesos.map((p, r) => {
    const n = r < 10 ? 2 : 1;
    const rs = Array.from({ length: n }, () => rampas[sig++].id);
    return { id: `Ruta ${String(r + 1).padStart(2, '0')}`, peso: p / suma, rampas: rs };
  });
  m.personas.rampa.cantidad = 15;
  m.personas.excepcion.cantidad = 2;
  m.decision.variable = { ruta: '/personas/induccion/puestosActivos', min: 2, max: 6 };
  m.escenarios = [
    { id: 'base', titulo: 'Como está hoy', parche: [] },
    { id: 'pico', titulo: 'Pico de evento', parche: [{ op: 'replace', path: '/demanda/camiones/paquetes', value: 1385 }] },
  ];
  return m;
}
