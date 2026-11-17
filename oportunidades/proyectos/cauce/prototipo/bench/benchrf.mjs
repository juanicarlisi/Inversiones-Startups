import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args:['--no-sandbox'] });
for (const [N, ov] of [[2000,false],[10000,true],[20000,true]]) {
  const p = await b.newPage({ viewport:{width:1600,height:900} });
  await p.setContent('<html><body style="margin:0"><div id="c"></div></body></html>');
  await p.addScriptTag({ path: 'rf.bundle.js' });
  const r = await p.evaluate(([N,ov]) => window.runRF(N, ov), [N, ov]);
  console.log('REACTFLOW N='+N+' onlyRenderVisible='+ov, JSON.stringify(r)); await p.close();
}
await b.close();
