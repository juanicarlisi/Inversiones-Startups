// Repositorio: la única puerta entre la app y los datos guardados.
// - Junta los cambios seguidos y los escribe una vez (demora corta), con número de revisión.
// - Avisa a las otras pestañas abiertas (BroadcastChannel) para que muestren lo último.
// - Guarda una copia automática por día (las últimas 7) para volver atrás aunque se haya cerrado la app.
// - Corte 3: un «sincronizador» opcional recibe cada documento guardado (para cifrarlo y subirlo) y entrega los
//   que llegan de otros dispositivos. Su interfaz: { publicar(doc), suscribir(fn) → desuscribir }.

import { FORMATO } from '../modelo/formato.js';
import { isoDe, hoyLocal } from '../modelo/fechas.js';

export function crearRepositorio({
  almacen,
  demora = 300,
  canal = 'telar',
  dispositivo = Math.random().toString(36).slice(2, 10),
  alEstado = () => {},
  alCambioExterno = () => {},
  sincronizador = null,
  hoy = hoyLocal,
} = {}) {
  let rev = 0;
  let pendiente = null; // { plan, meta } esperando escribirse
  let timer = null;
  let enCurso = null; // promesa de la escritura en curso
  let fallos = 0;
  let estado = 'guardado';
  const bc = typeof BroadcastChannel === 'function' ? new BroadcastChannel(canal) : null;
  const poner = (s, detalle) => {
    estado = s;
    alEstado(s, detalle);
  };

  async function recibirDeAfuera(doc) {
    if (!doc || doc.rev <= rev) return;
    rev = doc.rev;
    alCambioExterno(doc);
  }

  if (bc) {
    bc.onmessage = async (ev) => {
      if (!ev.data || ev.data.dispositivo === dispositivo || !(ev.data.rev > rev)) return;
      // Si hay cambios propios sin escribir, ganan (se escriben con una revisión mayor).
      if (pendiente) return;
      await recibirDeAfuera(await almacen.leer());
    };
  }
  const desuscribir = sincronizador ? sincronizador.suscribir((doc) => recibirDeAfuera(doc)) : null;

  async function escribir() {
    if (!pendiente) return;
    const { plan, meta } = pendiente;
    pendiente = null;
    const doc = {
      formato: FORMATO,
      rev: rev + 1,
      guardadoEn: new Date().toISOString(),
      dispositivo,
      plan: structuredClone(plan),
      meta: { ...meta },
    };
    poner('guardando');
    try {
      await almacen.escribir(doc);
      rev = doc.rev;
      fallos = 0;
      if (bc) bc.postMessage({ rev, dispositivo });
      if (sincronizador) sincronizador.publicar(doc);
      poner(pendiente ? 'pendiente' : 'guardado');
    } catch (e) {
      fallos++;
      if (!pendiente) pendiente = { plan, meta };
      poner('error', e);
      if (fallos < 5) {
        clearTimeout(timer);
        timer = setTimeout(vaciar, 1000 * 2 ** fallos);
      }
    }
  }

  async function vaciar() {
    clearTimeout(timer);
    timer = null;
    while (enCurso) await enCurso;
    if (!pendiente) return;
    enCurso = escribir();
    try {
      await enCurso;
    } finally {
      enCurso = null;
    }
  }

  return {
    get estado() {
      return estado;
    },
    get rev() {
      return rev;
    },
    /** Lee lo guardado (o null la primera vez) y deja la copia automática del día. */
    async cargar() {
      const doc = await almacen.leer();
      if (doc) {
        rev = doc.rev || 0;
        try {
          const dia = isoDe(hoy());
          const copias = await almacen.listarCopias();
          if (!copias.length || copias[0].dia !== dia) await almacen.guardarCopia(dia, doc);
        } catch {
          /* la copia del día es una ayuda: si falla, la app sigue */
        }
      }
      return doc;
    },
    /** Programa la escritura del plan (se juntan los cambios seguidos). */
    guardar(plan, meta = {}) {
      pendiente = { plan: structuredClone(plan), meta };
      poner('pendiente');
      clearTimeout(timer);
      timer = setTimeout(vaciar, demora);
    },
    /** Escribe ya lo pendiente (al ocultar la app, antes de actualizarla o de exportar). */
    ahora: vaciar,
    listarCopias: () => almacen.listarCopias(),
    cerrar() {
      clearTimeout(timer);
      if (bc) bc.close();
      if (desuscribir) desuscribir();
    },
  };
}
