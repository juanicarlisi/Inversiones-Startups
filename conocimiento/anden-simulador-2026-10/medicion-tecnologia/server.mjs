import http from 'http'; import fs from 'fs'; import path from 'path';
const root=process.cwd(); const coi=process.argv[2]!=='nocoi';
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.wasm':'application/wasm','.json':'application/json'};
http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/web/index.html';const f=path.join(root,p);
 fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);return res.end('no');}
  const h={'Content-Type':types[path.extname(f)]||'application/octet-stream'};
  if(coi){h['Cross-Origin-Opener-Policy']='same-origin';h['Cross-Origin-Embedder-Policy']='require-corp';}
  res.writeHead(200,h);res.end(d);});}).listen(+process.argv[3]||8765);
