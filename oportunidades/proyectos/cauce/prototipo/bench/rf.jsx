import React, { memo } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactFlow, ReactFlowProvider, useReactFlow, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
const Box = memo(({ data }) => (<div style={{width:120,height:60,borderRadius:8,background:'#e8f0fe',border:'1px solid #1a73e8',font:'12px sans-serif',display:'flex',alignItems:'center',justifyContent:'center'}}><Handle type="target" position={Position.Left}/>{data.label}<Handle type="source" position={Position.Right}/></div>));
const nodeTypes = { box: Box };
window.runRF = (N, onlyVisible) => new Promise((resolve) => {
  const cols = 200; const nodes = [], edges = [];
  for (let i=0;i<N;i++){ nodes.push({id:'n'+i,type:'box',position:{x:(i%cols)*160,y:Math.floor(i/cols)*100},data:{label:'Tarea '+i}}); if(i%cols) edges.push({id:'e'+i,source:'n'+(i-1),target:'n'+i,type:'step'}); }
  function Probe(){ const rf = useReactFlow(); window.rf = rf; return null; }
  const t0 = performance.now();
  createRoot(document.getElementById('c')).render(<ReactFlowProvider><div style={{width:1600,height:900}}><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onlyRenderVisibleElements={onlyVisible} defaultViewport={{x:0,y:0,zoom:1}} minZoom={0.01}/></div><Probe/></ReactFlowProvider>);
  const raf2 = () => new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  (async () => { await raf2(); await raf2(); const create = Math.round(performance.now()-t0);
    const frames = async (fn) => { const ts=[]; for (let i=0;i<30;i++){ const t=performance.now(); fn(i); await raf2(); ts.push(performance.now()-t);} ts.sort((a,b)=>a-b); return Math.round(ts[15]); };
    const z1 = await frames(i => window.rf.setViewport({x:-i*20,y:0,zoom:1}));
    const all = await frames(i => window.rf.setViewport({x:-i*5,y:0,zoom:0.05}));
    resolve({create, medianFrameZoom1:z1, medianFrameAllVisible:all, rendered: document.querySelectorAll('.react-flow__node').length});
  })();
});
