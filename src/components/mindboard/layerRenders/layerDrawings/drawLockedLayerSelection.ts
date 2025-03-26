import { Camera, Layer, LayerType } from "@/_types";

export const drawLockedLayerSelection = ({
  layer,
  lockedBy,
  lockedByColor,
  context,
  camera,
}: {
  layer: Layer;
  lockedBy: string;
  lockedByColor: string;
  context: CanvasRenderingContext2D;
  camera: Camera;
}): void => {
  if (!layer) return;

  const radius = 5;

  switch (layer.type) {
    case LayerType.Rectangle:
      context.beginPath();
      context.roundRect(layer.x, layer.y, layer.width, layer.height, radius);
      break;
    case LayerType.Ellipse:
      context.beginPath();
      context.roundRect(layer.x, layer.y, layer.width, layer.height, radius);
      break;
    case LayerType.Diamond:
      context.beginPath();
      context.roundRect(layer.x, layer.y, layer.width, layer.height, radius);
      break;
  }

  context.strokeStyle = lockedByColor; // Blue selection color
  context.lineWidth = 3 / camera.scale;
  context.stroke();

  // Add a rectangle with the lockedBy text underneath
  const fontSize = 12 / camera.scale;

  context.font = `${fontSize}px Arial`;
  const textWidth = context.measureText(`Locked by ${lockedBy}`).width;
  const padding = 6 / camera.scale;
  const rectWidth = textWidth + padding * 2;
  const rectHeight = fontSize + padding;

  // Position the rectangle at the right side, under the main shape
  const rectX = layer.x + layer.width - rectWidth;
  const rectY = layer.y + layer.height + 5 / camera.scale;

  // Draw the rectangle
  context.beginPath();
  context.fillStyle = lockedByColor;
  context.roundRect(rectX, rectY, rectWidth, rectHeight, 3 / camera.scale);
  context.fill();

  // Add the text
  context.fillStyle = "white";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(`Locked by ${lockedBy}`, rectX + rectWidth / 2, rectY + rectHeight / 2);
};
