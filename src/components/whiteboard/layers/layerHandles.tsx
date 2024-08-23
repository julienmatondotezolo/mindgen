/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { useSession } from "next-auth/react";
import React, { memo } from "react";
import { useRecoilValue } from "recoil";

import { HandlePosition, Point } from "@/_types";
import { useSelectionBounds } from "@/hooks";
import { activeLayersAtom, hoveredLayerIdAtomState, isEdgeNearLayerAtom, nearestLayerAtom } from "@/state";

import { HandleButton } from "../HandleButton";

interface LayerHandlesProps {
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  onPointerUp: (layerId: String, position: HandlePosition) => void;
}

const HANDLE_WIDTH = 20;
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

  const bounds = useSelectionBounds();

  if (!bounds) return null;

  const isShowingHandles = soleLayerId || isEdgeNearLayer;

  if (!isShowingHandles) return null;

  const handleLayerId = soleLayerId || (nearestLayer ? nearestLayer.id : null);

  return (
    <>
      {/* TOP */}
      <rect
        className="fill-white stroke-1 stroke-blue-500"
        x={0}
        y={0}
        style={{
          width: `${HANDLE_WIDTH}px`,
          height: `${HANDLE_WIDTH}px`,
          transform: `translate(
                ${bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2}px, 
                   ${bounds.y - HANDLE_WIDTH / 2 - HANDLE_DISTANCE}px)`,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={(e) => onPointerDown(e, handleLayerId!)}
        onPointerUp={() => onPointerUp(handleLayerId!, HandlePosition.Top)}
      />
      {/* RIGHT */}
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
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={(e) => onPointerDown(e, handleLayerId!)}
        onPointerUp={() => onPointerUp(handleLayerId!, HandlePosition.Right)}
      />
      {/* BOTTOM */}
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
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={(e) => onPointerDown(e, handleLayerId!)}
        onPointerUp={() => onPointerUp(handleLayerId!, HandlePosition.Bottom)}
      />
      {/* LEFT */}
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
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={(e) => onPointerDown(e, handleLayerId!)}
        onPointerUp={() => onPointerUp(handleLayerId!, HandlePosition.Left)}
      />
    </>
  );
});

LayerHandles.displayName = "SelectionBox";
