// Medicion propia 17-10-2026: mismo hub en JS (colas en anillo) y en Rust->WebAssembly, en V8 (Node 22).
import fs from 'fs';
function runJS(seed, horizon, LOG=Math.log){
  let a=seed|0; const rnd=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const C=1<<20; const T=new Float64Array(C),K=new Int32Array(C),E=new Int32Array(C); let n=0;
  const push=(t,k,e)=>{let i=n++;while(i>0){const p=(i-1)>>1;if(T[p]<=t)break;T[i]=T[p];K[i]=K[p];E[i]=E[p];i=p;}T[i]=t;K[i]=k;E[i]=e;};
  let rt=0,rk=0;
  const pop=()=>{rt=T[0];rk=K[0];const re=E[0];const m=--n;const t=T[m],k=K[m],e=E[m];let i=0;for(;;){let c=2*i+1;if(c>=m)break;if(c+1<m&&T[c+1]<T[c])c++;if(T[c]>=t)break;T[i]=T[c];K[i]=K[c];E[i]=E[c];i=c;}if(m>0){T[i]=t;K[i]=k;E[i]=e;}return re;};
  const servers=[4,6,5], mean=[0.25*3.6,1/6*5.4,0.2*4.5], iat=0.25;
  const busy=new Int32Array(3); const QM=(1<<16)-1; const qb=[new Int32Array(QM+1),new Int32Array(QM+1),new Int32Array(QM+1)]; const qh=new Int32Array(3), ql=new Int32Array(3);
  const MASK=(1<<22)-1; const born=new Float64Array(1<<22); let ev=0,done=0,sumT=0,id=0;
  const expo=m=>-LOG(1-rnd())*m;
  push(expo(iat),0,-1);
  while(n>0){const e=pop();const t=rt,k=rk;if(t>horizon)break;ev++;let s,p;
    if(k===0){p=id++;born[p&MASK]=t;push(t+expo(iat),0,-1);s=0;}
    else{const ss=k-1;busy[ss]--; if(ql[ss]>0){busy[ss]++;const q=qb[ss][qh[ss]];qh[ss]=(qh[ss]+1)&QM;ql[ss]--;push(t+expo(mean[ss]),k,q);}
      if(ss+1<3){s=ss+1;p=e;}else{done++;sumT+=t-born[e&MASK];continue;}}
    if(busy[s]<servers[s]){busy[s]++;push(t+expo(mean[s]),s+1,p);}else{qb[s][(qh[s]+ql[s])&QM]=p;ql[s]++;}}
  return {ev,done,meanT:sumT/done};
}
const X=(await WebAssembly.instantiate(fs.readFileSync(new URL('./desrs/target/wasm32-unknown-unknown/release/desrs.wasm', import.meta.url)))).instance.exports;
for (const H of [60, 480, 1440, 10080]) { let distintos=0, maxRel=0; const S=50;
  for (let s=1;s<=S;s++){ const a=runJS(s,H,Math.log), b=runJS(s,H,X.f_ln); if (a.meanT!==b.meanT || a.done!==b.done){distintos++; maxRel=Math.max(maxRel,Math.abs(a.meanT-b.meanT)/a.meanT);} }
  console.log(JSON.stringify({horizonte_min:H, semillas:S, resultadosDistintos:distintos, maxDifRelativa:maxRel}));
}
