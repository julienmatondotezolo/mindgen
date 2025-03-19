import { Edge, HandlePosition, Point } from "@/_types";

// EDGE TYPES
export type GetControlWithCurvatureParams = {
  pos: HandlePosition;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c: number;
};

// ============================================================================= //
// ======================== EDGE STEP PATH STRING ============================ //
// ============================================================================= //

const handleDirections = {
  [HandlePosition.Left]: { x: -1, y: 0 },
  [HandlePosition.Right]: { x: 1, y: 0 },
  [HandlePosition.Top]: { x: 0, y: -1 },
  [HandlePosition.Bottom]: { x: 0, y: 1 },
};

const getDirection = ({
  source,
  sourcePosition,
  target,
}: {
  source: Point;
  sourcePosition: HandlePosition | undefined;
  target: Point;
}): Point => {
  if (sourcePosition === HandlePosition.Left || sourcePosition === HandlePosition.Right) {
    return source.x < target.x ? { x: 1, y: 0 } : { x: -1, y: 0 };
  }
  return source.y < target.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
};

// ith this function we try to mimic a orthogonal edge routing behaviour
// It's not as good as a real orthogonal edge routing but it's faster and good enough as a default for step and smooth step edges
function getPoints({
  edge,
  source,
  sourcePosition,
  target,
  targetPosition,
  center,
  offset,
}: {
  edge: Edge;
  source: Point;
  sourcePosition: HandlePosition | undefined;
  target: Point;
  targetPosition: HandlePosition | undefined;
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

const distance = (a: Point, b: Point) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

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
  const sourcePosition = edge.handleStart;
  const targetX = edge.end.x;
  const targetY = edge.end.y;
  const targetPosition = edge.handleEnd;
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

// ============================================================================= //
// ======================= EDGE BEZIER PATH STRING ============================= //
// ============================================================================= //

function calculateControlOffset(distance: number, curvature: number): number {
  if (distance >= 0) {
    return 0.5 * distance;
  }

  return curvature * 25 * Math.sqrt(-distance);
}

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
