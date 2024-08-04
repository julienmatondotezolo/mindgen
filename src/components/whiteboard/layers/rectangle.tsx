/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { CanvasMode, RectangleLayer } from "@/_types";
import { boardIdState, canvasStateAtom, useUpdateElement } from "@/state";
import { cn, colorToCss, getContrastingTextColor } from "@/utils";

interface RectangleProps {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.15;
  const fontSizeBasedOnHeight = height * scaleFactor;
  const fontSizeBasedOnWidth = width * scaleFactor;

  return Math.min(maxFontSize, fontSizeBasedOnHeight, fontSizeBasedOnWidth);
};

const Rectangle = ({ id, layer, onPointerDown, selectionColor }: RectangleProps) => {
  const { x, y, width, height, fill, value } = layer;
  const boardId = useRecoilValue(boardIdState);
  const setCanvasState = useSetRecoilState(canvasStateAtom);

  const updateLayer = useUpdateElement({ roomId: boardId });

  const handleContentClick = () => {
    setCanvasState({
      mode: CanvasMode.Typing,
    });
  };

  const handleContentChange = (e: ContentEditableEvent) => {
    updateLayer(id, { value: e.target.innerText });
  };

  return (
    <>
      <foreignObject
        // className="drop-shadow-md"
        className="relative shadow-md drop-shadow-xl"
        onPointerDown={(e) => onPointerDown(e, id)}
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
          onClick={handleContentClick}
          onKeyUp={handleContentChange}
          className={cn(
            "w-max outline-none cursor-text inline absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2",
          )}
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
