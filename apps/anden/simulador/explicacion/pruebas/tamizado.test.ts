// Tamizado por decisión: ordena los supuestos por cuánto puede costar equivocarse (pérdida esperada en pesos por noche), no por cuánto
// mueve un indicador. Con un modelo falso donde solo un supuesto cambia la decisión, ese va primero con pérdida > 0 y los demás con 0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { EvaluacionConfiguracion, EvaluacionDecision } from '../../contratos/experimentos.ts';
import type { ModeloValidado } from '../../contratos/modelo.ts';
import { validadoSinChequeos } from '../../contratos/referencias.ts';
import { armarFormulario, cierreDelFormulario } from '../formulario.ts';
import { supuestosDe, tamizar } from '../tamizado.ts';
import { verificarFrases } from '../verificador.ts';
import { crearVarianteFalsa, modeloEjemplo, validadoEjemplo } from './ayudas.ts';

// ------------------------------------------------------------------------------------------------------------------ supuestosDe

test('los supuestos del ejemplo: los parámetros con `incierto` que el modelo usa de verdad, por nombre', () => {
  const s = supuestosDe(validadoEjemplo());
  assert.deepEqual(s.map((x) => x.parametro), ['ausentismo', 'errorPronosticoCv', 'induccionBase', 'manejoRampa', 'noLeido', 'probAtrasoComun', 'ritmoDescarga']);
  const ind = s.find((x) => x.parametro === 'induccionBase')!;
  assert.deepEqual(ind.valores, [2.25, 2.4, 4.5]);
  assert.deepEqual(ind.pesos, [0.25, 0.5, 0.25]);
  assert.equal(ind.golpeDiscreto, false);
  assert.equal(s.find((x) => x.parametro === 'ausentismo')!.golpeDiscreto, true, 'las faltas son golpe discreto: el tamizado las simula siempre');
  assert.equal(s.find((x) => x.parametro === 'probAtrasoComun')!.golpeDiscreto, true);
  assert.deepEqual(s.find((x) => x.parametro === 'noLeido')!.valores, [0.001, 0.015, 0.05]);
});

test('eficienciaTemporario aplica solo si hay temporarios: con temporarios = 0 no se pregunta', () => {
  const m = modeloEjemplo();
  assert.equal(supuestosDe(validadoSinChequeos(m)).some((x) => x.parametro === 'eficienciaTemporario'), false);
  m.personas.induccion.temporarios = 1;
  const con = supuestosDe(validadoSinChequeos(m));
  assert.equal(con.some((x) => x.parametro === 'eficienciaTemporario'), true);
  assert.deepEqual(con.find((x) => x.parametro === 'eficienciaTemporario')!.valores, [0.53, 0.7, 1]);
});

test('un parámetro que el modelo no referencia no es un supuesto (aunque tenga `incierto`)', () => {
  const m = modeloEjemplo();
  m.parametros.huerfano = { valor: 3, unidad: 's', etiqueta: 'SUPUESTO', fuente: 'prueba', fecha: '2026-10-18', incierto: { bajo: 1, medio: 3, alto: 5 } };
  assert.equal(supuestosDe(validadoSinChequeos(m)).some((x) => x.parametro === 'huerfano'), false);
  // y si solo lo usa un campo apagado (fatiga desactivada), tampoco
  m.parametros.fatigaMaxima.incierto = { bajo: 0.05, medio: 0.15, alto: 0.3 };
  assert.equal(supuestosDe(validadoSinChequeos(m)).some((x) => x.parametro === 'fatigaMaxima'), false, 'la fatiga está apagada');
  m.personas.fatiga.activa = true;
  assert.equal(supuestosDe(validadoSinChequeos(m)).some((x) => x.parametro === 'fatigaMaxima'), true);
});

