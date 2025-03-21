import { useTheme } from "next-themes";
import { useCallback, useRef } from "react";
import { useRecoilValue } from "recoil";

import { drawSelectionRectangle } from "@/components/mindboard/boardRender";
import { drawEdgeBasedOnType } from "@/components/mindboard/edgeRender";
import { layerRender } from "@/components/mindboard/layerRenders";
import { activeLayersAtom, cameraStateAtom, canvasStateAtom, edgesAtomState, layerAtomState } from "@/state";

export const useBoard = () => {
  const layers = useRecoilValue(layerAtomState);
  const edges = useRecoilValue(edgesAtomState);
  const camera = useRecoilValue(cameraStateAtom);
  const canvasState = useRecoilValue(canvasStateAtom);
  const activeLayers = useRecoilValue(activeLayersAtom);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const { theme } = useTheme();

  // Setup canvas
  const setupCanvas = useCallback(() => {
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

    // Add resize listener
    window.addEventListener("resize", resizeCanvas);

    // Cleanup function
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
      // Adjust grid size based on zoom level for better performance
      let gridSize = 1;
      const scale = camera.scale;

      // Dynamic grid size based on zoom level
      if (scale < 0.5) gridSize = 5;
      if (scale < 0.25) gridSize = 10;

      const width = context.canvas.width / scale;
      const height = context.canvas.height / scale;

      const startX = Math.floor(-camera.x / scale / gridSize) * gridSize;
      const startY = Math.floor(-camera.y / scale / gridSize) * gridSize;
      const endX = startX + width;
      const endY = startY + height;

      // Calculate number of columns and rows
      const cols = Math.ceil(width / gridSize);
      const rows = Math.ceil(height / gridSize);

      // Adjust opacity based on scale
      const opacity = Math.min(0.1, 0.02 + scale * 0.1);

      context.fillStyle = theme === "dark" ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`;

      // Define dot size based on zoom level
      const dotSize = Math.max(0.5, scale < 0.2 ? 0.8 : 1 / scale);

      // Use a single canvas path for better performance
      context.beginPath();

      // Determine how many dots to skip based on zoom level
      let skipFactor = 1;

      if (scale < 0.2) skipFactor = Math.max(2, Math.floor(4 / scale));

      // Calculate total points after applying skip factor
      const effectiveCols = Math.ceil(cols / skipFactor);
      const effectiveRows = Math.ceil(rows / skipFactor);
      const totalEffectivePoints = effectiveCols * effectiveRows;

      // Use a single loop for all drawing
      for (let i = 0; i < totalEffectivePoints; i++) {
        const effectiveCol = i % effectiveCols;
        const effectiveRow = Math.floor(i / effectiveCols);

        // Calculate the actual grid coordinates
        const col = effectiveCol * skipFactor;
        const row = effectiveRow * skipFactor;

        const x = startX + col * gridSize;
        const y = startY + row * gridSize;

        // Skip if outside visible area
        if (x > endX || y > endY) continue;

        // Draw the dot
        context.moveTo(x + dotSize, y);
        context.arc(x, y, dotSize, 0, Math.PI * 2);
      }

      // Fill all dots at once for better performance
      context.fill();
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
    // drawGrid(context);

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

  return {
    canvasRef,
    contextRef,
    setupCanvas,
    applyCamera,
    drawGrid,
    restoreContext,
    renderCanvas,
  };
};
