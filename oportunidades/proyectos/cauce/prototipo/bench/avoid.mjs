import { AvoidLib } from 'libavoid-js';
await AvoidLib.load();
const Avoid = AvoidLib.getInstance();
for (const N of [200, 500, 1000]) {
const router = new Avoid.Router(Avoid.RouterFlag.OrthogonalRouting);
router.setRoutingParameter(Avoid.RoutingParameter.shapeBufferDistance, 8);
const shapes=[]; const cols=Math.ceil(Math.sqrt(N));
for(let i=0;i<N;i++){ const s=router.addShape({x:(i%cols)*200,y:Math.floor(i/cols)*120,width:120,height:60});  shapes.push(s);}
const conns=[]; for(let i=1;i<N;i++){ conns.push(router.addConnector({shape:shapes[Math.floor((i-1)/2)]},{shape:shapes[i]})); }
let t=Date.now(); router.processTransaction(); const t1=Date.now()-t;
t=Date.now(); router.moveShape(shapes[5],15,40); router.processTransaction(); const t2=Date.now()-t;
console.log(`libavoid N=${N} conns=${conns.length}: full route ${t1} ms, incremental move ${t2} ms, sample route pts=${conns[3].displayRoute().length}`);
router.delete();
}
