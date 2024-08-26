/* eslint-disable no-unused-vars */
"use client";

import { Bold, BringToFront, CaseSensitive, CaseUpper, Ellipsis, PaintBucket, SendToBack, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { memo, useCallback, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { Camera, CanvasMode, Color, Layer } from "@/_types";
import { Button } from "@/components/ui/button";
import { useSelectionBounds } from "@/hooks/useSelectionBounds";
import {
  activeLayersAtom,
  boardIdState,
  canvasStateAtom,
  edgesAtomState,
  layerAtomState,
  useRemoveEdge,
  useRemoveElement,
  useSelectElement,
  useUnSelectElement,
  useUpdateElement,
} from "@/state";

import { ColorPicker } from "../colorPicker";
import { ToolButton } from "../ToolButton";

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
  const edges = useRecoilValue(edgesAtomState);

  const removeEdge = useRemoveEdge({ roomId: boardId });
  const unSelectLayer = useUnSelectElement({ roomId: boardId });
  const updateLayer = useUpdateElement({ roomId: boardId });
  const removeLayer = useRemoveElement({ roomId: boardId });

  const selectionBounds = useSelectionBounds();

  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleColorChange = useCallback(
    (fill: Color) => {
      setLastUsedColor(fill);

      for (const layerId of activeLayerIDs) {
        updateLayer(layerId, { fill: fill });
      }
      setShowColorPicker(false);
    },
    [activeLayerIDs, setLastUsedColor, updateLayer],
  );

  const handleRemoveLayer = useCallback(() => {
    const selectedLayers = layers.filter((layer: Layer) => activeLayerIDs.includes(layer.id));

    unSelectLayer({ userId: currentUserId });

    for (const layer of selectedLayers) {
      if (layer) {
        removeLayer(layer.id);

        edges.forEach((edge) => {
          if (edge.fromLayerId === layer.id || edge.toLayerId === layer.id) {
            removeEdge(edge.id);
          }
        });
      }
    }
  }, [activeLayerIDs, currentUserId, edges, layers, removeEdge, removeLayer, unSelectLayer]);

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
    <>
      {showColorPicker && (
        <div
          className="absolute bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800"
          // style={{
          //   transform: `translate(${x - 50}px, ${y - 150}px)`,
          // }}
          style={{
            transform: `translate(
            calc(${x}px - 50%),
            calc(${y}px - 160%)
          )`,
          }}
        >
          <ColorPicker onChange={handleColorChange} onClose={() => setShowColorPicker(false)} />
        </div>
      )}
      <div
        className="absolute w-auto px-2 py-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800"
        style={{
          transform: `translate(
            calc(${x}px - 50%),
            calc(${y}px - 100%)
          )`,
        }}
      >
        <ul className="flex flex-row space-x-2 items-center justify-between">
          <ToolButton
            icon={PaintBucket}
            onClick={() => setShowColorPicker(!showColorPicker)}
            isActive={showColorPicker}
          />
          <div className="w-[1px] h-6 self-center bg-slate-200 dark:bg-slate-700"></div>
          <ToolButton
            icon={Ellipsis}
            onClick={() => {
              ("");
            }}
            isActive={false}
          />
          <Button
            variant={false ? "boardActive" : "board"}
            size="icon"
            onClick={() => {
              ("");
            }}
          >
            <div className={`w-[20px] h-[5px] dark:bg-slate-200 ${false ? "bg-slate-200" : "bg-slate-950"}`}></div>
          </Button>
          <div className="w-[1px] h-6 self-center bg-slate-200 dark:bg-slate-700"></div>
          <ToolButton
            icon={CaseUpper}
            onClick={() => {
              ("");
            }}
            isActive={false}
          />
          <ToolButton
            icon={Bold}
            onClick={() => {
              ("");
            }}
            isActive={false}
          />
          <div className="w-[1px] h-6 self-center bg-slate-200 dark:bg-slate-700"></div>
          <Button variant="board" size="icon" onClick={handleRemoveLayer}>
            <Trash2 />
          </Button>
        </ul>
      </div>
    </>
  );
});

SelectionTools.displayName = "SelectionTools";
