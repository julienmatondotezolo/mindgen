/* eslint-disable no-unused-vars */
import React from "react";
import { useRecoilValue } from "recoil";

import { CanvasMode, Edge, EdgeShape, Point } from "@/_types";
import { activeEdgeIdAtom, cameraStateAtom, canvasStateAtom, edgesAtomState } from "@/state";
import { edgeBezierPathString, edgeSmoothStepPathString } from "@/utils";

interface EdgeSelectionBoxProps {
  onHandlePointerDown: (position: "START" | "MIDDLE" | "END", point: Point) => void;
}

export const EdgeSelectionBox: React.FC<EdgeSelectionBoxProps> = ({ onHandlePointerDown }) => {
  const camera = useRecoilValue(cameraStateAtom);

  const allActiveEdges = useRecoilValue(edgesAtomState);
  const allActiveEdgeIds = useRecoilValue(activeEdgeIdAtom);
  const edgeId = allActiveEdgeIds ? allActiveEdgeIds[0] : null;
  const canvasState = useRecoilValue(canvasStateAtom);

  if (
    (canvasState.mode !== CanvasMode.EdgeSelected &&
      canvasState.mode !== CanvasMode.EdgeActive &&
      canvasState.mode !== CanvasMode.EdgeEditing &&
      canvasState.mode !== CanvasMode.None &&
      canvasState.mode !== CanvasMode.Tooling) ||
    !edgeId
  )
    return;

  const edge: Edge | undefined = allActiveEdges.find((edge: Edge) => edge.id === edgeId);

  if (!edge) return;

  const circleSize = Math.max(5, 5 / camera.scale);

  const circleBorderColor = "#4d6aff";
  const circleFillColor = "#FFFFFF";
  const circleStrokeWidth = Math.max(3, 3 / camera.scale);

  // const middlePoint = {
  //   x: (edge.start.x + edge.end.x) / 2,
  //   y: (edge.start.y + edge.end.y) / 2,
  // };

  let pathString = edgeBezierPathString({ edge });

  // Check for bezier our smooth step edge type
  if (edge.shape === EdgeShape.SmoothStep) {
    pathString = edgeSmoothStepPathString({ edge });
  } else {
    pathString = edgeBezierPathString({ edge });
  }

  return (
    <g>
      <path d={pathString} fill="transparent" strokeWidth={20} stroke="#4d6aff" style={{ opacity: 0.05 }} />
      <path d={pathString} fill="transparent" strokeWidth={0.8} stroke="#4d6aff" />
      <circle
        cx={edge.start.x}
        cy={edge.start.y}
        r={circleSize}
        fill={circleFillColor}
        stroke={circleBorderColor}
        strokeWidth={circleStrokeWidth}
        onPointerDown={(e: React.PointerEvent) => {
          e.stopPropagation();
          onHandlePointerDown("START", { x: edge.start.x, y: edge.start.y });
        }}
        style={{ cursor: "move" }}
      />
      {/* <circle
        cx={middlePoint.x}
        cy={middlePoint.y}
        r={circleSize}
        fill={circleFillColor}
        stroke={circleBorderColor}
        strokeWidth={circleStrokeWidth}
        onPointerDown={(e: React.PointerEvent) => {
          e.stopPropagation();
          onHandlePointerDown("MIDDLE", middlePoint);
        }}
        style={{ cursor: "move" }}
      /> */}
      <circle
        cx={edge.end.x}
        cy={edge.end.y}
        r={circleSize}
        fill={circleFillColor}
        stroke={circleBorderColor}
        strokeWidth={circleStrokeWidth}
        onPointerDown={(e: React.PointerEvent) => {
          e.stopPropagation();
          onHandlePointerDown("END", { x: edge.end.x, y: edge.end.y });
        }}
        style={{ cursor: "move" }}
      />
    </g>
  );
};
