// Medicion propia 17-10-2026: costo de calcular posiciones interpoladas (sin física) para N bultos en cintas, por cuadro.
// Cada bulto: cinta, tiempo de entrada, posición de entrada, velocidad, y "tope" (posición donde se detiene por acumulación) con hora de tope.
const N=+process.argv[2]||100000, L=200; const cinta=new Int32Array(N), t0=new Float64Array(N), s0=new Float32Array(N), v=new Float32Array(N), sTope=new Float32Array(N);
const ax=new Float32Array(L), ay=new Float32Array(L), dx=new Float32Array(L), dy=new Float32Array(L), largo=new Float32Array(L);
for(let c=0;c<L;c++){ax[c]=Math.random()*500;ay[c]=Math.random()*300;const ang=Math.random()*6.28;dx[c]=Math.cos(ang);dy[c]=Math.sin(ang);largo[c]=20+Math.random()*30;}
for(let i=0;i<N;i++){cinta[i]=i%L;t0[i]=Math.random()*60;s0[i]=0;v[i]=0.5+Math.random();sTope[i]=largo[i%L]-(i/L|0)%20*0.6;}
const X=new Float32Array(N),Y=new Float32Array(N); let best=1e9;
for(let f=0;f<200;f++){const t=60+f/60;const a=performance.now();
  for(let i=0;i<N;i++){const c=cinta[i];let s=s0[i]+v[i]*(t-t0[i]);if(s>sTope[i])s=sTope[i];if(s<0)s=0;X[i]=ax[c]+dx[c]*s;Y[i]=ay[c]+dy[c]*s;}
  const d=performance.now()-a;if(f>20&&d<best)best=d;}
console.log(JSON.stringify({bultos:N,ms_por_cuadro_mejor:+best.toFixed(3)}));
