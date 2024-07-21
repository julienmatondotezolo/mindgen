import { applyPatches, Patch, produce } from "immer";
import { atom, selector, useRecoilTransaction_UNSTABLE, useRecoilValue, useSetRecoilState } from "recoil";

import { layerAtomState } from "./atoms";

type HistoryUR = {
  undoPatches: Patch[];
  redoPatches: Patch[];
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

  return (p: Patch[], ip: Patch[]) => {
    setHistory(
      produce((h) => {
        h.undo.push({
          redoPatches: p,
          undoPatches: ip,
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
    set(layerAtomState, (r) => applyPatches(r, toUndo.undoPatches));
  });

const useRedo = () =>
  useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
    const history = get(historyAtom);
    const toRedo = history.redo[history.redo.length - 1];

    set(
      historyAtom,
      produce((h) => {
        h.redo.splice(h.redo.length - 1);
        h.undo.push(toRedo);
      }),
    );
    set(layerAtomState, (r) => applyPatches(r, toRedo.redoPatches));
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
