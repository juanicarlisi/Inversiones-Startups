// modelo/normalizar.ts · P3 · Forma normal del modelo antes de los chequeos y de la huella.
// Se normaliza lo mínimo, siempre con aviso: el modelo que se comparte tiene que seguir siendo el que escribió su autor.
//   · A-PESOS: si los pesos de las rutas no suman 1 (± 1e-9), se dividen por su suma. Es idempotente: normalizar dos veces da
//     exactamente lo mismo (la suma ya queda a menos de 1e-15 de 1), y por eso compilar(mv.modelo) da la misma huella.
// Opera sobre la copia que hizo copiaSegura (nunca sobre el objeto de quien llama).
import type { Modelo } from '../contratos/modelo.ts';
import { cifra, type Colector } from './esquema.ts';

export const TOLERANCIA_SUMA = 1e-9;

export function normalizar(m: Modelo, c: Colector): Modelo {
  const rutas = m.hub.planClasificacion.rutas;
  let suma = 0;
  for (const r of rutas) suma += r.peso;
  if (suma > 0 && Math.abs(suma - 1) > TOLERANCIA_SUMA) {
    c.aviso('A-PESOS', '/hub/planClasificacion/rutas', undefined, { suma: cifra(suma, 9) });
    for (const r of rutas) r.peso = r.peso / suma;
  }
  return m;
}
