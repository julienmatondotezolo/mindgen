import { useSpace } from "@ably/spaces/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useMutation } from "react-query";
import { useRecoilCallback, useRecoilValue } from "recoil";

import { addLayerCommand, deleteLayerCommand, updateLayerCommand } from "@/_services/commands/layerCommandService";
import { CustomSession, Edge, Layer } from "@/_types";
import { ablyClient } from "@/app/providers";
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

  const { showMessage } = useMessage();

  const responsText = useTranslations("ResponseMesssagesCode");

  const addLayerCommandMutation = useMutation(addLayerCommand, {
    onError: () => {
      showMessage("error", responsText("ERROR_ADD_LAYER_COMMAND"));
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
          showMessage("error", responsText("ERROR_ADD_LAYER_COMMAND"));
        }
      },
    [addLayerCommandMutation, responsText, safeSession, showMessage],
  );
};

export const useUpdateElement = () => {
  const session = useSession();
  const safeSession: any = session ? (session as unknown as CustomSession) : null;

  const { showMessage } = useMessage();

  const responsText = useTranslations("ResponseMesssagesCode");

  const updateLayerCommandMutation = useMutation(updateLayerCommand, {
    onError: () => {
      showMessage("error", responsText("ERROR_UPDATE_LAYER_COMMAND"));
    },
  });

  return useRecoilCallback(
    ({ set }) =>
      async ({ updatedLayer, boardId }: { id: string; updatedLayer: Layer; boardId: string }) => {
        set(layerAtomState, (currentLayers: Layer[]) => {
          // Update the layer in the array
          const updatedLayers = currentLayers.map((layer) => {
            if (layer.id === updatedLayer.id) {
              return updatedLayer;
            }
            return layer;
          });

          return updatedLayers;
        });

        try {
          // await channel.publish("add", { newLayer: layer });
          updateLayerCommandMutation.mutate({
            boardId,
            session: safeSession,
          });
        } catch (error) {
          showMessage("error", responsText("ERROR_UPDATE_LAYER_COMMAND"));
        }
      },
    [responsText, safeSession, showMessage, updateLayerCommandMutation],
  );
};

export const useRemoveElement = () => {
  const session = useSession();
  const safeSession: any = session ? (session as unknown as CustomSession) : null;

  const { showMessage } = useMessage();

  const responsText = useTranslations("ResponseMesssagesCode");

  const deleteLayerCommandMutation = useMutation(deleteLayerCommand, {
    onError: () => {
      showMessage("error", responsText("ERROR_DELETE_LAYER_COMMAND"));
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
            layerId: layerIdsToDelete[0],
            boardId,
            session: safeSession,
          });
        } catch (error) {
          showMessage("error", responsText("ERROR_DELETE_LAYER_COMMAND"));
        }
      },
    [deleteLayerCommandMutation, responsText, safeSession, showMessage],
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
  const edges = useRecoilValue(edgesAtomState);
  const channelName = `${roomId}`;
  const channel = ablyClient.channels.get(channelName);

  return useRecoilCallback(
    ({ set }) =>
      async ({ id, updatedElementEdge }: { id: string; updatedElementEdge: any }) => {
        set(edgesAtomState, (currentEdges: Edge[]) => {
          // Create a new array with the updated edge
          const updatedEdges = currentEdges.map((edge) => {
            if (edge.id === id) {
              // If we find a matching id, merge the current edge with the updates
              const mergedEdge = {
                ...edge,
                ...updatedElementEdge,
              };

              return mergedEdge;
            }
            return edge;
          });

          return updatedEdges;
        });

        // Publish to channel
        try {
          const edge = edges.filter((edge: Edge) => edge.id === id);

          const updatedEdge = mergeDeep({
            target: edge,
            source: edge,
          });

          await channel.publish("updatedEdge", { updatedEdge });
        } catch (error) {
          // Return original state if publish fails
        }
      },
    [channel, edges],
  );
};

export const useRemoveEdge = ({ roomId }: { roomId: string }) => {
  const channelName = `${roomId}`;
  const channel = ablyClient.channels.get(channelName);

  return useRecoilCallback(
    ({ set }) =>
      async ({ edgeIdsToDelete }: { edgeIdsToDelete: string[] }) => {
        set(edgesAtomState, (currentEdges: Edge[]) => {
          // Filter out the edges with IDs that should be deleted
          const updatedEdges = currentEdges.filter((edge) => !edgeIdsToDelete.includes(edge.id));

          return updatedEdges;
        });

        try {
          await channel.publish("removeEdge", { edgeIdsToDelete });
        } catch (error) {
          console.error("can't publish to channel:", error);
        }
      },
    [channel],
  );
};

// Helper function for deep merging objects
function mergeDeep({ target, source }: { target: any; source: any }) {
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
  return output[0];
}

function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}
