/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { PlusCircle } from "lucide-react";
import React, { memo } from "react";
import { useRecoilValue } from "recoil";

import { HandlePosition, Side, XYWH } from "@/_types";
import { useSelectionBounds } from "@/hooks";
import { activeLayersAtom, hoveredLayerIdAtomState } from "@/state";

import { HandleButton } from "../HandleButton";

interface LayerHandlesProps {
  onHandleClick: (layerId: String, position: HandlePosition) => void;
}

const HANDLE_WIDTH = 20;
const HANDLE_DISTANCE = 30;

export const LayerHandles = memo(({ onHandleClick }: LayerHandlesProps) => {
  const setHoveredLayerID = useRecoilValue(hoveredLayerIdAtomState);

  const bounds = useSelectionBounds();

  if (!bounds) return null;

  return (
    <>
      <rect
        className="fill-white stroke-1 stroke-blue-500"
        x={0}
        y={0}
        style={{
          cursor: "pointer",
          width: `${HANDLE_WIDTH}px`,
          height: `${HANDLE_WIDTH}px`,
          transform: `translate(
                ${bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2}px, 
                   ${bounds.y - HANDLE_WIDTH / 2 - HANDLE_DISTANCE}px)`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onHandleClick(setHoveredLayerID, HandlePosition.Top);
        }}
      />
      <rect
        className="fill-white stroke-1 stroke-blue-500"
        x={0}
        y={0}
        style={{
          cursor: "pointer",
          width: `${HANDLE_WIDTH}px`,
          height: `${HANDLE_WIDTH}px`,
          transform: `translate(
                    ${bounds.x - HANDLE_WIDTH / 2 + bounds.width + HANDLE_DISTANCE}px, 
                    ${bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2}px
                )`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onHandleClick(setHoveredLayerID, HandlePosition.Right);
        }}
      />
      <rect
        className="fill-white stroke-1 stroke-blue-500"
        x={0}
        y={0}
        style={{
          cursor: "pointer",
          width: `${HANDLE_WIDTH}px`,
          height: `${HANDLE_WIDTH}px`,
          transform: `translate(
                    ${bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2}px, 
                    ${bounds.y + bounds.height - HANDLE_WIDTH / 2 + HANDLE_DISTANCE}px
                )`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onHandleClick(setHoveredLayerID, HandlePosition.Bottom);
        }}
      />
      <rect
        className="fill-white stroke-1 stroke-blue-500"
        x={0}
        y={0}
        style={{
          cursor: "pointer",
          width: `${HANDLE_WIDTH}px`,
          height: `${HANDLE_WIDTH}px`,
          transform: `translate(
                    ${bounds.x - HANDLE_WIDTH / 2 - HANDLE_DISTANCE}px, 
                    ${bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2}px
                )`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onHandleClick(setHoveredLayerID, HandlePosition.Left);
        }}
      />
    </>
  );
});

LayerHandles.displayName = "SelectionBox";