test('micro-paradas apagadas: sus parámetros dejan de ser supuestos; el atraso común sin probabilidad deja afuera a su demora', () => {
  const m = modeloEjemplo();
  m.parametros.paradaLazoEntre.incierto = { bajo: 1800, medio: 2700, alto: 5400 };
  m.parametros.demoraAtrasoComun.incierto = { bajo: 600, medio: 1800, alto: 3600 };
  assert.equal(supuestosDe(validadoSinChequeos(m)).some((x) => x.parametro === 'paradaLazoEntre'), true);
  assert.equal(supuestosDe(validadoSinChequeos(m)).some((x) => x.parametro === 'demoraAtrasoComun'), true);
  m.hub.sorter.paradas.activas = false;
  m.parametros.probAtrasoComun.valor = 0;
  const s = supuestosDe(validadoSinChequeos(m)).map((x) => x.parametro);
  assert.equal(s.includes('paradaLazoEntre'), false);
  assert.equal(s.includes('demoraAtrasoComun'), false);
});

test('pesos previos propios: se normalizan si no suman 1; pesos inválidos dan un error que dice cuál parámetro', () => {
  const m = modeloEjemplo();
  m.parametros.induccionBase.incierto = { bajo: 2.25, medio: 2.4, alto: 4.5, pesos: [1, 2, 1] };
  assert.deepEqual(supuestosDe(validadoSinChequeos(m)).find((x) => x.parametro === 'induccionBase')!.pesos, [0.25, 0.5, 0.25]);
  m.parametros.induccionBase.incierto = { bajo: 2.25, medio: 2.4, alto: 4.5, pesos: [0.2, 0.3, 0.5] };
  assert.deepEqual(supuestosDe(validadoSinChequeos(m)).find((x) => x.parametro === 'induccionBase')!.pesos, [0.2, 0.3, 0.5]);
  m.parametros.induccionBase.incierto = { bajo: 2.25, medio: 2.4, alto: 4.5, pesos: [-1, 1, 1] };
  assert.throws(() => supuestosDe(validadoSinChequeos(m)), /los pesos de «induccionBase» tienen que ser tres números no negativos y llegó \[-1, 1, 1\]/);
  m.parametros.induccionBase.incierto = { bajo: 2.25, medio: 2.4, alto: 4.5, pesos: [0, 0, 0] };
  assert.throws(() => supuestosDe(validadoSinChequeos(m)), /suman 0/);
});

// ------------------------------------------------------------------------------------------------------------------ un modelo falso

const VALORES = [2, 3, 4, 5];
interface Mundo {
  /** Cuántos puestos hacen falta según el modelo (null: ninguno de los probados alcanza). */
  requeridos(mv: ModeloValidado): number;
  /** Corrimiento del nivel de costos (mueve el KPI sin tocar la decisión). */
  nivel?(mv: ModeloValidado): number;
}
const media = (mv: ModeloValidado, n: string): number => {
  const v = mv.modelo.parametros[n].valor;
  return typeof v === 'number' ? v : (v as { media?: number; p?: number }).media ?? (v as { p: number }).p;
};

/** Evaluación falsa: cada puesto cuesta 10.000; cada puesto que falta para lo requerido cuesta 50.000 más. La recomendación es el menor valor que alcanza. */
function crearEvaluar(mundo: Mundo) {
  let llamadas = 0;
  const evaluar = async (mv: ModeloValidado): Promise<EvaluacionDecision> => {
    llamadas++;
    const req = mundo.requeridos(mv);
    const nivel = mundo.nivel?.(mv) ?? 0;
    const configuraciones: EvaluacionConfiguracion[] = VALORES.map((valor) => {
      const cumple = valor >= req;
      const costo = nivel + 10000 * valor + 50000 * Math.max(0, req - valor);
      const p = cumple ? 0.97 : 0.4;
      return {
        valor, estado: cumple ? 'cumple' : 'no-cumple',
        prop: { exitos: Math.round(p * 100), n: 100, p, ic: [p - 0.03, p + 0.03], metodo: 'wilson', confianza: 0.95 },
        objetivo: { kpi: 'costoNoche', n: 100, media: costo, desvio: 1000, confianza: 0.95, ic: [costo - 100, costo + 100], semiancho: 100, p50: costo, p90: costo, icP90: null, min: costo, max: costo },
      };
    });
    const recomendacion = VALORES.find((v) => v >= req) ?? null;
    return { decision: 'dotacion-induccion', configuraciones, recomendacion, semaforo: { color: 'verde', motivo: 'ok', vars: {} }, replicasUsadas: 40 };
  };
  return { evaluar, llamadas: () => llamadas };
}

