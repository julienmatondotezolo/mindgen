/* eslint-disable no-unused-vars */
import { Layer, LayerType, Point } from "@/_types/canvas";
import { colorToCss, drawDiamond, drawEllipse, drawRoundedRect } from "@/utils";

export const drawLayerBasedOnType = ({
  layer,
  context,
  theme,
  newLayerPosition,
}: {
  layer: Layer;
  context: CanvasRenderingContext2D;
  theme: string | undefined;
  newLayerPosition?: Point;
}): void => {
  context.fillStyle =
    layer.fill !== null ? `rgb(${layer?.fill?.r}, ${layer?.fill?.g}, ${layer?.fill?.b})` : "rgb(77, 106, 255)";

  const newBorderColor = layer.borderColor
    ? colorToCss(layer.borderColor)
    : theme === "dark"
      ? "rgb(180, 191, 204)"
      : "rgb(71, 85, 105)";

  switch (layer.type) {
    case LayerType.Rectangle:
      // Use cross-browser compatible rounded rectangle drawing
      drawRoundedRect({
        ctx: context,
        x: newLayerPosition ? newLayerPosition.x : layer.x,
        y: newLayerPosition ? newLayerPosition.y : layer.y,
        width: layer.width,
        height: layer.height,
        fill: layer.fill,
      });

      // Draw border
      context.strokeStyle = newBorderColor;
      if (layer.borderWidth) {
        context.lineWidth = layer.borderWidth;
        context.stroke();
      }
      context.fill();
      break;

    case LayerType.Ellipse:
      // Draw Ellipse
      drawEllipse({
        ctx: context,
        x: newLayerPosition ? newLayerPosition.x + layer.width / 2 : layer.x + layer.width / 2,
        y: newLayerPosition ? newLayerPosition.y + layer.height / 2 : layer.y + layer.height / 2,
        width: layer.width,
        height: layer.height,
        fill: layer.fill,
      });

      // Draw border
      context.strokeStyle = newBorderColor;
      if (layer.borderWidth) {
        context.lineWidth = layer.borderWidth;
        context.stroke();
      }
      context.fill();
      break;

    case LayerType.Diamond:
      // Draw diamond
      drawDiamond({
        ctx: context,
        x: newLayerPosition ? newLayerPosition.x : layer.x,
        y: newLayerPosition ? newLayerPosition.y : layer.y,
        width: layer.width,
        height: layer.height,
        fill: layer.fill,
      });

      // Draw border
      context.strokeStyle = newBorderColor;
      if (layer.borderWidth) {
        context.lineWidth = layer.borderWidth;
        context.stroke();
      }
      context.fill();
      break;

    default:
      console.warn(`Unsupported layer type: ${layer.type}`);
      break;
  }
};
