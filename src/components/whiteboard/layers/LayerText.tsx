/* eslint-disable no-unused-vars */
import React, { memo, useEffect, useRef } from "react";

function LayerText({
  id,
  value,
  textColor,
  onContentChange,
  isEditable,
  onHeightChange,
}: {
  id: string;
  value?: string;
  textColor: string;
  onContentChange: (newValue: string) => void;
  isEditable: boolean;
  onHeightChange?: (height: number) => void;
}) {
  const editableRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize the content only once when the component mounts or when value changes
  useEffect(() => {
    if (editableRef.current && value !== undefined) {
      // Only set the content if it's different to avoid cursor reset
      if (editableRef.current.innerText !== value) {
        editableRef.current.innerText = value;
      }
    }
  }, [value]);

  // Monitor height changes and update parent if needed
  useEffect(() => {
    let previousHeight = 0;

    const checkAndUpdateHeight = () => {
      if (editableRef.current && onHeightChange) {
        const editableHeight = editableRef.current.scrollHeight;
        // Add some padding to ensure text doesn't get cut off
        const paddedHeight = editableHeight + 20;

        // Only notify parent if height has actually changed
        if (paddedHeight !== previousHeight) {
          previousHeight = paddedHeight;
          onHeightChange(paddedHeight);
        }
      }
    };

    // Initial check
    checkAndUpdateHeight();

    // Set up a mutation observer to detect content changes
    if (editableRef.current) {
      const observer = new MutationObserver(checkAndUpdateHeight);

      observer.observe(editableRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, [onHeightChange]);

  const handleInput = () => {
    if (editableRef.current) {
      onContentChange(editableRef.current.innerText);
    }
  };

  return (
    <div
      ref={containerRef}
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
          wordWrap: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "normal",
        }}
      />
    </div>
  );
}

export default memo(LayerText);
