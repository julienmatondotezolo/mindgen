import { produce } from "immer";
import { useRecoilCallback, useSetRecoilState } from "recoil";

import { Edge, Layer } from "@/_types";
import { useSocket } from "@/hooks";

import { activeEdgeIdAtom, activeLayersAtom, edgesAtomState, layerAtomState } from "./atoms";
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
        set(activeLayersAtom, (currentActiveLayers: any) => {
          // If there are some currentActiveLayers add the selected Layer to it
          if (
            !currentActiveLayers?.length ||
            !currentActiveLayers[0] ||
            Object.keys(currentActiveLayers[0]).length === 0
          ) {
            socketEmit("select-layer", { roomId, userId, selectedLayer: [userActiveLayers] });
            const mergLayers = [...currentActiveLayers, userActiveLayers];

            return mergLayers.filter((obj) => Object.keys(obj).length > 0);
          }

          const result = currentActiveLayers.map((item: any) => ({ ...item }));

          currentActiveLayers.forEach(() => {
            const existingItem = result.find((existing: any) => existing.userId === userActiveLayers.userId);

            if (existingItem) {
              socketEmit("select-layer", { roomId, userId, selectedLayer: [userActiveLayers] });
              existingItem.layerIds = userActiveLayers.layerIds;
            } else {
              socketEmit("select-layer", { roomId, userId, selectedLayer: [userActiveLayers] });
              result.push(userActiveLayers);
            }
          });

          return result;
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
          const updatedActiveLayers = currentActiveLayers.map((item: any) => {
            if (item.userId === userId) {
              // Emit to socket when userId matches
              socketEmit("select-layer", { roomId, userId, selectedLayer: [{ userId, layerIds: [] }] });
              return { ...item, layerIds: [] };
            }
            return item;
          });

          return updatedActiveLayers;
        });
      },
    [roomId, socketEmit],
  );
};

export const useAddElement = ({ roomId }: { roomId: string }) => {
  const { socketEmit } = useSocket();

  const addToHistory = useAddToHistoryPrivate();
  const setActiveLayers = useSetRecoilState(activeLayersAtom);

  return useRecoilCallback(
    ({ set }) =>
      ({ layer, userId }: { layer: Layer; userId: string }) => {
        set(layerAtomState, (currentLayers) =>
          produce(
            currentLayers,
            (draft) => {
              // Assuming currentLayers is an array, we push the new layer to it
              draft.push(layer);
              socketEmit("add-layer", { roomId, userId, layer });
            },
            (patches, inversePatches) => {
              addToHistory(patches, inversePatches, "layer");
            },
          ),
        );

        setActiveLayers([layer.id]);
      },
    [addToHistory, roomId, setActiveLayers, socketEmit],
  );
};

export const useUpdateElement = ({ roomId }: { roomId: string }) => {
  const { socketEmit } = useSocket();

  const addToHistory = useAddToHistoryPrivate();

  return useRecoilCallback(
    ({ set }) =>
      ({ id, userId, updatedElementLayer }: { id: string; userId: string; updatedElementLayer: any }) => {
        set(layerAtomState, (currentLayers) =>
          produce(
            currentLayers,
            (draft) => {
              const index = draft.findIndex((layer) => layer.id === id);

              if (index !== -1) {
                draft[index] = mergeDeep(draft[index], updatedElementLayer);
              }
              const updatedLayer = draft[index];

              socketEmit("update-layer", { roomId, userId, layer: updatedLayer });
            },
            (patches, inversePatches) => {
              addToHistory(patches, inversePatches, "layer");
            },
          ),
        );
      },
    [addToHistory, roomId, socketEmit],
  );
};

export const useRemoveElement = ({ roomId }: { roomId: string }) => {
  const { socketEmit } = useSocket();

  const addToHistory = useAddToHistoryPrivate();

  return useRecoilCallback(
    ({ set }) =>
      ({ layerIdsToDelete, userId }: { layerIdsToDelete: string[]; userId: string }) => {
        set(layerAtomState, (currentLayers) =>
          produce(
            currentLayers,
            (draft) => {
              // Iterate over layerIdsToDelete and remove the corresponding layers from the draft
              for (const layerId of layerIdsToDelete) {
                const index = draft.findIndex((layer) => layer.id === layerId);

                if (index !== -1) {
                  draft.splice(index, 1);
                }
              }
              socketEmit("remove-layer", { roomId, userId, layerIdsToDelete });
            },
            (patches, inversePatches) => {
              addToHistory(patches, inversePatches, "layer");
            },
          ),
        );
      },
    [addToHistory, roomId, socketEmit],
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
