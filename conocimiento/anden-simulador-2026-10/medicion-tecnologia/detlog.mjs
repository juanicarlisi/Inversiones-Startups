// Medicion propia 17-10-2026: logaritmo determinista en JS puro (port de fdlibm e_log.c, solo + - * / exactos IEEE 754).
const F=new Float64Array(1), I=new Int32Array(F.buffer); // little-endian: I[1]=alto, I[0]=bajo
const ln2_hi=6.93147180369123816490e-01, ln2_lo=1.90821492927058770002e-10, two54=1.80143985094819840000e+16,
Lg1=6.666666666666735130e-01,Lg2=3.999999999940941908e-01,Lg3=2.857142874366239149e-01,Lg4=2.222219843214978396e-01,
Lg5=1.818357216161805012e-01,Lg6=1.531383769920937332e-01,Lg7=1.479819860511658591e-01;
export function logDet(x){
  F[0]=x; let hx=I[1]; const lx=I[0]; let k=0;
  if(hx<0x00100000){ if(((hx&0x7fffffff)|lx)===0) return -Infinity; if(hx<0) return NaN; k-=54; x*=two54; F[0]=x; hx=I[1]; }
  if(hx>=0x7ff00000) return x+x;
  k+=(hx>>20)-1023; hx&=0x000fffff; let i=(hx+0x95f64)&0x100000; F[0]=x; I[1]=hx|(i^0x3ff00000); x=F[0]; k+=(i>>20);
  const f=x-1.0;
  if((0x000fffff&(2+hx))<3){ if(f===0){ if(k===0) return 0; const dk=k; return dk*ln2_hi+dk*ln2_lo; }
    const R=f*f*(0.5-0.33333333333333333*f); if(k===0) return f-R; const dk=k; return dk*ln2_hi-((R-dk*ln2_lo)-f); }
  const s=f/(2.0+f), dk=k, z=s*s; i=hx-0x6147a; const w=z*z; const j=0x6b851-hx;
  const t1=w*(Lg2+w*(Lg4+w*Lg6)), t2=z*(Lg1+w*(Lg3+w*(Lg5+w*Lg7))); i|=j; const R=t2+t1;
  if(i>0){ const hfsq=0.5*f*f; if(k===0) return f-(hfsq-s*(hfsq+R)); return dk*ln2_hi-((hfsq-(s*(hfsq+R)+dk*ln2_lo))-f); }
  if(k===0) return f-s*(f-R); return dk*ln2_hi-((s*(f-R)-dk*ln2_lo)-f);
}
if (import.meta.url === `file://${process.argv[1]}`) {
  let a=99; const rnd=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const N=5e6; let diff=0; const A=new Float64Array(1),B=new Float64Array(1),AI=new BigInt64Array(A.buffer),BI=new BigInt64Array(B.buffer);
  const gens=[u=>u,u=>1-u,u=>u*1e6,u=>Math.pow(10,(u-0.5)*600),u=>u*1e-310];
  for(const g of gens){let d=0;for(let n=0;n<N/5;n++){const x=g(rnd());A[0]=Math.log(x);B[0]=logDet(x);if(AI[0]!==BI[0])d++;}diff+=d;}
  console.log(JSON.stringify({muestras:N,distintosDeMathLog:diff}));
  for(const [nombre,fn] of [['Math.log',Math.log],['logDet (JS puro)',logDet]]){let s=0;const t0=performance.now();for(let n=0;n<2e7;n++)s+=fn(1-rnd());const dt=performance.now()-t0;console.log(nombre.padEnd(18),(2e7/dt/1e3).toFixed(0),'millones/s',s<0?'':'');}
}
