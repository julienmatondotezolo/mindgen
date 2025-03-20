import { Camera, CanvasState, Layer } from "@/_types";

import {
  drawActiveLayerSelection,
  drawLayerBasedOnType,
  drawLayerHandles,
  drawLayerText,
  drawResizeGrips,
} from "./layerDrawings";

export const layerRender = ({
  layer,
  context,
  camera,
  activeLayers,
  theme,
  canvasState,
}: {
  layer: Layer;
  context: CanvasRenderingContext2D;
  camera: Camera;
  activeLayers: string[];
  theme: string | undefined;
  canvasState: CanvasState;
}): void => {
  // Draw shapes based on type
  drawLayerBasedOnType({ layer, context, theme });

  // Draw selection outline for active layers
  drawActiveLayerSelection({ layer, context, camera, activeLayers, canvasState });

  // Draw layer handles
  drawLayerHandles({ layer, context, camera, theme, activeLayers, canvasState });

  // Draw resize grips
  drawResizeGrips({ layer, context, camera, activeLayers });

  // Draw layer text
  drawLayerText({ layer, context, camera, theme });
};
