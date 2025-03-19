import { select, Selection } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import { RefObject, useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";

import { CanvasMode } from "@/_types/canvas";
import { cameraStateAtom, canvasStateAtom } from "@/state";

interface UseCanvasNavigationProps {
  canvasRef: RefObject<HTMLCanvasElement>;
}

export const useCanvasNavigation = ({ canvasRef }: UseCanvasNavigationProps) => {
  const [camera, setCamera] = useRecoilState(cameraStateAtom);
  const [canvasState] = useRecoilState(canvasStateAtom);

  // Update camera when D3 zoom events occur
  const updateCamera = useCallback(
    (x: number, y: number, k: number) => {
      setCamera({ x, y, scale: k });
    },
    [setCamera],
  );

  // Initialize D3 zoom behavior
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Use type assertion to handle D3 typing issues
    const selection = select(canvas) as unknown as Selection<Element, unknown, null, undefined>;

    // Create zoom behavior
    const zoomBehavior = zoom<Element, unknown>()
      .scaleExtent([0.1, 5]) // Min/max zoom scale
      .filter((event) => {
        // Only handle zoom/pan events with specific conditions:

        // 1. Always handle wheel events (for zooming) when Ctrl key is pressed
        if (event.type === "wheel" && event.ctrlKey) {
          event.preventDefault();
          return true;
        }

        // 2. Handle mouse/touch events only when in grab mode or middle button is pressed
        if (
          event.type === "mousedown" ||
          event.type === "mousemove" ||
          event.type === "mouseup" ||
          event.type === "touchstart" ||
          event.type === "touchmove" ||
          event.type === "touchend"
        ) {
          // Let native events handle these normally when not in Grab mode
          // (unless middle mouse button is used)
          if (
            canvasState.mode !== CanvasMode.Grab &&
            event.type === "mousedown" &&
            (event as MouseEvent).button !== 1
          ) {
            return false;
          }

          // For middle button (button 1) or Grab mode, let D3 handle it
          if (
            (event.type === "mousedown" && (event as MouseEvent).button === 1) ||
            canvasState.mode === CanvasMode.Grab
          ) {
            // Prevent default to ensure no text selection, etc.
            event.preventDefault();
            return true;
          }
        }

        // 3. Always handle multitouch/pinch events
        if (event.type === "touchstart" || event.type === "touchmove") {
          const touchEvent = event as TouchEvent;

          if (touchEvent.touches.length >= 2) {
            event.preventDefault();
            return true;
          }
        }

        // By default, let the native event handlers process the event
        return false;
      })
      .on("zoom", (event) => {
        const { x, y, k } = event.transform;

        updateCamera(x, y, k);
      });

    // Initialize with current camera state
    const initialTransform = zoomIdentity.translate(camera.x, camera.y).scale(camera.scale);

    // Apply initial transform
    selection.call(zoomBehavior.transform, initialTransform);

    // Apply zoom behavior to canvas
    selection.call(zoomBehavior);

    // Disable double-click to zoom
    selection.on("dblclick.zoom", null);

    // Event handlers for better touch experience
    const handleWheelEvent = (event: WheelEvent) => {
      // Only prevent default for ctrl+wheel to allow normal scrolling
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    const handleTouchEvent = (event: TouchEvent) => {
      // Only prevent default for multi-touch to allow single-touch for drawing
      if (event.touches.length >= 2) {
        event.preventDefault();
      }
    };

    // Manual event listeners for preventing default behaviors in specific conditions
    canvas.addEventListener("wheel", handleWheelEvent, { passive: false });
    canvas.addEventListener("touchstart", handleTouchEvent, { passive: false });
    canvas.addEventListener("touchmove", handleTouchEvent, { passive: false });

    return () => {
      // Clean up event listeners
      selection.on(".zoom", null);
      canvas.removeEventListener("wheel", handleWheelEvent);
      canvas.removeEventListener("touchstart", handleTouchEvent);
      canvas.removeEventListener("touchmove", handleTouchEvent);
    };
  }, [canvasRef, camera.x, camera.y, camera.scale, updateCamera, canvasState.mode]);

  return { camera };
};
