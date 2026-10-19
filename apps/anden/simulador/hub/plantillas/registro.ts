// hub/plantillas/registro.ts · Andén simulador, corte 1 · P4 (el hub).
// Las plantillas publicadas, por 'id@versión' (contratos/hub.ts, RegistroPlantillas). Son públicas e inmutables: se congelan en
// profundidad, y una versión nueva es otro id@versión. hub-chico@1.0.0 es el modelo de ejemplo de corte-1.md §5 (copia exacta de
// contratos/ejemplos/hub-chico.json); hub-lazo-noche@1.0.0 la genera generar.ts una sola vez.
// PROPUESTAS guarda versiones nuevas listas para publicar que todavía no están en PLANTILLAS: publicarlas lo decide la integración
// (corte-1.md §2 y §14.8; NOTAS-CONTRATO §13). Ni la app ni el enlace las ven mientras no pasen a PLANTILLAS.
import type { Modelo } from '../../contratos/modelo.ts';
import type { RegistroPlantillas } from '../../contratos/hub.ts';
import hubChico from './hub-chico.json' with { type: 'json' };
import hubLazoNoche from './hub-lazo-noche.json' with { type: 'json' };
import hubChico110 from './hub-chico-1.1.0.json' with { type: 'json' };

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

/**
 * Versiones propuestas, NO publicadas (no están en PLANTILLAS ni las resuelve `plantilla()`). `hub-chico@1.1.0` = hub-chico@1.0.0 +
 * PARCHE_HUB_CHICO_1_1_0 (retén 1, 7 personas de rampa, 2 puestos manuales): la que cumple al pie de la letra «KPI sanos» de §9.
 * Publicarla es mover su entrada a PLANTILLAS (y cambiar la lista que controla plantillas.test.ts).
 */
export const PROPUESTAS: RegistroPlantillas = congelar({
  'hub-chico@1.1.0': structuredClone(hubChico110) as unknown as Modelo,
});

/** La plantilla publicada, o null si no existe (sirve de ResolverPlantilla para el codec del enlace). */
export function plantilla(id: string, version: string): Modelo | null {
  return PLANTILLAS[`${id}@${version}`] ?? null;
}
