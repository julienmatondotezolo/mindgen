import { Edge, Node } from "reactflow";
import { atom } from "recoil";

import { ChatMessageProps } from "@/_types/ChatMessageProps";
import { QuestionAnswersProps } from "@/_types/QuestionAnswersProps";

export const promptValueState = atom({
  key: "promptValueState", // unique ID (with respect to other atoms/selectors)
  default: "", // valeur par défaut (alias valeur initials)
});

export const promptResultState = atom({
  key: "promptResultState",
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
