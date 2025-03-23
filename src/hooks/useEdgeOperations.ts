import { Point } from "framer-motion";
import { nanoid } from "nanoid";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { useRecoilState } from "recoil";

import { CanvasState, Edge, EdgeShape, EdgeType } from "@/_types";
import { edgesAtomState } from "@/state";
import { getHandleEndPosition } from "@/utils/edgeUtils";

export const useEdgeOperations = () => {
  const [edges, setEdges] = useRecoilState(edgesAtomState);
  const { theme } = useTheme();

  // Set the color of the shadow edge
  const edgeColor = theme === "dark" ? { r: 180, g: 191, b: 204, a: 0.5 } : { r: 71, g: 85, b: 105, a: 0.5 };

  // Add a new layer
  const addEdge = useCallback(
    ({
      canvasState,
      newEdgePosition,
      toLayerId,
    }: {
      canvasState: CanvasState;
      newEdgePosition: Point;
      toLayerId: string;
    }) => {
      const newEdge: Edge = {
        id: nanoid(),
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        fromLayerId: canvasState.handleInfo?.layerId,
        toLayerId,
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        start: canvasState.origin,
        end: newEdgePosition,
        color: edgeColor,
        hoverColor: edgeColor,
        thickness: 2,
        orientation: "auto",
        type: EdgeType.Solid,
        label: "",
        shape: EdgeShape.Curved,
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        handleStart: canvasState.handleInfo?.handlePosition,
        handleEnd:
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          canvasState.handleInfo &&
          getHandleEndPosition({ handleStartPosition: canvasState.handleInfo?.handlePosition }),
      };

      setEdges((prev) => [...prev, newEdge]);

      return newEdge.id;
    },
    [],
  );

  return {
    edges,
    setEdges,
    addEdge,
  };
};
