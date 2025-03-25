import { useSpace } from "@ably/spaces/react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "react-query";
import { useRecoilCallback } from "recoil";

import { addEdgeCommand, deleteEdgeCommand, updateEdgeCommand } from "@/_services/commands/edgeCommandService";
import { addLayerCommand, deleteLayerCommand, updateLayerCommand } from "@/_services/commands/layerCommandService";
import { CustomSession, Edge, Layer } from "@/_types";
import { useMessage } from "@/components/ui/message-provider";

import { activeEdgeIdAtom, activeLayersAtom, edgesAtomState, layerAtomState } from "./atoms";

/* ----------------- LAYERS ----------------- */

export const useSelectElement = ({ roomId }: { roomId: string }) => {
  const { space } = useSpace();

  return useRecoilCallback(
    ({ set }) =>
      async ({ layerIds }: { layerIds: string[] }) => {
        // Update the activeLayersAtom with the provided layer IDs
        set(activeLayersAtom, () => layerIds);

        if (!space) return;

        // checking whether a lock identifier is currently locked
        const isLocked = space.locks.get(roomId) !== undefined;

        if (isLocked) {
          await space.locks.release(roomId);
        }

        // Acquire lock with the updated layer IDs
        try {
          const getAllLocks = await space.locks.getAll();

          if (getAllLocks.length === 0) return;

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
        // Update the activeLayersAtom with the provided layer IDs
        set(activeLayersAtom, () => []);

        if (!space) return;

        // Acquire lock with the updated layer IDs
        try {
          const getAllLocks = await space.locks.getAll();

          if (getAllLocks.length === 0) return;

          await space.locks.release(roomId);
          // await space.locks.acquire(roomId, {
          //   attributes: { layerIds: [] },
          // });
        } catch (error) {
          console.error("Failed to release lock:", error);
          // Optionally revert the state change if lock release fails
        }
      },
    [roomId, space],
  );
};

export const useAddElement = () => {
  const session = useSession();
  const safeSession: any = session ? (session as unknown as CustomSession) : null;
  const queryClient = useQueryClient();

  const { showMessage } = useMessage();

  const addLayerCommandMutation = useMutation(addLayerCommand, {
    onError: () => {
      showMessage("error", "ERROR_ADD_LAYER_COMMAND");
      // Invalidate the board query to refetch the latest data
      queryClient.invalidateQueries("board");
    },
  });

  return useRecoilCallback(
    ({ set }) =>
      async ({ layer, boardId }: { layer: Layer; boardId: string }) => {
        set(layerAtomState, (currentLayers: Layer[]) => {
          const addedLayers = [...currentLayers, layer];

          return addedLayers;
        });

        try {
          // await channel.publish("add", { newLayer: layer });
          addLayerCommandMutation.mutate({
            layer,
            boardId,
            session: safeSession,
          });
        } catch (error) {
          showMessage("error", "ERROR_ADD_LAYER_COMMAND");
          // Invalidate the board query with correct boardId to refetch the latest data
          queryClient.invalidateQueries("board");
        }
      },
    [addLayerCommandMutation, safeSession, showMessage, queryClient],
  );
};

export const useUpdateElement = () => {
  const session = useSession();
  const safeSession: any = session ? (session as unknown as CustomSession) : null;
  const queryClient = useQueryClient();

  const { showMessage } = useMessage();

  const updateLayerCommandMutation = useMutation(updateLayerCommand, {
    onError: () => {
      showMessage("error", "ERROR_UPDATE_LAYER_COMMAND");
      // Invalidate the board query with correct boardId to refetch the latest data
      queryClient.invalidateQueries("board");
    },
  });

  return useRecoilCallback(
    ({ set }) =>
      async ({ updatedLayers, boardId }: { updatedLayers: Layer[]; boardId: string }) => {
        set(layerAtomState, (currentLayers: Layer[]) => {
          // Create a map of the updated layers for faster lookup
          const updatedLayersMap = new Map(updatedLayers.map((layer) => [layer.id, layer]));

          // Return a new array with updated layers
          return currentLayers.map((layer) => {
            // If this layer has an update, return the updated version
            const updatedLayer = updatedLayersMap.get(layer.id);

            if (updatedLayer) {
              return updatedLayer;
            }
            // Otherwise keep the original layer
            return layer;
          });
        });

        try {
          // await channel.publish("add", { newLayer: layer });
          updateLayerCommandMutation.mutate({
            layers: updatedLayers,
            boardId,
            session: safeSession,
          });
        } catch (error) {
          showMessage("error", "ERROR_UPDATE_LAYER_COMMAND");
          // Invalidate the board query with correct boardId to refetch the latest data
          queryClient.invalidateQueries("board");
        }
      },
    [safeSession, showMessage, updateLayerCommandMutation, queryClient],
  );
};

export const useRemoveElement = () => {
  const session = useSession();
  const safeSession: any = session ? (session as unknown as CustomSession) : null;
  const queryClient = useQueryClient();

  const { showMessage } = useMessage();

  const deleteLayerCommandMutation = useMutation(deleteLayerCommand, {
    onError: () => {
      showMessage("error", "ERROR_DELETE_LAYER_COMMAND");
      // Invalidate the board query to refetch the latest data
      queryClient.invalidateQueries("board");
    },
  });

  return useRecoilCallback(
    ({ set }) =>
      async ({ layerIdsToDelete, boardId }: { layerIdsToDelete: string[]; boardId: string }) => {
        set(layerAtomState, (currentLayers: Layer[]) => {
          // Filter out the layers with IDs that should be deleted
          const updatedLayers = currentLayers.filter((layer) => !layerIdsToDelete.includes(layer.id));

          return updatedLayers;
        });

        try {
          // await channel.publish("add", { newLayer: layer });
          deleteLayerCommandMutation.mutate({
            layerIdsToDelete,
            boardId,
            session: safeSession,
          });
        } catch (error) {
          showMessage("error", "ERROR_DELETE_LAYER_COMMAND");
          // Also invalidate the query here in case the mutation doesn't reach the onError callback
          queryClient.invalidateQueries("board");
        }
      },
    [deleteLayerCommandMutation, safeSession, showMessage, queryClient],
  );
};

/* ----------------- EDGES ----------------- */

export const useSelectEdgeElement = ({ roomId }: { roomId: string }) => {
  const { space } = useSpace();

  return useRecoilCallback(
    ({ set }) =>
      async ({ edgeIds }: { edgeIds: string[] }) => {
        // Update the activeEdgeIdAtom with the provided layer IDs
        set(activeEdgeIdAtom, () => edgeIds);

        if (!space) return;

        // checking whether a lock identifier is currently locked
        const isLocked = space.locks.get(roomId) !== undefined;

        if (isLocked) {
          await space.locks.release(`${roomId}-edge`);
        }

        // Acquire lock with the updated layer IDs
        try {
          const getAllLocks = await space.locks.getAll();

          if (getAllLocks.length === 0) return;

          await space.locks.acquire(`${roomId}-edge`, {
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
        // Update the activeLayersAtom with the provided layer IDs
        set(activeEdgeIdAtom, () => []);

        if (!space) return;

        // Acquire lock with the updated layer IDs
        try {
          const getAllLocks = await space.locks.getAll();

          if (getAllLocks.length === 0) return;

          await space.locks.release(`${roomId}-edge`);
          // await space.locks.acquire(roomId, {
          //   attributes: { edgeIds: [] },
          // });
        } catch (error) {
          console.error("Failed to release lock:", error);
          // Optionally revert the state change if lock release fails
        }
      },
    [roomId, space],
  );
};

export const useAddEdge = () => {
  const session = useSession();
  const safeSession: any = session ? (session as unknown as CustomSession) : null;
  const queryClient = useQueryClient();

  const { showMessage } = useMessage();

  const addEdgeCommandMutation = useMutation(addEdgeCommand, {
    onError: () => {
      showMessage("error", "ERROR_ADD_EDGE_COMMAND");
      // Invalidate the board query to refetch the latest data
      queryClient.invalidateQueries("board");
    },
  });

  return useRecoilCallback(
    ({ set }) =>
      async ({ edge, boardId }: { edge: Edge; boardId: string }) => {
        set(edgesAtomState, (currentEdges: Edge[]) => {
          const addedEdge = [...currentEdges, edge];

          return addedEdge;
        });

        try {
          // await channel.publish("add", { newLayer: layer });
          addEdgeCommandMutation.mutate({
            edge,
            boardId,
            session: safeSession,
          });
        } catch (error) {
          showMessage("error", "ERROR_ADD_EDGE_COMMAND");
          // Invalidate the board query with correct boardId to refetch the latest data
          queryClient.invalidateQueries("board");
        }
      },
    [addEdgeCommandMutation, queryClient, safeSession, showMessage],
  );
};

export const useUpdateEdge = () => {
  const session = useSession();
  const safeSession: any = session ? (session as unknown as CustomSession) : null;
  const queryClient = useQueryClient();

  const { showMessage } = useMessage();

  const updateEdgeCommandMutation = useMutation(updateEdgeCommand, {
    onError: () => {
      showMessage("error", "ERROR_UPDATE_EDGE_COMMAND");
      // Invalidate the board query to refetch the latest data
      queryClient.invalidateQueries("board");
    },
  });

  return useRecoilCallback(
    ({ set }) =>
      async ({ updatedEdges, boardId }: { updatedEdges: Edge[]; boardId: string }) => {
        set(edgesAtomState, (currentEdges: Edge[]) => {
          // Create a map of the updated edges for faster lookup
          const updatedEdgesMap = new Map(updatedEdges.map((edge) => [edge.id, edge]));

          // Return a new array with updated edges
          return currentEdges.map((edge) => {
            // If this edge has an update, return the updated version
            const updatedEdge = updatedEdgesMap.get(edge.id);

            if (updatedEdge) {
              return updatedEdge;
            }
            // Otherwise keep the original edge
            return edge;
          });
        });

        try {
          updateEdgeCommandMutation.mutate({
            edges: updatedEdges,
            boardId,
            session: safeSession,
          });
        } catch (error) {
          showMessage("error", "ERROR_UPDATE_EDGE_COMMAND");
          // Invalidate the board query with correct boardId to refetch the latest data
          queryClient.invalidateQueries("board");
        }
      },
    [queryClient, safeSession, showMessage, updateEdgeCommandMutation],
  );
};

export const useRemoveEdge = () => {
  const session = useSession();
  const safeSession: any = session ? (session as unknown as CustomSession) : null;
  const queryClient = useQueryClient();

  const { showMessage } = useMessage();

  const deleteEdgeCommandMutation = useMutation(deleteEdgeCommand, {
    onError: () => {
      showMessage("error", "ERROR_DELETE_EDGE_COMMAND");
      // Invalidate the board query to refetch the latest data
      queryClient.invalidateQueries("board");
    },
  });

  return useRecoilCallback(
    ({ set }) =>
      async ({ edgeIdsToDelete, boardId }: { edgeIdsToDelete: string[]; boardId: string }) => {
        set(edgesAtomState, (currentEdges: Edge[]) => {
          // Filter out the edges with IDs that should be deleted
          const updatedEdges = currentEdges.filter((edge) => !edgeIdsToDelete.includes(edge.id));

          return updatedEdges;
        });

        try {
          // await channel.publish("add", { newLayer: layer });
          deleteEdgeCommandMutation.mutate({
            edgeIdsToDelete,
            boardId,
            session: safeSession,
          });
        } catch (error) {
          showMessage("error", "ERROR_DELETE_EDGE_COMMAND");
          // Also invalidate the query here in case the mutation doesn't reach the onError callback
          queryClient.invalidateQueries("board");
        }
      },
    [deleteEdgeCommandMutation, queryClient, safeSession, showMessage],
  );
};

// // Helper function for deep merging objects
// function mergeDeep({ target, source }: { target: any; source: any }) {
//   const output = Object.assign({}, target);

//   if (isObject(target) && isObject(source)) {
//     Object.keys(source).forEach((key) => {
//       if (isObject(source[key])) {
//         if (!(key in target)) Object.assign(output, { [key]: source[key] });
//         else output[key] = mergeDeep(target[key], source[key]);
//       } else {
//         Object.assign(output, { [key]: source[key] });
//       }
//     });
//   }
//   return output[0];
// }

// function isObject(item: any) {
//   return item && typeof item === "object" && !Array.isArray(item);
// }
