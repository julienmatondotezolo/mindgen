import { Edge } from "@/_types";

export const drawEdgeText = ({
  edge,
  context,
  theme,
}: {
  edge: Edge;
  context: CanvasRenderingContext2D;
  theme: string | undefined;
}): void => {
  // Only draw text if the edge has a label
  if (!edge.label || edge.label.trim() === "") {
    return;
  }

  // Calculate the center point of the edge
  const centerX = (edge.start.x + edge.end.x) / 2;
  const centerY = (edge.start.y + edge.end.y) / 2;

  // Set font properties
  const fontSize = 14;
  const fontFamily = "Arial, sans-serif";

  context.font = `${fontSize}px ${fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Measure text dimensions
  const textMetrics = context.measureText(edge.label);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;

  // Add padding around the text
  const padding = 6;
  const rectWidth = textWidth + padding * 2;
  const rectHeight = textHeight + padding * 2;

  // Set rectangle position (centered on edge center)
  const rectX = centerX - rectWidth / 2;
  const rectY = centerY - rectHeight / 2;

  // Draw background rectangle
  context.fillStyle = theme === "dark" ? "#1a1a1a" : "#ffffff";
  context.strokeStyle = theme === "dark" ? "#333333" : "#e0e0e0";
  context.lineWidth = 1;

  context.fillRect(rectX, rectY, rectWidth, rectHeight);
  context.strokeRect(rectX, rectY, rectWidth, rectHeight);

  // Draw the text
  context.fillStyle = theme === "dark" ? "#ffffff" : "#000000";
  context.fillText(edge.label, centerX, centerY);
};
