import { useMembers } from "@ably/spaces/react";
import { useSetRecoilState } from "recoil";

import { Layer } from "@/_types";
import { ablyClient } from "@/app/providers";
import { layerAtomState } from "@/state";

export const useLiveValue = async ({ boardId }: { boardId: string }) => {
  const setLayers = useSetRecoilState(layerAtomState);
  const { self } = useMembers();

  /** 💡 Use rewind to get the last message from the channel 💡 */
  const layerChannelName = `[?rewind=1]${boardId}-layers`;

  const channel = ablyClient.channels.get(layerChannelName);

  if (!self) return;

  await channel.subscribe((message) => {
    console.log("message:", message.name);
    if (message.connectionId === self.connectionId) return;

    const updatedLayer: Layer = message.data.layer;

    setLayers((prevLayers: Layer[]) =>
      prevLayers.map((layer) => (layer.id === updatedLayer.id ? updatedLayer : layer)),
    );

    return;
  });
};

//   useChannel(layerChannelName, (message: Message) => {
//     if (message.connectionId === self?.connectionId) return;

//     console.log("message.data:", message.data);
//   });
