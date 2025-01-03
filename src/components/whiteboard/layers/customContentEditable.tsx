/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-unused-vars */

import React, { useRef, useState } from "react";
import { useRecoilState } from "recoil";

import { CanvasMode } from "@/_types";
import { canvasStateAtom } from "@/state";

interface CustomEditableProps {
  value: string;
  onChange: (value: string) => void;
  style: React.CSSProperties;
}

const CustomContentEditable = ({ value, onChange, style }: CustomEditableProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);

  const handleClick = () => {
    if (canvasState.mode !== CanvasMode.Typing) return;

    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editableRef.current) {
      onChange(editableRef.current.innerText);
    }
  };

  const handleInput = () => {
    if (editableRef.current) {
      onChange(editableRef.current.innerText);
    }
  };

  return (
    <div
      ref={editableRef}
      onClick={handleClick}
      onBlur={handleBlur}
      onChange={handleInput}
      contentEditable={isEditing}
      suppressContentEditableWarning
      style={{
        ...style,
        userSelect: isEditing ? "text" : "none",
        cursor: isEditing ? "text" : "default",
      }}
    >
      {value}
    </div>
  );
};

export { CustomContentEditable };
