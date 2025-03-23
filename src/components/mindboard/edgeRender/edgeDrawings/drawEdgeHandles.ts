import { Camera, CanvasMode, CanvasState, Edge } from "@/_types";
import { drawHandle } from "@/utils/edgeUtils";

export const drawEdgeHandles = ({
  edge,
  context,
  canvasState,
  theme,
  camera,
  activeEdgeId,
}: {
  edge: Edge;
  context: CanvasRenderingContext2D;
  canvasState: CanvasState;
  theme: string | undefined;
  camera: Camera;
  activeEdgeId: string[];
}): void => {
  // If current edge is not in activeEdgeId, then don't draw it
  if (!activeEdgeId.includes(edge.id)) {
    return;
  }

  // Check if EDGE HANDLE is at START
  const isInStartHandle =
    canvasState.mode === CanvasMode.EdgeEditing && canvasState.edgeHandleInfo
      ? canvasState.edgeHandleInfo.handlePosition === "START"
      : false;

  // Check if EDGE HANDLE is at END
  const isInEndHandle =
    canvasState.mode === CanvasMode.EdgeEditing && canvasState.edgeHandleInfo
      ? canvasState.edgeHandleInfo.handlePosition === "END"
      : false;

  // Draw handle at start of edge
  if (edge.start) {
    drawHandle({
      context,
      theme,
      camera,
      position: edge.start,
      isInHandle: isInStartHandle,
    });
  }

  // Draw handle at end of edge
  if (edge.end) {
    drawHandle({
      context,
      theme,
      camera,
      position: edge.end,
      isInHandle: isInEndHandle,
    });
  }
};
