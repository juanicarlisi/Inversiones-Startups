import { chromium } from 'playwright-core';
import fs from 'fs';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args:['--no-sandbox'] });
const p = await b.newPage();
await p.setContent('<html><body></body></html>');
for (const f of ['node_modules/jspdf/dist/jspdf.umd.min.js','node_modules/svg2pdf.js/dist/svg2pdf.umd.min.js','node_modules/pptxgenjs/dist/pptxgen.bundle.js']) await p.addScriptTag({path:f});
const svg = fs.readFileSync('diag.svg','utf8');
const out = await p.evaluate(async (svg) => {
  const host = document.createElement('div'); host.innerHTML = svg; document.body.appendChild(host);
  const el = host.querySelector('svg');
  const { jsPDF } = window.jspdf; const r = {};
  let t = performance.now();
  const a0 = new jsPDF({orientation:'landscape', unit:'pt', format:'a0'});
  await a0.svg(el, {x:0,y:0,width:3370,height:2384});
  r.a0ms = Math.round(performance.now()-t); r.a0 = a0.output('datauristring').split(',')[1];
  // Tiled: A0 drawing split into A4 landscape pages (842x595) at 100% scale
  t = performance.now();
  const tiles = new jsPDF({orientation:'landscape', unit:'pt', format:'a4'}); let n=0;
  for (let ty=0; ty<2384; ty+=595-20) for (let tx=0; tx<3370; tx+=842-20) { if(n++) tiles.addPage('a4','landscape'); await tiles.svg(el,{x:-tx,y:-ty,width:3370,height:2384}); }
  r.tilesMs = Math.round(performance.now()-t); r.pages = n; r.tiles = tiles.output('datauristring').split(',')[1];
  // PPTX with native editable shapes and connectors
  t = performance.now();
  const pptx = new PptxGenJS(); const s = pptx.addSlide();
  for (let i=0;i<30;i++){ const x=0.3+(i%6)*1.6, y=0.4+Math.floor(i/6)*1.0;
    s.addText('Tarea '+i, {shape: pptx.ShapeType.roundRect, x, y, w:1.2, h:0.6, fill:{color:'E8F0FE'}, line:{color:'1A73E8', width:1}, fontSize:10, align:'center'});
    if (i%6) s.addShape(pptx.ShapeType.line, {x:x-0.4, y:y+0.3, w:0.4, h:0, line:{color:'333333', width:1, endArrowType:'triangle'}}); }
  r.pptx = await pptx.write({outputType:'base64'}); r.pptxMs = Math.round(performance.now()-t);
  return r;
}, svg);
fs.writeFileSync('a0.pdf', Buffer.from(out.a0,'base64'));
fs.writeFileSync('tiles.pdf', Buffer.from(out.tiles,'base64'));
fs.writeFileSync('diag.pptx', Buffer.from(out.pptx,'base64'));
console.log({a0ms:out.a0ms, tilesMs:out.tilesMs, pages:out.pages, pptxMs:out.pptxMs});
await b.close();
