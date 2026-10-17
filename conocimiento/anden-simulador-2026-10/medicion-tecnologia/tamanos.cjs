// Medicion propia 17-10-2026: tamaño minificado, gzip y brotli de cada librería con esbuild 0.28.2.
// Uso: npm i three@0.186.1 pixi.js@8.22.0 @babylonjs/core@9.31.0 konva@10.9.0 uplot@1.6.32 esbuild@0.28.2 idb@8.0.4 comlink@4.4.2 fflate@0.8.3 playcanvas@2.23.3 echarts@6.1.0 preact@11.0.1 dexie@4.4.6
//      node tamanos.cjs
const esbuild=require('esbuild'),fs=require('fs'),zlib=require('zlib'),path=require('path');
(async()=>{const dir=path.join(__dirname,'entradas-tamano');fs.mkdirSync('salida',{recursive:true});
 for(const f of fs.readdirSync(dir)){const out='salida/'+f;
  try{await esbuild.build({entryPoints:[path.join(dir,f)],bundle:true,minify:true,format:'esm',outfile:out,logLevel:'silent',target:'es2022'});
   const b=fs.readFileSync(out);console.log(f.padEnd(20),'min',(b.length/1024).toFixed(0)+' KiB','gzip',(zlib.gzipSync(b,{level:9}).length/1024).toFixed(0)+' KiB','br',(zlib.brotliCompressSync(b).length/1024).toFixed(0)+' KiB');
  }catch(e){console.log(f,'ERROR',e.message.slice(0,200));}}})();
