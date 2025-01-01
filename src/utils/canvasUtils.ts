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

  return `#${color?.r?.toString(16).padStart(2, "0")}${color?.g?.toString(16).padStart(2, "0")}${color?.b
    ?.toString(16)
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
      return inversed ? "0" : "45";
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

const handleDirections = {
  [HandlePosition.Left]: { x: -1, y: 0 },
  [HandlePosition.Right]: { x: 1, y: 0 },
  [HandlePosition.Top]: { x: 0, y: -1 },
  [HandlePosition.Bottom]: { x: 0, y: 1 },
};

const getDirection = ({
  source,
  sourcePosition = HandlePosition.Bottom,
  target,
}: {
  source: Point;
  sourcePosition: HandlePosition;
  target: Point;
}): Point => {
  if (sourcePosition === HandlePosition.Left || sourcePosition === HandlePosition.Right) {
    return source.x < target.x ? { x: 1, y: 0 } : { x: -1, y: 0 };
  }
  return source.y < target.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
};

const distance = (a: Point, b: Point) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

// ith this function we try to mimic a orthogonal edge routing behaviour
// It's not as good as a real orthogonal edge routing but it's faster and good enough as a default for step and smooth step edges
function getPoints({
  edge,
  source,
  sourcePosition = HandlePosition.Bottom,
  target,
  targetPosition = HandlePosition.Top,
  center,
  offset,
}: {
  edge: Edge;
  source: Point;
  sourcePosition: HandlePosition;
  target: Point;
  targetPosition: HandlePosition;
  center: Partial<Point>;
  offset: number;
}): [Point[], number, number, number, number] {
  const sourceDir = handleDirections[sourcePosition];
  const targetDir = handleDirections[targetPosition];
  const sourceGapped: Point = { x: source.x + sourceDir.x * offset, y: source.y + sourceDir.y * offset };
  const targetGapped: Point = { x: target.x + targetDir.x * offset, y: target.y + targetDir.y * offset };
  const dir = getDirection({
    source: sourceGapped,
    sourcePosition,
    target: targetGapped,
  });
  const dirAccessor = dir.x !== 0 ? "x" : "y";
  const currDir = dir[dirAccessor];

  let points: Point[] = [];
  let centerX, centerY;
  const sourceGapOffset = { x: 0, y: 0 };
  const targetGapOffset = { x: 0, y: 0 };

  const [defaultCenterX, defaultCenterY, defaultOffsetX, defaultOffsetY] = getEdgeCenter({
    edge,
  });

  // opposite handle positions, default case
  if (sourceDir[dirAccessor] * targetDir[dirAccessor] === -1) {
    centerX = center.x ?? defaultCenterX;
    centerY = center.y ?? defaultCenterY;
    //    --->
    //    |
    // >---
    const verticalSplit: Point[] = [
      { x: centerX, y: sourceGapped.y },
      { x: centerX, y: targetGapped.y },
    ];
    //    |
    //  ---
    //  |
    const horizontalSplit: Point[] = [
      { x: sourceGapped.x, y: centerY },
      { x: targetGapped.x, y: centerY },
    ];

    if (sourceDir[dirAccessor] === currDir) {
      points = dirAccessor === "x" ? verticalSplit : horizontalSplit;
    } else {
      points = dirAccessor === "x" ? horizontalSplit : verticalSplit;
    }
  } else {
    // sourceTarget means we take x from source and y from target, targetSource is the opposite
    const sourceTarget: Point[] = [{ x: sourceGapped.x, y: targetGapped.y }];
    const targetSource: Point[] = [{ x: targetGapped.x, y: sourceGapped.y }];
    // this handles edges with same handle positions

    if (dirAccessor === "x") {
      points = sourceDir.x === currDir ? targetSource : sourceTarget;
    } else {
      points = sourceDir.y === currDir ? sourceTarget : targetSource;
    }

    if (sourcePosition === targetPosition) {
      const diff = Math.abs(source[dirAccessor] - target[dirAccessor]);

      // if an edge goes from right to right for example (sourcePosition === targetPosition) and the distance between source.x and target.x is less than the offset, the added point and the gapped source/target will overlap. This leads to a weird edge path. To avoid this we add a gapOffset to the source/target
      if (diff <= offset) {
        const gapOffset = Math.min(offset - 1, offset - diff);

        if (sourceDir[dirAccessor] === currDir) {
          sourceGapOffset[dirAccessor] = (sourceGapped[dirAccessor] > source[dirAccessor] ? -1 : 1) * gapOffset;
        } else {
          targetGapOffset[dirAccessor] = (targetGapped[dirAccessor] > target[dirAccessor] ? -1 : 1) * gapOffset;
        }
      }
    }

    // these are conditions for handling mixed handle positions like Right -> Bottom for example
    if (sourcePosition !== targetPosition) {
      const dirAccessorOpposite = dirAccessor === "x" ? "y" : "x";
      const isSameDir = sourceDir[dirAccessor] === targetDir[dirAccessorOpposite];
      const sourceGtTargetOppo = sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
      const sourceLtTargetOppo = sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
      const flipSourceTarget =
        (sourceDir[dirAccessor] === 1 && ((!isSameDir && sourceGtTargetOppo) || (isSameDir && sourceLtTargetOppo))) ||
        (sourceDir[dirAccessor] !== 1 && ((!isSameDir && sourceLtTargetOppo) || (isSameDir && sourceGtTargetOppo)));

      if (flipSourceTarget) {
        points = dirAccessor === "x" ? sourceTarget : targetSource;
      }
    }

    const sourceGapPoint = { x: sourceGapped.x + sourceGapOffset.x, y: sourceGapped.y + sourceGapOffset.y };
    const targetGapPoint = { x: targetGapped.x + targetGapOffset.x, y: targetGapped.y + targetGapOffset.y };
    const maxXDistance = Math.max(Math.abs(sourceGapPoint.x - points[0].x), Math.abs(targetGapPoint.x - points[0].x));
    const maxYDistance = Math.max(Math.abs(sourceGapPoint.y - points[0].y), Math.abs(targetGapPoint.y - points[0].y));

    // we want to place the label on the longest segment of the edge
    if (maxXDistance >= maxYDistance) {
      centerX = (sourceGapPoint.x + targetGapPoint.x) / 2;
      centerY = points[0].y;
    } else {
      centerX = points[0].x;
      centerY = (sourceGapPoint.y + targetGapPoint.y) / 2;
    }
  }

  const pathPoints = [
    source,
    { x: sourceGapped.x + sourceGapOffset.x, y: sourceGapped.y + sourceGapOffset.y },
    ...points,
    { x: targetGapped.x + targetGapOffset.x, y: targetGapped.y + targetGapOffset.y },
    target,
  ];

  return [pathPoints, centerX, centerY, defaultOffsetX, defaultOffsetY];
}

function getBend(a: Point, b: Point, c: Point, size: number): string {
  const bendSize = Math.min(distance(a, b) / 2, distance(b, c) / 2, size);
  const { x, y } = b;

  // no bend
  if ((a.x === x && x === c.x) || (a.y === y && y === c.y)) {
    return `L${x} ${y}`;
  }

  // first segment is horizontal
  if (a.y === y) {
    const xDir = a.x < c.x ? -1 : 1;
    const yDir = a.y < c.y ? 1 : -1;

    return `L ${x + bendSize * xDir},${y}Q ${x},${y} ${x},${y + bendSize * yDir}`;
  }

  const xDir = a.x < c.x ? 1 : -1;
  const yDir = a.y < c.y ? -1 : 1;

  return `L ${x},${y + bendSize * yDir}Q ${x},${y} ${x + bendSize * xDir},${y}`;
}

export function getEdgeCenter({ edge }: { edge: Edge }): [number, number, number, number] {
  const sourceX = edge.start.x;
  const sourceY = edge.start.y;

  const targetX = edge.end.x;
  const targetY = edge.end.y;

  const xOffset = Math.abs(targetX - sourceX) / 2;
  const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

  const yOffset = Math.abs(targetY - sourceY) / 2;
  const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

  return [centerX, centerY, xOffset, yOffset];
}

export function edgeSmoothStepPathString({ edge }: { edge: Edge }): string {
  const sourceX = edge.start.x;
  const sourceY = edge.start.y;
  const sourcePosition = HandlePosition.Bottom;
  const targetX = edge.end.x;
  const targetY = edge.end.y;
  const targetPosition = HandlePosition.Top;
  const borderRadius = 5;
  const [centerX, centerY] = getEdgeCenter({ edge });
  const offset = 20;

  const [points] = getPoints({
    edge,
    source: { x: sourceX, y: sourceY },
    sourcePosition,
    target: { x: targetX, y: targetY },
    targetPosition,
    center: { x: centerX, y: centerY },
    offset,
  });

  const path = points.reduce<string>((res, p, i) => {
    let segment = "";

    if (i > 0 && i < points.length - 1) {
      segment = getBend(points[i - 1], p, points[i + 1], borderRadius);
    } else {
      segment = `${i === 0 ? "M" : "L"}${p.x} ${p.y}`;
    }

    res += segment;

    return res;
  }, "");

  return path;
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

export function calculateNonOverlappingLayerPosition({
  currentLayer,
  position,
  layers,
  LAYER_SPACING,
  HANDLE_DISTANCE,
  endPoint,
}: {
  currentLayer: Layer;
  position: HandlePosition;
  layers: Layer[];
  LAYER_SPACING: number;
  HANDLE_DISTANCE: number;
  endPoint?: Point;
}): { newLayerPosition: Point; newEdgePosition: Point } {
  const OVERLAP_THRESHOLD = 1; // Minimum distance between layers
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
        throw new Error("[calculateNonOverlappingLayerPosition] Invalid position");
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

  // Adjust position to avoid overlap
  let adjustedPosition = { ...newLayerPosition };
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

  // Update newEdgePosition to connect to the adjustedPosition
  switch (position) {
    case HandlePosition.Left:
      newEdgePosition = {
        x: adjustedPosition.x + currentLayer.width + HANDLE_DISTANCE,
        y: adjustedPosition.y + currentLayer.height / 2,
      };
      break;
    case HandlePosition.Right:
      newEdgePosition = { x: adjustedPosition.x - HANDLE_DISTANCE, y: adjustedPosition.y + currentLayer.height / 2 };
      break;
    case HandlePosition.Top:
      newEdgePosition = {
        x: adjustedPosition.x + currentLayer.width / 2,
        y: adjustedPosition.y + currentLayer.height + HANDLE_DISTANCE,
      };
      break;
    case HandlePosition.Bottom:
      newEdgePosition = { x: adjustedPosition.x + currentLayer.width / 2, y: adjustedPosition.y - HANDLE_DISTANCE };
      break;
  }

  return { newLayerPosition: adjustedPosition, newEdgePosition };
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
