import { Camera, Layer, LayerType } from "@/_types";

export const drawActiveLayerSelection = ({
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
    context.strokeStyle = "#2563eb"; // Blue selection color
    context.lineWidth = 4 / camera.scale;

    switch (layer.type) {
      case LayerType.Rectangle:
        context.strokeRect(layer.x, layer.y, layer.width, layer.height);
        break;
      case LayerType.Ellipse:
        context.beginPath();
        context.ellipse(
          layer.x + layer.width / 2,
          layer.y + layer.height / 2,
          layer.width / 2,
          layer.height / 2,
          0,
          0,
          Math.PI * 2,
        );
        context.stroke();
        break;
      case LayerType.Diamond:
        context.beginPath();
        context.moveTo(layer.x + layer.width / 2, layer.y);
        context.lineTo(layer.x + layer.width, layer.y + layer.height / 2);
        context.lineTo(layer.x + layer.width / 2, layer.y + layer.height);
        context.lineTo(layer.x, layer.y + layer.height / 2);
        context.closePath();
        context.stroke();
        break;
    }

    // Draw resize handles
  }
};
