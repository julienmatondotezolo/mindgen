import { Camera, CanvasMode, CanvasState } from "@/_types";

export const drawAlignmentGuidelines = ({
  context,
  camera,
  canvasState,
}: {
  context: CanvasRenderingContext2D;
  camera: Camera;
  canvasState: CanvasState;
}): void => {
  if (canvasState.mode !== CanvasMode.Translating) return;

  if (!canvasState.alignments) return;

  const alignments = canvasState.alignments;

  // Save current context state
  context.save();

  // Set guideline style
  context.strokeStyle = "#2D9CDB"; // Blue color for guidelines
  context.lineWidth = 2 / camera.scale;
  context.setLineDash([4, 4]); // Dashed line

  // Get canvas dimensions
  const canvasWidth = context.canvas.width;
  const canvasHeight = context.canvas.height;

  // Draw vertical guidelines
  alignments.vertical.forEach((alignment) => {
    const x = alignment.position;

    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvasHeight);
    context.stroke();
  });

  // Draw horizontal guidelines
  alignments.horizontal.forEach((alignment) => {
    const y = alignment.position;

    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvasWidth, y);
    context.stroke();
  });

  // Restore context state
  context.restore();
};
