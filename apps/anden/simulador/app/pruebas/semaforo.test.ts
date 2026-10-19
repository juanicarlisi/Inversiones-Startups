// app/pruebas/semaforo.test.ts · P8 · el semáforo local (el que usa la interfaz si los servicios no traen `semaforoDe`) sigue la tabla de
// corte-1.md §7 en orden, con las mismas variables que los textos de experimentos/ (para que el motivo se lea completo).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { semaforoLocal, esCancelacion, MINIMO_REPLICAS } from '../extras.ts';
import { resumirFalso } from '../falsos/estadistica.ts';
import { plantillaChica } from '../falsos/plantillas.ts';
import { KPIS, type ResultadoReplica } from '../../contratos/resultados.ts';
import type { ModeloValidado } from '../../contratos/modelo.ts';
import { validadoSinChequeos } from '../../contratos/referencias.ts';
import { diccionariosDeTodos } from '../i18n/diccionarios.ts';
import { variablesDe } from '../i18n/traducir.ts';

function noche(replica: number, costo = 100 + (replica % 7), alertas: string[] = []): ResultadoReplica {
  const kpi = Object.fromEntries(KPIS.map((k) => [k, 0])) as ResultadoReplica['kpi'];
  kpi.costoPorPaquete = costo; kpi.esperaP90Min = 60 + (replica % 5);
  return { modelo: 'm', semilla: 1, replica, huella: String(replica), kpi, alertas, eventos: 1,
    porRecurso: { rampaRecibidos: [], rampaVueltas: [], rampaMinutosLlena: [], personaOcupadaPct: [], puestoInducidos: [] },
    series: { filaInduccionMax: [], clasificados: [] } };
}
const mv = (o: Partial<ModeloValidado> = {}): ModeloValidado => ({ ...validadoSinChequeos(plantillaChica()), ...o });
const noches = (n: number) => Array.from({ length: n }, (_, i) => noche(i));

test('verde «ok» con 100 noches sanas y precisión lograda', () => {
  const s = semaforoLocal(mv(), noches(100), resumirFalso);
  assert.deepEqual(s, { color: 'verde', motivo: 'ok', vars: { replicas: 100 } });
});

test('rojo por errores del modelo antes que cualquier otra cosa', () => {
  const s = semaforoLocal(mv({ diagnosticos: [{ codigo: 'E-REF', nivel: 'error', ruta: '/x', clave: 'modelo.diag.E-REF' }] }), [noche(0, 1, ['conservacion'])], resumirFalso);
  assert.equal(s.motivo, 'modelo-con-errores');
  assert.deepEqual(s.vars, { errores: 1, codigo: 'E-REF' });
});

test('rojo por conservación, invariantes e inestabilidad, en ese orden, con la primera noche afectada', () => {
  const rs = noches(30);
  rs[7] = noche(7, 100, ['no-termina']); rs[12] = noche(12, 100, ['invariante:rampa-capacidad']); rs[20] = noche(20, 100, ['conservacion']);
  assert.deepEqual(semaforoLocal(mv(), rs, resumirFalso), { color: 'rojo', motivo: 'conservacion', vars: { afectadas: 1, replicas: 30, replica: 21 } });
  rs[20] = noche(20);
  assert.deepEqual(semaforoLocal(mv(), rs, resumirFalso), { color: 'rojo', motivo: 'invariante', vars: { afectadas: 1, replicas: 30, nombre: 'invariante:rampa-capacidad', replica: 13 } });
  rs[12] = noche(12);
  assert.deepEqual(semaforoLocal(mv(), rs, resumirFalso), { color: 'rojo', motivo: 'inestable', vars: { afectadas: 1, replicas: 30, motivo: 'no-termina', replica: 8 } });
  rs[7] = noche(7, 100, ['alerta-desconocida']);
  assert.equal(semaforoLocal(mv(), rs, resumirFalso).motivo, 'invariante', 'una alerta que no se conoce nunca se ignora');
});

test(`amarillo con menos de ${MINIMO_REPLICAS} noches y cuando no se logra la precisión pedida`, () => {
  assert.deepEqual(semaforoLocal(mv(), noches(5), resumirFalso), { color: 'amarillo', motivo: 'pocas-replicas', vars: { replicas: 5, minimo: 20 } });
  const ruidoso = Array.from({ length: 25 }, (_, i) => { const r = noche(i); r.kpi.esperaP90Min = i % 2 ? 10 : 200; return r; });
  const s = semaforoLocal(mv(), ruidoso, resumirFalso);
  assert.equal(s.motivo, 'precision-no-lograda');
  assert.equal(s.vars.pedida, 5);
  assert.equal(s.vars.kpi, 'esperaP90Min');
});

test('cada motivo usa exactamente las variables de su texto (es y en)', () => {
  const d = diccionariosDeTodos();
  const casos: ResultadoReplica[][] = [noches(100), noches(5), [noche(0, 1, ['conservacion']), noche(1)], [noche(0, 1, ['invariante:x']), noche(1)], [noche(0, 1, ['tope-eventos']), noche(1)]];
  for (const rs of casos) {
    const s = semaforoLocal(mv(), rs, resumirFalso);
    for (const idioma of ['es', 'en'] as const) {
      const texto = d[idioma][`experimentos.semaforo.${s.motivo}`];
      assert.ok(texto, `falta el texto de ${s.motivo}`);
      assert.deepEqual(variablesDe(texto).sort(), Object.keys(s.vars).sort(), `${idioma}: variables de «${s.motivo}»`);
    }
  }
});

test('una cancelación se reconoce por el nombre del error, no por el mensaje', () => {
  const e = new Error('lo que sea'); e.name = 'ErrorCancelado';
  assert.equal(esCancelacion(e), true);
  assert.equal(esCancelacion(new Error('cancelado')), false);
  assert.equal(esCancelacion(null), false);
});
