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

const calculateDimensions = (text: string, currentWidth: number, currentHeight: number) => ({
  width: currentWidth,
  height: currentHeight,
});

const Rectangle = ({ id, layer, onPointerDown, selectionColor }: RectangleProps) => {
  const { theme } = useTheme();

  const { x, y, width, height, fill, value, valueStyle, borderWidth, borderType, borderColor } = layer;

  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);

  const boardId = useRecoilValue(boardIdState);

  const updateLayer = useUpdateElement({ roomId: boardId });

  const handleContentChange = (newValue: string) => {
    const { width: newWidth, height: newHeight } = calculateDimensions(newValue, width, height);

    updateLayer({
      id,
      updatedElementLayer: { value: newValue, width: newWidth, height: newHeight },
    });
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
          isEditable={isEditable}
        />
      </foreignObject>
    </>
  );
};

export { Rectangle };
