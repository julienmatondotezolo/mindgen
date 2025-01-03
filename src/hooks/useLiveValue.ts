import { useMembers } from "@ably/spaces/react";
import { Message } from "ably";
import { useChannel } from "ably/react";
import { useSetRecoilState } from "recoil";

import { Layer } from "@/_types";
import { layerAtomState } from "@/state";

export const useLiveValue = ({ boardId }: { boardId: string }) => {
  const setLayers = useSetRecoilState(layerAtomState);
  const { self } = useMembers();
  const layerChannelName = `${boardId}`;

  useChannel(layerChannelName, (message: Message) => {
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
  });
};
