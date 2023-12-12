"use client";

import "reactflow/dist/style.css";

import React, { useMemo } from "react";
import ReactFlow, { Background, BackgroundVariant, ConnectionMode, Controls } from "reactflow";

import { CustomNodeProps } from "@/_types";
import useMindMap from "@/hooks/useMindMaps";

import ChatBoxSection from "../ui/chat/ChatBoxSection";
import BiDirectionalEdge from "./BiDirectionalEdge";
import NavControls from "./NavControls";
import CustomNode from "./nodes/CustomNode";
import MainNode from "./nodes/MainNode";
import TextUpdaterNode from "./nodes/TextUpdaterNode";

const edgeTypes = {
  bidirectional: BiDirectionalEdge,
};

function Mindmap() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onConnectStart,
    onConnectEnd,
    onDragOver,
    onDrop,
    reactFlowInstance,
    setSourceHandle,
    setNodes,
    setReactFlowInstance,
  } = useMindMap();

  const nodeTypes = useMemo(
    () => ({
      textUpdater: TextUpdaterNode,
      customNode: (props: CustomNodeProps) => (
        <CustomNode {...props} setNodes={setNodes} setSourceHandle={setSourceHandle} />
      ),
      mainNode: (props: CustomNodeProps) => (
        <MainNode {...props} setNodes={setNodes} setSourceHandle={setSourceHandle} />
      ),
    }),
    [setNodes],
  );

  return (
    <div className="relative w-full h-full">
      <NavControls />

      <aside className="absolute py-8 h-screen right-5 w-[25%] z-10">
        <ChatBoxSection mindMapData={reactFlowInstance?.toObject()} />
      </aside>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        fitViewOptions={{ padding: 2 }}
        nodeOrigin={[0.5, 0]}
        snapToGrid={true}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
      >
        <Controls />
        <Background color="#cccccc" variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Background id="2" gap={100} color="#EDEDED" variant={BackgroundVariant.Lines} />
      </ReactFlow>
    </div>
  );
}

export default Mindmap;
