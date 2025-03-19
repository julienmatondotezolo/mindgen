import { CanvasMode, CanvasState } from "@/_types";

export const drawSelectionRectangle = ({
  context,
  canvasState,
}: {
  context: CanvasRenderingContext2D;
  canvasState: CanvasState;
}) => {
  if (canvasState.mode === CanvasMode.SelectionNet && canvasState.origin && canvasState.current) {
    const x = Math.min(canvasState.origin.x, canvasState.current.x);
    const y = Math.min(canvasState.origin.y, canvasState.current.y);
    const width = Math.abs(canvasState.origin.x - canvasState.current.x);
    const height = Math.abs(canvasState.origin.y - canvasState.current.y);

    context.strokeStyle = "rgba(37, 99, 235, 0.5)";
    context.fillStyle = "rgba(37, 99, 235, 0.1)";
    context.fillRect(x, y, width, height);
    context.strokeRect(x, y, width, height);
  }
};
