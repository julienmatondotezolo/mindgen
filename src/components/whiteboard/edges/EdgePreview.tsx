/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { useSession } from "next-auth/react";
import React, { memo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { CanvasMode, Edge, EdgeType, HandlePosition } from "@/_types";
import { activeEdgeIdAtom, canvasStateAtom, hoveredEdgeIdAtom } from "@/state";
import { colorToCss, edgeBezierPathString, edgeSmoothStepPathString } from "@/utils";

interface EdgePreviewProps {
  edge: Edge;
  onEdgePointerDown: (e: React.PointerEvent, edgId: string) => void;
  ARROW_SIZE: number;
  selectionColor: string;
}

export const EdgePreview = memo(({ edge, onEdgePointerDown, selectionColor, ARROW_SIZE }: EdgePreviewProps) => {
  const session: any = useSession();
  const currentUserId = session.data?.session?.user?.id;
  
  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);
  const [hoveredEdgeId, setHoveredEdgeId] = useRecoilState(hoveredEdgeIdAtom);
  const allActiveEdges: any = useRecoilValue(activeEdgeIdAtom);
  const activeEdgeId = allActiveEdges
    .filter((userActiveEdge: any) => userActiveEdge.userId === currentUserId)
    .map((item: any) => item.edgeIds)[0];


  if (!edge) return null;

  const isActive = edge.id === hoveredEdgeId || edge.id === activeEdgeId?.includes(edge.id);

  const pathString = edgeSmoothStepPathString({ edge });

  return (
    <g>
      {selectionColor && <path
        d={pathString}
        stroke={selectionColor}
        strokeWidth={6}
        // strokeDasharray={edge.type === EdgeType.Dashed ? "5,5" : "none"}
        // markerEnd={`url(#arrowhead-${edge.id})`}
        // markerStart={`url(#arrowheadstart-${edge.id})`}
        fill="transparent"
      />}
      <path
        d={pathString}
        stroke={colorToCss(isActive ? edge.hoverColor : edge.color)}
        strokeWidth={edge.thickness}
        strokeDasharray={edge.type === EdgeType.Dashed ? "5,5" : "none"}
        markerEnd={`url(#arrowhead-${edge.id})`}
        markerStart={`url(#arrowheadstart-${edge.id})`}
        fill="transparent"
      >
        {edge.type === EdgeType.Dashed && (
          <animate attributeName="stroke-dashoffset" values="10;0" dur="0.5s" repeatCount="indefinite" />
        )}
      </path>
      <circle
        cx={edge.start.x}
        cy={edge.start.y}
        r={1 + edge.thickness} // Adjust the radius as needed
        fill={colorToCss(isActive ? edge.hoverColor : edge.color)}
      />
      <circle
        cx={edge.end.x}
        cy={edge.end.y}
        r={1 + edge.thickness} // Adjust the radius as needed
        fill={colorToCss(isActive ? edge.hoverColor : edge.color)}
      />
      <path
        d={pathString}
        stroke="transparent"
        strokeWidth={40}
        fill="transparent"
        onMouseEnter={() => {
          if (
            canvasState.mode === CanvasMode.Grab ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.EdgeEditing ||
            canvasState.mode === CanvasMode.EdgeDrawing ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.Inserting ||
            activeEdgeId?.includes(edge.id)
          )
            return;
          setHoveredEdgeId(edge.id), setCanvasState({ mode: CanvasMode.EdgeActive });
        }}
        onMouseLeave={() => {
          if (
            canvasState.mode === CanvasMode.Grab ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.EdgeEditing ||
            canvasState.mode === CanvasMode.EdgeDrawing ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.Inserting ||
            activeEdgeId?.includes(edge.id)
          )
            return;
          setHoveredEdgeId(null), setCanvasState({ mode: CanvasMode.None });
        }}
        onPointerDown={(e) => onEdgePointerDown(e, edge.id)}
        // style={{ cursor: "pointer" }}
      />
      {edge.arrowEnd && (
        <marker
          key={`arrow-${edge.id}`}
          id={`arrowhead-${edge.id}`}
          markerWidth={ARROW_SIZE}
          markerHeight={ARROW_SIZE}
          refX={ARROW_SIZE / 4}
          refY={ARROW_SIZE / 2}
          orient={edge.orientation}
        >
          <polygon
            points={`0 0, ${ARROW_SIZE} ${ARROW_SIZE / 2}, 0 ${ARROW_SIZE}`}
            fill={colorToCss(isActive ? edge.hoverColor : edge.color)}
          />
        </marker>
      )}
      {edge.arrowStart && (
        <marker
          key={`arrowheadstart-${edge.id}`}
          id={`arrowheadstart-${edge.id}`}
          markerWidth={ARROW_SIZE}
          markerHeight={ARROW_SIZE}
          refX={ARROW_SIZE / 4}
          refY={ARROW_SIZE / 2}
          orient={parseInt(edge.orientation) * 2}
        >
          <polygon
            points={`0 0, ${ARROW_SIZE} ${ARROW_SIZE / 2}, 0 ${ARROW_SIZE}`}
            fill={colorToCss(isActive ? edge.hoverColor : edge.color)}
          />
        </marker>
      )}
    </g>
  );
});
