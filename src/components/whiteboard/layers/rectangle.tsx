/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRecoilValue } from "recoil";

import { Color, RectangleLayer } from "@/_types";
import { boardIdState, useUpdateElement } from "@/state";
import { colorToCss, fillRGBA, getContrastingTextColor } from "@/utils";

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

const Rectangle = ({ id, layer, onPointerDown, selectionColor }: RectangleProps) => {
  const session = useSession();
  const currentUserId = session.data?.session?.user?.id;

  const { theme } = useTheme();

  const { x, y, width, height, fill, value, valueStyle, borderWidth, borderType, borderColor } = layer;

  const boardId = useRecoilValue(boardIdState);

  const updateLayer = useUpdateElement({ roomId: boardId });

  const handleContentChange = (newValue: string) => {
    updateLayer({ id, userId: currentUserId, updatedElementLayer: { value: newValue } });
  };

  const newBorderColor = borderColor
    ? colorToCss(borderColor)
    : theme === "dark"
      ? "rgb(180, 191, 204)"
      : "rgb(71, 85, 105)";

  return (
    <>
      <foreignObject
        className={`relative shadow-md drop-shadow-xl`}
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{
          transform: `translate(${x}px, ${y}px)`,
          outline: selectionColor ? `3px solid ${selectionColor}` : "none",
          backgroundColor: fillRGBA(fill, theme),
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          // borderColor: theme === "dark" ? "#b4bfcc" : "#475569",
          borderColor: newBorderColor,
          borderWidth: borderWidth ? borderWidth : 2,
          borderStyle: borderType ? borderType : "solid",
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
            fontWeight: valueStyle?.fontWeight,
            textTransform: valueStyle?.textTransform,
            wordBreak: "break-word",
            outline: "none",
          }}
        />
      </foreignObject>
    </>
  );
};

export { Rectangle };
