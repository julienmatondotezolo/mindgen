import { useMembers } from "@ably/spaces/react";
import { Message } from "ably";
import { useChannel } from "ably/react";
import { useSetRecoilState } from "recoil";

import { Edge, Layer } from "@/_types";
import { edgesAtomState, layerAtomState } from "@/state";

export const useLiveValue = ({ boardId }: { boardId: string }) => {
  const setLayers = useSetRecoilState(layerAtomState);
  const setEdges = useSetRecoilState(edgesAtomState);
  const { self } = useMembers();
  const channelName = `mindmap-${boardId}`;

  useChannel(channelName, (message: Message) => {
    // eslint-disable-next-line no-console
    console.log("message:", message);
    if (message.connectionId === self?.connectionId) return;

    if (message.name === "ADD_LAYER") {
      const newLayer: Layer = message.data.newLayer;

      setLayers((prevLayers: Layer[]) => [...prevLayers, newLayer]);
    }

    if (message.name === "UPDATE_LAYER") {
      const updatedLayers: Layer[] = message.data.updatedLayers;

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
      const layerIdsToDelete: string[] = message.data.layerIds;

      setLayers((prevLayers: Layer[]) => prevLayers.filter((layer) => !layerIdsToDelete.includes(layer.id)));
    }

    if (message.name === "ADD_EDGE") {
      const newEdge: Edge = message.data.newEdge;

      setEdges((prevEdges: Edge[]) => [...prevEdges, newEdge]);
    }

    if (message.name === "UPDATE_EDGE") {
      const updatedEdges: Edge[] = message.data.updatedEdges;

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
      const edgeIdsToDelete: string[] = message.data.edgeIds;

      setEdges((prevEdges: Edge[]) => prevEdges.filter((edge) => !edgeIdsToDelete.includes(edge.id)));
    }
  });
};
