const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const [f,out,size]=process.argv.slice(2); const n=+(size||1024);
const s=fs.readFileSync(f,'utf8').replace(/width="1024" height="1024"/,`width="${n}" height="${n}"`);
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:n,height:n}});
await p.setContent(`<html><body style="margin:0">${s}</body></html>`); await p.waitForTimeout(200);
await p.screenshot({path:out,omitBackground:true}); await b.close();})();
