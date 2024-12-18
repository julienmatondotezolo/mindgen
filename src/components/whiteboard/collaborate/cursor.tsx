"use client";

import { MousePointer2 } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import { useSocket } from "@/hooks";
import { cameraStateAtom } from "@/state";
import { connectionIdToColor } from "@/utils";

interface ConnectedUser {
  id: string; // Assuming IDs are strings, adjust if necessary
  username: string;
}

interface CursorProps {
  user: ConnectedUser;
  connectionId: number;
}

export const Cursor = memo(({ user, connectionId }: CursorProps) => {
  const { socketListen } = useSocket();
  const camera = useRecoilValue(cameraStateAtom);

  const info = user.username;

  const [cursor, setCursor] = useState(null);

  useEffect(() => {
    socketListen("remote-cursor-move", (data) => {
      let { userId, cursor } = data;

      if (userId === user.id) {
        setCursor(cursor);
      }
    });
  }, [cursor, socketListen, user.id]);

  const name = info || "Viewer";

  if (!cursor) return null;

  const { x, y } = cursor;

  const initialHeight = 50;
  const initialWidth = name.length * 10 + 24;

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
        {name}
      </div>
    </foreignObject>
  );
});

Cursor.displayName = "Cursor";
