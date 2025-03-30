import { useMembers, useSpace } from "@ably/spaces/react";
import { Message } from "ably";
import { useChannel } from "ably/react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

import { Edge, Layer, LockedState, Point } from "@/_types";
import { edgesAtomState, layerAtomState, lockedAtomState } from "@/state";
import { randomUserColor } from "@/utils";

export const useLiveValue = ({ boardId }: { boardId: string }) => {
  const [lockedElementState, setLockedElementState] = useRecoilState(lockedAtomState);
  const setLayers = useSetRecoilState(layerAtomState);
  const setEdges = useSetRecoilState(edgesAtomState);
  const { space } = useSpace();
  const { self } = useMembers();
  const channelName = `mindmap-${boardId}`;

  const session: any = useSession();
  const currentUserName = session.data?.session?.user?.username;
  const currentUserId = session.data?.session?.user?.id;

  // ================  ENTERING SPACE ================== //
  useEffect(() => {
    async function enterSpace() {
      await space?.enter({
        username: currentUserName,
        userId: currentUserId,
        userColor: randomUserColor(),
      });
    }

    if (space && currentUserId && currentUserName) {
      enterSpace();
    }
  }, [currentUserId, currentUserName, space]);

  // ========================================================================== //
  // =======================  HANDLE CURSOR EMITING ===========================  //
  // ========================================================================== //

  const emitCursor = useCallback(
    ({ point, state }: { point: Point; state: "move" | "leave" }) => {
      if (!space) return;

      space.cursors.set({
        position: { ...point },
        data: { state },
      });
    },
    [space],
  );

  // ========================================================================== //
  // ================  LISTEN FOR MESSAGES FROM THE CHANNEL  ================== //
  // ========================================================================== //
  useChannel(channelName, (message: Message) => {
    // Ignore messages from the current user
    if (message.connectionId === self?.connectionId) return;

    // ================  LISTEN FOR LAYER MESSAGES  ================== //
    if (message.name === "ADD_LAYER") {
      const newLayer: Layer = JSON.parse(message.data).newLayer;

      setLayers((prevLayers: Layer[]) => [...prevLayers, newLayer]);
    }

    if (message.name === "UPDATE_LAYER") {
      const updatedLayers: Layer[] = JSON.parse(message.data).updatedLayers;

      setLayers((prevLayers: Layer[]) => {
        // Create a map of the updated layers for faster lookup
        const updatedLayersMap = new Map(updatedLayers.map((layer) => [layer.id, layer]));

        // Return a new array with updated layers
        return prevLayers.map((layer) => {
          // If this layer has an update, return the updated version
          const updatedLayer = updatedLayersMap.get(layer.id);

          if (updatedLayer) {
            return updatedLayer;
          }
          // Otherwise keep the original layer
          return layer;
        });
      });
    }

    if (message.name === "REMOVE_LAYER") {
      const layerIdsToDelete: string[] = JSON.parse(message.data).layerIds;

      setLayers((prevLayers: Layer[]) => prevLayers.filter((layer) => !layerIdsToDelete.includes(layer.id)));
    }

    // ================  LISTEN FOR LAYER MESSAGES  ================== //
    if (message.name === "ADD_EDGE") {
      const newEdge: Edge = JSON.parse(message.data).newEdge;

      setEdges((prevEdges: Edge[]) => [...prevEdges, newEdge]);
    }

    if (message.name === "UPDATE_EDGE") {
      const updatedEdges: Edge[] = JSON.parse(message.data).updatedEdges;

      setEdges((prevEdges: Edge[]) => {
        // Create a map of the updated edges for faster lookup
        const updatedEdgesMap = new Map(updatedEdges.map((edge) => [edge.id, edge]));

        // Return a new array with updated edges
        return prevEdges.map((edge) => {
          // If this edge has an update, return the updated version
          const updatedEdge = updatedEdgesMap.get(edge.id);

          if (updatedEdge) {
            return updatedEdge;
          }
          // Otherwise keep the original edge
          return edge;
        });
      });
    }

    if (message.name === "REMOVE_EDGE") {
      const edgeIdsToDelete: string[] = JSON.parse(message.data).edgeIds;

      setEdges((prevEdges: Edge[]) => prevEdges.filter((edge) => !edgeIdsToDelete.includes(edge.id)));
    }

    // ================  LISTEN FOR LOCK MESSAGES  ================== //
    if (message.name === "LOCK") {
      const lockedElement: LockedState = message.data.lockedElement;

      const { connectionId } = lockedElement;

      // If there are no locked elements, set the locked element state to the locked element
      if (lockedElementState.length === 0) {
        setLockedElementState([lockedElement]);
        return;
      }

      // If there are locked elements, update the locked element state to the locked element
      setLockedElementState((prevLockedElements: LockedState[]) =>
        prevLockedElements.map((prevLockedElement) => {
          if (prevLockedElement.connectionId === connectionId) {
            return lockedElement;
          }
          return prevLockedElement;
        }),
      );
    }

    if (message.name === "UNLOCK") {
      const lockedElement: LockedState = message.data.lockedElement;

      const { connectionId, lockedLayers, lockedEdges } = lockedElement;

      setLockedElementState((prevLockedElements: LockedState[]) =>
        prevLockedElements.map((prevLockedElement) => {
          if (prevLockedElement.connectionId === connectionId) {
            const filteredLockedLayers = prevLockedElement.lockedLayers.filter(
              (layerId) => !lockedLayers.includes(layerId),
            );
            const filteredLockedEdges = prevLockedElement.lockedEdges.filter((edgeId) => !lockedEdges.includes(edgeId));

            const newLockedElement: LockedState = {
              ...prevLockedElement,
              lockedLayers: filteredLockedLayers,
              lockedEdges: filteredLockedEdges,
              status: "unlocked",
            };

            return newLockedElement;
          }
          return prevLockedElement;
        }),
      );
    }
  });

  return {
    emitCursor,
  };
};
