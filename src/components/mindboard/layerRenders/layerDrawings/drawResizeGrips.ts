import { Camera, CanvasMode, CanvasState, Corner, Layer } from "@/_types";
import { calculateLayerBoundingBox } from "@/utils/layerUtils";

export const drawResizeGrips = ({
  layer,
  context,
  camera,
  activeLayers,
  canvasState,
  allLayers = [],
}: {
  layer: Layer;
  context: CanvasRenderingContext2D;
  camera: Camera;
  activeLayers: string[];
  canvasState: CanvasState;
  allLayers?: Layer[];
}): void => {
  // Handle size is 8px
  let handleSize = 8 / camera.scale;

  // If layer is active and canvas state is None, Grab, or Inserting, then draw the resize grips
  if (
    activeLayers.includes(layer.id) &&
    (canvasState.mode == CanvasMode.None ||
      canvasState.mode == CanvasMode.Edge ||
      canvasState.mode == CanvasMode.Grab ||
      canvasState.mode == CanvasMode.Inserting ||
      canvasState.mode == CanvasMode.Resizing ||
      canvasState.mode == CanvasMode.Tooling ||
      canvasState.mode == CanvasMode.Translating)
  ) {
    // get the current corner from the canvas state
    const currentCorner = canvasState.mode === CanvasMode.Resizing ? canvasState.corner : undefined;

    // If multiple layers are selected, we need to draw a bounding box that encompasses all of them
    if (activeLayers.length > 1) {
      // Only draw the group bounding box for the first active layer we render
      // This prevents duplicate bounding boxes when rendering multiple layers
      if (layer.id === activeLayers[0]) {
        // Create an array of all selected layers to calculate the bounding box
        let selectedLayers: Layer[] = [layer];

        // If allLayers is provided, use it to find all active layers
        if (allLayers.length > 0) {
          selectedLayers = allLayers.filter((l) => activeLayers.includes(l.id));
        }

        // Calculate the bounding box across all selected layers
        const box = calculateLayerBoundingBox(selectedLayers);

        if (box) {
          // Draw group bounding box with a different style
          context.strokeStyle = "#2563eb"; // Different color for group selection
          context.lineWidth = 2 / camera.scale;
          context.strokeRect(box.x, box.y, box.width, box.height);

          // Draw resize handles
          const handles = [
            { x: box.x - handleSize / 2, y: box.y - handleSize / 2, corner: Corner.TopLeft }, // top-left
            { x: box.x + box.width / 2 - handleSize / 2, y: box.y - handleSize / 2, corner: Corner.TopCenter }, // top-center
            { x: box.x + box.width - handleSize / 2, y: box.y - handleSize / 2, corner: Corner.TopRight }, // top-right
            {
              x: box.x + box.width - handleSize / 2,
              y: box.y + box.height / 2 - handleSize / 2,
              corner: Corner.MiddleRight,
            }, // middle-right
            {
              x: box.x + box.width - handleSize / 2,
              y: box.y + box.height - handleSize / 2,
              corner: Corner.BottomRight,
            }, // bottom-right
            {
              x: box.x + box.width / 2 - handleSize / 2,
              y: box.y + box.height - handleSize / 2,
              corner: Corner.BottomCenter,
            }, // bottom-center
            { x: box.x - handleSize / 2, y: box.y + box.height - handleSize / 2, corner: Corner.BottomLeft }, // bottom-left
            { x: box.x - handleSize / 2, y: box.y + box.height / 2 - handleSize / 2, corner: Corner.MiddleLeft }, // middle-left
          ];

          // Draw the bounding box resize handles
          handles.forEach((handle) => {
            context.fillStyle = currentCorner === handle.corner ? "#2563eb" : "#ffffff";
            context.fillRect(handle.x, handle.y, handleSize, handleSize);
            context.strokeStyle = currentCorner === handle.corner ? "#2563eb" : "#2563eb";
            context.strokeRect(handle.x, handle.y, handleSize, handleSize);
          });
        }
      }
    } else {
      // Single layer selection - draw individual bounding box and handles
      // Draw layer bounding box
      context.strokeStyle = "#2563eb";
      context.lineWidth = 2 / camera.scale;
      context.strokeRect(layer.x, layer.y, layer.width, layer.height);

      // Draw resize handles
      const handles = [
        { x: layer.x - handleSize / 2, y: layer.y - handleSize / 2, corner: Corner.TopLeft }, // top-left
        { x: layer.x + layer.width / 2 - handleSize / 2, y: layer.y - handleSize / 2, corner: Corner.TopCenter }, // top-center
        { x: layer.x + layer.width - handleSize / 2, y: layer.y - handleSize / 2, corner: Corner.TopRight }, // top-right
        {
          x: layer.x + layer.width - handleSize / 2,
          y: layer.y + layer.height / 2 - handleSize / 2,
          corner: Corner.MiddleRight,
        }, // middle-right
        {
          x: layer.x + layer.width - handleSize / 2,
          y: layer.y + layer.height - handleSize / 2,
          corner: Corner.BottomRight,
        }, // bottom-right
        {
          x: layer.x + layer.width / 2 - handleSize / 2,
          y: layer.y + layer.height - handleSize / 2,
          corner: Corner.BottomCenter,
        }, // bottom-center
        { x: layer.x - handleSize / 2, y: layer.y + layer.height - handleSize / 2, corner: Corner.BottomLeft }, // bottom-left
        { x: layer.x - handleSize / 2, y: layer.y + layer.height / 2 - handleSize / 2, corner: Corner.MiddleLeft }, // middle-left
      ];

      handles.forEach((handle) => {
        const handleSize = currentCorner === handle.corner ? 12 / camera.scale : 8 / camera.scale;

        context.fillStyle = currentCorner === handle.corner ? "#2563eb" : "#ffffff";
        context.fillRect(handle.x, handle.y, handleSize, handleSize);
        context.strokeStyle = currentCorner === handle.corner ? "#2563eb" : "#2563eb";
        context.strokeRect(handle.x, handle.y, handleSize, handleSize);
      });
    }
  }
};
