import { useCallback, useEffect, useRef, useState } from "react";
import {
  addEdge,
  Connection,
  Edge,
  getConnectedEdges,
  getIncomers,
  getOutgoers,
  Node,
  ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from "reactflow";

// import { useRecoilState } from "recoil";
import { updateMindmapById } from "@/_services";
import { MindMapDetailsProps } from "@/_types";
// import { edgesState, nodesState } from "@/recoil";
import { convertToNestedArray, emptyMindMapObject, setTargetHandle } from "@/utils";

// const mindMapKey = "example-minimap";

const initialNodes: Node[] = [
  {
    id: "node_0",
    type: "mainNode",
    position: { x: 0, y: 300 },
    data: { label: "MindGen App" },
    style: { border: "2px solid #4D6AFF", borderRadius: 15 },
  },
];
// const initialEdges: Edge[] = [];

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

  // New state for history
  const [undoStack, setUndoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  // Function to update history
  const updateHistory = useCallback(() => {
    setUndoStack((prev) => [...prev, { nodes: [...nodes], edges: [...edges] }]);
    setRedoStack([]); // Clear redo stack on new action
  }, [nodes, edges]);

  const clear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    // setNodeId(initialNodes.length);
    // setNodes(initialNodes);
  }, [setEdges, setNodes]);

  // Function to undo the last action
  const undo = useCallback(() => {
    if (undoStack.length > 0) {
      setUndoStack((prev) => {
        const newUndoStack = [...prev];
        const lastState = newUndoStack.pop();

        setRedoStack((prev) => [...prev, { nodes: [...nodes], edges: [...edges] }]);
        return newUndoStack;
      });

      setNodes(undoStack[undoStack.length - 1].nodes);
      setEdges(undoStack[undoStack.length - 1].edges);
    }
  }, [undoStack, nodes, edges]);

  // Function to redo the last undone action
  const redo = useCallback(() => {
    if (redoStack.length > 0) {
      const lastState = redoStack[redoStack.length - 1];

      setRedoStack((prev) => prev.slice(0, -1)); // Remove the last state from redo stack
      setUndoStack((prev) => [...prev, { nodes: [...nodes], edges: [...edges] }]); // Push current state to undo stack
      setNodes(lastState.nodes);
      setEdges(lastState.edges);
    }
  }, [redoStack, nodes, edges]);

  // Update history on every nodes or edges change
  useEffect(() => {
    updateHistory();
  }, [nodes, edges, updateHistory]);

  const name = userMindmapDetails?.name;
  const description = userMindmapDetails?.description;
  const mindmapId = userMindmapDetails?.id;

  // useEffect(() => {
  //   restoreMindMapFlow();
  // }, []);

  useEffect(() => {
    saveMindMapFlow(mindmapId);
  }, [nodes, edges]);

  const saveMindMapFlow = useCallback(
    async (mindMapId: string | undefined) => {
      if (reactFlowInstance) {
        const newMindmapObject = emptyMindMapObject(name ?? "", description ?? "", nodes, edges);

        await updateMindmapById({
          mindmapId: mindMapId,
          mindmapObject: newMindmapObject,
        });

        // const mindMap = reactFlowInstance.toObject();

        // localStorage.setItem(mindMapKey, JSON.stringify(mindMap));
      }
    },
    [reactFlowInstance],
  );

  // const restoreMindMapFlow = async () => {
  //   let flow;

  //   if (localStorage.getItem(mindMapKey)) {
  //     flow = JSON.parse(localStorage.getItem(mindMapKey) ?? "");
  //   }

  //   if (flow) {
  //     // const { x = 0, y = 0, zoom = 1 } = flow.viewport;
  //     setNodes(flow.nodes?.length == 0 ? initialNodes : flow.nodes);
  //     setNodeId(flow.nodes.length);
  //     setEdges(flow.edges || initialEdges);
  //   } else {
  //     setNodeId(initialNodes.length);
  //     setNodes(initialNodes);
  //   }
  // };

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

  const onNodesDelete = useCallback(
    (deleted: any[]) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter((edge: Edge) => !connectedEdges.includes(edge));

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({ id: `${source}->${target}`, source, target })),
          );

          return [...remainingEdges, ...createdEdges];
        }, edges),
      );
    },
    [nodes, edges],
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
    onNodesDelete,
    reactFlowInstance,
    setSourceHandle,
    setNodes,
    setNodeId,
    setEdges,
    setReactFlowInstance,
    mindMapArray,
    undo,
    redo,
    undoStack,
    redoStack,
    clear,
  };
};

export { useMindMap };
