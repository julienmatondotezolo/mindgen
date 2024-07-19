// src/components/Canvas.tsx
import React, { useCallback, useEffect, useState } from "react";

import { Camera, CanvasMode, CanvasState } from "@/_types";

import { Button } from "../ui";
import { Toolbar } from "./Toolbar";

const Whiteboard: React.FC = () => {
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 1 });

  const [isMouseDown, setIsMouseDown] = useState(false);

  const [showResetButton, setShowResetButton] = useState(false);
  const [applyTransition, setApplyTransition] = useState(false);

  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  const CANVAS_TRANSITION_TIME = 500;

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isMouseDown || canvasState.mode !== CanvasMode.Grab) return;

      setCamera((prev) => ({
        x: prev.x + event.movementX,
        y: prev.y + event.movementY,
        scale: prev.scale,
      }));

      // Check if the <g> element is out of bounds
      const svgElement = document.querySelector("svg g");

      if (svgElement) {
        const rect = svgElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        // Check if <g> element is outside the viewport
        const isOutOfBounds =
          rect.top > viewportHeight || rect.right < 0 || rect.bottom < 0 || rect.left > viewportWidth;

        setShowResetButton(isOutOfBounds);
      }
    },
    [isMouseDown, canvasState.mode],
  );

  const handleMouseDown = (event: MouseEvent) => {
    if (event.button === 0 && CanvasMode.Grab) {
      // Check if primary button is pressed
      setIsMouseDown(true);
    }
  };

  // Mouse up handler
  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  // Fit content to view
  const fitView = () => {
    // Enable transition
    setApplyTransition(true);

    const svgElement = document.querySelector("svg");
    const gElement = document.querySelector("svg g");

    if (!svgElement || !gElement) return;

    const svgRect = svgElement.getBoundingClientRect();

    const gRect = gElement.getBBox(); // getBBox() returns the tight bounding box in local coordinates
    const gRectWidth = gRect.width - gRect.x;
    const gRectHeight = gRect.height - gRect.y;

    // Calculate scale to fit horizontally
    const scaleX = svgRect.width / gRect.width;
    const scaleY = svgRect.height / gRect.height;
    const scale = Math.max(scaleX, scaleY) / 1.8; // Use max to ensure content doesn't shrink vertically

    // Calculate translation to center the content
    const translateX = gRect.x * scale + gRectWidth / scale;
    const translateY = -(gRect.y * (gRect.height / 2 / svgRect.height) - gRectHeight * 2);

    setCamera({ x: translateX, y: translateY, scale: scale });

    // Disable transition after a delay matching the transition duration
    setTimeout(() => {
      setApplyTransition(false);
    }, CANVAS_TRANSITION_TIME);

    setShowResetButton(false);
  };

  const zoomIn = () => {
    setApplyTransition(true);

    setCamera((prevState) => ({
      ...prevState,
      scale: prevState.scale + 0.1, // Increase scale by 25%
    }));

    // Disable transition after a delay matching the transition duration
    setTimeout(() => {
      setApplyTransition(false);
    }, CANVAS_TRANSITION_TIME);

    setShowResetButton(false);
  };

  const zoomOut = () => {
    setApplyTransition(true);

    setCamera((prevState) => ({
      ...prevState,
      scale: prevState.scale - 0.1, // Decrease scale by 25%
    }));

    // Disable transition after a delay matching the transition duration
    setTimeout(() => {
      setApplyTransition(false);
    }, CANVAS_TRANSITION_TIME);

    setShowResetButton(false);
  };

  const resetView = () => {
    // Enable transition
    setApplyTransition(true);

    // Reset camera position
    setCamera({ x: 0, y: 0, scale: 1 });

    // Disable transition after a delay matching the transition duration
    setTimeout(() => {
      setApplyTransition(false);
    }, CANVAS_TRANSITION_TIME);

    setShowResetButton(false);
  };

  // New useEffect hook for canvas mode changes
  useEffect(() => {
    const updateCursorStyle = () => {
      if (canvasState.mode === CanvasMode.Grab) {
        document.body.style.cursor = "grab";
      } else {
        document.body.style.cursor = "default";
      }
    };

    updateCursorStyle();

    // Cleanup function to reset cursor style when component unmounts
    return () => {
      document.body.style.cursor = "default";
    };
  }, [canvasState.mode]);

  // Adjusted keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setCanvasState({
          mode: CanvasMode.Grab,
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Hande Mouse move
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove]);

  return (
    <main className="h-full w-full relative  touch-none select-none">
      <Toolbar canvasState={canvasState} setCanvasState={setCanvasState} />
      <div className="fixed bottom-4 left-4 z-10 space-x-2">
        <figure className="flex items-center space-x-2 float-left">
          <Button variant="outline" onClick={zoomOut}>
            -
          </Button>
          <p className="text-sm">{Math.round(camera.scale * 100)}%</p>
          <Button variant="outline" onClick={zoomIn}>
            +
          </Button>
        </figure>
        <Button variant="outline" onClick={fitView}>
          Fit content
        </Button>
      </div>
      {showResetButton && (
        <Button variant="outline" onClick={resetView} className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
          Scroll back to content
        </Button>
      )}
      <svg className="h-[100vh] w-[100vw]">
        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
            transformOrigin: "center",
            transition: applyTransition ? `transform ${CANVAS_TRANSITION_TIME / 1000}s ease-out` : "none",
            background: "red",
          }}
        >
          {/* SVG content goes here */}
          <rect x="600" y="300" width="30" height="30" fill="blue" />
          <circle cx="550" cy="350" r="30" fill="red" />
          <circle cx="250" cy="450" r="30" fill="green" />
          <circle cx="650" cy="550" r="30" fill="purple" />
        </g>
      </svg>
    </main>
  );
};

export { Whiteboard };
