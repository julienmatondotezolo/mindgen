import { MousePointer2 } from "lucide-react";

import { connectionIdToColor } from "@/utils";

function ManualCursor({
  x,
  y,
  name,
  connectionId,
  duration,
}: {
  x: number;
  y: number;
  name: string;
  connectionId: number;
  duration?: number;
}) {
  return (
    <div
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
      className={`${
        name == "You" ? "" : `transition-all duration-${duration}00 ease-in-out`
      } drop-shadow-md absolute top-0 left-0`}
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
    </div>
  );
}

export { ManualCursor };
