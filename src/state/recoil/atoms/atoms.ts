import { Edge, Node } from "reactflow";
import { atom } from "recoil";

import { ChatMessageProps, HistoryState, QuestionAnswersProps } from "@/_types";

export const promptValueState = atom({
  key: "promptValueState", // unique ID (with respect to other atoms/selectors)
  default: "", // valeur par défaut (alias valeur initials)
});

export const promptResultState = atom({
  key: "promptResultState",
  default: false,
});

export const historyState = atom<HistoryState[]>({
  key: "historyState",
  default: [],
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
