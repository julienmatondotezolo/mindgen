/* eslint-disable no-unused-vars */
import { Camera, CanvasState, Edge } from "@/_types";

import { drawEdgeActiveSelection, drawEdgeBasedOnType, drawEdgeHandles } from "./edgeDrawings";

export const edgeRender = ({
  edge,
  context,
  camera,
  theme,
  canvasState,
  activeEdgeId,
}: {
  edge: Edge;
  context: CanvasRenderingContext2D;
  camera: Camera;
  theme: string | undefined;
  canvasState: CanvasState;
  activeEdgeId: string[];
}): void => {
  // Draw shapes based on type
  drawEdgeBasedOnType({ edge, context, canvasState, activeEdgeId });
  drawEdgeActiveSelection({ edge, context, theme, activeEdgeId });
  drawEdgeHandles({ edge, context, theme, camera, activeEdgeId });
};
