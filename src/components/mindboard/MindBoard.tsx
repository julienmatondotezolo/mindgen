import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { CanvasMode } from "@/_types/canvas";
import { useBoardKeyboardEvents, useEdgeOperations, useLayerOperations } from "@/hooks";
import { useBoard } from "@/hooks/useBoard";
import { useCanvasNavigation } from "@/hooks/useCanvasNavigation";
import { cameraStateAtom, canvasStateAtom } from "@/state";
import { getLayerById } from "@/utils/canvasUtils";

import { Toolbar } from "../whiteboard";
import { Controls, useCameraControls } from "./Controls";
import { DebugPanel } from "./DebugPanel";
import { canvasPointFromEvent, getCursorStyle } from "./mindBoardUtils";

const MindBoard = () => {
  const [camera] = useRecoilState(cameraStateAtom);
  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);

  // Debug mode state
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(true);

  // Setup board & rendering
  const { canvasRef, setupCanvas, renderCanvas } = useBoard();

  // Camera controls
  const { fitView } = useCameraControls();

  // Initialize canvas navigation with D3 (this handles all zoom and pan operations)
  useCanvasNavigation({ canvasRef });

  // Layer operations
  const {
    findHandleNearPoint,
    findHandleAtPoint,
    findLayerAtPoint,
    findLayerIdsAtPoint,
    findLayersInSelection,
    addLayer,
    layers,
    setLayers,
    activeLayers,
    setActiveLayers,
  } = useLayerOperations();

  // Edge operations
  const { setEdges } = useEdgeOperations();

  // Setup canvas on mount
  useEffect(() => {
    setupCanvas();
  }, [setupCanvas]);

  // Update mouse event handlers to handle different modes
  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const point = canvasPointFromEvent(e, camera, canvasRef.current);

      switch (canvasState.mode) {
        case CanvasMode.Inserting:
          // Add a new shape at the click point
          addLayer(canvasState.layerType, point);
          // After adding, switch back to select mode
          setCanvasState({
            mode: CanvasMode.None,
          });
          return;
        case CanvasMode.Grab:
          // Start panning the canvas
          setCanvasState({
            mode: CanvasMode.Grab,
          });
          return;
        default:
          break;
      }

      // Default behavior for selection mode
      // Check if we clicked on a layer
      const clickedLayerIds = findLayerIdsAtPoint(point);

      if (clickedLayerIds.length > 0) {
        // If holding shift, toggle selection
        if (e.shiftKey) {
          const layerId = clickedLayerIds[0];

          setActiveLayers((prev) =>
            prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId],
          );
        } else {
          // Replace selection
          const layerId = clickedLayerIds[0];

          if (!activeLayers.includes(layerId)) {
            setActiveLayers([layerId]);
          }

          // Start translating
          setCanvasState({
            mode: CanvasMode.Translating,
            current: point,
            initialLayerBounds: getLayerById({ layerId, layers }),
          });
        }
      } else {
        // Clear selection and start selection rectangle
        setActiveLayers([]);
        setCanvasState({
          mode: CanvasMode.SelectionNet,
          origin: point,
          current: point,
        });
      }
    },
    [
      camera,
      canvasState,
      findLayerIdsAtPoint,
      addLayer,
      setCanvasState,
      layers,
      setActiveLayers,
      activeLayers,
      canvasRef,
    ],
  );

  const handleMouseMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const point = canvasPointFromEvent(e, camera, canvasRef.current);
      // Find layers at current mouse position
      const layersAtPoint = findLayerAtPoint(point);
      // Find nearest handle at current mouse position
      const handleInfo = findHandleNearPoint(point);

      if (canvasState.mode === CanvasMode.None) {
        // If the layer is active, don't set the hoveredLayerId
        if (layersAtPoint && activeLayers.includes(layersAtPoint.id)) {
          return;
        }

        if (handleInfo && activeLayers.includes(handleInfo.layerId)) {
          setCanvasState({
            mode: CanvasMode.Edge,
            current: handleInfo.coordinates,
            handleInfo,
          });
          return;
        }

        // Only set to None mode if we didn't set to Edge mode
        setCanvasState({
          mode: CanvasMode.None,
          hoveredLayerId: layersAtPoint?.id,
        });
      } else if (canvasState.mode === CanvasMode.Edge) {
        const isPointInHandle = findHandleAtPoint(point);

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
        if (!handleInfo) {
          setCanvasState({
            mode: CanvasMode.None,
          });
          return;
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
          const selectedLayerIds = findLayersInSelection(origin, point);

          setActiveLayers(selectedLayerIds);
        }
      } else if (canvasState.mode === CanvasMode.Translating) {
        // Move selected layers
        const dx = point.x - canvasState.current!.x;
        const dy = point.y - canvasState.current!.y;

        setLayers((prev) =>
          prev.map((layer) => {
            if (activeLayers.includes(layer.id)) {
              return {
                ...layer,
                x: layer.x + dx,
                y: layer.y + dy,
              };
            }
            return layer;
          }),
        );

        // Update connected edges
        setEdges((prev) =>
          prev.map((edge) => {
            const updateStart = edge.fromLayerId && activeLayers.includes(edge.fromLayerId);
            const updateEnd = edge.toLayerId && activeLayers.includes(edge.toLayerId);

            if (!updateStart && !updateEnd) return edge;

            return {
              ...edge,
              start: updateStart ? { x: edge.start.x + dx, y: edge.start.y + dy } : edge.start,
              end: updateEnd ? { x: edge.end.x + dx, y: edge.end.y + dy } : edge.end,
            };
          }),
        );

        setCanvasState((prev) => ({
          ...prev,
          current: point,
        }));

        // Force re-render if in debug mode to update the debug panel
        if (isDebugMode) {
          requestAnimationFrame(renderCanvas);
        }
      }

      renderCanvas();
    },
    [
      camera,
      findLayerAtPoint,
      findHandleNearPoint,
      canvasState,
      renderCanvas,
      activeLayers,
      setCanvasState,
      findHandleAtPoint,
      findLayersInSelection,
      setActiveLayers,
      setLayers,
      setEdges,
      isDebugMode,
      canvasRef,
    ],
  );

  const handleMouseUp = useCallback(() => {
    switch (canvasState.mode) {
      case CanvasMode.None:
        fitView(layers);
        break;
      case CanvasMode.SelectionNet:
        setCanvasState({ mode: CanvasMode.None });
        break;
      case CanvasMode.Translating:
        setCanvasState({
          mode: CanvasMode.None,
        });
        break;
      case CanvasMode.Grab:
        setCanvasState({ mode: CanvasMode.Grab });
        break;
    }
  }, [canvasState.mode, fitView, layers, setCanvasState]);

  // Handle keyboard events
  useBoardKeyboardEvents({
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

      <Toolbar />

      {/* Debug Panel */}
      {isDebugMode && (
        <DebugPanel
          canvasState={canvasState}
          camera={camera}
          activeLayers={activeLayers}
          layers={layers}
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
