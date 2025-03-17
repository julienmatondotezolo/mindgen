/* eslint-disable no-unused-vars */
import { useTheme } from "next-themes";
import React from "react";
import { useRecoilValue } from "recoil";

import { CanvasMode, Color, EllipseLayer } from "@/_types/canvas";
import { boardIdState, canvasStateAtom, useUpdateElement } from "@/state";
import { colorToCss, fillRGBA, getContrastingTextColor } from "@/utils";

import LayerText from "./LayerText";

interface EllipseProps {
  id: string;
  layer: EllipseLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

const Ellipse = ({ id, layer, onPointerDown, selectionColor }: EllipseProps) => {
  const { theme } = useTheme();

  const { x, y, width, height, fill, value, valueStyle, borderColor, borderWidth, borderType } = layer;

  // Set the height for the text area (80% of ellipse dimensions)
  const safeAreaWidth = width * 0.8;
  const safeAreaHeight = height * 0.8;

  const canvasState = useRecoilValue(canvasStateAtom);
  const boardId = useRecoilValue(boardIdState);

  const updateLayer = useUpdateElement({ roomId: boardId });

  const handleContentChange = (newValue: string) => {
    updateLayer({ id, updatedElementLayer: { value: newValue } });
  };

  const handleHeightChange = (textHeight: number) => {
    // Only update if the text height is significantly different from the foreignObject height
    // Add a buffer to prevent frequent updates for small changes
    if (textHeight > safeAreaHeight + 10) {
      // Calculate how much taller the ellipse needs to be to accommodate the text
      // Since foreignObject is 80% of the ellipse height, we need to adjust accordingly
      const requiredEllipseHeight = textHeight / 0.8;

      // Only update if the required height is significantly different from current height
      if (Math.abs(requiredEllipseHeight - height) > 20) {
        updateLayer({
          id,
          updatedElementLayer: { height: requiredEllipseHeight },
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

  // Calculate the center of the ellipse
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Calculate the radius of the ellipse
  const rx = width / 2;
  const ry = height / 2;

  return (
    <g onPointerDown={(e) => onPointerDown(e, id)}>
      {/* Ellipse shape */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={rx}
        ry={ry}
        fill={fill ? fillRGBA(fill as Color, theme) : "none"}
        stroke={newBorderColor}
        strokeWidth={borderWidth || 2}
        strokeDasharray={borderType === "DASHED" ? "8 4" : undefined}
      />
      {value && (
        <foreignObject
          x={centerX - safeAreaWidth / 2} // Center the object and make it 80% of the width
          y={centerY - safeAreaHeight / 2} // Center vertically
          width={safeAreaWidth} // 80% of the ellipse's width
          height={safeAreaHeight} // 80% of the ellipse's height
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
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={selectionColor}
          strokeWidth={borderWidth ? borderWidth + 2 : 4}
          pointerEvents="none"
        />
      )}
    </g>
  );
};

export { Ellipse };
