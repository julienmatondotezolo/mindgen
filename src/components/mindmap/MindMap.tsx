"use client";

import "reactflow/dist/style.css";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  Position,
  useEdgesState,
  useNodesState,
} from "reactflow";

import { CustomNodeProps } from "@/_types";
import { Button } from "@/components/ui";
import { convertToNestedArray } from "@/utils";

import BiDirectionalEdge from "./BiDirectionalEdge";
import CustomNode from "./CustomNode";
import MainNode from "./MainNode";
import NavControls from "./NavControls";
import TextUpdaterNode from "./TextUpdaterNode";

const initialNodes = [
  {
    id: "1",
    type: "mainNode",
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    position: { x: 0, y: 300 },
    data: { label: "Principal" },
    style: { border: "1px solid black", borderRadius: 15 },
  },
  {
    id: "2",
    type: "customNode",
    position: { x: 200, y: 600 },
    data: { label: "Salaire" },
    style: { border: "1px solid black", borderRadius: 15 },
  },
  {
    id: "3",
    type: "customNode",
    position: { x: 200, y: 200 },
    data: { label: "Type something" },
    style: { border: "1px solid black", borderRadius: 15 },
  },
];
const initialEdges = [{}];

const edgeTypes = {
  bidirectional: BiDirectionalEdge,
};

let id = 0;
const getId = () => `node_${id++}`;

function Mindmap() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [showChat, setShowChat] = useState(false);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event: { preventDefault: () => void; dataTransfer: { dropEffect: string } }) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `Type something` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );

  const nodeTypes = useMemo(
    () => ({
      textUpdater: TextUpdaterNode,
      customNode: (props: CustomNodeProps) => <CustomNode {...props} setNodes={setNodes} />,
      mainNode: (props: CustomNodeProps) => <MainNode {...props} setNodes={setNodes} />,
    }),
    [setNodes],
  );

  return (
    <div className="relative w-full h-full">
      <NavControls position={position} setNodes={setNodes} setPosition={setPosition} />

      <aside className="absolute py-8 h-screen right-5 w-[25%] z-10">
        <div className="flex flex-col p-5 justify-between shadow-lg w-full h-full rounded-xl bg-white ">
          <p>{JSON.stringify(edges, null, 2)}</p>
          {showChat ? (
            <div className="border-2 p-4 rounded-xl">
              <p>{JSON.stringify(convertToNestedArray(nodes, edges))}</p>
            </div>
          ) : null}
          <Button className="w-full bg-slate-400 hover:bg-slate-200" onClick={() => setShowChat(!showChat)}>
            <p>Generate mail</p>
          </Button>
        </div>
      </aside>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        edgeTypes={edgeTypes}
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
