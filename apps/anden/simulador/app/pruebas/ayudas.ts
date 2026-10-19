// app/pruebas/ayudas.ts · Andén simulador, corte 1 · P8 (interfaz). Ayudas para las pruebas de la interfaz en Node (sin DOM).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Archivos de app/ (sin vendor/ ni capturas), con la extensión pedida. */
export function archivosApp(extensiones: string[], desde = APP): string[] {
  const out: string[] = [];
  for (const f of readdirSync(desde)) {
    const p = join(desde, f);
    if (statSync(p).isDirectory()) { if (f !== 'vendor' && f !== 'capturas' && f !== 'node_modules') out.push(...archivosApp(extensiones, p)); continue; }
    if (extensiones.some((e) => f.endsWith(e))) out.push(p);
  }
  return out.sort();
}

export function leer(p: string): string { return readFileSync(p, 'utf8'); }

/** El código sin comentarios (// y /* *\/), para buscar tokens sin falsos positivos en la documentación. */
export function sinComentarios(codigo: string): string {
  return codigo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
}

/** Espera (sin reloj de la máquina en el resultado) a que se cumpla una condición, revisando cada 5 ms. */
export async function esperarA(cond: () => boolean, que: string, maxMs = 20000): Promise<void> {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > maxMs) throw new Error(`se esperaba «${que}» y no pasó en ${maxMs} ms`);
    await new Promise((r) => setTimeout(r, 5));
  }
}
