// app/servicios-falsos.ts · Andén simulador, corte 1 · P8 (interfaz) · SOLO PARA DESARROLLO Y PRUEBAS DE LA INTERFAZ.
// Implementa Servicios (contratos/servicios.ts) sin importar ningún otro paquete: la noche con traza sale de la maqueta medida
// (contratos/fixtures, vía falsos/maqueta.ts, como trazaDeMaqueta pero con los parámetros del modelo), las cien noches son sintéticas
// alrededor de esa noche (con la misma suerte para A y B), y la estadística, la decisión, el tamizado, las biografías y el resto son
// versiones chicas en falsos/. Es lo que usan entrada-falsa.ts (para desarrollar en el navegador) y pruebas/humo.mjs. La integración
// llama a arrancar() con los servicios reales (integracion/puente.ts).
//
// Simula también lo que la interfaz tiene que manejar bien: trabajos asíncronos con progreso, prioridades y cancelación
// (`cancelarDesde` rechaza lo cancelado con un error llamado ErrorCancelado, como experimentos/), y una estadística que lanza si se le
// pide un intervalo con una sola noche.
import type { Servicios } from '../contratos/servicios.ts';
import type { ModeloValidado, Modelo } from '../contratos/modelo.ts';
import type { Prioridad, SalidaSimulacion } from '../contratos/experimentos.ts';
import type { ResultadoReplica } from '../contratos/resultados.ts';
import type { Traza } from '../contratos/traza.ts';
import { ClaseEntidad } from '../contratos/traza.ts';
import type { ExtrasServicios, ServiciosApp } from './extras.ts';
import { semaforoLocal } from './extras.ts';
import { aplicarParche, anonimizarFalso, compilarFalso, crearCodecFalso, crearVarianteFalsa } from './falsos/modelo.ts';
import { geometriaDeModelo, nocheDeMaqueta, parametrosDeModelo, type NocheFalsa } from './falsos/maqueta.ts';
import {
  agregarRiesgoFalso, compararFalso, comprobanteFalso, evaluacionSintetica, formularioSintetico, nocheSintetica, proporcionFalsa,
  resumirFalso, tamizadoSintetico,
} from './falsos/estadistica.ts';
import { biografiaFalsa, buscarPaquete, causasFalsas, detectarMomentosFalso, verificarFalso } from './falsos/explicacion.ts';
import { crearReproductorFalso, crearVistaFalsa, elegirPisoFalso } from './falsos/vista.ts';
import { plantillasFalsas } from './falsos/plantillas.ts';
import { ESTILOS_RESPALDO } from './ui/paleta.ts';

/** El error con que se rechaza un trabajo cancelado (mismo nombre que el de experimentos/). */
export class ErrorCancelado extends Error {
  override name = 'ErrorCancelado';
}

export interface OpcionesFalsas {
  /** Pausa entre tandas de trabajo, en ms (para ver el progreso). Por defecto 12. */
  retardo?: number;
  /** Versión del motor que dicen los servicios. Por defecto '1.0.0'. */
  versionMotor?: string;
}

const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Rutas de cada rampa, en el orden del modelo (la que contiene a la rampa en el plan de clasificación). */
function rutasPorRampa(m: Modelo): string[] {
  return m.hub.rampas.map((r) => m.hub.planClasificacion.rutas.find((x) => x.rampas.includes(r.id))?.id ?? '—');
}

