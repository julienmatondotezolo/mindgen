/* eslint-disable no-unused-vars */
import { Camera, CanvasMode, CanvasState, Edge, EdgeShape, HandlePosition } from "@/_types";
import { drawEdgeCurvedLine, drawEdgeStepLine, getControlWithCurvature } from "@/utils/edgeUtils";

export const drawEdgeActiveSelection = ({
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
}) => {
  // If current edge is not in activeEdgeId, then don't draw it
  if (!activeEdgeId.includes(edge.id)) {
    return;
  }

  const defaultBlueColor = { r: 77, g: 106, b: 255 };

  const colorStyle = `rgb(${defaultBlueColor.r}, ${defaultBlueColor.g}, ${defaultBlueColor.b})`;

  context.beginPath();

  switch (edge.shape) {
    // draw straight line
    case EdgeShape.Line:
      context.moveTo(edge.start.x, edge.start.y);
      context.lineTo(edge.end.x, edge.end.y);
      break;

    // draw curved line
    case EdgeShape.Curved: {
      drawEdgeCurvedLine({ edge, context });
      break;
    }

    // draw smooth step line
    case EdgeShape.SmoothStep: {
      drawEdgeStepLine({ edge, context });
      break;
    }

    default:
      context.moveTo(edge.start.x, edge.start.y);
      context.lineTo(edge.end.x, edge.end.y);
      break;
  }

  context.strokeStyle = colorStyle;
  context.lineWidth = edge.thickness / 2;
  context.lineCap = "round";
  context.stroke();
};
