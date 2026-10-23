// Capa del lanzamiento completo (HN-27, v1.1). El candidato de diciembre NO la carga: main.js la importa solo si la página dice
// <meta name="hn-lanzamiento" content="completo"> (crazygames-completo.html y poki.html, que genera herramientas/destinos.mjs),
// y herramientas/empaquetar.mjs la deja afuera del paquete del lanzamiento básico.
//  - Guardado con el módulo de datos de CrazyGames (getItem/setItem), con localStorage de respaldo y migración al primer arranque.
//  - Corte publicitario solo al cerrar un capítulo y antes de seguir; nunca durante el juego activo ni más de uno cada 3 min.
//  - Durante un anuncio la simulación no avanza (enAnuncio) y el audio se suspende (adStarted) y vuelve (adFinished o adError).
//  - Video con premio solo para ausencias de 30 min o más, con 15 min entre ofertas, y solo con la bandera legal encendida (consulta
//    sobre las patentes de EA de premios por tiempo). Con adError o un bloqueador no aparece, y nunca se paga sin anuncio.
//  - happytime al terminar un capítulo.
// Pura respecto del DOM salvo el video simulado (solo en localhost o 127.0.0.1, para probar).

export const BANDERAS = { videoConPremio: false }; // se enciende recién después de la consulta legal
export const CORTE_MIN_MS = 3 * 60 * 1000;
export const OFERTA_MIN_MS = 15 * 60 * 1000;
export const AUSENCIA_MIN_S = 30 * 60;
const CLAVE_CORTE = 'hubnocturno.anuncios.corte', CLAVE_OFERTA = 'hubnocturno.anuncios.oferta';

const almacenLocal = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  remove(k) { try { localStorage.removeItem(k); } catch { /* nada */ } },
};
export const esLocal = (host = globalThis.location?.hostname) => host === 'localhost' || host === '127.0.0.1';

// Almacén del guardado: el módulo de datos de CrazyGames si está (1 MB de límite: el guardado pesa menos de 50 KB) y localStorage
// como respaldo. migrar(claves) copia al módulo lo que hubiera en localStorage la primera vez.
export function crearAlmacen(portal, local = almacenLocal) {
  const datos = portal?.nombre === 'crazygames' ? portal.sdk?.data : null;
  const conDatos = (fn, def) => { try { return datos ? fn(datos) : def; } catch { return def; } };
  return {
    conModulo: !!datos,
    get(k) { const v = conDatos((d) => d.getItem(k), null); return v ?? local.get(k); },
    set(k, v) { const a = conDatos((d) => { d.setItem(k, v); return true; }, false); const b = local.set(k, v); return a || b; },
    remove(k) { conDatos((d) => d.removeItem(k)); local.remove(k); },
    migrar(claves) {
      if (!datos) return 0;
      let n = 0;
      for (const k of claves) { const x = local.get(k); if (x != null && conDatos((d) => d.getItem(k), null) == null) { conDatos((d) => d.setItem(k, x)); n++; } }
      return n;
    },
  };
}

export function crearAnuncios({ portal, silenciar = () => {}, ahora = () => Date.now(), almacen = almacenLocal, simulado = esLocal() }) {
  const sdk = portal?.sdk, nombre = portal?.nombre ?? 'ninguno';
  let enAnuncio = false;
  const registro = [];
  const marca = (k) => Number(almacen.get(k) ?? 0) || 0;
  // Corre un anuncio con las reglas: pausa la simulación y silencia; vuelve en fin o error. Devuelve 'fin' | 'error' | 'nada'.
  const correr = (tipo) => new Promise((ok) => {
    let listo = false;
    const fin = (r) => { if (listo) return; listo = true; enAnuncio = false; silenciar(false); registro.push(`${tipo}:${r}`); ok(r); };
    try {
      if (nombre === 'crazygames' && sdk?.ad) {
        enAnuncio = true;
        sdk.ad.requestAd(tipo === 'premio' ? 'rewarded' : 'midgame', {
          adStarted: () => { enAnuncio = true; silenciar(true); },
          adFinished: () => fin('fin'),
          adError: () => fin('error'),
        });
      } else if (nombre === 'poki' && sdk) {
        enAnuncio = true; silenciar(true);
        const p = tipo === 'premio' ? sdk.rewardedBreak(() => silenciar(true)) : sdk.commercialBreak(() => silenciar(true));
        Promise.resolve(p).then((visto) => fin(tipo === 'premio' ? (visto ? 'fin' : 'error') : 'fin'), () => fin('error'));
      } else if (simulado && typeof document !== 'undefined') {
        enAnuncio = true; silenciar(true);
        videoSimulado().then(() => fin('fin'));
      } else fin('nada');
    } catch { fin('error'); }
  });
  return {
    registro,
    get enAnuncio() { return enAnuncio; },
    // Corte al cerrar un capítulo, antes de seguir. Nunca más de uno cada 3 minutos.
    async corteCapitulo() {
      if (ahora() - marca(CLAVE_CORTE) < CORTE_MIN_MS) { registro.push('corte:espera'); return 'espera'; }
      almacen.set(CLAVE_CORTE, String(ahora()));
      return correr('corte');
    },
    // ¿Se ofrece el video con premio en esta vuelta? Solo con la bandera legal, 30 min de ausencia, 15 min entre ofertas y sin bloqueador.
    async puedeOfrecerVideo(segundosAusencia) {
      if (!BANDERAS.videoConPremio || !(segundosAusencia >= AUSENCIA_MIN_S)) return false;
      if (ahora() - marca(CLAVE_OFERTA) < OFERTA_MIN_MS) return false;
      if (nombre === 'crazygames') { try { if (await sdk?.ad?.hasAdblock?.()) return false; } catch { return false; } if (!sdk?.ad) return false; }
      else if (nombre === 'poki') { if (!sdk) return false; }
      else if (!simulado) return false;
      almacen.set(CLAVE_OFERTA, String(ahora()));
      return true;
    },
    // true solo si el anuncio terminó: nunca se paga un premio sin anuncio.
    async videoConPremio() { return (await correr('premio')) === 'fin'; },
    happytime() { try { if (nombre === 'crazygames') sdk?.game?.happytime?.(); registro.push('happytime'); } catch { /* nada */ } },
  };
}

function videoSimulado() {
  return new Promise((ok) => {
    const d = document.createElement('div');
    d.className = 'video-simulado';
    d.style.cssText = 'position:fixed;top:0;right:0;bottom:0;left:0;z-index:60;display:grid;place-items:center;background:#000;color:#fff;font:14px system-ui';
    d.textContent = document.documentElement.lang === 'en' ? 'Ad (simulated, local only)' : 'Anuncio (simulado, solo en local)';
    document.body.appendChild(d);
    setTimeout(() => { d.remove(); ok(); }, 1500);
  });
}
