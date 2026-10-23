// hub/pruebas/conservacion-trabajo.test.ts · P4 · Conservación del trabajo: ningún recurso del hub queda libre con trabajo que las
// reglas de corte-1.md §6.7 (con los cambios del motor 1.1.0) le dan. Es la propiedad que hace creíble el fin de una noche larga: si
// una noche termina tarde, no es porque alguien se quedó mirando con trabajo al lado (NOTAS-CONTRATO §13 y §17).
// El auditor mira el estado de los bloques DESPUÉS DE CADA EVENTO (envuelve `manejar` de cada bloque) y cuenta cinco faltas:
//  - induccion: un puesto con persona, libre (ni induciendo, ni esperando bandeja, ni en pausa), con paquetes en la acumulación;
//  - manual: un puesto manual libre con paquetes en la cola de la excepción;
//  - rampa: una persona de rampa libre con una rampa a su cargo que tiene paquetes o una jaula completa sin cerrar;
//  - relevo: una rampa con paquetes o una jaula sin cerrar a cargo de nadie o de alguien en pausa, mientras otra persona de rampa está
//    presente y fuera de pausa (regla 7 de 1.1.0: durante la pausa sus rampas las atiende la siguiente persona que no esté en pausa);
//  - anden: un andén con personas libre con camiones en la playa, un andén con camión que no descarga ni está parado, o un andén parado
//    por contrapresión con lugar en la acumulación (regla 4).
// Con este auditor se encontraron el 23-10-2026 las dos faltas del relevo de NOTAS-CONTRATO §17; sus pruebas fallan con el código anterior.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Modelo } from '../../contratos/modelo.ts';
import type { ResultadoReplica } from '../../contratos/resultados.ts';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import { armarNoche, opcionesNoche } from '../simular.ts';
import { Puesto } from '../bloques/induccion.ts';
import { PersonaRampa } from '../bloques/rampas.ts';
import type { Hub } from '../bloques/comun.ts';
import { SEMILLA, chico, grande, validado } from './modelos.ts';

const FALTAS = ['induccion', 'manual', 'rampa', 'relevo', 'anden'] as const;
type Falta = (typeof FALTAS)[number];

/** Faltas que hay en el estado del hub en este instante (después de procesar un evento). */
function faltasAhora(h: Hub): Set<Falta> {
  const f = new Set<Falta>();
  const I = h.ind.S, R = h.rampas.S, X = h.exc.S, A = h.andenes.S, cfg = h.cfg;
  if (h.acum.fila.largo > 0) for (let s = 0; s < I.estado.length; s++) if (I.estado[s] === Puesto.LIBRE) f.add('induccion');
  if (h.exc.cola.largo > 0) for (let p = 0; p < X.ocupado.length; p++) if (!X.ocupado[p]) f.add('manual');
  let alguienDisponible = false;
  for (let w = 0; w < R.estado.length; w++) if (R.estado[w] !== PersonaRampa.PAUSA && R.estado[w] !== PersonaRampa.AUSENTE) alguienDisponible = true;
  for (let r = 0; r < cfg.NR; r++) {
    if (h.rampas.filas[r].largo === 0 && R.pendiente[r] === 0) continue;
    const w = R.asignada[r];
    if (w >= 0 && R.estado[w] === PersonaRampa.LIBRE) f.add('rampa');
    else if ((w < 0 || R.estado[w] === PersonaRampa.PAUSA || R.estado[w] === PersonaRampa.AUSENTE) && alguienDisponible) f.add('relevo');
  }
  if (A.abierto) {
    for (let d = 0; d < A.camion.length; d++) {
      if (cfg.andenPersonas[d] > 0 && A.camion[d] < 0 && h.andenes.playa.largo > 0) f.add('anden');
      if (A.camion[d] >= 0 && A.resta[d] > 0 && !A.descargando[d] && !A.bloqueado[d]) f.add('anden');
      if (A.bloqueado[d] && h.andenes.enCamino() < cfg.acumCap) f.add('anden');
    }
  }
  return f;
}

