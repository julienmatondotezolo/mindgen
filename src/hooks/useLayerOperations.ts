/* eslint-disable no-case-declarations */
import { nanoid } from "nanoid";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { CanvasMode, Corner, Layer, LayerType, Point, XYWH } from "@/_types/canvas";
import {
  activeLayersAtom,
  canvasStateAtom,
  layerAtomState,
  useAddElement,
  useRemoveElement,
  useSelectElement,
  useUnSelectElement,
  useUpdateElement,
} from "@/state";
import { calculateLayerBoundingBox, getHandlePosition } from "@/utils/layerUtils";

export const useLayerOperations = ({ boardId }: { boardId: string }) => {
  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);
  const [layers, setLayers] = useRecoilState(layerAtomState);
  const activeLayers = useRecoilValue(activeLayersAtom);
  const whiteboardText = useTranslations("Whiteboard");

  // Layer commands
  const selectLayer = useSelectElement({ boardId });
  const unSelectLayer = useUnSelectElement({ boardId });
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
      if (distance <= 25) {
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

  // Find a handle near a point
  const findHandleNearPoint = useCallback(
    (point: Point) => {
      if (canvasState.mode == CanvasMode.Resizing) return;
      // Check handles for all layers
      for (const layer of layers) {
        const handleInfo = isPointNearHandle(point, layer);

        // If a handle was found, return its information
        if (handleInfo && handleInfo.layerId) return handleInfo;
      }

      return null;
    },
    [canvasState, layers, isPointNearHandle],
  );

  // Find if point is inside a resize grip and return the corner type
  const findResizeGripAtPoint = useCallback(
    (point: Point): { layerId: string; corner: Corner } | null => {
      // Only check resize grips for active layers
      if (activeLayers.length === 0) return null;

      // Get the layers to check (either a single layer or a group bounding box)
      let layersToCheck: Layer[] = [];

      if (activeLayers.length > 1) {
        // For multiple layers, we use the bounding box of all selected layers
        layersToCheck = layers.filter((layer) => activeLayers.includes(layer.id));
      } else {
        // For a single layer, just check that layer
        const activeLayer = layers.find((layer) => layer.id === activeLayers[0]);

        if (activeLayer) layersToCheck = [activeLayer];
      }

      if (layersToCheck.length === 0) return null;

      // Calculate bounds for grip checking
      let box: XYWH;

      if (layersToCheck.length > 1) {
        // Calculate group bounding box
        const calculatedBox = calculateLayerBoundingBox(layersToCheck);

        if (!calculatedBox) return null; // Return null if we couldn't calculate a bounding box
        box = calculatedBox;
      } else {
        // Use single layer bounds
        const layer = layersToCheck[0];

        box = {
          x: layer.x,
          y: layer.y,
          width: layer.width,
          height: layer.height,
        };
      }

      // Handle size is 12px (same as in drawResizeGrips)
      const handleSize = canvasState.mode === CanvasMode.Resizing ? 80 : 20;

      // Define the grip areas (same positions as in drawResizeGrips)
      const gripAreas = [
        { corner: Corner.TopLeft, x: box.x - handleSize / 2, y: box.y - handleSize / 2 },
        { corner: Corner.TopCenter, x: box.x + box.width / 2 - handleSize / 2, y: box.y - handleSize / 2 },
        { corner: Corner.TopRight, x: box.x + box.width - handleSize / 2, y: box.y - handleSize / 2 },
        {
          corner: Corner.MiddleRight,
          x: box.x + box.width - handleSize / 2,
          y: box.y + box.height / 2 - handleSize / 2,
        },
        { corner: Corner.BottomRight, x: box.x + box.width - handleSize / 2, y: box.y + box.height - handleSize / 2 },
        {
          corner: Corner.BottomCenter,
          x: box.x + box.width / 2 - handleSize / 2,
          y: box.y + box.height - handleSize / 2,
        },
        { corner: Corner.BottomLeft, x: box.x - handleSize / 2, y: box.y + box.height - handleSize / 2 },
        { corner: Corner.MiddleLeft, x: box.x - handleSize / 2, y: box.y + box.height / 2 - handleSize / 2 },
      ];

      // Check if point is inside any grip area
      for (const grip of gripAreas) {
        if (
          point.x >= grip.x &&
          point.x <= grip.x + handleSize &&
          point.y >= grip.y &&
          point.y <= grip.y + handleSize
        ) {
          return {
            layerId: activeLayers[0], // Return the first active layer id (or the only one)
            corner: grip.corner,
          };
        }
      }

      return null;
    },
    [activeLayers, canvasState, layers],
  );

  // Resizing a layer ou multiple layers using state corner position
  const resizeSelectedLayer = useCallback(
    ({
      point,
      layer,
      isMouseDown,
      isShiftPressed,
      initialBounds,
      corner,
    }: {
      point: Point;
      layer: Layer;
      isMouseDown: boolean;
      isShiftPressed: boolean;
      initialBounds: XYWH;
      corner: Corner;
    }): Layer[] => {
      if (!isMouseDown) return [];

      // For multiple layers, only grab them once and only when needed
      const isMultiSelect = activeLayers.length > 1;

      // Handle multiple layers case
      if (isMultiSelect) {
        // Performance optimization: Filter only once and reuse result
        const selectedLayers = layers.filter((l) => activeLayers.includes(l.id));

        if (!selectedLayers.length) return [];

        // Pre-calculate constants
        const MIN_WIDTH = 100;
        const MIN_HEIGHT = 50;

        // Use let for values that will change
        let scaleX = 1;
        let scaleY = 1;
        let translateX = 0;
        let translateY = 0;
        let newBoundingWidth = initialBounds.width;
        let newBoundingHeight = initialBounds.height;
        let newBoundingX = initialBounds.x;
        let newBoundingY = initialBounds.y;

        // Calculate aspect ratio outside of switch for better performance
        const aspectRatio = isShiftPressed ? initialBounds.width / initialBounds.height : null;

        // Optimize resize calculations
        switch (corner) {
          case Corner.TopLeft: {
            newBoundingWidth = initialBounds.x + initialBounds.width - point.x;
            newBoundingHeight = initialBounds.y + initialBounds.height - point.y;

            if (aspectRatio !== null) {
              const widthChange = Math.abs(newBoundingWidth - initialBounds.width);
              const heightChange = Math.abs(newBoundingHeight - initialBounds.height);

              if (widthChange >= heightChange) {
                newBoundingHeight = newBoundingWidth / aspectRatio;
              } else {
                newBoundingWidth = newBoundingHeight * aspectRatio;
              }
            }

            newBoundingWidth = Math.max(newBoundingWidth, MIN_WIDTH);
            newBoundingHeight = Math.max(newBoundingHeight, MIN_HEIGHT);
            newBoundingX = initialBounds.x + initialBounds.width - newBoundingWidth;
            newBoundingY = initialBounds.y + initialBounds.height - newBoundingHeight;

            scaleX = newBoundingWidth / initialBounds.width;
            scaleY = newBoundingHeight / initialBounds.height;
            translateX = newBoundingX - initialBounds.x;
            translateY = newBoundingY - initialBounds.y;
            break;
          }

          case Corner.TopCenter: {
            newBoundingHeight = initialBounds.y + initialBounds.height - point.y;
            newBoundingHeight = Math.max(newBoundingHeight, MIN_HEIGHT);
            newBoundingY = initialBounds.y + initialBounds.height - newBoundingHeight;

            scaleY = newBoundingHeight / initialBounds.height;
            translateY = newBoundingY - initialBounds.y;
            break;
          }

          case Corner.TopRight: {
            newBoundingWidth = point.x - initialBounds.x;
            newBoundingHeight = initialBounds.y + initialBounds.height - point.y;

            if (aspectRatio !== null) {
              const widthChange = Math.abs(newBoundingWidth - initialBounds.width);
              const heightChange = Math.abs(newBoundingHeight - initialBounds.height);

              if (widthChange >= heightChange) {
                newBoundingHeight = newBoundingWidth / aspectRatio;
              } else {
                newBoundingWidth = newBoundingHeight * aspectRatio;
              }
            }

            newBoundingWidth = Math.max(newBoundingWidth, MIN_WIDTH);
            newBoundingHeight = Math.max(newBoundingHeight, MIN_HEIGHT);
            newBoundingY = initialBounds.y + initialBounds.height - newBoundingHeight;

            scaleX = newBoundingWidth / initialBounds.width;
            scaleY = newBoundingHeight / initialBounds.height;
            translateY = newBoundingY - initialBounds.y;
            break;
          }

          case Corner.MiddleRight: {
            newBoundingWidth = point.x - initialBounds.x;
            newBoundingWidth = Math.max(newBoundingWidth, MIN_WIDTH);

            scaleX = newBoundingWidth / initialBounds.width;
            break;
          }

          case Corner.BottomRight: {
            newBoundingWidth = point.x - initialBounds.x;
            newBoundingHeight = point.y - initialBounds.y;

            if (aspectRatio !== null) {
              const widthChange = Math.abs(newBoundingWidth - initialBounds.width);
              const heightChange = Math.abs(newBoundingHeight - initialBounds.height);

              if (widthChange >= heightChange) {
                newBoundingHeight = newBoundingWidth / aspectRatio;
              } else {
                newBoundingWidth = newBoundingHeight * aspectRatio;
              }
            }

            newBoundingWidth = Math.max(newBoundingWidth, MIN_WIDTH);
            newBoundingHeight = Math.max(newBoundingHeight, MIN_HEIGHT);

            scaleX = newBoundingWidth / initialBounds.width;
            scaleY = newBoundingHeight / initialBounds.height;
            break;
          }

          case Corner.BottomCenter: {
            newBoundingHeight = point.y - initialBounds.y;
            newBoundingHeight = Math.max(newBoundingHeight, MIN_HEIGHT);

            scaleY = newBoundingHeight / initialBounds.height;
            break;
          }

          case Corner.BottomLeft: {
            newBoundingWidth = initialBounds.x + initialBounds.width - point.x;
            newBoundingHeight = point.y - initialBounds.y;

            if (aspectRatio !== null) {
              const widthChange = Math.abs(newBoundingWidth - initialBounds.width);
              const heightChange = Math.abs(newBoundingHeight - initialBounds.height);

              if (widthChange >= heightChange) {
                newBoundingHeight = newBoundingWidth / aspectRatio;
              } else {
                newBoundingWidth = newBoundingHeight * aspectRatio;
              }
            }

            newBoundingWidth = Math.max(newBoundingWidth, MIN_WIDTH);
            newBoundingHeight = Math.max(newBoundingHeight, MIN_HEIGHT);
            newBoundingX = initialBounds.x + initialBounds.width - newBoundingWidth;

            scaleX = newBoundingWidth / initialBounds.width;
            scaleY = newBoundingHeight / initialBounds.height;
            translateX = newBoundingX - initialBounds.x;
            break;
          }

          case Corner.MiddleLeft: {
            newBoundingWidth = initialBounds.x + initialBounds.width - point.x;
            newBoundingWidth = Math.max(newBoundingWidth, MIN_WIDTH);
            newBoundingX = initialBounds.x + initialBounds.width - newBoundingWidth;

            scaleX = newBoundingWidth / initialBounds.width;
            translateX = newBoundingX - initialBounds.x;
            break;
          }
        }

        // Performance optimization: Pre-calculate initial bounds offset
        const initialX = initialBounds.x;
        const initialY = initialBounds.y;

        // Map all selected layers once with optimized transform calculation
        return selectedLayers.map((selectedLayer) => {
          // Calculate relative positions only once per layer
          const layerRelativeX = selectedLayer.x - initialX;
          const layerRelativeY = selectedLayer.y - initialY;

          // Return the transformed layer (creating only one new object)
          return {
            ...selectedLayer,
            x: initialX + layerRelativeX * scaleX + translateX,
            y: initialY + layerRelativeY * scaleY + translateY,
            width: selectedLayer.width * scaleX,
            height: selectedLayer.height * scaleY,
          };
        });
      }

      // Handle single layer case (original logic)
      // Minimum width & height in pixels
      const MIN_WIDTH = layer.type === LayerType.Rectangle ? 100 : 160;
      const MIN_HEIGHT = layer.type === LayerType.Rectangle ? 50 : 160;

      // Pre-calculate aspect ratio outside the switch
      const aspectRatio = isShiftPressed ? initialBounds.width / initialBounds.height : null;

      // Use destructuring for easier access to initialBounds properties
      const { x: initialX, y: initialY, width: initialWidth, height: initialHeight } = initialBounds;

      // Initialize variables to track changes
      let newWidth,
        newHeight,
        newX = layer.x,
        newY = layer.y;

      // Apply different calculations based on which corner is being dragged
      switch (corner) {
        case Corner.TopLeft: {
          newWidth = initialX + initialWidth - point.x;
          newHeight = initialY + initialHeight - point.y;

          if (aspectRatio !== null) {
            const widthChange = Math.abs(newWidth - initialWidth);
            const heightChange = Math.abs(newHeight - initialHeight);

            if (widthChange >= heightChange) {
              newHeight = newWidth / aspectRatio;
            } else {
              newWidth = newHeight * aspectRatio;
            }
          }

          newWidth = Math.max(newWidth, MIN_WIDTH);
          newHeight = Math.max(newHeight, MIN_HEIGHT);
          newX = initialX + initialWidth - newWidth;
          newY = initialY + initialHeight - newHeight;
          break;
        }

        case Corner.TopCenter: {
          newWidth = layer.width;
          newHeight = initialY + initialHeight - point.y;
          newHeight = Math.max(newHeight, MIN_HEIGHT);
          newY = initialY + initialHeight - newHeight;
          break;
        }

        case Corner.TopRight: {
          newWidth = point.x - initialX;
          newHeight = initialY + initialHeight - point.y;

          if (aspectRatio !== null) {
            const widthChange = Math.abs(newWidth - initialWidth);
            const heightChange = Math.abs(newHeight - initialHeight);

            if (widthChange >= heightChange) {
              newHeight = newWidth / aspectRatio;
            } else {
              newWidth = newHeight * aspectRatio;
            }
          }

          newWidth = Math.max(newWidth, MIN_WIDTH);
          newHeight = Math.max(newHeight, MIN_HEIGHT);
          newY = initialY + initialHeight - newHeight;
          break;
        }

        case Corner.MiddleRight: {
          newWidth = point.x - initialX;
          newWidth = Math.max(newWidth, MIN_WIDTH);
          newHeight = layer.height;
          break;
        }

        case Corner.BottomRight: {
          newWidth = point.x - initialX;
          newHeight = point.y - initialY;

          if (aspectRatio !== null) {
            const widthChange = Math.abs(newWidth - initialWidth);
            const heightChange = Math.abs(newHeight - initialHeight);

            if (widthChange >= heightChange) {
              newHeight = newWidth / aspectRatio;
            } else {
              newWidth = newHeight * aspectRatio;
            }
          }

          newWidth = Math.max(newWidth, MIN_WIDTH);
          newHeight = Math.max(newHeight, MIN_HEIGHT);
          break;
        }

        case Corner.BottomCenter: {
          newWidth = layer.width;
          newHeight = point.y - initialY;
          newHeight = Math.max(newHeight, MIN_HEIGHT);
          break;
        }

        case Corner.BottomLeft: {
          newWidth = initialX + initialWidth - point.x;
          newHeight = point.y - initialY;

          if (aspectRatio !== null) {
            const widthChange = Math.abs(newWidth - initialWidth);
            const heightChange = Math.abs(newHeight - initialHeight);

            if (widthChange >= heightChange) {
              newHeight = newWidth / aspectRatio;
            } else {
              newWidth = newHeight * aspectRatio;
            }
          }

          newWidth = Math.max(newWidth, MIN_WIDTH);
          newHeight = Math.max(newHeight, MIN_HEIGHT);
          newX = initialX + initialWidth - newWidth;
          break;
        }

        case Corner.MiddleLeft: {
          newWidth = initialX + initialWidth - point.x;
          newWidth = Math.max(newWidth, MIN_WIDTH);
          newHeight = layer.height;
          newX = initialX + initialWidth - newWidth;
          break;
        }
      }

      // Return a single optimized layer update
      return [
        {
          ...layer,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        },
      ];
    },
    [activeLayers, layers],
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

      // Update active layers in canvasState
      if (layersToKeepActive) {
        setCanvasState((prev) => ({
          ...prev,
          selectedLayersIds: layersToKeepActive,
        }));
      }
    },
    [activeLayers, layers, setCanvasState],
  );

  // Find if current selected layers is aligning vertically our horizontally to any other layer bounding box
  // Return the positions of the founded layers it is aligning with
  const findAlignments = useCallback(() => {
    if (!activeLayers.length) return null;

    const selectedLayers = layers.filter((layer) => activeLayers.includes(layer.id));
    const nonSelectedLayers = layers.filter((layer) => !activeLayers.includes(layer.id));

    if (!selectedLayers.length || !nonSelectedLayers.length) return null;

    const alignments = {
      vertical: [] as {
        position: number;
        isCenter?: boolean;
        isLeft?: boolean;
        isRight?: boolean;
        otherLayerCenterPosition?: { x: number };
      }[],
      horizontal: [] as {
        position: number;
        isCenter?: boolean;
        isTop?: boolean;
        isBottom?: boolean;
        otherLayerCenterPosition?: { y: number };
      }[],
      isPointNearCenterAlignment: false,
    };

    // For each selected layer, check alignment with non-selected layers
    selectedLayers.forEach((selectedLayer: Layer) => {
      const selectedLeft = selectedLayer.x;
      const selectedRight = selectedLayer.x + selectedLayer.width;
      const selectedCenterX = selectedLayer.x + selectedLayer.width / 2;
      const selectedTop = selectedLayer.y;
      const selectedBottom = selectedLayer.y + selectedLayer.height;
      const selectedCenterY = selectedLayer.y + selectedLayer.height / 2;

      // Tolerance for alignment detection (within 10 pixels)
      const tolerance = 3;

      nonSelectedLayers.forEach((otherLayer) => {
        const otherLeft = otherLayer.x;
        const otherRight = otherLayer.x + otherLayer.width;
        const otherCenterX = otherLayer.x + otherLayer.width / 2;
        const otherTop = otherLayer.y;
        const otherBottom = otherLayer.y + otherLayer.height;
        const otherCenterY = otherLayer.y + otherLayer.height / 2;

        // Check vertical alignments
        if (Math.abs(selectedLeft - otherLeft) <= tolerance) {
          const exists = alignments.vertical.some((a) => Math.abs(a.position - selectedLeft) <= tolerance && a.isLeft);

          if (!exists) {
            alignments.vertical.push({
              position: selectedLeft,
              isLeft: true,
              otherLayerCenterPosition: { x: otherLayer.x },
            });
          }
        }

        if (Math.abs(selectedCenterX - otherCenterX) <= tolerance) {
          const exists = alignments.vertical.some(
            (a) => Math.abs(a.position - selectedCenterX) <= tolerance && a.isCenter,
          );

          if (!exists) {
            alignments.vertical.push({
              position: selectedCenterX,
              isCenter: true,
              otherLayerCenterPosition: { x: otherLayer.x },
            });
          }
        }

        if (Math.abs(selectedRight - otherRight) <= tolerance) {
          const exists = alignments.vertical.some(
            (a) => Math.abs(a.position - selectedRight) <= tolerance && a.isRight,
          );

          if (!exists) {
            alignments.vertical.push({
              position: selectedRight,
              isRight: true,
              otherLayerCenterPosition: { x: otherLayer.x },
            });
          }
        }

        // Check horizontal alignments
        if (Math.abs(selectedTop - otherTop) <= tolerance) {
          const exists = alignments.horizontal.some((a) => Math.abs(a.position - selectedTop) <= tolerance && a.isTop);

          if (!exists) {
            alignments.horizontal.push({
              position: selectedTop,
              isTop: true,
              otherLayerCenterPosition: { y: selectedTop },
            });
          }
        }

        if (Math.abs(selectedCenterY - otherCenterY) <= tolerance) {
          const exists = alignments.horizontal.some(
            (a) => Math.abs(a.position - selectedCenterY) <= tolerance && a.isCenter,
          );

          if (!exists) {
            alignments.horizontal.push({
              position: selectedCenterY,
              isCenter: true,
              otherLayerCenterPosition: { y: undefined },
            });
          }
        }

        if (Math.abs(selectedBottom - otherBottom) <= tolerance) {
          const exists = alignments.horizontal.some(
            (a) => Math.abs(a.position - selectedBottom) <= tolerance && a.isBottom,
          );

          if (!exists) {
            alignments.horizontal.push({
              position: selectedBottom,
              isBottom: true,
              otherLayerCenterPosition: { y: selectedTop },
            });
          }
        }
      });
    });

    return alignments;
  }, [activeLayers, layers]);

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
      selectLayer({ layerIds: [newLayer.id] });

      return newLayer.id;
    },
    [whiteboardText, addLayerCommand, boardId, selectLayer],
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
    findHandleAtPoint,
    findHandleNearPoint,
    findResizeGripAtPoint,
    findLayersInSelection,
    findAlignments,
    resizeSelectedLayer,
    addLayer,
    updateLayer,
    deleteLayer,
    layers,
    setLayers,
    activeLayers,
    selectLayer,
    unSelectLayer,
  };
};
