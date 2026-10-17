// Adaptador de portales (CrazyGames, Poki). En el prototipo no se carga ningún SDK: todo se simula y queda listo para enchufar.
// Reglas que respetamos desde ya: el video con premio siempre es opcional y hay otra forma de conseguir lo mismo (cobrar normal),
// nada de anuncios a la fuerza en el prototipo y el sonido se apaga mientras corre un anuncio.
let sdk = null;

export const portal = {
  nombre: 'prueba',
  async iniciar() {
    try {
      if (window.CrazyGames?.SDK) { sdk = window.CrazyGames.SDK; await sdk.init(); this.nombre = 'crazygames'; }
      else if (window.PokiSDK) { sdk = window.PokiSDK; await sdk.init(); this.nombre = 'poki'; }
    } catch { sdk = null; this.nombre = 'prueba'; }
  },
  cargaTermino() {
    try { if (this.nombre === 'crazygames') sdk.game.loadingStop(); if (this.nombre === 'poki') sdk.gameLoadingFinished(); } catch { /* sin portal */ }
  },
  jugando(si) {
    try {
      if (this.nombre === 'crazygames') si ? sdk.game.gameplayStart() : sdk.game.gameplayStop();
      if (this.nombre === 'poki') si ? sdk.gameplayStart() : sdk.gameplayStop();
    } catch { /* sin portal */ }
  },
  // Devuelve true si la persona miró el video completo.
  async videoConPremio(silenciar) {
    silenciar(true);
    try {
      if (this.nombre === 'crazygames') {
        return await new Promise((ok) => sdk.ad.requestAd('rewarded', { adFinished: () => ok(true), adError: () => ok(false) }));
      }
      if (this.nombre === 'poki') return !!(await sdk.rewardedBreak());
      return await videoSimulado();
    } catch { return false; } finally { silenciar(false); }
  },
};

function videoSimulado() {
  return new Promise((ok) => {
    const d = document.createElement('div');
    d.className = 'video-simulado';
    d.innerHTML = '<div><div class="barra-video"><span></span></div><p></p></div>';
    d.querySelector('p').textContent = document.documentElement.lang === 'en' ? 'Video (simulated in the test build)' : 'Video (simulado en la versión de prueba)';
    document.body.appendChild(d);
    setTimeout(() => { d.remove(); ok(true); }, 2200);
  });
}
