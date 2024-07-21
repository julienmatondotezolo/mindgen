import { Edge, Node } from "reactflow";
import { atom } from "recoil";

import { ChatMessageProps, Layer, QuestionAnswersProps } from "@/_types";
import { socket } from "@/socket";

// ================   LAYER STATES   ================== //

const socketListenerEffect = ({ onSet, setSelf, node }: any) => {
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

export const layerAtomState = atom<Layer[]>({
  key: "layerAtomState", // unique ID (with respect to other atoms/selectors)
  default: [], // valeur par défaut (alias valeur initials)
  effects: [socketListenerEffect],
});

export const activeLayersAtom = atom<string[]>({
  key: "activeLayersAtom",
  default: [], // Start with no active layers
});

export const hoveredLayerIdAtomState = atom<String>({
  key: "hoveredLayerIdAtomState", // unique ID (with respect to other atoms/selectors)
  default: "", // valeur par défaut (alias valeur initials)
});

// ================   PROMPT STATES  ================== //

export const boardIdState = atom({
  key: "boardIdState", // unique ID (with respect to other atoms/selectors)
  default: "", // valeur par défaut (alias valeur initials)
});

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

export const edgesState = atom<Edge[]>({
  key: "edgesState",
  default: [],
});

export const streamedAnswersState = atom<ChatMessageProps[]>({
  key: "streamedAnswersState",
  default: [{ text: "", sender: "server" }],
});

export const qaState = atom<QuestionAnswersProps[]>({
  key: "qaState",
  default: [],
});

export const modalState = atom({
  key: "modalState",
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
function atomEffect(arg0: { trigger: string; setSelf: (newValue: any, { onSet }: { onSet: any }) => void }) {
  throw new Error("Function not implemented.");
}
