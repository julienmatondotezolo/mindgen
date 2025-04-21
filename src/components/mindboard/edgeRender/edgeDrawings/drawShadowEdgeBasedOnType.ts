import { CanvasMode, CanvasState, Edge, EdgeShape, EdgeType } from "@/_types/canvas";
import { drawEdgeCurvedLine, getHandleEndPosition } from "@/utils/edgeUtils";
import { getShadowsPositionBasedOnPointerPositionInHandle } from "@/utils/layerUtils";

export const drawShadowEdgeBasedOnType = ({
  context,
  canvasState,
}: {
  context: CanvasRenderingContext2D;
  canvasState: CanvasState;
}): void => {
  const isEdgeOurEdgeDrawingMode = canvasState.mode === CanvasMode.Edge || canvasState.mode === CanvasMode.EdgeDrawing;

  // If canvas is not in edge mode, or the handle is not in the active layer,
  // or the handle is not in the active layer, then don't show the shadow layer
  if (isEdgeOurEdgeDrawingMode == false) return;

  if (!canvasState.origin) return;

  // Return new layer position based on pointer position in handle
  const { newEdgePosition } = getShadowsPositionBasedOnPointerPositionInHandle({
    handlePosition: canvasState.handleInfo?.handlePosition,
    canvasState,
  });

  // Create a shadow edge with semi-transparent color for the preview
  const shadowEdge: Edge = {
    id: "shadow-edge",
    start: canvasState.origin,
    end: newEdgePosition,
    color: { r: 180, g: 191, b: 204, a: 0.5 },
    hoverColor: { r: 71, g: 85, b: 105, a: 0.5 },
    thickness: 4,
    orientation: "auto",
    type: EdgeType.Solid,
    label: "",
    shape: EdgeShape.Curved,
    handleStart: canvasState.handleInfo?.handlePosition,
    handleEnd:
      canvasState.handleInfo && getHandleEndPosition({ handleStartPosition: canvasState.handleInfo?.handlePosition }),
  };

  // Begin drawing
  context.beginPath();

  // Draw line
  drawEdgeCurvedLine({ edge: shadowEdge, context });
  // context.moveTo(canvasState.origin.x, canvasState.origin.y);
  // context.lineTo(newEdgePosition.x, newEdgePosition.y);

  // Draw the edge with semi-transparent color
  context.strokeStyle = `rgba(${shadowEdge.color.r}, ${shadowEdge.color.g}, ${shadowEdge.color.b}, ${shadowEdge.color.a})`;
  context.lineWidth = 4;
  context.lineCap = "round";
  context.stroke();
};
