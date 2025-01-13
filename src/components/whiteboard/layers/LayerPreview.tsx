/* eslint-disable no-unused-vars */

import { useLocks, useMembers } from "@ably/spaces/react";
import React, { memo, useState } from "react";

import { Layer, LayerType, Point } from "@/_types";
import { Diamond, Ellipse, Rectangle } from "@/components/whiteboard/layers";

interface LayerPreviewProps {
  layer: Layer;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string, origin?: Point) => void;
}

export const LayerPreview = memo(({ layer, onLayerPointerDown }: LayerPreviewProps) => {
  const layerId = layer.id;

  const [otherUserColor, setOtherUserColor] = useState<string>("");

  const { self } = useMembers();

  useLocks((lockUpdate) => {
    const lockHolder = lockUpdate.member;
    const { userColor } = lockHolder.profileData as {
      userColor: string;
    };
    const locked = lockUpdate.status === "locked";
    const lockedByOther = locked && lockHolder.connectionId !== self?.connectionId;

    if (lockedByOther) {
      if (!lockUpdate.attributes || !lockUpdate.attributes.layerIds) return;

      console.log("LAYER lockedByOther:", lockedByOther);

      const { layerIds } = lockUpdate.attributes as {
        layerIds: string[];
      };

      if (layerIds.includes(layerId)) setOtherUserColor(userColor);
      return;
    }

    setOtherUserColor("");
  });

  if (!layer) return null;

  switch (layer.type) {
    case LayerType.Ellipse:
      return <Ellipse id={layerId} layer={layer} onPointerDown={onLayerPointerDown} selectionColor={otherUserColor} />;
    case LayerType.Rectangle:
      return (
        <Rectangle id={layerId} layer={layer} onPointerDown={onLayerPointerDown} selectionColor={otherUserColor} />
      );
    case LayerType.Diamond:
      return <Diamond id={layerId} layer={layer} onPointerDown={onLayerPointerDown} selectionColor={otherUserColor} />;

    default:
      console.warn("Unknown layer type", layer);
      return null;
  }
});

LayerPreview.displayName = "LayerPreview";
