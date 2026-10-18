// La puerta de los jugadores automáticos al juego: solo las funciones que puede usar la interfaz (modelo.API_INTERFAZ).
// Los perfiles importan esto y nunca modelo.js directo, así miden jugadas que una persona puede hacer con lo que ve.
import * as M from '../js/modelo.js';

export const I = Object.freeze(Object.fromEntries(M.API_INTERFAZ.map((k) => {
  if (!(k in M)) throw new Error(`API_INTERFAZ nombra algo que modelo.js no exporta: ${k}`);
  return [k, M[k]];
})));

// Campos del estado que la interfaz muestra (o podría mostrar) y que, por eso, un perfil puede leer.
export const CAMPOS_VISIBLES = ['dinero', 'cap', 'rutas', 'aviones', 'niveles', 'misiones', 't'];
