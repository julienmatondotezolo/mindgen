import React from "react";

import { HandlePosition, Point } from "@/_types";
import { calculateControlPoints, getOrientationFromPosition } from "@/utils";

interface ShadowEdgeProps {
  start: Point | null;
  end: Point;
  fromPosition: HandlePosition | undefined;
}

export const ShadowEdge: React.FC<ShadowEdgeProps> = ({ start, end, fromPosition }) => {
  if (!start) return;

  const [controlPoint1, controlPoint2] = calculateControlPoints(start, end, fromPosition);
  const pathString = `M${start.x} ${start.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${end.x} ${end.y}`;

  const ARROW_SIZE = 5;

  if (!fromPosition) {
    return null;
  }

  return (
    <g>
      <path
        d={pathString}
        stroke="#b4bfcc"
        strokeWidth={2}
        strokeDasharray="5,5"
        markerEnd="url(#arrowhead-1)"
        fill="transparent"
        opacity={0.5}
      >
        <animate attributeName="stroke-dashoffset" values="10;0" dur="0.5s" repeatCount="indefinite" />
      </path>
      <circle
        cx={start.x}
        cy={start.y}
        r={3} // Adjust the radius as needed
        fill="#b4bfcc"
      />
      <marker
        id="arrowhead-1"
        markerWidth={ARROW_SIZE}
        markerHeight={ARROW_SIZE}
        refX={ARROW_SIZE / 4}
        refY={ARROW_SIZE / 2}
        orient={getOrientationFromPosition(fromPosition)}
      >
        <polygon points={`0 0, ${ARROW_SIZE} ${ARROW_SIZE / 2}, 0 ${ARROW_SIZE}`} fill="#b4bfcc" />
      </marker>
    </g>
  );
};
