import { Ellipsis, Minus, PaintBucket, Trash2 } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { Camera, Color, EdgeType } from "@/_types";
import { ToolButton } from "@/components/mindmap/toolButton";
import { Button } from "@/components/ui/button";
import {
  activeEdgeIdAtom,
  boardIdState,
  edgesAtomState,
  hoveredEdgeIdAtom,
  useRemoveEdge,
  useUpdateEdge,
} from "@/state";

import { ColorPicker } from "../colorPicker";

interface EdgeSelectionToolsProps {
  camera: Camera;
  // eslint-disable-next-line no-unused-vars
  setLastUsedColor: (color: Color) => void;
}

export const EdgeSelectionTools = memo(({ camera, setLastUsedColor }: EdgeSelectionToolsProps) => {
  const edges = useRecoilValue(edgesAtomState);
  const activeEdgeId = useRecoilValue(activeEdgeIdAtom);
  const setHoveredEdgeId = useSetRecoilState(hoveredEdgeIdAtom);

  const [showColorPicker, setShowColorPicker] = useState(false);

  const boardId = useRecoilValue(boardIdState);

  const removeEdge = useRemoveEdge({ roomId: boardId });
  const updateEdge = useUpdateEdge({ roomId: boardId });

  const selectedEdge = edges.find((edge) => edge.id === activeEdgeId);

  const handleColorChange = useCallback(
    (color: Color) => {
      setLastUsedColor(color);
      if (selectedEdge) {
        updateEdge(selectedEdge.id, { color });
        setShowColorPicker(false);
      }
    },
    [selectedEdge, setLastUsedColor, updateEdge],
  );

  const handleRemoveEdge = useCallback(() => {
    if (selectedEdge) {
      removeEdge(selectedEdge.id);
      setHoveredEdgeId(null);
    }
  }, [selectedEdge, removeEdge, setHoveredEdgeId]);

  const handleChangeStrokeWidth = useCallback(
    (number: number) => {
      if (selectedEdge) {
        updateEdge(selectedEdge.id, { thickness: number });
      }
    },
    [selectedEdge, updateEdge],
  );

  const handleChangeToDashedLine = useCallback(() => {
    if (selectedEdge) {
      updateEdge(selectedEdge.id, { type: EdgeType.Dashed });
    }
  }, [selectedEdge, updateEdge]);

  if (!selectedEdge) return null;

  const x = (selectedEdge.start.x + selectedEdge.end.x) / 2.5 + camera.x;
  const y = (selectedEdge.start.y + selectedEdge.end.y) / 2.5 + camera.y;

  return (
    <>
      {showColorPicker && (
        <div
          className="absolute bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800"
          style={{
            transform: `translate(${x - 50}px, ${y - 150}px)`,
          }}
        >
          <ColorPicker onChange={handleColorChange} onClose={() => setShowColorPicker(false)} />
        </div>
      )}
      <div
        className="absolute w-auto px-2 py-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800"
        style={{
          transform: `translate(${x}px, ${y}px)`,
        }}
      >
        <ul className="flex flex-row space-x-2 items-center justify-between">
          <ToolButton
            icon={PaintBucket}
            onClick={() => setShowColorPicker(!showColorPicker)}
            isActive={showColorPicker}
          />
          <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>
          <ToolButton icon={Minus} onClick={() => handleChangeStrokeWidth(2)} isActive={selectedEdge.thickness === 2} />
          <ToolButton
            icon={Ellipsis}
            onClick={handleChangeToDashedLine}
            isActive={selectedEdge.type === EdgeType.Dashed}
          />
          <Button
            variant={selectedEdge.thickness === 4 ? "boardActive" : "board"}
            size="icon"
            onClick={() => handleChangeStrokeWidth(4)}
          >
            <div
              className={`w-[20px] h-[5px] dark:bg-slate-200 ${
                selectedEdge.thickness === 4 ? "bg-slate-200" : "bg-slate-950"
              }`}
            ></div>
          </Button>
          <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>
          <Button variant="board" size="icon" onClick={handleRemoveEdge}>
            <Trash2 />
          </Button>
        </ul>
      </div>
    </>
  );
});

EdgeSelectionTools.displayName = "EdgeSelectionTools";
