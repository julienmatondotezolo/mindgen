/* eslint-disable no-unused-vars */

import { useTheme } from "next-themes";
import React from "react";
import { useRecoilValue } from "recoil";

import { CanvasMode, Color, DiamondLayer } from "@/_types";
import { boardIdState, canvasStateAtom, useUpdateElement } from "@/state";
import { colorToCss, fillRGBA, getContrastingTextColor } from "@/utils";

import LayerText from "./LayerText";

interface DiamondProps {
  id: string;
  layer: DiamondLayer;
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

const Diamond = ({ id, layer, onPointerDown, selectionColor }: DiamondProps) => {
  const { theme } = useTheme();

  const { x, y, width, height, fill, value, valueStyle, borderColor, borderWidth, borderType } = layer;

  // Set a reasonable height for the text area (50% of diamond height)
  const safeAreaHeight = height * 0.5;

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
    // Only update if the text height is actually significantly different from the foreignObject height
    // Add a buffer (e.g., 10px) to prevent frequent updates for small changes
    if (textHeight > safeAreaHeight + 10) {
      // Calculate how much taller the diamond needs to be to accommodate the text
      // Since foreignObject is 50% of the diamond height, we need to multiply by 2
      const requiredDiamondHeight = textHeight * 2;

      // Only update if the required height is significantly different from current height
      if (Math.abs(requiredDiamondHeight - height) > 20) {
        updateLayer({
          id,
          updatedElementLayer: { height: requiredDiamondHeight },
        });
      }
    }
  };

  const isEditable = canvasState.mode === CanvasMode.Typing && canvasState.selectedLayerId === id;

  const newBorderColor = borderColor
    ? colorToCss(borderColor)
    : theme === "dark"
      ? "rgb(180, 191, 204)"
      : "rgb(71, 85, 105)";

  const textColor = fill ? getContrastingTextColor(fill) : "#000";

  // Calculate the center of the shape
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Define the points for the diamond shape
  const diamondPoints = [
    [centerX, y], // top point
    [x + width, centerY], // right point
    [centerX, y + height], // bottom point
    [x, centerY], // left point
  ];

  // Convert points array to SVG points format (x,y x,y ...)
  const pointsString = diamondPoints.map((point) => `${point[0]},${point[1]}`).join(" ");

  return (
    <g onPointerDown={(e) => onPointerDown(e, id)}>
      {/* Diamond shape as polygon */}
      <polygon
        points={pointsString}
        fill={fill ? fillRGBA(fill as Color, theme) : "none"}
        stroke={newBorderColor}
        strokeWidth={borderWidth || 2}
        strokeDasharray={borderType === "DASHED" ? "8 4" : undefined}
        strokeLinejoin="round" // This gives a subtle rounding effect at corners
      />
      {value && (
        <foreignObject
          x={centerX - width * 0.25} // Center the object and make it 50% of the width
          y={centerY - height * 0.25} // Center vertically and give some room
          width={width * 0.5} // 50% of the diamond's width
          height={safeAreaHeight} // Set a reasonable height
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
      )}
      {selectionColor && (
        <polygon
          points={pointsString}
          fill="none"
          stroke={selectionColor}
          strokeWidth={borderWidth ? borderWidth + 2 : 4}
          pointerEvents="none"
          strokeLinejoin="round"
        />
      )}
    </g>
  );
};

export { Diamond };
