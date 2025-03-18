import { nanoid } from "nanoid";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";

import { activeLayersAtom, cameraStateAtom, canvasStateAtom, edgesAtomState, layerAtomState } from "@/state";

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

// Types for layers and edges
type Point = { x: number; y: number };
type Color = { r: number; g: number; b: number };
type CanvasMode = "None" | "Translating" | "Selecting" | "Drawing" | "Resizing" | "Adding" | "Grab";

// Toolbar component
const Toolbar = ({
  onAddShape,
  onSelect,
  onGrab,
  onZoomIn,
  onZoomOut,
  onFitView,
  currentMode,
}: {
  onAddShape: (shapeType: string) => void;
  onSelect: () => void;
  onGrab: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  currentMode: CanvasMode;
}) => (
  <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-2 flex items-center gap-2 z-10">
    {/* Shape tools */}
    <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
      <button
        className={`w-8 h-8 flex items-center justify-center rounded-lg ${currentMode === "Selecting" ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        onClick={onSelect}
        title="Select"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        >
          <path d="M4 13l5 5l11-11"></path>
        </svg>
      </button>
      <button
        className={`w-8 h-8 flex items-center justify-center rounded-lg ${currentMode === "Grab" ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        onClick={onGrab}
        title="Pan Canvas"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11.5V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v1.4"></path>
          <path d="M14 10V8a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v.5"></path>
          <path d="M10 9.1V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v9.4"></path>
          <path d="M6 14v1a6 6 0 0 0 12 0v-4"></path>
        </svg>
      </button>
    </div>

    {/* Shape tools */}
    <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
      <button
        className={`w-8 h-8 flex items-center justify-center rounded-lg ${currentMode === "Adding" ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        onClick={() => onAddShape("RECTANGLE")}
        title="Add Rectangle"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"
ry="2"></rect>
        </svg>
      </button>
      <button
        className={`w-8 h-8 flex items-center justify-center rounded-lg ${currentMode === "Adding" ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        onClick={() => onAddShape("ELLIPSE")}
        title="Add Ellipse"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      </button>
      <button
        className={`w-8 h-8 flex items-center justify-center rounded-lg ${currentMode === "Adding" ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        onClick={() => onAddShape("DIAMOND")}
        title="Add Diamond"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.7,10.3l8.8-8.8c0.4-0.4,1-0.4,1.4,0l8.8,8.8c0.4,0.4,0.4,1,0,1.4l-8.8,8.8c-0.4,0.4-1,0.4-1.4,0l-8.8-8.8 C2.3,11.3,2.3,10.7,2.7,10.3z"></path>
        </svg>
      </button>
    </div>

    {/* Zoom controls */}
    <div className="flex items-center gap-1">
      <button
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={onZoomOut}
        title="Zoom Out"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={onZoomIn}
        title="Zoom In"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={onFitView}
        title="Fit View"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        >
          <path d="M21 3H3v18h18V3z"></path>
          <path d="M7 9l4-4 4 4"></path>
          <path d="M17 15l-4 4-4-4"></path>
        </svg>
      </button>
    </div>
  </div>
);

const MindBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [layers, setLayers] = useRecoilState(layerAtomState);
  const [edges, setEdges] = useRecoilState(edgesAtomState);
  const [camera, setCamera] = useRecoilState(cameraStateAtom);
  const [activeLayers, setActiveLayers] = useRecoilState(activeLayersAtom);
  const [canvasState, setCanvasState] = useState<{
    mode: CanvasMode;
    origin?: Point;
    current?: Point;
    dragStart?: Point;
    selectedLayerId?: string;
    activeShapeType?: string;
  }>({
    mode: "None",
  });
  const { theme } = useTheme();

  // Now let's add all the toolbar action handlers
  // A function to handle adding a shape
  const handleAddShape = useCallback((shapeType: string) => {
    setCanvasState({
      mode: "Adding",
      activeShapeType: shapeType,
    });
  }, []);

  // Handle selection mode
  const handleSelectMode = useCallback(() => {
    setCanvasState({
      mode: "Selecting",
    });
  }, []);

  // Handle grab mode for panning
  const handleGrabMode = useCallback(() => {
    setCanvasState({
      mode: "Grab",
    });
  }, []);

  // Zoom in function
  const zoomIn = useCallback(() => {
    setCamera((prev) => {
      const newScale = Math.min(prev.scale * 1.2, 4);

      return { ...prev, scale: newScale };
    });
  }, [setCamera]);

  // Zoom out function
  const zoomOut = useCallback(() => {
    setCamera((prev) => {
      const newScale = Math.max(prev.scale / 1.2, 0.1);

      return { ...prev, scale: newScale };
    });
  }, [setCamera]);

  // Fit view function
  const fitView = useCallback(() => {
    if (layers.length === 0) return;

    // Find bounding box of all layers
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    layers.forEach((layer) => {
      minX = Math.min(minX, layer.x);
      minY = Math.min(minY, layer.y);
      maxX = Math.max(maxX, layer.x + layer.width);
      maxY = Math.max(maxY, layer.y + layer.height);
    });

    // Add padding
    const padding = 50;

    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;

    // Calculate canvas dimensions
    const canvas = canvasRef.current;

    if (!canvas) return;
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    // Calculate scale to fit content
    const scaleX = canvasWidth / width;
    const scaleY = canvasHeight / height;
    const scale = Math.min(scaleX, scaleY, 2); // Limit max scale

    // Calculate new camera position to center content
    const x = canvasWidth / 2 - (minX + width / 2) * scale;
    const y = canvasHeight / 2 - (minY + height / 2) * scale;

    setCamera({ x, y, scale });
  }, [layers, setCamera]);

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
      if (edge.arrows && edge.arrows.end) {
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
    if (canvasState.mode === "Selecting" && canvasState.origin && canvasState.current) {
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
  const isPointInLayer = useCallback((point: Point, layer: any) => {
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
      const newLayer = {
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

  // Add a new edge
  const addEdge = useCallback(
    (start: Point, end: Point, fromLayerId?: string, toLayerId?: string) => {
      const newEdge = {
        id: nanoid(),
        start,
        end,
        fromLayerId,
        toLayerId,
        color: { r: 180, g: 191, b: 204 },
        thickness: 2,
        arrows: { end: true },
      };

      setEdges((prev) => [...prev, newEdge as any]);

      return newEdge.id;
    },
    [setEdges],
  );

  // Update mouse event handlers to handle different modes
  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const point = canvasPointFromEvent(e, camera, canvasRef.current);

      // Handle different modes
      if (canvasState.mode === "Adding" && canvasState.activeShapeType) {
        // Add a new shape at the click point
        addLayer(canvasState.activeShapeType, point);
        // After adding, switch back to select mode
        setCanvasState({
          mode: "Selecting",
        });
        return;
      } else if (canvasState.mode === "Grab") {
        // Start panning the canvas
        setCanvasState({
          mode: "Grab",
          origin: point,
          current: point,
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
            mode: "Translating",
            origin: point,
            current: point,
            selectedLayerId: layerId,
          });
        }
      } else {
        // Clear selection and start selection rectangle
        setActiveLayers([]);
        setCanvasState({
          mode: "Selecting",
          origin: point,
          current: point,
        });
      }

      setIsDrawing(true);
    },
    [camera, canvasState, findLayersAtPoint, activeLayers, setActiveLayers, addLayer],
  );

  const handleMouseMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const point = canvasPointFromEvent(e, camera, canvasRef.current);

      if (canvasState.mode === "Selecting" && canvasState.origin) {
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
      } else if (canvasState.mode === "Translating") {
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
      } else if (canvasState.mode === "Grab" && canvasState.current) {
        // Pan the canvas
        const dx = point.x - canvasState.current.x;
        const dy = point.y - canvasState.current.y;

        setCamera((prev) => ({
          ...prev,
          x: prev.x + dx * prev.scale,
          y: prev.y + dy * prev.scale,
        }));

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
      activeLayers,
      findLayersInSelection,
      setActiveLayers,
      setLayers,
      setEdges,
      renderCanvas,
      setCamera,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);

    if (canvasState.mode === "Selecting") {
      setCanvasState({ mode: "Selecting" });
    } else if (canvasState.mode === "Translating") {
      setCanvasState({ mode: "Selecting" });
    } else if (canvasState.mode === "Grab") {
      setCanvasState({ mode: "Grab" });
    }
  }, [canvasState]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar for grab mode
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setCanvasState((prev) => ({
          ...prev,
          mode: "Grab",
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

        // Reset to select mode
        setCanvasState({
          mode: "Selecting",
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Release spacebar - return to previous mode
      if (e.code === "Space") {
        e.preventDefault();
        setCanvasState({
          mode: "Selecting",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeLayers, setActiveLayers, setLayers, setEdges]);

  // Render effect
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Add this function before the return statement:
  const getCursorStyle = (mode: CanvasMode): string => {
    switch (mode) {
      case "Translating":
        return "grabbing";
      case "Grab":
        return "grab";
      case "Adding":
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
          cursor: getCursorStyle(canvasState.mode)
        }}
      />

      <Toolbar
        onAddShape={handleAddShape}
        onSelect={handleSelectMode}
        onGrab={handleGrabMode}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitView={fitView}
        currentMode={canvasState.mode}
      />
    </div>
  );
};

export { MindBoard };
