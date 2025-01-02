"use client";

import { CursorPosition } from "@ably/spaces";
import { MousePointer2 } from "lucide-react";
import { memo } from "react";
import { useRecoilValue } from "recoil";

import { cameraStateAtom } from "@/state";
import { connectionIdToColor } from "@/utils";

interface CursorProps {
  username: string;
  connectionId: number;
  position: CursorPosition;
}

export const Cursor = memo(({ username, connectionId, position }: CursorProps) => {
  const camera = useRecoilValue(cameraStateAtom);

  if (!username) return null;

  const { x, y } = position;

  const initialHeight = 50;
  const initialWidth = username.length * 10 + 24;

  const height = Math.max(initialHeight, initialHeight / camera.scale);
  const width = Math.max(initialWidth, initialWidth / camera.scale);

  return (
    <foreignObject
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
      height={height}
      width={width}
      className="relative drop-shadow-md"
    >
      <MousePointer2
        className="h-5 w-5"
        style={{
          fill: connectionIdToColor(connectionId),
          color: connectionIdToColor(connectionId),
        }}
      />
      <div
        className="absolute left-5 px-1.5 py-0.5 rounded-md text-xs text-white font-semibold"
        style={{
          backgroundColor: connectionIdToColor(connectionId),
        }}
      >
        {username}
      </div>
    </foreignObject>
  );
});

Cursor.displayName = "Cursor";