/** Solo la media del tiempo base de inducción cambia la decisión: hasta 3 s alcanzan 2 puestos; con 4,5 s hacen falta 4. */
const mundoSoloInduccion: Mundo = {
  requeridos: (mv) => (media(mv, 'induccionBase') > 3 ? 4 : 2),
  nivel: (mv) => 100000 * media(mv, 'probAtrasoComun'),   // el atraso común mueve el costo pero no cambia la decisión
};

test('solo un supuesto cambia la decisión → primero en el ranking con pérdida > 0; los demás con pérdida 0', async () => {
  const mv = validadoEjemplo();
  const { evaluar, llamadas } = crearEvaluar(mundoSoloInduccion);
  const { variante } = crearVarianteFalsa();
  const supuestos = supuestosDe(mv);
  const r = await tamizar(mv, supuestos, evaluar, variante, {});
  assert.equal(r.length, 7);
  assert.equal(r[0].parametro, 'induccionBase');
  assert.deepEqual(r[0].decisiones, [2, 2, 4]);
  assert.equal(r[0].cambiaDecision, true);
  // pérdida = 0,25 · |costo_alto(4) − costo_alto(2)| = 0,25 · |40.000 − (20.000 + 2 · 50.000)| = 0,25 · 80.000
  assert.equal(r[0].perdidaEsperada, 20000);
  for (const otro of r.slice(1)) {
    assert.equal(otro.perdidaEsperada, 0, `${otro.parametro}: no cambia la decisión y no pierde nada`);
    assert.equal(otro.cambiaDecision, false, otro.parametro);
    assert.deepEqual(otro.decisiones, [2, 2, 2], otro.parametro);
  }
  // 1 evaluación del modelo y 2 por supuesto
  assert.equal(llamadas(), 1 + 2 * 7);
});

test('el corrimiento del KPI es un dato aparte: el atraso común corre el costo 25.000 sin tocar la decisión, y queda segundo por desempate', async () => {
  const mv = validadoEjemplo();
  const { evaluar } = crearEvaluar(mundoSoloInduccion);
  const r = await tamizar(mv, supuestosDe(mv), evaluar, crearVarianteFalsa().variante, {});
  const atraso = r.find((x) => x.parametro === 'probAtrasoComun')!;
  assert.equal(atraso.perdidaEsperada, 0);
  assert.equal(atraso.corrimientoObjetivo, 25000, '100.000 · (0,25 − 0)');
  assert.equal(r[1].parametro, 'probAtrasoComun', 'a igual pérdida, el que más corre el KPI va antes');
  const ind = r.find((x) => x.parametro === 'induccionBase')!;
  // con la decisión del valor medio (2 puestos): mundo alto 20.000 + 2 · 50.000 = 120.000 y mundo bajo 20.000 (más el mismo nivel en los dos)
  assert.equal(ind.corrimientoObjetivo, 100000, 'el corrimiento se mide con la decisión del valor medio: costo alto − costo bajo');
});

test('el ranking viene de mayor a menor pérdida y con desempate estable por nombre', async () => {
  const mv = validadoEjemplo();
  // dos supuestos que cambian la decisión, uno más que el otro
  const mundo: Mundo = {
    requeridos: (m) => (media(m, 'induccionBase') > 3 ? 4 : 2) + (media(m, 'ritmoDescarga') > 6 ? 1 : 0),
  };
  const { evaluar } = crearEvaluar(mundo);
  const r = await tamizar(mv, supuestosDe(mv), evaluar, crearVarianteFalsa().variante, {});
  const perdidas = r.map((x) => x.perdidaEsperada);
  assert.deepEqual([...perdidas].sort((a, b) => b - a), perdidas);
  assert.equal(r[0].parametro, 'induccionBase');
  assert.equal(r[1].parametro, 'ritmoDescarga');
  assert.ok(r[0].perdidaEsperada > r[1].perdidaEsperada && r[1].perdidaEsperada > 0);
  // los que no pierden quedan por nombre
  const ceros = r.filter((x) => x.perdidaEsperada === 0).map((x) => x.parametro);
  assert.deepEqual(ceros, [...ceros].sort());
});

