/* eslint-disable no-unused-vars */

import { useLocks, useMembers } from "@ably/spaces/react";
import { useSession } from "next-auth/react";
import React, { memo, useState } from "react";
import { useRecoilValue } from "recoil";

import { Side, XYWH } from "@/_types";
import { useSelectionBounds } from "@/hooks";
import { activeLayersAtom, cameraStateAtom } from "@/state";

interface SelectionBoxProps {
  onResizeHandlePointerDown: (corner: Side, initialBounds: XYWH) => void;
}

export const SelectionBox = memo(({ onResizeHandlePointerDown }: SelectionBoxProps) => {
  const session = useSession();
  const currentUserId = session.data?.session?.user?.id;

  const [isLocked, setIsLocked] = useState(false);
  const camera = useRecoilValue(cameraStateAtom);

  const { self } = useMembers();

  useLocks((lockUpdate) => {
    const lockHolder = lockUpdate.member;
    const locked = lockUpdate.status === "locked";
    const lockedByYou = locked && lockHolder.connectionId === self?.connectionId;

    setIsLocked(lockedByYou);
  });

  const allActiveLayers = useRecoilValue(activeLayersAtom);

  const activeLayerIDs = allActiveLayers
    .filter((userActiveLayer: any) => userActiveLayer.userId === currentUserId)
    .map((item: any) => item.layerIds)[0];

  const soleLayerId = activeLayerIDs?.length === 1 ? activeLayerIDs[0] : null;

  const isShowingHandles = isLocked;

  const bounds = useSelectionBounds();

  if (!bounds) return null;

  const MIN_HANDLE_WIDTH = 8;

  const HANDLE_WIDTH = Math.max(MIN_HANDLE_WIDTH, MIN_HANDLE_WIDTH / camera.scale);

  return (
    <>
      <rect
        className="fill-transparent stroke-primary-color stroke-2 pointer-events-none"
        style={{
          transform: `translate(${bounds.x}px, ${bounds.y}px)`,
        }}
        x={0}
        y={0}
        width={bounds.width}
        height={bounds.height}
      />
      {isShowingHandles && (
        <>
          <rect
            className="fill-white stroke-2 stroke-primary-color"
            x={0}
            y={0}
            style={{
              cursor: "nwse-resize",
              width: `${HANDLE_WIDTH}px`,
              height: `${HANDLE_WIDTH}px`,
              transform: `translate(
                    ${bounds.x - HANDLE_WIDTH / 2}px, 
                    ${bounds.y - HANDLE_WIDTH / 2}px)`,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Top + Side.Left, bounds);
            }}
          />
          {/* TOP */}
          <rect
            className="fill-white stroke-2 stroke-primary-color"
            x={0}
            y={0}
            style={{
              cursor: "ns-resize",
              width: `${HANDLE_WIDTH}px`,
              height: `${HANDLE_WIDTH}px`,
              transform: `translate(
                ${bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2}px, 
                   ${bounds.y - HANDLE_WIDTH / 2}px)`,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Top, bounds);
            }}
          />
          <rect
            className="fill-white stroke-2 stroke-primary-color"
            x={0}
            y={0}
            style={{
              cursor: "nesw-resize",
              width: `${HANDLE_WIDTH}px`,
              height: `${HANDLE_WIDTH}px`,
              transform: `translate(
                    ${bounds.x - HANDLE_WIDTH / 2 + bounds.width}px, 
                    ${bounds.y - HANDLE_WIDTH / 2}px)`,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Top + Side.Right, bounds);
            }}
          />
          {/* RIGHT */}
          <rect
            className="fill-white stroke-2 stroke-primary-color"
            x={0}
            y={0}
            style={{
              cursor: "ew-resize",
              width: `${HANDLE_WIDTH}px`,
              height: `${HANDLE_WIDTH}px`,
              transform: `translate(
                    ${bounds.x - HANDLE_WIDTH / 2 + bounds.width}px, 
                    ${bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2}px
                )`,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Right, bounds);
            }}
          />
          <rect
            className="fill-white stroke-2 stroke-primary-color"
            x={0}
            y={0}
            style={{
              cursor: "nwse-resize",
              width: `${HANDLE_WIDTH}px`,
              height: `${HANDLE_WIDTH}px`,
              transform: `translate(
                    ${bounds.x - HANDLE_WIDTH / 2 + bounds.width}px, 
                    ${bounds.y + bounds.height - HANDLE_WIDTH / 2}px
                )`,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Bottom + Side.Right, bounds);
            }}
          />
          {/* BOTTOM */}
          <rect
            className="fill-white stroke-2 stroke-primary-color"
            x={0}
            y={0}
            style={{
              cursor: "ns-resize",
              width: `${HANDLE_WIDTH}px`,
              height: `${HANDLE_WIDTH}px`,
              transform: `translate(
                    ${bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2}px, 
                    ${bounds.y + bounds.height - HANDLE_WIDTH / 2}px
                )`,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Bottom, bounds);
            }}
          />
          <rect
            className="fill-white stroke-2 stroke-primary-color"
            x={0}
            y={0}
            style={{
              cursor: "nesw-resize",
              width: `${HANDLE_WIDTH}px`,
              height: `${HANDLE_WIDTH}px`,
              transform: `translate(
                    ${bounds.x - HANDLE_WIDTH / 2}px, 
                    ${bounds.y + bounds.height - HANDLE_WIDTH / 2}px
                )`,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Bottom + Side.Left, bounds);
            }}
          />
          {/* LEFT */}
          <rect
            className="fill-white stroke-2 stroke-primary-color"
            x={0}
            y={0}
            style={{
              cursor: "ew-resize",
              width: `${HANDLE_WIDTH}px`,
              height: `${HANDLE_WIDTH}px`,
              transform: `translate(
                    ${bounds.x - HANDLE_WIDTH / 2}px, 
                    ${bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2}px
                )`,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Left, bounds);
            }}
          />
        </>
      )}
    </>
  );
});

SelectionBox.displayName = "SelectionBox";
