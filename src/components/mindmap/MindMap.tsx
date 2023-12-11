"use client";

import "reactflow/dist/style.css";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
} from "reactflow";

import { CustomNodeProps } from "@/_types";
import { Button, Textarea } from "@/components/ui";
import { convertToNestedArray, setTargetHandle } from "@/utils";

import ChatBoxSection from "../ui/chat/ChatBoxSection";
import BiDirectionalEdge from "./BiDirectionalEdge";
import CustomNode from "./customNode";
import MainNode from "./MainNode";
import NavControls from "./NavControls";
import TextUpdaterNode from "./TextUpdaterNode";

const mindMapKey = "example-minimap";

const initialNodes: Node[] = [
  {
    id: "node_0",
    type: "mainNode",
    position: { x: 0, y: 300 },
    data: { label: "MindGen App" },
    style: { border: "1px solid black", borderRadius: 15 },
  },
];
const initialEdges: Edge[] = [];

const edgeTypes = {
  bidirectional: BiDirectionalEdge,
};

function Mindmap() {
  const connectingNodeId = useRef(null);
  const [nodeId, setNodeId] = useState(0);
  const [sourceHandle, setSourceHandle] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState();

  const [showChat, setShowChat] = useState(false);
  const [data, setData] = useState("");

  useEffect(() => {
    restoreMindMapFlow();
  }, []);

  useEffect(() => {
    saveMindMapFlow();
  }, [nodes, edges]);

  const saveMindMapFlow = useCallback(() => {
    if (reactFlowInstance) {
      const mindMap = reactFlowInstance.toObject();

      localStorage.setItem(mindMapKey, JSON.stringify(mindMap));
    }
  }, [reactFlowInstance]);

  const restoreMindMapFlow = async () => {
    const flow = JSON.parse(localStorage.getItem(mindMapKey));

    if (flow) {
      // const { x = 0, y = 0, zoom = 1 } = flow.viewport;
      setNodes(flow.nodes?.length == 0 ? initialNodes : flow.nodes);
      setNodeId(flow.nodes.length);
      setEdges(flow.edges || initialEdges);
    } else {
      setNodeId(initialNodes.length);
      setNodes(initialNodes);
    }
  };

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      // reset the start node on connections
      connectingNodeId.current = null;
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  const onConnectStart = useCallback((_: any, { nodeId }: any) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event: any) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = event.target.classList.contains("react-flow__pane");

      if (targetIsPane) {
        // we need to remove the wrapper bounds, in order to get the correct position
        setNodeId((id: any) => id + 1);

        const id = `node_${nodeId}`;

        const newNode = {
          id,
          type: "customNode",
          position: reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
          data: { label: `Type something` },
          style: { border: "1px solid black", borderRadius: 15 },
          origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));

        const params = {
          id,
          source: connectingNodeId.current,
          sourceHandle: sourceHandle,
          target: id,
          targetHandle: setTargetHandle(sourceHandle),
        };

        setEdges((eds) => addEdge(params, eds));
      }
    },
    [reactFlowInstance, sourceHandle, nodeId],
  );

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

      setNodeId((id: any) => id + 1);

      const id = `node_${nodeId}`;

      const newNode = {
        id,
        type,
        position,
        data: { label: `Type something` },
        style: { border: "1px solid black", borderRadius: 15 },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );

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

  const handleGenerateClick = () => {
    setShowChat(!showChat);
    showChat == true ? setData("") : setData(convertToNestedArray(nodes, edges));
  };

  return (
    <div className="relative w-full h-full">
      <NavControls />

      <aside className="absolute py-8 h-screen right-5 w-[25%] z-10">
        <ChatBoxSection mindMapData={reactFlowInstance?.toObject()} />
        {/* <div className="relative p-5 flex flex-col justify-between shadow-lg w-full h-full rounded-xl bg-white">
          {showChat ? (
            <div className="border-2 p-4 rounded-xl max-h-[70%] overflow-auto">
              <p className="w-full">{data ? data : "Fetching mail data..."}</p>
            </div>
          ) : null}
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <Textarea className="w-full" />
            <Button variant="outline" className="w-full mt-4" onClick={handleGenerateClick}>
              <p>Generate mail</p>
            </Button>
          </div>
        </div> */}
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
