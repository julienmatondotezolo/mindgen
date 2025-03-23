import { Camera, Edge } from "@/_types";
import { drawHandle } from "@/utils/edgeUtils";

export const drawEdgeHandles = ({
  edge,
  context,
  theme,
  camera,
  activeEdgeId,
}: {
  edge: Edge;
  context: CanvasRenderingContext2D;
  theme: string | undefined;
  camera: Camera;
  activeEdgeId: string[];
}): void => {
  // If current edge is not in activeEdgeId, then don't draw it
  if (!activeEdgeId.includes(edge.id)) {
    return;
  }

  // Check if this handle is being hovered
  const isInHandle = false;

  // Draw handle at start of edge
  if (edge.start) {
    drawHandle({
      context,
      theme,
      camera,
      position: edge.start,
      isInHandle,
    });
  }

  // Draw handle at end of edge
  if (edge.end) {
    drawHandle({
      context,
      theme,
      camera,
      position: edge.end,
      isInHandle,
    });
  }
};