interface Auditoria {
  resultado: ResultadoReplica;
  /** Veces que empezó cada falta y la primera, con el instante y el evento que la dejó. */
  veces: Record<Falta, number>;
  primera: Partial<Record<Falta, string>>;
}

/**
 * Corre una noche con el motor de referencia y audita el estado después de cada evento. `antesDeCorrer` puede tocar el hub ya armado
 * (para sembrar una falta y controlar el auditor, o para contar cuántas veces la noche pasa por un caso).
 */
function auditar(m: Modelo, replica: number, semilla = m.experimento.semilla, antesDeCorrer?: (h: Hub) => void): Auditoria {
  const mv = validado(m);
  const motor = crearMotorReferencia(opcionesNoche(mv, semilla, replica, 'no'));
  const noche = armarNoche(motor, mv);
  const h = noche.hub;
  const veces = { induccion: 0, manual: 0, rampa: 0, relevo: 0, anden: 0 } as Record<Falta, number>;
  const primera: Partial<Record<Falta, string>> = {};
  let antes = new Set<Falta>();
  for (const b of [h.demanda, h.personas, h.andenes, h.acum, h.ind, h.sorter, h.rampas, h.exc, h.medicion]) {
    const manejar = b.manejar.bind(b);
    b.manejar = (mm, tipo, arg) => {
      manejar(mm, tipo, arg);
      const ahora = faltasAhora(h);
      for (const f of ahora) {
        if (antes.has(f)) continue;
        veces[f]++;
        primera[f] ??= `a los ${mm.ahora} ms, después del evento ${tipo} de «${b.ruta}» (arg ${arg})`;
      }
      antes = ahora;
    };
  }
  antesDeCorrer?.(h);
  return { resultado: noche.cerrar(motor.correr()).resultado, veces, primera };
}

function sinFaltas(a: Auditoria, donde: string): void {
  const hubo = FALTAS.filter((f) => a.veces[f] > 0).map((f) => `${f}: ${a.veces[f]} vez/veces, la primera ${a.primera[f]}`);
  assert.deepEqual(hubo, [], `${donde}: recursos libres con trabajo al lado`);
  assert.deepEqual(a.resultado.alertas, [], `${donde}: sin alertas`);
}

test('el auditor ve una falta sembrada: un puesto manual que una vez no toma el paquete que le llega', () => {
  const a = auditar(chico(), 0, SEMILLA, (h) => {
    // Sabotaje del control: la primera vez que la cola recibe un paquete, el puesto manual no lo toma (lo toma con el que sigue).
    const exc = h.exc as unknown as { atender: (t: number) => void };
    const atender = exc.atender.bind(h.exc);
    let saltada = false;
    exc.atender = (t: number) => { if (!saltada) { saltada = true; return; } atender(t); };
  });
  assert.ok(a.veces.manual >= 1, `se esperaba al menos una falta «manual» y hubo ${a.veces.manual}`);
});

test('hub-chico@1.0.0, réplicas 21, 34 y 44 (semilla de la plantilla): ningún recurso libre con trabajo al lado', () => {
  // r21 y r44 son las dos noches que §9 deja fuera de 120–300 min (NOTAS-CONTRATO §13); en r34 una persona de rampa quedaba libre
  // 0,6 min con una jaula para cerrar que había completado un relevo (NOTAS-CONTRATO §17).
  for (const r of [21, 34, 44]) sinFaltas(auditar(chico(), r), `hub-chico@1.0.0, réplica ${r}`);
});

test('hub-lazo-noche@1.0.0 con 9 personas de rampa y rampas contiguas (el hub del primer minuto), réplica 0: sin faltas', () => {
  const m = grande();
  m.personas.rampa.cantidad = 9;
  m.personas.rampa.asignacion = 'contiguas';
  sinFaltas(auditar(m, 0), 'hub-lazo-noche@1.0.0 con 9 personas de rampa contiguas, réplica 0');
});

