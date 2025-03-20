/* eslint-disable no-case-declarations */
import { nanoid } from "nanoid";
import { useCallback } from "react";
import { useRecoilState } from "recoil";

import { Layer, Point } from "@/_types/canvas";
import { getHandlePosition } from "@/components/mindboard/layerUtils";
import { activeLayersAtom, layerAtomState } from "@/state";

export const useLayerOperations = () => {
  const [layers, setLayers] = useRecoilState(layerAtomState);
  const [activeLayers, setActiveLayers] = useRecoilState(activeLayersAtom);

  // Check if point is inside layer
  const isPointInLayer = useCallback((point: Point, layer: Layer) => {
    switch (layer.type) {
      case "RECTANGLE":
        return (
          point.x >= layer.x &&
          point.x <= layer.x + layer.width &&
          point.y >= layer.y &&
          point.y <= layer.y + layer.height
        );
      case "ELLIPSE":
        const centerX = layer.x + layer.width / 2;
        const centerY = layer.y + layer.height / 2;
        const rx = layer.width / 2;
        const ry = layer.height / 2;

        const dx = (point.x - centerX) / rx;
        const dy = (point.y - centerY) / ry;

        return dx * dx + dy * dy <= 1;
      case "DIAMOND":
        // Convert to a local coordinate system where the diamond is centered at the origin
        const diamondCenterX = layer.x + layer.width / 2;
        const diamondCenterY = layer.y + layer.height / 2;
        const diamondRx = layer.width / 2;
        const diamondRy = layer.height / 2;

        const diamondDx = Math.abs(point.x - diamondCenterX) / diamondRx;
        const diamondDy = Math.abs(point.y - diamondCenterY) / diamondRy;

        return diamondDx + diamondDy <= 1;
      default:
        return false;
    }
  }, []);

  // Check if point is inside a handle
  const isPointInHandle = useCallback((point: Point, layer: Layer, activeLayers: string[]) => {
    // Only check handles for active/selected layers
    if (!activeLayers.includes(layer.id) || activeLayers.length !== 1) {
      return;
    }

    // Get handle position (same as in drawLayerHandles.ts)
    const { handlePositions } = getHandlePosition(layer);

    // Check if point is inside any handle (circular hit test)
    for (const handle of handlePositions) {
      const dx = point.x - handle.x;
      const dy = point.y - handle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Use a threshold of 50 pixels for better usability
      if (distance <= 30) {
        return {
          handlePosition: handle.position,
          coordinates: {
            x: handle.x,
            y: handle.y,
          },
          layerId: layer.id,
        };
      }
    }
  }, []);

  // Find layers under a point
  const findLayerAtPoint = useCallback(
    (point: Point): Layer | undefined => layers.find((layer) => isPointInLayer(point, layer)),
    [layers, isPointInLayer],
  );

  // Find layer id under a point
  const findLayerIdsAtPoint = useCallback(
    (point: Point) => layers.filter((layer) => isPointInLayer(point, layer)).map((layer) => layer.id),
    [layers, isPointInLayer],
  );

  // Find a handle at a specific point
  const findHandleAtPoint = useCallback(
    (point: Point) => {
      // Only check handles for active layers
      for (const layer of layers) {
        const handleInfo = isPointInHandle(point, layer, activeLayers);

        // If a handle was found, return its information
        if (handleInfo && handleInfo.layerId) return handleInfo;
      }

      return null;
    },
    [layers, activeLayers, isPointInHandle],
  );

  // Find layers inside a selection rectangle
  const findLayersInSelection = useCallback(
    (origin: Point, current: Point) => {
      const x = Math.min(origin.x, current.x);
      const y = Math.min(origin.y, current.y);
      const width = Math.abs(origin.x - current.x);
      const height = Math.abs(origin.y - current.y);

      return layers
        .filter((layer) => {
          const layerCenterX = layer.x + layer.width / 2;
          const layerCenterY = layer.y + layer.height / 2;

          return layerCenterX >= x && layerCenterX <= x + width && layerCenterY >= y && layerCenterY <= y + height;
        })
        .map((layer) => layer.id);
    },
    [layers],
  );

  // Add a new layer
  const addLayer = useCallback(
    (type: string, point: Point) => {
      const newLayer: Layer = {
        id: nanoid(),
        type: type as any,
        x: point.x - 100, // Center the layer on the click point
        y: point.y - 30,
        width: 200,
        height: type === "RECTANGLE" ? 60 : 200, // Make ellipses and diamonds square
        fill: { r: 77, g: 106, b: 255 },
        value: "New Layer",
      };

      setLayers((prev) => [...prev, newLayer]);
      setActiveLayers([newLayer.id]);

      return newLayer.id;
    },
    [setLayers, setActiveLayers],
  );

  return {
    isPointInLayer,
    isPointInHandle,
    findLayerAtPoint,
    findLayerIdsAtPoint,
    findHandleAtPoint,
    findLayersInSelection,
    addLayer,
    layers,
    setLayers,
    activeLayers,
    setActiveLayers,
  };
};
