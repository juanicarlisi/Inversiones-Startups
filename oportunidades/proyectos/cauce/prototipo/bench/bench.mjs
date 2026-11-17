import { chromium } from 'playwright-core';
const N = +process.argv[2] || 20000;
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader'] });
async function run(name, scripts, fn) {
  const p = await b.newPage({ viewport:{width:1600,height:900} });
  await p.setContent('<html><body style="margin:0"><div id="c" style="width:1600px;height:900px"></div></body></html>');
  for (const s of scripts) await p.addScriptTag({ path: s });
  const r = await p.evaluate(fn, N);
  console.log(name, JSON.stringify(r)); await p.close();
}
const frames = `async (move) => { const ts=[]; for (let i=0;i<30;i++){ const t=performance.now(); move(i); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); ts.push(performance.now()-t);} ts.sort((a,b)=>a-b); return Math.round(ts[15]); }`;
await run('LEAFER', ['node_modules/leafer-editor/dist/web.min.js'], new Function('N', `return (async()=>{ const frames=${frames};
  const { App, Rect, Text, Line, Group } = LeaferUI; const t0=performance.now();
  const app = new App({ view: 'c', editor: {}, tree:{type:'design'} });
  const kids=[]; const cols=200;
  for (let i=0;i<N;i++){ const x=(i%cols)*160, y=Math.floor(i/cols)*100;
    kids.push(new Group({x,y, children:[ new Rect({width:120,height:60,cornerRadius:8,fill:'#e8f0fe',stroke:'#1a73e8',editable:true}), new Text({x:10,y:22,text:'Tarea '+i,fill:'#000',fontSize:12}) ]}));
    if (i%cols) kids.push(new Line({points:[x-40,y+30,x,y+30],stroke:'#333'})); }
  app.tree.addMany(...kids);
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const create=Math.round(performance.now()-t0);
  const panFit = await frames(i=>{ app.tree.x = -i*20; });
  app.tree.scale = 0.05; await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const panAll = await frames(i=>{ app.tree.x = -i*5; });
  return {create, medianFrameZoom1:panFit, medianFrameAllVisible:panAll};
})()`));
await run('PIXI', ['node_modules/pixi.js/dist/pixi.min.js'], new Function('N', `return (async()=>{ const frames=${frames};
  const t0=performance.now(); const app=new PIXI.Application(); await app.init({width:1600,height:900,antialias:true,background:'#fff',preference:'webgl'});
  document.getElementById('c').appendChild(app.canvas); const world=new PIXI.Container(); app.stage.addChild(world); const cols=200;
  for (let i=0;i<N;i++){ const x=(i%cols)*160, y=Math.floor(i/cols)*100; const g=new PIXI.Graphics().roundRect(0,0,120,60,8).fill('#e8f0fe').stroke({color:'#1a73e8',width:1});
    const c=new PIXI.Container(); c.x=x;c.y=y; c.addChild(g); const tx=new PIXI.Text({text:'Tarea '+i,style:{fontSize:12,fill:'#000'}}); tx.x=10; tx.y=22; c.addChild(tx); c.cullable=true; world.addChild(c);
    if (i%cols){ const l=new PIXI.Graphics().moveTo(x-40,y+30).lineTo(x,y+30).stroke({color:'#333',width:1}); l.cullable=true; world.addChild(l);} }
  app.ticker.stop(); const render=()=>{ PIXI.Culler.shared.cull(world, app.screen); app.render(); };
  render(); const create=Math.round(performance.now()-t0);
  const panFit = await frames(i=>{ world.x=-i*20; render(); });
  world.scale.set(0.05); render();
  const panAll = await frames(i=>{ world.x=-i*5; render(); });
  return {create, medianFrameZoom1:panFit, medianFrameAllVisible:panAll};
})()`));
await run('SVG-DOM', [], new Function('N', `return (async()=>{ const frames=${frames};
  const t0=performance.now(); const ns='http://www.w3.org/2000/svg'; const svg=document.createElementNS(ns,'svg'); svg.setAttribute('width',1600); svg.setAttribute('height',900); const g=document.createElementNS(ns,'g'); svg.appendChild(g); document.getElementById('c').appendChild(svg);
  let h=''; const cols=200; for (let i=0;i<N;i++){ const x=(i%cols)*160, y=Math.floor(i/cols)*100; h+='<g transform="translate('+x+','+y+')"><rect width="120" height="60" rx="8" fill="#e8f0fe" stroke="#1a73e8"/><text x="10" y="35" font-size="12">Tarea '+i+'</text></g>'; if(i%cols) h+='<path d="M'+(x-40)+' '+(y+30)+'H'+x+'" stroke="#333"/>'; }
  g.innerHTML=h; await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); const create=Math.round(performance.now()-t0);
  let s=1; const panFit=await frames(i=>{ g.setAttribute('transform','translate('+(-i*20)+',0) scale('+s+')'); });
  s=0.05; const panAll=await frames(i=>{ g.setAttribute('transform','translate('+(-i*5)+',0) scale('+s+')'); });
  return {create, medianFrameZoom1:panFit, medianFrameAllVisible:panAll};
})()`));
await b.close();
