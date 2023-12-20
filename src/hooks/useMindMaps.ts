import { useCallback, useEffect, useRef, useState } from "react";
import { addEdge, Connection, Edge, Node, ReactFlowInstance, useEdgesState, useNodesState } from "reactflow";
import { useRecoilState } from "recoil";

import { edgesState, nodesState } from "@/recoil";
import { convertToNestedArray, setTargetHandle } from "@/utils";

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

const useMindMap = () => {
  const connectingNodeId = useRef(null);
  const [nodeId, setNodeId] = useState(0);
  const [sourceHandle, setSourceHandle] = useState("");

  const [nodes, setNodes] = useRecoilState(nodesState);
  const [edges, setEdges] = useRecoilState(edgesState);
  const [, , onNodesChange] = useNodesState([]);
  const [, , onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

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
    let flow;

    if (localStorage.getItem(mindMapKey)) {
      flow = JSON.parse(localStorage.getItem(mindMapKey) ?? "");
    }

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
          position: reactFlowInstance!.screenToFlowPosition({
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

      const position = reactFlowInstance!.screenToFlowPosition({
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

  const mindMapArray = useCallback(() => {
    if (nodes.length != 0 && nodes.length != 0) {
      return convertToNestedArray(nodes, edges);
    }
  }, [edges, nodes]);

  return {
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
    mindMapArray,
  };
};

export { useMindMap };