test('la pérdida pondera por los pesos previos: peso 0 en el extremo que cambia la decisión → pérdida 0', async () => {
  const m = modeloEjemplo();
  m.parametros.induccionBase.incierto = { bajo: 2.25, medio: 2.4, alto: 4.5, pesos: [0.5, 0.5, 0] };
  const mv = validadoSinChequeos(m);
  const { evaluar } = crearEvaluar(mundoSoloInduccion);
  const r = await tamizar(mv, supuestosDe(mv), evaluar, crearVarianteFalsa().variante, {});
  const ind = r.find((x) => x.parametro === 'induccionBase')!;
  assert.equal(ind.cambiaDecision, true, 'la decisión sí cambia con el valor alto');
  assert.equal(ind.perdidaEsperada, 0, 'pero el valor alto pesa 0: decidir hoy no cuesta nada esperado');
});

test('si con un valor ninguna opción probada alcanza (recomendación null), se usa el máximo de la variable y la decisión queda en null', async () => {
  const mv = validadoEjemplo();
  const mundo: Mundo = { requeridos: (m) => (media(m, 'induccionBase') > 3 ? 6 : 2) };   // con 4,5 s ni 5 puestos alcanzan
  const { evaluar } = crearEvaluar(mundo);
  const r = await tamizar(mv, supuestosDe(mv), evaluar, crearVarianteFalsa().variante, {});
  const ind = r[0];
  assert.equal(ind.parametro, 'induccionBase');
  assert.deepEqual(ind.decisiones, [2, 2, null], 'el null se ve: no se inventa una recomendación');
  assert.equal(ind.cambiaDecision, true);
  // costo con 5 puestos en el mundo alto: 50.000 + 50.000 · (6 − 5) = 100.000; con 2: 20.000 + 50.000 · 4 = 220.000 → 0,25 · 120.000
  assert.equal(ind.perdidaEsperada, 30000);
});

test('cada supuesto se evalúa con su parche; el valor medio se evalúa una sola vez; el modelo original queda intacto', async () => {
  const mv = validadoEjemplo();
  const antes = JSON.stringify(mv.modelo);
  const vistos: number[] = [];
  const { evaluar } = crearEvaluar(mundoSoloInduccion);
  const evaluarYAnotar = (x: ModeloValidado) => { vistos.push(media(x, 'induccionBase')); return evaluar(x); };
  const { variante, llamadas } = crearVarianteFalsa();
  await tamizar(mv, supuestosDe(mv).filter((s) => s.parametro === 'induccionBase'), evaluarYAnotar, variante, {});
  assert.deepEqual(vistos, [2.4, 2.25, 4.5], 'el medio, el bajo y el alto, en ese orden');
  assert.equal(llamadas(), 2);
  assert.equal(JSON.stringify(mv.modelo), antes);
  // un valor bajo igual al medio no se vuelve a evaluar
  const m = modeloEjemplo();
  m.parametros.induccionBase.incierto = { bajo: 2.4, medio: 2.4, alto: 4.5 };
  const { evaluar: ev2, llamadas: n2 } = crearEvaluar(mundoSoloInduccion);
  await tamizar(validadoSinChequeos(m), supuestosDe(validadoSinChequeos(m)).filter((s) => s.parametro === 'induccionBase'), ev2, crearVarianteFalsa().variante, {});
  assert.equal(n2(), 2, 'el medio y el alto: el bajo es el mismo modelo');
});

