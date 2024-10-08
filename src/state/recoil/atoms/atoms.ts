import { Node } from "reactflow";
import { atom } from "recoil";

import { CanvasMode, CanvasState, ChatMessageProps, Edge, Layer, QuestionAnswersProps, User } from "@/_types";
import { Organization } from "@/_types/Organization";
import { socket } from "@/socket";

// ================   CANVAS STATE   ================== //

// const [canvasState, setCanvasState] = useState<CanvasState>({
//   mode: CanvasMode.None,
// });

export const canvasStateAtom = atom<CanvasState>({
  key: "canvasState", // unique ID (with respect to other atoms/selectors)
  default: {
    mode: CanvasMode.None,
  }, // valeur par défaut (alias valeur initials)
});

// ================   USER STATE   ================== //

export const currentUserState = atom<User | {}>({
  key: "currentUserState", // unique ID (with respect to other atoms/selectors)
  default: {}, // valeur par défaut (alias valeur initials)
});

export const connectedUsersState = atom<User[]>({
  key: "connectedUsersState", // unique ID (with respect to other atoms/selectors)
  default: [], // valeur par défaut (alias valeur initials)
});

// ================   ORGANIZATION EFFECTS   ================== //

const organizationlocalStorageEffect = ({ onSet, setSelf }: any) => {
  const savedOrganization = localStorage.getItem("selected-organization");

  if (savedOrganization && savedOrganization !== "undefined") {
    setSelf(JSON.parse(savedOrganization)); // Load from local storage
  }

  // Subscribe to changes and save to local storage
  onSet((newValue: Organization) => {
    localStorage.setItem("selected-organization", JSON.stringify(newValue)); // Save to local storage
  });
};

// ================   ORGA & BOARD STATE   ================== //

export const selectedOrganizationState = atom<Organization | undefined>({
  key: "selectedOrganizationState", // unique ID (with respect to other atoms/selectors)
  default: undefined, // valeur par défaut (alias valeur initials)
  effects: [organizationlocalStorageEffect],
});

export const boardIdState = atom<string>({
  key: "boardIdState", // unique ID (with respect to other atoms/selectors)
  default: "", // valeur par défaut (alias valeur initials)
});

// ================   LAYER EFFECTS   ================== //

const socketLayerEffect = ({ setSelf }: any) => {
  // Define the event handler function outside the effect to avoid redefining it on every call
  const handleAddLayer = (addedLayer: Layer) => {
    setSelf((prevLayers: Layer[]) => [...prevLayers, addedLayer]);
  };

  const handleUpdateLayer = (updatedLayer: Layer) => {
    setSelf((prevLayers: Layer[]) => prevLayers.map((layer) => (layer.id === updatedLayer.id ? updatedLayer : layer)));
  };

  const handleRemoveLayer = (layerIdsToDelete: string[]) => {
    setSelf((prevLayers: Layer[]) => prevLayers.filter((layer) => !layerIdsToDelete.includes(layer.id)));
  };

  // Attach the event listener when the effect runs
  socket.on("remote-add-layer", handleAddLayer);
  socket.on("remote-update-layer", handleUpdateLayer);
  socket.on("remote-remove-layer", handleRemoveLayer);

  // Return a cleanup function to detach the event listener when the effect is no longer needed
  return () => {
    socket.off("remote-add-layer", handleAddLayer);
    socket.off("remote-update-layer", handleUpdateLayer);
    socket.off("remote-remove-layer", handleRemoveLayer);
  };
};

const socketActiveLayerEffect = ({ setSelf }: any) => {
  // Define the event handler function outside the effect to avoid redefining it on every call
  const handleAddActiveLayer = (socketSelectedData: any) => {
    setSelf((prevSelectedData: any) => {
      if (Object.keys(prevSelectedData).length === 0) {
        return socketSelectedData;
      }

      const result = prevSelectedData.map((item: any) => ({ ...item }));

      // Then, update layerIds for matching users
      socketSelectedData.forEach((selecteData: any) => {
        const existingItem = result.find((existing: any) => existing.userId === selecteData.userId);

        if (existingItem) {
          const existingLayerIds = selecteData.layerIds;

          existingItem.layerIds = [...new Set(existingLayerIds)];
        } else {
          result.push(selecteData);
        }
      });

      return result;
    });
  };

  // Attach the event listener when the effect runs
  socket.on("remote-select-layer", handleAddActiveLayer);

  // Return a cleanup function to detach the event listener when the effect is no longer needed
  return () => {
    socket.off("remote-select-layer", handleAddActiveLayer);
  };
};

// ================   LAYER STATES   ================== //

export const layerAtomState = atom<Layer[]>({
  key: "layerAtomState", // unique ID (with respect to other atoms/selectors)
  default: [], // valeur par défaut (alias valeur initials)
  effects: [socketLayerEffect],
});

export const activeLayersAtom = atom({
  key: "activeLayersAtom",
  default: [{}], // Start with no active layers
  effects: [socketActiveLayerEffect],
});

