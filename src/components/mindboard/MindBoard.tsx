import { nanoid } from "nanoid";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";

import { CanvasMode, Layer, Point } from "@/_types/canvas";
import { activeLayersAtom, cameraStateAtom, canvasStateAtom, edgesAtomState, layerAtomState } from "@/state";
import { getLayerById } from "@/utils/canvasUtils";

import { Toolbar } from "../whiteboard";

// Canvas-specific point conversion function
const canvasPointFromEvent = (
  e: React.PointerEvent<HTMLCanvasElement>,
  camera: { x: number; y: number; scale: number },
  canvas: HTMLCanvasElement | null,
): { x: number; y: number } => {
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();

  return {
    x: (e.clientX - rect.left - camera.x) / camera.scale,
    y: (e.clientY - rect.top - camera.y) / camera.scale,
  };
};

const MindBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [layers, setLayers] = useRecoilState(layerAtomState);
  const [edges, setEdges] = useRecoilState(edgesAtomState);
  const [camera] = useRecoilState(cameraStateAtom);
  const [activeLayers, setActiveLayers] = useRecoilState(activeLayersAtom);
  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);
  const { theme } = useTheme();

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
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
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
      const gridSize = 20;
      const width = context.canvas.width / camera.scale;
      const height = context.canvas.height / camera.scale;

      const startX = Math.floor(-camera.x / camera.scale / gridSize) * gridSize;
      const startY = Math.floor(-camera.y / camera.scale / gridSize) * gridSize;

      context.beginPath();
      context.strokeStyle = theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
      context.lineWidth = 1 / camera.scale;

      // Draw vertical lines
      for (let x = startX; x < startX + width; x += gridSize) {
        context.moveTo(x, startY);
        context.lineTo(x, startY + height);
      }

      // Draw horizontal lines
      for (let y = startY; y < startY + height; y += gridSize) {
        context.moveTo(startX, y);
        context.lineTo(startX + width, y);
      }

      context.stroke();
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
      context.beginPath();
      context.moveTo(edge.start.x, edge.start.y);
      context.lineTo(edge.end.x, edge.end.y);
      context.strokeStyle = `rgb(${edge.color.r}, ${edge.color.g}, ${edge.color.b})`;
      context.lineWidth = edge.thickness;
      context.stroke();

      // Draw arrow if needed
      if (edge && edge.end) {
        const angle = Math.atan2(edge.end.y - edge.start.y, edge.end.x - edge.start.x);
        const size = 10;

        context.beginPath();
        context.moveTo(edge.end.x, edge.end.y);
        context.lineTo(
          edge.end.x - size * Math.cos(angle - Math.PI / 6),
          edge.end.y - size * Math.sin(angle - Math.PI / 6),
        );
        context.lineTo(
          edge.end.x - size * Math.cos(angle + Math.PI / 6),
          edge.end.y - size * Math.sin(angle + Math.PI / 6),
        );
        context.closePath();
        context.fillStyle = `rgb(${edge.color.r}, ${edge.color.g}, ${edge.color.b})`;
        context.fill();
      }
    });

    // Draw layers
    layers.forEach((layer) => {
      context.fillStyle = `rgb(${layer.fill.r}, ${layer.fill.g}, ${layer.fill.b})`;

      // Draw shapes based on type
      if (layer.type === "RECTANGLE") {
        context.fillRect(layer.x, layer.y, layer.width, layer.height);
      } else if (layer.type === "ELLIPSE") {
        context.beginPath();
        context.ellipse(
          layer.x + layer.width / 2,
          layer.y + layer.height / 2,
          layer.width / 2,
          layer.height / 2,
          0,
          0,
          Math.PI * 2,
        );
        context.fill();
      } else if (layer.type === "DIAMOND") {
        context.beginPath();
        context.moveTo(layer.x + layer.width / 2, layer.y);
        context.lineTo(layer.x + layer.width, layer.y + layer.height / 2);
        context.lineTo(layer.x + layer.width / 2, layer.y + layer.height);
        context.lineTo(layer.x, layer.y + layer.height / 2);
        context.closePath();
        context.fill();
      }

      // Draw selection outline for active layers
      if (activeLayers.includes(layer.id)) {
        context.strokeStyle = "#2563eb"; // Blue selection color
        context.lineWidth = 2 / camera.scale;

        if (layer.type === "RECTANGLE") {
          context.strokeRect(layer.x, layer.y, layer.width, layer.height);
        } else if (layer.type === "ELLIPSE") {
          context.beginPath();
          context.ellipse(
            layer.x + layer.width / 2,
            layer.y + layer.height / 2,
            layer.width / 2,
            layer.height / 2,
            0,
            0,
            Math.PI * 2,
          );
          context.stroke();
        } else if (layer.type === "DIAMOND") {
          context.beginPath();
          context.moveTo(layer.x + layer.width / 2, layer.y);
          context.lineTo(layer.x + layer.width, layer.y + layer.height / 2);
          context.lineTo(layer.x + layer.width / 2, layer.y + layer.height);
          context.lineTo(layer.x, layer.y + layer.height / 2);
          context.closePath();
          context.stroke();
        }

        // Draw resize handles
        const handleSize = 8 / camera.scale;
        const handles = [
          { x: layer.x - handleSize / 2, y: layer.y - handleSize / 2 }, // top-left
          { x: layer.x + layer.width / 2 - handleSize / 2, y: layer.y - handleSize / 2 }, // top-center
          { x: layer.x + layer.width - handleSize / 2, y: layer.y - handleSize / 2 }, // top-right
          { x: layer.x + layer.width - handleSize / 2, y: layer.y + layer.height / 2 - handleSize / 2 }, // middle-right
          { x: layer.x + layer.width - handleSize / 2, y: layer.y + layer.height - handleSize / 2 }, // bottom-right
          { x: layer.x + layer.width / 2 - handleSize / 2, y: layer.y + layer.height - handleSize / 2 }, // bottom-center
          { x: layer.x - handleSize / 2, y: layer.y + layer.height - handleSize / 2 }, // bottom-left
          { x: layer.x - handleSize / 2, y: layer.y + layer.height / 2 - handleSize / 2 }, // middle-left
        ];

        handles.forEach((handle) => {
          context.fillStyle = "#ffffff";
          context.fillRect(handle.x, handle.y, handleSize, handleSize);
          context.strokeStyle = "#2563eb";
          context.strokeRect(handle.x, handle.y, handleSize, handleSize);
        });
      }

      // Draw layer text
      if (layer.value) {
        context.font = `${14 / camera.scale}px Arial`;
        context.fillStyle = theme === "dark" ? "#ffffff" : "#000000";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(layer.value, layer.x + layer.width / 2, layer.y + layer.height / 2);
      }
    });

    // Draw selection rectangle if in selection mode
    if (canvasState.mode === CanvasMode.SelectionNet && canvasState.origin && canvasState.current) {
      const x = Math.min(canvasState.origin.x, canvasState.current.x);
      const y = Math.min(canvasState.origin.y, canvasState.current.y);
      const width = Math.abs(canvasState.origin.x - canvasState.current.x);
      const height = Math.abs(canvasState.origin.y - canvasState.current.y);

      context.strokeStyle = "rgba(37, 99, 235, 0.5)";
      context.fillStyle = "rgba(37, 99, 235, 0.1)";
      context.fillRect(x, y, width, height);
      context.strokeRect(x, y, width, height);
    }

    // Restore context to clear transformations
    restoreContext(context);
  }, [layers, edges, activeLayers, theme, camera, canvasState, applyCamera, drawGrid, restoreContext]);

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

  // // Add a new edge
  // const addEdge = useCallback(
  //   (start: Point, end: Point, fromLayerId?: string, toLayerId?: string) => {
  //     const newEdge = {
  //       id: nanoid(),
  //       start,
  //       end,
  //       fromLayerId,
  //       toLayerId,
  //       color: { r: 180, g: 191, b: 204 },
  //       thickness: 2,
  //       arrows: { end: true },
  //     };

  //     setEdges((prev) => [...prev, newEdge as any]);

  //     return newEdge.id;
  //   },
  //   [setEdges],
  // );

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
    },
    [camera, canvasState.mode, setCanvasState],
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar for grab mode
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

  // Add this function before the return statement:
  const getCursorStyle = (mode: CanvasMode): string => {
    switch (mode) {
      case CanvasMode.Grab:
        return "grab";
      case CanvasMode.Inserting:
        return "crosshair";
      default:
        return "default";
    }
  };

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
        }}
      />

      <Toolbar />
    </div>
  );
};

export { MindBoard };
