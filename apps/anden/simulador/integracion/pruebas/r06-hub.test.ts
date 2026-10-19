// integracion/pruebas/r06-hub.test.ts · Andén simulador, corte 1 · Integración: R06 del hub con el núcleo de producción (corte-1.md §6.5
// y §8). Correr hasta T, sacar la foto, restaurarla en un motor NUEVO con bloques NUEVOS y seguir tiene que dar la misma huella final (y
// los mismos KPI) que la corrida de un tirón. Es lo que habilita rebobinar sin re-simular, el arranque en caliente (corte 2) y la división
// de trayectorias (corte 5). La foto, además, tiene que sobrevivir a un viaje entre hilos (structuredClone, como postMessage).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { horaASeg, aMs } from '../../contratos/tipos-base.ts';
import { KPIS } from '../../contratos/resultados.ts';
import type { ModeloValidado } from '../../contratos/modelo.ts';
import type { Foto } from '../../contratos/motor.ts';
import type { NivelTraza } from '../../contratos/traza.ts';
import { armarNoche, opcionesNoche } from '../../hub/indice.ts';
import { ensamblar } from '../ensamblar.ts';

const E = ensamblar();

async function compilada(clave: string): Promise<ModeloValidado> {
  const c = await E.compilar(E.plantillas[clave]);
  if (!c.ok) throw new Error(`la plantilla ${clave} no compila`);
  return c.mv;
}

/** Corrida de un tirón. */
function continua(mv: ModeloValidado, semilla: number, replica: number, traza: NivelTraza) {
  const m = E.crearMotor(opcionesNoche(mv, semilla, replica, traza));
  const noche = armarNoche(m, mv);
  return noche.cerrar(m.correr()).resultado;
}

/** Corre hasta `hasta` (ms) y devuelve la foto. */
function fotoEn(mv: ModeloValidado, semilla: number, replica: number, hasta: number, traza: NivelTraza): Foto {
  const m = E.crearMotor(opcionesNoche(mv, semilla, replica, traza));
  armarNoche(m, mv);
  const r = m.correrHasta(hasta);
  assert.equal(r.estado, 'pausa', `la corrida tenía que pausarse en ${hasta} ms y terminó con estado ${r.estado}`);
  return m.foto();
}

/** Restaura la foto en un motor y un hub nuevos y sigue hasta el final. */
function desdeFoto(mv: ModeloValidado, semilla: number, replica: number, foto: Foto, traza: NivelTraza) {
  const m = E.crearMotor(opcionesNoche(mv, semilla, replica, traza));
  const noche = armarNoche(m, mv);
  m.restaurar(foto);
  return noche.cerrar(m.correr()).resultado;
}

function mismoResultado(a: ReturnType<typeof continua>, b: ReturnType<typeof continua>, que: string): void {
  assert.equal(b.huella, a.huella, `${que}: la huella desde la foto (${b.huella}) no es la de la corrida continua (${a.huella})`);
  assert.equal(b.eventos, a.eventos, `${que}: eventos`);
  for (const k of KPIS) assert.ok(Object.is(a.kpi[k], b.kpi[k]), `${que}: el KPI ${k} da ${a.kpi[k]} de un tirón y ${b.kpi[k]} desde la foto`);
  assert.deepEqual(b.alertas, a.alertas, `${que}: alertas`);
  assert.deepEqual(b.porRecurso, a.porRecurso, `${que}: indicadores por recurso`);
  assert.deepEqual(b.series, a.series, `${que}: series`);
}

const ms = (h: string) => aMs(horaASeg(h));

test('R06 · hub chico: foto a las 22:20, 23:30, 00:45 y 02:10, restaurada en un motor nuevo, da la misma huella y los mismos KPI', async () => {
  const mv = await compilada('hub-chico@1.0.0');
  for (const semilla of [20261017, 3]) {
    const base = continua(mv, semilla, 0, 'no');
    for (const hora of ['22:20', '23:30', '24:45', '26:10']) {
      mismoResultado(base, desdeFoto(mv, semilla, 0, fotoEn(mv, semilla, 0, ms(hora), 'no'), 'no'), `hub chico, semilla ${semilla}, foto a las ${hora}`);
    }
  }
});

test('R06 · hub grande: foto a las 00:00 y a la 01:30 con el núcleo de producción', async () => {
  const mv = await compilada('hub-lazo-noche@1.0.0');
  const base = continua(mv, 20261017, 1, 'no');
  for (const hora of ['24:00', '25:30']) {
    mismoResultado(base, desdeFoto(mv, 20261017, 1, fotoEn(mv, 20261017, 1, ms(hora), 'no'), 'no'), `hub grande, foto a las ${hora}`);
  }
});

test('R06 · la foto viaja entre hilos (structuredClone) y se puede restaurar dos veces', async () => {
  const mv = await compilada('hub-chico@1.0.0');
  const base = continua(mv, 11, 2, 'no');
  // La foto se saca con la traza completa (la película) y se restaura sin traza (las cien noches): la traza no está en la foto (P1,
  // NOTAS-CONTRATO §8) ni cambia la corrida. Restaurar CON traza completa da una traza parcial (solo lo posterior a la foto) y el hub la
  // marca con 'invariante:tiempo': es del corte 2 (foto de la traza), ver integracion/NOTAS-CONTRATO.md.
  const foto = fotoEn(mv, 11, 2, ms('23:45'), 'completa');
  mismoResultado(base, desdeFoto(mv, 11, 2, structuredClone(foto), 'no'), 'hub chico, foto copiada con structuredClone');
  mismoResultado(base, desdeFoto(mv, 11, 2, foto, 'no'), 'hub chico, la misma foto restaurada otra vez');
});

test('R06 · una foto de otro modelo se rechaza diciendo qué se esperaba', async () => {
  const chico = await compilada('hub-chico@1.0.0');
  const grande = await compilada('hub-lazo-noche@1.0.0');
  const foto = fotoEn(chico, 5, 0, ms('23:00'), 'no');
  const m = E.crearMotor(opcionesNoche(grande, 5, 0, 'no'));
  armarNoche(m, grande);
  assert.throws(() => m.restaurar(foto), (e: unknown) => e instanceof Error && e.message.length > 20,
    'restaurar la foto del hub chico sobre el hub grande tiene que lanzar un error que explique la diferencia');
});
