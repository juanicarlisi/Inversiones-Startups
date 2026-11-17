// Minimal DES: M/M/c with binary heap, measures events/sec and checks vs Erlang C
class Heap{constructor(){this.a=[]}push(t,k,d){const a=this.a;a.push([t,k,d]);let i=a.length-1;while(i>0){const p=(i-1)>>1;if(a[p][0]<=a[i][0])break;[a[p],a[i]]=[a[i],a[p]];i=p}}
pop(){const a=this.a,top=a[0],last=a.pop();if(a.length){a[0]=last;let i=0;for(;;){let l=2*i+1,r=l+1,m=i;if(l<a.length&&a[l][0]<a[m][0])m=l;if(r<a.length&&a[r][0]<a[m][0])m=r;if(m===i)break;[a[m],a[i]]=[a[i],a[m]];i=m}}return top}get size(){return this.a.length}}
let seed=12345;function rnd(){seed=(seed*1103515245+12345)%2147483648;return (seed+0.5)/2147483648}
const exp=r=>-Math.log(rnd())/r;
function sim(lam,mu,c,N){const h=new Heap();let busy=0,q=[],done=0,wsum=0,ev=0;h.push(exp(lam),0,null);
while(done<N){const [t,k,d]=h.pop();ev++;if(k===0){h.push(t+exp(lam),0,null);if(busy<c){busy++;h.push(t+exp(mu),1,t)}else q.push(t)}else{done++;if(q.length){const a=q.shift();wsum+=t-a;h.push(t+exp(mu),1,a)}else busy--}}
return {wq:wsum/N,ev}}
function erlangC(lam,mu,c){const a=lam/mu,rho=a/c;let s=0,f=1;for(let k=0;k<c;k++){if(k>0)f*=k;s+=Math.pow(a,k)/f}f*=c;const top=Math.pow(a,c)/f/(1-rho);const pw=top/(s+top);return pw/(c*mu-lam)}
const t0=Date.now();const r=sim(9,1,10,2e6);const dt=(Date.now()-t0)/1000;
console.log('events',r.ev,'secs',dt,'events/s',Math.round(r.ev/dt));console.log('Wq sim',r.wq.toFixed(4),'Wq ErlangC',erlangC(9,1,10).toFixed(4));
