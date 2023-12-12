"use client";

import "reactflow/dist/style.css";

import React, { useMemo } from "react";
import ReactFlow, { Background, BackgroundVariant, ConnectionMode, Controls } from "reactflow";

import { CustomNodeProps } from "@/_types";
import useMindMap from "@/hooks/useMindMaps";

import NavLeft from "../header/navLeft";
import NavRight from "../header/navRight";
import ToolBar from "../header/toolbar";
import BiDirectionalEdge from "./edges/BiDirectionalEdge";
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
      <div className="flex justify-between w-[95%] absolute top-5 left-2/4 -translate-x-2/4 z-10">
        <NavLeft />
        <ToolBar />
        <NavRight />
      </div>

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
