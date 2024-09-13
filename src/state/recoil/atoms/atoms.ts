/* eslint-disable no-unused-vars */
import { Node } from "reactflow";
import { atom } from "recoil";

import { CanvasMode, CanvasState, ChatMessageProps, Edge, Layer, QuestionAnswersProps, User } from "@/_types";
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

// ================   LAYER EFFECTS   ================== //

const socketLayerEffect = ({ onSet, setSelf, node }: any) => {
  // Define the event handler function outside the effect to avoid redefining it on every call
  const handleAddLayer = (data: Layer) => {
    // Assuming the data structure allows updating the atom state directly
    setSelf(data);
  };

  // Attach the event listener when the effect runs
  socket.on("remote-add-layer", handleAddLayer);

  // Return a cleanup function to detach the event listener when the effect is no longer needed
  return () => {
    socket.off("remote-add-layer", handleAddLayer);
  };
};

const socketActiveLayerEffect = ({ onSet, setSelf, node }: any) => {
  // Define the event handler function outside the effect to avoid redefining it on every call
  const handleAddActiveLayer = (data: any) => {
    setSelf((prevLayers: any) => {
      const otherUserSelectedLayers = data.map((dataItem: { userId: any }) => {
        const matchingPrevItem = prevLayers.find((prevItem: { userId: any }) => prevItem.userId === dataItem.userId);

        if (matchingPrevItem) {
          return { ...dataItem, layerIds: matchingPrevItem.layerIds };
        }
        return dataItem;
      });

      return otherUserSelectedLayers;
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

export const boardIdState = atom({
  key: "boardIdState", // unique ID (with respect to other atoms/selectors)
  default: "", // valeur par défaut (alias valeur initials)
});

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

// ================   EDGES STATES   ================== //

export const edgesAtomState = atom<Edge[]>({
  key: "edgesAtomState", // unique ID (with respect to other atoms/selectors)
  default: [], // valeur par défaut (alias valeur initials)
});

export const activeEdgeIdAtom = atom<string | null>({
  key: "activeEdgeIdAtom",
  default: null,
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
