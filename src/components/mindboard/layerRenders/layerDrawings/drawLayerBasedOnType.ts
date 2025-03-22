/* eslint-disable no-unused-vars */
import { CanvasState, Layer, LayerType } from "@/_types/canvas";
import { colorToCss } from "@/utils";

import { drawEllipse, drawRoundedRect } from "../../layerUtils";

export const drawLayerBasedOnType = ({
  layer,
  context,
  theme,
  activeLayers,
  canvasState,
}: {
  layer: Layer;
  context: CanvasRenderingContext2D;
  theme: string | undefined;
  activeLayers: string[];
  canvasState: CanvasState;
}): void => {
  context.fillStyle = `rgb(${layer.fill.r}, ${layer.fill.g}, ${layer.fill.b})`;

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
        x: layer.x,
        y: layer.y,
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
        x: layer.x + layer.width / 2,
        y: layer.y + layer.height / 2,
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
      context.beginPath();
      context.moveTo(layer.x + layer.width / 2, layer.y);
      context.lineTo(layer.x + layer.width, layer.y + layer.height / 2);
      context.lineTo(layer.x + layer.width / 2, layer.y + layer.height);
      context.lineTo(layer.x, layer.y + layer.height / 2);
      context.closePath();

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
