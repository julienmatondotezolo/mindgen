/* eslint-disable react-hooks/exhaustive-deps */
// import { toPng } from "html-to-image";
// import { debounce } from "lodash";
import { debounce } from "lodash";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  addEdge,
  Connection,
  Edge,
  getConnectedEdges,
  getIncomers,
  // getNodesBounds,
  getOutgoers,
  // getViewportForBounds,
  HandleType,
  MarkerType,
  Node,
  ReactFlowInstance,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import { useRecoilState, useSetRecoilState } from "recoil";

// import { useRecoilState } from "recoil";
import { updateMindmapById } from "@/_services";
import { CustomSession, MindMapDetailsProps } from "@/_types";
import { historyIndexState, historyState } from "@/state";
import { convertToNestedArray, emptyMindMapObject, setTargetHandle } from "@/utils";

import { useSyncMutation } from ".";

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
    data: { label: labelText || "Type something", selectedByCollaborator: false },
    style: { borderRadius: "100px", width: 250, height: 50 },
  };

  return newNode;
};

const createCustomDiamondNode = (
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
    type: "customDiamondNode",
    position: position,
    positionAbsolute: positionAbsolute,
    data: { label: labelText || "Type something", selectedByCollaborator: false },
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 3,
      width: 200, // Adjust width as needed
      height: 200,
    },
  };

  return newNode;
};

const createCustomCircleNode = (
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
    type: "customCircleNode",
    position: position,
    positionAbsolute: positionAbsolute,
    data: { label: labelText || "Type something", selectedByCollaborator: false },
    style: {
      // display: "flex",
      // justifyContent: "center",
      // alignItems: "center",
      borderRadius: "100%",
      width: 200, // Adjust width as needed
      height: 200,
    },
  };

  return newNode;
};

const createCustomImageNode = (nodeId: Number, reactFlowInstance: ReactFlowInstance | null, event: any) => {
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
    type: "customImageNode",
    position: position,
    positionAbsolute: positionAbsolute,
    data: {
      selectedByCollaborator: false,
      image: {
        url: "https://source.unsplash.com/300x400?summer",
      },
    },
    style: {
      width: 200, // Adjust width as needed
      height: 200,
    },
  };

  return newNode;
};

type NodeType = "customNode" | "customDiamondNode" | "customCircleNode" | "customImageNode";

const nodeCreators: Record<
  NodeType,
  // eslint-disable-next-line no-unused-vars
  (nodeId: number, reactFlowInstance: any, event: React.DragEvent<HTMLDivElement>, undefinedValue?: any) => any
> = {
  customNode: createCustomNode,
  customDiamondNode: createCustomDiamondNode,
  customCircleNode: createCustomCircleNode,
  customImageNode: createCustomImageNode,
};

