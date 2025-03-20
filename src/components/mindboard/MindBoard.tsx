import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";

import { CanvasMode } from "@/_types/canvas";
import { useBoardKeyboardEvents, useEdgeOperations, useLayerOperations } from "@/hooks";
import { useCanvasNavigation } from "@/hooks/useCanvasNavigation";
import { cameraStateAtom, canvasStateAtom } from "@/state";
import { getLayerById } from "@/utils/canvasUtils";

import { Toolbar } from "../whiteboard";
import { drawSelectionRectangle } from "./boardRender";
import { Controls, useCameraControls } from "./Controls";
import { DebugPanel } from "./DebugPanel";
import { drawEdgeBasedOnType } from "./edgeRender";
import { layerRender } from "./layerRenders";
import { canvasPointFromEvent, getCursorStyle } from "./mindBoardUtils";

const MindBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [camera] = useRecoilState(cameraStateAtom);
  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);
  const { theme } = useTheme();

  // Debug mode state
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(true);

  const {
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

  const { edges, setEdges } = useEdgeOperations();

  const { fitView } = useCameraControls();

  // Initialize canvas navigation with D3 (this handles all zoom and pan operations)
  useCanvasNavigation({ canvasRef });

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    contextRef.current = context;

    // Set canvas size
    const resizeCanvas = () => {
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      context.scale(pixelRatio, pixelRatio);

      renderCanvas();
    };

    resizeCanvas();
  }, []);

  // Apply camera transform
  const applyCamera = useCallback(
    (context: CanvasRenderingContext2D) => {
      context.save();
      context.translate(camera.x, camera.y);
      context.scale(camera.scale, camera.scale);
    },
    [camera],
  );

  // Restore context
  const restoreContext = useCallback((context: CanvasRenderingContext2D) => {
    context.restore();
  }, []);

  // Draw grid
  const drawGrid = useCallback(
    (context: CanvasRenderingContext2D) => {
      // Adjust grid size based on zoom level for better performance
      let gridSize = 20;
      const scale = camera.scale;

      // Increase grid spacing when zoomed out to reduce rendering load
      if (scale < 0.5) {
        gridSize = 30;
      }
      if (scale < 0.25) {
        gridSize = 80;
      }

      const width = context.canvas.width / scale;
      const height = context.canvas.height / scale;

      const startX = Math.floor(-camera.x / scale / gridSize) * gridSize;
      const startY = Math.floor(-camera.y / scale / gridSize) * gridSize;

      // Adjust opacity based on scale to make grid less prominent when zoomed out
      const opacity = Math.min(0.1, 0.05 + scale * 0.1);

      context.fillStyle = theme === "dark" ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`;

      // Define dot size based on zoom level (smaller when zoomed out)
      const dotSize = Math.max(0.5, 1 / scale);

      // Skip drawing dots that are too close together when zoomed out
      // This significantly improves performance at low zoom levels
      for (let x = startX; x < startX + width; x += gridSize) {
        for (let y = startY; y < startY + height; y += gridSize) {
          // Skip some dots when extremely zoomed out for better performance
          if (scale < 0.2 && (x % (gridSize * 2) !== 0 || y % (gridSize * 2) !== 0)) {
            continue;
          }

          context.beginPath();
          context.arc(x, y, dotSize, 0, Math.PI * 2);
          context.fill();
        }
      }
    },
    [camera, theme],
  );

  // Render canvas
  const renderCanvas = useCallback(() => {
    const context = contextRef.current;

    if (!context) return;

    // Clear the canvas with background color
    context.fillStyle = theme === "dark" ? "#050713" : "#fdfdff";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    // Apply camera transformation
    applyCamera(context);

    // Draw grid
    drawGrid(context);

    // Draw edges
    edges.forEach((edge) => {
      drawEdgeBasedOnType({ edge, context });
    });

    // Draw layers
    layers.forEach((layer) => {
      layerRender({ layer, context, camera, activeLayers, theme, canvasState });
    });

    // Draw selection rectangle if in selection mode
    drawSelectionRectangle({ context, canvasState });

    // Restore context to clear transformations
    restoreContext(context);
  }, [layers, edges, activeLayers, theme, camera, canvasState, applyCamera, drawGrid, restoreContext]);

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
    [camera, canvasState, findLayerIdsAtPoint, addLayer, setCanvasState, layers, setActiveLayers, activeLayers],
  );

  const handleMouseMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const point = canvasPointFromEvent(e, camera, canvasRef.current);
      // Find layers at current mouse position
      const layersAtPoint = findLayerAtPoint(point);
      // Find nearest handle at current mouse position
      const handleInfo = findHandleAtPoint(point);

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
      canvasState,
      renderCanvas,
      findLayerAtPoint,
      activeLayers,
      findHandleAtPoint,
      setCanvasState,
      findLayersInSelection,
      setActiveLayers,
      setLayers,
      setEdges,
      isDebugMode,
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
