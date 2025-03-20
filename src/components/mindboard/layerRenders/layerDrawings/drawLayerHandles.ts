import { Camera, CanvasMode, CanvasState, HandlePosition, Layer } from "@/_types";

import { getHandlePosition } from "../../layerUtils";

export const drawLayerHandles = ({
  layer,
  context,
  camera,
  activeLayers,
  canvasState,
}: {
  layer: Layer;
  context: CanvasRenderingContext2D;
  camera: Camera;
  activeLayers: string[];
  canvasState: CanvasState;
}): void => {
  // Only draw handles for active/selected layers
  if (activeLayers.includes(layer.id) && activeLayers.length === 1) {
    // Get handle position
    const { handlePositions, handleSize: baseHandleSize } = getHandlePosition(layer);

    // Draw each handle
    handlePositions.forEach((handle) => {
      // Save current context state
      context.save();

      // Check if this handle is being hovered (in Edge mode)
      const isHovered =
        canvasState.mode === CanvasMode.Edge &&
        canvasState.handleInfo?.layerId === layer.id &&
        canvasState.handleInfo?.handlePosition === handle.position;

      // Calculate handle size - Make it 50% larger when hovered
      const scaleFactor = isHovered ? 3 : 1;
      const handleSize = baseHandleSize * scaleFactor;

      // Draw circle
      context.beginPath();
      context.arc(handle.x, handle.y, handleSize / 2, 0, Math.PI * 2);
      context.fillStyle = isHovered ? "#e0f2fe" : "#2564EB65"; // Lighter blue background when hovered
      context.fill();
      context.strokeStyle = isHovered ? "#3b82f6" : "#2563eb"; // Brighter blue stroke when hovered
      context.lineWidth = (isHovered ? 2 : 1.5) / camera.scale;
      context.stroke();
      context.closePath();

      // Only draw arrow if handle is hovered
      if (isHovered) {
        // Draw arrow based on direction
        context.fillStyle = "#3b82f6"; // Brighter blue when hovered

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
