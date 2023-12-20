"use client";

import "reactflow/dist/style.css";

import React, { useMemo } from "react";
import ReactFlow, { Background, BackgroundVariant, ConnectionMode, Controls } from "reactflow";

import { CustomNodeProps } from "@/_types";
import { MemoizedCustomNode, MemoizedMainNode, TextUpdaterNode } from "@/components/mindmap";
import { useMindMap } from "@/hooks";

import BiDirectionalEdge from "./edges/BiDirectionalEdge";

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
        <MemoizedCustomNode {...props} setNodes={setNodes} setSourceHandle={setSourceHandle} />
      ),
      mainNode: (props: CustomNodeProps) => (
        <MemoizedMainNode {...props} setNodes={setNodes} setSourceHandle={setSourceHandle} />
      ),
    }),
    [setNodes],
  );

  return (
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
  );
}

export default Mindmap;
