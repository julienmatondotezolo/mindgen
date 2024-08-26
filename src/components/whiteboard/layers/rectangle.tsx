/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { useRecoilState, useRecoilValue } from "recoil";

import { CanvasMode, Color, RectangleLayer } from "@/_types";
import { boardIdState, canvasStateAtom, useUpdateElement } from "@/state";
import { cn, getContrastingTextColor } from "@/utils";

import { CustomContentEditable } from "./customContentEditable";

interface RectangleProps {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.25;
  const fontSizeBasedOnHeight = height * scaleFactor;
  const fontSizeBasedOnWidth = width * scaleFactor;

  return Math.min(maxFontSize, fontSizeBasedOnHeight, fontSizeBasedOnWidth);
};

const fillRGBA = (fill: Color, theme: string | undefined) => {
  if (!fill) return "rgba(0, 0, 0, 0.5)";
  const { r, g, b } = fill;

  const opacity = theme === "dark" ? 0.7 : 1.0;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const Rectangle = ({ id, layer, onPointerDown, selectionColor }: RectangleProps) => {
  const { theme } = useTheme();

  const { x, y, width, height, fill, value } = layer;
  const boardId = useRecoilValue(boardIdState);

  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);

  const updateLayer = useUpdateElement({ roomId: boardId });

  const contentEditableRef = useRef<HTMLElement>(null);

  const handleContentChange = (newValue: string) => {
    updateLayer(id, { value: newValue });
  };

  useEffect(() => {
    if (contentEditableRef.current && canvasState.mode === CanvasMode.Typing) {
      const { scrollWidth, scrollHeight } = contentEditableRef.current;
      const padding = 20;
      const minWidth = 100;
      const minHeight = 40;

      let newWidth = Math.max(minWidth, scrollWidth + padding);
      let newHeight = Math.max(minHeight, scrollHeight + padding);

      if (scrollWidth + padding < width && newWidth < width) {
        newWidth = Math.max(minWidth, scrollWidth + padding);
      }

      if (newWidth !== width || newHeight !== height) {
        updateLayer(id, { width: newWidth, height: newHeight });
      }
    }
  }, [value, canvasState.mode, width, height, id, updateLayer]);

  return (
    <>
      <foreignObject
        // className="drop-shadow-md"
        className={`relative shadow-md drop-shadow-xl`}
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{
          transform: `translate(${x}px, ${y}px)`,
          outline: selectionColor ? `1px solid ${selectionColor}` : "none",
          backgroundColor: fillRGBA(fill, theme),
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          border: `3px solid ${theme === "dark" ? "#b4bfcc" : "#475569"}`,
          borderRadius: "30px",
          overflow: "hidden",
        }}
        x={0}
        y={0}
        width={width}
        height={height}
        strokeWidth={1}
        stroke={selectionColor || "transparent"}
      >
        <CustomContentEditable
          value={value || ""}
          onChange={handleContentChange}
          style={{
            width: "99%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            justifyItems: "center",
            textAlign: "center",
            color: fill ? getContrastingTextColor(fill) : "#000",
            fontSize: calculateFontSize(width, height),
            wordBreak: "break-word",
            outline: "none",
          }}
        />
      </foreignObject>
    </>
  );
};

export { Rectangle };
