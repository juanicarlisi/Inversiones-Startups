// Medicion propia 17-10-2026: ¿dan los mismos bits Math.* de V8 y la libm de Rust compilada a WebAssembly?
import fs from 'fs';
const X=(await WebAssembly.instantiate(fs.readFileSync(new URL('./desrs/target/wasm32-unknown-unknown/release/desrs.wasm', import.meta.url)))).instance.exports;
let a=12345; const rnd=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const N=+process.argv[2]||2e6; const res={};
const cases={
  ln:[u=>u, Math.log, X.f_ln], ln_1mu:[u=>1-u, Math.log, X.f_ln],
  exp:[u=>(u-0.5)*40, Math.exp, X.f_exp], sin:[u=>(u-0.5)*200, Math.sin, X.f_sin], cos:[u=>(u-0.5)*200, Math.cos, X.f_cos],
  pow:[u=>u*10, (x)=>Math.pow(x,1.7), (x)=>X.f_pow(x,1.7)], sqrt:[u=>u*1e6, Math.sqrt, X.f_sqrt],
};
const b1=new Float64Array(1), b2=new Float64Array(1); const i1=new BigInt64Array(b1.buffer), i2=new BigInt64Array(b2.buffer);
for(const [name,[gen,fj,fw]] of Object.entries(cases)){let diff=0,maxulp=0n;
  for(let i=0;i<N;i++){const x=gen(rnd()); b1[0]=fj(x); b2[0]=fw(x); if(i1[0]!==i2[0]){diff++;const d=i1[0]>i2[0]?i1[0]-i2[0]:i2[0]-i1[0]; if(d>maxulp)maxulp=d;}}
  res[name]={muestras:N,distintos:diff,porMillon:+(diff/N*1e6).toFixed(1),maxUlp:Number(maxulp)};}
console.log(JSON.stringify(res,null,1));
