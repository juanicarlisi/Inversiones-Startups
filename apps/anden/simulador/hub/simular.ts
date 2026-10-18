// hub/simular.ts · Andén simulador, corte 1 · P4 (el hub).
// Una noche del hub: arma el motor (con la traza que se pidió), registra los bloques en un orden fijo (es parte de la huella), agenda
// los eventos iniciales en un orden fijo, corre, finaliza y devuelve { resultado, traza? } (contratos/experimentos.ts, Simulador).
// El motor se inyecta (corte-1.md §1.5): las pruebas pasan crearMotorReferencia y la integración el núcleo de producción.
// `armarNoche` queda exportada para la prueba R06 de la integración (foto a mitad de la noche y restauración en un motor nuevo).
import type { CrearMotor, Motor, OpcionesMotor, ResultadoCorrida } from '../contratos/motor.ts';
import type { ModeloValidado } from '../contratos/modelo.ts';
import type { SalidaSimulacion } from '../contratos/experimentos.ts';
import type { SimularNoche } from '../contratos/hub.ts';
import { TipoMomento, type NivelTraza, type Traza } from '../contratos/traza.ts';
import { compilarConfig, horizonteMs, type Fidelidad } from './config.ts';
import type { Hub } from './bloques/comun.ts';
import { Paquetes } from './bloques/paquetes.ts';
import { BloqueDemanda } from './bloques/demanda.ts';
import { BloquePersonas } from './bloques/personas.ts';
import { BloqueAndenes } from './bloques/andenes.ts';
import { BloqueAcumulacion } from './bloques/acumulacion.ts';
import { BloqueInduccion } from './bloques/induccion.ts';
import { BloqueSorter } from './bloques/sorter.ts';
import { BloqueLazoF2 } from './bloques/lazo-f2.ts';
import { BloqueRampas } from './bloques/rampas.ts';
import { BloqueExcepcion } from './bloques/excepcion.ts';
import { BloqueMedicion } from './bloques/medicion.ts';
import { alertasDe, calcularResultado, ordenarAlertas, trazaEncadenada } from './kpi.ts';
import { geometria } from './geometria.ts';

/** Opciones del motor para una noche: horizonte = fin del turno + 8 h (§6.7 regla 1). */
export function opcionesNoche(mv: ModeloValidado, semilla: number, replica: number, traza: NivelTraza): OpcionesMotor {
  return { semilla, replica, hasta: horizonteMs(mv.modelo), traza };
}

export interface NocheArmada {
  /** El hub con sus bloques (para pruebas e instrumentación: no forma parte del contrato). */
  readonly hub: Hub;
  /** Finaliza los bloques y arma la salida (KPI, alertas y, con traza completa, la traza). Llamar una sola vez. */
  cerrar(rc: ResultadoCorrida): SalidaSimulacion;
}

/** Orden de registro de los bloques (README §1). */
export const ORDEN_BLOQUES = [
  'demanda', 'personas', 'hub.andenes', 'hub.acumulacion', 'hub.induccion', 'hub.sorter', 'hub.rampas', 'hub.excepcion', 'hub.medicion',
] as const;

/** Arma una noche sobre un motor recién creado: compila la configuración, crea y registra los bloques y agenda los eventos iniciales. */
export function armarNoche(m: Motor, mv: ModeloValidado, fidelidad: Fidelidad = 'F3'): NocheArmada {
  const cfg = compilarConfig(mv.modelo, fidelidad);
  const h = { cfg, m, tUltimo: 0 } as Hub;
  h.terminado = () => h.demanda.S.descargados === cfg.nCam && h.P.S.enJaula === h.P.S.nacidos;
  h.demanda = new BloqueDemanda(h);
  h.P = new Paquetes(h, h.demanda.totalPaquetes());
  h.personas = new BloquePersonas(h);
  h.andenes = new BloqueAndenes(h);
  h.acum = new BloqueAcumulacion(h);
  h.ind = new BloqueInduccion(h);
  h.sorter = fidelidad === 'F3' ? new BloqueSorter(h) : new BloqueLazoF2(h);
  h.rampas = new BloqueRampas(h);
  h.exc = new BloqueExcepcion(h);
  h.medicion = new BloqueMedicion(h);
  const bloques = [h.demanda, h.personas, h.andenes, h.acum, h.ind, h.sorter, h.rampas, h.exc, h.medicion];
  for (const b of bloques) b.id = m.registrar(b);
  // Eventos iniciales, en este orden (decide los seq): inicio del turno, apertura de andenes, camiones, pausas, paradas, medición y corte.
  h.personas.agendarInicial();
  h.andenes.agendarInicial();
  h.demanda.agendarInicial();
  h.ind.agendarInicial();
  h.rampas.agendarInicial();
  h.sorter.agendarInicial();
  h.medicion.agendarInicial();

  let cerrada = false;
  return {
    hub: h,
    cerrar(rc: ResultadoCorrida): SalidaSimulacion {
      if (cerrada) throw new Error('armarNoche: la noche ya se cerró (cerrar() se llama una sola vez).');
      cerrada = true;
      m.finalizar();
      const alertas = alertasDe(h, rc);
      let traza: Traza | undefined;
      if (m.traza.nivel === 'completa') {
        const P = h.P.S;
        if (P.maxListo >= 0) {
          let ultimo = 0;
          for (let e = 0; e < P.nacidos; e++) if (P.listo[e] === P.maxListo) { ultimo = e; break; }
          m.traza.momento(P.maxListo, TipoMomento.ULTIMO_CLASIFICADO, ultimo, 0);
        }
        let primera = cfg.inicio;
        for (let c = 0; c < cfg.nCam; c++) if (h.demanda.S.llegada[c] < primera) primera = h.demanda.S.llegada[c];
        traza = m.traza.terminar({
          modelo: mv.huella, semilla: m.opciones.semilla, replica: m.opciones.replica, tickLazo: cfg.tick, bandejas: cfg.T,
          inicio: primera, fin: Math.max(cfg.fin, h.tUltimo, P.maxListo), corte: cfg.corte, catalogo: cfg.catalogo,
          geometria: geometria(mv.modelo), huella: rc.huella,
        });
        // Control independiente sobre la traza escrita (además del que hace el almacén de paquetes al escribirla).
        if (!trazaEncadenada(traza) && !alertas.includes('invariante:tiempo')) alertas.push('invariante:tiempo');
      }
      ordenarAlertas(alertas);
      const resultado = calcularResultado(h, rc, mv.huella, m.opciones.semilla, m.opciones.replica, alertas);
      return traza ? { resultado, traza } : { resultado };
    },
  };
}

/** Simulador de una noche con la fidelidad pedida (F3 por defecto). */
export function crearSimularNocheCon(crearMotor: CrearMotor, fidelidad: Fidelidad): SimularNoche {
  return (mv, semilla, replica, o) => {
    const m = crearMotor(opcionesNoche(mv, semilla, replica, o.traza));
    const noche = armarNoche(m, mv, fidelidad);
    return noche.cerrar(m.correr());
  };
}

/** Una noche del hub en F3 (mecanismo completo). */
export function crearSimularNoche(crearMotor: CrearMotor): SimularNoche {
  return crearSimularNocheCon(crearMotor, 'F3');
}
