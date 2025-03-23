import { Point } from "framer-motion";
import { nanoid } from "nanoid";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { useRecoilState } from "recoil";

import { CanvasState, Edge, EdgeShape, EdgeType, HandlePosition } from "@/_types";
import { edgesAtomState } from "@/state";
import {
  edgeSmoothStepPathString,
  getControlWithCurvature,
  getHandleEndPosition,
  lineSegmentFallback,
} from "@/utils/edgeUtils";

export const useEdgeOperations = () => {
  const [edges, setEdges] = useRecoilState(edgesAtomState);
  const { theme } = useTheme();

  const isPointOnCurvedEdge = useCallback(
    ({ point, edge, proximityThreshold }: { point: Point; edge: Edge; proximityThreshold?: number }) => {
      const sourcePosition = edge.handleStart || HandlePosition.Top;
      const targetPosition = edge.handleEnd || HandlePosition.Top;
      const curvature = 0.5;
      const threshold = proximityThreshold ?? edge.thickness * 3; // Detection threshold based on edge thickness

      // Get control points for the bezier curve
      const [sourceControlX, sourceControlY] = getControlWithCurvature({
        pos: sourcePosition,
        x1: edge.start.x,
        y1: edge.start.y,
        x2: edge.end.x,
        y2: edge.end.y,
        c: curvature,
      });

      const [targetControlX, targetControlY] = getControlWithCurvature({
        pos: targetPosition,
        x1: edge.end.x,
        y1: edge.end.y,
        x2: edge.start.x,
        y2: edge.start.y,
        c: curvature,
      });

      // Sample points along the bezier curve to check distance
      const numSamples = 20;

      for (let i = 0; i <= numSamples; i++) {
        const t = i / numSamples;

        // Calculate point on the bezier curve using the cubic bezier formula
        const bezierX =
          Math.pow(1 - t, 3) * edge.start.x +
          3 * Math.pow(1 - t, 2) * t * sourceControlX +
          3 * (1 - t) * Math.pow(t, 2) * targetControlX +
          Math.pow(t, 3) * edge.end.x;

        const bezierY =
          Math.pow(1 - t, 3) * edge.start.y +
          3 * Math.pow(1 - t, 2) * t * sourceControlY +
          3 * (1 - t) * Math.pow(t, 2) * targetControlY +
          Math.pow(t, 3) * edge.end.y;

        // Calculate distance from point to this sample point on the curve
        const distance = Math.sqrt(Math.pow(point.x - bezierX, 2) + Math.pow(point.y - bezierY, 2));

        // If the point is close enough to any sample point, return true
        if (distance <= threshold) {
          return true;
        }
      }

      return false;
    },
    [],
  );

  const isPointOnSmoothStepEdge = useCallback(
    ({ point, edge, proximityThreshold }: { point: Point; edge: Edge; proximityThreshold?: number }) => {
      const threshold = proximityThreshold ?? edge.thickness * 3; // Detection threshold based on edge thickness

      // For smooth step edges, we'll use a sampling approach similar to the curved edge
      // Create a temporary SVG path to sample points from the smooth step path
      if (typeof document !== "undefined") {
        try {
          const pathString = edgeSmoothStepPathString({ edge });
          const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

          tempPath.setAttribute("d", pathString);

          // Sample points along the path
          const pathLength = tempPath.getTotalLength();
          const numSamples = Math.max(20, pathLength / 10); // At least 20 samples, or more for longer paths

          for (let i = 0; i <= numSamples; i++) {
            const distance = (i / numSamples) * pathLength;
            const pathPoint = tempPath.getPointAtLength(distance);

            // Check distance to this sample point
            const distToPoint = Math.sqrt(Math.pow(point.x - pathPoint.x, 2) + Math.pow(point.y - pathPoint.y, 2));

            if (distToPoint <= threshold) {
              return true;
            }
          }
        } catch (e) {
          // Fallback if SVG method fails
          return lineSegmentFallback({ edge, point, threshold });
        }
      } else {
        // Server-side rendering or no document available
        return lineSegmentFallback({ edge, point, threshold });
      }

      return false;
    },
    [],
  );

  // Check if point is edge
  const isPointOnEdge = useCallback(
    ({ point, edge, proximityThreshold }: { point: Point; edge: Edge; proximityThreshold?: number }) => {
      switch (edge.shape) {
        case EdgeShape.Curved:
          return isPointOnCurvedEdge({ point, edge, proximityThreshold });
        case EdgeShape.SmoothStep:
          return isPointOnSmoothStepEdge({ point, edge, proximityThreshold });
      }
    },
    [isPointOnCurvedEdge, isPointOnSmoothStepEdge],
  );

  // Find edge under a point
  const findEdgeAtPoint = useCallback(
    (point: Point): Edge | undefined => edges.find((edge) => isPointOnEdge({ point, edge })),
    [edges, isPointOnEdge],
  );

  // Find edge near a point
  const findEdgeNearPoint = useCallback(
    (point: Point): Edge | undefined =>
      edges.find((edge) => isPointOnEdge({ point, edge, proximityThreshold: 25 + edge.thickness })),
    [edges, isPointOnEdge],
  );

  // Add a new layer
  const addEdge = useCallback(
    ({
      canvasState,
      newEdgePosition,
      toLayerId,
    }: {
      canvasState: CanvasState;
      newEdgePosition: Point;
      toLayerId: string;
    }) => {
      // Set the color of the shadow edge
      const edgeColor = theme === "dark" ? { r: 180, g: 191, b: 204, a: 0.5 } : { r: 71, g: 85, b: 105, a: 0.5 };

      // Create a new edge
      const newEdge: Edge = {
        id: nanoid(),
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        fromLayerId: canvasState.handleInfo?.layerId,
        toLayerId,
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        start: canvasState.origin,
        end: newEdgePosition,
        color: edgeColor,
        hoverColor: { r: 77, g: 106, b: 255 },
        thickness: 2,
        orientation: "auto",
        type: EdgeType.Solid,
        label: "",
        shape: EdgeShape.Curved,
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        handleStart: canvasState.handleInfo?.handlePosition,
        handleEnd:
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          canvasState.handleInfo &&
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          getHandleEndPosition({ handleStartPosition: canvasState.handleInfo?.handlePosition }),
      };

      setEdges((prev) => [...prev, newEdge]);

      return newEdge.id;
    },
    [setEdges, theme],
  );

  return {
    findEdgeAtPoint,
    findEdgeNearPoint,
    edges,
    setEdges,
    addEdge,
  };
};
