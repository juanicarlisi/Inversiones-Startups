// Medicion propia 17-10-2026: el mismo hub de 3 etapas escrito "como SimPy" (procesos con generadores y objetos) en JS.
// Objetivo: medir cuánto cuesta la API cómoda frente al núcleo con arreglos tipados (js_vs_wasm.mjs).
function sim(seed,H){
  let a=seed|0; const rnd=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const expo=m=>-Math.log(1-rnd())*m;
  const heap=[]; let now=0, seq=0, ev=0;
  const less=(x,y)=>x.t<y.t||(x.t===y.t&&x.s<y.s);
  const push=(e)=>{heap.push(e);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(!less(e,heap[p]))break;heap[i]=heap[p];i=p;}heap[i]=e;};
  const pop=()=>{const top=heap[0];const last=heap.pop();if(heap.length){let i=0;const n=heap.length;for(;;){let c=2*i+1;if(c>=n)break;if(c+1<n&&less(heap[c+1],heap[c]))c++;if(!less(heap[c],last))break;heap[i]=heap[c];i=c;}heap[i]=last;}return top;};
  const schedule=(dt,proc)=>push({t:now+dt,s:seq++,proc});
  class Resource{constructor(c){this.c=c;this.busy=0;this.q=[];}}
  const step=(proc)=>{const r=proc.it.next();if(r.done)return;const cmd=r.value;
    if(cmd.type==='timeout')schedule(cmd.dt,proc);
    else if(cmd.type==='request'){const R=cmd.res;if(R.busy<R.c){R.busy++;schedule(0,proc);}else R.q.push(proc);}
    else if(cmd.type==='release'){const R=cmd.res;if(R.q.length){const nx=R.q.shift();schedule(0,nx);}else R.busy--;schedule(0,proc);} };
  const res=[new Resource(4),new Resource(6),new Resource(5)], mean=[0.9,0.9,0.9]; let done=0,sumT=0;
  function* paquete(){const t0=now;for(let s=0;s<3;s++){yield {type:'request',res:res[s]};yield {type:'timeout',dt:expo(mean[s])};yield {type:'release',res:res[s]};}done++;sumT+=now-t0;}
  function* fuente(){for(;;){yield {type:'timeout',dt:expo(0.25)};const p={it:paquete()};schedule(0,p);}}
  const f={it:fuente()};schedule(0,f);
  while(heap.length){const e=pop();if(e.t>H)break;now=e.t;ev++;step(e.proc);}
  return {ev,done,meanT:sumT/done};
}
const H=+process.argv[2]||2e5;
for(let r=0;r<3;r++){const t0=performance.now();const o=sim(42,H);const dt=(performance.now()-t0)/1000;console.log(JSON.stringify({...o,seconds:+dt.toFixed(2),eventosPorSeg:Math.round(o.ev/dt),paquetesPorSeg:Math.round(o.done/dt)}));}