export const hoveredLayerIdAtomState = atom<string>({
  key: "hoveredLayerIdAtomState", // unique ID (with respect to other atoms/selectors)
  default: "", // valeur par défaut (alias valeur initials)
});

// ================   EDGE EFFECTS   ================== //

const socketEdgeEffect = ({ setSelf }: any) => {
  // Define the event handler function outside the effect to avoid redefining it on every call
  const handleAddEdge = (addedEdge: Edge) => {
    setSelf((prevEdges: Edge[]) => [...prevEdges, addedEdge]);
  };

  const handleUpdateEdge = (updatedEdge: Edge) => {
    setSelf((prevEdges: Edge[]) => prevEdges.map((edge) => (edge.id === updatedEdge.id ? updatedEdge : edge)));
  };

  const handleRemoveEdge = (edgeIdsToDelete: string[]) => {
    setSelf((prevEdges: Edge[]) => prevEdges.filter((edge) => !edgeIdsToDelete.includes(edge.id)));
  };

  // Attach the event listener when the effect runs
  socket.on("remote-add-edge", handleAddEdge);
  socket.on("remote-update-edge", handleUpdateEdge);
  socket.on("remote-remove-edge", handleRemoveEdge);

  // Return a cleanup function to detach the event listener when the effect is no longer needed
  return () => {
    socket.off("remote-add-edge", handleAddEdge);
    socket.off("remote-update-edge", handleUpdateEdge);
    socket.off("remote-remove-edge", handleRemoveEdge);
  };
};

const socketActiveEdgeEffect = ({ setSelf }: any) => {
  // Define the event handler function outside the effect to avoid redefining it on every call
  const handleAddActiveEdge = (socketSelectedData: any) => {
    setSelf((prevSelectedData: any) => {
      if (Object.keys(prevSelectedData).length === 0) {
        return socketSelectedData;
      }

      const result = prevSelectedData.map((item: any) => ({ ...item }));

      // Then, update layerIds for matching users
      socketSelectedData.forEach((selecteData: any) => {
        const existingItem = result.find((existing: any) => existing.userId === selecteData.userId);

        if (existingItem) {
          const existingEdgeIds = selecteData.edgeIds;

          existingItem.edgeIds = [...new Set(existingEdgeIds)];
        } else {
          result.push(selecteData);
        }
      });

      return result;
    });
  };

  // Attach the event listener when the effect runs
  socket.on("remote-select-layer", handleAddActiveEdge);

  // Return a cleanup function to detach the event listener when the effect is no longer needed
  return () => {
    socket.off("remote-select-layer", handleAddActiveEdge);
  };
};

// ================   EDGES STATES   ================== //

export const edgesAtomState = atom<Edge[]>({
  key: "edgesAtomState",
  default: [],
  effects: [socketEdgeEffect],
});

export const activeEdgeIdAtom = atom({
  key: "activeEdgeIdAtom",
  default: [{}],
  effects: [socketActiveEdgeEffect],
});

export const hoveredEdgeIdAtom = atom<string | null>({
  key: "hoveredEdgeIdAtom",
  default: null,
});

export const isEdgeNearLayerAtom = atom<boolean>({
  key: "isEdgeNearLayerAtom",
  default: true,
});

export const nearestLayerAtom = atom<Layer | null>({
  key: "nearestLayerAtom",
  default: null,
});

// ================   PROMPT STATES  ================== //

export const promptValueState = atom({
  key: "promptValueState", // unique ID (with respect to other atoms/selectors)
  default: "", // valeur par défaut (alias valeur initials)
});

export const promptResultState = atom({
  key: "promptResultState",
  default: false,
});

export const historyIndexState = atom({
  key: "historyIndexState",
  default: -1,
});

export const nodeSelectedState = atom({
  key: "nodeSelectedState",
  default: false,
});

export const nodesState = atom<Node[]>({
  key: "nodesState",
  default: [],
});

// export const edgesState = atom<Edge[]>({
//   key: "edgesState",
//   default: [],
// });

export const streamedAnswersState = atom<ChatMessageProps[]>({
  key: "streamedAnswersState",
  default: [{ text: "", sender: "server" }],
});

export const qaState = atom<QuestionAnswersProps[]>({
  key: "qaState",
  default: [],
});

// ================   MODAL STATES   ================== //

export const modalState = atom({
  key: "modalState",
  default: false,
});

export const organizationState = atom({
  key: "organizationState",
  default: false,
});

export const organizationSettingsState = atom({
  key: "organizationSettingsState",
  default: false,
});

export const importModalState = atom({
  key: "importModalState",
  default: false,
});

export const shareModalState = atom({
  key: "shareModalState",
  default: false,
});

export const collaborateModalState = atom({
  key: "collaborateModalState",
  default: false,
});

export const upgradePlanModalState = atom({
  key: "upgradePlanModalState",
  default: false,
});

export const usernameState = atom({
  key: "usernameState",
  default: "",
});

export const collaboratorNameState = atom({
  key: "collaboratorNameState",
  default: "",
});

export const viewPortScaleState = atom({
  key: "viewPortScaleState",
  default: {},
});
