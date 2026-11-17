import { AvoidLib } from 'libavoid-js';
await AvoidLib.load();
const Avoid = AvoidLib.getInstance();
for (const N of [200, 500, 1000]) {
const router = new Avoid.Router(Avoid.RouterFlag.OrthogonalRouting);
router.setRoutingParameter(Avoid.RoutingParameter.shapeBufferDistance, 8);
const pos=[]; const shapes=[]; const cols=Math.ceil(Math.sqrt(N));
for(let i=0;i<N;i++){ const r={x:(i%cols)*200,y:Math.floor(i/cols)*120,width:120,height:60}; pos.push(r); shapes.push(router.addShape(r)); }
const conns=[]; for(let i=1;i<N;i++){ const a=pos[Math.floor((i-1)/2)], b=pos[i]; conns.push(router.addConnector({x:a.x+120,y:a.y+30,directions:Avoid.ConnDirFlag.ConnDirRight},{x:b.x,y:b.y+30,directions:Avoid.ConnDirFlag.ConnDirLeft})); }
let t=Date.now(); router.processTransaction(); const t1=Date.now()-t;
t=Date.now(); router.moveShape(shapes[5],15,40); router.processTransaction(); const t2=Date.now()-t;
console.log(`libavoid N=${N} conns=${conns.length}: full ${t1} ms, incremental ${t2} ms, pts=${conns[3].displayRoute().length}`);
router.delete();
}
