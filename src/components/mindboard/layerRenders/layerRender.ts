import { Camera, CanvasState, Layer } from "@/_types";

import {
  drawActiveLayerSelection,
  drawAlignmentGuidelines,
  drawLayerBasedOnType,
  drawLayerHandles,
  drawLayerSelectionTool,
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
  drawShadowLayerBasedOnType({ layer, context, canvasState, theme, activeLayers });

  // Draw shapes based on type
  drawLayerBasedOnType({ layer, context, theme });

  // Draw selection outline for active layers
  drawActiveLayerSelection({ layer, context, camera, canvasState, activeLayers });

  // Draw layer handles
  drawLayerHandles({ layer, context, camera, canvasState, theme, activeLayers });

  // Draw resize grips
  drawResizeGrips({ layer, context, camera, canvasState, activeLayers, allLayers });

  // Draw layer text
  drawLayerText({ layer, context, camera, theme });

  // Draw alignment guidelines if available and the layer is active
  drawAlignmentGuidelines({ context, camera, canvasState });

  // Draw layer selection tool
  drawLayerSelectionTool({ layer, context, camera, canvasState, theme, activeLayers, allLayers });
};
