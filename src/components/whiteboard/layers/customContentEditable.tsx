/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import React, { useRef, useState } from "react";
import { useSetRecoilState } from "recoil";

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
  const setCanvasState = useSetRecoilState(canvasStateAtom);

  const handleClick = () => {
    if (isEditing) {
      setCanvasState({
        mode: CanvasMode.Typing,
      });
    }
  };

  const handleDoubleClick = () => {
    setCanvasState({
      mode: CanvasMode.Typing,
    });
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editableRef.current) {
      onChange(editableRef.current.innerText);
    }
  };

  const handleInput = () => {
    setCanvasState({
      mode: CanvasMode.Typing,
    });
    if (editableRef.current) {
      onChange(editableRef.current.innerText);
    }
  };

  return (
    <div
      ref={editableRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
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
