import { Camera, CanvasMode, CanvasState, Layer, LayerType } from "@/_types";

export const drawActiveLayerSelection = ({
  layer,
  context,
  camera,
  canvasState,
  activeLayers,
}: {
  layer: Layer;
  context: CanvasRenderingContext2D;
  camera: Camera;
  canvasState: CanvasState;
  activeLayers: string[];
}): void => {
  if (
    (canvasState.mode === CanvasMode.None && canvasState?.hoveredLayerId === layer.id) ||
    (canvasState.mode === CanvasMode.SelectionNet && canvasState?.selectedLayersIds?.includes(layer.id)) ||
    (activeLayers.length > 0 && activeLayers.includes(layer.id))
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
