// Medicion propia del 17-10-2026. Uso: node des2.js <horizonte_min>
// Variante mas rica: 12 estaciones, ruteo probabilistico (10% retrabajo a la estacion anterior), fallas con reparacion, atributos por paquete.
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const {performance}=require('perf_hooks');
class Heap{constructor(c){this.t=new Float64Array(c);this.k=new Int32Array(c);this.e=new Int32Array(c);this.n=0;}
 push(t,k,e){let i=this.n++;const T=this.t,K=this.k,E=this.e;while(i>0){const p=(i-1)>>1;if(T[p]<=t)break;T[i]=T[p];K[i]=K[p];E[i]=E[p];i=p;}T[i]=t;K[i]=k;E[i]=e;}
 pop(){const T=this.t,K=this.k,E=this.e;const rt=T[0],rk=K[0],re=E[0];const n=--this.n;const t=T[n],k=K[n],e=E[n];let i=0;while(true){let c=2*i+1;if(c>=n)break;if(c+1<n&&T[c+1]<T[c])c++;if(T[c]>=t)break;T[i]=T[c];K[i]=K[c];E[i]=E[c];i=c;}T[i]=t;K[i]=k;E[i]=e;this.rt=rt;this.rk=rk;return re;}}
const S=12,servers=Array.from({length:S},(_,i)=>3+(i%3)),iat=0.4;const mean=servers.map(c=>c*0.3*0.8);
const r=mulberry32(7);const exp=m=>-Math.log(1-r())*m;const h=new Heap(1<<20);
const busy=new Int32Array(S),down=new Uint8Array(S),q=Array.from({length:S},()=>[]);const MAXP=1<<21;const born=new Float64Array(MAXP),stage=new Int8Array(MAXP),weight=new Float32Array(MAXP);
let ev=0,done=0,sumT=0,id=0;const H=+process.argv[2]||200000;
const ARR=0,END=1,FAIL=2,REP=3;// kind = tipo*16 + estacion
h.push(exp(iat),ARR*16,-1);for(let s=0;s<S;s++)h.push(exp(600),FAIL*16+s,-1);
function tryStart(s,t){while(!down[s]&&busy[s]<servers[s]&&q[s].length){busy[s]++;const p=q[s].shift();h.push(t+exp(mean[s])*(0.8+0.4*weight[p&(MAXP-1)]),END*16+s,p);}}
const t0=performance.now();
while(h.n>0){const p=h.pop(),t=h.rt,k=h.rk;if(t>H)break;ev++;const ty=k>>4,s=k&15;
 if(ty===ARR){const x=id++&(MAXP-1);born[x]=t;stage[x]=0;weight[x]=r();q[0].push(x);tryStart(0,t);h.push(t+exp(iat),ARR*16,-1);}
 else if(ty===END){busy[s]--;let nx=s+1;if(s>0&&r()<0.1)nx=s-1;if(nx>=S){done++;sumT+=t-born[p];}else{stage[p]=nx;q[nx].push(p);tryStart(nx,t);}tryStart(s,t);}
 else if(ty===FAIL){down[s]=1;h.push(t+exp(15),REP*16+s,-1);}
 else {down[s]=0;h.push(t+exp(600),FAIL*16+s,-1);tryStart(s,t);}}
const dt=(performance.now()-t0)/1000;console.log(JSON.stringify({ev,done,meanT:+(sumT/done).toFixed(3),seconds:+dt.toFixed(3),eventsPerSec:Math.round(ev/dt),paquetesPorSeg:Math.round(done/dt)}));
