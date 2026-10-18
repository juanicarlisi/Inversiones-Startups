// app/i18n/traducir.ts · Andén simulador, corte 1 · P8 (interfaz).
// Diccionarios por paquete (cada uno dueño de su prefijo: app.*, escena.*, explicacion.*, modelo.*, experimentos.*), que se juntan en uno
// por idioma, y el traductor: clave + variables → texto. Las variables numéricas salen con el formato del idioma; las de texto, tal cual
// (la interfaz pone todo con textContent, así que un texto del modelo nunca se interpreta como HTML).
import type { Diccionario, Formato, Traducir } from '../../contratos/i18n.ts';
import type { Idioma } from '../../contratos/tipos-base.ts';

export interface ParteDiccionario {
  /** Paquete dueño (para los mensajes de error). */
  paquete: string;
  /** Prefijo que tienen que llevar todas sus claves, con el punto: 'app.', 'escena.'… */
  prefijo: string;
  textos: Diccionario;
}

/**
 * Junta los diccionarios de los paquetes en uno. Lanza si una clave no lleva el prefijo de su paquete, si dos paquetes definen la misma
 * clave o si un texto no es una cadena: un diccionario mal armado se descubre al arrancar, no cuando falta un texto en pantalla.
 */
export function juntarDiccionarios(partes: readonly ParteDiccionario[]): Diccionario {
  const junto: Diccionario = Object.create(null) as Diccionario;
  const duenio: Record<string, string> = Object.create(null) as Record<string, string>;
  for (const p of partes) {
    for (const [clave, texto] of Object.entries(p.textos)) {
      if (!clave.startsWith(p.prefijo)) {
        throw new Error(`i18n: la clave «${clave}» del paquete ${p.paquete} no empieza con «${p.prefijo}».`);
      }
      if (typeof texto !== 'string') {
        throw new Error(`i18n: el texto de «${clave}» (paquete ${p.paquete}) tiene que ser una cadena y es ${typeof texto}.`);
      }
      if (duenio[clave] !== undefined) {
        throw new Error(`i18n: la clave «${clave}» está en ${duenio[clave]} y en ${p.paquete}; cada clave tiene un solo dueño.`);
      }
      duenio[clave] = p.paquete;
      junto[clave] = texto;
    }
  }
  return junto;
}

/** Nombres de las variables {nombre} de un texto, en orden de aparición y sin repetir. */
export function variablesDe(texto: string): string[] {
  const vistas: string[] = [];
  for (const m of texto.matchAll(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g)) if (!vistas.includes(m[1])) vistas.push(m[1]);
  return vistas;
}

/**
 * Reemplaza {nombre} por su valor. Números con el formato del idioma; una variable que no vino queda escrita como {nombre} (se ve y se
 * anota en `faltantes`, en vez de desaparecer en silencio).
 */
export function interpolar(texto: string, vars: Record<string, string | number> | undefined, f: Formato,
  alFaltar?: (nombre: string) => void): string {
  return texto.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (entero, nombre: string) => {
    const v = vars?.[nombre];
    if (v === undefined || v === null) {
      alFaltar?.(nombre);
      return entero;
    }
    return typeof v === 'number' ? f.numero(v) : String(v);
  });
}

export interface Traductor {
  readonly idioma: Idioma;
  readonly t: Traducir;
  /** ¿Existe la clave en este idioma? */
  tiene(clave: string): boolean;
  /** Claves y variables pedidas que no estaban (para las pruebas y el modo ingeniero). */
  faltantes(): string[];
}

/**
 * Traductor de un idioma. Si la clave no está en el idioma pedido usa la del otro (español primero) y, si no está en ninguno, devuelve
 * la clave entre corchetes ⟦…⟧ y la anota en `faltantes()`.
 */
export function crearTraductor(diccionarios: Record<Idioma, Diccionario>, idioma: Idioma, f: Formato): Traductor {
  const propio = diccionarios[idioma];
  const respaldo = diccionarios[idioma === 'es' ? 'en' : 'es'];
  const faltan = new Set<string>();
  const t: Traducir = (clave, vars) => {
    let texto = Object.prototype.hasOwnProperty.call(propio, clave) ? propio[clave] : undefined;
    if (texto === undefined) {
      faltan.add(`${idioma}:${clave}`);
      texto = Object.prototype.hasOwnProperty.call(respaldo, clave) ? respaldo[clave] : undefined;
      if (texto === undefined) return `⟦${clave}⟧`;
    }
    return interpolar(texto, vars, f, (nombre) => faltan.add(`${idioma}:${clave}{${nombre}}`));
  };
  return {
    idioma,
    t,
    tiene: (clave) => Object.prototype.hasOwnProperty.call(propio, clave),
    faltantes: () => [...faltan].sort(),
  };
}
