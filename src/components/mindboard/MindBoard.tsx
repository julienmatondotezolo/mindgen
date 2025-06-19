import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { BoardDataProps } from "@/_types/BoardDataProps";
import { CanvasMode, Edge, Layer, XYWH } from "@/_types/canvas";
import { useBoardKeyboardEvents, useEdgeOperations, useLayerOperations, useLiveValue, useLocks } from "@/hooks";
import { useBoard } from "@/hooks/useBoard";
import { useBoardRefresh } from "@/hooks/useBoardRefresh";
import { useCanvasNavigation } from "@/hooks/useCanvasNavigation";
import { cameraStateAtom, canvasStateAtom, lockedAtomState } from "@/state";
import { hexToRgba } from "@/utils";
import {
  calculateLayerBoundingBox,
  getLayerById,
  getShadowsPositionBasedOnPointerPositionInHandle,
} from "@/utils/layerUtils";

import { Toolbar } from "../whiteboard";
import { Controls, useCameraControls } from "./Controls";
import { DebugPanel } from "./DebugPanel";
import { canvasPointFromEvent, getCursorStyle } from "./mindBoardUtils";

const MindBoard = ({ boardData }: { boardData: BoardDataProps }) => {
  const boardId = boardData.id;
  const [camera] = useRecoilState(cameraStateAtom);
  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);
  const lockedElements = useRecoilValue(lockedAtomState);

  // Debug mode state
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(true);

  // Setup board & rendering
  const { canvasRef, setupCanvas, renderCanvas, isPointInSelectionToolBounds } = useBoard();

  // Camera controls
  const { fitView } = useCameraControls();

  // Use live value for collaborative features
  const { emitCursor } = useLiveValue({ boardId });

  // Subscribe to board query cache changes
  useBoardRefresh({ boardId });

  // Initialize canvas navigation with D3 (this handles all zoom and pan operations)
  useCanvasNavigation({ canvasRef });

  // Locks
  const { checkIfLayerIsLocked, checkIfEdgeIsLocked } = useLocks();

  // Layer operations
  const {
    findHandleAtPoint,
    findLayerAtPoint,
    findLayerIdsAtPoint,
    findLayersInSelection,
    findAlignments,
    findResizeGripAtPoint,
    findHandleNearPoint,
    resizeSelectedLayer,
    addLayer,
    updateLayer,
    layers,
    setLayers,
    activeLayers,
    selectLayer,
    unSelectLayer,
  } = useLayerOperations({ boardId });

  // Edge operations
  const {
    addEdge,
    addEdgeLayer,
    updateEdgeLayer,
    updateEdge,
    edges,
    setEdges,
    activeEdgeId,
    setActiveEdgeId,
    findEdgeNearPoint,
    findEdgeHandleAtPoint,
    lockEdgeToNearestLayerHandle,
    updateEdgeIfConnectedLayerIsMoving,
  } = useEdgeOperations({ boardId });

  // Setup canvas on mount
  useEffect(() => {
    setLayers(boardData.layers);
    setEdges(boardData.edges);
    setupCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupCanvas]);

  // Update mouse event handlers to handle different modes
  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const point = canvasPointFromEvent(e, camera, canvasRef.current);

      switch (canvasState.mode) {
        case CanvasMode.None:
          // eslint-disable-next-line no-case-declarations
          const clickedLayerIds = findLayerIdsAtPoint(point);
          // eslint-disable-next-line no-case-declarations
          const clickedEdgeId = findEdgeNearPoint(point)?.id;

          // If a layer is locked, don't allow it to be selected
          if (clickedLayerIds.some((layerId) => checkIfLayerIsLocked(layerId))) {
            return;
          }

          // If an edge is locked, don't allow it to be selected
          if (clickedEdgeId && checkIfEdgeIsLocked(clickedEdgeId)) {
            return;
          }

          // If no layer our edge is clicked set mode to selection net
          // And clear active layers
          if (clickedLayerIds.length === 0) {
            unSelectLayer();
            setCanvasState({
              mode: CanvasMode.SelectionNet,
              origin: point,
              current: point,
            });
          }
          if (!clickedEdgeId) {
            setActiveEdgeId([]);
            setCanvasState({
              mode: CanvasMode.SelectionNet,
              origin: point,
              current: point,
            });
          }

          // If an edge is clicked set the active edge id
          if (clickedEdgeId) {
            setActiveEdgeId([clickedEdgeId]);
          }

          // If a layer click is detected add it to activeLayers state
          if (clickedLayerIds.length > 0) {
            // If holding shift, toggle selection
            if (e.shiftKey) {
              const layerId = clickedLayerIds[0];

              selectLayer({ layerIds: [...activeLayers, layerId] });
            } else {
              // Replace selection
              const layerId = clickedLayerIds[0];

              if (!activeLayers.includes(layerId)) {
                selectLayer({ layerIds: [layerId] });
              }

              // Start translating
              setCanvasState({
                mode: CanvasMode.Translating,
                current: point,
                initialLayerBounds: activeLayers.map((layerId) => getLayerById({ layerId, layers })),
              });
            }
          }
          break;
        case CanvasMode.Grab:
          // Start panning the canvas
          setCanvasState({
            mode: CanvasMode.Grab,
          });
          return;
        case CanvasMode.Inserting:
          // Add a new shape at the click point
          addLayer({ type: canvasState.layerType, point });
          // After adding, switch back to select mode
          setCanvasState({
            mode: CanvasMode.None,
          });
          return;
        case CanvasMode.Edge:
          // Start drawing an edge if point is in handle
          // Otherwise put mode back to None
          if (canvasState.handleInfo?.isInHandle === true) {
            setCanvasState((prev) => ({
              ...prev,
              mode: CanvasMode.EdgeDrawing,
            }));
          } else {
            unSelectLayer();
            setCanvasState({
              mode: CanvasMode.None,
            });
          }
          return;
        default:
          break;
      }
    },
    [
      camera,
      canvasRef,
      canvasState,
      findLayerIdsAtPoint,
      findEdgeNearPoint,
      checkIfEdgeIsLocked,
      setCanvasState,
      addLayer,
      activeLayers,
      layers,
      checkIfLayerIsLocked,
      unSelectLayer,
      setActiveEdgeId,
      selectLayer,
    ],
  );

  const handleMouseMove = useCallback(
    async (e: React.PointerEvent<HTMLCanvasElement>) => {
      // console.log("e:", e.movementX, e.movementY);
      const point = canvasPointFromEvent(e, camera, canvasRef.current);
      // Find layers at current mouse position
      const layersAtPoint = findLayerAtPoint(point);
      // Find nearest handle at current mouse position
      const isPointNearHandle = findHandleNearPoint(point);

      // Find handle at current mouse position
      const isPointInHandle = findHandleAtPoint(point);

      // Get alignments data when a layer is being moved/resized
      const alignments = findAlignments();

      // Find edge at current mouse position
      const edgeNearPoint = findEdgeNearPoint(point);
      // Find EDGE HANDLE at current mouse position
      const edgeHandleInfo = findEdgeHandleAtPoint(point);

      // Check if the mouse is inside a resize grip
      // eslint-disable-next-line no-case-declarations
      const resizeGripInfo = findResizeGripAtPoint(point);

      // Check if point is inside the selection tool
      const selectionToolInfo = isPointInSelectionToolBounds(point);

      if (canvasState.mode === CanvasMode.None) {
        // If handle is active and layer is active, set the mode to Edge
        if (isPointNearHandle && activeLayers.includes(isPointNearHandle.layerId) && activeLayers.length < 2) {
          setCanvasState({
            mode: CanvasMode.Edge,
            origin: isPointNearHandle.coordinates,
            handleInfo: isPointNearHandle,
          });
          return;
        }

        // If current pointer is in handle, set mode to Edge drawing
        if (edgeHandleInfo && activeEdgeId.includes(edgeHandleInfo.edge.id)) {
          setCanvasState({
            mode: CanvasMode.EdgeEditing,
            current: point,
            edgeHandleInfo,
          });

          return;
        }

        // If pointer is inside selection tool and we have active layers, change mode to Tooling
        if (
          selectionToolInfo.isInSelectionTool &&
          (activeLayers.length > 0 || activeEdgeId.length > 0) &&
          canvasState.mode === CanvasMode.None
        ) {
          const updatedState: any = {
            ...canvasState,
            mode: CanvasMode.Tooling,
            isInSelectionTool: true,
          };

          // Only add toolingMode if it exists in the selectionToolInfo
          if ("toolingMode" in selectionToolInfo) {
            updatedState.toolingMode = selectionToolInfo.toolingMode;
          }

          setCanvasState(updatedState);
          return;
        }

        if (resizeGripInfo) {
          // Variables used in case blocks
          let initialBounds: XYWH | undefined;

          // Get the initial bounds of the layer or layer group
          if (activeLayers.length > 1) {
            // For multiple layers, get the bounding box
            const selectedLayers = layers.filter((layer) => activeLayers.includes(layer.id));
            const box = calculateLayerBoundingBox(selectedLayers);

            if (box) {
              initialBounds = box;
            } else {
              return; // Can't resize without valid bounds
            }
          } else {
            // For a single layer, use its bounds
            const layer = layers.find((layer) => layer.id === activeLayers[0]);

            if (!layer) return;

            initialBounds = {
              x: layer.x,
              y: layer.y,
              width: layer.width,
              height: layer.height,
            };
          }

          // Set canvas state to Resizing
          setCanvasState({
            mode: CanvasMode.Resizing,
            initialBounds,
            corner: resizeGripInfo.corner,
          });
          return;
        }

        // Only set to None mode if we didn't set to Edge mode
        setCanvasState((prev) => ({
          ...prev,
          mode: CanvasMode.None,
          hoveredLayerId: layersAtPoint?.id,
          hoveredEdgeId: edgeNearPoint?.id,
        }));
      } else if (canvasState.mode === CanvasMode.Edge) {
        // If the point is in the handle, set the isInHandle to true else set it to false
        if (isPointInHandle) {
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          setCanvasState((prev) => ({
            ...prev,
            handleInfo: {
              // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
              ...prev.handleInfo,
              isInHandle: isPointInHandle.isInHandle,
            },
          }));

          return;
        } else {
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          setCanvasState((prev) => ({
            ...prev,
            handleInfo: {
              // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
              ...prev.handleInfo,
              isInHandle: false,
            },
          }));
        }

        // If the point is not in the handle, set the mode to None
        if (!isPointNearHandle) {
          setCanvasState({
            mode: CanvasMode.None,
          });
          return;
        }
      } else if (canvasState.mode === CanvasMode.EdgeEditing) {
        // If the point is not in the handle, set the mode to None
        // And not equal to active edge
        if (!edgeHandleInfo) {
          setCanvasState({
            mode: CanvasMode.None,
          });
          return;
        }

        const edgeHandlePosition = canvasState.edgeHandleInfo?.handlePosition;

        // If inside the handle and left click is down update the edge
        if (e.buttons === 1) {
          // Update the edge start or end based on the handle position
          // If the handle is on the start, remove the fromLayerId
          // If the handle is on the end, remove the toLayerId
          let updatedEdge: Edge;

          if (edgeHandlePosition === "START") {
            updatedEdge = {
              ...edgeHandleInfo.edge,
              start: isPointNearHandle?.coordinates ?? point,
              fromLayerId: isPointNearHandle?.layerId,
              handleStart: isPointNearHandle?.handlePosition,
            };
          }

          if (edgeHandlePosition === "END") {
            updatedEdge = {
              ...edgeHandleInfo.edge,
              end: isPointNearHandle?.coordinates ?? point,
              toLayerId: isPointNearHandle?.layerId,
              handleEnd: isPointNearHandle?.handlePosition,
            };
          }

          // Update the edge state
          setEdges((prev) => prev.map((edge) => (edge.id === edgeHandleInfo.edge.id ? updatedEdge : edge)));

          // Update the canvas state
          setCanvasState((prev) => ({
            ...prev,
            current: point,
            edgeHandleInfo: {
              // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
              ...prev.edgeHandleInfo,
              edge: updatedEdge,
            },
          }));
        }
      } else if (canvasState.mode === CanvasMode.EdgeDrawing) {
        // Lock the edge to the nearest handle
        const lockedEdge = lockEdgeToNearestLayerHandle({
          current: point,
          nearestHandle: isPointNearHandle,
          fromLayerId: activeLayers[0],
          toLayerId: "",
        });

        // If the point is in the handle, set the isInHandle to true else set it to false
        setCanvasState((prev) => ({
          ...prev,
          mode: CanvasMode.EdgeDrawing,
          current: lockedEdge.point ?? point,
          handleInfo: {
            // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
            ...prev.handleInfo,
            isInHandle: lockedEdge.layerId ? true : false,
            // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
            layerId: lockedEdge.layerId !== "" ? lockedEdge.layerId : activeLayers[0],
          },
        }));
      } else if (canvasState.mode === CanvasMode.Inserting) {
        // Add current point to canvasState.current
        setCanvasState((prev) => ({
          ...prev,
          current: point,
        }));
      } else if (canvasState.mode === CanvasMode.Resizing) {
        // If not inside a resize grip, set the mode to None
        if (!resizeGripInfo) {
          setCanvasState({
            mode: CanvasMode.None,
          });
        }

        // If inside a resize grip, start resizing the layer
        if (resizeGripInfo) {
          const updatedLayers = resizeSelectedLayer({
            point,
            layer: layers.find((l) => l.id === activeLayers[0])!,
            isMouseDown: e.buttons === 1 || e.pointerType === "touch" || e.pointerType === "pen",
            isShiftPressed: e.shiftKey,
            initialBounds: canvasState.initialBounds,
            corner: canvasState.corner,
          });

          if (updatedLayers && updatedLayers.length > 0) {
            // Update the layer
            setLayers((prevLayers) => {
              // Create a map of updated layers for quick lookup
              const updatedLayersMap = updatedLayers.reduce(
                (map, layer) => {
                  map[layer.id] = layer;
                  return map;
                },
                {} as Record<string, Layer>,
              );

              // Update each layer if it's in the updatedLayers array
              return prevLayers.map((layer) => (updatedLayersMap[layer.id] ? updatedLayersMap[layer.id] : layer));
            });

            // Update connected edges
            setEdges((prevEdges) =>
              prevEdges.map((edge) => {
                const { start, end } = updateEdgeIfConnectedLayerIsMoving({ edge }) ?? {
                  start: edge.start,
                  end: edge.end,
                };

                return {
                  ...edge,
                  start,
                  end,
                };
              }),
            );

            // Update initialLayerBounds
            setCanvasState((prev: any) => {
              // Calculate the bounding box across all selected layers
              const selectedLayers = layers.filter((l) => activeLayers.includes(l.id));
              const box = calculateLayerBoundingBox(selectedLayers);

              // Create an array with all active layers with their updated positions
              const updatedActiveLayers = updatedLayers;

              // Create an array with all Edges that are connected to the active layers
              const updatedConnectedEdges = edges.filter(
                (edge: Edge) =>
                  (edge.fromLayerId && activeLayers.includes(edge.fromLayerId)) ||
                  (edge.toLayerId && activeLayers.includes(edge.toLayerId)),
              );

              return {
                ...prev,
                initialBounds: box,
                initialLayerBounds: updatedActiveLayers,
                connectedEdges: updatedConnectedEdges,
              };
            });
          }
        }
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        setCanvasState((prev) => ({
          ...prev,
          current: point,
        }));

        // If we've moved enough to consider it a selection (not just a click)
        const origin = canvasState.origin;
        const dx = Math.abs(point.x - origin.x);
        const dy = Math.abs(point.y - origin.y);

        if (dx > 5 || dy > 5) {
          findLayersInSelection(origin, point);
        }
      } else if (canvasState.mode === CanvasMode.Tooling) {
        if (selectionToolInfo.isInSelectionTool === false) {
          setCanvasState((prev) => ({
            ...prev,
            mode: CanvasMode.None,
            isInSelectionTool: false,
          }));
        }

        if (selectionToolInfo.isInSelectionTool) {
          const updatedState: any = {
            ...canvasState,
          };

          // Add toolingMode if it exists
          if ("toolingMode" in selectionToolInfo) {
            updatedState.toolingMode = selectionToolInfo.toolingMode;
          }

          // Add toolingModeState if it exists
          if ("toolingModeState" in selectionToolInfo) {
            updatedState.toolingModeState = selectionToolInfo.toolingModeState;
          }

          // Add toolingModeColor if it exists
          if ("toolingModeColor" in selectionToolInfo) {
            updatedState.toolingModeColor = selectionToolInfo.toolingModeColor;
          }

          // Add toolingModeBorderWidth if it exists
          if ("toolingModeBorderWidth" in selectionToolInfo) {
            updatedState.toolingModeBorderWidth = selectionToolInfo.toolingModeBorderWidth;
          }

          // Add toolingModeBorderType if it exists
          if ("toolingModeBorderType" in selectionToolInfo) {
            updatedState.toolingModeBorderType = selectionToolInfo.toolingModeBorderType;
          }

          // Add toolingModeShape if it exists
          if ("toolingModeShape" in selectionToolInfo) {
            updatedState.toolingModeShape = selectionToolInfo.toolingModeShape;
          }

          // Add toolingModeArrow if it exists
          if ("toolingModeArrow" in selectionToolInfo) {
            updatedState.toolingModeArrow = selectionToolInfo.toolingModeArrow;
          }

          setCanvasState(updatedState);
        }
      } else if (canvasState.mode === CanvasMode.Translating) {
        // Move selected layers
        const dx = point.x - canvasState.current!.x;
        const dy = point.y - canvasState.current!.y;

        // Get the snap positions
        const lockToHorizontalAlignment =
          activeLayers.length > 1
            ? undefined
            : alignments && typeof alignments === "object" && "vertical" in alignments
              ? alignments.vertical[0]?.otherLayerCenterPosition?.x
              : undefined;

        const lockToVerticalAlignment =
          activeLayers.length > 1
            ? undefined
            : alignments && typeof alignments === "object" && "horizontal" in alignments
              ? alignments.horizontal[0]?.otherLayerCenterPosition?.y
              : undefined;

        // Update layers
        setLayers((prev) =>
          prev.map((layer) => {
            if (activeLayers.includes(layer.id)) {
              return {
                ...layer,
                x: (layersAtPoint && lockToHorizontalAlignment) ?? layer.x + dx,
                y: (layersAtPoint && lockToVerticalAlignment) ?? layer.y + dy,
              };
            }
            return layer;
          }),
        );

        // Update connected edges
        setEdges((prev) =>
          prev.map((edge) => {
            const { start, end } = updateEdgeIfConnectedLayerIsMoving({ edge }) ?? { start: edge.start, end: edge.end };

            return {
              ...edge,
              start,
              end,
            };
          }),
        );

        // Update initialLayerBounds
        setCanvasState((prev: any) => {
          // Create an array with all active layers with their updated positions
          const updatedActiveLayers = activeLayers
            .map((layerId) => {
              const layer = layers.find((l) => l.id === layerId);

              if (layer) {
                return {
                  ...layer,
                  x: layer.x + dx,
                  y: layer.y + dy,
                };
              }
              return null;
            })
            .filter((layer) => layer !== null) as Layer[];

          // Create an array with all Edges that are connected to the active layers
          const updatedConnectedEdges = edges.filter(
            (edge: Edge) =>
              (edge.fromLayerId && activeLayers.includes(edge.fromLayerId)) ||
              (edge.toLayerId && activeLayers.includes(edge.toLayerId)),
          );

          return {
            ...prev,
            current: point,
            initialLayerBounds: updatedActiveLayers,
            connectedEdges: updatedConnectedEdges,
            alignments: alignments,
          };
        });

        // Force re-render if in debug mode to update the debug panel
        if (isDebugMode) {
          requestAnimationFrame(renderCanvas);
        }
      }

      // Emit cursor position
      emitCursor({ point, state: "move" });

      // Render canvas
      renderCanvas();
    },
    [
      camera,
      canvasRef,
      findLayerAtPoint,
      findHandleNearPoint,
      findHandleAtPoint,
      findAlignments,
      findEdgeNearPoint,
      findEdgeHandleAtPoint,
      findResizeGripAtPoint,
      canvasState,
      emitCursor,
      renderCanvas,
      activeLayers,
      activeEdgeId,
      setCanvasState,
      layers,
      setEdges,
      lockEdgeToNearestLayerHandle,
      resizeSelectedLayer,
      setLayers,
      updateEdgeIfConnectedLayerIsMoving,
      edges,
      findLayersInSelection,
      isDebugMode,
      isPointInSelectionToolBounds,
    ],
  );

  const handleMouseUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const point = canvasPointFromEvent(e, camera, canvasRef.current);

      // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
      const layerId = activeLayers.filter((id) => canvasState.handleInfo?.layerId === id)[0];
      const layer = getLayerById({ layerId, layers });

      // Return new layer position based on pointer position in handle
      const { newLayerPosition, newEdgePosition } = getShadowsPositionBasedOnPointerPositionInHandle({
        layer,
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        handlePosition: canvasState.handleInfo?.handlePosition,
        canvasState,
      });

      switch (canvasState.mode) {
        case CanvasMode.None:
          fitView(layers);
          break;
        case CanvasMode.Grab:
          setCanvasState({ mode: CanvasMode.Grab });
          break;
        case CanvasMode.EdgeEditing:
          // Update the edge
          if (canvasState.edgeHandleInfo) {
            updateEdge({ updatedEdges: [canvasState.edgeHandleInfo.edge] });
          }
          break;
        case CanvasMode.EdgeDrawing:
          // If the handle is not in the handle, add a new layer
          if (
            canvasState.handleInfo?.isInHandle === false ||
            (canvasState.handleInfo?.layerId === activeLayers[0] && canvasState.handleInfo?.isInHandle === true)
          ) {
            addEdgeLayer({
              canvasState,
              newEdgePosition,
              layer,
              point: newLayerPosition,
            });
          }

          // If the handle is in the handle, add an edge to the current layer
          if (canvasState.handleInfo?.isInHandle === true && canvasState.handleInfo?.layerId !== activeLayers[0]) {
            addEdge({ canvasState, newEdgePosition, toLayerId: canvasState.handleInfo.layerId });
          }

          setCanvasState({ mode: CanvasMode.None });
          break;
        case CanvasMode.SelectionNet:
          // eslint-disable-next-line no-case-declarations
          const selectedLayers = canvasState.selectedLayersIds;

          if (selectedLayers) {
            // If a layer is locked remove it from the selected layers
            const filteredSelectedLayers = selectedLayers.filter((layerId) => !checkIfLayerIsLocked(layerId));

            selectLayer({ layerIds: filteredSelectedLayers });
          }

          setCanvasState({ mode: CanvasMode.None });
          break;
        case CanvasMode.Resizing: {
          // Update the layer if initialLayerBounds is valid
          const resizingState = canvasState as { initialLayerBounds?: Layer[]; connectedEdges?: Edge[] };

          if (
            resizingState.initialLayerBounds &&
            resizingState.initialLayerBounds.length > 0 &&
            resizingState.connectedEdges &&
            resizingState.connectedEdges.length > 0
          ) {
            updateEdgeLayer({
              updatedLayers: resizingState.initialLayerBounds,
              updatedEdges: resizingState.connectedEdges,
            });
          } else if (resizingState.initialLayerBounds && resizingState.initialLayerBounds.length > 0) {
            updateLayer({ updatedLayers: resizingState.initialLayerBounds });
          }

          // When resizing is done, update the layer(s)
          setCanvasState({
            mode: CanvasMode.None,
          });
          break;
        }
        case CanvasMode.Translating: {
          // Update the layer if initialLayerBounds is valid
          const translatingState = canvasState as { initialLayerBounds?: Layer[]; connectedEdges?: Edge[] };

          if (
            translatingState.initialLayerBounds &&
            translatingState.initialLayerBounds.length > 0 &&
            translatingState.connectedEdges &&
            translatingState.connectedEdges.length > 0
          ) {
            updateEdgeLayer({
              updatedLayers: translatingState.initialLayerBounds,
              updatedEdges: translatingState.connectedEdges,
            });
          } else if (translatingState.initialLayerBounds && translatingState.initialLayerBounds.length > 0) {
            updateLayer({ updatedLayers: translatingState.initialLayerBounds });
          }

          setCanvasState({
            mode: CanvasMode.None,
          });
          break;
        }
        case CanvasMode.Tooling: {
          // Check if point is inside the selection tool
          const selectionToolInfo = isPointInSelectionToolBounds(point);

          if (!selectionToolInfo.isInSelectionTool) return;

          // Add toolingModeColor if it exists
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          if ("toolingModeColor" in selectionToolInfo && selectionToolInfo.toolingMode === "LAYER_COLOR") {
            const newFillColor = selectionToolInfo.toolingModeColor;

            // Create updated layers with the new fill color
            if (newFillColor) {
              const updatedLayers = activeLayers
                .map((layerId) => {
                  const layer = layers.find((l) => l.id === layerId);

                  if (layer) {
                    return {
                      ...layer,
                      fill: hexToRgba(newFillColor),
                    };
                  }
                  return null;
                })
                .filter((layer) => layer !== null) as Layer[];

              // Update the layers with the new fill color
              updateLayer({ updatedLayers });
            }
          }

          // Change EDGE COLOR
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          if ("toolingModeColor" in selectionToolInfo && selectionToolInfo.toolingMode === "EDGE_COLOR") {
            const newEdgeColor = selectionToolInfo.toolingModeColor;

            // Create updated edge with the new edge color
            if (newEdgeColor) {
              const updatedEdges = activeEdgeId
                .map((edgeId) => {
                  const edge = edges.find((e) => e.id === edgeId);

                  if (edge) {
                    return {
                      ...edge,
                      color: hexToRgba(newEdgeColor),
                    };
                  }
                  return null;
                })
                .filter((edge) => edge !== null) as Edge[];

              // Update the edge with the new edge shape
              updateEdge({ updatedEdges });
            }
          }

          // Change EDGE SHAPE
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          if ("toolingModeShape" in selectionToolInfo && selectionToolInfo.toolingMode === "EDGE_SHAPE") {
            const newEdgeShape = selectionToolInfo.toolingModeShape;

            // Create updated edge with the new edge shape
            if (newEdgeShape) {
              const updatedEdges = activeEdgeId
                .map((edgeId) => {
                  const edge = edges.find((e) => e.id === edgeId);

                  if (edge) {
                    return {
                      ...edge,
                      shape: newEdgeShape,
                    };
                  }
                  return null;
                })
                .filter((edge) => edge !== null) as Edge[];

              // Update the edge with the new edge shape
              updateEdge({ updatedEdges });
            }
          }

          // Change EDGE BORDER WIDTH
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          if ("toolingModeBorderWidth" in selectionToolInfo && selectionToolInfo.toolingMode === "EDGE_BORDER") {
            const newEdgeThickness = selectionToolInfo.toolingModeBorderWidth;

            // Create updated edge with the new edge border width
            if (newEdgeThickness) {
              const updatedEdges = activeEdgeId
                .map((edgeId) => {
                  const edge = edges.find((e) => e.id === edgeId);

                  if (edge) {
                    return {
                      ...edge,
                      thickness: newEdgeThickness,
                    };
                  }
                  return null;
                })
                .filter((edge) => edge !== null) as Edge[];

              // Update the edge with the new edge shape
              updateEdge({ updatedEdges });
            }
          }

          // Change EDGE BORDER TYPE
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          if ("toolingModeBorderType" in selectionToolInfo && selectionToolInfo.toolingMode === "EDGE_BORDER") {
            const newEdgeType = selectionToolInfo.toolingModeBorderType;

            // Create updated edge with the new edge border width
            if (newEdgeType) {
              const updatedEdges = activeEdgeId
                .map((edgeId) => {
                  const edge = edges.find((e) => e.id === edgeId);

                  if (edge) {
                    return {
                      ...edge,
                      type: newEdgeType,
                    };
                  }
                  return null;
                })
                .filter((edge) => edge !== null) as Edge[];

              // Update the edge with the new edge shape
              updateEdge({ updatedEdges });
            }
          }

          // Change EDGE ARROW
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          if ("toolingModeArrow" in selectionToolInfo && selectionToolInfo.toolingMode === "EDGE_ARROW") {
            const newEdgeArrowState = selectionToolInfo.toolingModeArrow;

            // Create updated edge with the new edge shape
            if (newEdgeArrowState || newEdgeArrowState === false) {
              const updatedEdges = activeEdgeId
                .map((edgeId) => {
                  const edge = edges.find((e) => e.id === edgeId);

                  if (edge) {
                    return {
                      ...edge,
                      arrowEnd: newEdgeArrowState,
                    };
                  }
                  return null;
                })
                .filter((edge) => edge !== null) as Edge[];

              // Update the edge with the new edge shape
              updateEdge({ updatedEdges });
            }
          }

          setCanvasState((prev) => {
            // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
            const oldToolingModeState = prev.toolingModeState;

            return {
              ...prev,
              toolingModeState:
                // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
                oldToolingModeState === selectionToolInfo.toolingMode ? undefined : selectionToolInfo.toolingMode,
            };
          });
          break;
        }
      }
    },
    [
      activeEdgeId,
      activeLayers,
      addEdge,
      addEdgeLayer,
      camera,
      canvasRef,
      canvasState,
      checkIfLayerIsLocked,
      edges,
      fitView,
      isPointInSelectionToolBounds,
      layers,
      selectLayer,
      setCanvasState,
      updateEdge,
      updateEdgeLayer,
      updateLayer,
    ],
  );

  // Handle keyboard events
  useBoardKeyboardEvents({
    boardId,
    setIsDebugMode,
  });

  // Render effect
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return (
    <div className="h-full w-full relative">
      <canvas
        ref={canvasRef}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        onPointerCancel={handleMouseUp}
        style={{
          width: "100%",
          height: "100%",
          cursor: getCursorStyle(canvasState),
          touchAction: "none", // Prevents default touch behaviors for D3 handling
        }}
      />

      <Toolbar boardId={boardId} />

      {/* Debug Panel */}
      {isDebugMode && (
        <DebugPanel
          canvasState={canvasState}
          camera={camera}
          activeLayers={activeLayers}
          activeEdgeId={activeEdgeId}
          lockedElements={lockedElements}
          isOpen={isDebugPanelOpen}
          setIsOpen={setIsDebugPanelOpen}
        />
      )}

      {/* Zoom Controls (using D3 via useCameraControls) */}
      <Controls layers={layers} />
    </div>
  );
};

export { MindBoard };
