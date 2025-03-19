import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";

import { CanvasMode } from "@/_types/canvas";
import { cameraStateAtom, canvasStateAtom } from "@/state";

interface UseCanvasNavigationProps {
  canvasRef: RefObject<HTMLCanvasElement>;
}

export const useCanvasNavigation = ({ canvasRef }: UseCanvasNavigationProps) => {
  const [camera, setCamera] = useRecoilState(cameraStateAtom);
  const [canvasState] = useRecoilState(canvasStateAtom);
  const transformRef = useRef({ x: camera.x, y: camera.y, k: camera.scale });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Add refs for animation frame and throttling
  const requestRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);

  // The target camera state we want to animate to
  const targetCameraRef = useRef({ x: camera.x, y: camera.y, scale: camera.scale });

  // Update camera when transform changes - with throttling based on scale
  const updateCamera = useCallback(
    (x: number, y: number, k: number) => {
      // Update the transform ref to keep it in sync
      transformRef.current = { x, y, k };

      // Store the target position/scale
      targetCameraRef.current = { x, y, scale: k };

      // For smoother experience at low zoom levels, use requestAnimationFrame
      // to animate camera updates instead of updating state directly
      if (requestRef.current === null) {
        requestRef.current = requestAnimationFrame(animateCamera);
      }
    },
    [setCamera],
  );

  // Animation function for smooth camera updates
  const animateCamera = useCallback(() => {
    requestRef.current = null;
    const now = performance.now();

    // Get current and target camera values
    const current = { x: camera.x, y: camera.y, scale: camera.scale };
    const target = targetCameraRef.current;

    // Determine update frequency based on scale - lower zoom levels need more throttling
    const minUpdateInterval = current.scale < 0.5 ? 50 : 16; // Throttle more at low zoom

    if (now - lastUpdateTimeRef.current >= minUpdateInterval) {
      // Time to update
      lastUpdateTimeRef.current = now;

      // Update the Recoil state
      setCamera({ x: target.x, y: target.y, scale: target.scale });
    } else {
      // Not time to update yet, schedule another frame
      requestRef.current = requestAnimationFrame(animateCamera);
    }
  }, [camera, setCamera]);

  // Clean up animation frame on unmount
  useEffect(
    () => () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    },
    [],
  );

  // Initialize D3 zoom behavior
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Initialize with current camera state
    transformRef.current = { x: camera.x, y: camera.y, k: camera.scale };
    targetCameraRef.current = { x: camera.x, y: camera.y, scale: camera.scale };

    // Custom handler for wheel events that better handles trackpad interactions
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Get current transform from ref
      const transform = transformRef.current;

      // Check if the wheel event is from a trackpad
      // This is a heuristic - small deltaY values often indicate a trackpad
      const isTrackpad = Math.abs(e.deltaY) < 40;

      if (isTrackpad && e.ctrlKey) {
        // Trackpad pinch-to-zoom
        const delta = -e.deltaY * 0.01;
        const newScale = Math.max(0.1, Math.min(5, transform.k * (1 + delta)));
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;

        // Calculate new transform and update
        const newX = mouseX - (mouseX - transform.x) * (newScale / transform.k);
        const newY = mouseY - (mouseY - transform.y) * (newScale / transform.k);

        updateCamera(newX, newY, newScale);
      } else if (isTrackpad && !e.ctrlKey) {
        // Trackpad two-finger pan
        const newX = transform.x - e.deltaX;
        const newY = transform.y - e.deltaY;

        updateCamera(newX, newY, transform.k);
      } else {
        // Standard mouse wheel zoom
        const delta = -e.deltaY * 0.001;
        const newScale = Math.max(0.1, Math.min(5, transform.k * (1 + delta)));
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;

        // Calculate new transform with zoom centered on mouse position
        const newX = mouseX - (mouseX - transform.x) * (newScale / transform.k);
        const newY = mouseY - (mouseY - transform.y) * (newScale / transform.k);

        updateCamera(newX, newY, newScale);
      }
    };

    const handleTouchEvent = (event: TouchEvent) => {
      // Only prevent default for multi-touch to allow single-touch for drawing
      if (event.touches.length >= 2) {
        event.preventDefault();
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      // Only handle mouse drag in Grab mode or when middle mouse button is pressed
      if (canvasState.mode === CanvasMode.Grab || event.button === 1) {
        event.preventDefault();
        lastMousePosRef.current.x = event.clientX;
        lastMousePosRef.current.y = event.clientY;
        setIsMouseDown(true);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;

      if (canvasState.mode === CanvasMode.Grab || event.buttons === 4) {
        // 4 is middle button
        event.preventDefault();

        // Calculate the delta
        const deltaX = event.clientX - lastMousePosRef.current.x;
        const deltaY = event.clientY - lastMousePosRef.current.y;

        // Update last position
        lastMousePosRef.current.x = event.clientX;
        lastMousePosRef.current.y = event.clientY;

        // Update camera position
        const transform = transformRef.current;

        updateCamera(transform.x + deltaX, transform.y + deltaY, transform.k);
      }
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    // Add event listeners
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("touchstart", handleTouchEvent, { passive: false });
    canvas.addEventListener("touchmove", handleTouchEvent, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      // Clean up event listeners
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("touchstart", handleTouchEvent);
      canvas.removeEventListener("touchmove", handleTouchEvent);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [canvasRef, camera.x, camera.y, camera.scale, updateCamera, canvasState.mode, isMouseDown, animateCamera]);
};
