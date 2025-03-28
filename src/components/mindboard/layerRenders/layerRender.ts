import { Camera, CanvasState, Layer } from "@/_types";

import {
  drawActiveLayerSelection,
  drawAlignmentGuidelines,
  drawLayerBasedOnType,
  drawLayerHandles,
  drawLayerText,
  drawResizeGrips,
  drawShadowLayerBasedOnType,
} from "./layerDrawings";

export const layerRender = ({
  layer,
  context,
  camera,
  activeLayers,
  theme,
  canvasState,
  allLayers,
}: {
  layer: Layer;
  context: CanvasRenderingContext2D;
  camera: Camera;
  activeLayers: string[];
  theme: string | undefined;
  canvasState: CanvasState;
  allLayers: Layer[];
}): void => {
  // Draw shadow layer
  drawShadowLayerBasedOnType({ layer, context, theme, activeLayers, canvasState });

  // Draw shapes based on type
  drawLayerBasedOnType({ layer, context, theme });

  // Draw selection outline for active layers
  drawActiveLayerSelection({ layer, context, camera, canvasState, activeLayers });

  // Draw layer handles
  drawLayerHandles({ layer, context, camera, theme, activeLayers, canvasState });

  // Draw resize grips
  drawResizeGrips({ layer, context, camera, activeLayers, canvasState, allLayers });

  // Draw layer text
  drawLayerText({ layer, context, camera, theme });

  // Draw alignment guidelines if available and the layer is active
  drawAlignmentGuidelines({ context, camera, canvasState });
};
