/* eslint-disable no-unused-vars */
"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSetRecoilState } from "recoil";

import { CanvasMode, Color } from "@/_types/canvas";
import { canvasStateAtom } from "@/state";
import { colorToCss } from "@/utils";

interface ColorPickerProps {
  onChange: (color: Color) => void;
  onClose: () => void;
}

export const ColorPicker = ({ onChange, onClose }: ColorPickerProps) => {
  const whiteboardText = useTranslations("Whiteboard");

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{whiteboardText("chooseColor")}</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 items-center max-w-[164px]">
        <ColorButton color={{ r: 243, g: 82, b: 35 }} onClick={onChange} />
        <ColorButton color={{ r: 255, g: 249, b: 177 }} onClick={onChange} />
        <ColorButton color={{ r: 68, g: 202, b: 99 }} onClick={onChange} />
        <ColorButton color={{ r: 77, g: 106, b: 255 }} onClick={onChange} />
        <ColorButton color={{ r: 155, g: 105, b: 245 }} onClick={onChange} />
        <ColorButton color={{ r: 252, g: 142, b: 42 }} onClick={onChange} />
        <ColorButton color={{ r: 0, g: 0, b: 0 }} onClick={onChange} />
        <ColorButton color={{ r: 180, g: 191, b: 204 }} onClick={onChange} />
      </div>
    </div>
  );
};

interface ColorButtonProps {
  color: Color;
  onClick: (color: Color) => void;
}

export const ColorButton = ({ color, onClick }: ColorButtonProps) => {
  const setCanvasState = useSetRecoilState(canvasStateAtom);

  return (
    <button
      className="w-8 h-8 flex items-center justify-center hover:opacity-75 transition"
      onMouseEnter={() => {
        setCanvasState({
          mode: CanvasMode.Tooling,
        });
      }}
      onMouseLeave={() => {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick(color);
      }}
    >
      <div
        className="h-8 w-8 rounded-full"
        style={{
          background: colorToCss(color),
        }}
      />
    </button>
  );
};
