/* eslint-disable no-unused-vars */
import { Camera, CanvasMode, CanvasState, Edge, EdgeShape, HandlePosition } from "@/_types";
import { drawEdgeCurvedLine, drawEdgeStepLine, getControlWithCurvature } from "@/utils/edgeUtils";

export const drawEdgeSelectionTool = ({
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
  const colorStyleOnHover =
    canvasState.mode === CanvasMode.None && canvasState.hoveredEdgeId === edge.id
      ? `rgb(${edge.hoverColor.r}, ${edge.hoverColor.g}, ${edge.hoverColor.b})`
      : `rgb(${edge.color.r}, ${edge.color.g}, ${edge.color.b})`;

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

  context.strokeStyle = colorStyleOnHover;
  context.lineWidth = edge.thickness;
  context.lineCap = "round";
  context.stroke();

  // Draw arrow
  if (edge.arrowEnd) {
    let angle;

    // For line edges, calculate angle directly from start and end points
    if (edge.shape === EdgeShape.Line) {
      angle = Math.atan2(edge.end.y - edge.start.y, edge.end.x - edge.start.x);
    }
    // For non-line edges, use the edge orientation if specified, otherwise fallback to calculation
    else {
      if (edge.orientation && edge.orientation !== "auto") {
        // Convert orientation string to radians
        const orientationDegrees = parseInt(edge.orientation, 10);

        angle = (orientationDegrees * Math.PI) / 180;
      } else {
        // For curved edges, use the tangent at the endpoint by estimating from control points
        if (edge.shape === EdgeShape.Curved) {
          const targetPosition = edge.handleEnd || HandlePosition.Top;
          const [, , targetControlX, targetControlY] = [
            edge.start.x,
            edge.start.y,
            ...getControlWithCurvature({
              pos: targetPosition,
              x1: edge.end.x,
              y1: edge.end.y,
              x2: edge.start.x,
              y2: edge.start.y,
              c: 0.5,
            }),
          ];
          // Calculate angle from control point to endpoint for a better tangent approximation

          angle = Math.atan2(edge.end.y - targetControlY, edge.end.x - targetControlX);
        } else {
          // Fallback to direct calculation for other shapes
          angle = Math.atan2(edge.end.y - edge.start.y, edge.end.x - edge.start.x);
        }
      }
    }

    const size = edge.thickness === 2 ? 14 : 20;
    // Calculate the arrow position with an offset of -2 from the end point
    const arrowOffset = -12;
    const arrowX = edge.end.x - arrowOffset * Math.cos(angle);
    const arrowY = edge.end.y - arrowOffset * Math.sin(angle);

    context.beginPath();
    context.moveTo(arrowX, arrowY);
    context.lineTo(arrowX - size * Math.cos(angle - Math.PI / 6), arrowY - size * Math.sin(angle - Math.PI / 6));
    context.lineTo(arrowX - size * Math.cos(angle + Math.PI / 6), arrowY - size * Math.sin(angle + Math.PI / 6));
    context.closePath();
    context.fillStyle = colorStyleOnHover;
    context.fill();
  }
};
