/* eslint-disable no-undef */

import { produce } from "immer";
import { useRecoilCallback } from "recoil";

import { Layer } from "@/_types";

import { layerAtomState } from "./atoms";
import { useAddToHistoryPrivate } from "./History";

export const useAddElement = () => {
  const addToHistory = useAddToHistoryPrivate();

  return useRecoilCallback(
    ({ set }) =>
      (layer: Layer) => {
        set(layerAtomState, (currentLayers) =>
          produce(
            currentLayers,
            (draft) => {
              // Assuming currentLayers is an array, we push the new layer to it
              draft.push(layer);
            },
            addToHistory,
          ),
        );
      },
    [],
  );
};

export const useRemoveDesignElement = () => {
  const addToHistory = useAddToHistoryPrivate();

  return useRecoilCallback(
    ({ set }) =>
      (id: string) => {
        set(layerAtomState, (r) =>
          produce(
            r,
            (d) => {
              delete d.array[id];
              const toRemoveIndesx = d.arrayIds.indexOf(id);

              d.arrayIds.splice(toRemoveIndesx, 1);
            },
            addToHistory,
          ),
        );
      },
    [],
  );
};

export const useUpdateRootDesignElementIncrementCount = () => {
  const addToHistory = useAddToHistoryPrivate();

  return useRecoilCallback(
    ({ set }) =>
      () => {
        set(layerAtomState, (r) =>
          produce(
            r,
            (d: { obj: { count: number } }) => {
              d.obj.count += 1;
            },
            addToHistory,
          ),
        );
      },
    [],
  );
};
