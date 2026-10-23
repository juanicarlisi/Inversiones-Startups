// integracion/pruebas/plano.test.ts · Andén simulador, corte 1 · Integración (decisión sobre app/NOTAS-CONTRATO.md §13.2).
// Mientras se simula la primera noche, la interfaz (P8, app/ui/plano.ts) dibuja el PLANO del hub con una traza sin tramos, momentos ni
// paquetes (n = 0) y la geometría real del hub (P4). Ningún contrato le promete a P8 que la escena (P6) acepte esa traza: la integración
// lo fija acá, con las piezas reales de los tres paquetes y las dos plantillas publicadas, en los dos pisos y los dos temas:
//   - el reproductor de la escena acepta la traza vacía y no muestra ninguna entidad (no hay paquetes ni personas que inventar);
//   - los recursos del plano son finitos y sin carga (rampas vacías, lazo en marcha, fila 0);
//   - las dos vistas componen el fondo completo (lazo, rampas, andenes…) con coordenadas finitas y la capa móvil sin entidades;
//   - tocar el plano nunca devuelve un paquete, una persona ni un camión (solo lugares fijos, si acaso).
// Si un día P6 deja de aceptarla, la interfaz no se rompe (crearPlano devuelve null y no dibuja nada), pero el plano desaparecería en
// silencio: esta prueba lo dice antes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ModeloValidado } from '../../contratos/modelo.ts';
import { ClaseEntidad } from '../../contratos/traza.ts';
import type { Piso } from '../../contratos/vistas.ts';
import { crearPlano, REPLICA_PLANO, trazaDelPlano } from '../../app/ui/plano.ts';
import {
  componer2d, componerIso, crearReproductor, encuadrar, esReproductorEscena, estilos, type Primitiva,
} from '../../escena/indice.ts';
import { geometria } from '../../hub/indice.ts';
import { ensamblar } from '../ensamblar.ts';

const E = ensamblar();
const MARCO = { ancho: 1280, alto: 800 };
const PLANTILLAS = ['hub-chico@1.0.0', 'hub-lazo-noche@1.0.0'] as const;

async function compilada(clave: string): Promise<ModeloValidado> {
  const c = await E.compilar(E.plantillas[clave]);
  if (!c.ok) throw new Error(`${clave} no compila: se esperaba una plantilla publicada válida`);
  return c.mv;
}

/** Índices de las primitivas con alguna coordenada no finita. */
function noFinitas(ps: Primitiva[]): string[] {
  const malos: string[] = [];
  ps.forEach((p, i) => {
    const nums: number[] = [];
    if (p.tipo === 'poligono' || p.tipo === 'linea') nums.push(...p.pts);
    else if (p.tipo === 'rect') nums.push(p.x, p.y, p.w, p.h);
    else if (p.tipo === 'circulo') nums.push(p.x, p.y, p.r);
    else if (p.tipo === 'glifo') nums.push(p.x, p.y, p.tam, p.ang);
    else if (p.tipo === 'sprite') nums.push(p.x, p.y, p.respaldo.x, p.respaldo.y);
    else nums.push(p.x, p.y, p.tam);
    if (nums.some((v) => !Number.isFinite(v))) malos.push(`${i} (${p.tipo})`);
  });
  return malos;
}

for (const clave of PLANTILLAS) {
  test(`plano · ${clave}: la escena real acepta la traza vacía del plano y dibuja el hub sin inventar entidades`, async () => {
    const mv = await compilada(clave);
    const g = geometria(mv.modelo);
    const traza = trazaDelPlano(mv, g);
    assert.equal(traza.replica, REPLICA_PLANO, 'la traza del plano no es ninguna de las noches');
    assert.deepEqual([traza.tramos.n, traza.momentos.n, traza.paquetes.n], [0, 0, 0], 'el plano no tiene tramos, momentos ni paquetes');

    // La misma función que usa la interfaz: con la escena real tiene que dar un reproductor (null = el plano no se dibujaría).
    const rep = crearPlano(() => g, crearReproductor, mv)();
    assert.ok(rep !== null, `${clave}: la escena rechazó la traza del plano (crearPlano devolvió null): la interfaz mostraría un rectángulo vacío`);
    assert.ok(esReproductorEscena(rep), 'el reproductor del plano es el de la escena');

    const pos = rep.crearPosiciones(), rec = rep.crearEstadoRecursos();
    const rampas = mv.modelo.hub.rampas.length;
    for (const t of [traza.inicio, traza.corte, traza.fin, Math.round((traza.inicio + traza.fin) / 2)]) {
      rep.posiciones(t, pos);
      assert.equal(pos.n, 0, `${clave} t=${t}: el plano no tiene paquetes, personas ni camiones y la escena mostró ${pos.n} entidades`);
      rep.recursos(t, rec);
      assert.ok(Number.isFinite(rec.pasoLazo), `${clave} t=${t}: paso del lazo no finito (${rec.pasoLazo})`);
      assert.equal(rec.lazoDetenido, false, `${clave} t=${t}: sin tramos no hay paradas del lazo`);
      assert.equal(rec.filaAcumulacion, 0, `${clave} t=${t}: la fila del plano tiene que estar vacía`);
      assert.equal(rec.rampaOcupacion.length, rampas, `${clave}: una ocupación por rampa del modelo`);
      assert.ok([...rec.rampaOcupacion].every((x) => x === 0) && [...rec.rampaLlena].every((x) => x === 0),
        `${clave} t=${t}: las rampas del plano tienen que estar vacías`);
      // Los lugares fijos (rampas, puestos) se pueden tocar; una entidad móvil no, porque el plano no tiene ninguna. (La interfaz además
      // no atiende toques sobre el plano: app/ui/lienzo.ts.)
      for (const [x, y] of [[0, 0], [g.lazo.recta / 2, 0], [g.limites.xmin, g.limites.ymin], [g.limites.xmax, g.limites.ymax]]) {
        const tocado = rep.tocar(x, y, t, 50);
        assert.ok(tocado === null || (tocado.clase !== ClaseEntidad.PAQUETE && tocado.clase !== ClaseEntidad.PERSONA &&
          tocado.clase !== ClaseEntidad.CAMION), `${clave} t=${t}: tocar el plano en (${x}, ${y}) dio una entidad móvil (${JSON.stringify(tocado)})`);
      }
    }

    for (const piso of ['2d', 'iso'] as Piso[]) {
      for (const estilo of [estilos.claro, estilos.oscuro]) {
        const camara = encuadrar(rep.disposicion.limites, MARCO, piso);
        const base = { rep, t: traza.inicio, marco: MARCO, camara, estilo };
        const componer = piso === '2d' ? componer2d : componerIso;
        const fondo = componer({ ...base, capa: 'fondo' });
        const movil = componer({ ...base, capa: 'movil' });
        const donde = `${clave} ${piso} ${estilo.tema}`;
        assert.ok(fondo.length > rampas, `${donde}: el fondo del plano tiene que dibujar el hub (lazo, ${rampas} rampas, andenes…) y tuvo ${fondo.length} primitivas`);
        assert.deepEqual(noFinitas(fondo), [], `${donde}: primitivas del fondo con coordenadas no finitas`);
        assert.deepEqual(noFinitas(movil), [], `${donde}: primitivas de la capa móvil con coordenadas no finitas`);
        assert.equal(movil.filter((p) => p.tipo === 'sprite').length, 0, `${donde}: sin entidades no puede haber sprites de entidades`);
      }
    }
  });
}
