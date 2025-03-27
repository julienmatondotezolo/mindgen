/* eslint-disable indent */
import { useLocks, useMembers } from "@ably/spaces/react";
import { useTheme } from "next-themes";
import { useCallback, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

import { drawSelectionRectangle } from "@/components/mindboard/boardRender";
import { drawShadowEdgeBasedOnType, edgeRender } from "@/components/mindboard/edgeRender";
import { layerRender } from "@/components/mindboard/layerRenders";
import {
  drawLockedLayerSelection,
  drawShadowLayerFromInserting,
} from "@/components/mindboard/layerRenders/layerDrawings";
import {
  activeEdgeIdAtom,
  activeLayersAtom,
  cameraStateAtom,
  canvasStateAtom,
  edgesAtomState,
  layerAtomState,
} from "@/state";

export const useBoard = () => {
  const layers = useRecoilValue(layerAtomState);
  const edges = useRecoilValue(edgesAtomState);
  const camera = useRecoilValue(cameraStateAtom);
  const canvasState = useRecoilValue(canvasStateAtom);
  const activeLayers = useRecoilValue(activeLayersAtom);
  const activeEdgeId = useRecoilValue(activeEdgeIdAtom);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const { theme } = useTheme();

  // Lock states by other users
  const [otherLocks, setOtherLocks] = useState<{
    username: string;
    color: string;
    lockedLayers?: (string | undefined)[] | undefined;
    lockedEdges?: (string | undefined)[] | undefined;
  }>({
    username: "",
    color: "",
    lockedLayers: [],
    lockedEdges: [],
  });

  const { self } = useMembers();

  // Lock states by other users
  useLocks((lockUpdate) => {
    const locked = lockUpdate.status === "locked";
    const lockAttributes = lockUpdate.attributes;

    const lockHolder = lockUpdate.member;
    const lockedByOther = locked && lockAttributes && lockHolder.connectionId !== self?.connectionId;
    const unLockedByOther = !locked && lockAttributes && lockHolder.connectionId !== self?.connectionId;

    const layerId = lockAttributes?.layerId as string | undefined;
    const edgeId = lockAttributes?.edgeId as string | undefined;

    if (lockedByOther) {
      const { username, userColor } = lockHolder.profileData as {
        username: string;
        userColor: string;
      };

      setOtherLocks({
        username,
        color: userColor,
        lockedLayers: otherLocks.lockedLayers ? [...otherLocks.lockedLayers, layerId] : [layerId],
        lockedEdges: otherLocks.lockedEdges ? [...otherLocks.lockedEdges, edgeId] : [edgeId],
      });
    }

    if (unLockedByOther) {
      setOtherLocks((prev) => ({
        ...prev,
        // Only remove the specific layer ID if it was provided
        lockedLayers: prev.lockedLayers ? prev.lockedLayers.filter((id) => id !== layerId) : [],
        lockedEdges: prev.lockedEdges ? prev.lockedEdges.filter((id) => id !== edgeId) : [],
      }));
    }
  });

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
  const renderCanvas = useCallback(async () => {
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
      edgeRender({ edge, context, camera, theme, canvasState, activeEdgeId });
    });

    // Draw shadow edges
    drawShadowEdgeBasedOnType({ context, theme, canvasState });

    // Draw layers
    layers.forEach((layer) => {
      layerRender({ layer, context, camera, activeLayers, theme, canvasState, allLayers: layers });
    });

    // Draw shadow layer from inserting
    drawShadowLayerFromInserting({ context, theme, canvasState });

    // Draw selection rectangle if in selection mode
    drawSelectionRectangle({ context, canvasState });

    if (otherLocks.lockedLayers) {
      otherLocks.lockedLayers.forEach((layerId) => {
        const layer = layers.find((layer) => layer.id === layerId);

        if (layer) {
          drawLockedLayerSelection({
            layer,
            lockedBy: otherLocks.username,
            lockedByColor: otherLocks.color,
            context,
            camera,
          });
        }
      });
    }

    // Restore context to clear transformations
    restoreContext(context);
  }, [theme, applyCamera, edges, canvasState, layers, camera, restoreContext, activeEdgeId, activeLayers, otherLocks]);

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
