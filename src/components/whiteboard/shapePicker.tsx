/* eslint-disable no-unused-vars */
"use client";

import { Circle, Diamond, LucideIcon, Square, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSetRecoilState } from "recoil";

import { CanvasMode, Color } from "@/_types/canvas";
import { canvasStateAtom } from "@/state";

import { ToolButton } from "./ToolButton";

interface ShapePickerProps {
  onChange: (icon: LucideIcon) => void;
  onClose: () => void;
}

export const ShapePicker = ({ onChange, onClose }: ShapePickerProps) => {
  const whiteboardText = useTranslations("Whiteboard");

  return (
    <div className="p-2">
      <div className="flex justify-end items-end mb-2">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={16} />
        </button>
      </div>
      <ul className="flex flex-wrap gap-2 items-center max-w-[164px]">
        <ToolButton icon={Circle} onClick={() => onChange} />
        <ToolButton icon={Square} onClick={() => onChange} />
        <ToolButton icon={Diamond} onClick={() => onChange} />
      </ul>
    </div>
  );
};
