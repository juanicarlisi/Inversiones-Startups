// escena/pruebas/entrega.test.ts · P6. La entrega de `escena/indice.ts` (corte-1.md §9 P6), usada como la va a usar la interfaz: con los
// tipos del contrato y de punta a punta sobre la traza de la maqueta (reproductor → vista → momentos → riesgo → piso).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trazaDeMaqueta } from '../../contratos/fixtures/traza-maqueta.ts';
import type { AgregarRiesgo, CrearReproductor, CrearVista, DetectarMomentos, ElegirPiso, Estilo } from '../../contratos/vistas.ts';
import * as escena from '../indice.ts';
import { lienzoFalso, resultado } from './ayudas.ts';

test('la entrega tiene todo lo que pide §9 P6, con los tipos del contrato', () => {
  const contrato: {
    crearReproductor: CrearReproductor; crearVista: CrearVista; elegirPiso: ElegirPiso; agregarRiesgo: AgregarRiesgo;
    detectarMomentos: DetectarMomentos; estilos: { claro: Estilo; oscuro: Estilo };
  } = escena;
  for (const f of ['crearReproductor', 'crearVista', 'elegirPiso', 'agregarRiesgo', 'detectarMomentos'] as const) {
    assert.equal(typeof contrato[f], 'function', `falta ${f}`);
  }
  assert.equal(typeof escena.componer2d, 'function');
  assert.equal(typeof escena.componerIso, 'function');
  assert.equal(escena.estilos.claro.tema, 'claro');
  assert.equal(escena.estilos.oscuro.tema, 'oscuro');
});

test('de punta a punta con la maqueta: película en las dos vistas, marcas de la línea de tiempo, cien noches y piso elegido', () => {
  const tr = trazaDeMaqueta(2);
  const rep = escena.crearReproductor(tr);
  const t = rep.inicio + (rep.fin - rep.inicio) / 3;
  for (const piso of ['2d', 'iso'] as const) {
    for (const estilo of [escena.estilos.claro, escena.estilos.oscuro]) {
      const l = lienzoFalso(360, 740);
      const v = escena.crearVistaCon(l as unknown as HTMLCanvasElement, rep, estilo, piso, { crearLienzo: null, reloj: () => 0 });
      v.redimensionar(360, 740, 2);
      v.dibujar(t, { seleccion: null, riesgo: null, fantasma: null });
      assert.equal(l.ctx.noFinitos, 0, `${piso} ${estilo.tema}: coordenadas inválidas en el lienzo`);
      assert.ok((l.ctx.llamadas.fill ?? 0) > 50, `${piso} ${estilo.tema}: se esperaba un cuadro con contenido`);
      const [x, y] = v.aMundo(180, 370);
      assert.ok(Number.isFinite(x) && Number.isFinite(y));
    }
  }
  const marcas = escena.detectarMomentos(tr);
  assert.ok(marcas.length > 0);
  const noches = Array.from({ length: 30 }, (_, i) => resultado(i, { kpi: { finClasificacionMin: 300 + i }, minutosLlena: new Array(tr.geometria.rampas.length).fill(i % 3) }));
  const riesgo = escena.agregarRiesgo(noches, 'finClasificacionMin');
  assert.equal(riesgo.rampaProbLlena.length, tr.geometria.rampas.length);
  assert.equal(riesgo.nocheMediana, 15);
  assert.equal(riesgo.nochePeor, 29);
  const l = lienzoFalso(1280, 800);
  const v = escena.crearVistaCon(l as unknown as HTMLCanvasElement, rep, escena.estilos.claro, 'iso', { crearLienzo: null });
  v.dibujar(t, { riesgo });
  let reloj = 0;
  assert.equal(escena.elegirPiso(escena.medidorDeCuadro(v, t, () => (reloj += 2))), 'iso', 'cuadros de 2 ms → 2,5D');
});
