// Planificador bajo azar: secuencias al azar (con semilla fija) de enviar, cancelar y cancelarDesde sobre trabajadores en proceso.
// Las pruebas de planificador.test.ts fijan cada garantía con un caso armado a mano; esta busca lo que ningún caso armado a mano previó:
// que en CUALQUIER mezcla de trabajos, prioridades y cancelaciones se cumplan a la vez las cuatro garantías del encabezado de planificador.ts.
//   1. Cada réplica de un trabajo que no se canceló llega exactamente una vez y el trabajo termina con cancelado = false.
//   2. Después de cancelar, no llega NADA más de ese trabajo.
//   3. Nunca llega una réplica repetida ni fuera del rango pedido, y `completadas` es lo que de verdad se entregó.
//   4. Ningún trabajo queda colgado ni se rechaza sin motivo, y al cerrar no queda ningún trabajador vivo (creados = terminados).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearPlanificador } from '../planificador.ts';
import { trabajadorEnProcesoCon } from '../en-proceso.ts';
import { Prioridad } from '../../contratos/experimentos.ts';
import type { FabricaTrabajador, Simulador } from '../../contratos/experimentos.ts';
import { esperar, generadorUniformes, resultadoFalso, validadoEjemplo } from './ayudas.ts';

const mv = validadoEjemplo();
const sim: Simulador = (m, semilla, replica) => ({ resultado: resultadoFalso({ semilla, replica, modelo: m.huella }) });

interface Trabajo {
  id: string; desde: number; hasta: number; prioridad: Prioridad;
  recibidas: number[]; cancelacionPedida: boolean; recibidasDespuesDeCancelar: number;
  fin?: { completadas: number; cancelado: boolean }; rechazo?: string;
}

async function unaCorrida(semilla: number): Promise<string[]> {
  const u = generadorUniformes(semilla);
  const entero = (n: number) => Math.floor(u() * n);
  const fallas: string[] = [];

  let creados = 0, terminados = 0;
  const base = trabajadorEnProcesoCon(sim, 'azar', { cederCada: 1 + entero(3) });
  const fabrica: FabricaTrabajador = () => {
    const puerto = base();
    creados++;
    let terminado = false;
    return {
      enviar: (m, t) => puerto.enviar(m, t),
      alRecibir: (f) => puerto.alRecibir(f),
      terminar: () => { if (!terminado) { terminado = true; terminados++; } puerto.terminar(); },
    };
  };
  const planificador = crearPlanificador(fabrica, 1 + entero(4));

  const trabajos: Trabajo[] = [];
  const promesas: Promise<void>[] = [];
  const pasos = 25 + entero(25);
  for (let i = 0; i < pasos; i++) {
    const dado = u();
    if (dado < 0.6 || trabajos.length === 0) {
      const desde = entero(5), hasta = desde + entero(14);
      const t: Trabajo = {
        id: `azar${semilla}-${i}`, desde, hasta, prioridad: entero(5) as Prioridad,
        recibidas: [], cancelacionPedida: false, recibidasDespuesDeCancelar: 0,
      };
      trabajos.push(t);
      promesas.push(planificador.enviar(
        { id: t.id, prioridad: t.prioridad, mv, semilla: 5, replicas: [desde, hasta], traza: 'no' },
        (r) => { t.recibidas.push(r.replica); if (t.cancelacionPedida) t.recibidasDespuesDeCancelar++; },
      ).then((fin) => { t.fin = fin; }, (e: unknown) => { t.rechazo = e instanceof Error ? e.message : String(e); }));
    } else if (dado < 0.8) {
      const t = trabajos[entero(trabajos.length)];
      if (!t.fin && !t.rechazo) { t.cancelacionPedida = true; planificador.cancelar(t.id); }
    } else if (dado < 0.9) {
      const desde = entero(5) as Prioridad;
      for (const t of trabajos) if (!t.fin && !t.rechazo && t.prioridad >= desde) t.cancelacionPedida = true;
      planificador.cancelarDesde(desde);
    }
    for (let k = entero(3); k > 0; k--) await esperar(0);          // deja pasar mensajes pendientes; ninguna aserción depende de cuánto tarda
  }
  await Promise.all(promesas);

  for (const t of trabajos) {
    const pedidas = t.hasta - t.desde;
    const quien = `semilla ${semilla}, trabajo ${t.id} (réplicas ${t.desde} a ${t.hasta - 1}, prioridad ${t.prioridad})`;
    if (t.rechazo) { fallas.push(`${quien}: se rechazó sin que nada fallara: ${t.rechazo}`); continue; }
    if (!t.fin) { fallas.push(`${quien}: la promesa nunca se resolvió`); continue; }
    if (t.recibidasDespuesDeCancelar > 0) fallas.push(`${quien}: llegaron ${t.recibidasDespuesDeCancelar} resultados DESPUÉS de cancelar`);
    if (new Set(t.recibidas).size !== t.recibidas.length) fallas.push(`${quien}: réplicas repetidas ${t.recibidas.join(',')}`);
    for (const r of t.recibidas) if (r < t.desde || r >= t.hasta) fallas.push(`${quien}: llegó la réplica ${r}, fuera del rango pedido`);
    if (t.fin.completadas !== t.recibidas.length) fallas.push(`${quien}: dice ${t.fin.completadas} completadas y entregó ${t.recibidas.length}`);
    if (!t.fin.cancelado && t.recibidas.length !== pedidas) fallas.push(`${quien}: terminó sin cancelar con ${t.recibidas.length} de ${pedidas} réplicas`);
    if (t.fin.cancelado && !t.cancelacionPedida) fallas.push(`${quien}: figura cancelado y nadie lo canceló`);
  }
  planificador.cerrar();
  if (creados !== terminados) fallas.push(`semilla ${semilla}: se crearon ${creados} trabajadores y se terminaron ${terminados}; al cerrar no puede quedar ninguno vivo`);
  return fallas;
}

test('planificador al azar: 30 secuencias de enviar, cancelar y cancelarDesde cumplen a la vez las cuatro garantías (cada réplica una vez, nada después de cancelar, nada colgado, sin trabajadores vivos al cerrar)', async () => {
  const fallas: string[] = [];
  for (let semilla = 1; semilla <= 30; semilla++) fallas.push(...await unaCorrida(semilla));
  assert.deepEqual(fallas, [], `se esperaban 0 violaciones y hubo ${fallas.length}:\n${fallas.slice(0, 10).join('\n')}`);
});
