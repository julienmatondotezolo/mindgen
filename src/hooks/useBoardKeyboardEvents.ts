import React, { useEffect } from "react";
import { useRecoilState } from "recoil";

import { CanvasMode, Edge } from "@/_types/canvas";
import { useCameraControls } from "@/components/mindboard/Controls";
import { canvasStateAtom } from "@/state";

import { useEdgeOperations } from "./useEdgeOperations";
import { useLayerOperations } from "./useLayerOperations";

/**
 * Custom hook to handle keyboard events for the mindboard
 */
export const useBoardKeyboardEvents = ({
  boardId,
  setIsDebugMode,
}: {
  boardId: string;
  setIsDebugMode: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [, setCanvasState] = useRecoilState(canvasStateAtom);

  const { layers, setLayers, activeLayers, deleteLayer, unSelectLayer } = useLayerOperations({
    boardId,
  });

  const { edges, setEdges, activeEdgeId, setActiveEdgeId, deleteEdge, deleteEdgeLayer } = useEdgeOperations({
    boardId,
  });

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
        // Find all connected edges to layer
        const edgesIdsToDelete = edges.filter(
          (edge: Edge) =>
            (edge.fromLayerId && activeLayers.includes(edge.fromLayerId)) ||
            (edge.toLayerId && activeLayers.includes(edge.toLayerId)),
        );

        // // Delete edges
        // if (edgesIdsToDelete.length > 0) {
        //   deleteEdge({ edgeIdsToDelete: edgesIdsToDelete.map((edge) => edge.id) });
        // }

        // // Delete layers
        // deleteLayer({ layerIdsToDelete: activeLayers });

        // Delete edge layers
        deleteEdgeLayer({ edgeIdsToDelete: edgesIdsToDelete.map((edge) => edge.id), layerIdsToDelete: activeLayers });

        unSelectLayer();
        fitView(layers);
      }

      // Delete selected edges
      if (e.key === "Delete" || (e.key === "Backspace" && activeEdgeId.length > 0)) {
        deleteEdge({ edgeIdsToDelete: activeEdgeId });
        setActiveEdgeId([]);
      }

      // Deselect all with Escape
      if (e.key === "Escape") {
        unSelectLayer();

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
  }, [
    activeLayers,
    setLayers,
    setEdges,
    setCanvasState,
    layers,
    setIsDebugMode,
    fitView,
    activeEdgeId,
    setActiveEdgeId,
    deleteLayer,
    boardId,
    deleteEdge,
    edges,
    unSelectLayer,
    deleteEdgeLayer,
  ]);
};
