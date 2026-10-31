// Evaluación de la decisión con réplicas secuenciales (corte-1.md §7, §9 P5).
import { test } from 'node:test';
import { zSecuencial } from '../estadistica/secuencial.ts';
import assert from 'node:assert/strict';
import { ErrorCancelado, esCancelacion, evaluarDecision, evaluarDecisionCon, recomendar } from '../decision.ts';
import { readFileSync } from 'node:fs';
import { claveTextoSemaforo } from '../semaforo.ts';
import { crearPlanificador } from '../planificador.ts';
import { trabajadorEnProceso } from '../en-proceso.ts';
import { Prioridad } from '../../contratos/experimentos.ts';
import type { EvaluarDecision, Planificador, Simulador, Trabajo } from '../../contratos/experimentos.ts';
import type { Modelo, ModeloValidado, OpParche } from '../../contratos/modelo.ts';
import { validadoSinChequeos } from '../../contratos/referencias.ts';
import { modeloEjemplo, planificadorSincrono, resultadoFalso, simuladorPorValor, varianteFalsa } from './ayudas.ts';

/** Probabilidades de no perder el corte por cantidad de puestos (corte-1.md §9, P5). Meta del ejemplo: 0,9. */
const PROBAS = { 2: 0.6, 3: 0.8, 4: 0.97, 5: 0.995 };
const OPCIONES = { replicasIniciales: 20, tanda: 20, replicasMax: 400 };

function modeloConSemilla(semilla: number): ModeloValidado {
  const m: Modelo = modeloEjemplo();
  m.experimento.semilla = semilla;
  return validadoSinChequeos(m);
}

test('la evaluación completa: 4 configuraciones ordenadas, con Wilson, estado, objetivo, recomendación y semáforo', async () => {
  const ev = await evaluarDecision(modeloConSemilla(20261017), planificadorSincrono(simuladorPorValor(PROBAS)), varianteFalsa, OPCIONES);
  assert.equal(ev.decision, 'dotacion-induccion');
  assert.deepEqual(ev.configuraciones.map((c) => c.valor), [2, 3, 4, 5]);
  for (const c of ev.configuraciones) {
    // 20 miradas posibles (20 iniciales, tandas de 20, hasta 400): cada lado del Wilson con su z calibrado (EST-04); la confianza que se
    // muestra es la de cada mirada, 1 − Q(z cumple) − Q(z no cumple)
    const regla = zSecuencial(0.95, 0.9, 20, 20, 400);
    assert.equal(c.prop.metodo, 'wilson'); assert.equal(c.prop.confianza, regla.confianza); assert.equal(c.prop.n, c.objetivo.n);
    assert.equal(c.objetivo.kpi, 'costoNoche');
    assert.ok(c.prop.ic[0] <= c.prop.p && c.prop.p <= c.prop.ic[1]);
    const esperado = c.prop.ic[0] >= 0.9 ? 'cumple' : c.prop.ic[1] < 0.9 ? 'no-cumple' : 'en-duda';
    assert.equal(c.estado, esperado, `valor ${c.valor}: Wilson [${c.prop.ic}] contra meta 0,9`);
  }
  assert.equal(ev.configuraciones[0].estado, 'no-cumple');
  assert.equal(ev.configuraciones[1].estado, 'no-cumple');
  assert.equal(ev.recomendacion, 4);
  assert.equal(ev.semaforo.color, 'verde');
  assert.equal(ev.replicasUsadas, ev.configuraciones.reduce((s, c) => s + c.prop.n, 0));
  assert.ok(ev.configuraciones[2].estado === 'cumple');
});

