import { Layer, LayerType } from "@/_types/canvas";

export const drawLayerBasedOnType = ({ layer, context }: { layer: Layer; context: CanvasRenderingContext2D }): void => {
  context.fillStyle = `rgb(${layer.fill.r}, ${layer.fill.g}, ${layer.fill.b})`;

  switch (layer.type) {
    case LayerType.Rectangle:
      context.fillRect(layer.x, layer.y, layer.width, layer.height);
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
      context.fill();
      break;

    case LayerType.Diamond:
      context.beginPath();
      context.moveTo(layer.x + layer.width / 2, layer.y);
      context.lineTo(layer.x + layer.width, layer.y + layer.height / 2);
      context.lineTo(layer.x + layer.width / 2, layer.y + layer.height);
      context.lineTo(layer.x, layer.y + layer.height / 2);
      context.closePath();
      context.fill();
      break;

    default:
      console.warn(`Unsupported layer type: ${layer.type}`);
      break;
  }
};
