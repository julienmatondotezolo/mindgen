import { useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { Layer } from "@/_types";
import { getHandlePosition } from "@/utils/canvasUtils";

import { edgesAtomState, layerAtomState } from "../atoms";

/**
 * Custom hook to synchronize edges with layer changes
 * This updates edge positions when connected layers' dimensions change
 */
export const useLayerEdgeSync = () => {
  const [edges, setEdges] = useRecoilState(edgesAtomState);
  const layers = useRecoilValue(layerAtomState);
  const prevLayersRef = useRef<Layer[]>([]);

  useEffect(() => {
    // Skip first render or when layers are empty
    if (prevLayersRef.current.length === 0) {
      prevLayersRef.current = layers;
      return;
    }

    // For each layer that changed dimensions, update connected edges
    const updatedEdges = edges.map((edge) => {
      const fromLayerId = edge.fromLayerId;
      const toLayerId = edge.toLayerId;

      // Find the corresponding layers from new and old arrays
      const oldFromLayer = fromLayerId ? prevLayersRef.current.find((layer) => layer.id === fromLayerId) : null;
      const newFromLayer = fromLayerId ? layers.find((layer) => layer.id === fromLayerId) : null;

      const oldToLayer = toLayerId ? prevLayersRef.current.find((layer) => layer.id === toLayerId) : null;
      const newToLayer = toLayerId ? layers.find((layer) => layer.id === toLayerId) : null;

      // Only update if a layer's dimensions changed
      const fromLayerDimensionsChanged =
        oldFromLayer &&
        newFromLayer &&
        (oldFromLayer.width !== newFromLayer.width || oldFromLayer.height !== newFromLayer.height);

      const toLayerDimensionsChanged =
        oldToLayer && newToLayer && (oldToLayer.width !== newToLayer.width || oldToLayer.height !== newToLayer.height);

      // If no dimensions changed, return the original edge
      if (!fromLayerDimensionsChanged && !toLayerDimensionsChanged) {
        return edge;
      }

      // Calculate new edge positions based on handle positions
      let updatedStart = edge.start;
      let updatedEnd = edge.end;

      if (fromLayerDimensionsChanged && newFromLayer) {
        // Update start position based on fromLayer's new dimensions
        updatedStart = getHandlePosition(
          { x: newFromLayer.x, y: newFromLayer.y, width: newFromLayer.width, height: newFromLayer.height },
          edge.handleStart,
        );
      }

      if (toLayerDimensionsChanged && newToLayer) {
        // Update end position based on toLayer's new dimensions
        updatedEnd = getHandlePosition(
          { x: newToLayer.x, y: newToLayer.y, width: newToLayer.width, height: newToLayer.height },
          edge.handleEnd,
        );
      }

      // Return the updated edge
      return {
        ...edge,
        start: updatedStart,
        end: updatedEnd,
      };
    });

    // Update the edges state if there are any changes
    if (JSON.stringify(edges) !== JSON.stringify(updatedEdges)) {
      setEdges(updatedEdges);
    }

    // Update previous layers for next comparison
    prevLayersRef.current = layers;
  }, [layers, edges, setEdges]);

  return null;
};
