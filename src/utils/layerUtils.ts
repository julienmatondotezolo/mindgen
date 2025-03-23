/* eslint-disable prettier/prettier */
import { CanvasMode, CanvasState, Color, HandlePosition, Layer, Point } from "@/_types/canvas";

// Draw a Rounded Rectangle
export const drawRoundedRect = ({
  ctx,
  x,
  y,
  width,
  height,
  fill,
}: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
}) => {
  let radius = 100;

  ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, 0.5)`;

  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);

  ctx.fill();
  ctx.closePath();
};

// Draw an Ellipse
export const drawEllipse = ({
  ctx,
  x,
  y,
  width,
  height,
  fill,
}: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
}) => {
  ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, 0.5)`;

  ctx.beginPath();
  ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);

  ctx.fill();
  ctx.closePath();
};

// Draw a Diamond
export const drawDiamond = ({
  ctx,
  x,
  y,
  width,
  height,
  fill,
}: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
}) => {
  ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, 0.5)`;

  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height / 2);
  ctx.lineTo(x + width / 2, y + height);
  ctx.lineTo(x, y + height / 2);
  ctx.fill();
  ctx.closePath();
};

// Get the handle position based on the layer type
export const getHandlePosition = (layer: Layer) => {
  // Constants to match those in drawLayerHandles.ts
  const handleSize = 12;
  const HANDLE_DISTANCE_FACTOR = 2.5;

  // Calculate positions for the 4 handles (same as in drawLayerHandles.ts)
  const handlePositions = [
    // top
    {
      x: layer.x + layer.width / 2,
      y: layer.y - handleSize * HANDLE_DISTANCE_FACTOR,
      position: HandlePosition.Top,
    },
    // right
    {
      x: layer.x + layer.width + handleSize * HANDLE_DISTANCE_FACTOR,
      y: layer.y + layer.height / 2,
      position: HandlePosition.Right,
    },
    // bottom
    {
      x: layer.x + layer.width / 2,
      y: layer.y + layer.height + handleSize * HANDLE_DISTANCE_FACTOR,
      position: HandlePosition.Bottom,
    },
    // left
    {
      x: layer.x - handleSize * HANDLE_DISTANCE_FACTOR,
      y: layer.y + layer.height / 2,
      position: HandlePosition.Left,
    },
  ];

  return { handlePositions, handleSize };
};

// Calculate the bounding box for an array of layers
export const calculateLayerBoundingBox = (layers: Layer[]) => {
  if (!layers.length) return null;

  const first = layers[0];

  let left = first.x;
  let right = first.x + first.width;
  let top = first.y;
  let bottom = first.y + first.height;

  for (let i = 1; i < layers.length; i++) {
    const { x, y, width, height } = layers[i];

    if (left > x) {
      left = x;
    }

    if (right < x + width) {
      right = x + width;
    }

    if (top > y) {
      top = y;
    }

    if (bottom < y + height) {
      bottom = y + height;
    }
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

// Return new layer position based on pointer position in handle
export const getShadowsPositionBasedOnPointerPositionInHandle = ({
  layer,
  handlePosition,
  canvasState,
}: {
  layer?: Layer;
  handlePosition: HandlePosition | undefined;
  canvasState: CanvasState;
}): {
  newLayerPosition: Point;
  newEdgePosition: Point;
} => {
  // Calculate position offset based on handle position
  const gapBetweenEdgeAndLayer = 32;
  const layerOffsetPosition = 200;
  const edgeOffsetPosition = 200 - gapBetweenEdgeAndLayer;
  let newLayerPosition: Point = { x: 0, y: 0 };
  let newEdgePosition: Point = { x: 0, y: 0 };

  if (canvasState.mode === CanvasMode.Edge || canvasState.mode === CanvasMode.EdgeDrawing) {
    switch (handlePosition) {
      case HandlePosition.Top:
        if (canvasState.origin) {
          newLayerPosition = layer
            ? { x: canvasState.origin.x, y: canvasState.origin.y - layer.height / 2 - layerOffsetPosition }
            : { x: 0, y: 0 };
          newEdgePosition = { x: canvasState.origin.x, y: canvasState.origin.y - edgeOffsetPosition };
        }

        if (canvasState.current) {
          newLayerPosition = layer
            ? {
              x: canvasState.current.x,
              y: canvasState.current.y - layer.height / 2 - gapBetweenEdgeAndLayer,
            }
            : { x: 0, y: 0 };
          newEdgePosition = { x: canvasState.current.x, y: canvasState.current.y };
        }
        break;
      case HandlePosition.Right:
        if (canvasState.origin) {
          newLayerPosition = layer
            ? { x: canvasState.origin.x + layer.width / 2 + layerOffsetPosition, y: canvasState.origin.y }
            : { x: 0, y: 0 };
          newEdgePosition = { x: canvasState.origin.x + edgeOffsetPosition, y: canvasState.origin.y };
        }

        if (canvasState.current) {
          newLayerPosition = layer
            ? {
              x: canvasState.current.x + layer.width / 2 + gapBetweenEdgeAndLayer,
              y: canvasState.current.y,
            }
            : { x: 0, y: 0 };
          newEdgePosition = { x: canvasState.current.x, y: canvasState.current.y };
        }
        break;
      case HandlePosition.Bottom:
        if (canvasState.origin) {
          newLayerPosition = layer
            ? { x: canvasState.origin.x, y: canvasState.origin.y + layer.height / 2 + layerOffsetPosition }
            : { x: 0, y: 0 };
          newEdgePosition = { x: canvasState.origin.x, y: canvasState.origin.y + edgeOffsetPosition };
        }

        if (canvasState.current) {
          newLayerPosition = layer
            ? {
              x: canvasState.current.x,
              y: canvasState.current.y + layer.height / 2 + gapBetweenEdgeAndLayer,
            }
            : { x: 0, y: 0 };
          newEdgePosition = { x: canvasState.current.x, y: canvasState.current.y };
        }
        break;
      case HandlePosition.Left:
        if (canvasState.origin) {
          newLayerPosition = layer
            ? { x: canvasState.origin.x - layer.width / 2 - layerOffsetPosition, y: canvasState.origin.y }
            : { x: 0, y: 0 };
          newEdgePosition = { x: canvasState.origin.x - edgeOffsetPosition, y: canvasState.origin.y };
        }

        if (canvasState.current) {
          newLayerPosition = layer
            ? {
              x: canvasState.current.x - layer.width / 2 - gapBetweenEdgeAndLayer,
              y: canvasState.current.y,
            }
            : { x: 0, y: 0 };
          newEdgePosition = { x: canvasState.current.x, y: canvasState.current.y };
        }
        break;
      default:
        newLayerPosition = { x: 0, y: 0 };
        newEdgePosition = { x: 0, y: 0 };
        break;
    }
  }

  return { newLayerPosition, newEdgePosition };
};

// Get a layer by id
export const getLayerById = ({ layerId, layers }: { layerId: string; layers: Layer[] }): Layer =>
  layers.filter((layer: Layer) => layer.id == layerId)[0];

// Find intersecting layers with a rectangle
export function findIntersectingLayersWithRectangle(layers: Layer[], a: Point, b: Point) {
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };

  const ids = new Set<string>();

  for (const layer of layers) {
    if (layer == null) {
      continue;
    }

    const { x, y, height, width } = layer;

    if (rect.x + rect.width > x && rect.x < x + width && rect.y + rect.height > y && rect.y < y + height) {
      ids.add(layer.id); // Set automatically handles duplicates
    }
  }

  return Array.from(ids);
}
