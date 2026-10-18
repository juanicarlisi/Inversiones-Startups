// modelo/canonico.ts · P3 · JSON canónico: la base de la huella del modelo y del enlace.
// Reglas (contratos/escena.ts): claves ordenadas por unidad de código UTF-16 (el orden por defecto de Array.prototype.sort), sin
// espacios, números y textos con JSON.stringify. Para que dos valores distintos nunca den el mismo texto, no se aceptan números no
// finitos (JSON.stringify los volvería null), valores sin representación JSON ni objetos que no sean planos: se lanza un error.
// Una propiedad con valor undefined cuenta como ausente (como en JSON.stringify y en los campos opcionales de TypeScript).
import type { JsonCanonico } from '../contratos/escena.ts';

const MAX_NIVELES = 1000;

function escribir(x: unknown, ruta: string, nivel: number, out: string[]): void {
  if (nivel > MAX_NIVELES) throw new Error(`JSON canónico: más de ${MAX_NIVELES} niveles de anidamiento en ${ruta || '(raíz)'}`);
  if (x === null) { out.push('null'); return; }
  switch (typeof x) {
    case 'string':
      out.push(JSON.stringify(x));
      return;
    case 'number':
      if (!Number.isFinite(x)) throw new Error(`JSON canónico: se esperaba un número finito en ${ruta || '(raíz)'} y llegó ${String(x)}`);
      out.push(JSON.stringify(x));
      return;
    case 'boolean':
      out.push(x ? 'true' : 'false');
      return;
    case 'object': {
      if (Array.isArray(x)) {
        out.push('[');
        for (let i = 0; i < x.length; i++) {
          if (i > 0) out.push(',');
          if (x[i] === undefined) throw new Error(`JSON canónico: hueco o undefined en ${ruta}/${i}`);
          escribir(x[i], `${ruta}/${i}`, nivel + 1, out);
        }
        out.push(']');
        return;
      }
      const proto = Object.getPrototypeOf(x);
      if (proto !== Object.prototype && proto !== null) {
        throw new Error(`JSON canónico: se esperaba un objeto plano en ${ruta || '(raíz)'} y llegó ${Object.prototype.toString.call(x)}`);
      }
      const o = x as Record<string, unknown>;
      const claves = Object.keys(o).filter((k) => o[k] !== undefined).sort();
      out.push('{');
      for (let i = 0; i < claves.length; i++) {
        if (i > 0) out.push(',');
        out.push(JSON.stringify(claves[i]), ':');
        escribir(o[claves[i]], `${ruta}/${claves[i]}`, nivel + 1, out);
      }
      out.push('}');
      return;
    }
    default:
      throw new Error(`JSON canónico: valor sin representación JSON (${typeof x}) en ${ruta || '(raíz)'}`);
  }
}

/** `{"b":1,"a":[2,{"d":3,"c":4}]}` → `{"a":[2,{"c":4,"d":3}],"b":1}`. */
export const jsonCanonico: JsonCanonico = (x: unknown): string => {
  const out: string[] = [];
  escribir(x, '', 0, out);
  return out.join('');
};
