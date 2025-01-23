"use client";

import { CursorPosition } from "@ably/spaces";
import { MousePointer2 } from "lucide-react";
import { memo } from "react";

interface CursorProps {
  username: string;
  userColor: string;
  position: CursorPosition;
}

export const Cursor = memo(({ username, userColor, position }: CursorProps) => {
  if (!username) return null;

  const { x, y } = position;

  const initialHeight = 50;
  const initialWidth = username.length * 10 + 24;

  const height = Math.max(initialHeight, initialHeight / 2);
  const width = Math.max(initialWidth, initialWidth / 2);

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
          fill: userColor,
          color: userColor,
        }}
      />
      <div
        className="absolute left-5 px-1.5 py-0.5 rounded-md text-xs text-white font-semibold"
        style={{
          backgroundColor: userColor,
        }}
      >
        {username}
      </div>
    </foreignObject>
  );
});

Cursor.displayName = "Cursor";
