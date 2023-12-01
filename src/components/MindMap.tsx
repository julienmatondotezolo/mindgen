"use client"

import React, { useCallback, useState } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, Controls, MiniMap, Background, BackgroundVariant } from 'reactflow';
 
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

function Mindmap() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [name, setName] = useState("");

  const addNode = () => {
    setNodes((e) =>
      e.concat({
        id: (e.length + 1).toString(),
        data: { label: `${name}` },
        position: {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        },
      })
    );
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{position: 'relative', width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <Background color="#ccc" variant="dots" gap={12} size={1} />
        <Background
          id="2"
          gap={100}
          color="#F4F4F4"
          variant={BackgroundVariant.Lines}
        />
      </ReactFlow>
      <div style={{position: 'fixed', left:'45%', bottom: '20px'}}>
         <input
           type="text"
           onChange={(e) => setName(e.target.value)}
           name="title"
         />
         <button type="button" onClick={addNode}>
           Add Node
         </button>
       </div>
    </div>
  )
}

export default Mindmap;
