// Verificador de frases: 200 frases verdaderas → 0 fallas; 20 falsas sembradas (valor, signo, «diferencia real» con IC que cruza el
// cero, sin fuente) → 20 de 20 detectadas, cada una con su motivo. Semilla fija; los valores esperados se calculan acá con cuentas
// propias (no con las funciones del verificador) para que la prueba no se ponga de acuerdo consigo misma.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Afirmacion, AlmacenResultados, Frase, MotivoFalla } from '../../contratos/explicacion.ts';
import type { Comparacion, Proporcion, Resumen } from '../../contratos/experimentos.ts';
import type { KpiId } from '../../contratos/resultados.ts';
import { cifrasSinRespaldo, esFraseControlada, verificarAfirmacion, verificarFrases } from '../verificador.ts';
import { ConstructorTraza, H22, MIN, PERSONA, generador, modeloEjemplo, viaje } from './ayudas.ts';

// ---------------------------------------------------------------------------------------------------------------- el almacén

function resumen(kpi: KpiId, media: number, p90: number): Resumen {
  return { kpi, n: 100, media, desvio: 3, confianza: 0.95, ic: [media - 1, media + 1], semiancho: 1, p50: media, p90, icP90: [p90 - 2, p90 + 2], min: media - 9, max: p90 + 9 };
}
function comparacion(kpi: KpiId, media: number, ic: [number, number]): Comparacion {
  return { kpi, n: 40, pareada: true, media, ic, veredicto: ic[0] > 0 || ic[1] < 0 ? 'b-mejor' : 'no-se-distingue', replicasSugeridas: null };
}
function proporcion(exitos: number, n: number): Proporcion {
  const p = exitos / n;
  return { exitos, n, p, ic: [Math.max(0, p - 0.08), Math.min(1, p + 0.08)], metodo: 'wilson', confianza: 0.95 };
}

