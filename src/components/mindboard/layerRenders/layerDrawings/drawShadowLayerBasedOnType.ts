import { CanvasMode, CanvasState, Layer, LayerType } from "@/_types/canvas";
import { colorToCss } from "@/utils";

import {
  drawDiamond,
  drawEllipse,
  drawRoundedRect,
  getShadowsPositionBasedOnPointerPositionInHandle,
} from "../../layerUtils";

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
  const isEdgeOurEdgeDrawingMode = canvasState.mode === CanvasMode.Edge || canvasState.mode === CanvasMode.EdgeDrawing;
  // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
  const isHandleInActiveLayer = activeLayers.includes(canvasState.handleInfo?.layerId);
  // const isInHandle = canvasState.handleInfo?.isInHandle === true;
  // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
  const isHandleInCurrentLayer = layer.id === canvasState.handleInfo?.layerId;

  // If canvas is not in edge mode, or the handle is not in the active layer, or the handle is not in the active layer, then don't show the shadow layer
  if (isEdgeOurEdgeDrawingMode == false) {
    return;
  }

  // if (isInHandle === false) {
  //   return;
  // }

  if (isHandleInActiveLayer === false) {
    return;
  }

  if (isHandleInCurrentLayer === false) {
    return;
  }

  // Return new layer position based on pointer position in handle
  const { newLayerPosition } = getShadowsPositionBasedOnPointerPositionInHandle({
    layer,
    handlePosition: canvasState.handleInfo?.handlePosition,
    canvasState,
  });

  // Get new border color
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
        x: newLayerPosition.x - layer.width / 2,
        y: newLayerPosition.y - layer.height / 2,
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
      break;

    case LayerType.Ellipse:
      // Draw Ellipse
      drawEllipse({
        ctx: context,
        x: newLayerPosition.x,
        y: newLayerPosition.y,
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
      break;

    case LayerType.Diamond:
      // Draw diamond
      drawDiamond({
        ctx: context,
        x: newLayerPosition.x - layer.width / 2,
        y: newLayerPosition.y - layer.height / 2,
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
