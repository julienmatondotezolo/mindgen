"use client";

import "reactflow/dist/style.css";

import React, { useCallback, useState } from "react";
import Draggable from "react-draggable";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  NodeResizeControl,
  useEdgesState,
  useNodesState,
} from "reactflow";

const initialNodes = [
  { id: "1", position: { x: 300, y: 200 }, data: { label: "1" } },
  { id: "2", position: { x: 400, y: 600 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

function Mindmap() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [name] = useState("");
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const addNode = (position: { x: any; y: any }) => {
    setNodes((e) =>
      e.concat({
        id: (e.length + 1).toString(),
        data: { label: `${name}` },
        position: {
          x: position.x ?? Math.random() * window.innerWidth,
          y: position.y ?? Math.random() * window.innerHeight,
        },
      }),
    );
  };

  const handleDrag = (e: any, data: { x: any; y: any }) => {
    setPosition({ x: data.x, y: data.y });
  };

  const handleStop = () => {
    addNode(position);
    setPosition({ x: 0, y: 0 });
  };

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // const createNestedArray = (node) => {
  //   const result = [node.node];

  //   if (node.children.length > 0) {
  //     node.children.forEach((child) => {
  //       result.push(createNestedArray(child));
  //     });
  //   }

  //   return result;
  // };

  // const rootNode = getNestedEdges(edges);
  // const nestedArray = createNestedArray(rootNode);

  // console.log(JSON.stringify(nestedArray, null, 2));

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-5 left-5 flex z-10">
        <div className="w-12 h-2/3 bg-white rounded-xl shadow-lg">
          <ul className="flex flex-col items-center justify-center h-full">
            <li className="my-2">
              <div className="p-2 bg-gray-50 hover:bg-gray-200 rounded-md cursor-pointer">
                <Draggable onDrag={handleDrag} onStop={handleStop}>
                  <div
                    style={{ transform: `translate(${position})` }}
                    className="w-5 h-5 bg-transparent border-2 border-black rounded-full"
                  ></div>
                </Draggable>
              </div>
            </li>

            <li className="my-2">
              <div className="p-2 bg-gray-50 hover:bg-gray-200 rounded-md cursor-pointer">
                <div className="w-5 h-5 bg-transparent border-2 border-black rounded-sm"></div>
              </div>
            </li>

            <li className="my-2">
              <div className="p-2 bg-gray-50 hover:bg-gray-200 rounded-md cursor-pointer">
                <div className="w-5 h-5 bg-transparent border-2 border-black rounded-full"></div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <aside className="absolute py-8 h-screen right-5 w-[25%] z-10">
        <div className="flex flex-wrap bg-white shadow-lg w-full h-full rounded-xl p-4">
          <p>{JSON.stringify(edges, null, 2)}</p>
        </div>
      </aside>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <NodeResizeControl />
        <Controls />
        <Background color="#cccccc" variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Background id="2" gap={100} color="#EDEDED" variant={BackgroundVariant.Lines} />
      </ReactFlow>
    </div>
  );
}

export default Mindmap;
