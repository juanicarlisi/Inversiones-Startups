// Worker: corre réplicas del hub de 3 etapas (mismo modelo que medicion-motor/des.js)
function run(seed, horizon){
  let a=seed|0; const rnd=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const C=1<<18; const T=new Float64Array(C),K=new Int32Array(C),E=new Int32Array(C); let n=0, rt=0, rk=0;
  const push=(t,k,e)=>{let i=n++;while(i>0){const p=(i-1)>>1;if(T[p]<=t)break;T[i]=T[p];K[i]=K[p];E[i]=E[p];i=p;}T[i]=t;K[i]=k;E[i]=e;};
  const pop=()=>{rt=T[0];rk=K[0];const re=E[0];const m=--n;const t=T[m],k=K[m],e=E[m];let i=0;for(;;){let c=2*i+1;if(c>=m)break;if(c+1<m&&T[c+1]<T[c])c++;if(T[c]>=t)break;T[i]=T[c];K[i]=K[c];E[i]=E[c];i=c;}if(m>0){T[i]=t;K[i]=k;E[i]=e;}return re;};
  const servers=[4,6,5], mean=[0.9,0.9,0.9], iat=0.25; const busy=new Int32Array(3); const QM=(1<<16)-1;
  const qb=[new Int32Array(QM+1),new Int32Array(QM+1),new Int32Array(QM+1)]; const qh=new Int32Array(3), ql=new Int32Array(3);
  const MASK=(1<<20)-1; const born=new Float64Array(1<<20); let ev=0,done=0,sumT=0,id=0; const expo=m=>-Math.log(1-rnd())*m;
  push(expo(iat),0,-1);
  while(n>0){const e=pop();const t=rt,k=rk;if(t>horizon)break;ev++;let s,p;
    if(k===0){p=id++;born[p&MASK]=t;push(t+expo(iat),0,-1);s=0;}
    else{const ss=k-1;busy[ss]--; if(ql[ss]>0){busy[ss]++;const q=qb[ss][qh[ss]];qh[ss]=(qh[ss]+1)&QM;ql[ss]--;push(t+expo(mean[ss]),k,q);}
      if(ss+1<3){s=ss+1;p=e;}else{done++;sumT+=t-born[e&MASK];continue;}}
    if(busy[s]<servers[s]){busy[s]++;push(t+expo(mean[s]),s+1,p);}else{qb[s][(qh[s]+ql[s])&QM]=p;ql[s]++;}}
  return {ev,done,meanT:sumT/done};
}
onmessage=(m)=>{const {cmd}=m.data;
  if(cmd==='run'){const out=m.data.seeds.map(s=>run(s,m.data.H));postMessage(out);}
  else if(cmd==='echo'){postMessage(m.data.payload, m.data.transfer? [m.data.payload.buffer]:[]);}
  else if(cmd==='sab'){const f=new Float64Array(m.data.sab);for(let i=0;i<f.length;i++)f[i]=i*0.5;const flag=new Int32Array(m.data.flag);Atomics.store(flag,0,1);Atomics.notify(flag,0);postMessage('ok');}
};
