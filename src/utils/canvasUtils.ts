import { type ClassValue, clsx } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

import {
  Camera,
  Color,
  Edge,
  EdgeOrientation,
  HandlePosition,
  Layer,
  LayerType,
  PathLayer,
  Point,
  Side,
  XYWH,
} from "@/_types/canvas";

const COLORS = [
  "#2563EB",
  "#FF5733",
  "#33CC33",
  "#7C3AED",
  "#FF66CC",
  "#5470A0FF",
  "#059669",
  "#F59E0B",
  "#00BFFF",
  "#8F0A1A",
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper functions to validate objects
export const isValidLayer = (layer: any): boolean =>
  layer.type === "RECTANGLE" &&
  layer.id &&
  typeof layer.x === "number" &&
  typeof layer.y === "number" &&
  typeof layer.height === "number" &&
  typeof layer.width === "number" &&
  layer.fill &&
  typeof layer.value === "string";

export const isValidEdge = (edge: any): boolean =>
  edge.id &&
  typeof edge.arrowStart === "boolean" &&
  typeof edge.arrowEnd === "boolean" &&
  edge.handleStart &&
  edge.handleEnd &&
  edge.fromLayerId &&
  edge.toLayerId &&
  edge.start &&
  edge.end &&
  edge.controlPoint1 &&
  edge.controlPoint2;

export const getLayerById = ({ layerId, layers }: { layerId: string; layers: Layer[] }): Layer =>
  layers.filter((layer: Layer) => layer.id == layerId)[0];

export const connectionIdToColor = (connectionId: number) => COLORS[connectionId % COLORS.length];

export const pointerEventToCanvasPoint = (e: React.PointerEvent, camera: Camera, svgElement: SVGSVGElement | null) => {
  if (!svgElement) return { x: 0, y: 0 };

  const svgRect = svgElement.getBoundingClientRect();

  return {
    x: (e.clientX - svgRect.left - camera.x) / camera.scale,
    y: (e.clientY - svgRect.top - camera.y) / camera.scale,
  };
};

export function colorToCss(color: Color) {
  if (!color) return "#33373b";

  return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b
    .toString(16)
    .padStart(2, "0")}`;
}

export const fillRGBA = (fill: Color, theme: string | undefined) => {
  if (!fill) return "rgba(0, 0, 0, 0.5)";
  const { r, g, b } = fill;

  const opacity = theme === "dark" ? 0.7 : 1.0;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

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
  const OVERLAP_THRESHOLD = 1; // Minimum distance between layers
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

  if (layers.length === 0) return null;

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

function calculateControlOffset(distance: number, curvature: number): number {
  if (distance >= 0) {
    return 0.5 * distance;
  }

  return curvature * 25 * Math.sqrt(-distance);
}

export type GetControlWithCurvatureParams = {
  pos: HandlePosition;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c: number;
};

export function getControlWithCurvature({ pos, x1, y1, x2, y2, c }: GetControlWithCurvatureParams): [number, number] {
  switch (pos) {
    case HandlePosition.Left:
      return [x1 - calculateControlOffset(x1 - x2, c), y1];
    case HandlePosition.Right:
      return [x1 + calculateControlOffset(x2 - x1, c), y1];
    case HandlePosition.Top:
      return [x1, y1 - calculateControlOffset(y1 - y2, c)];
    case HandlePosition.Bottom:
      return [x1, y1 + calculateControlOffset(y2 - y1, c)];
  }
}

export function edgeBezierPathString({ edge }: { edge: Edge }): string {
  const sourceX = edge.start.x;
  const sourceY = edge.start.y;
  const sourcePosition: HandlePosition = edge.handleStart || HandlePosition.Top;
  const targetPosition: HandlePosition = edge.handleEnd || HandlePosition.Top;
  const targetX = edge.end.x;
  const targetY = edge.end.y;
  const curvature = 0.5;

  const [sourceControlX, sourceControlY] = getControlWithCurvature({
    pos: sourcePosition,
    x1: sourceX,
    y1: sourceY,
    x2: targetX,
    y2: targetY,
    c: curvature,
  });

  const [targetControlX, targetControlY] = getControlWithCurvature({
    pos: targetPosition,
    x1: targetX,
    y1: targetY,
    x2: sourceX,
    y2: sourceY,
    c: curvature,
  });

  const pathString = `
  M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`;

  return pathString;
}

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

export function isEdgeCloseToLayer(edge: Edge, layer: Layer, threshold: number): boolean {
  const edgeStart = edge.start;
  const edgeEnd = edge.end;
  const HANDLE_DISTANCE = 30;

  const layerHandles = [
    { x: layer.x + layer.width / 2, y: layer.y - HANDLE_DISTANCE },
    { x: layer.x + layer.width + HANDLE_DISTANCE, y: layer.y + layer.height / 2 },
    { x: layer.x + layer.width / 2, y: layer.y + layer.height + HANDLE_DISTANCE },
    { x: layer.x - HANDLE_DISTANCE, y: layer.y + layer.height / 2 },
  ];

  for (const handle of layerHandles) {
    const distanceStart = Math.sqrt(Math.pow(edgeStart.x - handle.x, 2) + Math.pow(edgeStart.y - handle.y, 2));
    const distanceEnd = Math.sqrt(Math.pow(edgeEnd.x - handle.x, 2) + Math.pow(edgeEnd.y - handle.y, 2));

    if (distanceStart <= threshold || distanceEnd <= threshold) {
      return true;
    }
  }

  return false;
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
    switch (position) {
      case HandlePosition.Left:
        newLayerPosition = { x: endPoint.x - currentLayer.width, y: endPoint.y - currentLayer.height / 2 };
        newEdgePosition = { x: endPoint.x + HANDLE_DISTANCE, y: endPoint.y };
        break;
      case HandlePosition.Right:
        newLayerPosition = { x: endPoint.x, y: endPoint.y - currentLayer.height / 2 };
        newEdgePosition = { x: endPoint.x - HANDLE_DISTANCE, y: endPoint.y };
        break;
      case HandlePosition.Top:
        newLayerPosition = { x: endPoint.x - currentLayer.width / 2, y: endPoint.y - currentLayer.height };
        newEdgePosition = { x: endPoint.x, y: endPoint.y + HANDLE_DISTANCE };
        break;
      case HandlePosition.Bottom:
        newLayerPosition = { x: endPoint.x - currentLayer.width / 2, y: endPoint.y };
        newEdgePosition = { x: endPoint.x, y: endPoint.y - HANDLE_DISTANCE };
        break;
      default:
        throw new Error("[calculateNewLayerPositions] Invalid position");
    }
  } else {
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
          y: newLayerPosition.y + currentLayer.height + HANDLE_DISTANCE,
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
          y: newLayerPosition.y - HANDLE_DISTANCE,
        };
        break;
      default:
        throw new Error("Invalid position");
    }
  }

  return { newLayerPosition, newEdgePosition };
}

// Helper function to get handle position
export const getHandlePosition = (bounds: XYWH, handlePosition: HandlePosition | undefined): Point => {
  const HANDLE_DISTANCE = 30;

  switch (handlePosition) {
    case HandlePosition.Top:
      return { x: bounds.x + bounds.width / 2, y: bounds.y - HANDLE_DISTANCE };
    case HandlePosition.Right:
      return { x: bounds.x + bounds.width + HANDLE_DISTANCE, y: bounds.y + bounds.height / 2 };
    case HandlePosition.Bottom:
      return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height + HANDLE_DISTANCE };
    case HandlePosition.Left:
      return { x: bounds.x - HANDLE_DISTANCE, y: bounds.y + bounds.height / 2 };
    default:
      return { x: bounds.x, y: bounds.y };
  }
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
    id: "sjdhbjbdtUITTY",
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

//
export function generateMermaidFlowchart(edges: Edge[], layers: Layer[]): string {
  const nodes = layers.map((layer) => `${layer.id}[${layer.value}]`).join("\n    ");
  const connections = edges.map((edge) => `${edge.fromLayerId} --> ${edge.toLayerId}`).join("\n    ");

  return `flowchart TD\n    ${nodes}\n    ${connections}`;
}
