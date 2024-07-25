import { useSession } from "next-auth/react";
import { useRecoilValue } from "recoil";

import { Layer, XYWH } from "@/_types";
import { activeLayersAtom, hoveredLayerIdAtomState, layerAtomState } from "@/state";

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
  const session = useSession();
  const currentUserId = session.data?.session?.user?.id;

  const layers = useRecoilValue(layerAtomState);

  const allActiveLayers = useRecoilValue(activeLayersAtom);

  const activeLayerIDs = allActiveLayers
    .filter((userActiveLayer) => userActiveLayer.userId === currentUserId)
    .map((item) => item.layerIds)[0];

  const hoveredLayerID = useRecoilValue(hoveredLayerIdAtomState);

  const selectedLayers = layers.filter((layer) => activeLayerIDs?.includes(layer.id));

  if (selectedLayers.length > 0) return boundingBox(selectedLayers);

  const hoveredLayer = layers.filter((layer) => layer.id == hoveredLayerID);

  return boundingBox(hoveredLayer);
};

export { useSelectionBounds };
