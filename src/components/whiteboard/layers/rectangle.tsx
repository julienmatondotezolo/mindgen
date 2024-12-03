/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRecoilValue } from "recoil";

import { Color, RectangleLayer } from "@/_types";
import { boardIdState, cameraStateAtom, useUpdateElement } from "@/state";
import { colorToCss, fillRGBA, getContrastingTextColor } from "@/utils";

import { CustomContentEditable } from "./customContentEditable";

interface RectangleProps {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

const calculateDimensions = (text: string, currentWidth: number, currentHeight: number, scale: number) => {
  const tempDiv = document.createElement("div");
  // const padding = 40; // Padding for the content
  const minWidth = 200; // Minimum width
  const minHeight = 60; // Minimum height

  tempDiv.style.position = "absolute";
  tempDiv.style.visibility = "hidden";
  tempDiv.style.wordBreak = "break-word";
  // tempDiv.style.padding = `${padding / 2}px`;
  tempDiv.style.fontSize = `${calculateFontSize(currentWidth, currentHeight, scale, text)}px`;
  tempDiv.innerText = text;
  document.body.appendChild(tempDiv);

  // Calculate new dimensions based on content
  const contentWidth = tempDiv.scrollWidth;
  const newWidth = Math.max(minWidth, contentWidth);

  // const contentHeight = (tempDiv.scrollWidth * 60) / 100;
  const newHeight = Math.max(minHeight, (newWidth * 30) / 100);

  document.body.removeChild(tempDiv);

  return {
    width: Math.max(minWidth, contentWidth),
    height: newHeight,
    // height: Math.max(minHeight, contentHeight),
  };
};

const calculateFontSize = (width: number, height: number, scale: number, text: string) => {
  const maxFontSize = 96;
  const scaleFactor = 0.2;
  // Add dampening factor to make scaling more subtle
  // (0.25 means scale has 25% of its original effect)
  const dampedScale = 1 + (1 - scale) * 0.2;

  const fontSizeBasedOnHeight = height * scaleFactor * dampedScale;
  const fontSizeBasedOnWidth = width * scaleFactor * dampedScale;

  return Math.min(36, fontSizeBasedOnHeight, fontSizeBasedOnWidth);
};

const Rectangle = ({ id, layer, onPointerDown, selectionColor }: RectangleProps) => {
  const session = useSession();
  const currentUserId = session.data?.session?.user?.id;

  const { theme } = useTheme();

  const { x, y, width, height, fill, value, valueStyle, borderWidth, borderType, borderColor } = layer;

  const boardId = useRecoilValue(boardIdState);
  const camera = useRecoilValue(cameraStateAtom);

  const updateLayer = useUpdateElement({ roomId: boardId });

  const handleContentChange = (newValue: string) => {
    const { width: newWidth, height: newHeight } = calculateDimensions(newValue, width, height, camera.scale);

    updateLayer({
      id,
      userId: currentUserId,
      updatedElementLayer: { value: newValue, width: newWidth, height: newHeight },
    });
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
            fontSize: calculateFontSize(width, height, camera.scale, value || ""),
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
