import { useSpace } from "@ably/spaces/react";
import { produce } from "immer";
import { useRecoilCallback, useRecoilValue } from "recoil";

import { Edge, Layer } from "@/_types";
import { ablyClient } from "@/app/providers";
import { getLayerById } from "@/utils";

import { activeEdgeIdAtom, activeLayersAtom, edgesAtomState, layerAtomState } from "./atoms";
import { useAddToHistoryPrivate } from "./History";

export const useSelectElement = ({ roomId }: { roomId: string }) => {
  const { space } = useSpace();

  return useRecoilCallback(
    ({ set }) =>
      async ({ layerIds }: { layerIds: string[] }) => {
        if (!space) return;

        // Update the activeLayersAtom with the provided layer IDs
        set(activeLayersAtom, () => layerIds);

        // checking whether a lock identifier is currently locked
        const isLocked = space.locks.get(roomId) !== undefined;

        if (isLocked) return;

        // Acquire lock with the updated layer IDs
        try {
          await space.locks.acquire(roomId, {
            attributes: { layerIds },
          });
        } catch (error) {
          console.error("Failed to acquire lock:", error);
          // Optionally revert the state change if lock acquisition fails
        }
      },
    [roomId, space],
  );
};

export const useUnSelectElement = ({ roomId }: { roomId: string }) => {
  const { space } = useSpace();

  return useRecoilCallback(
    ({ set }) =>
      async () => {
        if (!space) return;

        // Update the activeLayersAtom with the provided layer IDs
        set(activeLayersAtom, () => []);

        // Acquire lock with the updated layer IDs
        try {
          await space.locks.release(roomId);
        } catch (error) {
          console.error("Failed to release lock:", error);
          // Optionally revert the state change if lock release fails
        }
      },
    [roomId, space],
  );
};

export const useAddElement = ({ roomId }: { roomId: string }) => {
  const channelName = `${roomId}`;
  const channel = ablyClient.channels.get(channelName);

  return useRecoilCallback(
    ({ set }) =>
      async ({ layer }: { layer: Layer }) => {
        set(layerAtomState, (currentLayers: Layer[]) => {
          const addedLayers = [...currentLayers, layer];

          return addedLayers;
        });

        try {
          await channel.publish("add", { newLayer: layer });
        } catch (error) {
          console.error("can't add to channel:", error);
        }
      },
    [channel],
  );
};

export const useUpdateElement = ({ roomId }: { roomId: string }) => {
  const layers = useRecoilValue(layerAtomState);
  const channelName = `${roomId}`;
  const channel = ablyClient.channels.get(channelName);

  return useRecoilCallback(
    ({ set }) =>
      async ({ id, updatedElementLayer }: { id: string; updatedElementLayer: any }) => {
        set(layerAtomState, (currentLayers: Layer[]) => {
          // Create a new array with the updated layer
          const updatedLayers = currentLayers.map((layer) => {
            if (layer.id === id) {
              // If we find a matching id, merge the current layer with the updates
              const mergedLayer = {
                ...layer,
                ...updatedElementLayer,
              };

              return mergedLayer;
            }
            return layer;
          });

          return updatedLayers;
        });

        // Publish to channel
        try {
          const layer = getLayerById({ layerId: id, layers });

          const updatedLayer = {
            ...layer,
            ...updatedElementLayer,
          };

          await channel.publish("update", { updatedLayer });
        } catch (error) {
          // Return original state if publish fails
        }
      },
    [channel, layers],
  );
};

export const useRemoveElement = ({ roomId }: { roomId: string }) => {
  const channelName = `${roomId}`;
  const channel = ablyClient.channels.get(channelName);

  return useRecoilCallback(
    ({ set }) =>
      async ({ layerIdsToDelete }: { layerIdsToDelete: string[] }) => {
        set(layerAtomState, (currentLayers: Layer[]) => {
          // Filter out the layers with IDs that should be deleted
          const updatedLayers = currentLayers.filter((layer) => !layerIdsToDelete.includes(layer.id));

          return updatedLayers;
        });

        try {
          await channel.publish("remove", { layerIdsToDelete });
        } catch (error) {
          console.error("can't publish to channel:", error);
        }
      },
    [channel],
  );
};

