import "reactflow/dist/style.css";

import React, { useMemo } from "react";
import ReactFlow, { Background, BackgroundVariant, ConnectionMode, Controls, NodeProps, useReactFlow } from "reactflow";

import { MindMapDetailsProps } from "@/_types";
import {
  MemoizedCustomCircleNode,
  MemoizedCustomDiamondNode,
  MemoizedCustomImageNode,
  MemoizedCustomNode,
  MemoizedMainNode,
} from "@/components/mindmap";
import { useMindMap } from "@/hooks";

import BiDirectionalEdge from "./edges/BiDirectionalEdge";

const edgeTypes = {
  bidirectional: BiDirectionalEdge,
};

function Mindmap({ userMindmapDetails }: { userMindmapDetails: MindMapDetailsProps | undefined }) {
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
    onNodesDelete,
    setSourceHandle,
    setReactFlowInstance,
  } = useMindMap(userMindmapDetails);

  const defaultEdgeOptions = {
    animated: true,
    type: "default",
  };

  const { setNodes } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({
      customNode: (props: NodeProps) => (
        <MemoizedCustomNode {...props} setNodes={setNodes} setSourceHandle={setSourceHandle} />
      ),
      customDiamondNode: (props: NodeProps) => (
        <MemoizedCustomDiamondNode {...props} setNodes={setNodes} setSourceHandle={setSourceHandle} />
      ),
      customCircleNode: (props: NodeProps) => (
        <MemoizedCustomCircleNode {...props} setNodes={setNodes} setSourceHandle={setSourceHandle} />
      ),
      customImageNode: (props: NodeProps) => (
        <MemoizedCustomImageNode {...props} setNodes={setNodes} setSourceHandle={setSourceHandle} />
      ),
      mainNode: (props: NodeProps) => (
        <MemoizedMainNode {...props} setNodes={setNodes} setSourceHandle={setSourceHandle} />
      ),
    }),
    [setNodes, setSourceHandle],
  );

  const handleBoldNode = () => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "node_1") {
          // Create a new object with the updated properties
          return {
            ...node,
            selected: true,
            data: {
              ...node.data,
              selectedByCollaborator: true,
            },
          };
        }
        return node;
      }),
    );
  };

  return (
    <>
      <ReactFlow
        defaultEdgeOptions={defaultEdgeOptions}
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
        onNodesDelete={onNodesDelete}
        fitView
        fitViewOptions={{ padding: 2 }}
        nodeOrigin={[0.5, 0]}
        snapToGrid={true}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
      >
        <Controls />
        <Background color="#7F7F7F33" variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Background id="2" gap={100} color="#7F7F7F0A" variant={BackgroundVariant.Lines} />
      </ReactFlow>
      <button onClick={handleBoldNode} className="fixed left-0 top-0 w-20 h-20 bg-sky-400 z-50">
        Update Node 1
      </button>
    </>
  );
}

export { Mindmap };
