/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { useRecoilValue } from "recoil";

import { RectangleLayer } from "@/_types";
import { boardIdState, useUpdateElement } from "@/state";
import { cn, colorToCss, getContrastingTextColor } from "@/utils";

interface RectangleProps {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onMouseEnter: (e: React.MouseEvent, id: string) => void;
  onMouseLeave: (mouseEvent: React.MouseEvent) => void;
  selectionColor?: string;
}

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.15;
  const fontSizeBasedOnHeight = height * scaleFactor;
  const fontSizeBasedOnWidth = width * scaleFactor;

  return Math.min(maxFontSize, fontSizeBasedOnHeight, fontSizeBasedOnWidth);
};

const Rectangle = ({ id, layer, onPointerDown, onMouseEnter, onMouseLeave, selectionColor }: RectangleProps) => {
  const { x, y, width, height, fill, value } = layer;
  const boardId = useRecoilValue(boardIdState);

  const updateLayer = useUpdateElement(boardId);

  const handleContentChange = (e: ContentEditableEvent) => {
    updateLayer(id, { value: e.target.value });
  };

  return (
    <>
      <foreignObject
        // className="drop-shadow-md"
        className="shadow-md drop-shadow-xl"
        onPointerDown={(e) => onPointerDown(e, id)}
        onMouseEnter={(e) => onMouseEnter(e, id)}
        onMouseLeave={onMouseLeave}
        style={{
          transform: `translate(${x}px, ${y}px)`,
          outline: selectionColor ? `1px solid ${selectionColor}` : "none",
          backgroundColor: fill ? colorToCss(fill) : "#000",
        }}
        x={0}
        y={0}
        width={width}
        height={height}
        strokeWidth={1}
        // fill={fill ? colorToCss(fill) : "#000"}
        stroke={selectionColor || "transparent"}
      >
        <ContentEditable
          html={value || "Type something"}
          onChange={handleContentChange}
          className={cn("h-full w-full flex items-center justify-center outline-none")}
          style={{
            color: fill ? getContrastingTextColor(fill) : "#000",
            fontSize: calculateFontSize(width, height),
          }}
        />
      </foreignObject>
    </>
  );
};

export { Rectangle };
