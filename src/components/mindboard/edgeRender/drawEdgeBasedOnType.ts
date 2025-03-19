import { Edge } from "@/_types";

export const drawEdgeBasedOnType = ({ edge, context }: { edge: Edge; context: CanvasRenderingContext2D }) => {
  context.beginPath();
  context.moveTo(edge.start.x, edge.start.y);
  context.lineTo(edge.end.x, edge.end.y);
  context.strokeStyle = `rgb(${edge.color.r}, ${edge.color.g}, ${edge.color.b})`;
  context.lineWidth = edge.thickness;
  context.stroke();

  // Draw arrow if needed
  if (edge && edge.end) {
    const angle = Math.atan2(edge.end.y - edge.start.y, edge.end.x - edge.start.x);
    const size = 10;

    context.beginPath();
    context.moveTo(edge.end.x, edge.end.y);
    context.lineTo(
      edge.end.x - size * Math.cos(angle - Math.PI / 6),
      edge.end.y - size * Math.sin(angle - Math.PI / 6),
    );
    context.lineTo(
      edge.end.x - size * Math.cos(angle + Math.PI / 6),
      edge.end.y - size * Math.sin(angle + Math.PI / 6),
    );
    context.closePath();
    context.fillStyle = `rgb(${edge.color.r}, ${edge.color.g}, ${edge.color.b})`;
    context.fill();
  }
};
