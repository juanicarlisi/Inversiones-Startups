// pruebas/hostiles/ayuda-bomba.ts · P3 · Bombas de deflate para las pruebas: n ceros comprimidos con deflate-raw, sin materializar n bytes.

/** n bytes en cero comprimidos con deflate-raw. Se alimenta el compresor por tandas para no reservar n bytes de una vez. */
export async function compresionDeCeros(n: number): Promise<Uint8Array<ArrayBuffer>> {
  const TANDA = 1 << 20;
  const cero = new Uint8Array(TANDA);
  let restante = n;
  const origen = new ReadableStream<Uint8Array<ArrayBuffer>>({
    pull(control) {
      if (restante <= 0) { control.close(); return; }
      const k = Math.min(restante, TANDA);
      control.enqueue(k === TANDA ? cero : cero.subarray(0, k) as Uint8Array<ArrayBuffer>);
      restante -= k;
    },
  });
  const lector = origen.pipeThrough(new CompressionStream('deflate-raw')).getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { value, done } = await lector.read();
    if (done) break;
    partes.push(value);
    total += value.length;
  }
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of partes) { out.set(p, o); o += p.length; }
  return out;
}