test('las rondas: todos los valores con 20 noches [0, 20), después solo los que están en duda por debajo del primero que cumple, con índices que siguen y sin pasar de replicasMax', async () => {
  const trabajos: Trabajo[] = [];
  const ev = await evaluarDecision(modeloConSemilla(20261017), planificadorSincrono(simuladorPorValor(PROBAS), { alEnviar: (t) => trabajos.push(t) }), varianteFalsa, OPCIONES);
  const porValor = (v: number) => trabajos.filter((t) => t.mv.modelo.personas.induccion.puestosActivos === v);
  const primeros = trabajos.slice(0, 4);
  assert.deepEqual(primeros.map((t) => t.replicas), [[0, 20], [0, 20], [0, 20], [0, 20]], 'la primera ronda son 20 noches de cada uno de los 4 valores');
  assert.deepEqual(primeros.map((t) => t.mv.modelo.personas.induccion.puestosActivos), [2, 3, 4, 5]);
  for (const t of trabajos) {
    assert.equal(t.semilla, 20261017, 'todos con la semilla del experimento (números comunes entre valores)');
    assert.equal(t.prioridad, Prioridad.DECISION); assert.equal(t.traza, 'no');
    assert.ok(t.replicas[1] <= 400 && t.replicas[1] - t.replicas[0] <= 20);
  }
  for (const v of [2, 3, 4, 5]) {
    const rangos = porValor(v).map((t) => t.replicas);
    rangos.forEach((r, i) => { if (i > 0) assert.equal(r[0], rangos[i - 1][1], `valor ${v}: la tanda ${i} tiene que seguir donde terminó la anterior`); });
  }
  assert.equal(porValor(2).length, 1, 'el 2 no cumple desde las 20 noches: no se le agregan tandas');
  assert.ok(porValor(3).length >= 2, 'el 3 (p = 0,8) estaba en duda con 20 noches y recibe tandas');
  const ultimaTandaDe5 = porValor(5).length;
  assert.ok(ultimaTandaDe5 <= porValor(4).length, 'el 5 está por encima del primero que cumple (el 4): no recibe tandas extra una vez que el 4 cumple');
  assert.equal(ev.recomendacion, 4);
});

test('el valor del modelo variante sale de un parche replace sobre la ruta de la decisión (y variante se llama una vez por valor)', async () => {
  const llamadas: OpParche[][] = [];
  const variante: typeof varianteFalsa = async (mv, parche) => { llamadas.push(parche); return varianteFalsa(mv, parche); };
  await evaluarDecision(modeloConSemilla(1), planificadorSincrono(simuladorPorValor(PROBAS)), variante, OPCIONES);
  assert.deepEqual(llamadas, [2, 3, 4, 5].map((v) => [{ op: 'replace', path: '/personas/induccion/puestosActivos', value: v }]));
});

test('progreso: «hechas» sube de a una hasta el total de noches usadas; «máximo» es fijo e igual a replicasMax × configuraciones', async () => {
  const vistos: [number, number][] = [];
  const ev = await evaluarDecision(modeloConSemilla(7), planificadorSincrono(simuladorPorValor(PROBAS)), varianteFalsa,
    { ...OPCIONES, alProgreso: (h, m) => vistos.push([h, m]) });
  assert.equal(vistos.length, ev.replicasUsadas);
  vistos.forEach(([h, m], i) => { assert.equal(h, i + 1); assert.equal(m, 1600); });
});

test('S-secuencial: con probabilidades 0,60 · 0,80 · 0,97 · 0,995 y meta 0,9, recomienda 4 en ≥ 95% de 200 corridas y usa menos del 60% de las noches de correr 400 fijas por valor', async () => {
  let acertó = 0, usadas = 0;
  const falló: string[] = [];
  for (let i = 0; i < 200; i++) {
    const ev = await evaluarDecision(modeloConSemilla(1000 + i), planificadorSincrono(simuladorPorValor(PROBAS)), varianteFalsa, OPCIONES);
    if (ev.recomendacion === 4) acertó++; else falló.push(`semilla ${1000 + i} → ${ev.recomendacion}`);
    usadas += ev.replicasUsadas;
  }
  const fraccion = usadas / 200 / 1600;
  assert.ok(acertó >= 190, `recomendó 4 en ${acertó} de 200 corridas (se esperaba ≥ 190 = 95%); fallas: ${falló.slice(0, 5).join('; ')}`);
  assert.ok(fraccion < 0.6, `usó en promedio ${(fraccion * 100).toFixed(1)}% de las noches de 400 fijas por valor (se esperaba menos de 60%)`);
});

