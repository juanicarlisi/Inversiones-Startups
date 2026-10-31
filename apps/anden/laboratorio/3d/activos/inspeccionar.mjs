// Lista el cuadro delimitador (m) de cada nodo con malla de un GLB: verifica ejes y escala de los activos generados.
import { NodeIO } from '@gltf-transform/core'; import { getBounds } from '@gltf-transform/functions'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions'; import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const d = await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder }).read(process.argv[2]);
const f = (v) => v.map((x) => x.toFixed(2)).join(', ');
for (const n of d.getRoot().listNodes()) { if (!n.getMesh()) continue; const b = getBounds(n); console.log(n.getName().padEnd(20), 'min', f(b.min).padEnd(22), 'max', f(b.max)); }
