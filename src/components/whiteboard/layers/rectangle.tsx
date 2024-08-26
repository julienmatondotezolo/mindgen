/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { useTheme } from "next-themes";
import { useRecoilValue } from "recoil";

import { Color, RectangleLayer } from "@/_types";
import { boardIdState, useUpdateElement } from "@/state";
import { getContrastingTextColor } from "@/utils";

import { CustomContentEditable } from "./customContentEditable";

interface RectangleProps {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.2;
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

  const updateLayer = useUpdateElement({ roomId: boardId });

  const handleContentChange = (newValue: string) => {
    updateLayer(id, { value: newValue });
  };

  return (
    <>
      <foreignObject
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
