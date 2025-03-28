/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { BoardDataProps } from "@/_types/BoardDataProps";
import { CanvasMode, Edge, Layer } from "@/_types/canvas";
import { useBoardKeyboardEvents, useEdgeOperations, useLayerOperations, useLiveValue, useLocks } from "@/hooks";
import { useBoard } from "@/hooks/useBoard";
import { useBoardRefresh } from "@/hooks/useBoardRefresh";
import { useCanvasNavigation } from "@/hooks/useCanvasNavigation";
import { cameraStateAtom, canvasStateAtom, lockedAtomState } from "@/state";
import { getLayerById, getShadowsPositionBasedOnPointerPositionInHandle } from "@/utils/layerUtils";

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
  const { canvasRef, setupCanvas, renderCanvas } = useBoard();

  // Camera controls
  const { fitView } = useCameraControls();

  // Use live value for collaborative features
  useLiveValue({ boardId });

  // Subscribe to board query cache changes
  useBoardRefresh({ boardId });

  // Initialize canvas navigation with D3 (this handles all zoom and pan operations)
  useCanvasNavigation({ canvasRef });

  // Locks
  const { checkIfLayerIsLocked, checkIfEdgeIsLocked } = useLocks();

  // Layer operations
  const {
    findHandleNearPoint,
    findHandleAtPoint,
    findLayerAtPoint,
    findLayerIdsAtPoint,
    findLayersInSelection,
    findAlignments,
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
      checkIfLayerIsLocked,
      unSelectLayer,
      setActiveEdgeId,
      selectLayer,
      activeLayers,
      layers,
    ],
  );

  const handleMouseMove = useCallback(
    async (e: React.PointerEvent<HTMLCanvasElement>) => {
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

        // Only set to None mode if we didn't set to Edge mode
        setCanvasState({
          mode: CanvasMode.None,
          hoveredLayerId: layersAtPoint?.id,
          hoveredEdgeId: edgeNearPoint?.id,
        });
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
      } else if (canvasState.mode === CanvasMode.Translating) {
        // Move selected layers
        const dx = point.x - canvasState.current!.x;
        const dy = point.y - canvasState.current!.y;

        // Get the snap positions
        const lockToHorizontalAlignment = activeLayers.length > 1 ? undefined : alignments && alignments.vertical[0]?.otherLayerCenterPosition?.x;
        const lockToVerticalAlignment = activeLayers.length > 1 ? undefined : alignments && alignments.horizontal[0]?.otherLayerCenterPosition?.y;

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
        setCanvasState((prev) => {
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
          const updatedConnectedEdges = edges.filter((edge: Edge) => (edge.fromLayerId && activeLayers.includes(edge.fromLayerId)) || (edge.toLayerId && activeLayers.includes(edge.toLayerId)));

          // Convert alignments to the correct type if it exists
          const transformedAlignments = alignments ? {
            vertical: alignments.vertical.map(v => ({
              ...v,
              otherLayerCenterPosition: v.otherLayerCenterPosition ? { y: v.otherLayerCenterPosition.x } : undefined,
            })),
            horizontal: alignments.horizontal.map(h => ({
              ...h,
              otherLayerCenterPosition: h.otherLayerCenterPosition ? { x: h.otherLayerCenterPosition.y } : undefined,
            })),
            isPointNearCenterAlignment: alignments.isPointNearCenterAlignment,
          } : undefined;

          return {
            ...prev,
            current: point,
            initialLayerBounds: updatedActiveLayers,
            connectedEdges: updatedConnectedEdges,
            alignments: transformedAlignments,
          };
        });

        // Force re-render if in debug mode to update the debug panel
        if (isDebugMode) {
          requestAnimationFrame(renderCanvas);
        }
      }

      renderCanvas();
    },
    [camera, canvasRef, findLayerAtPoint, findHandleNearPoint, findHandleAtPoint, findAlignments, findEdgeNearPoint, findEdgeHandleAtPoint, canvasState, renderCanvas, activeLayers, activeEdgeId, setCanvasState, setEdges, lockEdgeToNearestLayerHandle, findLayersInSelection, setLayers, isDebugMode, updateEdgeIfConnectedLayerIsMoving, edges, layers],
  );

  const handleMouseUp = useCallback(() => {
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
      case CanvasMode.EdgeDrawing:
        // If the handle is not in the handle, add a new layer
        if (
          canvasState.handleInfo?.isInHandle === false ||
          (canvasState.handleInfo?.layerId === activeLayers[0] && canvasState.handleInfo?.isInHandle === true)
        ) {
          addEdgeLayer({
            canvasState,
            newEdgePosition,
            type: canvasState.handleInfo?.layerType,
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
      case CanvasMode.Translating: {
        // Update the layer if initialLayerBounds is valid
        const translatingState = canvasState as { initialLayerBounds?: Layer[]; connectedEdges?: Edge[] };


        if ((translatingState.initialLayerBounds && translatingState.initialLayerBounds.length > 0) && (translatingState.connectedEdges && translatingState.connectedEdges.length > 0)) {
          updateEdgeLayer({ updatedLayers: translatingState.initialLayerBounds, updatedEdges: translatingState.connectedEdges });
        } else if (translatingState.initialLayerBounds && translatingState.initialLayerBounds.length > 0) {
          updateLayer({ updatedLayers: translatingState.initialLayerBounds });
        }

        setCanvasState({
          mode: CanvasMode.None,
        });
        break;
      }
    }
  }, [activeLayers, addEdge, addEdgeLayer, canvasState, checkIfLayerIsLocked, fitView, layers, selectLayer, setCanvasState, updateEdgeLayer, updateLayer]);

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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          width: "100%",
          height: "100%",
          cursor: getCursorStyle(canvasState.mode),
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
