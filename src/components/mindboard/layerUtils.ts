import { HandlePosition, Layer } from "@/_types/canvas";

// get the handle position based on the layer type
export const getHandlePosition = (layer: Layer) => {
  // Constants to match those in drawLayerHandles.ts
  const handleSize = 12;
  const HANDLE_DISTANCE_FACTOR = 2.5;

  // Calculate positions for the 4 handles (same as in drawLayerHandles.ts)
  const handlePositions = [
    // top
    {
      x: layer.x + layer.width / 2,
      y: layer.y - handleSize * HANDLE_DISTANCE_FACTOR,
      position: HandlePosition.Top,
    },
    // right
    {
      x: layer.x + layer.width + handleSize * HANDLE_DISTANCE_FACTOR,
      y: layer.y + layer.height / 2,
      position: HandlePosition.Right,
    },
    // bottom
    {
      x: layer.x + layer.width / 2,
      y: layer.y + layer.height + handleSize * HANDLE_DISTANCE_FACTOR,
      position: HandlePosition.Bottom,
    },
    // left
    {
      x: layer.x - handleSize * HANDLE_DISTANCE_FACTOR,
      y: layer.y + layer.height / 2,
      position: HandlePosition.Left,
    },
  ];

  return { handlePositions, handleSize };
};
