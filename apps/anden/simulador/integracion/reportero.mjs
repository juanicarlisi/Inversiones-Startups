// integracion/reportero.mjs · Andén simulador, corte 1 · Integración (corte-1.md §10.10). Reportero de `node --test` en JSON.
// Lo usa informe-salida.mjs para saber, de UNA corrida de `npm test`, cuántas pruebas pasaron en total y en cada archivo (los criterios
// de §12 se apoyan en archivos concretos: diferencial, e-explicador, arquitectura, textos, marcas…).
//   node --test --test-reporter=./integracion/reportero.mjs --test-reporter-destination=<archivo.json> "**/pruebas/*.test.ts"
// Cuenta las pruebas de primer nivel de cada archivo (las que muestra el resumen de node --test) y guarda el mensaje de cada falla.
export default async function* reportero(fuente) {
  const archivos = {};
  const fallas = [];
  const diagnosticos = [];
  const de = (f) => (archivos[f] ??= { pasa: 0, falla: 0, todo: 0, omitida: 0 });
  for await (const ev of fuente) {
    const d = ev.data ?? {};
    if (ev.type === 'test:diagnostic') { diagnosticos.push(d.message); continue; }
    if ((ev.type !== 'test:pass' && ev.type !== 'test:fail') || d.nesting !== 0) continue;
    // node --test envuelve cada archivo en una prueba con su ruta como nombre cuando el archivo falla al cargar: se cuenta igual
    const a = de(d.file ?? '?');
    if (d.skip) a.omitida++;
    else if (d.todo) a.todo++;
    else if (ev.type === 'test:pass') a.pasa++;
    else {
      a.falla++;
      const e = d.details?.error;
      fallas.push({ archivo: d.file, prueba: d.name, error: String(e?.cause?.message ?? e?.message ?? e ?? '').slice(0, 600) });
    }
  }
  const totales = Object.values(archivos).reduce((t, a) => ({ pasa: t.pasa + a.pasa, falla: t.falla + a.falla, todo: t.todo + a.todo, omitida: t.omitida + a.omitida }),
    { pasa: 0, falla: 0, todo: 0, omitida: 0 });
  yield `${JSON.stringify({ totales, archivos, fallas, diagnosticos }, null, 2)}\n`;
}
