import { useMembers } from "@ably/spaces/react";
import { useSetRecoilState } from "recoil";

import { Layer } from "@/_types";
import { ablyClient } from "@/app/providers";
import { layerAtomState } from "@/state";

export const useLiveValue = async ({ boardId }: { boardId: string }) => {
  const setLayers = useSetRecoilState(layerAtomState);
  const { self } = useMembers();

  if (!self) return;

  /** 💡 Use rewind to get the last message from the channel 💡 */
  const layerChannelName = `[?rewind=1]${boardId}`;

  const channel = ablyClient.channels.get(layerChannelName);

  if (!self) return;

  await channel.subscribe((message) => {
    if (message.connectionId === self.connectionId) return;

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

    return;
  });
};

//   useChannel(layerChannelName, (message: Message) => {
//     if (message.connectionId === self?.connectionId) return;

//     console.log("message.data:", message.data);
//   });