const useMindMap = (userMindmapDetails: MindMapDetailsProps | undefined) => {
  const session = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;

  const connectingNodeId = useRef(null);
  const connectingNodeType = useRef<String | undefined>("");

  const { getNodes, getEdges, getNode } = useReactFlow();

  const [nodeId, setNodeId] = useState(0);
  const [sourceHandle, setSourceHandle] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const name = userMindmapDetails?.name;
  const description = userMindmapDetails?.description;
  const mindmapId = userMindmapDetails?.id;
  const visibility = userMindmapDetails?.visibility;

  const [pictureUrl] = useState();

  const setHistory = useSetRecoilState(historyState);
  const [historyIndex, setHistoryIndex] = useRecoilState(historyIndexState);

  const pushToHistory = useCallback(() => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    setHistory((prevHistory) => {
      const newHistory = [...prevHistory.slice(0, historyIndex + 1), { nodes: currentNodes, edges: currentEdges }];

      return newHistory;
    });
    setHistoryIndex(historyIndex + 1);
  }, [getNodes, getEdges, historyIndex]);

  useEffect(() => {
    setNodes([]);
    setNodeId(NaN);
    setEdges([]);

    if (userMindmapDetails) {
      setNodes(userMindmapDetails.nodes);
      setNodeId(userMindmapDetails.nodes.length);
      setEdges(userMindmapDetails.edges);
    }
  }, [userMindmapDetails]);

  // Define the mutation
  const updateMindmapMutation = useSyncMutation(updateMindmapById, {
    onSuccess: () => {
      // Optionally, invalidate or refetch other queries to update the UI
      // queryClient.invalidateQueries("mindmaps");
    },
  });

  const saveMindMapFlow = async () => {
    if (reactFlowInstance) {
      // await saveMindMapImage(nodes);

      const newMindmapObject = emptyMindMapObject({
        name: name ?? "",
        description: description ?? "",
        pictureUrl:
          pictureUrl ??
          "https://media.licdn.com/dms/image/C4D03AQFlT19xH_3kdw/profile-displayphoto-shrink_200_200/0/1644350085538?e=1722470400&v=beta&t=teYaxEZMbvLW5u0qGyNaQO1CzVU565yKZAS2vXHJYok",
        nodes,
        edges,
        visibility: visibility ?? "PRIVATE",
      });

      return newMindmapObject;
    }
  };

  const saveMindMap = async () => {
    const newMindmapObject = await saveMindMapFlow();

    if (newMindmapObject) {
      updateMindmapMutation.mutate({
        session: safeSession,
        mindmapId: mindmapId,
        mindmapObject: newMindmapObject,
      });
    }
  };

  // const saveMindMapImage = useCallback(
  //   debounce(async (currentNodes: Node[]) => {
  //     const imageWidth = 1920;
  //     const imageHeight = 1080;

  //     const nodesBounds = getNodesBounds(currentNodes);
  //     const transform = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

  //     const imageBase64Data = await toPng(document.querySelector(".react-flow__viewport"), {
  //       backgroundColor: "#000",
  //       width: imageWidth,
  //       height: imageHeight,
  //       style: {
  //         width: imageWidth,
  //         height: imageHeight,
  //         transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
  //       },
  //     });

  //     setPictureUrl(imageBase64Data);
  //   }, 10000),
  //   [nodeChanges, pictureUrl],
  // );

  const debouncedSaveMindMap = useCallback(debounce(saveMindMap, 1000), [saveMindMap]);

  useEffect(() => {
    debouncedSaveMindMap();
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      // reset the start node on connections
      connectingNodeId.current = null;
      (params as Edge).markerEnd = {
        type: MarkerType.ArrowClosed,
        width: 30,
        height: 30,
      };
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  const onConnectStart = useCallback(
    (_: any, params: { nodeId: any; handleId: string | null; handleType: HandleType | null }) => {
      const { nodeId } = params;

      const currentSelectedNode = getNode(nodeId);

      connectingNodeId!.current = nodeId;
      connectingNodeType!.current = currentSelectedNode?.type;
    },
    [],
  );

  const onConnectEnd = useCallback(
    (event: any) => {
      if (!connectingNodeId.current || !connectingNodeType.current) return;

      const targetIsPane = event.target.classList.contains("react-flow__pane");

      if (targetIsPane) {
        // we need to remove the wrapper bounds, in order to get the correct position
        setNodeId((id: any) => id + 1);

        const id = `node_${nodeId}`;

        const createNode = nodeCreators[connectingNodeType.current as NodeType];

        if (!createNode) {
          return;
        }

        const newNode = createNode(nodeId, reactFlowInstance, event, undefined);

        setNodes((nds) => [...nds, newNode]);

        const params = {
          id,
          source: connectingNodeId.current,
          sourceHandle: sourceHandle,
          target: id,
          targetHandle: setTargetHandle(sourceHandle),
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 30,
            height: 30,
          },
        };

        setEdges((eds) => addEdge(params, eds));

        pushToHistory();
      }
    },
    [nodeId, reactFlowInstance, setNodes, sourceHandle, setEdges],
  );

  const onDragOver = useCallback((event: { preventDefault: () => void; dataTransfer: { dropEffect: string } }) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (event.dataTransfer) {
        const type = event.dataTransfer.getData("application/reactflow");

        if (typeof type === "undefined" || !type) {
          return;
        }

        const createNode = nodeCreators[type as NodeType];

        if (!createNode) {
          return;
        }

        const newNode = createNode(nodeId, reactFlowInstance, event, undefined);

        setNodeId((id) => id + 1);
        setNodes((nds) => [...nds, newNode]);

        pushToHistory();
      }
    },
    [reactFlowInstance, nodeId, setNodeId, setNodes], // Ensure all dependencies are listed
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

      pushToHistory();
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
    pushToHistory,
    saveMindMap,
  };
};

export { useMindMap };
