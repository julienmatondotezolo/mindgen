import { useSpace } from "@ably/spaces/react";
import { produce } from "immer";
import { useRecoilCallback, useSetRecoilState } from "recoil";

import { Edge, Layer } from "@/_types";
import { ablyClient } from "@/app/providers";
import { useSocket } from "@/hooks";

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
  const layerChannelName = `[?rewind=1]${roomId}-layers`;
  const channel = ablyClient.channels.get(layerChannelName);

  return useRecoilCallback(
    ({ set }) =>
      async ({ layer }: { layer: Layer; userId: string }) => {
        set(layerAtomState, (currentLayers: Layer[]) => {
          const updatedLayers = [...currentLayers, layer];

          return updatedLayers;
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
  const layerChannelName = `[?rewind=1]${roomId}-layers`;
  const channel = ablyClient.channels.get(layerChannelName);

  return useRecoilCallback(
    ({ set }) =>
      ({ id, updatedElementLayer }: { id: string; updatedElementLayer: any }) => {
        set(layerAtomState, (currentLayers: Layer[]) => {
          // Create a new array with the updated layer
          const updatedLayers = currentLayers.map((layer) => {
            if (layer.id === id) {
              // If we find a matching id, merge the current layer with the updates
              const updatedLayer = {
                ...layer,
                ...updatedElementLayer,
              };

              // Publish to channel
              try {
                channel.publish("update", { updatedLayer });
              } catch (error) {
                console.error("can't update to channel:", error);
                return layer; // Return original state if publish fails
              }

              return updatedLayer;
            }
            return layer;
          });

          return updatedLayers;
        });
      },
    [channel],
  );
};

export const useRemoveElement = ({ roomId }: { roomId: string }) => {
  const layerChannelName = `[?rewind=1]${roomId}-layers`;
  const channel = ablyClient.channels.get(layerChannelName);

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
  const { socketEmit } = useSocket();

  return useRecoilCallback(
    ({ set }) =>
      ({ edgeIds, userId }: { edgeIds: string[]; userId: string }) => {
        const userActiveEdges = {
          userId,
          edgeIds,
        };

        // Update the activeLayersAtom with the provided layer IDs
        set(activeEdgeIdAtom, (currentActiveEdges: any) => {
          // If there are some currentActiveEdges add the selected Layer to it
          if (Object.keys(currentActiveEdges[0]).length === 0) {
            socketEmit("select-edge", { roomId, userId, selectedEdge: [userActiveEdges] });
            const mergEdges = [...currentActiveEdges, userActiveEdges];

            return mergEdges.filter((obj) => Object.keys(obj).length > 0);
          }

          const result = currentActiveEdges.map((item: any) => ({ ...item }));

          currentActiveEdges.forEach(() => {
            const existingItem = result.find((existing: any) => existing.userId === userActiveEdges.userId);

            if (existingItem) {
              socketEmit("select-edge", { roomId, userId, selectedEdge: [userActiveEdges] });
              existingItem.edgeIds = userActiveEdges.edgeIds;
            } else {
              socketEmit("select-edge", { roomId, userId, selectedEdge: [userActiveEdges] });
              result.push(userActiveEdges);
            }
          });

          return result;
        });
      },
    [roomId, socketEmit],
  );
};

export const useUnSelectEdgeElement = ({ roomId }: { roomId: string }) => {
  const { socketEmit } = useSocket();

  return useRecoilCallback(
    ({ set }) =>
      ({ userId }: { userId: string }) => {
        // Update the activeLayersAtom with the provided layer IDs
        set(activeEdgeIdAtom, (currentActiveEdges) => {
          const updatedActiveEdges = currentActiveEdges.map((item: any) => {
            if (item.userId === userId) {
              // Emit to socket when userId matches
              socketEmit("select-edge", { roomId, userId, selectedEdge: [{ userId, edgeIds: [] }] });
              return { ...item, edgeIds: [] };
            }

            // return { userId, edgeIds: [] };
            return item;
          });

          return updatedActiveEdges;
        });
      },
    [roomId, socketEmit],
  );
};

export const useAddEdgeElement = ({ roomId }: { roomId: string }) => {
  const { socketEmit } = useSocket();

  const addToHistory = useAddToHistoryPrivate();
  const setActiveEdges = useSetRecoilState(activeEdgeIdAtom);

  return useRecoilCallback(
    ({ set }) =>
      ({ edge, userId }: { edge: Edge; userId: string }) => {
        set(edgesAtomState, (currentEdges) =>
          produce(
            currentEdges,
            (draft) => {
              // Assuming currentEdges is an array, we push the new layer to it
              draft.push(edge);
              socketEmit("add-edge", { roomId, userId, edge });
            },
            (patches, inversePatches) => {
              addToHistory(patches, inversePatches, "edge");
            },
          ),
        );

        setActiveEdges([edge.id]);
      },
    [addToHistory, roomId, setActiveEdges, socketEmit],
  );
};

export const useUpdateEdge = ({ roomId }: { roomId: string }) => {
  const { socketEmit } = useSocket();

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

              socketEmit("update-edge", { roomId, userId, edge: updatedEdge });
            },
            (patches, inversePatches) => {
              addToHistory(patches, inversePatches, "edge");
            },
          ),
        );
      },
    [addToHistory, roomId, socketEmit],
  );
};

export const useRemoveEdge = ({ roomId }: { roomId: string }) => {
  const { socketEmit } = useSocket();

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
              socketEmit("remove-edge", { roomId, userId, edgeIdsToDelete: [id] });
            },
            (patches, inversePatches) => {
              addToHistory(patches, inversePatches, "edge");
            },
          ),
        );
      },
    [addToHistory, roomId, socketEmit],
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
