/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { produce } from "immer";
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from "recoil";

import { Layer, User } from "@/_types";
import { useSocket } from "@/hooks";

import { activeLayersAtom, layerAtomState } from "./atoms";
import { useAddToHistoryPrivate } from "./History";

export const useSelectElement = ({ roomId }: { roomId: string }) => {
  const { socketEmit } = useSocket();

  return useRecoilCallback(
    ({ set }) =>
      ({ layerIds, userId }: { layerIds: string[]; userId: string }) => {
        const userActiveLayers = {
          userId,
          layerIds,
        };

        // Update the activeLayersAtom with the provided layer IDs
        set(activeLayersAtom, (currentActiveLayers) => {
          if (currentActiveLayers[0]?.userId == undefined) {
            socketEmit("select-layer", { roomId, selectedLayer: [userActiveLayers] });
            return [userActiveLayers];
          }

          const newUserActiveLayers = currentActiveLayers.map((item: any) => {
            if (item.userId === userId) {
              return { ...item, layerIds: layerIds };
            }

            return item;
          });

          socketEmit("select-layer", { roomId, selectedLayer: newUserActiveLayers });
          return newUserActiveLayers;
        });
      },
    [roomId, socketEmit],
  );
};

export const useUnSelectElement = ({ roomId }: { roomId: string }) => {
  const { socketEmit } = useSocket();

  return useRecoilCallback(
    ({ set }) =>
      ({ userId }: { userId: string }) => {
        // Update the activeLayersAtom with the provided layer IDs
        set(activeLayersAtom, (currentActiveLayers) => {
          const updatedActiveLayers = currentActiveLayers.map((item) =>
            item.userId === userId ? { ...item, layerIds: [] } : item,
          );

          socketEmit("select-layer", { roomId, selectedLayer: updatedActiveLayers });

          return updatedActiveLayers;
        });
      },
    [],
  );
};

export const useAddElement = ({ roomId }: { roomId: string }) => {
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

export const useUpdateElement = ({ roomId }: { roomId: string }) => {
  const { socketEmit } = useSocket();

  const addToHistory = useAddToHistoryPrivate();

  return useRecoilCallback(
    ({ set }) =>
      (id: string, updatedElementLayer: any) => {
        set(layerAtomState, (currentLayers) =>
          produce(
            currentLayers,
            (draft) => {
              const index = draft.findIndex((layer) => layer.id === id);

              if (index !== -1) {
                Object.assign(draft[index], updatedElementLayer);
              }

              const mergedLayer = currentLayers.map((item: Layer) => {
                if (item.id === id) {
                  // Create a copy of the current item to avoid mutating the original object
                  let updatedItem: any = { ...item };

                  // Iterate over the keys of the updatedLayer object
                  Object.keys(updatedElementLayer).forEach((key) => {
                    // Dynamically add/update properties from updatedLayer to the updatedItem object
                    updatedItem[key] = updatedElementLayer[key];
                  });

                  // Return the updated item with merged properties from updatedLayer
                  return updatedItem;
                } else {
                  return item;
                }
              });

              const updatedLayers = currentLayers.filter((item: Layer) => item.id == mergedLayer[0].id);

              socketEmit("add-layer", { roomId, layer: mergedLayer });
            },
            // addToHistory,
          ),
        );
      },
    [roomId, socketEmit],
  );
};

export const useRemoveElement = ({ roomId }: { roomId: string }) => {
  const { socketEmit } = useSocket();

  const addToHistory = useAddToHistoryPrivate();

  const layers = useRecoilValue(layerAtomState);

  return useRecoilCallback(
    ({ set }) =>
      (id: string) => {
        set(layerAtomState, (currentLayers) =>
          produce(
            currentLayers,
            (draft) => {
              // Filter out the layer with the given ID
              const index = draft.findIndex((layer) => layer.id === id);
              const updatedLayer = currentLayers.filter((layer) => layer.id !== id);

              if (index !== -1) {
                // Remove the layer from the array in th atom state
                draft.splice(index, 1);
                socketEmit("add-layer", { roomId, layer: [...currentLayers, updatedLayer] });
              }
            },
            addToHistory,
          ),
        );
      },
    [addToHistory, roomId, socketEmit],
  );
};
