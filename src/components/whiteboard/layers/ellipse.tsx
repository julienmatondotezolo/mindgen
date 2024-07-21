import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import { EllipseLayer } from "@/_types";
import { useUpdateElement } from "@/state";
import { cn, colorToCss, getContrastingTextColor } from "@/utils";

interface EllipseProps {
  id: string;
  layer: EllipseLayer;
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

const Ellipse = ({ id, layer, onPointerDown, selectionColor }: EllipseProps) => {
  const { x, y, width, height, fill, value } = layer;

  const updateLayer = useUpdateElement();

  const handleContentChange = (e: ContentEditableEvent) => {
    updateLayer(id, { value: e.target.value });
  };

  return (
    <ellipse
      className="drop-shadow-md"
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        // outline: selectionColor ? `1px solid ${selectionColor}` : "none",
        // backgroundColor: fill ? colorToCss(fill) : "#000",
      }}
      cx={width / 2}
      cy={height / 2}
      rx={width / 2}
      ry={height / 2}
      fill={fill ? colorToCss(fill) : "#000"}
      stroke={selectionColor || "transparent"}
      strokeWidth={1}
    >
      <ContentEditable
        html={value || "Text"}
        onChange={handleContentChange}
        className={cn("h-full w-full flex items-center justify-center outline-none")}
        style={{
          color: fill ? getContrastingTextColor(fill) : "#000",
          fontSize: calculateFontSize(width, height),
        }}
      />
    </ellipse>
  );
};

export { Ellipse };