/* ----------------- EDGES ----------------- */

export const useSelectEdgeElement = ({ roomId }: { roomId: string }) => {
  const { space } = useSpace();

  return useRecoilCallback(
    ({ set }) =>
      async ({ edgeIds }: { edgeIds: string[] }) => {
        if (!space) return;

        // Update the activeEdgeIdAtom with the provided layer IDs
        set(activeEdgeIdAtom, () => edgeIds);

        // checking whether a lock identifier is currently locked
        const isLocked = space.locks.get(roomId) !== undefined;

        if (isLocked) return;

        // Acquire lock with the updated layer IDs
        try {
          await space.locks.acquire(roomId, {
            attributes: { edgeIds },
          });
        } catch (error) {
          console.error("Failed to acquire lock:", error);
          // Optionally revert the state change if lock acquisition fails
        }
      },
    [roomId, space],
  );
};

export const useUnSelectEdgeElement = ({ roomId }: { roomId: string }) => {
  const { space } = useSpace();

  return useRecoilCallback(
    ({ set }) =>
      async () => {
        if (!space) return;

        // Update the activeLayersAtom with the provided layer IDs
        set(activeEdgeIdAtom, () => []);

        // Acquire lock with the updated layer IDs
        try {
          await space.locks.release(roomId);
        } catch (error) {
          console.error("Failed to release lock:", error);
          // Optionally revert the state change if lock release fails
        }
      },
    [roomId, space],
  );
};

export const useAddEdgeElement = ({ roomId }: { roomId: string }) => {
  const channelName = `${roomId}`;
  const channel = ablyClient.channels.get(channelName);

  return useRecoilCallback(
    ({ set }) =>
      async ({ edge }: { edge: Edge }) => {
        set(edgesAtomState, (currentEdges: Edge[]) => {
          const addedEdge = [...currentEdges, edge];

          return addedEdge;
        });

        try {
          await channel.publish("addEdge", { newEdge: edge });
        } catch (error) {
          console.error("can't add to channel:", error);
        }
      },
    [channel],
  );
};

export const useUpdateEdge = ({ roomId }: { roomId: string }) => {
  const addToHistory = useAddToHistoryPrivate();

  return useRecoilCallback(
    ({ set }) =>
      ({ id, userId, updatedElementEdge }: { id: string; userId: string; updatedElementEdge: any }) => {
        set(edgesAtomState, (currentEdges) =>
          produce(
            currentEdges,
            (draft) => {
              const index = draft.findIndex((edge) => edge.id === id);

              if (index !== -1) {
                draft[index] = mergeDeep(draft[index], updatedElementEdge);
              }
              const updatedEdge = draft[index];

              // socketEmit("update-edge", { roomId, userId, edge: updatedEdge });
            },
            (patches, inversePatches) => {
              addToHistory(patches, inversePatches, "edge");
            },
          ),
        );
      },
    [addToHistory, roomId],
  );
};

export const useRemoveEdge = ({ roomId }: { roomId: string }) => {
  const addToHistory = useAddToHistoryPrivate();

  return useRecoilCallback(
    ({ set }) =>
      ({ id, userId }: { id: string; userId: string }) => {
        set(edgesAtomState, (currentEdges) =>
          produce(
            currentEdges,
            (draft) => {
              // Filter out the layer with the given ID
              const index = draft.findIndex((edge) => edge.id === id);

              if (index !== -1) {
                // Remove the edge from the array in th atom state
                draft.splice(index, 1);
              }
              // socketEmit("remove-edge", { roomId, userId, edgeIdsToDelete: [id] });
            },
            (patches, inversePatches) => {
              addToHistory(patches, inversePatches, "edge");
            },
          ),
        );
      },
    [addToHistory, roomId],
  );
};

// Helper function for deep merging objects
function mergeDeep(target: any, source: any) {
  const output = Object.assign({}, target);

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}
