import { Node } from "reactflow";
import { atom } from "recoil";

import {
  Camera,
  CanvasMode,
  CanvasState,
  ChatMessageProps,
  Edge,
  Filter,
  Layer,
  Member,
  MindmapObject,
  QuestionAnswersProps,
  User,
} from "@/_types";
import { Organization } from "@/_types/Organization";

// ================   CANVAS STATE   ================== //

export const cameraStateAtom = atom<Camera>({
  key: "cameraStateAtom", // unique ID (with respect to other atoms/selectors)
  default: { x: 0, y: 0, scale: 1 }, // valeur par défaut (alias valeur initials)
});

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

export const boardsLengthState = atom<number>({
  key: "boardsLengthState",
  default: 1,
});

// ================   LAYER STATES   ================== //

export const layerAtomState = atom<Layer[]>({
  key: "layerAtomState", // unique ID (with respect to other atoms/selectors)
  default: [], // valeur par défaut (alias valeur initials)
});

export const activeLayersAtom = atom<string[]>({
  key: "activeLayersAtom",
  default: [], // Start with no active layers
});

export const hoveredLayerIdAtomState = atom<string>({
  key: "hoveredLayerIdAtomState", // unique ID (with respect to other atoms/selectors)
  default: "", // valeur par défaut (alias valeur initials)
});

// ================   EDGES STATES   ================== //

export const edgesAtomState = atom<Edge[]>({
  key: "edgesAtomState",
  default: [],
});

export const activeEdgeIdAtom = atom<string[]>({
  key: "activeEdgeIdAtom",
  default: [],
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

export const newBoardState = atom({
  key: "newBoardState",
  default: false,
});

export const boardToDeleteState = atom<MindmapObject>({
  key: "boardToDeleteState",
  default: undefined,
});

export const deleteBoardModalState = atom({
  key: "deleteBoardModalState",
  default: false,
});

export const memberToDeleteState = atom<Member | undefined>({
  key: "memberToDeleteState",
  default: undefined,
});

export const removeMemberModalState = atom({
  key: "removeMemberModalState",
  default: false,
});

export const memberToLeaveOrgaState = atom<{ orgName: any; member: Member } | undefined>({
  key: "memberToLeaveOrgaState",
  default: undefined,
});

export const memberLeaveOrgaModalState = atom({
  key: "memberLeaveOrgaModalState",
  default: false,
});

export const modalState = atom({
  key: "modalState",
  default: false,
});

export const generateModalState = atom({
  key: "generateModalState",
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

export const generateDocumentState = atom({
  key: "generateDocumentState",
  default: false,
});

// ================   PROFIL STATES   ================== //

export const profilMaxMindmapState = atom<number>({
  key: "profilMaxMindmapState",
  default: 1,
});

// ================   CURSORS STATES   ================== //

export const globalCursorState = atom({
  key: "globalCursorState",
  default: false,
});

// ================   GLOBAL FILTER   ================== //

export const globalFilterState = atom<Filter>({
  key: "globalFilterState",
  default: Filter.Grid,
});
