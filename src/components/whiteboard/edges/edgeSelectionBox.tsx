/* eslint-disable no-unused-vars */
import React from "react";
import { useRecoilValue } from "recoil";

import { CanvasMode, Edge, Point } from "@/_types";
import { canvasStateAtom } from "@/state";
import { calculateBezierPoint, calculateControlPoints, colorToCss } from "@/utils";

interface EdgeSelectionBoxProps {
  edge: Edge;
  onHandlePointerDown: (position: "start" | "middle" | "end", point: Point) => void;
}

export const EdgeSelectionBox: React.FC<EdgeSelectionBoxProps> = ({ edge, onHandlePointerDown }) => {
  const canvasState = useRecoilValue(canvasStateAtom);

  if (!edge || (canvasState.mode !== CanvasMode.EdgeActive && canvasState.mode !== CanvasMode.EdgeEditing)) return;

  const circleSize = 5;
  const circleBorderColor = "#4d6aff";
  const circleFillColor = "#FFFFFF";
  const circleStrokeWidth = 2;

  // const middlePoint = {
  //   x: (edge.start.x + edge.end.x) / 2,
  //   y: (edge.start.y + edge.end.y) / 2,
  // };

  const [controlPoint1, controlPoint2] =
    edge.controlPoint1 && edge.controlPoint2
      ? [edge.controlPoint1, edge.controlPoint2]
      : calculateControlPoints(edge.start, edge.end, edge.handleStart);

  // Calculate the middle point using the Bezier curve formula
  const middlePoint = calculateBezierPoint(0.5, edge.start, controlPoint1, controlPoint2, edge.end);

  const pathString = `M${edge.start.x} ${edge.start.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${edge.end.x} ${edge.end.y}`;

  return (
    <g>
      <path d={pathString} fill="transparent" strokeWidth={20} stroke="#4d6aff" style={{ opacity: 0.05 }} />
      <circle
        cx={edge.start.x}
        cy={edge.start.y}
        r={circleSize}
        fill={circleFillColor}
        stroke={circleBorderColor}
        strokeWidth={circleStrokeWidth}
        onPointerDown={(e: React.PointerEvent) => {
          e.stopPropagation();
          onHandlePointerDown("start", { x: edge.start.x, y: edge.start.y });
        }}
        style={{ cursor: "move" }}
      />
      <circle
        cx={middlePoint.x}
        cy={middlePoint.y}
        r={circleSize}
        fill={circleFillColor}
        stroke={circleBorderColor}
        strokeWidth={circleStrokeWidth}
        onPointerDown={(e: React.PointerEvent) => {
          e.stopPropagation();
          onHandlePointerDown("middle", middlePoint);
        }}
        style={{ cursor: "move" }}
      />
      <circle
        cx={edge.end.x}
        cy={edge.end.y}
        r={circleSize}
        fill={circleFillColor}
        stroke={circleBorderColor}
        strokeWidth={circleStrokeWidth}
        onPointerDown={(e: React.PointerEvent) => {
          e.stopPropagation();
          onHandlePointerDown("end", { x: edge.end.x, y: edge.end.y });
        }}
        style={{ cursor: "move" }}
      />
    </g>
  );
};
