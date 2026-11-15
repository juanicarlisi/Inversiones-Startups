const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1024}});
for(const n of ['1_s_camino','2_libro_alba','3_lany']){const s=fs.readFileSync('finales/'+n+'.svg','utf8').replace('<svg ','<svg width="1024" height="1024" ');
await p.setContent('<body style="margin:0">'+s+'</body>');await p.screenshot({path:'finales/'+n+'_1024.png',clip:{x:0,y:0,width:1024,height:1024}});}
await b.close();})();
