import { Camera, CanvasMode, CanvasState, Layer, LayerType } from "@/_types";

export const drawActiveLayerSelection = ({
  layer,
  context,
  camera,
  activeLayers,
  canvasState,
}: {
  layer: Layer;
  context: CanvasRenderingContext2D;
  camera: Camera;
  activeLayers: string[];
  canvasState: CanvasState;
}): void => {
  if (
    (canvasState.mode === CanvasMode.None && canvasState?.hoveredLayerId === layer.id) ||
    (canvasState.mode === CanvasMode.SelectionNet && activeLayers.includes(layer.id)) ||
    (activeLayers.includes(layer.id) && activeLayers.length > 1)
  ) {
    const radius = 5;

    switch (layer.type) {
      case LayerType.Rectangle:
        context.beginPath();
        context.roundRect(layer.x, layer.y, layer.width, layer.height, radius);
        break;
      case LayerType.Ellipse:
        context.beginPath();
        context.roundRect(layer.x, layer.y, layer.width, layer.height, radius);
        break;
      case LayerType.Diamond:
        context.beginPath();
        context.roundRect(layer.x, layer.y, layer.width, layer.height, radius);
        break;
    }

    context.strokeStyle = "#2563eb"; // Blue selection color
    context.lineWidth = 2 / camera.scale;
    context.stroke();
  }
};
