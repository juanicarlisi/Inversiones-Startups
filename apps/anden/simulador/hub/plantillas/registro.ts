// hub/plantillas/registro.ts · Andén simulador, corte 1 · P4 (el hub).
// Las plantillas publicadas, por 'id@versión' (contratos/hub.ts, RegistroPlantillas). Son públicas e inmutables: se congelan en
// profundidad, y una versión nueva es otro id@versión. hub-chico@1.0.0 es el modelo de ejemplo de corte-1.md §5 (copia exacta de
// contratos/ejemplos/hub-chico.json); hub-lazo-noche@1.0.0 la genera generar.ts una sola vez.
import type { Modelo } from '../../contratos/modelo.ts';
import type { RegistroPlantillas } from '../../contratos/hub.ts';
import hubChico from './hub-chico.json' with { type: 'json' };
import hubLazoNoche from './hub-lazo-noche.json' with { type: 'json' };

function congelar<T>(x: T): T {
  if (x && typeof x === 'object' && !Object.isFrozen(x)) {
    Object.freeze(x);
    for (const v of Object.values(x)) congelar(v);
  }
  return x;
}

export const PLANTILLAS: RegistroPlantillas = congelar({
  'hub-chico@1.0.0': structuredClone(hubChico) as unknown as Modelo,
  'hub-lazo-noche@1.0.0': structuredClone(hubLazoNoche) as unknown as Modelo,
});

/** La plantilla publicada, o null si no existe (sirve de ResolverPlantilla para el codec del enlace). */
export function plantilla(id: string, version: string): Modelo | null {
  return PLANTILLAS[`${id}@${version}`] ?? null;
}
