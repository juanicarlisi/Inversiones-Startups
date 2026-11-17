import ELK from 'elkjs/lib/elk.bundled.js';
import dagre from '@dagrejs/dagre';
const elk = new ELK();
for (const N of [500, 2000, 5000]) {
  const children = [], edges = [];
  for (let i=0;i<N;i++) children.push({id:'n'+i,width:120,height:60});
  for (let i=1;i<N;i++){ edges.push({id:'e'+i,sources:['n'+Math.floor((i-1)/2)],targets:['n'+i]}); if(i%7==0&&i>10) edges.push({id:'x'+i,sources:['n'+(i-9)],targets:['n'+i]}); }
  let t=Date.now();
  const r = await elk.layout({id:'root',layoutOptions:{'elk.algorithm':'layered','elk.edgeRouting':'ORTHOGONAL','elk.direction':'RIGHT'},children,edges});
  const tElk=Date.now()-t;
  const g=new dagre.graphlib.Graph(); g.setGraph({rankdir:'LR'}); g.setDefaultEdgeLabel(()=>({}));
  children.forEach(c=>g.setNode(c.id,{width:120,height:60})); edges.forEach(e=>g.setEdge(e.sources[0],e.targets[0]));
  t=Date.now(); dagre.layout(g); const tD=Date.now()-t;
  console.log(`N=${N} edges=${edges.length} ELK layered+orthogonal ${tElk} ms (bends sample ${r.edges[5].sections[0].bendPoints?.length??0}) | dagre ${tD} ms`);
}
