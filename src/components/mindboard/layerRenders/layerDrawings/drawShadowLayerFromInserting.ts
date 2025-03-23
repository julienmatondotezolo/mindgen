import { CanvasMode, CanvasState, Layer, LayerType } from "@/_types/canvas";

import { drawLayerBasedOnType } from "./drawLayerBasedOnType";

export const drawShadowLayerFromInserting = ({
  context,
  theme,
  canvasState,
}: {
  context: CanvasRenderingContext2D;
  theme: string | undefined;
  canvasState: CanvasState;
}): void => {
  // ============================================================================= //
  // ===================== SHOW SHADOW WEN INSERTING MODE ======================= //
  // ============================================================================= //

  const isInsertingMode = canvasState.mode === CanvasMode.Inserting;

  if (isInsertingMode && canvasState.current) {
    // Set type to the type of the layer in the canvasState
    const newLayer: Layer = {
      id: "shadow-layer",
      x: canvasState.current.x,
      y: canvasState.current.y,
      width: 200,
      height: canvasState.layerType === LayerType.Rectangle ? 60 : 200,
      type: canvasState.layerType as any,
      fill: { r: 77, g: 106, b: 255, a: 0.2 },
      value: "",
    };

    // Draw the layer based on the type
    drawLayerBasedOnType({ layer: newLayer, context, theme, newLayerPosition: canvasState.current });
    return;
  }
};
