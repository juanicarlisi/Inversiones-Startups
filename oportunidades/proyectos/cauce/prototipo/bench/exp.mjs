import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.DOMParser=dom.window.DOMParser; globalThis.getComputedStyle=dom.window.getComputedStyle; globalThis.XMLSerializer=dom.window.XMLSerializer;
const jspdfMod = await import('jspdf'); const jsPDF = jspdfMod.jsPDF; globalThis.jspdf = jspdfMod; window.jspdf = jspdfMod;
await import('svg2pdf.js');
import fs from 'fs';
// A big diagram SVG: 400 boxes with text and orthogonal connectors
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="3370" height="2384" viewBox="0 0 3370 2384">`;
for (let i=0;i<400;i++){ const x=40+(i%20)*165, y=40+Math.floor(i/20)*115;
 s+=`<rect x="${x}" y="${y}" width="120" height="60" rx="8" fill="#e8f0fe" stroke="#1a73e8" stroke-width="1.5"/><text x="${x+60}" y="${y+35}" font-family="helvetica" font-size="12" text-anchor="middle">Tarea ${i} á ñ</text>`;
 if(i%20) s+=`<path d="M${x-45} ${y+30} H${x-20} V${y+30} H${x}" fill="none" stroke="#333" marker-end="url(#a)"/>`; }
s+=`<defs><marker id="a" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs></svg>`;
fs.writeFileSync('diag.svg', s);
const el = new dom.window.DOMParser().parseFromString(s,'image/svg+xml').documentElement;
const t=Date.now();
const doc = new jsPDF({orientation:'landscape', unit:'pt', format:'a0'});
await doc.svg(el, {x:0,y:0,width:3370,height:2384});
fs.writeFileSync('a0.pdf', Buffer.from(doc.output('arraybuffer')));
console.log('svg2pdf A0 ms', Date.now()-t, 'bytes', fs.statSync('a0.pdf').size, 'page', doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
