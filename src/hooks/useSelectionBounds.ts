import { useRecoilValue } from "recoil";

import { Layer, XYWH } from "@/_types";
import { activeLayersAtom, isEdgeNearLayerAtom, layerAtomState, nearestLayerAtom } from "@/state";

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
  const allActiveLayers = useRecoilValue(activeLayersAtom);

  const isEdgeNearLayer = useRecoilValue(isEdgeNearLayerAtom);
  const nearestLayer = useRecoilValue(nearestLayerAtom);

  // Check if layers is an array before filtering
  const selectedLayers = Array.isArray(layers) ? layers.filter((layer) => allActiveLayers.includes(layer.id)) : [];

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
