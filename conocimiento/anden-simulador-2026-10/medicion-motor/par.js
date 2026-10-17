// Medicion propia del 17-10-2026. Uso: node par.js <hilos> <replicas> <horizonte_min>
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
if(isMainThread){const W=+process.argv[2]||4,R=+process.argv[3]||40,H=+process.argv[4]||60*24*7;
 const t0=performance.now();let pending=W,results=[];const per=Math.ceil(R/W);
 for(let w=0;w<W;w++){const wk=new Worker(__filename,{workerData:{seeds:Array.from({length:per},(_,i)=>1000+w*per+i),H}});
  wk.on('message',m=>{results.push(...m);if(--pending===0){const dt=(performance.now()-t0)/1000;const ev=results.reduce((a,b)=>a+b.ev,0);
   const m_=results.map(r=>r.meanT);const mu=m_.reduce((a,b)=>a+b,0)/m_.length;const sd=Math.sqrt(m_.reduce((a,b)=>a+(b-mu)**2,0)/(m_.length-1));
   console.log(JSON.stringify({workers:W,reps:results.length,horizon_min:H,seconds:+dt.toFixed(3),eventsPerSec:Math.round(ev/dt),meanT:+mu.toFixed(4),ci95:+(1.96*sd/Math.sqrt(m_.length)).toFixed(4)}));}});}}
else{const {run}=require('./des.js');parentPort.postMessage(workerData.seeds.map(s=>run(s,workerData.H)));}
