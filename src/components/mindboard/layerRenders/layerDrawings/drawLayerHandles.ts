import { Camera, CanvasMode, CanvasState, HandlePosition, Layer } from "@/_types";

import { getHandlePosition } from "../../layerUtils";

// Animation duration in milliseconds
// const ANIMATION_DURATION = 50;

export const drawLayerHandles = ({
  layer,
  context,
  camera,
  theme,
  activeLayers,
  canvasState,
}: {
  layer: Layer;
  context: CanvasRenderingContext2D;
  camera: Camera;
  theme: string | undefined;
  activeLayers: string[];
  canvasState: CanvasState;
}): void => {
  // If the layer is active and the mode is SelectionNet, don't draw handles
  if (activeLayers.includes(layer.id) && canvasState.mode === CanvasMode.SelectionNet) return;

  // Only draw handles for active/selected layers && if is not in Translating mode
  if (activeLayers.includes(layer.id) && activeLayers.length === 1 && canvasState.mode !== CanvasMode.Translating) {
    // Get handle position
    const { handlePositions, handleSize: baseHandleSize } = getHandlePosition(layer);

    // Draw each handle
    handlePositions.forEach((handle) => {
      // Save current context state
      context.save();

      // Check if this handle is being hovered (in Edge mode)
      const isHovered =
        (canvasState.mode === CanvasMode.Edge || canvasState.mode === CanvasMode.EdgeDrawing) &&
        canvasState.handleInfo?.layerId === layer.id &&
        canvasState.handleInfo?.handlePosition === handle.position;

      // Check if this handle is being hovered (in Edge mode)
      const isInHandle =
        (canvasState.mode === CanvasMode.Edge || canvasState.mode === CanvasMode.EdgeDrawing) &&
        canvasState.handleInfo?.layerId === layer.id &&
        canvasState.handleInfo?.handlePosition === handle.position &&
        canvasState.handleInfo?.isInHandle;

      // Calculate animated scale factor based on transition progress
      const targetScale = isHovered ? 3 : 1;
      const startScale = isHovered ? 1 : 3;
      const currentScale = startScale + (targetScale - startScale);

      // Final handle size with animation
      const handleSize = baseHandleSize * currentScale;

      const handleStrokeColor = theme === "light" ? "#fdfdff" : "#050713";
      const handleHoveredFillColor = theme === "light" ? "#cfdaf2" : "#030f2d";
      const handleFillColor = theme === "light" ? "#a7c0f8" : "#041642";

      // Draw ellipse bigger then the arc with a the handleColor
      const sizeControler = 1.2;

      if (!isHovered) {
        context.beginPath();
        context.ellipse(handle.x, handle.y, handleSize / sizeControler, handleSize / sizeControler, 0, 0, Math.PI * 2);
        context.strokeStyle = handleStrokeColor;
        context.lineWidth = 8;
        context.stroke();
        context.closePath();
      }

      // Draw circle
      context.beginPath();
      context.arc(handle.x, handle.y, handleSize / 2, 0, Math.PI * 2);
      context.fillStyle = isHovered ? (isInHandle ? "#2563eb" : handleHoveredFillColor) : handleFillColor; // Lighter blue background when hovered
      context.fill();
      context.strokeStyle = "#2563eb"; // Brighter blue stroke when hovered
      context.lineWidth = (isHovered ? 2 : 1.5) / camera.scale;
      context.stroke();
      context.closePath();

      // Only draw arrow if handle is hovered
      if (isHovered) {
        // Draw arrow based on direction
        context.fillStyle = isInHandle ? "#fdfdff" : "#2563eb";

        // Draw arrow inside the circle
        const arrowSize = handleSize * 0.6;

        context.beginPath();

        switch (handle.position) {
          case HandlePosition.Top:
            context.moveTo(handle.x, handle.y - arrowSize / 3);
            context.lineTo(handle.x - arrowSize / 3, handle.y + arrowSize / 3);
            context.lineTo(handle.x + arrowSize / 3, handle.y + arrowSize / 3);
            break;
          case HandlePosition.Right:
            context.moveTo(handle.x + arrowSize / 3, handle.y);
            context.lineTo(handle.x - arrowSize / 3, handle.y - arrowSize / 3);
            context.lineTo(handle.x - arrowSize / 3, handle.y + arrowSize / 3);
            break;
          case HandlePosition.Bottom:
            context.moveTo(handle.x, handle.y + arrowSize / 3);
            context.lineTo(handle.x - arrowSize / 3, handle.y - arrowSize / 3);
            context.lineTo(handle.x + arrowSize / 3, handle.y - arrowSize / 3);
            break;
          case HandlePosition.Left:
            context.moveTo(handle.x - arrowSize / 3, handle.y);
            context.lineTo(handle.x + arrowSize / 3, handle.y - arrowSize / 3);
            context.lineTo(handle.x + arrowSize / 3, handle.y + arrowSize / 3);
            break;
        }

        context.closePath();
        context.fill();
      }

      // Restore context state
      context.restore();
    });
  }
};
