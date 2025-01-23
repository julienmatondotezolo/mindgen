/* eslint-disable no-unused-vars */
import { Plus } from "lucide-react";
import { useTheme } from "next-themes";
import React, { memo } from "react";
import { useRecoilValue } from "recoil";

import { CanvasMode, HandlePosition } from "@/_types";
import { useSelectionBounds } from "@/hooks";
import { activeLayersAtom, canvasStateAtom, isEdgeNearLayerAtom, nearestLayerAtom } from "@/state";

interface LayerHandlesProps {
  onMouseEnter: (e: React.MouseEvent, layerId: string, position: HandlePosition) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  onPointerDown: (e: React.PointerEvent, layerId: string, position: HandlePosition) => void;
  onPointerUp: (layerId: String, position: HandlePosition) => void;
}

const HANDLE_WIDTH = 25;
const HANDLE_DISTANCE = 30;
const ICON_SIZE = 40;

export const LayerHandles = memo(({ onMouseEnter, onMouseLeave, onPointerDown, onPointerUp }: LayerHandlesProps) => {
  const allActiveLayers = useRecoilValue(activeLayersAtom);

  const { theme } = useTheme();

  const soleLayerId = allActiveLayers?.length === 1 ? allActiveLayers[0] : null;

  const isEdgeNearLayer = useRecoilValue(isEdgeNearLayerAtom);
  const nearestLayer = useRecoilValue(nearestLayerAtom);
  const canvasState = useRecoilValue(canvasStateAtom);

  const bounds = useSelectionBounds();

  if (!bounds) return null;

  const isShowingHandles = soleLayerId || isEdgeNearLayer;

  if (!isShowingHandles || (allActiveLayers && allActiveLayers.length > 1) || canvasState.mode === CanvasMode.Typing)
    return null;

  const handleLayerId = soleLayerId || (nearestLayer ? nearestLayer.id : null);

  const isEdgeEditing = canvasState.mode === CanvasMode.EdgeEditing || canvasState.mode === CanvasMode.EdgeDrawing;

  const handeStrokeClass = isEdgeEditing
    ? "stroke-4 stroke-blue-500"
    : "stroke-4 stroke-primary-color dark:stroke-slate-600";

  const handleStyle = {
    cursor: "pointer",
    width: `${HANDLE_WIDTH}px`,
    height: `${HANDLE_WIDTH}px`,
    border: isEdgeEditing ? "1px solid #4d6aff" : "2px solid #b4bfcc",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: isEdgeEditing ? "rgba(77, 106, 255, 0.3)" : theme === "dark" ? "#0a1028" : "#f9fafb",
  };

  const handleStyleHover = "group hover:!border-primary-color hover:!bg-[#4d6aff4d]";

  const iconStyle = {
    stroke: isEdgeEditing ? "#4d6aff" : "#b4bfcc",
    strokeWidth: 2,
  };

  const iconStyleHover = "group-hover:!stroke-primary";

  return (
    <>
      {/* TOP */}
      <foreignObject
        className={handeStrokeClass}
        x={bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2}
        y={bounds.y - HANDLE_DISTANCE - HANDLE_WIDTH / 2}
        width={HANDLE_WIDTH}
        height={HANDLE_WIDTH}
        onMouseEnter={(e) => onMouseEnter(e, handleLayerId!, HandlePosition.Top)}
        onMouseLeave={onMouseLeave}
        onPointerDown={(e) => onPointerDown(e, handleLayerId!, HandlePosition.Top)}
        onPointerUp={() => onPointerUp(handleLayerId!, HandlePosition.Top)}
      >
        <div style={handleStyle} className={handleStyleHover}>
          <Plus size={ICON_SIZE * 0.6} style={iconStyle} className={iconStyleHover} />
        </div>
      </foreignObject>
      {/* RIGHT */}
      <foreignObject
        className={handeStrokeClass}
        x={bounds.x + bounds.width + HANDLE_DISTANCE - HANDLE_WIDTH / 2}
        y={bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2}
        width={HANDLE_WIDTH}
        height={HANDLE_WIDTH}
        onMouseEnter={(e) => onMouseEnter(e, handleLayerId!, HandlePosition.Right)}
        onMouseLeave={onMouseLeave}
        onPointerDown={(e) => onPointerDown(e, handleLayerId!, HandlePosition.Right)}
        onPointerUp={() => onPointerUp(handleLayerId!, HandlePosition.Right)}
      >
        <div style={handleStyle} className={handleStyleHover}>
          <Plus size={ICON_SIZE * 0.6} style={iconStyle} className={iconStyleHover} />
        </div>
      </foreignObject>
      {/* BOTTOM */}
      <foreignObject
        className={handeStrokeClass}
        x={bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2}
        y={bounds.y + bounds.height + HANDLE_DISTANCE - HANDLE_WIDTH / 2}
        width={HANDLE_WIDTH}
        height={HANDLE_WIDTH}
        onMouseEnter={(e) => onMouseEnter(e, handleLayerId!, HandlePosition.Bottom)}
        onMouseLeave={onMouseLeave}
        onPointerDown={(e) => onPointerDown(e, handleLayerId!, HandlePosition.Bottom)}
        onPointerUp={() => onPointerUp(handleLayerId!, HandlePosition.Bottom)}
      >
        <div style={handleStyle} className={handleStyleHover}>
          <Plus size={ICON_SIZE * 0.6} style={iconStyle} className={iconStyleHover} />
        </div>
      </foreignObject>
      {/* LEFT */}
      <foreignObject
        className={handeStrokeClass}
        x={bounds.x - HANDLE_DISTANCE - HANDLE_WIDTH / 2}
        y={bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2}
        width={HANDLE_WIDTH}
        height={HANDLE_WIDTH}
        onMouseEnter={(e) => onMouseEnter(e, handleLayerId!, HandlePosition.Left)}
        onMouseLeave={onMouseLeave}
        onPointerDown={(e) => onPointerDown(e, handleLayerId!, HandlePosition.Left)}
        onPointerUp={() => onPointerUp(handleLayerId!, HandlePosition.Left)}
      >
        <div style={handleStyle} className={handleStyleHover}>
          <Plus size={ICON_SIZE * 0.6} style={iconStyle} className={iconStyleHover} />
        </div>
      </foreignObject>
    </>
  );
});

LayerHandles.displayName = "SelectionBox";
