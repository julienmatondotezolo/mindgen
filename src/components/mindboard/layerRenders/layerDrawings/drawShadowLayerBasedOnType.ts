import { CanvasMode, CanvasState, HandlePosition, Layer, LayerType, Point } from "@/_types/canvas";
import { colorToCss } from "@/utils";

import { drawRoundedRect } from "../../layerUtils";

export const drawShadowLayerBasedOnType = ({
  layer,
  context,
  theme,
  canvasState,
  activeLayers,
}: {
  layer: Layer;
  context: CanvasRenderingContext2D;
  theme: string | undefined;
  canvasState: CanvasState;
  activeLayers: string[];
}): void => {
  const isEdgeMode = canvasState.mode === CanvasMode.Edge;
  // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
  const isHandleInActiveLayer = activeLayers.includes(canvasState.handleInfo?.layerId);
  // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
  const isInHandle = canvasState.handleInfo?.isInHandle === true;

  // If canvas is not in edge mode, or the handle is not in the active layer, or the handle is not in the active layer, then don't show the shadow layer
  if (isEdgeMode == false) {
    return;
  }

  if (isInHandle === false) {
    return;
  }

  if (isHandleInActiveLayer === false) {
    return;
  }

  // Calculate position offset based on handle position (200px away)
  let positionOffset: Point = { x: 0, y: 0 };

  // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
  const handlePosition = canvasState.handleInfo?.handlePosition;

  // offset number
  const offsetNumber = layer.width * 2;

  if (handlePosition) {
    switch (handlePosition) {
      case HandlePosition.Top:
        positionOffset = { x: 0, y: -offsetNumber }; // position offset in px above
        break;
      case HandlePosition.Right:
        positionOffset = { x: offsetNumber, y: 0 }; // position offset in px to the right
        break;
      case HandlePosition.Bottom:
        positionOffset = { x: 0, y: offsetNumber }; // position offset in px below
        break;
      case HandlePosition.Left:
        positionOffset = { x: -offsetNumber, y: 0 }; // position offset in px to the left
        break;
      default:
        positionOffset = { x: 0, y: 0 };
        break;
    }
  }

  context.fillStyle = `rgba(${layer.fill.r}, ${layer.fill.g}, ${layer.fill.b}, 0.5)`;

  const newBorderColor = layer.borderColor
    ? colorToCss(layer.borderColor)
    : theme === "dark"
      ? "rgb(180, 191, 204)"
      : "rgb(71, 85, 105)";

  switch (layer.type) {
    case LayerType.Rectangle:
      // Use cross-browser compatible rounded rectangle drawing
      drawRoundedRect(context, layer.x + positionOffset.x, layer.y + positionOffset.y, layer.width, layer.height, 100);
      context.strokeStyle = newBorderColor;
      if (layer.borderWidth) {
        context.lineWidth = layer.borderWidth;
        context.stroke();
      }
      context.fill();
      break;

    case LayerType.Ellipse:
      context.beginPath();
      context.ellipse(
        layer.x + layer.width / 2 + positionOffset.x,
        layer.y + layer.height / 2 + positionOffset.y,
        layer.width / 2,
        layer.height / 2,
        0,
        0,
        Math.PI * 2,
      );
      context.strokeStyle = newBorderColor;
      if (layer.borderWidth) {
        context.lineWidth = layer.borderWidth;
        context.stroke();
      }
      context.fill();
      break;

    case LayerType.Diamond:
      context.beginPath();
      context.moveTo(layer.x + layer.width / 2 + positionOffset.x, layer.y + positionOffset.y);
      context.lineTo(layer.x + layer.width + positionOffset.x, layer.y + layer.height / 2 + positionOffset.y);
      context.lineTo(layer.x + layer.width / 2 + positionOffset.x, layer.y + layer.height + positionOffset.y);
      context.lineTo(layer.x + positionOffset.x, layer.y + layer.height / 2 + positionOffset.y);
      context.closePath();
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
