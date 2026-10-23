// app/ui/plano.ts · Andén simulador, corte 1 · P8 (interfaz).
// El plano del hub mientras se simula la primera noche: una traza SIN tramos, momentos ni paquetes, con la geometría del modelo
// (servicios.geometria) y su calendario. No es un instante simulado: no hay paquetes ni personas, solo el lugar (andenes, cintas,
// acumulación, lazo, puestos y rampas). La escena y las miniaturas lo dibujan con el mismo reproductor y la misma vista que la película,
// tapado por «Simulando la noche…», hasta que llega la noche de verdad: así, al abrir un enlace, lo primero que se ve es el hub y no
// un rectángulo vacío (integracion/NOTAS-CONTRATO.md §8: la noche entera tarda ≈ 1,2 s en llegar).
import type { ModeloValidado } from '../../contratos/modelo.ts';
import type { GeometriaHub } from '../../contratos/geometria.ts';
import type { Traza } from '../../contratos/traza.ts';
import type { CrearReproductor, Reproductor } from '../../contratos/vistas.ts';
import { aMs, horaASeg } from '../../contratos/tipos-base.ts';

/** Réplica con que se marca la traza del plano: no es ninguna de las noches (que van de 0 a N − 1). */
export const REPLICA_PLANO = -1;

/** La traza vacía del plano del hub: columnas de largo 0, catálogo con los nombres del modelo y sin personas ni camiones. */
export function trazaDelPlano(mv: ModeloValidado, geometria: GeometriaHub): Traza {
  const m = mv.modelo, s = m.hub.sorter, cal = m.calendario;
  return {
    version: 1, modelo: mv.huella, semilla: m.experimento.semilla, replica: REPLICA_PLANO,
    tickLazo: aMs(s.paso / s.velocidad), bandejas: geometria.lazo.bandejas,
    inicio: aMs(horaASeg(cal.inicio)), fin: aMs(horaASeg(cal.fin)), corte: aMs(horaASeg(cal.corte)),
    tramos: { n: 0, e: new Int32Array(0), k: new Uint8Array(0), r: new Int32Array(0), a: new Int32Array(0), t0: new Float64Array(0),
      t1: new Float64Array(0), c: new Uint8Array(0), q: new Int32Array(0) },
    momentos: { n: 0, t: new Float64Array(0), tipo: new Uint8Array(0), r: new Int32Array(0), v: new Float64Array(0) },
    paquetes: { n: 0, camion: new Int32Array(0), indice: new Int32Array(0), ruta: new Int16Array(0), clase: new Uint8Array(0),
      creado: new Float64Array(0), listo: new Float64Array(0), vueltas: new Uint8Array(0) },
    catalogo: {
      personas: [], camiones: [],
      rutas: m.hub.planClasificacion.rutas.map((r) => r.id), rampas: m.hub.rampas.map((r) => r.id),
      puestos: m.hub.induccion.puestos.map((p) => p.id), andenes: m.hub.andenes.map((a) => a.id),
    },
    geometria, huella: '',
  };
}

/**
 * El reproductor del plano, o null si no se puede armar (un reproductor que no acepta una traza vacía, una geometría que lanza): el
 * plano es una ayuda mientras se espera, nunca un error. Se arma una sola vez por llamada a la función que devuelve.
 */
export function crearPlano(geometria: () => GeometriaHub, crearReproductor: CrearReproductor, mv: ModeloValidado): () => Reproductor | null {
  let plano: Reproductor | null | undefined;
  return () => {
    if (plano === undefined) {
      try { plano = crearReproductor(trazaDelPlano(mv, geometria())); } catch { plano = null; }
    }
    return plano;
  };
}
