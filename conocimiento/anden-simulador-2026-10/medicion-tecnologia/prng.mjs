// Medicion propia 17-10-2026: velocidad de generadores con semilla en V8 (Node 22). Suma para evitar eliminación de código.
const N=50_000_000;
function mulberry32(a){return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function sfc32(a,b,c,d){return()=>{a|=0;b|=0;c|=0;d|=0;const t=(a+b|0)+d|0;d=d+1|0;a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);c=c+t|0;return(t>>>0)/4294967296;};}
function xoshiro128ss(a,b,c,d){return()=>{const t=b<<9;let r=Math.imul(b,5);r=Math.imul(r<<7|r>>>25,9);c^=a;d^=b;b^=c;a^=d;c^=t;d=d<<11|d>>>21;return(r>>>0)/4294967296;};}
// MRG32k3a de L'Ecuyer (1999): aritmética en doble precisión exacta (todos los productos < 2^53)
function mrg32k3a(seed=12345){let s10=seed,s11=seed,s12=seed,s20=seed,s21=seed,s22=seed;const m1=4294967087,m2=4294944443,norm=2.328306549295727688e-10;
 return()=>{let p1=1403580*s11-810728*s10;let k=Math.floor(p1/m1);p1-=k*m1;if(p1<0)p1+=m1;s10=s11;s11=s12;s12=p1;
  let p2=527612*s22-1370589*s20;k=Math.floor(p2/m2);p2-=k*m2;if(p2<0)p2+=m2;s20=s21;s21=s22;s22=p2;return(p1>p2?(p1-p2):(p1-p2+m1))*norm;};}
const gens={'Math.random (sin semilla)':()=>Math.random,'mulberry32':()=>mulberry32(1),'sfc32':()=>sfc32(1,2,3,4),'xoshiro128**':()=>xoshiro128ss(1,2,3,4),'MRG32k3a':()=>mrg32k3a()};
for(const [n,mk] of Object.entries(gens)){let best=Infinity;for(let r=0;r<3;r++){const g=mk();let s=0;const t0=performance.now();for(let i=0;i<N;i++)s+=g();const dt=performance.now()-t0;best=Math.min(best,dt);if(s<0)console.log(s);}
 console.log(n.padEnd(28),(N/best/1e3).toFixed(0),'millones/s');}
// costo de convertir a exponencial
{const g=mulberry32(1);let s=0;const t0=performance.now();for(let i=0;i<N;i++)s+=-Math.log(1-g());const dt=performance.now()-t0;console.log('mulberry32 + exponencial'.padEnd(28),(N/dt/1e3).toFixed(0),'millones/s',s>0?'':'x');}
