import { useLocks, useMembers } from "@ably/spaces/react";
import { useState } from "react";
import { useRecoilValue } from "recoil";

import { Layer, XYWH } from "@/_types";
import { isEdgeNearLayerAtom, layerAtomState, nearestLayerAtom } from "@/state";

const boundingBox = (layers: Layer[]): XYWH | null => {
  const first = layers[0];

  if (!first) return null;

  let left = first.x;
  let right = first.x + first.width;
  let top = first.y;
  let bottom = first.y + first.height;

  for (let i = 1; i < layers.length; i++) {
    const { x, y, width, height } = layers[i];

    if (left > x) {
      left = x;
    }

    if (right < x + width) {
      right = x + width;
    }

    if (top > y) {
      top = y;
    }

    if (bottom < y + height) {
      bottom = y + height;
    }
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

const useSelectionBounds = () => {
  const layers = useRecoilValue(layerAtomState);

  const isEdgeNearLayer = useRecoilValue(isEdgeNearLayerAtom);
  const nearestLayer = useRecoilValue(nearestLayerAtom);

  const [lockedId, setLockedId] = useState<string>("");
  const { self } = useMembers();

  useLocks((lockUpdate) => {
    const lockHolder = lockUpdate.member;
    const locked = lockUpdate.status === "locked";
    const lockedByYou = locked && lockHolder.connectionId === self?.connectionId;

    if (lockedByYou) {
      setLockedId(lockUpdate.id);
      return;
    }

    setLockedId("");
  });

  // Check if layers is an array before filtering
  const selectedLayers = Array.isArray(layers) ? layers.filter((layer) => layer.id === lockedId) : [];

  if (selectedLayers.length > 0) return boundingBox(selectedLayers);

  // Return the bounds of the nearest layer when an edge is near it
  if (isEdgeNearLayer && nearestLayer) {
    return {
      x: nearestLayer.x,
      y: nearestLayer.y,
      width: nearestLayer.width,
      height: nearestLayer.height,
    };
  }
};

export { useSelectionBounds };
