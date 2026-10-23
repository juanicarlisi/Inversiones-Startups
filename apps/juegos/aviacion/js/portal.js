// Capa de portal del lanzamiento básico (HN-14). Una máquina de estados: cargando → menú → jugando ⇄ pausa.
//  - gameplayStart sale al entrar en «jugando» (después de «Empezar» o al cerrar la ventana de vuelta) y gameplayStop al salir
//    (cualquier ventana o la pausa). Como solo salen en un cambio de estado, nunca salen dos eventos iguales seguidos.
//  - No se llama al SDK en visibilitychange: CrazyGames pide no avisar cuando el jugador cambia de pestaña (lo maneja el portal).
//  - init se resuelve con Promise.race de 3 s: si el SDK no responde, el juego arranca igual.
//  - El candidato no tiene anuncios: acá no hay cortes ni video con premio (eso es js/anuncios.js, del lanzamiento completo).
// Es pura (no toca el DOM): main.js le pasa el SDK que encontró en window. Las pruebas la usan con SDK simulados.

export const ESPERA_INIT_MS = 3000;
const ESTADOS = ['cargando', 'menu', 'jugando', 'pausa'];

// Busca el SDK de cada portal en el objeto global (window en el navegador).
export function detectarSdk(g = globalThis) {
  if (g.CrazyGames?.SDK) return { nombre: 'crazygames', sdk: g.CrazyGames.SDK };
  if (g.PokiSDK) return { nombre: 'poki', sdk: g.PokiSDK };
  return { nombre: 'ninguno', sdk: null };
}

export function crearPortal({ nombre = 'ninguno', sdk = null, espera = ESPERA_INIT_MS, reloj = () => Date.now() } = {}) {
  const registro = [];   // eventos enviados al SDK (los muestra ?debug=1 y los leen las pruebas)
  let estado = 'cargando', listo = false;
  const llamar = (evento, fn) => {
    registro.push({ evento, t: reloj() });
    if (registro.length > 200) registro.shift();
    try { fn?.(); } catch { /* el SDK nunca rompe el juego */ }
  };
  const emitir = (evento) => {
    if (!listo || !sdk) { registro.push({ evento, t: reloj(), local: true }); return; }
    if (nombre === 'crazygames') {
      if (evento === 'gameplayStart') llamar(evento, () => sdk.game.gameplayStart());
      if (evento === 'gameplayStop') llamar(evento, () => sdk.game.gameplayStop());
      if (evento === 'loadingStart') llamar(evento, () => sdk.game.loadingStart?.());
      if (evento === 'loadingStop') llamar(evento, () => sdk.game.loadingStop?.());
    } else if (nombre === 'poki') {
      if (evento === 'gameplayStart') llamar(evento, () => sdk.gameplayStart());
      if (evento === 'gameplayStop') llamar(evento, () => sdk.gameplayStop());
      if (evento === 'loadingStop') llamar(evento, () => sdk.gameLoadingFinished());
    }
  };
  const ir = (nuevo) => {
    if (!ESTADOS.includes(nuevo) || nuevo === estado) return false;
    const antes = estado;
    estado = nuevo;
    if (nuevo === 'jugando') emitir('gameplayStart');
    else if (antes === 'jugando') emitir('gameplayStop');
    return true;
  };

  return {
    nombre, registro,
    get estado() { return estado; },
    get sdk() { return sdk; },
    // Inicializa el SDK sin bloquear: a los 3 s el juego sigue aunque el SDK no conteste. Devuelve true si respondió.
    async iniciar() {
      if (!sdk) { listo = true; return false; }
      let ok = false;
      try {
        const init = nombre === 'crazygames' ? sdk.init() : nombre === 'poki' ? sdk.init() : Promise.resolve();
        ok = await Promise.race([Promise.resolve(init).then(() => true, () => false), new Promise((r) => setTimeout(() => r(false), espera))]);
      } catch { ok = false; }
      listo = true;
      if (!ok && nombre !== 'ninguno') registro.push({ evento: 'initSinRespuesta', t: reloj(), local: true });
      if (ok) emitir('loadingStart');
      return ok;
    },
    // Locale del portal (CrazyGames: user.systemInfo.locale). null si no hay.
    locale() {
      try { return nombre === 'crazygames' ? sdk?.user?.systemInfo?.locale ?? null : null; } catch { return null; }
    },
    cargaTermino() { emitir('loadingStop'); if (estado === 'cargando') ir('menu'); },
    menu() { return ir('menu'); },
    jugar() { return ir('jugando'); },
    pausar() { return estado === 'jugando' ? ir('pausa') : false; },
    // El juego avisa su situación y la capa decide: jugable = sin ventana abierta y sin pausa.
    situacion({ jugable, enMenu = false }) { return enMenu ? ir('menu') : jugable ? ir('jugando') : estado === 'jugando' ? ir('pausa') : false; },
  };
}