test('la misma evaluación con 1 o con 3 trabajadores en proceso da exactamente el mismo resultado (agrega por índice, no por llegada)', async () => {
  const sim = simuladorPorValor(PROBAS);
  const mv = modeloConSemilla(31337);
  const correr = async (trabajadores: number) => {
    const p = crearPlanificador(trabajadorEnProceso(sim, 'prueba'), trabajadores);
    try { return await evaluarDecision(mv, p, varianteFalsa, OPCIONES); } finally { p.cerrar(); }
  };
  const referencia = await evaluarDecision(mv, planificadorSincrono(sim), varianteFalsa, OPCIONES);
  assert.deepEqual(await correr(1), referencia);
  assert.deepEqual(await correr(3), referencia);
});

test('si al llegar a replicasMax un valor relevante sigue en duda: sin recomendación y semáforo amarillo «decision-en-duda» con cuántas noches faltarían', async () => {
  const ev = await evaluarDecision(modeloConSemilla(5), planificadorSincrono(simuladorPorValor({ 2: 0.5, 3: 0.9, 4: 0.99, 5: 0.99 })), varianteFalsa,
    { replicasIniciales: 20, tanda: 20, replicasMax: 60 });
  const c3 = ev.configuraciones[1];
  assert.equal(c3.estado, 'en-duda'); assert.equal(c3.prop.n, 60, 'llegó al máximo');
  assert.equal(ev.recomendacion, null);
  assert.equal(ev.semaforo.color, 'amarillo'); assert.equal(ev.semaforo.motivo, 'decision-en-duda');
  assert.ok(String(ev.semaforo.vars.valores).startsWith('3'), `en duda: ${ev.semaforo.vars.valores}`); assert.equal(ev.semaforo.vars.replicas, 60);
  assert.ok(typeof ev.semaforo.vars.faltan === 'number' && ev.semaforo.vars.faltan >= 0, `faltan = ${ev.semaforo.vars.faltan}`);
});

test('si ninguna configuración cumple, la recomendación es null pero no hay duda: el semáforo no se pone amarillo por eso', async () => {
  const ev = await evaluarDecision(modeloConSemilla(5), planificadorSincrono(simuladorPorValor({ 2: 0.2, 3: 0.3, 4: 0.4, 5: 0.5 })), varianteFalsa, OPCIONES);
  assert.ok(ev.configuraciones.every((c) => c.estado === 'no-cumple'));
  assert.equal(ev.recomendacion, null); assert.equal(ev.semaforo.color, 'verde');
  assert.equal(ev.replicasUsadas, 80, 'todas se resuelven con las 20 noches iniciales');
});

test('alertas en las noches (aunque sea en una) ponen el semáforo de la evaluación en rojo', async () => {
  const sim: Simulador = (mv, semilla, replica, o) => {
    const s = simuladorPorValor(PROBAS)(mv, semilla, replica, o);
    return replica === 7 && mv.modelo.personas.induccion.puestosActivos === 3
      ? { resultado: { ...s.resultado, alertas: ['invariante:rampa-capacidad'] } } : s;
  };
  const ev = await evaluarDecision(modeloConSemilla(5), planificadorSincrono(sim), varianteFalsa, OPCIONES);
  assert.equal(ev.semaforo.color, 'rojo'); assert.equal(ev.semaforo.motivo, 'invariante');
  assert.equal(ev.semaforo.vars.nombre, 'rampa-capacidad');
  assert.equal(ev.semaforo.vars.replica, 8, 'el texto nombra la noche como la etiqueta: la réplica 7 es la «noche 8»');
});

