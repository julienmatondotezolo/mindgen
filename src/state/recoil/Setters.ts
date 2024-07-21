/* eslint-disable no-undef */

import { produce } from "immer";
import { useRecoilCallback, useSetRecoilState } from "recoil";

import { Layer } from "@/_types";
import { useSocket } from "@/hooks";

import { activeLayersAtom, layerAtomState } from "./atoms";
import { useAddToHistoryPrivate } from "./History";

export const useAddElement = (roomId: string) => {
  const { socketEmit } = useSocket();

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
              socketEmit("add-layer", { roomId, layer: [...currentLayers, layer] });
            },
            addToHistory,
          ),
        );

        setActiveLayers([layer.id]);
      },
    [],
  );
};

export const useUpdateElement = (roomId: string) => {
  const { socketEmit } = useSocket();

  const addToHistory = useAddToHistoryPrivate();

  return useRecoilCallback(
    ({ set }) =>
      (id: string, updatedLayer: Partial<Layer>) => {
        set(layerAtomState, (currentLayers) =>
          produce(
            currentLayers,
            (draft) => {
              const index = draft.findIndex((layer) => layer.id === id);

              if (index !== -1) {
                Object.assign(draft[index], updatedLayer);
              }

              socketEmit("add-layer", { roomId, layer: [...currentLayers, updatedLayer] });
            },
            // addToHistory,
          ),
        );
      },
    [],
  );
};

export const useRemoveElement = (roomId: string) => {
  const { socketEmit } = useSocket();

  const addToHistory = useAddToHistoryPrivate();

  return useRecoilCallback(
    ({ set }) =>
      (id: string) => {
        set(layerAtomState, (currentLayers) =>
          produce(
            currentLayers,
            (draft) => {
              // Filter out the layer with the given ID
              const index = draft.findIndex((layer) => layer.id === id);

              if (index !== -1) {
                draft.splice(index, 1); // Remove the layer from the array
                console.log("Removed layer:", draft[index]); // Log the removed layer
                console.log("Updated layers array:", draft); // Log the updated array
              }

              // socketEmit("add-layer", { roomId, layer: [...currentLayers, updatedLayer] });
            },
            addToHistory,
          ),
        );
      },
    [],
  );
};
