// experimentos/indice.ts · Andén simulador, corte 1, P5 · Experimentos y estadística.
// Que ningún número salga sin su intervalo y que la decisión diga cuándo no está segura (corte-1.md §9, P5).
//
// Entrega del contrato (contratos/experimentos.ts):
//   resumir · proporcion · comparar · evaluarDecision · armarComprobante · crearPlanificador · trabajadorEnProceso
// Entrega de la especificación:
//   semaforo(entrada) · semaforoDe(mv, resultados) · mser5(serie) · cuantilT(conf, ν) · wilson(éxitos, n, conf) → [inf, sup] · percentil(xs, q) · icPercentil(xs, q, conf)
// Extras (todos opcionales para quien integra):
//   cuantilNormal · serieMedia · mser5Detalle · estadoPorWilson · estadoConfiguracion · nochesQueFaltan · recomendar · ErrorCancelado ·
//   esCancelacion · correrYAgregar · trabajadorEnProcesoCon · huellaAgregada · claveSemaforo · tieneSentido · ordenarPorReplica
// Textos: textos.es.json y textos.en.json (claves `experimentos.*`; el semáforo es `experimentos.semaforo.<motivo>`).
export { cuantilT, cuantilNormal, CONFIANZAS_ADMITIDAS } from './estadistica/t-student.ts';
export { wilson, estadoPorWilson, nochesQueFaltan } from './estadistica/wilson.ts';
export { percentil, icPercentil } from './estadistica/percentiles.ts';
export { mser5, mser5Detalle, serieMedia, TAMANO_LOTE_MSER } from './estadistica/mser.ts';
export type { DetalleMser } from './estadistica/mser.ts';
export { resumir, proporcion, estadoConfiguracion, ordenarPorReplica, resumirNumeros } from './estadistica/resumen.ts';
export { comparar, tieneSentido } from './estadistica/pareada.ts';
export { evaluarDecision, evaluarDecisionCon, decidirOpcion, recomendar, ErrorCancelado, esCancelacion, MAX_CONFIGURACIONES } from './decision.ts';
export { zSecuencial, erroresSecuenciales, estadoSecuencial, icSecuencial, nochesMinimasParaCumplir } from './estadistica/secuencial.ts';
export type { OpcionesEvaluacion } from './decision.ts';
export { semaforo, semaforoDe, claveSemaforo, clasificarAlerta, COLOR_DE_MOTIVO, MINIMO_REPLICAS } from './semaforo.ts';
export type { EntradaSemaforo } from './semaforo.ts';
export { armarComprobante, huellaAgregada, contarProcedencia, contarControles, CODIGOS_DE_CONTROL } from './comprobante.ts';
export { crearPlanificador, correrYAgregar, tamanoDeTrozo } from './planificador.ts';
export type { OpcionesPlanificador } from './planificador.ts';
export { trabajadorEnProceso, trabajadorEnProcesoCon } from './en-proceso.ts';
export type { OpcionesEnProceso } from './en-proceso.ts';
