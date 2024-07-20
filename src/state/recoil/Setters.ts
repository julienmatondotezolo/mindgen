/* eslint-disable no-undef */

import { produce } from "immer";
import { nanoid } from "nanoid";
import { useRecoilCallback, useSetRecoilState } from "recoil";

import { Layer } from "@/_types";

import { activeLayersAtom, layerAtomState } from "./atoms";
import { useAddToHistoryPrivate } from "./History";

export const useAddElement = () => {
  const addToHistory = useAddToHistoryPrivate();
  const setActiveLayers = useSetRecoilState(activeLayersAtom);

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

        setActiveLayers([layer.id]);
      },
    [],
  );
};

export const useRemoveElement = () => {
  const addToHistory = useAddToHistoryPrivate();

  return useRecoilCallback(
    ({ set }) =>
      (id: string) => {
        set(layerAtomState, (currentLayers) =>
          produce(
            currentLayers,
            (draft) => {
              delete draft.array[id];
              const toRemoveIndesx = draft.arrayIds.indexOf(id);

              draft.arrayIds.splice(toRemoveIndesx, 1);
            },
            addToHistory,
          ),
        );
      },
    [],
  );
};
