/* eslint-disable react-hooks/exhaustive-deps */
import "reactflow/dist/style.css";

import { debounce } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  Node,
  NodeProps,
  SelectionMode,
  useOnViewportChange,
  useReactFlow,
} from "reactflow";
import { useSetRecoilState } from "recoil";

import { MindMapDetailsProps } from "@/_types";
import {
  MemoizedCustomCircleNode,
  MemoizedCustomDiamondNode,
  MemoizedCustomImageNode,
  MemoizedCustomNode,
  MemoizedMainNode,
} from "@/components/mindmap";
import { useMindMap, useSocket } from "@/hooks";
import { viewPortScaleState } from "@/state";
import { checkPermission } from "@/utils";

import BiDirectionalEdge from "./edges/BiDirectionalEdge";

const edgeTypes = {
  bidirectional: BiDirectionalEdge,
};

const panOnDrag = [1, 2];

function Mindmap({
  userMindmapDetails,
  currentCollaUsername,
}: {
  userMindmapDetails: MindMapDetailsProps | undefined;
  currentCollaUsername: string;
}) {
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
    saveMindMap,
  } = useMindMap(userMindmapDetails);

  const PERMISSIONS = userMindmapDetails?.connectedCollaboratorPermissions;
  const isLocked = checkPermission(PERMISSIONS, "UPDATE") ? true : false;
  const userCanGive = userMindmapDetails?.collaborators.filter(
    (collaborator) => collaborator.username == currentCollaUsername,
  )[0];
  const isCollaborativeMindmap = userMindmapDetails!.collaborators?.length > 1;

  const defaultEdgeOptions = {
    animated: true,
    selectable: true,
    type: "default",
  };

  const [first, setFirst] = useState(true);
  const { setEdges, setNodes, getNodes } = useReactFlow();

  function mergeNodes(localNodes: Node[], remoteNodes: Node[]) {
    // Create a map to easily access nodes in localNodes by their ID
    const localNodeMap = new Map();

    localNodes.forEach((node) => {
      localNodeMap.set(node.id, node);
    });

    // Iterate through remoteNodes and merge them into localNodes
    remoteNodes.forEach((remoteNode) => {
      // Check if the node already exists in localNodes by its ID
      if (localNodeMap.has(remoteNode.id)) {
        // Node exists, update the existing node in localNodes
        const localNode = localNodeMap.get(remoteNode.id);
        // Merge the remoteNode properties into the localNode

        Object.assign(localNode, remoteNode);
      } else {
        // Node does not exist, add the remoteNode to localNodes
        localNodes.push(remoteNode);
        // Add the remoteNode to the map for future reference
        localNodeMap.set(remoteNode.id, remoteNode);
      }
    });

    // Return the merged list of nodes
    return localNodes;
  }

  const { socketEmit, socketListen, socketOff } = useSocket();

  const setScaleStyle = useSetRecoilState(viewPortScaleState);

  function ViewportChangeLogger() {
    useOnViewportChange({
      onChange: (viewport) => {
        const scale = 1.4 / viewport.zoom;

        setScaleStyle({ transform: `scale(${scale})` });
      },
    });

    return null;
  }

  useEffect(() => {
    if (first && userCanGive && isCollaborativeMindmap && checkPermission(PERMISSIONS, "UPDATE")) {
      socketEmit("mindmap-edited", {
        roomId: userMindmapDetails?.id,
        username: currentCollaUsername,
        reactFlowChanges: {
          nodes: nodes,
          edges: edges,
        },
      });
      // setFirst(false);
    }
    setFirst(true);
  }, [nodes, edges]);

  useEffect(() => {
    socketListen("remote-mindmap-edited", (data) => {
      const { edges, nodes } = data.reactFlowChanges;

      const updatedNodes = mergeNodes(getNodes(), nodes);

      setFirst(false);

      // onNodesChange(nodes);
      // onEdgesChange(edges);
      setNodes(updatedNodes);
      setEdges(edges);
    });

    return () => {
      socketOff("remote-mindmap-edited");
    };
  }, []);

  const debouncedSaveMindMap = useCallback(debounce(saveMindMap, 1000), [saveMindMap]);

  useEffect(() => {
    debouncedSaveMindMap();
  }, [nodes, edges]);

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

  return (
    <ReactFlow
      className={!checkPermission(PERMISSIONS, "UPDATE") ? "pointer-events-none" : ""}
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
      panOnScroll
      // panOnDrag={isLocked ? panOnDrag : false}
      panOnDrag={panOnDrag}
      selectionOnDrag
      selectionMode={SelectionMode.Partial}
      edgesUpdatable={isLocked}
      edgesFocusable={isLocked}
      nodesDraggable={isLocked}
      nodesConnectable={isLocked}
      nodesFocusable={isLocked}
      elementsSelectable={isLocked}
    >
      {isLocked && <Controls />}
      <Background color="#7F7F7F33" variant={BackgroundVariant.Dots} gap={12} size={1} />
      <Background id="2" gap={100} color="#7F7F7F0A" variant={BackgroundVariant.Lines} />
      {/* <StateComponent userMindmapDetails={userMindmapDetails} /> */}
      <ViewportChangeLogger />
    </ReactFlow>
  );
}

export { Mindmap };
