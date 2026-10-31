// glTF Transform (API de Node): limpia, suelda, cuantiza y comprime con Meshopt (y, de comparación, con Draco).
// Uso: node activos/optimizar.mjs salida/activos-crudos.glb salida/activos.glb
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, quantize, meshopt, draco, flatten } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import { statSync } from 'node:fs';
const [, , entrada, salida] = process.argv;
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder,
  'draco3d.encoder': await draco3d.createEncoderModule(), 'draco3d.decoder': await draco3d.createDecoderModule() });
const base = async () => { const d = await io.read(entrada); await d.transform(dedup(), weld({ tolerance: 1e-5 }), prune({ keepAttributes: true })); return d; };
const kb = (f) => (statSync(f).size / 1024).toFixed(1);
// A: meshopt con cuantización (la que usa el laboratorio)
let d = await base(); await d.transform(quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }), meshopt({ encoder: MeshoptEncoder, level: 'high' })); await io.write(salida, d);
// B: Draco, solo para comparar
d = await base(); await d.transform(draco({ method: 'edgebreaker' })); await io.write(salida.replace('.glb', '-draco.glb'), d);
// C: sin compresión (solo limpieza)
d = await base(); await io.write(salida.replace('.glb', '-limpio.glb'), d);
console.log(JSON.stringify({ crudo_KB: +kb(entrada), limpio_KB: +kb(salida.replace('.glb', '-limpio.glb')), meshopt_KB: +kb(salida), draco_KB: +kb(salida.replace('.glb', '-draco.glb')) }));
