/* eslint-disable no-unused-vars */
"use client";

import { BringToFront, SendToBack, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { memo, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { Camera, CanvasMode, Color, Layer } from "@/_types";
import { Button } from "@/components/ui/button";
import { useSelectionBounds } from "@/hooks/useSelectionBounds";
import {
  activeLayersAtom,
  boardIdState,
  canvasStateAtom,
  layerAtomState,
  useRemoveElement,
  useSelectElement,
  useUnSelectElement,
  useUpdateElement,
} from "@/state";

import { ColorPicker } from "../colorPicker";

interface SelectionToolsProps {
  camera: Camera;
  setLastUsedColor: (color: Color) => void;
}

export const SelectionTools = memo(({ camera, setLastUsedColor }: SelectionToolsProps) => {
  const session = useSession();
  const currentUserId = session.data?.session?.user?.id;

  const layers = useRecoilValue(layerAtomState);
  const allActiveLayers = useRecoilValue(activeLayersAtom);

  const activeLayerIDs = allActiveLayers
    .filter((userActiveLayer) => userActiveLayer.userId === currentUserId)
    .map((item) => item.layerIds)[0];

  const boardId = useRecoilValue(boardIdState);
  const canvasState = useRecoilValue(canvasStateAtom);

  const unSelectLayer = useUnSelectElement({ roomId: boardId });
  const updateLayer = useUpdateElement({ roomId: boardId });
  const removeLayer = useRemoveElement({ roomId: boardId });

  const selectionBounds = useSelectionBounds();

  //   const handleMoveToBack = useCallback(() => {
  //     const indices: number[] = [];

  //     const arr = layers;

  //     for (let i = 0; i < arr.length; i++) {
  //       if (activeLayerIDs.includes(layers[i].id)) {
  //         indices.push(i);
  //       }
  //     }

  //     for (let i = 0; i < indices.length; i++) {
  //       liveLayerIds.move(indices[i], i);
  //     }
  //   }, [selection]);

  //   const handleMoveToFront = useCallback(() => {
  //     const liveLayerIds = storage.get("layerIds");

  //     const indices: number[] = [];

  //     const arr = liveLayerIds.toImmutable();

  //     for (let i = 0; i < arr.length; i++) {
  //       if (selection.includes(arr[i])) {
  //         indices.push(i);
  //       }
  //     }

  //     for (let i = indices.length - 1; i >= 0; i--) {
  //       liveLayerIds.move(indices[i], arr.length - 1 - (indices.length - 1 - i));
  //     }
  //   }, [selection]);

  const handleColorChange = useCallback(
    (fill: Color) => {
      setLastUsedColor(fill);

      for (const layerId of activeLayerIDs) {
        updateLayer(layerId, { fill: fill });
      }
    },
    [activeLayerIDs, setLastUsedColor, updateLayer],
  );

  const handleRemoveLayer = useCallback(() => {
    const selectedLayers = layers.filter((layer: Layer) => activeLayerIDs.includes(layer.id));

    unSelectLayer({ userId: currentUserId });

    for (const layer of selectedLayers) {
      if (layer) {
        removeLayer(layer.id);
      }
    }
  }, [activeLayerIDs, currentUserId, layers, removeLayer, unSelectLayer]);

  if (!selectionBounds || canvasState.mode === CanvasMode.EdgeEditing) return null;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const selectionToolsWidth = 200;
  const selectionToolsHeight = 60;

  // const x = selectionBounds.width / 2 + selectionBounds.x - camera.x;
  // const y = selectionBounds.y + camera.y;

  // const x = (selectionBounds.width / 2 + selectionBounds.x) * camera.scale + camera.x;
  // const y = selectionBounds.y * camera.scale + camera.y;

  const x = Math.min(
    Math.max((selectionBounds.width / 2 + selectionBounds.x) * camera.scale + camera.x, 0),
    viewportWidth - selectionToolsWidth,
  );
  const y = Math.min(
    Math.max(selectionBounds.y * camera.scale + camera.y - selectionToolsHeight, 0),
    viewportHeight - selectionToolsHeight,
  );

  return (
    <div
      className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
      style={{
        transform: `translate(
            calc(${x}px - 50%),
            calc(${y}px - 100%)
          )`,
      }}
    >
      <ColorPicker onChange={handleColorChange} />
      {/* <div className="flex flex-col gap-y-0.5">
        <Button variant="board" size="icon" onClick={handleMoveToFront}>
          <BringToFront />
        </Button>
        <Button variant="board" size="icon" onClick={handleMoveToBack}>
          <SendToBack />
        </Button>
      </div> */}
      <div className="flex items-center pl-2 ml-2 border-l">
        <Button variant="board" size="icon" onClick={handleRemoveLayer}>
          <Trash2 />
        </Button>
      </div>
    </div>
  );
});

SelectionTools.displayName = "SelectionTools";
