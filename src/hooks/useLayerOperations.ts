/* eslint-disable no-case-declarations */
import { nanoid } from "nanoid";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { useRecoilState } from "recoil";

import { Layer, LayerType, Point } from "@/_types/canvas";
import {
  activeLayersAtom,
  layerAtomState,
  useAddElement,
  useRemoveElement,
  useSelectElement,
  useUnSelectElement,
  useUpdateElement,
} from "@/state";
import { getHandlePosition } from "@/utils/layerUtils";

export const useLayerOperations = ({ boardId }: { boardId: string }) => {
  const [layers, setLayers] = useRecoilState(layerAtomState);
  const [activeLayers, setActiveLayers] = useRecoilState(activeLayersAtom);
  const whiteboardText = useTranslations("Whiteboard");

  // Layer commands
  const selectLayer = useSelectElement({ roomId: boardId });
  const unSelectLayer = useUnSelectElement({ roomId: boardId });
  const addLayerCommand = useAddElement();
  const deleteLayerCommand = useRemoveElement();
  const updateLayerCommand = useUpdateElement();

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
    const { handlePositions, handleSize } = getHandlePosition(layer);

    // Check if point is inside any handle (circular hit test)
    for (const handle of handlePositions) {
      const dx = point.x - handle.x;
      const dy = point.y - handle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // return true if the distance is less than the handle size
      const handleSizeAfterHover = 8;

      if (distance <= handleSize + handleSizeAfterHover) {
        return {
          isInHandle: true,
          handlePosition: handle.position,
          layerId: layer.id,
          coordinates: {
            x: handle.x,
            y: handle.y,
          },
        };
      }
    }

    return false;
  }, []);

  // Check if point is near a handle
  const isPointNearHandle = useCallback((point: Point, layer: Layer) => {
    // Get handle position (same as in drawLayerHandles.ts)
    const { handlePositions } = getHandlePosition(layer);

    // Check if point is inside any handle (circular hit test)
    for (const handle of handlePositions) {
      const dx = point.x - handle.x;
      const dy = point.y - handle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Use a threshold of 45 pixels for better usability
      if (distance <= 45) {
        return {
          isInHandle: false,
          handlePosition: handle.position,
          layerId: layer.id,
          layerType: layer.type,
          coordinates: {
            x: handle.x,
            y: handle.y,
          },
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
  const findHandleNearPoint = useCallback(
    (point: Point) => {
      // Only check handles for active layers
      for (const layer of layers) {
        const handleInfo = isPointNearHandle(point, layer);

        // If a handle was found, return its information
        if (handleInfo && handleInfo.layerId) return handleInfo;
      }

      return null;
    },
    [layers, isPointNearHandle],
  );

  // Find a handle at a specific point
  const findHandleAtPoint = useCallback(
    (point: Point) => {
      // Only check handles for active layers
      for (const layer of layers) {
        const handleInfo = isPointInHandle(point, layer, activeLayers);

        // If a handle was found, return its information
        if (handleInfo && handleInfo.isInHandle) return handleInfo;
      }

      return null;
    },
    [layers, isPointInHandle, activeLayers],
  );

  // Find layers inside a selection rectangle
  const findLayersInSelection = useCallback(
    (origin: Point, current: Point) => {
      const rect = {
        x: Math.min(origin.x, current.x),
        y: Math.min(origin.y, current.y),
        width: Math.abs(origin.x - current.x),
        height: Math.abs(origin.y - current.y),
      };

      // Track which layers should be active
      const layersToKeepActive = [...activeLayers];

      for (const layer of layers) {
        if (layer == null) {
          continue;
        }

        const { x, y, height, width } = layer;
        const intersectsWithSelection =
          rect.x + rect.width > x && rect.x < x + width && rect.y + rect.height > y && rect.y < y + height;

        // If layer intersects with selection and not already active, add it
        if (intersectsWithSelection && !activeLayers.includes(layer.id)) {
          layersToKeepActive.push(layer.id);
        }
        // If layer doesn't intersect with selection but is active, remove it
        else if (!intersectsWithSelection && activeLayers.includes(layer.id)) {
          const index = layersToKeepActive.indexOf(layer.id);

          if (index !== -1) {
            layersToKeepActive.splice(index, 1);
          }
        }
      }

      // Update active layers if there are changes
      if (JSON.stringify(layersToKeepActive) !== JSON.stringify(activeLayers)) {
        selectLayer({ layerIds: layersToKeepActive });
      }
    },
    [activeLayers, layers, selectLayer],
  );

  // Add a new layer
  const addLayer = useCallback(
    ({ type, point }: { type: LayerType; point: Point }) => {
      const newLayer: Layer = {
        id: nanoid(),
        type: type as any,
        x: point.x, // Center the layer on the click point
        y: point.y,
        width: 200,
        height: type === LayerType.Rectangle ? 60 : 200, // Make ellipses and diamonds square
        fill: { r: 77, g: 106, b: 255 },
        value: whiteboardText("typeSomething"),
      };

      // Add the new layer
      addLayerCommand({ layer: newLayer, boardId });
      // setLayers((prev) => [...prev, newLayer]);
      setActiveLayers([newLayer.id]);

      return newLayer.id;
    },
    [whiteboardText, addLayerCommand, boardId, setActiveLayers],
  );

  // Update a layer
  const updateLayer = useCallback(
    ({ updatedLayers }: { updatedLayers: Layer[] }) => {
      updateLayerCommand({ updatedLayers, boardId });
    },
    [boardId, updateLayerCommand],
  );

  // Delete a layer
  const deleteLayer = useCallback(
    ({ layerIdsToDelete }: { layerIdsToDelete: string[] }) => {
      deleteLayerCommand({ layerIdsToDelete, boardId });
    },
    [boardId, deleteLayerCommand],
  );

  return {
    isPointInLayer,
    isPointNearHandle,
    findLayerAtPoint,
    findLayerIdsAtPoint,
    findHandleNearPoint,
    findHandleAtPoint,
    findLayersInSelection,
    addLayer,
    updateLayer,
    deleteLayer,
    layers,
    setLayers,
    activeLayers,
    setActiveLayers,
    selectLayer,
    unSelectLayer,
  };
};