/** Un hub chico de 1.200 paquetes sin golpes discretos, para ejercitar las pausas de rampa con relevo. */
function chicoCorto(): Modelo {
  const m = chico();
  m.demanda.camiones = { serie: true, cantidad: 4, primero: '22:00', cada: 900, paquetes: 300 };
  m.demanda.atrasoComun = { probabilidad: 0, demora: { tipo: 'fija', valor: 0 } };
  m.personas.induccion.ausentismo = 0;
  m.personas.rampa.ausentismo = 0;
  return m;
}

test('jaula que completa un relevo cuando la dueña ya volvió de la pausa: la dueña, libre, va a cerrarla en el acto', () => {
  // Jaulas de 1 paquete con cierre de 1 s (cada paquete completa una) y pausas de rampa de 2 min cada 400 s: muchas veces la dueña
  // vuelve mientras quien la relevaba maneja un paquete de su rampa. Antes del arreglo la jaula quedaba pendiente y la dueña, libre,
  // no se enteraba hasta que le caía otro paquete (MEDIDO: faltas en 3 de estas 5 noches).
  let casos = 0;
  for (let r = 0; r < 5; r++) {
    const m = chicoCorto();
    m.hub.jaulas = { capacidad: 1, cierre: 1 };
    m.personas.rampa.pausas = { duracion: 120, cada: 400, primera: 300, escalon: 60 };
    const a = auditar(m, r, 7, (h) => {
      // Cuenta el caso: quien termina de manejar el paquete ya no atiende la rampa, quien la atiende está libre y la jaula se completa.
      const ram = h.rampas as unknown as { finManejo: (w: number, t: number) => void };
      const finManejo = ram.finManejo.bind(h.rampas), S = h.rampas.S;
      ram.finManejo = (w: number, t: number) => {
        const q = S.objetivo[w], x = S.asignada[q], jaulas = S.nroJaula[q];
        const libre = x >= 0 && x !== w && S.estado[x] === PersonaRampa.LIBRE;
        finManejo(w, t);
        if (libre && S.nroJaula[q] > jaulas) casos++;
      };
    });
    sinFaltas(a, `jaulas de 1 paquete con pausas frecuentes, réplica ${r}`);
  }
  assert.ok(casos > 0, 'el modelo tiene que ejercitar el caso: una jaula completada por un relevo con la dueña libre');
});

test('rampas de alguien en pausa sin relevo disponible: las toma la primera persona que vuelve de su pausa', () => {
  // Dos personas de rampa con pausas de 10 min cada 20 min y 5 min de escalón: a veces las dos están en pausa a la vez, y la que
  // empezó segunda no tiene relevo. Antes del arreglo, cuando la otra volvía, las rampas de la que seguía en pausa quedaban sin nadie
  // hasta el fin de esa pausa (MEDIDO: faltas en las 5 noches).
  let sinRelevo = 0;
  for (let r = 0; r < 5; r++) {
    const m = chicoCorto();
    m.personas.rampa.cantidad = 2;
    m.personas.rampa.pausas = { duracion: 600, cada: 1200, primera: 300, escalon: 300 };
    const a = auditar(m, r, 7, (h) => {
      // Cuenta el caso: una pausa que empieza con la otra persona también en pausa (no hay a quién pasarle las rampas).
      const ram = h.rampas as unknown as { empezarPausa: (w: number, t: number) => void };
      const empezarPausa = ram.empezarPausa.bind(h.rampas), S = h.rampas.S;
      ram.empezarPausa = (w: number, t: number) => {
        if (S.estado.every((e, x) => x === w || e === PersonaRampa.PAUSA || e === PersonaRampa.AUSENTE)) sinRelevo++;
        empezarPausa(w, t);
      };
    });
    sinFaltas(a, `dos personas de rampa con pausas superpuestas, réplica ${r}`);
  }
  assert.ok(sinRelevo > 0, 'el modelo tiene que ejercitar el caso: una pausa que empieza sin relevo disponible');
});
