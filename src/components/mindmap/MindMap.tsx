"use client";

import "reactflow/dist/style.css";

import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, BackgroundVariant, ConnectionMode, Controls } from "reactflow";

import { CustomNodeProps } from "@/_types";
import { NavLeft, NavRight, PromptTextInput, ToolBar } from "@/components";
import { MemoizedCustomNode, MemoizedMainNode, TextUpdaterNode } from "@/components/mindmap";
import { useMindMap } from "@/hooks";

import { Skeleton } from "../ui/skeleton";
// import ChatBoxSection from "../ui/chat/ChatBoxSection";
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
    <div className="w-full">
      <div className="relative w-full h-full">
        <div className="flex justify-between w-[96%] fixed left-2/4 -translate-x-2/4 top-5 z-10">
          <NavLeft />
          <ToolBar />
          <NavRight />
        </div>

        {/* <aside className="absolute py-8 h-screen right-5 w-[25%] z-10">
        <ChatBoxSection mindMapData={reactFlowInstance?.toObject()} />
      </aside> */}

        <div className="w-[80%] md:w-1/3 fixed left-2/4 -translate-x-2/4 bottom-6 z-10">
          <PromptTextInput />
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
      <div className="relative w-full h-full flex flex-row justify-center">
        <div className="flex flex-row flex-wrap justify-center m-auto w-2/4 mt-36">
          <Skeleton className="h-6 w-96 bg-grey-blue" />
          <div className="w-full mt-8 space-y-6">
            <Skeleton className="h-4 w-48 bg-grey-blue" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-12/12 bg-grey-blue" />
              <Skeleton className="h-4 w-10/12 bg-grey-blue" />
              <Skeleton className="h-4 w-8/12 bg-grey-blue" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-11/12 bg-grey-blue" />
              <Skeleton className="h-4 w-10/12 bg-grey-blue" />
              <Skeleton className="h-4 w-12/12 bg-grey-blue" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-11/12 bg-grey-blue" />
              <Skeleton className="h-4 w-9/12 bg-grey-blue" />
              <Skeleton className="h-4 w-12/12 bg-grey-blue" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-10/12 bg-grey-blue" />
              <Skeleton className="h-4 w-12/12 bg-grey-blue" />
              <Skeleton className="h-4 w-8/12 bg-grey-blue" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mindmap;
