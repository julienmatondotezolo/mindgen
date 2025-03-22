import { CanvasMode, CanvasState } from "@/_types/canvas";

import { getShadowsPositionBasedOnPointerPositionInHandle } from "../../layerUtils";

export const drawShadowEdgeBasedOnType = ({
  context,
  theme,
  canvasState,
}: {
  context: CanvasRenderingContext2D;
  theme: string | undefined;
  canvasState: CanvasState;
}): void => {
  const isEdgeOurEdgeDrawingMode = canvasState.mode === CanvasMode.Edge || canvasState.mode === CanvasMode.EdgeDrawing;

  // If canvas is not in edge mode, or the handle is not in the active layer,
  // or the handle is not in the active layer, then don't show the shadow layer
  if (isEdgeOurEdgeDrawingMode == false) return;

  if (!canvasState.origin) return;

  // Return new layer position based on pointer position in handle
  const { newEdgePosition } = getShadowsPositionBasedOnPointerPositionInHandle({
    handlePosition: canvasState.handleInfo?.handlePosition,
    canvasState,
  });

  // Create a shadow edge with semi-transparent color for the preview
  const edgeColor = theme === "dark" ? "rgb(180, 191, 204)" : "rgb(71, 85, 105)";

  // Apply semi-transparency to the shadow edge
  context.globalAlpha = 0.5;

  // Begin drawing
  context.beginPath();

  // Draw line
  context.moveTo(canvasState.origin.x, canvasState.origin.y);
  context.lineTo(newEdgePosition.x, newEdgePosition.y);

  // Draw the edge with semi-transparent color
  context.strokeStyle = edgeColor;
  context.lineWidth = 4;
  context.lineCap = "round";
  context.stroke();

  // Reset alpha
  context.globalAlpha = 1.0;
};
