import { Layer, LayerType } from "@/_types/canvas";
import { colorToCss } from "@/utils";

export const drawLayerBasedOnType = ({
  layer,
  context,
  theme,
}: {
  layer: Layer;
  context: CanvasRenderingContext2D;
  theme: string | undefined;
}): void => {
  context.fillStyle = `rgb(${layer.fill.r}, ${layer.fill.g}, ${layer.fill.b})`;

  const newBorderColor = layer.borderColor
    ? colorToCss(layer.borderColor)
    : theme === "dark"
      ? "rgb(180, 191, 204)"
      : "rgb(71, 85, 105)";

  switch (layer.type) {
    case LayerType.Rectangle:
      context.beginPath();
      context.roundRect(layer.x, layer.y, layer.width, layer.height, 100);
      context.strokeStyle = newBorderColor;
      context.lineWidth = layer.borderWidth || 0;
      context.stroke();
      context.fill();
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
      context.strokeStyle = newBorderColor;
      context.lineWidth = layer.borderWidth || 0;
      context.stroke();
      context.fill();
      break;

    case LayerType.Diamond:
      context.beginPath();
      context.moveTo(layer.x + layer.width / 2, layer.y);
      context.lineTo(layer.x + layer.width, layer.y + layer.height / 2);
      context.lineTo(layer.x + layer.width / 2, layer.y + layer.height);
      context.lineTo(layer.x, layer.y + layer.height / 2);
      context.closePath();
      context.strokeStyle = newBorderColor;
      context.lineWidth = layer.borderWidth || 0;
      context.stroke();
      context.fill();
      break;

    default:
      console.warn(`Unsupported layer type: ${layer.type}`);
      break;
  }
};