test('el progreso cuenta 1 + 2 por supuesto y llega al total', async () => {
  const mv = validadoEjemplo();
  const { evaluar } = crearEvaluar(mundoSoloInduccion);
  const avances: [number, number][] = [];
  await tamizar(mv, supuestosDe(mv), evaluar, crearVarianteFalsa().variante, { alProgreso: (h, t) => avances.push([h, t]) });
  assert.equal(avances.length, 15);
  assert.deepEqual(avances[0], [1, 15]);
  assert.deepEqual(avances[14], [15, 15]);
  assert.deepEqual(avances.map((a) => a[0]), Array.from({ length: 15 }, (_, i) => i + 1));
});

test('cancelación: si una evaluación se rechaza, el tamizado se rechaza con el mismo error y no sigue evaluando', async () => {
  const mv = validadoEjemplo();
  const { evaluar } = crearEvaluar(mundoSoloInduccion);
  let n = 0;
  const cancelable = (x: ModeloValidado): Promise<EvaluacionDecision> => { n++; return n === 4 ? Promise.reject(new Error('cancelado por el usuario')) : evaluar(x); };
  await assert.rejects(tamizar(mv, supuestosDe(mv), cancelable, crearVarianteFalsa().variante, {}), /cancelado por el usuario/);
  assert.equal(n, 4, 'no se lanzaron más evaluaciones después de la cancelada');
});

test('errores que dicen qué se esperaba: modelo sin decisión, parámetro que no está, evaluación sin la configuración', async () => {
  const m = modeloEjemplo();
  delete m.decision;
  const sinDecision = validadoSinChequeos(m);
  const { evaluar } = crearEvaluar(mundoSoloInduccion);
  await assert.rejects(tamizar(sinDecision, [], evaluar, crearVarianteFalsa().variante, {}), /el modelo no tiene `decision`/);
  const mv = validadoEjemplo();
  await assert.rejects(
    tamizar(mv, [{ parametro: 'noExiste', valores: [1, 2, 3], pesos: [0.25, 0.5, 0.25], golpeDiscreto: false }], evaluar, crearVarianteFalsa().variante, {}),
    /el parámetro «noExiste» no está en el modelo/,
  );
  const rota = async (): Promise<EvaluacionDecision> => ({ ...(await evaluar(mv)), configuraciones: [] });
  await assert.rejects(tamizar(mv, supuestosDe(mv).slice(0, 1), rota, crearVarianteFalsa().variante, {}), /la evaluación .* no tiene la configuración/);
});

test('sin supuestos devuelve una lista vacía (con una sola evaluación del modelo)', async () => {
  const mv = validadoEjemplo();
  const { evaluar, llamadas } = crearEvaluar(mundoSoloInduccion);
  assert.deepEqual(await tamizar(mv, [], evaluar, crearVarianteFalsa().variante, {}), []);
  assert.equal(llamadas(), 1);
});

test('las evaluaciones de cada fila quedan a mano para la interfaz: [bajo, medio, alto], y el medio es el mismo para todos', async () => {
  const mv = validadoEjemplo();
  const { evaluar } = crearEvaluar(mundoSoloInduccion);
  const r = await tamizar(mv, supuestosDe(mv), evaluar, crearVarianteFalsa().variante, {});
  const medios = new Set(r.map((x) => x.evaluaciones[1]));
  assert.equal(medios.size, 1);
  for (const x of r) assert.equal(x.replicas, 120, `${x.parametro}: 3 evaluaciones de 40 réplicas`);
});

test('de punta a punta: supuestos → tamizado → formulario: pregunta lo que cambia la decisión y se detiene bajo la zona de indiferencia', async () => {
  const mv = validadoEjemplo();
  const { evaluar } = crearEvaluar(mundoSoloInduccion);
  const ranking = await tamizar(mv, supuestosDe(mv), evaluar, crearVarianteFalsa().variante, {});
  // la zona de indiferencia del ejemplo es $ 20.000 por noche y el supuesto del tiempo de inducción pierde exactamente $ 20.000
  const preguntas = armarFormulario(mv, ranking);
  assert.deepEqual(preguntas.map((q) => q.parametro), ['induccionBase']);
  assert.equal(preguntas[0].perdidaEsperada, 20000);
  assert.deepEqual(preguntas[0].porQue.vars, { medio: 2.4, bajo: 2.25, alto: 4.5, n: 2 });
  assert.deepEqual(verificarFrases([preguntas[0].porQue], { experimentos: {}, trazas: {}, modelo: mv.modelo }).fallas, []);
  // si el costo de equivocarse que se tolera sube un peso, ya no hay nada que preguntar
  const m = modeloEjemplo();
  m.decision!.indiferencia.valor = 20001;
  assert.deepEqual(armarFormulario(validadoSinChequeos(m), ranking), []);
  assert.equal(cierreDelFormulario(ranking).motivo, 'listo', 'la decisión tiene respuesta (2 puestos): "Ya está" es verdad');
});

