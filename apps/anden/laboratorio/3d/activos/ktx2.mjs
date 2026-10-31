// KTX2 (Basis Universal) con ktx2-encoder (WASM, sin binarios externos): tamaño en disco y memoria de GPU frente a JPG.
import { encodeToKTX2 } from 'ktx2-encoder'; import sharp from 'sharp'; import fs from 'node:fs';
const entrada = process.argv[2] || 'activos/cc0/concrete_diff.jpg'; const buf = new Uint8Array(fs.readFileSync(entrada));
const imageDecoder = async (b) => { const { data, info } = await sharp(b).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); return { data: new Uint8Array(data), width: info.width, height: info.height }; };
const meta = await sharp(buf).metadata(); const out = { archivo: entrada, ancho: meta.width, alto: meta.height, jpg_KB: +(buf.length / 1024).toFixed(0), rgba8_con_mipmaps_MB: +(meta.width * meta.height * 4 * 1.333 / 1048576).toFixed(2) };
for (const [nombre, o] of [['etc1s', { isUASTC: false }], ['uastc', { isUASTC: true }]]) { const t0 = performance.now(); const k = await encodeToKTX2(buf, { ...o, generateMipmap: true, imageDecoder, enableDebug: false }); fs.mkdirSync('salida', { recursive: true }); fs.writeFileSync(`salida/${entrada.split('/').pop().replace('.jpg', '')}-${nombre}.ktx2`, k); out[nombre] = { ktx2_KB: +(k.length / 1024).toFixed(0), ms_codificar: Math.round(performance.now() - t0) }; }
console.log(JSON.stringify(out));
