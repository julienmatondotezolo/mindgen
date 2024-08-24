import { applyPatches, Patch, produce } from "immer";
import { atom, selector, useRecoilTransaction_UNSTABLE, useRecoilValue, useSetRecoilState } from "recoil";

import { edgesAtomState, layerAtomState } from "./atoms";

type HistoryUR = {
  undoPatches: Patch[];
  redoPatches: Patch[];
  type: "layer" | "edge";
};

export const historyAtom = atom<{
  undo: HistoryUR[];
  redo: HistoryUR[];
}>({
  key: "historyAtom",
  default: {
    undo: [],
    redo: [],
  },
});

export const historyCanRedoUndo = selector<{ redo: boolean; undo: boolean }>({
  key: "historyCanRedoUndo",
  get: ({ get }) => {
    const history = get(historyAtom);

    return {
      redo: history.redo.length > 0,
      undo: history.undo.length > 0,
    };
  },
});

export const useAddToHistoryPrivate = () => {
  const setHistory = useSetRecoilState(historyAtom);

  return (p: Patch[], ip: Patch[], type: "layer" | "edge") => {
    setHistory(
      produce((h) => {
        h.undo.push({
          redoPatches: p,
          undoPatches: ip,
          type,
        });
        h.redo = [];
      }),
    );
  };
};

const useUndo = () =>
  useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
    const history = get(historyAtom);
    const toUndo = history.undo[history.undo.length - 1];

    set(
      historyAtom,
      produce((h) => {
        h.undo.splice(h.undo.length - 1);
        h.redo.push(toUndo);
      }),
    );
    if (toUndo.type === "layer") {
      set(layerAtomState, (r) => applyPatches(r, toUndo.undoPatches));
    } else {
      set(edgesAtomState, (r) => applyPatches(r, toUndo.undoPatches));
    }
  });

const useRedo = () =>
  useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
    const history = get(historyAtom);
    const toRedo = history.redo[history.redo.length - 1];

    if (!toRedo) return; // Exit if there's nothing to redo

    set(
      historyAtom,
      produce((h) => {
        h.redo.splice(h.redo.length - 1);
        h.undo.push(toRedo);
      }),
    );
    if (toRedo.type === "layer") {
      set(layerAtomState, (r) => applyPatches(r, toRedo.redoPatches));
    } else if (toRedo.type === "edge") {
      set(edgesAtomState, (r) => applyPatches(r, toRedo.redoPatches));
    }
  });

export const useUndoRedo = () => {
  const undo = useUndo();
  const redo = useRedo();
  const can = useRecoilValue(historyCanRedoUndo);

  return {
    undo: {
      can: can.undo,
      handle: undo,
    },
    redo: {
      can: can.redo,
      handle: redo,
    },
  };
};