test('«no-termina» en una opción que no cumple (sobrecargada) no pone en rojo la decisión; en una opción que cumple, sí (integración, I-3)', async () => {
  // con 2 puestos la noche no termina (y pierde el corte); el resto como siempre
  const conNoTermina = (valor: number, cada: number): Simulador => (mv, semilla, replica, o) => {
    const s = simuladorPorValor(PROBAS)(mv, semilla, replica, o);
    return mv.modelo.personas.induccion.puestosActivos === valor && replica % cada === 7
      ? { resultado: { ...s.resultado, alertas: ['no-termina'], kpi: { ...s.resultado.kpi, pendientesAlCorte: 50 } } } : s;
  };
  const sobrecargada = await evaluarDecision(modeloConSemilla(20261017), planificadorSincrono(conNoTermina(2, 8)), varianteFalsa, OPCIONES);
  assert.equal(sobrecargada.configuraciones[0].estado, 'no-cumple');
  assert.equal(sobrecargada.semaforo.color, 'verde', `se esperaba verde y salió ${sobrecargada.semaforo.color} (${sobrecargada.semaforo.motivo})`);
  assert.equal(sobrecargada.recomendacion, 4);
  // el verde no dice «ninguna alerta» después de haberlas filtrado: cuenta TODAS las noches y nombra la opción sobrecargada (hallazgo E-08)
  assert.deepEqual(sobrecargada.semaforo.vars, { replicas: sobrecargada.replicasUsadas, sobrecargadas: '2' });
  assert.equal(claveTextoSemaforo(sobrecargada.semaforo), 'experimentos.semaforo.ok.sobrecargadas');
  for (const archivo of ['textos.es.json', 'textos.en.json']) {
    const textos = JSON.parse(readFileSync(new URL(`../${archivo}`, import.meta.url), 'utf8')) as Record<string, string>;
    const usadas = [...textos['experimentos.semaforo.ok.sobrecargadas'].matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    assert.deepEqual(usadas, ['replicas', 'sobrecargadas'], `${archivo}: el texto de «ok.sobrecargadas» usa las variables que entrega la decisión`);
  }
  // una sola noche que no termina con 5 puestos: la opción no queda «no cumple», así que la alerta sí cuenta
  const enLaRecomendada = await evaluarDecision(modeloConSemilla(20261017), planificadorSincrono(conNoTermina(5, 1000)), varianteFalsa, OPCIONES);
  assert.notEqual(enLaRecomendada.configuraciones[3].estado, 'no-cumple');
  assert.equal(enLaRecomendada.semaforo.color, 'rojo'); assert.equal(enLaRecomendada.semaforo.motivo, 'inestable');
});

test('pocas noches iniciales (10) y todo resuelto se avisan como «pocas-replicas»', async () => {
  const ev = await evaluarDecision(modeloConSemilla(5), planificadorSincrono(simuladorPorValor({ 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0 })), varianteFalsa,
    { replicasIniciales: 10, tanda: 10, replicasMax: 10 });
  assert.equal(ev.semaforo.motivo, 'pocas-replicas'); assert.equal(ev.semaforo.vars.replicas, 10);
});

test('con 10 noches un «cumple» es imposible (10 de 10 da un Wilson inferior de 0,72): queda en duda y el aviso es «decision-en-duda», que va antes que «pocas-replicas»', async () => {
  const ev = await evaluarDecision(modeloConSemilla(5), planificadorSincrono(simuladorPorValor({ 2: 0.0, 3: 0.0, 4: 1.0, 5: 1.0 })), varianteFalsa,
    { replicasIniciales: 10, tanda: 10, replicasMax: 10 });
  assert.deepEqual(ev.configuraciones.map((c) => c.estado), ['no-cumple', 'no-cumple', 'en-duda', 'en-duda']);
  assert.equal(ev.semaforo.motivo, 'decision-en-duda'); assert.equal(ev.semaforo.vars.valores, '4, 5', 'las dos opciones altas siguen en duda y pueden cambiar la recomendación');
});

test('la prioridad se puede elegir (el tamizado usa TAMIZADO) y por defecto es DECISION', async () => {
  const prioridades = new Set<number>();
  await evaluarDecision(modeloConSemilla(5), planificadorSincrono(simuladorPorValor(PROBAS), { alEnviar: (t) => prioridades.add(t.prioridad) }), varianteFalsa, { ...OPCIONES, prioridad: Prioridad.TAMIZADO });
  assert.deepEqual([...prioridades], [Prioridad.TAMIZADO]);
});

test('cancelación: si el planificador cancela un trabajo, la evaluación se rechaza con ErrorCancelado y cancela el resto de lo que lanzó', async () => {
  const cancelados: string[] = [];
  const pendientes = new Map<string, (x: { completadas: number; cancelado: boolean }) => void>();
  let enviados = 0;
  const p: Planificador = {
    trabajadores: 1,
    // El segundo trabajo se cancela solo; los demás quedan colgados hasta que la evaluación pida cancelarlos (como hace el planificador real).
    enviar: (t) => new Promise((ok) => { enviados++; if (enviados === 2) ok({ completadas: 0, cancelado: true }); else pendientes.set(t.id, ok); }),
    cancelar: (id) => { cancelados.push(id); pendientes.get(id)?.({ completadas: 0, cancelado: true }); },
    cancelarDesde() {}, cerrar() {},
  };
  const caso = evaluarDecision(modeloConSemilla(5), p, varianteFalsa, OPCIONES);
  await assert.rejects(caso, (e: unknown) => e instanceof ErrorCancelado && esCancelacion(e) && /cancelada \(valor 3/.test((e as Error).message));
  assert.equal(enviados, 4);
  assert.equal(cancelados.length, 3, 'los otros tres trabajos de la ronda se cancelaron al cancelarse el segundo');
  assert.ok(cancelados.every((id) => id.startsWith('decision:')));
});

test('cancelación con el planificador real: cancelarDesde(DECISION) en medio de la evaluación la rechaza con ErrorCancelado y no deja trabajo pendiente', async () => {
  const llamadas = { n: 0 };
  const sim: Simulador = (mv, semilla, replica, o) => { llamadas.n++; return simuladorPorValor(PROBAS)(mv, semilla, replica, o); };
  const p = crearPlanificador(trabajadorEnProceso(sim, 'prueba'), 2);
  let hechas = 0;
  const caso = evaluarDecision(modeloConSemilla(5), p, varianteFalsa, { ...OPCIONES, alProgreso: (h) => { hechas = h; if (h === 6) p.cancelarDesde(Prioridad.DECISION); } });
  await assert.rejects(caso, (e: unknown) => esCancelacion(e));
  const n = llamadas.n, h = hechas;
  await new Promise((ok) => setTimeout(ok, 40));
  assert.equal(llamadas.n, n, 'después de cancelar no se simula nada más');
  assert.equal(hechas, h, 'ni se informa progreso');
  p.cerrar();
});

test('un error de la simulación se propaga con su mensaje (no se confunde con una cancelación)', async () => {
  const sim: Simulador = () => { throw new Error('el modelo explotó'); };
  const p = crearPlanificador(trabajadorEnProceso(sim, 'prueba'), 2);
  await assert.rejects(evaluarDecision(modeloConSemilla(5), p, varianteFalsa, OPCIONES), (e: unknown) => !esCancelacion(e) && /el modelo explotó/.test((e as Error).message));
  p.cerrar();
});

test('recomendar: el menor que cumple si todos los menores no cumplen; null si hay duda antes o si no cumple ninguno', () => {
  const c = (...estados: ('cumple' | 'no-cumple' | 'en-duda')[]) => estados.map((estado, i) => ({ valor: i + 2, estado }));
  assert.equal(recomendar(c('no-cumple', 'no-cumple', 'cumple', 'cumple')), 4);
  assert.equal(recomendar(c('cumple', 'cumple')), 2);
  assert.equal(recomendar(c('no-cumple', 'en-duda', 'cumple')), null, 'el 3 sigue en duda: no se puede asegurar que el 4 sea el menor');
  assert.equal(recomendar(c('en-duda', 'cumple')), null);
  assert.equal(recomendar(c('no-cumple', 'no-cumple')), null);
  assert.equal(recomendar([]), null);
  assert.equal(recomendar(c('no-cumple', 'cumple', 'en-duda')), 3, 'lo que está en duda por encima del primero que cumple no cambia la recomendación');
});

test('validación de opciones y del modelo: mensajes que dicen qué se esperaba y qué llegó', async () => {
  const p = planificadorSincrono(simuladorPorValor(PROBAS));
  const mv = modeloConSemilla(1);
  const falla = (o: Partial<typeof OPCIONES>) => evaluarDecision(mv, p, varianteFalsa, { ...OPCIONES, ...o });
  await assert.rejects(falla({ replicasIniciales: 1 }), /replicasIniciales tiene que ser un entero ≥ 2.*llegó 1/);
  await assert.rejects(falla({ replicasIniciales: 20.5 }), /replicasIniciales/);
  await assert.rejects(falla({ tanda: 0 }), /tanda tiene que ser un entero ≥ 1 y llegó 0/);
  await assert.rejects(falla({ replicasMax: 10 }), /replicasMax \(10\) tiene que ser un entero ≥ replicasIniciales \(20\)/);
  const sinDecision: ModeloValidado = (() => { const m = modeloEjemplo(); delete m.decision; return validadoSinChequeos(m); })();
  await assert.rejects(evaluarDecision(sinDecision, p, varianteFalsa, OPCIONES), /el modelo no define una decisión/);
  const rango = (min: number, max: number): ModeloValidado => { const m = modeloEjemplo(); m.decision!.variable.min = min; m.decision!.variable.max = max; return validadoSinChequeos(m); };
  await assert.rejects(evaluarDecision(rango(5, 2), p, varianteFalsa, OPCIONES), /enteros min ≤ max y trae \[5, 2\]/);
  await assert.rejects(evaluarDecision(rango(1, 100), p, varianteFalsa, OPCIONES), /tiene 100 valores y el máximo es 32/);
  const meta = (x: number): ModeloValidado => { const m = modeloEjemplo(); m.decision!.restriccion.probabilidadMinima = x; return validadoSinChequeos(m); };
  await assert.rejects(evaluarDecision(meta(0), p, varianteFalsa, OPCIONES), /probabilidadMinima tiene que estar en \(0, 1\] y llegó 0/);
});

test('la firma es la del contrato (EvaluarDecision) y acepta las opciones del contrato sin las extras', () => {
  const f: EvaluarDecision = evaluarDecision;
  assert.equal(typeof f, 'function');
  assert.equal(evaluarDecisionCon, evaluarDecision);
});

test('lo evidente se resuelve sin apuro de más: 0 de 20 ya es «no cumple»; «cumple» recién con 60 de 60 (Wilson inferior con el z calibrado 2,37: 0,914; con 40 de 40, 0,877)', async () => {
  const trabajos: Trabajo[] = [];
  const sim: Simulador = (mv, semilla, replica) => {
    const v = mv.modelo.personas.induccion.puestosActivos;
    return { resultado: resultadoFalso({ semilla, replica, modelo: mv.huella, kpi: { pendientesAlCorte: v >= 4 ? 0 : 5, costoNoche: v * 1000 } }) };
  };
  const ev = await evaluarDecision(modeloConSemilla(5), planificadorSincrono(sim, { alEnviar: (t) => trabajos.push(t) }), varianteFalsa, OPCIONES);
  const esperados = [[2, 0, 20], [3, 0, 20], [4, 0, 20], [5, 0, 20]];
  for (let d = 20; d < 60; d += 20) esperados.push([4, d, d + 20], [5, d, d + 20]);
  assert.deepEqual(trabajos.map((t) => [t.mv.modelo.personas.induccion.puestosActivos, ...t.replicas]), esperados,
    'los dos que no cumplen se resuelven en la primera ronda; los dos que sí, cuando el Wilson calibrado para las 20 miradas lo permite');
  assert.equal(ev.recomendacion, 4); assert.equal(ev.replicasUsadas, 160);
  assert.deepEqual(ev.configuraciones.map((c) => c.estado), ['no-cumple', 'no-cumple', 'cumple', 'cumple']);
  assert.equal(ev.configuraciones[2].objetivo.media, 4000); assert.equal(ev.configuraciones[2].objetivo.semiancho, 0);
  assert.equal(ev.semaforo.color, 'verde');
});
