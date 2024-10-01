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
        set(activeLayersAtom, (currentActiveLayers) => {
          if (currentActiveLayers[0]?.userId == undefined) {
            socketEmit("select-layer", { roomId, userId, selectedLayer: [userActiveLayers] });
            return [userActiveLayers];
          }

          const newUserActiveLayers = currentActiveLayers.map((item: any) => {
            if (item.userId === userId) {
              return { ...item, layerIds: layerIds };
            }

            return item;
          });

          socketEmit("select-layer", { roomId, userId, selectedLayer: newUserActiveLayers });
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

          socketEmit("select-layer", { roomId, userId, selectedLayer: updatedActiveLayers });

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
                // socketEmit("add-layer", { roomId, layer: [...currentLayers, updatedLayer] });
              }
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

export const useAddEdgeElement = ({ roomId }: { roomId: string }) => {
  const { socketEmit } = useSocket();

  const addToHistory = useAddToHistoryPrivate();
  const setActiveLayers = useSetRecoilState(activeEdgeIdAtom);

  return useRecoilCallback(
    ({ set }) =>
      (edge: Edge) => {
        set(edgesAtomState, (currentEdges) =>
          produce(
            currentEdges,
            (draft) => {
              // Assuming currentEdges is an array, we push the new layer to it
              draft.push(edge);
              socketEmit("add-edge", { roomId, edge: [...currentEdges, edge] });
            },
            (patches, inversePatches) => {
              addToHistory(patches, inversePatches, "edge");
            },
          ),
        );

        setActiveLayers(edge.id);
      },
    [addToHistory, roomId, setActiveLayers, socketEmit],
  );
};

export const useUpdateEdge = ({ roomId }: { roomId: string }) => {
  const { socketEmit } = useSocket();

  const addToHistory = useAddToHistoryPrivate();

  return useRecoilCallback(
    ({ set }) =>
      (id: string, updatedElementEdge: any) => {
        set(edgesAtomState, (currentEdges) =>
          produce(
            currentEdges,
            (draft) => {
              const index = draft.findIndex((edge) => edge.id === id);

              if (index !== -1) {
                draft[index] = mergeDeep(draft[index], updatedElementEdge);
              }
              const updatedEdge = draft[index];

              socketEmit("add-edge", { roomId, edge: updatedEdge });
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
      (id: string) => {
        set(edgesAtomState, (currentEdges) =>
          produce(
            currentEdges,
            (draft) => {
              // Filter out the layer with the given ID
              const index = draft.findIndex((edge) => edge.id === id);
              const updatedEdges = currentEdges.filter((edge) => edge.id !== id);

              if (index !== -1) {
                // Remove the edge from the array in th atom state
                draft.splice(index, 1);
                socketEmit("add-edge", { roomId, layer: [...currentEdges, updatedEdges] });
              }
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
