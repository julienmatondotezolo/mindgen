import React, { memo, useEffect, useRef } from "react";

function LayerText({
  id,
  value,
  textColor,
  onContentChange,
  isEditable,
}: {
  id: string;
  value?: string;
  textColor: string;
  onContentChange: (newValue: string) => void;
  isEditable: boolean;
}) {
  const editableRef = useRef<HTMLDivElement>(null);

  // Initialize the content only once when the component mounts or when value changes
  useEffect(() => {
    if (editableRef.current && value !== undefined) {
      // Only set the content if it's different to avoid cursor reset
      if (editableRef.current.innerText !== value) {
        editableRef.current.innerText = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editableRef.current) {
      onContentChange(editableRef.current.innerText);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        ref={editableRef}
        role="textbox"
        tabIndex={0}
        contentEditable={isEditable}
        onInput={handleInput}
        style={{
          color: textColor,
          width: "80%",
          height: "auto",
          textAlign: "center",
          verticalAlign: "middle",
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "inherit",
          lineHeight: "1.5",
          cursor: isEditable ? "text" : "default",
        }}
        onKeyDown={(e) => {
          // if (e.key === "Enter") {
          //   e.preventDefault();
          //   setText((prev) => prev + "\n");
          //   onContentChange(text + "\n");
          // }
        }}
      />
    </div>
  );
}

export default memo(LayerText);
