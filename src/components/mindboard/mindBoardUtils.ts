import React from "react";

import { CanvasMode } from "@/_types/canvas";

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
export const getCursorStyle = (mode: CanvasMode): string => {
  switch (mode) {
    case CanvasMode.Grab:
      return "grab";
    case CanvasMode.Inserting:
      return "crosshair";
    default:
      return "default";
  }
};
