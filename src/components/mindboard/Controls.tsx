import { Maximize } from "lucide-react";
import React, { useCallback, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";

import { Layer } from "@/_types/canvas";
import { cameraStateAtom } from "@/state";

import { Button } from "../ui/button";

interface ControlsProps {
  layers: Layer[];
  onFitView?: () => void;
}

// Easing function for smooth animation
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

// Hook for camera controls that can be used outside the Controls component
export const useCameraControls = () => {
  const [camera, setCamera] = useRecoilState(cameraStateAtom);
  const animationRef = useRef<number | null>(null);

  // Cleanup animation on unmount
  useEffect(
    () => () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    },
    [],
  );

  // Zoom from center of viewport
  const zoomIn = useCallback(() => {
    const oldScale = camera.scale;
    const newScale = Math.min(oldScale * 1.2, 5); // Limit maximum zoom

    // Calculate center point of viewport in world coordinates before zoom
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    // Convert center to world coordinates
    const worldX = (centerX - camera.x) / oldScale;
    const worldY = (centerY - camera.y) / oldScale;

    // Calculate new camera position to keep the center point at center
    const newX = centerX - worldX * newScale;
    const newY = centerY - worldY * newScale;

    setCamera({
      x: newX,
      y: newY,
      scale: newScale,
    });
  }, [camera, setCamera]);

  const zoomOut = useCallback(() => {
    const oldScale = camera.scale;
    const newScale = Math.max(oldScale / 1.2, 0.1); // Limit minimum zoom

    // Calculate center point of viewport in world coordinates before zoom
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    // Convert center to world coordinates
    const worldX = (centerX - camera.x) / oldScale;
    const worldY = (centerY - camera.y) / oldScale;

    // Calculate new camera position to keep the center point at center
    const newX = centerX - worldX * newScale;
    const newY = centerY - worldY * newScale;

    setCamera({
      x: newX,
      y: newY,
      scale: newScale,
    });
  }, [camera, setCamera]);

  const fitView = useCallback(
    (layersToFit: Layer[]) => {
      // Cancel any ongoing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Target camera state
      let targetCamera: { x: number; y: number; scale: number };

      if (layersToFit.length === 0) {
        // Reset to center if no layers
        targetCamera = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          scale: 1,
        };
      } else {
        // Calculate bounds of all layers
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        layersToFit.forEach((layer) => {
          minX = Math.min(minX, layer.x);
          minY = Math.min(minY, layer.y);
          maxX = Math.max(maxX, layer.x + layer.width);
          maxY = Math.max(maxY, layer.y + layer.height);
        });

        // Add padding
        const padding = 100;

        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        // Calculate center and necessary scale
        const width = maxX - minX;
        const height = maxY - minY;
        const scaleX = window.innerWidth / width;
        const scaleY = window.innerHeight / height;
        const scale = Math.min(scaleX, scaleY, 2); // Limit maximum scale

        targetCamera = {
          x: window.innerWidth / 2 - (minX + width / 2) * scale,
          y: window.innerHeight / 2 - (minY + height / 2) * scale,
          scale,
        };
      }

      // Animation variables
      const startCamera = { ...camera };
      const startTime = performance.now();
      const duration = 500; // Animation duration in milliseconds

      // Animation function
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);

        // Interpolate between start and target
        const interpolatedCamera = {
          x: startCamera.x + (targetCamera.x - startCamera.x) * easedProgress,
          y: startCamera.y + (targetCamera.y - startCamera.y) * easedProgress,
          scale: startCamera.scale + (targetCamera.scale - startCamera.scale) * easedProgress,
        };

        setCamera(interpolatedCamera);

        if (progress < 1) {
          // Continue animation
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete
          animationRef.current = null;
        }
      };

      // Start animation
      animationRef.current = requestAnimationFrame(animate);
    },
    [camera, setCamera],
  );

  return { zoomIn, zoomOut, fitView };
};

export const Controls: React.FC<ControlsProps> = ({ layers, onFitView }) => {
  const { zoomIn, zoomOut, fitView } = useCameraControls();
  const [camera] = useRecoilState(cameraStateAtom);

  // Handle fit view, allow external components to know when fitView is called
  const handleFitView = useCallback(() => {
    fitView(layers);
    if (onFitView) onFitView();
  }, [fitView, layers, onFitView]);

  return (
    <div className="fixed bottom-6 left-6 z-10 group">
      <div className="relative flex items-center gap-3 p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-800">
          <Button
            variant="ghost"
            onClick={zoomOut}
            className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
          >
            <span className="text-lg font-medium text-slate-700 dark:text-slate-200">−</span>
          </Button>

          <div className="relative min-w-[64px]">
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-lg scale-y-[0.85] origin-center transition-transform duration-200 group-hover:scale-y-100" />
            <div className="relative px-2 py-1.5 text-center text-sm font-medium text-slate-700 dark:text-slate-200">
              {Math.round(camera.scale * 100)}%
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={zoomIn}
            className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
          >
            <span className="text-lg font-medium text-slate-700 dark:text-slate-200">+</span>
          </Button>
        </div>

        {/* Fit View Button */}
        <Button
          variant="ghost"
          onClick={handleFitView}
          className="h-9 px-4 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          <Maximize size={18} />
        </Button>

        <div className="absolute -z-10 inset-0 bg-white/40 dark:bg-slate-900/40 rounded-2xl blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
        <div className="absolute -z-20 -inset-0.5 bg-gradient-to-br from-primary-color/20 to-secondary-color/20 dark:from-primary-color/10 dark:to-secondary-color/10 rounded-[1rem] blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
      </div>
    </div>
  );
};
