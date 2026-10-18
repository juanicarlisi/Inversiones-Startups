// Las firmas del contrato (contratos/experimentos.ts) y la lista de entrega de §9 P5: si algo no encaja, `tsc` falla acá.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as P5 from '../indice.ts';
import type {
  ArmarComprobante, CompararPareado, CrearPlanificador, EvaluarDecision, Proporcionar, Resumir, TrabajadorEnProceso,
} from '../../contratos/experimentos.ts';

// Comprobaciones de tipos (no hacen nada en ejecución).
const _resumir: Resumir = P5.resumir;
const _proporcion: Proporcionar = P5.proporcion;
const _comparar: CompararPareado = P5.comparar;
const _evaluar: EvaluarDecision = P5.evaluarDecision;
const _comprobante: ArmarComprobante = P5.armarComprobante;
const _planificador: CrearPlanificador = P5.crearPlanificador;
const _enProceso: TrabajadorEnProceso = P5.trabajadorEnProceso;
void [_resumir, _proporcion, _comparar, _evaluar, _comprobante, _planificador, _enProceso];

test('indice.ts exporta todo lo que §9 P5 pide como entrega', () => {
  const pedidos = ['resumir', 'proporcion', 'comparar', 'evaluarDecision', 'semaforo', 'armarComprobante', 'crearPlanificador',
    'trabajadorEnProceso', 'mser5', 'cuantilT', 'wilson', 'percentil', 'icPercentil'];
  for (const nombre of pedidos) assert.equal(typeof (P5 as Record<string, unknown>)[nombre], 'function', `falta exportar «${nombre}» (o no es una función)`);
});

test('las funciones del índice se comportan como se documenta en una pasada rápida', () => {
  assert.equal(P5.cuantilT(0.95, 10), 2.228138852);
  assert.deepEqual(P5.wilson(19, 20, 0.95).map((x) => Math.round(x * 10000) / 10000), [0.7639, 0.9911]);
  assert.equal(P5.percentil([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.9), 10);
  assert.equal(P5.icPercentil([1, 2, 3], 0.9, 0.95), null);
  assert.equal(P5.mser5([1, 2, 3, 4, 5]), 0);
  assert.equal(P5.semaforo({ replicas: 20 }).color, 'verde');
});
