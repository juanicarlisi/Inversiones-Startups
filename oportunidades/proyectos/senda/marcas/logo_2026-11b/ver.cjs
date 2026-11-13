const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:700}});
const n=['C_lany','C_lany_indigo','C_lany_crema','C_lany_menta'];const svgs=n.map(x=>fs.readFileSync(x+'.svg','utf8').replace('<svg ','<svg width="100%" height="100%" '));
const ic=(s,t,r)=>`<div style="width:${t}px;height:${t}px;border-radius:${r}%;overflow:hidden;display:inline-block;margin:8px;vertical-align:bottom">${s}</div>`;
let h='<body style="margin:0;background:#e9e9ef;font-family:sans-serif">';
for(const s of svgs){h+='<div style="padding:10px">'+ic(s,300,22.4)+ic(s,120,22.4)+ic(s,60,22.4)+ic(s,40,22.4)+ic(s,120,50)+'<span style="display:inline-block;background:#111;padding:8px">'+ic(s,60,22.4)+ic(s,40,50)+'</span></div>';}
await p.setContent(h);await p.screenshot({path:'ver.png',fullPage:true});await b.close();})();
