// hub/plantillas/generar.ts · Andén simulador, corte 1 · P4 (el hub).
// Genera la plantilla grande `hub-lazo-noche@1.0.0` (24.000 paquetes; la que abre el enlace de portada) desde el modelo de ejemplo,
// con las reglas de corte-1.md §5: 26 camiones de 923 paquetes desde las 22:00 cada 15 min; 4 andenes de 2 personas; acumulación de
// 96 m (160 lugares); 6 puestos físicos, 4 con persona; lazo de 70 m de recta y radio 40 ÷ 2π (300 bandejas); 60 rampas de capacidad
// 25 (25 abajo y 35 arriba, como la maqueta medida); 50 rutas con pesos 1 ÷ (r+1)^0,7 normalizados, las 10 más pesadas con dos rampas;
// 15 personas de rampa por volumen; 2 puestos manuales; corte a las 06:00 (30:00); los mismos parámetros.
// La salida se guarda UNA vez como JSON inmutable (hub-lazo-noche.json); la prueba plantillas.test.ts verifica que este generador la
// reproduce exacta. Una versión nueva sería otro id@versión. Es una herramienta: no corre en la app.
import type { Modelo } from '../../contratos/modelo.ts';
import { matNativa } from '../../contratos/referencia/motor-referencia.ts';

const dos = (n: number) => String(n).padStart(2, '0');
/** Redondeo a centímetros (las posiciones quedan como números cortos en el JSON). */
const aCm = (x: number) => Math.round(x * 100) / 100;

/** Posiciones (m sobre el lazo) de las 60 rampas: 25 en la recta de abajo y 35 en la de arriba, como la maqueta medida. */
export function posicionesRampas(): { s: number; lado: -1 | 1 }[] {
  const out: { s: number; lado: -1 | 1 }[] = [];
  for (let i = 0; i < 25; i++) out.push({ s: aCm(18 + i * 2), lado: -1 });
  for (let i = 0; i < 35; i++) out.push({ s: aCm(91 + i * 1.95), lado: 1 });
  return out;
}

/** Pesos 1 ÷ (r+1)^0,7 normalizados, r = 0…49 (reparto tipo Zipf de los destinos). */
export function pesosRutas(n = 50, exponente = 0.7): number[] {
  const w = Array.from({ length: n }, (_, r) => 1 / matNativa.pow(r + 1, exponente));
  let suma = 0;
  for (const x of w) suma += x;
  return w.map((x) => x / suma);
}

export function generarHubLazoNoche(base: Modelo): Modelo {
  const m = structuredClone(base) as Modelo;
  m.id = 'hub-lazo-noche';
  m.titulo = 'Hub de clasificación con lazo, turno noche (24.000 paquetes)';
  m.descripcion =
    'Hub de última milla con sorter de bandejas a escala de la maqueta medida: 26 camiones de 923 paquetes, 4 andenes, 6 puestos de ' +
    'inducción (4 con persona), 60 rampas para 50 rutas y 15 personas de rampa. Supuestos de ejemplo con su fuente; no es un hub real ' +
    'ni sale de ninguna empresa.';
  m.plantilla = { id: 'hub-lazo-noche', version: '1.0.0' };
  m.procedencia = {
    ...(m.procedencia ?? {}),
    '/hub/rampas': {
      etiqueta: 'SUPUESTO',
      fuente: 'Capacidad de rampa sin valor publicado (realismo-logistico.md §2.6); 60 rampas de capacidad 25, 25 abajo y 35 arriba, como la maqueta medida (visiones/experiencia-medicion/hub.mjs).',
      fecha: '2026-10-17',
    },
    '/hub/planClasificacion': {
      etiqueta: 'SUPUESTO',
      fuente: 'Pesos de 50 rutas 1 ÷ (r+1)^0,7 normalizados (reparto tipo Zipf de la maqueta medida); las 10 más pesadas con dos rampas, repartidas por el lazo.',
      fecha: '2026-10-17',
    },
  };
  m.calendario = { inicio: '22:00', fin: '30:00', corte: '30:00' };
  m.demanda = { ...m.demanda, camiones: { serie: true, cantidad: 26, primero: '22:00', cada: 900, paquetes: 923 } };

  const h = m.hub;
  h.andenes = [0, 1, 2, 3].map((i) => ({ id: `A${i + 1}`, x: -20 + 6 * i, y: -12, personas: 2 }));
  h.playa = { capacidad: 8 };
  h.cintas = h.andenes.map((a, i) => ({
    id: `C${i + 1}`, desde: a.id, velocidad: 1, paso: 0.6,
    puntos: (a.x === -2 ? [[-2, -10], [-2, -3]] : [[a.x, -10], [a.x, -3], [-2, -3]]) as [number, number][],
  }));
  h.acumulacion = { largo: 96, paso: 0.6, x: -1, y: -2 };
  h.sorter = { ...h.sorter, recta: 70, radio: 40 / (2 * Math.PI), lector: { ...h.sorter.lector, s: 10 } };
  h.induccion = { ...h.induccion, puestos: [0.5, 2, 3.5, 5, 6.5, 8].map((s, i) => ({ id: `I${i + 1}`, s })) };
  const pos = posicionesRampas();
  h.rampas = pos.map((p, i) => ({ id: `R${dos(i + 1)}`, s: p.s, lado: p.lado, capacidad: 25 }));
  h.excepcion = { id: 'RX', s: 159.5 };
  // Rampa i → «lugar» (i · 37) mod 60 (37 es coprimo con 60: es una permutación que reparte las rutas grandes por el lazo).
  // Lugar p < 50 → ruta p; lugar p ≥ 50 → segunda rampa de la ruta p − 50 (las 10 más pesadas).
  const pesos = pesosRutas();
  const rampasDe: string[][] = Array.from({ length: 50 }, () => []);
  for (let i = 0; i < 60; i++) {
    const p = (i * 37) % 60;
    rampasDe[p < 50 ? p : p - 50].push(h.rampas[i].id);
  }
  h.planClasificacion = {
    multiRampa: 'la-menos-llena',
    rutas: pesos.map((peso, r) => ({ id: `Ruta ${dos(r + 1)}`, peso, rampas: rampasDe[r] })),
  };

  const pe = m.personas;
  pe.induccion = { ...pe.induccion, puestosActivos: 4 };
  pe.rampa = { ...pe.rampa, cantidad: 15, asignacion: 'por-volumen' };
  pe.excepcion = { ...pe.excepcion, cantidad: 2 };

  if (m.decision) m.decision = { ...m.decision, variable: { ...m.decision.variable, max: 6 } };
  m.escenarios = [
    { id: 'base', titulo: 'Como está hoy', parche: [] },
    { id: 'mas-un-puesto', titulo: 'Un puesto de inducción más', parche: [{ op: 'replace', path: '/personas/induccion/puestosActivos', value: 5 }] },
    { id: 'reten', titulo: 'Una persona de retén que cubre faltas', parche: [{ op: 'replace', path: '/personas/induccion/reten', value: 1 }] },
    { id: 'rampas-contiguas', titulo: 'Cada persona de rampa con rampas vecinas', parche: [{ op: 'replace', path: '/personas/rampa/asignacion', value: 'contiguas' }] },
    { id: 'pico', titulo: 'Pico de evento: 50% más paquetes por camión', parche: [{ op: 'replace', path: '/demanda/camiones/paquetes', value: 1385 }] },
  ];
  return m;
}
