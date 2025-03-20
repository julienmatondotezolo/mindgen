/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { SetterOrUpdater, useRecoilState } from "recoil";

import { Edge, Layer } from "@/_types";
import { CanvasMode } from "@/_types/canvas";
import { useCameraControls } from "@/components/mindboard/Controls";
import { canvasStateAtom } from "@/state";

import { useEdgeOperations } from "./useEdgeOperations";
import { useLayerOperations } from "./useLayerOperations";

/**
 * Custom hook to handle keyboard events for the mindboard
 */
export const useBoardKeyboardEvents = ({
  setIsDebugMode,
}: {
  setIsDebugMode: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [, setCanvasState] = useRecoilState(canvasStateAtom);

  const { layers, setLayers, activeLayers, setActiveLayers } = useLayerOperations();

  const { edges, setEdges } = useEdgeOperations();

  const { fitView } = useCameraControls();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar for grab mode - D3 handles the actual panning
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setCanvasState((prev) => ({
          ...prev,
          mode: CanvasMode.Grab,
        }));
      }

      // Debug mode toggle with Ctrl+Alt+D
      if (e.code === "KeyD" && e.ctrlKey && e.altKey) {
        e.preventDefault();
        setIsDebugMode((prev) => !prev);
      }

      // Delete selected layers
      if ((e.key === "Delete" || e.key === "Backspace") && activeLayers.length > 0) {
        // Delete connected edges
        setEdges((prev) =>
          prev.filter(
            (edge) =>
              !(edge.fromLayerId && activeLayers.includes(edge.fromLayerId)) &&
              !(edge.toLayerId && activeLayers.includes(edge.toLayerId)),
          ),
        );

        // Delete layers
        setLayers((prev) => prev.filter((layer) => !activeLayers.includes(layer.id)));
        setActiveLayers([]);
        fitView(layers);
      }

      // Deselect all with Escape
      if (e.key === "Escape") {
        setActiveLayers([]);

        // Reset canvas state
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Release spacebar - return to previous mode
      if (e.code === "Space") {
        e.preventDefault();
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
  }, [activeLayers, setActiveLayers, setLayers, setEdges, setCanvasState, layers, setIsDebugMode, fitView]);
};
