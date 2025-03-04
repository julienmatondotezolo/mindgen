/* eslint-disable no-unused-vars */
import React from "react";

export interface EdgeTextProps {
  x: number;
  y: number;
  label: string;
  labelStyle?: React.CSSProperties;
  labelShowBg?: boolean;
  labelBgStyle?: React.CSSProperties;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
  children?: React.ReactNode;
  className?: string;
  onLabelChange?: (newLabel: string | undefined) => void;
}
