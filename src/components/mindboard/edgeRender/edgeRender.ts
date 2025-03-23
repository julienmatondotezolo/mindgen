/* eslint-disable no-unused-vars */
import { Camera, CanvasState, Edge } from "@/_types";

import { drawEdgeBasedOnType, drawShadowEdgeBasedOnType } from "./edgeDrawings";

export const edgeRender = ({
  edge,
  context,
  camera,
  theme,
  canvasState,
}: {
  edge: Edge;
  context: CanvasRenderingContext2D;
  camera: Camera;
  theme: string | undefined;
  canvasState: CanvasState;
}): void => {
  // Draw shapes based on type
  drawEdgeBasedOnType({ edge, context, canvasState });
};
