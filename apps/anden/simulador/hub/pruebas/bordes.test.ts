// hub/pruebas/bordes.test.ts · P4 · Casos de borde que el esquema permite y que no pueden romper la noche ni contar mal: tareas de 0 s
// encadenadas en el mismo instante y un relevo que llega a cerrar una jaula que la dueña, de vuelta de su pausa, ya cerró.
// Los dos se encontraron el 23-10-2026 con sondas fuera del repositorio; ninguno pasa en las plantillas publicadas (sus doradas no
// cambian), pero un modelo propio que llega por enlace sí puede tenerlos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Modelo } from '../../contratos/modelo.ts';
import { TipoMomento, TipoTramo } from '../../contratos/traza.ts';
import { chico, fija, noche, sinRuido } from './modelos.ts';

test('tareas de 0 s (descarga, inducción, manejo y manual) con NO-READ: el lazo nunca toma dos veces el mismo paso', () => {
  // Antes del arreglo, en las réplicas 1, 3 y 4 la noche se cortaba con «rueda.tomar: el paso tiene que ser mayor que el último
  // tomado»: un paso del lazo dejaba el lazo vacío, y en el mismo instante un paquete volvía del puesto manual, se inducía en 0 s y
  // pedía el paso que ya se había tomado.
  for (let r = 0; r < 5; r++) {
    const m = chico();
    m.personas.descarga = { ritmo: fija(0) };
    m.hub.induccion.tiempo = fija(0);
    m.personas.rampa.manejo = fija(0);
    m.personas.excepcion.tiempo = fija(0);
    m.hub.sorter.lector = { ...m.hub.sorter.lector, noLeido: 0.05 };
    const { resultado } = noche(m, r);
    assert.deepEqual(resultado.alertas, [], `réplica ${r}: sin alertas`);
    assert.equal(resultado.kpi.clasificados, resultado.kpi.paquetes, `réplica ${r}: todo clasificado`);
    assert.ok(resultado.kpi.noLeidosPct > 0, `réplica ${r}: hubo NO-READ que volvieron del puesto manual`);
  }
});

/**
 * Dos rampas en lados opuestos del lazo (32 m, 27 s de caminata), una persona por rampa con pausas cortas y alternadas (siempre hay
 * relevo), jaulas de 1 paquete (cada paquete completa una) y 40% de no transportables, que entran a la jaula sin que nadie los lleve:
 * la jaula queda pendiente y la persona que atiende la rampa camina a cerrarla. Si en esa caminata vuelve la dueña de la pausa, parada
 * en esa rampa, la cierra en el acto, y el relevo llega a una rampa sin jaula para cerrar.
 */
function relevoQueCierra(): Modelo {
  const m = sinRuido(chico());
  m.hub.rampas = [{ id: 'R01', s: 12, lado: -1, capacidad: 20 }, { id: 'R07', s: 44, lado: 1, capacidad: 20 }];
  m.hub.planClasificacion = {
    multiRampa: 'la-menos-llena',
    rutas: [{ id: 'Ruta 01', peso: 0.5, rampas: ['R01'] }, { id: 'Ruta 02', peso: 0.5, rampas: ['R07'] }],
  };
  m.hub.perfilPaquete = {
    clases: [
      { id: 'chico', fraccion: 0.6, bandejas: 1, transportable: true },
      { id: 'no-transportable', fraccion: 0.4, bandejas: 1, transportable: false },
    ],
  };
  m.hub.jaulas = { capacidad: 1, cierre: 5 };
  m.demanda.camiones = { serie: true, cantidad: 2, primero: '22:00', cada: 900, paquetes: 400 };
  m.personas.rampa.cantidad = 2;
  m.personas.rampa.asignacion = 'contiguas';
  m.personas.rampa.pausas = { duracion: 120, cada: 300, primera: 60, escalon: 150 };
  m.personas.excepcion = { cantidad: 3, tiempo: { tipo: 'exponencial', media: 6 } };
  return m;
}

test('relevo y dueña que vuelve de la pausa: cada jaula completa se cierra una sola vez, y ninguna queda sin cerrar', () => {
  // Antes del arreglo la persona que llegaba tarde «cerraba» igual: la cuenta de jaulas pendientes quedaba en −1, se daba por cerrada
  // una jaula que todavía no se había completado y esa, al completarse, quedaba sin cerrar. Los totales coincidían y el error no se
  // veía en ningún KPI (MEDIDO: 148 veces en 100 noches de este modelo). Además el momento JAULA_CERRADA decía la última jaula
  // completa de la rampa, no la que se cerró: con una jaula que se completa mientras se cierra otra, salían dos momentos iguales.
  let cierresDeRelevos = 0;
  for (let r = 0; r < 20; r++) {
    const s = noche(relevoQueCierra(), r, 'completa');
    const t = s.traza!, R = s.hub.rampas.S, M = t.momentos, T = t.tramos, cfg = s.hub.cfg;
    assert.deepEqual(s.resultado.alertas, [], `réplica ${r}: sin alertas`);
    // Cuándo se completó cada jaula: entra el paquete que ocupa su último lugar (tramo JAULA con a = jaula·1000 + posición).
    const completa = new Map<string, number>();
    for (let i = 0; i < T.n; i++) {
      if (T.k[i] === TipoTramo.JAULA && T.a[i] % 1000 === cfg.jaulaCap - 1) completa.set(`${cfg.rampaIds[T.r[i]]} jaula ${Math.floor(T.a[i] / 1000)}`, T.t0[i]);
    }
    const vistas = new Set<string>(), cerradas = new Int32Array(cfg.NR), cierres = new Int32Array(cfg.NR);
    for (let i = 0; i < M.n; i++) {
      if (M.tipo[i] !== TipoMomento.JAULA_CERRADA) continue;
      const clave = `${cfg.rampaIds[M.r[i]]} jaula ${M.v[i]}`;
      assert.ok(!vistas.has(clave), `réplica ${r}: la ${clave} se cerró dos veces`);
      vistas.add(clave);
      const tCompleta = completa.get(clave);
      assert.ok(tCompleta !== undefined && M.t[i] - cfg.cierreMs >= tCompleta,
        `réplica ${r}: la ${clave} se terminó de cerrar a los ${M.t[i]} ms y se había completado ${tCompleta === undefined ? 'nunca' : `a los ${tCompleta} ms`} (cierre ${cfg.cierreMs} ms)`);
      cerradas[M.r[i]]++;
    }
    for (let i = 0; i < T.n; i++) {
      if (T.k[i] !== TipoTramo.PERSONA_CIERRA_JAULA) continue;
      cierres[T.r[i]]++;
      // dueña de la rampa según el plan ('contiguas', 2 personas y 2 rampas): R01 → P-R1 y R07 → P-R2
      if (T.e[i] !== cfg.offRam + T.r[i]) cierresDeRelevos++;
    }
    for (let q = 0; q < cfg.NR; q++) {
      assert.equal(cerradas[q], R.nroJaula[q], `réplica ${r}, ${cfg.rampaIds[q]}: jaulas completas ${R.nroJaula[q]} y cerradas ${cerradas[q]}`);
      assert.equal(cierres[q], cerradas[q], `réplica ${r}, ${cfg.rampaIds[q]}: tramos de cierre ${cierres[q]} y jaulas cerradas ${cerradas[q]}`);
      assert.equal(R.pendiente[q], 0, `réplica ${r}, ${cfg.rampaIds[q]}: jaulas pendientes de cierre al final`);
    }
  }
  assert.ok(cierresDeRelevos > 0, 'el modelo tiene que ejercitar el caso: relevos que cierran jaulas de la dueña en pausa');
});
