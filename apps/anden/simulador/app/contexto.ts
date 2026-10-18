// app/contexto.ts · Andén simulador, corte 1 · P8 (interfaz).
// Lo que recibe cada pantalla al montarse: los servicios, el estado (puro) y su almacén, la sesión (datos de la corrida), el traductor y
// el formato, y unas pocas acciones de la cáscara (ir, avisar, narrar). Cada pantalla es `montar(raiz, ctx) → desmontar`.
import type { Formato, Traducir } from '../contratos/i18n.ts';
import type { Estilo } from '../contratos/vistas.ts';
import type { ServiciosApp } from './extras.ts';
import type { Almacen, Pantalla } from './estado.ts';
import type { Sesion } from './sesion.ts';
import type { Traductor } from './i18n/traducir.ts';

export interface Contexto {
  readonly servicios: ServiciosApp;
  readonly almacen: Almacen;
  readonly sesion: Sesion;
  /** Traducir con el idioma actual. */
  readonly t: Traducir;
  readonly f: Formato;
  readonly traductor: Traductor;
  /** Estilo de la vista con el tema que se ve ahora (claro u oscuro) y el movimiento reducido del sistema. */
  estilo(): Estilo;
  temaResuelto(): 'claro' | 'oscuro';
  reducirMovimiento(): boolean;
  /** ¿Pantalla ancha (pantalla dividida lado a lado)? */
  esAncho(): boolean;
  ir(p: Pantalla): void;
  avisar(clave: string, vars?: Record<string, string | number>, nivel?: 'info' | 'error'): void;
  /** Texto para la región aria-live (lectores de pantalla). */
  narrar(texto: string): void;
  /** Abre una plantilla por su clave 'id@versión' y va a la pantalla pedida (por defecto, la escena). */
  abrirPlantilla(clave: string, destino?: Pantalla): Promise<void>;
  /** Abre un fragmento de enlace (lo que va después de #). */
  abrirFragmento(fragmento: string): Promise<boolean>;
}

export type Montar = (raiz: HTMLElement, ctx: Contexto) => () => void;
