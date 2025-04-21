import { Point } from "framer-motion";
import { nanoid } from "nanoid";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { CanvasState, Edge, EdgeShape, EdgeType, HandlePosition, Layer, LayerType } from "@/_types";
import {
  activeEdgeIdAtom,
  activeLayersAtom,
  cameraStateAtom,
  canvasStateAtom,
  edgesAtomState,
  layerAtomState,
  useAddEdge,
  useAddEdgeLayer,
  useRemoveEdge,
  useRemoveEdgeLayer,
  useSelectElement,
  useUpdateEdge,
  useUpdateEdgeLayer,
} from "@/state";
import {
  edgeSmoothStepPathString,
  getControlWithCurvature,
  getHandleEndPosition,
  lineSegmentFallback,
} from "@/utils/edgeUtils";

type handleInfo = {
  isInHandle: boolean;
  handlePosition: HandlePosition;
  layerId: string;
  layerType: LayerType;
  coordinates: Point;
} | null;

type edgeHandleInfo = {
  isInHandle: boolean;
  handlePosition: "START" | "END";
  edge: Edge;
  coordinates: Point;
};

export const useEdgeOperations = ({ boardId }: { boardId: string }) => {
  const [edges, setEdges] = useRecoilState(edgesAtomState);
  const [activeEdgeId, setActiveEdgeId] = useRecoilState(activeEdgeIdAtom);
  const layers = useRecoilValue(layerAtomState);
  const activeLayers = useRecoilValue(activeLayersAtom);
  const setCanvasState = useSetRecoilState(canvasStateAtom);
  const [camera] = useRecoilState(cameraStateAtom);
  const { theme } = useTheme();
  const whiteboardText = useTranslations("Whiteboard");

  // Set the color of the edge
  const edgeColor = { r: 180, g: 191, b: 204, a: 0.5 };

  // Edge commands
  const selectLayer = useSelectElement({ boardId });
  const addEdgeCommand = useAddEdge();
  const addEdgeLayerCommand = useAddEdgeLayer();
  const updateEdgeCommand = useUpdateEdge();
  const updateEdgeLayerCommand = useUpdateEdgeLayer();
  const deleteEdgeCommand = useRemoveEdge();
  const deleteEdgeLayerCommand = useRemoveEdgeLayer();

  // Update edge position if connected layer is moving
  const updateEdgeIfConnectedLayerIsMoving = useCallback(
    ({ edge }: { edge: Edge }): { start: Point; end: Point } | undefined => {
      const fromLayer = edge.fromLayerId ? layers.find((layer) => layer.id === edge.fromLayerId) : null;
      const toLayer = edge.toLayerId ? layers.find((layer) => layer.id === edge.toLayerId) : null;

      const isFromLayerMoving = fromLayer && activeLayers.includes(fromLayer.id);
      const isToLayerMoving = toLayer && activeLayers.includes(toLayer.id);

      if (!isFromLayerMoving && !isToLayerMoving) return edge;

      // Calculate new positions based on connected layer positions
      let newStart = edge.start;
      let newEnd = edge.end;

      // Handle size and distance factor
      const handleSize = 12;
      const HANDLE_DISTANCE_FACTOR = 2.5;

      // If there's a fromLayer connection, update the start position based on its position
      if (fromLayer && isFromLayerMoving) {
        // Use handleStart if available to determine exact connection point
        // For now, we use a basic calculation (can be refined based on handle positions)
        if (edge.handleStart) {
          // If handle position is defined, calculate based on that
          switch (edge.handleStart) {
            case "TOP":
              newStart = { x: fromLayer.x + fromLayer.width / 2, y: fromLayer.y - handleSize * HANDLE_DISTANCE_FACTOR };
              break;
            case "RIGHT":
              newStart = {
                x: fromLayer.x + fromLayer.width + handleSize * HANDLE_DISTANCE_FACTOR,
                y: fromLayer.y + fromLayer.height / 2,
              };
              break;
            case "BOTTOM":
              newStart = {
                x: fromLayer.x + fromLayer.width / 2,
                y: fromLayer.y + fromLayer.height + handleSize * HANDLE_DISTANCE_FACTOR,
              };
              break;
            case "LEFT":
              newStart = {
                x: fromLayer.x - handleSize * HANDLE_DISTANCE_FACTOR,
                y: fromLayer.y + fromLayer.height / 2,
              };
              break;
            default:
              // Center as fallback
              newStart = { x: fromLayer.x + fromLayer.width / 2, y: fromLayer.y + fromLayer.height / 2 };
          }
        } else {
          // Default to center connection
          newStart = { x: fromLayer.x + fromLayer.width / 2, y: fromLayer.y + fromLayer.height / 2 };
        }
      }

      // If there's a toLayer connection, update the end position based on its position
      if (toLayer && isToLayerMoving) {
        // Use handleEnd if available to determine exact connection point
        if (edge.handleEnd) {
          // If handle position is defined, calculate based on that
          switch (edge.handleEnd) {
            case "TOP":
              newEnd = { x: toLayer.x + toLayer.width / 2, y: toLayer.y - handleSize * HANDLE_DISTANCE_FACTOR };
              break;
            case "RIGHT":
              newEnd = {
                x: toLayer.x + toLayer.width + handleSize * HANDLE_DISTANCE_FACTOR,
                y: toLayer.y + toLayer.height / 2,
              };
              break;
            case "BOTTOM":
              newEnd = {
                x: toLayer.x + toLayer.width / 2,
                y: toLayer.y + toLayer.height + handleSize * HANDLE_DISTANCE_FACTOR,
              };
              break;
            case "LEFT":
              newEnd = {
                x: toLayer.x - handleSize * HANDLE_DISTANCE_FACTOR,
                y: toLayer.y + toLayer.height / 2,
              };
              break;
            default:
              // Center as fallback
              newEnd = { x: toLayer.x + toLayer.width / 2, y: toLayer.y + toLayer.height / 2 };
          }
        } else {
          // Default to center connection
          newEnd = { x: toLayer.x + toLayer.width / 2, y: toLayer.y + toLayer.height / 2 };
        }
      }

      return {
        start: newStart,
        end: newEnd,
      };
    },
    [activeLayers, layers],
  );

  const isPointOnCurvedEdge = useCallback(
    ({ point, edge, proximityThreshold }: { point: Point; edge: Edge; proximityThreshold?: number }) => {
      const sourcePosition = edge.handleStart || HandlePosition.Top;
      const targetPosition = edge.handleEnd || HandlePosition.Top;
      const curvature = 0.5;
      const threshold = proximityThreshold ?? edge.thickness * 3; // Detection threshold based on edge thickness

      // Get control points for the bezier curve
      const [sourceControlX, sourceControlY] = getControlWithCurvature({
        pos: sourcePosition,
        x1: edge.start.x,
        y1: edge.start.y,
        x2: edge.end.x,
        y2: edge.end.y,
        c: curvature,
      });

      const [targetControlX, targetControlY] = getControlWithCurvature({
        pos: targetPosition,
        x1: edge.end.x,
        y1: edge.end.y,
        x2: edge.start.x,
        y2: edge.start.y,
        c: curvature,
      });

      // Sample points along the bezier curve to check distance
      const numSamples = 20;

      for (let i = 0; i <= numSamples; i++) {
        const t = i / numSamples;

        // Calculate point on the bezier curve using the cubic bezier formula
        const bezierX =
          Math.pow(1 - t, 3) * edge.start.x +
          3 * Math.pow(1 - t, 2) * t * sourceControlX +
          3 * (1 - t) * Math.pow(t, 2) * targetControlX +
          Math.pow(t, 3) * edge.end.x;

        const bezierY =
          Math.pow(1 - t, 3) * edge.start.y +
          3 * Math.pow(1 - t, 2) * t * sourceControlY +
          3 * (1 - t) * Math.pow(t, 2) * targetControlY +
          Math.pow(t, 3) * edge.end.y;

        // Calculate distance from point to this sample point on the curve
        const distance = Math.sqrt(Math.pow(point.x - bezierX, 2) + Math.pow(point.y - bezierY, 2));

        // If the point is close enough to any sample point, return true
        if (distance <= threshold) {
          return true;
        }
      }

      return false;
    },
    [],
  );

  const isPointOnSmoothStepEdge = useCallback(
    ({ point, edge, proximityThreshold }: { point: Point; edge: Edge; proximityThreshold?: number }) => {
      const threshold = proximityThreshold ?? edge.thickness * 3; // Detection threshold based on edge thickness

      // For smooth step edges, we'll use a sampling approach similar to the curved edge
      // Create a temporary SVG path to sample points from the smooth step path
      if (typeof document !== "undefined") {
        try {
          const pathString = edgeSmoothStepPathString({ edge });
          const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

          tempPath.setAttribute("d", pathString);

          // Sample points along the path
          const pathLength = tempPath.getTotalLength();
          const numSamples = Math.max(20, pathLength / 10); // At least 20 samples, or more for longer paths

          for (let i = 0; i <= numSamples; i++) {
            const distance = (i / numSamples) * pathLength;
            const pathPoint = tempPath.getPointAtLength(distance);

            // Check distance to this sample point
            const distToPoint = Math.sqrt(Math.pow(point.x - pathPoint.x, 2) + Math.pow(point.y - pathPoint.y, 2));

            if (distToPoint <= threshold) {
              return true;
            }
          }
        } catch (e) {
          // Fallback if SVG method fails
          return lineSegmentFallback({ edge, point, threshold });
        }
      } else {
        // Server-side rendering or no document available
        return lineSegmentFallback({ edge, point, threshold });
      }

      return false;
    },
    [],
  );

  // Check if point is edge
  const isPointOnEdge = useCallback(
    ({ point, edge, proximityThreshold }: { point: Point; edge: Edge; proximityThreshold?: number }) => {
      switch (edge.shape) {
        case EdgeShape.Curved:
          return isPointOnCurvedEdge({ point, edge, proximityThreshold });
        case EdgeShape.SmoothStep:
          return isPointOnSmoothStepEdge({ point, edge, proximityThreshold });
      }
    },
    [isPointOnCurvedEdge, isPointOnSmoothStepEdge],
  );

  // Check if point is near start or end of edge
  const isPointNearHandle = useCallback(
    ({ point, edge }: { point: Point; edge: Edge }) => {
      if (activeEdgeId.length > 0 && activeEdgeId.includes(edge.id)) {
        const startHandleEdge = {
          ...edge,
          ...edge.start,
          handlePosition: "START",
        };

        const endHandleEdge = {
          ...edge,
          ...edge.end,
          handlePosition: "END",
        };

        const edgeHandlePosition = [startHandleEdge, endHandleEdge];
        const handleSize = 10 / camera.scale;

        for (const edgeHandle of edgeHandlePosition) {
          const dx = point.x - edgeHandle.x;
          const dy = point.y - edgeHandle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= handleSize + 50) {
            return {
              isInHandle: true,
              handlePosition: edgeHandle.handlePosition as "START" | "END",
              edge,
              coordinates: {
                x: edgeHandle.x,
                y: edgeHandle.y,
              },
            };
          }
        }
      }

      // Not near any handle
      return null;
    },
    [activeEdgeId, camera.scale],
  );

  // Find edge under a point
  const findEdgeAtPoint = useCallback(
    (point: Point): Edge | undefined => edges.find((edge) => isPointOnEdge({ point, edge })),
    [edges, isPointOnEdge],
  );

  // Find edge near a point
  const findEdgeNearPoint = useCallback(
    (point: Point): Edge | undefined =>
      edges.find((edge) => isPointOnEdge({ point, edge, proximityThreshold: 25 + edge.thickness })),
    [edges, isPointOnEdge],
  );

  // Find handle near a point
  const findEdgeHandleAtPoint = useCallback(
    (point: Point) => edges.map((edge) => isPointNearHandle({ point, edge })).find((handleInfo) => handleInfo !== null),
    [edges, isPointNearHandle],
  );

  // When editing edge lock it to nearest handle
  const lockEdgeToNearestLayerHandle = useCallback(
    ({
      current,
      edgeHandleInfo,
      nearestHandle,
      fromLayerId,
      toLayerId,
    }: {
      current: Point;
      edgeHandleInfo?: edgeHandleInfo;
      nearestHandle?: handleInfo;
      fromLayerId: string | undefined;
      toLayerId: string | undefined;
    }): { point: Point; layerId: string } => {
      // If not nearest handle, return current position
      // If current edge fromLayerId is the same as toLayerId return current position
      // If nearest handle is on the same layer as the current edge, return current position
      if (!nearestHandle || nearestHandle.layerId === fromLayerId || fromLayerId === toLayerId) {
        if (edgeHandleInfo)
          setCanvasState((prev) => ({
            ...prev,
            current,
            handleInfo: undefined,
          }));

        return { point: current, layerId: "" };
      }

      // Update current canvas state and add handleInfo
      if (edgeHandleInfo)
        setCanvasState((prev) => ({
          ...prev,
          handleInfo: nearestHandle,
        }));
      // Lock to nearest handle
      const lockedPoint = nearestHandle.coordinates;
      const lockedLayerId = nearestHandle.layerId;

      return { point: lockedPoint, layerId: lockedLayerId };
    },
    [setCanvasState],
  );

  // Add a new edge
  const addEdge = useCallback(
    ({
      canvasState,
      newEdgePosition,
      toLayerId,
    }: {
      canvasState: CanvasState;
      newEdgePosition: Point;
      toLayerId: string;
    }) => {
      // Create a new edge
      const newEdge: Edge = {
        id: nanoid(),
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        fromLayerId: activeLayers[0],
        toLayerId,
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        start: canvasState.origin,
        end: newEdgePosition,
        color: edgeColor,
        hoverColor: { r: 77, g: 106, b: 255 },
        thickness: 2,
        orientation: "auto",
        type: EdgeType.Solid,
        label: "",
        shape: EdgeShape.Curved,
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        handleStart: canvasState.handleInfo?.handlePosition,
        handleEnd:
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          canvasState.handleInfo &&
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          getHandleEndPosition({ handleStartPosition: canvasState.handleInfo?.handlePosition }),
      };

      // Add the new edge
      addEdgeCommand({ edge: newEdge, boardId });

      return newEdge.id;
    },
    [activeLayers, addEdgeCommand, boardId, theme],
  );

  // Add a new edge layer
  const addEdgeLayer = useCallback(
    ({
      canvasState,
      newEdgePosition,
      layer,
      point,
    }: {
      canvasState: CanvasState;
      newEdgePosition: Point;
      layer: Layer;
      point: Point;
    }) => {
      // const newLayer: Layer = {
      //   ...layer,
      //   id: nanoid(),
      //   x: point.x, // Center the layer on the click point
      //   y: point.y,
      //   value: whiteboardText("typeSomething"),
      // };

      const newLayer = {
        id: nanoid(),
        type: layer.type as any,
        x: point.x,
        y: point.y,
        width: layer.width,
        height: layer.height,
        fill: layer.fill,
        value: whiteboardText("typeSomething"),
        valueStyle: layer.valueStyle,
        borderColor: layer.borderColor,
        borderWidth: layer.borderWidth,
        borderType: layer.borderType,
      };

      const toLayerId = newLayer.id;

      // Create a new edge
      const newEdge: Edge = {
        id: nanoid(),
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        fromLayerId: activeLayers[0],
        toLayerId,
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        start: canvasState.origin,
        end: newEdgePosition,
        color: edgeColor,
        hoverColor: { r: 77, g: 106, b: 255 },
        thickness: 2,
        orientation: "auto",
        type: EdgeType.Solid,
        label: "",
        shape: EdgeShape.Curved,
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        handleStart: canvasState.handleInfo?.handlePosition,
        handleEnd:
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          canvasState.handleInfo &&
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          getHandleEndPosition({ handleStartPosition: canvasState.handleInfo?.handlePosition }),
      };

      // Add the new edge layer
      addEdgeLayerCommand({ edge: newEdge, layer: newLayer, boardId });

      // Select the new layer
      selectLayer({ layerIds: [newLayer.id] });
    },
    [whiteboardText, activeLayers, edgeColor, addEdgeLayerCommand, boardId, selectLayer],
  );

  // Update an edge
  const updateEdge = useCallback(
    ({ updatedEdges }: { updatedEdges: Edge[] }) => {
      // Create a new array without dbId property
      const edgesWithoutDbId = updatedEdges.map((edge) => {
        // Create a shallow copy of the edge
        const newEdge = {
          id: edge.id,
          fromLayerId: edge.fromLayerId,
          toLayerId: edge.toLayerId,
          start: edge.start,
          end: edge.end,
          color: edge.color,
          hoverColor: edge.hoverColor,
          thickness: edge.thickness,
          orientation: edge.orientation,
          type: edge.type,
          label: edge.label,
          shape: edge.shape,
          handleStart: edge.handleStart,
          handleEnd: edge.handleEnd,
          arrowEnd: edge.arrowEnd,
        };

        return newEdge;
      });

      updateEdgeCommand({ updatedEdges: edgesWithoutDbId, boardId });
    },
    [boardId, updateEdgeCommand],
  );

  // Update a new edge layer
  const updateEdgeLayer = useCallback(
    ({ updatedEdges, updatedLayers }: { updatedEdges: Edge[]; updatedLayers: Layer[] }) => {
      // Create a new array without dbId property
      const edgesWithoutDbId = updatedEdges.map((edge) => {
        // Create a shallow copy of the edge
        const newEdge = {
          id: edge.id,
          fromLayerId: edge.fromLayerId,
          toLayerId: edge.toLayerId,
          start: edge.start,
          end: edge.end,
          color: edge.color,
          hoverColor: edge.hoverColor,
          thickness: edge.thickness,
          orientation: edge.orientation,
          type: edge.type,
          label: edge.label,
          shape: edge.shape,
          handleStart: edge.handleStart,
          handleEnd: edge.handleEnd,
        };

        return newEdge;
      });

      const layersWithoutDbId = updatedLayers.map((layer) => {
        // Create a shallow copy of the layer
        const newLayer = {
          id: layer.id,
          type: layer.type as any,
          x: layer.x,
          y: layer.y,
          width: layer.width,
          height: layer.height,
          fill: layer.fill,
          value: layer.value,
          valueStyle: layer.valueStyle,
          borderColor: layer.borderColor,
          borderWidth: layer.borderWidth,
          borderType: layer.borderType,
        };

        return newLayer;
      });

      updateEdgeLayerCommand({ updatedEdges: edgesWithoutDbId, updatedLayers: layersWithoutDbId, boardId });
    },
    [boardId, updateEdgeLayerCommand],
  );

  // Delete an edge
  const deleteEdge = useCallback(
    ({ edgeIdsToDelete }: { edgeIdsToDelete: string[] }) => {
      deleteEdgeCommand({ edgeIdsToDelete, boardId });
    },
    [boardId, deleteEdgeCommand],
  );

  // Update a new edge layer
  const deleteEdgeLayer = useCallback(
    ({ edgeIdsToDelete, layerIdsToDelete }: { edgeIdsToDelete: string[]; layerIdsToDelete: string[] }) => {
      deleteEdgeLayerCommand({ edgeIdsToDelete, layerIdsToDelete, boardId });
    },
    [boardId, deleteEdgeLayerCommand],
  );

  return {
    findEdgeAtPoint,
    findEdgeNearPoint,
    findEdgeHandleAtPoint,
    lockEdgeToNearestLayerHandle,
    edges,
    setEdges,
    activeEdgeId,
    setActiveEdgeId,
    addEdge,
    addEdgeLayer,
    updateEdge,
    updateEdgeLayer,
    deleteEdge,
    deleteEdgeLayer,
    updateEdgeIfConnectedLayerIsMoving,
  };
};
