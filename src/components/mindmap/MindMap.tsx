"use client";

import "reactflow/dist/style.css";

import { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  useEdgesState,
  useNodesState,
} from "reactflow";

import { convertToNestedArray } from "@/utils";

import NavControls from "./NavControls";

const initialNodes = [
  { id: "1", position: { x: 300, y: 200 }, data: { label: "Imports Julien" } },
  { id: "2", position: { x: 400, y: 600 }, data: { label: "Salaire" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

function Mindmap() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="relative w-full h-full">
      <NavControls position={position} setNodes={setNodes} setPosition={setPosition} />

      <aside className="absolute py-8 h-screen right-5 w-[25%] z-10">
        <div className="flex flex-wrap bg-white shadow-lg w-full h-full rounded-xl p-4">
          <p>{JSON.stringify(edges, null, 2)}</p>
          <br></br>
          <p>{JSON.stringify(convertToNestedArray(nodes, edges))}</p>
        </div>
      </aside>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <Background color="#cccccc" variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Background id="2" gap={100} color="#EDEDED" variant={BackgroundVariant.Lines} />
      </ReactFlow>
    </div>
  );
}

export default Mindmap;
