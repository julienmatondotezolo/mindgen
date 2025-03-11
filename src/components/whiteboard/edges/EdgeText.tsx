import cc from "classcat";
import { useTheme } from "next-themes";
import React, { memo, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";

import { CanvasMode } from "@/_types";
import { EdgeTextProps } from "@/_types/xyflow";
import { canvasStateAtom } from "@/state";

function EdgeTextComponent({
  x,
  y,
  label,
  labelStyle = {},
  labelShowBg = true,
  labelBgStyle = {},
  labelBgPadding = [2, 4],
  labelBgBorderRadius = 2,
  children,
  className,
  onLabelChange,
}: EdgeTextProps) {
  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);
  const [edgeTextBbox, setEdgeTextBbox] = useState({ x, y, width: 0, height: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState(label);
  const [inputWidth, setInputWidth] = useState(Math.max(edgeTextBbox.width + 20, 60));
  const edgeTextClasses = cc(["react-flow__edge-textwrapper", className]);
  const edgeTextRef = useRef<SVGTextElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (edgeTextRef.current) {
      const textBbox = edgeTextRef.current.getBBox();

      setEdgeTextBbox({
        x: textBbox.x,
        y: textBbox.y,
        width: textBbox.width,
        height: textBbox.height,
      });
    }

    setLabelText(label);
  }, [label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Calculate width as user types without using DOM measurement
  useEffect(() => {
    if (isEditing) {
      // Estimate width based on character count (this is an approximation)
      // Average character width in pixels (adjust based on your font)
      const averageCharWidth = 8;
      const estimatedWidth = Math.max((labelText?.length || 0) * averageCharWidth + 20, 60);

      setInputWidth(estimatedWidth);
    }
  }, [labelText, isEditing]);

  // Effect to handle clicking outside the input
  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsEditing(false);
        setCanvasState({ mode: CanvasMode.None });

        // Save changes if the label has changed
        if (onLabelChange && labelText !== label) {
          onLabelChange(labelText);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, labelText, label, onLabelChange, setCanvasState]);

  // Watch for canvas mode changes to exit editing
  useEffect(() => {
    if (isEditing && canvasState.mode !== CanvasMode.Typing) {
      setIsEditing(false);
    }
  }, [canvasState.mode, isEditing]);

  const handlePointerDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setCanvasState({ mode: CanvasMode.Typing });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabelText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      setCanvasState({ mode: CanvasMode.None });
      if (onLabelChange && labelText !== label) {
        onLabelChange(labelText);
      }
    }
  };

  if (typeof label === "undefined" || !label) {
    return null;
  }

  if (isEditing) {
    const safeWidth = isNaN(inputWidth) ? 100 : inputWidth;

    return (
      <foreignObject width={safeWidth} height={30} x={x - safeWidth / 2} y={y - 15} className={edgeTextClasses}>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "transparent",
          }}
        >
          <input
            ref={inputRef}
            value={labelText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={{
              color: theme === "dark" ? "white" : "black",
              width: "100%",
              border: "1px solid #ddd",
              borderRadius: "4px",
              textAlign: "center",
              padding: "2px 4px",
              ...labelStyle,
            }}
          />
        </div>
      </foreignObject>
    );
  }

  return (
    <g
      transform={`translate(${x - edgeTextBbox.width / 2} ${y - edgeTextBbox.height / 2})`}
      className={edgeTextClasses}
      visibility={edgeTextBbox.width ? "visible" : "hidden"}
      onPointerDown={handlePointerDown}
      style={{ cursor: "pointer" }}
    >
      {labelShowBg && (
        <rect
          width={edgeTextBbox.width + 2 * labelBgPadding[0]}
          x={-labelBgPadding[0]}
          y={-labelBgPadding[1]}
          height={edgeTextBbox.height + 2 * labelBgPadding[1]}
          className="react-flow__edge-textbg"
          style={labelBgStyle}
          rx={labelBgBorderRadius}
          ry={labelBgBorderRadius}
        />
      )}
      <text
        className="react-flow__edge-text"
        y={edgeTextBbox.height / 2}
        dy="0.3em"
        ref={edgeTextRef}
        style={{
          ...labelStyle,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {label}
      </text>
      {children}
    </g>
  );
}

EdgeTextComponent.displayName = "EdgeText";

/**
 * You can use the `<EdgeText />` component as a helper component to display text
 * within your custom edges.
 *
 *@public
 *
 *@example
 *```jsx
 *import { EdgeText } from '@xyflow/react';
 *
 *export function CustomEdgeLabel({ label }) {
 *  return (
 *    <EdgeText
 *      x={100}
 *      y={100}
 *      label={label}
 *      labelStyle={{ fill: 'white' }}
 *      labelShowBg
 *      labelBgStyle={{ fill: 'red' }}
 *      labelBgPadding={[2, 4]}
 *      labelBgBorderRadius={2}
 *    />
 *  );
 *}
 *```
 */
export const EdgeText = memo(EdgeTextComponent);
