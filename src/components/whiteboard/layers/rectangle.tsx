/* eslint-disable no-unused-vars */
import { useTheme } from "next-themes";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { CanvasMode, RectangleLayer } from "@/_types";
import { boardIdState, canvasStateAtom, useUpdateElement } from "@/state";
import { colorToCss, fillRGBA, getContrastingTextColor } from "@/utils";

import LayerText from "./LayerText";

interface RectangleProps {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

const calculateDimensions = (text: string, currentWidth: number, currentHeight: number, textHeight?: number) => {
  // If we have a textHeight that's larger than current height, use that instead
  const newHeight = textHeight && textHeight > currentHeight ? textHeight : currentHeight;

  return {
    width: currentWidth,
    height: newHeight,
  };
};

const Rectangle = ({ id, layer, onPointerDown, selectionColor }: RectangleProps) => {
  const { theme } = useTheme();

  const { x, y, width, height, fill, value, borderWidth, borderType, borderColor } = layer;

  const canvasState = useRecoilValue(canvasStateAtom);

  const boardId = useRecoilValue(boardIdState);

  const updateLayer = useUpdateElement({ roomId: boardId });

  const handleContentChange = (newValue: string) => {
    updateLayer({
      id,
      updatedElementLayer: { value: newValue },
    });
  };

  const handleHeightChange = (textHeight: number) => {
    // Only update if the text height is actually different from current height
    if (textHeight > height) {
      const { width: newWidth, height: newHeight } = calculateDimensions("", width, height, textHeight);

      updateLayer({
        id,
        updatedElementLayer: { width: newWidth, height: newHeight },
      });
    }
  };

  const isEditable = canvasState.mode === CanvasMode.Typing && canvasState.selectedLayerId === id;

  const newBorderColor = borderColor
    ? colorToCss(borderColor)
    : theme === "dark"
      ? "rgb(180, 191, 204)"
      : "rgb(71, 85, 105)";

  const textColor = fill ? getContrastingTextColor(fill) : "#000";

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
        <LayerText
          id={id}
          value={value}
          textColor={textColor}
          onContentChange={handleContentChange}
          onHeightChange={handleHeightChange}
          isEditable={isEditable}
        />
      </foreignObject>
    </>
  );
};

export { Rectangle };
