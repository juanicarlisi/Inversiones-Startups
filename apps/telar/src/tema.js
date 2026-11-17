// Tema antes de pintar, para que no parpadee (archivo aparte: la política de seguridad no deja scripts en línea).
try {
  var t = localStorage.getItem('telar-tema');
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
} catch (e) {}
