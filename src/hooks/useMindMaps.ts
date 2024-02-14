import { useCallback, useEffect, useRef, useState } from "react";
import { addEdge, Connection, Edge, Node, ReactFlowInstance, useEdgesState, useNodesState } from "reactflow";

// import { useRecoilState } from "recoil";
import { updateMindmapById } from "@/_services";
import { MindMapDetailsProps } from "@/_types";
// import { edgesState, nodesState } from "@/recoil";
import { convertToNestedArray, emptyMindMapObject, setTargetHandle } from "@/utils";

const mindMapKey = "example-minimap";

const initialNodes: Node[] = [
  {
    id: "node_0",
    type: "mainNode",
    position: { x: 0, y: 300 },
    data: { label: "MindGen App" },
    style: { border: "2px solid #4D6AFF", borderRadius: 15 },
  },
];
const initialEdges: Edge[] = [];

const createCustomNode = (
  nodeId: Number,
  reactFlowInstance: ReactFlowInstance | null,
  event: any,
  labelText?: string,
) => {
  const position = reactFlowInstance!.screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  const positionAbsolute = {
    id: null,
    node: null,
    x: position.x,
    y: position.y,
  };

  const newNode: Node = {
    id: `node_${nodeId}`,
    type: "customNode",
    position: position,
    positionAbsolute: positionAbsolute,
    data: { label: labelText || "Type something" },
    style: { border: "1px solid", borderRadius: 15 },
  };

  return newNode;
};

const useMindMap = (userMindmapDetails: MindMapDetailsProps | undefined) => {
  const connectingNodeId = useRef(null);
  const [nodeId, setNodeId] = useState(0);
  const [sourceHandle, setSourceHandle] = useState("");

  // const [nodes, setNodes] = useRecoilState(nodesState);
  // const [edges, setEdges] = useRecoilState(edgesState);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const name = userMindmapDetails?.name;
  const description = userMindmapDetails?.description;
  const mindmapId = userMindmapDetails?.id;

  useEffect(() => {
    restoreMindMapFlow();
  }, []);

  useEffect(() => {
    saveMindMapFlow();
  }, [nodes, edges]);

  const saveMindMapFlow = useCallback(async () => {
    if (reactFlowInstance) {
      const newMindmapObject = emptyMindMapObject(name ?? "", description ?? "", nodes, edges);

      await updateMindmapById(mindmapId, newMindmapObject);

      const mindMap = reactFlowInstance.toObject();

      localStorage.setItem(mindMapKey, JSON.stringify(mindMap));
    }
  }, [reactFlowInstance, nodes, edges]);

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

        const newNode = createCustomNode(nodeId, reactFlowInstance, event);

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
    [nodeId, reactFlowInstance, setNodes, sourceHandle, setEdges],
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

      setNodeId((id: any) => id + 1);

      const newNode = createCustomNode(nodeId, reactFlowInstance, event);

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
    setNodeId,
    setEdges,
    setReactFlowInstance,
    mindMapArray,
  };
};

export { useMindMap };
