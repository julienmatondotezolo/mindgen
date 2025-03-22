import { Color, HandlePosition, Layer } from "@/_types/canvas";

// Draw a rounded rectangle
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

// Draw an ellipse
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

// Draw a diamond
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
  ctx.closePath();
};

// get the handle position based on the layer type
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
