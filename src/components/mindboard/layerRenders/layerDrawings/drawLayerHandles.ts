import { Camera, Layer } from "@/_types";

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
    // Constants to control handle appearance
    // Controls how far handles are positioned from layer edges
    let HANDLE_DISTANCE_FACTOR = 2.5;
    // Calculate positions for the 4 handles
    let handleSize = 12;

    const handlePositions = [
      // top
      {
        x: layer.x + layer.width / 2,
        y: layer.y - handleSize * HANDLE_DISTANCE_FACTOR,
        arrowDirection: "up",
      },
      // right
      {
        x: layer.x + layer.width + handleSize * HANDLE_DISTANCE_FACTOR,
        y: layer.y + layer.height / 2,
        arrowDirection: "right",
      },
      // bottom
      {
        x: layer.x + layer.width / 2,
        y: layer.y + layer.height + handleSize * HANDLE_DISTANCE_FACTOR,
        arrowDirection: "down",
      },
      // left
      {
        x: layer.x - handleSize * HANDLE_DISTANCE_FACTOR,
        y: layer.y + layer.height / 2,
        arrowDirection: "left",
      },
    ];

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

      if (handle.arrowDirection === "up") {
        context.moveTo(handle.x, handle.y - arrowSize / 3);
        context.lineTo(handle.x - arrowSize / 3, handle.y + arrowSize / 3);
        context.lineTo(handle.x + arrowSize / 3, handle.y + arrowSize / 3);
      } else if (handle.arrowDirection === "right") {
        context.moveTo(handle.x + arrowSize / 3, handle.y);
        context.lineTo(handle.x - arrowSize / 3, handle.y - arrowSize / 3);
        context.lineTo(handle.x - arrowSize / 3, handle.y + arrowSize / 3);
      } else if (handle.arrowDirection === "down") {
        context.moveTo(handle.x, handle.y + arrowSize / 3);
        context.lineTo(handle.x - arrowSize / 3, handle.y - arrowSize / 3);
        context.lineTo(handle.x + arrowSize / 3, handle.y - arrowSize / 3);
      } else if (handle.arrowDirection === "left") {
        context.moveTo(handle.x - arrowSize / 3, handle.y);
        context.lineTo(handle.x + arrowSize / 3, handle.y - arrowSize / 3);
        context.lineTo(handle.x + arrowSize / 3, handle.y + arrowSize / 3);
      }

      context.closePath();
      context.fill();

      // Restore context state
      context.restore();
    });
  }
};
