// hub/pruebas/foto.test.ts · P4 · El estado de los bloques del hub es completo: foto a mitad de la noche + restaurar en un motor
// nuevo con bloques nuevos → la misma huella final y los mismos KPI que la corrida continua (R06 del hub, adelantado con el motor de
// prueba con foto; la integración lo repite con el núcleo de producción).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aMs, horaASeg } from '../../contratos/tipos-base.ts';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import type { NivelTraza } from '../../contratos/traza.ts';
import { armarNoche, crearSimularNoche, opcionesNoche } from '../simular.ts';
import { crearMotorConFoto } from './motor-con-foto.ts';
import { chico, grande, validado } from './modelos.ts';

test('el motor de prueba con foto da la misma huella que la referencia (corrida continua)', () => {
  const mv = validado(chico());
  for (const replica of [0, 5]) {
    const a = crearSimularNoche(crearMotorReferencia)(mv, 11, replica, { traza: 'no' }).resultado;
    const b = crearSimularNoche(crearMotorConFoto)(mv, 11, replica, { traza: 'no' }).resultado;
    assert.equal(b.huella, a.huella);
    assert.deepEqual(b.kpi, a.kpi);
  }
});

function r06(m: ReturnType<typeof chico>, replica: number, hora: string, traza: NivelTraza) {
  const mv = validado(m), o = opcionesNoche(mv, 11, replica, traza);
  const continua = crearSimularNoche(crearMotorConFoto)(mv, 11, replica, { traza }).resultado;
  const m1 = crearMotorConFoto(o);
  armarNoche(m1, mv);
  m1.correrHasta(aMs(horaASeg(hora)));
  const foto = m1.foto();
  const m2 = crearMotorConFoto(o), n2 = armarNoche(m2, mv);
  m2.restaurar(foto);
  const restaurada = n2.cerrar(m2.correr()).resultado;
  return { continua, restaurada, foto };
}

test('R06 (hub chico) · foto en cuatro momentos de la noche → misma huella final y mismos KPI', () => {
  for (const [replica, hora] of [[0, '22:20'], [1, '23:30'], [2, '24:45'], [3, '26:10']] as const) {
    const { continua, restaurada, foto } = r06(chico(), replica, hora, 'no');
    assert.equal(restaurada.huella, continua.huella, `réplica ${replica}, foto a las ${hora}: la huella final cambió`);
    assert.deepEqual(restaurada.kpi, continua.kpi, `réplica ${replica}, foto a las ${hora}: los KPI cambiaron`);
    assert.deepEqual(restaurada.alertas, continua.alertas);
    assert.deepEqual(restaurada.series, continua.series);
    assert.deepEqual(restaurada.porRecurso, continua.porRecurso);
    // la foto es solo números y arreglos tipados
    for (const [ruta, e] of Object.entries(foto.bloques)) {
      for (const [k, v] of Object.entries(e)) assert.ok(typeof v === 'number' || ArrayBuffer.isView(v), `${ruta}.${k} no es número ni arreglo tipado`);
    }
  }
});

test('R06 (hub grande, con micro-paradas en curso) y con traza completa: restaurar no rompe la escritura de la traza', () => {
  const g = r06(grande(), 4, '25:00', 'no');
  assert.equal(g.restaurada.huella, g.continua.huella);
  assert.deepEqual(g.restaurada.kpi, g.continua.kpi);
  const c = r06(chico(), 6, '23:45', 'completa');
  assert.equal(c.restaurada.huella, c.continua.huella);
  assert.deepEqual(c.restaurada.kpi, c.continua.kpi);
});

test('restaurar exige el mismo hub: una foto de otro modelo da un error que dice qué falta', () => {
  const a = validado(chico()), b = chico();
  b.hub.rampas = b.hub.rampas.slice(0, 11);
  b.hub.planClasificacion.rutas[9].rampas = ['R11'];
  const m1 = crearMotorConFoto(opcionesNoche(a, 1, 0, 'no'));
  armarNoche(m1, a);
  m1.correrHasta(aMs(horaASeg('23:00')));
  const foto = m1.foto();
  const mvB = validado(b), m2 = crearMotorConFoto(opcionesNoche(mvB, 1, 0, 'no'));
  armarNoche(m2, mvB);
  assert.throws(() => m2.restaurar(foto), /trae 13 elementos y este hub espera 12 \(¿la foto es de otro modelo\?\)/);
});