// ------------------------------------------------------------------------------- en duda no es «ninguna cumple» (hallazgo E-05)

test('un extremo que quedó EN DUDA no se trata como «ninguna cumple»: la pérdida sale de las decisiones posibles y la frase lo dice', async () => {
  const mv = validadoEjemplo();
  // Con induccionBase alto: el 2 queda en duda (tope de noches del tamizado) y el 3 cumple; con el medio, 2 alcanza.
  const evaluar = async (m: ModeloValidado): Promise<EvaluacionDecision> => {
    const alto = media(m, 'induccionBase') > 3;
    const estados: EvaluacionConfiguracion['estado'][] = alto ? ['en-duda', 'cumple', 'cumple', 'cumple'] : ['cumple', 'cumple', 'cumple', 'cumple'];
    const configuraciones: EvaluacionConfiguracion[] = VALORES.map((valor, i) => {
      // costo propio de cada opción: 10.000 por puesto; con el valor alto, el 2 cuesta 60.000 más (se pierde el corte a veces)
      const costo = 10000 * valor + (alto && valor === 2 ? 60000 : 0);
      return {
        valor, estado: estados[i],
        prop: { exitos: 95, n: 100, p: 0.95, ic: [0.88, 0.98], metodo: 'wilson', confianza: 0.95 },
        objetivo: { kpi: 'costoNoche', n: 100, media: costo, desvio: 1000, confianza: 0.95, ic: [costo - 100, costo + 100], semiancho: 100, p50: costo, p90: costo, icP90: null, min: costo, max: costo },
      };
    });
    const recomendacion = alto ? null : 2;
    return { decision: 'dotacion-induccion', configuraciones, recomendacion,
      semaforo: alto ? { color: 'amarillo', motivo: 'decision-en-duda', vars: { valores: '2', replicas: 100, faltan: 300 } } : { color: 'verde', motivo: 'ok', vars: {} },
      replicasUsadas: 400 };
  };
  const r = await tamizar(mv, supuestosDe(mv).filter((x) => x.parametro === 'induccionBase'), evaluar, crearVarianteFalsa().variante, {});
  const fila = r[0] as typeof r[0] & { enDuda: boolean[]; perdidaRango: [number, number] };
  assert.deepEqual(fila.decisiones, [2, 2, null]);
  assert.deepEqual(fila.enDuda, [false, false, true]);
  // decisiones posibles con el valor alto: 2 (en duda) o 3 (la menor que cumple). Contra la del medio (2): 0 o |30.000 − 80.000| = 50.000
  assert.deepEqual(fila.perdidaRango, [0, 0.25 * 50000]);
  assert.equal(fila.perdidaEsperada, 12500, 'la pérdida es lo más que puede costar (antes se usaba el máximo de la variable: 0,25 · |50.000 − 80.000|… con el 5)');
  // con indiferencia 20.000 no se pregunta: ni la peor resolución de la duda la alcanza
  assert.deepEqual(armarFormulario(mv, r), []);
  // con indiferencia menor sí, y la frase dice que quedó en duda (no que ninguna opción alcanza)
  const m2 = structuredClone(mv.modelo); m2.decision!.indiferencia.valor = 1000;
  const preguntas = armarFormulario(validadoSinChequeos(m2), r);
  assert.equal(preguntas.length, 1);
  assert.equal(preguntas[0].porQue.clave, 'explicacion.pregunta.porque.en_duda');
});
