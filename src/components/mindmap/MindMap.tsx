import "reactflow/dist/style.css";

import React, { useEffect, useMemo } from "react";
import ReactFlow, { Background, BackgroundVariant, ConnectionMode, Controls, NodeProps } from "reactflow";

import { MindMapDetailsProps } from "@/_types";
import { MemoizedCustomNode, MemoizedMainNode } from "@/components/mindmap";
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
    setNodes,
    setNodeId,
    setEdges,
    setReactFlowInstance,
  } = useMindMap(userMindmapDetails);

  const nodeTypes = useMemo(
    () => ({
      customNode: (props: NodeProps) => (
        <MemoizedCustomNode {...props} setNodes={setNodes} setSourceHandle={setSourceHandle} />
      ),
      mainNode: (props: NodeProps) => (
        <MemoizedMainNode {...props} setNodes={setNodes} setSourceHandle={setSourceHandle} />
      ),
    }),
    [setNodes, setSourceHandle],
  );

  useEffect(() => {
    if (userMindmapDetails) {
      setNodes(userMindmapDetails.nodes);
      setNodeId(userMindmapDetails.nodes.length);
      setEdges(userMindmapDetails.edges);
    }
  }, [userMindmapDetails]);

  const clearAllNodes = () => {
    setNodes([]);
    setEdges([]);
  };

  return (
    <>
      <button onClick={clearAllNodes}>Clear All Nodes</button>
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
    </>
  );
}

export { Mindmap };
