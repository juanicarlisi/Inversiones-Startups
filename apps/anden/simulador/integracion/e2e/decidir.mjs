// integracion/e2e/decidir.mjs · Andén simulador, corte 1 · Integración (corte-1.md §10.8 y diseño maestro §5.4–§5.5).
// Decidir: la pregunta del modelo → la tabla por opción (probabilidad de cumplir con su intervalo, estado, costo) → la recomendación con
// su semáforo → el formulario por decisión, contestando cada pregunta con un dato propio (un dato fuera del rango de validez se rechaza
// sin tocar el modelo) hasta «Ya está» (lo que falta no cambia la respuesta, o la cambiaría por menos que la zona de indiferencia).
// Con hub-chico@1.0.0 tal cual ninguna opción cumple (lo dice la app: «ninguna cumple»); el recorrido abre la plantilla chica con los
// datos de un hub propio (comun.mjs: PARCHE_DECIDIR), sin tocar la plantilla publicada.
import { abrirPestana } from './comun.mjs';

const MAX_PREGUNTAS = 5;

export async function decidir({ contexto, base, etiqueta, prep, fallar, ok, guardar }) {
  const h = await abrirPestana(contexto, { fallar, etiqueta });
  const { page } = h;
  const datos = { preguntas: [] };
  await page.goto(`${base}?depuracion=1#${prep.decidir}`);
  await h.pantalla('escena', 60_000);
  const t0 = Date.now();
  await h.clic('ir-decidir');
  // la recomendación con su semáforo sale apenas termina la evaluación; el formulario (el tamizado) sigue debajo, con su progreso
  await page.waitForSelector('[data-recomendacion]', { timeout: 300_000 });
  datos.recomendacionS = Number(((Date.now() - t0) / 1000).toFixed(1));
  await h.pantalla('decidir', 300_000);
  datos.primeraRespuestaS = Number(((Date.now() - t0) / 1000).toFixed(1));
  const leerTabla = () => page.$$eval('[data-tabla="decision"] tbody tr', (xs) => xs.map((x) => x.textContent));
  const filas = await leerTabla();
  if (filas.length !== 4) fallar(`${etiqueta} · decidir: la tabla tiene ${filas.length} opciones (se esperaban 4: de 2 a 5 puestos)`);
  const recomendacion = await page.getAttribute('[data-recomendacion]', 'data-recomendacion');
  const semaforo = await page.$eval('.decidir__recomendacion .semaforo', (x) => x.className).catch(() => null);
  if (!semaforo) fallar(`${etiqueta} · decidir: la recomendación no tiene semáforo`);
  datos.recomendacion = recomendacion; datos.semaforo = semaforo?.replace('semaforo semaforo--', '');
  if (recomendacion === 'ninguna') fallar(`${etiqueta} · decidir: sin recomendación (se esperaba un valor con el hub del recorrido)`);
  await h.sinDesborde('decidir');
  await guardar('decidir-formulario', page, { completa: true, altoMax: 2600 });
  for (let i = 0; i < MAX_PREGUNTAS; i++) {
    const p = await page.$('[data-pregunta]');
    if (!p) break;
    const param = await p.getAttribute('data-pregunta');
    const campo = `[data-accion="respuesta-${param}"]`;
    if (i === 0) {
      // un dato fuera del rango de validez se rechaza en el formulario, sin tocar el modelo
      await page.fill(campo, '999999');
      await page.click(`[data-accion="usar-${param}"]`);
      const msj = await page.textContent(`[data-pregunta="${param}"] .campo__error`);
      if (!/entre/.test(msj ?? '')) fallar(`${etiqueta} · decidir: un dato fuera de rango no se rechazó (mensaje «${msj}»)`);
    }
    // el dato propio: el valor de referencia que muestra la pregunta (como si alguien lo hubiera medido igual)
    const valor = await page.getAttribute(campo, 'placeholder');
    await page.fill(campo, valor);
    const tp = Date.now();
    await page.click(`[data-accion="usar-${param}"]`);
    await page.waitForFunction((x) => !document.querySelector(`[data-pregunta="${x}"]`)
      && document.querySelector('section[data-pantalla="decidir"]')?.getAttribute('data-listo') === '1', param, { timeout: 300_000 });
    datos.preguntas.push({ parametro: param, valor, recalculoS: Number(((Date.now() - tp) / 1000).toFixed(1)) });
  }
  const listo = await page.textContent('[data-formulario="listo"]').catch(() => null);
  datos.cierre = listo;
  // dos cierres honestos con recomendación: nada de lo que falta la cambia, o algo la cambiaría pero cuesta menos que la zona de
  // indiferencia (hallazgo EST-08); los dos empiezan con «Ya está:»
  const cierres = ['Ya está: lo que falta no cambia la respuesta.', /^Ya está: algún dato que falta podría mover la recomendación, pero equivocarse costaría menos que la zona de indiferencia del modelo \(.+\), así que no vale la pena preguntarlo\.$/];
  if (!cierres.some((c) => (typeof c === 'string' ? listo === c : c.test(listo ?? '')))) {
    fallar(`${etiqueta} · decidir: el formulario terminó en «${listo}» (se esperaba «Ya está: lo que falta no cambia la respuesta.» o el cierre por la zona de indiferencia; preguntas: ${datos.preguntas.map((x) => x.parametro).join(', ')})`);
  }
  datos.recomendacionFinal = await page.getAttribute('[data-recomendacion]', 'data-recomendacion');
  datos.tusDatos = (await page.textContent('.decidir__dadas').catch(() => ''))?.trim();
  await h.sinDesborde('decidir (ya está)');
  await guardar('decidir-ya-esta', page, { completa: true, altoMax: 2000 });
  ok(`${etiqueta} · decidir: recomendación ${datos.recomendacion} (${datos.semaforo}) a los ${datos.recomendacionS} s, formulario a los ${datos.primeraRespuestaS} s; ${datos.preguntas.length} preguntas ` +
    `(${datos.preguntas.map((x) => `${x.parametro} = ${x.valor}, ${x.recalculoS} s`).join('; ')}) → «${listo}» con ${datos.recomendacionFinal}`);
  const faltan = await h.faltantes();
  if (faltan.length) fallar(`${etiqueta} · decidir: claves de texto faltantes: ${faltan.join(', ')}`);
  await page.close();
  return { datos, errores: h.errores };
}
