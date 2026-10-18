// app/falsos/plantillas.ts · Andén simulador, corte 1 · P8 (interfaz) · SOLO PARA DESARROLLO Y PRUEBAS DE LA INTERFAZ.
// Las dos plantillas para los servicios falsos: la chica es el ejemplo de contratos/ (§5) tal cual; la grande se arma acá con las reglas
// de corte-1.md §5 de forma simplificada. Las plantillas publicadas de verdad son las de hub/plantillas/ (P4), que la integración pasa en
// Servicios.plantillas: estas solo sirven para que la interfaz tenga dos modelos con la forma correcta.
import type { Modelo } from '../../contratos/modelo.ts';
import type { RegistroPlantillas } from '../../contratos/hub.ts';
import ejemplo from '../../contratos/ejemplos/hub-chico.json' with { type: 'json' };

export function plantillaChica(): Modelo {
  return structuredClone(ejemplo) as unknown as Modelo;
}

export function plantillaGrande(): Modelo {
  const m = plantillaChica();
  m.id = 'hub-lazo-noche';
  m.titulo = 'Hub de clasificación con lazo, turno noche (24.000 paquetes)';
  m.descripcion = 'Plantilla de ejemplo a escala de la maqueta medida: 26 camiones de 923 paquetes, 4 andenes, 6 puestos de inducción (4 con persona), 60 rampas para 50 rutas. Supuestos de ejemplo; no es un hub real.';
  m.plantilla = { id: 'hub-lazo-noche', version: '1.0.0' };
  m.calendario = { inicio: '22:00', fin: '30:00', corte: '30:00' };
  m.demanda.camiones = { serie: true, cantidad: 26, primero: '22:00', cada: 900, paquetes: 923 };
  m.hub.andenes = [0, 1, 2, 3].map((i) => ({ id: `A${i + 1}`, x: -30 + i * 6, y: -20, personas: 2 }));
  m.hub.cintas = m.hub.andenes.map((a, i) => ({ id: `C${i + 1}`, desde: a.id, velocidad: 1, paso: 0.6, puntos: [[a.x, a.y + 2], [a.x, -10], [2, -10], [2, -3]] as [number, number][] }));
  m.hub.acumulacion = { largo: 96, paso: 0.6, x: 2, y: -3 };
  m.hub.induccion.puestos = Array.from({ length: 6 }, (_, i) => ({ id: `I${i + 1}`, s: 0.5 + i * 1.5 }));
  const radio = 40 / (2 * Math.PI);
  m.hub.sorter = { ...m.hub.sorter, recta: 70, radio };
  const rampas: Modelo['hub']['rampas'] = [];
  for (let i = 0; i < 25; i++) rampas.push({ id: `R${String(i + 1).padStart(2, '0')}`, s: 18 + i * 2, lado: -1, capacidad: 25 });
  for (let i = 0; i < 35; i++) rampas.push({ id: `R${String(i + 26).padStart(2, '0')}`, s: 70 + Math.PI * radio + 1 + i * 1.95, lado: 1, capacidad: 25 });
  m.hub.rampas = rampas;
  m.hub.excepcion = { id: 'RX', s: 140 + Math.PI * radio - 0.5 };
  const pesos = Array.from({ length: 50 }, (_, r) => 1 / (r + 1) ** 0.7);
  const suma = pesos.reduce((a, b) => a + b, 0);
  m.hub.planClasificacion.rutas = pesos.map((w, r) => ({
    id: `Ruta ${String(r + 1).padStart(2, '0')}`, peso: w / suma, rampas: r < 10 ? [rampas[r].id, rampas[50 + r].id] : [rampas[r].id],
  }));
  m.personas.induccion.puestosActivos = 4;
  m.personas.rampa.cantidad = 15;
  m.personas.excepcion.cantidad = 2;
  m.decision = { ...m.decision!, variable: { ruta: '/personas/induccion/puestosActivos', min: 2, max: 6 } };
  m.escenarios = (m.escenarios ?? []).map((e) => (e.id === 'mas-un-puesto' ? { ...e, parche: [{ op: 'replace' as const, path: '/personas/induccion/puestosActivos', value: 5 }] }
    : e.id === 'pico' ? { ...e, parche: [{ op: 'replace' as const, path: '/demanda/camiones/paquetes', value: 1385 }] } : e));
  return m;
}

export function plantillasFalsas(): RegistroPlantillas {
  return Object.freeze({ 'hub-chico@1.0.0': plantillaChica(), 'hub-lazo-noche@1.0.0': plantillaGrande() });
}
