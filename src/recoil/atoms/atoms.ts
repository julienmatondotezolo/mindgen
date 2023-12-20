import { Edge, Node } from "reactflow";
import { atom } from "recoil";

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
