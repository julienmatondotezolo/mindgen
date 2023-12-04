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

import { CustomNodeProps } from "@/_types";

import CustomNode from "./customNode";
import NavControls from "./NavControls";
import TextUpdaterNode from "./TextUpdaterNode";

const initialNodes = [
  {
    id: "1",
    type: "customNode",
    height: 2000,
    position: { x: 0, y: 300 },
    data: { label: "Principal" },
    style: { border: "1px solid black", borderRadius: 15 },
  },
  { id: "2", type: "textUpdater", position: { x: 200, y: 600 }, data: { label: "Salaire" } },
  { id: "3", type: "textUpdater", position: { x: 200, y: 200 }, data: { label: "Type something" } },
];
const initialEdges = [
  { id: "a1-2", source: "1", target: "2" },
  { id: "a1-3", source: "1", target: "3" },
];

const nodeTypes = {
  textUpdater: TextUpdaterNode,
  customNode: (props: CustomNodeProps) => <CustomNode {...props} />,
};

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
          {/* <p>{JSON.stringify(convertToNestedArray(nodes, edges))}</p> */}
        </div>
      </aside>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
      >
        <Controls />
        <Background color="#cccccc" variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Background id="2" gap={100} color="#EDEDED" variant={BackgroundVariant.Lines} />
      </ReactFlow>
    </div>
  );
}

export default Mindmap;
