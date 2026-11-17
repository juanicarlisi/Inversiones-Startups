// Deshacer y rehacer. Guarda fotos del plan (JSON) antes de cada cambio.
// Los cambios seguidos con la misma clave (por ejemplo, escribir el nombre letra por letra) se juntan en uno
// si pasan menos de `ventana` milisegundos entre ellos.

export function crearHistorial({ tope = 100, ventana = 1500, reloj = () => Date.now() } = {}) {
  const atras = [];
  const adelante = [];
  let ultimaClave = null;
  let ultimoT = 0;
  return {
    /** Llamar ANTES de cambiar el plan (o pasar la foto en texto tomada antes). */
    antes(plan, clave = null) {
      const t = reloj();
      if (clave === null || clave !== ultimaClave || t - ultimoT > ventana) {
        atras.push(typeof plan === 'string' ? plan : JSON.stringify(plan));
        if (atras.length > tope) atras.shift();
      }
      adelante.length = 0;
      ultimaClave = clave;
      ultimoT = t;
    },
    /** Devuelve el plan anterior (o null si no hay). */
    deshacer(planActual) {
      if (!atras.length) return null;
      adelante.push(JSON.stringify(planActual));
      ultimaClave = null;
      return JSON.parse(atras.pop());
    },
    rehacer(planActual) {
      if (!adelante.length) return null;
      atras.push(JSON.stringify(planActual));
      ultimaClave = null;
      return JSON.parse(adelante.pop());
    },
    get puedeDeshacer() {
      return atras.length > 0;
    },
    get puedeRehacer() {
      return adelante.length > 0;
    },
    /** Corta la fusión de cambios (por ejemplo, al salir de un campo). */
    cortar() {
      ultimaClave = null;
    },
    limpiar() {
      atras.length = 0;
      adelante.length = 0;
      ultimaClave = null;
    },
  };
}
