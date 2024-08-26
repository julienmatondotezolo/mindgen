/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { useSession } from "next-auth/react";
import React, { memo } from "react";
import { useRecoilValue } from "recoil";

import { CanvasMode, HandlePosition, Point } from "@/_types";
import { useSelectionBounds } from "@/hooks";
import {
  activeLayersAtom,
  canvasStateAtom,
  hoveredLayerIdAtomState,
  isEdgeNearLayerAtom,
  nearestLayerAtom,
} from "@/state";

import { HandleButton } from "../HandleButton";

interface LayerHandlesProps {
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  onPointerUp: (layerId: String, position: HandlePosition) => void;
}

const HANDLE_WIDTH = 25;
const HANDLE_DISTANCE = 30;

export const LayerHandles = memo(({ onMouseEnter, onMouseLeave, onPointerDown, onPointerUp }: LayerHandlesProps) => {
  const session = useSession();
  const currentUserId = session.data?.session?.user?.id;

  const allActiveLayers = useRecoilValue(activeLayersAtom);

  const activeLayerIDs = allActiveLayers
    .filter((userActiveLayer) => userActiveLayer.userId === currentUserId)
    .map((item) => item.layerIds)[0];

  const soleLayerId = activeLayerIDs?.length === 1 ? activeLayerIDs[0] : null;

  const isEdgeNearLayer = useRecoilValue(isEdgeNearLayerAtom);
  const nearestLayer = useRecoilValue(nearestLayerAtom);
  const canvasState = useRecoilValue(canvasStateAtom);

  const bounds = useSelectionBounds();

  if (!bounds) return null;

  const isShowingHandles = soleLayerId || isEdgeNearLayer;

  if (!isShowingHandles) return null;

  const handleLayerId = soleLayerId || (nearestLayer ? nearestLayer.id : null);

  const isEdgeEditing = canvasState.mode === CanvasMode.EdgeEditing || canvasState.mode === CanvasMode.EdgeDrawing;

  const handleStyle = {
    cursor: "pointer",
    width: `${HANDLE_WIDTH}px`,
    height: `${HANDLE_WIDTH}px`,
    fill: isEdgeEditing ? "#4d6aff" : "#FFFFFF00",
    fillOpacity: isEdgeEditing ? 0.3 : 1,
  };

  const handeStrokeClass = isEdgeEditing
    ? "stroke-4 stroke-blue-500"
    : "stroke-4 stroke-primary-color dark:stroke-slate-600";

  return (
    <>
      {/* TOP */}
      <circle
        className={handeStrokeClass}
        cx={bounds.x + bounds.width / 2}
        cy={bounds.y - HANDLE_DISTANCE}
        r={HANDLE_WIDTH / 2}
        style={handleStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={(e) => onPointerDown(e, handleLayerId!)}
        onPointerUp={() => onPointerUp(handleLayerId!, HandlePosition.Top)}
      />
      {/* RIGHT */}
      <circle
        className={handeStrokeClass}
        cx={bounds.x + bounds.width + HANDLE_DISTANCE}
        cy={bounds.y + bounds.height / 2}
        r={HANDLE_WIDTH / 2}
        style={handleStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={(e) => onPointerDown(e, handleLayerId!)}
        onPointerUp={() => onPointerUp(handleLayerId!, HandlePosition.Right)}
      />
      {/* BOTTOM */}
      <circle
        className={handeStrokeClass}
        cx={bounds.x + bounds.width / 2}
        cy={bounds.y + bounds.height + HANDLE_DISTANCE}
        r={HANDLE_WIDTH / 2}
        style={handleStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={(e) => onPointerDown(e, handleLayerId!)}
        onPointerUp={() => onPointerUp(handleLayerId!, HandlePosition.Bottom)}
      />
      {/* LEFT */}
      <circle
        className={handeStrokeClass}
        cx={bounds.x - HANDLE_DISTANCE}
        cy={bounds.y + bounds.height / 2}
        r={HANDLE_WIDTH / 2}
        style={handleStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={(e) => onPointerDown(e, handleLayerId!)}
        onPointerUp={() => onPointerUp(handleLayerId!, HandlePosition.Left)}
      />
    </>
  );
});

LayerHandles.displayName = "SelectionBox";