export function crearServiciosFalsos(o: OpcionesFalsas = {}): ServiciosApp {
  const retardo = o.retardo ?? 12, version = o.versionMotor ?? '1.0.0';
  const plantillas = plantillasFalsas();
  const compilar = compilarFalso;
  const variante = crearVarianteFalsa(compilar);
  const codec = crearCodecFalso((id, v) => plantillas[`${id}@${v}`] ?? null, compilar);
  // cancelación: cada prioridad tiene una generación; cancelarDesde(p) sube las de p en adelante
  const generacion = [0, 0, 0, 0, 0];
  const vigente = (p: Prioridad) => { const g = generacion[p]; return () => { if (generacion[p] !== g) throw new ErrorCancelado('cancelado'); }; };
  // noches de la maqueta, recordadas por (modelo, semilla, réplica): son caras (0,1–0,4 s)
  const memo = new Map<string, NocheFalsa>();
  const nocheMaqueta = (mv: ModeloValidado, semilla: number, replica: number): NocheFalsa => {
    const clave = `${mv.huella}|${semilla}|${replica}`;
    let x = memo.get(clave);
    if (!x) {
      x = nocheDeMaqueta(parametrosDeModelo(mv.modelo), { semilla, replica, modelo: mv.huella, rutas: rutasPorRampa(mv.modelo) });
      if (memo.size > 12) memo.delete(memo.keys().next().value as string);
      memo.set(clave, x);
    }
    return x;
  };
  const trazas = new Map<string, Traza>();

  const servicios: Servicios & ExtrasServicios = {
    versionMotor: version,
    trabajadores: 1,
    plantillas,
    compilar,
    variante,
    codec,
    anonimizar: anonimizarFalso,
    geometria: geometriaDeModelo,
    planBalanceado: () => [{ op: 'replace', path: '/personas/rampa/asignacion', value: 'por-volumen' }],
    async noche(mv, semilla, replica, prioridad): Promise<SalidaSimulacion> {
      const seguir = vigente(prioridad);
      await esperar(retardo);
      seguir();
      const x = nocheMaqueta(mv, semilla, replica);
      seguir();
      trazas.set(`${mv.huella}|${semilla}|${replica}`, x.traza);
      return { resultado: x.resultado, traza: x.traza };
    },
    async noches(mv, semilla, desde, hasta, prioridad, alProgreso): Promise<ResultadoReplica[]> {
      const seguir = vigente(prioridad);
      await esperar(retardo);
      seguir();
      const base = nocheMaqueta(mv, semilla, 0).resultado;
      const out: ResultadoReplica[] = [];
      for (let r = desde; r < hasta; r++) {
        if ((r - desde) % 5 === 0) { await esperar(retardo); seguir(); }
        const x = nocheSintetica(base, mv, semilla, r);
        out.push(x);
        alProgreso?.(x);
      }
      return out;
    },
    cancelarDesde(p) { for (let q = p; q < generacion.length; q++) generacion[q]++; },
    resumir: resumirFalso,
    proporcion: proporcionFalsa,
    comparar: compararFalso,
    async evaluarDecision(mv, alProgreso) {
      const seguir = vigente(3);
      const ev = evaluacionSintetica(mv);
      const maximo = 400 * ev.configuraciones.length;
      for (let h = 0; h < ev.replicasUsadas; h += Math.max(20, Math.ceil(ev.replicasUsadas / 12))) { await esperar(retardo * 2); seguir(); alProgreso?.(h, maximo); }
      alProgreso?.(ev.replicasUsadas, maximo);
      return ev;
    },
    async tamizar(mv, alProgreso) {
      const seguir = vigente(4);
      const r = tamizadoSintetico(mv);
      const total = 1 + 2 * r.length;
      for (let h = 0; h < total; h++) { await esperar(retardo * 3); seguir(); alProgreso?.(h + 1, total); }
      return r;
    },
    formulario: formularioSintetico,
    agregarRiesgo: agregarRiesgoFalso,
    detectarMomentos: detectarMomentosFalso,
    crearReproductor: crearReproductorFalso,
    crearVista: crearVistaFalsa,
    elegirPiso: elegirPisoFalso,
    biografia: biografiaFalsa,
    async contrafactual(mv, semilla, replica, camion, indice, cambio) {
      await esperar(retardo * 4);
      const tr = trazas.get(`${mv.huella}|${semilla}|${replica}`) ?? nocheMaqueta(mv, semilla, replica).traza;
      const e = buscarPaquete(tr, camion, indice);
      const { contrafactuales } = causasFalsas(tr, mv.modelo, e);
      const mismo = contrafactuales.find((c) => c.cambio.clave === cambio.clave);
      const listo = e >= 0 && tr.paquetes.listo[e] >= 0 ? tr.paquetes.listo[e] : null;
      if (mismo) return { ...mismo, cambio };
      // un cambio sin relación con lo que le pasó al paquete no lo mueve
      return { clase: ClaseEntidad.PAQUETE, camion, indice, cambio, semilla, replica,
        antes: { listo, antesDelCorte: listo !== null && listo <= tr.corte }, despues: { listo, antesDelCorte: listo !== null && listo <= tr.corte }, confirma: false };
    },
    async causas(t, mv, camion, indice) {
      await esperar(retardo * 6);
      return causasFalsas(t, mv.modelo, buscarPaquete(t, camion, indice));
    },
    verificar: verificarFalso,
    async comprobante(mv, rs, semaforo) { return comprobanteFalso(mv, rs, semaforo, version); },
    estilos: ESTILOS_RESPALDO,
    semaforoDe: (mv, rs) => semaforoLocal(mv, rs, resumirFalso),
  };
  return servicios;
}

/** Para las pruebas: aplica un parche a un modelo con la implementación falsa (sin compilar). */
export const parchear = aplicarParche;
