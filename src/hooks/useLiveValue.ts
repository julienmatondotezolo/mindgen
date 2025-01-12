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
  const channelName = `${boardId}`;

  useChannel(channelName, (message: Message) => {
    if (message.connectionId === self?.connectionId) return;

    if (message.name === "add") {
      const newLayer: Layer = message.data.newLayer;

      setLayers((prevLayers: Layer[]) => [...prevLayers, newLayer]);
    }

    if (message.name === "update") {
      const updatedLayer: Layer = message.data.updatedLayer;

      setLayers((prevLayers: Layer[]) =>
        prevLayers.map((layer) => (layer.id === updatedLayer.id ? updatedLayer : layer)),
      );
    }

    if (message.name === "remove") {
      const layerIdsToDelete: string[] = message.data.layerIdsToDelete;

      setLayers((prevLayers: Layer[]) => prevLayers.filter((layer) => !layerIdsToDelete.includes(layer.id)));
    }

    if (message.name === "addEdge") {
      const newEdge: Edge = message.data.newEdge;

      setEdges((prevEdges: Edge[]) => [...prevEdges, newEdge]);
    }

    if (message.name === "updateEdge") {
      const updatedEdge: Edge = message.data.updatedEdge;

      setEdges((prevEdges: Edge[]) => prevEdges.map((edge) => (edge.id === updatedEdge.id ? updatedEdge : edge)));
    }

    if (message.name === "removeEdge") {
      const edgeIdsToDelete: string[] = message.data.edgeIdsToDelete;

      setEdges((prevEdges: Edge[]) => prevEdges.filter((edge) => !edgeIdsToDelete.includes(edge.id)));
    }
  });
};