/** Una traza con 40 paquetes de esperas distintas; devuelve también la lista de (tramo, duración en ms, t0) de las esperas en rampa. */
function trazaDeLaPrueba() {
  const c = new ConstructorTraza();
  for (let i = 0; i < 40; i++) {
    viaje(c, H22 + i * 7000).descarga(3000).cinta(40000).fila((i + 1) * 17000 + 1234).induccion(3000).bandeja(30000).rampa((i + 2) * 13000 + 777, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  }
  return c.construir();
}

function almacen(): AlmacenResultados {
  const traza = trazaDeLaPrueba();
  return {
    experimentos: {
      base: {
        resumen: { esperaP90Min: resumen('esperaP90Min', 14.62, 23.449), costoNoche: resumen('costoNoche', 812345.6, 905000), pctAlCorte: resumen('pctAlCorte', 97.25, 99.9) },
        prop: proporcion(87, 100),
      },
      'dos-puestos': {
        comparacion: {
          costoNoche: comparacion('costoNoche', -21500.4, [-30000, -13000]),     // B cuesta menos: baja, y la diferencia es real
          esperaP90Min: comparacion('esperaP90Min', 3.2, [-1.4, 7.8]),            // cruza el cero
          finClasificacionMin: comparacion('finClasificacionMin', 12.5, [4, 21]), // sube, real
        },
      },
    },
    trazas: { noche: traza },
    modelo: modeloEjemplo(),
  };
}

/** Redondeo a `d` decimales hecho a mano (la mitad se aleja del cero), distinto del de unidades.ts. */
function redon(x: number, d: number): number {
  const f = [1, 10, 100, 1000, 10000][d];
  const r = Math.floor(Math.abs(x) * f + 0.5 + 1e-9) / f;
  return x < 0 ? -r : r;
}

// ----------------------------------------------------------------------------------------------------- 200 frases verdaderas

/** Una frase verdadera de cada tipo de fuente; `i` y la semilla eligen cuál. */
function fraseVerdadera(i: number, rnd: () => number, a: AlmacenResultados): Frase {
  const t = a.trazas.noche;
  const tipo = i % 8;
  let af: Afirmacion;
  if (tipo === 0 || tipo === 1) {
    // duración de un tramo en minutos, segundos o milisegundos
    const tramo = Math.floor(rnd() * t.tramos.n);
    const dur = t.tramos.t1[tramo] - t.tramos.t0[tramo];
    const unidad = (['min', 's', 'ms', 'h'] as const)[Math.floor(rnd() * 4)];
    const dec = unidad === 'ms' ? 0 : Math.floor(rnd() * 3);
    const bruto = unidad === 'min' ? dur / 60000 : unidad === 's' ? dur / 1000 : unidad === 'h' ? dur / 3600000 : dur;
    af = { valor: redon(bruto, dec), unidad, decimales: dec, fuente: { tipo: 'traza', tramo, campo: 'duracion' } };
  } else if (tipo === 2) {
    // la hora del día en que empieza un tramo (minuto entero desde la medianoche)
    const tramo = Math.floor(rnd() * t.tramos.n);
    af = { valor: Math.floor(t.tramos.t0[tramo] / 60000), unidad: 'hora', decimales: 0, fuente: { tipo: 'traza', tramo, campo: 't0' } };
  } else if (tipo === 3) {
    const tramo = Math.floor(rnd() * t.tramos.n);
    af = { valor: t.tramos.a[tramo], unidad: 'paquetes', decimales: 0, fuente: { tipo: 'traza', tramo, campo: 'a' } };
  } else if (tipo === 4) {
    const campo = rnd() < 0.5 ? 'media' : 'p90';
    const r = a.experimentos.base.resumen!.esperaP90Min!;
    const dec = 1 + Math.floor(rnd() * 2);
    af = { valor: redon(campo === 'media' ? r.media : r.p90, dec), unidad: 'min', decimales: dec, fuente: { tipo: 'experimento', id: 'base', kpi: 'esperaP90Min', campo } };
  } else if (tipo === 5) {
    // diferencia con sentido: el valor puede venir como magnitud; la diferencia real solo si el IC excluye el cero
    const kpi = rnd() < 0.5 ? 'costoNoche' : 'finClasificacionMin';
    const c = a.experimentos['dos-puestos'].comparacion![kpi]!;
    const dec = Math.floor(rnd() * 2);
    const magnitud = rnd() < 0.5;
    af = {
      valor: magnitud ? Math.abs(redon(c.media, dec)) : redon(c.media, dec), unidad: 'unidades', decimales: dec,
      fuente: { tipo: 'experimento', id: 'dos-puestos', kpi, campo: 'diferencia' }, sentido: c.media > 0 ? 'sube' : 'baja', diferenciaReal: true,
    };
  } else if (tipo === 6) {
    const p = a.experimentos.base.prop!;
    af = { valor: redon(p.p * 100, 0), unidad: '%', decimales: 0, fuente: { tipo: 'experimento', id: 'base', kpi: 'todoAntesDelCorte', campo: 'prob' } };
  } else {
    // parámetro: el valor central, o `.bajo`, `.medio`, `.alto`, `.min`, `.max` de la ficha
    const m = a.modelo;
    const sufijo = (['bajo', 'medio', 'alto'] as const)[Math.floor(rnd() * 3)];
    const nombre = (['induccionBase', 'ritmoDescarga', 'manejoRampa', 'noLeido', 'ausentismo'] as const)[Math.floor(rnd() * 5)];
    const inc = m.parametros[nombre].incierto!;
    const v = inc[sufijo];
    const dec = 3;
    af = { valor: redon(v, dec), unidad: m.parametros[nombre].unidad, decimales: dec, fuente: { tipo: 'parametro', nombre: `${nombre}.${sufijo}` } };
  }
  return { clave: `prueba.frase.${i}`, vars: { x: af.valor }, afirmaciones: [af] };
}

test('200 frases verdaderas (traza, experimento, parámetro; con sentido y con redondeos): 0 fallas', () => {
  const a = almacen();
  const rnd = generador(20261018);
  const frases: Frase[] = [];
  for (let i = 0; i < 200; i++) frases.push(fraseVerdadera(i, rnd, a));
  const v = verificarFrases(frases, a, 'noche');
  assert.deepEqual(v.fallas, [], `se esperaba 0 fallas en 200 frases verdaderas y llegaron ${v.fallas.length}: ${JSON.stringify(v.fallas.slice(0, 3))}`);
  assert.equal(v.ok, true);
  // la misma lista sin elegir traza: el almacén tiene una sola, es esa
  assert.equal(verificarFrases(frases, a).ok, true);
});

test('el redondeo es el que dice la afirmación: 14,62 con 1 decimal es 14,6; con 2, 14,62; con 0, 15', () => {
  const a = almacen();
  const base = (valor: number, decimales: number): Afirmacion => ({ valor, unidad: 'min', decimales, fuente: { tipo: 'experimento', id: 'base', kpi: 'esperaP90Min', campo: 'media' } });
  assert.equal(verificarAfirmacion(base(14.6, 1), a), null);
  assert.equal(verificarAfirmacion(base(14.62, 2), a), null);
  assert.equal(verificarAfirmacion(base(15, 0), a), null);
  assert.equal(verificarAfirmacion(base(14.7, 1), a), 'valor-distinto');
  assert.equal(verificarAfirmacion(base(14.62, 1), a), null, '14,62 redondeado a 1 decimal es 14,6, igual que la fuente');
  assert.equal(verificarAfirmacion(base(14, 0), a), 'valor-distinto');
});

// --------------------------------------------------------------------------------------------------------- 20 falsas sembradas

interface Falsa { nombre: string; afirmacion: Afirmacion; esperado: MotivoFalla }
function falsas(a: AlmacenResultados): Falsa[] {
  const t = a.trazas.noche;
  const dur = (tramo: number) => (t.tramos.t1[tramo] - t.tramos.t0[tramo]) / 60000;
  const exp = (campo: 'media' | 'p90' | 'diferencia' | 'prob', id: string, kpi: KpiId) => ({ tipo: 'experimento' as const, id, kpi, campo });
  const lista: Falsa[] = [];
  // 5 de valor: la cifra no coincide con la fuente
  [3, 9, 17, 25, 33].forEach((tramo, j) => {
    lista.push({ nombre: `valor ${j}: duración del tramo ${tramo} corrida ${j + 1} décimas`, esperado: 'valor-distinto',
      afirmacion: { valor: redon(dur(tramo), 1) + 0.1 * (j + 1), unidad: 'min', decimales: 1, fuente: { tipo: 'traza', tramo, campo: 'duracion' } } });
  });
  // 5 de signo: el sentido contrario al de la fuente, o la cifra con el signo cambiado
  lista.push({ nombre: 'signo 0: dice que sube un costo que baja', esperado: 'signo-invertido',
    afirmacion: { valor: 21500.4, unidad: 'ARS', decimales: 1, fuente: exp('diferencia', 'dos-puestos', 'costoNoche'), sentido: 'sube', diferenciaReal: true } });
  lista.push({ nombre: 'signo 1: dice que baja un fin que sube', esperado: 'signo-invertido',
    afirmacion: { valor: 12.5, unidad: 'min', decimales: 1, fuente: exp('diferencia', 'dos-puestos', 'finClasificacionMin'), sentido: 'baja', diferenciaReal: true } });
  lista.push({ nombre: 'signo 2: la cifra con el signo cambiado y sin sentido', esperado: 'signo-invertido',
    afirmacion: { valor: 21500.4, unidad: 'ARS', decimales: 1, fuente: exp('diferencia', 'dos-puestos', 'costoNoche') } });
  lista.push({ nombre: 'signo 3: «igual» para una diferencia que no es cero', esperado: 'signo-invertido',
    afirmacion: { valor: 12.5, unidad: 'min', decimales: 1, fuente: exp('diferencia', 'dos-puestos', 'finClasificacionMin'), sentido: 'igual' } });
  lista.push({ nombre: 'signo 4: magnitud negativa con sentido «sube»', esperado: 'signo-invertido',
    afirmacion: { valor: -12.5, unidad: 'min', decimales: 1, fuente: exp('diferencia', 'dos-puestos', 'finClasificacionMin'), sentido: 'sube' } });
  // 5 de «diferencia real» con el IC que cruza el cero
  for (let j = 0; j < 5; j++) {
    lista.push({ nombre: `diferencia no real ${j}`, esperado: 'diferencia-no-real',
      afirmacion: { valor: redon(3.2, j % 2), unidad: 'min', decimales: j % 2, fuente: exp('diferencia', 'dos-puestos', 'esperaP90Min'), sentido: 'sube', diferenciaReal: true } });
  }
  // 5 sin fuente: falta la fuente, o la fuente cita algo que no existe
  lista.push({ nombre: 'sin fuente 0: la afirmación no trae fuente', esperado: 'sin-fuente',
    afirmacion: { valor: 5, unidad: 'min', decimales: 0 } as unknown as Afirmacion });
  lista.push({ nombre: 'sin fuente 1: fuente de un tipo que no existe', esperado: 'sin-fuente',
    afirmacion: { valor: 5, unidad: 'min', decimales: 0, fuente: { tipo: 'rumor' } } as unknown as Afirmacion });
  lista.push({ nombre: 'sin fuente 2: tramo que no existe', esperado: 'fuente-inexistente',
    afirmacion: { valor: 5, unidad: 'min', decimales: 0, fuente: { tipo: 'traza', tramo: 99999, campo: 'duracion' } } });
  lista.push({ nombre: 'sin fuente 3: experimento que no existe', esperado: 'fuente-inexistente',
    afirmacion: { valor: 14.6, unidad: 'min', decimales: 1, fuente: exp('media', 'fantasma', 'esperaP90Min') } });
  lista.push({ nombre: 'sin fuente 4: parámetro que no existe', esperado: 'fuente-inexistente',
    afirmacion: { valor: 2.4, unidad: 's', decimales: 1, fuente: { tipo: 'parametro', nombre: 'parametroInventado' } } });
  return lista;
}

test('20 frases falsas sembradas (valor, signo, diferencia real, sin fuente): 20 de 20 detectadas, cada una con su motivo', () => {
  const a = almacen();
  const lista = falsas(a);
  assert.equal(lista.length, 20);
  let detectadas = 0;
  for (const f of lista) {
    const motivo = verificarAfirmacion(f.afirmacion, a, 'noche');
    assert.equal(motivo, f.esperado, `${f.nombre}: se esperaba el motivo «${f.esperado}» y llegó «${String(motivo)}»`);
    if (motivo !== null) detectadas++;
  }
  assert.equal(detectadas, 20);

  // y por la puerta pública, dentro de frases: una falla por frase, con el índice de la frase y de la afirmación
  const frases: Frase[] = lista.map((f, i) => ({ clave: `prueba.falsa.${i}`, vars: {}, afirmaciones: [f.afirmacion] }));
  const v = verificarFrases(frases, a, 'noche');
  assert.equal(v.ok, false);
  assert.equal(v.fallas.length, 20, `se esperaban 20 fallas y llegaron ${v.fallas.length}`);
  v.fallas.forEach((f, i) => {
    assert.equal(f.frase, i);
    assert.equal(f.afirmacion, 0);
    assert.equal(f.motivo, lista[i].esperado);
  });
});

test('una frase con una afirmación buena y una mala: la falla apunta a la mala', () => {
  const a = almacen();
  const buena = fraseVerdadera(4, generador(1), a).afirmaciones[0];
  const mala: Afirmacion = { ...buena, valor: buena.valor + 5 };
  const v = verificarFrases([{ clave: 'prueba.mixta', vars: {}, afirmaciones: [buena, mala] }], a, 'noche');
  assert.deepEqual(v.fallas, [{ frase: 0, afirmacion: 1, motivo: 'valor-distinto' }]);
});

test('la diferencia real solo se afirma con el IC fuera del cero; el extremo justo en el cero tampoco alcanza', () => {
  const a = almacen();
  a.experimentos.borde = { comparacion: { costoNoche: comparacion('costoNoche', 5, [0, 10]) } };
  const af: Afirmacion = { valor: 5, unidad: 'ARS', decimales: 0, fuente: { tipo: 'experimento', id: 'borde', kpi: 'costoNoche', campo: 'diferencia' }, sentido: 'sube', diferenciaReal: true };
  assert.equal(verificarAfirmacion(af, a), 'diferencia-no-real');
  assert.equal(verificarAfirmacion({ ...af, diferenciaReal: false }, a), null, 'sin afirmar que es real, la cifra se sostiene');
  a.experimentos.borde.comparacion!.costoNoche = comparacion('costoNoche', 5, [0.001, 10]);
  assert.equal(verificarAfirmacion(af, a), null);
});

test('una cifra con sentido puede venir como magnitud; con sentido «igual» la fuente tiene que redondear a cero', () => {
  const a = almacen();
  a.experimentos.casiCero = { comparacion: { costoNoche: comparacion('costoNoche', 0.04, [-3, 3]) } };
  const af = (valor: number, sentido: 'sube' | 'baja' | 'igual'): Afirmacion =>
    ({ valor, unidad: 'ARS', decimales: 1, fuente: { tipo: 'experimento', id: 'casiCero', kpi: 'costoNoche', campo: 'diferencia' }, sentido });
  assert.equal(verificarAfirmacion(af(0, 'igual'), a), null, '0,04 con un decimal es 0,0: igual');
  assert.equal(verificarAfirmacion(af(0, 'sube'), a), 'signo-invertido', 'no se puede decir que sube algo que redondea a cero');
});

// ----------------------------------------------------------------------------------------- cifras sueltas en frases del explicador

test('las frases del propio explicador no pueden llevar una cifra suelta: cada número y cada hora de `vars` necesita su afirmación', () => {
  const a = almacen();
  const t = a.trazas.noche;
  // tramo 2 de la traza: la fila del primer paquete; su duración se afirma bien
  const min = Math.round(((t.tramos.t1[2] - t.tramos.t0[2]) / 60000) * 10) / 10;
  const respaldada: Frase = {
    clave: 'explicacion.paso.acumulacion', vars: { min },
    afirmaciones: [{ valor: min, unidad: 'min', decimales: 1, fuente: { tipo: 'traza', tramo: 2, campo: 'duracion' } }],
  };
  assert.deepEqual(verificarFrases([respaldada], a, 'noche').fallas, []);
  assert.deepEqual(cifrasSinRespaldo(respaldada), []);

  const suelta: Frase = { ...respaldada, vars: { min: min + 1 } };
  assert.deepEqual(cifrasSinRespaldo(suelta), ['min']);
  assert.deepEqual(verificarFrases([suelta], a, 'noche').fallas, [{ frase: 0, afirmacion: -1, motivo: 'sin-fuente' }]);

  const sinNada: Frase = { clave: 'explicacion.causa.fila', vars: { espera: 12.3 }, afirmaciones: [] };
  assert.deepEqual(verificarFrases([sinNada], a, 'noche').fallas, [{ frase: 0, afirmacion: -1, motivo: 'sin-fuente' }]);

  // una hora «HH:MM» suelta se rechaza; con la afirmación de unidad `hora` del mismo minuto se acepta
  const t0 = t.tramos.t0[0];
  const hhmm = `${String(Math.floor(t0 / 3600000) % 24).padStart(2, '0')}:${String(Math.floor(t0 / 60000) % 60).padStart(2, '0')}`;
  const horaSuelta: Frase = { clave: 'explicacion.paso.descarga', vars: { camion: 'T01', anden: 'A1', hora: hhmm }, afirmaciones: [] };
  assert.deepEqual(cifrasSinRespaldo(horaSuelta), ['hora']);
  const horaRespaldada: Frase = {
    ...horaSuelta, afirmaciones: [{ valor: Math.floor(t0 / 60000), unidad: 'hora', decimales: 0, fuente: { tipo: 'traza', tramo: 0, campo: 't0' } }],
  };
  assert.deepEqual(cifrasSinRespaldo(horaRespaldada), []);
  assert.deepEqual(verificarFrases([horaRespaldada], a, 'noche').fallas, []);

  // las frases de otros paquetes (otro prefijo) no llevan ese control extra
  assert.equal(esFraseControlada('explicacion.paso.vuelta'), true);
  assert.equal(esFraseControlada('explicacion.causa.pausa'), true);
  assert.equal(esFraseControlada('explicacion.titulo.paquete'), true);
  assert.equal(esFraseControlada('experimentos.semaforo.ok'), false);
  assert.deepEqual(verificarFrases([{ clave: 'experimentos.semaforo.ok', vars: { n: 40 }, afirmaciones: [] }], a, 'noche').fallas, []);
});

test('entradas raras no tiran el verificador: lista vacía, traza que no existe, almacén sin experimentos', () => {
  const a = almacen();
  assert.deepEqual(verificarFrases([], a), { ok: true, fallas: [] });
  const sobre = { valor: 5, unidad: 'min', decimales: 0, fuente: { tipo: 'traza', tramo: 0, campo: 'duracion' } } as const;
  assert.equal(verificarAfirmacion(sobre, a, 'otra-noche'), 'fuente-inexistente');
  assert.equal(verificarAfirmacion(sobre, { ...a, trazas: {} }), 'fuente-inexistente');
  assert.equal(verificarAfirmacion(sobre, { ...a, trazas: { x: a.trazas.noche, y: a.trazas.noche } }), 'fuente-inexistente', 'con dos trazas y sin elegir, no adivina');
  assert.throws(() => verificarFrases('no es una lista' as unknown as Frase[], a), /se esperaba una lista de frases/);
  // el id del experimento no puede ser un nombre heredado del prototipo
  const proto: Afirmacion = { valor: 1, unidad: 'min', decimales: 0, fuente: { tipo: 'experimento', id: 'constructor', kpi: 'esperaP90Min', campo: 'media' } };
  assert.equal(verificarAfirmacion(proto, a), 'fuente-inexistente');
});
