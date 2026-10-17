// Medicion propia del 17-10-2026 para conocimiento/anden-simulador-2026-10/frontera-ia.md. Uso: node des.js <horizonte_min>
// Motor DES minimo: heap binario + PRNG con semilla. Hub de 3 etapas en serie (induccion, clasificacion, carga), c servidores por etapa.
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
class Heap{constructor(){this.t=new Float64Array(1<<20);this.k=new Int32Array(1<<20);this.e=new Int32Array(1<<20);this.n=0;}
 push(t,k,e){let i=this.n++;const T=this.t,K=this.k,E=this.e;while(i>0){const p=(i-1)>>1;if(T[p]<=t)break;T[i]=T[p];K[i]=K[p];E[i]=E[p];i=p;}T[i]=t;K[i]=k;E[i]=e;}
 pop(){const T=this.t,K=this.k,E=this.e;const rt=T[0],rk=K[0],re=E[0];const n=--this.n;const t=T[n],k=K[n],e=E[n];let i=0;while(true){let c=2*i+1;if(c>=n)break;if(c+1<n&&T[c+1]<T[c])c++;if(T[c]>=t)break;T[i]=T[c];K[i]=K[c];E[i]=E[c];i=c;}T[i]=t;K[i]=k;E[i]=e;this.rt=rt;this.rk=rk;return re;}}
function run(seed,horizon){const r=mulberry32(seed);const exp=m=>-Math.log(1-r())*m;
 const stages=3,servers=[4,6,5],mean=[1/4*3.6,1/6*5.4,1/5*4.5];// medias de servicio (min)
 const lam=1/0.95*0+1.0; // 1 paquete/min*... llegada media 1 min/... escala
 const iat=0.25; // 4 paquetes por minuto
 const busy=new Int32Array(stages);const qs=[[],[],[]];const h=new Heap();let ev=0,done=0,sumT=0;const born=new Float64Array(1<<22);let id=0;
 h.push(exp(iat),0,-1);// kind 0 = llegada; kind 1..3 = fin servicio etapa s
 while(h.n>0){const e=h.pop();const t=h.rt,k=h.rk;if(t>horizon)break;ev++;
  if(k===0){const p=id++;born[p&((1<<22)-1)]=t;h.push(t+exp(iat),0,-1);enter(0,p,t);} 
  else{const s=k-1;busy[s]--;if(qs[s].length){busy[s]++;const q=qs[s].shift();h.push(t+exp(mean[s]),k,q);} if(s+1<stages)enter(s+1,e,t);else{done++;sumT+=t-born[e&((1<<22)-1)];}}}
 function enter(s,p,t){if(busy[s]<servers[s]){busy[s]++;h.push(t+exp(mean[s]),s+1,p);}else qs[s].push(p);}
 return {ev,done,wip:id-done,meanT:sumT/done};}
module.exports={run};
if(require.main===module){const H=+process.argv[2]||2e6;const t0=performance.now();const res=run(42,H);const dt=(performance.now()-t0)/1000;console.log(JSON.stringify({...res,seconds:dt,eventsPerSec:Math.round(res.ev/dt)}));}
