process.env.PLAYWRIGHT_BROWSERS_PATH='/opt/pw-browsers';
const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('console',m=>errs.push(m.text()));
await p.goto('file://'+process.cwd()+'/archivo-local/index.html');await p.waitForTimeout(1500);console.log(JSON.stringify(await p.evaluate('window.res')));console.log(errs.slice(0,4).join('\n'));await b.close();})();
