process.env.PLAYWRIGHT_BROWSERS_PATH='/opt/pw-browsers';
const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{const which=process.argv[2]||'all'; const port=+process.argv[3]||9871;
 const b=await chromium.launch({args:(process.argv[4]||'').split(' ').filter(Boolean)}); const p=await b.newPage(); p.on('console',m=>console.error('console:',m.text())); p.on('pageerror',e=>console.error('err:',e.message));
 await p.goto(`http://localhost:${port}/`); await p.waitForFunction('window.ready===true');
 const run=async(expr)=>{const r=await p.evaluate(expr);console.log(JSON.stringify(r));};
 if(which==='env'||which==='all') await run('T.env()');
 if(which==='par'||which==='all'){ for(const w of [1,2,4]) await run(`T.parallel(${w},40,10080)`); }
 if(which==='msg'||which==='all'){ for(const n of [100000,1000000]) await run(`T.messaging(${n})`); }
 if(which==='idb'||which==='all') await run('T.idb(50,100000)');
 if(which==='gzip'||which==='all') await run('T.gzip(1000000)');
 if(which==='c2d'||which==='all'){ for(const n of [1000,10000,50000,100000]) await run(`T.canvas2d(${n})`); }
 if(which==='three'||which==='all'){ for(const n of [1000,10000,100000,1000000]) await run(`T.three(${n})`); for(const n of [1000,10000]) await run(`T.threeMeshes(${n})`);}
 await b.close();})();
