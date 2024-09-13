import { useTheme } from "next-themes";
import React from "react";

import { Color, LayerType, Point } from "@/_types";
import { colorToCss, fillRGBA } from "@/utils";

interface ShadowLayerProps {
  type: LayerType;
  position: Point;
  width: number;
  height: number;
  fill: Color;
}

export const ShadowLayer: React.FC<ShadowLayerProps> = ({ type, position, width, height, fill }) => {
  const { theme } = useTheme();

  const commonProps = {
    x: position.x,
    y: position.y,
    width,
    height,
    fill: colorToCss(fill),
    opacity: 0.5,
  };

  switch (type) {
    case LayerType.Rectangle:
      return (
        <foreignObject
          className={`relative shadow-md drop-shadow-xl`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            backgroundColor: fillRGBA(fill, theme),
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            borderColor: theme === "dark" ? "#b4bfcc" : "#475569",
            borderWidth: 2,
            borderStyle: "solid",
            borderRadius: "30px",
            overflow: "hidden",
            opacity: 0.5,
          }}
          x={0}
          y={0}
          width={width}
          height={height}
          strokeWidth={1}
        ></foreignObject>
      );
    case LayerType.Ellipse:
      return (
        <g
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          <foreignObject x={0} y={0} width={width} height={height}>
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: fillRGBA(fill, theme),
                backdropFilter: "blur(5px)",
                WebkitBackdropFilter: "blur(5px)",
                borderColor: theme === "dark" ? "#b4bfcc" : "#475569",
                borderWidth: 2,
                borderStyle: "solid",
                borderRadius: "50%",
                overflow: "hidden",
                opacity: 0.5,
              }}
            ></div>
          </foreignObject>
        </g>
      );
    case LayerType.Note:
      // Implement note shape here
      return <rect {...commonProps} />;
    default:
      return null;
  }
};
