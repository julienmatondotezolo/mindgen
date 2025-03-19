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
  if (activeLayers.includes(layer.id)) {
    // draw layer stroke
    // context.strokeStyle = "#2563eb";
    // context.lineWidth = 2 / camera.scale;

    // Draw layer bounding box
    context.strokeStyle = "#2563eb";
    context.lineWidth = 2 / camera.scale;
    context.strokeRect(layer.x, layer.y, layer.width, layer.height);

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
};
