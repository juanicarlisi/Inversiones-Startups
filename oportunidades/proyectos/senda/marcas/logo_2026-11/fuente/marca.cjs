// Etiqueta de la marca para el INPI: el ícono, «senda» y «BIBLIA Y JUEGOS». Salida a 945 px (8 cm a 300 ppp).
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
(async()=>{
 const [f,out]=process.argv.slice(2);
 const ic=fs.readFileSync(f,'utf8').replace(/width="1024" height="1024"/,'width="100%" height="100%"');
 const nombre=fs.readFileSync('/home/user/senda-app/assets/marca/nombre_tinta.svg','utf8').replace(/<svg /,'<svg width="100%" ');
 const html=`<html><head><style>@font-face{font-family:U;src:url(file://${path.resolve('Unbounded_800ExtraBold.ttf')})}
 body{margin:0;background:#fff}#c{width:945px;height:945px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px}
 .ic{width:400px;height:400px;border-radius:92px;overflow:hidden}.plano{border-radius:0}.ic svg{display:block}.n{width:600px}.t{font-family:U;font-size:58px;letter-spacing:7px;color:#17151F;margin-top:-4px}</style></head>
 <body><div id="c"><div class="ic ${process.argv[4]||""}">${ic}</div><div class="n">${nombre}</div><div class="t">BIBLIA Y JUEGOS</div></div></body></html>`;
 fs.writeFileSync('marca_tmp.html',html);
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:945,height:945}});
 await p.goto('file://'+path.resolve('marca_tmp.html')); await p.waitForTimeout(500); await p.locator('#c').screenshot({path:out}); await b.close();})();
