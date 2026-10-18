// modelo/variante.ts · P3 · Variantes: escenarios, valores de la decisión y contrafactuales se arman todos igual, con un parche
// sobre el modelo validado y una compilación nueva. Si el parche no aplica o la variante no compila, la promesa se rechaza con un
// error que dice qué falló (y trae los diagnósticos en `error.diagnosticos`): nunca se simula una variante inválida.
import type { Compilar, Diagnostico, ModeloValidado, OpParche, Variante } from '../contratos/modelo.ts';
import { aplicarParche } from './parches.ts';

export interface ErrorVariante extends Error {
  diagnosticos: Diagnostico[];
}

export function esErrorVariante(e: unknown): e is ErrorVariante {
  return e instanceof Error && Array.isArray((e as Partial<ErrorVariante>).diagnosticos);
}

export function crearVariante(compilar: Compilar): Variante {
  return async (mv: ModeloValidado, parche: OpParche[]): Promise<ModeloValidado> => {
    const modelo = aplicarParche(mv.modelo, parche);
    const r = await compilar(modelo);
    if (r.ok) return r.mv;
    const errores = r.diagnosticos.filter((d) => d.nivel === 'error');
    const resumen = errores.slice(0, 3).map((d) => `${d.codigo} en ${d.ruta || '/'}`).join('; ');
    const e = new Error(`variante inválida: el parche de ${parche.length} operación(es) deja el modelo con ${errores.length} error(es): ${resumen}`) as ErrorVariante;
    e.diagnosticos = r.diagnosticos;
    throw e;
  };
}
