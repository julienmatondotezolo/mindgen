import { CSSProperties, ReactNode, SVGAttributes } from "react";

export type EdgeLabelOptions = {
  label?: string | ReactNode;
  labelStyle?: CSSProperties;
  labelShowBg?: boolean;
  labelBgStyle?: CSSProperties;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
};

export type EdgeTextProps = SVGAttributes<SVGElement> &
  EdgeLabelOptions & {
    x: number;
    y: number;
  };
