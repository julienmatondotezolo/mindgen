import { Camera, HandlePosition, Layer } from "@/_types";

import { getHandlePosition } from "../../layerUtils";

export const drawLayerHandles = ({
  layer,
  context,
  camera,
  activeLayers,
}: {
  layer: Layer;
  context: CanvasRenderingContext2D;
  camera: Camera;
  activeLayers: string[];
}): void => {
  // Only draw handles for active/selected layers
  if (activeLayers.includes(layer.id) && activeLayers.length === 1) {
    // Get handle position
    const { handlePositions, handleSize } = getHandlePosition(layer);

    // Draw each handle
    handlePositions.forEach((handle) => {
      // Save current context state
      context.save();

      // Draw circle
      context.beginPath();
      context.arc(handle.x, handle.y, handleSize / 2, 0, Math.PI * 2);
      context.fillStyle = "#ffffff";
      context.fill();
      context.strokeStyle = "#2563eb";
      context.lineWidth = 1.5 / camera.scale;
      context.stroke();

      // Draw arrow based on direction
      context.fillStyle = "#2563eb";

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

      // Restore context state
      context.restore();
    });
  }
};
