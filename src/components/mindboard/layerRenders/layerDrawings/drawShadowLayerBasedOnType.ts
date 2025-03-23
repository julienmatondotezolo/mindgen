import { CanvasMode, CanvasState, Layer } from "@/_types/canvas";
import { getShadowsPositionBasedOnPointerPositionInHandle } from "@/utils";

import { drawLayerBasedOnType } from "./drawLayerBasedOnType";

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
  // ============================================================================= //
  // ===================== SHOW SHADOW WEN HOVERING HANDLE ======================= //
  // ============================================================================= //

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

  context.globalAlpha = 0.5;

  drawLayerBasedOnType({ layer, context, theme, newLayerPosition });

  context.globalAlpha = 1.0;
};
