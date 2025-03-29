import React from "react";

import { CanvasMode, CanvasState, Corner } from "@/_types/canvas";

// Canvas-specific point conversion function
export const canvasPointFromEvent = (
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

// Canvas cursor style
export const getCursorStyle = (canvasState: CanvasState): string => {
  switch (canvasState.mode) {
    case CanvasMode.Grab:
      return "grab";
    case CanvasMode.Inserting:
      return "crosshair";
    case CanvasMode.Edge:
      return "crosshair";
    case CanvasMode.EdgeDrawing:
      return "move";
    case CanvasMode.EdgeEditing:
      return "move";
    case CanvasMode.Resizing:
      if (canvasState.corner === Corner.TopLeft) {
        return "nwse-resize";
      }
      if (canvasState.corner === Corner.TopRight) {
        return "nesw-resize";
      }
      if (canvasState.corner === Corner.BottomLeft) {
        return "nesw-resize";
      }
      if (canvasState.corner === Corner.BottomRight) {
        return "nwse-resize";
      }
      if (canvasState.corner === Corner.TopCenter) {
        return "ns-resize";
      }
      if (canvasState.corner === Corner.BottomCenter) {
        return "ns-resize";
      }
      if (canvasState.corner === Corner.MiddleLeft) {
        return "ew-resize";
      }
      if (canvasState.corner === Corner.MiddleRight) {
        return "ew-resize";
      }
      if (canvasState.corner === Corner.BottomRight) {
        return "nwse-resize";
      }
      if (canvasState.corner === Corner.BottomLeft) {
        return "nesw-resize";
      }
      return "default";
    default:
      return "default";
  }
};
