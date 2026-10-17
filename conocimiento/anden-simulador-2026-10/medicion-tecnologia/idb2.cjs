process.env.PLAYWRIGHT_BROWSERS_PATH='/opt/pw-browsers';
const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('http://localhost:9871/');
const r=await p.evaluate(async()=>{const db=await new Promise((r,j)=>{const q=indexedDB.open('x'+Math.random(),1);q.onupgradeneeded=()=>{q.result.createObjectStore('recs',{keyPath:'id'});q.result.createObjectStore('docs');};q.onsuccess=()=>r(q.result);});
 const tx=(st,fn)=>new Promise((r,j)=>{const t=db.transaction(st,'readwrite');fn(t.objectStore(st));t.oncomplete=r;t.onerror=j;});const out={};
 for(const n of [1000,10000]){const t0=performance.now();await tx('recs',s=>{for(let i=0;i<n;i++)s.put({id:n*10+i,tipo:'cinta',x:i%100,y:(i/100)|0,vel:1.2,largo:3});});out['registros_'+n+'_ms']=Math.round(performance.now()-t0);}
 const objs=Array.from({length:100000},(_,i)=>({id:i,tipo:'cinta',x:i%100,y:(i/100)|0,vel:1.2,largo:3}));
 let t0=performance.now();await tx('docs',s=>s.put(objs,'modelo'));out.un_documento_100k_objetos_ms=Math.round(performance.now()-t0);
 const json=JSON.stringify(objs);t0=performance.now();await tx('docs',s=>s.put(json,'modelo_json'));out.un_documento_json_ms=Math.round(performance.now()-t0);out.json_MB=+(json.length/1048576).toFixed(1);
 t0=performance.now();const back=await new Promise(r=>{const q=db.transaction('docs').objectStore('docs').get('modelo');q.onsuccess=()=>r(q.result);});out.leer_documento_ms=Math.round(performance.now()-t0);
 return out;});console.log(JSON.stringify(r));await b.close();})();
