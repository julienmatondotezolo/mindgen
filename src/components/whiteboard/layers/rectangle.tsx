import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import { RectangleLayer } from "@/_types";
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

  const updateValue = (newValue: string) => {
    console.log("newValue:", newValue);
  };

  const hanldeContentChange = (e: ContentEditableEvent) => {
    updateValue(e.target.value);
  };

  return (
    <rect
      className="drop-shadow-md"
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      x={0}
      y={0}
      width={width}
      height={height}
      strokeWidth={1}
      fill={fill ? colorToCss(fill) : "#000"}
      stroke={selectionColor || "transparent"}
    >
      <ContentEditable
        html={value || "Text"}
        onChange={hanldeContentChange}
        className={cn("h-full w-full flex items-center justify-center outline-none")}
        style={{
          color: fill ? getContrastingTextColor(fill) : "#000",
          fontSize: calculateFontSize(width, height),
        }}
      />
    </rect>
  );
};

export { Rectangle };
