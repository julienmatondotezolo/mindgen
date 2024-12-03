import { MousePointer2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { globalCursorState } from "@/state";
import { connectionIdToColor } from "@/utils";

const GlobalCursor = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useRecoilState(globalCursorState);

  useEffect(() => {
    // Toggle cursor style based on cursorVisible state
    // document.body.style.cursor = cursorVisible ? "none" : "auto";

    const handleMouseMove = (event: MouseEvent) => {
      setCursorPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursorVisible, setCursorVisible]);

  if (cursorVisible === false) return <></>;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        position: "fixed",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <MousePointer2
          className="h-5 w-5"
          style={{
            fill: connectionIdToColor(4),
            color: connectionIdToColor(4),
          }}
        />
        <div
          className="absolute left-5 px-1.5 py-0.5 rounded-md text-xs text-white font-semibold"
          style={{
            backgroundColor: connectionIdToColor(4),
          }}
        >
          You
        </div>
      </div>
    </div>
  );
};

export { GlobalCursor };
