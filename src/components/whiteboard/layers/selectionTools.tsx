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
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);

  const [isDashed, setIsDashed] = useState(false);
  const [isThickBorder, setIsThickBorder] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  const [isBold, setIsBold] = useState(false);

  const handleColorChange = useCallback(
    (fill: Color) => {
      setLastUsedColor(fill);

      for (const layerId of activeLayerIDs) {
        if (showBorderColorPicker) {
          updateLayer(layerId, { borderColor: fill });
        } else {
          updateLayer(layerId, { fill: fill });
        }
      }
      setShowColorPicker(false);
      setShowBorderColorPicker(false);
    },
    [activeLayerIDs, setLastUsedColor, showBorderColorPicker, updateLayer],
  );

  const handleBorderColorChange = useCallback(() => {
    if (showBorderColorPicker) {
      setShowColorPicker(false);
      setShowBorderColorPicker(false);
    } else {
      setShowColorPicker(true);
      setShowBorderColorPicker(true);
    }
  }, [showBorderColorPicker]);

  const handleToggleBorderType = useCallback(() => {
    for (const layerId of activeLayerIDs) {
      const layer = layers.find((l) => l.id === layerId);

      if (layer) {
        const newBorderType = layer.borderType === "dashed" ? "solid" : "dashed";

        updateLayer(layerId, { borderType: newBorderType });

        setIsDashed(newBorderType === "dashed");
      }
    }
  }, [activeLayerIDs, layers, updateLayer]);

  const handleToggleBorderWidth = useCallback(() => {
    for (const layerId of activeLayerIDs) {
      const layer = layers.find((l) => l.id === layerId);

      if (layer) {
        const newBorderWidth = layer.borderWidth === 4 ? 2 : 4;

        updateLayer(layerId, { borderWidth: newBorderWidth });
        setIsThickBorder(newBorderWidth === 4);
      }
    }
  }, [activeLayerIDs, layers, updateLayer]);

  const handleToggleTextTransform = useCallback(() => {
    for (const layerId of activeLayerIDs) {
      const layer = layers.find((l) => l.id === layerId);

      if (layer) {
        const newTextTransform = layer.valueStyle?.textTransform === "uppercase" ? "none" : "uppercase";

        updateLayer(layerId, {
          valueStyle: {
            ...layer.valueStyle,
            textTransform: newTextTransform,
          },
        });
        setIsUppercase(newTextTransform === "uppercase");
      }
    }
  }, [activeLayerIDs, layers, updateLayer]);

  const handleToggleFontWeight = useCallback(() => {
    for (const layerId of activeLayerIDs) {
      const layer = layers.find((l) => l.id === layerId);

      if (layer) {
        const newFontWeight = layer.valueStyle?.fontWeight === "900" ? "400" : "900";

        updateLayer(layerId, {
          valueStyle: {
            ...layer.valueStyle,
            fontWeight: newFontWeight,
          },
        });
        setIsBold(newFontWeight === "900");
      }
    }
  }, [activeLayerIDs, layers, updateLayer]);

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

  // const viewportWidth = window.innerWidth;
  // const viewportHeight = window.innerHeight;

  // const selectionToolsWidth = 200;
  // const selectionToolsHeight = 60;

  // const x = selectionBounds.width / 2 + selectionBounds.x - camera.x;
  // const y = selectionBounds.y + camera.y;

  // const x = (selectionBounds.width / 2 + selectionBounds.x) * camera.scale + camera.x;
  // const y = selectionBounds.y * camera.scale + camera.y;

  // const x = Math.min(
  //   Math.max((selectionBounds.width / 2 + selectionBounds.x) * camera.scale + camera.x, 0),
  //   viewportWidth - selectionToolsWidth,
  // );
  // const y = Math.min(
  //   Math.max(selectionBounds.y * camera.scale + camera.y - selectionToolsHeight, 0),
  //   viewportHeight - selectionToolsHeight,
  // );

  const x = selectionBounds.x - selectionBounds.width / 2;
  const y = selectionBounds.y - selectionBounds.height * 2;

  return (
    <>
      {showColorPicker && (
        <div
          className="absolute bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800"
          style={{
            transform: `translate(${showBorderColorPicker ? x : x - 50}px, ${y - 150}px)`,
          }}
        >
          <ColorPicker onChange={handleColorChange} onClose={() => setShowColorPicker(false)} />
        </div>
      )}
      <div
        className="absolute w-auto px-2 py-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800"
        style={{
          transform: `translate(calc(${x}px - 1%), calc(${y}px - 50%))`,
        }}
      >
        <ul className="flex flex-row space-x-2 items-center justify-between">
          <ToolButton
            icon={PaintBucket}
            onClick={() => setShowColorPicker(!showColorPicker)}
            isActive={showColorPicker && showBorderColorPicker == false}
          />
          <Button
            variant={showBorderColorPicker ? "boardActive" : "board"}
            size="icon"
            onClick={handleBorderColorChange}
          >
            <div
              className={`w-5 h-5 border-[3px] dark:border-slate-200 rounded-full ${
                showBorderColorPicker ? "border-slate-200" : "border-slate-950"
              }`}
            ></div>
          </Button>
          <div className="w-[1px] h-6 self-center bg-slate-200 dark:bg-slate-700"></div>
          <ToolButton icon={Ellipsis} onClick={handleToggleBorderType} isActive={isDashed} />
          <Button variant={isThickBorder ? "boardActive" : "board"} size="icon" onClick={handleToggleBorderWidth}>
            <div
              className={`w-[20px] h-[5px] dark:bg-slate-200 ${isThickBorder ? "bg-slate-200" : "bg-slate-950"}`}
            ></div>
          </Button>
          <div className="w-[1px] h-6 self-center bg-slate-200 dark:bg-slate-700"></div>
          <ToolButton icon={CaseUpper} onClick={handleToggleTextTransform} isActive={isUppercase} />
          <ToolButton icon={Bold} onClick={handleToggleFontWeight} isActive={isBold} />
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
