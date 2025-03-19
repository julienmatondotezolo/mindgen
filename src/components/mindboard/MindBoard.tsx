import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";

import { CanvasMode } from "@/_types/canvas";
import { useEdgeOperations, useLayerOperations } from "@/hooks";
import { useCanvasNavigation } from "@/hooks/useCanvasNavigation";
import { cameraStateAtom, canvasStateAtom } from "@/state";
import { getLayerById } from "@/utils/canvasUtils";

import { Toolbar } from "../whiteboard";
import { drawSelectionRectangle } from "./boardRender";
import { Controls, useCameraControls } from "./Controls";
import { drawEdgeBasedOnType } from "./edgeRender";
import { drawActiveLayerSelection, drawLayerBasedOnType, drawLayerHandles, drawLayerText } from "./layerRender";
import { canvasPointFromEvent, getCursorStyle } from "./mindBoardUtils";

const MindBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [camera] = useRecoilState(cameraStateAtom);
  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);
  const { theme } = useTheme();

  const { findLayersAtPoint, findLayersInSelection, addLayer, layers, setLayers, activeLayers, setActiveLayers } =
    useLayerOperations();

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
      // Draw shapes based on type
      drawLayerBasedOnType({ layer, context });

      // Draw selection outline for active layers
      drawActiveLayerSelection({ layer, context, camera, activeLayers });

      // Draw layer handles
      drawLayerHandles({ layer, context, camera, activeLayers });

      // Draw layer text
      drawLayerText({ layer, context, camera, theme });
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

      // Handle different modes
      if (canvasState.mode === CanvasMode.Inserting && canvasState.layerType) {
        // Add a new shape at the click point
        addLayer(canvasState.layerType, point);
        // After adding, switch back to select mode
        setCanvasState({
          mode: CanvasMode.None,
        });
        return;
      } else if (canvasState.mode === CanvasMode.Grab) {
        // Start panning the canvas
        setCanvasState({
          mode: CanvasMode.Grab,
        });
        setIsDrawing(true);
        return;
      }

      // Default behavior for selection mode
      // Check if we clicked on a layer
      const clickedLayerIds = findLayersAtPoint(point);

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

      setIsDrawing(true);
    },
    [camera, canvasState, findLayersAtPoint, addLayer, setCanvasState, setActiveLayers, activeLayers, layers],
  );

  const handleMouseMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const point = canvasPointFromEvent(e, camera, canvasRef.current);

      if (canvasState.mode === CanvasMode.SelectionNet && canvasState.origin) {
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
      }

      renderCanvas();
    },
    [
      isDrawing,
      camera,
      canvasState,
      renderCanvas,
      setCanvasState,
      findLayersInSelection,
      setActiveLayers,
      setLayers,
      setEdges,
      activeLayers,
    ],
  );

  const handleMouseUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const point = canvasPointFromEvent(e, camera, canvasRef.current);

      setIsDrawing(false);

      if (canvasState.mode === CanvasMode.SelectionNet) {
        setCanvasState({
          mode: CanvasMode.SelectionNet,
          origin: point,
          current: point,
        });
      } else if (canvasState.mode === CanvasMode.Translating) {
        setCanvasState({
          mode: CanvasMode.SelectionNet,
          origin: point,
          current: point,
        });
      } else if (canvasState.mode === CanvasMode.Grab) {
        setCanvasState({ mode: CanvasMode.Grab });
      }

      fitView(layers);
    },
    [camera, canvasState.mode, fitView, layers, setCanvasState],
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar for grab mode - D3 handles the actual panning
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setCanvasState((prev) => ({
          ...prev,
          mode: CanvasMode.Grab,
        }));
      }

      // Delete selected layers
      if ((e.key === "Delete" || e.key === "Backspace") && activeLayers.length > 0) {
        // Delete connected edges
        setEdges((prev) =>
          prev.filter(
            (edge) =>
              !(edge.fromLayerId && activeLayers.includes(edge.fromLayerId)) &&
              !(edge.toLayerId && activeLayers.includes(edge.toLayerId)),
          ),
        );

        // Delete layers
        setLayers((prev) => prev.filter((layer) => !activeLayers.includes(layer.id)));
        setActiveLayers([]);
      }

      // Deselect all with Escape
      if (e.key === "Escape") {
        setActiveLayers([]);

        // Reset canvas state
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Release spacebar - return to previous mode
      if (e.code === "Space") {
        e.preventDefault();
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeLayers, setActiveLayers, setLayers, setEdges, setCanvasState]);

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

      {/* Zoom Controls (using D3 via useCameraControls) */}
      <Controls layers={layers} />
    </div>
  );
};

export { MindBoard };
