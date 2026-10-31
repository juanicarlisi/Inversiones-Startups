// Convierte los .arrow (formato archivo) a formato stream, el que acepta DuckDB-WASM (insertArrowFromIPCStream).
import { readFileSync, writeFileSync } from 'node:fs';
import { tableFromIPC, tableToIPC } from 'apache-arrow';
for (const n of ['paquetes', 'noches']) {
  const t = tableFromIPC(readFileSync(new URL(`../datos/${n}.arrow`, import.meta.url)));
  writeFileSync(new URL(`../datos/${n}.stream.arrow`, import.meta.url), tableToIPC(t, 'stream'));
}
