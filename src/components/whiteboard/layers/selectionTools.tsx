"use client";

import { Bold, CaseUpper, Ellipsis, PaintBucket, Shapes, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { memo, useCallback, useState } from "react";
import { useRecoilValue } from "recoil";

import { Camera, CanvasMode, Color, Layer, LayerType } from "@/_types";
import { useSelectionBounds } from "@/hooks/useSelectionBounds";
import {
  activeLayersAtom,
  boardIdState,
  canvasStateAtom,
  edgesAtomState,
  layerAtomState,
  useRemoveEdge,
  useRemoveElement,
  useUnSelectElement,
  useUpdateElement,
} from "@/state";
import { getLayerById } from "@/utils";

import { ColorPicker } from "../colorPicker";
import { ShapePicker } from "../shapePicker";
import { ToolButton } from "../ToolButton";

interface SelectionToolsProps {
  camera: Camera;
  isDeletable: boolean;
  // eslint-disable-next-line no-unused-vars
  setLastUsedColor: (color: Color) => void;
}

export const SelectionTools = memo(({ camera, isDeletable, setLastUsedColor }: SelectionToolsProps) => {
  const session = useSession();
  const currentUserId = session.data?.session?.user?.id;

  const layers = useRecoilValue(layerAtomState);
  const allActiveLayers = useRecoilValue(activeLayersAtom);

  const activeLayerIDs = allActiveLayers
    .filter((userActiveLayer: any) => userActiveLayer.userId === currentUserId)
    .map((item: any) => item.layerIds)[0];

  const currentLayer = getLayerById({ layerId: activeLayerIDs ? activeLayerIDs[0] : 0, layers });

  const boardId = useRecoilValue(boardIdState);
  const canvasState = useRecoilValue(canvasStateAtom);
  const edges = useRecoilValue(edgesAtomState);

  const removeEdge = useRemoveEdge({ roomId: boardId });
  const unSelectLayer = useUnSelectElement({ roomId: boardId });
  const updateLayer = useUpdateElement({ roomId: boardId });
  const removeLayer = useRemoveElement({ roomId: boardId });

  const selectionBounds = useSelectionBounds();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShapePicker, setShowShapePicker] = useState(false);
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);

  const handleShapeChange = useCallback(
    (shape: LayerType) => {
      let layerType;

      switch (shape) {
        case LayerType.Ellipse:
          layerType = LayerType.Ellipse;
          break;
        case LayerType.Diamond:
          layerType = LayerType.Diamond;
          break;
        default:
          layerType = LayerType.Rectangle;
      }

      for (const layerId of activeLayerIDs) {
        updateLayer({
          id: layerId,
          userId: currentUserId,
          updatedElementLayer: { type: layerType },
        });
      }
      setShowShapePicker(false);
    },
    [activeLayerIDs, currentUserId, updateLayer],
  );

  const handleColorChange = useCallback(
    (fill: Color) => {
      setLastUsedColor(fill);

      for (const layerId of activeLayerIDs) {
        if (showBorderColorPicker) {
          updateLayer({
            id: layerId,
            userId: currentUserId,
            updatedElementLayer: { borderColor: fill },
          });
        } else {
          updateLayer({
            id: layerId,
            userId: currentUserId,
            updatedElementLayer: { fill: fill },
          });
        }
      }
      setShowColorPicker(false);
      setShowBorderColorPicker(false);
    },
    [activeLayerIDs, currentUserId, setLastUsedColor, showBorderColorPicker, updateLayer],
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
        const newBorderType = layer.borderType === "DASHED" ? "solid" : "DASHED";

        updateLayer({
          id: layerId,
          userId: currentUserId,
          updatedElementLayer: { borderType: newBorderType },
        });
      }
    }
  }, [activeLayerIDs, currentUserId, layers, updateLayer]);

  const handleToggleBorderWidth = useCallback(() => {
    for (const layerId of activeLayerIDs) {
      const layer = layers.find((l) => l.id === layerId);

      if (layer) {
        const newBorderWidth = layer.borderWidth === 4 ? 2 : 4;

        updateLayer({
          id: layerId,
          userId: currentUserId,
          updatedElementLayer: { borderWidth: newBorderWidth },
        });
      }
    }
  }, [activeLayerIDs, currentUserId, layers, updateLayer]);

  const handleToggleTextTransform = useCallback(() => {
    for (const layerId of activeLayerIDs) {
      const layer = layers.find((l) => l.id === layerId);

      if (layer) {
        const newTextTransform = layer.valueStyle?.textTransform === "uppercase" ? "none" : "uppercase";

        updateLayer({
          id: layerId,
          userId: currentUserId,
          updatedElementLayer: {
            valueStyle: {
              ...layer.valueStyle,
              textTransform: newTextTransform,
            },
          },
        });
      }
    }
  }, [activeLayerIDs, currentUserId, layers, updateLayer]);

  const handleToggleFontWeight = useCallback(() => {
    for (const layerId of activeLayerIDs) {
      const layer = layers.find((l) => l.id === layerId);

      if (layer) {
        const newFontWeight = layer.valueStyle?.fontWeight === "900" ? "400" : "900";

        updateLayer({
          id: layerId,
          userId: currentUserId,
          updatedElementLayer: {
            valueStyle: {
              ...layer.valueStyle,
              fontWeight: newFontWeight,
            },
          },
        });
      }
    }
  }, [activeLayerIDs, currentUserId, layers, updateLayer]);

  const handleRemoveLayer = useCallback(() => {
    if (isDeletable) {
      alert("You don't have the rights to delete");
      return;
    }
    const selectedLayers = layers.filter((layer: Layer) => activeLayerIDs.includes(layer.id));
    const layerIdsToDelete = selectedLayers.map((layer) => layer.id);

    removeLayer({ layerIdsToDelete, userId: currentUserId });
    unSelectLayer({ userId: currentUserId });

    for (const layer of selectedLayers) {
      if (layer) {
        edges.forEach((edge) => {
          if (edge.fromLayerId === layer.id || edge.toLayerId === layer.id) {
            removeEdge({ id: edge.id, userId: currentUserId });
          }
        });
      }
    }
  }, [activeLayerIDs, currentUserId, edges, isDeletable, layers, removeEdge, removeLayer, unSelectLayer]);

  if (!selectionBounds || canvasState.mode === CanvasMode.Translating || canvasState.mode === CanvasMode.EdgeEditing)
    return null;

  if (selectionBounds) {
    const { x, y } = selectionBounds;

    const objectSizesWitdh = 4000;
    const objectSizesHeight = 1900;

    const toolPositionX = x - 1900;
    const toolPositionY = y - 1950;

    // const toolPositionX = canvasState?.current?.x;
    // const toolPositionY = canvasState?.current?.y;

    return (
      <foreignObject
        className="relative"
        x={toolPositionX}
        y={toolPositionY}
        width={objectSizesWitdh}
        height={objectSizesHeight}
      >
        {/* USE FOR POSITION ELMENTS INSIDE RECT */}
        {/* <div
          className="absolute top-0 left-0"
          style={{
            background: "white",
            width: objectSizesWitdh,
            height: objectSizesHeight,
          }}
        ></div> */}
        <div
          className={`absolute w-auto px-2 py-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800 text-slate-950 dark:text-slate-200`}
          style={{
            // top: `${toolPositionY}px`,
            // left: `${toolPositionX}px`,
            transform: `translate(1800px, 1820px) scale(${1 / camera.scale})`,
            transformOrigin: "bottom center",
          }}
        >
          {showShapePicker && (
            <div
              className="absolute bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-800 dark:bg-opacity-95 dark:border-slate-800"
              style={{
                bottom: 70,
                left: 0,
                transform: `translate(0px, 0px)`,
              }}
            >
              <ShapePicker onChange={handleShapeChange} onClose={() => setShowShapePicker(false)} />
            </div>
          )}
          {showColorPicker && (
            <div
              className="absolute bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800"
              style={{
                bottom: 70,
                left: 0,
                transform: `translate(0px, 0px)`,
              }}
            >
              <ColorPicker onChange={handleColorChange} onClose={() => setShowColorPicker(false)} />
            </div>
          )}
          <ul className="flex flex-row space-x-2 items-center justify-between">
            <ToolButton
              icon={Shapes}
              onClick={() => {
                setShowColorPicker(false);
                setShowBorderColorPicker(false);
                setShowShapePicker(!showShapePicker);
              }}
              isActive={showShapePicker}
            />
            <div className="w-[1px] h-6 self-center bg-slate-200 dark:bg-slate-700"></div>
            <ToolButton
              icon={PaintBucket}
              onClick={() => {
                setShowBorderColorPicker(false);
                setShowShapePicker(false);
                setShowColorPicker(!showColorPicker);
              }}
              isActive={showColorPicker && showBorderColorPicker == false}
            />
            <ToolButton onClick={handleBorderColorChange} isActive={showBorderColorPicker ? true : false}>
              <div
                className={`w-5 h-5 border-[3px] dark:border-slate-200 rounded-full ${
                  showBorderColorPicker ? "border-slate-200" : "border-slate-950"
                }`}
              ></div>
            </ToolButton>
            <div className="w-[1px] h-6 self-center bg-slate-200 dark:bg-slate-700"></div>
            <ToolButton
              icon={Ellipsis}
              onClick={handleToggleBorderType}
              isActive={currentLayer?.borderType === "DASHED"}
            />
            <ToolButton onClick={handleToggleBorderWidth} isActive={currentLayer?.borderWidth === 4 ? true : false}>
              <div
                className={`w-[20px] h-[5px] dark:bg-slate-200 ${
                  currentLayer?.borderWidth ? "bg-slate-200" : "bg-slate-950"
                }`}
              ></div>
            </ToolButton>
            <div className="w-[1px] h-6 self-center bg-slate-200 dark:bg-slate-700"></div>
            <ToolButton
              icon={CaseUpper}
              onClick={handleToggleTextTransform}
              isActive={currentLayer?.valueStyle?.textTransform === "uppercase"}
            />
            <ToolButton
              icon={Bold}
              onClick={handleToggleFontWeight}
              isActive={currentLayer?.valueStyle?.fontWeight === "900"}
            />
            <div className="w-[1px] h-6 self-center bg-slate-200 dark:bg-slate-700"></div>
            {/* <Button variant="board" size="icon" onClick={handleRemoveLayer}>
              <Trash2 />
            </Button> */}
            <ToolButton icon={Trash2} onClick={handleRemoveLayer} />
          </ul>
        </div>
      </foreignObject>
    );
  }
});

SelectionTools.displayName = "SelectionTools";
