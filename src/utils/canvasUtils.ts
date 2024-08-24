import { type ClassValue, clsx } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

import {
  Camera,
  Color,
  EdgeOrientation,
  HandlePosition,
  Layer,
  LayerType,
  PathLayer,
  Point,
  Side,
  XYWH,
} from "@/_types/canvas";

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const connectionIdToColor = (connectionId: number) => COLORS[connectionId % COLORS.length];

export const pointerEventToCanvasPoint = (e: React.PointerEvent, camera: Camera) => ({
  x: Math.round(e.clientX) - camera.x,
  y: Math.round(e.clientY) - camera.y,
});

export function colorToCss(color: Color) {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b
    .toString(16)
    .padStart(2, "0")}`;
}

export const findNonOverlappingPosition = ({
  newPosition,
  layers,
  currentLayer,
  LAYER_SPACING,
}: {
  newPosition: Point;
  layers: Layer[];
  currentLayer: Layer;
  LAYER_SPACING: number;
}): Point => {
  const OVERLAP_THRESHOLD = 10; // Minimum distance between layers
  let adjustedPosition = { ...newPosition };
  let overlapping = true;

  while (overlapping) {
    overlapping = false;
    for (const layer of layers) {
      if (layer.id === currentLayer.id) continue;

      const xOverlap = Math.abs(adjustedPosition.x - layer.x) < currentLayer.width + OVERLAP_THRESHOLD;
      const yOverlap = Math.abs(adjustedPosition.y - layer.y) < currentLayer.height + OVERLAP_THRESHOLD;

      if (xOverlap && yOverlap) {
        overlapping = true;
        adjustedPosition.x += LAYER_SPACING;
        adjustedPosition.y += LAYER_SPACING;
        break;
      }
    }
  }

  return adjustedPosition;
};

export function resizeBounds(bounds: XYWH, corner: Side, point: Point): XYWH {
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };

  if ((corner & Side.Left) === Side.Left) {
    result.x = Math.min(point.x, bounds.x + bounds.width);
    result.width = Math.abs(bounds.x + bounds.width - point.x);
  }

  if ((corner & Side.Right) === Side.Right) {
    result.x = Math.min(point.x, bounds.x);
    result.width = Math.abs(point.x - bounds.x);
  }

  if ((corner & Side.Top) === Side.Top) {
    result.y = Math.min(point.y, bounds.y + bounds.height);
    result.height = Math.abs(bounds.y + bounds.height - point.y);
  }

  if ((corner & Side.Bottom) === Side.Bottom) {
    result.y = Math.min(point.y, bounds.y);
    result.height = Math.abs(point.y - bounds.y);
  }

  return result;
}

export function findIntersectingLayersWithRectangle(layers: Layer[], a: Point, b: Point) {
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };

  const ids = [];

  for (const layer of layers) {
    if (layer == null) {
      continue;
    }

    const { x, y, height, width } = layer;

    if (rect.x + rect.width > x && rect.x < x + width && rect.y + rect.height > y && rect.y < y + height) {
      ids.push(layer.id);
    }
  }

  return ids;
}

export function findNearestLayerHandle(point: Point, layers: Layer[], threshold: number) {
  const HANDLE_DISTANCE = 30;

  let nearestHandle: { x: number; y: number; layerId: string; position: HandlePosition } | null = null;
  let minDistance = Infinity;

  for (const layer of layers) {
    const bounds = {
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
    };

    const handlePositions = [
      {
        x: layer.x + layer.width / 2,
        y: layer.y - HANDLE_DISTANCE,
        position: HandlePosition.Top,
      },
      {
        x: bounds.x + bounds.width + HANDLE_DISTANCE,
        y: bounds.y + bounds.height / 2,
        position: HandlePosition.Right,
      },
      {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height + HANDLE_DISTANCE,
        position: HandlePosition.Bottom,
      },
      {
        x: layer.x - HANDLE_DISTANCE,
        y: layer.y + layer.height / 2,
        position: HandlePosition.Left,
      },
    ];

    for (const handle of handlePositions) {
      const distance = Math.sqrt(Math.pow(point.x - handle.x, 2) + Math.pow(point.y - handle.y, 2));

      if (distance < minDistance && distance <= threshold) {
        minDistance = distance;
        nearestHandle = {
          x: handle.x,
          y: handle.y,
          layerId: layer.id,
          position: handle.position,
        };
      }
    }
  }

  return nearestHandle;
}

export function getContrastingTextColor(color: Color) {
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;

  return luminance > 182 ? "black" : "white";
}

export const getOrientationFromPosition = (position: HandlePosition, inversed?: boolean): EdgeOrientation => {
  switch (position) {
    case HandlePosition.Left:
      return inversed ? "0" : "180";
    case HandlePosition.Right:
      return inversed ? "180" : "0";
    case HandlePosition.Top:
      return inversed ? "90" : "270";
    case HandlePosition.Bottom:
      return inversed ? "270" : "90";
    default:
      return "auto";
  }
};

export const calculateControlPoints = (start: Point, end: Point, fromPosition: HandlePosition | undefined) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Determine if the edge is more horizontal or vertical
  const isHorizontal = fromPosition === HandlePosition.Left || fromPosition === HandlePosition.Right;

  // Calculate the length of the straight segment (e.g., 30% of the total distance)
  const straightLength = distance * 0.5;

  // Calculate the curve strength (adjust as needed)
  const curveStrength = distance * 0.1;

  let controlPoint1, controlPoint2;

  if (isHorizontal) {
    // Horizontal edge
    controlPoint1 = {
      x: start.x + Math.sign(dx) * straightLength,
      y: start.y,
    };
    controlPoint2 = {
      x: end.x - Math.sign(dx) * straightLength,
      y: end.y + Math.sign(dy) * curveStrength,
    };
  } else {
    // Vertical edge
    controlPoint1 = {
      x: start.x,
      y: start.y + Math.sign(dy) * straightLength,
    };
    controlPoint2 = {
      x: end.x + Math.sign(dx) * curveStrength,
      y: end.y - Math.sign(dy) * straightLength,
    };
  }

  return [controlPoint1, controlPoint2];
};

export const calculateBezierPoint = (t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point => {
  const oneMinusT = 1 - t;

  return {
    x:
      Math.pow(oneMinusT, 3) * p0.x +
      3 * Math.pow(oneMinusT, 2) * t * p1.x +
      3 * oneMinusT * Math.pow(t, 2) * p2.x +
      Math.pow(t, 3) * p3.x,
    y:
      Math.pow(oneMinusT, 3) * p0.y +
      3 * Math.pow(oneMinusT, 2) * t * p1.y +
      3 * oneMinusT * Math.pow(t, 2) * p2.y +
      Math.pow(t, 3) * p3.y,
  };
};

export function penPointsToPathLayer(points: number[][], color: Color): PathLayer {
  if (points.length < 2) {
    throw new Error("Cannot transform points with less than 2 points");
  }

  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    const [x, y] = point;

    if (left > x) {
      left = x;
    }

    if (top > y) {
      top = y;
    }

    if (right < x) {
      right = x;
    }

    if (bottom < y) {
      bottom = y;
    }
  }

  return {
    type: LayerType.Path,
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    fill: color,
    points: points.map(([x, y, pressure]) => [x - left, y - top, pressure]),
  };
}

export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];

      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"],
  );

  d.push("Z");
  return d.join(" ");
}

export function calculateNewLayerPositions(
  currentLayer: Layer,
  position: HandlePosition,
  LAYER_SPACING: number,
  HANDLE_DISTANCE: number,
  endPoint?: Point,
) {
  let newLayerPosition: Point;
  let newEdgePosition: Point;

  if (endPoint) {
    newLayerPosition = endPoint;
    newEdgePosition = endPoint;

    return { newLayerPosition, newEdgePosition };
  }

  switch (position) {
    case HandlePosition.Left:
      newLayerPosition = { x: currentLayer.x - currentLayer.width - LAYER_SPACING, y: currentLayer.y };
      newEdgePosition = {
        x: currentLayer.x - currentLayer.width / 2 - HANDLE_DISTANCE,
        y: currentLayer.y + currentLayer.height / 2,
      };
      break;
    case HandlePosition.Top:
      newLayerPosition = { x: currentLayer.x, y: currentLayer.y - currentLayer.height - LAYER_SPACING };
      newEdgePosition = {
        x: currentLayer.x + currentLayer.width / 2,
        y: currentLayer.y - currentLayer.height - HANDLE_DISTANCE,
      };
      break;
    case HandlePosition.Right:
      newLayerPosition = { x: currentLayer.x + currentLayer.width + LAYER_SPACING, y: currentLayer.y };
      newEdgePosition = {
        x: currentLayer.x + currentLayer.width * 1.5 + HANDLE_DISTANCE,
        y: currentLayer.y + currentLayer.height / 2,
      };
      break;
    case HandlePosition.Bottom:
      newLayerPosition = { x: currentLayer.x, y: currentLayer.y + currentLayer.height + LAYER_SPACING };
      newEdgePosition = {
        x: currentLayer.x + currentLayer.width / 2,
        y: currentLayer.y + currentLayer.height * 2 + HANDLE_DISTANCE,
      };
      break;
    default:
      throw new Error("Invalid position");
  }

  return { newLayerPosition, newEdgePosition };
}
