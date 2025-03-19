import { nanoid } from "nanoid";
import { useCallback } from "react";
import { useRecoilState } from "recoil";

import { Layer, Point } from "@/_types/canvas";
import { activeLayersAtom, layerAtomState } from "@/state";

export const useLayerOperations = () => {
  const [layers, setLayers] = useRecoilState(layerAtomState);
  const [activeLayers, setActiveLayers] = useRecoilState(activeLayersAtom);

  // Check if point is inside layer
  const isPointInLayer = useCallback((point: Point, layer: Layer) => {
    if (layer.type === "RECTANGLE") {
      return (
        point.x >= layer.x &&
        point.x <= layer.x + layer.width &&
        point.y >= layer.y &&
        point.y <= layer.y + layer.height
      );
    } else if (layer.type === "ELLIPSE") {
      const centerX = layer.x + layer.width / 2;
      const centerY = layer.y + layer.height / 2;
      const rx = layer.width / 2;
      const ry = layer.height / 2;

      const dx = (point.x - centerX) / rx;
      const dy = (point.y - centerY) / ry;

      return dx * dx + dy * dy <= 1;
    } else if (layer.type === "DIAMOND") {
      // Convert to a local coordinate system where the diamond is centered at the origin
      const centerX = layer.x + layer.width / 2;
      const centerY = layer.y + layer.height / 2;
      const rx = layer.width / 2;
      const ry = layer.height / 2;

      const dx = Math.abs(point.x - centerX) / rx;
      const dy = Math.abs(point.y - centerY) / ry;

      return dx + dy <= 1;
    }

    return false;
  }, []);

  // Find layers under a point
  const findLayersAtPoint = useCallback(
    (point: Point) => layers.filter((layer) => isPointInLayer(point, layer)).map((layer) => layer.id),
    [layers, isPointInLayer],
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
    findLayersAtPoint,
    findLayersInSelection,
    addLayer,
    layers,
    setLayers,
    activeLayers,
    setActiveLayers,
  };
};
