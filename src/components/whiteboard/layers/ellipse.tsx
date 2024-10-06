/* eslint-disable no-unused-vars */
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React from "react";
import { useRecoilValue } from "recoil";

import { Color, EllipseLayer } from "@/_types/canvas";
import { boardIdState, useUpdateElement } from "@/state";
import { colorToCss, fillRGBA, getContrastingTextColor } from "@/utils";

import { CustomContentEditable } from "./customContentEditable";

interface EllipseProps {
  id: string;
  layer: EllipseLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.08;
  const fontSizeBasedOnHeight = height * scaleFactor;
  const fontSizeBasedOnWidth = width * scaleFactor;

  return Math.min(maxFontSize, fontSizeBasedOnHeight, fontSizeBasedOnWidth);
};

const Ellipse = ({ id, layer, onPointerDown, selectionColor }: EllipseProps) => {
  const session = useSession();
  const currentUserId = session.data?.session?.user?.id;

  const { theme } = useTheme();

  const { x, y, width, height, fill, value, valueStyle, borderWidth, borderType } = layer;
  const boardId = useRecoilValue(boardIdState);

  const updateLayer = useUpdateElement({ roomId: boardId });

  const handleContentChange = (newValue: string) => {
    updateLayer({ id, userId: currentUserId, updatedElementLayer: { value: newValue } });
  };

  return (
    <g
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <foreignObject x={0} y={0} width={width} height={height}>
        <div
          style={{
            width: "100%",
            height: "100%",
            outline: selectionColor ? `3px solid ${selectionColor}` : "none",
            backgroundColor: fillRGBA(fill, theme),
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            borderColor: theme === "dark" ? "#b4bfcc" : "#475569",
            borderWidth: borderWidth ? borderWidth : 2,
            borderStyle: borderType ? borderType : "solid",
            borderRadius: "50%",
            // overflow: "hidden",
          }}
        >
          <CustomContentEditable
            value={value || ""}
            onChange={handleContentChange}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: fill ? getContrastingTextColor(fill) : "#000",
              fontSize: calculateFontSize(width, height),
              fontWeight: valueStyle?.fontWeight,
              textTransform: valueStyle?.textTransform,
              wordBreak: "break-word",
              outline: "none",
            }}
          />
        </div>
      </foreignObject>
    </g>
  );
};

export { Ellipse };
