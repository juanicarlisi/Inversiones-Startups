// Ruteo a escala ciudad (CABA, ~35k nodos / 75k aristas) en JS/WASM: Dijkstra, A*, contraction-hierarchy-js y fast_paths (Rust->WASM).
import fs from "node:fs"; import { performance } from "node:perf_hooks";
import CH from "contraction-hierarchy-js";
const buf = fs.readFileSync("datos/caba_grafo.bin"); const meta = JSON.parse(fs.readFileSync("datos/caba_pares.json", "utf8"));
const n = meta.n, m = meta.m; let o = 0;
const X = new Float64Array(buf.buffer, buf.byteOffset + o, n); o += 8*n; const Y = new Float64Array(buf.buffer, buf.byteOffset + o, n); o += 8*n;
const SRC = new Int32Array(buf.buffer.slice(buf.byteOffset + o, buf.byteOffset + o + 4*m)); o += 4*m; const DST = new Int32Array(buf.buffer.slice(buf.byteOffset + o, buf.byteOffset + o + 4*m)); o += 4*m;
const W = new Float32Array(buf.buffer.slice(buf.byteOffset + o, buf.byteOffset + o + 4*m));
const out = { nodos: n, aristas: m };
// CSR
const off = new Int32Array(n+1); for (let i = 0; i < m; i++) off[SRC[i]+1]++; for (let i = 0; i < n; i++) off[i+1] += off[i];
const adjT = new Int32Array(m), adjW = new Float64Array(m), cur = off.slice(0, n);
for (let i = 0; i < m; i++) { const p = cur[SRC[i]]++; adjT[p] = DST[i]; adjW[p] = W[i]; }
// heap binario
class Heap { constructor(c){this.k=new Float64Array(c);this.v=new Int32Array(c);this.n=0;}
  push(key,val){let i=this.n++;const k=this.k,v=this.v;while(i>0){const p=(i-1)>>1;if(k[p]<=key)break;k[i]=k[p];v[i]=v[p];i=p;}k[i]=key;v[i]=val;}
  pop(){const k=this.k,v=this.v,rv=v[0];const key=k[--this.n],val=v[this.n];let i=0;const N=this.n;for(;;){let c=2*i+1;if(c>=N)break;if(c+1<N&&k[c+1]<k[c])c++;if(k[c]>=key)break;k[i]=k[c];v[i]=v[c];i=c;}k[i]=key;v[i]=val;return rv;} }
const dist = new Float64Array(n), done = new Uint8Array(n), heap = new Heap(m + 8);
function buscar(a, b, astar) {
  dist.fill(Infinity); done.fill(0); heap.n = 0; dist[a] = 0; let settled = 0;
  const vm = meta.vmax_ms, cosl = Math.cos(Y[b]*Math.PI/180), R = 6371008.8*Math.PI/180;
  const h = astar ? (u) => Math.hypot((X[b]-X[u])*cosl, Y[b]-Y[u]) * R / vm : () => 0;
  heap.push(h(a), a);
  while (heap.n) { const u = heap.pop(); if (done[u]) continue; done[u] = 1; settled++; if (u === b) break;
    for (let e = off[u]; e < off[u+1]; e++) { const t = adjT[e], nd = dist[u] + adjW[e]; if (nd < dist[t]) { dist[t] = nd; heap.push(nd + h(t), t); } } }
  return { d: dist[b], settled };
}
const P = meta.pares, ref = meta.ref_s; const ok = (x, i) => Math.abs(x - ref[i]) <= Math.max(0.05, ref[i]*0.002);
function bench(nombre, fn) { for (let i = 0; i < 20; i++) fn(P[i%P.length][0], P[i%P.length][1]);
  const t0 = performance.now(); let good = 0, extra = 0; for (let i = 0; i < P.length; i++) { const r = fn(P[i][0], P[i][1]); const d = typeof r === "number" ? r : r.d; if (ok(d, i)) good++; if (r.settled) extra += r.settled; }
  const ms = (performance.now() - t0) / P.length; out[nombre] = { ms_por_consulta: +ms.toFixed(4), correctas: `${good}/${P.length}`, ...(extra ? { nodos_asentados_prom: Math.round(extra/P.length) } : {}) }; }
bench("js_dijkstra", (a, b) => buscar(a, b, false)); bench("js_astar", (a, b) => buscar(a, b, true));
// contraction-hierarchy-js (JS puro, MIT) - se puede saltear con SIN_CHJS=1 (la preparacion tarda minutos)
if (!process.env.SIN_CHJS) { const { Graph } = CH; const g = new Graph();
  for (let i = 0; i < m; i++) g.addEdge(String(SRC[i]), String(DST[i]), { _id: i, _cost: W[i] });
  const t0 = performance.now(); g.contractGraph(); out.chjs_preparacion_s = +((performance.now() - t0)/1000).toFixed(1);
  const finder = g.createPathfinder({});
  bench("chjs_consulta", (a, b) => { const r = finder.queryContractionHierarchy(String(a), String(b)); return r && r.total_cost != null ? r.total_cost : Infinity; }); }
// Rust fast_paths -> WASM
{ const bytes = fs.readFileSync("web/ch_wasm.wasm"); const mod = await WebAssembly.compile(bytes); out.wasm_imports = WebAssembly.Module.imports(mod).length;
  const { exports: E } = await WebAssembly.instantiate(mod, {}); const put = (arr) => { const p = E.reservar(arr.byteLength); new Uint8Array(E.memory.buffer, p, arr.byteLength).set(new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength)); return p; };
  const w32 = new Uint32Array(m); for (let i = 0; i < m; i++) w32[i] = Math.round(W[i]*1000);
  const ps = put(new Uint32Array(SRC.buffer)), pd = put(new Uint32Array(DST.buffer)), pw = put(w32);
  const t0 = performance.now(); const e = E.construir(n, m, ps, pd, pw); out.wasm_ch_preparacion_s = +((performance.now() - t0)/1000).toFixed(2); out.wasm_ch_aristas_con_atajos = e; out.wasm_bytes = bytes.length;
  bench("wasm_ch_consulta", (a, b) => { const r = E.consulta(a, b); return r < 0 ? Infinity : Number(r)/1000; });
  const po = E.reservar(4*20000); const t1 = performance.now(); let k = 0; for (let i = 0; i < P.length; i++) k += E.camino(P[i][0], P[i][1], po, 20000);
  out.wasm_ch_camino_completo_ms = +((performance.now() - t1)/P.length).toFixed(4); out.wasm_ch_nodos_por_camino_prom = Math.round(k/P.length); }
fs.writeFileSync("datos/medidas_ruteo_js.json", JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
